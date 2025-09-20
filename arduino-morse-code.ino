/*
 * Arduino Morse Code System
 * 
 * Hardware Setup:
 * - Button 1 (Dot): Pin 2 - sends "." when pressed
 * - Button 2 (Dash): Pin 3 - sends "-" when pressed  
 * - Button 3 (End): Pin 4 - single click ends letter, double click ends word, triple click sends
 * - Blue LED (Dot): Pin 13 - blinks for dots
 * - Red LED (Dash): Pin 9 - blinks for dashes
 * 
 * Features:
 * - Real-time Morse code input
 * - Visual feedback with LEDs
 * - Letter/word/send functionality
 * - Web dashboard integration
 */

// Pin definitions
#define DOT_BUTTON_PIN 2
#define DASH_BUTTON_PIN 3
#define END_BUTTON_PIN 4
#define BLUE_LED_PIN 13    // Dot LED
#define RED_LED_PIN 9      // Dash LED

// Button state tracking
bool dotButtonPressed = false;
bool dashButtonPressed = false;
bool endButtonPressed = false;

bool lastDotButtonState = HIGH;
bool lastDashButtonState = HIGH;
bool lastEndButtonState = HIGH;

// Debouncing
unsigned long lastDotDebounceTime = 0;
unsigned long lastDashDebounceTime = 0;
unsigned long lastEndDebounceTime = 0;
const unsigned long debounceDelay = 50;

// End button click tracking
unsigned long lastEndClickTime = 0;
int endClickCount = 0;
const unsigned long clickTimeout = 500; // 500ms to register multiple clicks

// Morse code buffer
String currentLetter = "";
String currentWord = "";
String morseBuffer = "";

// LED timing
unsigned long ledStartTime = 0;
bool ledActive = false;
int ledType = 0; // 0 = none, 1 = dot, 2 = dash

