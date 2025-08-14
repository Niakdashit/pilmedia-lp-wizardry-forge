
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

  const renderTextElement = (customText: any) => {
    if (!customText?.content && !customText?.text) return null;

    // Gestion du responsive : utiliser les propriétés responsives si disponibles
    const deviceConfig = customText.deviceConfig?.[previewDevice] || customText.responsive?.[previewDevice];
    const config = deviceConfig || customText;
    
    const textContent = customText.content || customText.text || 'Texte personnalisé';
    
    // Responsive font sizes based on device
    const getFontSize = () => {
      if (config.fontSize) return `${config.fontSize}px`;
      if (sizeMap[config.size || customText.size || 'base']) {
        return sizeMap[config.size || customText.size || 'base'];
      }
      // Fallback responsive sizing
      switch (previewDevice) {
        case 'mobile': return '14px';
        case 'tablet': return '16px';
        case 'desktop': return '18px';
        default: return '16px';
      }
    };

    // Responsive width calculations
    const getResponsiveWidth = () => {
      const width = config.width || customText.width;
      if (width) return `${width}px`;
      
      // Auto-width with device-appropriate max-width
      switch (previewDevice) {
        case 'mobile': return 'auto';
        case 'tablet': return 'auto';
        case 'desktop': return 'auto';
        default: return 'auto';
      }
    };

    const textStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${config.x || customText.x || 0}px`,
      top: `${config.y || customText.y || 0}px`,
      fontSize: getFontSize(),
      color: config.color || customText.color || '#ffffff',
      fontFamily: config.fontFamily || customText.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontWeight: config.fontWeight || customText.fontWeight || ((config.bold || customText.bold) ? 'bold' : 'normal'),
      fontStyle: config.fontStyle || customText.fontStyle || ((config.italic || customText.italic) ? 'italic' : 'normal'),
      textDecoration: config.textDecoration || customText.textDecoration || ((config.underline || customText.underline) ? 'underline' : 'none'),
      textAlign: config.textAlign || customText.textAlign || 'center',
      zIndex: 100,
      pointerEvents: 'auto', // Permettre les clics pour l'édition
      cursor: 'pointer',
      width: getResponsiveWidth(),
      height: config.height ? `${config.height}px` : 'auto',
      minWidth: '50px',
      lineHeight: '1.2',
      wordWrap: 'break-word',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)', // Améliorer la lisibilité
      display: 'flex',
      alignItems: 'center',
      justifyContent: config.textAlign || customText.textAlign || 'center',
      // Appliquer les styles personnalisés (customCSS) si disponibles
      ...(customText.customCSS || {}),
      ...(config.customCSS || {})
    };

    if (config.showFrame || customText.showFrame) {
      textStyle.backgroundColor = config.frameColor || customText.frameColor || 'rgba(255, 255, 255, 0.9)';
      textStyle.border = `1px solid ${config.frameBorderColor || customText.frameBorderColor || '#e5e7eb'}`;
      textStyle.padding = '8px 12px';
      textStyle.borderRadius = '4px';
      textStyle.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      textStyle.backdropFilter = 'blur(10px)';
    }

    return (
      <div
        key={`text-${customText.id}-${previewDevice}`}
        style={textStyle}
        title="Double-cliquez pour éditer"
      >
        <span style={{ width: '100%', textAlign: 'inherit' }}>
          {textContent}
        </span>
      </div>
    );
  };

  const renderImageElement = (customImage: any) => {
    if (!customImage?.src) return null;

    // Gestion du responsive : utiliser les propriétés responsives si disponibles
    const deviceConfig = customImage.deviceConfig?.[previewDevice] || customImage.responsive?.[previewDevice];
    const config = deviceConfig || customImage;
    
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
