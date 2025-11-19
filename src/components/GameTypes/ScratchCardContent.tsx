
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
    // 1) Priorité aux champs "plats" de la carte (structure legacy)
    const legacyRevealImage = card.revealImage || config?.revealImage;
    const legacyRevealMessage = card.revealMessage || config?.revealMessage;

    if (legacyRevealImage) {
      return (
        <img
          src={legacyRevealImage}
          alt="Contenu révélé"
          className="w-full h-full object-cover"
        />
      );
    }

    // 2) Sinon, utiliser la nouvelle logique basée sur logic/globalReveal
    const logicReveal =
      result === 'win'
        ? config?.logic?.winnerReveal
        : config?.logic?.loserReveal ?? config?.globalReveal;

    if (logicReveal?.type === 'image' && logicReveal.url) {
      return (
        <img
          src={logicReveal.url}
          alt="Contenu révélé"
          className="w-full h-full object-cover"
        />
      );
    }

    if (logicReveal?.type === 'text') {
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center ${
            result === 'win'
              ? 'bg-gradient-to-br from-yellow-300 to-yellow-500'
              : 'bg-gradient-to-br from-gray-300 to-gray-500'
          }`}
        >
          <div className="text-2xl mb-1">{result === 'win' ? '🎉' : '😔'}</div>
          <div
            className="text-sm font-bold text-center px-2"
            style={{
              fontSize: logicReveal.style?.fontSize
                ? `${logicReveal.style.fontSize}px`
                : '14px',
              fontWeight: logicReveal.style?.fontWeight || 600,
              color: logicReveal.style?.color || '#1f2937',
              textAlign: logicReveal.style?.align || 'center'
            }}
          >
            {logicReveal.value}
          </div>
        </div>
      );
    }

    // 3) Fallback très simple
    const fallbackMessage =
      result === 'win'
        ? legacyRevealMessage || 'Félicitations !'
        : 'Dommage !';

    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center ${
          result === 'win'
            ? 'bg-gradient-to-br from-yellow-300 to-yellow-500'
            : 'bg-gradient-to-br from-gray-300 to-gray-500'
        }`}
      >
        <div className="text-2xl mb-1">{result === 'win' ? '🎉' : '😔'}</div>
        <div className="text-sm font-bold text-gray-800 text-center px-2">
          {fallbackMessage}
        </div>
      </div>
    );
  };

  const getScratchSurface = () => {
    // 1) Structure legacy utilisée par le runtime
    const legacySurface = card.scratchSurface || config?.scratchSurface;
    const legacyColor =
      scratchColor || card.scratchColor || config?.scratchColor || '#C0C0C0';

    if (legacySurface) {
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${legacySurface})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      );
    }

    // 2) Support de la nouvelle structure globalCover / card.cover
    const cover = card.cover || config?.globalCover;

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

    const finalColor =
      cover?.type === 'color' ? cover.value : legacyColor;

    return (
      <div
        className="absolute inset-0"
        style={{
          background: finalColor,
          opacity: cover?.type === 'color' ? cover.opacity ?? 1 : 1,
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
