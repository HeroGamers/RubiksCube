let step = localStorage.currentStep
if (step === undefined) {
    localStorage.currentStep = 0
}

let stepTitles = document.getElementsByClassName("step")[0].childNodes[0].childNodes
let controllerContentContainer = document.getElementsByClassName("controllercontent")[0]
let controllerButtonsContainer = document.getElementsByClassName("buttons")[0].childNodes[0]
let textInformation = document.getElementsByClassName("text-information")[0].childNodes[0]

function checkStep() {
    console.log("Checking step")
    step = localStorage.currentStep

    // Remove all buttons, if there are any
    while (controllerButtonsContainer.hasChildNodes()) {
        controllerButtonsContainer.removeChild(controllerButtonsContainer.firstChild);
    }
    // Remove all current text
    stepTitles[0].textContent = ""
    stepTitles[1].textContent = ""
    textInformation.textContent = ""
    // Remove all content from controllercontent, if there is any
    while (controllerContentContainer.hasChildNodes()) {
        controllerContentContainer.removeChild(controllerContentContainer.firstChild);
    }

    console.log(step)

    switch (step) {
        case "0":
            console.log("Step 0")

            stepTitles[0].textContent = "Welcome to the controller!"

            let cubeDiv = document.createElement("div")
            cubeDiv.className = "col-md-12 d-flex justify-content-center"
            controllerContentContainer.appendChild(cubeDiv)
            cubeDiv.appendChild(renderer.domElement)
            render()
            onWindowResize()

            let startButton = undefined
            createButton("Let's get started!", "localStorage.currentStep = 1; checkStep()",(button)=>{
                console.log(button)
                startButton = button
            })

            controllerButtonsContainer.appendChild(startButton)

            break
        case "1":
            console.log("Step 1")

            stepTitles[0].textContent = "Step 1"
            stepTitles[1].textContent = "-Time to scan the cube-"

            let scanButton = undefined
            createButton("Open my camera", "controllerButtonsContainer.removeChild(controllerButtonsContainer.firstChild); doCamera()",(button)=>{
                console.log(button)
                scanButton = button
            })

            controllerButtonsContainer.appendChild(scanButton)

            break
        case "2":
            console.log("Step 2")
            let cubeState = localStorage.cubeState

            stepTitles[0].textContent = "Step 2"
            if (cubeState === "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB") {
                stepTitles[1].textContent = "-Cube Solved-"
                textInformation.textContent = "Your cube is currently solved! Click the button to go back to Step 1 and scan again."

                let backButton = undefined
                createButton("Back to Step 1", "localStorage.currentStep = 1; checkStep()",(button)=>{
                    console.log(button)
                    backButton = button
                })

                controllerButtonsContainer.appendChild(backButton)
            }
            else if ((cubeState.match(/U/g)||[]).length !== 9 || (cubeState.match(/R/g)||[]).length !== 9 || (cubeState.match(/F/g)||[]).length !== 9 || (cubeState.match(/D/g)||[]).length !== 9 || (cubeState.match(/L/g)||[]).length !== 9 || (cubeState.match(/B/g)||[]).length !== 9) {
                console.log("Cube state is not valid")
                stepTitles[1].textContent = "-Cube State Invalid-"
                textInformation.textContent = "Your currently scanned cube doesn't seem to be possible, please redo the scan. Make sure to align your cube with the color outlines during the scan to ensure a good scan."

                let backButton = undefined
                createButton("Back to Step 1", "localStorage.currentStep = 1; checkStep()",(button)=>{
                    console.log(button)
                    backButton = button
                })

                controllerButtonsContainer.appendChild(backButton)
            }
            else {
                stepTitles[1].textContent = "-That seems quite difficult to solve.. Want to see the robot do it though?-"

                let solveButton = undefined
                createButton("Solve the Rubik's Cube", "solve(); localStorage.currentStep = 3; checkStep()",(button)=>{
                    console.log(button)
                    solveButton = button
                })

                controllerButtonsContainer.appendChild(solveButton)
            }
            break
        case "3":
            console.log("Step 3")
            let solveMoves = localStorage.solveMoves
            let clientMessage = localStorage.clientMessage

            stepTitles[0].textContent = "Step 3"

            if (clientMessage && clientMessage.toString().includes("robot is done running")) {
                stepTitles[1].textContent = "-Done Solving-"

                let newRunButton = undefined
                createButton("Start over?", 'localStorage.currentStep = 0; checkStep()',(button)=>{
                    console.log(button)
                    newRunButton = button
                })

                controllerButtonsContainer.appendChild(newRunButton)
            }
            else if (clientMessage && clientMessage.toString().includes("robot is running")) {
                stepTitles[1].textContent = "-Solving-"

                let loaderCol = document.createElement("div")
                loaderCol.className = "col-md-12 d-flex justify-content-center"
                controllerContentContainer.appendChild(loaderCol)

                let loader = document.createElement("div")
                loader.className = "loader loader-spin2"
                loaderCol.appendChild(loader)

                let stopButton = undefined
                createButton("Stop Robot", 'socket.emit("Stop", "Stop"); controllerButtonsContainer.removeChild(controllerButtonsContainer.firstChild); controllerContentContainer.removeChild(controllerContentContainer.firstChild); stepTitles[1].textContent = "-Stopped the robot-"; createButton("Go back to the beginning", "localStorage.currentStep = 0; checkStep()",(button)=>{ controllerButtonsContainer.appendChild(button) }, "btn-warning")',(button)=>{
                    console.log(button)
                    stopButton = button
                }, "btn-danger")

                controllerButtonsContainer.appendChild(stopButton)
            }
            else if (clientMessage && clientMessage.toString().includes("do moves while running")) {
                stepTitles[1].textContent = "-ERROR: Cannot solve while already running-"

                let backButton = undefined
                createButton("Go back to the beginning", 'localStorage.currentStep = 0; checkStep()',(button)=>{
                    console.log(button)
                    backButton = button
                }, "btn-danger")

                controllerButtonsContainer.appendChild(backButton)
            }
            else {
                stepTitles[1].textContent = "-Waiting for a response from the robot-"

                let loaderCol = document.createElement("div")
                loaderCol.className = "col-md-12 d-flex justify-content-center"
                controllerContentContainer.appendChild(loaderCol)

                let loader = document.createElement("div")
                loader.className = "loader"
                loaderCol.appendChild(loader)

                let backButton = undefined
                createButton("Go back to the beginning", 'localStorage.currentStep = 0; checkStep()',(button)=>{
                    console.log(button)
                    backButton = button
                }, "btn-warning")

                controllerButtonsContainer.appendChild(backButton)
            }

            let movesButton = undefined
            createButton("View the moves the robot will be performing", 'textInformation.textContent = "The ' + solveMoves.split(" ").length.toString() + ' moves the robot will be doing are: '+solveMoves+'"',(button)=>{
                console.log(button)
                movesButton = button
            })

            controllerButtonsContainer.appendChild(movesButton)


            function checkMessage() {
                setTimeout(function(){
                    if (localStorage.currentStep !== "3") {
                        console.log("whoops we're not at step 3 anymore, stop checking client messages")
                    }
                    else if (clientMessage !== localStorage.clientMessage) {
                        console.log("There is a new client message!")
                        checkStep()
                    }
                    else {
                        console.log("No new client message...")
                        checkMessage()
                    }

                }, 500)
            }
            if (clientMessage && clientMessage.toString().includes("robot is done running")) {
                console.log("Done running, no need to check for new clientmessage")
            }
            else {
                checkMessage()
            }
    }
}

