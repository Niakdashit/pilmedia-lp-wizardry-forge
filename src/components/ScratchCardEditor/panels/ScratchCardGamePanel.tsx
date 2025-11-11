import React, { useState } from 'react';
import { Grid3x3, Paintbrush, CreditCard, Settings } from 'lucide-react';
import { useScratchCardStore } from '../state/scratchcard.store';

interface ScratchCardGamePanelProps {
  campaign?: any;
  setCampaign?: (campaign: any) => void;
  onElementsChange?: (elements: any[]) => void;
  elements?: any[];
  onElementUpdate?: (updates: any) => void;
  selectedElement?: any;
}

const ScratchCardGamePanel: React.FC<ScratchCardGamePanelProps> = ({
  campaign,
  setCampaign
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'scratch' | 'cards' | 'logic'>('grid');
  const scratchConfig = useScratchCardStore((state) => state.config);
  const updateStoreConfig = useScratchCardStore((state) => state.updateConfig);
  const updateStoreMaxCards = useScratchCardStore((state) => state.updateMaxCards);
  
  // Initialiser le store une seule fois au montage
  const isInitialMount = React.useRef(true);
  
  React.useEffect(() => {
    if (isInitialMount.current) {
      console.log('[ScratchPanel] mount: isInitialMount=true; has campaign.scratchConfig =', !!campaign?.scratchConfig);
    }
    if (isInitialMount.current && campaign?.scratchConfig) {
      console.log('[ScratchPanel] initializing store from campaign.scratchConfig');
      updateStoreConfig(campaign.scratchConfig);
      isInitialMount.current = false;
    }
  }, [campaign?.scratchConfig, updateStoreConfig]);

  // Synchroniser la campagne uniquement quand c'est nécessaire
  const prevScratchConfig = React.useRef(scratchConfig);
  
  React.useEffect(() => {
    if (!setCampaign) return;
    
    // Vérifier si les données ont vraiment changé
    const prevStr = JSON.stringify(prevScratchConfig.current);
    const nextStr = JSON.stringify(scratchConfig);
    if (prevStr === nextStr) {
      console.log('[ScratchPanel] no-op sync: store config unchanged');
      return;
    }
    
    const prevLen = prevStr.length;
    const nextLen = nextStr.length;
    console.log('[ScratchPanel] syncing store -> campaign.scratchConfig', { prevLen, nextLen });
    prevScratchConfig.current = scratchConfig;
    
    setCampaign((prev: any) => {
      const merged = {
        ...prev,
        name: prev?.name || 'Campaign',
        scratchConfig: { ...scratchConfig }
      };
      console.log('[ScratchPanel] setCampaign called (store -> campaign)');
      return merged;
    });
  }, [scratchConfig, setCampaign]);
  
  // Mise à jour de la configuration via le store
  const updateConfig = React.useCallback((updates: any) => {
    updateStoreConfig(updates);
  }, [updateStoreConfig]);

  const tabs = [
    { id: 'grid', label: 'Grille', icon: Grid3x3 },
    { id: 'scratch', label: 'Grattage', icon: Paintbrush },
    { id: 'cards', label: 'Cartes', icon: CreditCard },
    { id: 'logic', label: 'Logique', icon: Settings }
  ];

  // Grid configuration
  const gridOptions = [
    { value: 3, label: '3 cartes', layout: '(3×1)' },
    { value: 4, label: '4 cartes', layout: '(2×2)' },
    { value: 6, label: '6 cartes', layout: '(3×2)' }
  ];

  const handleGridChange = (maxCards: number) => {
    // Utiliser la logique dédiée qui normalise rows/cols
    updateStoreMaxCards(maxCards as 3 | 4 | 6);
  };

  const handleBrushSizeChange = (radius: number) => {
    updateConfig({ brush: { ...scratchConfig.brush, radius } });
  };

  const handleThresholdChange = (threshold: number) => {
    updateConfig({ threshold: threshold / 100 });
  };

  const handleSoftnessChange = (softness: number) => {
    updateConfig({ brush: { ...scratchConfig.brush, softness: softness / 100 } });
  };

  const handleCardCoverChange = (cardIndex: number, type: 'color' | 'image', value: string) => {
    const cards = [...(scratchConfig.cards || [])];
    if (!cards[cardIndex]) {
      cards[cardIndex] = { id: `card-${cardIndex}`, title: `Carte ${cardIndex + 1}` };
    }
    cards[cardIndex] = {
      ...cards[cardIndex],
      cover: { type, value: type === 'color' ? value : '', url: type === 'image' ? value : '' }
    };
    updateConfig({ cards });
  };

  const handleCardWinnerChange = (cardIndex: number, isWinner: boolean) => {
    const cards = [...(scratchConfig.cards || [])];
    if (!cards[cardIndex]) {
      cards[cardIndex] = { id: `card-${cardIndex}`, title: `Carte ${cardIndex + 1}` };
    }
    cards[cardIndex] = { ...cards[cardIndex], isWinner };
    updateConfig({ cards });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Grattage</h2>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 px-4 pt-4 pb-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
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
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Nombre maximum de cartes</label>
                <div className="grid grid-cols-3 gap-2">
                  {gridOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleGridChange(option.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        scratchConfig.maxCards === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.layout}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Le nombre de cartes visibles est limité globalement à 3, 4 ou 6 et s'applique sur desktop et mobile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Espacement (px)</label>
                <input
                  type="number"
                  value={scratchConfig.grid?.gap || 20}
                  onChange={(e) => updateConfig({ grid: { ...scratchConfig.grid, gap: parseInt(e.target.value) || 20 } })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Rayon (px)</label>
                <input
                  type="number"
                  value={scratchConfig.grid?.borderRadius || 24}
                  onChange={(e) => updateConfig({ grid: { ...scratchConfig.grid, borderRadius: parseInt(e.target.value) || 24 } })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scratch' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Paramètres de grattage</h3>
            
            <div>
              <label className="text-sm text-gray-600">Rayon du pinceau: {scratchConfig.brush?.radius || 25}px</label>
              <input
                type="range"
                min="10"
                max="100"
                value={scratchConfig.brush?.radius || 25}
                onChange={(e) => handleBrushSizeChange(parseInt(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Seuil de révélation: {Math.round((scratchConfig.threshold || 0.15) * 100)}%</label>
              <input
                type="range"
                min="5"
                max="95"
                value={Math.round((scratchConfig.threshold || 0.15) * 100)}
                onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pourcentage de surface à gratter pour révéler automatiquement
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Douceur: {Math.round((scratchConfig.brush?.softness || 0.5) * 100)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round((scratchConfig.brush?.softness || 0.5) * 100)}
                onChange={(e) => handleSoftnessChange(parseInt(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Gestion des cartes</h3>
            
            {Array.from({ length: scratchConfig.maxCards || 4 }).map((_, index) => {
              const card = scratchConfig.cards?.[index];
              return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Carte {index + 1}</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={card?.isWinner || false}
                        onChange={(e) => handleCardWinnerChange(index, e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Gagnante</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Couverture de la carte</label>
                    <div className="flex gap-2 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`card-${index}-cover-type`}
                        checked={card?.cover?.type !== 'image'}
                        onChange={() => handleCardCoverChange(index, 'color', (card?.cover?.type === 'color' ? card.cover.value : '#C0C0C0'))}
                        />
                        <span className="text-sm">Couleur unie</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`card-${index}-cover-type`}
                        checked={card?.cover?.type === 'image'}
                        onChange={() => handleCardCoverChange(index, 'image', (card?.cover?.type === 'image' ? card.cover.url : ''))}
                        />
                        <span className="text-sm">Image</span>
                      </label>
                    </div>

                    {card?.cover?.type !== 'image' && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={card?.cover?.value || '#C0C0C0'}
                          onChange={(e) => handleCardCoverChange(index, 'color', e.target.value)}
                          className="w-12 h-8 rounded border"
                        />
                        <span className="text-sm">Opacité: 100%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue="100"
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'logic' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>🎁 Gestion de la dotation</strong><br />
                Pour configurer les lots et les images gagnantes, ouvrez les <strong>Paramètres de la campagne</strong> (icône ⚙️ en haut) puis allez dans l'onglet <strong>"Dotation"</strong>.
              </p>
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

export default ScratchCardGamePanel;
