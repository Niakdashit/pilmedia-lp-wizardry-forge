// ScratchCard Game Plugin Types

export type ScratchCardCover =
  | { type: 'image'; url: string; alt?: string }
  | { type: 'color'; value: string }; // hex/rgb

export type ScratchCardReveal =
  | { type: 'image'; url: string; alt?: string }
  | { type: 'text'; value: string; style?: { fontSize?: number; fontWeight?: number; align?: 'left'|'center'|'right' } };

export type ScratchCard = {
  id: string;
  title?: string;
  cover?: ScratchCardCover;     // priorité carte > global
  reveal?: ScratchCardReveal;   // priorité carte > global
  isWinner?: boolean;
  progress?: number;            // 0..1 (lecture seule)
  revealed?: boolean;           // (lecture seule)
};

export type ScratchCardSettings = {
  grid: { rows: number; cols: number; gap: number; radius: number; borderRadius: number };
  brush: { radius: number };
  threshold: number;  // 0..1
  globalCover?: ScratchCardCover;
  globalReveal?: ScratchCardReveal;
  effects?: { confetti: boolean };
};

export type ScratchCardState = {
  cards: ScratchCard[];
  settings: ScratchCardSettings;
};

export type ScratchCardMode = 'edit' | 'preview';

export interface ScratchCardCanvasProps {
  mode: ScratchCardMode;
  state: ScratchCardState;
  onStateChange?: (state: ScratchCardState) => void;
  onCardProgress?: (cardId: string, progress: number) => void;
  onCardRevealed?: (cardId: string) => void;
  onReset?: () => void;
  width?: number;
  height?: number;
  device?: 'desktop' | 'tablet' | 'mobile';
}

// Events emitted by the plugin
export type ScratchCardEvent =
  | { type: 'scratchcard:progress'; cardId: string; progress: number }
  | { type: 'scratchcard:revealed'; cardId: string }
  | { type: 'scratchcard:reset' }
  | { type: 'scratchcard:configChanged'; state: ScratchCardState };