
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
    border?: {
      type: 'internal' | 'external';
      color: string;
      width: number;
    };
  };
  maxCards?: number;
  allCardsScratching?: boolean; // Nouveau: toutes les cartes sont grattables directement
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
  maxCards,
  allCardsScratching = false
}) => {
  const effectiveCards = maxCards ? cards.slice(0, maxCards) : cards;
  const resolvedCols = Math.max(1, gridConfig?.cols || effectiveCards.length);
  const resolvedGap = typeof gridConfig?.gap === 'number' ? gridConfig.gap : 16;
  const cardShape = gridConfig?.cardShape;


  return (
    <div className="w-full h-full flex items-center justify-center p-3">
      <div
        className="w-full max-w-[1200px] flex items-center justify-center"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${resolvedCols}, minmax(0, 1fr))`,
            gridAutoRows: 'auto',
            gap: `${resolvedGap}px`,
            justifyItems: 'center',
            alignItems: 'center',
            padding: '24px'
          }}
        >
          {effectiveCards.map((card: any, index: number) => {
            const isThisCardSelected = selectedCard === index;
            
            // Mode "toutes les cartes grattables" : pas de verrouillage ni sélection
            const isLocked = allCardsScratching ? false : (gameStarted && scratchStarted && !isThisCardSelected);
            const isSelectable = allCardsScratching ? false : (gameStarted && !scratchStarted && selectedCard === null);
            const canScratch = allCardsScratching ? gameStarted : (gameStarted && isThisCardSelected);

            return (
              <div
                key={card.id || index}
                className="flex justify-center items-center"
              >
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
    </div>
  );
};

export default ScratchGameGrid;
