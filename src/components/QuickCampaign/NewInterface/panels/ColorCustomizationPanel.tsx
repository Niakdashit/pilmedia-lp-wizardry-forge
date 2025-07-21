
import React from 'react';
import { motion } from 'framer-motion';
import { Palette, RefreshCw, Eye } from 'lucide-react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';

const ColorCustomizationPanel: React.FC = () => {
  const { customColors, setCustomColors } = useQuickCampaignStore();

  const presetPalettes = [
    {
      name: 'Corporate Blue',
      primary: '#2563eb',
      secondary: '#1d4ed8',
      accent: '#ffffff'
    },
    {
      name: 'Vibrant Orange',
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#ffffff'
    },
    {
      name: 'Modern Purple',
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#ffffff'
    },
    {
      name: 'Nature Green',
      primary: '#059669',
      secondary: '#10b981',
      accent: '#ffffff'
    },
    {
      name: 'Elegant Black',
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#f9fafb'
    }
  ];

  const updateColor = (field: keyof typeof customColors, value: string) => {
    setCustomColors({
      ...customColors,
      [field]: value
    });
  };

  const applyPalette = (palette: typeof presetPalettes[0]) => {
    setCustomColors({
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      textColor: palette.accent === '#ffffff' ? '#1f2937' : '#ffffff'
    });
  };

  const generateRandomPalette = () => {
    const hue = Math.floor(Math.random() * 360);
    const primary = `hsl(${hue}, 70%, 50%)`;
    const secondary = `hsl(${(hue + 30) % 360}, 70%, 45%)`;
    const accent = '#ffffff';
    
    setCustomColors({
      primary,
      secondary,
      accent,
      textColor: '#1f2937'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Palette de couleurs
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Personnalisez les couleurs de votre campagne ou utilisez celles extraites de votre logo.
        </p>
      </div>

      {/* Current Colors */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Couleurs actuelles</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Couleur principale
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColors.primary}
                onChange={(e) => updateColor('primary', e.target.value)}
                className="w-12 h-10 border border-border rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customColors.primary}
                onChange={(e) => updateColor('primary', e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:border-primary focus:bg-background transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Couleur secondaire
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColors.secondary}
                onChange={(e) => updateColor('secondary', e.target.value)}
                className="w-12 h-10 border border-border rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customColors.secondary}
                onChange={(e) => updateColor('secondary', e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:border-primary focus:bg-background transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <div className="p-4 bg-card border border-border rounded-xl">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Aperçu des couleurs
        </h4>
        <div className="space-y-3">
          <button
            style={{ backgroundColor: customColors.primary, color: customColors.accent }}
            className="w-full py-3 px-4 rounded-lg font-medium text-sm"
          >
            Bouton principal
          </button>
          <button
            style={{ 
              backgroundColor: 'transparent', 
              color: customColors.primary,
              borderColor: customColors.primary
            }}
            className="w-full py-3 px-4 rounded-lg font-medium text-sm border-2"
          >
            Bouton secondaire
          </button>
        </div>
      </div>

      {/* Preset Palettes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Palettes prédéfinies</h4>
          <button
            onClick={generateRandomPalette}
            className="flex items-center space-x-1 px-3 py-1 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Aléatoire</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {presetPalettes.map((palette, index) => (
            <motion.button
              key={palette.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => applyPalette(palette)}
              className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="flex space-x-1">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: palette.primary }}
                />
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: palette.secondary }}
                />
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: palette.accent }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                {palette.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h4 className="text-sm font-medium text-amber-800 mb-2">
          <Palette className="w-4 h-4 inline mr-2" />
          Extraction automatique
        </h4>
        <p className="text-xs text-amber-700">
          Les couleurs sont automatiquement extraites de votre logo pour une cohérence parfaite avec votre marque.
        </p>
      </div>
    </div>
  );
};

export default ColorCustomizationPanel;
