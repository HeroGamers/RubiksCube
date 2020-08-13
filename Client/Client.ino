// Defining pins
const int stepPins[] = {1, 1, 1, 1, 1, 1}; // Step pins for for motors Down, Front, Back, Right, Left and Mover
const int dirPins[]  = {1, 1, 1, 1, 1, 1}; //Direction pins for motors Down, Front, Back, Right, Left and Mover
const int enPins[]   = {1, 1, 1, 1, 1, 1}; //Ready pins for motors Down, Front, Back, Right, Left and Mover

// Unchangeable variables
const int micStep = 16;
const long oneMove = micStep*20;

// Include step-motor library
#include <AccelStepper.h>

// Setup the steppers
AccelStepper DownStepper(AccelStepper::DRIVER, stepPins[0], dirPins[0]);
AccelStepper FrontStepper(AccelStepper::DRIVER, stepPins[1], dirPins[1]);
AccelStepper BackStepper(AccelStepper::DRIVER, stepPins[2], dirPins[2]);
AccelStepper RightStepper(AccelStepper::DRIVER, stepPins[3], dirPins[3]);
AccelStepper LeftStepper(AccelStepper::DRIVER, stepPins[4], dirPins[4]);
AccelStepper MoveStepper(AccelStepper::DRIVER, stepPins[5], dirPins[5]);

void setup() {
  // Setup the serial port, and set the data rate to 9600 bps (for serial monitor)
  Serial.begin(9600);

  Serial.println("Startup done, waiting 500 ms!");
  delay(500);
}

void move(String notation) {
  // Do the move, and reset the currentPosition to 0 steps, so that it is ready for the next possible move
  // Bottom stepper
  if (notation == "D") {
    DownStepper.moveTo(oneMove);
    DownStepper.setCurrentPosition(0);
  }
  else if (notation == "D'") {
    DownStepper.moveTo(-oneMove);
    DownStepper.setCurrentPosition(0);
  }
  else if (notation == "D2") {
    DownStepper.moveTo(oneMove*2);
    DownStepper.setCurrentPosition(0);
  }
  // Right stepper
  else if (notation == "R") {
    FrontStepper.moveTo(oneMove);
    FrontStepper.setCurrentPosition(0);
  }
  else if (notation == "R'") {
    FrontStepper.moveTo(-oneMove);
    FrontStepper.setCurrentPosition(0);
  }
  else if (notation == "R2") {
    FrontStepper.moveTo(oneMove*2);
    FrontStepper.setCurrentPosition(0);
  }
  // Left stepper
  else if (notation == "L") {
    LeftStepper.moveTo(oneMove);
    LeftStepper.setCurrentPosition(0);
  }
  else if (notation == "L'") {
    LeftStepper.moveTo(-oneMove);
    LeftStepper.setCurrentPosition(0);
  }
  else if (notation == "L2") {
    LeftStepper.moveTo(oneMove*2);
    LeftStepper.setCurrentPosition(0);
  }
  // Front stepper
  else if (notation == "F") {
    FrontStepper.moveTo(oneMove);
    FrontStepper.setCurrentPosition(0);
  }
  else if (notation == "F'") {
    FrontStepper.moveTo(-oneMove);
    FrontStepper.setCurrentPosition(0);
  }
  else if (notation == "F2") {
    FrontStepper.moveTo(oneMove*2);
    FrontStepper.setCurrentPosition(0);
  }
  // Back stepper
  else if (notation == "B") {
    BackStepper.moveTo(oneMove);
    BackStepper.setCurrentPosition(0);
  }
  else if (notation == "B'") {
    BackStepper.moveTo(-oneMove);
    BackStepper.setCurrentPosition(0);
  }
  else if (notation == "B2") {
    BackStepper.moveTo(oneMove*2);
    BackStepper.setCurrentPosition(0);
  }
  // If any other move was given, print out an error
  else {
    Serial.println("Error! Invalid move!");
  }
}

void loop() {
  // put your main code here, to run repeatedly:

}
