import React from 'react';
import BackgroundImageManager from './BackgroundImageManager';
import { useEditorStore } from '@/stores/editorStore';

interface SimpleBackgroundSettingsProps {
  campaign: any;
  canvasBackground: { type: 'color' | 'image'; value: string };
  onBackgroundChange: (bg: { type: 'color' | 'image'; value: string }) => void;
}

const SimpleBackgroundSettings: React.FC<SimpleBackgroundSettingsProps> = ({
  campaign,
  canvasBackground,
  onBackgroundChange
}) => {
  const campaignState = useEditorStore((s) => s.campaign);

  const handleColorChange = (color: string) => {
    console.log('🎨 [SimpleBackgroundSettings] Color changed:', color);
    onBackgroundChange({ type: 'color', value: color });
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold text-gray-900">Arrière-plan</h2>
      
      {/* Couleur de fond */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur de fond
        </label>
        <input
          type="color"
          value={canvasBackground.type === 'color' ? canvasBackground.value : '#ffffff'}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
        />
      </div>

      {/* Image de fond avec nouveau manager */}
      <BackgroundImageManager
        campaignId={(campaign as any)?.id || (campaignState as any)?.id}
        currentBackground={canvasBackground}
        onBackgroundChange={onBackgroundChange}
      />
    </div>
  );
};

export default SimpleBackgroundSettings;