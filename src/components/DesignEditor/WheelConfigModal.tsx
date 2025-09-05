import React from 'react';
import BorderStyleSelector from '../SmartWheel/components/BorderStyleSelector';
import { useEditorStore } from '../../stores/editorStore';

interface WheelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelBorderStyle: string;
  wheelBorderColor: string;
  wheelBorderWidth: number;
  wheelScale: number;
  wheelShowBulbs?: boolean;
  wheelPosition?: 'left' | 'right' | 'center';

  onBorderStyleChange: (style: string) => void;
  onBorderColorChange: (color: string) => void;
  onBorderWidthChange: (width: number) => void;
  onScaleChange: (scale: number) => void;
  onShowBulbsChange?: (show: boolean) => void;
  onPositionChange?: (position: 'left' | 'right' | 'center') => void;

  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

const WheelConfigModal: React.FC<WheelConfigModalProps> = React.memo(({
  isOpen,
  onClose,
  wheelBorderStyle,
  wheelBorderColor,
  wheelBorderWidth,
  wheelScale,
  wheelShowBulbs = false,
  wheelPosition = 'center',

  onBorderStyleChange,
  onBorderColorChange,
  onBorderWidthChange,
  onScaleChange,
  onShowBulbsChange,
  onPositionChange,

  selectedDevice
}) => {
  if (!isOpen) return null;

  // Calculer la position de la modale selon l'appareil
  const getModalPosition = () => {
    switch (selectedDevice) {
      case 'mobile':
      case 'tablet':
        return {
          position: 'fixed' as const,
          top: '10px',
          bottom: '10px',
          left: '10px',
          right: '10px',
          overflowY: 'auto' as const
        };
      case 'desktop':
      default:
        return {
          position: 'fixed' as const,
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto' as const
        };
    }
  };

  const modalStyle = getModalPosition();

  // Segment controls (shared logic with panel)
  const campaign = useEditorStore((s) => s.campaign as any);
  const setCampaign = useEditorStore((s) => s.setCampaign as any);

  const getRawSegments = () =>
    (campaign?.gameConfig?.wheel?.segments || campaign?.config?.roulette?.segments || []) as any[];

  const updateWheelSegments = (newSegments: any[]) => {
    setCampaign((prev: any) => {
      if (!prev) return prev;
      const next = {
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
      return next;
    });
  };

  const colorPalette = ['#841b60', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

  const setSegmentCount = (targetCount: number) => {
    let count = Math.max(2, Math.floor(targetCount));
    if (count % 2 === 1) count += 1;

    const raw = getRawSegments();
    let next = [...raw];

    if (next.length % 2 === 1) {
      next = next.slice(0, -1);
    }

    if (next.length > count) {
      next = next.slice(0, count);
    }

    while (next.length < count) {
      const idx = next.length;
      next.push({
        id: `segment-${idx}`,
        label: `Segment ${idx + 1}`,
        color: colorPalette[idx % colorPalette.length],
        textColor: '#ffffff'
      } as any);
    }

    if (next.length > count) {
      next = next.slice(0, count);
    }

    updateWheelSegments(next);
  };

  const decrementSegments = () => setSegmentCount((getRawSegments().length || 0) - 2);
  const incrementSegments = () => setSegmentCount((getRawSegments().length || 0) + 2);
  const segmentsLength = getRawSegments().length || 0;

  return (
    <>
      {/* Modal */}
      <div 
        className="bg-white rounded-[2px] shadow-xl z-50 border"
        style={modalStyle}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Configuration de la roue</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contrôles */}
          <div className="space-y-6">
            {/* 1. Position de la roue */}
            {selectedDevice === 'desktop' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Position de la roue
                </label>
                <div className="inline-flex rounded-md shadow-sm overflow-hidden border">
                  <button
                    type="button"
                    onClick={() => onPositionChange?.('left')}
                    className={`px-3 py-2 text-sm ${wheelPosition === 'left' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r`}
                  >
                    Gauche
                  </button>
                  <button
                    type="button"
                    onClick={() => onPositionChange?.('center')}
                    className={`px-3 py-2 text-sm ${wheelPosition === 'center' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r`}
                  >
                    Centre
                  </button>
                  <button
                    type="button"
                    onClick={() => onPositionChange?.('right')}
                    className={`px-3 py-2 text-sm ${wheelPosition === 'right' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Droite
                  </button>
                </div>
              </div>
            )}

            {/* 2. Taille de la roue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille de la roue: {Math.round((wheelScale / 3) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={wheelScale}
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 3. Couleur de la bordure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur de la bordure
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={wheelBorderColor}
                  onChange={(e) => onBorderColorChange(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={wheelBorderColor}
                  onChange={(e) => onBorderColorChange(e.target.value)}
                  placeholder="#841b60"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                />
              </div>
            </div>

            {/* 4. Style de bordure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Style de bordure
              </label>
              <BorderStyleSelector
                currentStyle={wheelBorderStyle}
                onStyleChange={onBorderStyleChange}
              />
            </div>

            {/* 5. Largeur de la bordure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largeur de la bordure: {wheelBorderWidth}px
              </label>
              <input
                type="range"
                min="4"
                max="32"
                step="2"
                value={wheelBorderWidth}
                onChange={(e) => onBorderWidthChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4px</span>
                <span>32px</span>
              </div>
            </div>

            {/* 6. Afficher les ampoules */}
            {onShowBulbsChange && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Afficher les ampoules
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wheelShowBulbs}
                    onChange={(e) => onShowBulbsChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(var(--primary))]"></div>
                </label>
              </div>
            )}

            {/* 7. Nombre de segments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de segments
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decrementSegments}
                  className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
                  disabled={segmentsLength <= 2}
                  aria-label="Retirer 2 segments"
                >
                  −2
                </button>
                <input
                  type="number"
                  min={2}
                  step={2}
                  value={segmentsLength}
                  onChange={(e) => setSegmentCount(parseInt(e.target.value || '0', 10))}
                  className="w-24 px-3 py-1.5 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={incrementSegments}
                  className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50"
                  aria-label="Ajouter 2 segments"
                >
                  +2
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">La roue fonctionne mieux avec un nombre pair de segments.</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
});

WheelConfigModal.displayName = 'WheelConfigModal';

export default WheelConfigModal;