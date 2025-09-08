// Étape 2 & 3 — Messaging parent ⇄ iframe et handlers côté éditeur
import type { ScratchCard, ScratchCardMessage } from '../types/ScratchCard';

export class ScratchCardMessaging {
  private iframe: HTMLIFrameElement | null = null;
  private previewOrigin: string = '*';

  constructor(iframe: HTMLIFrameElement | null, previewOrigin: string = '*') {
    this.iframe = iframe;
    this.previewOrigin = previewOrigin;
  }

  // Étape 3 — Handlers côté éditeur (parent)
  onColorChange(cardId: string, color: string) {
    // 1) maj du store (immutabilité) - à implémenter dans le composant parent
    
    // 2) notifier le canvas
    this.iframe?.contentWindow?.postMessage(
      { t: 'SET_CARD_COLOR', cardId, color } as ScratchCardMessage,
      this.previewOrigin
    );
  }

  // Déjà en place pour l'image : on garde l'uploader et on envoie les octets
  async onCoverSelected(cardId: string, file: File) {
    const ab = await file.arrayBuffer();
    this.iframe?.contentWindow?.postMessage(
      { t: 'SET_CARD_COVER', cardId, mime: file.type, ab } as ScratchCardMessage,
      this.previewOrigin,
      [ab]
    );
    // Optionnel : thumbnail pour le panneau
    // updateCard(cardId, { thumbDataUrl: await toDataURL(file, 256) });
  }

  // Au montage / changement de mode : re-synchroniser
  syncStateToCanvas(cards: ScratchCard[]) {
    this.iframe?.contentWindow?.postMessage(
      {
        t: 'SYNC_STATE',
        cards: cards.map(c => ({ id: c.id, color: c.color, hasCover: !!c.cover }))
      } as ScratchCardMessage,
      this.previewOrigin
    );
  }

  // Utilitaire pour créer une data URL pour thumbnail
  async toDataURL(file: File, maxSize: number = 256): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}