checkStep()


let nextCamButton = undefined
function doCamera() {
    stepTitles[1].textContent = "-Scanning the cube-"
    // Create div for camera
    let camCol = document.createElement("div")
    camCol.className = "col-md-12 d-flex justify-content-center"
    controllerContentContainer.appendChild(camCol)

    // Create element for placing camera
    let camElement = document.createElement("div")
    camElement.className = "camera"
    camCol.appendChild(camElement)

    startCam(camElement)

    function checkScanState() {
        setTimeout(function(){
            if (doneScanning === true) {
                console.log("Ayeee, we're done scanning")
                stepTitles[1].textContent = "-Done scanning the cube-"
                textInformation.textContent = ""

                camElement.remove()
                if (nextCamButton) {
                    nextCamButton.remove()
                }

                let nextStepButton = undefined
                createButton("Next Step", 'localStorage.currentStep = 2; checkStep()',(button)=>{
                    console.log(button)
                    nextStepButton = button
                })

                controllerButtonsContainer.appendChild(nextStepButton)
            }
            else {
                if (editMode) {
                    if (nextCamButton === undefined) {
                        textInformation.textContent = "You can click the colors to change them if they're wrong."
                        createButton("Next Cube Face", 'controllerButtonsContainer.removeChild(controllerButtonsContainer.firstChild); nextCamButton = undefined; next()',(button)=>{
                            console.log(button)
                            nextCamButton = button
                        })

                        controllerButtonsContainer.appendChild(nextCamButton)
                    }
                }
                else {
                    textInformation.textContent = ""
                }
                checkScanState()
            }

        }, 500)
    }
    checkScanState()
}


function createButton(text, action, cb, secondClassName="btn-primary") {
    let button = document.createElement("button")
    button.textContent = text
    button.className = "btn " + secondClassName + " m-2"
    button.onclick = function(){eval(action)}
    cb(button)
}

function solve() {
    localStorage.clientMessage = ""
    socket.emit("Solve", "s")
}