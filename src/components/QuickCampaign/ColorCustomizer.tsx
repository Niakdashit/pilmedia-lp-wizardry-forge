
import React from "react";
import { Palette, RotateCcw } from "lucide-react";
import { useQuickCampaignStore } from "../../stores/quickCampaignStore";
import { getAccessibleTextColor } from "../../utils/BrandStyleAnalyzer";

const DEFAULT_COLORS = {
  primary: "#3B82F6",
  secondary: "#60A5FA",
  accent: "#93C5FD"
};

const ColorCustomizer: React.FC = () => {
  const {
    customColors,
    setCustomColors,
    jackpotColors,
    setJackpotColors,
    selectedGameType
  } = useQuickCampaignStore();

  const handleColorChange = (field: "primary" | "secondary" | "accent", value: string) => {
    const newColors = {
      ...customColors,
      [field]: value
    } as typeof customColors;
    if (field === "accent") {
      newColors.textColor = getAccessibleTextColor(value);
    }
    setCustomColors(newColors);
    if (selectedGameType === "jackpot") {
      setJackpotColors({
        ...jackpotColors,
        borderColor: newColors.primary,
        slotBorderColor: newColors.secondary,
        containerBackgroundColor: newColors.primary + "20",
        backgroundColor: (newColors.accent || newColors.secondary) + "30"
      });
    }
  };

  const resetToDefault = () => {
    setCustomColors({
      primary: DEFAULT_COLORS.primary,
      secondary: DEFAULT_COLORS.secondary,
      accent: DEFAULT_COLORS.accent,
      textColor: getAccessibleTextColor(DEFAULT_COLORS.accent)
    });
  };

  return <div className="space-y-6">
      {/* Couleurs personnalisées */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center">
            <Palette className="w-4 h-4 mr-2 text-blue-500" />
            Couleurs personnalisées
          </h4>
          <button onClick={resetToDefault} className="flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-4">
          {[{
          key: "primary" as const,
          label: "Couleur primaire",
          description: "Couleur principale de votre marque"
        }, {
          key: "secondary" as const,
          label: "Couleur secondaire",
          description: "Couleur complémentaire"
        }, {
          key: "accent" as const,
          label: "Couleur d'accent",
          description: "Pour les boutons et éléments actifs"
        }].map(({
          key,
          label,
          description
        }) => <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium text-gray-900">{label}</label>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                <div className="w-8 h-8 rounded-lg border-2 border-white shadow-sm" style={{
              backgroundColor: customColors[key]
            }} />
              </div>
              
              <div className="flex items-center space-x-3">
                <input type="color" value={customColors[key]} onChange={e => handleColorChange(key, e.target.value)} className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer bg-white shadow-sm" />
                <input type="text" value={customColors[key]} onChange={e => handleColorChange(key, e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono bg-white" placeholder="#000000" />
              </div>
            </div>)}
        </div>
      </div>

      {/* Aperçu des couleurs */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Aperçu</h4>
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm" style={{
          backgroundColor: customColors.primary
        }}>
            Bouton Principal
          </div>
          <div className="px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm" style={{
          backgroundColor: customColors.secondary
        }}>
            Bouton Secondaire
          </div>
          <div className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm" style={{
          backgroundColor: customColors.accent,
          color: customColors.textColor || '#000000'
        }}>
            Bouton d'Action
          </div>
        </div>
      </div>
    </div>;
};

export default ColorCustomizer;
