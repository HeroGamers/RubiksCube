var socket = io("https://nfs.codes")

socket.on("cubeState", (CS)=>{
    console.log("cubeState:", CS)
    localStorage.cubeState = CS
})
socket.on("clientMessage", (m)=>{
    console.log("clientMessage:", m)
    localStorage.clientMessage = m
})
socket.on("Done", (s)=>{
    console.log("Done solving: ", s)
    localStorage.solveMoves = s
})