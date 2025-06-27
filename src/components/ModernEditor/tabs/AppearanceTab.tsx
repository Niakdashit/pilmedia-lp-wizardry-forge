
import React, { useState } from 'react';
import { Palette, Brush, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AppearanceTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({
  campaign,
  setCampaign
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'colors' | 'themes' | 'backgrounds' | 'effects'>('colors');

  const subTabs = [
    { id: 'colors', label: 'Couleurs', icon: Palette, description: 'Palette de couleurs' },
    { id: 'themes', label: 'Thèmes', icon: Brush, description: 'Styles prédéfinis' },
    { id: 'backgrounds', label: 'Arrière-plans', icon: ImageIcon, description: 'Images de fond' },
    { id: 'effects', label: 'Effets', icon: Sparkles, description: 'Animations et effets' }
  ];

  const updateDesign = (updates: any) => {
    setCampaign((prev: any) => {
      const newCampaign = {
        ...prev,
        design: {
          ...prev.design,
          ...updates
        }
      };
      
      // Force un re-render pour la synchronisation
      newCampaign._lastUpdate = Date.now();
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('AppearanceTab - Mise à jour design:', updates);
      }
      
      return newCampaign;
    });
  };

  const colorPresets = [
    { name: 'Violet moderne', primary: '#841b60', secondary: '#4ecdc4', accent: '#45b7d1' },
    { name: 'Bleu entreprise', primary: '#2563eb', secondary: '#06b6d4', accent: '#8b5cf6' },
    { name: 'Rouge passion', primary: '#dc2626', secondary: '#f59e0b', accent: '#10b981' },
    { name: 'Vert nature', primary: '#059669', secondary: '#3b82f6', accent: '#f59e0b' },
    { name: 'Orange dynamique', primary: '#ea580c', secondary: '#8b5cf6', accent: '#06b6d4' }
  ];

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Titre et description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Apparence et style</h3>
        <p className="text-xs text-gray-600">
          Personnalisez l'apparence visuelle de votre campagne
        </p>
      </div>

      {/* Sous-onglets */}
      <div className="bg-gray-50 p-1 rounded-lg">
        <nav className="flex space-x-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md font-medium text-xs transition-all duration-200 ${
                  activeSubTab === tab.id
                    ? 'bg-white text-[#841b60] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des sous-onglets */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1">
        {activeSubTab === 'colors' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center text-sm">
              <Palette className="w-4 h-4 text-[#841b60] mr-2" />
              Palette de couleurs
            </h4>

            {/* Couleurs actuelles */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Couleur primaire</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={campaign.design?.customColors?.primary || '#841b60'}
                    onChange={(e) => updateDesign({
                      customColors: {
                        ...campaign.design?.customColors,
                        primary: e.target.value
                      }
                    })}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={campaign.design?.customColors?.primary || '#841b60'}
                    onChange={(e) => updateDesign({
                      customColors: {
                        ...campaign.design?.customColors,
                        primary: e.target.value
                      }
                    })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Couleur secondaire</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={campaign.design?.customColors?.secondary || '#4ecdc4'}
                    onChange={(e) => updateDesign({
                      customColors: {
                        ...campaign.design?.customColors,
                        secondary: e.target.value
                      }
                    })}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={campaign.design?.customColors?.secondary || '#4ecdc4'}
                    onChange={(e) => updateDesign({
                      customColors: {
                        ...campaign.design?.customColors,
                        secondary: e.target.value
                      }
                    })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Couleur d'accent</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={campaign.design?.customColors?.accent || '#45b7d1'}
                    onChange={(e) => updateDesign({
                      customColors: {
                        ...campaign.design?.customColors,
                        accent: e.target.value
                      }
                    })}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={campaign.design?.customColors?.accent || '#45b7d1'}
                    onChange={(e) => updateDesign({
                      customColors: {
                        ...campaign.design?.customColors,
                        accent: e.target.value
                      }
                    })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Presets de couleurs */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 text-sm">Palettes prédéfinies</h5>
              <div className="grid grid-cols-1 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateDesign({
                      customColors: {
                        primary: preset.primary,
                        secondary: preset.secondary,
                        accent: preset.accent
                      }
                    })}
                    className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:border-[#841b60] hover:shadow-sm transition-all"
                  >
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }}></div>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }}></div>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'themes' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center text-sm">
              <Brush className="w-4 h-4 text-[#841b60] mr-2" />
              Thèmes prédéfinis
            </h4>
            <div className="text-center py-6 text-gray-500">
              <Brush className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">Thèmes prédéfinis à venir</p>
            </div>
          </div>
        )}

        {activeSubTab === 'backgrounds' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center text-sm">
              <ImageIcon className="w-4 h-4 text-[#841b60] mr-2" />
              Arrière-plans
            </h4>
            <div className="text-center py-6 text-gray-500">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">Gestion des arrière-plans à venir</p>
            </div>
          </div>
        )}

        {activeSubTab === 'effects' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center text-sm">
              <Sparkles className="w-4 h-4 text-[#841b60] mr-2" />
              Effets et animations
            </h4>
            <div className="text-center py-6 text-gray-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">Effets visuels à venir</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppearanceTab;
