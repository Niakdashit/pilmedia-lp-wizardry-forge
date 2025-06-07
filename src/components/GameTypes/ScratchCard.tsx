import React from 'react';
import { useScratchCard } from './useScratchCard';
import ScratchCanvas from './ScratchCanvas';
import ScratchCardContent from './ScratchCardContent';
import ScratchCardOverlays from './ScratchCardOverlays';

interface ScratchCardProps {
  card: any;
  index: number;
  gameSize: string;
  gameStarted: boolean;
  onCardFinish: (result: 'win' | 'lose') => void;
  onCardSelect: () => void;
  onScratchStart: () => void;
  locked: boolean;
  selectable: boolean;
  canScratch: boolean;
  isSelected: boolean;
  config: any;
  onReplay?: () => void;
  isModal?: boolean;
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  card,
  index,
  gameSize,
  gameStarted,
  onCardFinish,
  onCardSelect,
  onScratchStart,
  locked,
  selectable,
  canScratch,
  isSelected,
  config,
  isModal = false
}) => {
  // Dimensions selon la taille avec adaptation pour modal
  const getDimensions = () => {
    const baseSize = {
      small: { width: 180, height: 140 },
      medium: { width: 220, height: 170 },
      large: { width: 260, height: 200 },
      xlarge: { width: 300, height: 230 }
    }[gameSize] || { width: 220, height: 170 };

    // Réduire la taille pour les modals
    if (isModal) {
      return {
        width: Math.max(160, baseSize.width * 0.8),
        height: Math.max(120, baseSize.height * 0.8)
      };
    }

    return baseSize;
  };

  const { width, height } = getDimensions();

  const {
    canvasRef,
    isRevealed,
    scratchPercentage,
    result,
    showRevealContent
  } = useScratchCard({
    gameStarted,
    canScratch,
    onCardFinish,
    onScratchStart,
    config,
    card,
    width,
    height,
    index
  });

  const handleCardClick = () => {
    if (selectable && !locked) {
      onCardSelect();
      console.log(`Card ${index} selected`);
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center w-full max-w-sm mx-auto">
        <div
          className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm bg-white"
          style={{
            width: '100%',
            maxWidth: `${width}px`,
            aspectRatio: `${width} / ${height}`
          }}
        >
          <ScratchCardContent
            showRevealContent={false}
            result={null}
            card={card}
            config={config}
            index={index}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Progress bar pour le grattage - seulement si pas dans modal */}
      {!isModal && gameStarted && canScratch && !isRevealed && (
        <div className="w-full mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#841b60] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(scratchPercentage, 100)}%` }} 
            />
          </div>
        </div>
      )}

      {/* Carte à gratter */}
      <div 
        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-lg bg-white ${
          isSelected 
            ? 'border-[#841b60] shadow-xl ring-2 ring-[#841b60]/20' 
            : selectable && !locked
              ? 'border-gray-200 hover:border-[#841b60] cursor-pointer hover:shadow-xl' 
              : 'border-gray-200'
        } ${locked ? 'opacity-50' : ''}`}
        style={{
          width: '100%',
          maxWidth: `${width}px`,
          aspectRatio: `${width} / ${height}`,
          pointerEvents: locked ? 'none' : 'auto'
        }}
        onClick={handleCardClick}
      >
        <ScratchCardContent
          showRevealContent={showRevealContent}
          result={result}
          card={card}
          config={config}
          index={index}
        />

        <ScratchCanvas
          canvasRef={canvasRef}
          canScratch={canScratch}
          isRevealed={isRevealed}
        />

        <ScratchCardOverlays
          selectable={selectable}
          locked={locked}
          isSelected={isSelected}
          canScratch={canScratch}
          isRevealed={isRevealed}
          result={result}
          card={card}
          config={config}
        />
      </div>
    </div>
  );
};

export default ScratchCard;
