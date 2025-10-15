import React, { useState } from 'react';
import { Settings, Plus, Trash2, Calendar, Percent, CircleDot, Zap } from 'lucide-react';
import { usePrizeLogic } from '../../../hooks/usePrizeLogic';
import type { Prize } from '../../../types/PrizeSystem';

interface JackpotGamePanelProps {
  campaign?: any;
  setCampaign?: (campaign: any) => void;
  onElementsChange?: (elements: any[]) => void;
  elements?: any[];
  onElementUpdate?: (updates: any) => void;
  selectedElement?: any;
}

const JackpotGamePanel: React.FC<JackpotGamePanelProps> = ({
  campaign,
  setCampaign
}) => {
  const { prizes, addPrize, removePrize } = usePrizeLogic({ 
    campaign: campaign as any, 
    setCampaign: setCampaign as any
  });
  const [activeTab, setActiveTab] = useState<'config' | 'symbols' | 'logic'>('logic');
  
  // Configuration du jackpot stockée dans campaign
  const jackpotConfig = campaign?.jackpotConfig || {
    reels: 3,
    symbolsPerReel: 3,
    spinDuration: 3000,
    symbols: ['🍒', '🍋', '💎', '⭐', '7️⃣'],
  };
  
  // Mise à jour de la configuration
  const updateConfig = React.useCallback((updates: any) => {
    if (!setCampaign) return;
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      jackpotConfig: { ...jackpotConfig, ...updates }
    }));
  }, [setCampaign, jackpotConfig]);

  const tabs = [
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'symbols', label: 'Symboles', icon: CircleDot },
    { id: 'logic', label: 'Logique', icon: Zap }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Jackpot</h2>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-2 border-b">
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
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Configuration de la machine</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Nombre de rouleaux</label>
                  <input
                    type="number"
                    min="3"
                    max="5"
                    value={jackpotConfig.reels}
                    onChange={(e) => updateConfig({ reels: parseInt(e.target.value) || 3 })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Symboles par rouleau</label>
                  <input
                    type="number"
                    min="3"
                    max="5"
                    value={jackpotConfig.symbolsPerReel}
                    onChange={(e) => updateConfig({ symbolsPerReel: parseInt(e.target.value) || 3 })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Durée du spin (ms)</label>
                  <input
                    type="number"
                    min="1000"
                    max="5000"
                    step="500"
                    value={jackpotConfig.spinDuration}
                    onChange={(e) => updateConfig({ spinDuration: parseInt(e.target.value) || 3000 })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'symbols' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Symboles disponibles</h3>
            <div className="text-sm text-gray-500">
              Configuration des symboles à venir...
            </div>
          </div>
        )}

        {activeTab === 'logic' && (
          <div className="space-y-6">
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

export default JackpotGamePanel;
