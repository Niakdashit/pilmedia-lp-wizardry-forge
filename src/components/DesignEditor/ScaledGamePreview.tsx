
import React, { useRef, useEffect, useState } from 'react';
import CanvasGameRenderer from '../funnels/components/CanvasGameRenderer';
import WheelConfigModal from './WheelConfigModal';
import { STANDARD_DEVICE_DIMENSIONS } from '../../utils/deviceDimensions';

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
  const [wheelBorderStyle, setWheelBorderStyle] = useState(campaign?.design?.wheelBorderStyle || campaign?.design?.borderStyle || 'classic');
  const [wheelBorderColor, setWheelBorderColor] = useState(campaign?.design?.wheelBorderColor || campaign?.design?.borderColor || '#841b60');
  const [wheelScale, setWheelScale] = useState(campaign?.design?.wheelScale || 1);

  // Synchroniser les états avec les changements de campaign
  useEffect(() => {
    if (campaign?.design) {
      setWheelBorderStyle(campaign.design.wheelBorderStyle || campaign.design.borderStyle || 'classic');
      setWheelBorderColor(campaign.design.wheelBorderColor || campaign.design.borderColor || '#841b60');
      setWheelScale(campaign.design.wheelScale || 1);
    }
  }, [campaign?.design]);

  // Calculate the scale to fit the preview into the editor space
  useEffect(() => {
    const original = STANDARD_DEVICE_DIMENSIONS[selectedDevice];
    
    // Calculate scale to fit while maintaining aspect ratio without padding
    const availableWidth = containerWidth;
    const availableHeight = containerHeight;
    
    const scaleX = availableWidth / original.width;
    const scaleY = availableHeight / original.height;
    
    let finalScale;
    if (selectedDevice === 'desktop') {
      finalScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    } else {
      // For mobile and tablet, use optimized scaling for maximum space utilization
      finalScale = Math.min(scaleX, scaleY); // Use full space
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
    handleWheelConfigUpdate({ wheelBorderStyle: style, borderStyle: style });
  };

  const handleBorderColorChange = (color: string) => {
    setWheelBorderColor(color);
    handleWheelConfigUpdate({ wheelBorderColor: color, borderColor: color });
  };

  const handleScaleChange = (scale: number) => {
    setWheelScale(scale);
    handleWheelConfigUpdate({ wheelScale: scale });
  };

  // Rendu spécial pour les campagnes de type roue
  if (campaign?.type === 'wheel') {
    const getDeviceFrame = () => {
      if (selectedDevice === 'desktop') {
        return "relative bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer";
      } else {
        return "relative cursor-pointer w-full h-full";
      }
    };

    const getContentFrame = () => {
      if (selectedDevice === 'desktop') {
        return "relative w-full h-full";
      } else {
        return "relative w-full h-full";
      }
    };

    return (
      <div 
        ref={containerRef}
        className={selectedDevice === 'desktop' ? "relative w-full h-full flex items-center justify-center" : selectedDevice === 'tablet' ? "relative w-full flex items-start justify-center pt-8 p-4 pb-8" : "relative w-full h-full flex items-center justify-center p-4"}
        style={{
          width: containerWidth,
          height: selectedDevice === 'tablet' ? 'auto' : containerHeight,
          minHeight: selectedDevice === 'tablet' ? containerHeight : undefined
        }}
      >
        {/* Aperçu principal - utilisé pour l'affichage ET la capture */}
        <div
          ref={previewRef}
          className={getDeviceFrame()}
          onClick={handleWheelClick}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: `${STANDARD_DEVICE_DIMENSIONS[selectedDevice].width}px`,
            height: `${STANDARD_DEVICE_DIMENSIONS[selectedDevice].height}px`
          }}
        >
          <div className={getContentFrame()}>
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
        </div>
        
        {/* Scale info - only show on desktop */}
        {selectedDevice === 'desktop' && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 rounded px-2 py-1">
            Scale: {Math.round(scale * 100)}%
          </div>
        )}

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
  const getDeviceFrame = () => {
    if (selectedDevice === 'desktop') {
      return "relative bg-white shadow-lg rounded-lg overflow-hidden";
    } else {
      return "relative w-full h-full";
    }
  };

  const getContentFrame = () => {
    if (selectedDevice === 'desktop') {
      return "relative w-full h-full";
    } else {
      return "relative w-full h-full";
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      style={{
        width: containerWidth,
        height: containerHeight
      }}
    >
      <div
        className={getDeviceFrame()}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: `${STANDARD_DEVICE_DIMENSIONS[selectedDevice].width}px`,
          height: `${STANDARD_DEVICE_DIMENSIONS[selectedDevice].height}px`
        }}
      >
        <div className={getContentFrame()}>
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
      </div>
      
      {/* Scale info - only show on desktop */}
      {selectedDevice === 'desktop' && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 rounded px-2 py-1">
          Scale: {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};

export default ScaledGamePreview;
