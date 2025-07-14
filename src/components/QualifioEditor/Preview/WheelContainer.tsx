
import React from 'react';
import { SmartWheel } from '../../SmartWheel';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';

interface WheelContainerProps {
  device: DeviceType;
  config: EditorConfig;
  isMode1?: boolean;
  isVisible?: boolean;
  onResult?: (segment: { id: string; label: string; color: string }) => void;
}

const WheelContainer: React.FC<WheelContainerProps> = ({ 
  device, 
  config, 
  isMode1 = false, 
  isVisible = true,
  onResult 
}) => {
  const wheelSegments = [
    { id: '1', label: 'Prix 3', color: '#4ECDC4' },
    { id: '2', label: 'Dommage', color: '#F7B731' },
    { id: '3', label: 'Prix 1', color: '#E74C3C' },
    { id: '4', label: 'Prix 2', color: '#26D0CE' }
  ];

  const handleWheelResult = (segment: any) => {
    console.log('Segment sélectionné:', segment);
    onResult?.(segment);
  };

  const getWheelSize = () => {
    switch (device) {
      case 'mobile':
        return 200;
      case 'tablet':
        return 280;
      case 'desktop':
      default:
        return 320;
    }
  };

  // Pour Mode 1, on cache la roue si isVisible est false
  if (isMode1 && !isVisible) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <SmartWheel 
        segments={wheelSegments}
        size={getWheelSize() * (isMode1 ? 0.8 : 1)}
        theme="modern"
        borderStyle={config.borderStyle || 'classic'}
        onResult={handleWheelResult}
        customButton={{
          text: isMode1 ? "Faire tourner" : "Remplir le formulaire",
          color: "#8E44AD",
          textColor: "#ffffff"
        }}
      />
    </div>
  );
};

export default WheelContainer;
