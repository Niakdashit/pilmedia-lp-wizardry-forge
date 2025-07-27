
import React from 'react';
import { SmartWheel } from '../../SmartWheel';
import type { DeviceType, EditorConfig } from '../GameEditorLayout';
import { useWheelConfiguration } from '../../../hooks/useWheelConfiguration';

interface WheelContainerProps {
  device: DeviceType;
  config: EditorConfig;
  isMode1?: boolean;
  isVisible?: boolean;
  onResult?: (segment: { id: string; label: string; color: string }) => void;
  onShowParticipationModal?: () => void;
  onParticipationComplete?: (formData: any) => void;
  scale?: number;
}

const WheelContainer: React.FC<WheelContainerProps> = ({ 
  device, 
  config, 
  isMode1 = false, 
  isVisible = true,
  onResult,
  onShowParticipationModal,
  onParticipationComplete,
  scale = 1.7 // Échelle par défaut à 1.7x
}) => {
  // Configuration unifiée de la roue
  const wheelConfigSource = {
    brandAssets: config.brandAssets,
    wheelSegments: config.wheelSegments,
    gameConfig: config,
    design: { wheelBorderStyle: config.borderStyle }
  };

  const wheelConfig = useWheelConfiguration(
    wheelConfigSource,
    device,
    scale,
    400
  );

  const handleWheelResult = (segment: any) => {
    console.log('Segment sélectionné:', segment);
    onResult?.(segment);
  };

  // Pour Mode 1, on cache la roue si isVisible est false
  if (isMode1 && !isVisible) {
    return null;
  }

  // Forcer le centrage pour toutes les roues - pas de gamePosition spécifique

  return (
    <div 
      className="absolute inset-0 flex items-end justify-center w-full h-full"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        transform: 'translateY(60%)'
      }}
    >
      <SmartWheel 
        segments={wheelConfig.segments}
        size={wheelConfig.size * (isMode1 ? 0.8 : 1)}
        theme="modern"
        borderStyle={wheelConfig.borderStyle}
        customBorderColor={wheelConfig.customBorderColor}
        onResult={handleWheelResult}
        gamePosition={undefined}
        isMode1={isMode1}
        formFields={config.formFields}
        brandColors={wheelConfig.brandColors}
        buttonPosition={config.wheelButtonPosition === 'center' ? 'center' : 'bottom'}
        onShowParticipationModal={onShowParticipationModal}
        onParticipationComplete={onParticipationComplete}
        customButton={wheelConfig.customButton}
      />
    </div>
  );
};

export default WheelContainer;
