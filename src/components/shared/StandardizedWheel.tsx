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
  onComplete?: (prize: string) => void;
  className?: string;
  style?: React.CSSProperties;
  // Spin controls
  spinMode?: 'random' | 'instant_winner' | 'probability';
  speed?: 'slow' | 'medium' | 'fast';
  winProbability?: number;
  // External config handlers (optional)
  getCanonicalConfig?: (options?: { device?: string; shouldCropWheel?: boolean }) => any;
  updateWheelConfig?: (updates: any) => void;
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
  onComplete,
  className = '',
  style = {},
  spinMode,
  speed,
  winProbability,
}) => {
  // Configuration canonique via le service (évaluée à chaque rendu pour capter les mutations profondes)
  // Option A: ignorer toute fonction getCanonicalConfig potentiellement stale.
  // Toujours recalculer à partir des props courants pour éviter les closures obsolètes.
  const wheelConfig = WheelConfigService.getCanonicalWheelConfig(
    campaign,
    extractedColors,
    wheelModalConfig,
    { shouldCropWheel, device }
  );

  // Empreinte profonde des segments pour détecter les mutations in-place (id, label, couleurs, flags)
  const segmentsFingerprint = useMemo(() => {
    try {
      const raw = (wheelConfig?.segments || []).map((s: any, idx: number) => ({
        id: s?.id ?? String(idx + 1),
        label: s?.label ?? '',
        color: s?.color ?? '',
        textColor: s?.textColor ?? '',
        probability: s?.probability ?? null,
        isWinning: s?.isWinning ?? null
      }));
      return JSON.stringify(raw);
    } catch {
      return '[]';
    }
  // Include a deep stringified value to ensure rerender when content changes even if reference is stable
  }, [JSON.stringify(wheelConfig?.segments || [])]);

  // Segments standardisés (dépend de l'empreinte et des couleurs de fallback)
  const segments = useMemo(
    () => WheelConfigService.getStandardizedSegments(wheelConfig).map((segment: any) => ({
      ...segment,
      value: (segment as any).value || segment.label || segment.id
    })),
    [
      segmentsFingerprint,
      wheelConfig.customColors?.primary,
      wheelConfig.brandColors?.primary,
      wheelConfig.customColors?.secondary,
      wheelConfig.brandColors?.secondary
    ]
  );

  // Empreinte structurelle (id/probability/isWinning + ordre + longueur) pour décider d'un remount du composant
  const structuralSegmentsFingerprint = useMemo(() => {
    try {
      const raw = (wheelConfig?.segments || []).map((s: any, idx: number) => ({
        id: s?.id ?? String(idx + 1),
        probability: s?.probability ?? null,
        isWinning: s?.isWinning ?? null
      }));
      return `${(wheelConfig?.segments || []).length}|${JSON.stringify(raw)}`;
    } catch {
      return '0|[]';
    }
  }, [JSON.stringify(wheelConfig?.segments || [])]);

  // Key to force remount when structural segments or important visual config change (couleurs/labels ne remount pas)
  const wheelKey = useMemo(() => {
    try {
      return `${segments.length}-${structuralSegmentsFingerprint}-${wheelConfig.borderStyle}-${wheelConfig.borderWidth}-${wheelConfig.size}-${wheelConfig.showBulbs ? 1 : 0}`;
    } catch {
      return `${segments.length}-${wheelConfig.borderStyle}-${wheelConfig.size}`;
    }
  }, [segments.length, structuralSegmentsFingerprint, wheelConfig.borderStyle, wheelConfig.borderWidth, wheelConfig.size, wheelConfig.showBulbs]);

  // Lire la position directement depuis la campagne (source de vérité)
  const wheelPosition = useMemo(() => {
    const pos = (campaign?.design?.wheelConfig as any)?.position || wheelConfig.position || 'center';
    console.log('🎯 [StandardizedWheel] Position resolved:', {
      fromCampaign: (campaign?.design?.wheelConfig as any)?.position,
      fromWheelConfig: wheelConfig.position,
      final: pos
    });
    return pos;
  }, [campaign?.design?.wheelConfig, wheelConfig.position]);

  // Lire showBulbs directement depuis la campagne (source de vérité)
  // Par défaut: false (ampoules décochées)
  const resolvedShowBulbs = useMemo(() => {
    const campaignValue = (campaign?.design?.wheelConfig as any)?.showBulbs;
    const configValue = wheelConfig.showBulbs;
    
    // Si la valeur est explicitement définie (true ou false), on la respecte
    // Sinon, on force false par défaut
    const bulbs = campaignValue !== undefined ? campaignValue : (configValue !== undefined ? configValue : false);
    
    console.log('💡 [StandardizedWheel] ShowBulbs resolved:', {
      fromCampaign: campaignValue,
      fromWheelConfig: configValue,
      final: bulbs
    });
    return bulbs;
  }, [campaign?.design?.wheelConfig, wheelConfig.showBulbs]);

  // Styles de découpage
  const croppingStyles = useMemo(
    () => WheelConfigService.getWheelCroppingStyles(shouldCropWheel, wheelPosition, device as 'desktop' | 'tablet' | 'mobile'),
    [shouldCropWheel, wheelPosition, device]
  );

  // Resolve spin props from props -> campaign/config -> defaults
  const resolvedSpinMode: 'random' | 'instant_winner' | 'probability' =
    spinMode ||
    wheelModalConfig?.wheel?.mode ||
    wheelModalConfig?.mode ||
    campaign?.gameConfig?.wheel?.mode ||
    campaign?.config?.roulette?.mode ||
    'random';

  const resolvedSpeed: 'slow' | 'medium' | 'fast' =
    speed ||
    wheelModalConfig?.wheel?.speed ||
    wheelModalConfig?.speed ||
    campaign?.gameConfig?.wheel?.speed ||
    campaign?.config?.roulette?.speed ||
    'medium';

  const resolvedWinProbability =
    typeof winProbability === 'number' ? winProbability :
    (typeof wheelModalConfig?.wheel?.winProbability === 'number' ? wheelModalConfig?.wheel?.winProbability :
    (typeof wheelModalConfig?.winProbability === 'number' ? wheelModalConfig?.winProbability :
    (typeof campaign?.gameConfig?.wheel?.winProbability === 'number' ? campaign?.gameConfig?.wheel?.winProbability :
    (typeof campaign?.config?.roulette?.winProbability === 'number' ? campaign?.config?.roulette?.winProbability : undefined))));

  console.log('🎡 StandardizedWheel - Configuration:', {
    position: wheelConfig.position,
    shouldCropWheel,
    device,
    segments: segments.length,
    size: wheelConfig.size,
    scale: wheelConfig.scale
  });
  
  console.log('🎡 StandardizedWheel - Cropping styles:', croppingStyles);

  // Décalage géré via WheelConfigService.getWheelCroppingStyles (inset 150px)

  return (
    <div 
      className={`${croppingStyles.containerClass} ${className}`}
      style={{
        ...((croppingStyles as any).styles || {}),
        ...style
      }}
    >
      <div 
        className={croppingStyles.wheelClass}
        style={{
          transform: croppingStyles.transform || undefined
        }}
        onClick={(e) => {
          // Empêcher la propagation afin d'éviter les sélections ou autres handlers globaux
          e.stopPropagation();
          if (onClick) onClick();
        }}
      >
        <SmartWheel
          key={wheelKey}
          segments={segments}
          theme="modern"
          size={wheelConfig.size}
          borderStyle={wheelConfig.borderStyle}
          customBorderColor={wheelConfig.borderColor}
          customBorderWidth={wheelConfig.borderWidth}
          showBulbs={resolvedShowBulbs}

          brandColors={{
            primary: wheelConfig.brandColors?.primary || '#E0004D',
            secondary: wheelConfig.brandColors?.secondary || '#ffffff',
            accent: wheelConfig.brandColors?.accent || '#45b7d1'
          }}
          customButton={{
            text: 'GO',
            color: wheelConfig.borderColor,
            textColor: '#ffffff'
          }}
          buttonPosition="center"
          disabled={disabled}
          disablePointerAnimation={true}
          onSpin={onSpin}
          onComplete={onComplete}
          spinMode={resolvedSpinMode}
          speed={resolvedSpeed}
          winProbability={resolvedWinProbability}
        />
      </div>
    </div>
  );
};

export default StandardizedWheel;