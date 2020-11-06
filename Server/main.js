const Cube = require('cubejs');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const cube = new Cube();
const WebSocket = require('ws');
const wss = new WebSocket.Server({
	port: 8080
});

//cube.move("R2 U' R2 D' B2 U2 R2 U' F2 U2 R2 U2 F' U L D2 U L D B L' U2")
//cube.move("F' R B")
cube.randomize()

var solution = ""

var results = [];

// Cube.initSolver()
// //cube.move("R F' B U")

// //var test = Cube.fromString("UUUUUURRURRRFFFFFFDDDDDDLLLLLLBBBBBB")
// //console.log(test.asString())


// var solution = cube.solve()
// console.log(solution)
// console.log("used scramble:", Cube.inverse(solution))

function Solve() {
	console.time("SolveCalcTime")
	EdgeSwap()
}

function Scramble() {
	solution = ""
	cube.randomize()
	io.emit("cubeState", cube.asString())
}

var SetupMoves = {
	Edge: {
		0: {
			0: "D2 R2 D2",
			1: "D R' F D'"
		},
		1: {
			0: "D F2 D'",
			1: "F' L"
		},
		2: {
			0: "L2",
			1: "D L F' D'"
		},
		3: {
			0: "D' B2 D",
			1: "B L'"
		},
		4: {
			0: "der er gået noget galt",
			1: "der er gået noget galt"
		},
		5: {
			0: "F D F' D'",
			1: "F L"
		},
		6: {
			0: "",
			1: "L' D F' D'"
		},
		7: {
			0: "B' D' B D",
			1: "B' L'"
		},
		8: {
			0: "D2 R' D2",
			1: "D F D'"
		},
		9: {
			0: "L",
			1: "D F' D'"
		},
		10: {
			0: "L'",
			1: "D' B D"
		},
		11: {
			0: "D2 R D2",
			1: "D' B' D"
		}
	},
	Corner: {
		0: {
			0: "R B' R'",
			1: "R",
			2: "R2 B"
		},
		1: {
			0: "D2 L D2 R'",
			1: "L' B' L",
			2: "F R F'"
		},
		2: {
			0: "B' R B",
			1: "B2 R'",
			2: "B'"
		},
		3: {
			0: "", //skal være tom
			1: "R B", //flip
			2: "B' R'" //flip
		},
		4: {
			0: "R2",
			1: "R' B",
			2: "D B D'"
		},
		5: {
			0: "findes ikke",
			1: "findes ikke",
			2: "findes ikke"
		},
		6: {
			0: "B2",
			1: "D' R' D",
			2: "B R'"
		},
		7: {
			0: "D' R2 D",
			1: "R'",
			2: "B"
		},

	}
};

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	io.emit("cubeState", cube.asString())
	socket.on("move", (m) => {
		cube.move(m)
		io.emit("cubeState", cube.asString())
	});
	socket.on("Solve", (a) => {
		Solve()
	})
	socket.on("Scramble", () => {
		Scramble()
	})
	socket.on("Stop", () => {
		send("Stop", "Stop")
	})
	socket.on("cubeAsString", (cubeAsString)=>{
		cube = Cube.fromString(cubeAsString)
		io.emit("cubeState", cube.asString())
	})
});

wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		ws.send(message);
		io.emit("clientMessage", message)
	});

});

function send(messagecode, message) {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			// var = wssolution={};
			// wssolution[messagecode]=message;
			// client.send(wssolution)
			client.send(JSON.stringify({"messagecode": messagecode, "data": message}))
		}
	});
}

http.listen(80, () => {});

function UnSolvedPiece() {
	var Broken = [];
	for (var i = 0; i < cube.toJSON().ep.length; i++) {
		if (i != 4) {
			if (cube.toJSON().eo[i] != 0 && cube.toJSON().ep[i] == i) {
				Broken.push(i)
			} else if (i != cube.toJSON().ep[i]) {
				Broken.push(i)
			}
		}
	}
	if (Broken.length == 0) {
		return null
	} else {
		return Broken[0]
	}
}

function UnSolvedCornerPiece() {
	var Broken = [];
	for (var i = 0; i < cube.toJSON().cp.length; i++) {
		if (i != 5) {
			if (cube.toJSON().co[i] != 0 && cube.toJSON().cp[i] == i) {
				Broken.push(i)
			} else if (i != cube.toJSON().cp[i]) {
				Broken.push(i)
			}
		}
	}
	if (Broken.length == 0) {
		return null
	} else {
		return Broken[0]
	}
}

function EdgeSwap() {
	var alg = " R D R' D' R' B R2 D' R' D' R D R' B' ";
	var SetupMove = SetupMoves.Edge[cube.toJSON().ep[4]][cube.toJSON().eo[4]]
	if (cube.toJSON().ep[4] == 4) {
		var Piece = UnSolvedPiece()
		if (Piece != null) {
			SetupMove = SetupMoves.Edge[cube.toJSON().ep[Piece]][cube.toJSON().eo[Piece]]
			cube.move(SetupMove + alg + Cube.inverse(SetupMove))
			solution = solution + SetupMove + alg + Cube.inverse(SetupMove) + " "
			EdgeSwap()
		} else {
			CornerSwap()
		}
	} else {
		cube.move(SetupMove + alg + Cube.inverse(SetupMove))
		solution = solution + SetupMove + alg + Cube.inverse(SetupMove) + " "
		EdgeSwap()
	}
}

function CornerSwap() {
	var alg = " R D' R' D' R D R' B' R D R' D' R' B R ";
	var oriantion = {
		0: 2,
		1: 0,
		2: 1,
	}
	var SetupMove = SetupMoves.Corner[cube.toJSON().cp[5]][oriantion[cube.toJSON().co[5]]]
	if (cube.toJSON().cp[5] == 5) {
		var Piece = UnSolvedCornerPiece()
		if (Piece != null) {
			SetupMove = SetupMoves.Corner[cube.toJSON().cp[Piece]][oriantion[cube.toJSON().co[Piece]]]
			cube.move(SetupMove + alg + Cube.inverse(SetupMove))
			solution = solution + SetupMove + alg + Cube.inverse(SetupMove) + " "
			CornerSwap()
		} else {
			solution = solution.replace(/  /g, " ")
			solution = solution.slice(0, solution.length - 1)
			cube.move(Cube.inverse(solution))
			io.emit("cubeState", cube.asString())
			io.emit("Done", solution)
			send("SolveMoves",solution)
			console.log(solution)
			console.timeEnd("SolveCalcTime")
			console.log(solution.split(" ").length)

			// results.push(solution.split(" ").length)
			// var sum = 0
			// for (var i = 0; i < results.length; i++) {
			// 	sum=sum+results[i]
			// }
			// console.log(sum/results.length-1, results.length)
			// setTimeout(function() {
			// 	Scramble()
			// 	Solve()
			// }, 1);
		}
	} else {
		cube.move(SetupMove + alg + Cube.inverse(SetupMove))
		solution = solution + SetupMove + alg + Cube.inverse(SetupMove) + " "
		CornerSwap()
	}
}

//io.emit("cubeState", cube.asString())