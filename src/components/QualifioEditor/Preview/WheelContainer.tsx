import React from 'react';
import { SmartWheel } from '../../SmartWheel';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';

interface WheelContainerProps {
  device: DeviceType;
  config: EditorConfig;
  isMode1?: boolean;
}

const WheelContainer: React.FC<WheelContainerProps> = ({ device, config, isMode1 = false }) => {
  const wheelSegments = [
    { id: '1', label: 'Prix 3', color: '#4ECDC4' },
    { id: '2', label: 'Dommage', color: '#F7B731' },
    { id: '3', label: 'Prix 1', color: '#E74C3C' },
    { id: '4', label: 'Prix 2', color: '#26D0CE' }
  ];

  const handleWheelResult = (segment: any) => {
    console.log('Segment sélectionné:', segment);
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

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <SmartWheel 
        segments={wheelSegments}
        size={getWheelSize() * (isMode1 ? 0.8 : 1)}
        theme="modern"
        borderStyle={config.borderStyle || 'classic'}
        onResult={handleWheelResult}
        customButton={{
          text: "Remplir le formulaire",
          color: "#8E44AD",
          textColor: "#ffffff"
        }}
      />
    </div>
  );
};

export default WheelContainer;