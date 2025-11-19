
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
  isModal?: boolean;
  cardShape?: string;
  borderConfig?: {
    type?: 'internal' | 'external';
    color: string;
    width: number;
  };
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
  isModal = false,
  cardShape,
  borderConfig: borderConfigProp
}) => {
  // Dimensions selon la taille avec adaptation pour modal
  const getDimensions = () => {
    const baseSize = {
      small: { width: 200, height: 160 },
      medium: { width: 250, height: 200 },
      large: { width: 300, height: 240 },
      xlarge: { width: 350, height: 280 }
    }[gameSize] || { width: 250, height: 200 };

    const isVertical = cardShape === 'vertical-rectangle';
    const isCircle = cardShape === 'circle';
    const aspectWidth = baseSize.width;
    let aspectHeight = baseSize.height;

    if (isVertical) {
      aspectHeight = aspectWidth * 1.5;
    } else if (isCircle) {
      aspectHeight = aspectWidth;
    }


    // Ajustement pour les modals - réduction moins agressive
    if (isModal) {
      return {
        width: Math.max(200, aspectWidth * 0.9),
        height: Math.max(160, aspectHeight * 0.9)
      };
    }

    return { width: aspectWidth, height: aspectHeight };
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
    }
  };

  // Déterminer le style de bordure selon cardShape
  const getBorderRadiusClass = () => {
    switch (cardShape) {
      case 'square':
        return 'rounded-none';
      case 'circle':
        return 'rounded-full';
      case 'vertical-rectangle':
      default:
        return 'rounded-xl';
    }
  };

  const borderRadiusClass = getBorderRadiusClass();
  
  // Gérer les styles de bordure
  const borderConfig = borderConfigProp || config?.grid?.border || config?.scratchConfig?.grid?.border;
  console.log('[ScratchCard] Border config:', borderConfig, 'Grid on config:', config?.grid, 'ScratchConfig:', config?.scratchConfig);
  
  const getBorderStyles = () => {
    if (!borderConfig) {
      console.log('[ScratchCard] No border config, using no extra border');
      return {};
    }
 
    const { color, width: borderWidth } = borderConfig;
    console.log('[ScratchCard] Applying card border:', { color, borderWidth });
 
    return {
      border: `${borderWidth}px solid ${color}`,
      boxSizing: 'border-box' as const
    };
  };
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center w-full">
        <div
          className={`relative overflow-hidden shadow-sm bg-white ${borderRadiusClass}`}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            minWidth: `${width}px`,
            minHeight: `${height}px`,
            ...getBorderStyles()
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
    <div className="flex flex-col items-center w-full">
      {/* Progress bar pour le grattage - seulement si pas dans modal */}
      {!isModal && gameStarted && canScratch && !isRevealed && (
        <div className="w-full mb-4" style={{ maxWidth: `${width}px` }}>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-br from-[#44444d] to-[#44444d] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(scratchPercentage, 100)}%` }} 
            />
          </div>
        </div>
      )}

      {/* Carte à gratter */}
      <div 
        className={`relative overflow-hidden transition-all duration-200 shadow-lg bg-white ${borderRadiusClass} ${
          isSelected 
            ? 'shadow-xl ring-2 ring-[#44444d]/20' 
            : selectable && !locked
              ? 'cursor-pointer hover:shadow-xl' 
              : ''
        } ${locked ? 'opacity-50' : ''}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          minWidth: `${width}px`,
          minHeight: `${height}px`,
          pointerEvents: locked ? 'none' : 'auto',
          ...getBorderStyles()
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
