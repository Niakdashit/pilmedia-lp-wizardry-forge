import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EditorConfig } from '../../QualifioEditorLayout';

interface ScratchMechanicConfigProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

interface ScratchCard {
  id: string;
  content: string;
  isWinning: boolean;
}

const ScratchMechanicConfig: React.FC<ScratchMechanicConfigProps> = ({ config, onConfigUpdate }) => {
  const scratchCards: ScratchCard[] = config.scratchCards || [
    { id: '1', content: 'Bravo ! Vous avez gagné !', isWinning: true },
    { id: '2', content: 'Dommage, essayez encore !', isWinning: false },
    { id: '3', content: 'Perdu ! Retentez votre chance !', isWinning: false },
  ];

  const updateCards = (newCards: ScratchCard[]) => {
    onConfigUpdate({ scratchCards: newCards });
  };

  const addCard = () => {
    const newCard: ScratchCard = {
      id: Date.now().toString(),
      content: 'Nouvelle carte',
      isWinning: false
    };
    updateCards([...scratchCards, newCard]);
  };

  const removeCard = (id: string) => {
    if (scratchCards.length > 2) {
      updateCards(scratchCards.filter(c => c.id !== id));
    }
  };

  const updateCard = (id: string, updates: Partial<ScratchCard>) => {
    updateCards(scratchCards.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <div className="space-y-6">
      {/* Scratch Settings */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres de la carte à gratter</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Couleur de la surface à gratter</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.scratchSurfaceColor || '#C0C0C0'}
                onChange={(e) => onConfigUpdate({ scratchSurfaceColor: e.target.value })}
              />
              <input
                type="text"
                value={config.scratchSurfaceColor || '#C0C0C0'}
                onChange={(e) => onConfigUpdate({ scratchSurfaceColor: e.target.value })}
                placeholder="#C0C0C0"
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Pourcentage de surface à gratter (%)</label>
            <input
              type="number"
              value={config.scratchPercentage || 30}
              onChange={(e) => onConfigUpdate({ scratchPercentage: parseInt(e.target.value) || 30 })}
              min="10"
              max="90"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sidebar-text-primary font-medium text-base">Contenu des cartes</h4>
          <button
            onClick={addCard}
            className="flex items-center gap-2 px-3 py-1 bg-sidebar-active text-white rounded-lg text-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {scratchCards.map((card, index) => (
            <div key={card.id} className="p-3 bg-sidebar-surface rounded-lg border border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-sidebar-text">Carte {index + 1}</span>
                {scratchCards.length > 2 && (
                  <button
                    onClick={() => removeCard(card.id)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="form-group-premium">
                  <label className="text-xs">Contenu de la carte</label>
                  <textarea
                    value={card.content}
                    onChange={(e) => updateCard(card.id, { content: e.target.value })}
                    rows={2}
                    className="w-full text-sm"
                    placeholder="Texte à afficher sous la surface grattée"
                  />
                </div>

                <div className="form-group-premium">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={card.isWinning}
                      onChange={(e) => updateCard(card.id, { isWinning: e.target.checked })}
                    />
                    Carte gagnante
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScratchMechanicConfig;