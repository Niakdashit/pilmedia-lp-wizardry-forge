
import React from 'react';
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';
import { WheelConfigService } from '../../services/WheelConfigService';

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
  
  // Segments standardisés dérivés de la configuration canonique (identiques à l'édition)
  const segments = React.useMemo(
    () => WheelConfigService.getStandardizedSegments(wheelConfig),
    [
      // Inclure une empreinte profonde pour capter les mutations
      JSON.stringify(wheelConfig?.segments || []),
      wheelConfig.customColors?.primary,
      wheelConfig.brandColors?.primary,
      wheelConfig.customColors?.secondary,
      wheelConfig.brandColors?.secondary
    ]
  );
  try {
    const ids = (segments as any[]).map((s: any, i: number) => s.id ?? String(i + 1));
    console.log('🖥️ WheelPreview (desktop) - standardized segments', {
      campaignId: campaign?.id,
      sourceCount: (wheelConfig?.segments || []).length,
      outCount: (segments as any[]).length,
      ids
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

  // Construire des probabilités par segment selon les lots (méthodes calendrier / probabilité)
  const segmentsWithWeights = React.useMemo(() => {
    const segs = [...segments] as any[];
    const prizes: any[] = Array.isArray(campaign?.prizes) ? campaign.prizes : [];
    if (segs.length === 0) return segs;

    // Index des lots par id et comptage de segments par lot
    const normId = (v: any) => (v === null || v === undefined ? undefined : String(v));
    const prizeById = new Map<string, any>();
    prizes.forEach((p) => {
      const key = normId(p?.id);
      if (key) prizeById.set(key, p);
    });

    const segsByPrize = new Map<string, number>();
    segs.forEach((s) => {
      const pid = normId(s?.prizeId);
      if (pid) {
        segsByPrize.set(pid, (segsByPrize.get(pid) || 0) + 1);
      }
    });

    // Normalisation des méthodes et lecture robuste du pourcentage
    const normalizeMethod = (m: any): 'probability' | 'calendar' | 'immediate' | string => {
      const s = String(m ?? '').trim().toLowerCase();
      if (['probability', 'probabilite', 'probabilité', 'percentage', 'percent', 'pourcentage'].includes(s)) return 'probability';
      if (['calendar', 'calendrier', 'schedule', 'scheduled', 'date'].includes(s)) return 'calendar';
      if (['immediate', 'immédiat', 'immediat', 'instant', 'instant_winner'].includes(s)) return 'immediate';
      return s;
    };

    const getProbabilityPercent = (prize: any): number => {
      const candidates = [
        prize?.probabilityPercent,
        prize?.probability,
        prize?.percentage,
        prize?.percent
      ];
      for (const c of candidates) {
        const n = Number(c);
        if (Number.isFinite(n)) return n;
      }
      return 0;
    };

    // Détermine si un lot calendrier est "actif maintenant" (fenêtre de temps)
    const now = new Date();
    const parseLocalDateTime = (dateStr: string, timeStr: string) => {
      // Parse en heure locale pour éviter un décalage UTC implicite
      // dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm'
      try {
        const [y, m, d] = dateStr.split('-').map((n: string) => parseInt(n, 10));
        const [hh, mm] = timeStr.split(':').map((n: string) => parseInt(n, 10));
        return new Date(y, (m - 1), d, hh, mm, 0, 0);
      } catch {
        return new Date(`${dateStr}T${timeStr}:00`);
      }
    };
    const getWindow = (p: any): [Date, Date] | null => {
      try {
        const start = parseLocalDateTime(p.startDate, p.startTime);
        const end = (p.endDate && p.endTime)
          ? parseLocalDateTime(p.endDate, p.endTime)
          : new Date(start.getTime() + 60_000); // par défaut: 1 minute après le début
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
        // Garantir start <= end
        if (end.getTime() < start.getTime()) return [end, start];
        return [start, end];
      } catch {
        return null;
      }
    };

    const calendarEligiblePrizeIds: string[] = prizes
      .filter((p) => (normalizeMethod(p?.method) === 'calendar') && p.startDate && p.startTime)
      .filter((p) => {
        const win = getWindow(p);
        if (!win) return false;
        const [start, end] = win;
        const nowMs = now.getTime();
        return nowMs >= start.getTime() && nowMs <= end.getTime();
      })
      // Only keep calendar prizes that are available and actually linked to at least one segment
      .filter((p) => {
        const pid = normId(p?.id);
        if (!pid) return false;
        const available = typeof p.totalUnits === 'number' && typeof p.awardedUnits === 'number'
          ? (p.totalUnits - p.awardedUnits) > 0
          : true;
        const count = Math.max(0, segsByPrize.get(pid) || 0);
        return available && count > 0;
      })
      .map((p) => normId(p.id)!)
      .filter(Boolean) as string[];

    // Helper: met à jour en place la probabilité d'un segment
    const setProb = (idx: number, value: number) => {
      segs[idx] = { ...segs[idx], probability: value };
    };

    // Si un ou plusieurs lots calendrier sont actifs : garantir le gain sur ces lots
    if (calendarEligiblePrizeIds.length > 0) {
      // Poids réparti d'abord par lot, puis par nombre de segments associés au lot
      const perPrizeWeight = 100 / calendarEligiblePrizeIds.length;
      // Tout mettre à 0 par défaut
      for (let i = 0; i < segs.length; i++) setProb(i, 0);

      calendarEligiblePrizeIds.forEach((pid) => {
        const count = Math.max(1, segsByPrize.get(pid) || 0);
        const perSegment = perPrizeWeight / count;
        segs.forEach((s, idx) => {
          if (normId(s?.prizeId) === pid) setProb(idx, perSegment);
        });
      });
      try {
        console.log('🗓️ Calendar gating active. Weights per segment:', segs.map((s: any) => ({ id: s.id, label: s.label, prizeId: s.prizeId, probability: s.probability })));
      } catch {}
      return segs;
    }

    // Bypass: si un (ou plusieurs) lot(s) a une probabilité de 100%, forcer ce(s) lot(s)
    const forced100Prizes = prizes
      .filter((p) => {
        const pid = normId(p?.id);
        if (!pid) return false;
        const available = typeof p.totalUnits === 'number' && typeof p.awardedUnits === 'number'
          ? (p.totalUnits - p.awardedUnits) > 0
          : true;
        const linked = Math.max(0, segsByPrize.get(pid) || 0) > 0;
        const method = normalizeMethod(p?.method);
        const pcent = getProbabilityPercent(p);
        return available && linked && method !== 'calendar' && pcent >= 100;
      });

    if (forced100Prizes.length > 0) {
      for (let i = 0; i < segs.length; i++) setProb(i, 0);
      const perPrizeWeight = 100 / forced100Prizes.length;
      forced100Prizes.forEach((p) => {
        const pid = normId(p?.id)!;
        const count = Math.max(1, segsByPrize.get(pid) || 0);
        const perSegment = perPrizeWeight / count;
        segs.forEach((s, idx) => {
          if (normId(s?.prizeId) === pid) setProb(idx, perSegment);
        });
      });
      try {
        console.log('🔒 Forced 100% prize bypass active. Weights per segment:', segs.map((s: any) => ({ id: s.id, prizeId: s.prizeId, p: s.probability })));
      } catch {}
      return segs;
    }

    // Mode probabilité : appliquer les pourcentages des lots et répartir le résiduel sur les segments "perdants"
    // D'abord initialiser à 0 pour éviter des poids implicites
    for (let i = 0; i < segs.length; i++) setProb(i, 0);

    // Somme des probabilités utilisées par les lots
    let used = 0;
    segs.forEach((s, idx) => {
      const pid = normId(s?.prizeId);
      if (!pid) return; // segment perdant pour l'instant
      const prize = prizeById.get(pid);
      if (!prize) return;
      // Si le lot n'a plus d'unités disponibles, ignorer
      const available = typeof prize.totalUnits === 'number' && typeof prize.awardedUnits === 'number'
        ? (prize.totalUnits - prize.awardedUnits) > 0
        : true;
      if (!available) return;
      const method = normalizeMethod(prize.method);
      const pRaw = getProbabilityPercent(prize);
      if (method === 'probability' || method === 'immediate' || pRaw > 0) {
        const p = Math.max(0, Math.min(100, Number(pRaw)));
        const count = Math.max(1, segsByPrize.get(pid) || 0);
        const perSegment = p / count;
        if (perSegment > 0) {
          setProb(idx, perSegment);
          used += perSegment;
        }
      } else if (method === 'calendar') {
        // Hors créneau: le segment est perdant => 0, le résiduel sera pour les perdants
      }
    });

    // Si la somme dépasse 100, normaliser pour éviter la dilution
    if (used > 100) {
      const factor = 100 / used;
      for (let i = 0; i < segs.length; i++) {
        const v = typeof (segs[i] as any).probability === 'number' ? (segs[i] as any).probability : 0;
        setProb(i, v * factor);
      }
      used = 100;
    }

    const residual = Math.max(0, 100 - used);
    // Segments perdants = sans lot ou lots calendrier non actifs ou lots épuisés
    const losingIndices: number[] = [];
    segs.forEach((s, idx) => {
      const pid = normId(s?.prizeId);
      if (!pid) {
        losingIndices.push(idx);
        return;
      }
      const prize = prizeById.get(pid);
      const available = prize ? ((prize.totalUnits - prize.awardedUnits) > 0) : false;
      const isCalendar = normalizeMethod(prize?.method) === 'calendar';
      if (!prize || !available || isCalendar) {
        losingIndices.push(idx);
      }
    });

    if (residual > 0 && losingIndices.length > 0) {
      const perLose = residual / losingIndices.length;
      losingIndices.forEach((i) => setProb(i, perLose));
    }

    try {
      const total = segs.reduce((sum, s: any) => sum + (typeof s.probability === 'number' ? s.probability : 0), 0);
      console.log('🎲 Probability mode weights:', {
        segments: segs.map((s: any) => ({ id: s.id, label: s.label, prizeId: s.prizeId, probability: s.probability })),
        used,
        residual,
        total
      });
    } catch {}

    return segs;
  }, [segments, campaign?.prizes]);

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
                const parts = segments.map((s: any, idx: number) => `${s.id ?? idx}:${s.label ?? ''}:${s.color ?? ''}:${s.textColor ?? ''}`).join('|');
                const keySpin = `${resolvedSpinMode}-${resolvedSpeed}-${typeof resolvedWinProbability === 'number' ? resolvedWinProbability : 'np'}`;
                return `${segments.length}-${parts}-${wheelConfig.borderStyle}-${wheelConfig.borderWidth}-${wheelSize}-${wheelConfig.showBulbs ? 1 : 0}-${keySpin}`;
              } catch {
                const fallbackSpin = `${resolvedSpinMode}-${resolvedSpeed}-${typeof resolvedWinProbability === 'number' ? resolvedWinProbability : 'np'}`;
                return `${segments.length}-${wheelConfig.borderStyle}-${wheelSize}-${fallbackSpin}`;
              }
            })()}
            segments={segmentsWithWeights as any}
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
