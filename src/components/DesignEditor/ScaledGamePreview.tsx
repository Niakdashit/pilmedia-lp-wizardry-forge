
import React, { useRef, useEffect, useState } from 'react';
import CanvasGameRenderer from '../funnels/components/CanvasGameRenderer';
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
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showWheelConfig, setShowWheelConfig] = useState(false);
  
  // États pour la configuration de la roue
  const [wheelBorderStyle, setWheelBorderStyle] = useState(campaign?.design?.borderStyle || 'classic');
  const [wheelBorderColor, setWheelBorderColor] = useState(campaign?.design?.borderColor || '#841b60');
  const [wheelScale, setWheelScale] = useState(campaign?.design?.wheelScale || 1);

  // Calculate the scale to fit the preview into the editor space
  useEffect(() => {
    // Real device dimensions for accurate preview
    const previewDimensions = {
      desktop: { width: 1200, height: 800 },
      tablet: { width: 768, height: 1024 }, // iPad standard
      mobile: { width: 375, height: 812 }   // iPhone 13/14 standard
    };

    const original = previewDimensions[selectedDevice];
    
    // Calculate scale to fit while maintaining aspect ratio
    const scaleX = containerWidth / original.width;
    const scaleY = containerHeight / original.height;
    
    let finalScale;
    if (selectedDevice === 'desktop') {
      finalScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    } else {
      // For mobile and tablet, use more aggressive scaling to fill space
      finalScale = Math.min(scaleX, scaleY) * 0.98; // Use 98% to minimize margins
    }
    
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
    return (
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center bg-gray-100"
        style={{
          width: containerWidth,
          height: containerHeight
        }}
      >
        {/* Aperçu principal - utilisé pour l'affichage ET la capture */}
        <div
          ref={previewRef}
          className="relative bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
          onClick={handleWheelClick}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: selectedDevice === 'desktop' ? '1200px' : selectedDevice === 'tablet' ? '768px' : '375px',
            height: selectedDevice === 'desktop' ? '800px' : selectedDevice === 'tablet' ? '1024px' : '812px'
          }}
        >
          <CanvasGameRenderer
            campaign={campaign}
            formValidated={true}
            showValidationMessage={false}
            previewMode={selectedDevice}
            onGameFinish={() => {}}
            onGameStart={() => {}}
            onGameButtonClick={handleWheelClick}
          />
          
          {/* Transparent overlay for configuration */}
          <div 
            className="absolute inset-0 bg-transparent cursor-pointer"
            onClick={handleWheelClick}
          />
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
          height: selectedDevice === 'desktop' ? '800px' : selectedDevice === 'tablet' ? '1024px' : '812px'
        }}
      >
        <CanvasGameRenderer
          campaign={campaign}
          formValidated={true}
          showValidationMessage={false}
          previewMode={selectedDevice}
          onGameFinish={() => {}}
          onGameStart={() => {}}
          onGameButtonClick={() => {}}
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
