import React from 'react';
import { Palette } from 'lucide-react';
import { useQuickCampaignStore } from '../../stores/quickCampaignStore';
const JackpotBorderCustomizer: React.FC = () => {
  const {
    jackpotColors,
    setJackpotColors,
    customColors
  } = useQuickCampaignStore();
  const handleColorChange = (field: keyof typeof jackpotColors, value: string | number) => {
    setJackpotColors({
      ...jackpotColors,
      [field]: value
    });
  };

  // Synchroniser les couleurs du jackpot avec les couleurs personnalisées
  const syncWithCustomColors = () => {
    setJackpotColors({
      ...jackpotColors,
      borderColor: customColors.primary,
      slotBorderColor: customColors.secondary,
      containerBackgroundColor: customColors.primary + '20',
      // Version transparente
      backgroundColor: customColors.accent + '30' || customColors.secondary + '20' // Utiliser accent ou secondary en transparence
    });
  };
  React.useEffect(() => {
    // Synchroniser automatiquement les couleurs quand les couleurs personnalisées changent
    syncWithCustomColors();
  }, [customColors.primary, customColors.secondary, customColors.accent]);
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Couleurs du Jackpot
        </h3>
        <button onClick={syncWithCustomColors} className="text-sm px-3 py-1 bg-[#44444d] text-white rounded-lg hover:bg-[#44444d]/90 transition-colors">
          Synchroniser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Couleur du conteneur */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Arrière-plan du conteneur
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input type="color" value={jackpotColors.containerBackgroundColor} onChange={e => handleColorChange('containerBackgroundColor', e.target.value)} className="w-12 h-10 border border-gray-300 rounded cursor-pointer" />
            <input type="text" value={jackpotColors.containerBackgroundColor} onChange={e => handleColorChange('containerBackgroundColor', e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent text-sm" />
          </div>
        </div>

        {/* Couleur d'arrière-plan */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Arrière-plan interne
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input type="color" value={jackpotColors.backgroundColor} onChange={e => handleColorChange('backgroundColor', e.target.value)} className="w-12 h-10 border border-gray-300 rounded cursor-pointer" />
            <input type="text" value={jackpotColors.backgroundColor} onChange={e => handleColorChange('backgroundColor', e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent text-sm" />
          </div>
        </div>

        {/* Couleur de bordure principale */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Bordure principale
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input type="color" value={jackpotColors.borderColor} onChange={e => handleColorChange('borderColor', e.target.value)} className="w-12 h-10 border border-gray-300 rounded cursor-pointer" />
            <input type="text" value={jackpotColors.borderColor} onChange={e => handleColorChange('borderColor', e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent text-sm" />
          </div>
        </div>

        {/* Épaisseur de bordure principale */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Épaisseur bordure principale ({jackpotColors.borderWidth}px)
          </label>
          <input type="range" min="0" max="10" value={jackpotColors.borderWidth} onChange={e => handleColorChange('borderWidth', parseInt(e.target.value))} className="w-full" />
        </div>

        {/* Couleur de bordure des slots */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Bordure des slots
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input type="color" value={jackpotColors.slotBorderColor} onChange={e => handleColorChange('slotBorderColor', e.target.value)} className="w-12 h-10 border border-gray-300 rounded cursor-pointer" />
            <input type="text" value={jackpotColors.slotBorderColor} onChange={e => handleColorChange('slotBorderColor', e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent text-sm" />
          </div>
        </div>

        {/* Épaisseur bordure des slots */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Épaisseur bordure slots ({jackpotColors.slotBorderWidth}px)
          </label>
          <input type="range" min="0" max="6" value={jackpotColors.slotBorderWidth} onChange={e => handleColorChange('slotBorderWidth', parseInt(e.target.value))} className="w-full" />
        </div>

        {/* Arrière-plan des slots */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Arrière-plan des slots
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input type="color" value={jackpotColors.slotBackgroundColor} onChange={e => handleColorChange('slotBackgroundColor', e.target.value)} className="w-12 h-10 border border-gray-300 rounded cursor-pointer" />
            <input type="text" value={jackpotColors.slotBackgroundColor} onChange={e => handleColorChange('slotBackgroundColor', e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent text-sm" />
          </div>
        </div>
      </div>

      
    </div>;
};
export default JackpotBorderCustomizer;