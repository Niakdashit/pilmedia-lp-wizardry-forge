
import React from 'react';

interface CustomElementsRendererProps {
  customTexts: any[];
  customImages: any[];
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  sizeMap: Record<string, string>;
}

const CustomElementsRenderer: React.FC<CustomElementsRendererProps> = ({
  customTexts,
  customImages,
  previewDevice,
  sizeMap
}) => {
  const getElementDeviceConfig = (element: any) => {
    return element[previewDevice] || element;
  };

  const renderTextElement = (customText: any) => {
    if (!customText?.enabled) return null;

    const config = getElementDeviceConfig(customText);
    
    const textStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${config.x || customText.x || 0}px`,
      top: `${config.y || customText.y || 0}px`,
      fontSize: sizeMap[config.size || customText.size || 'base'] || '14px',
      color: config.color || customText.color || '#000000',
      fontFamily: config.fontFamily || customText.fontFamily || 'Inter, sans-serif',
      fontWeight: (config.bold || customText.bold) ? 'bold' : 'normal',
      fontStyle: (config.italic || customText.italic) ? 'italic' : 'normal',
      textDecoration: (config.underline || customText.underline) ? 'underline' : 'none',
      zIndex: 100,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      maxWidth: '400px',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };

    if (config.showFrame || customText.showFrame) {
      textStyle.backgroundColor = config.frameColor || customText.frameColor || 'rgba(0, 0, 0, 0.7)';
      textStyle.border = `2px solid ${config.frameBorderColor || customText.frameBorderColor || 'transparent'}`;
      textStyle.padding = '12px 16px';
      textStyle.borderRadius = '8px';
      textStyle.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      textStyle.backdropFilter = 'blur(4px)';
    }

    return (
      <div
        key={`text-${customText.id}-${previewDevice}`}
        style={textStyle}
      >
        {config.text || customText.text || 'Texte personnalisé'}
      </div>
    );
  };

  const renderImageElement = (customImage: any) => {
    if (!customImage?.src) return null;

    const config = getElementDeviceConfig(customImage);
    
    // Gérer le centrage horizontal
    let leftPosition;
    if (customImage.centered || (config.x || customImage.x) === 'center') {
      leftPosition = '50%';
    } else {
      leftPosition = `${config.x || customImage.x || 0}px`;
    }

    const imageStyle: React.CSSProperties = {
      position: 'absolute',
      left: leftPosition,
      top: `${config.y || customImage.y || 0}px`,
      width: `${config.width || customImage.width || 100}px`,
      height: `${config.height || customImage.height || 100}px`,
      transform: customImage.centered || (config.x || customImage.x) === 'center' 
        ? `translateX(-50%) rotate(${config.rotation || customImage.rotation || 0}deg)` 
        : `rotate(${config.rotation || customImage.rotation || 0}deg)`,
      zIndex: 150,
      pointerEvents: 'none',
      objectFit: 'contain',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    };

    return (
      <img
        key={`image-${customImage.id}-${previewDevice}`}
        src={customImage.src}
        alt="Logo"
        style={imageStyle}
        onError={(e) => {
          console.warn('Image failed to load:', customImage.src);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  };

  return (
    <>
      {/* Render custom images first (lower z-index) */}
      {customImages.map(renderImageElement)}
      
      {/* Render custom texts on top (higher z-index) */}
      {customTexts.map(renderTextElement)}
    </>
  );
};

export default CustomElementsRenderer;
