import React, { useEffect, useMemo, useRef } from 'react';
import { getDeviceDimensions } from '@/utils/deviceDimensions';
import styles from './ScratchGrid.module.css';

type CardDef = {
  id: string;
  content?: React.ReactNode;
  contentBg?: string;
  overlayColor?: string;
  overlayImage?: string;
  // Extended model for color management
  color?: string; // Background color when no image is present
  hasCover?: boolean; // Whether card has an uploaded image
};

interface ScratchGridProps {
  cards?: CardDef[];
  overlayColor?: string;
  overlayImage?: string;
  brushSize?: number;
  revealThreshold?: number; // 0..1
  zoom?: number;
  onReveal?: (cardId: string) => void;
  device?: 'desktop' | 'tablet' | 'mobile';
  background?: { type: 'color' | 'image'; value: string };
}

/**
 * ScratchGrid
 * - Grille responsive 2x2 de cartes à gratter
 * - Chaque carte possède un canvas overlay qui s'efface via destination-out
 * - HiDPI aware (devicePixelRatio)
 * - ResizeObserver pour recalibrer les canvas
 * - Support pour couvertures d'images via blob URLs (postMessage)
 */

// Global object URL management for card covers
const cardObjectUrls = new Map<string, string>();

// Message handler for receiving card covers and colors from parent
if (typeof window !== 'undefined') {
  window.addEventListener('message', (e) => {
    const msg = e.data;
    
    if (msg?.t === 'SET_CARD_COVER') {
      const { cardId, mime, ab } = msg;
      
      // Revoke previous URL if exists
      const prevUrl = cardObjectUrls.get(cardId);
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      
      // Create new blob URL
      const blob = new Blob([ab], { type: mime });
      const url = URL.createObjectURL(blob);
      cardObjectUrls.set(cardId, url);
      
      // Apply cover to card element
      applyCoverToCard(cardId, url);
      
      // Send acknowledgment
      if (e.source && 'postMessage' in e.source) {
        (e.source as any).postMessage({ t: 'CARD_COVER_APPLIED', cardId }, '*');
      }
    }
    
    if (msg?.t === 'SET_CARD_COLOR') {
      const { cardId, color } = msg;
      applyColorToCard(cardId, color);
    }
    
    if (msg?.t === 'SYNC_STATE') {
      const { cards } = msg;
      // Apply colors for cards without covers
      cards.forEach((card: any) => {
        if (!card.hasCover && card.color) {
          applyColorToCard(card.id, card.color);
        }
      });
    }
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    for (const url of cardObjectUrls.values()) {
      URL.revokeObjectURL(url);
    }
    cardObjectUrls.clear();
  });
}

function applyCoverToCard(cardId: string, url: string) {
  const cardEl = document.querySelector(`[data-id="${cardId}"]`) as HTMLElement;
  if (cardEl) {
    // Store the blob URL for use in canvas painting
    cardEl.dataset.blobCoverUrl = url;
    // Mark that this card has a cover (takes priority over color)
    cardEl.setAttribute('data-has-cover', 'true');
    // Set CSS custom property for background image
    cardEl.style.setProperty('--card-bg-image', `url("${url}")`);
    
    // Trigger canvas repaint if the card is already set up
    const canvas = cardEl.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const event = new CustomEvent('repaint-cover');
      canvas.dispatchEvent(event);
    }
  }
}

