# 👥 Setup Instructions for Your Friend

## 📦 What Your Friend Needs to Do

### Step 1: Download the Project
1. **Download** all the project files from your GitHub repository
2. **Extract** them to a folder on their computer
3. **Make sure** all files are in the same folder

### Step 2: Install Node.js
1. **Go to**: https://nodejs.org/
2. **Download** the LTS version (recommended)
3. **Install** Node.js (make sure "Add to PATH" is checked)
4. **Restart** their computer after installation

### Step 3: Install Dependencies
1. **Open** Command Prompt or PowerShell
2. **Navigate** to the project folder:
   ```cmd
   cd "path\to\project\folder"
   ```
3. **Install** dependencies:
   ```cmd
   npm install
   ```

### Step 4: Start the Server
1. **Run** the server:
   ```cmd
   npm start
   ```
2. **Open** browser to: http://localhost:3000

### Step 5: Connect Arduino
1. **Connect** their Arduino to their computer
2. **Select** the correct COM port
3. **Click** "Connect"

## 🌐 Alternative: Use the Demo Version

If your friend doesn't want to install Node.js, they can use the demo version:

1. **Open** `remote-demo.html` in their browser
2. **No installation required**
3. **Simulates Arduino data** for testing
4. **Perfect for learning** the interface

## 📋 Files Your Friend Needs

### Essential Files:
- `package.json` - Dependencies
- `server.js` - Node.js server
- `arduino-dashboard.html` - Main dashboard
- `morse-dashboard.html` - Morse code dashboard
- `arduino-unified.html` - Unified interface
- `remote-demo.html` - Demo version
- `arduino-script.js` - Dashboard logic
- `morse-script.js` - Morse code logic
- `arduino-styles.css` - Styling
- `morse-styles.css` - Morse styling

### Arduino Files:
- `arduino-examples.ino` - Arduino examples
- `arduino-morse-code.ino` - Morse code Arduino code

## 🚀 Quick Start for Your Friend

### Option A: Full Setup (with Arduino)
1. Download project files
2. Install Node.js
3. Run `npm install`
4. Run `npm start`
5. Open http://localhost:3000
6. Connect Arduino

### Option B: Demo Only (no Arduino)
1. Download project files
2. Open `remote-demo.html` in browser
3. Use simulation controls

## 💡 Tips for Your Friend

- **COM ports** will be different on their computer
- **Windows Firewall** might ask for permission
- **Arduino IDE** should be installed for uploading code
- **Check device manager** for COM port numbers
- **Use the test page** (`morse-test.html`) to verify setup

## 🔧 Troubleshooting

### If npm is not recognized:
- Restart computer after Node.js installation
- Check if Node.js is in PATH
- Try running as administrator

### If port doesn't appear:
- Check Arduino is connected
- Look in Device Manager for COM ports
- Try different USB cable/port

### If connection fails:
- Make sure Arduino code is uploaded
- Check baud rate (should be 9600)
- Try different COM port
