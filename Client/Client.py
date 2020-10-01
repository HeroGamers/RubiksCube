import json
from gpiozero import DigitalOutputDevice
from time import sleep
import asyncio
import websockets

# Unchangeable variables
stepAngle = 1.8  # The step angle of the stepper motor, ours is 1.8 degrees
microSteps = 1  # The amount of microsteps the stepper takes
pulsesPerRotation = int(360/stepAngle*microSteps)  # 360 degrees
pulseDelay = 450  # The delay between HIGH and LOW, in microseconds
moveDelay = 100  # The delay between each move, in milliseconds
moveStepperDegrees = 360  # The amount of degrees the move stepper should move to fit/unfit

# Changeable variables
debug = True
stop = False
running = False
ws_message = ""  # A message to send to the websocket


def logDebug(message):
    if debug:
        print(message)


class Stepper:
    def __init__(self, step_pin, dir_pin, en_pin):
        # Define pins
        self.stepPin = step_pin
        self.dirPin = dir_pin
        self.enPin = en_pin

        # Define output devices for interface
        self.stepper = DigitalOutputDevice(self.stepPin)
        self.direction = DigitalOutputDevice(self.dirPin)
        self.enable = DigitalOutputDevice(self.enPin)

    # Function to set the direction
    def set_direction(self, direction):
        if isinstance(direction, str):
            if "LEFT" in direction.upper():
                self.direction.off()
            elif "RIGHT" in direction.upper():
                self.direction.on()
        elif isinstance(direction, bool):
            if direction:
                self.direction.on()
            else:
                self.direction.off()
        else:
            print("Error 1 - Direction not found")

    # Function to move a motor a certain amount of degrees
    def move(self, degrees):
        for degree in range(int(pulsesPerRotation/360*degrees)):
            self.stepper.on()
            sleep(pulseDelay*10**(-6))  # Convert the pulseDelay from microseconds to seconds
            self.stepper.off()
            sleep(pulseDelay*10**(-6))  # Convert the pulseDelay from microseconds to seconds

    # Function to turn on the stepper
    def on(self):
        if self.enPin and self.enable:
            self.enable.off()

    # Function to turn on the stepper
    def off(self):
        if self.enPin and self.enable:
            self.enable.on()


# Define the steppers
DownStepper = Stepper(14, 15, 18)
FrontStepper = Stepper(2, 3, 4)
BackStepper = Stepper(17, 27, 22)
RightStepper = Stepper(5, 6, 13)
LeftStepper = Stepper(10, 9, 11)
MoveStepper = Stepper(25, 8, 7)

# Turn them all off
DownStepper.off()
FrontStepper.off()
BackStepper.off()
RightStepper.off()
LeftStepper.off()
MoveStepper.off()


# Function to do a certain move
def do_move(notation):
    logDebug(notation)
    # Find the stepper motor
    motor = None
    if "D" in notation:
        logDebug("Selected DownStepper")
        motor = DownStepper
    elif "R" in notation:
        logDebug("Selected RightStepper")
        motor = RightStepper
    elif "L" in notation:
        logDebug("Selected LeftStepper")
        motor = LeftStepper
    elif "F" in notation:
        logDebug("Selected FrontStepper")
        motor = FrontStepper
    elif "B" in notation:
        logDebug("Selected BackStepper")
        motor = BackStepper

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
    print("Moving move stepper...")
    MoveStepper.on()
    MoveStepper.set_direction("RIGHT")
    MoveStepper.move(moveStepperDegrees)
    MoveStepper.off()
    print("Done moving the move stepper!")

    # Do the moves
    moves = moves.split()  # Split at space

    print("Doing moves...")
    # Turn all drives on
    DownStepper.on()
    FrontStepper.on()
    BackStepper.on()
    RightStepper.on()
    LeftStepper.on()
    # Do moves
    count_moves = len(moves)
    i = 1
    for move in moves:
        if not stop:  # If stop is not true
            print("Doing move " + str(i) + "/" + str(count_moves) + "...")
            status = do_move(move)
            if not status:
                print("Move didn't complete...")
            i += 1
    print("Done with the moves!")
    # Turn them off again
    DownStepper.off()
    FrontStepper.off()
    BackStepper.off()
    RightStepper.off()
    LeftStepper.off()

    print("Moving the move stepper... Please wait...")
    MoveStepper.on()
    MoveStepper.set_direction("LEFT")
    MoveStepper.move(moveStepperDegrees)
    MoveStepper.off()
    print("Done moving the move stepper, feel free to pull out cube!")

    # Set running variable to False
    running = False
    # Be sure that stop is set to False, if it has been stopped
    stop = False


async def websocketlistener():
    print("Starting listener...")
    uri = "ws://play.nfs.codes:8080"
    async with websockets.connect(uri) as websocket:
        # Look for a response
        try:
            res = await websocket.recv()
            if res:
                print(res)
                res_json = json.loads(res)
                if res_json:
                    print(res_json)
                    if 'messagecode' in res_json:
                        messagecode = res_json['messagecode']
                        if "stop" in messagecode.lower():
                            global stop
                            stop = True
                        elif "moves" in messagecode.lower():
                            if not running:
                                moves = res_json['data']
                                print("Moves received - " + moves)
                                print("Running...")
                                try:
                                    run(moves)
                                except Exception as e:
                                    print("Error while doing moves! - " + str(e))
                            else:
                                print("Cannot do moves when running!")
        except Exception as e:
            print("Error while receiving response from websocket! - " + str(e))
        # Send a message to the websocket, if there is one
        global ws_message
        if ws_message:
            message = str(ws_message)
            ws_message = ""  # Clear ws_message
            await websocket.send(message)

# Start the Websocket Listener
asyncio.get_event_loop().run_until_complete(websocketlistener())
asyncio.get_event_loop().run_forever()
