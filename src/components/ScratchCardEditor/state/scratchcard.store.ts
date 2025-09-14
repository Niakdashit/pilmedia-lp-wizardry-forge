import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ScratchCardState, DEFAULT_SCRATCH_CONFIG, ScratchCard, CardShape } from './types';

interface ScratchCardStore {
  // État principal
  config: ScratchCardState;
  
  // Actions de configuration
  updateGrid: (grid: Partial<ScratchCardState['grid']>) => void;
  updateCardShape: (cardShape: CardShape) => void;
  updateBrush: (brush: Partial<ScratchCardState['brush']>) => void;
  updateThreshold: (threshold: number) => void;
  updateGlobalCover: (cover: ScratchCardState['globalCover']) => void;
  updateGlobalReveal: (reveal: ScratchCardState['globalReveal']) => void;
  updateLogic: (logic: Partial<ScratchCardState['logic']>) => void;
  updateEffects: (effects: Partial<ScratchCardState['effects']>) => void;
  updateMaxCards: (max: 3 | 4 | 6) => void;
  
  // Actions sur les cartes
  addCard: () => void;
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<ScratchCard>) => void;
  updateCardProgress: (cardId: string, progress: number) => void;
  revealCard: (cardId: string) => void;
  resetAllCards: () => void;
  
  // Utilitaires
  getCard: (cardId: string) => ScratchCard | undefined;
  getWinnerCards: () => ScratchCard[];
  getTotalCards: () => number;
  getRevealedCards: () => ScratchCard[];
  
  // Import/Export
  exportConfig: () => string;
  importConfig: (jsonConfig: string) => boolean;
  resetToDefault: () => void;
}

export const useScratchCardStore = create<ScratchCardStore>()(
  subscribeWithSelector((set, get) => ({
    config: DEFAULT_SCRATCH_CONFIG,
    
    // Actions de configuration
    updateCardShape: (cardShape: CardShape) => set((state) => ({
      config: {
        ...state.config,
        grid: { ...state.config.grid, cardShape }
      }
    })),
    
    updateGrid: (grid) => set((state) => ({
      config: {
        ...state.config,
        grid: { ...state.config.grid, ...grid }
      }
    })),
    
    updateBrush: (brush) => set((state) => ({
      config: {
        ...state.config,
        brush: { ...state.config.brush, ...brush }
      }
    })),
    
    updateThreshold: (threshold) => set((state) => {
      const clamped = Math.max(0, Math.min(1, threshold));
      // Recompute revealed flags immediately so UI reflects new threshold without requiring further scratching
      const updatedCards = state.config.cards.map(card => {
        const effectiveThreshold = card.threshold ?? clamped;
        const progress = card.progress ?? 0;
        return {
          ...card,
          revealed: progress >= effectiveThreshold
        };
      });
      return {
        config: {
          ...state.config,
          threshold: clamped,
          cards: updatedCards
        }
      };
    }),
    
    updateGlobalCover: (cover) => set((state) => ({
      config: {
        ...state.config,
        globalCover: cover
      }
    })),
    
    updateGlobalReveal: (reveal) => set((state) => ({
      config: {
        ...state.config,
        globalReveal: reveal
      }
    })),

    updateMaxCards: (max) => set((state) => {
      const normalizedMax: 3 | 4 | 6 = max === 6 ? 6 : max === 3 ? 3 : 4;
      let cards = state.config.cards.slice(0, normalizedMax);
      // If increasing cap, auto-pad with new empty cards up to max
      while (cards.length < normalizedMax) {
        const newId = (cards.length + 1).toString();
        cards = [
          ...cards,
          { id: newId, isWinner: false, progress: 0, revealed: false } as ScratchCard
        ];
      }
      // Normalize grid layout for a nice default based on cap
      const normalizedGrid = {
        ...state.config.grid,
        rows: normalizedMax === 6 ? 2 : normalizedMax === 4 ? 2 : 1,
        cols: normalizedMax === 6 ? 3 : normalizedMax === 4 ? 2 : 3
      };
      return {
        config: {
          ...state.config,
          maxCards: normalizedMax,
          cards,
          grid: normalizedGrid
        }
      };
    }),
    
    updateLogic: (logic) => set((state) => ({
      config: {
        ...state.config,
        logic: { ...state.config.logic, ...logic }
      }
    })),
    
    updateEffects: (effects) => set((state) => ({
      config: {
        ...state.config,
        effects: { ...state.config.effects, ...effects }
      }
    })),
    
    // Actions sur les cartes
    addCard: () => set((state) => {
      if (state.config.cards.length >= state.config.maxCards) {
        return { config: { ...state.config } };
      }
      const newId = (state.config.cards.length + 1).toString();
      const newCard: ScratchCard = {
        id: newId,
        isWinner: false,
        progress: 0,
        revealed: false
      };
      
      return {
        config: {
          ...state.config,
          cards: [...state.config.cards, newCard]
        }
      };
    }),
    
    removeCard: (cardId) => set((state) => ({
      config: {
        ...state.config,
        cards: state.config.cards.filter(card => card.id !== cardId)
      }
    })),
    
    updateCard: (cardId, updates) => set((state) => ({
      config: {
        ...state.config,
        cards: state.config.cards.map(card =>
          card.id === cardId ? { ...card, ...updates } : card
        )
      }
    })),
    
    updateCardProgress: (cardId, progress) => set((state) => {
      const threshold = state.config.threshold;
      const card = state.config.cards.find(c => c.id === cardId);
      const cardThreshold = card?.threshold ?? threshold;
      
      console.log(`🔄 Store updateCardProgress: ${cardId}, progress=${(progress * 100).toFixed(1)}%, threshold=${(cardThreshold * 100).toFixed(1)}%`);
      
      const shouldReveal = progress >= cardThreshold && !card?.revealed;
      
      if (shouldReveal) {
        console.log(`🎉 Store: Revealing card ${cardId} - progress ${(progress * 100).toFixed(1)}% >= threshold ${(cardThreshold * 100).toFixed(1)}%`);
      }
      
      return {
        config: {
          ...state.config,
          cards: state.config.cards.map(card =>
            card.id === cardId 
              ? { 
                  ...card, 
                  progress,
                  revealed: shouldReveal ? true : card.revealed
                } 
              : card
          )
        }
      };
    }),
    
    revealCard: (cardId) => set((state) => ({
      config: {
        ...state.config,
        cards: state.config.cards.map(card =>
          card.id === cardId 
            ? { ...card, revealed: true, progress: 1 }
            : card
        )
      }
    })),
    
    resetAllCards: () => set((state) => ({
      config: {
        ...state.config,
        cards: state.config.cards.map(card => ({
          ...card,
          progress: 0,
          revealed: false
        }))
      }
    })),
    
    // Utilitaires
    getCard: (cardId) => {
      const state = get();
      return state.config.cards.find(card => card.id === cardId);
    },
    
    getWinnerCards: () => {
      const state = get();
      return state.config.cards.filter(card => card.isWinner);
    },
    
    getTotalCards: () => {
      const state = get();
      return state.config.cards.length;
    },
    
    getRevealedCards: () => {
      const state = get();
      return state.config.cards.filter(card => card.revealed);
    },
    
    // Import/Export
    exportConfig: () => {
      const state = get();
      return JSON.stringify(state.config, null, 2);
    },
    
    importConfig: (jsonConfig) => {
      try {
        const config = JSON.parse(jsonConfig) as ScratchCardState;
        
        // Validation basique
        if (!config.cards || !Array.isArray(config.cards)) {
          return false;
        }
        
        set({ config });
        return true;
      } catch (error) {
        console.error('Erreur lors de l\'import de la configuration:', error);
        return false;
      }
    },
    
    resetToDefault: () => set({ config: DEFAULT_SCRATCH_CONFIG })
  }))
);

// Sélecteurs utiles
export const selectGrid = (state: ScratchCardStore) => state.config.grid;
export const selectBrush = (state: ScratchCardStore) => state.config.brush;
export const selectCards = (state: ScratchCardStore) => state.config.cards;
export const selectThreshold = (state: ScratchCardStore) => state.config.threshold;
export const selectGlobalCover = (state: ScratchCardStore) => state.config.globalCover;
export const selectGlobalReveal = (state: ScratchCardStore) => state.config.globalReveal;
