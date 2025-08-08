import React, { useMemo } from 'react';
import { SmartWheel } from '../SmartWheel';
import { WheelConfigService } from '../../services/WheelConfigService';

interface StandardizedWheelProps {
  campaign: any;
  extractedColors?: string[];
  wheelModalConfig?: any;
  device?: string;
  shouldCropWheel?: boolean;
  disabled?: boolean;
  onSpin?: () => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Composant de roue standardisé qui applique une configuration unifiée
 * Assure la cohérence entre tous les contextes d'affichage
 */
const StandardizedWheel: React.FC<StandardizedWheelProps> = ({
  campaign,
  extractedColors = [],
  wheelModalConfig = {},
  device = 'desktop',
  shouldCropWheel = true,
  disabled = false,
  onSpin,
  onClick,
  className = '',
  style = {}
}) => {
  // Configuration canonique via le service
  const wheelConfig = useMemo(() => 
    WheelConfigService.getCanonicalWheelConfig(
      campaign,
      extractedColors,
      wheelModalConfig,
      { shouldCropWheel, device }
    ),
    [campaign, extractedColors, wheelModalConfig, shouldCropWheel, device]
  );

  // Segments standardisés
  const segments = useMemo(() => 
    WheelConfigService.getStandardizedSegments(wheelConfig),
    [wheelConfig]
  );

  // Styles de découpage
  const croppingStyles = useMemo(() => 
    WheelConfigService.getWheelCroppingStyles(shouldCropWheel),
    [shouldCropWheel]
  );

  console.log('🎡 StandardizedWheel - Rendu:', {
    wheelConfig,
    segments: segments.length,
    shouldCropWheel,
    device
  });
  
  console.log('🎡 StandardizedWheel - Taille finale:', {
    wheelSize: wheelConfig.size,
    wheelConfigSize: wheelConfig.size,
    scale: wheelConfig.scale
  });

  return (
    <div 
      className={`${croppingStyles.containerClass} ${className}`}
      style={{
        ...croppingStyles.styles,
        ...style
      }}
    >
      <div 
        className={croppingStyles.wheelClass}
        onClick={onClick}
      >
        <SmartWheel
          segments={segments}
          theme="modern"
          size={wheelConfig.size}
          borderStyle={wheelConfig.borderStyle}
          customBorderWidth={wheelConfig.borderWidth}
          showBulbs={wheelConfig.showBulbs}

          brandColors={{
            primary: wheelConfig.brandColors?.primary || '#841b60',
            secondary: wheelConfig.brandColors?.secondary || '#4ecdc4',
            accent: wheelConfig.brandColors?.accent || '#45b7d1'
          }}
          customButton={{
            text: 'GO',
            color: wheelConfig.borderColor,
            textColor: '#ffffff'
          }}
          buttonPosition="center"
          disabled={disabled}
          onSpin={onSpin}
        />
      </div>
    </div>
  );
};

export default StandardizedWheel;