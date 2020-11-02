const { clear, log, table } = console
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs')
const axios = require('axios')
clear()


let actions
let settings
let connections

let cookies = []

checkSass()
checkConfig()



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
                            todo: 'Buy the milk'
                        })
                        .then(res => {
                            res.send({ 'res': true })
                        })
                        .catch(error => {
                            

                            res.send({ 'res': false })
                        })
                    break
                case 'socket.io':
                    
            }
        }
    }

    res.send({ 'res': true })
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
                'destination': '127.0.0.1'
            }
        ], null, 4))

        writeFileSync('./config/actions.json', JSON.stringify([
            { 
                'title': 'Example action button',
                'connection-type': 'http post request || websocket || socket.io',
                'message': '',
                'message-type': 'plaintext || json'
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