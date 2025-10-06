import React from 'react';
import { Trash2, GripVertical, MoveDiagonal, ChevronDown, Copy } from 'lucide-react';
import type { Module, ScreenId, SocialIconStyle } from '@/types/modularEditor';
import { getGlyphSvg, getSocialIconUrl, getIconStyleConfig } from './socialIcons';
import type { DeviceType } from '@/utils/deviceDimensions';
import { QuizModuleRenderer } from '../QuizRenderer';

export interface ModularCanvasProps {
  screen: ScreenId;
  modules: Module[];
  onUpdate: (id: string, patch: Partial<Module>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDuplicate?: (id: string) => void;
  onSelect?: (module: Module) => void;
  selectedModuleId?: string;
  device?: DeviceType;
}

type LayoutWidth = NonNullable<Module['layoutWidth']>;

const layoutOptions: Array<{ id: LayoutWidth; label: string }> = [
  { id: 'full', label: '1/1' },
  { id: 'half', label: '1/2' },
  { id: 'twoThirds', label: '2/3' },
  { id: 'third', label: '1/3' }
];

const Toolbar: React.FC<{
  onDelete: () => void;
  visible: boolean;
  layoutWidth: LayoutWidth;
  onWidthChange: (width: LayoutWidth) => void;
  expanded: boolean;
  onToggle: () => void;
  align?: 'left' | 'center' | 'right';
  onAlignChange?: (v: 'left' | 'center' | 'right') => void;
  isMobile?: boolean;
  onDuplicate?: () => void;
}> = ({ onDelete, visible, layoutWidth, onWidthChange, expanded, onToggle, align = 'left', onAlignChange, isMobile = false, onDuplicate }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = React.useState<'above' | 'inline'>('above');

  const recomputePlacement = React.useCallback(() => {
    const el = containerRef.current?.parentElement; // wrapper module container
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 12; // px safety from top
    // If there isn't enough room above the block, keep toolbar inline (no translate)
    setPlacement(rect.top <= margin ? 'inline' : 'above');
  }, []);

  React.useLayoutEffect(() => {
    recomputePlacement();
  }, [recomputePlacement, expanded, isMobile]);

  React.useEffect(() => {
    const onWin = () => recomputePlacement();
    window.addEventListener('scroll', onWin, { passive: true });
    window.addEventListener('resize', onWin);
    return () => {
      window.removeEventListener('scroll', onWin as any);
      window.removeEventListener('resize', onWin as any);
    };
  }, [recomputePlacement]);

  return (
  <div
    ref={containerRef}
    className={`absolute ${isMobile ? 'right-0 top-0' : 'right-2.5 top-2.5'} flex items-center ${isMobile ? 'gap-0.5' : 'gap-1'} rounded-lg border border-white/40 bg-white/70 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-150
      ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'} ${isMobile ? '' : 'md:right-3 md:top-3 md:gap-1.5 md:rounded-xl'}`}
    style={{ padding: expanded ? (isMobile ? '2px 6px' : '2px 8px') : 0, zIndex: 1003, ...(placement === 'above' ? { transform: 'translateY(-100%)' } : {}), ...(isMobile ? { maxWidth: '100%', overflowX: 'auto' } : {}) }}
    data-module-no-drag="true"
  >
    {!expanded && (
      <button
        type="button"
        onClick={onToggle}
        onMouseDown={(e) => { e.stopPropagation(); }}
        onPointerDown={(e) => { e.stopPropagation(); }}
        className={`inline-flex ${isMobile ? 'h-6 w-6' : 'h-7 w-7'} items-center justify-center rounded-md bg-white/80 text-gray-700 hover:bg-white`}
        aria-label="Ouvrir les options"
      >
        <ChevronDown className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
      </button>
    )}
    {expanded && (
      <>
        <div className={`flex items-center gap-0.5 ${isMobile ? 'pr-1' : 'pr-1.5'} border-r border-white/40`}>
          {layoutOptions.map((option) => {
            const isActive = layoutWidth === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onWidthChange(option.id)}
                className={`${isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'} font-semibold uppercase tracking-wide rounded-md transition-colors
                  ${isActive ? 'bg-[#841b60] text-white shadow-sm shadow-[#841b60]/40' : 'bg-white/70 text-gray-600 hover:bg-white/90 hover:text-gray-900'}`}
                aria-label={`Largeur ${option.label}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {/* Align controls removed as requested */}
        {onDuplicate && (
          <div className={`flex items-center gap-0.5 ${isMobile ? 'pr-1' : 'pr-1.5'} border-r border-white/40`}>
            <button
              type="button"
              onClick={onDuplicate}
              className={`inline-flex ${isMobile ? 'h-6 w-6' : 'h-7 w-7'} items-center justify-center rounded-md text-gray-600 hover:bg-white/90 transition-colors ${isMobile ? '' : 'md:h-8 md:w-8'}`}
              aria-label="Dupliquer"
              title="Dupliquer"
            >
              <Copy className={`${isMobile ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5 md:h-4 md:w-4'}`} />
            </button>
          </div>
        )}
        <div className={`flex items-center gap-0.5 ${isMobile ? 'pr-1' : 'pr-1.5'} border-r border-white/40`}>
          <button
            onClick={onDelete}
            className={`inline-flex ${isMobile ? 'h-6 w-6' : 'h-7 w-7'} items-center justify-center rounded-md text-red-600 hover:bg-red-50/90 transition-colors ${isMobile ? '' : 'md:h-8 md:w-8'}`}
            aria-label="Supprimer"
          >
            <Trash2 className={`${isMobile ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5 md:h-4 md:w-4'}`} />
          </button>
        </div>
        <button
          type="button"
          onClick={onToggle}
          onMouseDown={(e) => { e.stopPropagation(); }}
          onPointerDown={(e) => { e.stopPropagation(); }}
          className={`ml-1 inline-flex ${isMobile ? 'h-6 w-6' : 'h-7 w-7'} items-center justify-center rounded-md bg-white/60 text-gray-600 hover:bg-white/80`}
          aria-label="Replier"
        >
          <ChevronDown className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} rotate-180`} />
        </button>
      </>
    )}
  </div>
  );
}

const renderModule = (m: Module, onUpdate: (patch: Partial<Module>) => void, device: DeviceType = 'desktop') => {
  // const isMobileDevice = device === 'mobile';

  const commonStyle: React.CSSProperties = {
    background: m.backgroundColor,
    textAlign: m.align || 'left'
  };
  switch (m.type) {
    case 'BlocTexte': {
      return (
        <div style={{ ...commonStyle, paddingTop: (m as any).spacingTop ?? 0, paddingBottom: (m as any).spacingBottom ?? 0 }}>
          <QuizModuleRenderer
            modules={[m]}
            previewMode={false}
            device={device}
            onModuleClick={() => {}}
            onModuleUpdate={(_id, patch) => onUpdate(patch)}
          />
        </div>
      );
    }
    case 'BlocImage': {
      return (
        <div style={{ ...commonStyle, paddingTop: (m as any).spacingTop ?? 0, paddingBottom: (m as any).spacingBottom ?? 0 }}>
          <QuizModuleRenderer
            modules={[m]}
            previewMode={false}
            device={device}
            onModuleClick={() => {}}
            onModuleUpdate={(_id, patch) => onUpdate(patch)}
          />
        </div>
      );
    }
    case 'BlocBouton':
      return (
        <div style={{ ...commonStyle, paddingTop: (m as any).spacingTop ?? 0, paddingBottom: (m as any).spacingBottom ?? 0 }}>
          <QuizModuleRenderer
            modules={[m]}
            previewMode={false}
            device={device}
            onModuleClick={() => {}}
            onModuleUpdate={(_id, patch) => onUpdate(patch)}
          />
        </div>
      );
    case 'BlocSeparateur':
      return (
        <div
          style={{
            ...commonStyle,
            background: 'transparent',
            minHeight: m.minHeight ?? 40,
            height: m.minHeight ?? 40
          }}
          aria-hidden="true"
        />
      );
    case 'BlocVideo':
      return (
        <div style={{ ...commonStyle, paddingTop: (m as any).spacingTop ?? 0, paddingBottom: (m as any).spacingBottom ?? 0 }}>
          <QuizModuleRenderer
            modules={[m]}
            previewMode={false}
            device={device}
            onModuleClick={() => {}}
            onModuleUpdate={(_id, patch) => onUpdate(patch)}
          />
        </div>
      );
    case 'BlocReseauxSociaux': {
      const moduleWithMeta = m as Module & {
        displayMode?: 'icons' | 'buttons';
        iconSize?: number;
        iconSpacing?: number;
        iconStyle?: string;
        links?: Array<{
          id: string;
          label: string;
          url: string;
          network?: string;
          iconSvg?: string;
          iconUrl?: string;
        }>;
      };
      const align = moduleWithMeta.align || 'center';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const links = Array.isArray(moduleWithMeta.links) ? moduleWithMeta.links : [];
      const iconSize = typeof moduleWithMeta.iconSize === 'number' ? moduleWithMeta.iconSize : 48;
      const iconSpacing = typeof moduleWithMeta.iconSpacing === 'number' ? moduleWithMeta.iconSpacing : 12;
      const displayMode = moduleWithMeta.displayMode || 'icons';
      return (
        <div
          style={{
            ...commonStyle,
            paddingTop: (moduleWithMeta as any).spacingTop ?? 0,
            paddingBottom: (moduleWithMeta as any).spacingBottom ?? 0
          }}
        >
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div
              style={{
                width: '100%',
                maxWidth: 720,
                padding: displayMode === 'icons' ? 0 : 20,
                borderRadius: displayMode === 'icons' ? 0 : 16,
                background: displayMode === 'icons'
                  ? 'transparent'
                  : moduleWithMeta.backgroundColor || 'linear-gradient(135deg, rgba(14,165,183,0.08), rgba(15,118,110,0.08))',
                border: displayMode === 'icons' ? 'none' : '1px solid rgba(14,165,183,0.15)',
                boxShadow: displayMode === 'icons' ? 'none' : '0 18px 45px rgba(14,165,183,0.08)'
              }}
            >
              <div
                className="flex items-center"
                style={{
                  gap: iconSpacing,
                  flexWrap: 'nowrap',
                  justifyContent,
                }}
              >
                {links.map((link) => {
                  const networkId = (link.network as any) || undefined;
                  const iconStyle: SocialIconStyle = (moduleWithMeta.iconStyle as SocialIconStyle) ?? 'color';
                  const styleConfig = getIconStyleConfig(iconStyle, networkId as any);
                  void styleConfig; // Mark as used for future functionality
                  const background = 'transparent';
                  const borderStyle = 'none';
                  const iconWrapperStyle: React.CSSProperties = {
                    width: iconSize,
                    height: iconSize,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background,
                    borderRadius: '0px',
                    border: borderStyle,
                    boxShadow: 'none',
                    overflow: 'hidden'
                  };
                  const glyphSvg = getGlyphSvg(networkId as any);
                  const glyphScale = 0.6;

                  // Déterminer automatiquement la couleur d'icône basée sur le style
                  let iconColor: 'default' | 'grey' | 'black' = 'default';
                  if (iconStyle === 'grey') {
                    iconColor = 'grey';
                  } else if (iconStyle === 'black') {
                    iconColor = 'black';
                  }
                  // Pour 'color', on utilise 'default' qui est déjà la valeur par défaut

                  const content = link.iconUrl ? (
                    <img
                      src={getSocialIconUrl(networkId as any, iconColor)}
                      alt={link.label}
                      style={{
                        width: iconSize * glyphScale,
                        height: iconSize * glyphScale,
                        objectFit: 'contain'
                      }}
                    />
                  ) : glyphSvg ? (
                    <span
                      className="block"
                      style={{
                        width: iconSize * glyphScale,
                        height: iconSize * glyphScale,
                        color: '#000000'
                      }}
                      dangerouslySetInnerHTML={{ __html: glyphSvg }}
                    />
                  ) : (
                    <span
                      className="w-full h-full font-semibold flex items-center justify-center"
                      style={{
                        color: '#000000'
                      }}
                    >
                      {(link.label || '?').toString().slice(0, 1).toUpperCase()}
                    </span>
                  );

                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.preventDefault()}
                      data-module-no-drag="true"
                      style={iconWrapperStyle}
                    >
                      {content}
                    </a>
                  );
                })}
                {links.length === 0 && (
                  <div className="text-xs text-slate-500 italic" data-module-no-drag="true">
                    Ajoutez des liens sociaux dans le panneau de configuration.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    case 'BlocHtml':
      const htmlAlign = (m.align || 'left') as 'left' | 'center' | 'right';
      const htmlJustify = htmlAlign === 'left' ? 'flex-start' : htmlAlign === 'right' ? 'flex-end' : 'center';
      return (
        <div
          style={{
            ...commonStyle,
            background: 'transparent',
            paddingTop: (m as any).spacingTop ?? 0,
            paddingBottom: (m as any).spacingBottom ?? 0,
            display: 'flex',
            justifyContent: htmlJustify,
            width: '100%'
          }}
        >
          <div style={{ textAlign: htmlAlign, width: '100%' }}>
            {(m as any).html ? (
              <div
                className="whitespace-pre-wrap text-sm text-slate-700"
                dangerouslySetInnerHTML={{ __html: (m as any).html }}
              />
            ) : (
              <div className="text-sm italic text-slate-500">
                Bloc HTML. Ajoutez votre code HTML personnalisé ici.
              </div>
            )}
          </div>
        </div>
      );
    case 'BlocCarte': {
      // Utiliser QuizModuleRenderer pour un rendu cohérent avec l'héritage des couleurs
      return (
        <div
          style={{
            ...commonStyle,
            paddingTop: (m as any).spacingTop ?? 0,
            paddingBottom: (m as any).spacingBottom ?? 0,
            width: '100%'
          }}
        >
          <QuizModuleRenderer
            modules={[m]}
            previewMode={false}
            device={device}
            onModuleClick={(moduleId) => {
              // Pas de sélection en mode édition pour les cartes
            }}
            selectedModuleId={undefined}
            onModuleUpdate={(moduleId, patch) => {
              // Mettre à jour le module via le callback parent
              onUpdate({ ...patch } as any);
            }}
            className="w-full"
          />
        </div>
      );
    }
    case 'BlocLogo':
      return (
        <QuizModuleRenderer
          modules={[m]}
          previewMode={false}
          device={device}
          onModuleClick={() => {}}
          onModuleUpdate={(_id, patch) => onUpdate(patch)}
        />
      );
    case 'BlocPiedDePage':
      return (
        <QuizModuleRenderer
          modules={[m]}
          previewMode={false}
          device={device}
          onModuleClick={() => {}}
          onModuleUpdate={(_id, patch) => onUpdate(patch)}
        />
      );
    default:
      return null;
  }
};

const ModularCanvas: React.FC<ModularCanvasProps> = ({ screen, modules, onUpdate, onDelete, onMove, onDuplicate, onSelect, selectedModuleId, device = 'desktop' }) => {
  const moduleRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const modulesRef = React.useRef(modules);
  const onMoveRef = React.useRef(onMove);
  const dragStateRef = React.useRef<{ id: string; startPointerY: number; lastIndex: number; pointerId: number } | null>(null);
  const activeHandleRef = React.useRef<HTMLElement | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState(0);
  const lastReorderYRef = React.useRef<number | null>(null);
  const [openToolbarFor, setOpenToolbarFor] = React.useState<string | null>(null);

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
      return;
    }

    // Visual follow: move the dragged card with the pointer
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

    // Threshold reorder to avoid jitter: only reorder if pointer moved enough since last reorder
    const REORDER_STEP = 24; // px
    const lastY = lastReorderYRef.current;
    if (lastY == null || Math.abs(event.clientY - lastY) >= REORDER_STEP) {
      if (desiredIndex < currentIndex) {
        onMoveRef.current?.(dragState.id, 'up');
        dragState.lastIndex = Math.max(0, currentIndex - 1);
        lastReorderYRef.current = event.clientY;
      } else if (desiredIndex > currentIndex) {
        onMoveRef.current?.(dragState.id, 'down');
        dragState.lastIndex = Math.min(modulesSnapshot.length - 1, currentIndex + 1);
        lastReorderYRef.current = event.clientY;
      }
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
    lastReorderYRef.current = event.clientY;

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

  // Séparer les modules Logo et Pied de page des autres modules
  const logoModules = React.useMemo(() => modules.filter(m => m.type === 'BlocLogo'), [modules]);
  const footerModules = React.useMemo(() => modules.filter(m => m.type === 'BlocPiedDePage'), [modules]);
  const regularModules = React.useMemo(() => modules.filter(m => m.type !== 'BlocLogo' && m.type !== 'BlocPiedDePage'), [modules]);
  
  const modulePaddingClass = device === 'mobile' ? 'p-0' : 'p-4';
  const single = regularModules.length === 1;
  const minHeightPx = device === 'mobile' ? 420 : device === 'tablet' ? 520 : 640;
  const rows = React.useMemo(() => {
    const grouped: Array<Array<{ module: Module; index: number }>> = [];
    let current: Array<{ module: Module; index: number }> = [];
    let currentSpan = 0;

    const MAX_ROW_UNITS = 6;

    regularModules.forEach((module, index) => {
      const width = module.layoutWidth || 'full';
      const span = width === 'third' ? 2 : width === 'twoThirds' ? 4 : width === 'half' ? 3 : 6;

      if (current.length > 0 && currentSpan + span > MAX_ROW_UNITS) {
        grouped.push(current);
        current = [];
        currentSpan = 0;
      }

      current.push({ module, index });
      currentSpan += span;

      if (currentSpan === MAX_ROW_UNITS) {
        grouped.push(current);
        current = [];
        currentSpan = 0;
      }
    });

    if (current.length > 0) grouped.push(current);
    return grouped;
  }, [regularModules]);

  return (
    <div className="w-full relative" data-modular-zone="1" style={{ height: '100%' }}>
      {/* Modules Logo - positionnés en absolu tout en haut */}
      {logoModules.map((m) => (
        <div 
          key={m.id}
          className={`absolute top-0 left-1/2 -translate-x-1/2 group ${selectedModuleId === m.id ? 'ring-2 ring-[#0ea5b7]/30' : ''}`}
          style={{ width: '100%', zIndex: 100 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(m);
          }}
        >
          <Toolbar
            visible={selectedModuleId === m.id}
            layoutWidth="full"
            onWidthChange={() => {}}
            onDelete={() => onDelete(m.id)}
            expanded={openToolbarFor === m.id}
            onToggle={() => setOpenToolbarFor((prev) => (prev === m.id ? null : m.id))}
            isMobile={device === 'mobile'}
          />
          {renderModule(m, (patch) => onUpdate(m.id, patch), device)}
        </div>
      ))}

      {/* Modules Pied de page - positionnés en absolu tout en bas */}
      {footerModules.map((m) => (
        <div 
          key={m.id}
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 group ${selectedModuleId === m.id ? 'ring-2 ring-[#0ea5b7]/30' : ''}`}
          style={{ width: '100%', zIndex: 100 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(m);
          }}
        >
          <Toolbar
            visible={selectedModuleId === m.id}
            layoutWidth="full"
            onWidthChange={() => {}}
            onDelete={() => onDelete(m.id)}
            expanded={openToolbarFor === m.id}
            onToggle={() => setOpenToolbarFor((prev) => (prev === m.id ? null : m.id))}
            isMobile={device === 'mobile'}
          />
          {renderModule(m, (patch) => onUpdate(m.id, patch), device)}
        </div>
      ))}
      
      {/* Modules réguliers - dans le conteneur centré avec max-width, avec padding pour éviter le chevauchement */}
      <div className="w-full max-w-[1500px] mx-auto" style={{ paddingTop: (logoModules[0] ? ((logoModules[0] as any).bandHeight ?? 60) + 2 * (((logoModules[0] as any).bandPadding ?? 16)) : 0), paddingBottom: (footerModules[0] ? ((footerModules[0] as any).bandHeight ?? 60) + 2 * (((footerModules[0] as any).bandPadding ?? 16)) : 0) }}>
        <div
          className="flex flex-col gap-0"
          style={{
            minHeight: single ? minHeightPx : undefined,
            justifyContent: 'flex-start'
          }}
        >
          {rows.map((row, rowIndex) => {
          const isMobileView = device === 'mobile';
          const hasSplit = row.some(({ module }) => (module.layoutWidth || 'full') !== 'full');
          return (
            <div
              key={`row-${rowIndex}`}
              className={`grid ${isMobileView ? 'grid-cols-1' : `grid-cols-1 ${hasSplit ? 'md:grid-cols-6' : ''}`} gap-4 md:gap-6`}
            >
              {row.map(({ module: m, index: originalIndex }) => {
                const isSelected = m.id === selectedModuleId;
                const isDragging = draggingId === m.id;
                const currentLayoutWidth = (m.layoutWidth ?? 'full') as LayoutWidth;
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

                  const interactiveAncestor = target.closest('[data-module-no-drag="true"], input, textarea, select') as HTMLElement | null;
                  if (interactiveAncestor && interactiveAncestor !== event.currentTarget) {
                    return;
                  }
                  const contentEditableAncestor = target.closest('[contenteditable="true"]') as HTMLElement | null;
                  if (contentEditableAncestor) {
                    return;
                  }

                  if (m.type === 'BlocHtml') {
                    return;
                  }
                  startModuleDrag(event as unknown as React.PointerEvent<HTMLElement>, m, originalIndex);
                };

                const handleDragHandlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
                  const target = event.target as HTMLElement | null;
                  if (target && target.closest('[data-module-no-drag="true"], input, textarea, select, [contenteditable="true"]')) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  startModuleDrag(event as unknown as React.PointerEvent<HTMLElement>, m, originalIndex);
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

                const columnSpanClass = (() => {
                  if (device === 'mobile') return 'col-span-1';
                  const width = m.layoutWidth || 'full';
                  switch (width) {
                    case 'third':
                      return 'col-span-full md:col-span-2';
                    case 'half':
                      return 'col-span-full md:col-span-3';
                    case 'twoThirds':
                      return 'col-span-full md:col-span-4';
                    default:
                      return 'col-span-full md:col-span-6';
                  }
                })();

                return (
                  <div
                    key={m.id}
                    className={`relative group bg-transparent rounded-md transition-colors cursor-pointer ${columnSpanClass} ${isSelected ? 'border border-[#0ea5b7] ring-2 ring-[#0ea5b7]/30' : 'border-0 hover:outline hover:outline-1 hover:outline-gray-400'} ${isDragging ? 'ring-2 ring-[#0ea5b7]/30 shadow-xl shadow-black/10' : ''}`}
                    role="button"
                    tabIndex={0}
                    onPointerDown={handleModulePointerDown}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect?.(m);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelect?.(m);
                      }
                    }}
                    style={isDragging ? { transform: `translateY(${dragOffset}px)`, zIndex: 50 } : undefined}
                    ref={(el) => { moduleRefs.current[m.id] = el; }}
                  >
                    <Toolbar
                      visible={isSelected || isDragging}
                      layoutWidth={currentLayoutWidth}
                      onWidthChange={(width) => onUpdate(m.id, { layoutWidth: width })}
                      onDelete={() => onDelete(m.id)}
                      align={(m.align || 'left') as 'left' | 'center' | 'right'}
                      onAlignChange={(v) => onUpdate(m.id, { align: v } as any)}
                      expanded={openToolbarFor === m.id}
                      onToggle={() => setOpenToolbarFor((prev) => (prev === m.id ? null : m.id))}
                      isMobile={device === 'mobile'}
                      onDuplicate={onDuplicate ? () => onDuplicate(m.id) : undefined}
                    />
                    <button
                      type="button"
                      data-module-drag-handle="true"
                      onPointerDown={handleDragHandlePointerDown}
                      className={`absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/40 bg-white/75 text-gray-500 shadow-sm shadow-black/5 transition-all duration-150 active:scale-95 md:hover:text-gray-700 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-90'}`}
                      aria-label="Réorganiser le module"
                      style={{ backdropFilter: 'blur(6px)' }}
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>
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
          );
        })}
        </div>
        {regularModules.length === 0 && logoModules.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-8">Aucun module. Utilisez l'onglet Éléments pour en ajouter.</div>
        )}
      </div>
    </div>
  );
};

export default ModularCanvas;
