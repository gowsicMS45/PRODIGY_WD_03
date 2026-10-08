# Tic Tac Toe Game

A futuristic Tic Tac Toe web application built with HTML, CSS, and JavaScript as part of the Prodigy InfoTech Web Development Internship.

## Overview

This project expands a classic Tic Tac Toe game with multiple gameplay modes, AI difficulty levels, persistent score tracking, sound effects, match history, and responsive animated UI.

## Features

- Player vs Player mode
- Player vs AI mode
- AI difficulty levels: Easy, Medium, and Impossible
- Minimax algorithm for optimal AI gameplay
- Real-time win and draw detection
- Undo last move support
- Turn indicator
- Animated winning line and highlighted winning cells
- Persistent scoreboard using localStorage
- Last 5 match history tracking
- Reset scoreboard option
- Modal popup for game results
- Sound effects with sound toggle
- Confetti animation on win
- Responsive layout

## Tech Stack

- HTML
- CSS
- JavaScript
- localStorage

## Project Structure

```text
css/
  style.css
js/
  ai.js
  game.js
  main.js
  ui.js
  utils.js
index.html
```

## How It Works

Game state is managed with JavaScript arrays. Win combinations are checked after each move, while the AI uses different strategies depending on the selected difficulty. Score and match history are stored in localStorage so progress remains available between sessions.

## Author

Gowsic M S

## Internship

Prodigy InfoTech - Web Development Internship
