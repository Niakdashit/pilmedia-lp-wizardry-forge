import React, { useState, memo } from 'react';
import { ArrowLeft, Heart, History, Layers, Eye } from 'lucide-react';
import { useTextEffects } from '../../../../hooks/useTextEffects';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import EffectsGrid from './EffectsGrid';
import EffectControls from './EffectControls';

interface ModernTextEffectsPanelProps {
  onBack: () => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

const ModernTextEffectsPanel: React.FC<ModernTextEffectsPanelProps> = memo(({
  onBack,
  selectedElement,
  onElementUpdate
}) => {
  const [showControls, setShowControls] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const {
    selectedEffect,
    filteredEffects,
    categories,
    favorites,
    recentEffects,
    searchQuery,
    selectedCategory,
    previewText,
    setSelectedEffect,
    updateEffectState,
    toggleFavorite,
    setSearchQuery,
    setSelectedCategory,
    setPreviewText,
    getEffect,
    getEffectState,
    getCompiledCSS,
    applyEffectToElement,
    resetEffects,
  } = useTextEffects();

  const handleSelectEffect = (effectId: string) => {
    setSelectedEffect(effectId);
    setShowControls(true);
    
    // Apply effect immediately
    applyEffectToElement(effectId, selectedElement?.id, onElementUpdate);
  };

  const handleUpdateState = (updates: any) => {
    if (!selectedEffect) return;
    
    updateEffectState(selectedEffect, updates);
    
    // Re-apply effect with new state
    applyEffectToElement(selectedEffect, selectedElement?.id, onElementUpdate);
  };

  const currentEffect = selectedEffect ? getEffect(selectedEffect) : null;
  const currentEffectState = selectedEffect ? getEffectState(selectedEffect) : null;

  // Show favorites view
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  const displayEffects = showFavorites 
    ? filteredEffects.filter(effect => favorites.includes(effect.id))
    : showRecent
    ? filteredEffects.filter(effect => recentEffects.includes(effect.id))
    : filteredEffects;

  return (
    <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <h3 className="text-sm font-semibold text-gray-800">
          Effets de texte
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-1.5 rounded ${previewMode ? 'bg-[hsl(var(--primary))] text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-1.5 rounded ${showControls ? 'bg-[hsl(var(--primary))] text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && currentEffect && currentEffectState && (
        <div className="border-b border-gray-200 flex-shrink-0">
          <EffectControls
            effect={currentEffect}
            effectState={currentEffectState}
            onUpdateState={handleUpdateState}
          />
        </div>
      )}

      {/* Preview Text Editor */}
      {previewMode && (
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Texte de prévisualisation..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-3 border-b border-gray-200 space-y-3 flex-shrink-0">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un effet..."
        />
        
        {/* Quick filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowFavorites(!showFavorites);
              setShowRecent(false);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              showFavorites ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Heart className="w-3 h-3" />
            Favoris ({favorites.length})
          </button>
          <button
            onClick={() => {
              setShowRecent(!showRecent);
              setShowFavorites(false);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              showRecent ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <History className="w-3 h-3" />
            Récents ({recentEffects.length})
          </button>
          <button
            onClick={resetEffects}
            className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Réinitialiser
          </button>
        </div>

        {/* Category Filter */}
        {!showFavorites && !showRecent && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}
      </div>

      {/* Effects Grid */}
      <div className="flex-1 overflow-y-auto">
        <EffectsGrid
          effects={displayEffects}
          selectedEffect={selectedEffect}
          favorites={favorites}
          getEffectState={getEffectState}
          getCompiledCSS={getCompiledCSS}
          onSelectEffect={handleSelectEffect}
          onToggleFavorite={toggleFavorite}
          previewText={previewText}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex-shrink-0">
        {displayEffects.length} effet{displayEffects.length > 1 ? 's' : ''} disponible{displayEffects.length > 1 ? 's' : ''}
        {selectedEffect && (
          <span className="ml-2">
            • <span className="font-medium">{currentEffect?.name}</span> sélectionné
          </span>
        )}
      </div>
    </div>
  );
});

ModernTextEffectsPanel.displayName = 'ModernTextEffectsPanel';

export default ModernTextEffectsPanel;