import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import BorderStyleSelector from '../../SmartWheel/components/BorderStyleSelector';
import { useEditorStore } from '@/stores/editorStore';

interface WheelConfigSettingsProps {
  wheelBorderStyle: string;
  wheelBorderColor: string;
  wheelBorderWidth: number;
  wheelScale: number;
  wheelShowBulbs?: boolean;
  wheelPosition?: 'left' | 'right' | 'center';
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onBorderStyleChange: (style: string) => void;
  onBorderColorChange: (color: string) => void;
  onBorderWidthChange: (width: number) => void;
  onScaleChange: (scale: number) => void;
  onShowBulbsChange?: (show: boolean) => void;
  onPositionChange?: (position: 'left' | 'right' | 'center') => void;
}

const COLOR_PALETTE = [
  '#841b60', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#feca57', '#ff9ff3', '#ff6b6b', '#48dbfb',
  '#1dd1a1', '#ff9f43', '#5f27cd', '#54a0ff'
];

const ensureEven = (value: number) => {
  const normalised = Math.max(2, Math.floor(Number.isFinite(value) ? value : 2));
  return normalised % 2 === 0 ? normalised : normalised + 1;
};

const WheelConfigSettings: React.FC<WheelConfigSettingsProps> = ({
  wheelBorderStyle,
  wheelBorderColor,
  wheelBorderWidth,
  wheelScale,
  wheelShowBulbs = false,
  wheelPosition = 'center',
  selectedDevice,
  onBorderStyleChange,
  onBorderColorChange,
  onBorderWidthChange,
  onScaleChange,
  onShowBulbsChange,
  onPositionChange
}) => {
  const campaign = useEditorStore((s) => s.campaign as any);
  const setCampaign = useEditorStore((s) => s.setCampaign as any);
  const initialisedRef = useRef(false);

  const rawSegments = useMemo(() => {
    const candidate = campaign?.gameConfig?.wheel?.segments || campaign?.config?.roulette?.segments || [];
    return Array.isArray(candidate) ? [...candidate] : [];
  }, [campaign?.config?.roulette?.segments, campaign?.gameConfig?.wheel?.segments]);

  const updateWheelSegments = useCallback((newSegments: any[]) => {
    setCampaign((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        gameConfig: {
          ...prev.gameConfig,
          wheel: {
            ...prev.gameConfig?.wheel,
            segments: newSegments
          }
        },
        config: {
          ...prev.config,
          roulette: {
            ...prev.config?.roulette,
            segments: newSegments
          }
        },
        _lastUpdate: Date.now()
      };
    });
  }, [setCampaign]);

  const rebalanceProbabilities = (segments: any[]) => {
    if (!segments.length) return segments;
    const equalProb = Number((100 / segments.length).toFixed(2));
    return segments.map((segment, index) => ({
      ...segment,
      probability: typeof segment.probability === 'number' ? segment.probability : equalProb,
      label: segment.label || `Segment ${index + 1}`,
      id: segment.id || `segment-${index}`
    }));
  };

  const setSegmentCount = useCallback((targetCount: number) => {
    const desiredCount = ensureEven(targetCount);
    let working = [...rawSegments];

    if (working.length % 2 === 1) {
      working = working.slice(0, -1);
    }

    if (working.length > desiredCount) {
      working = working.slice(0, desiredCount);
    }

    while (working.length < desiredCount) {
      const idx = working.length;
      working.push({
        id: `segment-${idx}`,
        label: `Segment ${idx + 1}`,
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
        textColor: '#ffffff',
        probability: Number((100 / desiredCount).toFixed(2))
      });
    }

    if (working.length > desiredCount) {
      working = working.slice(0, desiredCount);
    }

    updateWheelSegments(rebalanceProbabilities(working));
  }, [rawSegments, updateWheelSegments]);

  const segmentsLength = rawSegments.length || 0;

  const decrementSegments = useCallback(() => {
    if (segmentsLength <= 2) return;
    setSegmentCount(segmentsLength - 2);
  }, [segmentsLength, setSegmentCount]);

  const incrementSegments = useCallback(() => {
    setSegmentCount(segmentsLength + 2);
  }, [segmentsLength, setSegmentCount]);

  const handleManualSegmentInput = useCallback((value: number) => {
    if (!Number.isFinite(value)) return;
    setSegmentCount(value);
  }, [setSegmentCount]);

  useEffect(() => {
    if (initialisedRef.current) {
      return;
    }

    if (segmentsLength === 0) {
      setSegmentCount(6);
      initialisedRef.current = true;
    } else if (segmentsLength > 0) {
      initialisedRef.current = true;
    }
  }, [segmentsLength, setSegmentCount]);

  return (
    <div className="p-6 space-y-8 text-[hsl(var(--sidebar-text-primary))]">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Taille de la roue: {Math.round((wheelScale / 3) * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={wheelScale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[hsl(var(--sidebar-text-secondary))] mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Nombre de segments
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrementSegments}
              className="px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))] hover:bg-[hsl(var(--sidebar-hover))] disabled:opacity-50"
              disabled={segmentsLength <= 2}
              aria-label="Retirer 2 segments"
            >
              −2
            </button>
            <input
              type="number"
              min={2}
              step={2}
              value={segmentsLength || 6}
              onChange={(e) => handleManualSegmentInput(parseInt(e.target.value || '0', 10))}
              className="w-24 px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-active))]"
            />
            <button
              type="button"
              onClick={incrementSegments}
              className="px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))] hover:bg-[hsl(var(--sidebar-hover))]"
              aria-label="Ajouter 2 segments"
            >
              +2
            </button>
          </div>
          <p className="text-xs text-[hsl(var(--sidebar-text-secondary))] mt-1">
            La roue fonctionne mieux avec un nombre pair de segments.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Couleur de la bordure
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={wheelBorderColor}
              onChange={(e) => onBorderColorChange(e.target.value)}
              className="w-12 h-10 rounded border border-[hsl(var(--sidebar-border))] cursor-pointer"
            />
            <input
              type="text"
              value={wheelBorderColor}
              onChange={(e) => onBorderColorChange(e.target.value)}
              placeholder="#841b60"
              className="flex-1 px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-md bg-[hsl(var(--sidebar-bg))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-active))]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Largeur de la bordure: {wheelBorderWidth}px
          </label>
          <input
            type="range"
            min={4}
            max={32}
            step={2}
            value={wheelBorderWidth}
            onChange={(e) => onBorderWidthChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[hsl(var(--sidebar-text-secondary))] mt-1">
            <span>4px</span>
            <span>32px</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">
            Style de bordure
          </label>
          <BorderStyleSelector
            currentStyle={wheelBorderStyle}
            onStyleChange={onBorderStyleChange}
          />
        </div>

        {selectedDevice === 'desktop' && (
          <div>
            <label className="block text-sm font-semibold mb-3">
              Position de la roue
            </label>
            <div className="inline-flex rounded-md overflow-hidden border border-[hsl(var(--sidebar-border))]">
              <button
                type="button"
                onClick={() => onPositionChange?.('left')}
                className={`px-3 py-2 text-sm transition-colors ${wheelPosition === 'left' ? 'bg-[hsl(var(--sidebar-active))] text-white' : 'bg-[hsl(var(--sidebar-surface))] text-[hsl(var(--sidebar-text-primary))] hover:bg-[hsl(var(--sidebar-hover))]'}`}
              >
                Gauche
              </button>
              <button
                type="button"
                onClick={() => onPositionChange?.('center')}
                className={`px-3 py-2 text-sm transition-colors border-l border-r border-[hsl(var(--sidebar-border))] ${wheelPosition === 'center' ? 'bg-[hsl(var(--sidebar-active))] text-white' : 'bg-[hsl(var(--sidebar-surface))] text-[hsl(var(--sidebar-text-primary))] hover:bg-[hsl(var(--sidebar-hover))]'}`}
              >
                Centre
              </button>
              <button
                type="button"
                onClick={() => onPositionChange?.('right')}
                className={`px-3 py-2 text-sm transition-colors ${wheelPosition === 'right' ? 'bg-[hsl(var(--sidebar-active))] text-white' : 'bg-[hsl(var(--sidebar-surface))] text-[hsl(var(--sidebar-text-primary))] hover:bg-[hsl(var(--sidebar-hover))]'}`}
              >
                Droite
              </button>
            </div>
          </div>
        )}

        {onShowBulbsChange && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Afficher les ampoules blanches (x15)</p>
              <p className="text-xs text-[hsl(var(--sidebar-text-secondary))]">Ajoute une touche lumineuse autour de la roue.</p>
            </div>
            <button
              type="button"
              onClick={() => onShowBulbsChange(!wheelShowBulbs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${wheelShowBulbs ? 'bg-[hsl(var(--sidebar-active))]' : 'bg-gray-300'}`}
              aria-pressed={wheelShowBulbs}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${wheelShowBulbs ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(WheelConfigSettings);
