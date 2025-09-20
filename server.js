const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.static('.'));

// Serial port configuration
let serialPort = null;
let parser = null;

// Function to connect to Arduino
function connectToArduino(portPath) {
  try {
    // Close existing connection if any
    if (serialPort && serialPort.isOpen) {
      serialPort.close();
    }

    // Create new serial port connection
    serialPort = new SerialPort({
      path: portPath,
      baudRate: 9600,
      autoOpen: false
    });

    // Create parser for reading line by line
    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    // Open the port
    serialPort.open((err) => {
      if (err) {
        console.error('Error opening port:', err.message);
        io.emit('arduino_error', { message: 'Failed to connect to Arduino', error: err.message });
        return;
      }
      console.log(`Connected to Arduino on ${portPath}`);
      io.emit('arduino_connected', { port: portPath, message: 'Arduino connected successfully' });
    });

    // Handle data from Arduino
    parser.on('data', (data) => {
      try {
        // Clean the data and try to parse as JSON
        const cleanData = data.trim();
        console.log('Received from Arduino:', cleanData);
        
        // Try to parse as JSON first
        let parsedData;
        try {
          parsedData = JSON.parse(cleanData);
        } catch (e) {
          // If not JSON, treat as plain text
          parsedData = {
            type: 'message',
            data: cleanData,
            timestamp: new Date().toISOString()
          };
        }

        // Emit to all connected clients
        io.emit('arduino_data', parsedData);
      } catch (error) {
        console.error('Error processing Arduino data:', error);
      }
    });

    // Handle serial port errors
    serialPort.on('error', (err) => {
      console.error('Serial port error:', err);
      io.emit('arduino_error', { message: 'Serial port error', error: err.message });
    });

    // Handle port close
    serialPort.on('close', () => {
      console.log('Arduino disconnected');
      io.emit('arduino_disconnected', { message: 'Arduino disconnected' });
    });

  } catch (error) {
    console.error('Error setting up Arduino connection:', error);
    io.emit('arduino_error', { message: 'Connection setup failed', error: error.message });
  }
}

// Function to get available serial ports
async function getAvailablePorts() {
  try {
    const ports = await SerialPort.list();
    return ports;
  } catch (error) {
    console.error('Error listing ports:', error);
    return [];
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/arduino-unified.html');
});

app.get('/hub', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/general', (req, res) => {
  res.sendFile(__dirname + '/arduino-dashboard.html');
});

app.get('/morse', (req, res) => {
  res.sendFile(__dirname + '/morse-dashboard.html');
});

// Direct file access routes (for static hosting compatibility)
app.get('/arduino-dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/arduino-dashboard.html');
});

app.get('/morse-dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/morse-dashboard.html');
});

app.get('/api/ports', async (req, res) => {
  try {
    const ports = await getAvailablePorts();
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current Arduino status
  if (serialPort && serialPort.isOpen) {
    socket.emit('arduino_connected', { 
      port: serialPort.path, 
      message: 'Arduino already connected' 
    });
  } else {
    socket.emit('arduino_disconnected', { message: 'Arduino not connected' });
  }

  // Handle Arduino connection request
  socket.on('connect_arduino', (data) => {
    const { port } = data;
    if (port) {
      connectToArduino(port);
    }
  });

  // Handle Arduino disconnection request
  socket.on('disconnect_arduino', () => {
    if (serialPort && serialPort.isOpen) {
      serialPort.close();
    }
  });

  // Handle sending data to Arduino
  socket.on('send_to_arduino', (data) => {
    if (serialPort && serialPort.isOpen) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      serialPort.write(message + '\n', (err) => {
        if (err) {
          console.error('Error sending to Arduino:', err);
          socket.emit('arduino_error', { message: 'Failed to send data to Arduino', error: err.message });
        } else {
          console.log('Sent to Arduino:', message);
          socket.emit('data_sent', { message: 'Data sent to Arduino successfully' });
        }
      });
    } else {
      socket.emit('arduino_error', { message: 'Arduino not connected' });
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Allow connections from any IP

server.listen(PORT, HOST, () => {
  console.log('='.repeat(60));
  console.log('🚀 Arduino Web Communication System Ready!');
  console.log('='.repeat(60));
  console.log(`📡 Server running on:`);
  console.log(`   • Local: http://localhost:${PORT}`);
  console.log(`   • Network: http://[YOUR_IP]:${PORT}`);
  console.log('='.repeat(60));
  console.log('🌐 Multi-User Access:');
  console.log('   • You can connect from this computer');
  console.log('   • Your friend can connect from their computer');
  console.log('   • Each person can connect their own Arduino');
  console.log('='.repeat(60));
  console.log('📋 Available Pages:');
  console.log(`   • Main Interface: http://localhost:${PORT}/`);
  console.log(`   • Hub: http://localhost:${PORT}/hub`);
  console.log(`   • General Dashboard: http://localhost:${PORT}/general`);
  console.log(`   • Morse Code Dashboard: http://localhost:${PORT}/morse`);
  console.log('='.repeat(60));
  console.log('⚠️  Note: Make sure Windows Firewall allows this connection');
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  if (serialPort && serialPort.isOpen) {
    serialPort.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
