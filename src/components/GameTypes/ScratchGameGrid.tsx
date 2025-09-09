
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
  isModal = false
}) => {
  // Configuration pour une grille responsive qui s'adapte au nombre de cartes
  const getGridContainerClasses = () => {
    const cardCount = cards.length;
    
    // Container principal : prend 100% de l'espace disponible
    const containerBase = "w-full h-full flex items-center justify-center p-6";
    
    // Grille responsive avec auto-fit pour s'adapter au nombre de cartes
    let gridClasses = "";
    
    if (cardCount === 1) {
      // Une seule carte : centrée
      gridClasses = "flex justify-center items-center";
    } else if (cardCount === 2) {
      // Deux cartes : côte à côte, centrées
      gridClasses = "grid grid-cols-1 sm:grid-cols-2 gap-8 place-items-center justify-items-center w-full";
    } else if (cardCount <= 4) {
      // 3-4 cartes : max 2 par ligne sur petit écran, 4 sur grand écran
      gridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 place-items-center justify-items-center w-full";
    } else if (cardCount <= 6) {
      // 5-6 cartes : max 3 par ligne
      gridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center justify-items-center w-full";
    } else {
      // Plus de 6 cartes : grille auto-fit avec minimum 200px par carte
      gridClasses = "grid gap-8 place-items-center justify-items-center w-full";
      // Style inline pour auto-fit
    }
    
    return { containerBase, gridClasses, cardCount };
  };

  const { containerBase, gridClasses, cardCount } = getGridContainerClasses();

  // Style inline pour les grilles avec beaucoup de cartes (auto-fit)
  const gridStyle = cardCount > 6 ? {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px',
    width: '100%',
    placeItems: 'center',
    justifyItems: 'center'
  } : {};

  return (
    <div className={containerBase}>
      <div 
        className={gridClasses}
        style={cardCount > 6 ? gridStyle : {}}
      >
        {cards.map((card: any, index: number) => {
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScratchGameGrid;
