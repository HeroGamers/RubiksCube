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
#include <WiFiEsp.h>

// Emulate Serial1 on pins 6/7 if not present
#ifndef HAVE_HWSERIAL1
#include "SoftwareSerial.h"
SoftwareSerial Serial1(19, 18); // RX1, TX1
#endif

const char ssid = "Yeet"; // WiFi SSID
const char password = "HvadMedNej?"; // WiFi Password
const char websockets_server = "ws://play.nfs.codes:8080"; // server adress and port
int status = WL_IDLE_STATUS;     // the Wifi radio's status

char server[] = "arduino.cc";

// Client object
WiFiEspClient client;

void logMessage(String message) {
  Serial.println(message);
  client.println("Log: " + message);
}

void setup() {
  // Setup the serial port, and set the data rate to 115200 bps (for serial monitor)
  Serial.begin(115200);
  // initialize serial for ESP module
  Serial1.begin(9600);

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
  WiFi.init(&Serial1);
  WiFi.begin(ssid, password); // Connect to WiFi

  // check for the presence of the shield
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue
    while (true);
  }

  // attempt to connect to WiFi network
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network
    status = WiFi.begin(ssid, password);
  }

  // you're connected now, so print out the data
  Serial.println("You're connected to the network");
  
  printWifiStatus();

  Serial.println();
  Serial.println("Starting connection to server...");
  // if you get a connection, report back via serial
  if (client.connect(server, 80)) {
    Serial.println("Connected to server");
    // Make a HTTP request
    client.println("GET /asciilogo.txt HTTP/1.1");
    client.println("Host: arduino.cc");
    client.println("Connection: close");
    client.println();
  }

  client.println("Startup done, waiting 500ms!");
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

void loop()
{
  // if there are incoming bytes available
  // from the server, read them and print them
  while (client.available()) {
    char c = client.read();
    Serial.write(c);
  }

  // if the server's disconnected, stop the client
  if (!client.connected()) {
    Serial.println();
    Serial.println("Disconnecting from server...");
    client.stop();

    // do nothing forevermore
    while (true);
  }
}


void printWifiStatus()
{
  // print the SSID of the network you're attached to
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength
  long rssi = WiFi.RSSI();
  Serial.print("Signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}
