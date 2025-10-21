import React, { useState } from 'react';
import { Grid3x3, Eraser, CreditCard, Zap, Plus, Trash2, Calendar, Percent } from 'lucide-react';
import { usePrizeLogic } from '../../../hooks/usePrizeLogic';
import type { Prize } from '../../../types/PrizeSystem';

interface ScratchGamePanelProps {
  campaign?: any;
  setCampaign?: (campaign: any) => void;
  onElementsChange?: (elements: any[]) => void;
  elements?: any[];
  onElementUpdate?: (updates: any) => void;
  selectedElement?: any;
}

const ScratchGamePanel: React.FC<ScratchGamePanelProps> = ({
  campaign,
  setCampaign
}) => {
  const { prizes, addPrize, removePrize } = usePrizeLogic({ 
    campaign: campaign as any, 
    setCampaign: setCampaign as any
  });
  const [activeTab, setActiveTab] = useState<'grid' | 'scratch' | 'cards' | 'logic'>('logic');
  
  // Configuration du scratch stockée dans campaign
  const scratchConfig = campaign?.scratchConfig || {
    gridLayout: '2x2',
    gridSpacing: 20,
    gridRadius: 24,
    brushSize: 25,
    revealThreshold: 15,
    smoothness: 50,
    cards: [
      { id: '1', isWinner: false, coverType: 'color', coverOpacity: 100 },
      { id: '2', isWinner: true, coverType: 'color', coverOpacity: 100 }
    ]
  };
  
  // Mise à jour de la configuration
  const updateConfig = React.useCallback((updates: any) => {
    if (!setCampaign) return;
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      scratchConfig: { ...scratchConfig, ...updates }
    }));
  }, [setCampaign, scratchConfig]);

  const updateCard = (cardId: string, updates: any) => {
    const updatedCards = scratchConfig.cards.map((card: any) => 
      card.id === cardId ? { ...card, ...updates } : card
    );
    updateConfig({ cards: updatedCards });
  };

  const tabs = [
    { id: 'grid', label: 'Grille', icon: Grid3x3 },
    { id: 'scratch', label: 'Grattage', icon: Eraser },
    { id: 'cards', label: 'Cartes', icon: CreditCard },
    { id: 'logic', label: 'Logique', icon: Zap }
  ];

  const gridLayouts = [
    { value: '3x1', label: '3 cartes', sublabel: '(3×1)' },
    { value: '2x2', label: '4 cartes', sublabel: '(2×2)' },
    { value: '3x2', label: '6 cartes', sublabel: '(3×2)' }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Grattage</h2>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 px-4 pt-4 pb-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'grid' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Configuration de la grille</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Nombre maximum de cartes</label>
                  <div className="grid grid-cols-3 gap-2">
                    {gridLayouts.map((layout) => (
                      <button
                        key={layout.value}
                        onClick={() => updateConfig({ gridLayout: layout.value })}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          scratchConfig.gridLayout === layout.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-sm">{layout.label}</div>
                        <div className="text-xs text-gray-500">{layout.sublabel}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Le nombre de cartes visibles est limité globalement à 3, 4 ou 6 et s'applique sur desktop et mobile.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Espacement (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={scratchConfig.gridSpacing}
                      onChange={(e) => updateConfig({ gridSpacing: parseInt(e.target.value) || 20 })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Rayon (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={scratchConfig.gridRadius}
                      onChange={(e) => updateConfig({ gridRadius: parseInt(e.target.value) || 24 })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scratch' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Paramètres de grattage</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Rayon du pinceau: {scratchConfig.brushSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={scratchConfig.brushSize}
                  onChange={(e) => updateConfig({ brushSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Seuil de révélation: {scratchConfig.revealThreshold}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={scratchConfig.revealThreshold}
                  onChange={(e) => updateConfig({ revealThreshold: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pourcentage de surface à gratter pour révéler automatiquement
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Douceur: {scratchConfig.smoothness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scratchConfig.smoothness}
                  onChange={(e) => updateConfig({ smoothness: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Gestion des cartes</h3>
            
            <div className="space-y-3">
              {scratchConfig.cards.map((card: any, index: number) => (
                <div key={card.id} className="p-4 border-2 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Carte {index + 1}</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={card.isWinner}
                        onChange={(e) => updateCard(card.id, { isWinner: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">Gagnante</span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Couverture de la carte</label>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={card.coverType === 'color'}
                            onChange={() => updateCard(card.id, { coverType: 'color' })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Couleur unie</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={card.coverType === 'image'}
                            onChange={() => updateCard(card.id, { coverType: 'image' })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Image</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded border"></div>
                        <span>Opacité: {card.coverOpacity}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={card.coverOpacity}
                        onChange={(e) => updateCard(card.id, { coverOpacity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logic' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Contenu gagnant révélé</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="winContent" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Texte</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="winContent" className="w-4 h-4" />
                    <span className="text-sm">Image</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue="Gagné !"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Message de victoire"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Couleur</span>
                    <div className="w-8 h-8 bg-green-500 rounded border cursor-pointer"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Contenu perdant révélé</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="loseContent" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Texte</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="loseContent" className="w-4 h-4" />
                    <span className="text-sm">Image</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue="Perdu"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Message de défaite"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Couleur</span>
                    <div className="w-8 h-8 bg-red-500 rounded border cursor-pointer"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-2">Lots à gagner ({prizes.length})</h3>
              
              {prizes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {prizes.map((prize) => (
                    <div key={prize.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{prize.name}</div>
                        <div className="text-xs text-gray-500">
                          {prize.method === 'calendar' ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {prize.startDate}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              {prize.probabilityPercent}%
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removePrize(prize.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => {
                  const newPrize = {
                    name: 'Nouveau lot',
                    totalUnits: 1,
                    awardedUnits: 0,
                    method: 'probability' as Prize['method'],
                    probabilityPercent: 10,
                  };
                  addPrize(newPrize);
                }}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer un lot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <button className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Défaut
        </button>
      </div>
    </div>
  );
};

export default ScratchGamePanel;
