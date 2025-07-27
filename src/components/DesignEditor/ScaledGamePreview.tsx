import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import GameCanvasPreview from '../ModernEditor/components/GameCanvasPreview';
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
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  
  // États pour la configuration de la roue
  const [wheelBorderStyle, setWheelBorderStyle] = useState(campaign?.design?.borderStyle || 'classic');
  const [wheelBorderColor, setWheelBorderColor] = useState(campaign?.design?.borderColor || '#841b60');
  const [wheelScale, setWheelScale] = useState(campaign?.design?.wheelScale || 1);

  // Capture d'écran de l'aperçu
  const capturePreview = async () => {
    if (previewRef.current) {
      try {
        console.log('🎯 Début de la capture d\'écran...');
        const canvas = await html2canvas(previewRef.current, {
          allowTaint: true,
          useCORS: true,
          scale: 1,
          backgroundColor: '#f3f4f6',
          logging: false,
          width: previewRef.current.offsetWidth,
          height: previewRef.current.offsetHeight
        });
        const url = canvas.toDataURL('image/png');
        console.log('✅ Capture réussie, URL générée');
        setScreenshotUrl(url);
      } catch (error) {
        console.error('❌ Erreur lors de la capture d\'écran:', error);
        // Fallback: afficher directement le composant
        setScreenshotUrl(null);
      }
    }
  };

  // Effect pour capturer l'aperçu quand la campagne change
  useEffect(() => {
    if (campaign?.type === 'wheel') {
      // Délai plus long et vérification du rendu
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          capturePreview();
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [campaign, selectedDevice, wheelBorderStyle, wheelBorderColor, wheelScale]);

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
    return (
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center bg-gray-100"
        style={{
          width: containerWidth,
          height: containerHeight
        }}
      >
        {/* Aperçu visible pour capture d'écran */}
        <div 
          ref={previewRef}
          className="fixed opacity-0 pointer-events-none"
          style={{ 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: -1 
          }}
        >
          <div
            className="relative bg-white shadow-lg rounded-lg overflow-hidden"
            style={{
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
        </div>

        {/* Affichage de la capture d'écran */}
        <div
          className="relative bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
          onClick={handleWheelClick}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: selectedDevice === 'desktop' ? '1200px' : selectedDevice === 'tablet' ? '768px' : '375px',
            height: selectedDevice === 'desktop' ? '800px' : selectedDevice === 'tablet' ? '1024px' : '667px'
          }}
        >
          {screenshotUrl ? (
            <img 
              src={screenshotUrl} 
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <GameCanvasPreview
              campaign={campaign}
              previewDevice={selectedDevice}
              disableForm={true}
              setCampaign={onCampaignChange}
            />
          )}
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