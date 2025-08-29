import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface TextEffect {
  id: string;
  name: string;
  category: 'basic' | 'shadow' | 'outline' | 'gradient' | '3d' | 'neon' | 'metallic' | 'glass' | 'vintage' | 'gaming' | 'luxury' | 'distortion' | 'material';
  preview: string;
  css: Record<string, any>;
  controls?: {
    intensity?: { min: number; max: number; default: number };
    color?: { default: string };
    direction?: { min: number; max: number; default: number };
    blur?: { min: number; max: number; default: number };
    opacity?: { min: number; max: number; default: number };
    spread?: { min: number; max: number; default: number };
    angle?: { min: number; max: number; default: number };
    metalness?: { min: number; max: number; default: number };
    roughness?: { min: number; max: number; default: number };
  };
  blendMode?: string;
  stackable?: boolean;
}

export interface EffectState {
  intensity: number;
  color: string;
  direction: number;
  blur: number;
  opacity: number;
  spread: number;
  angle: number;
  metalness: number;
  roughness: number;
}

interface TextEffectsStore {
  // State
  selectedEffect: string | null;
  effectStates: Record<string, EffectState>;
  appliedEffects: string[];
  favorites: string[];
  recentEffects: string[];
  searchQuery: string;
  selectedCategory: string;
  previewText: string;
  
  // Actions
  setSelectedEffect: (effectId: string | null) => void;
  updateEffectState: (effectId: string, updates: Partial<EffectState>) => void;
  addAppliedEffect: (effectId: string) => void;
  removeAppliedEffect: (effectId: string) => void;
  toggleFavorite: (effectId: string) => void;
  addToRecent: (effectId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setPreviewText: (text: string) => void;
  resetEffects: () => void;
  
  // Computed
  getEffectState: (effectId: string) => EffectState;
  getCompiledCSS: (effect: TextEffect, state?: EffectState) => Record<string, any>;
}

const defaultEffectState: EffectState = {
  intensity: 50,
  color: '#000000',
  direction: 45,
  blur: 0,
  opacity: 100,
  spread: 50,
  angle: 45,
  metalness: 50,
  roughness: 30,
};

export const useTextEffectsStore = create<TextEffectsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    selectedEffect: null,
    effectStates: {},
    appliedEffects: [],
    favorites: [],
    recentEffects: [],
    searchQuery: '',
    selectedCategory: 'all',
    previewText: 'Texte d\'exemple',

    // Actions
    setSelectedEffect: (effectId) => 
      set({ selectedEffect: effectId }),

    updateEffectState: (effectId, updates) =>
      set((state) => ({
        effectStates: {
          ...state.effectStates,
          [effectId]: {
            ...get().getEffectState(effectId),
            ...updates,
          },
        },
      })),

    addAppliedEffect: (effectId) =>
      set((state) => ({
        appliedEffects: state.appliedEffects.includes(effectId)
          ? state.appliedEffects
          : [...state.appliedEffects, effectId],
      })),

    removeAppliedEffect: (effectId) =>
      set((state) => ({
        appliedEffects: state.appliedEffects.filter(id => id !== effectId),
      })),

    toggleFavorite: (effectId) =>
      set((state) => ({
        favorites: state.favorites.includes(effectId)
          ? state.favorites.filter(id => id !== effectId)
          : [...state.favorites, effectId],
      })),

    addToRecent: (effectId) =>
      set((state) => ({
        recentEffects: [
          effectId,
          ...state.recentEffects.filter(id => id !== effectId),
        ].slice(0, 10),
      })),

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setPreviewText: (text) => set({ previewText: text }),
    resetEffects: () => set({ appliedEffects: [], selectedEffect: null }),

    // Computed
    getEffectState: (effectId) =>
      get().effectStates[effectId] || defaultEffectState,

    getCompiledCSS: (effect, state) => {
      const effectState = state || get().getEffectState(effect.id);
      const { css } = effect;
      
      // Compile dynamic CSS based on controls and state
      const compiledCSS = { ...css };
      
      Object.keys(compiledCSS).forEach(property => {
        let value = compiledCSS[property];
        
        // Replace dynamic placeholders
        if (typeof value === 'string') {
          value = value
            .replace(/\$intensity/g, effectState.intensity.toString())
            .replace(/\$color/g, effectState.color)
            .replace(/\$direction/g, effectState.direction.toString())
            .replace(/\$blur/g, effectState.blur.toString())
            .replace(/\$opacity/g, (effectState.opacity / 100).toString())
            .replace(/\$spread/g, effectState.spread.toString())
            .replace(/\$angle/g, effectState.angle.toString())
            .replace(/\$metalness/g, (effectState.metalness / 100).toString())
            .replace(/\$roughness/g, (effectState.roughness / 100).toString());
        }
        
        compiledCSS[property] = value;
      });
      
      return compiledCSS;
    },
  }))
);