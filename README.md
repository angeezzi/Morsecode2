# Arduino Web Communication System

A complete system for real-time communication between Arduino and a web browser through a Node.js server. This project enables bidirectional data exchange, sensor monitoring, and device control through a modern web interface.

## 🚀 Features

- **Real-time Communication**: WebSocket-based communication for instant data exchange
- **Serial Port Management**: Automatic detection and connection to Arduino devices
- **Modern Web Interface**: Responsive dashboard with real-time data visualization
- **Multiple Arduino Examples**: Ready-to-use Arduino sketches for various hardware setups
- **Morse Code System**: Specialized interface for Morse code input and translation
- **Data Logging**: Built-in logging system with export functionality
- **Sensor Monitoring**: Real-time display of temperature, humidity, and other sensor data
- **Device Control**: Send commands to Arduino from the web interface
- **Cross-platform**: Works on Windows, macOS, and Linux

## 📋 Prerequisites

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **Arduino IDE** - [Download here](https://www.arduino.cc/en/software)
- **Arduino Board** (Uno, Nano, Mega, etc.)
- **USB Cable** to connect Arduino to your computer

## 🛠️ Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd arduino-web-communication
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Upload Arduino code**
   - Open `arduino-examples.ino` in Arduino IDE
   - Choose one of the example sketches based on your hardware
   - Upload the code to your Arduino board

## 🚀 Quick Start

### Option 1: Local Development (Full Functionality)
1. **Start the Node.js server**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`

2. **Open the unified interface**
   - Open your browser and go to `http://localhost:3000`
   - Use the toggle buttons to switch between General Dashboard and Morse Code System

3. **Connect to Arduino**
   - Click "Refresh" to scan for available ports
   - Select your Arduino's COM port from the dropdown
   - Click "Connect" to establish communication

4. **Start communicating**
   - **Toggle between modes** using the buttons at the top
   - **General Dashboard**: Send commands, monitor sensors, view real-time data
   - **Morse Code System**: Use buttons to input Morse code, see real-time translation

### Option 2: Static Hosting (Demo Only)
- For GitHub Pages or static hosting, use `arduino-unified.html` as your main page
- This provides a demonstration interface but requires local server for Arduino communication
- Alternative: Use `static-demo.html` for a simple demo page

## 📁 Project Structure

```
arduino-web-communication/
├── server.js                 # Node.js server with serial communication
├── package.json              # Project dependencies and scripts
├── arduino-unified.html      # Main unified interface (default)
├── index.html                # Hub page for choosing interface
├── arduino-dashboard.html    # General Arduino dashboard
├── arduino-styles.css        # General dashboard styling
├── arduino-script.js         # General dashboard JavaScript
├── morse-dashboard.html      # Morse code dashboard
├── morse-styles.css          # Morse code dashboard styling
├── morse-script.js           # Morse code dashboard JavaScript
├── arduino-examples.ino      # General Arduino code examples
├── arduino-morse-code.ino    # Morse code Arduino sketch
├── MORSE-SETUP.md            # Morse code setup instructions
└── README.md                 # This documentation
```

## 🔧 Hardware Examples

### Example 1: Basic LED Control
**Hardware**: Arduino Uno + LED
- LED connected to pin 13
- Responds to LED_ON/LED_OFF commands
- Sends status updates

### Example 2: Temperature & Humidity Sensor
**Hardware**: Arduino Uno + DHT22 sensor
- DHT22 connected to pin 2
- Sends temperature and humidity data
- Responds to sensor queries

### Example 3: Multi-Sensor System
**Hardware**: Arduino Uno + DHT22 + Light Sensor + Servo + LED
- Complete sensor/actuator system
- Multiple data streams
- Complex device control

### Example 4: Data Logger
**Hardware**: Arduino Uno + Analog sensors
- Reads multiple analog inputs
- Logs data continuously
- Simple data collection

### Example 5: Interactive Control Panel
**Hardware**: Arduino Uno + Potentiometer + Button + LED + Buzzer
- Interactive controls
- Real-time feedback
- Multiple input methods

### Example 6: Morse Code System
**Hardware**: Arduino Uno + 3 Buttons + 2 LEDs (Blue & Red)
- Dot button for "." input
- Dash button for "-" input  
- End button for letter/word/message completion
- Real-time Morse code translation
- Visual LED feedback

## 📡 Communication Protocol

### Data Format
The system uses JSON format for structured communication:

```json
{
  "type": "temperature",
  "value": 23.5,
  "unit": "C",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Supported Commands
- `LED_ON` - Turn LED on
- `LED_OFF` - Turn LED off
- `GET_TEMP` - Get temperature reading
- `GET_HUMIDITY` - Get humidity reading
- `STATUS` - Get device status
- `RESET` - Reset device

### Data Types
- `temperature` - Temperature readings
- `humidity` - Humidity readings
- `led` - LED status
- `status` - Device status
- `error` - Error messages
- `heartbeat` - Periodic status updates

## 🎛️ Web Dashboard Features

### Connection Panel
- Port selection and management
- Connection status indicator
- Connect/disconnect controls

### Real-time Data Display
- Live message display
- Message counter
- Connection timer
- Sensor value visualization

### Data Logging
- Real-time log display
- Log filtering by type
- Export functionality
- Timestamp tracking

### Device Control
- Text-based command sending
- Quick command buttons
- Command history
- Status feedback

## 🔧 Configuration

### Server Configuration
Edit `server.js` to modify:
- Port number (default: 3000)
- Serial baud rate (default: 9600)
- WebSocket settings

### Arduino Configuration
Modify the Arduino examples to:
- Change pin assignments
- Add new sensors
- Implement custom commands
- Adjust data transmission rates

## 🐛 Troubleshooting

### Common Issues

**Arduino not detected:**
- Check USB connection
- Verify Arduino drivers are installed
- Try different USB port
- Restart the server

**Connection fails:**
- Ensure correct COM port is selected
- Check baud rate matches (9600)
- Verify Arduino code is uploaded
- Check serial monitor in Arduino IDE

**No data received:**
- Verify Arduino is sending data
- Check serial connection
- Ensure JSON format is correct
- Check browser console for errors

**Web dashboard not loading:**
- Ensure server is running
- Check port 3000 is available
- Verify all files are present
- Check browser compatibility

### Debug Mode
Enable debug logging by adding to `server.js`:
```javascript
console.log('Debug: Received data:', data);
```

## 📚 API Reference

### Server Endpoints
- `GET /` - Serve the web dashboard
- `GET /api/ports` - Get available serial ports

### WebSocket Events
- `connect_arduino` - Connect to Arduino
- `disconnect_arduino` - Disconnect from Arduino
- `send_to_arduino` - Send data to Arduino
- `arduino_data` - Receive data from Arduino
- `arduino_connected` - Arduino connection established
- `arduino_disconnected` - Arduino disconnected
- `arduino_error` - Arduino communication error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [SerialPort](https://serialport.io/) for Node.js serial communication
- [Socket.IO](https://socket.io/) for real-time web communication
- [Express.js](https://expressjs.com/) for the web server
- Arduino community for inspiration and examples

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the Arduino examples
- Test with basic LED example first

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Show your support

Give a ⭐️ if this project helped you!

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/arduino-web-communication)
![GitHub issues](https://img.shields.io/github/issues/yourusername/arduino-web-communication)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/arduino-web-communication)
![GitHub stars](https://img.shields.io/github/stars/yourusername/arduino-web-communication)
![GitHub forks](https://img.shields.io/github/forks/yourusername/arduino-web-communication)

---

**Happy coding! 🚀**
