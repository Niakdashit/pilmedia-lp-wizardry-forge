import React, { useState, useEffect } from 'react';

interface AlignmentGuidesProps {
  canvasSize: { width: number; height: number };
  elements: any[];
  zoom?: number;
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  canvasSize,
  elements,
  zoom = 1
}) => {
  const [activeGuides, setActiveGuides] = useState<Array<{
    type: 'vertical' | 'horizontal';
    position: number;
    color: string;
    thickness: number;
  }>>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleShowGuides = (event: CustomEvent) => {
      const { 
        elementId, 
        x, 
        y, 
        width, 
        height, 
        elementCenterX,
        elementCenterY,
        canvasCenterX,
        canvasCenterY,
        isDragging: dragging 
      } = event.detail;
      
      setIsDragging(dragging);

      if (!dragging) {
        setActiveGuides([]);
        return;
      }

      const guides: Array<{
        type: 'vertical' | 'horizontal';
        position: number;
        color: string;
        thickness: number;
      }> = [];

      // Tolérances (px viewport -> unités canvas)
      // Centre: très strict, uniquement quand on est pile au centre
      const centerTolerance = 0.5 / Math.max(zoom, 0.0001);
      // Autres guides: plus strict que précédemment pour éviter l'affichage multiple
      const otherTolerance = 6 / Math.max(zoom, 0.0001);

      // Guides de centre - utiliser les centres calculés
      const centerX = canvasCenterX || canvasSize.width / 2;
      const centerY = canvasCenterY || canvasSize.height / 2;
      
      // Centre de l'élément calculé depuis les coordonnées réelles
      const elemCenterX = elementCenterX || (x + width / 2);
      const elemCenterY = elementCenterY || (y + height / 2);

      // Guide vertical centre - uniquement quand c'est strictement centré
      const centerXActive = Math.abs(elemCenterX - centerX) <= centerTolerance;
      if (centerXActive) {
        guides.push({
          type: 'vertical',
          position: elemCenterX,
          color: '#8d117a',
          thickness: 1 / Math.max(zoom, 0.0001)
        });
      }

      // Guide horizontal centre - uniquement quand c'est strictement centré
      const centerYActive = Math.abs(elemCenterY - centerY) <= centerTolerance;
      if (centerYActive) {
        guides.push({
          type: 'horizontal',
          position: elemCenterY,
          color: '#8d117a',
          thickness: 1 / Math.max(zoom, 0.0001)
        });
      }

      // Alignment with other elements (guides verts plus fins)
      const otherElements = elements.filter(el => el.id !== elementId);

      // 1) Nearest center-to-center only (strict tolerance) — restrict to TEXT elements if type is provided
      const hasTypeInfo = otherElements.some(el => el && typeof el === 'object' && 'type' in el);
      const centerCandidates = hasTypeInfo
        ? otherElements.filter(el => (el as any).type === 'text')
        : otherElements;

      let bestCenterX: { position: number; delta: number } | null = null;
      let bestCenterY: { position: number; delta: number } | null = null;
      centerCandidates.forEach(element => {
        const elX = element.x || 0;
        const elY = element.y || 0;
        const elWidth = element.width || 100;
        const elHeight = element.height || 30;
        const elCenterX = elX + elWidth / 2;
        const elCenterY = elY + elHeight / 2;

        const dx = Math.abs(elemCenterX - elCenterX);
        const dy = Math.abs(elemCenterY - elCenterY);

        if (!bestCenterX || dx < bestCenterX.delta) {
          bestCenterX = { position: elCenterX, delta: dx };
        }
        if (!bestCenterY || dy < bestCenterY.delta) {
          bestCenterY = { position: elCenterY, delta: dy };
        }
      });

      // Tolerance stricte pour centre-à-centre (px overlay)
      // Réduite à 0.5px pour éviter les faux positifs
      const elementCenterTolerance = 0.5 / Math.max(zoom, 0.0001);

      if (!centerXActive && bestCenterX && (bestCenterX as any).delta <= elementCenterTolerance) {
        guides.push({
          type: 'vertical',
          position: (bestCenterX as any).position,
          color: '#10b981',
          thickness: 1 / Math.max(zoom, 0.0001)
        });
      }

      if (!centerYActive && bestCenterY && (bestCenterY as any).delta <= elementCenterTolerance) {
        guides.push({
          type: 'horizontal',
          position: (bestCenterY as any).position,
          color: '#10b981',
          thickness: 1 / Math.max(zoom, 0.0001)
        });
      }

      // 2) Edge alignment (inchangé, tolérance standard)
      otherElements.forEach(element => {
        const elX = element.x || 0;
        const elY = element.y || 0;
        const elWidth = element.width || 100;
        const elHeight = element.height || 30;

        if (!centerXActive && Math.abs(x - elX) <= otherTolerance) {
          guides.push({
            type: 'vertical',
            position: elX,
            color: '#f59e0b',
            thickness: 1 / Math.max(zoom, 0.0001)
          });
        }

        if (!centerXActive && Math.abs(x + width - (elX + elWidth)) <= otherTolerance) {
          guides.push({
            type: 'vertical',
            position: elX + elWidth,
            color: '#f59e0b',
            thickness: 1 / Math.max(zoom, 0.0001)
          });
        }

        if (!centerYActive && Math.abs(y - elY) <= otherTolerance) {
          guides.push({
            type: 'horizontal',
            position: elY,
            color: '#f59e0b',
            thickness: 1 / Math.max(zoom, 0.0001)
          });
        }

        if (!centerYActive && Math.abs(y + height - (elY + elHeight)) <= otherTolerance) {
          guides.push({
            type: 'horizontal',
            position: elY + elHeight,
            color: '#f59e0b',
            thickness: 1 / Math.max(zoom, 0.0001)
          });
        }
      });

      // Remove duplicates
      const uniqueGuides = guides.filter((guide, index, self) =>
        index === self.findIndex(g => 
          g.type === guide.type && 
          Math.abs(g.position - guide.position) < (2 / Math.max(zoom, 0.0001))
        )
      );

      setActiveGuides(uniqueGuides);
    };

    const handleHideGuides = () => {
      setActiveGuides([]);
      setIsDragging(false);
    };

    document.addEventListener('showAlignmentGuides', handleShowGuides as EventListener);
    document.addEventListener('hideAlignmentGuides', handleHideGuides);

    return () => {
      document.removeEventListener('showAlignmentGuides', handleShowGuides as EventListener);
      document.removeEventListener('hideAlignmentGuides', handleHideGuides);
    };
  }, [canvasSize, elements, zoom]);

  if (!isDragging || activeGuides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20" style={{ zIndex: 2000 }}>
      {activeGuides.map((guide, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            ...(guide.type === 'vertical' ? {
              left: `${guide.position}px`,
              top: 0,
              width: `${guide.thickness}px`,
              height: '100%',
            } : {
              top: `${guide.position}px`,
              left: 0,
              height: `${guide.thickness}px`,
              width: '100%',
            }),
            backgroundColor: guide.color,
            opacity: 0.9,
            boxShadow: `0 0 8px ${guide.color}`,
            transition: 'opacity 0.2s ease-in-out',
            zIndex: 2001
          }}
        />
      ))}
    </div>
  );
};

export default AlignmentGuides;