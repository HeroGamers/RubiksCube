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
Stepper MoveStepper = {17, 20, 21};

// Import libraries for the ESP module and websockets
#include <WiFiEsp.h>
#include <ArduinoHttpClient.h>

// Emulate Serial1 on pins 6/7 if not present
#ifndef HAVE_HWSERIAL1
#include "SoftwareSerial.h"
SoftwareSerial Serial1(19, 18); // RX1, TX1
#endif

// Sensitive data is put into here - variables are NW_SSID, NW_PASS, WS_PORT and WS_ADDRESS
#include "secrets.h"

const char ssid[] = NW_SSID; // WiFi SSID
const char password[] = NW_PASS; // WiFi Password
const char websocket_address[] = WS_ADDRESS; // WS Address
const int websocket_port = WS_PORT; // WS Port
int status = WL_IDLE_STATUS; // the current WiFi Status

// Client objects
WiFiEspClient WifiClient;
WebSocketClient client = WebSocketClient(WifiClient, websocket_address, websocket_port);

void logMessage(String message) {
  Serial.println(message);
  client.println("Log: " + message);
}

void setup() {
  // Setup the serial port, and set the data rate to 9600 bps (for serial monitor)
  Serial.begin(9600);
  // initialize serial for ESP module
  Serial1.begin(115200);

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

  // Setup the WiFi Client
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

  // we're connected now, so print out the data
  Serial.println("You're connected to the network");
  
  printWifiStatus();

  Serial.println();

  Serial.println("Startup done, waiting 500 ms!");
  delay(500);
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
  Serial.println("Starting WebSocket client");
  client.begin();

  while (client.connected()) {
    Serial.println("Sending hello");

    // send a hello #
    client.beginMessage(TYPE_TEXT);
    client.print("hello");
    client.endMessage();

    // check if a message is available to be received
    int messageSize = client.parseMessage();

    if (messageSize > 0) {
      Serial.println("Received a message:");
      Serial.println(client.readString());
    }

    // wait 5 seconds
    delay(5000);
  }

  Serial.println("Disconnected from the WebSocket Client, waiting 3 seconds...");
  delay(3000);
}
