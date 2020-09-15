from gpiozero import DigitalOutputDevice
from time import sleep

# Unchangeable variables
pulsesPerRotation = 200  # 360 degrees
pulseDelay = 450  # The delay between HIGH and LOW, in microseconds
moveDelay = 2000  # The delay between each move, in milliseconds
moveStepperDegrees = 360  # The amount of degrees the move stepper should move to fit/unfit


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
        for degree in range(pulsesPerRotation/360*degrees):
            self.stepper.on()
            sleep(pulseDelay*10**(-6))  # Convert the pulseDelay from microseconds to seconds
            self.stepper.off()
            sleep(pulseDelay*10**(-6))  # Convert the pulseDelay from microseconds to seconds

    # Function to turn on the stepper
    def on(self):
        if self.enPin and self.enable:
            self.enable.on()

    # Function to turn on the stepper
    def off(self):
        if self.enPin and self.enable:
            self.enable.off()


# Define the steppers
DownStepper = Stepper(1, 2, 3)
FrontStepper = Stepper(4, 5, 6)
BackStepper = Stepper(7, 8, 9)
RightStepper = Stepper(10, 11, 12)
LeftStepper = Stepper(13, 14, 15)
MoveStepper = Stepper(17, 20, 21)


# Function to do a certain move
def do_move(notation):
    # Find the stepper motor
    motor = None
    if "D" in notation:
        motor = DownStepper
    elif "R" in notation:
        motor = RightStepper
    elif "L" in notation:
        motor = LeftStepper
    elif "F" in notation:
        motor = FrontStepper
    elif "B" in notation:
        motor = BackStepper

    if motor:
        if "'" in notation:  # The left turning notation
            motor.set_direction("LEFT")
            motor.move(90)
            motor.set_direction("RIGHT")
        elif "2" in notation:  # The move 180 notation
            motor.move(180)
        else:  # Normal notation
            motor.move(90)

        # Delay after the move
        sleep(moveDelay)
        return True

    return False


# The run function
def run(moves):
    # Move the move stepper to the correct position...
    print("Moving move stepper...")
    MoveStepper.set_direction("RIGHT")
    MoveStepper.move(moveStepperDegrees)
    print("Done moving the move stepper!")

    # Do the moves
    moves = moves.split()  # Split at space

    print("Doing moves...")
    for move in moves:
        status = do_move(move)
        if not status:
            print("Move didn't complete...")
    print("Done with the moves!")

    print("Moving the move stepper... Please wait...")
    MoveStepper.set_direction("LEFT")
    MoveStepper.move(moveStepperDegrees)
    print("Done moving the move stepper, feel free to pull out cube!")


