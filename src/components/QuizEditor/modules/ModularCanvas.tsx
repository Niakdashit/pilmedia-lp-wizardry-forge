import React from 'react';
import { Trash2, GripVertical, MoveDiagonal } from 'lucide-react';
import type { Module, ScreenId } from '@/types/modularEditor';
import type { DeviceType } from '@/utils/deviceDimensions';

export interface ModularCanvasProps {
  screen: ScreenId;
  modules: Module[];
  onUpdate: (id: string, patch: Partial<Module>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onSelect?: (module: Module) => void;
  selectedModuleId?: string;
  device?: DeviceType;
}

const Toolbar: React.FC<{ onDelete: () => void; visible: boolean }>
  = ({ onDelete, visible }) => (
  <div
    className={`absolute right-2.5 top-2.5 flex items-center gap-1 rounded-lg border border-white/40 bg-white/60 px-1.5 py-0.5 shadow-lg shadow-black/5 backdrop-blur-sm transition-all duration-150
      ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'} md:right-3 md:top-3 md:gap-1.5 md:rounded-xl md:px-2 md:py-1`}
  >
    <button
      onClick={onDelete}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-600 hover:bg-red-50/80 transition-colors md:h-8 md:w-8"
      aria-label="Supprimer"
    >
      <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
    </button>
  </div>
);

// Dedicated body editor to preserve caret position and avoid content resets on each keystroke
const BodyEditor: React.FC<{ m: Module; style: React.CSSProperties; onUpdate: (patch: Partial<Module>) => void; isMobile?: boolean }>
  = ({ m, style, onUpdate, isMobile = false }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const isFocusedRef = React.useRef(false);

  // Initialize or refresh innerHTML only when not focused to avoid caret jumps
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isFocusedRef.current) return;
    const html = (m as any).bodyRichHtml as string | undefined;
    if (typeof html === 'string' && html.trim() !== '') {
      if (el.innerHTML !== html) el.innerHTML = html;
    } else {
      // Fallback to plain text
      const text = (m as any).body || '';
      if (el.innerText !== text) {
        el.innerText = text;
      }
    }
  }, [m.id, (m as any).bodyRichHtml, (m as any).body]);

  return (
    <div
      ref={ref}
      className="w-full bg-transparent outline-none whitespace-pre-wrap break-words"
      style={{ ...style, minHeight: 4, border: '1px dashed transparent', padding: 0 }}
      contentEditable
      role="textbox"
      aria-multiline="true"
      tabIndex={0}
      spellCheck
      suppressContentEditableWarning
      data-module-id={(m as any).id}
      data-module-role="body"
      onMouseDown={() => {
        // Ensure the editor gets focus on mouse interaction
        ref.current?.focus();
      }}
      onFocus={() => { isFocusedRef.current = true; }}
      onBlur={(e) => {
        isFocusedRef.current = false;
        const el = e.currentTarget as HTMLDivElement;
        const html = el.innerHTML;
        const text = el.textContent || '';
        onUpdate({ bodyRichHtml: html, body: text });
      }}
      onKeyDown={(e) => {
        const el = ref.current;
        // Handle Cmd/Ctrl+A explicitly to ensure select-all works inside the editor
        if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'a')) {
          e.preventDefault();
          e.stopPropagation();
          if (el) {
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
          return;
        }
        // Handle Undo/Redo explicitly to avoid interference
        const isModifier = e.metaKey || e.ctrlKey;
        if (isModifier && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          e.stopPropagation();
          try { document.execCommand('undo'); } catch {}
          return;
        }
        if (isModifier && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
          e.preventDefault();
          e.stopPropagation();
          try { document.execCommand('redo'); } catch {}
          return;
        }
        // Fallback paste handler for Cmd/Ctrl+V if onPaste is blocked by the browser
        if (isModifier && e.key.toLowerCase() === 'v') {
          // Try async clipboard read; only prevent default if we will insert
          if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.readText()
              .then((text) => {
                if (!text) return;
                // Reuse insertion logic by creating a text node at caret
                const sel = window.getSelection();
                const container = ref.current;
                if (!sel || !container) return;
                if (!sel.rangeCount || !container.contains(sel.getRangeAt(0).commonAncestorContainer)) {
                  const rangeToEnd = document.createRange();
                  rangeToEnd.selectNodeContents(container);
                  rangeToEnd.collapse(false);
                  sel.removeAllRanges();
                  sel.addRange(rangeToEnd);
                }
                const range = sel.getRangeAt(0);
                range.deleteContents();
                const node = document.createTextNode(text);
                range.insertNode(node);
                range.setStartAfter(node);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                const current = container?.textContent || '';
                onUpdate({ body: current });
              })
              .catch(() => {
                // let native paste happen if readText fails
              });
            return;
          }
        }
        // Allow other native shortcuts inside contentEditable (Cmd/Ctrl+B/I/U/Z/Y...)
        if (e.metaKey || e.ctrlKey) {
          // Prevent parent handlers from interfering
          e.stopPropagation();
          return;
        }
        // Let Enter and other typing keys flow, but keep them from bubbling to the container
        e.stopPropagation();
      }}
      
      onPaste={(e) => {
        // Force paste as plain text when possible; otherwise allow native paste
        const direct = e.clipboardData?.getData('text/plain') ?? '';
        const insertText = (text: string) => {
          if (!text) return;
          // Now that we will insert ourselves, block native
          e.preventDefault();
          e.stopPropagation();
          // Try modern API
          try {
            if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
              const ok = document.execCommand('insertText', false, text);
              if (ok) return;
            }
          } catch {}
          // Fallback: manual range insertion
          const sel = window.getSelection();
          const container = ref.current;
          if (!sel || !container) return;
          if (!sel.rangeCount || !container.contains(sel.getRangeAt(0).commonAncestorContainer)) {
            // Place caret at end of editor if selection is missing or outside
            const rangeToEnd = document.createRange();
            rangeToEnd.selectNodeContents(container);
            rangeToEnd.collapse(false);
            sel.removeAllRanges();
            sel.addRange(rangeToEnd);
          }
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const node = document.createTextNode(text);
          range.insertNode(node);
          // Move caret to end of inserted text
          range.setStartAfter(node);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          // Update plain text after paste
          const current = container?.textContent || '';
          onUpdate({ body: current });
        };
        if (direct) {
          insertText(direct);
        } else if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
          // We'll handle async paste; stop native only when we actually insert
          e.stopPropagation();
          navigator.clipboard.readText().then((txt) => insertText(txt)).catch(() => {
            // if failed, fallback to native (do nothing)
          });
        }
      }}
      onInput={(e) => {
        // Update only plain text on input to reduce rerenders
        const el = e.currentTarget as HTMLDivElement;
        const text = el.textContent || '';
        onUpdate({ body: text });
      }}
    />
  );
};

