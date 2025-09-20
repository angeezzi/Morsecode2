# Setup Guide - Arduino Web Communication System

This guide will walk you through setting up the complete Arduino-to-web communication system step by step.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** installed (version 14 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- [ ] **Arduino IDE** installed
  - Download from [arduino.cc](https://www.arduino.cc/en/software)
- [ ] **Arduino board** (Uno, Nano, Mega, etc.)
- [ ] **USB cable** to connect Arduino to computer
- [ ] **Basic electronic components** (LEDs, resistors, sensors - depending on example chosen)

## 🚀 Step-by-Step Setup

### Step 1: Download and Extract Project

1. Download or clone this project to your computer
2. Extract to a folder (e.g., `C:\arduino-web-communication\` or `~/arduino-web-communication/`)

### Step 2: Install Node.js Dependencies

1. Open terminal/command prompt in the project folder
2. Run the installation command:

```bash
npm install
```

**Expected output:**
```
added 1234 packages in 45s
```

### Step 3: Choose Arduino Example

Open `arduino-examples.ino` in Arduino IDE and choose one example:

#### Option A: Basic LED Control (Easiest)
- **Hardware needed**: Arduino + LED + 220Ω resistor
- **Connections**: LED anode to pin 13, cathode through resistor to GND
- **Uncomment**: Lines 15-75 in the Arduino file

#### Option B: Temperature Sensor (DHT22)
- **Hardware needed**: Arduino + DHT22 sensor
- **Connections**: 
  - DHT22 VCC → 5V
  - DHT22 GND → GND  
  - DHT22 DATA → Pin 2
- **Uncomment**: Lines 80-130 in the Arduino file
- **Install library**: In Arduino IDE, go to Tools → Manage Libraries → Search "DHT" → Install "DHT sensor library"

#### Option C: Multi-Sensor System
- **Hardware needed**: Arduino + DHT22 + Light sensor + Servo + LED
- **Connections**: See detailed wiring in the Arduino file
- **Uncomment**: Lines 135-200 in the Arduino file

### Step 4: Upload Arduino Code

1. **Select your Arduino board**:
   - Tools → Board → Arduino Uno (or your specific board)

2. **Select the correct port**:
   - Tools → Port → Select your Arduino's COM port

3. **Upload the code**:
   - Click the Upload button (→) or press Ctrl+U
   - Wait for "Done uploading" message

4. **Test the upload**:
   - Open Serial Monitor (Tools → Serial Monitor)
   - Set baud rate to 9600
   - You should see JSON messages from Arduino

### Step 5: Start the Node.js Server

1. **Open terminal/command prompt** in the project folder
2. **Start the server**:

```bash
npm start
```

**Expected output:**
```
Server running on http://localhost:3000
Arduino Web Communication System Ready!
```

### Step 6: Open Web Dashboard

1. **Open your web browser**
2. **Navigate to**: `http://localhost:3000`
3. **You should see**: The Arduino Web Dashboard

### Step 7: Connect to Arduino

1. **Click "Refresh"** to scan for available ports
2. **Select your Arduino's port** from the dropdown
3. **Click "Connect"**
4. **Verify connection**: Status should show "Connected"

## 🧪 Testing the System

### Test 1: Basic Communication
1. In the web dashboard, type a message in the input field
2. Click "Send" or press Enter
3. Check the data log for confirmation

### Test 2: Quick Commands
1. Click "LED ON" button
2. Verify LED on Arduino turns on
3. Click "LED OFF" button
4. Verify LED turns off

### Test 3: Data Reception
1. If using sensor example, you should see data appearing in the dashboard
2. Check sensor values are updating
3. Verify timestamps are current

## 🔧 Troubleshooting Common Issues

### Issue: "npm install" fails
**Solutions:**
- Update Node.js to latest version
- Clear npm cache: `npm cache clean --force`
- Try: `npm install --legacy-peer-deps`

### Issue: Arduino not detected
**Solutions:**
- Check USB connection
- Install Arduino drivers
- Try different USB port
- Restart computer

### Issue: "Port not found" error
**Solutions:**
- Close Arduino IDE (it locks the port)
- Unplug and reconnect Arduino
- Check Device Manager (Windows) for COM port
- Try different USB cable

### Issue: Web dashboard shows "Not Connected"
**Solutions:**
- Verify correct COM port selected
- Check Arduino is sending data (Serial Monitor)
- Restart the Node.js server
- Check baud rate is 9600

### Issue: No data received
**Solutions:**
- Verify Arduino code is uploaded correctly
- Check Serial Monitor shows data
- Ensure JSON format is correct
- Check browser console for errors

### Issue: Server won't start
**Solutions:**
- Check port 3000 is not in use
- Run as administrator (Windows)
- Try different port: `PORT=3001 npm start`

## 📊 Hardware Wiring Diagrams

### Basic LED Setup
```
Arduino Uno
    Pin 13 ────[220Ω]──── LED(+) 
    GND    ─────────────── LED(-)
```

### DHT22 Temperature Sensor
```
Arduino Uno
    Pin 2  ─────────────── DHT22 DATA
    5V     ─────────────── DHT22 VCC
    GND    ─────────────── DHT22 GND
```

### Light Sensor (LDR)
```
Arduino Uno
    A0     ─────────────── LDR (one leg)
    GND    ─────────────── LDR (other leg)
    5V     ───[10kΩ]────── A0 (pull-up resistor)
```

## 🎯 Next Steps

Once everything is working:

1. **Experiment with different Arduino examples**
2. **Add your own sensors and actuators**
3. **Modify the web dashboard** to display your specific data
4. **Create custom commands** for your Arduino
5. **Deploy to a web server** for remote access

## 📚 Additional Resources

- [Arduino Reference](https://www.arduino.cc/reference/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [SerialPort Documentation](https://serialport.io/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)

## 🆘 Getting Help

If you encounter issues:

1. **Check this troubleshooting guide**
2. **Review the Arduino examples**
3. **Test with the basic LED example first**
4. **Check the browser console** for JavaScript errors
5. **Verify Arduino Serial Monitor** shows data

---

**Happy building! 🚀**
