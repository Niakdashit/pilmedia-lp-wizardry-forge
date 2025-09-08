
import React from 'react';
import type { ScratchCard } from '../../types/ScratchCard';
import '../../styles/scratchCard.css';

interface ScratchCardContentProps {
  showRevealContent: boolean;
  result: 'win' | 'lose' | null;
  card: ScratchCard;
  config: any;
  index: number;
  scratchColor?: string;
}

const ScratchCardContent: React.FC<ScratchCardContentProps> = ({
  showRevealContent,
  result,
  card,
  config,
  index,
  scratchColor
}) => {
  const getResultContent = () => {
    const revealImage = card.revealImage || config?.revealImage;
    const revealMessage = card.revealMessage || config?.revealMessage || 'Félicitations !';

    if (revealImage) {
      return <img src={revealImage} alt="Contenu révélé" className="w-full h-full object-cover" />;
    }

    return (
      <div className={`w-full h-full flex flex-col items-center justify-center ${
        result === 'win' 
          ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' 
          : 'bg-gradient-to-br from-gray-300 to-gray-500'
      }`}>
        <div className="text-2xl mb-1">
          {result === 'win' ? '🎉' : '😔'}
        </div>
        <div className="text-sm font-bold text-gray-800 text-center px-2">
          {result === 'win' ? revealMessage : 'Dommage !'}
        </div>
      </div>
    );
  };

  const getScratchSurface = () => {
    const surface = card.scratchSurface || config?.scratchSurface;
    const finalScratchColor = scratchColor || card.scratchColor || config?.scratchColor || '#C0C0C0';

    if (surface) {
      return (
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url(${surface})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }} 
        />
      );
    }

    return (
      <div 
        className="absolute inset-0 flex items-center justify-center" 
        style={{
          background: `linear-gradient(145deg, ${finalScratchColor}, ${finalScratchColor}DD)`
        }}
      >
        <div className="text-white text-center">
          <div className="text-lg mb-1">🎫</div>
          <div className="text-xs">Carte {index + 1}</div>
        </div>
      </div>
    );
  };

  console.log('[ScratchCardContent] Card data:', { id: card.id, color: card.color, cover: card.cover });

  return (
    <div className="card relative w-full h-full" data-card-id={card.id}>
      {/* Card cover - background color or image */}
      <div
        className="card-cover absolute inset-0"
        data-has-cover={card.cover ? 'true' : 'false'}
        data-card-color={card.color || '#E3C0B7'}
        style={{
          backgroundColor: !card.cover ? (card.color || '#E3C0B7') : 'transparent',
          backgroundImage: card.cover ? `url(${card.cover.value})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }}
      >
        {showRevealContent && (
          <div className="absolute inset-0">
            {getResultContent()}
          </div>
        )}
      </div>

      {/* Scratch mask - always on top */}
      {!showRevealContent && (
        <div className="scratch-mask">
          {getScratchSurface()}
        </div>
      )}
    </div>
  );
};

export default ScratchCardContent;
