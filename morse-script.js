class MorseCodeDashboard {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.messageHistory = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadCommonPorts(); // Load ports immediately
        this.setupSocketListeners();
        this.populateMorseReference();
    }

    initializeElements() {
        // Connection elements
        this.portSelect = document.getElementById('portSelect');
        this.refreshPortsBtn = document.getElementById('refreshPorts');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.connectionStatus = document.getElementById('connectionStatus');

        // Morse display elements
        this.currentLetter = document.getElementById('currentLetter');
        this.currentWord = document.getElementById('currentWord');
        this.morseSequence = document.getElementById('morseSequence');

        // LED elements
        this.blueLed = document.getElementById('blueLed');
        this.redLed = document.getElementById('redLed');

        // Message elements
        this.messageHistory = document.getElementById('messageHistory');
        this.clearMessagesBtn = document.getElementById('clearMessages');
        this.exportMessagesBtn = document.getElementById('exportMessages');

        // Control elements
        this.resetMorseBtn = document.getElementById('resetMorse');
        this.clearAllBtn = document.getElementById('clearAll');
        this.testLEDsBtn = document.getElementById('testLEDs');
    }

    setupEventListeners() {
        // Port selection
        this.portSelect.addEventListener('change', () => {
            this.connectBtn.disabled = !this.portSelect.value;
        });

        // Refresh ports
        this.refreshPortsBtn.addEventListener('click', () => {
            this.loadCommonPorts();
            this.loadAvailablePorts();
        });

        // Connection buttons
        this.connectBtn.addEventListener('click', () => {
            this.connectToArduino();
        });

        this.disconnectBtn.addEventListener('click', () => {
            this.disconnectFromArduino();
        });

        // Message controls
        this.clearMessagesBtn.addEventListener('click', () => {
            this.clearMessages();
        });

        this.exportMessagesBtn.addEventListener('click', () => {
            this.exportMessages();
        });

        // Control buttons
        this.resetMorseBtn.addEventListener('click', () => {
            this.resetMorse();
        });

        this.clearAllBtn.addEventListener('click', () => {
            this.clearAll();
        });

        this.testLEDsBtn.addEventListener('click', () => {
            this.testLEDs();
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
            this.addMessage('info', `Data sent: ${data.message}`);
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

            this.addMessage('info', `Found ${ports.length} detected ports + common ports`);
        } catch (error) {
            this.addMessage('warning', `Server not available, using common ports only`);
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
        
        this.addMessage('info', 'Common ports loaded - COM3 is recommended');
    }

    connectToArduino() {
        const selectedPort = this.portSelect.value;
        if (!selectedPort) {
            this.addMessage('warning', 'Please select a port first');
            return;
        }

        this.updateConnectionStatus('connecting', 'Connecting...');
        
        // Initialize socket if not already done
        if (!this.socket) {
            try {
                this.socket = io();
                this.setupSocketListeners();
            } catch (error) {
                this.addMessage('error', 'Server not available. Please start the Node.js server with "npm start"');
                this.updateConnectionStatus('disconnected', 'Server Not Available');
                return;
            }
        }
        
        this.socket.emit('connect_arduino', { port: selectedPort });
    }

    disconnectFromArduino() {
        if (this.socket) {
            this.socket.emit('disconnect_arduino');
        }
        this.handleArduinoDisconnected({ message: 'Manually disconnected' });
    }

    handleArduinoConnected(data) {
        this.isConnected = true;
        this.updateConnectionStatus('connected', `Connected to ${data.port}`);
        this.updateConnectionButtons(true);
        this.addMessage('success', `Arduino connected on ${data.port}`);
    }

    handleArduinoDisconnected(data) {
        this.isConnected = false;
        this.updateConnectionStatus('disconnected', 'Not Connected');
        this.updateConnectionButtons(false);
        this.addMessage('info', data.message || 'Arduino disconnected');
    }

    handleArduinoError(data) {
        this.addMessage('error', `${data.message}: ${data.error}`);
        this.updateConnectionStatus('disconnected', 'Connection Error');
    }

    handleArduinoData(data) {
        if (typeof data === 'object' && data.type) {
            switch (data.type) {
                case 'morse_input':
                    this.updateMorseDisplay(data.message);
                    break;
                case 'letter_complete':
                    this.handleLetterComplete(data.message);
                    break;
                case 'word_complete':
                    this.handleWordComplete(data.message);
                    break;
                case 'message_sent':
                    this.handleMessageSent(data.message);
                    break;
                case 'morse_code':
                    this.updateMorseSequence(data.message);
                    break;
                case 'decoded_text':
                    this.updateDecodedText(data.message);
                    break;
                case 'status':
                    this.addMessage('info', data.message);
                    break;
                case 'error':
                    this.addMessage('error', data.message);
                    break;
                case 'heartbeat':
                    // Optional: show heartbeat in a subtle way
                    break;
            }
        } else {
            this.addMessage('info', `Received: ${data}`);
        }
    }

    updateMorseDisplay(message) {
        // Extract current letter from message like "Dot added: .-"
        const match = message.match(/([.-]+)$/);
        if (match) {
            this.currentLetter.textContent = match[1];
        }
    }

    handleLetterComplete(message) {
        // Extract letter and morse from message like "Letter: .- = A"
        const match = message.match(/Letter: ([.-]+) = (.+)/);
        if (match) {
            const morse = match[1];
            const letter = match[2];
            this.currentLetter.textContent = morse;
            this.addMessage('success', `Letter completed: ${morse} = ${letter}`);
        }
    }

    handleWordComplete(message) {
        // Extract word from message like "Word completed: HELLO"
        const match = message.match(/Word completed: (.+)/);
        if (match) {
            this.currentWord.textContent = match[1];
            this.addMessage('success', `Word completed: ${match[1]}`);
        }
    }

    handleMessageSent(message) {
        // Extract message from "Message sent: HELLO WORLD"
        const match = message.match(/Message sent: (.+)/);
        if (match) {
            this.addMessage('success', `Message sent: ${match[1]}`);
            this.resetMorseDisplay();
        }
    }

    updateMorseSequence(morseCode) {
        this.morseSequence.textContent = morseCode;
    }

    updateDecodedText(text) {
        this.currentWord.textContent = text;
    }

    resetMorseDisplay() {
        this.currentLetter.textContent = '- - -';
        this.currentWord.textContent = '';
        this.morseSequence.textContent = '';
    }

    updateConnectionStatus(status, message) {
        this.connectionStatus.className = `status-indicator ${status}`;
        this.connectionStatus.innerHTML = `<i class="fas fa-circle"></i> <span>${message}</span>`;
    }

    updateConnectionButtons(connected) {
        this.connectBtn.disabled = connected || !this.portSelect.value;
        this.disconnectBtn.disabled = !connected;
    }

    addMessage(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item';
        messageItem.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="message">${message}</span>
        `;
        
        this.messageHistory.appendChild(messageItem);
        this.messageHistory.scrollTop = this.messageHistory.scrollHeight;
        
        // Store in history
        this.messageHistory.push({
            timestamp: new Date().toISOString(),
            type: type,
            message: message
        });
    }

    clearMessages() {
        this.messageHistory.innerHTML = `
            <div class="message-item">
                <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                <span class="message">Message history cleared</span>
            </div>
        `;
        this.messageHistory = [];
    }

    exportMessages() {
        const messages = Array.from(this.messageHistory.querySelectorAll('.message-item')).map(item => {
            return item.textContent;
        }).join('\n');
        
        const blob = new Blob([messages], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `morse-messages-${new Date().toISOString().slice(0, 19)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    resetMorse() {
        if (this.isConnected) {
            this.socket.emit('send_to_arduino', 'RESET');
            this.addMessage('info', 'Reset command sent to Arduino');
        } else {
            this.addMessage('warning', 'Arduino not connected');
        }
    }

    clearAll() {
        this.resetMorseDisplay();
        this.clearMessages();
        this.addMessage('info', 'All data cleared');
    }

    testLEDs() {
        if (this.isConnected) {
            this.socket.emit('send_to_arduino', 'TEST_LEDS');
            this.addMessage('info', 'LED test command sent to Arduino');
        } else {
            this.addMessage('warning', 'Arduino not connected');
        }
    }

    populateMorseReference() {
        const alphabet = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..'
        };

        const numbers = {
            '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
            '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
        };

        const alphabetGrid = document.getElementById('alphabetGrid');
        const numbersGrid = document.getElementById('numbersGrid');

        // Populate alphabet
        Object.entries(alphabet).forEach(([letter, code]) => {
            const item = document.createElement('div');
            item.className = 'morse-item';
            item.innerHTML = `
                <div class="letter">${letter}</div>
                <div class="code">${code}</div>
            `;
            alphabetGrid.appendChild(item);
        });

        // Populate numbers
        Object.entries(numbers).forEach(([number, code]) => {
            const item = document.createElement('div');
            item.className = 'morse-item';
            item.innerHTML = `
                <div class="letter">${number}</div>
                <div class="code">${code}</div>
            `;
            numbersGrid.appendChild(item);
        });
    }

    // Simulate LED activation for visual feedback
    activateLED(type) {
        if (type === 'dot') {
            this.blueLed.classList.add('active');
            setTimeout(() => {
                this.blueLed.classList.remove('active');
            }, 150);
        } else if (type === 'dash') {
            this.redLed.classList.add('active');
            setTimeout(() => {
                this.redLed.classList.remove('active');
            }, 300);
        }
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MorseCodeDashboard();
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
    // Escape to clear all
    if (e.key === 'Escape') {
        const clearAllBtn = document.getElementById('clearAll');
        if (clearAllBtn) {
            clearAllBtn.click();
        }
    }
    
    // R to reset morse
    if (e.key === 'r' || e.key === 'R') {
        const resetBtn = document.getElementById('resetMorse');
        if (resetBtn && !resetBtn.disabled) {
            resetBtn.click();
        }
    }
});
