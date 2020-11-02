const { clear, log, table } = console
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs')

// networking
const axios = require('axios')
const io = require('socket.io-client')
const WebSocket = require('ws')


let actions
let settings
let connections

let cookies = []

let websocket
let socketio


checkSass()
checkConfig()


let wsioConf = getConnection('socket.io', () => {
    const socket = io(wsioConf.destination)

    socket.on('connect', () => {
        // either with send()
        socket.send('Hello!')

        socketio.send = (message) => {
            socket.send(JSON.stringify( { msg: message } ))
        }

        // or with emit() and custom event names
        socket.emit('salutations', 'Hello!', { 'mr': 'john' }, Uint8Array.from([1, 2, 3, 4]))
    })

    // handle the event sent with socket.send()
    socket.on('message', data => {
        console.log(data)
    })

    // handle the event sent with socket.emit()
    socket.on('greetings', (elem1, elem2, elem3) => {
        console.log(elem1, elem2, elem3)
    })
})


let wsConf = getConnection('websocket', () => {
    const ws = new WebSocket(wsConf.destination)

    ws.on('open', function open() {
        websocket.send = (message) => {
            ws.send(JSON.stringify({ msg: message}))
        }
    })

    ws.on('message', function incoming(data) {
        console.log('from websocket:', data)
    })
})


// Opret forbindelser



const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/:page', (req, res) => {
    // Hent actions
    // 
    
    res.render('index', { buttons: actions })
})
app.get('/', (req, res) => {
    res.render('index', { buttons: actions })
})


app.post('/doAction', (req, res) => {
    log(req.body)

    for (let act of actions) {
        if (act.title == req.body.action) {
            const con = getConnection(act['connection-type'])

            switch (con['type']) {
                case 'http post request':
                    log('sending request')

                    
                    axios
                        .post('http://localhost:3000/doAction', {
                            msg: act.message
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
                    try {
                        websocket.send(act.message)
                    } catch (err) {
                        logError(err)
                        res.send({ 'res': false })
                        return
                    }
                    res.send({ 'res': true })
                    break
                case 'socket.io':

                    
            }
        }
    }
})

app.listen(port, () => {
    console.log(`controller interface app listening at http://localhost:${port}`)
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
                'title': 'Example connection',
                'type': 'http post request || websocket || socket.io',
                'destination': 'http://127.0.0.1 || ws://'
            }
        ], null, 4))

        writeFileSync('./config/actions.json', JSON.stringify([
            { 
                'title': 'Example action button',
                'connection-type': 'http post request || websocket || socket.io',
                'message': ''
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