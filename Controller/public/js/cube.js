var scene = new THREE.Scene()


var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight*2, 1, 10000)

camera.position.x = 3
camera.position.y = 3.5
camera.position.z = 3

camera.lookAt(0, 0, 0)

// colors
const WHITE = new THREE.Color(1, 1, 1)
const BLACK = new THREE.Color(0, 0, 0)
const RED = new THREE.Color(1, 0, 0)
const GREEN = new THREE.Color(0, 1, 0)
const BLUE = new THREE.Color(0, 0, 1)
const YELLOW = new THREE.Color(.9764705882, .9843137255, .0431372549)
const ORANGE = new THREE.Color(249 / 255, 173 / 255, 11 / 255)
const COLORS = [RED, ORANGE, YELLOW, WHITE, BLUE, GREEN]
const altCOLORS = [GREEN, RED, ORANGE, YELLOW, WHITE, BLUE]





var renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight/2)
renderer.setClearColor('#1d1d26', 1);
document.getElementById('canvas').appendChild(renderer.domElement)


// *! VIGTIGE VARIABLER
stop = false
const rotationDelay = 1000 // jo højere, desto langsommere... Desuden afhænger farten også af hvor lidt cuben roteres.
const a90 = 1.57079633


const xAxis = [ 'F', 'U', 'B', 'D' ]
const yAxis = [ 'F', 'L', 'B', 'R' ]
const zAxis = [ 'U', 'R', 'D', 'L' ]

const Axis = {
    x: [ 'F', 'U', 'B', 'D' ],
    y: [ 'F', 'L', 'B', 'R' ],
    z: [ 'U', 'R', 'D', 'L' ]
}


// midlertidig prik i origo
var dotGeometry = new THREE.Geometry()
dotGeometry.vertices.push(new THREE.Vector3(0, 0, 0))
var dotMaterial = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false })
var dot = new THREE.Points(dotGeometry, dotMaterial)
scene.add(dot)



var cubes = []

let ix = -1
let iy = -1
let iz = -1


// Her laver jeg de forskellige cubes
for (let i = 0; i < 9; i++) {
    cubes.push(miniCube(ix, iy, -1))
    cubes.push(miniCube(ix, iy, 0))
    cubes.push(miniCube(ix, iy, 1))

    ix++
    if (ix > 1) {
        ix = -1
        iy++
    }
}

let uTurn = 0
let lastPos = null


let max = a90


let MOVES = {
    'U': [],
    'D': [],
    'F': [9, 2, 3, 'z', -1],
    'B': [9, 0, 3, 'z', -1],
    'R': [9, 6, 1, 'x', 1],
    'L': [9, 0, 1, 'x', -1],
}



function slowTurn(id, delay, axis) {

    // cubes[id].rotate(new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(45), false)

    setInterval(() => {
        cubes[id].rotate(new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(90/15), false)
        if (stop) return
    }, delay)
}


function turn(move, parts, counterClockwise, z_count) {
    if (stop) return

    log(counterClockwise)
    counterClockwise = (counterClockwise === undefined) ? 1 : counterClockwise

    aTurn(MOVES[move][0], MOVES[move][1], MOVES[move][2], MOVES[move][3], parts, MOVES[move][4] * counterClockwise)

    z_count = z_count || 1

    if (z_count < parts) {
        setTimeout(() => {
            z_count ++
            turn(move, parts, counterClockwise, z_count)
        }, rotationDelay/parts)
    }
}


function aTurn(pattern, offset, distance, axis, parts, counterClockwise) {

    // log(pattern, offset, distance)

    offset = offset || 0

    con = new THREE.Vector3(Number(axis == 'x'), Number(axis == 'y'), Number(axis == 'z') )

    for (let i = 0; i < 3; i++) {
        // log('i:', i)
        for (let z = 0; z < 3; z++) {
            // log('	z:', z, ' - ' + Number((pattern * i + offset) + z * distance))
            let CUBE = cubes[Number((pattern * i + offset) + z * distance)]
            // cubes[Number((pattern * i + offset) + z * distance)].rotate(xRot * counterClockwise, yRot * counterClockwise, zRot * counterClockwise) // TODO: implementer counterClockwise rotation
            
            CUBE.rotate(rotate_axis, THREE.Math.degToRad(90/parts)*counterClockwise)
        }
    }
}


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth/2, window.innerHeight/2);

}


function render() {
    requestAnimationFrame(render)


    // camera.position.x += 0.004
    // camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
}



