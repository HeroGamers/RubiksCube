const memLength = 20;
let tolerance = 50;

let doneScanning;

var scannerCanvas;
var scannerContext;
var video;
var gridWidth; //tykkelsen på stregerne
var squareSize; // deler canvas op i 3 lige store minus de 4 streger der er i gridet

var videoTrack

var editMode = false

var scanningSide = 0

var cubeAsString = "";

var autoScanMem = [];
var currentFaceColors = [];

var mousePosOnCanvas = {
	x: 0,
	y: 0
}

//maybe change
const allEqual = arr => arr.every(v => v === arr[0])

function arrayAverage(pixelArray) {
	//accumulatoren er et variable man kan ændre på hver gang som den tager med videre til næste "tur"
	//currentArrayValue den nuværende værdi i arrayet

	//et "loop" der pludser den nuværende værdi i array'et til accumulatoren og til sidst dividere med længden af array'et
	return pixelArray.reduce((accumulator, currentArrayValue) => accumulator + currentArrayValue) / pixelArray.length;
}

function send(data, c, place) {
	var http = new XMLHttpRequest();
	http.open('POST', place, true);
	http.onreadystatechange = function() {
		if (http.readyState == 4 && http.status == 200) {
			c(http.responseText)
		}
	}
	http.send(JSON.stringify(data));
}

var cubeSquares;

//faver for de forskellige sidder SKAL LAVES OM TIL RGB -MÅSKE OGSÅ ALPHA 
var face = ["white", "red", "green", "yellow", "orange", "blue"];
//eller det er måske ikke nødvendigt hvis vi matcher med farvne nedenunder
var matchColors = {
	green: {
		r: 0,
		g: 128,
		b: 0,
		a: 255
	},
	red: {
		r: 255,
		g: 0,
		b: 0,
		a: 255
	},
	blue: {
		r: 0,
		g: 0,
		b: 255,
		a: 255
	},
	orange: {
		r: 255,
		g: 165,
		b: 0,
		a: 255
	},
	white: {
		r: 255,
		g: 255,
		b: 255,
		a: 255
	},
	yellow: {
		r: 255,
		g: 255,
		b: 0,
		a: 255
	}
}

send("", (res) => {
	matchColors = JSON.parse(res)
}, "colors")

//variabler til kameraet
var camMode = {
	audio: false, //slår lyden fra på "videoen"
	video: {
		facingMode: {
			exact: "environment" //vælger kameraet bag på mobilen
		}
	}
};

function stopCam() {
	video.srcObject = null
	videoTrack.stop()
}

//funktion som gemmer et billede af video streamen på canvas'et
function snap() {
	if (video.srcObject) {
		//tegner først videoen
		scannerContext.drawImage(video, 0, 0);
		//og derefter grid'et
		drawCubeGrid(face[scanningSide])
		scan()
	}
}

