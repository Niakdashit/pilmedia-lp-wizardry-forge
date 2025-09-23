
import React from 'react';

interface ScratchCardContentProps {
  showRevealContent: boolean;
  result: 'win' | 'lose' | null;
  card: any;
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
        className="absolute inset-0"
        style={{
          background: finalScratchColor,
          borderRadius: 'inherit'
        }}
      />
    );
  };

  return (
    <>
      {showRevealContent && (
        <div className="absolute inset-0">
          {getResultContent()}
        </div>
      )}
      {!showRevealContent && getScratchSurface()}
    </>
  );
};

export default ScratchCardContent;
