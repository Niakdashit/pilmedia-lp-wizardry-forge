import React, { useState } from 'react';
import WheelConfigSettings from './WheelConfigSettings';
import WheelSegmentsPanel from './WheelSegmentsPanel';

interface WheelConfigPanelProps {
  onBack: () => void;
  wheelBorderStyle: string;
  wheelBorderColor: string;
  wheelBorderWidth: number;
  wheelScale: number;
  wheelShowBulbs?: boolean;
  wheelPosition?: 'left' | 'right' | 'center' | 'centerTop';

  onBorderStyleChange: (style: string) => void;
  onBorderColorChange: (color: string) => void;
  onBorderWidthChange: (width: number) => void;
  onScaleChange: (scale: number) => void;
  onShowBulbsChange?: (show: boolean) => void;
  onPositionChange?: (position: 'left' | 'right' | 'center' | 'centerTop') => void;

  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

const WheelConfigPanel: React.FC<WheelConfigPanelProps> = React.memo((props) => {
  const {
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
  } = props;

  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'segments'>('settings');

  return (
    <div className="flex h-full min-h-0 flex-col bg-[hsl(var(--sidebar-bg))]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))]">
        <button
          onClick={() => (activeSubTab === 'settings' ? onBack() : setActiveSubTab('settings'))}
          className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-2 ml-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeSubTab === 'settings' ? 'bg-[hsl(var(--sidebar-active))] text-white' : 'bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-text-primary))]'}`}
          >
            Paramètres
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('segments')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeSubTab === 'segments' ? 'bg-[hsl(var(--sidebar-active))] text-white' : 'bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-text-primary))]'}`}
          >
            Segments
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeSubTab === 'settings' ? (
          <WheelConfigSettings
            wheelBorderStyle={wheelBorderStyle}
            wheelBorderColor={wheelBorderColor}
            wheelBorderWidth={wheelBorderWidth}
            wheelScale={wheelScale}
            wheelShowBulbs={wheelShowBulbs}
            wheelPosition={wheelPosition}
            onBorderStyleChange={onBorderStyleChange}
            onBorderColorChange={onBorderColorChange}
            onBorderWidthChange={onBorderWidthChange}
            onScaleChange={onScaleChange}
            onShowBulbsChange={onShowBulbsChange}
            onPositionChange={onPositionChange}
            selectedDevice={selectedDevice}
          />
        ) : (
          <WheelSegmentsPanel
            onBack={() => setActiveSubTab('settings')}
            showHeader={false}
          />
        )}
      </div>
    </div>
  );
});

WheelConfigPanel.displayName = 'WheelConfigPanel';

export default WheelConfigPanel;
