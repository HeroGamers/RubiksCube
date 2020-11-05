let scene = new THREE.Scene()

// TODO:
// Rotation af vektor3 funktion
// Manuel rotations funktion

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight*2, 1, 10000)

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





let renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor('#ffffff', 1);


// *! VIGTIGE VARIABLER
const rotationDelay = 10 // jo højere, desto langsommere... Desuden afhænger farten også af hvor lidt cuben roteres.
const deg90ToRad = 1.57079633 // hvilken 90
const rotationParts = 20


const xAxis = [ 'F', 'U', 'B', 'D' ]
const yAxis = [ 'F', 'L', 'B', 'R' ]
const zAxis = [ 'U', 'R', 'D', 'L' ]

const Axises = {
    x: [ 'F', 'U', 'B', 'D' ],
    y: [ 'F', 'L', 'B', 'R' ],
    z: [ 'U', 'R', 'D', 'L' ]
}



let cubes = []

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


let max = deg90ToRad


let MOVES = {
    'U': [],
    'D': [],
    'F': [9, 2, 3, 'z', -1],
    'B': [9, 0, 3, 'z', -1],
    'R': [9, 6, 1, 'x', 1],
    'L': [9, 0, 1, 'x', -1],
}








function miniCube(x, y, z, colors) {
    const fill = 1
    colors = COLORS // !

    let geometry = new THREE.BoxGeometry(1, 1, 1, fill, fill, fill)


    for (let C of colors)
        if (!C) C = WHITE


    for (let i = 0; i < 6; i++) {
        let color = (true) ? colors[i] : BLACK

        geometry.faces[i * 2].color = color
        geometry.faces[i * 2 + 1].color = color
    }

    // material
    let material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: THREE.FaceColors,
        wireframe: 0
    })

    let cube = new THREE.Mesh(geometry, material)
    cube.position.x = x
    cube.position.y = y
    cube.position.z = z

    cube.anchorVectors = {
        'right': new THREE.Vector3(1, 0, 0),
        'up': new THREE.Vector3(0, 1, 0),
        'front': new THREE.Vector3(0, 0, 1)
    }

    cube.currentRotation = 0



    cube.getCorrectAxis = (axis) => {
        let VR = cube.anchorVectors['right']
        let VU = cube.anchorVectors['up']
        let VF = cube.anchorVectors['front']
        
        let Direction = 1
        let newAxis = axis

        anchorVectorsToRotate = []

        const xCorrectionsAxises = [ 'x', 'y', 'z' ]

        anchorVectorsToRotate.push('right')
        anchorVectorsToRotate.push('up')
        anchorVectorsToRotate.push('front')


        if (axis == 'x') {
            if (VR.x) { // rød = højre eller venstre
                newAxis = 'x'
                if (VR.x == -1) Direction *= -1
            } 
            else if (VR.y) {
                if (VF.z) newAxis = 'y'
                if (VF.x) newAxis = 'z'

                if (VF.z == 1) Direction *= -1
                if (VF.y == -1) Direction *= -1
            }
            else if (VR.z) {
                if (VF.x) newAxis = 'z'
                if (VF.y) newAxis = 'y'

                if (VF.z == 1) Direction *= -1
            }
        }

        if (axis == 'y') {
            if (VU.y) { // gul = op eller ned 
                log('yay')
                newAxis = 'y'
                if (VU.y == -1) Direction *= -1
            }
            else if (VU.z || VU.x) {
                log('nay')
                newAxis = 'z'
                if (VF.y == -1) Direction *= -1
            }
        }

      

        return { 'Axis': newAxis, 'Direction': Direction, 'anchorVectorsToRotate': anchorVectorsToRotate }
    }




    cube.rotate90deg = (axis_XYZ, Reverse_optional, __override) => {
        //? Dobbelt bindestreg ( __parameter ) betyder at parameteren kun benyttes af selve programmet.
        // Sørger for at funktionen ikke kan blive kaldt af brugeren hvis den allerede er i gang med at rotere.
        if (cube.currentRotation > 0 && !__override) return

        // Sørger for funktionen ved hvor mange gang den kan kalde sig selv.
        if (cube.currentRotation <= 0 && !__override) cube.currentRotation = rotationParts
        cube.currentRotation --

        // 90 grader divideret med et tal.
        amountOfRotation = ( (Reverse_optional == true) ? -1:1 ) * deg90ToRad/rotationParts
        // Cuben roterer altid den samme vej. Det vil sige at cuben kan se ud som at den roterer forskellige vej.

        // Laver en vector3 som angiver hvilken akse positionen bliver roteret om.
        axis_vector3 = new THREE.Vector3(Number(axis_XYZ == 'x'), Number(axis_XYZ == 'y'), Number(axis_XYZ == 'z') )

        // Placerer cuben i den nye position
        //! cube.position.applyAxisAngle(axis_vector3, amountOfRotation)
        
        // roterer cuben ud fra dens centrum
        const Correction = cube.getCorrectAxis(axis_XYZ)
        cube[`rotate${ Correction.Axis.toUpperCase() }`](amountOfRotation*Correction.Direction)


        // Kalder sig selv igen, hvis der stadig er brug for det.
        if (cube.currentRotation > 0) {
            setTimeout(() => {
                cube.rotate90deg(axis_XYZ, Reverse_optional, true)
            }, rotationDelay)
        } else {
            log(Correction)
            for (let label of Correction.anchorVectorsToRotate) {
                newVector = cube.rotateVector3(cube.anchorVectors[ label ], axis_XYZ, ( (Reverse_optional == true) ? -1:1 ))
                log(newVector)
            }
        }
    }


    cube.rotateVector3 = (Vector3, Axis, Direction) => {
        // Virker
        if (Axis == 'x') {
            if (Vector3.y) {
                Vector3.z = Vector3.y * Direction
                Vector3.y = 0
            } else if (Vector3.z) {
                Vector3.y = -Vector3.z * Direction
                Vector3.z = 0
            }
        }

        // Virker
        if (Axis == 'y') {
            if (Vector3.z) {
                Vector3.x = Vector3.z * Direction
                Vector3.z = 0
            } else if (Vector3.x) {
                Vector3.z = -Vector3.x * Direction
                Vector3.x = 0
            }
        }

        // Virker
        if (Axis == 'z') {
            if (Vector3.x) {
                Vector3.y = Vector3.x * Direction
                Vector3.x = 0
            } else if (Vector3.y) {
                Vector3.x = -Vector3.y * Direction
                Vector3.y = 0
            }
        }

        return Vector3
    }



    cube.nextIndex = (arr, thingToLocate, amountToIncrement) => {
        //? Finder pladsen før eller efter
        amountToIncrement = amountToIncrement || 1
        let i = arr.indexOf(thingToLocate)
        if (i == -1) return false
        i += amountToIncrement
        if (i > arr.length -1) i = 0
        if (i < 0) i = arr.length-1
        return i
    }

    scene.add(cube)
    return cube
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