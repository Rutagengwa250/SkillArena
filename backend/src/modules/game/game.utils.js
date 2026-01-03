// src/modules/game/game.utils.js
export const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]           // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] !== '-' && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // returns "X" or "O"
    }
  }

  if (!board.includes('-')) return 'draw';
  return null; // game ongoing
};