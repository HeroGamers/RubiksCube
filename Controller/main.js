const { clear, log, table } = console
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs')

// settings
const https_port = 443
const http_port = 80
process.env.NODE_ENV = 'production'

// networking
const axios = require('axios')
const io = require('socket.io-client')
const WebSocket = require('ws')
const fs = require('fs')

// credentials
const privateKey  = fs.readFileSync('./config/sslcert/privatekey.pem', 'utf8')
const certificate = fs.readFileSync('./config/sslcert/origin.pem', 'utf8')
const credentials = {key: privateKey, cert: certificate}

let actions
let settings
let connections

let cookies = []


checkSass()
checkConfig()


let socket_message = ""
let socket_response = ""
let wsioConf = getConnection('socket.io')
if (wsioConf) {
    log("Setting up socket.io")
    let socket = io(wsioConf["destination"])

    socket.on('connect', () => {
        log("socket.io Connected Successfully!")
        function socketio_loop () {
            setTimeout(function() {
                if (socket_message !== "") {
                    log("New message for socket.io, sending...")
                    let emit_split = socket_message.split("|")
                    socket_message = ""

                    if (emit_split.length === 2) {
                        log("Has split, gonna emit :)")
                        log(emit_split[0].trim(), emit_split[1].trim())
                        socket.emit(emit_split[0].trim(), emit_split[1].trim())
                    }
                    else {
                        log("No split in arr message")
                    }
                }
                socketio_loop()
            }, 10)
        }
        socketio_loop()
    })

    socket.on("clientMessage", (m)=>{
        log("clientMessage:", m)
        socket_response = "A message has been sent from the client: " + m
    })
    socket.on("cubeState", (CS)=>{
        log("cubeState:", CS)
        socket_response = "Current cube state: " + CS
    })
    socket.on("Done", (s)=>{
        log("Done solving: ", s)
        socket_response = "Done solving the cube, here are the moves: " + s
    })
}

let ws_message = ""
let ws_con = getConnection('websocket')
if (ws_con) {
    log("Setting up websocket...")
    const ws = new WebSocket(ws_con["destination"])

    ws.on('open', function open() {
        log("WebSocket Connected Successfully!")
        function ws_loop () {
            setTimeout(function() {
                if (ws_message !== "") {
                    log("New message for websocket, sending...")
                    let message = ws_message
                    log(message)
                    ws_message = ""
                    ws.send(JSON.stringify({ msg: message}))
                }
                ws_loop()
            }, 10)
        }
        ws_loop()
    })

    ws.on('message', function incoming(data) {
        log('From websocket:', data)
    })

    ws.onerror = function(error) {
        log("Error connecting to WebSocket")
        logError(error)
    }
}


// Opret forbindelser
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const http = require('http')
const https = require('https')
var forceSsl = require('express-force-ssl')

app.enable('trust proxy')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))
app.set('view engine', 'pug')

// Enforce HTTPS
app.use(forceSsl)

app.get('/:page', (req, res) => {
    // Hent actions
    //

    res.render('index', { buttons: actions })
})
app.get('/', (req, res) => {
    res.render('index', { buttons: actions })
})


