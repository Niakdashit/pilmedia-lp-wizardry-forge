// Types pour le jeu de cartes à gratter
export type Cover = 
  | { type: 'image'; url: string; alt?: string }
  | { type: 'color'; value: string; opacity?: number };

export type Reveal = 
  | { type: 'image'; url: string; alt?: string }
  | { 
      type: 'text'; 
      value: string; 
      style?: { 
        fontSize?: number; 
        fontWeight?: number; 
        color?: string; 
        align?: 'left' | 'center' | 'right' 
      } 
    };

export type ScratchCard = {
  id: string;
  title?: string;
  cover?: Cover;          // override carte
  reveal?: Reveal;        // override carte
  isWinner?: boolean;     // si logique fixe
  threshold?: number;     // override (0..1)
  progress?: number;      // lecture seule
  revealed?: boolean;     // lecture seule
};

export type CardShape = 'vertical-rectangle';

export type GridSettings = { 
  rows: number; 
  cols: number; 
  gap: number; 
  borderRadius: number; 
  cardSize?: { width?: number; height?: number };
  cardShape?: CardShape; // New: shape of the cards
};

export type BrushSettings = { 
  radius: number; 
  softness?: number; 
  intensity?: number 
};

export type Prize = {
  id: string;
  name: string;
  quantity: number;
  attributionMethod: 'probability' | 'calendar';
  probability?: number;           // pour méthode probabilité
  calendarDate?: string;          // pour méthode calendrier
  calendarTime?: string;          // pour méthode calendrier
};

export type LogicSettings = {
  mode: 'fixed' | 'probability' | 'weighted';
  winnersCount?: number;          // fixed
  probability?: number;           // probability 0..1
  weights?: number[];             // weighted, par carte
  allowMultipleWins?: boolean;
  maxAttempts?: number;           // 0 = illimité
  seed?: string;                  // déterminisme
  winnerReveal?: Reveal;          // contenu révélé pour les cartes gagnantes
  loserReveal?: Reveal;           // contenu révélé pour les cartes perdantes
  prizes?: Prize[];               // lots à gagner
};

export type EffectsSettings = { 
  confetti: boolean; 
  sound?: { url?: string; volume?: number } 
};

export type ScratchCardState = {
  cards: ScratchCard[];
  grid: GridSettings;
  brush: BrushSettings;
  threshold: number;              // global 0..1
  globalCover?: Cover;
  globalReveal?: Reveal;
  // Limitation stricte du nombre de cartes rendues
  maxCards: 3 | 4 | 6;
  logic: LogicSettings;
  effects: EffectsSettings;
};

// Événements émis par le système
export type ScratchCardEvents = {
  'scratchcard:progress': { cardId: string; progress: number };
  'scratchcard:revealed': { cardId: string; isWinner: boolean };
  'scratchcard:reset': {};
  'scratchcard:configChanged': { state: ScratchCardState };
};

// Configuration par défaut
export const DEFAULT_SCRATCH_CONFIG: ScratchCardState = {
  cards: [
    { id: '1', isWinner: false },
    { id: '2', isWinner: true },
    { id: '3', isWinner: false },
    { id: '4', isWinner: false }
  ],
  grid: {
    rows: 2,
    cols: 2,
    gap: 20,
    borderRadius: 24,
    cardShape: 'vertical-rectangle' // Default to rectangle
  },
  brush: {
    radius: 25, // Increased from 10 to 25 - larger brush for easier scratching
    softness: 0.5,
    intensity: 1
  },
  threshold: 0.15, // Adjusted from 75% to 15% - much more reasonable for user experience
  maxCards: 4,
  globalCover: {
    type: 'color',
    value: '#D9B7A4',
    opacity: 1
  },
  globalReveal: {
    type: 'text',
    value: 'Grattez ici !',
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: '#333333',
      align: 'center'
    }
  },
  logic: {
    mode: 'fixed',
    winnersCount: 1,
    allowMultipleWins: false,
    maxAttempts: 0,
    winnerReveal: {
      type: 'text',
      value: 'Gagné !',
      style: {
        fontSize: 18,
        fontWeight: 700,
        color: '#22c55e',
        align: 'center'
      }
    },
    loserReveal: {
      type: 'text',
      value: 'Perdu',
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: '#ef4444',
        align: 'center'
      }
    }
  },
  effects: {
    confetti: true
  }
};
