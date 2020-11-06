if (debug === "true") {
    var CubeAsString = "";

    // console.log(oldCubeCanvas.parentElement.clientWidth)

    let parentPadding = parseInt(window.getComputedStyle(oldCubeCanvas.parentElement, null).getPropertyValue('padding-left').replace("px",""))*2
    // console.log(parentPadding)
    oldCubeCanvas.width = oldCubeCanvas.parentElement.clientWidth - parentPadding; // width of row, Normally 700

    oldCubeCanvas.width = (oldCubeCanvas.width > 500) ? 500 : oldCubeCanvas.width

    oldCubeCanvas.height = 500/700*oldCubeCanvas.width; // Normally 500
    var oldCubeContext = oldCubeCanvas.getContext("2d");
    var SquareSpace = oldCubeCanvas.height*0.2/10;
    var SquareSize = oldCubeCanvas.height*0.8/9;
    var Pos = [
        //up face
        {x:SquareSpace*4+SquareSize*3,y:SquareSpace},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace},

        {x:SquareSpace*4+SquareSize*3,y:SquareSpace*2+SquareSize},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace*2+SquareSize},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace*2+SquareSize},

        {x:SquareSpace*4+SquareSize*3,y:SquareSpace*3+SquareSize*2},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace*3+SquareSize*2},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace*3+SquareSize*2},

        //right face
        {x:SquareSpace*7+SquareSize*6,y:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*8+SquareSize*7,y:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*9+SquareSize*8,y:SquareSpace*4+SquareSize*3},

        {x:SquareSpace*7+SquareSize*6,y:SquareSpace*5+SquareSize*4},
        {x:SquareSpace*8+SquareSize*7,y:SquareSpace*5+SquareSize*4},
        {x:SquareSpace*9+SquareSize*8,y:SquareSpace*5+SquareSize*4},

        {x:SquareSpace*7+SquareSize*6,y:SquareSpace*6+SquareSize*5},
        {x:SquareSpace*8+SquareSize*7,y:SquareSpace*6+SquareSize*5},
        {x:SquareSpace*9+SquareSize*8,y:SquareSpace*6+SquareSize*5},

        //front face
        {x:SquareSpace*4+SquareSize*3,y:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace*4+SquareSize*3},

        {x:SquareSpace*4+SquareSize*3,y:SquareSpace*5+SquareSize*4},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace*5+SquareSize*4},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace*5+SquareSize*4},

        {x:SquareSpace*4+SquareSize*3,y:SquareSpace*6+SquareSize*5},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace*6+SquareSize*5},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace*6+SquareSize*5},

        //down face
        {x:SquareSpace*4+SquareSize*3,y:SquareSpace*7+SquareSize*6},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace*7+SquareSize*6},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace*7+SquareSize*6},

        {x:SquareSpace*4+SquareSize*3,y:SquareSpace*8+SquareSize*7},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace*8+SquareSize*7},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace*8+SquareSize*7},

        {x:SquareSpace*4+SquareSize*3,y:SquareSpace*9+SquareSize*8},
        {x:SquareSpace*5+SquareSize*4,y:SquareSpace*9+SquareSize*8},
        {x:SquareSpace*6+SquareSize*5,y:SquareSpace*9+SquareSize*8},

        //left face
        {x:SquareSpace, y:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*2+SquareSize, y:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*3+SquareSize*2, y:SquareSpace*4+SquareSize*3},

        {x:SquareSpace, y:SquareSpace*5+SquareSize*4},
        {x:SquareSpace*2+SquareSize, y:SquareSpace*5+SquareSize*4},
        {x:SquareSpace*3+SquareSize*2, y:SquareSpace*5+SquareSize*4},

        {x:SquareSpace, y:SquareSpace*6+SquareSize*5},
        {x:SquareSpace*2+SquareSize, y:SquareSpace*6+SquareSize*5},
        {x:SquareSpace*3+SquareSize*2, y:SquareSpace*6+SquareSize*5},

        //back face
        {x:SquareSpace*10+SquareSize*9, y:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*11+SquareSize*10, y:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*12+SquareSize*11, y:SquareSpace*4+SquareSize*3},

        {x:SquareSpace*10+SquareSize*9, y:SquareSpace*5+SquareSize*4},
        {x:SquareSpace*11+SquareSize*10, y:SquareSpace*5+SquareSize*4},
        {x:SquareSpace*12+SquareSize*11, y:SquareSpace*5+SquareSize*4},

        {x:SquareSpace*10+SquareSize*9, y:SquareSpace*6+SquareSize*5},
        {x:SquareSpace*11+SquareSize*10, y:SquareSpace*6+SquareSize*5},
        {x:SquareSpace*12+SquareSize*11, y:SquareSpace*6+SquareSize*5}
    ];
    var Color = {
        U:"white",
        R:"red",
        F:"green",
        D:"yellow",
        L:"orange",
        B:"blue",
    }
    function DrawSquare(i, c) {
        oldCubeContext.fillStyle = Color[c];
        oldCubeContext.fillRect(Pos[i].x, Pos[i].y, SquareSize, SquareSize);
    }
    var SquareSpaces = [
        // | linjer
        {x:0,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},
        {x:SquareSpace+SquareSize,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},
        {x:SquareSpace*2+SquareSize*2,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},
        {x:SquareSpace*3+SquareSize*3,y:0,h:SquareSpace*10+SquareSize*9,w:SquareSpace},
        {x:SquareSpace*4+SquareSize*4,y:0,h:SquareSpace*10+SquareSize*9,w:SquareSpace},
        {x:SquareSpace*5+SquareSize*5,y:0,h:SquareSpace*10+SquareSize*9,w:SquareSpace},
        {x:SquareSpace*6+SquareSize*6,y:0,h:SquareSpace*10+SquareSize*9,w:SquareSpace},
        {x:SquareSpace*7+SquareSize*7,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},
        {x:SquareSpace*8+SquareSize*8,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},
        {x:SquareSpace*9+SquareSize*9,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},
        {x:SquareSpace*10+SquareSize*10,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},
        {x:SquareSpace*11+SquareSize*11,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},
        {x:SquareSpace*12+SquareSize*12,y:SquareSpace*3+SquareSize*3,h:SquareSpace*4+SquareSize*3,w:SquareSpace},

        // -- linjer
        {x:SquareSpace*3+SquareSize*3,y:0,h:SquareSpace,w:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*3+SquareSize*3,y:SquareSpace+SquareSize,h:SquareSpace,w:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*3+SquareSize*3,y:SquareSpace*2+SquareSize*2,h:SquareSpace,w:SquareSpace*4+SquareSize*3},
        {x:0,y:SquareSpace*3+SquareSize*3,h:SquareSpace,w:SquareSpace*13+SquareSize*12},
        {x:0,y:SquareSpace*4+SquareSize*4,h:SquareSpace,w:SquareSpace*13+SquareSize*12},
        {x:0,y:SquareSpace*5+SquareSize*5,h:SquareSpace,w:SquareSpace*13+SquareSize*12},
        {x:0,y:SquareSpace*6+SquareSize*6,h:SquareSpace,w:SquareSpace*13+SquareSize*12},
        {x:SquareSpace*3+SquareSize*3,y:SquareSpace*7+SquareSize*7,h:SquareSpace,w:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*3+SquareSize*3,y:SquareSpace*8+SquareSize*8,h:SquareSpace,w:SquareSpace*4+SquareSize*3},
        {x:SquareSpace*3+SquareSize*3,y:SquareSpace*9+SquareSize*9,h:SquareSpace,w:SquareSpace*4+SquareSize*3},

    ]
    function DrawSquareSpace(i) {
        oldCubeContext.fillStyle = "black";
        oldCubeContext.fillRect(SquareSpaces[i].x, SquareSpaces[i].y, SquareSpaces[i].w, SquareSpaces[i].h);
    }
    for (var i = 0; i < SquareSpaces.length; i++) {
        DrawSquareSpace(i)
    }
    function DrawCube(s) {
        for (var i = 0; i < s.length; i++) {
            DrawSquare(i, s[i])
        }
    }
    socket.on("cubeState", (CS)=>{
        DrawCube(CS)
        CubeAsString = CS
    })
    oldCubeCanvas.onclick = (e)=> {
        var MousePos = {x: e.layerX, y: e.layerY};
        for (var i = 0; i < Pos.length; i++) {
            if (MousePos.x >= Pos[i].x && Pos[i].x + SquareSize >= MousePos.x && MousePos.y >= Pos[i].y && Pos[i].y + SquareSize >= MousePos.y) {
                if (Object.keys(Color).indexOf(CubeAsString[i]) == 5) {
                    CubeAsString = CubeAsString.split("")
                    CubeAsString[i] = Object.keys(Color)[0]
                    CubeAsString = CubeAsString.join("")
                    console.log(Object.keys(Color)[0])
                    DrawCube(CubeAsString)
                } else {
                    CubeAsString = CubeAsString.split("")
                    CubeAsString[i] = Object.keys(Color)[Object.keys(Color).indexOf(CubeAsString[i]) + 1]
                    CubeAsString = CubeAsString.join("")
                    console.log(CubeAsString)
                    DrawCube(CubeAsString)
                    console.log(Object.keys(Color)[Object.keys(Color).indexOf(CubeAsString[i]) + 1])
                }
            }
        }
    }
}