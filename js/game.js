/**
 * GAME LOGIC MODULE
 * Handles game state, turn management, win/draw detection
 */

class Game {
  constructor() {
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameMode = 'pvp'; // 'pvp' or 'pva'
    this.aiDifficulty = 'medium';
    this.ai = null;
    this.gameActive = true;
    this.gameHistory = [];
    this.moveHistory = [];
    this.stats = {
      wins: 0,
      losses: 0,
      draws: 0,
      streak: 0,
      maxStreak: 0,
      gamesPlayed: 0
    };

    this.loadStats();
  }

  /**Initialize new game*/
  init(mode, difficulty = 'medium') {
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameMode = mode;
    this.aiDifficulty = difficulty;
    this.gameActive = true;
    this.moveHistory = [];

    if (mode === 'pva') {
      this.ai = new AI(difficulty);
    } else {
      this.ai = null;
    }
  }

  /**Make a move*/
  makeMove(index) {
    if (!this.isValidMove(index)) return false;

    this.board[index] = this.currentPlayer;
    this.moveHistory.push({ index, player: this.currentPlayer });

    const winner = this.checkWinner();
    if (winner) {
      this.endGame(winner.winner);
      return true;
    }

    if (Utils.isBoardFull(this.board)) {
      this.endGame('draw');
      return true;
    }

    this.switchPlayer();
    return true;
  }

  /**Check if move is valid*/
  isValidMove(index) {
    return this.gameActive && this.board[index] === '' && index >= 0 && index < 9;
  }

  /**Switch player*/
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
  }

  /**Get AI move*/
  async getAIMove() {
    await new Promise(resolve => setTimeout(resolve, 400)); // Add delay for UX
    const move = this.ai.getMove(this.board);
    return move;
  }

  /**Check for winner*/
  checkWinner() {
    const winningCombos = Utils.getWinningCombinations();

    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (this.board[a] !== '' &&
        this.board[a] === this.board[b] &&
        this.board[b] === this.board[c]) {
        return {
          winner: this.board[a],
          combination: combo
        };
      }
    }

    return null;
  }

  /**End game*/
  endGame(result) {
    this.gameActive = false;
    this.stats.gamesPlayed++;

    if (result === 'draw') {
      this.stats.draws++;
      this.stats.streak = 0; // Break streak on draw
    } else if (result === 'X') {
      if (this.gameMode === 'pvp') {
        this.stats.wins++;
        this.stats.streak++;
      } else {
        this.stats.wins++;
        this.stats.streak++;
      }
    } else if (result === 'O') {
      if (this.gameMode === 'pvp') {
        this.stats.losses++; // Player 2 wins count as losses for session user
      } else {
        this.stats.losses++;
        this.stats.streak = 0; // Break streak on loss
      }
    }

    // Update max streak
    if (this.stats.streak > this.stats.maxStreak) {
      this.stats.maxStreak = this.stats.streak;
    }

    this.recordGameHistory(result);
    this.saveStats();
  }

  /**Record game history*/
  recordGameHistory(result) {
    const timestamp = Utils.getTimestamp();
    let resultText = '';

    if (result === 'draw') {
      resultText = 'Draw';
    } else if (result === 'X') {
      resultText = this.gameMode === 'pvp' ? 'P1 Win' : 'You Win';
    } else if (result === 'O') {
      resultText = this.gameMode === 'pvp' ? 'P2 Win' : 'AI Win';
    }

    this.gameHistory.unshift({
      result: resultText,
      timestamp: timestamp,
      mode: this.gameMode === 'pvp' ? 'PvP' : `PvAI (${this.aiDifficulty})`
    });

    // Keep only last 5 games
    if (this.gameHistory.length > 5) {
      this.gameHistory = this.gameHistory.slice(0, 5);
    }

    Utils.saveToStorage('gameHistory', this.gameHistory);
  }

  /**Undo last move*/
  undoMove() {
    if (this.moveHistory.length === 0 || !this.gameActive) return false;

    // In PvAI, undo 2 moves (human + AI)
    const movesToUndo = this.gameMode === 'pva' ? 2 : 1;

    for (let i = 0; i < movesToUndo && this.moveHistory.length > 0; i++) {
      const lastMove = this.moveHistory.pop();
      this.board[lastMove.index] = '';
    }

    this.currentPlayer = this.moveHistory.length % 2 === 0 ? 'X' : 'O';
    return true;
  }

  /**Get game state*/
  getState() {
    return {
      board: Utils.cloneBoard(this.board),
      currentPlayer: this.currentPlayer,
      gameActive: this.gameActive,
      gameMode: this.gameMode,
      stats: { ...this.stats }
    };
  }

  /**Load stats from storage*/
  loadStats() {
    const saved = Utils.loadFromStorage('tictactoeStats', null);
    if (saved) {
      this.stats = saved;
    }
  }

  /**Save stats to storage*/
  saveStats() {
    Utils.saveToStorage('tictactoeStats', this.stats);
  }

  /**Reset stats*/
  resetStats() {
    this.stats = {
      wins: 0,
      losses: 0,
      draws: 0,
      streak: 0,
      maxStreak: 0,
      gamesPlayed: 0
    };
    this.gameHistory = [];
    this.saveStats();
    Utils.saveToStorage('gameHistory', []);
  }

  /**Get move suggestions (for testing)*/
  getSuggestion() {
    if (!this.ai) return null;
    const tempAI = new AI('impossible');
    return tempAI.getMove(this.board);
  }
}
