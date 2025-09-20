class MathCameraApp {
    constructor() {
        this.video = document.getElementById('video');
        this.overlay = document.getElementById('overlay');
        this.ctx = this.overlay.getContext('2d');
        this.startBtn = document.getElementById('startCamera');
        this.stopBtn = document.getElementById('stopCamera');
        this.equationText = document.getElementById('equationText');
        this.equationDescription = document.getElementById('equationDescription');
        this.detectionTips = document.getElementById('detectionTips');
        
        this.currentEquation = 'circle';
        this.isCameraActive = false;
        this.detectionInterval = null;
        this.equations = this.initializeEquations();
        
        this.initializeEventListeners();
        this.setupCanvas();
    }

    initializeEquations() {
        return {
            circle: {
                formula: 'A = πr²',
                description: 'Area of a circle - Look for circular objects like plates, wheels, or coins',
                tips: ['Find circular objects like plates, wheels, or coins', 'Measure the radius to calculate area', 'Perfect circles give the most accurate results'],
                color: '#667eea'
            },
            rectangle: {
                formula: 'A = l × w',
                description: 'Area of a rectangle - Look for rectangular objects like books, screens, or tables',
                tips: ['Find rectangular objects like books, screens, or tables', 'Measure length and width', 'Right angles give the best results'],
                color: '#28a745'
            },
            triangle: {
                formula: 'A = ½ × b × h',
                description: 'Area of a triangle - Look for triangular shapes like roofs, signs, or slices',
                tips: ['Find triangular objects like roofs, signs, or pizza slices', 'Measure base and height', 'Right triangles are easiest to measure'],
                color: '#ffc107'
            },
            distance: {
                formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)',
                description: 'Distance formula - Measure distance between two points',
                tips: ['Point your camera at two objects', 'Tap to mark the first point', 'Tap again to mark the second point'],
                color: '#dc3545'
            },
            velocity: {
                formula: 'v = d/t',
                description: 'Velocity formula - Calculate speed using distance and time',
                tips: ['Track a moving object', 'Measure distance traveled', 'Time the movement for accurate results'],
                color: '#17a2b8'
            },
            interest: {
                formula: 'A = P(1 + r/n)^(nt)',
                description: 'Compound interest - Calculate investment growth over time',
                tips: ['Use for financial planning', 'Input principal amount', 'Consider different interest rates and time periods'],
                color: '#6f42c1'
            }
        };
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        
        // Equation button listeners
        document.querySelectorAll('.equation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectEquation(e.target.dataset.equation);
            });
        });

        // Canvas click listener for interactive measurements
        this.overlay.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    setupCanvas() {
        this.overlay.width = this.overlay.offsetWidth;
        this.overlay.height = this.overlay.offsetHeight;
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'
                }
            });
            
            this.video.srcObject = stream;
            this.isCameraActive = true;
            
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            
            // Start detection loop
            this.startDetection();
            
            // Update detection tips
            this.updateDetectionTips();
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please ensure you have granted camera permissions.');
        }
    }

    stopCamera() {
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
        
        this.isCameraActive = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        // Clear detection interval
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
        
        // Clear overlay
        this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    }

    startDetection() {
        this.detectionInterval = setInterval(() => {
            if (this.isCameraActive) {
                this.detectAndDraw();
            }
        }, 100); // Run detection 10 times per second
    }

    detectAndDraw() {
        // Clear previous drawings
        this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        
        // Update canvas size to match video
        this.overlay.width = this.video.videoWidth || this.overlay.offsetWidth;
        this.overlay.height = this.video.videoHeight || this.overlay.offsetHeight;
        
        // Simulate detection based on current equation
        this.simulateDetection();
    }

    simulateDetection() {
        const equation = this.equations[this.currentEquation];
        
        // Simulate random detection points for demonstration
        const numDetections = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numDetections; i++) {
            const x = Math.random() * this.overlay.width;
            const y = Math.random() * this.overlay.height;
            const size = 50 + Math.random() * 100;
            
            this.drawDetectionBox(x, y, size, equation);
        }
    }

    drawDetectionBox(x, y, size, equation) {
        // Draw detection box
        this.ctx.strokeStyle = equation.color;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - size/2, y - size/2, size, size);
        
        // Draw semi-transparent background
        this.ctx.fillStyle = equation.color + '20';
        this.ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Draw equation label
        this.ctx.fillStyle = equation.color;
        this.ctx.font = 'bold 14px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(equation.formula, x, y - size/2 - 10);
        
        // Draw measurement info
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Inter';
        this.ctx.fillText(`${Math.round(size)}px`, x, y + 5);
    }

    selectEquation(equationType) {
        // Update active button
        document.querySelectorAll('.equation-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-equation="${equationType}"]`).classList.add('active');
        
        // Update equation display
        this.currentEquation = equationType;
        const equation = this.equations[equationType];
        
        this.equationText.textContent = equation.formula;
        this.equationDescription.textContent = equation.description;
        
        // Update detection tips
        this.updateDetectionTips();
    }

    updateDetectionTips() {
        const equation = this.equations[this.currentEquation];
        const tipsList = this.detectionTips.querySelector('ul');
        
        tipsList.innerHTML = equation.tips.map(tip => `<li>${tip}</li>`).join('');
    }

    handleCanvasClick(event) {
        if (!this.isCameraActive) return;
        
        const rect = this.overlay.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Add click marker
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Add click label
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 12px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Point', x, y - 15);
    }

    // Utility method to calculate real measurements
    calculateRealMeasurement(pixelSize, referenceObject = 'coin') {
        // Reference objects and their typical sizes
        const references = {
            'coin': 25, // mm
            'credit_card': 85.6, // mm
            'phone': 150 // mm (approximate)
        };
        
        const referenceSize = references[referenceObject] || 25;
        return (pixelSize / 100) * referenceSize; // Rough estimation
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MathCameraApp();
});

// Add some fun interactive examples
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to example cards
    const exampleCards = document.querySelectorAll('.example-card');
    
    exampleCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click animations to equation buttons
    const equationBtns = document.querySelectorAll('.equation-btn');
    
    equationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '6') {
        const equationTypes = ['circle', 'rectangle', 'triangle', 'distance', 'velocity', 'interest'];
        const index = parseInt(e.key) - 1;
        if (equationTypes[index]) {
            document.querySelector(`[data-equation="${equationTypes[index]}"]`).click();
        }
    }
    
    if (e.key === ' ') {
        e.preventDefault();
        const startBtn = document.getElementById('startCamera');
        const stopBtn = document.getElementById('stopCamera');
        
        if (!startBtn.disabled) {
            startBtn.click();
        } else if (!stopBtn.disabled) {
            stopBtn.click();
        }
    }
});
