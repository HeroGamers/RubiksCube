import json
import math
import StepperFactory as SF
from time import sleep
import asyncio
import websockets

# Unchangeable variables
moveDelay = 100  # The delay between each move, in milliseconds
gearPitchDiameter = 20  # The pitch diameter of the gear, in millimeters
moveStepperDistance = 1000  # The distance for the move stepper to move, in millimeters
moveStepperDegrees = 360*(moveStepperDistance/(math.pi*gearPitchDiameter))  # The amount of degrees the move stepper should move to fit/unfit

# Changeable variables
debug = True
stop = False
running = False
ws_message = ""  # A message to send to the websocket


def log(message):
    print(str(message))


def logDebug(message):
    if debug:
        print("[DEBUG]: " + str(message))


# Turn all the steppers off
SF.turnAllOff()


# Function to do a certain move
def do_move(notation):
    logDebug(notation)
    # Find the stepper motor
    motor = None
    if "D" in notation:
        logDebug("Selected DownStepper")
        motor = SF.DownStepper
    elif "R" in notation:
        logDebug("Selected RightStepper")
        motor = SF.RightStepper
    elif "L" in notation:
        logDebug("Selected LeftStepper")
        motor = SF.LeftStepper
    elif "F" in notation:
        logDebug("Selected FrontStepper")
        motor = SF.FrontStepper
    elif "B" in notation:
        logDebug("Selected BackStepper")
        motor = SF.BackStepper

    if motor:
        if "'" in notation:  # The left turning notation
            logDebug("Moving left once...")
            motor.set_direction("LEFT")
            motor.move(90)
            motor.set_direction("RIGHT")
        elif "2" in notation:  # The move 180 notation
            logDebug("Moving 180 degrees...")
            motor.move(180)
        else:  # Normal notation
            logDebug("Moving right once...")
            motor.move(90)

        # Delay after the move
        logDebug("Done moving, sleeping...")
        sleep(moveDelay*10**(-3))  # milliseconds to seconds
        logDebug("Done sleeping!")
        return True

    logDebug("Didn't find a motor, returning false...")
    return False


# The run function
def run(moves):
    global stop
    global running

    # Change running variable to True
    running = True

    # Move the move stepper to the correct position...
    log("Moving move stepper...")
    SF.MoveStepper.on()
    SF.MoveStepper.set_direction("RIGHT")
    SF.MoveStepper.move(moveStepperDegrees)
    SF.MoveStepper.off()
    log("Done moving the move stepper!")

    # Do the moves
    moves = moves.split()  # Split at space

    log("Doing moves...")
    # Turn all drives on
    SF.DownStepper.on()
    SF.FrontStepper.on()
    SF.BackStepper.on()
    SF.RightStepper.on()
    SF.LeftStepper.on()
    # Do moves
    count_moves = len(moves)
    i = 1
    for move in moves:
        if not stop:  # If stop is not true
            log("Doing move " + str(i) + "/" + str(count_moves) + "...")
            status = do_move(move)
            if not status:
                log("Move didn't complete...")
            i += 1
    log("Done with the moves!")
    # Turn them off again
    SF.DownStepper.off()
    SF.FrontStepper.off()
    SF.BackStepper.off()
    SF.RightStepper.off()
    SF.LeftStepper.off()

    log("Moving the move stepper... Please wait...")
    SF.MoveStepper.on()
    SF.MoveStepper.set_direction("LEFT")
    SF.MoveStepper.move(moveStepperDegrees)
    SF.MoveStepper.off()
    log("Done moving the move stepper, feel free to pull out cube!")

    # Set running variable to False
    running = False
    # Be sure that stop is set to False, if it has been stopped
    stop = False


async def websocketlistener():
    log("Starting listener...")
    uri = "ws://play.nfs.codes:8080"
    async with websockets.connect(uri) as websocket:
        # Look for a response
        try:
            res = await websocket.recv()
            if res:
                logDebug(res)
                res_json = json.loads(res)
                if res_json:
                    logDebug(res_json)
                    if 'messagecode' in res_json:
                        messagecode = res_json['messagecode']
                        if "stop" in messagecode.lower():
                            global stop
                            stop = True
                        elif "moves" in messagecode.lower():
                            if not running:
                                moves = res_json['data']
                                logDebug("Moves received - " + moves)
                                log("Running...")
                                try:
                                    run(moves)
                                except Exception as e:
                                    log("Error while doing moves! - " + str(e))
                                log("Done running!")
                            else:
                                log("Cannot do moves when running!")
        except Exception as e:
            log("Error while receiving response from websocket! - " + str(e))
        # Send a message to the websocket, if there is one
        global ws_message
        if ws_message:
            message = str(ws_message)
            ws_message = ""  # Clear ws_message
            await websocket.send(message)

# Start the Websocket Listener
asyncio.get_event_loop().create_task(websocketlistener())
asyncio.get_event_loop().run_forever()
