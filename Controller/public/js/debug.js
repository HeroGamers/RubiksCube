let debug = (window.location.pathname === "/debug")

let switcher = document.getElementsByClassName("modeSwitch")[0]

if (debug) {
    switcher.href = "/"
    switcher.textContent = "Normal Mode"

    // Import of old index
    var ValidMoves = ["U", "U2", "U'", "F", "F2", "F'", "L", "L2", "L'", "D", "D2", "D'", "B", "B2", "B'", "R", "R2", "R'"];
    function SendMove(m) {
        if(m.includes(" ")){
            var ValidMove = true
            for (var i = 0; i < m.split(" ").length; i++) {
                if(!ValidMoves.includes(m.split(" ")[i].toLocaleUpperCase()))
                    ValidMove = false;
            }
            console.log(m)
            if(ValidMove)
                socket.emit("move", m.toLocaleUpperCase())
        }else{
            if(ValidMoves.includes(m.toLocaleUpperCase()))
                socket.emit("move", m.toLocaleUpperCase())
        }
    }

    // The controller
    let controllerDiv = document.getElementsByClassName("debug")[0]
    controllerDiv.className = controllerDiv.className + " m-5"

    // The debug elements
    let manualInputField = document.createElement("input")
    manualInputField.className = "debugInput"

    let manualStart = document.createElement("button")
    manualStart.className = "btn btn-primary manualStart ml-3"
    manualStart.type = "button"
    manualStart.textContent = "Debug Run from Input"
    manualStart.onclick = function(){SendMove(document.getElementByClassName("debugInput").value)}

    controllerDiv.appendChild(manualInputField)
    controllerDiv.appendChild(manualStart)

}
else {
    switcher.href = "debug"
    switcher.textContent = "Debug Mode"
}