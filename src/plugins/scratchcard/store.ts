import { ScratchCard, ScratchCardState, ScratchCardSettings } from './types';

// Default settings for the scratch card game
export const DEFAULT_SETTINGS: ScratchCardSettings = {
  grid: { 
    rows: 2, 
    cols: 2, 
    gap: 16, 
    radius: 12, 
    borderRadius: 12 
  },
  brush: { 
    radius: 20 
  },
  threshold: 0.65,
  effects: { 
    confetti: true 
  }
};

// Create default cards
export const createDefaultCards = (): ScratchCard[] => [
  {
    id: 'sc-card-1',
    title: 'Carte 1',
    reveal: { type: 'text', value: '🎉 Surprise 1' },
    isWinner: false
  },
  {
    id: 'sc-card-2',
    title: 'Carte 2', 
    reveal: { type: 'text', value: '💎 Bonus 2' },
    isWinner: true
  },
  {
    id: 'sc-card-3',
    title: 'Carte 3',
    reveal: { type: 'text', value: '🏆 Prix 3' },
    isWinner: false
  },
  {
    id: 'sc-card-4',
    title: 'Carte 4',
    reveal: { type: 'text', value: '🎁 Cadeau 4' },
    isWinner: false
  }
];

// Create default state
export const createDefaultState = (): ScratchCardState => ({
  cards: createDefaultCards(),
  settings: DEFAULT_SETTINGS
});

// Helper functions for state management
export const scratchCardStateHelpers = {
  // Add a new card
  addCard: (state: ScratchCardState, card?: Partial<ScratchCard>): ScratchCardState => {
    const newCard: ScratchCard = {
      id: `sc-card-${Date.now()}`,
      title: `Carte ${state.cards.length + 1}`,
      reveal: { type: 'text', value: 'Nouveau contenu' },
      isWinner: false,
      ...card
    };
    
    return {
      ...state,
      cards: [...state.cards, newCard]
    };
  },

  // Remove a card
  removeCard: (state: ScratchCardState, cardId: string): ScratchCardState => {
    return {
      ...state,
      cards: state.cards.filter(card => card.id !== cardId)
    };
  },

  // Update a specific card
  updateCard: (state: ScratchCardState, cardId: string, updates: Partial<ScratchCard>): ScratchCardState => {
    return {
      ...state,
      cards: state.cards.map(card => 
        card.id === cardId 
          ? { ...card, ...updates }
          : card
      )
    };
  },

  // Update settings
  updateSettings: (state: ScratchCardState, settings: Partial<ScratchCardSettings>): ScratchCardState => {
    return {
      ...state,
      settings: { ...state.settings, ...settings }
    };
  },

  // Reset all cards progress
  resetCards: (state: ScratchCardState): ScratchCardState => {
    return {
      ...state,
      cards: state.cards.map(card => ({
        ...card,
        progress: 0,
        revealed: false
      }))
    };
  },

  // Get final cover for a card (priorité carte > global)
  getCardCover: (card: ScratchCard, globalCover?: ScratchCardSettings['globalCover']) => {
    return card.cover || globalCover || { type: 'color', value: '#C0C0C0' };
  },

  // Get final reveal for a card (priorité carte > global)
  getCardReveal: (card: ScratchCard, globalReveal?: ScratchCardSettings['globalReveal']) => {
    return card.reveal || globalReveal || { type: 'text', value: 'Carte révélée' };
  }
};