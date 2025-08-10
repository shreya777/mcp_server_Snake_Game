class SnakeGame {
    constructor() {
        this.initializeElements();
        this.initializeGameState();
        this.initializeEventListeners();
        this.initializeTheme();
        this.createParticles();
        this.loadHighScore();
    }

    initializeElements() {
        this.gameArea = document.getElementById('gameArea');
        this.ctx = this.gameArea.getContext('2d');
        this.gameStart = document.getElementById('gameStart');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameSpeed = document.getElementById('gameSpeed');
        this.speedValue = document.getElementById('speedValue');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.themeToggle = document.getElementById('themeToggle');
    }

    initializeGameState() {
        this.gameAreaWidth = 600;
        this.gameAreaHeight = 400;
        this.cellSize = 20;
        this.gameArea.width = this.gameAreaWidth;
        this.gameArea.height = this.gameAreaHeight;
        
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.highScore = 0;
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gameSpeed.value = 5;
        this.speedValue.textContent = 5;
        
        // Animation properties
        this.animationId = null;
        this.lastTime = 0;
        this.gameInterval = 150;
        
        // Visual effects
        this.particles = [];
        this.foodParticles = [];
    }

    initializeEventListeners() {
        // Button events
        this.gameStart.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // Speed control
        this.gameSpeed.addEventListener('input', (e) => {
            this.speedValue.textContent = e.target.value;
            this.gameInterval = 300 - (e.target.value * 25);
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Prevent arrow key scrolling
        window.addEventListener('keydown', (e) => {
            if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('snakeGameTheme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('snakeGameTheme', newTheme);
        
        // Add animation to theme toggle button
        this.themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 300);
    }

    createParticles() {
        const particlesContainer = document.querySelector('.particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.highScoreElement.textContent = this.highScore;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.highScoreElement.textContent = this.highScore;
            this.highScoreElement.parentElement.classList.add('new-high-score');
            setTimeout(() => {
                this.highScoreElement.parentElement.classList.remove('new-high-score');
            }, 2000);
            return true;
        }
        return false;
    }

    startGame() {
        this.resetGame();
        this.isRunning = true;
        this.isPaused = false;
        
        // UI updates
        this.gameStart.disabled = true;
        this.pauseBtn.disabled = false;
        this.gameOverlay.classList.add('hidden');
        document.body.classList.add('game-running');
        
        // Initialize snake
        this.snake = [
            { x: Math.floor(this.gameAreaWidth / this.cellSize / 2), y: Math.floor(this.gameAreaHeight / this.cellSize / 2) }
        ];
        
        this.direction = 'right';
        this.nextDirection = 'right';
        this.generateFood();
        this.gameLoop();
    }

    resetGame() {
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.clearCanvas();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    restartGame() {
        this.startGame();
    }

    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        this.pauseBtn.querySelector('.btn-text').textContent = this.isPaused ? 'Resume' : 'Pause';
        this.pauseBtn.querySelector('.btn-icon').textContent = this.isPaused ? '▶️' : '⏸️';
        
        if (this.isPaused) {
            document.body.classList.add('game-paused');
        } else {
            document.body.classList.remove('game-paused');
            this.gameLoop();
        }
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning || this.isPaused) return;
        
        if (currentTime - this.lastTime >= this.gameInterval) {
            this.update();
            this.render();
            this.lastTime = currentTime;
        }
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update() {
        // Update direction
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const head = { ...this.snake[0] };
        
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.gameAreaWidth / this.cellSize ||
            head.y < 0 || head.y >= this.gameAreaHeight / this.cellSize) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            this.snake.pop();
        }
    }

    render() {
        this.clearCanvas();
        this.drawFood();
        this.drawSnake();
        this.updateParticles();
    }

    clearCanvas() {
        const theme = document.documentElement.getAttribute('data-theme');
        this.ctx.fillStyle = theme === 'light' ? '#ffffff' : '#f8f9fa';
        this.ctx.fillRect(0, 0, this.gameAreaWidth, this.gameAreaHeight);
    }

    drawSnake() {
        const theme = document.documentElement.getAttribute('data-theme');
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.cellSize;
            const y = segment.y * this.cellSize;
            
            // Create gradient for snake segments
            const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
            if (index === 0) {
                // Head - brighter
                gradient.addColorStop(0, theme === 'light' ? '#00b894' : '#28a745');
                gradient.addColorStop(1, theme === 'light' ? '#00a085' : '#1e7e34');
            } else {
                // Body - darker
                gradient.addColorStop(0, theme === 'light' ? '#00a085' : '#1e7e34');
                gradient.addColorStop(1, theme === 'light' ? '#008f75' : '#155724');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
            
            // Add border
            this.ctx.strokeStyle = theme === 'light' ? '#ffffff' : '#f8f9fa';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
            
            // Add eyes to head
            if (index === 0) {
                this.ctx.fillStyle = '#ffffff';
                const eyeSize = 3;
                let eye1X, eye1Y, eye2X, eye2Y;
                
                switch (this.direction) {
                    case 'right':
                        eye1X = x + this.cellSize - 6;
                        eye1Y = y + 5;
                        eye2X = x + this.cellSize - 6;
                        eye2Y = y + this.cellSize - 8;
                        break;
                    case 'left':
                        eye1X = x + 3;
                        eye1Y = y + 5;
                        eye2X = x + 3;
                        eye2Y = y + this.cellSize - 8;
                        break;
                    case 'up':
                        eye1X = x + 5;
                        eye1Y = y + 3;
                        eye2X = x + this.cellSize - 8;
                        eye2Y = y + 3;
                        break;
                    case 'down':
                        eye1X = x + 5;
                        eye1Y = y + this.cellSize - 6;
                        eye2X = x + this.cellSize - 8;
                        eye2Y = y + this.cellSize - 6;
                        break;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawFood() {
        const x = this.food.x * this.cellSize;
        const y = this.food.y * this.cellSize;
        
        // Create radial gradient for food
        const gradient = this.ctx.createRadialGradient(
            x + this.cellSize / 2, y + this.cellSize / 2, 0,
            x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 2
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.7, '#e55555');
        gradient.addColorStop(1, '#cc4444');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add shine effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x + this.cellSize / 3, y + this.cellSize / 3, this.cellSize / 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Animate food with pulsing effect
        const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        this.ctx.save();
        this.ctx.translate(x + this.cellSize / 2, y + this.cellSize / 2);
        this.ctx.scale(pulseScale, pulseScale);
        this.ctx.translate(-this.cellSize / 2, -this.cellSize / 2);
        this.ctx.restore();
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.gameAreaWidth / this.cellSize)),
                y: Math.floor(Math.random() * (this.gameAreaHeight / this.cellSize))
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
        this.createFoodParticles();
    }

    createFoodParticles() {
        const x = this.food.x * this.cellSize + this.cellSize / 2;
        const y = this.food.y * this.cellSize + this.cellSize / 2;
        
        for (let i = 0; i < 8; i++) {
            this.foodParticles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                maxLife: 30
            });
        }
    }

    updateParticles() {
        this.foodParticles = this.foodParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            return particle.life > 0;
        });
    }

    eatFood() {
        const speed = parseInt(this.gameSpeed.value);
        this.score += speed;
        this.scoreElement.textContent = this.score;
        
        // Create score popup
        this.createScorePopup();
        
        // Generate new food
        this.generateFood();
        
        // Add eating particles
        this.createEatingParticles();
    }

    createScorePopup() {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${parseInt(this.gameSpeed.value)}`;
        popup.style.left = Math.random() * 200 + 'px';
        popup.style.top = '20px';
        
        document.querySelector('.game-area-container').appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    createEatingParticles() {
        const head = this.snake[0];
        const x = head.x * this.cellSize + this.cellSize / 2;
        const y = head.y * this.cellSize + this.cellSize / 2;
        
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 20,
                maxLife: 20,
                color: '#4ecdc4'
            });
        }
    }

    gameOver() {
        this.isRunning = false;
        this.isPaused = false;
        
        // UI updates
        this.gameStart.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.querySelector('.btn-text').textContent = 'Pause';
        this.pauseBtn.querySelector('.btn-icon').textContent = '⏸️';
        document.body.classList.remove('game-running', 'game-paused');
        
        // Save high score
        const isNewHighScore = this.saveHighScore();
        
        // Show game over overlay
        this.finalScoreElement.textContent = this.score;
        this.overlayTitle.textContent = isNewHighScore ? '🎉 New High Score!' : 'Game Over!';
        this.overlayMessage.innerHTML = isNewHighScore ? 
            `Congratulations! New High Score: <span id="finalScore">${this.score}</span>` :
            `Your Score: <span id="finalScore">${this.score}</span>`;
        
        this.gameOverlay.classList.remove('hidden');
        
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    handleKeyPress(e) {
        if (!this.isRunning) {
            if (e.code === 'KeyR') {
                this.startGame();
            }
            return;
        }
        
        switch (e.code) {
            case 'ArrowUp':
                if (this.direction !== 'down') this.nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') this.nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.nextDirection = 'right';
                break;
            case 'Space':
                this.togglePause();
                break;
            case 'KeyR':
                this.restartGame();
                break;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.snakeGame = new SnakeGame();
});

// Add some extra visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to buttons
    document.querySelectorAll('.game-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add hover sound effect (optional)
    document.querySelectorAll('.game-btn, .control-group, .stat-item').forEach(element => {
        element.addEventListener('mouseenter', () => {
            // You can add sound effects here if desired
            element.style.transform = element.style.transform || '';
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .game-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);