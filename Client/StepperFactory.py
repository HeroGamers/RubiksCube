from gpiozero import DigitalOutputDevice
from time import sleep

# Unchangeable variables
stepAngle = 1.8  # The step angle of the stepper motor, ours is 1.8 degrees
microSteps = 1  # The amount of microsteps the stepper takes
pulsesPerRotation = int(360/stepAngle*microSteps)  # 360 degrees
pulseDelay = 450  # The delay between HIGH and LOW, in microseconds


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
            if "RIGHT" in direction.upper():
                self.direction.off()
            elif "LEFT" in direction.upper():
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
        for degree in range(int(round(pulsesPerRotation/360*degrees))):
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

# Put all into an array as well
Steppers = [DownStepper, FrontStepper, BackStepper, RightStepper, LeftStepper, MoveStepper]


# Shared functions
def turnAllOff():
    for stepper in Steppers:
        stepper.off()
