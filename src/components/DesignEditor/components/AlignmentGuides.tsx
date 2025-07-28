import React, { useMemo } from 'react';

interface AlignmentGuidesProps {
  canvasSize: { width: number; height: number };
  elements: any[];
  activeElementId?: string | null;
  showGuides: boolean;
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  canvasSize,
  elements,
  activeElementId,
  showGuides
}) => {
  const guides = useMemo(() => {
    if (!showGuides || !activeElementId) return [];

    const activeElement = elements.find(el => el.id === activeElementId);
    if (!activeElement) return [];

    const otherElements = elements.filter(el => el.id !== activeElementId);
    const guides: Array<{
      type: 'vertical' | 'horizontal';
      position: number;
      color: string;
      thickness: number;
    }> = [];

    // Guides for center alignment
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    // Active element bounds
    const activeX = activeElement.x || 0;
    const activeY = activeElement.y || 0;
    const activeWidth = activeElement.width || 100;
    const activeHeight = activeElement.height || 30;
    const activeCenterX = activeX + activeWidth / 2;
    const activeCenterY = activeY + activeHeight / 2;

    // Tolerance for snap detection
    const tolerance = 10;

    // Check center alignments
    if (Math.abs(activeCenterX - centerX) <= tolerance) {
      guides.push({
        type: 'vertical',
        position: centerX,
        color: '#3b82f6',
        thickness: 2
      });
    }

    if (Math.abs(activeCenterY - centerY) <= tolerance) {
      guides.push({
        type: 'horizontal',
        position: centerY,
        color: '#3b82f6',
        thickness: 2
      });
    }

    // Check alignment with other elements
    otherElements.forEach(element => {
      const elX = element.x || 0;
      const elY = element.y || 0;
      const elWidth = element.width || 100;
      const elHeight = element.height || 30;
      const elCenterX = elX + elWidth / 2;
      const elCenterY = elY + elHeight / 2;

      // Vertical alignment guides
      if (Math.abs(activeCenterX - elCenterX) <= tolerance) {
        guides.push({
          type: 'vertical',
          position: elCenterX,
          color: '#10b981',
          thickness: 1
        });
      }

      if (Math.abs(activeX - elX) <= tolerance) {
        guides.push({
          type: 'vertical',
          position: elX,
          color: '#f59e0b',
          thickness: 1
        });
      }

      if (Math.abs(activeX + activeWidth - (elX + elWidth)) <= tolerance) {
        guides.push({
          type: 'vertical',
          position: elX + elWidth,
          color: '#f59e0b',
          thickness: 1
        });
      }

      // Horizontal alignment guides
      if (Math.abs(activeCenterY - elCenterY) <= tolerance) {
        guides.push({
          type: 'horizontal',
          position: elCenterY,
          color: '#10b981',
          thickness: 1
        });
      }

      if (Math.abs(activeY - elY) <= tolerance) {
        guides.push({
          type: 'horizontal',
          position: elY,
          color: '#f59e0b',
          thickness: 1
        });
      }

      if (Math.abs(activeY + activeHeight - (elY + elHeight)) <= tolerance) {
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

    return uniqueGuides;
  }, [canvasSize, elements, activeElementId, showGuides]);

  if (!showGuides || guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {guides.map((guide, index) => (
        <div
          key={index}
          className="absolute animate-pulse"
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
            boxShadow: `0 0 4px ${guide.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default AlignmentGuides;