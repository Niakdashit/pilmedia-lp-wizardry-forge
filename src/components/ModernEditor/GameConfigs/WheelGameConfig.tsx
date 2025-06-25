
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

  const addSegment = () => {
    const colors = ['#841b60', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const newSegment = {
      id: Date.now(),
      label: `Segment ${segments.length + 1}`,
      color: colors[segments.length % colors.length],
      textColor: '#ffffff',
      probability: 1
    };
    
    const newSegments = [...segments, newSegment];
    updateWheelConfig({ segments: newSegments });
  };

  const removeSegment = (index: number) => {
    const newSegments = segments.filter((_: any, i: number) => i !== index);
    updateWheelConfig({ segments: newSegments });
  };

  const updateSegment = (index: number, field: string, value: any) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    updateWheelConfig({ segments: newSegments });
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
              onChange={(e) => updateWheelConfig({ speed: e.target.value })}
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
              onChange={(e) => updateWheelConfig({ mode: e.target.value })}
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
              onChange={(e) => updateWheelConfig({ winProbability: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Couleurs de la roue */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Apparence de la roue</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleur de bordure</label>
            <input
              type="color"
              value={campaign.gameConfig?.wheel?.borderColor || '#000000'}
              onChange={(e) => updateWheelConfig({ borderColor: e.target.value })}
              className="w-full h-10 rounded-lg border border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Épaisseur bordure</label>
            <input
              type="range"
              min="0"
              max="10"
              value={campaign.gameConfig?.wheel?.borderWidth || 2}
              onChange={(e) => updateWheelConfig({ borderWidth: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{campaign.gameConfig?.wheel?.borderWidth || 2}px</span>
          </div>
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Palette className="w-4 h-4 mr-2" />
            Segments de la roue ({segments.length})
          </label>
          <button
            onClick={addSegment}
            className="px-3 py-1 text-sm bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors"
          >
            Ajouter
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {segments.map((segment: any, index: number) => (
            <div key={segment.id || index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
              <input
                type="color"
                value={segment.color || '#841b60'}
                onChange={(e) => updateSegment(index, 'color', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={segment.label || ''}
                onChange={(e) => updateSegment(index, 'label', e.target.value)}
                placeholder="Texte du segment"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#841b60] focus:border-transparent"
              />
              <input
                type="color"
                value={segment.textColor || '#ffffff'}
                onChange={(e) => updateSegment(index, 'textColor', e.target.value)}
                title="Couleur du texte"
                className="w-8 h-8 rounded border border-gray-300"
              />
              {campaign.gameConfig?.wheel?.mode === 'probability' && (
                <input
                  type="number"
                  min="1"
                  value={segment.probability || 1}
                  onChange={(e) => updateSegment(index, 'probability', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  title="Poids"
                />
              )}
              <button
                onClick={() => removeSegment(index)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                title="Supprimer"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {segments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Aucun segment configuré</p>
            <p className="text-xs">Cliquez sur "Ajouter" pour créer votre premier segment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WheelGameConfig;