void setup() {
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(DOT_BUTTON_PIN, INPUT_PULLUP);
  pinMode(DASH_BUTTON_PIN, INPUT_PULLUP);
  pinMode(END_BUTTON_PIN, INPUT_PULLUP);
  pinMode(BLUE_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  
  // Turn off LEDs initially
  digitalWrite(BLUE_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  
  // Send startup message
  sendMorseData("status", "Morse Code System Ready");
  
  // Blink both LEDs to indicate ready
  blinkLEDs(3, 200);
}

void loop() {
  // --- TESTE: imprimir estado dos botões ---
  int dotReading = digitalRead(DOT_BUTTON_PIN);
  int dashReading = digitalRead(DASH_BUTTON_PIN);
  int endReading = digitalRead(END_BUTTON_PIN);

  Serial.print("Dot: ");  Serial.print(dotReading);
  Serial.print(" | Dash: "); Serial.print(dashReading);
  Serial.print(" | End: ");  Serial.println(endReading);
  // HIGH = não pressionado, LOW = pressionado

  // --- Código original ---
  handleDotButton();
  handleDashButton();
  handleEndButton();
  
  handleLEDs();
  handleSerialCommands();

  static unsigned long lastStatus = 0;
  if (millis() - lastStatus > 10000) { // Every 10 seconds
    sendMorseData("heartbeat", "System active - " + String(millis() / 1000) + "s uptime");
    lastStatus = millis();
  }
  
  delay(200); // um pouco maior para enxergar as leituras no Serial Monitor

}

void handleDotButton() {
  int reading = digitalRead(DOT_BUTTON_PIN);
  
  if (reading != lastDotButtonState) {
    lastDotDebounceTime = millis();
  }
  
  if ((millis() - lastDotDebounceTime) > debounceDelay) {
    if (reading == LOW && !dotButtonPressed) {
      dotButtonPressed = true;
      addDot();
    } else if (reading == HIGH && dotButtonPressed) {
      dotButtonPressed = false;
    }
  }
  
  lastDotButtonState = reading;
}

void handleDashButton() {
  int reading = digitalRead(DASH_BUTTON_PIN);
  
  if (reading != lastDashButtonState) {
    lastDashDebounceTime = millis();
  }
  
  if ((millis() - lastDashDebounceTime) > debounceDelay) {
    if (reading == LOW && !dashButtonPressed) {
      dashButtonPressed = true;
      addDash();
    } else if (reading == HIGH && dashButtonPressed) {
      dashButtonPressed = false;
    }
  }
  
  lastDashButtonState = reading;
}

void handleEndButton() {
  int reading = digitalRead(END_BUTTON_PIN);
  
  if (reading != lastEndButtonState) {
    lastEndDebounceTime = millis();
  }
  
  if ((millis() - lastEndDebounceTime) > debounceDelay) {
    if (reading == LOW && !endButtonPressed) {
      endButtonPressed = true;
      endButtonPressed = false; // Reset immediately for multiple clicks
      
      unsigned long currentTime = millis();
      
      if (currentTime - lastEndClickTime < clickTimeout) {
        endClickCount++;
      } else {
        endClickCount = 1;
      }
      
      lastEndClickTime = currentTime;
      
      // Process clicks after timeout
      static unsigned long clickProcessTime = 0;
      clickProcessTime = currentTime + clickTimeout;
      
      // Check for click processing
      if (millis() >= clickProcessTime && endClickCount > 0) {
        processEndClicks(endClickCount);
        endClickCount = 0;
      }
    } else if (reading == HIGH && endButtonPressed) {
      endButtonPressed = false;
    }
  }
  
  lastEndButtonState = reading;
}

void processEndClicks(int clicks) {
  switch (clicks) {
    case 1:
      endLetter();
      break;
    case 2:
      endWord();
      break;
    case 3:
      sendMessage();
      break;
    default:
      // More than 3 clicks - reset everything
      resetMorse();
      break;
  }
}

void addDot() {
  currentLetter += ".";
  morseBuffer += ".";
  activateLED(1); // Blue LED for dot
  sendMorseData("morse_input", "Dot added: " + currentLetter);
}

void addDash() {
  currentLetter += "-";
  morseBuffer += "-";
  activateLED(2); // Red LED for dash
  sendMorseData("morse_input", "Dash added: " + currentLetter);
}

void endLetter() {
  if (currentLetter.length() > 0) {
    String decodedLetter = decodeMorseLetter(currentLetter);
    currentWord += decodedLetter;
    
    sendMorseData("letter_complete", "Letter: " + currentLetter + " = " + decodedLetter);
    sendMorseData("word_progress", "Current word: " + currentWord);
    
    currentLetter = "";
  }
}

void endWord() {
  if (currentWord.length() > 0) {
    sendMorseData("word_complete", "Word completed: " + currentWord);
    currentWord += " ";
    currentLetter = "";
  }
}

void sendMessage() {
  if (morseBuffer.length() > 0) {
    String fullMessage = currentWord + currentLetter;
    sendMorseData("message_sent", "Message sent: " + fullMessage);
    sendMorseData("morse_code", morseBuffer);
    sendMorseData("decoded_text", fullMessage);
    
    // Reset everything
    resetMorse();
  } else {
    sendMorseData("error", "No message to send");
  }
}

void resetMorse() {
  currentLetter = "";
  currentWord = "";
  morseBuffer = "";
  sendMorseData("status", "Morse code reset");
}

void activateLED(int type) {
  ledType = type;
  ledStartTime = millis();
  ledActive = true;
  
  if (type == 1) { // Dot
    digitalWrite(BLUE_LED_PIN, HIGH);
  } else if (type == 2) { // Dash
    digitalWrite(RED_LED_PIN, HIGH);
  }
}

void handleLEDs() {
  if (ledActive) {
    unsigned long ledDuration = (ledType == 1) ? 150 : 300; // Dot = 150ms, Dash = 300ms
    
    if (millis() - ledStartTime >= ledDuration) {
      digitalWrite(BLUE_LED_PIN, LOW);
      digitalWrite(RED_LED_PIN, LOW);
      ledActive = false;
      ledType = 0;
    }
  }
}

void blinkLEDs(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BLUE_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(BLUE_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, LOW);
    delay(delayMs);
  }
}

String decodeMorseLetter(String morse) {
  // Morse code alphabet
  if (morse == ".-") return "A";
  else if (morse == "-...") return "B";
  else if (morse == "-.-.") return "C";
  else if (morse == "-..") return "D";
  else if (morse == ".") return "E";
  else if (morse == "..-.") return "F";
  else if (morse == "--.") return "G";
  else if (morse == "....") return "H";
  else if (morse == "..") return "I";
  else if (morse == ".---") return "J";
  else if (morse == "-.-") return "K";
  else if (morse == ".-..") return "L";
  else if (morse == "--") return "M";
  else if (morse == "-.") return "N";
  else if (morse == "---") return "O";
  else if (morse == ".--.") return "P";
  else if (morse == "--.-") return "Q";
  else if (morse == ".-.") return "R";
  else if (morse == "...") return "S";
  else if (morse == "-") return "T";
  else if (morse == "..-") return "U";
  else if (morse == "...-") return "V";
  else if (morse == ".--") return "W";
  else if (morse == "-..-") return "X";
  else if (morse == "-.--") return "Y";
  else if (morse == "--..") return "Z";
  else if (morse == "-----") return "0";
  else if (morse == ".----") return "1";
  else if (morse == "..---") return "2";
  else if (morse == "...--") return "3";
  else if (morse == "....-") return "4";
  else if (morse == ".....") return "5";
  else if (morse == "-....") return "6";
  else if (morse == "--...") return "7";
  else if (morse == "---..") return "8";
  else if (morse == "----.") return "9";
  else if (morse == ".-.-.-") return ".";
  else if (morse == "--..--") return ",";
  else if (morse == "..--..") return "?";
  else if (morse == "-.-.--") return "!";
  else if (morse == "-....-") return "-";
  else if (morse == "-..-.") return "/";
  else if (morse == ".--.-.") return "@";
  else return "?"; // Unknown character
}

void sendMorseData(String type, String message) {
  String jsonData = "{\"type\":\"" + type + "\",\"message\":\"" + message + "\",\"timestamp\":\"" + String(millis()) + "\"}";
  Serial.println(jsonData);
}

// Handle incoming commands from web dashboard
void handleSerialCommands() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "STATUS") {
      sendMorseData("status", "Morse Code System - Current: " + currentWord + currentLetter);
    }
    else if (command == "RESET") {
      resetMorse();
    }
    else if (command == "CLEAR") {
      resetMorse();
    }
    else if (command.startsWith("SEND:")) {
      String message = command.substring(5);
      sendMorseData("message_sent", "Manual send: " + message);
    }
    else {
      sendMorseData("error", "Unknown command: " + command);
    }
  }
}
