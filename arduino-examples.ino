/*
 * Arduino Web Communication Examples
 * 
 * This file contains multiple Arduino sketches for testing communication
 * with the Node.js server and web dashboard.
 * 
 * Choose one of the examples below based on your hardware setup.
 */

// ============================================================================
// EXAMPLE 1: Basic LED Control and Status Reporting
// ============================================================================
// Hardware: Arduino Uno + LED on pin 13
// This example responds to commands and sends status updates

/*
#define LED_PIN 13
#define STATUS_LED_PIN 12

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  
  // Send startup message
  Serial.println("{\"type\":\"status\",\"message\":\"Arduino Ready\",\"timestamp\":\"" + String(millis()) + "\"}");
  
  // Blink status LED to indicate ready
  for(int i = 0; i < 3; i++) {
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(200);
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(200);
  }
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "LED_ON") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("{\"type\":\"led\",\"status\":true,\"message\":\"LED turned ON\"}");
    }
    else if (command == "LED_OFF") {
      digitalWrite(LED_PIN, LOW);
      Serial.println("{\"type\":\"led\",\"status\":false,\"message\":\"LED turned OFF\"}");
    }
    else if (command == "STATUS") {
      Serial.println("{\"type\":\"status\",\"led\":\"" + String(digitalRead(LED_PIN) ? "ON" : "OFF") + "\",\"uptime\":\"" + String(millis()) + "\"}");
    }
    else if (command == "RESET") {
      Serial.println("{\"type\":\"status\",\"message\":\"Arduino Reset\",\"timestamp\":\"" + String(millis()) + "\"}");
    }
    else {
      Serial.println("{\"type\":\"error\",\"message\":\"Unknown command: " + command + "\"}");
    }
  }
  
  // Send periodic status updates every 5 seconds
  static unsigned long lastStatus = 0;
  if (millis() - lastStatus > 5000) {
    Serial.println("{\"type\":\"heartbeat\",\"uptime\":\"" + String(millis()) + "\",\"free_memory\":\"" + String(freeMemory()) + "\"}");
    lastStatus = millis();
  }
  
  delay(100);
}

// Function to get free memory (for Arduino Uno)
int freeMemory() {
  char top;
  return &top - reinterpret_cast<char*>(sbrk(0));
}
*/

// ============================================================================
// EXAMPLE 2: Temperature and Humidity Sensor (DHT22)
// ============================================================================
// Hardware: Arduino Uno + DHT22 sensor on pin 2
// This example reads sensor data and sends it to the web dashboard

/*
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22
#define LED_PIN 13

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  dht.begin();
  
  Serial.println("{\"type\":\"status\",\"message\":\"DHT22 Sensor Ready\",\"timestamp\":\"" + String(millis()) + "\"}");
}

void loop() {
  // Read sensor data
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Check if readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("{\"type\":\"error\",\"message\":\"Failed to read DHT sensor\"}");
  } else {
    // Send temperature data
    Serial.println("{\"type\":\"temperature\",\"value\":" + String(temperature, 1) + ",\"unit\":\"C\"}");
    
    // Send humidity data
    Serial.println("{\"type\":\"humidity\",\"value\":" + String(humidity, 1) + ",\"unit\":\"%\"}");
    
    // Blink LED to indicate data transmission
    digitalWrite(LED_PIN, HIGH);
    delay(50);
    digitalWrite(LED_PIN, LOW);
  }
  
  // Handle incoming commands
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "GET_TEMP") {
      Serial.println("{\"type\":\"temperature\",\"value\":" + String(temperature, 1) + ",\"unit\":\"C\"}");
    }
    else if (command == "GET_HUMIDITY") {
      Serial.println("{\"type\":\"humidity\",\"value\":" + String(humidity, 1) + ",\"unit\":\"%\"}");
    }
    else if (command == "STATUS") {
      Serial.println("{\"type\":\"status\",\"temperature\":" + String(temperature, 1) + ",\"humidity\":" + String(humidity, 1) + ",\"uptime\":\"" + String(millis()) + "\"}");
    }
  }
  
  delay(2000); // Read every 2 seconds
}
*/

// ============================================================================
// EXAMPLE 3: Multiple Sensors and Actuators
// ============================================================================
// Hardware: Arduino Uno + DHT22 + Light Sensor + Servo + LED
// This example demonstrates a complete sensor/actuator system

