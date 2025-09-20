# Arduino Morse Code System Setup

## 🔌 Hardware Wiring

### Required Components:
- Arduino Uno/Nano
- 3x Push buttons
- 2x LEDs (Blue and Red)
- 3x 220Ω resistors
- Jumper wires
- Breadboard

### Wiring Diagram:
```
Arduino Uno Pinout:
                    ┌─────────────┐
                    │    Arduino  │
                    │     Uno     │
                    └─────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    │                    │                    │
   Pin 2              Pin 3              Pin 4
    │                    │                    │
    │                    │                    │
   [Button]            [Button]            [Button]
   (DOT)               (DASH)              (END)
    │                    │                    │
    │                    │                    │
   GND                  GND                  GND
    │                    │                    │
    │                    │                    │
   Pin 13             Pin 9                  │
    │                    │                    │
    │                    │                    │
   [220Ω]              [220Ω]                │
    │                    │                    │
    │                    │                    │
   [Blue LED]          [Red LED]             │
    │                    │                    │
    │                    │                    │
   GND                  GND                  │
```

### Detailed Connections:

**Buttons (all with pull-up resistors):**
- Dot Button: Pin 2 → Button → GND
- Dash Button: Pin 3 → Button → GND  
- End Button: Pin 4 → Button → GND

**LEDs:**
- Blue LED (Dot): Pin 13 → 220Ω resistor → LED anode → LED cathode → GND
- Red LED (Dash): Pin 9 → 220Ω resistor → LED anode → LED cathode → GND

## 📱 Software Setup

### 1. Upload Arduino Code
```bash
# Open arduino-morse-code.ino in Arduino IDE
# Select your board and port
# Upload the code
```

### 2. Start Node.js Server
```bash
npm start
```

### 3. Open Morse Dashboard
Navigate to: `http://localhost:3000/morse`

## 🎮 How to Use

### Button Functions:
- **Dot Button**: Press to add "." to current letter
- **Dash Button**: Press to add "-" to current letter
- **End Button**:
  - 1 click: Complete current letter
  - 2 clicks: Complete current word
  - 3 clicks: Send entire message

### LED Indicators:
- **Blue LED**: Blinks when dot is added
- **Red LED**: Blinks when dash is added

### Web Dashboard Features:
- Real-time Morse code display
- Letter and word translation
- Message history
- Morse code reference chart
- LED status indicators

## 🔧 Troubleshooting

### Common Issues:

**Buttons not responding:**
- Check wiring connections
- Verify pull-up resistors are working
- Test with multimeter

**LEDs not lighting:**
- Check LED polarity (anode/cathode)
- Verify resistor values (220Ω)
- Test with simple blink sketch

**Web dashboard not connecting:**
- Ensure Arduino is connected via USB
- Check correct COM port is selected
- Verify baud rate is 9600

**Morse code not translating:**
- Check JSON format in Serial Monitor
- Verify button debouncing
- Test with known Morse patterns

## 📊 Testing

### Basic Test Sequence:
1. Press Dot button → Blue LED should blink
2. Press Dash button → Red LED should blink
3. Press End button once → Letter should complete
4. Press End button twice → Word should complete
5. Press End button three times → Message should send

### Morse Code Examples:
- "SOS" = ... --- ...
- "HELLO" = .... . .-.. .-.. ---
- "TEST" = - . ... -

## 🎯 Advanced Features

### Custom Commands:
Send via web dashboard:
- `STATUS` - Get current system status
- `RESET` - Reset Morse code buffer
- `CLEAR` - Clear all data

### Message Export:
- Click "Export" to download message history
- Messages saved as timestamped text file

## 📚 Morse Code Reference

### Alphabet:
A: .-    B: -...  C: -.-.  D: -..   E: .     F: ..-.
G: --.   H: ....  I: ..    J: .---  K: -.-   L: .-..
M: --    N: -.    O: ---   P: .--.  Q: --.-  R: .-.
S: ...   T: -     U: ..-   V: ...-  W: .--   X: -..-
Y: -.--  Z: --..

### Numbers:
0: -----  1: .----  2: ..---  3: ...--  4: ....-
5: .....  6: -....  7: --...  8: ---..  9: ----.

### Punctuation:
. (period): .-.-.-
, (comma): --..--
? (question): ..--..
! (exclamation): -.-.--
- (hyphen): -....-
/ (slash): -..-.
@ (at): .--.-.
