
import React from 'react';
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';
import { usePrizeLogic } from '../../hooks/usePrizeLogic';
import type { CampaignConfig } from '../../types/PrizeSystem';

interface WheelProps {
  config: any;
  isPreview?: boolean;
  onComplete?: (prize: string) => void;
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  currentWinners?: number;
  maxWinners?: number;
  winRate?: number;
  disabled?: boolean;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  campaign?: any; // Ajouter le campaign pour récupérer le style de bordure
}

const Wheel: React.FC<WheelProps> = ({ 
  config, 
  isPreview = false, 
  onComplete, 
  onFinish,
  onStart,
  disabled = false,
  gameSize = 'small',
  campaign
}) => {
  const { getGameDimensions } = useGameSize(gameSize);
  const gameDimensions = getGameDimensions();
  
  // Configuration par défaut si aucune config fournie
  const defaultSegments = [
    { id: '1', label: 'Prix 1', color: '#ff6b6b' },
    { id: '2', label: 'Prix 2', color: '#4ecdc4' },
    { id: '3', label: 'Prix 3', color: '#45b7d1' },
    { id: '4', label: 'Prix 4', color: '#96ceb4' },
    { id: '5', label: 'Dommage', color: '#feca57' },
    { id: '6', label: 'Rejouer', color: '#ff9ff3' }
  ];

  // Utiliser le nouveau système centralisé
  const { segments: computedSegments } = usePrizeLogic({
    campaign: campaign as CampaignConfig,
    setCampaign: () => {} // Read-only
  });

  const segments = computedSegments.length > 0 ? computedSegments : defaultSegments;
  
  // Calculer la taille de la roue en fonction des dimensions du jeu
  const wheelSize = Math.min(gameDimensions.width, gameDimensions.height) - 40;

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
      const pid = normId((s as any)?.prizeId);
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

    // Détermine si un lot calendrier est "actif maintenant" (égalité à la minute)
    const now = new Date();
    const sameMinute = (d: Date, n: Date) =>
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate() &&
      d.getHours() === n.getHours() &&
      d.getMinutes() === n.getMinutes();

    const calendarEligiblePrizeIds: string[] = prizes
      .filter((p) => (normalizeMethod(p?.method) === 'calendar') && p.startDate && p.startTime)
      .filter((p) => {
        try {
          const dateStr = `${p.startDate}T${p.startTime}:00`;
          const dt = new Date(dateStr);
          return sameMinute(dt, now);
        } catch {
          return false;
        }
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
          if (normId((s as any)?.prizeId) === pid) setProb(idx, perSegment);
        });
      });
      try {
        console.log('🗓️ Calendar gating active (live). Weights per segment:', segs.map((s: any) => ({ id: s.id, label: s.label, prizeId: (s as any).prizeId, probability: s.probability })));
      } catch {}
      return segs;
    }

    // Mode probabilité : appliquer les pourcentages des lots et répartir le résiduel sur les segments "perdants"
    // D'abord initialiser à 0 pour éviter des poids implicites
    for (let i = 0; i < segs.length; i++) setProb(i, 0);

    // Somme des probabilités utilisées par les lots
    let used = 0;
    segs.forEach((s, idx) => {
      const pid = normId((s as any)?.prizeId);
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

    const residual = Math.max(0, 100 - used);
    // Segments perdants = sans lot ou lots calendrier non actifs ou lots épuisés
    const losingIndices: number[] = [];
    segs.forEach((s, idx) => {
      const pid = normId((s as any)?.prizeId);
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
      console.log('🎲 Probability mode weights (live):', {
        segments: segs.map((s: any) => ({ id: s.id, label: s.label, prizeId: (s as any).prizeId, probability: s.probability })),
        used,
        residual,
        total
      });
    } catch {}

    return segs;
  }, [segments, campaign?.prizes]);

  const handleResult = (segment: any) => {
    // Appeler onComplete si fourni (pour la compatibilité)
    if (onComplete) {
      onComplete(segment.label);
    }
    
    // Appeler onFinish si fourni (pour la cohérence avec les autres jeux)
    if (onFinish) {
      // Simuler un résultat win/lose - si c'est "Dommage" ou "Rejouer" = lose, sinon win
      const result = segment.label.toLowerCase().includes('dommage') || 
                    segment.label.toLowerCase().includes('rejouer') ? 'lose' : 'win';
      onFinish(result);
    }
  };

  const handleSpin = () => {
    if (onStart) {
      onStart();
    }
  };

  // Couleurs de marque par défaut
  const brandColors = {
    primary: '#841b60',
    secondary: '#4ecdc4',
    accent: '#45b7d1'
  };

  // Récupérer le style de bordure depuis la campaign ou utiliser le style par défaut
  const borderStyle = campaign?.design?.wheelBorderStyle || 
                      config?.wheel?.borderStyle || 
                      'classic';

  // Propagation de l'option d'ampoules depuis la campagne ou la config
  const showBulbs = (campaign?.design?.wheelConfig?.showBulbs ?? config?.wheel?.showBulbs) ?? false;

  // Résoudre les paramètres de spin (mode, vitesse, probabilité de gain)
  const resolvedSpinMode = 
    campaign?.gameConfig?.wheel?.mode ??
    config?.wheel?.mode ??
    config?.mode ??
    'random';

  const resolvedSpeed: 'slow' | 'medium' | 'fast' = 
    (campaign?.gameConfig?.wheel?.speed ??
    config?.wheel?.speed ??
    config?.speed ??
    'medium');

  const resolvedWinProbability = 
    (typeof campaign?.gameConfig?.wheel?.winProbability === 'number') ? campaign?.gameConfig?.wheel?.winProbability :
    (typeof config?.wheel?.winProbability === 'number') ? config?.wheel?.winProbability :
    (typeof config?.winProbability === 'number') ? config?.winProbability : undefined;

  // Si des poids non nuls sont présents, on bascule automatiquement en mode 'probability'
  const weightsMeta = React.useMemo(() => {
    const total = Array.isArray(segmentsWithWeights)
      ? segmentsWithWeights.reduce((sum: number, s: any) => sum + (typeof s?.probability === 'number' ? s.probability : 0), 0)
      : 0;
    const nonZero = Array.isArray(segmentsWithWeights)
      ? segmentsWithWeights.filter((s: any) => (s?.probability ?? 0) > 0).length
      : 0;
    return { total, nonZero };
  }, [segmentsWithWeights]);

  const effectiveSpinMode = (resolvedSpinMode !== 'probability' && weightsMeta.total > 0 && weightsMeta.nonZero > 0)
    ? 'probability'
    : resolvedSpinMode;

  try {
    console.log('[Wheel] spin mode', { resolvedSpinMode, effectiveSpinMode, weightsMeta });
  } catch {}

  // Force remount when segments or visual config change
  const wheelKey = React.useMemo(() => {
    try {
      const parts = segments.map((s: any, idx: number) => `${s.id ?? idx}:${s.label ?? ''}:${s.color ?? ''}:${s.textColor ?? ''}`).join('|');
      return `${segments.length}-${parts}-${borderStyle}-${wheelSize}-${showBulbs ? 1 : 0}`;
    } catch {
      return `${segments.length}-${borderStyle}-${wheelSize}`;
    }
  }, [segments, borderStyle, wheelSize, showBulbs]);

  if (!isPreview) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Configuration de la roue disponible en mode aperçu</p>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center space-y-6"
      style={{
        width: `${gameDimensions.width}px`,
        height: `${gameDimensions.height}px`,
        maxWidth: `${gameDimensions.width}px`,
        maxHeight: `${gameDimensions.height}px`
      }}
    >
      <SmartWheel
        key={wheelKey}
        segments={segmentsWithWeights}
        theme="modern"
        size={wheelSize}
        brandColors={brandColors}
        onResult={handleResult}
        onSpin={handleSpin}
        disabled={disabled}
        disablePointerAnimation={true}
        borderStyle={borderStyle}
        showBulbs={showBulbs}
        spinMode={effectiveSpinMode}
        speed={resolvedSpeed}
        winProbability={resolvedWinProbability}
        customButton={{
          text: config?.buttonLabel || 'Faire tourner',
          color: brandColors.primary,
          textColor: '#ffffff'
        }}
      />
    </div>
  );
};

export default Wheel;