/*
#include <DHT.h>
#include <Servo.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22
#define LIGHT_SENSOR_PIN A0
#define SERVO_PIN 9
#define LED_PIN 13
#define BUTTON_PIN 3

DHT dht(DHT_PIN, DHT_TYPE);
Servo servo;

bool ledState = false;
bool lastButtonState = HIGH;
bool currentButtonState = HIGH;
int servoPosition = 0;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  servo.attach(SERVO_PIN);
  dht.begin();
  
  Serial.println("{\"type\":\"status\",\"message\":\"Multi-Sensor System Ready\",\"timestamp\":\"" + String(millis()) + "\"}");
}

void loop() {
  // Read all sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int lightLevel = analogRead(LIGHT_SENSOR_PIN);
  
  // Read button state
  currentButtonState = digitalRead(BUTTON_PIN);
  
  // Send sensor data every 3 seconds
  static unsigned long lastSensorRead = 0;
  if (millis() - lastSensorRead > 3000) {
    if (!isnan(temperature) && !isnan(humidity)) {
      Serial.println("{\"type\":\"temperature\",\"value\":" + String(temperature, 1) + "}");
      Serial.println("{\"type\":\"humidity\",\"value\":" + String(humidity, 1) + "}");
    }
    Serial.println("{\"type\":\"light\",\"value\":" + String(lightLevel) + ",\"percentage\":" + String(map(lightLevel, 0, 1023, 0, 100)) + "}");
    lastSensorRead = millis();
  }
  
  // Handle button press
  if (lastButtonState == HIGH && currentButtonState == LOW) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    Serial.println("{\"type\":\"led\",\"status\":" + String(ledState ? "true" : "false") + ",\"trigger\":\"button\"}");
  }
  lastButtonState = currentButtonState;
  
  // Handle serial commands
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "LED_ON") {
      ledState = true;
      digitalWrite(LED_PIN, HIGH);
      Serial.println("{\"type\":\"led\",\"status\":true,\"message\":\"LED turned ON\"}");
    }
    else if (command == "LED_OFF") {
      ledState = false;
      digitalWrite(LED_PIN, LOW);
      Serial.println("{\"type\":\"led\",\"status\":false,\"message\":\"LED turned OFF\"}");
    }
    else if (command.startsWith("SERVO_")) {
      int angle = command.substring(6).toInt();
      if (angle >= 0 && angle <= 180) {
        servo.write(angle);
        servoPosition = angle;
        Serial.println("{\"type\":\"servo\",\"angle\":" + String(angle) + ",\"message\":\"Servo moved to " + String(angle) + " degrees\"}");
      }
    }
    else if (command == "GET_TEMP") {
      if (!isnan(temperature)) {
        Serial.println("{\"type\":\"temperature\",\"value\":" + String(temperature, 1) + "}");
      }
    }
    else if (command == "GET_HUMIDITY") {
      if (!isnan(humidity)) {
        Serial.println("{\"type\":\"humidity\",\"value\":" + String(humidity, 1) + "}");
      }
    }
    else if (command == "STATUS") {
      Serial.println("{\"type\":\"status\",\"led\":" + String(ledState ? "true" : "false") + ",\"servo\":" + String(servoPosition) + ",\"temperature\":" + String(temperature, 1) + ",\"humidity\":" + String(humidity, 1) + ",\"light\":" + String(lightLevel) + "}");
    }
    else if (command == "RESET") {
      ledState = false;
      digitalWrite(LED_PIN, LOW);
      servo.write(0);
      servoPosition = 0;
      Serial.println("{\"type\":\"status\",\"message\":\"System Reset\",\"timestamp\":\"" + String(millis()) + "\"}");
    }
  }
  
  delay(100);
}
*/

// ============================================================================
// EXAMPLE 4: Simple Data Logger
// ============================================================================
// Hardware: Arduino Uno + any analog sensors
// This example logs data from multiple analog pins

/*
#define SENSOR_PIN_1 A0
#define SENSOR_PIN_2 A1
#define SENSOR_PIN_3 A2
#define LED_PIN 13

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("{\"type\":\"status\",\"message\":\"Data Logger Ready\",\"timestamp\":\"" + String(millis()) + "\"}");
}

void loop() {
  // Read analog sensors
  int sensor1 = analogRead(SENSOR_PIN_1);
  int sensor2 = analogRead(SENSOR_PIN_2);
  int sensor3 = analogRead(SENSOR_PIN_3);
  
  // Send data as JSON
  Serial.println("{\"type\":\"sensor_data\",\"sensor1\":" + String(sensor1) + ",\"sensor2\":" + String(sensor2) + ",\"sensor3\":" + String(sensor3) + ",\"timestamp\":\"" + String(millis()) + "\"}");
  
  // Blink LED to indicate data transmission
  digitalWrite(LED_PIN, HIGH);
  delay(10);
  digitalWrite(LED_PIN, LOW);
  
  // Handle commands
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "STATUS") {
      Serial.println("{\"type\":\"status\",\"sensor1\":" + String(sensor1) + ",\"sensor2\":" + String(sensor2) + ",\"sensor3\":" + String(sensor3) + ",\"uptime\":\"" + String(millis()) + "\"}");
    }
  }
  
  delay(1000); // Log every second
}
*/

