class ArduinoDashboard {
    constructor() {
        this.socket = io();
        this.isConnected = false;
        this.messageCount = 0;
        this.connectionStartTime = null;
        this.connectionTimer = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupSocketListeners();
        this.loadAvailablePorts();
    }

    initializeElements() {
        // Connection elements
        this.portSelect = document.getElementById('portSelect');
        this.refreshPortsBtn = document.getElementById('refreshPorts');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.connectionStatus = document.getElementById('connectionStatus');

        // Data display elements
        this.lastMessage = document.getElementById('lastMessage');
        this.messageCountEl = document.getElementById('messageCount');
        this.connectionTime = document.getElementById('connectionTime');

        // Log elements
        this.dataLog = document.getElementById('dataLog');
        this.clearLogBtn = document.getElementById('clearLog');
        this.exportLogBtn = document.getElementById('exportLog');

        // Send elements
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.quickCommandBtns = document.querySelectorAll('.btn-quick');

        // Sensor elements
        this.temperatureValue = document.getElementById('temperatureValue');
        this.humidityValue = document.getElementById('humidityValue');
        this.ledStatus = document.getElementById('ledStatus');
        this.signalStrength = document.getElementById('signalStrength');
    }

    setupEventListeners() {
        // Port selection
        this.portSelect.addEventListener('change', () => {
            this.connectBtn.disabled = !this.portSelect.value;
        });

        // Refresh ports
        this.refreshPortsBtn.addEventListener('click', () => {
            this.loadAvailablePorts();
        });

        // Connection buttons
        this.connectBtn.addEventListener('click', () => {
            this.connectToArduino();
        });

        this.disconnectBtn.addEventListener('click', () => {
            this.disconnectFromArduino();
        });

        // Log controls
        this.clearLogBtn.addEventListener('click', () => {
            this.clearLog();
        });

        this.exportLogBtn.addEventListener('click', () => {
            this.exportLog();
        });

        // Send message
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick commands
        this.quickCommandBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.command;
                this.sendQuickCommand(command);
            });
        });
    }

    setupSocketListeners() {
        // Arduino connection events
        this.socket.on('arduino_connected', (data) => {
            this.handleArduinoConnected(data);
        });

        this.socket.on('arduino_disconnected', (data) => {
            this.handleArduinoDisconnected(data);
        });

        this.socket.on('arduino_error', (data) => {
            this.handleArduinoError(data);
        });

        // Arduino data events
        this.socket.on('arduino_data', (data) => {
            this.handleArduinoData(data);
        });

        this.socket.on('data_sent', (data) => {
            this.addLogEntry('success', `Data sent: ${data.message}`);
        });
    }

    async loadAvailablePorts() {
        // Load common ports immediately
        this.loadCommonPorts();
        
        try {
            const response = await fetch('/api/ports');
            const ports = await response.json();
            
            // Add detected ports to the existing common ports
            ports.forEach(port => {
                const option = document.createElement('option');
                option.value = port.path;
                option.textContent = `${port.friendlyName || port.path} (${port.path})`;
                this.portSelect.appendChild(option);
            });

            this.addLogEntry('info', `Found ${ports.length} detected ports + common ports`);
        } catch (error) {
            this.addLogEntry('warning', `Server not available, using common ports only`);
        }
    }

    loadCommonPorts() {
        this.portSelect.innerHTML = '<option value="">Select a port...</option>';
        
        const commonPorts = [
            { path: 'COM3', friendlyName: 'Arduino COM3 (Recommended)' },
            { path: 'COM1', friendlyName: 'Arduino COM1' },
            { path: 'COM4', friendlyName: 'Arduino COM4' },
            { path: 'COM5', friendlyName: 'Arduino COM5' },
            { path: 'COM6', friendlyName: 'Arduino COM6' },
            { path: 'COM7', friendlyName: 'Arduino COM7' },
            { path: 'COM8', friendlyName: 'Arduino COM8' },
            { path: '/dev/ttyUSB0', friendlyName: 'Arduino USB0 (Linux)' },
            { path: '/dev/ttyACM0', friendlyName: 'Arduino ACM0 (Linux)' },
            { path: '/dev/ttyUSB1', friendlyName: 'Arduino USB1 (Linux)' },
            { path: '/dev/ttyACM1', friendlyName: 'Arduino ACM1 (Linux)' }
        ];
        
        commonPorts.forEach(port => {
            const option = document.createElement('option');
            option.value = port.path;
            option.textContent = `${port.friendlyName} (${port.path})`;
            this.portSelect.appendChild(option);
        });
        
        this.addLogEntry('info', 'Common ports loaded - COM3 is recommended');
    }

    connectToArduino() {
        const selectedPort = this.portSelect.value;
        if (!selectedPort) {
            this.addLogEntry('warning', 'Please select a port first');
            return;
        }

        this.updateConnectionStatus('connecting', 'Connecting...');
        this.socket.emit('connect_arduino', { port: selectedPort });
    }

    disconnectFromArduino() {
        this.socket.emit('disconnect_arduino');
        this.handleArduinoDisconnected({ message: 'Manually disconnected' });
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) {
            this.addLogEntry('warning', 'Please enter a message to send');
            return;
        }

        if (!this.isConnected) {
            this.addLogEntry('warning', 'Arduino not connected');
            return;
        }

        this.socket.emit('send_to_arduino', message);
        this.messageInput.value = '';
        this.addLogEntry('info', `Sent: ${message}`);
    }

    sendQuickCommand(command) {
        if (!this.isConnected) {
            this.addLogEntry('warning', 'Arduino not connected');
            return;
        }

        this.socket.emit('send_to_arduino', command);
        this.addLogEntry('info', `Sent command: ${command}`);
    }

    handleArduinoConnected(data) {
        this.isConnected = true;
        this.connectionStartTime = new Date();
        this.messageCount = 0;
        
        this.updateConnectionStatus('connected', `Connected to ${data.port}`);
        this.updateConnectionButtons(true);
        this.startConnectionTimer();
        
        this.addLogEntry('success', `Arduino connected on ${data.port}`);
        this.updateDataDisplay();
    }

    handleArduinoDisconnected(data) {
        this.isConnected = false;
        this.connectionStartTime = null;
        
        this.updateConnectionStatus('disconnected', 'Not Connected');
        this.updateConnectionButtons(false);
        this.stopConnectionTimer();
        
        this.addLogEntry('info', data.message || 'Arduino disconnected');
        this.updateDataDisplay();
    }

    handleArduinoError(data) {
        this.addLogEntry('error', `${data.message}: ${data.error}`);
        this.updateConnectionStatus('disconnected', 'Connection Error');
    }

    handleArduinoData(data) {
        this.messageCount++;
        this.lastMessage.textContent = typeof data === 'object' ? JSON.stringify(data) : data;
        
        this.addLogEntry('success', `Received: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
        
        // Parse sensor data if it's a JSON object
        if (typeof data === 'object' && data.type) {
            this.updateSensorData(data);
        }
        
        this.updateDataDisplay();
    }

    updateSensorData(data) {
        switch (data.type) {
            case 'temperature':
                this.temperatureValue.textContent = `${data.value}°C`;
                break;
            case 'humidity':
                this.humidityValue.textContent = `${data.value}%`;
                break;
            case 'led':
                this.ledStatus.textContent = data.status ? 'ON' : 'OFF';
                this.ledStatus.style.color = data.status ? '#28a745' : '#dc3545';
                break;
            case 'signal':
                this.signalStrength.textContent = `${data.value}%`;
                break;
        }
    }

    updateConnectionStatus(status, message) {
        this.connectionStatus.className = `status-indicator ${status}`;
        this.connectionStatus.innerHTML = `<i class="fas fa-circle"></i> <span>${message}</span>`;
    }

    updateConnectionButtons(connected) {
        this.connectBtn.disabled = connected || !this.portSelect.value;
        this.disconnectBtn.disabled = !connected;
        this.messageInput.disabled = !connected;
        this.sendBtn.disabled = !connected;
        
        this.quickCommandBtns.forEach(btn => {
            btn.disabled = !connected;
        });
    }

    updateDataDisplay() {
        this.messageCountEl.textContent = this.messageCount;
        
        if (this.connectionStartTime) {
            this.connectionTime.textContent = this.formatTime(new Date() - this.connectionStartTime);
        } else {
            this.connectionTime.textContent = '--:--:--';
        }
    }

    startConnectionTimer() {
        this.connectionTimer = setInterval(() => {
            this.updateDataDisplay();
        }, 1000);
    }

    stopConnectionTimer() {
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
            this.connectionTimer = null;
        }
    }

    addLogEntry(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="message">${message}</span>
        `;
        
        this.dataLog.appendChild(logEntry);
        this.dataLog.scrollTop = this.dataLog.scrollHeight;
    }

    clearLog() {
        this.dataLog.innerHTML = `
            <div class="log-entry info">
                <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                <span class="message">Log cleared</span>
            </div>
        `;
    }

    exportLog() {
        const logEntries = Array.from(this.dataLog.querySelectorAll('.log-entry')).map(entry => {
            return entry.textContent;
        }).join('\n');
        
        const blob = new Blob([logEntries], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arduino-log-${new Date().toISOString().slice(0, 19)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArduinoDashboard();
});

// Add some visual feedback for button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn') && !e.target.disabled) {
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const sendBtn = document.getElementById('sendBtn');
        if (!sendBtn.disabled) {
            sendBtn.click();
        }
    }
    
    // Escape to clear message input
    if (e.key === 'Escape') {
        const messageInput = document.getElementById('messageInput');
        messageInput.value = '';
        messageInput.focus();
    }
});
