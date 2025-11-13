import React from 'react';

interface ArticleBannerProps {
  imageUrl?: string;
  onImageChange?: (url: string) => void;
  onImageRemove?: () => void;
  editable?: boolean;
  aspectRatio?: '2215/1536' | '1500/744'; // Ratios supportés
  maxWidth?: number; // Max 810px
}

/**
 * ArticleBanner - Bannière visible à toutes les étapes du funnel Article
 * 
 * Caractéristiques:
 * - Largeur 100% du conteneur (max 810px)
 * - Deux ratios possibles: 2215×1536px ou 1500×744px
 * - Toujours visible pendant toute la navigation du funnel
 * - Upload/remplacement d'image en mode édition
 */
const ArticleBanner: React.FC<ArticleBannerProps> = ({
  imageUrl,
  onImageChange,
  onImageRemove,
  editable = true,
  aspectRatio = '2215/1536',
  maxWidth = 810,
}) => {
  // Calcul du ratio en pourcentage pour padding-bottom
  const paddingBottom = aspectRatio === '2215/1536' 
    ? `${(1536 / 2215) * 100}%`  // ~69.3%
    : `${(744 / 1500) * 100}%`;   // ~49.6%

  const noImage = !imageUrl;

  return (
    <div 
      className="article-banner relative w-full"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div 
        className="relative w-full overflow-hidden"
        style={{ 
          paddingBottom,
          background: noImage 
            ? 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' 
            : undefined 
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Bannière article"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent">
            <div className="text-center text-white text-lg font-medium">
              <div className="mb-2">🎯 Mode Article</div>
              <div className="text-sm opacity-75">Cliquez ici pour ajouter une bannière</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleBanner;
