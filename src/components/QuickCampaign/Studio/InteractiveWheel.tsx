import React from 'react';
import { SmartWheel } from '../../SmartWheel';
import { useQuickCampaignStore } from '@/stores/quickCampaignStore';

interface InteractiveWheelProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  onSpin?: () => void;
  // Spin configuration
  spinMode?: 'random' | 'instant_winner' | 'probability';
  speed?: 'slow' | 'medium' | 'fast';
  winProbability?: number;
}

const InteractiveWheel: React.FC<InteractiveWheelProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
  onSpin,
  spinMode,
  speed,
  winProbability
}) => {
  const resolvedSpinMode = spinMode ?? 'random';
  const resolvedSpeed = speed ?? 'medium';
  // Dynamic segments from QuickCampaign store
  const segmentCount = useQuickCampaignStore((s) => s.segmentCount) || 6;
  const segments = Array.from({ length: segmentCount }, (_, i) => {
    const isWinning = i % 2 === 0;
    return {
      id: String(i + 1),
      label: isWinning ? 'Gain' : 'Dommage',
      color: isWinning ? primaryColor : secondaryColor,
      textColor: isWinning ? '#ffffff' : primaryColor,
      isWinning
    } as any;
  });

  const brandColors = {
    primary: primaryColor,
    secondary: '#ffffff',
    accent: accentColor
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <SmartWheel
        key={(() => {
          try {
            const parts = segments.map((s: any, idx: number) => `${s.id ?? idx}:${s.label ?? ''}:${s.color ?? ''}:${s.textColor ?? ''}`).join('|');
            return `${segments.length}-${parts}-280-1-${resolvedSpinMode}-${resolvedSpeed}-${winProbability ?? 'np'}`;
          } catch {
            return `${segments.length}-280-${resolvedSpinMode}-${resolvedSpeed}-${winProbability ?? 'np'}`;
          }
        })()}
        segments={segments}
        theme="modern"
        size={280}
        brandColors={brandColors}
        onSpin={onSpin}
        onResult={() => {}}
        disablePointerAnimation={true}
        spinMode={resolvedSpinMode}
        speed={resolvedSpeed}
        winProbability={winProbability}
        buttonPosition="center"
        customButton={{
          text: 'GO',
          color: primaryColor,
          textColor: '#ffffff'
        }}
        showBulbs={true}
      />
    </div>
  );
};

export default InteractiveWheel;


