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
  const [showWheelConfig, setShowWheelConfig] = useState(false);
  
  // États pour la configuration de la roue
  const [wheelBorderStyle, setWheelBorderStyle] = useState(campaign?.design?.borderStyle || 'classic');
  const [wheelBorderColor, setWheelBorderColor] = useState(campaign?.design?.borderColor || '#841b60');
  const [wheelScale, setWheelScale] = useState(campaign?.design?.wheelScale || 1);

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

  // Gestionnaires pour la configuration de la roue
  const handleWheelClick = () => {
    if (campaign?.type === 'wheel') {
      setShowWheelConfig(true);
    }
  };

  const handleWheelConfigUpdate = (updates: any) => {
    if (onCampaignChange) {
      onCampaignChange({
        ...campaign,
        design: {
          ...campaign.design,
          ...updates
        }
      });
    }
  };

  const handleBorderStyleChange = (style: string) => {
    setWheelBorderStyle(style);
    handleWheelConfigUpdate({ borderStyle: style });
  };

  const handleBorderColorChange = (color: string) => {
    setWheelBorderColor(color);
    handleWheelConfigUpdate({ borderColor: color });
  };

  const handleScaleChange = (scale: number) => {
    setWheelScale(scale);
    handleWheelConfigUpdate({ wheelScale: scale });
  };

  // Rendu spécial pour les campagnes de type roue
  if (campaign?.type === 'wheel') {
    const segments = campaign?.design?.segments || [
      { id: '1', label: 'Segment 1', color: '#FF6B6B' },
      { id: '2', label: 'Segment 2', color: '#4ECDC4' },
      { id: '3', label: 'Segment 3', color: '#45B7D1' },
      { id: '4', label: 'Segment 4', color: '#96CEB4' },
      { id: '5', label: 'Segment 5', color: '#FFEAA7' },
      { id: '6', label: 'Segment 6', color: '#DDA0DD' }
    ];

    const backgroundImage = campaign?.design?.background?.type === 'image' ? campaign.design.background.value : null;

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
            height: selectedDevice === 'desktop' ? '800px' : selectedDevice === 'tablet' ? '1024px' : '667px',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div 
            className="w-full h-full flex justify-center"
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              paddingBottom: '-30%',
              transform: 'translateY(-20px)',
              height: '50%' // Coupe la roue en montrant seulement la moitié supérieure
            }}
          >
            <div 
              onClick={handleWheelClick} 
              className="cursor-pointer"
              style={{
                position: 'absolute',
                bottom: `-${(selectedDevice === 'mobile' ? 250 : selectedDevice === 'tablet' ? 300 : 350) * 0.5}px`, // Décale la roue vers le bas pour ne montrer que la partie supérieure
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              <SmartWheel
                segments={segments}
                size={selectedDevice === 'mobile' ? 250 : selectedDevice === 'tablet' ? 300 : 350}
                borderStyle={wheelBorderStyle}
                customBorderColor={wheelBorderColor}
                disabled={false}
                onSpin={() => {}}
                onResult={() => {}}
                gamePosition={{ x: 0, y: 0, scale: wheelScale }}
                buttonPosition="center"
                customButton={{
                  text: "TOURNER",
                  color: "#841b60",
                  textColor: "#FFFFFF"
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Scale info */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 rounded px-2 py-1">
          Scale: {Math.round(scale * 100)}%
        </div>

        {/* Modale de configuration */}
        <WheelConfigModal
          isOpen={showWheelConfig}
          onClose={() => setShowWheelConfig(false)}
          wheelBorderStyle={wheelBorderStyle}
          wheelBorderColor={wheelBorderColor}
          wheelScale={wheelScale}
          onBorderStyleChange={handleBorderStyleChange}
          onBorderColorChange={handleBorderColorChange}
          onScaleChange={handleScaleChange}
          selectedDevice={selectedDevice}
        />
      </div>
    );
  }

  // Rendu par défaut pour les autres types de campagnes
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