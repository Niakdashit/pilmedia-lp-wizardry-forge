import { useCallback, useMemo } from 'react';
import { useTextEffectsStore } from '../stores/useTextEffectsStore';
import { modernTextEffects, effectCategories } from '../config/modernTextEffects';
import type { TextEffect } from '../stores/useTextEffectsStore';

export const useTextEffects = () => {
  const {
    selectedEffect,
    effectStates,
    appliedEffects,
    favorites,
    recentEffects,
    searchQuery,
    selectedCategory,
    previewText,
    setSelectedEffect,
    updateEffectState,
    addAppliedEffect,
    removeAppliedEffect,
    toggleFavorite,
    addToRecent,
    setSearchQuery,
    setSelectedCategory,
    setPreviewText,
    resetEffects,
    getEffectState,
    getCompiledCSS,
  } = useTextEffectsStore();

  // Filtered effects based on search and category
  const filteredEffects = useMemo(() => {
    let effects = modernTextEffects;

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      effects = effects.filter(effect => effect.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      effects = effects.filter(effect =>
        effect.name.toLowerCase().includes(query) ||
        effect.category.toLowerCase().includes(query)
      );
    }

    return effects;
  }, [selectedCategory, searchQuery]);

  // Get effect by ID
  const getEffect = useCallback((effectId: string): TextEffect | undefined => {
    return modernTextEffects.find(effect => effect.id === effectId);
  }, []);

  // Apply effect to element
  const applyEffectToElement = useCallback((effectId: string, elementId?: string, onElementUpdate?: (updates: any) => void) => {
    const effect = getEffect(effectId);
    if (!effect) return;

    const effectState = getEffectState(effectId);
    const compiledCSS = getCompiledCSS(effect, effectState);

    // Add to recent effects
    addToRecent(effectId);

    // Update element if callback provided
    if (onElementUpdate) {
      onElementUpdate({
        customCSS: compiledCSS,
        advancedStyle: {
          id: effect.id,
          name: effect.name,
          category: effect.category,
          css: compiledCSS,
        },
      });
    } else {
      // Fallback to global event system
      const updateEvent = new CustomEvent('applyTextEffect', {
        detail: {
          customCSS: compiledCSS,
          advancedStyle: {
            id: effect.id,
            name: effect.name,
            category: effect.category,
            css: compiledCSS,
          },
        },
      });
      window.dispatchEvent(updateEvent);
    }
  }, [getEffect, getEffectState, getCompiledCSS, addToRecent]);

  // Combine multiple effects
  const combineEffects = useCallback((effectIds: string[]) => {
    const combinedCSS: Record<string, any> = {};
    const combinedFilters: string[] = [];
    const combinedTransforms: string[] = [];
    const combinedTextShadows: string[] = [];

    effectIds.forEach(effectId => {
      const effect = getEffect(effectId);
      if (!effect) return;

      const effectState = getEffectState(effectId);
      const css = getCompiledCSS(effect, effectState);

      Object.entries(css).forEach(([property, value]) => {
        if (property === 'filter' && typeof value === 'string') {
          combinedFilters.push(value);
        } else if (property === 'transform' && typeof value === 'string') {
          combinedTransforms.push(value);
        } else if (property === 'textShadow' && typeof value === 'string') {
          combinedTextShadows.push(value);
        } else {
          combinedCSS[property] = value;
        }
      });
    });

    // Combine special properties
    if (combinedFilters.length > 0) {
      combinedCSS.filter = combinedFilters.join(' ');
    }
    if (combinedTransforms.length > 0) {
      combinedCSS.transform = combinedTransforms.join(' ');
    }
    if (combinedTextShadows.length > 0) {
      combinedCSS.textShadow = combinedTextShadows.join(', ');
    }

    return combinedCSS;
  }, [getEffect, getEffectState, getCompiledCSS]);

  // Preview effect
  const previewEffect = useCallback((effectId: string) => {
    const effect = getEffect(effectId);
    if (!effect) return {};

    const effectState = getEffectState(effectId);
    return getCompiledCSS(effect, effectState);
  }, [getEffect, getEffectState, getCompiledCSS]);

  // Get effects by category
  const getEffectsByCategory = useCallback((category: string) => {
    return modernTextEffects.filter(effect => effect.category === category);
  }, []);

  // Search effects
  const searchEffects = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  return {
    // State
    selectedEffect,
    effectStates,
    appliedEffects,
    favorites,
    recentEffects,
    searchQuery,
    selectedCategory,
    previewText,

    // Data
    effects: modernTextEffects,
    filteredEffects,
    categories: effectCategories,

    // Actions
    setSelectedEffect,
    updateEffectState,
    addAppliedEffect,
    removeAppliedEffect,
    toggleFavorite,
    addToRecent,
    setSearchQuery: searchEffects,
    setSelectedCategory,
    setPreviewText,
    resetEffects,

    // Utilities
    getEffect,
    getEffectState,
    getCompiledCSS,
    applyEffectToElement,
    combineEffects,
    previewEffect,
    getEffectsByCategory,

    // Computed
    hasAppliedEffects: appliedEffects.length > 0,
    hasFavorites: favorites.length > 0,
    hasRecentEffects: recentEffects.length > 0,
  };
};