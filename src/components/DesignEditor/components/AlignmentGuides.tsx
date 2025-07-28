import React, { useState, useEffect } from 'react';

interface AlignmentGuidesProps {
  canvasSize: { width: number; height: number };
  elements: any[];
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  canvasSize,
  elements
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
      const { elementId, x, y, width, height, isDragging: dragging } = event.detail;
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

      // Center guides
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      const elementCenterX = x + width / 2;
      const elementCenterY = y + height / 2;
      const tolerance = 10;

      // Show center alignment guides
      if (Math.abs(elementCenterX - centerX) <= tolerance) {
        guides.push({
          type: 'vertical',
          position: centerX,
          color: '#3b82f6',
          thickness: 2
        });
      }

      if (Math.abs(elementCenterY - centerY) <= tolerance) {
        guides.push({
          type: 'horizontal',
          position: centerY,
          color: '#3b82f6',
          thickness: 2
        });
      }

      // Alignment with other elements
      const otherElements = elements.filter(el => el.id !== elementId);
      otherElements.forEach(element => {
        const elX = element.x || 0;
        const elY = element.y || 0;
        const elWidth = element.width || 100;
        const elHeight = element.height || 30;
        const elCenterX = elX + elWidth / 2;
        const elCenterY = elY + elHeight / 2;

        // Center alignment with other elements
        if (Math.abs(elementCenterX - elCenterX) <= tolerance) {
          guides.push({
            type: 'vertical',
            position: elCenterX,
            color: '#10b981',
            thickness: 1
          });
        }

        if (Math.abs(elementCenterY - elCenterY) <= tolerance) {
          guides.push({
            type: 'horizontal',
            position: elCenterY,
            color: '#10b981',
            thickness: 1
          });
        }

        // Edge alignment
        if (Math.abs(x - elX) <= tolerance) {
          guides.push({
            type: 'vertical',
            position: elX,
            color: '#f59e0b',
            thickness: 1
          });
        }

        if (Math.abs(x + width - (elX + elWidth)) <= tolerance) {
          guides.push({
            type: 'vertical',
            position: elX + elWidth,
            color: '#f59e0b',
            thickness: 1
          });
        }

        if (Math.abs(y - elY) <= tolerance) {
          guides.push({
            type: 'horizontal',
            position: elY,
            color: '#f59e0b',
            thickness: 1
          });
        }

        if (Math.abs(y + height - (elY + elHeight)) <= tolerance) {
          guides.push({
            type: 'horizontal',
            position: elY + elHeight,
            color: '#f59e0b',
            thickness: 1
          });
        }
      });

      // Remove duplicates
      const uniqueGuides = guides.filter((guide, index, self) =>
        index === self.findIndex(g => 
          g.type === guide.type && 
          Math.abs(g.position - guide.position) < 2
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
  }, [canvasSize, elements]);

  if (!isDragging || activeGuides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
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
            opacity: 0.8,
            boxShadow: `0 0 6px ${guide.color}`,
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
      ))}
    </div>
  );
};

export default AlignmentGuides;