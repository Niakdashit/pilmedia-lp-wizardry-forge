
import React from 'react';
import ScratchCard from './ScratchCard';

interface ScratchGameGridProps {
  cards: any[];
  gameSize: string;
  gameStarted: boolean;
  onCardFinish: (result: 'win' | 'lose', cardIndex: number) => void;
  onCardSelect: (index: number) => void;
  onScratchStart: (index: number) => void;
  selectedCard: number | null;
  scratchStarted: boolean;
  config: any;
  isModal?: boolean;
  gridConfig?: {
    rows?: number;
    cols?: number;
    gap?: number;
    cardShape?: string;
  };
  maxCards?: number;
}

const ScratchGameGrid: React.FC<ScratchGameGridProps> = ({
  cards,
  gameSize,
  gameStarted,
  onCardFinish,
  onCardSelect,
  onScratchStart,
  selectedCard,
  scratchStarted,
  config,
  isModal = false,
  gridConfig,
  maxCards
}) => {
  const effectiveCards = maxCards ? cards.slice(0, maxCards) : cards;
  const resolvedCols = Math.max(1, gridConfig?.cols || effectiveCards.length);
  const resolvedRows = Math.max(1, gridConfig?.rows || Math.ceil(effectiveCards.length / resolvedCols));
  const resolvedGap = typeof gridConfig?.gap === 'number' ? gridConfig.gap : 24;
  const cardShape = gridConfig?.cardShape;

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div
        className="w-full max-w-[1200px]"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${resolvedCols}, minmax(0, 1fr))`,
          gridAutoRows: 'auto',
          gap: `${resolvedGap}px`,
          justifyItems: 'center',
          alignItems: 'center'
        }}
      >
        {effectiveCards.map((card: any, index: number) => {
          const isThisCardSelected = selectedCard === index;
          
          const isLocked = gameStarted && scratchStarted && !isThisCardSelected;
          const isSelectable = gameStarted && !scratchStarted && selectedCard === null;
          const canScratch = gameStarted && isThisCardSelected;

          return (
            <div key={card.id || index} className="flex justify-center items-center">
              <ScratchCard
                card={card}
                index={index}
                gameSize={gameSize}
                gameStarted={gameStarted}
                onCardFinish={(result) => onCardFinish(result, index)}
                onCardSelect={() => onCardSelect(index)}
                onScratchStart={() => onScratchStart(index)}
                locked={isLocked}
                selectable={isSelectable}
                canScratch={canScratch}
                isSelected={isThisCardSelected}
                config={config}
                isModal={isModal}
                cardShape={cardShape}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScratchGameGrid;
