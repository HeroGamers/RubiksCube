// Unchangeable variables
const int pulsesPerRotation = 200;

// Include step-motor library
struct Stepper {
  int stepPin;
  int dirPin;
  int enPin;
}

// Setup the steppers
Stepper DownStepper = {6, 7, 8};
Stepper FrontStepper = {6, 7, 8};
Stepper BackStepper = {6, 7, 8};
Stepper RightStepper = {6, 7, 8};
Stepper LeftStepper = {6, 7, 8};
Stepper MoveStepper = {6, 7, 8};

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
