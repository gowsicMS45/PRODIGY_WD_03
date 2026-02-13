/**
 * UTILITY FUNCTIONS MODULE
 * Helper functions for the Tic-Tac-Toe game
 */

class Utils {
  static audioContext = null;
  static soundOn = true;

  /**Initialize audio context*/
  static initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**Play beep sound*/
  static playBeep(frequency = 400, duration = 200, type = 'sine') {
    if (!this.soundOn || !this.audioContext) return;
    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.frequency.value = frequency;
      osc.type = type;

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

      osc.start(now);
      osc.stop(now + duration / 1000);
    } catch (e) {}
  }

  static playClickSound() {
    this.playBeep(600, 100, 'square');
  }

  static playWinSound() {
    this.playBeep(800, 150, 'sine');
    setTimeout(() => this.playBeep(1000, 150, 'sine'), 200);
    setTimeout(() => this.playBeep(1200, 200, 'sine'), 400);
  }

  static playDrawSound() {
    this.playBeep(500, 100, 'sine');
    setTimeout(() => this.playBeep(500, 100, 'sine'), 150);
  }

  /**Create confetti particles with theme colors*/
  static createConfetti(container, count = 50) {
    // Use theme colors from CSS variables
    const root = getComputedStyle(document.documentElement);
    const themeColors = [
      root.getPropertyValue('--accent-primary'),
      root.getPropertyValue('--accent-secondary'),
      root.getPropertyValue('--accent-tertiary'),
      '#ffd700'
    ];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const size = Math.random() * 10 + 5;
      const x = Math.random() * 400 - 200;
      const y = Math.random() * 400 - 200;
      const color = themeColors[Math.floor(Math.random() * themeColors.length)];

      particle.style.background = color;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.setProperty('--tx', x + 'px');
      particle.style.setProperty('--ty', y + 'px');
      particle.style.boxShadow = `0 0 10px ${color}`;

      container.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
    }
  }

  /**Get AI taunt message*/
  static getAITaunt() {
    const taunts = [
      '🎮 Making my move...',
      '🤖 Calculating... beep boop!',
      '💭 Let me think about this...',
      '⚡ Processing quantum moves...',
      '🎮 Your turn next!',
      '🧠 AI is thinking...',
      'Nice try! 😎',
      '🎲 Let\'s see what happens...',
      '⏳ Almost there...',
      '🚀 Making a strategic play...',
      'Good game! 🎊',
      '🎯 Targeting weak spots...',
      '💪 Bringing my A-game!',
    ];
    return taunts[Math.floor(Math.random() * taunts.length)];
  }

  /**Save to localStorage*/
  static saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  /**Load from localStorage*/
  static loadFromStorage(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  /**Get timestamp*/
  static getTimestamp() {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**Shuffle array*/
  static shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**Get winning combinations*/
  static getWinningCombinations() {
    return [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
  }

  /**Calculate line coordinates for SVG*/
  static calculateLineCoordinates(indices) {
    const gridSize = 3;
    const cellSize = 100;
    const positions = indices.map(i => {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      return {
        x: col * cellSize + cellSize / 2 + 12,
        y: row * cellSize + cellSize / 2 + 12,
      };
    });
    return {
      x1: positions[0].x,
      y1: positions[0].y,
      x2: positions[2].x,
      y2: positions[2].y,
    };
  }

  /**Check if board is full*/
  static isBoardFull(board) {
    return board.every(cell => cell !== '');
  }

  /**Get empty cells*/
  static getEmptyCells(board) {
    return board
      .map((cell, index) => (cell === '' ? index : null))
      .filter(index => index !== null);
  }

  /**Clone board*/
  static cloneBoard(board) {
    return [...board];
  }
}
