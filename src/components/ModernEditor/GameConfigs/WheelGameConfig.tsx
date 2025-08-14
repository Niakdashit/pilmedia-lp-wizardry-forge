
import React from 'react';
import { RotateCcw, Palette, Users } from 'lucide-react';

interface WheelGameConfigProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const WheelGameConfig: React.FC<WheelGameConfigProps> = ({
  campaign,
  setCampaign
}) => {
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
    const colors = ['#841b60', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const currentCount = segments.length;

    // Ajouter une paire de segments (un gagnant et un perdant)
    const winningSegment = {
      id: `${Date.now()}-win`,
      label: `Prix ${Math.floor(currentCount / 2) + 1}`,
      color: colors[currentCount % colors.length],
      textColor: '#ffffff',
      probability: 1,
      isWinning: true
    };

    const losingSegment = {
      id: `${Date.now()}-lose`,
      label: 'Dommage',
      color: colors[(currentCount + 1) % colors.length],
      textColor: '#ffffff',
      probability: 1,
      isWinning: false
    };

    const newSegments = [...segments, winningSegment, losingSegment];
    updateWheelConfig({
      segments: newSegments
    });
  };

  const removeSegmentPair = () => {
    if (segments.length >= 2) {
      const newSegments = segments.slice(0, -2);
      updateWheelConfig({
        segments: newSegments
      });
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

    updateWheelConfig({
      segments: newSegments
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration générale */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Configuration générale</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Vitesse de rotation
            </label>
            <select 
              value={campaign.gameConfig?.wheel?.speed || 'medium'} 
              onChange={e => updateWheelConfig({ speed: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            >
              <option value="slow">Lente</option>
              <option value="medium">Moyenne</option>
              <option value="fast">Rapide</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Mode de jeu
            </label>
            <select 
              value={campaign.gameConfig?.wheel?.mode || 'random'} 
              onChange={e => updateWheelConfig({ mode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            >
              <option value="random">Aléatoire</option>
              <option value="instant_winner">Gagnant instantané</option>
              <option value="probability">Par probabilité</option>
            </select>
          </div>
        </div>

        {campaign.gameConfig?.wheel?.mode === 'instant_winner' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Probabilité de gain (0.1 = 10%)
            </label>
            <input 
              type="number" 
              step="0.1" 
              min="0" 
              max="1"
              value={campaign.gameConfig?.wheel?.winProbability || 0.1}
              onChange={e => updateWheelConfig({ winProbability: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent" 
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Texte du bouton
          </label>
          <input 
            type="text" 
            value={campaign.gameConfig?.wheel?.buttonLabel || 'Faire tourner'}
            onChange={e => updateWheelConfig({ buttonLabel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent" 
            placeholder="Faire tourner" 
          />
        </div>
      </div>

      {/* Gestion des segments par paires */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Palette className="w-4 h-4 mr-2" />
            Segments de la roue ({segments.length} segments)
          </label>
          <div className="flex space-x-2">
            <button
              onClick={addSegmentPair}
              className="px-3 py-1 text-sm bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors"
            >
              + Ajouter une paire
            </button>
            {segments.length >= 2 && (
              <button
                onClick={removeSegmentPair}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                - Retirer une paire
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {segments.map((segment: any, index: number) => {
            const isLosingSegment = segment.isWinning === false || 
                                   segment.label.toLowerCase().includes('dommage') || 
                                   segment.label.toLowerCase().includes('perdu') || 
                                   segment.label.toLowerCase().includes('essaie') || 
                                   segment.label.toLowerCase().includes('rejouer');

            return (
              <div 
                key={segment.id || index} 
                className={`flex items-center space-x-2 p-3 border rounded-lg ${
                  isLosingSegment ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${isLosingSegment ? 'bg-red-400' : 'bg-green-400'}`} />
                <input 
                  type="color" 
                  value={segment.color || '#841b60'}
                  onChange={e => updateSegment(index, 'color', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300" 
                />
                <input 
                  type="text" 
                  value={segment.label || ''}
                  onChange={e => updateSegment(index, 'label', e.target.value)}
                  placeholder={isLosingSegment ? "Texte perdant" : "Texte gagnant"}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#841b60] focus:border-transparent" 
                />
                <input 
                  type="color" 
                  value={segment.textColor || '#ffffff'}
                  onChange={e => updateSegment(index, 'textColor', e.target.value)}
                  title="Couleur du texte"
                  className="w-8 h-8 rounded border border-gray-300" 
                />
                {campaign.gameConfig?.wheel?.mode === 'probability' && (
                  <input 
                    type="number" 
                    min="1"
                    value={segment.probability || 1}
                    onChange={e => updateSegment(index, 'probability', parseInt(e.target.value))}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded" 
                    title="Poids" 
                  />
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isLosingSegment ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {isLosingSegment ? 'Perdant' : 'Gagnant'}
                </span>
              </div>
            );
          })}
        </div>

        {segments.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Conseil :</strong> Les segments sont ajoutés par paires (1 gagnant + 1 perdant). 
              Les segments contenant "Dommage", "Perdu", "Essaie" ou "Rejouer" sont automatiquement considérés comme perdants.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WheelGameConfig;
