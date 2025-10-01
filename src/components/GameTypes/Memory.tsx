
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface MemoryProps {
  config?: any;
  onConfigChange: (config: any) => void;
  isPreview?: boolean;
  onComplete?: () => void;
}

const Memory: React.FC<MemoryProps> = ({ config = {}, onConfigChange, isPreview, onComplete }) => {
  const [cards, setCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (isPreview) {
      const pairs = config?.pairs || 8;
      const numbers = Array.from({ length: pairs }, (_, i) => i + 1);
      const deck = [...numbers, ...numbers].sort(() => Math.random() - 0.5);
      setCards(deck);
    }
  }, [isPreview, config?.pairs]);

  const handleCardClick = (index: number) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [first, second] = newFlipped;
      
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        setDisabled(false);

        if (matched.length + 2 === cards.length) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          onComplete?.();
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  if (!isPreview) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de paires
          </label>
          <input
            type="number"
            min="2"
            max="12"
            value={config?.pairs || 8}
            onChange={(e) => onConfigChange({ ...config, pairs: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temps limite (secondes)
          </label>
          <input
            type="number"
            min="30"
            max="300"
            value={config?.timeLimit || 120}
            onChange={(e) => onConfigChange({ ...config, timeLimit: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thème des cartes
          </label>
          <select
            value={config?.theme || 'numbers'}
            onChange={(e) => onConfigChange({ ...config, theme: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
          >
            <option value="numbers">Chiffres</option>
            <option value="emojis">Emojis</option>
            <option value="colors">Couleurs</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className={`aspect-square rounded-lg cursor-pointer ${
              flipped.includes(index) || matched.includes(index)
                ? 'bg-white'
                : 'bg-gradient-to-br from-[#d4dbe8] to-[#b41b60]'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(index)}
          >
            {(flipped.includes(index) || matched.includes(index)) && (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#d4dbe8]">
                {card}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Memory;
