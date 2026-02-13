/**
 * AI LOGIC MODULE
 * Implements AI strategies: Easy, Medium, Impossible (Minimax)
 */

class AI {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.playerMark = 'O';
    this.humanMark = 'X';
  }

  /**Get AI move based on difficulty*/
  getMove(board) {
    const emptyCells = Utils.getEmptyCells(board);

    if (emptyCells.length === 0) return null;

    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(emptyCells);
      case 'medium':
        return this.getMediumMove(board, emptyCells);
      case 'impossible':
        return this.getMinimaxMove(board);
      default:
        return this.getRandomMove(emptyCells);
    }
  }

  /**Easy: Random move*/
  getRandomMove(emptyCells) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  /**Medium: Defensive strategy*/
  getMediumMove(board, emptyCells) {
    const winningCombos = Utils.getWinningCombinations();

    // Try to win
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      const cells = [board[a], board[b], board[c]];

      if (cells.filter(cell => cell === this.playerMark).length === 2 &&
        cells.filter(cell => cell === '').length === 1) {
        return combo[cells.indexOf('')];
      }
    }

    // Block opponent from winning
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      const cells = [board[a], board[b], board[c]];

      if (cells.filter(cell => cell === this.humanMark).length === 2 &&
        cells.filter(cell => cell === '').length === 1) {
        return combo[cells.indexOf('')];
      }
    }

    // Take center if available
    if (board[4] === '') return 4;

    // Take corner if available
    const corners = [0, 2, 6, 8].filter(i => board[i] === '');
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    // Take random empty cell
    return this.getRandomMove(emptyCells);
  }

  /**Impossible: Minimax algorithm*/
  getMinimaxMove(board) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = this.playerMark;
        const score = this.minimax(board, 0, false);
        board[i] = '';

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  }

  /**Minimax recursive algorithm*/
  minimax(board, depth, isMaximizing) {
    const winner = this.checkWinner(board);

    // Terminal states
    if (winner === this.playerMark) return 10 - depth;
    if (winner === this.humanMark) return depth - 10;
    if (Utils.isBoardFull(board)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = this.playerMark;
          const score = this.minimax(board, depth + 1, false);
          board[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = this.humanMark;
          const score = this.minimax(board, depth + 1, true);
          board[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  /**Check for winner*/
  checkWinner(board) {
    const winningCombos = Utils.getWinningCombinations();

    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] !== '' && board[a] === board[b] && board[b] === board[c]) {
        return board[a];
      }
    }

    return null;
  }
}
