
import React from 'react';
import { Upload } from 'lucide-react';
import type { EditorConfig } from '../../QualifioEditorLayout';

interface PuzzleMechanicConfigProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const PuzzleMechanicConfig: React.FC<PuzzleMechanicConfigProps> = ({ config, onConfigUpdate }) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onConfigUpdate({ puzzleImage: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Puzzle Settings */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres du puzzle</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Nombre de pièces</label>
            <select
              value={config.puzzlePieces || 9}
              onChange={(e) => onConfigUpdate({ puzzlePieces: parseInt(e.target.value) })}
              className="w-full"
            >
              <option value={4}>4 pièces (2x2)</option>
              <option value={9}>9 pièces (3x3)</option>
              <option value={16}>16 pièces (4x4)</option>
              <option value={25}>25 pièces (5x5)</option>
            </select>
          </div>

          <div className="form-group-premium">
            <label>Temps limite (secondes)</label>
            <input
              type="number"
              value={config.puzzleTimeLimit || 120}
              onChange={(e) => onConfigUpdate({ puzzleTimeLimit: parseInt(e.target.value) || 120 })}
              min="30"
              max="600"
              className="w-full"
            />
          </div>

          <div className="form-group-premium">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.puzzleShowPreview || true}
                onChange={(e) => onConfigUpdate({ puzzleShowPreview: e.target.checked })}
              />
              Afficher l'aperçu de l'image
            </label>
          </div>

          <div className="form-group-premium">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.puzzleAutoShuffle || true}
                onChange={(e) => onConfigUpdate({ puzzleAutoShuffle: e.target.checked })}
              />
              Mélanger automatiquement les pièces
            </label>
          </div>
        </div>
      </div>

      {/* Puzzle Image */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Image du puzzle</h4>
        
        <div className="space-y-4">
          <div className="w-full h-40 bg-sidebar-surface rounded-xl flex items-center justify-center border-2 border-dashed border-sidebar-border overflow-hidden">
            {config.puzzleImage ? (
              <img src={config.puzzleImage} alt="Puzzle" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-sidebar-text mx-auto mb-2" />
                <span className="text-sidebar-text text-sm">Cliquez pour ajouter une image</span>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full"
          />

          {config.puzzleImage && (
            <button
              onClick={() => onConfigUpdate({ puzzleImage: undefined })}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Supprimer l'image
            </button>
          )}
        </div>
      </div>

      {/* Difficulty Settings */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Difficulté</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Niveau de difficulté</label>
            <select
              value={config.puzzleDifficulty || 'medium'}
              onChange={(e) => onConfigUpdate({ puzzleDifficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              className="w-full"
            >
              <option value="easy">Facile (bordures visibles)</option>
              <option value="medium">Moyen (quelques indices)</option>
              <option value="hard">Difficile (aucun indice)</option>
            </select>
          </div>

          <div className="form-group-premium">
            <label>Couleur de fond des pièces</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.puzzleBackgroundColor || '#f0f0f0'}
                onChange={(e) => onConfigUpdate({ puzzleBackgroundColor: e.target.value })}
              />
              <input
                type="text"
                value={config.puzzleBackgroundColor || '#f0f0f0'}
                onChange={(e) => onConfigUpdate({ puzzleBackgroundColor: e.target.value })}
                placeholder="#f0f0f0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleMechanicConfig;
