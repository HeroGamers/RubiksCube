const int button_Pin = 2;
const int stepper_stepPin = 6;
const int stepper_dirPin = 7;

int buttonState = 0;

// unchangeable variables
const long maxRotations = 172013; // To the top 305800 pos, so halfway is 152900
const float motorSpeed = 10000.0; // The speed, in SPS (steps per second), at which the motor turns - Tested and works with 1600, 3200 and 6200 at 16 microsteps
const float motorAcceleration = 80000.0; // 80000 works at 16 microsteps and 4 microsteps

// Include and start step-motor
#include <AccelStepper.h>
AccelStepper motor(AccelStepper::DRIVER, stepper_stepPin, stepper_dirPin); // Step-motor driver is on pins 8 through 10

void setup() {
  // Setup the serial port, and set the data rate to 9600 bps
  Serial.begin(9600);

  // Setup the pinMode for the button, input
  pinMode(button_Pin, INPUT);

  // Set step-motor speed
  motor.setMaxSpeed(motorSpeed);
  // Set motor acceleration
  motor.setAcceleration(motorAcceleration);
}

void loop() {
  // BUTTON CHECKING //
  buttonState = digitalRead(button_Pin);

  if (buttonState == HIGH) {
    motor.moveTo(maxRotations);
    Serial.println("AAAAAAAAA");
    delay(1000);
  }
  else {
    //Serial.print("Button was let go! Stopping the motor at pos: ");
    //Serial.println(motor.currentPosition());
    //motor.stop();
    //motor.runToPosition();
    Serial.println("no");
  }
}