app.post('/doAction', (req, res) => {
    // log(req.body)

    for (let act of actions) {
        if (act.title.toString().toLowerCase() === req.body.action.toString().toLowerCase()) {
            // Get message from action
            let act_msg = act['message']
            // log(act_msg)

            if (act_msg.includes("{") && act_msg.includes("}")) {
                // there is a variable in the act message that we need to fetch
                log("there is var")

                // We split the vars to get them
                let vars_split1 = act_msg.split("{")
                let vars = []
                let i = 0
                for (let var_nonsplit of vars_split1) {
                    if (i !== 0) {
                        vars.push(var_nonsplit.split("}")[0])
                    }
                    i++
                }
                // log(vars)

                // Time to check thar variable types
                for (let vari of vars) {
                    let type = vari.split(".")[0]
                    let find = vari.split(".")[1]
                    let value = undefined

                    // get value depending on type
                    switch (type) {
                        case "elementValueFromClass":
                            let documentElement = req.body.document.getElementsByClassName(find)
                            if (documentElement.length > 0) {
                                if (documentElement[0].value()) {
                                    log("using found value")
                                    value = documentElement[0].value()
                                }
                                else {
                                    log("using textcontent")
                                    value = documentElement[0].textContent
                                }
                            }
                            else {
                                log("No element found")
                            }
                            break
                        case "valueFromInput":
                            let input_fields = req.body.input_fields
                            value = input_fields[find].replace("\\", "")
                            // log(value)
                            break
                    }

                    // log("Before:")
                    // log("{"+vari+"}", value)
                    // log(act_msg)
                    // log(act_msg.replace("{valueFromInput.debugInput}", "fuck you man"))
                    // log(act_msg.replace("{"+vari+"}", value))
                    act_msg = act_msg.replace("{"+vari+"}", value)
                    // log("After:")
                    // log(act_msg)
                }
            }

            // Get connection
            const con = getConnection(act['connection-type'])
            // log(con)

            switch (con['type']) {
                case 'http post request':
                    log('sending request')

                    axios
                        .post('http://localhost/doAction', {
                            msg: act_msg
                        })
                        .then(res => {
                            res.send({ 'res': true })
                            return
                        })
                        .catch(error => {
                            

                            res.send({ 'res': false })
                            return
                        })
                    break
                case 'websocket':
                    log("Trying websocket")
                    ws_message = act_msg
                    break
                case 'socket.io':
                    log("Trying socket.io")
                    socket_message = act_msg
                    setTimeout(function() {
                        if (socket_response !== "") {
                            log("There is socket response...")
                            res.send({"res": true, "body": socket_response})
                            socket_response = ""
                        }
                    }, 500);
                    break
            }
            break
        }
    }
})


// Start server
// Http and https
https_server = https.createServer(credentials, app)
http_server = http.createServer(app)

http_server.listen(http_port, () => {
    log(`Controller Interface app listening at http://localhost:${http_port}`)
})
https_server.listen(https_port, () => {
    log(`Controller Interface app listening at https://localhost:${https_port}`)
})




function logError(error) {
    let index
    if (existsSync('./err-logs/index.txt')) {
        index = Number(readFileSync('./err-logs/index.txt'))
        writeFileSync('./err-logs/index.txt', index+1)
    } else {
        writeFileSync('./err-logs/index.txt', 0)
    }

    writeFileSync(`./err-logs/${index}`, error)
}



function getConnection(type) {
    for (let con of connections) {
        if (con['type'] == type)
            return con
    }

    return false
}



function checkConfig() {
    if (!existsSync('./err-logs'))
        mkdirSync('./err-logs')

    if (!existsSync('./config')) {
        mkdirSync('./config')

        writeFileSync('./config/settings.json', JSON.stringify([
            { 
                'site-password': '',
                'api-password': ''
            }
        ], null, 4))

        writeFileSync('./config/connections.json', JSON.stringify([
            {
                "title": "Example connection",
                "type": "websocket",
                "destination": "ws://nfs.codes"
            },
            {
                "title": "Example connection",
                "type": "socket.io",
                "destination": "https://nfs.codes"
            }
        ], null, 4))

        writeFileSync('./config/actions.json', JSON.stringify([
            {
                "title": "Scramble",
                "connection-type": "socket.io",
                "message": "Scramble | test"
            },
            {
                "title": "Solve",
                "connection-type": "socket.io",
                "message": "Solve | s"
            },
            {
                "title": "Validate Moves",
                "connection-type": "socket.io",
                "message": "move | {valueFromInput.debugInput}"
            },
            {
                "title": "Stop Robot",
                "connection-type": "socket.io",
                "message": "Stop | Stop"
            }
        ], null, 4))

    } else {
        actions = JSON.parse(readFileSync('./config/actions.json'))
        settings = JSON.parse(readFileSync('./config/settings.json'))
        connections = JSON.parse(readFileSync('./config/connections.json'))
    }
}




function checkSass() {
    if (!existsSync('./public/css')) {
        const { exec } = require('child_process')

        console.log('* Compiling sass to css')

        exec('sass ./src/sass:./public/css', (err) => {
            if (err) {
                if (!err.toString().includes('Undefined variable.')) {
                    console.log('* Failure compiling sass! - ' + err)
                }
                else {
                    console.log('* Done compiling sass')
                }
            }
            else {
                console.log('* Done compiling sass')
            }
        })
    }
}