// ============================================================================
// EXAMPLE 5: Interactive Control Panel
// ============================================================================
// Hardware: Arduino Uno + Potentiometer + Button + LED + Buzzer
// This example creates an interactive control panel

/*
#define POT_PIN A0
#define BUTTON_PIN 2
#define LED_PIN 13
#define BUZZER_PIN 8

bool ledState = false;
bool lastButtonState = HIGH;
bool currentButtonState = HIGH;
int lastPotValue = 0;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  Serial.println("{\"type\":\"status\",\"message\":\"Interactive Control Panel Ready\",\"timestamp\":\"" + String(millis()) + "\"}");
}

void loop() {
  // Read potentiometer
  int potValue = analogRead(POT_PIN);
  int potPercentage = map(potValue, 0, 1023, 0, 100);
  
  // Send potentiometer data if it changed significantly
  if (abs(potValue - lastPotValue) > 10) {
    Serial.println("{\"type\":\"potentiometer\",\"value\":" + String(potValue) + ",\"percentage\":" + String(potPercentage) + "}");
    lastPotValue = potValue;
  }
  
  // Read button
  currentButtonState = digitalRead(BUTTON_PIN);
  
  // Handle button press
  if (lastButtonState == HIGH && currentButtonState == LOW) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    
    // Beep buzzer
    tone(BUZZER_PIN, 1000, 100);
    
    Serial.println("{\"type\":\"button\",\"pressed\":true,\"led_state\":" + String(ledState ? "true" : "false") + "}");
  }
  lastButtonState = currentButtonState;
  
  // Handle serial commands
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "LED_ON") {
      ledState = true;
      digitalWrite(LED_PIN, HIGH);
      Serial.println("{\"type\":\"led\",\"status\":true,\"message\":\"LED turned ON\"}");
    }
    else if (command == "LED_OFF") {
      ledState = false;
      digitalWrite(LED_PIN, LOW);
      Serial.println("{\"type\":\"led\",\"status\":false,\"message\":\"LED turned OFF\"}");
    }
    else if (command == "BEEP") {
      tone(BUZZER_PIN, 1000, 200);
      Serial.println("{\"type\":\"buzzer\",\"message\":\"Beep!\"}");
    }
    else if (command == "STATUS") {
      Serial.println("{\"type\":\"status\",\"led\":" + String(ledState ? "true" : "false") + ",\"potentiometer\":" + String(potValue) + ",\"pot_percentage\":" + String(potPercentage) + ",\"uptime\":\"" + String(millis()) + "\"}");
    }
  }
  
  delay(50);
}
*/

// ============================================================================
// INSTRUCTIONS FOR USE:
// ============================================================================
/*
1. Choose one of the examples above based on your hardware
2. Uncomment the code for your chosen example (remove /* and */)
3. Comment out or delete the other examples
4. Upload the code to your Arduino
5. Make sure the baud rate is set to 9600
6. Connect your Arduino to your computer via USB
7. Run the Node.js server: npm start
8. Open http://localhost:3000 in your browser
9. Select your Arduino's COM port and click Connect
10. Start sending commands and receiving data!

HARDWARE CONNECTIONS:

Example 1 (Basic LED):
- LED + resistor (220Ω) connected to pin 13
- Optional: Second LED on pin 12

Example 2 (DHT22):
- DHT22 VCC to 5V
- DHT22 GND to GND
- DHT22 DATA to pin 2
- LED on pin 13

Example 3 (Multi-Sensor):
- DHT22: VCC→5V, GND→GND, DATA→pin 2
- Light sensor: One leg to A0, other to GND
- Servo: VCC→5V, GND→GND, Signal→pin 9
- LED on pin 13
- Button: One leg to pin 3, other to GND

Example 4 (Data Logger):
- Any analog sensors connected to A0, A1, A2
- LED on pin 13

Example 5 (Control Panel):
- Potentiometer: Outer legs to 5V and GND, middle to A0
- Button: One leg to pin 2, other to GND
- LED on pin 13
- Buzzer: Positive to pin 8, negative to GND

TROUBLESHOOTING:
- Make sure Arduino is connected and recognized by your computer
- Check that the correct COM port is selected
- Verify the baud rate is 9600
- Check serial monitor in Arduino IDE to see if data is being sent
- Ensure all hardware connections are secure
*/
