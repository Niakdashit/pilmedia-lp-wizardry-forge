
import React from 'react';
import { RotateCcw, Users, Plus, Minus } from 'lucide-react';

interface WheelGameConfigProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const WheelGameConfig: React.FC<WheelGameConfigProps> = ({
  campaign,
  setCampaign
}) => {
  // Couleurs par défaut alternées (2 couleurs max)
  const defaultColors = [
    campaign.design?.customColors?.primary || '#841b60', 
    campaign.design?.customColors?.secondary || '#4ecdc4'
  ];

  // Assurer que les segments existent avec une structure par défaut
  const segments = campaign.gameConfig?.wheel?.segments || campaign.config?.roulette?.segments || [];
  
  const updateWheelConfig = (updates: any) => {
    setCampaign((prev: any) => {
      const newCampaign = {
        ...prev,
        gameConfig: {
          ...prev.gameConfig,
          wheel: {
            ...prev.gameConfig?.wheel,
            ...updates
          }
        },
        // Maintenir aussi la structure legacy pour la compatibilité
        config: {
          ...prev.config,
          roulette: {
            ...prev.config?.roulette,
            ...updates
          }
        }
      };

      // Force un re-render en créant un nouvel objet avec un timestamp
      newCampaign._lastUpdate = Date.now();
      if (process.env.NODE_ENV !== 'production') {
        console.log('WheelGameConfig - Mise à jour:', updates);
        console.log('WheelGameConfig - Nouveaux segments:', newCampaign.gameConfig.wheel.segments);
      }
      return newCampaign;
    });
  };

  const addSegmentPair = () => {
    const currentCount = segments.length;

    // Utiliser les couleurs alternées par défaut (max 2 couleurs)
    const winningColor = defaultColors[0]; // Toujours couleur 1 pour les gagnants
    const losingColor = defaultColors[1]; // Toujours couleur 2 pour les perdants

    // Ajouter une paire de segments (un gagnant et un perdant)
    const winningSegment = {
      id: `${Date.now()}-win`,
      label: `Cadeau ${Math.floor(currentCount / 2) + 1}`,
      color: winningColor,
      textColor: '#ffffff',
      probability: 1,
      isWinning: true
    };
    
    const losingSegment = {
      id: `${Date.now()}-lose`,
      label: 'Dommage',
      color: losingColor,
      textColor: '#ffffff',
      probability: 1,
      isWinning: false
    };

    const newSegments = [...segments, winningSegment, losingSegment];
    updateWheelConfig({ segments: newSegments });
  };

  const removeSegmentPair = () => {
    if (segments.length >= 2) {
      const newSegments = segments.slice(0, -2);
      updateWheelConfig({ segments: newSegments });
    }
  };

  const updateSegment = (index: number, field: string, value: any) => {
    const newSegments = [...segments];
    newSegments[index] = {
      ...newSegments[index],
      [field]: value
    };

    // Si on change le label d'un segment, déterminer automatiquement s'il est gagnant ou perdant
    if (field === 'label') {
      const isLosingLabel = value.toLowerCase().includes('dommage') || 
                           value.toLowerCase().includes('perdu') || 
                           value.toLowerCase().includes('essaie') || 
                           value.toLowerCase().includes('rejouer');
      newSegments[index].isWinning = !isLosingLabel;
    }

    // Appliquer les couleurs par défaut selon le type de segment
    if (field === 'color' || field === 'label') {
      const isLosing = newSegments[index].isWinning === false || 
                      newSegments[index].label.toLowerCase().includes('dommage');

      // Utiliser les couleurs par défaut si pas de couleur personnalisée
      if (!newSegments[index].customColor) {
        newSegments[index].color = isLosing ? defaultColors[1] : defaultColors[0];
      }
    }

    updateWheelConfig({ segments: newSegments });
  };

  // Compter les segments gagnants et perdants
  const winningSegments = segments.filter((s: any) => 
    s.isWinning !== false && 
    !s.label.toLowerCase().includes('dommage') && 
    !s.label.toLowerCase().includes('perdu') && 
    !s.label.toLowerCase().includes('essaie') && 
    !s.label.toLowerCase().includes('rejouer')
  ).length;

  return (
    <div className="space-y-6 h-full overflow-y-auto p-6">
      {/* Titre principal */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuration de la roue</h3>
        <p className="text-sm text-gray-600">Personnalisez les segments et le comportement de votre roue</p>
      </div>

      {/* Résumé de configuration */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-purple-900">📊 Résumé de la configuration</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-purple-700 font-medium">Total segments:</span>
            <span className="ml-2 text-purple-900 font-bold">{segments.length}</span>
          </div>
          <div>
            <span className="text-purple-700 font-medium">Segments gagnants:</span>
            <span className="ml-2 text-green-600 font-bold">{winningSegments}</span>
          </div>
          <div>
            <span className="text-purple-700 font-medium">Couleur primaire:</span>
            <div className="inline-block w-4 h-4 rounded-full ml-2 border" style={{ backgroundColor: defaultColors[0] }}></div>
          </div>
          <div>
            <span className="text-purple-700 font-medium">Couleur secondaire:</span>
            <div className="inline-block w-4 h-4 rounded-full ml-2 border" style={{ backgroundColor: defaultColors[1] }}></div>
          </div>
        </div>
      </div>

      {/* Gestion des segments - Section principale */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">🎯 Segments de la roue</h4>
          <div className="flex space-x-2">
            <button
              onClick={addSegmentPair}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter paire</span>
            </button>
            {segments.length >= 2 && (
              <button
                onClick={removeSegmentPair}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <Minus className="w-4 h-4" />
                <span>Retirer paire</span>
              </button>
            )}
          </div>
        </div>

        {segments.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {segments.map((segment: any, index: number) => {
              const isLosingSegment = segment.isWinning === false || 
                                     segment.label.toLowerCase().includes('dommage') || 
                                     segment.label.toLowerCase().includes('perdu') || 
                                     segment.label.toLowerCase().includes('essaie') || 
                                     segment.label.toLowerCase().includes('rejouer');

              const segmentColor = segment.color || (isLosingSegment ? defaultColors[1] : defaultColors[0]);

              return (
                <div
                  key={segment.id || index}
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                    isLosingSegment ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${isLosingSegment ? 'bg-red-400' : 'bg-green-400'}`} />
                  
                  <input
                    type="color"
                    value={segmentColor}
                    onChange={(e) => {
                      updateSegment(index, 'color', e.target.value);
                      // Marquer comme couleur personnalisée
                      const newSegments = [...segments];
                      newSegments[index].customColor = true;
                      updateWheelConfig({ segments: newSegments });
                    }}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    title="Couleur segment"
                  />
                  
                  <input
                    type="text"
                    value={segment.label || ''}
                    onChange={(e) => updateSegment(index, 'label', e.target.value)}
                    placeholder={isLosingSegment ? "Texte perdant" : "Texte gagnant"}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                  
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    isLosingSegment ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {isLosingSegment ? 'Perdant' : 'Gagnant'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-sm mb-4">Aucun segment configuré</p>
            <button
              onClick={addSegmentPair}
              className="px-6 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors"
            >
              Créer la première paire
            </button>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>💡 Astuce :</strong> Les segments alternent automatiquement entre 2 couleurs. 
            Couleur 1 (gagnants) : <span style={{ color: defaultColors[0] }}>{defaultColors[0]}</span> • 
            Couleur 2 (perdants) : <span style={{ color: defaultColors[1] }}>{defaultColors[1]}</span>
          </p>
        </div>
      </div>

      {/* Comportement de la roue - Section secondaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <RotateCcw className="w-5 h-5 mr-2 text-[#841b60]" />
          ⚙️ Comportement de la roue
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Vitesse de rotation
            </label>
            <select
              value={campaign.gameConfig?.wheel?.speed || 'medium'}
              onChange={(e) => updateWheelConfig({ speed: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            >
              <option value="slow">Lente</option>
              <option value="medium">Moyenne</option>
              <option value="fast">Rapide</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Users className="w-4 h-4 mr-1" />
              Mode de jeu
            </label>
            <select
              value={campaign.gameConfig?.wheel?.mode || 'random'}
              onChange={(e) => updateWheelConfig({ mode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            >
              <option value="random">Aléatoire</option>
              <option value="instant_winner">Gagnant instantané</option>
              <option value="probability">Par probabilité</option>
            </select>
          </div>
        </div>

        {campaign.gameConfig?.wheel?.mode === 'instant_winner' && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Probabilité de gain (0.1 = 10%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={campaign.gameConfig?.wheel?.winProbability || 0.1}
              onChange={(e) => updateWheelConfig({ winProbability: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        )}

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Texte du bouton
          </label>
          <input
            type="text"
            value={campaign.gameConfig?.wheel?.buttonLabel || 'Faire tourner'}
            onChange={(e) => updateWheelConfig({ buttonLabel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            placeholder="Faire tourner"
          />
        </div>
      </div>
    </div>
  );
};

export default WheelGameConfig;