function startCam(element=null) {
	doneScanning = false
	video = document.createElement("video")
	video.setAttribute("autoplay", "")
	video.setAttribute("playsinline", "")
	video.style.position = "absolute";
	video.style.opacity = "100";
	video.style.height = "1px";
	video.style.width = "1px";

	scannerCanvas = document.createElement("canvas")
	scannerCanvas.setAttribute("height", "300px");
	scannerCanvas.setAttribute("width", "300px");
	// scannerCanvas.style.border = "2px solid red";

	if (element === null) {
		let overlay = document.createElement("div");
		overlay.id = "overlay"
		overlay.style.position = "fixed";
		overlay.style.width = "100%";
		overlay.style.height = "100%";
		overlay.style.top = "0";
		overlay.style.left = "0";
		overlay.style.right = "0";
		overlay.style.bottom = "0";
		overlay.style.backgroundColor = "rgba(0,0,0,0.5)";

		overlay.appendChild(video)
		overlay.appendChild(scannerCanvas)

		document.body.appendChild(overlay)
	}
	else {
		element.appendChild(video)
		element.appendChild(scannerCanvas)
	}

	scannerContext = scannerCanvas.getContext('2d');
	gridWidth = Math.round(scannerCanvas.width / 50) //tykkelsen på stregerne
	squareSize = Math.round((scannerCanvas.width - (4 * gridWidth)) / 3) // deler canvas op i 3 lige store minus de 4 streger der er i gridet

	cubeSquares = [{
		startPosX: gridWidth,
		startPosY: gridWidth,
	}, {
		startPosX: gridWidth * 2 + squareSize,
		startPosY: gridWidth,
	}, {
		startPosX: gridWidth * 3 + squareSize * 2,
		startPosY: gridWidth,
	}, {
		startPosX: gridWidth,
		startPosY: gridWidth * 2 + squareSize,
	}, {
		startPosX: gridWidth * 2 + squareSize,
		startPosY: gridWidth * 2 + squareSize,
	}, {
		startPosX: gridWidth * 3 + squareSize * 2,
		startPosY: gridWidth * 2 + squareSize,
	}, {
		startPosX: gridWidth,
		startPosY: gridWidth * 3 + squareSize * 2,
	}, {
		startPosX: gridWidth * 2 + squareSize,
		startPosY: gridWidth * 3 + squareSize * 2,
	}, {
		startPosX: gridWidth * 3 + squareSize * 2,
		startPosY: gridWidth * 3 + squareSize * 2,
	}, ];

	scannerCanvas.onclick = (e) => {
		mousePosOnCanvas = {
			x: e.offsetX,
			y: e.offsetY
		}
		if (editMode)
			cubeEditor()
	}
	setInterval(snap, 10);
	startCamStream()
}

function scan() {
	var scanData = []
	for (var i = 0; i < 9; i++) {
		scanData.push(scanner(i))
	}
	//making test colors
	// send({
	// 	realColor: document.querySelector("input").value,
	// 	scannedColor: scanData[0].rgba,
	// }, (res) => {
	// 	//console.log(res)
	// }, "color")

	if (autoScanMem.length == memLength) {
		autoScan()
		autoScanMem.shift()
	}
	if (autoScanMem.length <= memLength) {
		autoScanMem.push(scanData)
	}

	scanDataPretty = []
	scanData.forEach((color) => {
		scanDataPretty.push(color.colorName)
	})
	currentFaceColors = scanDataPretty
}

function autoScan() {
	var colorCheck = [{
		color: [],
		averageBestScore: []
	}, {
		color: [],
		averageBestScore: []
	}, {
		color: [],
		averageBestScore: []
	}, {
		color: [],
		averageBestScore: []
	}, {
		color: [],
		averageBestScore: []
	}, {
		color: [],
		averageBestScore: []
	}, {
		color: [],
		averageBestScore: []
	}, {
		color: [],
		averageBestScore: []
	}, {
		color: [],
		averageBestScore: []
	}, ];
	autoScanMem.forEach((arr) => {
		for (var i = 0; i < arr.length; i++) {
			colorCheck[i].color.push(arr[i].colorName)
			colorCheck[i].averageBestScore.push(Math.min(...Object.values(arr[i].scores)))
		}
	})
	var checker = []
	for (var i = 0; i < colorCheck.length; i++) {
		if (i != 4) {
			if (!allEqual(colorCheck[i].color)) {
				checker.push(0)
			} else {
				checker.push(1)
			}
			if (arrayAverage(colorCheck[i].averageBestScore) > tolerance) {
				checker.push(0)
			} else {
				checker.push(1)
			}
		}
	}
	if (!checker.includes(0)) {
		stopCam()
		for (var i = 0; i < currentFaceColors.length; i++) {
			if (i != 4) {
				scannerContext.fillStyle = currentFaceColors[i]
				scannerContext.fillRect(cubeSquares[i].startPosX, cubeSquares[i].startPosY, squareSize, squareSize)
			}
		}
		autoScanMem = []
		editMode = true
	}
}

function cubeEditor() {
	for (var i = 0; i < 9; i++) {
		if (mousePosOnscannerCanvas.x >= cubeSquares[i].startPosX && mousePosOnscannerCanvas.x <= cubeSquares[i].startPosX + squareSize) {
			if (mousePosOnscannerCanvas.y >= cubeSquares[i].startPosY && mousePosOnscannerCanvas.y <= cubeSquares[i].startPosY + squareSize) {
				if (i != 4) {
					var nextColor;
					if (face.indexOf(currentFaceColors[i]) == 5) {
						nextColor = face[0];
					} else {
						nextColor = face[face.indexOf(currentFaceColors[i]) + 1]
					}
					currentFaceColors[i] = nextColor
					scannerContext.fillStyle = nextColor
					scannerContext.fillRect(cubeSquares[i].startPosX, cubeSquares[i].startPosY, squareSize, squareSize)
				}
			}
		}
	}
}

function next() {
	editMode = false
	var translator = {
		white: "U",
		red: "R",
		green: "F",
		yellow: "D",
		orange: "L",
		blue: "B",
	}
	for (var i = 0; i < currentFaceColors.length; i++) {
		if (i != 4) {
			cubeAsString += translator[currentFaceColors[i]]
		} else {
			cubeAsString += translator[face[scanningSide]]
		}
	}

	if (scanningSide != 5) {
		scanningSide++
		startCamStream()
	} else {
		console.log("Done scanning")
		console.log(cubeAsString)
		doneScanning = true
	}
}

//funktion som tager gennemsnittet af hver farve(rgb) & alpha'en inde for en valgt "cubeSquare"
function scanner(cubeSquare) {
	//henter alt pixel dataen inden for den valgte "cubeSquare"
	var squareData = scannerContext.getImageData(cubeSquares[cubeSquare].startPosX, cubeSquares[cubeSquare].startPosY, squareSize, squareSize);

	//objekt med et array for hver subpixel
	var squarePixels = {
		r: [],
		g: [],
		b: [],
		a: [],
	}
	//looper igennem hver pixel og gemmer værdien i squarePixels objektet under det tilhørende subpixel array
	for (var i = 0; i < squareData.data.length; i += 4) {
		squarePixels.r.push(squareData.data[i])
		squarePixels.g.push(squareData.data[i + 1])
		squarePixels.b.push(squareData.data[i + 2])
		squarePixels.a.push(squareData.data[i + 3])
	}

	//objekt med gennemsnit af hver subpixel inden for valgte "cubeSquare"
	var averagePixel = {
		r: arrayAverage(squarePixels.r),
		g: arrayAverage(squarePixels.g),
		b: arrayAverage(squarePixels.b),
		a: arrayAverage(squarePixels.a)
	}

	//objekt som holder hver farves score
	var scores = {}

	//loop som kører igennem alle matchColors og tager et gennemsnit af hvor langt hver subpixel er fra den scannede subpixel
	Object.keys(matchColors).forEach((color) => {
		//array som holder værdien af hvor langt hver subpixel
		var averageMatchColors = [];
		averageMatchColors.push(Math.abs(matchColors[color].r - averagePixel.r))
		averageMatchColors.push(Math.abs(matchColors[color].g - averagePixel.g))
		averageMatchColors.push(Math.abs(matchColors[color].b - averagePixel.b))
		//tager gennemsnittet af averageMatchColors og gemmer det under den tilhørende farve
		scores[color] = arrayAverage(averageMatchColors)
	})
	//returnere den farve der havde den laveste score, hvilket er den fave som er tætest på selve farven
	return {
		scores: scores,
		rgba: averagePixel,
		colorName: Object.keys(matchColors)[Object.values(scores).indexOf(Math.min(...Object.values(scores)))]
	}
}

