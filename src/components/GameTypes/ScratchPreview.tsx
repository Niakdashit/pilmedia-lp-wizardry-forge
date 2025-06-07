
import React, { useState, useEffect } from 'react';
import ScratchGameGrid from './ScratchGameGrid';

interface ScratchPreviewProps {
  config?: any;
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  disabled?: boolean;
  buttonLabel?: string;
  buttonColor?: string;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  /**
   * When true, the game starts immediately without requiring the user to
   * click the start button. Useful for preview mode where we want to display
   * the interactive game directly.
   */
  autoStart?: boolean;
}

const ScratchPreview: React.FC<ScratchPreviewProps> = ({
  config = {},
  onFinish,
  onStart,
  disabled = false,
  buttonLabel = 'Gratter',
  buttonColor = '#841b60',
  gameSize = 'medium',
  autoStart = false
}) => {
  const [gameStarted, setGameStarted] = useState(autoStart && !disabled);
  const [finishedCards, setFinishedCards] = useState<Set<number>>(new Set());
  const [hasWon, setHasWon] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  // Automatically start the game in preview mode if autoStart is enabled
  useEffect(() => {
    if (autoStart && !gameStarted && !disabled) {
      setGameStarted(true);
      if (onStart) onStart();
    }
  }, [autoStart, gameStarted, disabled, onStart]);

  // Automatically start the game in preview mode if autoStart is enabled
  useEffect(() => {
    if (autoStart && !gameStarted && !disabled) {
      setGameStarted(true);
      if (onStart) onStart();
    }
  }, [autoStart, gameStarted, disabled, onStart]);

  const handleGameStart = () => {
    if (disabled) return;
    setGameStarted(true);
    if (onStart) onStart();
  };

  const handleCardStart = (index: number) => {
    if (activeCard === null) {
      setActiveCard(index);
    }
  };

  const handleCardFinish = (result: 'win' | 'lose', cardIndex: number) => {
    const newFinishedCards = new Set([...finishedCards, cardIndex]);
    setFinishedCards(newFinishedCards);
    
    if (result === 'win') {
      setHasWon(true);
    }

    const totalCards = config?.cards?.length || 1;
    if (newFinishedCards.size >= totalCards) {
      setTimeout(() => {
        if (onFinish) {
          onFinish(hasWon || result === 'win' ? 'win' : 'lose');
        }
      }, 1000);
    }
  };

  // Ensure we have at least one card with proper defaults
  const cards = config?.cards && config.cards.length > 0 
    ? config.cards 
    : [{ 
        id: 1, 
        revealImage: config?.revealImage || '', 
        revealMessage: config?.revealMessage || 'Félicitations !', 
        scratchColor: config?.scratchColor || '#C0C0C0' 
      }];

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center space-y-6 my-6">
        <ScratchGameGrid
          cards={cards}
          gameSize={gameSize}
          gameStarted={false}
          onCardFinish={() => {}}
          onCardStart={() => {}}
          activeCard={null}
          config={config}
        />

        <button
          onClick={handleGameStart}
          disabled={disabled}
          className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: disabled ? '#6b7280' : buttonColor }}
        >
          {disabled ? 'Remplissez le formulaire' : buttonLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <ScratchGameGrid
        cards={cards}
        gameSize={gameSize}
        gameStarted={gameStarted}
        onCardFinish={handleCardFinish}
        onCardStart={handleCardStart}
        activeCard={activeCard}
        config={config}
      />

      <div className="text-center">
        <div className="text-sm text-gray-600">
          Cartes terminées: {finishedCards.size}/{cards.length}
        </div>
        
        <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-[#841b60] h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(finishedCards.size / cards.length) * 100}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ScratchPreview;