function miniCube(x, y, z, colors) {
    var fill = 1

    colors = COLORS // !

    var geometry = new THREE.BoxGeometry(1, 1, 1, fill, fill, fill)


    for (let C of colors)
        if (!C) C = WHITE


    for (var i = 0; i < 6; i++) {
        let color = (true) ? colors[i] : BLACK

        geometry.faces[i * 2].color = color
        geometry.faces[i * 2 + 1].color = color
    }


    let wf = (cubes.length == 0) ? false : 0

    // material
    var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: THREE.FaceColors,
        wireframe: wf
    })

    var cube = new THREE.Mesh(geometry, material)


    cube.position.x = x
    cube.position.y = y
    cube.position.z = z

    cube.anchorFaces = { right: 'R', up: 'U'}

    cube.rotate = (axis_vector3, rotate_radians) => {
        let obj = cube
        let point = new THREE.Vector3(0, 0, 0)
        let pointIsWorld = false
        pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

        if (pointIsWorld) {
            obj.parent.localToWorld(obj.position); // compensate for world coordinate
        }

        obj.position.sub(point); // remove the offset
        obj.position.applyAxisAngle(axis_vector3, rotate_radians); // rotate the POSITION
        obj.position.add(point); // re-add the offset

        if (pointIsWorld) {
            obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
        }

        obj.rotateOnAxis(axis_vector3, rotate_radians); // rotate the OBJECT
    }



    cube.nRot = (axis, dir, _inc) => {
        divide = 10
        _inc = _inc+1 || 0
        dir = dir || 1

        axis = {
            pos: axis,
            rot: axis
        }


        let rotAxis = {
            x: false,
            y: false,
            z: false
        }

        let aDir = dir // actual Direction

        const Corrections = {
            'x': {
                'face': 'right',
                'faces': [ 'FB', 'UD' ],
                'axis': [ 'Z', 'z', 'Y', 'y' ]
            },
            'y': {
                'face': 'right',
                'faces': [ 'UD' ],
                'axis': [ 'x', 'x' ]
            }
        }

        for (let ax of 'x') {
            if (axis.pos != ax) continue
            
            rotAxis[ax] = true
            let Cor = Corrections[ax]

            let i = -1
            for (let str of Cor.faces) {
                i++
                if (str.includes(cube.anchorFaces[Cor.face])) {
                    let tAx = Cor.axis[ (i*2 + Cor.faces[i].indexOf( cube.anchorFaces[Cor.face]) ) ]
                    if (tAx == tAx.toUpperCase()) aDir *= -1
                    axis.rot = tAx.toLowerCase()
                    if (ax == 'y') {
                        log('Y:', tAx)
                    }
                }
            }
        }

        // if (axis.pos == 'y') {
        //     rotAxis.y = true
        // }

        if (axis.pos == 'z') {
            rotAxis.z = true
        }

        cube.nRotS(axis, divide, aDir)

        if (_inc < divide-1)
            return setTimeout(()=>{cube.nRot(axis.pos, dir, _inc)}, 100)



        // roter anchor
        for (const ax of 'xyz') {
            rotAx = rotAxis[ax]
            if (!rotAx) continue

            let i = cube.nextIndex(Axis[ax], cube.anchorFaces.right, -dir)
            let o = cube.nextIndex(Axis[ax], cube.anchorFaces.up, -dir)

            if (!(i === false)) cube.anchorFaces.right = Axis[ax][i]
            if (!(o === false)) cube.anchorFaces.up = Axis[ax][o]
        }

        log(cube.anchorFaces)
    }


    cube.nRotS = (axis, divide, dir) => {
        divide = divide || 2
        whi = 1 // 1: kun rotation, 0: kun position, intet: begge
        amountOfRotation = dir * a90/divide
        // Cuben roterer altid den samme vej. Det vil sige at cuben kan se ud som at den roterer forskellige vej.

        if (typeof axis == 'string') {
            axis = { // *! Backwards compatibility
                pos: axis,
                rot: axis
            }
        }

        axis_vector3 = new THREE.Vector3(Number(axis.pos == 'x'), Number(axis.pos == 'y'), Number(axis.pos == 'z') )

        if (whi === 0 || whi === undefined)
            cube.position.applyAxisAngle(axis_vector3, amountOfRotation)
        
        if (whi == 1 || whi === undefined)
            cube[`rotate${ axis.rot.toUpperCase() }`](amountOfRotation)
    }



    cube.nextIndex = (arr, place, inc) => {
        inc = inc || 1
        let i = arr.indexOf(place)
        if (i == -1) return false
        i += inc
        if (i > arr.length -1) i = 0
        if (i < 0) i = arr.length-1
        return i
    }

    scene.add(cube)
    return cube
}

render()