//funktion som tegner et grid på canvas'et som gør det nemmere at placere kameraet rigtigt
function drawCubeGrid(currentFaceColor) {
	scannerContext.fillStyle = currentFaceColor; //skifter farven til at være "currentFaceColor"
	scannerContext.fillRect(gridWidth * 2 + squareSize, gridWidth * 2 + squareSize, squareSize, squareSize) //tegner firkanten i midten af cube'en

	scannerContext.fillStyle = "black"; //skifter farven til sort
	//de første fire objektet i array'et er de vertikale linjer og de sidste 4 objekter er de horisontale linjer
	var grid =
		[{
			sx: 0, //start position i x-aksen
			sy: 0, //start position i y-aksen
			w: gridWidth, //breden på linjen
			h: scannerCanvas.height //længen af linjen
		}, {
			sx: gridWidth + squareSize, //start position i x-aksen
			sy: 0, //start position i y-aksen
			w: gridWidth, //breden på linjen
			h: scannerCanvas.height //længen af linjen
		}, {
			sx: gridWidth * 2 + squareSize * 2, //start position i x-aksen
			sy: 0, //start position i y-aksen
			w: gridWidth, //breden på linjen
			h: scannerCanvas.height //længen af linjen
		}, {
			sx: gridWidth * 3 + squareSize * 3, //start position i x-aksen
			sy: 0, //start position i y-aksen
			w: gridWidth, //breden på linjen
			h: scannerCanvas.height //længen af linjen
		}, {
			sx: 0, //start position i x-aksen
			sy: 0, //start position i y-aksen
			w: scannerCanvas.height, //breden på linjen
			h: gridWidth //længen af linjen
		}, {
			sx: 0, //start position i x-aksen
			sy: gridWidth + squareSize, //start position i y-aksen
			w: scannerCanvas.height, //breden på linjen
			h: gridWidth //længen af linjen
		}, {
			sx: 0, //start position i x-aksen
			sy: gridWidth * 2 + squareSize * 2, //start position i y-aksen
			w: scannerCanvas.height, //breden på linjen
			h: gridWidth //længen af linjen
		}, {
			sx: 0, //start position i x-aksen
			sy: gridWidth * 3 + squareSize * 3, //start position i y-aksen
			w: scannerCanvas.height, //breden på linjen
			h: gridWidth //længen af linjen
		}]
	//loop der tegner alle stregerne fra "grid" array'et
	for (var i = 0; i < grid.length; i++) {
		scannerContext.fillRect(grid[i].sx, grid[i].sy, grid[i].w, grid[i].h)
	}
}

function startCamStream() {
	navigator.mediaDevices.getUserMedia(camMode).then((stream) => {
		videoTrack = stream.getVideoTracks()[0];

		video.srcObject = stream;
	}).catch((e) => {
		switch (e.name) {
			case "OverconstrainedError":
				camMode.video = true
				startCamStream()
			case "NotAllowedError":
				console.log("Sagde nej til camera")
				break;
			case "NotFoundError":
				console.log("det ser ud til at din mobil/computer ikke har et kamera")
				break;
			default:
				console.log("der er sket en ukendt fejl:", e.name)
		}
	})
}

/*
tegner en test cube
*/
// function test() {
// 	scannerContext.fillStyle = face[0];
// 	scannerContext.fillRect(cubeSquares[0].startPosX, cubeSquares[0].startPosY, squareSize, squareSize)
// 	scannerContext.fillStyle = face[1];
// 	scannerContext.fillRect(cubeSquares[1].startPosX, cubeSquares[1].startPosY, squareSize, squareSize)
// 	scannerContext.fillStyle = face[2];
// 	scannerContext.fillRect(cubeSquares[2].startPosX, cubeSquares[2].startPosY, squareSize, squareSize)
// 	scannerContext.fillStyle = face[3];
// 	scannerContext.fillRect(cubeSquares[3].startPosX, cubeSquares[3].startPosY, squareSize, squareSize)
// 	scannerContext.fillStyle = face[4];
// 	scannerContext.fillRect(cubeSquares[4].startPosX, cubeSquares[4].startPosY, squareSize, squareSize)
// 	scannerContext.fillStyle = face[5];
// 	scannerContext.fillRect(cubeSquares[5].startPosX, cubeSquares[5].startPosY, squareSize, squareSize)
// 	scannerContext.fillStyle = face[0];
// 	scannerContext.fillRect(cubeSquares[6].startPosX, cubeSquares[6].startPosY, squareSize, squareSize)
// 	scannerContext.fillStyle = face[2];
// 	scannerContext.fillRect(cubeSquares[7].startPosX, cubeSquares[7].startPosY, squareSize, squareSize)
// 	scannerContext.fillStyle = face[1];
// 	scannerContext.fillRect(cubeSquares[8].startPosX, cubeSquares[8].startPosY, squareSize, squareSize)
// }
//*/