import React, { useRef, useEffect, useState } from 'react';
import GameCanvasPreview from '../ModernEditor/components/GameCanvasPreview';
import { SmartWheel } from '../SmartWheel';
import WheelConfigModal from './WheelConfigModal';

interface ScaledGamePreviewProps {
  campaign: any;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  containerWidth: number;
  containerHeight: number;
  onCampaignChange?: (campaign: any) => void;
}

const ScaledGamePreview: React.FC<ScaledGamePreviewProps> = ({
  campaign,
  selectedDevice,
  containerWidth,
  containerHeight,
  onCampaignChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [wheelConfig, setWheelConfig] = useState({
    borderStyle: campaign?.design?.wheel?.borderStyle || 'classic',
    borderColor: campaign?.design?.wheel?.borderColor || '#841b60',
    scale: campaign?.design?.wheel?.scale || 1
  });

  // Calculate the scale to fit the preview into the editor space
  useEffect(() => {
    // Original preview dimensions (these are the dimensions GameCanvasPreview uses)
    const previewDimensions = {
      desktop: { width: 1200, height: 800 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    };

    const original = previewDimensions[selectedDevice];
    
    // Calculate scale to fit while maintaining aspect ratio
    const scaleX = containerWidth / original.width;
    const scaleY = containerHeight / original.height;
    const finalScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    setScale(finalScale);
  }, [selectedDevice, containerWidth, containerHeight]);

  const handleWheelClick = () => {
    if (campaign?.type === 'wheel') {
      setShowWheelModal(true);
    }
  };

  const handleWheelConfigChange = (updates: Partial<typeof wheelConfig>) => {
    const newConfig = { ...wheelConfig, ...updates };
    setWheelConfig(newConfig);
    
    if (onCampaignChange) {
      const updatedCampaign = {
        ...campaign,
        design: {
          ...campaign.design,
          wheel: newConfig
        }
      };
      onCampaignChange(updatedCampaign);
    }
  };

  // Si c'est une roue, on utilise le rendu direct pour permettre l'interaction
  if (campaign?.type === 'wheel') {
    const segments = campaign?.gameConfig?.wheel?.segments || [
      { id: '1', label: 'Prize 1', probability: 25, color: '#FF6B6B' },
      { id: '2', label: 'Prize 2', probability: 25, color: '#4ECDC4' },
      { id: '3', label: 'Prize 3', probability: 25, color: '#45B7D1' },
      { id: '4', label: 'Prize 4', probability: 25, color: '#96CEB4' }
    ];

    const brandColors = {
      primary: campaign?.brandColors?.primary || '#FF6B6B',
      secondary: campaign?.brandColors?.secondary || '#4ECDC4'
    };

    return (
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center bg-gray-100"
        style={{
          width: containerWidth,
          height: containerHeight
        }}
      >
        <div
          className="relative bg-white shadow-lg rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: selectedDevice === 'desktop' ? '1200px' : selectedDevice === 'tablet' ? '768px' : '375px',
            height: selectedDevice === 'desktop' ? '800px' : selectedDevice === 'tablet' ? '1024px' : '667px',
            backgroundColor: campaign?.design?.background || '#ebf4f7',
            backgroundImage: campaign?.design?.backgroundImage ? `url(${campaign.design.backgroundImage})` : undefined,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          onClick={handleWheelClick}
        >
          <SmartWheel
            segments={segments}
            size={Math.min(300 * wheelConfig.scale, 
              selectedDevice === 'mobile' ? 250 : 
              selectedDevice === 'tablet' ? 350 : 400)}
            disabled={false}
            brandColors={brandColors}
            borderStyle={wheelConfig.borderStyle}
            customBorderColor={wheelConfig.borderColor}
            customButton={{
              text: campaign?.buttonConfig?.text || 'Tourner',
              color: campaign?.buttonConfig?.color || brandColors.primary,
              textColor: '#ffffff'
            }}
            onResult={(result) => {
              console.log('Wheel result:', result);
            }}
          />
        </div>
        
        {/* Scale info */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 rounded px-2 py-1">
          Scale: {Math.round(scale * 100)}% • Cliquez sur la roue pour configurer
        </div>

        <WheelConfigModal
          isOpen={showWheelModal}
          onClose={() => setShowWheelModal(false)}
          wheelBorderStyle={wheelConfig.borderStyle}
          wheelBorderColor={wheelConfig.borderColor}
          wheelScale={wheelConfig.scale}
          onBorderStyleChange={(style) => handleWheelConfigChange({ borderStyle: style })}
          onBorderColorChange={(color) => handleWheelConfigChange({ borderColor: color })}
          onScaleChange={(scale) => handleWheelConfigChange({ scale })}
          selectedDevice={selectedDevice}
        />
      </div>
    );
  }

  // Pour les autres types de jeux, utiliser GameCanvasPreview
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-gray-100"
      style={{
        width: containerWidth,
        height: containerHeight
      }}
    >
      <div
        className="relative bg-white shadow-lg rounded-lg overflow-hidden"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: selectedDevice === 'desktop' ? '1200px' : selectedDevice === 'tablet' ? '768px' : '375px',
          height: selectedDevice === 'desktop' ? '800px' : selectedDevice === 'tablet' ? '1024px' : '667px'
        }}
      >
        <GameCanvasPreview
          campaign={campaign}
          previewDevice={selectedDevice}
          disableForm={true}
          setCampaign={onCampaignChange}
        />
      </div>
      
      {/* Scale info */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 rounded px-2 py-1">
        Scale: {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default ScaledGamePreview;