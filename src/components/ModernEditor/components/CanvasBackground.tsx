
import React from 'react';

interface CanvasBackgroundProps {
  children: React.ReactNode;
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  showGridLines: boolean;
  onCanvasClick: (e: React.MouseEvent) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  children,
  campaign,
  previewDevice,
  showGridLines,
  onCanvasClick,
  canvasRef
}) => {
  const getCanvasStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: campaign.design?.background || '#f8fafc',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'background-color 0.3s ease',
      position: 'relative' as const,
      overflow: 'hidden'
    };

    // Determine background image based on device
    let backgroundImage;
    if (previewDevice === 'mobile' && campaign.design?.mobileBackgroundImage) {
      backgroundImage = `url(${campaign.design.mobileBackgroundImage})`;
    } else if (previewDevice !== 'mobile' && campaign.design?.backgroundImage) {
      backgroundImage = `url(${campaign.design.backgroundImage})`;
    }

    const styleWithBackground = {
      ...baseStyle,
      backgroundImage,
    };

    switch (previewDevice) {
      case 'tablet':
        return {
          ...styleWithBackground,
          maxWidth: '768px',
          maxHeight: '1024px',
          margin: '0 auto',
          border: '1px solid #e5e7eb',
          borderRadius: '12px'
        };
      case 'mobile':
        return {
          ...styleWithBackground,
          maxWidth: '375px',
          maxHeight: '812px',
          margin: '0 auto',
          border: '1px solid #e5e7eb',
          borderRadius: '20px'
        };
      default:
        return styleWithBackground;
    }
  };

  return (
    <div 
      ref={canvasRef}
      style={getCanvasStyle()} 
      className="flex flex-col h-full w-full relative"
      onClick={onCanvasClick}
    >
      {/* Grid lines for alignment (optional visual aid) */}
      {showGridLines && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg width="100%" height="100%" className="opacity-20">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default CanvasBackground;
