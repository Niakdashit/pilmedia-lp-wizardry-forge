
import React from 'react';

interface GamePositionerProps {
  campaign: any;
  children: React.ReactNode;
}

const GamePositioner: React.FC<GamePositionerProps> = ({
  campaign,
  children
}) => {
  const getGameContentStyles = () => {
    const backgroundImage = campaign?.design?.backgroundImage || campaign?.design?.background;
    const gamePosition = campaign?.gamePosition || 'center';
    const offsetX = campaign?.design?.gameOffsetX || 0;
    const offsetY = campaign?.design?.gameOffsetY || 0;
    
    // Pour la roue, forcer toujours le centrage parfait sans décalage ni position
    if (campaign?.type === 'wheel') {
      return {
        width: '100%',
        height: '100%',
        minWidth: '1400px',
        minHeight: '900px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const,
        overflow: 'hidden',
        backgroundColor: campaign?.design?.backgroundColor || campaign?.design?.background || '#f3f4f6',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        // Ignorer complètement les offsets pour la roue
        transform: 'none'
      };
    }
    
    // Position mapping pour les autres types de jeux
    const positionStyles = {
      'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
      'top-center': { alignItems: 'flex-start', justifyContent: 'center' },
      'top-right': { alignItems: 'flex-start', justifyContent: 'flex-end' },
      'center-left': { alignItems: 'center', justifyContent: 'flex-start' },
      'center': { alignItems: 'center', justifyContent: 'center' },
      'center-right': { alignItems: 'center', justifyContent: 'flex-end' },
      'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
      'bottom-center': { alignItems: 'flex-end', justifyContent: 'center' },
      'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' }
    };

    return {
      width: '100%',
      height: '100%',
      minWidth: '1400px',
      minHeight: '900px',
      display: 'flex',
      ...positionStyles[gamePosition as keyof typeof positionStyles],
      position: 'relative' as const,
      overflow: 'hidden',
      backgroundColor: campaign?.design?.backgroundColor || campaign?.design?.background || '#f3f4f6',
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transform: offsetX || offsetY ? `translate(${offsetX}px, ${offsetY}px)` : undefined
    };
  };

  return (
    <div 
      className="w-full h-full overflow-auto"
      style={getGameContentStyles()}
    >
      {children}
    </div>
  );
};

export default GamePositioner;
