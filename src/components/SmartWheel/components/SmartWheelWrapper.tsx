
import React from 'react';
import SmartWheel from '../SmartWheel';
import { useWheelSync } from '../../../hooks/useWheelSync';

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
  // Nouveaux contrôles
  spinMode?: 'random' | 'instant_winner' | 'probability';
  winProbability?: number;
  speed?: 'slow' | 'medium' | 'fast';
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
  spinMode,
  winProbability,
  speed
}) => {
  // Déterminer les segments à utiliser - priorité aux segments du GameManagementPanel
  const segments = propSegments || 
                  (campaign as any)?.wheelConfig?.segments ||
                  campaign?.gameConfig?.wheel?.segments ||
                  campaign?.config?.roulette?.segments ||
                  config?.segments ||
                  [];

  console.log('🎯 SmartWheelWrapper: Segments resolution', {
    propSegments,
    campaignWheelConfig: (campaign as any)?.wheelConfig?.segments,
    finalSegments: segments,
    segmentCount: segments.length,
    campaignId: campaign?.id,
    lastUpdate: (campaign as any)?._lastUpdate
  });

  // Déterminer les couleurs de marque (besoin avant de mapper textColor)
  const resolvedBrandColors = brandColors || {
    primary: campaign?.design?.customColors?.primary || '#841b60',
    secondary: campaign?.design?.customColors?.secondary || '#4ecdc4',
    accent: campaign?.design?.customColors?.accent || '#45b7d1'
  };

  // Convertir au format SmartWheel si nécessaire
  const processedSegments = segments.map((segment: any) => {
    const isWhite = (val: any) => {
      try {
        const c = String(val || '').trim().toLowerCase();
        if (!c) return false;
        if (c === '#fff' || c === '#ffffff' || c === 'white') return true;
        return /^rgba?\(\s*255\s*,\s*255\s*,\s*255(\s*,\s*1\s*)?\)/.test(c);
      } catch { return false; }
    };
    const defaultTextColor = isWhite(segment.color) ? resolvedBrandColors.primary : '#ffffff';
    const processed = {
      id: segment.id,
      label: segment.label,
      color: segment.color,
      textColor: segment.textColor || defaultTextColor,
      probability: segment.probability || 1,
      prizeId: segment.prizeId,
      contentType: segment.contentType || (segment?.imageUrl ? 'image' : 'text'),
      imageUrl: segment.imageUrl,
      // Map imageUrl to icon for SmartWheel renderer compatibility
      icon: (segment.contentType || (segment?.imageUrl ? 'image' : undefined)) === 'image' && segment.imageUrl ? segment.imageUrl : segment.icon
    };
    
    console.log('🔄 SmartWheelWrapper processing segment:', {
      id: processed.id,
      contentType: processed.contentType,
      hasImageUrl: !!processed.imageUrl,
      hasIcon: !!processed.icon,
      label: processed.label
    });
    
    return processed;
  });

  // Résoudre les paramètres de spin depuis les props ou la configuration
  const resolvedSpinMode = spinMode ||
    campaign?.gameConfig?.wheel?.mode ||
    campaign?.config?.roulette?.mode ||
    config?.wheel?.mode ||
    config?.mode ||
    'random';

  const resolvedSpeed: 'slow' | 'medium' | 'fast' = speed ||
    campaign?.gameConfig?.wheel?.speed ||
    campaign?.config?.roulette?.speed ||
    config?.wheel?.speed ||
    config?.speed ||
    'medium';

  const resolvedWinProbability = typeof winProbability === 'number' ? winProbability :
    (typeof campaign?.gameConfig?.wheel?.winProbability === 'number' ? campaign?.gameConfig?.wheel?.winProbability :
    typeof campaign?.config?.roulette?.winProbability === 'number' ? campaign?.config?.roulette?.winProbability :
    typeof config?.wheel?.winProbability === 'number' ? config?.wheel?.winProbability :
    typeof config?.winProbability === 'number' ? config?.winProbability : undefined);

  // Gérer les callbacks multiples avec attribution de lots
  const handleResult = (segment: any) => {
    // Trouver le lot attribué à ce segment
    const assignedPrize = segment.prizeId ? 
      campaign?.prizes?.find((prize: any) => prize.id === segment.prizeId) : null;

    // Attribution du lot: incrémenter awardedUnits si un lot est gagné
    if (assignedPrize) {
      console.log('🏆 Prize won! Incrementing awardedUnits for prize:', assignedPrize.name);
      // Note: Prize allocation would be handled by the parent component
    }

    // Enrichir le segment avec les informations du lot
    const enrichedSegment = {
      ...segment,
      assignedPrize,
      hasWon: !!assignedPrize
    };

    // Callback principal
    if (onResult) {
      onResult(enrichedSegment);
    }

    // Callback de compatibilité
    if (onComplete) {
      const prizeLabel = assignedPrize ? assignedPrize.name : segment.label;
      onComplete(prizeLabel);
    }

    // Callback pour les funnels
    if (onFinish) {
      const isWin = !!assignedPrize || 
                   (!segment.label.toLowerCase().includes('dommage') && 
                    !segment.label.toLowerCase().includes('rejouer'));
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

  // Key to force remount when segments or size/bulbs change
  const showBulbsFlag = !!campaign?.design?.wheelConfig?.showBulbs;
  const wheelKey = React.useMemo(() => {
    try {
      const parts = processedSegments.map((s: any, idx: number) => `${s.id ?? idx}:${s.label ?? ''}:${s.color ?? ''}:${s.textColor ?? ''}:${s.contentType ?? 'text'}:${s.imageUrl ?? ''}`).join('|');
      return `${processedSegments.length}-${parts}-${finalSize}-${showBulbsFlag ? 1 : 0}`;
    } catch {
      return `${processedSegments.length}-${finalSize}`;
    }
  }, [processedSegments, finalSize, showBulbsFlag]);

  // Sync with shared store (SSOT)
  const { segments: syncedSegments } = useWheelSync({
    campaignId: campaign?.id,
    segments: processedSegments,
    config: {
      showBulbs: showBulbsFlag,
      size: finalSize,
      brandColors: resolvedBrandColors,
    },
  });

  return (
    <SmartWheel
      key={wheelKey}
      segments={syncedSegments}
      theme="modern"
      size={finalSize}
      brandColors={resolvedBrandColors}
      onResult={handleResult}
      onSpin={handleSpin}
      disabled={disabled}
      disablePointerAnimation={true}
      showBulbs={showBulbsFlag}
      spinMode={resolvedSpinMode}
      speed={resolvedSpeed}
      winProbability={resolvedWinProbability}
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
