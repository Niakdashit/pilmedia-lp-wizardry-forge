
import React from 'react';
import MobileWheelPreview from '../../GameTypes/MobileWheelPreview';
import MobileButton from './MobileButton';
import MobileContent from './MobileContent';
import MobileOverlays from './MobileOverlays';
import { getDeviceStyle, getScreenStyle, getContentLayoutStyle } from './styles';

interface MobilePreviewProps {
  campaign: any;
  previewMode: 'mobile' | 'tablet';
}

const MobilePreview: React.FC<MobilePreviewProps> = ({
  campaign,
  previewMode
}) => {
  const fallbackMobile = campaign.config?.mobileConfig || {};
  const mobileConfig = { ...fallbackMobile, ...(campaign.mobileConfig || {}) };
  const gamePosition = mobileConfig.gamePosition || 'left';
  const verticalOffset = mobileConfig.gameVerticalOffset || 0;
  const horizontalOffset = mobileConfig.gameHorizontalOffset || 0;

  const deviceStyle = getDeviceStyle();
  const screenStyle = getScreenStyle(mobileConfig);
  const contentLayoutStyle = getContentLayoutStyle(mobileConfig);

  // Get custom images for mobile
  const customImages = campaign.design?.customImages || [];

  // Helper function to get mobile-specific config for elements
  const getElementMobileConfig = (element: any) => {
    const mobileConfig = element.deviceConfig?.mobile;
    return {
      x: mobileConfig?.x ?? element.x ?? 0,
      y: mobileConfig?.y ?? element.y ?? 0,
      width: mobileConfig?.width ?? element.width ?? 100,
      height: mobileConfig?.height ?? element.height ?? 100
    };
  };

  return (
    <div style={deviceStyle} key={`mobile-preview-${campaign.gameSize}-${JSON.stringify(mobileConfig)}`}>
      <div style={screenStyle}>
        <MobileOverlays mobileConfig={mobileConfig} previewMode={previewMode} />

        {/* Game Container */}
        {campaign.type === 'wheel' && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            <MobileWheelPreview
              campaign={campaign}
              gamePosition={gamePosition}
              verticalOffset={verticalOffset}
              horizontalOffset={horizontalOffset}
            />
          </div>
        )}

        {/* Custom Images Layer */}
        {customImages.map((customImage: any) => {
          if (!customImage?.src) return null;
          
          const mobileConfig = getElementMobileConfig(customImage);
          
          return (
            <div
              key={`mobile-image-${customImage.id}`}
              style={{
                position: 'absolute',
                transform: `translate3d(${mobileConfig.x}px, ${mobileConfig.y}px, 0) rotate(${customImage.rotation || 0}deg)`,
                width: mobileConfig.width,
                height: mobileConfig.height,
                zIndex: 15,
                pointerEvents: 'none'
              }}
            >
              <img
                src={customImage.src}
                alt="Custom element"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
                draggable={false}
              />
            </div>
          );
        })}

        {/* Content Layer */}
        <div style={contentLayoutStyle}>
          <MobileContent 
            mobileConfig={mobileConfig} 
            campaign={campaign} 
            previewMode={previewMode} 
          />
        </div>

        {/* Button Layer - only show if not hidden */}
        {!mobileConfig.hideLaunchButton && (
          <MobileButton mobileConfig={mobileConfig} campaign={campaign} />
        )}
      </div>
    </div>
  );
};

export default MobilePreview;
