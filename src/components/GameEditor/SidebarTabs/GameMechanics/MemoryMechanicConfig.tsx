import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EditorConfig } from '../../GameEditorLayout';

interface MemoryMechanicConfigProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}


const MemoryMechanicConfig: React.FC<MemoryMechanicConfigProps> = ({ config, onConfigUpdate }) => {
  const memoryPairs = config.memoryPairs || [
    { id: '1', name: 'Paire 1', image1: '🎯', image2: '🎯' },
    { id: '2', name: 'Paire 2', image1: '⭐', image2: '⭐' },
    { id: '3', name: 'Paire 3', image1: '🎨', image2: '🎨' },
  ];

  const updatePairs = (newPairs: any[]) => {
    onConfigUpdate({ memoryPairs: newPairs });
  };

  const addPair = () => {
    const newPair = {
      id: Date.now().toString(),
      name: `Paire ${memoryPairs.length + 1}`,
      image1: '❓',
      image2: '❓'
    };
    updatePairs([...memoryPairs, newPair]);
  };

  const removePair = (id: string) => {
    if (memoryPairs.length > 2) {
      updatePairs(memoryPairs.filter(p => p.id !== id));
    }
  };

  const updatePair = (id: string, updates: any) => {
    updatePairs(memoryPairs.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return (
    <div className="space-y-6">
      {/* Memory Settings */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres du Memory</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Taille de la grille</label>
            <select
              value={config.memoryGridSize || '4x3'}
              onChange={(e) => onConfigUpdate({ memoryGridSize: e.target.value })}
              className="w-full"
            >
              <option value="2x3">2x3 (6 cartes)</option>
              <option value="4x3">4x3 (12 cartes)</option>
              <option value="4x4">4x4 (16 cartes)</option>
              <option value="6x4">6x4 (24 cartes)</option>
            </select>
          </div>

          <div className="form-group-premium">
            <label>Temps limite (secondes)</label>
            <input
              type="number"
              value={config.memoryTimeLimit || 60}
              onChange={(e) => onConfigUpdate({ memoryTimeLimit: parseInt(e.target.value) || 60 })}
              min="30"
              max="300"
              className="w-full"
            />
          </div>

          <div className="form-group-premium">
            <label>Couleur du dos des cartes</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.memoryCardBackColor || '#3b82f6'}
                onChange={(e) => onConfigUpdate({ memoryCardBackColor: e.target.value })}
              />
              <input
                type="text"
                value={config.memoryCardBackColor || '#3b82f6'}
                onChange={(e) => onConfigUpdate({ memoryCardBackColor: e.target.value })}
                placeholder="#3b82f6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Memory Pairs */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sidebar-text-primary font-medium text-base">Paires de cartes</h4>
          <button
            onClick={addPair}
            className="flex items-center gap-2 px-3 py-1 bg-sidebar-active text-white rounded-lg text-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {memoryPairs.map((pair) => (
            <div key={pair.id} className="p-3 bg-sidebar-surface rounded-lg border border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-sidebar-text">{pair.name}</span>
                {memoryPairs.length > 2 && (
                  <button
                    onClick={() => removePair(pair.id)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group-premium">
                  <label className="text-xs">Image/Emoji</label>
                  <input
                    type="text"
                    value={pair.image1}
                    onChange={(e) => updatePair(pair.id, { image1: e.target.value, image2: e.target.value })}
                    className="w-full text-center text-lg"
                    maxLength={2}
                  />
                </div>

                <div className="form-group-premium">
                  <label className="text-xs">Aperçu</label>
                  <div className="w-full h-10 bg-white rounded border flex items-center justify-center text-2xl">
                    {pair.image1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryMechanicConfig;