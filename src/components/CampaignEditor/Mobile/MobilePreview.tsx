
import React from 'react';
import MobileWheelPreview from '../../GameTypes/MobileWheelPreview';
import MobileButton from './MobileButton';
import MobileContent from './MobileContent';
import MobileOverlays from './MobileOverlays';
import { getScreenStyle, getContentLayoutStyle } from './styles';

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

  /**
   * Ajout d'un conteneur centré « scaled-fit-container », qui
   * garantit que le contenu a toujours 100% de largeur/hauteur du phone/tablette
   * mais SANS déborder, ni crop, ni scroll.
   * 
   * On utilise object-fit: contain + aspect-ratio + flex/center pour tout wrap.
   */
  const ScaledFitContainer: React.FC<{children: React.ReactNode, width: number, height: number}> = ({ children, width, height }) => (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{
        width: '100%',
        height: '100%',
        minWidth: width,
        minHeight: height,
        aspectRatio: `${width} / ${height}`,
        background: 'transparent',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div
        style={{
          width: width,
          height: height,
          aspectRatio: `${width} / ${height}`,
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          // Important pour empêcher "crop"
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  );

  // Use realistic device dimensions that match real mobile/tablet screens
  const deviceDims =
    previewMode === 'tablet'
      ? { width: 410, height: 590 } // iPad Pro 11" ratio scaled for preview (820x1180 * 0.5)
      : { width: 188, height: 406 }; // iPhone 13/14 ratio scaled for preview (375x812 * 0.5)

  const DeviceFrame = () => {
    if (previewMode === 'tablet') {
      return (
        <div className="relative">
          {/* Tablet Frame */}
          <div className="bg-gray-800 rounded-2xl p-4 shadow-2xl">
            <div className="bg-black rounded-xl p-2">
              <div className="bg-white rounded-lg overflow-hidden relative"
                   style={{ width: deviceDims.width, height: deviceDims.height }}>
                {/* Home indicator for tablet */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gray-400 rounded-full z-20"></div>
                {/* ----- Fit wrapper to prevent crop ----- */}
                <ScaledFitContainer width={deviceDims.width} height={deviceDims.height}>
                  <div style={{
                    ...getScreenStyle(mobileConfig),
                    width: '100%',
                    height: '100%',
                    aspectRatio: `${deviceDims.width} / ${deviceDims.height}`,
                    backgroundSize: 'contain', // "contain" = always 100%
                  }}>
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
                    <div style={getContentLayoutStyle(mobileConfig)}>
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
                </ScaledFitContainer>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Mobile frame
    return (
      <div className="relative">
        {/* Mobile Frame */}
        <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
          <div className="bg-black rounded-[1.5rem] p-1">
            <div className="bg-white rounded-[1.25rem] overflow-hidden relative"
                 style={{ width: deviceDims.width, height: deviceDims.height }}>
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black rounded-b-xl z-20"></div>
              
              {/* Status bar icons */}
              <div className="absolute top-1 left-2 right-2 flex justify-between items-center text-xs font-medium z-20">
                <span className="text-black text-[8px]">9:41</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-1 border border-black rounded-sm">
                    <div className="w-1.5 h-0.5 bg-black rounded-sm"></div>
                  </div>
                  <div className="w-3 h-1.5 border border-black rounded-sm relative">
                    <div className="w-2 h-1 bg-green-500 rounded-sm absolute top-0.5 left-0.5"></div>
                    <div className="w-0.5 h-0.5 bg-black rounded-sm absolute top-0.5 -right-0.5"></div>
                  </div>
                </div>
              </div>
              
              {/* Home indicator */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gray-400 rounded-full z-20"></div>
              
              {/* ------ Fit wrapper to prevent crop ------ */}
              <ScaledFitContainer width={deviceDims.width} height={deviceDims.height}>
                <div style={{
                  ...getScreenStyle(mobileConfig),
                  width: '100%',
                  height: '100%',
                  aspectRatio: `${deviceDims.width} / ${deviceDims.height}`,
                  backgroundSize: 'contain', // "contain" garantit jamais crop
                }}>
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
                  <div style={getContentLayoutStyle(mobileConfig)}>
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
              </ScaledFitContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DeviceFrame key={`mobile-preview-${campaign.gameSize}-${JSON.stringify(mobileConfig)}`} />
  );
};

export default MobilePreview;

