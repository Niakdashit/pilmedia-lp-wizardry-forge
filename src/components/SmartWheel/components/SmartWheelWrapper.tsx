
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
  // Nouvelle prop pour forcer la mise à jour
  lastUpdate?: number;
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
  className = '',
  lastUpdate
}) => {
  // Utiliser lastUpdate pour forcer le re-render
  const renderKey = React.useMemo(() => {
    return `${lastUpdate || campaign?._lastUpdate || Date.now()}`;
  }, [lastUpdate, campaign?._lastUpdate]);

  // Déterminer les segments à utiliser
  const segments = React.useMemo(() => {
    const rawSegments = propSegments || 
                       campaign?.gameConfig?.wheel?.segments ||
                       campaign?.config?.roulette?.segments ||
                       config?.segments || [];

    // Si pas de segments, retourner segments par défaut
    if (!rawSegments || rawSegments.length === 0) {
      return [
        { id: '1', label: 'Prix 1', color: '#841b60', textColor: '#ffffff' },
        { id: '2', label: 'Dommage', color: '#4ecdc4', textColor: '#ffffff' }
      ];
    }

    // Convertir au format SmartWheel si nécessaire
    return rawSegments.map((segment: any, index: number) => ({
      id: segment.id || index.toString(),
      label: segment.label,
      color: segment.color,
      textColor: segment.textColor || '#ffffff',
      probability: segment.probability || 1
    }));
  }, [propSegments, campaign?.gameConfig?.wheel?.segments, campaign?.config?.roulette?.segments, config?.segments, renderKey]);

  // Déterminer les couleurs de marque
  const resolvedBrandColors = React.useMemo(() => {
    return brandColors || {
      primary: campaign?.design?.customColors?.primary || '#841b60',
      secondary: campaign?.design?.customColors?.secondary || '#4ecdc4',
      accent: campaign?.design?.customColors?.accent || '#45b7d1'
    };
  }, [brandColors, campaign?.design?.customColors, renderKey]);

  // Gérer les callbacks multiples
  const handleResult = React.useCallback((segment: any) => {
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
  }, [onResult, onComplete, onFinish]);

  const handleSpin = React.useCallback(() => {
    if (onSpin) {
      onSpin();
    }
    if (onStart) {
      onStart();
    }
  }, [onSpin, onStart]);

  // Calculer la taille selon gameSize si fourni
  const finalSize = React.useMemo(() => {
    if (gameSize) {
      return {
        'small': Math.min(size, 250),
        'medium': Math.min(size, 350),
        'large': Math.min(size, 450),
        'xlarge': Math.min(size, 550)
      }[gameSize];
    }
    return size;
  }, [gameSize, size]);

  const buttonText = React.useMemo(() => {
    return buttonLabel || 
           campaign?.gameConfig?.wheel?.buttonLabel || 
           config?.buttonLabel || 
           'Faire tourner';
  }, [buttonLabel, campaign?.gameConfig?.wheel?.buttonLabel, config?.buttonLabel, renderKey]);

  if (process.env.NODE_ENV !== 'production') {
    console.log('SmartWheelWrapper render:', {
      segments: segments.length,
      brandColors: resolvedBrandColors,
      buttonText,
      renderKey
    });
  }

  return (
    <SmartWheel
      key={renderKey} // Force re-render quand les données changent
      segments={segments}
      theme="modern"
      size={finalSize}
      brandColors={resolvedBrandColors}
      onResult={handleResult}
      onSpin={handleSpin}
      disabled={disabled}
      customButton={{
        text: buttonText,
        color: resolvedBrandColors.primary,
        textColor: '#ffffff'
      }}
      className={className}
    />
  );
};

export default SmartWheelWrapper;
