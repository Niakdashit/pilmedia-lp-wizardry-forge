
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
      textStyle.backgroundColor = config.frameColor || customText.frameColor || '#ffffff';
      textStyle.border = `1px solid ${config.frameBorderColor || customText.frameBorderColor || '#e5e7eb'}`;
      textStyle.padding = '8px 12px';
      textStyle.borderRadius = '4px';
      textStyle.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
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
    
    const imageStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${config.x || customImage.x || 0}px`,
      top: `${config.y || customImage.y || 0}px`,
      width: `${config.width || customImage.width || 100}px`,
      height: `${config.height || customImage.height || 100}px`,
      transform: `rotate(${config.rotation || customImage.rotation || 0}deg)`,
      zIndex: 99,
      pointerEvents: 'none',
      objectFit: 'cover',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };

    return (
      <img
        key={`image-${customImage.id}-${previewDevice}`}
        src={customImage.src}
        alt="Image personnalisée"
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
