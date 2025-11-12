import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Sparkles, Move3D, Palette } from 'lucide-react';

interface MobileToolbarOverlayProps {
  selectedElement: any;
  onElementUpdate: (updates: any) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  zoom: number;
}

const MobileToolbarOverlay: React.FC<MobileToolbarOverlayProps> = ({
  selectedElement,
  onElementUpdate,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  canvasRef,
  zoom
}) => {
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const computeAndSetToolbarPosition = React.useCallback(() => {
    if (!selectedElement || !canvasRef.current) return;
    const elementDOM = canvasRef.current.querySelector(`[data-element-id="${selectedElement.id}"]`) as HTMLElement | null;
    if (!elementDOM) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementRect = elementDOM.getBoundingClientRect();

    // Use measured toolbar width if available, otherwise estimate (more compact on small screens)
    const measuredWidth = toolbarRef.current?.getBoundingClientRect().width;
    const toolbarWidth = measuredWidth || Math.min(280, Math.max(180, window.innerWidth * 0.9));
    const toolbarHeight = 44;

    let x = elementRect.left + (elementRect.width / 2) - (toolbarWidth / 2);
    let y = elementRect.top - toolbarHeight - 8;

    // Constrain within canvas bounds
    const minX = canvasRect.left + 10;
    const maxX = canvasRect.right - toolbarWidth - 10;
    if (x < minX) x = minX;
    if (x > maxX) x = maxX;

    const topLimit = canvasRect.top + 8;
    const bottomLimit = canvasRect.bottom - toolbarHeight - 8;
    if (y < topLimit) {
      y = elementRect.bottom + 8;
      if (y > bottomLimit) y = bottomLimit;
    }

    setToolbarPosition({ x, y });
    setIsVisible(true);
  }, [selectedElement, canvasRef]);

  const schedulePositionUpdate = React.useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      computeAndSetToolbarPosition();
    });
  }, [computeAndSetToolbarPosition]);

  // Calculer la position de la toolbar au-dessus de l'élément sélectionné
  useEffect(() => {
    if (selectedElement && canvasRef.current) {
      // Utiliser rAF pour lisser les mises à jour pendant les gestes de pinch/zoom
      schedulePositionUpdate();
    } else {
      setIsVisible(false);
    }
  }, [selectedElement, canvasRef, zoom, schedulePositionUpdate]);

  // Après rendu, ajuster la position avec la largeur réelle mesurée pour garantir l'affichage dans le canvas
  useEffect(() => {
    if (isVisible && toolbarRef.current && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const rect = toolbarRef.current.getBoundingClientRect();
      const measured = rect.width;
      setToolbarPosition((pos) => {
        let x = pos.x;
        const minX = canvasRect.left + 10;
        const maxX = canvasRect.right - measured - 10;
        if (x < minX) x = minX;
        if (x > maxX) x = maxX;
        return { ...pos, x };
      });

      // Exposer la hauteur via une variable CSS pour permettre au canvas de se placer sous la toolbar
      const layoutRoot = document.querySelector('.mobile-responsive-layout') as HTMLElement | null;
      if (layoutRoot) {
        layoutRoot.style.setProperty('--mobile-toolbar-height', `${Math.ceil(rect.height)}px`);
      }
    }
  }, [isVisible, zoom, selectedElement, canvasRef]);

  // Réinitialiser la variable quand on masque la toolbar
  useEffect(() => {
    if (!isVisible) {
      const layoutRoot = document.querySelector('.mobile-responsive-layout') as HTMLElement | null;
      if (layoutRoot) layoutRoot.style.setProperty('--mobile-toolbar-height', '0px');
    }
  }, [isVisible]);

  // Observe DOM changes to the selected element to keep toolbar aligned during pinch/resize/move
  useEffect(() => {
    if (!selectedElement || !canvasRef.current) return;
    const elementDOM = canvasRef.current.querySelector(`[data-element-id="${selectedElement.id}"]`) as HTMLElement | null;
    if (!elementDOM) return;

    // ResizeObserver for size changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => schedulePositionUpdate());
      resizeObserver.observe(elementDOM);
    }

    // Scroll and window resize can change viewport-relative positions
    const handleWindow = () => schedulePositionUpdate();
    window.addEventListener('resize', handleWindow, { passive: true });
    window.addEventListener('scroll', handleWindow, { passive: true });

    // Also listen to touchmove on canvas during pinch to keep in sync
    const canvasEl = canvasRef.current as HTMLElement;
    const handleTouchMove = () => schedulePositionUpdate();
    canvasEl.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindow as EventListener);
      window.removeEventListener('scroll', handleWindow as EventListener);
      canvasEl.removeEventListener('touchmove', handleTouchMove as EventListener);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [selectedElement, canvasRef, schedulePositionUpdate]);

  // Masquer la toolbar si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        const elementDOM = canvasRef.current?.querySelector(`[data-element-id="${selectedElement?.id}"]`);
        if (elementDOM && !elementDOM.contains(event.target as Node)) {
          setIsVisible(false);
        }
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible, selectedElement, canvasRef]);

  if (!selectedElement || !isVisible) {
    return null;
  }

  const isTextElement = selectedElement.type === 'text';

  // Ne jamais agrandir la toolbar quand on est zoomé-out: cap à 1
  const effectiveScale = Math.min(1, 1 / zoom);

  // Handlers pour les actions de formatage
  const handleBold = () => {
    const currentWeight = selectedElement.fontWeight || 'normal';
    onElementUpdate({
      fontWeight: currentWeight === 'bold' ? 'normal' : 'bold'
    });
  };

  const handleItalic = () => {
    const currentStyle = selectedElement.fontStyle || 'normal';
    onElementUpdate({
      fontStyle: currentStyle === 'italic' ? 'normal' : 'italic'
    });
  };

  const handleUnderline = () => {
    const currentDecoration = selectedElement.textDecoration || 'none';
    onElementUpdate({
      textDecoration: currentDecoration === 'underline' ? 'none' : 'underline'
    });
  };

  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    onElementUpdate({ textAlign: align });
  };

  const handleFontSizeChange = (delta: number) => {
    const currentSize = parseInt(selectedElement.fontSize) || 16;
    const newSize = Math.max(8, Math.min(72, currentSize + delta));
    onElementUpdate({ fontSize: `${newSize}px` });
  };

  const handleColorChange = (color: string) => {
    onElementUpdate({ color });
  };

  return (
    <div
      ref={toolbarRef}
      className="mobile-toolbar-overlay fixed z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-1.5"
      style={{
        left: `${toolbarPosition.x}px`,
        top: `${toolbarPosition.y}px`,
        transform: `scale(${effectiveScale})`,
        transformOrigin: 'top left',
        maxWidth: '90vw',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
      data-canvas-ui="1"
    >
      <div className="flex items-center gap-1 flex-wrap">
        {isTextElement && (
          <>
            {/* Taille de police */}
            <div className="flex items-center bg-gray-800 rounded px-1.5 py-0.5">
              <button
                onClick={() => handleFontSizeChange(-2)}
                className="text-white hover:bg-gray-700 px-1 py-0.5 rounded text-xs"
              >
                −
              </button>
              <span className="text-white text-[11px] mx-1.5 min-w-[22px] text-center">
                {parseInt(selectedElement.fontSize) || 16}
              </span>
              <button
                onClick={() => handleFontSizeChange(2)}
                className="text-white hover:bg-gray-700 px-1 py-0.5 rounded text-xs"
              >
                +
              </button>
            </div>

            {/* Séparateur */}
            <div className="w-px h-5 bg-gray-600 mx-1"></div>

            {/* Formatage */}
            <button
              onClick={handleBold}
              className={`p-1 rounded transition-colors ${
                selectedElement.fontWeight === 'bold'
                  ? 'bg-[#44444d] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Gras"
            >
              <Bold size={14} />
            </button>

            <button
              onClick={handleItalic}
              className={`p-1 rounded transition-colors ${
                selectedElement.fontStyle === 'italic'
                  ? 'bg-[#44444d] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Italique"
            >
              <Italic size={14} />
            </button>

            <button
              onClick={handleUnderline}
              className={`p-1 rounded transition-colors ${
                selectedElement.textDecoration === 'underline'
                  ? 'bg-[#44444d] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Souligné"
            >
              <Underline size={14} />
            </button>

            {/* Séparateur */}
            <div className="w-px h-5 bg-gray-600 mx-1"></div>

            {/* Alignement */}
            <button
              onClick={() => handleAlignment('left')}
              className={`p-1 rounded transition-colors ${
                selectedElement.textAlign === 'left'
                  ? 'bg-[#44444d] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Aligner à gauche"
            >
              <AlignLeft size={14} />
            </button>

            <button
              onClick={() => handleAlignment('center')}
              className={`p-1 rounded transition-colors ${
                selectedElement.textAlign === 'center'
                  ? 'bg-[#44444d] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Centrer"
            >
              <AlignCenter size={14} />
            </button>

            <button
              onClick={() => handleAlignment('right')}
              className={`p-1 rounded transition-colors ${
                selectedElement.textAlign === 'right'
                  ? 'bg-[#44444d] text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Aligner à droite"
            >
              <AlignRight size={14} />
            </button>

            {/* Séparateur */}
            <div className="w-px h-5 bg-gray-600 mx-1"></div>

            {/* Couleur de texte */}
            <div className="relative">
              <input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                title="Couleur du texte"
              />
              <Type size={12} className="absolute top-1 left-1 text-white pointer-events-none" />
            </div>

            {/* Séparateur */}
            <div className="w-px h-5 bg-gray-600 mx-1"></div>
          </>
        )}

        {/* Actions communes */}
        <button
          onClick={onShowEffectsPanel}
          className="p-1 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          title="Effets"
        >
          <Sparkles size={14} />
        </button>

        <button
          onClick={onShowAnimationsPanel}
          className="p-1 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          title="Animations"
        >
          <Palette size={16} />
        </button>

        <button
          onClick={onShowPositionPanel}
          className="p-1.5 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          title="Position"
        >
          <Move3D size={16} />
        </button>
      </div>

      {/* Indicateur de flèche pointant vers l'élément */}
      <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default MobileToolbarOverlay;
