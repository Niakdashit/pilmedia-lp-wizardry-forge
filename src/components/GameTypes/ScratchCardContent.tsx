
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
    // Utiliser globalReveal ou logic.winnerReveal/loserReveal selon le résultat
    const reveal = result === 'win' 
      ? config?.logic?.winnerReveal 
      : config?.logic?.loserReveal;

    // Si reveal est une image
    if (reveal?.type === 'image' && reveal.url) {
      return <img src={reveal.url} alt="Contenu révélé" className="w-full h-full object-cover" />;
    }

    // Si reveal est du texte
    if (reveal?.type === 'text') {
      return (
        <div className={`w-full h-full flex flex-col items-center justify-center ${
          result === 'win' 
            ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' 
            : 'bg-gradient-to-br from-gray-300 to-gray-500'
        }`}>
          <div className="text-2xl mb-1">
            {result === 'win' ? '🎉' : '😔'}
          </div>
          <div 
            className="text-sm font-bold text-center px-2"
            style={{
              fontSize: reveal.style?.fontSize ? `${reveal.style.fontSize}px` : '14px',
              fontWeight: reveal.style?.fontWeight || 600,
              color: reveal.style?.color || '#1f2937',
              textAlign: reveal.style?.align || 'center'
            }}
          >
            {reveal.value}
          </div>
        </div>
      );
    }

    // Fallback
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
          {result === 'win' ? 'Gagné !' : 'Perdu'}
        </div>
      </div>
    );
  };

  const getScratchSurface = () => {
    // Utiliser card.cover s'il existe, sinon globalCover
    const cover = card.cover || config?.globalCover;

    // Si cover est une image
    if (cover?.type === 'image' && cover.url) {
      return (
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url(${cover.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }} 
        />
      );
    }

    // Si cover est une couleur
    const finalColor = cover?.type === 'color' 
      ? cover.value 
      : scratchColor || '#C0C0C0';

    return (
      <div
        className="absolute inset-0"
        style={{
          background: finalColor,
          opacity: cover?.type === 'color' ? (cover.opacity ?? 1) : 1,
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
