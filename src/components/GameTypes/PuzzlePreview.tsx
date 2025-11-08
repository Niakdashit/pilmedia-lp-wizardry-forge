
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PuzzlePreviewProps {
  config?: any;
}

const PuzzlePreview: React.FC<PuzzlePreviewProps> = ({ config = {} }) => {
  const [pieces, setPieces] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);

  const gridSize = Math.sqrt(config?.gridSize || 9);
  const totalPieces = config?.gridSize || 9;

  useEffect(() => {
    // Initialize puzzle with shuffled pieces
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    
    // Shuffle the array (except the last piece which is the empty space)
    const shuffled = [...initialPieces];
    for (let i = shuffled.length - 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setPieces(shuffled);
    setSolved(false);
    setMoves(0);
  }, [config?.gridSize]);

  const handlePieceClick = (index: number) => {
    if (solved) return;

    const newPieces = [...pieces];
    const emptyIndex = newPieces.findIndex(piece => piece === totalPieces - 1);
    
    // Check if clicked piece is adjacent to empty space
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;
    
    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      // Swap pieces
      [newPieces[index], newPieces[emptyIndex]] = [newPieces[emptyIndex], newPieces[index]];
      setPieces(newPieces);
      setMoves(moves + 1);

      // Check if puzzle is solved
      const isSolved = newPieces.every((piece, i) => piece === i);
      if (isSolved) {
        setSolved(true);
      }
    }
  };

  const getDifficultyColor = () => {
    const difficulty = config?.difficulty || 'medium';
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'hard': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-4 text-center">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <span>Mouvements: {moves}</span>
          <span className={`font-medium ${getDifficultyColor()}`}>
            {config?.difficulty || 'medium'}
          </span>
        </div>
      </div>

      <div 
        className="grid gap-1 bg-gray-200 p-2 rounded-lg mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          maxWidth: '280px'
        }}
      >
        {pieces.map((piece, index) => (
          <motion.div
            key={index}
            className={`aspect-square rounded-sm cursor-pointer flex items-center justify-center text-white font-bold text-lg ${
              piece === totalPieces - 1 
                ? 'invisible' 
                : solved
                ? 'bg-green-500'
                : 'bg-gradient-to-br from-[#E0004D] to-[#6B2AA0] hover:bg-[#6d1650]'
            }`}
            whileHover={piece !== totalPieces - 1 ? { scale: 1.05 } : {}}
            whileTap={piece !== totalPieces - 1 ? { scale: 0.95 } : {}}
            onClick={() => handlePieceClick(index)}
            style={{
              backgroundImage: config?.image ? `url(${config.image})` : undefined,
              backgroundSize: config?.image ? `${gridSize * 100}%` : undefined,
              backgroundPosition: config?.image ? `${(piece % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(piece / gridSize) * (100 / (gridSize - 1))}%` : undefined,
              backgroundRepeat: 'no-repeat'
            }}
          >
            {!config?.image && piece !== totalPieces - 1 && (piece + 1)}
          </motion.div>
        ))}
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-4 p-4 bg-green-100 rounded-lg"
        >
          <h3 className="text-lg font-bold text-green-800">Puzzle résolu !</h3>
          <p className="text-green-600">Terminé en {moves} mouvements</p>
        </motion.div>
      )}
    </div>
  );
};

export default PuzzlePreview;
