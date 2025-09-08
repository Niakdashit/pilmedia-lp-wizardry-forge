// Étape 1 — Modèle de données (store côté éditeur)
export type ScratchCard = {
  id: string;
  color?: string; // ex: "#841b60"
  cover?: { 
    kind: 'blob' | 'data'; 
    mime: string; 
    value: string; 
  }; // optionnel
  thumbDataUrl?: string; // pour la vignette du panneau
  revealMessage?: string;
  revealImage?: string;
  scratchSurface?: string; // surface de grattage personnalisée
  scratchColor?: string; // couleur de la surface de grattage
};

// Messages pour communication parent ⇄ iframe
export type ScratchCardMessage = 
  | { t: 'SET_CARD_COLOR'; cardId: string; color: string }
  | { t: 'SET_CARD_COVER'; cardId: string; mime: string; ab: ArrayBuffer }
  | { t: 'SYNC_STATE'; cards: Array<{ id: string; color?: string; hasCover: boolean }> }
  | { t: 'CARD_COVER_APPLIED'; cardId: string };

export interface ScratchCardVisualState {
  coverUrl?: string;
  color?: string;
}
