// Unchangeable variables
const int pulsesPerRotation = 200; // 360 degrees
const int pulseDelay = 450; // The delay between HIGH and LOW, in microseconds
const int moveDelay = 2000; // The delay between each move, in milliseconds

// Structs
struct Stepper {
  int stepPin;
  int dirPin;
  int enPin;
};

// Changeable variables
Stepper motor; // The stepper that will be used for the moves
boolean found; // Whether a stepper was found or not

// Setup the steppers
Stepper DownStepper = {1, 2, 3};
Stepper FrontStepper = {4, 5, 6};
Stepper BackStepper = {7, 8, 9};
Stepper RightStepper = {10, 11, 12};
Stepper LeftStepper = {14, 15, 16};
Stepper MoveStepper = {17, 18, 19};

// Setup Websockets
#include <ArduinoWebsockets.h>
#include <ESP8266WiFi.h>

const char* ssid = "Yeet"; // WiFi SSID
const char* password = "HvadMedNej?"; // WiFi Password
const char* websockets_server = "ws://play.nfs.codes:8080"; //server adress and port

using namespace websockets;

void onMessageCallback(WebsocketsMessage message) {
    Serial.print("Got Message: ");
    Serial.println(message.data());

    
}

void onEventsCallback(WebsocketsEvent event, String data) {
    if(event == WebsocketsEvent::ConnectionOpened) {
        Serial.println("Connnection Opened");
    } else if(event == WebsocketsEvent::ConnectionClosed) {
        Serial.println("Connnection Closed");
    } else if(event == WebsocketsEvent::GotPing) {
        Serial.println("Got a Ping!");
    } else if(event == WebsocketsEvent::GotPong) {
        Serial.println("Got a Pong!");
    }
}

WebsocketsClient client;

void logMessage(String message) {
  Serial.println(message);
  client.send("Log: " + message);
}

void setup() {
  // Setup the serial port, and set the data rate to 9600 bps (for serial monitor)
  Serial.begin(9600);

  // Setup all the steppers' pins as output
  pinMode(DownStepper.stepPin, OUTPUT);
  pinMode(DownStepper.dirPin, OUTPUT);
  pinMode(DownStepper.enPin, OUTPUT);
  pinMode(FrontStepper.stepPin, OUTPUT);
  pinMode(FrontStepper.dirPin, OUTPUT);
  pinMode(FrontStepper.enPin, OUTPUT);
  pinMode(BackStepper.stepPin, OUTPUT);
  pinMode(BackStepper.dirPin, OUTPUT);
  pinMode(BackStepper.enPin, OUTPUT);
  pinMode(RightStepper.stepPin, OUTPUT);
  pinMode(RightStepper.dirPin, OUTPUT);
  pinMode(RightStepper.enPin, OUTPUT);
  pinMode(LeftStepper.stepPin, OUTPUT);
  pinMode(LeftStepper.dirPin, OUTPUT);
  pinMode(LeftStepper.enPin, OUTPUT);
  pinMode(MoveStepper.stepPin, OUTPUT);
  pinMode(MoveStepper.dirPin, OUTPUT);
  pinMode(MoveStepper.enPin, OUTPUT);

  // Setup the WebSocket Client
  WiFi.begin(ssid, password); // Connect to WiFi

  // Wait some time to connect to wifi
  for(int i = 0; i < 10 && WiFi.status() != WL_CONNECTED; i++) {
      Serial.print(".");
      delay(1000);
  }

  // Setup Callbacks
  client.onMessage(onMessageCallback);
  client.onEvent(onEventsCallback);
  
  // Connect to server
  client.connect(websockets_server);

  client.send("Startup done, waiting 500ms!");
  Serial.println("Startup done, waiting 500 ms!");
  delay(500);
}

void doRotation(Stepper motor, int degrees) {
  // Rotate it the designated amount of degrees
  for(int x = 0; x < pulsesPerRotation/360*degrees; x++){
    digitalWrite(motor.stepPin, HIGH); 
    delayMicroseconds(pulseDelay); 
    digitalWrite(motor.stepPin, LOW); 
    delayMicroseconds(pulseDelay); 
  }
}

void move(String notation) {
  // Find the stepper from notation
  found = true;
  if (notation.indexOf("D")) {
    motor = DownStepper;
  }
  else if (notation.indexOf("R")) {
    motor = RightStepper;
  }
  else if (notation.indexOf("L")) {
    motor = LeftStepper;
  }
  else if (notation.indexOf("F")) {
    motor = FrontStepper;
  }
  else if (notation.indexOf("B")) {
    motor = BackStepper;
  }
  else {
    Serial.println("Error, notation motor not found!");
    found = false;
  }

  // Do the designated move
  if (found) {
    if (notation.indexOf("'")) {
      digitalWrite(motor.dirPin, LOW);
      doRotation(motor, 90);
      digitalWrite(motor.dirPin, HIGH);
    }
    else if (notation.indexOf("2")) {
      doRotation(motor, 180);
    }
    else {
      doRotation(motor, 90);
    }

    // Do delay after move
    delay(moveDelay);
  }
}

void loop() {
  // Keep client connection open
  client.poll();
}
