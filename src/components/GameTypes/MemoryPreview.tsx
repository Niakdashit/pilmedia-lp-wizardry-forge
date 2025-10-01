
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MemoryPreviewProps {
  config?: any;
}

const MemoryPreview: React.FC<MemoryPreviewProps> = ({ config = {} }) => {
  const [cards, setCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  useEffect(() => {
    const pairs = Math.min(config?.pairs || 8, 12);
    const numbers = Array.from({ length: pairs }, (_, i) => i + 1);
    const deck = [...numbers, ...numbers].sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
  }, [config?.pairs]);

  const getThemeContent = (card: number): React.ReactNode => {
    const theme = config?.theme || 'numbers';
    switch (theme) {
      case 'emojis':
        const emojis = ['🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎵', '🎸', '🎺', '🎻', '🎤', '🎬'];
        return emojis[card - 1] || '🎯';
      case 'colors':
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'];
        const colorStyle = { backgroundColor: colors[card - 1] || '#FF6B6B', width: '30px', height: '30px', borderRadius: '50%' };
        return <div style={colorStyle} />;
      default:
        return card.toString();
    }
  };

  const handleCardClick = (index: number) => {
    if (flipped.includes(index) || matched.includes(index) || flipped.length >= 2) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const gridCols = cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : 6;

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div 
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const isMatched = matched.includes(index);
          
          return (
            <motion.div
              key={index}
              className={`aspect-square rounded-lg cursor-pointer flex items-center justify-center text-lg font-bold border-2 ${
                isMatched 
                  ? 'bg-green-200 border-green-400' 
                  : isFlipped 
                  ? 'bg-white border-[#841b60]' 
                  : 'bg-gradient-to-br from-[#841b60] to-[#b41b60] border-[#841b60]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(index)}
              animate={{
                rotateY: isFlipped ? 180 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {isFlipped && (
                <div className="text-[#841b60] flex items-center justify-center">
                  {getThemeContent(card)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {matched.length === cards.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-4 p-4 bg-green-100 rounded-lg"
        >
          <h3 className="text-lg font-bold text-green-800">Félicitations !</h3>
          <p className="text-green-600">Vous avez trouvé toutes les paires !</p>
        </motion.div>
      )}
    </div>
  );
};

export default MemoryPreview;
