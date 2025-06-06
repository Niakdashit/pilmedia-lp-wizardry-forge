import React from 'react';
import GameCanvasPreview from '../CampaignEditor/GameCanvasPreview';

interface ModernEditorCanvasProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  gameSize: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
}

const ModernEditorCanvas: React.FC<ModernEditorCanvasProps> = ({
  campaign,
  previewDevice,
  gameSize,
  gamePosition
}) => {

  const getCanvasStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: campaign.design?.background || '#f8fafc',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'all 0.3s ease',
    };

    const baseBackground = campaign.design?.backgroundImage;
    const mobileBackground = campaign.design?.mobileBackgroundImage;
    const backgroundImage =
      previewDevice === 'mobile' && mobileBackground
        ? `url(${mobileBackground})`
        : baseBackground
        ? `url(${baseBackground})`
        : undefined;

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
          borderRadius: '12px',
          overflow: 'hidden'
        };
      case 'mobile':
        return {
          ...styleWithBackground,
          maxWidth: '375px',
          maxHeight: '812px',
          margin: '0 auto',
          border: '1px solid #e5e7eb',
          borderRadius: '20px',
          overflow: 'hidden'
        };
      default:
        return styleWithBackground;
    }
  };

  // Enhanced campaign with proper settings propagation
  const enhancedCampaign = {
    ...campaign,
    gameSize,
    gamePosition,
    // Ensure button configuration is properly synchronized
    buttonConfig: {
      ...campaign.buttonConfig,
      text: campaign.buttonConfig?.text || campaign.gameConfig?.[campaign.type]?.buttonLabel || 'Jouer',
      color: campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60'
    },
    // Enhanced design configuration
    design: {
      ...campaign.design,
      buttonColor: campaign.buttonConfig?.color || campaign.design?.buttonColor || '#841b60',
      titleColor: campaign.design?.titleColor || '#000000',
      background: campaign.design?.background || '#f8fafc'
    },
    // Enhanced game configuration
    gameConfig: {
      ...campaign.gameConfig,
      [campaign.type]: {
        ...campaign.gameConfig?.[campaign.type],
        buttonLabel: campaign.buttonConfig?.text || campaign.gameConfig?.[campaign.type]?.buttonLabel || 'Jouer',
        buttonColor: campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60',
        // Keep existing colors for other elements
        containerBackgroundColor: campaign.gameConfig?.[campaign.type]?.containerBackgroundColor,
        backgroundColor: campaign.gameConfig?.[campaign.type]?.backgroundColor,
        borderColor: campaign.gameConfig?.[campaign.type]?.borderColor,
        borderWidth: campaign.gameConfig?.[campaign.type]?.borderWidth,
        slotBorderColor: campaign.gameConfig?.[campaign.type]?.slotBorderColor,
        slotBorderWidth: campaign.gameConfig?.[campaign.type]?.slotBorderWidth,
        slotBackgroundColor: campaign.gameConfig?.[campaign.type]?.slotBackgroundColor,
      }
    }
  };

  const headerBanner = campaign.design?.headerBanner;
  const footerBanner = campaign.design?.footerBanner;
  const headerText = campaign.design?.headerText;
  const footerText = campaign.design?.footerText;
  const customText = campaign.design?.customText;

  const sizeMap: Record<string, string> = {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem'
  };

  const customTextPosition: Record<string, React.CSSProperties> = {
    top: { top: '8px', left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: '8px', left: '50%', transform: 'translateX(-50%)' },
    left: { left: '8px', top: '50%', transform: 'translateY(-50%)' },
    right: { right: '8px', top: '50%', transform: 'translateY(-50%)' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };


  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
      <div style={getCanvasStyle()} className="flex flex-col h-full w-full relative">
        {headerBanner?.enabled && (
          <div
            className="relative w-full"
            style={{
              backgroundImage: `url(${headerBanner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: headerBanner.height || '120px'
            }}
          >
            {headerBanner.overlay && (
              <div className="absolute inset-0 bg-black opacity-40" />
            )}
            {headerText?.enabled && (
              <div
                className="relative w-full text-center flex items-center justify-center h-full"
                style={{
                  color: headerText.color,
                  fontSize: sizeMap[headerText.size] || '1rem',
                  ...(headerText.showFrame
                    ? {
                        backgroundColor: headerText.frameColor,
                        border: `1px solid ${headerText.frameBorderColor}`,
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }
                    : {})
                }}
              >
                {headerText.text}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex relative">
          <GameCanvasPreview
            campaign={enhancedCampaign}
            className="w-full h-full"
            key={`preview-${gameSize}-${gamePosition}-${campaign.buttonConfig?.color}-${JSON.stringify(campaign.gameConfig?.[campaign.type])}`}
            previewDevice={previewDevice}
          />
          {customText?.enabled && (
            <div
              style={{
                position: 'absolute',
                ...customTextPosition[customText.position || 'top'],
                color: customText.color,
                fontSize: sizeMap[customText.size] || '1rem',
                ...(customText.showFrame
                  ? {
                      backgroundColor: customText.frameColor,
                      border: `1px solid ${customText.frameBorderColor}`,
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }
                  : {})
              }}
            >
              {customText.text}
            </div>
          )}
        </div>

        {footerBanner?.enabled && (
          <div
            className="relative w-full"
            style={{
              backgroundImage: `url(${footerBanner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: footerBanner.height || '120px'
            }}
          >
            {footerBanner.overlay && (
              <div className="absolute inset-0 bg-black opacity-40" />
            )}
            {footerText?.enabled && (
              <div
                className="relative w-full text-center flex items-center justify-center h-full"
                style={{
                  color: footerText.color,
                  fontSize: sizeMap[footerText.size] || '1rem',
                  ...(footerText.showFrame
                    ? {
                        backgroundColor: footerText.frameColor,
                        border: `1px solid ${footerText.frameBorderColor}`,
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }
                    : {})
                }}
              >
                {footerText.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernEditorCanvas;
