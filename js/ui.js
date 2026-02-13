/**
 * UI MODULE
 * Handles all DOM updates, animations, and user interactions
 */

class UI {
  constructor(game) {
    this.game = game;
    this.currentTheme = Utils.loadFromStorage('theme', 'dark');
    this.soundOn = Utils.loadFromStorage('soundEnabled', true);

    this.cacheElements();
    this.attachEventListeners();
    this.init();
  }

  /**Cache DOM elements*/
  cacheElements() {
    // Sections
    this.modeSelector = document.getElementById('modeSelector');
    this.difficultySelector = document.getElementById('difficultySelector');
    this.gameBoard = document.getElementById('gameBoard');

    // Game elements
    this.grid = document.getElementById('grid');
    this.cells = document.querySelectorAll('.cell');
    this.message = document.getElementById('message');
    this.aiThinking = document.getElementById('aiThinking');

    // Buttons
    this.restartBtn = document.getElementById('restartBtn');
    this.newGameBtn = document.getElementById('newGameBtn');
    this.undoBtn = document.getElementById('undoBtn');
    this.themeToggle = document.getElementById('themeToggle');
    this.soundToggle = document.getElementById('soundToggle');
    this.backBtn = document.getElementById('backBtn');

    // Stats
    this.statsWins = document.getElementById('statsWins');
    this.statsLosses = document.getElementById('statsLosses');
    this.statsDraws = document.getElementById('statsDraws');
    this.winRate = document.getElementById('winRate');
    this.streak = document.getElementById('streak');
    this.resetStatsBtn = document.getElementById('resetStatsBtn');

    // History
    this.historyList = document.getElementById('historyList');

    // Player info
    this.p1Name = document.getElementById('p1Name');
    this.p2Name = document.getElementById('p2Name');
    this.p1Avatar = document.getElementById('p1Avatar');
    this.p2Avatar = document.getElementById('p2Avatar');
    this.p1Status = document.getElementById('p1Status');
    this.p2Status = document.getElementById('p2Status');

    // Modal
    this.winnerModal = document.getElementById('winnerModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalMessage = document.getElementById('modalMessage');
    this.modalEmoji = document.getElementById('modalEmoji');
    this.modalRematchBtn = document.getElementById('modalRematchBtn');
    this.modalMenuBtn = document.getElementById('modalMenuBtn');
    this.particleContainer = document.getElementById('particleContainer');

    // AI
    this.aiMessage = document.getElementById('aiMessage');

    // SVG line
    this.winningLine = document.querySelector('.winning-line');
    this.winningLineSVG = document.querySelector('.winning-line line');

    // Theme buttons
    this.themeButtons = document.querySelectorAll('.theme-btn');

    // Difficulty display
    this.difficultyDisplay = document.getElementById('difficultyDisplay');
  }

  /**Attach event listeners*/
  attachEventListeners() {
    // Game mode selection
    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => this.selectGameMode(btn.dataset.mode));
    });

    // Difficulty selection
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => this.selectDifficulty(btn.dataset.difficulty));
    });

    // Back button
    this.backBtn.addEventListener('click', () => this.backToModeSelection());

    // Cell clicks
    this.cells.forEach((cell, index) => {
      cell.addEventListener('click', () => this.handleCellClick(index));
    });

    // Theme toggle
    this.themeToggle.addEventListener('click', () => this.toggleTheme());

    // Sound toggle
    this.soundToggle.addEventListener('click', () => this.toggleSound());

    // Theme buttons
    this.themeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.setColorTheme(btn.dataset.theme));
    });

    // Game buttons
    this.restartBtn.addEventListener('click', () => this.restartGame());
    this.newGameBtn.addEventListener('click', () => this.newGame());
    this.undoBtn.addEventListener('click', () => this.undoMove());
    this.resetStatsBtn.addEventListener('click', () => this.resetStats());

    // Modal
    this.modalRematchBtn.addEventListener('click', () => {
      this.closeModal();
      this.restartGame();
    });

    this.modalMenuBtn.addEventListener('click', () => {
      this.closeModal();
      this.newGame();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  /**Initialize UI*/
  init() {
    this.applyTheme(this.currentTheme);
    this.updateStats();
    this.updateHistory();
    Utils.soundOn = this.soundOn;

    if (this.soundOn) {
      document.body.classList.remove('sound-off');
      document.body.classList.add('sound-on');
    } else {
      document.body.classList.add('sound-off');
    }

    // Initialize audio on first interaction
    document.addEventListener('click', () => {
      Utils.initAudio();
    }, { once: true });
  }

  /**Select game mode*/
  selectGameMode(mode) {
    this.modeSelector.classList.add('hidden');

    if (mode === 'pva') {
      this.difficultySelector.classList.remove('hidden');
    } else {
      this.game.init(mode);
      this.difficultyDisplay.textContent = '👥 PvP'; // No difficulty in PvP
      this.startGame();
    }
  }

  /**Select difficulty*/
  selectDifficulty(difficulty) {
    this.game.init('pva', difficulty);
    this.difficultySelector.classList.add('hidden');

    // Update difficulty display with visual indicator
    const difficultyLabels = { easy: '🟢 Easy', medium: '🟡 Medium', impossible: '🔴 Impossible' };
    this.difficultyDisplay.textContent = difficultyLabels[difficulty] || '';

    this.startGame();
  }

  /**Back to mode selection*/
  backToModeSelection() {
    this.difficultySelector.classList.add('hidden');
    this.modeSelector.classList.remove('hidden');
  }

  /**Start game*/
  startGame() {
    this.gameBoard.classList.remove('hidden');
    this.updatePlayerInfo();
    this.refreshBoard();
    this.clearMessage();
  }

  /**Update player info*/
  updatePlayerInfo() {
    if (this.game.gameMode === 'pvp') {
      this.p1Name.textContent = 'Player 1';
      this.p2Name.textContent = 'Player 2';
      this.p1Avatar.textContent = '👤';
      this.p2Avatar.textContent = '👤';
    } else {
      this.p1Name.textContent = 'You';
      this.p2Name.textContent = 'AI';
      this.p1Avatar.textContent = '😊';
      this.p2Avatar.textContent = '🤖';
    }
    this.updatePlayerStatus();
  }

  /**Update player status*/
  updatePlayerStatus() {
    const isXTurn = this.game.currentPlayer === 'X';

    this.p1Status.textContent = isXTurn ? '◉' : '○';
    this.p2Status.textContent = isXTurn ? '○' : '◉';

    document.querySelectorAll('.player-info').forEach((info, idx) => {
      if ((idx === 0 && isXTurn) || (idx === 1 && !isXTurn)) {
        info.classList.add('active');
      } else {
        info.classList.remove('active');
      }
    });
  }

  /**Handle cell click*/
  async handleCellClick(index) {
    if (!this.game.gameActive || this.game.board[index] !== '') return;

    Utils.playClickSound();
    Utils.initAudio();

    // Player move
    if (this.game.makeMove(index)) {
      // Update with the symbol that was just placed (which is now in the board at this index)
      const symbol = this.game.board[index];
      this.updateCell(index, symbol);
      this.checkGameEnd();

      // AI move (if PvAI and game still active)
      if (this.game.gameMode === 'pva' && this.game.gameActive && this.game.currentPlayer === 'O') {
        this.showAIThinking(true);
        this.setAIMessage(Utils.getAITaunt());

        const aiMove = await this.game.getAIMove();
        if (aiMove !== null) {
          this.game.makeMove(aiMove);
          this.updateCell(aiMove, 'O');
          this.checkGameEnd();
        }

        this.showAIThinking(false);
      }

      this.updatePlayerStatus();
    }
  }

  /**Update cell display*/
  updateCell(index, player) {
    const cell = this.cells[index];
    cell.textContent = player === 'X' ? '✕' : '◯';
    cell.classList.add('occupied', `cell-${player.toLowerCase()}`);
  }

  /**Check game end*/
  checkGameEnd() {
    if (!this.game.gameActive) {
      const result = this.game.checkWinner();

      if (result) {
        this.drawWinningLine(result.combination);
        this.highlightWinningCells(result.combination);
        this.showWinnerModal(result.winner);
        Utils.playWinSound();
      } else {
        this.showDrawMessage();
        Utils.playDrawSound();
      }
      // Update stats immediately after game ends
      this.updateStats();
    }
  }

  /**Highlight winning cells*/
  highlightWinningCells(combination) {
    combination.forEach(index => {
      this.cells[index].classList.add('winning');
    });
  }

  /**Draw winning line on SVG*/
  drawWinningLine(combination) {
    const coords = Utils.calculateLineCoordinates(combination);
    this.winningLineSVG.setAttribute('x1', coords.x1);
    this.winningLineSVG.setAttribute('y1', coords.y1);
    this.winningLineSVG.setAttribute('x2', coords.x2);
    this.winningLineSVG.setAttribute('y2', coords.y2);
    this.winningLine.classList.add('active');
  }

  /**Show winner modal*/
  showWinnerModal(winner) {
    const isPlayer = (winner === 'X' && this.game.gameMode !== 'pva') ||
      (winner === 'X' && this.game.gameMode === 'pva') ||
      (winner === 'O' && this.game.gameMode === 'pvp');

    const emojis = {
      'X': ['🎉', '😎', '🏆'],
      'O': ['🎉', '🤖', '🏆'],
      'draw': ['🤝', '🎲', '⚖️']
    };

    const emoji = emojis[winner][Math.floor(Math.random() * 3)];

    // Get current theme and difficulty for celebration message
    const currentTheme = document.documentElement.getAttribute('data-color-theme') || 'cyber';
    const themeNames = { cyber: 'Cyber', sunset: 'Sunset', ocean: 'Ocean', forest: 'Forest' };
    const themeName = themeNames[currentTheme];

    // Difficulty bonus messages
    const difficultyBonuses = {
      easy: '💚 Easy win, but hey - a win is a win!',
      medium: '💛 Medium victory - nice strategy!',
      impossible: '❤️ IMPOSSIBLE WIN! You are a legend! 👑'
    };

    if (this.game.gameMode === 'pvp') {
      this.modalTitle.textContent = winner === 'X' ? '🎊 Player 1 Wins!' : '🎊 Player 2 Wins!';
      this.modalMessage.textContent = `Congratulations! Theme: ${themeName} 🎨`;
    } else {
      this.modalTitle.textContent = winner === 'X' ? '🎊 You Win!' : '😔 AI Wins!';

      if (winner === 'X') {
        const diffBonus = difficultyBonuses[this.game.aiDifficulty] || '';
        this.modalMessage.textContent = `${diffBonus} | ${themeName} brought luck! ✨`;
      } else {
        this.modalMessage.textContent = `Nice try! Better luck next time! 💪`;
      }
    }

    this.modalEmoji.textContent = emoji;
    Utils.createConfetti(this.particleContainer);

    this.winnerModal.classList.add('active');
  }

  /**Show draw message*/
  showDrawMessage() {
    this.message.textContent = '🤝 It\'s a Draw!';
    this.modalTitle.textContent = '🤝 It\'s a Draw!';
    this.modalMessage.textContent = 'Well played both sides!';
    this.modalEmoji.textContent = '⚖️';
    this.winnerModal.classList.add('active');
  }

  /**Close modal*/
  closeModal() {
    this.winnerModal.classList.remove('active');
  }

  /**Refresh board display*/
  refreshBoard() {
    this.cells.forEach((cell, index) => {
      cell.textContent = '';
      cell.classList.remove('occupied', 'cell-x', 'cell-o', 'winning');
    });

    this.winningLine.classList.remove('active');
    this.clearMessage();
  }

  /**Clear message*/
  clearMessage() {
    this.message.textContent = '';
  }

  /**Show AI thinking*/
  showAIThinking(show) {
    if (show) {
      this.aiThinking.classList.add('active');
    } else {
      this.aiThinking.classList.remove('active');
    }
  }

  /**Set AI message*/
  setAIMessage(msg) {
    this.aiMessage.textContent = msg;
  }

  /**Undo move*/
  undoMove() {
    if (this.game.undoMove()) {
      this.refreshBoard();
      const state = this.game.getState();
      state.board.forEach((player, index) => {
        if (player !== '') {
          this.updateCell(index, player);
        }
      });
      this.updatePlayerStatus();
    }
  }

  /**Restart game*/
  restartGame() {
    this.game.init(this.game.gameMode, this.game.aiDifficulty);
    this.refreshBoard();
    this.updatePlayerStatus();
  }

  /**New game*/
  newGame() {
    this.gameBoard.classList.add('hidden');
    this.modeSelector.classList.remove('hidden');
    this.difficultySelector.classList.add('hidden');
    this.refreshBoard();
  }

  /**Update stats display*/
  updateStats() {
    this.animateValue(this.statsWins, this.game.stats.wins);
    this.animateValue(this.statsLosses, this.game.stats.losses);
    this.animateValue(this.statsDraws, this.game.stats.draws);

    // Calculate win rate
    const totalGames = this.game.stats.gamesPlayed || 1;
    const winRatePercent = Math.round((this.game.stats.wins / totalGames) * 100);
    this.winRate.textContent = winRatePercent + '%';

    // Display current streak
    this.streak.textContent = this.game.stats.streak;

    // Add visual feedback for milestones
    if (this.game.stats.streak >= 3) {
      this.streak.style.animation = 'bounce 0.6s ease-out infinite';
      this.streak.textContent = '🔥 ' + this.game.stats.streak;
    } else {
      this.streak.style.animation = 'pulse 2s ease-in-out infinite';
      this.streak.textContent = this.game.stats.streak;
    }

    // Update history whenever stats update (game end)
    this.updateHistory();
  }

  /**Animate value change*/
  animateValue(element, newValue) {
    if (element.textContent != newValue) {
      element.textContent = newValue;
      element.classList.remove('pop-anim');
      void element.offsetWidth; // Trigger reflow to restart animation
      element.classList.add('pop-anim');

      // Remove class after animation
      setTimeout(() => {
        element.classList.remove('pop-anim');
      }, 400);
    }
  }

  /**Update history display*/
  updateHistory() {
    const history = Utils.loadFromStorage('gameHistory', []);
    this.historyList.innerHTML = '';

    if (history.length === 0) {
      this.historyList.innerHTML = '<p class="empty-message">No games yet</p>';
      return;
    }

    history.forEach(game => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div>
          <strong>${game.result}</strong>
          <p class="empty-message" style="margin-top: 4px; font-size: 0.75rem;">${game.mode}</p>
        </div>
        <span>${game.timestamp}</span>
      `;
      this.historyList.appendChild(item);
    });
  }

  /**Reset stats*/
  resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
      this.game.resetStats();
      this.updateStats();
      this.updateHistory();
    }
  }

  /**Toggle theme*/
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.currentTheme = newTheme;
    Utils.saveToStorage('theme', newTheme);
  }

  /**Apply theme*/
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**Toggle sound*/
  toggleSound() {
    this.soundOn = !this.soundOn;
    Utils.soundOn = this.soundOn;
    Utils.saveToStorage('soundEnabled', this.soundOn);

    if (this.soundOn) {
      document.body.classList.remove('sound-off');
      document.body.classList.add('sound-on');
    } else {
      document.body.classList.add('sound-off');
      document.body.classList.remove('sound-on');
    }
  }

  /**Set color theme with enhanced visual effects*/
  setColorTheme(theme) {
    document.documentElement.setAttribute('data-color-theme', theme);
    Utils.saveToStorage('colorTheme', theme);

    // Theme descriptions and effects
    const themeDescriptions = {
      cyber: { name: 'Cyber', emoji: '🔷', msg: 'Neon vibes activated! ⚡' },
      sunset: { name: 'Sunset', emoji: '🧡', msg: 'Warm mode engaged! 🌅' },
      ocean: { name: 'Ocean', emoji: '💙', msg: 'Diving in! 🌊' },
      forest: { name: 'Forest', emoji: '💚', msg: 'Nature power up! 🌿' }
    };

    const selected = themeDescriptions[theme];

    // Update active button
    this.themeButtons.forEach(btn => {
      if (btn.dataset.theme === theme) {
        btn.classList.add('active');
        btn.innerHTML = `<span>${selected.emoji}</span> ${selected.name} ✓`;
      } else {
        btn.classList.remove('active');
        const desc = themeDescriptions[btn.dataset.theme];
        btn.innerHTML = `<span>${desc.emoji}</span> ${desc.name}`;
      }
    });

    // Show theme feedback message
    if (this.game.gameActive) {
      this.setAIMessage(selected.msg);
      setTimeout(() => this.setAIMessage(''), 2000);
    }

    // Create theme activation particles
    this.createThemeParticles();
  }

  /**Create theme-specific particle effects*/
  createThemeParticles() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '1500';
    document.body.appendChild(container);

    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.borderRadius = '50%';

      // Get theme colors from CSS variables
      const themeColors = [
        getComputedStyle(document.documentElement).getPropertyValue('--particle-color-1'),
        getComputedStyle(document.documentElement).getPropertyValue('--particle-color-2'),
        getComputedStyle(document.documentElement).getPropertyValue('--particle-color-3')
      ];

      const color = themeColors[Math.floor(Math.random() * themeColors.length)];
      particle.style.background = color;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.boxShadow = `0 0 15px ${color}`;
      particle.style.animation = `themeParticleBurst 1.5s ease-out forwards`;

      container.appendChild(particle);
    }

    setTimeout(() => container.remove(), 1500);
  }

  /**Handle keyboard shortcuts*/
  handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT') return;

    if (e.key === 'r' || e.key === 'R') {
      this.restartGame();
    } else if (e.key === 'u' || e.key === 'U') {
      this.undoMove();
    } else if (e.key === 'n' || e.key === 'N') {
      this.newGame();
    } else if (e.key === 't' || e.key === 'T') {
      this.toggleTheme();
    } else if (e.key === 's' || e.key === 'S') {
      this.toggleSound();
    } else if (e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      this.handleCellClick(index);
    }
  }
}
