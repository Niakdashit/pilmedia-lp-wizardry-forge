import React, { useState, useCallback } from 'react';
import { 
  Grid3X3, 
  Palette, 
  Image, 
  Type, 
  Brush, 
  Settings, 
  Upload, 
  RotateCcw,
  Plus,
  Minus,
  Download,
  FileUp,
  Square,
  RectangleHorizontal
} from 'lucide-react';
import { useScratchCardStore } from '../state/scratchcard.store';
import { Cover, Reveal, ScratchCard } from '../state/types';

const ScratchCardPanel: React.FC = () => {
  const {
    config,
    updateGrid,
    updateBrush,
    updateThreshold,
    updateGlobalCover,
    updateGlobalReveal,
    updateLogic,
    updateEffects,
    updateCardShape,
    addCard,
    removeCard,
    updateCard,
    resetAllCards,
    exportConfig,
    importConfig,
    resetToDefault
  } = useScratchCardStore();

  const [activeSection, setActiveSection] = useState<string>('grid');
  const [importText, setImportText] = useState('');

  // Section handlers
  const handleGridChange = useCallback((field: string, value: any) => {
    updateGrid({ [field]: value });
  }, [updateGrid]);

  const handleBrushChange = useCallback((field: string, value: any) => {
    updateBrush({ [field]: value });
  }, [updateBrush]);

  const handleCoverChange = useCallback((cover: Cover) => {
    updateGlobalCover(cover);
  }, [updateGlobalCover]);

  const handleRevealChange = useCallback((reveal: Reveal) => {
    updateGlobalReveal(reveal);
  }, [updateGlobalReveal]);

  const handleCardUpdate = useCallback((cardId: string, updates: Partial<ScratchCard>) => {
    updateCard(cardId, updates);
  }, [updateCard]);

  const handleImport = useCallback(() => {
    if (importConfig(importText)) {
      setImportText('');
      alert('Configuration importée avec succès !');
    } else {
      alert('Erreur lors de l\'import de la configuration');
    }
  }, [importConfig, importText]);

  const handleExport = useCallback(() => {
    const config = exportConfig();
    navigator.clipboard.writeText(config);
    alert('Configuration copiée dans le presse-papiers !');
  }, [exportConfig]);

  // Quick grid templates
  const gridTemplates = [
    { name: '2×2', rows: 2, cols: 2 },
    { name: '3×2', rows: 2, cols: 3 },
    { name: '3×3', rows: 3, cols: 3 },
    { name: '4×2', rows: 2, cols: 4 },
    { name: '2×4', rows: 4, cols: 2 },
    { name: '4×3', rows: 3, cols: 4 }
  ];

  const sections = [
    { id: 'grid', name: 'Grille', icon: Grid3X3 },
    { id: 'cover', name: 'Couverture', icon: Palette },
    { id: 'reveal', name: 'Révélation', icon: Image },
    { id: 'brush', name: 'Grattage', icon: Brush },
    { id: 'cards', name: 'Cartes', icon: Type },
    { id: 'logic', name: 'Logique', icon: Settings }
  ];

  return (
    <div className="sc-panel h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Jeu de Cartes à Gratter</h2>
        <p className="text-sm text-gray-600 mt-1">Configuration du jeu interactif</p>
      </div>

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
            
            {/* Quick Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gabarits rapides
              </label>
              <div className="grid grid-cols-3 gap-2">
                {gridTemplates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      handleGridChange('rows', template.rows);
                      handleGridChange('cols', template.cols);
                    }}
                    className={`p-2 text-sm border rounded-lg transition-colors ${
                      config.grid.rows === template.rows && config.grid.cols === template.cols
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Grid Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lignes
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={config.grid.rows}
                  onChange={(e) => handleGridChange('rows', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colonnes
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={config.grid.cols}
                  onChange={(e) => handleGridChange('cols', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

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

            {/* Card Shape Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format des cartes
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateCardShape('square')}
                  className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                    config.grid.cardShape === 'square'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Square size={24} />
                  <span className="text-sm font-medium">Carré</span>
                  <span className="text-xs text-gray-500">1:1</span>
                </button>
                <button
                  onClick={() => updateCardShape('vertical-rectangle')}
                  className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                    config.grid.cardShape === 'vertical-rectangle'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <RectangleHorizontal size={24} />
                  <span className="text-sm font-medium">Rectangle</span>
                  <span className="text-xs text-gray-500">3:2</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Le format rectangle vertical offre plus d'espace pour le contenu
              </p>
            </div>
          </div>
        )}

        {/* Couverture Section */}
        {activeSection === 'cover' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Couverture des cartes</h3>
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="coverType"
                    checked={config.globalCover?.type === 'color'}
                    onChange={() => handleCoverChange({ type: 'color', value: '#D9B7A4', opacity: 1 })}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Couleur unie</span>
                </label>
                {config.globalCover?.type === 'color' && (
                  <div className="ml-6 space-y-2">
                    <input
                      type="color"
                      value={config.globalCover?.type === 'color' ? config.globalCover.value : '#D9B7A4'}
                      onChange={(e) => handleCoverChange({ 
                        type: 'color', 
                        value: e.target.value, 
                        opacity: config.globalCover?.type === 'color' ? config.globalCover.opacity || 1 : 1
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Opacité: {Math.round((config.globalCover?.type === 'color' ? config.globalCover.opacity || 1 : 1) * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.globalCover?.type === 'color' ? config.globalCover.opacity || 1 : 1}
                        onChange={(e) => handleCoverChange({ 
                          type: 'color',
                          value: config.globalCover?.type === 'color' ? config.globalCover.value : '#D9B7A4',
                          opacity: parseFloat(e.target.value) 
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="coverType"
                    checked={config.globalCover?.type === 'image'}
                    onChange={() => handleCoverChange({ type: 'image', url: '' })}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Image</span>
                </label>
                {config.globalCover?.type === 'image' && (
                  <div className="ml-6">
                    <input
                      type="url"
                      placeholder="URL de l'image..."
                      value={config.globalCover.url || ''}
                      onChange={(e) => handleCoverChange({ type: 'image', url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Révélation Section */}
        {activeSection === 'reveal' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Contenu révélé</h3>
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="revealType"
                    checked={config.globalReveal?.type === 'text'}
                    onChange={() => handleRevealChange({ 
                      type: 'text', 
                      value: 'Grattez ici !',
                      style: { fontSize: 16, fontWeight: 600, color: '#333333', align: 'center' }
                    })}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Texte</span>
                </label>
                {config.globalReveal?.type === 'text' && (
                  <div className="ml-6 space-y-3">
                    <input
                      type="text"
                      placeholder="Texte à révéler..."
                      value={config.globalReveal?.type === 'text' ? config.globalReveal.value : ''}
                      onChange={(e) => handleRevealChange({ 
                        type: 'text',
                        value: e.target.value,
                        style: config.globalReveal?.type === 'text' ? config.globalReveal.style : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Taille</label>
                        <input
                          type="number"
                          min="8"
                          max="48"
                          value={config.globalReveal?.type === 'text' ? config.globalReveal.style?.fontSize || 16 : 16}
                          onChange={(e) => handleRevealChange({ 
                            type: 'text',
                            value: config.globalReveal?.type === 'text' ? config.globalReveal.value : '',
                            style: { 
                              ...(config.globalReveal?.type === 'text' ? config.globalReveal.style : {}), 
                              fontSize: parseInt(e.target.value) 
                            } 
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Couleur</label>
                        <input
                          type="color"
                          value={config.globalReveal?.type === 'text' ? config.globalReveal.style?.color || '#333333' : '#333333'}
                          onChange={(e) => handleRevealChange({ 
                            type: 'text',
                            value: config.globalReveal?.type === 'text' ? config.globalReveal.value : '',
                            style: { 
                              ...(config.globalReveal?.type === 'text' ? config.globalReveal.style : {}), 
                              color: e.target.value 
                            } 
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="revealType"
                    checked={config.globalReveal?.type === 'image'}
                    onChange={() => handleRevealChange({ type: 'image', url: '' })}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Image</span>
                </label>
                {config.globalReveal?.type === 'image' && (
                  <div className="ml-6">
                    <input
                      type="url"
                      placeholder="URL de l'image..."
                      value={config.globalReveal.url || ''}
                      onChange={(e) => handleRevealChange({ type: 'image', url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
              <div className="flex gap-2">
                <button
                  onClick={addCard}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Plus size={14} />
                  Ajouter
                </button>
                <button
                  onClick={resetAllCards}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logique Section */}
        {activeSection === 'logic' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Logique de gain</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                <select
                  value={config.logic.mode}
                  onChange={(e) => updateLogic({ mode: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fixed">Gagnants fixes</option>
                  <option value="probability">Probabilité</option>
                  <option value="weighted">Pondéré</option>
                </select>
              </div>

              {config.logic.mode === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de gagnants
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={config.cards.length}
                    value={config.logic.winnersCount || 1}
                    onChange={(e) => updateLogic({ winnersCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {config.logic.mode === 'probability' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probabilité de gain: {Math.round((config.logic.probability || 0.5) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.logic.probability || 0.5}
                    onChange={(e) => updateLogic({ probability: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="multipleWins"
                  checked={config.logic.allowMultipleWins || false}
                  onChange={(e) => updateLogic({ allowMultipleWins: e.target.checked })}
                  className="text-blue-600"
                />
                <label htmlFor="multipleWins" className="text-sm text-gray-700">
                  Autoriser plusieurs gains
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seed (déterminisme)
                </label>
                <input
                  type="text"
                  placeholder="Optionnel..."
                  value={config.logic.seed || ''}
                  onChange={(e) => updateLogic({ seed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Exporter
          </button>
          <button
            onClick={resetToDefault}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={16} />
            Défaut
          </button>
        </div>
        
        <div className="space-y-2">
          <textarea
            placeholder="Coller la configuration JSON ici..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <FileUp size={16} />
            Importer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScratchCardPanel;
