
import React from 'react';
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';
import { WheelConfigService } from '../../services/WheelConfigService';
import { usePrizeLogic } from '../../hooks/usePrizeLogic';
import type { CampaignConfig } from '../../types/PrizeSystem';

interface WheelPreviewProps {
  campaign: any;
  config: {
    mode: 'instant_winner';
    winProbability: number;
    maxWinners?: number;
    winnersCount: number;
  };
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition?: string;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
  disabled?: boolean;
  wheelModalConfig?: any; // Configuration en temps réel depuis le Design Editor
  disableForm?: boolean;
  // Spin controls (optional overrides)
  spinMode?: 'random' | 'instant_winner' | 'probability';
  speed?: 'slow' | 'medium' | 'fast';
  winProbability?: number;
}

const WheelPreview: React.FC<WheelPreviewProps> = ({
  campaign,
  config: _config,
  onFinish,
  onStart,
  gameSize = 'medium',
  previewDevice = 'desktop',
  disabled = false,
  wheelModalConfig = {},
  spinMode,
  speed,
  winProbability
}) => {
  const { getResponsiveDimensions } = useGameSize(gameSize);
  const gameDimensions = getResponsiveDimensions(previewDevice);

  // Détermine le résultat en fonction du segment réellement gagné (lot attribué ou non)
  const handleResult = (segment: any) => {
    if (!onFinish) return;
    try {
      console.log('🎯 SmartWheel result segment:', {
        id: segment?.id,
        label: segment?.label,
        prizeId: segment?.prizeId,
        probability: segment?.probability
      });
    } catch {}
    const hasPrize = !!segment && segment.prizeId !== undefined && segment.prizeId !== null && String(segment.prizeId) !== '';
    onFinish(hasPrize ? 'win' : 'lose');
  };

  const handleSpin = () => {
    if (onStart) {
      onStart();
    }
  };

  // Utiliser la même logique de calcul que StandardizedWheel pour la cohérence
  // Passer wheelModalConfig pour synchroniser les modifications en temps réel
  const wheelConfig = WheelConfigService.getCanonicalWheelConfig(
    campaign,
    campaign?.design?.extractedColors || [],
    wheelModalConfig,
    { device: previewDevice, shouldCropWheel: true }
  );
  
  // Utiliser le nouveau système centralisé via usePrizeLogic
  const { segments } = usePrizeLogic({
    campaign: campaign as CampaignConfig,
    setCampaign: () => {} // Read-only pour l'aperçu
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('🎲 WheelPreview - Segments du nouveau système:', segments);
  }
  try {
    const ids = segments.map((s: any, i: number) => s.id ?? String(i + 1));
    console.log('🖥️ WheelPreview (desktop) - Segments du nouveau système:', {
      campaignId: campaign?.id,
      segmentCount: segments.length,
      ids,
      totalProbability: segments.reduce((sum: number, s: any) => sum + (s.probability || 0), 0)
    });
  } catch {}
  
  console.log('🎡 WheelPreview - Configuration unifiée:', {
    wheelConfigSize: wheelConfig.size,
    campaignScale: campaign?.design?.wheelConfig?.scale,
    previewDevice,
    gameDimensions
  });
  
  const wheelSize = wheelConfig.size || 200;

  // Styles de découpage/position selon la config unifiée
  const cropping = WheelConfigService.getWheelCroppingStyles(
    wheelConfig.shouldCropWheel ?? true,
    (wheelConfig.position as 'center' | 'left' | 'right') || 'center',
    (previewDevice as 'desktop' | 'tablet' | 'mobile')
  );
  
  console.log('🎡 WheelPreview - Taille finale:', {
    wheelSize,
    wheelConfigSize: wheelConfig.size,
    scale: wheelConfig.scale
  });

  // Resolve spin props from props -> wheelModalConfig -> campaign -> defaults
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

  // Animation: après validation du formulaire, si la roue est en position centre,
  // remonter automatiquement la roue de 25% (une seule fois)
  const [lifted, setLifted] = React.useState(false);
  const prevDisabled = React.useRef(disabled);
  React.useEffect(() => {
    // Déclenchement quand on passe de disabled=true (form non validé) à disabled=false (form validé)
    if (prevDisabled.current && !disabled && wheelConfig.position === 'center') {
      setLifted(true);
    }
    prevDisabled.current = disabled;
  }, [disabled, wheelConfig.position]);

  return (
    <div className="relative w-full h-full">
      {/* Wrapper animé pour décaler verticalement la roue après validation */}
      <div
        className="w-full h-full transition-transform duration-700 ease-out"
        style={{ transform: lifted ? 'translateY(-25%)' : 'translateY(0%)' }}
      >
        <div className={cropping.containerClass} style={cropping.styles as React.CSSProperties}>
          <SmartWheel
            key={(() => {
              try {
                const parts = segments.map((s: any, idx: number) => `${s.id ?? idx}:${s.label ?? ''}:${s.color ?? ''}:${s.textColor ?? ''}:${s.probability ?? 1}`).join('|');
                const keySpin = `${resolvedSpinMode}-${resolvedSpeed}-${typeof resolvedWinProbability === 'number' ? resolvedWinProbability : 'np'}`;
                return `${segments.length}-${parts}-${wheelConfig.borderStyle}-${wheelConfig.borderWidth}-${wheelSize}-${wheelConfig.showBulbs ? 1 : 0}-${keySpin}`;
              } catch {
                const fallbackSpin = `${resolvedSpinMode}-${resolvedSpeed}-${typeof resolvedWinProbability === 'number' ? resolvedWinProbability : 'np'}`;
                return `${segments.length}-${wheelConfig.borderStyle}-${wheelSize}-${fallbackSpin}`;
              }
            })()}
            segments={segments as any}
            theme="modern"
            size={wheelSize}
            brandColors={{
              primary: wheelConfig.brandColors?.primary || '#841b60',
              secondary: wheelConfig.brandColors?.secondary || '#ffffff',
              accent: wheelConfig.brandColors?.accent || '#45b7d1'
            }}
            onResult={handleResult}
            onSpin={handleSpin}
            disabled={disabled}
            disablePointerAnimation={true}
            borderStyle={wheelConfig.borderStyle}
            customBorderColor={wheelConfig.borderColor}
            customBorderWidth={wheelConfig.borderWidth}
            showBulbs={wheelConfig.showBulbs}
            buttonPosition="center"
            // Forcer le mode probabilité pour respecter les réglages des lots
            spinMode={'probability'}
            speed={resolvedSpeed}
            winProbability={resolvedWinProbability}
            customButton={{
              text: "GO",
              color: wheelConfig.borderColor,
              textColor: campaign.buttonConfig?.textColor || '#ffffff'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WheelPreview;
