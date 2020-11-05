const { clear, log, table } = console
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs')

// settings
const https_port = 443
const http_port = 80
process.env.NODE_ENV = 'production'

// networking
const axios = require('axios')
const io = require('socket.io-client')
const fs = require('fs')

// credentials
const privateKey  = fs.readFileSync('./config/sslcert/privatekey.pem', 'utf8')
const certificate = fs.readFileSync('./config/sslcert/origin.pem', 'utf8')
const credentials = {key: privateKey, cert: certificate}

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
    res.render('index', {  })
})
app.get('/', (req, res) => {
    res.render('index', {  })
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
    } else {
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