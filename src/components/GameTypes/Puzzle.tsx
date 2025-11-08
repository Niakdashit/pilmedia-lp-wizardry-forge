import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ImageUpload from '../common/ImageUpload';

interface PuzzleProps {
  config?: any;
  onConfigChange: (config: any) => void;
  isPreview?: boolean;
  onComplete?: () => void;
}

const Puzzle: React.FC<PuzzleProps> = ({ config = {}, onConfigChange, isPreview, onComplete }) => {
  const [pieces, setPieces] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (isPreview) {
      const size = config?.gridSize || 9;
      const initialPieces = Array.from({ length: size }, (_, i) => i);
      setPieces(initialPieces.sort(() => Math.random() - 0.5));
    }
  }, [isPreview, config?.gridSize]);

  const handlePieceClick = (index: number) => {
    if (solved) return;

    const newPieces = [...pieces];
    const emptyIndex = newPieces.indexOf(newPieces.length - 1);
    
    // Check if piece is adjacent to empty space
    const isAdjacent = (
      index === emptyIndex - 1 || // Left
      index === emptyIndex + 1 || // Right
      index === emptyIndex - 3 || // Above
      index === emptyIndex + 3    // Below
    );

    if (isAdjacent) {
      // Swap pieces
      [newPieces[index], newPieces[emptyIndex]] = [newPieces[emptyIndex], newPieces[index]];
      setPieces(newPieces);

      // Check if puzzle is solved
      const isSolved = newPieces.every((piece, i) => piece === i);
      if (isSolved) {
        setSolved(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onComplete?.();
      }
    }
  };

  if (!isPreview) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image du puzzle
          </label>
          <ImageUpload
            value={config?.image}
            onChange={(value) => onConfigChange({ ...config, image: value })}
            label="Sélectionnez une image pour le puzzle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taille de la grille
          </label>
          <select
            value={config?.gridSize || 9}
            onChange={(e) => onConfigChange({ ...config, gridSize: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
          >
            <option value="9">3x3</option>
            <option value="16">4x4</option>
            <option value="25">5x5</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulté
          </label>
          <select
            value={config?.difficulty || 'medium'}
            onChange={(e) => onConfigChange({ ...config, difficulty: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
          >
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>
      </div>
    );
  }

  const gridSize = Math.sqrt(pieces.length);

  return (
    <div className="max-w-md mx-auto p-4">
      <div 
        className="grid gap-1 bg-gray-200 p-1 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`
        }}
      >
        {pieces.map((piece, index) => (
          <motion.div
            key={index}
            className={`aspect-square rounded-sm cursor-move ${
              piece === pieces.length - 1 ? 'invisible' : 'bg-gradient-to-br from-[#E0004D] to-[#6B2AA0]'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePieceClick(index)}
            style={{
              backgroundImage: config?.image ? `url(${config.image})` : undefined,
              backgroundSize: `${gridSize * 100}%`,
              backgroundPosition: `${(piece % gridSize) * 100}% ${Math.floor(piece / gridSize) * 100}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Puzzle;
