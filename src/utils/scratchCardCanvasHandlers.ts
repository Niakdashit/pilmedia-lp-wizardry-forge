// Étape 4 — Runtime côté canvas (iframe)
import type { ScratchCardMessage, ScratchCardVisualState } from '../types/ScratchCard';

export class ScratchCardCanvasHandlers {
  private coverUrls = new Map<string, string>(); // cardId -> objectURL

  constructor() {
    this.setupMessageListener();
    this.setupCleanup();
  }

  private stripBgUtilityClasses(el: HTMLElement) {
    // Si tu utilises Tailwind/utility CSS, on retire les bg-* qui écrasent la couleur
    [...el.classList].forEach(c => {
      if (c === 'bg-transparent') return;
      if (c.startsWith('bg-')) el.classList.remove(c);
    });
  }

  private applyImage(el: HTMLElement, url: string) {
    // On enlève toute valeur 'background' globale (ex: gradients de placeholder)
    el.style.removeProperty('background');
    el.style.removeProperty('background-color');

    // Image prioritaire avec !important
    el.style.setProperty('background-image', `url("${url}")`, 'important');
    el.style.setProperty('background-size', 'cover', 'important');
    el.style.setProperty('background-position', 'center', 'important');
    el.setAttribute('data-has-cover', 'true');
  }

  private applyColor(el: HTMLElement, color: string) {
    // On neutralise d'abord tout gradient/placeholder qui serait défini via 'background'
    el.style.removeProperty('background-image');
    el.style.setProperty('background', color, 'important'); // reset complet + couleur prioritaire
    el.style.setProperty('background-color', color, 'important'); // ceinture+bretelles
    el.setAttribute('data-has-cover', 'false');
  }

  private applyVisual(cardId: string, opts: ScratchCardVisualState) {
    const el = document.querySelector(`[data-card-id="${cardId}"] .card-cover`) as HTMLElement | null;
    if (!el) return;

    this.stripBgUtilityClasses(el); // évite qu'un bg-* parasite le rendu

    if (opts.coverUrl) {
      this.applyImage(el, opts.coverUrl);
      return;
    }
    // Pas d'image -> couleur (ou fallback)
    const color = opts.color || '#cfcfcf';
    // Important: si une ancienne image était posée, on la révoque et on nettoie
    if (this.coverUrls.get(cardId)) {
      el.style.removeProperty('background-image');
    }
    this.applyColor(el, color);
  }

  private revokeCover(cardId: string) {
    const prev = this.coverUrls.get(cardId);
    if (prev) {
      URL.revokeObjectURL(prev);
      this.coverUrls.delete(cardId);
    }
  }

  private setupMessageListener() {
    window.addEventListener('message', (e) => {
      const m = e.data as ScratchCardMessage;

      if (m?.t === 'SET_CARD_COLOR') {
        this.applyVisual(m.cardId, { color: m.color });
      }

      if (m?.t === 'SET_CARD_COVER') {
        // créer le blob DANS l'iframe
        this.revokeCover(m.cardId);
        const url = URL.createObjectURL(new Blob([m.ab], { type: m.mime }));
        this.coverUrls.set(m.cardId, url);
        this.applyVisual(m.cardId, { coverUrl: url });
        (e.source as Window)?.postMessage({ t: 'CARD_COVER_APPLIED', cardId: m.cardId }, '*');
      }

      if (m?.t === 'SYNC_STATE') {
        // Réappliquer couleur aux cartes sans image
        m.cards.forEach((c: any) => {
          if (!c.hasCover) this.applyVisual(c.id, { color: c.color });
        });
      }
    });
  }

  private setupCleanup() {
    // Nettoyage global
    window.addEventListener('beforeunload', () => {
      for (const url of this.coverUrls.values()) URL.revokeObjectURL(url);
      this.coverUrls.clear();
    });
  }

  // Méthode publique pour nettoyer manuellement
  cleanup() {
    for (const url of this.coverUrls.values()) URL.revokeObjectURL(url);
    this.coverUrls.clear();
  }
}