export const renderModule = (m: Module, onUpdate: (patch: Partial<Module>) => void, device: DeviceType = 'desktop') => {
  const isMobileDevice = device === 'mobile';
  const deviceScale = isMobileDevice ? 0.8 : 1;

  const commonStyle: React.CSSProperties = {
    background: m.backgroundColor,
    textAlign: m.align || 'left'
  };
  switch (m.type) {
    case 'BlocTexte': {
      // Transparent module: no inner card, only outer outline
      const pad = 0;
      const hasLegacy = !m.title && !m.body && (m.text || m.html);
      // Title style removed (no title field rendered)
      const baseBodyFontSize = (m as any).bodyFontSize as number | undefined;
      const scaledBodyFontSize = baseBodyFontSize ? Math.max(8, Math.round(baseBodyFontSize * deviceScale)) : undefined;
      const bodyStyle: React.CSSProperties = {
        fontSize: scaledBodyFontSize ? `${scaledBodyFontSize}px` : undefined,
        fontWeight: (m as any).bodyBold ? '600' as any : undefined,
        fontStyle: (m as any).bodyItalic ? 'italic' : undefined,
        textDecoration: (m as any).bodyUnderline ? 'underline' : undefined,
        lineHeight: 1.6,
        fontFamily: (m as any).bodyFontFamily || (m as any).fontFamily || 'Open Sans',
        color: (m as any).bodyColor || '#154b66',
        textAlign: (m.align || 'left') as any
      };
      const align = m.align || 'left';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const maxTextWidth = (m as any).width ?? 800; // clamp default text width
      return (
        <div style={{ ...commonStyle, paddingTop: (m as any).spacingTop ?? 0, paddingBottom: (m as any).spacingBottom ?? 0 }}>
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div style={{ width: '100%', maxWidth: maxTextWidth, paddingLeft: pad, paddingRight: pad }}>
              {hasLegacy ? (
              m.html ? (
                <div dangerouslySetInnerHTML={{ __html: m.html }} />
              ) : (
                <textarea
                  className="w-full bg-transparent outline-none text-sm text-black/90 dark:text-white/90"
                  style={{
                    textAlign: (m.align || 'left') as any,
                    padding: isMobileDevice ? '0' : undefined,
                    fontSize: scaledBodyFontSize ? `${scaledBodyFontSize}px` : undefined
                  }}
                  rows={3}
                  value={m.text || ''}
                  onChange={(e) => onUpdate({ text: e.target.value })}
                  placeholder="Votre texte ici"
                />
              )
            ) : (
              // Only a multi-line body editor; no title field
              <BodyEditor m={m} style={bodyStyle} onUpdate={onUpdate} isMobile={isMobileDevice} />
            )}
            </div>
          </div>
        </div>
      );
    }
    case 'BlocImage': {
      const align = m.align || 'center';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const maxContentWidth = ((m.width ?? 480) * deviceScale);
      const fit = m.objectFit || 'cover';
      // Utiliser directement la hauteur spécifiée par l'utilisateur, sans minimum forcé
      const baseHeight = typeof m.minHeight === 'number'
        ? Math.max(50, Math.round(m.minHeight * deviceScale))  // scale minHeight on mobile
        : Math.max(200, Math.round((maxContentWidth || 520) * 0.6));
      // Cap container height to avoid overflowing the safe zone (approx 60% viewport height)
      const vhCap = (typeof window !== 'undefined' && window.innerHeight) ? Math.max(240, Math.round(window.innerHeight * 0.6)) : 600;
      const containerHeight = fit === 'cover' ? Math.min(baseHeight, vhCap) : undefined;
      const borderRadius = m.borderRadius ?? 0;
      const imageSource = (m.url && m.url.trim().length > 0)
        ? m.url
        : '/assets/templates/placeholder.png';

      return (
        <div style={{ ...commonStyle }}>
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div
              style={{
                width: '100%',
                maxWidth: maxContentWidth,
                borderRadius,
                overflow: 'hidden',
                // Transparent to preserve alpha from uploaded images
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: containerHeight,
                // Remove subtle inset background line to avoid perceived background
                boxShadow: 'none',
                paddingTop: (m as any).spacingTop ?? 0,
                paddingBottom: (m as any).spacingBottom ?? 0
              }}
            >
              <img
                src={imageSource}
                alt={m.alt || ''}
                style={{
                  width: '100%',
                  height: fit === 'cover' ? '100%' : 'auto',
                  objectFit: fit,
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    case 'BlocBouton':
      return (
        <div style={{ ...commonStyle, textAlign: 'center' }}>
          <a
            href={m.href || '#'}
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-[#841b60] to-[#b41b60] border border-white/10 shadow-[0_12px_30px_rgba(132,27,96,0.35)] transition-transform hover:-translate-y-[1px]"
            style={{
              borderRadius: `${m.borderRadius ?? 9999}px`,
              width: 'min(280px, 100%)',
              display: 'inline-flex',
              marginTop: (m as any).spacingTop ?? 0,
              marginBottom: (m as any).spacingBottom ?? 0
            }}
          >
            {m.label || 'Participer'}
          </a>
        </div>
      );
    case 'BlocSeparateur':
      return (
        <div style={{ ...commonStyle }}>
          <hr style={{ height: m.thickness ?? 1, background: m.color ?? '#e5e7eb', border: 'none', width: `${m.widthPercent ?? 100}%`, margin: '0 auto' }} />
        </div>
      );
    case 'BlocVideo':
      return (
        <div style={{ ...commonStyle }}>
          {(() => {
            const align = m.align || 'center';
            const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
            const borderRadius = m.borderRadius ?? 0;
            return (
              <div style={{ display: 'flex', justifyContent, width: '100%' }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: (((m as any).width ?? 560) * deviceScale),
                    borderRadius,
                    overflow: 'hidden',
                    background: 'transparent',
                    display: 'block',
                    paddingTop: (m as any).spacingTop ?? 0,
                    paddingBottom: (m as any).spacingBottom ?? 0
                  }}
                >
                  <div className="relative" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      src={m.src}
                      title={m.title || 'Video'}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      );
    default:
      return null;
  }
};

const ModularCanvas: React.FC<ModularCanvasProps> = ({ screen, modules, onUpdate, onDelete, onMove, onSelect, selectedModuleId, device = 'desktop' }) => {
  const moduleRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const modulesRef = React.useRef(modules);
  const onMoveRef = React.useRef(onMove);
  const dragStateRef = React.useRef<{ id: string; startPointerY: number; lastIndex: number; pointerId: number } | null>(null);
  const activeHandleRef = React.useRef<HTMLElement | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState(0);

  React.useEffect(() => {
    modulesRef.current = modules;
  }, [modules]);

  React.useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  const handleGlobalPointerMove = React.useCallback((event: PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    const modulesSnapshot = modulesRef.current;
    if (!modulesSnapshot || modulesSnapshot.length <= 1) {
      setDragOffset(0);
      return;
    }

    const deltaY = event.clientY - dragState.startPointerY;
    setDragOffset(deltaY);

    const others = modulesSnapshot.filter((mod) => mod.id !== dragState.id);
    if (others.length === 0) return;

    let beforeCount = 0;
    for (let idx = 0; idx < others.length; idx += 1) {
      const mod = others[idx];
      const ref = moduleRefs.current[mod.id];
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (event.clientY > midpoint) {
        beforeCount += 1;
      }
    }

    const desiredIndex = Math.min(modulesSnapshot.length - 1, beforeCount);
    const currentIndex = dragState.lastIndex;

    if (desiredIndex < currentIndex) {
      onMoveRef.current?.(dragState.id, 'up');
      dragState.lastIndex = Math.max(0, currentIndex - 1);
    } else if (desiredIndex > currentIndex) {
      onMoveRef.current?.(dragState.id, 'down');
      dragState.lastIndex = Math.min(modulesSnapshot.length - 1, currentIndex + 1);
    }
  }, []);

  const stopModuleDrag = React.useCallback(() => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    dragStateRef.current = null;
    setDraggingId(null);
    setDragOffset(0);

    document.removeEventListener('pointermove', handleGlobalPointerMove);
    document.removeEventListener('pointerup', stopModuleDrag);
    document.removeEventListener('pointercancel', stopModuleDrag);

    document.body.style.userSelect = '';
    document.body.style.touchAction = '';

    const handleEl = activeHandleRef.current;
    if (handleEl && typeof dragState.pointerId === 'number') {
      try {
        handleEl.releasePointerCapture(dragState.pointerId);
      } catch {}
    }
    activeHandleRef.current = null;
  }, [handleGlobalPointerMove]);

  const startModuleDrag = React.useCallback((event: React.PointerEvent<HTMLElement>, module: Module, index: number) => {
    if (event.button !== 0 && event.pointerType !== 'touch' && event.pointerType !== 'pen') {
      return;
    }

    if (dragStateRef.current) {
      stopModuleDrag();
    }

    event.preventDefault();
    event.stopPropagation();

    const pointerId = event.pointerId;
    dragStateRef.current = {
      id: module.id,
      startPointerY: event.clientY,
      lastIndex: index,
      pointerId
    };
    activeHandleRef.current = event.currentTarget;

    setDraggingId(module.id);
    setDragOffset(0);

    try {
      event.currentTarget.setPointerCapture(pointerId);
    } catch {}

    document.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    document.addEventListener('pointerup', stopModuleDrag, { once: true });
    document.addEventListener('pointercancel', stopModuleDrag, { once: true });

    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';

    onSelect?.(module);
  }, [handleGlobalPointerMove, onSelect, stopModuleDrag]);

  React.useEffect(() => () => {
    stopModuleDrag();
  }, [stopModuleDrag]);

  // Auto-fit safeguard: initialize media sizes only once (when undefined)
  React.useEffect(() => {
    const MAX_SAFE_WIDTH = 1500;
    // Run after layout so refs have sizes
    const id = window.requestAnimationFrame(() => {
      modules.forEach((m) => {
        const ref = moduleRefs.current[m.id];
        if (!ref) return;
        const containerWidth = Math.max(0, ref.clientWidth || 0);
        const zone = ref.closest('[data-modular-zone="1"]') as HTMLElement | null;
        const zoneH = zone?.clientHeight || 0;
        const availHeight = zoneH > 0 ? Math.max(120, zoneH - 160) : 0; // leave room for UI/handles
        if (containerWidth === 0) return;

        if (m.type === 'BlocVideo') {
          const current = (m as any).width as number | undefined;
          // Only initialize if width is undefined (do not override user resize)
          if ((current == null || Number.isNaN(current)) && device !== 'mobile') {
            let desired = Math.max(120, Math.min(containerWidth, 560, MAX_SAFE_WIDTH));
            if (availHeight > 0) {
              const maxByHeight = Math.round(availHeight * (16 / 9));
              desired = Math.min(desired, maxByHeight);
            }
            onUpdate(m.id, { width: desired } as any);
          }
          return;
        }

        if (m.type === 'BlocImage') {
          const img = ref.querySelector('img') as HTMLImageElement | null;
          const naturalW = img?.naturalWidth || undefined;
          const currentW = (m as any).width as number | undefined;
          const fit = (m as any).objectFit || 'cover';
          // Only initialize width if undefined
          if ((currentW == null || Number.isNaN(currentW)) && device !== 'mobile') {
            let desiredW = Math.max(120, Math.min(containerWidth, naturalW ?? 480, MAX_SAFE_WIDTH));
            const aspect = img && img.naturalWidth && img.naturalHeight
              ? (img.naturalWidth / img.naturalHeight)
              : (16 / 9);
            let desiredH = fit === 'cover' ? Math.max(50, Math.round(desiredW / aspect)) : undefined;
            if (availHeight > 0 && desiredH) {
              if (desiredH > availHeight) {
                desiredH = Math.max(50, availHeight);
                desiredW = Math.round(desiredH * aspect);
              }
            }
            const patch: any = { width: desiredW };
            if ((m as any).minHeight == null && desiredH) patch.minHeight = desiredH;
            onUpdate(m.id, patch);
          }
          return;
        }
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [modules, onUpdate, device]);

  const modulePaddingClass = device === 'mobile' ? 'p-0' : 'p-4';
  const single = modules.length === 1;
  const minHeightPx = device === 'mobile' ? 420 : device === 'tablet' ? 520 : 640;
  return (
    <div className="w-full max-w-[1500px] mx-auto" data-modular-zone="1">
      <div
        className={"flex flex-col gap-0"}
        style={{
          minHeight: single ? minHeightPx : undefined,
          justifyContent: single ? 'center' : undefined
        }}
      >
      {modules.map((m, idx) => {
        const isSelected = m.id === selectedModuleId;
        const isDragging = draggingId === m.id;
        const paddingClass = m.type === 'BlocTexte'
          ? (device === 'mobile' ? 'px-0 py-0' : 'px-0 py-1')
          : modulePaddingClass;

        const handleModulePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
          if (event.button !== 0 && event.pointerType !== 'touch' && event.pointerType !== 'pen') {
            return;
          }
          if (event.detail > 1) {
            return;
          }

          const target = event.target as HTMLElement | null;
          if (!target) return;

          if (target.closest('[data-module-drag-handle="true"]')) {
            return; // handle has its own onPointerDown
          }

          const interactiveAncestor = target.closest('[data-module-no-drag="true"], input, textarea, select, button, label, a') as HTMLElement | null;
          if (interactiveAncestor && interactiveAncestor !== event.currentTarget) {
            return;
          }

          startModuleDrag(event as unknown as React.PointerEvent<HTMLElement>, m, idx);
        };

        const handleResizePointerDown = (event: React.PointerEvent<HTMLElement>) => {
          event.preventDefault();
          event.stopPropagation();
          const target = event.currentTarget;
          try {
            target.setPointerCapture(event.pointerId);
          } catch {}
          const startY = event.clientY;
          const measuredRef = moduleRefs.current[m.id];
          const minClamp = 20;
          const MAX_SAFE_WIDTH = 1500; // Largeur maximale du canvas pour éviter de dépasser la zone de sécurité
          // Branch: proportional resize for BlocImage
          if (m.type === 'BlocImage') {
            // Measure current image box to derive aspect ratio
            let startWidth = typeof m.width === 'number' ? m.width : (measuredRef?.querySelector('img') as HTMLImageElement | null)?.clientWidth || measuredRef?.clientWidth || 200;
            let startHeight = typeof m.minHeight === 'number' ? m.minHeight : (measuredRef?.querySelector('img') as HTMLImageElement | null)?.clientHeight || measuredRef?.clientHeight || Math.round(startWidth * 0.6);
            const aspect = startHeight > 0 ? (startWidth / startHeight) : (16 / 9);

            const handlePointerMove = (moveEvt: PointerEvent) => {
              const deltaY = moveEvt.clientY - startY;
              const nextHeight = Math.max(minClamp, Math.round(startHeight + deltaY));
              const nextWidth = Math.min(MAX_SAFE_WIDTH, Math.max(minClamp, Math.round(nextHeight * aspect)));
              onUpdate(m.id, {
                width: nextWidth,
                // Keep height in sync for cover mode; for contain it's ignored by renderer
                minHeight: nextHeight
              });
            };

            const cleanup = () => {
              document.removeEventListener('pointermove', handlePointerMove);
              document.removeEventListener('pointerup', cleanup);
              document.removeEventListener('pointercancel', cleanup);
              try {
                target.releasePointerCapture(event.pointerId);
              } catch {}
            };

            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', cleanup, { once: true });
            document.addEventListener('pointercancel', cleanup, { once: true });
            return;
          }

          // Branch: proportional resize for BlocVideo (use 16:9 default aspect)
          if (m.type === 'BlocVideo') {
            // Measure current iframe box to derive aspect
            let startWidth = typeof (m as any).width === 'number' ? (m as any).width : (measuredRef?.querySelector('iframe') as HTMLIFrameElement | null)?.clientWidth || measuredRef?.clientWidth || 300;
            let startHeight = Math.round(startWidth * (9 / 16));
            const aspect = startHeight > 0 ? (startWidth / startHeight) : (16 / 9);

            const handlePointerMove = (moveEvt: PointerEvent) => {
              const deltaY = moveEvt.clientY - startY;
              const nextHeight = Math.max(100, Math.round(startHeight + deltaY));
              const nextWidth = Math.min(MAX_SAFE_WIDTH, Math.max(120, Math.round(nextHeight * aspect)));
              onUpdate(m.id, {
                width: nextWidth
              } as any);
            };

            const cleanup = () => {
              document.removeEventListener('pointermove', handlePointerMove);
              document.removeEventListener('pointerup', cleanup);
              document.removeEventListener('pointercancel', cleanup);
              try {
                target.releasePointerCapture(event.pointerId);
              } catch {}
            };

            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', cleanup, { once: true });
            document.addEventListener('pointercancel', cleanup, { once: true });
            return;
          }

          // Default behavior for other modules: vertical height resize with spacing distribution
          const startHeight = typeof m.minHeight === 'number' ? m.minHeight : measuredRef?.offsetHeight || 200;
          const baseSpacing = (type: Module['type']) => {
            if (type === 'BlocSeparateur') return 1;
            if (type === 'BlocTexte') return 0;
            return 4;
          };
          const startTopSpacing = m.spacingTop ?? baseSpacing(m.type);
          const startBottomSpacing = m.spacingBottom ?? baseSpacing(m.type);

          const handlePointerMove = (moveEvt: PointerEvent) => {
            const delta = moveEvt.clientY - startY;
            const nextHeight = Math.max(minClamp, Math.round(startHeight + delta));
            const halfDelta = (nextHeight - startHeight) / 2;
            const newTop = Math.max(0, startTopSpacing + halfDelta);
            const newBottom = Math.max(0, startBottomSpacing + halfDelta);
            onUpdate(m.id, {
              minHeight: nextHeight,
              spacingTop: newTop,
              spacingBottom: newBottom
            });
          };

          const cleanup = () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', cleanup);
            document.removeEventListener('pointercancel', cleanup);
            try {
              target.releasePointerCapture(event.pointerId);
            } catch {}
          };

          document.addEventListener('pointermove', handlePointerMove);
          document.addEventListener('pointerup', cleanup, { once: true });
          document.addEventListener('pointercancel', cleanup, { once: true });
        };

        const getDisplayHeight = () => {
          if (typeof m.minHeight === 'number') return m.minHeight;
          const measuredRef = moduleRefs.current[m.id];
          return Math.max(0, Math.round(measuredRef ? measuredRef.offsetHeight : 0));
        };

        return (
        <div
          key={m.id}
          className={`relative group bg-transparent rounded-md transition-colors cursor-pointer ${isSelected ? 'border border-[#0ea5b7] ring-2 ring-[#0ea5b7]/30' : 'border-0 hover:outline hover:outline-1 hover:outline-gray-400'} ${isDragging ? 'ring-2 ring-[#0ea5b7]/30 shadow-xl shadow-black/10' : ''}`}
          role="button"
          tabIndex={0}
          onPointerDown={handleModulePointerDown}
          onClick={() => onSelect?.(m)}
          onDoubleClick={(e) => {
            if (m.type !== 'BlocTexte') return;
            e.preventDefault();
            e.stopPropagation();
            const container = moduleRefs.current[m.id];
            const body = container?.querySelector('[data-module-role="body"]') as HTMLDivElement | null;
            if (!body) return;
            body.focus();
            try {
              const x = (e as any).clientX as number;
              const y = (e as any).clientY as number;
              let range: Range | null = null;
              const anyDoc: any = document as any;
              if (typeof (anyDoc.caretRangeFromPoint) === 'function') {
                range = anyDoc.caretRangeFromPoint(x, y);
              } else if (typeof (anyDoc.caretPositionFromPoint) === 'function') {
                const pos = anyDoc.caretPositionFromPoint(x, y);
                if (pos) {
                  range = document.createRange();
                  range.setStart(pos.offsetNode, pos.offset);
                }
              }
              if (!range || !body.contains(range.startContainer)) {
                range = document.createRange();
                range.selectNodeContents(body);
                range.collapse(false); // place at end
              }
              const sel = window.getSelection();
              if (sel && range) {
                sel.removeAllRanges();
                sel.addRange(range);
              }
            } catch {}
          }}
          onKeyDown={(e) => {
            const target = e.target as HTMLElement | null;
            // Do not intercept keys coming from editable inputs/content
            if (target && (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
              return;
            }
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect?.(m);
            }
          }}
          ref={(el) => {
            if (el) {
              moduleRefs.current[m.id] = el;
            } else {
              delete moduleRefs.current[m.id];
            }
          }}
          style={{
            ...((m.type !== 'BlocTexte' && m.minHeight) ? { minHeight: `${m.minHeight}px` } : {}),
            transform: isDragging ? `translate3d(0, ${dragOffset}px, 0)` : undefined,
            transition: isDragging ? 'none' : 'transform 160ms ease',
            zIndex: isDragging ? 40 : undefined
          }}
        >
          <button
            type="button"
            aria-label="Réorganiser le bloc"
            onPointerDown={(event) => startModuleDrag(event, m, idx)}
            data-module-drag-handle="true"
            className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center text-gray-500 transition-all duration-150 active:scale-95 md:hover:text-gray-700 ${
              isSelected
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
            }`}
            style={{ touchAction: 'none', zIndex: 1001 }}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <Toolbar
            onDelete={() => onDelete(m.id)}
            visible={isSelected && !isDragging}
          />
          <div className={paddingClass}>
            {renderModule(m, (patch) => onUpdate(m.id, patch), device)}
          </div>
          <button
            type="button"
            onPointerDown={handleResizePointerDown}
            className={`absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/75 text-gray-600 shadow-sm shadow-black/10 border border-white/40 transition-all duration-150 active:scale-95 md:hover:text-gray-700 cursor-nwse-resize ${
              isSelected
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
            }`}
            style={{ touchAction: 'none', zIndex: 1002 }}
            aria-label={`Ajuster la hauteur (actuellement ${getDisplayHeight()} pixels)`}
          >
            <MoveDiagonal className="h-3 w-3" />
          </button>
        </div>
        );
      })}
      </div>
      {modules.length === 0 && (
        <div className="text-xs text-gray-500 text-center py-8">Aucun module. Utilisez l'onglet Éléments pour en ajouter.</div>
      )}
    </div>
  );
};

export default ModularCanvas;
