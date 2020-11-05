const { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } = require('fs')

// disse indstillinger bør ikke ændres på...
// btw selve settings.json er meget streng! Ryk rundt på det mindste og den nulstiller automatisk
const defaultSettings = {
    https_port: 443,
    http_port: 80,
    useHttps: false,
    compileSassOnRun: false,
    clearOnRun: true,
    msgOnServerStart: false, // du kan eventuelt skrive beskeden her :)
}


let defaultSettingsLength = 0
let defaultSettingsKey = []
for (let key in defaultSettings) {
    defaultSettingsLength ++
    defaultSettingsKey.push(key)
}


const settingsPath = './config/settings.json'


// mapper, som skal eksisterer.
const folders = ['config']

for (let folder of folders) {
    if (!existsSync('./' + folder)) {
		mkdirSync('./' + folder)
    }
}



function loadSettings() {
	try {
        global.port = 8080 // bare som en default

        const settings = JSON.parse(readFileSync(settingsPath))

        let iterations = 0

        for (let key in settings) {
            if (defaultSettingsKey[iterations] != key) throw 'reset'
            global[key] = settings[key]

            iterations ++
        }

        if (iterations != defaultSettingsLength) throw 'reset'
    }
    catch (err) {

        if (err == 'reset') {
            console.log('settings.json blev nulstillet...')
            unlinkSync(settingsPath)
        }

        writeFileSync('./config/settings.json', JSON.stringify(defaultSettings, null, 2))

        loadSettings()
    }
}

loadSettings()
if (global.clearOnRun) console.clear()



if (global.compileSassOnRun || !existsSync('./public/css')) {
    const { exec } = require('child_process')

    console.log('* Compiling sass to css')

    exec('sass ./public/sass:./public/css', (err) => {
        if (err) {
            if (!err.toString().includes("Undefined variable.")) {
                console.log('* Failure compiling sass! - ' + err)
            }
            else {
                console.log('* Done compiling sass')
            }
        }
        else {
            console.log('* Done compiling sass')
            global.sassIsReady = true
        }
    })
} else {
    global.sassIsReady = true
}



global.randomStr = (length) => {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}


global.genCookie = (hours) => {
    let cookie = global.randomStr(256)
    let hashedCookie = global.hash(cookie)

    hours = hours || 1

    // cookieen udløber efter x timer
    let expireTime = hours*60*60*1000 + Date.now()

    let cookieToStore = {
        'cookie': hashedCookie,
        'expireTime': expireTime
    }

    return {
        realCookie: cookie,
        cookieToStore: cookieToStore
    }
}