import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BorderStyleSelector from '../../SmartWheel/components/BorderStyleSelector';
import { useEditorStore } from '../../../stores/editorStore';
import WheelSegmentsPanel from './WheelSegmentsPanel';

interface WheelConfigPanelProps {
  onBack: () => void;
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

const WheelConfigPanel: React.FC<WheelConfigPanelProps> = React.memo(({
  onBack,
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
  // Campaign store access to manage wheel segments directly from this panel
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

  // Default palette for new segments
  const colorPalette = ['#841b60', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

  // Ensure even segment count, min 2, add/remove as needed
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
      const defaultSeg = {
        id: `segment-${idx}`,
        label: `Segment ${idx + 1}`,
        color: colorPalette[idx % colorPalette.length],
        textColor: '#ffffff'
      } as any;
      next.push(defaultSeg);
    }

    if (next.length > count) {
      next = next.slice(0, count);
    }

    updateWheelSegments(next);
  };

  const decrementSegments = () => setSegmentCount((getRawSegments().length || 0) - 2);
  const incrementSegments = () => setSegmentCount((getRawSegments().length || 0) + 2);
  const segmentsLength = getRawSegments().length || 0;

  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="p-4">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 text-sm rounded-md bg-white border hover:bg-gray-50 text-gray-700"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour
          </button>
          
          <TabsList className="ml-auto">
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings" className="space-y-6">
          {/* Taille de la roue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Nombre de segments */}
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

          {/* Couleur de la bordure */}
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

          {/* Largeur de la bordure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Largeur de la bordure: {wheelBorderWidth}px
            </label>
            <input
              type="range"
              min={4}
              max={32}
              step={2}
              value={wheelBorderWidth}
              onChange={(e) => onBorderWidthChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>4px</span>
              <span>32px</span>
            </div>
          </div>

          {/* Styles de bordure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Style de bordure
            </label>
            <BorderStyleSelector
              currentStyle={wheelBorderStyle}
              onStyleChange={onBorderStyleChange}
            />
          </div>

          {/* Position de la roue - uniquement sur Desktop */}
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

          {/* Ampoules blanches sur la bordure */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Afficher les ampoules blanches (x15)
            </label>
            <button
              type="button"
              onClick={() => onShowBulbsChange?.(!wheelShowBulbs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${wheelShowBulbs ? 'bg-[hsl(var(--primary))]' : 'bg-gray-300'}`}
              aria-pressed={wheelShowBulbs}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${wheelShowBulbs ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </TabsContent>
        
        <TabsContent value="segments">
          <WheelSegmentsPanel 
            onBack={() => setActiveTab('settings')} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});

WheelConfigPanel.displayName = 'WheelConfigPanel';

export default WheelConfigPanel;
