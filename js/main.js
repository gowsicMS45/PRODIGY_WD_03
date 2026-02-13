/**
 * MAIN ENTRY POINT
 * Initializes the game when DOM is loaded
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the game
  const game = new Game();
  const ui = new UI(game);

  // Log initialization
  console.log('🎮 Neon Tic-Tac-Toe initialized successfully!');
  console.log('📊 Game stats loaded:', game.stats);
  console.log('🎨 UI ready');
});

// Prevent context menu on right-click for better UX
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});