function applyColorToCard(cardId: string, color: string) {
  const cardEl = document.querySelector(`[data-id="${cardId}"]`) as HTMLElement;
  if (cardEl) {
    // Check if card has a cover - if so, color should not override
    const hasCover = cardEl.getAttribute('data-has-cover') === 'true';
    if (hasCover) {
      return; // Don't apply color if there's a cover
    }
    
    // Set background color directly on the card element
    cardEl.style.backgroundColor = color;
    // Mark that this card has no cover
    cardEl.setAttribute('data-has-cover', 'false');
  }
}
const ScratchGrid: React.FC<ScratchGridProps> = ({
  cards,
  overlayColor = '#E3C6B7',
  overlayImage,
  brushSize = 40,
  revealThreshold = 0.6,
  zoom = 1,
  onReveal,
  device = 'desktop',
  background
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCardIdRef = useRef<string | null>(null); // verrouiller la 1ère carte utilisée

  const displayCards: CardDef[] = useMemo(() => {
    if (!cards || cards.length === 0) {
      return [
        { id: 'card-1', content: '🎉 Surprise 1' },
        { id: 'card-2', content: '💎 Bonus 2' },
        { id: 'card-3', content: '🏆 Prix 3' },
        { id: 'card-4', content: '🎁 Cadeau 4' }
      ];
    }
    
    // Support pour un nombre variable de cartes (pas seulement 4)
    return cards;
  }, [cards]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const disposers: Array<() => void> = [];

    const setupCard = (cardEl: HTMLElement) => {
      const canvas = cardEl.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      let drawing = false;
      let cleared = false;
      let rafId = 0;
      let pending: { x: number; y: number } | null = null;
      let lastPt: { x: number; y: number } | null = null;
      let img: HTMLImageElement | null = null;
      const cardOverlayImage = (cardEl as HTMLElement).dataset.overlayImage || overlayImage;
      const blobCoverUrl = (cardEl as HTMLElement).dataset.blobCoverUrl;
      
      // Priority: blob URL > overlayImage > global overlayImage
      const imageSource = blobCoverUrl || cardOverlayImage;
      
      if (imageSource) {
        img = new Image();
        img.src = imageSource;
        img.onload = () => {
          try { paintOverlay(); } catch {}
        };
      }
      
      // Listen for cover repaint events
      const onRepaintCover = () => {
        const newBlobUrl = (cardEl as HTMLElement).dataset.blobCoverUrl;
        if (newBlobUrl && (!img || img.src !== newBlobUrl)) {
          img = new Image();
          img.src = newBlobUrl;
          img.onload = () => {
            try { paintOverlay(); } catch {}
          };
        }
      };
      
      canvas.addEventListener('repaint-cover', onRepaintCover);

      const dpr = () => Math.max(1, Math.floor(window.devicePixelRatio || 1));

      const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        // Expand by 0.5px on each side to avoid anti-aliased gaps at high DPR/scale
        const ex = -0.5, ey = -0.5, ew = w + 1, eh = h + 1;
        const rad = Math.min(r, w / 2, h / 2);
        c.beginPath();
        c.moveTo(ex + rad, ey);
        c.arcTo(ex + ew, ey, ex + ew, ey + eh, rad);
        c.arcTo(ex + ew, ey + eh, ex, ey + eh, rad);
        c.arcTo(ex, ey + eh, ex, ey, rad);
        c.arcTo(ex, ey, ex + ew, ey, rad);
        c.closePath();
      };

      const paintOverlay = () => {
        // Draw in device pixels under identity transform so we cover entire canvas
        const width = canvas.width;
        const height = canvas.height;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, width, height);
        
        if (img && (img.complete || img.naturalWidth > 0)) {
          // Draw cover image as overlay (foil)
          const iw = img.naturalWidth || 1;
          const ih = img.naturalHeight || 1;
          const scale = Math.max(width / iw, height / ih);
          const dw = iw * scale;
          const dh = ih * scale;
          const dx = (width - dw) / 2;
          const dy = (height - dh) / 2;
          ctx.drawImage(img, dx, dy, dw, dh);
        } else {
          // Fallback to solid color foil
          const cardOverlayColor = (cardEl as HTMLElement).dataset.overlay || overlayColor;
          const finalColor = cardOverlayColor || overlayColor || '#E3C6B7';
          console.log(`Drawing overlay color: ${finalColor} for card ${(cardEl as HTMLElement).dataset.id}, from dataset: ${cardOverlayColor}`);
          ctx.fillStyle = finalColor;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      };

      const resize = () => {
        const cssW = Math.round((cardEl as HTMLElement).clientWidth);
        const cssH = Math.round((cardEl as HTMLElement).clientHeight);
        const scale = dpr();
        const prev = (canvas as any)._s || {};
        if (prev.w === cssW && prev.h === cssH && prev.dpr === scale) {
          return; // nothing to do
        }
        // Set CSS size
        canvas.style.width = cssW + 'px';
        canvas.style.height = cssH + 'px';
        // Set bitmap size (device pixels)
        canvas.width = Math.max(1, Math.floor(cssW * scale));
        canvas.height = Math.max(1, Math.floor(cssH * scale));
        // Configure drawing transform so 1 unit == 1 CSS px
        ctx.resetTransform?.();
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        // Transparent background (we use destination-out)
        canvas.style.background = 'transparent';
        ctx.save();
        const r = parseInt(getComputedStyle(cardEl).getPropertyValue('--radius')) || 20;
        roundRect(ctx, 0, 0, cssW, cssH, r);
        ctx.clip();
        paintOverlay();
        ctx.restore();
        canvas.style.pointerEvents = cleared ? 'none' : '';
        (canvas as any)._s = { w: cssW, h: cssH, dpr: scale };
      };

      const scratchAt = (x: number, y: number) => {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize * 2;
        if (lastPt) {
          ctx.beginPath();
          ctx.moveTo(lastPt.x, lastPt.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        lastPt = { x, y };
      };

      const scheduleDraw = (pt: { x: number; y: number }) => {
        pending = pt;
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            rafId = 0;
            if (pending) {
              scratchAt(pending.x, pending.y);
              pending = null;
            }
          });
        }
      };

      const getPointer = (e: any) => {
        const rect = canvas.getBoundingClientRect();
        const p = (e.touches?.[0]) || e;
        // Adjust for CSS transform scale (zoom): rect is scaled, clientWidth is not
        const sx = (() => {
          const cw = Math.max(1, cardEl.clientWidth || rect.width);
          return rect.width / cw;
        })();
        const sy = (() => {
          const ch = Math.max(1, cardEl.clientHeight || rect.height);
          return rect.height / ch;
        })();
        const x = (p.clientX - rect.left) / (sx || 1);
        const y = (p.clientY - rect.top) / (sy || 1);
        return { x, y };
      };

      const onPointerDown = (e: any) => {
        const thisId = cardEl.dataset.id || '';
        // Verrouillage: si une carte est déjà active et que ce n'est pas celle-ci, ignorer
        if (activeCardIdRef.current && activeCardIdRef.current !== thisId) {
          return;
        }
        if (cleared) return;
        drawing = true;
        lastPt = null;
        // Première action: verrouiller cette carte et désactiver les autres
        if (!activeCardIdRef.current) {
          activeCardIdRef.current = thisId;
          try {
            const node = containerRef.current;
            if (node) {
              node.querySelectorAll('.scratch-card').forEach((el) => {
                if ((el as HTMLElement).dataset.id !== thisId) {
                  const c = el.querySelector('canvas') as HTMLCanvasElement | null;
                  if (c) c.style.pointerEvents = 'none';
                  el.classList.add('locked');
                } else {
                  // s'assurer que la carte active reste interactive
                  const c = el.querySelector('canvas') as HTMLCanvasElement | null;
                  if (c) c.style.pointerEvents = '';
                }
              });
            }
          } catch {}
        }
        canvas.setPointerCapture?.(e.pointerId);
        scheduleDraw(getPointer(e));
        e.preventDefault?.();
      };
      const onPointerMove = (e: any) => {
        const thisId = cardEl.dataset.id || '';
        if (!drawing || cleared) return;
        if (activeCardIdRef.current && activeCardIdRef.current !== thisId) return;
        scheduleDraw(getPointer(e));
      };
      const onPointerUp = () => {
        drawing = false;
        lastPt = null;
        requestAnimationFrame(() => {
          if (!cleared && revealRatio() >= revealThreshold) {
            cleared = true;
            animateClear();
            cardEl.classList.add('revealed');
            onReveal?.(cardEl.dataset.id || '');
          }
        });
      };

      const revealRatio = () => {
        try {
          const { width, height } = canvas;
          const step = Math.max(4, Math.floor((width + height) / 600));
          const data = ctx.getImageData(0, 0, width, height).data;
          let opaque = 0, total = 0;
          for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
              const i = ((y * width) + x) * 4 + 3;
              if (data[i] > 0) opaque++;
              total++;
            }
          }
          return 1 - (opaque / total);
        } catch {
          return 0;
        }
      };

      const animateClear = () => {
        const { width, height } = canvas;
        let alpha = 1;
        const tick = () => {
          alpha -= 0.12;
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = `rgba(227,198,183,${Math.max(alpha, 0)})`;
          ctx.fillRect(0, 0, width, height);
          if (alpha > 0) requestAnimationFrame(tick);
          else {
            ctx.clearRect(0, 0, width, height);
            canvas.style.pointerEvents = 'none';
          }
        };
        requestAnimationFrame(tick);
      };

      // Prepare
      const ro = new ResizeObserver(resize);
      ro.observe(cardEl);
      resize();

      // Re-run sizing when DPR changes (e.g., moving window between monitors)
      const mq = window.matchMedia?.(`(resolution: ${dpr()}dppx)`);
      const onDprChange = () => resize();
      mq?.addEventListener?.('change', onDprChange);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      return () => {
        ro.disconnect();
        try { mq?.removeEventListener?.('change', onDprChange); } catch {}
        cancelAnimationFrame(rafId);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('repaint-cover', onRepaintCover);
        window.removeEventListener('pointerup', onPointerUp);
      };
    };

    // attach to each card
    const cardsEls = Array.from(container.querySelectorAll('.scratch-card')) as HTMLElement[];
    cardsEls.forEach((el) => {
      const dispose = setupCard(el);
      if (typeof dispose === 'function') {
        disposers.push(dispose);
      }
    });

    return () => {
      disposers.forEach((d) => d && d());
    };
  }, [displayCards, overlayColor, overlayImage, brushSize, revealThreshold]);

  const dims = getDeviceDimensions(device);

  const frameStyle: React.CSSProperties = {
    width: dims.width,
    height: dims.height,
    minWidth: dims.width,
    minHeight: dims.height,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: background?.type === 'color' ? (background?.value as string) : '#ffffff',
    backgroundImage: background?.type === 'image' ? `url(${background?.value})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    margin: '0 auto'
  };

  // Layout responsive dynamique basé sur le nombre de cartes
  const gap = device === 'desktop' ? 48 : 24;
  const verticalPadding = device === 'desktop' ? 64 : 24;
  const maxGridWidth = Math.floor(dims.width * (device === 'desktop' ? 0.8 : 0.9));
  
  // Calcul dynamique des colonnes selon le nombre de cartes
  const cardCount = displayCards.length;
  const cols = cardCount <= 4 ? 2 : Math.ceil(Math.sqrt(cardCount));
  const rows = Math.ceil(cardCount / cols);
  
  const widthConstraint = Math.floor((maxGridWidth - gap * (cols - 1)) / cols);
  const heightConstraint = Math.floor(((dims.height - 2 * verticalPadding - gap * (rows - 1)) * 3) / (4 * rows));
  const cardW = Math.max(120, Math.min(widthConstraint, heightConstraint));
  const cardH = Math.floor((cardW * 4) / 3);
  const gridW = cardW * cols + gap * (cols - 1);

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cardW}px)`,
    gridAutoRows: `${cardH}px`,
    gap,
    width: gridW,
    padding: 0,
    margin: '0 auto'
  };

  return (
    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
      <div ref={containerRef} style={frameStyle}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={gridStyle}>
            {displayCards.map((c: CardDef) => (
              <div
                key={c.id}
                className={`scratch-card ${styles.scratchCard}`}
                data-id={c.id}
                data-overlay={c.overlayColor || ''}
                data-overlay-image={c.overlayImage || ''}
                data-has-cover={c.hasCover ? 'true' : 'false'}
                style={{
                  position: 'relative',
                  // Single source of truth for radius
                  // @ts-ignore - custom CSS var for canvas clip
                  ['--radius' as any]: 20,
                  borderRadius: 20,
                  overflow: 'hidden',
                  width: cardW,
                  height: cardH,
                  // Base background - will be overridden by color or image
                  background: '#ffffff',
                  boxShadow: 'none',
                  // Apply color if no cover
                  ...(c.color && !c.hasCover && { backgroundColor: c.color })
                }}
              >
                <div className="content" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, color: '#333', borderRadius: 20, background: c.contentBg || '#ffffff', overflow: 'hidden', zIndex: 1 }}>
                  {c.content ?? ''}
                </div>
                <canvas
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    // Match the radius exactly to avoid any sub-pixel bleed
                    borderRadius: 20,
                    touchAction: 'none',
                    cursor: 'crosshair',
                    zIndex: 2,
                    background: 'transparent'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchGrid;
