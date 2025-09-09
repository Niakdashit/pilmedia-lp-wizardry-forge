
import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { useInteractiveDragDrop } from '../hooks/useInteractiveDragDrop';
import InteractiveCustomElementsRenderer from './InteractiveCustomElementsRenderer';
import AlignmentGuides from '../../DesignEditor/components/AlignmentGuides';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';

// Composant mémoïsé pour éviter les rendus inutiles
const DragFeedback = memo(({ isDragging, selectedElementId }: { 
  isDragging: boolean; 
  selectedElementId: string | null 
}) => (
  <>
    {isDragging && (
      <div className="absolute top-2 left-2 bg-blue-500/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg z-50 pointer-events-none backdrop-blur-sm">
        Déplacement en cours...
      </div>
    )}

    {selectedElementId && !isDragging && (
      <div className="absolute top-2 left-2 bg-blue-500/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg z-50 backdrop-blur-sm">
        Élément sélectionné • Appuyez sur Échap pour désélectionner
      </div>
    )}
  </>
));

interface InteractiveDragDropOverlayProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  isEnabled?: boolean;
  children?: React.ReactNode;
}

const InteractiveDragDropOverlay: React.FC<InteractiveDragDropOverlayProps> = ({
  campaign,
  setCampaign,
  previewDevice,
  isEnabled = true,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const deviceDims = useMemo(() => getDeviceDimensions(previewDevice), [previewDevice]);
  const [measuredElements, setMeasuredElements] = useState<Array<{ id: string; x: number; y: number; width: number; height: number; type?: string }>>([]);
  
  // Measure canvas and compute zoom (CSS px per logical unit)
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      try { ro.unobserve(el); } catch {}
      ro.disconnect();
    };
  }, [deviceDims.width]);

  // Measure child elements in CSS pixels to feed AlignmentGuides with accurate positions/sizes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const containerRect = el.getBoundingClientRect();
    const nodes = el.querySelectorAll('[data-element-id]');
    const list: Array<{ id: string; x: number; y: number; width: number; height: number; type?: string }> = [];
    nodes.forEach((node) => {
      const n = node as HTMLElement;
      const id = String(n.getAttribute('data-element-id') || '');
      if (!id) return;
      const type = n.getAttribute('data-element-type') || undefined;
      const r = n.getBoundingClientRect();
      // Default to outer box
      let mx = r.left - containerRect.left;
      let my = r.top - containerRect.top;
      let mw = r.width;
      let mh = r.height;

      // For text elements, prefer the content box (excluding padding/border)
      if (type === 'text') {
        try {
          const range = document.createRange();
          range.selectNodeContents(n);
          const cr = range.getBoundingClientRect();
          if (cr.width > 0 && cr.height > 0) {
            mx = cr.left - containerRect.left;
            my = cr.top - containerRect.top;
            mw = cr.width;
            mh = cr.height;
          }
        } catch {
          // Fallback silently to outer box if Range fails
        }
      }

      list.push({
        id,
        x: mx,
        y: my,
        width: mw,
        height: mh,
        type
      });
    });
    setMeasuredElements(list);
  }, [campaign?.design?.customTexts, campaign?.design?.customImages, previewDevice, canvasSize.width, canvasSize.height]);
  
  const {
    selectedElementId,
    handleElementSelect,
    handleDeselectAll
  } = useInteractiveDragDrop({
    campaign,
    setCampaign,
    containerRef,
    previewDevice
  });

  // Simplified event handling - let individual elements handle their own drag
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDeselectAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleDeselectAll, isEnabled]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleDeselectAll();
    }
  };

  if (!isEnabled) {
    return <div className="relative w-full h-full">{children}</div>;
  }

  // Mémoïser la map des tailles pour éviter les recalculs
  const sizeMap = useRef({
    xs: '10px', sm: '12px', base: '14px', lg: '16px',
    xl: '18px', '2xl': '20px', '3xl': '24px', '4xl': '28px',
    '5xl': '32px', '6xl': '36px', '7xl': '48px',
    '8xl': '60px', '9xl': '72px'
  }).current;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      onClick={handleContainerClick}
      style={{
        cursor: selectedElementId ? 'default' : 'default',
        zIndex: 1000,
        // Optimisation pour le rendu matériel
        transform: 'translateZ(0)',
        willChange: 'transform',
        // Assure que les éléments sont correctement positionnés
        position: 'relative'
      }}
    >
      {/* Alignment guides overlay */}
      <AlignmentGuides
        canvasSize={canvasSize}
        elements={measuredElements}
        // Coordinates are already in CSS pixels, use zoom=1 for tolerance math
        zoom={1}
      />


      {/* Overlay des éléments interactifs fluides */}
      <div className="relative w-full h-full">
        <InteractiveCustomElementsRenderer
          customTexts={campaign.design?.customTexts || []}
          customImages={campaign.design?.customImages || []}
          previewDevice={previewDevice}
          sizeMap={sizeMap}
          selectedElementId={selectedElementId}
          onElementSelect={handleElementSelect}
          setCampaign={setCampaign}
          containerRef={containerRef}
        />
      </div>

      <DragFeedback 
        isDragging={false} 
        selectedElementId={selectedElementId} 
      />
    </div>
  );
};

export default memo(InteractiveDragDropOverlay);
