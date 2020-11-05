let debug = localStorage.debug

let switcher = document.getElementsByClassName("modeSwitch")[0]
switcher.onclick = function() { (debug === "true") ? setDebug("false") : setDebug("true"); location.reload() }

if (debug) {
    if (debug === "true") {
        console.log("Debug mode enabled")
        switcher.textContent = "Normal Mode"

        // The controller
        let controllerDiv = document.getElementsByClassName("debug")[0]
        controllerDiv.className = controllerDiv.className + " m-5 pb-5"

        let row1 = document.createElement("div")
        row1.className = "row"

        let row2 = document.createElement("div")
        row2.className = "row"
        let col1 = document.createElement("div")
        col1.className = "col-md-12"
        row2.appendChild(col1)

        let row3 = document.createElement("div")
        row3.className = "row"
        let col2 = document.createElement("div")
        col2.className = "col-md-12"
        row3.appendChild(col2)

        controllerDiv.appendChild(row1)
        controllerDiv.appendChild(row2)
        controllerDiv.appendChild(row3)

        // ---------The debug elements---------
        // Title
        let title = document.createElement("h2")
        title.className = "p-1 noselect"
        title.textContent = "Debug Elements"
        row1.appendChild(title)

        // CubeStateInfo
        let cubeStateInfoField = document.createElement("paragraph")
        cubeStateInfoField.className = "noselect"
        cubeStateInfoField.style.cssText = "display: none"

        // InputManual
        let manualInputField = document.createElement("input")
        manualInputField.className = "debugInput m-2"

        // Start Manual
        let manualStart = document.createElement("button")
        manualStart.className = "btn btn-primary manualStart m-2"
        manualStart.type = "button"
        manualStart.textContent = "Apply Moves from Input Field"
        // let sendValue =
        manualStart.onclick = function(){SendMove(document.getElementsByClassName("debugInput")[0].value)}

        // Scramble
        let scrambleButton = document.createElement("button")
        scrambleButton.className = "btn btn-primary scrambleButton m-2"
        scrambleButton.type = "button"
        scrambleButton.textContent = "Scramble"
        scrambleButton.onclick = function(){Scramble()}

        // Solve button
        let solveButton = document.createElement("button")
        solveButton.className = "btn btn-primary solveButton m-2"
        solveButton.type = "button"
        solveButton.textContent = "Solve"
        solveButton.onclick = function(){Solve()}

        // Stop button
        let stopButton = document.createElement("button")
        stopButton.className = "btn btn-danger stopButton m-2"
        stopButton.type = "button"
        stopButton.textContent = "Stop Robot"
        stopButton.onclick = function(){Stop()}

        // Step buttons
        const steps = [0, 1, 2, 3]
        for (let step of steps) {
            let button = document.createElement("button")
            button.className = "btn btn-warning stepButton m-2"
            button.type = "button"
            button.textContent = "Step " + step.toString()
            button.onclick = function(){localStorage.currentStep = step; checkStep()}

            col1.appendChild(button)
        }


        // Oldcube
        let oldCubeCanvas = document.createElement("canvas")
        oldCubeCanvas.className = "oldCubeCanvas mt-1"

        row1.appendChild(cubeStateInfoField)
        col1.appendChild(manualInputField)
        col1.appendChild(manualStart)
        col1.appendChild(scrambleButton)
        col1.appendChild(solveButton)
        col1.appendChild(stopButton)
        col2.appendChild(oldCubeCanvas)

        // Import of old index - sendmoves function
        var ValidMoves = ["U", "U2", "U'", "F", "F2", "F'", "L", "L2", "L'", "D", "D2", "D'", "B", "B2", "B'", "R", "R2", "R'"];
        function SendMove(m) {
            if(m.includes(" ")){
                var ValidMove = "true"
                for (var i = 0; i < m.split(" ").length; i++) {
                    if(!ValidMoves.includes(m.split(" ")[i].toLocaleUpperCase()))
                        ValidMove = false;
                }
                // console.log(m)
                if(ValidMove)
                    socket.emit("move", m.toLocaleUpperCase())
            }else{
                if(ValidMoves.includes(m.toLocaleUpperCase()))
                    socket.emit("move", m.toLocaleUpperCase())
            }
        }

        // Socket listeners
        socket.on("clientMessage", (m)=>{
            console.log("clientMessage:", m)
        })
        socket.on("cubeState", (CS)=>{
            console.log("cubeState:", CS)
            if (CS === "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB") {
                cubeStateInfoField.style.cssText = ""
                cubeStateInfoField.textContent = "The Rubik's Cube is currently solved. Please scramble it, and let the server know."
            }
            else {
                cubeStateInfoField.style.cssText = "display: none"
            }
        })
        socket.on("Done", (s)=>{
            console.log("Done: ", s)
            manualInputField.value = s
        })

        // Socket functions
        function Solve()	{
            socket.emit("Solve", "s")
        }
        function Stop()	{
            socket.emit("Stop", "Stop")
        }
        function Scramble() {
            socket.emit("Scramble", "test")
        }
    }
    else {
        switcher.textContent = "Debug Mode"
        setDebug("false")
    }
}
else {
    switcher.textContent = "Debug Mode"
    setDebug("false")
}

function setDebug(boolean) {
    localStorage.debug = boolean
}