from gpiozero import DigitalOutputDevice
from time import sleep

# Unchangeable variables
stepAngle = 1.8  # The step angle of the stepper motor, ours is 1.8 degrees
microSteps = 1  # The amount of microsteps the stepper takes
pulsesPerRotation = int(360/stepAngle*microSteps)  # 360 degrees
frequency = 0  # The frequency between each pulse, in kHz, max for driver is 20 kHz
pulseDelay = 0  # The delay between each pulse, in seconds
stepDelay = 20  # The delay between each pulse cycle / steps - in microseconds
rotationsPerMinute = 0  # Calculate RPM


def setPulseDelay(rpm=None, kHz=None):
    global rotationsPerMinute
    global frequency
    global pulseDelay
    if rpm:
        rotationsPerMinute = rpm
        frequency = (rotationsPerMinute/((stepAngle/360)*60))/1000  # Frequency in kHz
        pulseDelay = 1/(frequency*1000)
    elif kHz:
        frequency = kHz
        pulseDelay = 1/(frequency*1000)  # The delay between each pulse, in seconds
        rotationsPerMinute = stepAngle/360*(frequency*1000)*60  # Calculate RPM
    print("Current RPM: " + str(rotationsPerMinute) + " - Current frequency: " + str(frequency) + " kHz")


# Get the pulse delay, using either frequency or rpm - max kHz is 20 for driver
setPulseDelay(kHz=20)


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
        current_rpm = 200
        max_rpm = 600
        acceleration = 20
        # Don't make the sleep async, the delay on the sleep in async is too slow, and gets weird
        for degree in range(int(round(pulsesPerRotation/360*degrees))):
            # Speed calculation
            if current_rpm+acceleration < max_rpm:
                current_rpm = current_rpm+acceleration
            else:
                current_rpm = max_rpm

            current_frequency = (current_rpm / ((stepAngle / 360) * 60))  # Frequency in Hz

            # Do the step
            self.stepper.on()
            sleep(pulseDelay)
            self.stepper.off()

            sleep(1/current_frequency)

            print("Step " + str(degree) + " - RPM: " + str(current_rpm) + " | " + str(round(current_frequency/1000, 2)) + " kHz")

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


def turnAllOn():
    for stepper in Steppers:
        stepper.on()
