
import React from 'react';
import SmartWheel from '../SmartWheel';

interface SmartWheelWrapperProps {
  // Props de compatibilité avec l'ancienne roue
  config?: any;
  campaign?: any;
  segments?: any[];
  size?: number;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  brandColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  onResult?: (segment: any) => void;
  onComplete?: (prize: string) => void;
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  onSpin?: () => void;
  disabled?: boolean;
  buttonLabel?: string;
  className?: string;
}

const SmartWheelWrapper: React.FC<SmartWheelWrapperProps> = ({
  config,
  campaign,
  segments: propSegments,
  size = 400,
  gameSize = 'medium',
  brandColors,
  onResult,
  onComplete,
  onFinish,
  onStart,
  onSpin,
  disabled = false,
  buttonLabel,
  className = ''
}) => {
  // Déterminer les segments à utiliser
  const segments = propSegments || 
                  campaign?.gameConfig?.wheel?.segments ||
                  campaign?.config?.roulette?.segments ||
                  config?.segments || [
    { id: '1', label: 'Prix 1', color: '#ff6b6b' },
    { id: '2', label: 'Prix 2', color: '#4ecdc4' },
    { id: '3', label: 'Prix 3', color: '#45b7d1' },
    { id: '4', label: 'Dommage', color: '#feca57' }
  ];

  // Convertir au format SmartWheel si nécessaire
  const smartWheelSegments = segments.map((segment: any, index: number) => ({
    id: segment.id || index.toString(),
    label: segment.label,
    color: segment.color,
    textColor: segment.textColor || '#ffffff',
    probability: segment.probability || 1
  }));

  // Déterminer les couleurs de marque
  const resolvedBrandColors = brandColors || {
    primary: campaign?.design?.customColors?.primary || '#841b60',
    secondary: campaign?.design?.customColors?.secondary || '#4ecdc4',
    accent: campaign?.design?.customColors?.accent || '#45b7d1'
  };

  // Gérer les callbacks multiples
  const handleResult = (segment: any) => {
    // Callback principal
    if (onResult) {
      onResult(segment);
    }

    // Callback de compatibilité
    if (onComplete) {
      onComplete(segment.label);
    }

    // Callback pour les funnels
    if (onFinish) {
      const isWin = !segment.label.toLowerCase().includes('dommage') && 
                   !segment.label.toLowerCase().includes('rejouer');
      onFinish(isWin ? 'win' : 'lose');
    }
  };

  const handleSpin = () => {
    if (onSpin) {
      onSpin();
    }
    if (onStart) {
      onStart();
    }
  };

  // Calculer la taille selon gameSize si fourni
  const finalSize = gameSize ? {
    'small': Math.min(size, 250),
    'medium': Math.min(size, 350),
    'large': Math.min(size, 450),
    'xlarge': Math.min(size, 550)
  }[gameSize] : size;

  return (
    <SmartWheel
      segments={smartWheelSegments}
      theme="modern"
      size={finalSize}
      brandColors={resolvedBrandColors}
      onResult={handleResult}
      onSpin={handleSpin}
      disabled={disabled}
      disablePointerAnimation={true}
      showBulbs={!!campaign?.design?.wheelConfig?.showBulbs}
      customButton={{
        text: buttonLabel || 
              campaign?.gameConfig?.wheel?.buttonLabel || 
              config?.buttonLabel || 
              'Faire tourner',
        color: resolvedBrandColors.primary,
        textColor: '#ffffff'
      }}
      className={className}
    />
  );
};

export default SmartWheelWrapper;
