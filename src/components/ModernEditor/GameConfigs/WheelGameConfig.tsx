
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

  // Palette de couleurs réutilisable pour les nouveaux segments
  const colorPalette = ['#44444d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

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

    // Ajouter une paire de segments (un gagnant et un perdant)
    const winningSegment = {
      id: `${Date.now()}-win`,
      label: `Prix ${Math.floor(currentCount / 2) + 1}`,
      color: colorPalette[currentCount % colorPalette.length],
      textColor: '#ffffff',
      probability: 1,
      isWinning: true
    };

    const losingSegment = {
      id: `${Date.now()}-lose`,
      label: 'Dommage',
      color: colorPalette[(currentCount + 1) % colorPalette.length],
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

  // Définir rapidement le nombre de segments total (valeur paire, sans limite haute)
  const setSegmentCount = (targetCount: number) => {
    // Normaliser: minimum 2, arrondi à pair
    let count = Math.max(2, Math.floor(targetCount));
    if (count % 2 === 1) count += 1;

    // Construire une nouvelle liste à partir des segments existants
    let newSegments = [...segments];

    // Si on a un nombre impair (cas rare), on supprime le dernier pour garder des paires cohérentes
    if (newSegments.length % 2 === 1) {
      newSegments = newSegments.slice(0, -1);
    }

    // Si trop de segments, on tronque
    if (newSegments.length > count) {
      newSegments = newSegments.slice(0, count);
    }

    // Si pas assez, on ajoute des paires jusqu'à atteindre la cible
    while (newSegments.length < count) {
      const idx = newSegments.length; // index du prochain segment à ajouter
      const labelIndex = Math.floor(idx / 2) + 1;

      const win = {
        id: `${Date.now()}-${idx}-win`,
        label: `Prix ${labelIndex}`,
        color: colorPalette[idx % colorPalette.length],
        textColor: '#ffffff',
        probability: 1,
        isWinning: true
      } as any;

      const lose = {
        id: `${Date.now()}-${idx}-lose`,
        label: 'Dommage',
        color: colorPalette[(idx + 1) % colorPalette.length],
        textColor: '#ffffff',
        probability: 1,
        isWinning: false
      } as any;

      newSegments.push(win, lose);
    }

    // S'assurer qu'on retombe exactement sur la cible
    if (newSegments.length > count) {
      newSegments = newSegments.slice(0, count);
    }

    updateWheelConfig({ segments: newSegments });
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent" 
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent" 
            placeholder="Faire tourner" 
          />
        </div>
      </div>

      {/* Sélecteur du nombre de segments (entrée numérique) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Nombre de segments</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={2}
              step={2}
              value={segments.length || 0}
              onChange={(e) => setSegmentCount(parseInt(e.target.value || '0', 10))}
              className="w-24 px-3 py-1 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">Les segments sont gérés par paires (1 gagnant + 1 perdant).</p>
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
              className="px-3 py-1 text-sm bg-gradient-to-br from-[#44444d] to-[#44444d] text-white rounded-lg hover:bg-[#5a5a63] transition-colors"
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
                                   (typeof segment.label === 'string' && (
                                     segment.label.toLowerCase().includes('dommage') || 
                                     segment.label.toLowerCase().includes('perdu') || 
                                     segment.label.toLowerCase().includes('essaie') || 
                                     segment.label.toLowerCase().includes('rejouer')
                                   ));
            const hasPrize = !!segment.prizeId; // si présent, segment gagnant par lot
            const showManual = campaign.gameConfig?.wheel?.mode === 'probability' && !hasPrize;

            const manualValue = typeof segment.manualProbabilityPercent === 'number'
              ? segment.manualProbabilityPercent
              : (typeof segment.chance === 'number' ? segment.chance : '');

            const handleManualChange = (raw: string) => {
              const n = Math.max(0, Math.min(100, Number(raw)));
              // Met à jour le champ manuel et le champ legacy 'chance' pour compatibilité
              const newSegments = [...segments];
              newSegments[index] = {
                ...newSegments[index],
                manualProbabilityPercent: Number.isFinite(n) ? n : 0,
                chance: Number.isFinite(n) ? n : 0
              };
              updateWheelConfig({ segments: newSegments });
            };

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
                  value={segment.color || '#44444d'}
                  onChange={e => updateSegment(index, 'color', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300" 
                />
                <input 
                  type="text" 
                  value={segment.label || ''}
                  onChange={e => updateSegment(index, 'label', e.target.value)}
                  placeholder={isLosingSegment ? "Texte perdant" : "Texte gagnant"}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#44444d] focus:border-transparent" 
                />
                <input 
                  type="color" 
                  value={segment.textColor || '#ffffff'}
                  onChange={e => updateSegment(index, 'textColor', e.target.value)}
                  title="Couleur du texte"
                  className="w-8 h-8 rounded border border-gray-300" 
                />
                {showManual && (
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min={0}
                      max={100}
                      value={manualValue}
                      onChange={e => handleManualChange(e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded" 
                      title="Probabilité (%) - segments sans lot"
                    />
                    <span className="text-xs text-gray-600">%</span>
                  </div>
                )}
                {/* Ne plus afficher l'ancien champ de 'poids' en mode probabilité pour éviter la confusion */}
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
