
import React from 'react';
import { RotateCcw, Palette, Users, Plus, Minus } from 'lucide-react';
import { SmartWheel } from '../../SmartWheel';

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
    
    // Utiliser les couleurs alternées par défaut
    const winningColor = defaultColors[Math.floor(currentCount / 2) % 2];
    const losingColor = defaultColors[(Math.floor(currentCount / 2) + 1) % 2];
    
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
    newSegments[index] = { ...newSegments[index], [field]: value };
    
    // Si on change le label d'un segment, déterminer automatiquement s'il est gagnant ou perdant
    if (field === 'label') {
      const isLosingLabel = value.toLowerCase().includes('dommage') || 
                           value.toLowerCase().includes('perdu') ||
                           value.toLowerCase().includes('essaie') ||
                           value.toLowerCase().includes('rejouer');
      newSegments[index].isWinning = !isLosingLabel;
    }
    
    updateWheelConfig({ segments: newSegments });
  };

  // Compter les segments gagnants et perdants
  const winningSegments = segments.filter((s: any) => s.isWinning !== false && 
    !s.label.toLowerCase().includes('dommage') && 
    !s.label.toLowerCase().includes('perdu') &&
    !s.label.toLowerCase().includes('essaie') &&
    !s.label.toLowerCase().includes('rejouer')).length;
  const losingSegments = segments.length - winningSegments;

  // Préparer les couleurs de marque pour le SmartWheel
  const brandColors = {
    primary: campaign.design?.customColors?.primary || '#841b60',
    secondary: campaign.design?.customColors?.secondary || '#4ecdc4',
    accent: campaign.design?.customColors?.accent || '#45b7d1'
  };

  return (
    <div className="space-y-6">
      {/* Titre et description */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuration de la roue</h3>
        <p className="text-sm text-gray-600">Personnalisez les segments, les couleurs et le comportement de votre roue</p>
      </div>

      {/* Prévisualisation avec le nouveau SmartWheel */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Aperçu en temps réel
          </h4>
          
          {segments.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mr-2">
                {winningSegments} gagnants
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                {losingSegments} perdants
              </span>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <SmartWheel
            segments={segments}
            theme="modern"
            size={280}
            brandColors={brandColors}
            onResult={(segment) => {
              console.log('Segment gagné:', segment);
            }}
            customButton={{
              text: campaign.gameConfig?.wheel?.buttonLabel || 'Faire tourner',
              color: brandColors.primary,
              textColor: '#ffffff'
            }}
          />
        </div>
        
        {segments.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mt-4">
            <div className="text-gray-400 mb-3">
              <Palette className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500 mb-4">Aucun segment configuré</p>
            <button
              onClick={addSegmentPair}
              className="px-4 py-2 text-sm bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Créer la première paire
            </button>
          </div>
        )}
      </div>

      {/* Gestion des segments */}
      {segments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Segments ({segments.length} total)
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={addSegmentPair}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une paire</span>
              </button>
              {segments.length >= 2 && (
                <button
                  onClick={removeSegmentPair}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                  <span>Retirer une paire</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {segments.map((segment: any, index: number) => {
              const isLosingSegment = segment.isWinning === false || 
                segment.label.toLowerCase().includes('dommage') ||
                segment.label.toLowerCase().includes('perdu') ||
                segment.label.toLowerCase().includes('essaie') ||
                segment.label.toLowerCase().includes('rejouer');

              return (
                <div key={segment.id || index} className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                  isLosingSegment ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${isLosingSegment ? 'bg-red-400' : 'bg-green-400'}`} />
                  
                  <input
                    type="color"
                    value={segment.color || defaultColors[index % 2]}
                    onChange={(e) => updateSegment(index, 'color', e.target.value)}
                    className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                    title="Couleur du segment"
                  />
                  
                  <input
                    type="text"
                    value={segment.label || ''}
                    onChange={(e) => updateSegment(index, 'label', e.target.value)}
                    placeholder={isLosingSegment ? "Texte perdant" : "Texte gagnant"}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                  
                  <input
                    type="color"
                    value={segment.textColor || '#ffffff'}
                    onChange={(e) => updateSegment(index, 'textColor', e.target.value)}
                    title="Couleur du texte"
                    className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isLosingSegment ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {isLosingSegment ? 'Perdant' : 'Gagnant'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Astuce :</strong> Les segments sont ajoutés par paires avec des couleurs alternées automatiquement. 
              Les couleurs suivent votre charte graphique (couleurs primaire/secondaire).
            </p>
          </div>
        </div>
      )}

      {/* Configuration avancée */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <RotateCcw className="w-4 h-4 mr-2" />
          Comportement de la roue
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            placeholder="Faire tourner"
          />
        </div>
      </div>
    </div>
  );
};

export default WheelGameConfig;
