import React, { useState, useCallback } from 'react';
import { 
  Grid3X3, 
  Type, 
  Brush, 
  Settings, 
  RotateCcw,
  Minus,
  Plus,
  Trash2,
  Calendar,
  Percent,
  Gift
  // Download,
  // FileUp
} from 'lucide-react';
import { useScratchCardStore } from '../state/scratchcard.store';
import { Cover, ScratchCard, Reveal, Prize } from '../state/types';

const ScratchCardPanel: React.FC = () => {
  const {
    config,
    updateGrid,
    updateBrush,
    updateThreshold,
    updateLogic,
    // updateEffects, // not used in this panel
    removeCard,
    updateCard,
    resetToDefault
  } = useScratchCardStore();

  const [activeSection, setActiveSection] = useState<string>('grid');

  // Section handlers
  const handleGridChange = useCallback((field: string, value: any) => {
    updateGrid({ [field]: value });
  }, [updateGrid]);

  const handleBrushChange = useCallback((field: string, value: any) => {
    updateBrush({ [field]: value });
  }, [updateBrush]);

  // Global cover/reveal handlers removed with sub-tabs; per-card controls are used instead

  const handleCardUpdate = useCallback((cardId: string, updates: Partial<ScratchCard>) => {
    updateCard(cardId, updates);
  }, [updateCard]);

  // Export/Import removed per request

  // Quick grid templates removed per request

  const sections = [
    { id: 'grid', name: 'Grille', icon: Grid3X3 },
    { id: 'brush', name: 'Grattage', icon: Brush },
    { id: 'cards', name: 'Cartes', icon: Type },
    { id: 'logic', name: 'Logique', icon: Settings }
  ];

  return (
    <div className="sc-panel h-full flex flex-col bg-white">
      {/* Header removed per request */}

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-gray-100">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {section.name}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Grille Section */}
        {activeSection === 'grid' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Configuration de la grille</h3>
            
            {/* Quick Templates removed */}

            {/* Max Cards (4 or 6) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de cartes
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => useScratchCardStore.getState().updateMaxCards(3)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    config.maxCards === 3 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  3 cartes (3×1)
                </button>
                <button
                  onClick={() => useScratchCardStore.getState().updateMaxCards(4)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    config.maxCards === 4 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  4 cartes (2×2)
                </button>
                <button
                  onClick={() => useScratchCardStore.getState().updateMaxCards(6)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    config.maxCards === 6 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  6 cartes (3×2)
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Le nombre de cartes visibles est limité globalement à 3, 4 ou 6 et s'applique sur desktop et mobile.</p>
            </div>

            {/* Manual Grid Settings removed (Lignes/Colonnes) */}

            {/* Spacing & Style */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espacement (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={config.grid.gap}
                  onChange={(e) => handleGridChange('gap', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rayon (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={config.grid.borderRadius}
                  onChange={(e) => handleGridChange('borderRadius', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Card Shape fixed to rectangle: UI removed */}
          </div>
        )}

        {/* Couverture Section removed per request */}

        {/* Révélation Section removed per request */}

        {/* Grattage Section */}
        {activeSection === 'brush' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Paramètres de grattage</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rayon du pinceau: {config.brush.radius}px
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.brush.radius}
                  onChange={(e) => handleBrushChange('radius', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seuil de révélation: {Math.round(config.threshold * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={config.threshold}
                  onChange={(e) => updateThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pourcentage de surface à gratter pour révéler automatiquement
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Douceur: {Math.round((config.brush.softness || 0.5) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.brush.softness || 0.5}
                  onChange={(e) => handleBrushChange('softness', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cartes Section */}
        {activeSection === 'cards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Gestion des cartes</h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {config.cards.map((card, index) => (
                <div key={card.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Carte {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={card.isWinner || false}
                          onChange={(e) => handleCardUpdate(card.id, { isWinner: e.target.checked })}
                          className="text-green-600"
                        />
                        Gagnante
                      </label>
                      <button
                        onClick={() => removeCard(card.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {card.progress !== undefined && (
                    <div className="text-xs text-gray-500">
                      Progression: {Math.round(card.progress * 100)}%
                      {card.revealed && <span className="ml-2 text-green-600">✓ Révélée</span>}
                    </div>
                  )}

                  {/* Per-card Cover Settings */}
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="text-xs font-medium text-gray-700">Couverture de la carte</div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`card-${card.id}-cover-type`}
                          checked={(card.cover?.type || config.globalCover?.type || 'color') === 'color'}
                          onChange={() => handleCardUpdate(card.id, { cover: { type: 'color', value: '#D9B7A4', opacity: 1 } as Cover })}
                        />
                        Couleur unie
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={`card-${card.id}-cover-type`}
                          checked={(card.cover?.type || config.globalCover?.type) === 'image'}
                          onChange={() => handleCardUpdate(card.id, { cover: { type: 'image', url: '' } as Cover })}
                        />
                        Image
                      </label>
                    </div>

                    {/* Color controls */}
                    {((card.cover?.type || config.globalCover?.type || 'color') === 'color') && (
                      <div className="grid grid-cols-2 gap-3 items-center">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={card.cover?.type === 'color' ? card.cover.value : (config.globalCover?.type === 'color' ? config.globalCover.value : '#D9B7A4')}
                            onChange={(e) => handleCardUpdate(card.id, { 
                              cover: { 
                                type: 'color', 
                                value: e.target.value, 
                                opacity: card.cover?.type === 'color' ? (card.cover.opacity ?? 1) : 1
                              } as Cover 
                            })}
                            className="h-10 w-full border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Opacité: {Math.round(((card.cover?.type === 'color' ? (card.cover.opacity ?? 1) : (config.globalCover?.type === 'color' ? (config.globalCover.opacity ?? 1) : 1)) * 100))}%</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={card.cover?.type === 'color' ? (card.cover.opacity ?? 1) : 1}
                            onChange={(e) => handleCardUpdate(card.id, { 
                              cover: { 
                                type: 'color', 
                                value: card.cover?.type === 'color' ? card.cover.value : '#D9B7A4', 
                                opacity: parseFloat(e.target.value) 
                              } as Cover 
                            })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Image controls */}
                    {(card.cover?.type === 'image') && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                handleCardUpdate(card.id, { cover: { type: 'image', url: reader.result as string } });
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {card.cover?.type === 'image' && card.cover.url && (
                            <button
                              type="button"
                              onClick={() => handleCardUpdate(card.id, { cover: { type: 'image', url: '' } })}
                              className="px-2 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                        {card.cover?.type === 'image' && card.cover.url && (
                          <div className="flex items-center gap-3">
                            <img src={card.cover.url} alt={`Aperçu carte ${index + 1}`} className="h-16 w-auto rounded border" />
                            <span className="text-xs text-gray-500">Aperçu</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Per-card Reveal Settings removed per request */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logique Section */}
        {activeSection === 'logic' && (
          <div className="space-y-4">
            {/* Winner Reveal Section */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
              <h4 className="font-medium text-gray-900">Contenu gagnant révélé</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="winnerRevealType"
                      checked={config.logic.winnerReveal?.type === 'text'}
                      onChange={() => updateLogic({ 
                        winnerReveal: { 
                          type: 'text', 
                          value: 'Gagné !',
                          style: { fontSize: 18, fontWeight: 700, color: '#22c55e', align: 'center' }
                        } as Reveal 
                      })}
                      className="text-blue-600"
                    />
                    Texte
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="winnerRevealType"
                      checked={config.logic.winnerReveal?.type === 'image'}
                      onChange={() => updateLogic({ winnerReveal: { type: 'image', url: '' } as Reveal })}
                      className="text-blue-600"
                    />
                    Image
                  </label>
                </div>

                {config.logic.winnerReveal?.type === 'text' && (
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Texte gagnant..."
                      value={config.logic.winnerReveal.type === 'text' ? config.logic.winnerReveal.value || '' : ''}
                      onChange={(e) => updateLogic({ 
                        winnerReveal: { 
                          type: 'text',
                          value: e.target.value,
                          style: config.logic.winnerReveal?.type === 'text' ? config.logic.winnerReveal.style : { fontSize: 18, fontWeight: 700, color: '#22c55e', align: 'center' }
                        } as Reveal 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Couleur</label>
                      <input
                        type="color"
                        value={config.logic.winnerReveal?.type === 'text' ? config.logic.winnerReveal.style?.color || '#22c55e' : '#22c55e'}
                        onChange={(e) => updateLogic({ 
                          winnerReveal: { 
                            type: 'text',
                            value: config.logic.winnerReveal?.type === 'text' ? config.logic.winnerReveal.value || '' : '',
                            style: { ...(config.logic.winnerReveal?.type === 'text' ? config.logic.winnerReveal.style : {}), color: e.target.value }
                          } as Reveal 
                        })}
                        className="h-10 w-14 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {config.logic.winnerReveal?.type === 'image' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            updateLogic({ winnerReveal: { type: 'image', url: reader.result as string } as Reveal });
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {config.logic.winnerReveal.url && (
                        <button
                          type="button"
                          onClick={() => updateLogic({ winnerReveal: { type: 'image', url: '' } as Reveal })}
                          className="px-2 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                    {config.logic.winnerReveal.url && (
                      <div className="flex items-center gap-3">
                        <img src={config.logic.winnerReveal.url} alt="Aperçu gagnant" className="h-16 w-auto rounded border" />
                        <span className="text-xs text-gray-500">Aperçu</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Loser Reveal Section */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
              <h4 className="font-medium text-gray-900">Contenu perdant révélé</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="loserRevealType"
                      checked={config.logic.loserReveal?.type === 'text'}
                      onChange={() => updateLogic({ 
                        loserReveal: { 
                          type: 'text', 
                          value: 'Perdu',
                          style: { fontSize: 16, fontWeight: 600, color: '#ef4444', align: 'center' }
                        } as Reveal 
                      })}
                      className="text-blue-600"
                    />
                    Texte
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="loserRevealType"
                      checked={config.logic.loserReveal?.type === 'image'}
                      onChange={() => updateLogic({ loserReveal: { type: 'image', url: '' } as Reveal })}
                      className="text-blue-600"
                    />
                    Image
                  </label>
                </div>

                {config.logic.loserReveal?.type === 'text' && (
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Texte perdant..."
                      value={config.logic.loserReveal.type === 'text' ? config.logic.loserReveal.value || '' : ''}
                      onChange={(e) => updateLogic({ 
                        loserReveal: { 
                          type: 'text',
                          value: e.target.value,
                          style: config.logic.loserReveal?.type === 'text' ? config.logic.loserReveal.style : { fontSize: 16, fontWeight: 600, color: '#ef4444', align: 'center' }
                        } as Reveal 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Couleur</label>
                      <input
                        type="color"
                        value={config.logic.loserReveal?.type === 'text' ? config.logic.loserReveal.style?.color || '#ef4444' : '#ef4444'}
                        onChange={(e) => updateLogic({ 
                          loserReveal: { 
                            type: 'text',
                            value: config.logic.loserReveal?.type === 'text' ? config.logic.loserReveal.value || '' : '',
                            style: { ...(config.logic.loserReveal?.type === 'text' ? config.logic.loserReveal.style : {}), color: e.target.value }
                          } as Reveal 
                        })}
                        className="h-10 w-14 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}

                {config.logic.loserReveal?.type === 'image' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            updateLogic({ loserReveal: { type: 'image', url: reader.result as string } as Reveal });
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {config.logic.loserReveal.url && (
                        <button
                          type="button"
                          onClick={() => updateLogic({ loserReveal: { type: 'image', url: '' } as Reveal })}
                          className="px-2 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                    {config.logic.loserReveal.url && (
                      <div className="flex items-center gap-3">
                        <img src={config.logic.loserReveal.url} alt="Aperçu perdant" className="h-16 w-auto rounded border" />
                        <span className="text-xs text-gray-500">Aperçu</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Prizes Section */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Lots à gagner ({(config.logic.prizes || []).length})</h4>
                <button
                  onClick={() => {
                    const newPrize: Prize = {
                      id: Date.now().toString(),
                      name: 'Nouveau lot',
                      quantity: 1,
                      totalUnits: 1,
                      attributionMethod: 'probability',
                      probability: 10
                    };
                    updateLogic({ 
                      prizes: [...(config.logic.prizes || []), newPrize] 
                    });
                  }}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Créer un lot
                </button>
              </div>

              {(config.logic.prizes || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun lot configuré</p>
                  <p className="text-sm">Cliquez sur "Créer un lot" pour commencer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(config.logic.prizes || []).map((prize, index) => (
                    <div key={prize.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">
                          Lot {index + 1}
                        </span>
                        <button
                          onClick={() => {
                            const updatedPrizes = (config.logic.prizes || []).filter(p => p.id !== prize.id);
                            updateLogic({ prizes: updatedPrizes });
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Nom et quantité */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Nom du lot
                            </label>
                            <input
                              type="text"
                              value={prize.name}
                              onChange={(e) => {
                                const updatedPrizes = (config.logic.prizes || []).map(p => 
                                  p.id === prize.id ? { ...p, name: e.target.value } : p
                                );
                                updateLogic({ prizes: updatedPrizes });
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Quantité
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={prize.quantity}
                              onChange={(e) => {
                                const updatedPrizes = (config.logic.prizes || []).map(p => 
                                  p.id === prize.id ? { ...p, quantity: Number(e.target.value) || 1 } : p
                                );
                                updateLogic({ prizes: updatedPrizes });
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Méthode d'attribution */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Méthode d'attribution
                          </label>
                          <div className="flex space-x-3">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`attribution-${prize.id}`}
                                checked={prize.attributionMethod === 'probability'}
                                onChange={() => {
                                  const updatedPrizes = (config.logic.prizes || []).map(p => 
                                    p.id === prize.id ? { ...p, attributionMethod: 'probability' as const } : p
                                  );
                                  updateLogic({ prizes: updatedPrizes });
                                }}
                                className="mr-2"
                              />
                              <Percent className="w-4 h-4 mr-1" />
                              <span className="text-sm">Probabilité</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`attribution-${prize.id}`}
                                checked={prize.attributionMethod === 'calendar'}
                                onChange={() => {
                                  const updatedPrizes = (config.logic.prizes || []).map(p => 
                                    p.id === prize.id ? { ...p, attributionMethod: 'calendar' as const } : p
                                  );
                                  updateLogic({ prizes: updatedPrizes });
                                }}
                                className="mr-2"
                              />
                              <Calendar className="w-4 h-4 mr-1" />
                              <span className="text-sm">Calendrier</span>
                            </label>
                          </div>
                        </div>

                        {/* Configuration selon la méthode */}
                        {prize.attributionMethod === 'probability' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Probabilité (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={prize.probability || 0}
                              onChange={(e) => {
                                const updatedPrizes = (config.logic.prizes || []).map(p => 
                                  p.id === prize.id ? { ...p, probability: Number(e.target.value) } : p
                                );
                                updateLogic({ prizes: updatedPrizes });
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}

                        {prize.attributionMethod === 'calendar' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Date d'attribution
                              </label>
                              <input
                                type="date"
                                value={prize.calendarDate || ''}
                                onChange={(e) => {
                                  const updatedPrizes = (config.logic.prizes || []).map(p => 
                                    p.id === prize.id ? { ...p, calendarDate: e.target.value } : p
                                  );
                                  updateLogic({ prizes: updatedPrizes });
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Heure d'attribution
                              </label>
                              <input
                                type="time"
                                value={prize.calendarTime || ''}
                                onChange={(e) => {
                                  const updatedPrizes = (config.logic.prizes || []).map(p => 
                                    p.id === prize.id ? { ...p, calendarTime: e.target.value } : p
                                  );
                                  updateLogic({ prizes: updatedPrizes });
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions (Exporter/Importer removed) */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={resetToDefault}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw size={16} />
          Défaut
        </button>
      </div>
    </div>
  );
};

export default ScratchCardPanel;
