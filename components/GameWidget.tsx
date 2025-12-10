
import React, { useState } from 'react';

export const GameWidget: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const getStatus = () => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "It's a Draw!";
    return `Next Player: ${isXNext ? 'X' : 'O'}`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="text-xl font-bold text-glow text-[var(--theme-primary)]">
        {getStatus()}
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {board.map((square, i) => (
          <button
            key={i}
            className={`w-16 h-16 border-2 border-[var(--theme-primary)]/50 rounded-lg flex items-center justify-center text-4xl font-bold transition-all duration-200 
              ${square ? 'bg-[var(--theme-primary)]/20 text-glow' : 'hover:bg-[var(--theme-primary)]/10'}
              ${square === 'X' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-secondary)]'}
            `}
            onClick={() => handleClick(i)}
          >
            {square}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-4 py-2 bg-[var(--theme-secondary)]/80 text-white rounded-md hover:bg-[var(--theme-secondary)] transition-colors border border-[var(--theme-primary)]/30"
      >
        Reset Game
      </button>
    </div>
  );
};
