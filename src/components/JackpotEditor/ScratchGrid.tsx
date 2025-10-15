import React, { useEffect, useMemo, useRef } from 'react';
import { getDeviceDimensions } from '@/utils/deviceDimensions';

type CardDef = { id: string; content?: React.ReactNode };

interface ScratchGridProps {
  cards?: CardDef[];
  overlayColor?: string;
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
 */
const ScratchGrid: React.FC<ScratchGridProps> = ({
  cards,
  overlayColor = '#E3C6B7',
  brushSize = 40,
  revealThreshold = 0.6,
  zoom = 1,
  onReveal,
  device = 'desktop',
  background
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCardIdRef = useRef<string | null>(null); // verrouiller la 1ère carte utilisée

  const fourCards: CardDef[] = useMemo(() => {
    if (cards && cards.length === 4) return cards;
    const base: CardDef[] = [
      { id: 'card-1', content: '🎉 Surprise 1' },
      { id: 'card-2', content: '💎 Bonus 2' },
      { id: 'card-3', content: '🏆 Prix 3' },
      { id: 'card-4', content: '🎁 Cadeau 4' }
    ];
    if (!cards) return base;
    // Fill or slice to ensure 4 cards
    const merged = [...cards];
    while (merged.length < 4) merged.push(base[merged.length]);
    return merged.slice(0, 4);
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

      const dpr = () => Math.max(1, Math.floor(window.devicePixelRatio || 1));

      const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        const rad = Math.min(r, w / 2, h / 2);
        c.beginPath();
        c.moveTo(x + rad, y);
        c.arcTo(x + w, y, x + w, y + h, rad);
        c.arcTo(x + w, y + h, x, y + h, rad);
        c.arcTo(x, y + h, x, y, rad);
        c.arcTo(x, y, x + w, y, rad);
        c.closePath();
      };

      const paintOverlay = () => {
        const { width, height } = canvas;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = overlayColor;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      };

      const resize = () => {
        const rect = cardEl.getBoundingClientRect();
        const scale = dpr();
        canvas.width = Math.round(rect.width * scale);
        canvas.height = Math.round(rect.height * scale);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.resetTransform?.();
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        ctx.save();
        const r = parseInt(getComputedStyle(cardEl).getPropertyValue('--radius')) || 20;
        roundRect(ctx, 0, 0, rect.width, rect.height, r);
        ctx.clip();
        paintOverlay();
        ctx.restore();
        canvas.style.pointerEvents = cleared ? 'none' : '';
      };

      const scratchAt = (x: number, y: number) => {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.01, y + 0.01);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
        return { x: p.clientX - rect.left, y: p.clientY - rect.top };
      };

      const onPointerDown = (e: any) => {
        const thisId = cardEl.dataset.id || '';
        // Verrouillage: si une carte est déjà active et que ce n'est pas celle-ci, ignorer
        if (activeCardIdRef.current && activeCardIdRef.current !== thisId) {
          return;
        }
        if (cleared) return;
        drawing = true;
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

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      return () => {
        ro.disconnect();
        cancelAnimationFrame(rafId);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };
    };

    // attach to each card
    const cardsEls = Array.from(container.querySelectorAll('.scratch-card')) as HTMLElement[];
    cardsEls.forEach((el) => {
      const dispose = setupCard(el);
      disposers.push(dispose || (() => {}));
    });

    return () => {
      disposers.forEach((d) => d && d());
    };
  }, [fourCards, overlayColor, brushSize, revealThreshold]);

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

  // Layout responsive avec contrainte d'aspect 3/4 et respect de la hauteur visible
  const gap = device === 'desktop' ? 48 : 24;
  const verticalPadding = device === 'desktop' ? 64 : 24;
  const maxGridWidth = Math.floor(dims.width * (device === 'desktop' ? 0.6 : 0.9));
  const widthConstraint = Math.floor((maxGridWidth - gap) / 2);
  const heightConstraint = Math.floor(((dims.height - 2 * verticalPadding - gap) * 3) / 8); // from 2*h + gap <= H-2P and h=w*4/3
  const cardW = Math.max(120, Math.min(widthConstraint, heightConstraint));
  const cardH = Math.floor((cardW * 4) / 3);
  const gridW = cardW * 2 + gap;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(2, ${cardW}px)`,
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
            {fourCards.map((c) => (
              <div key={c.id} className="scratch-card" data-id={c.id} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', width: cardW, height: cardH, background: '#f7f7f7', boxShadow: '0 1px 0 rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.06)' }}>
                <div className="content" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, color: '#333' }}>
                  {c.content ?? ''}
                </div>
                <canvas style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 20, touchAction: 'none', cursor: 'crosshair' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchGrid;
