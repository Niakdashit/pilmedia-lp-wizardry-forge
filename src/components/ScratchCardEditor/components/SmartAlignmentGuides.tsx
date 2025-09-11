import React, { useMemo } from 'react';
import type { AlignmentGuide } from '../core/AlignmentSystem';

interface SmartAlignmentGuidesProps {
  guides: AlignmentGuide[];
  canvasSize: { width: number; height: number };
  zoom: number;
  isDragging: boolean;
}

const SmartAlignmentGuides: React.FC<SmartAlignmentGuidesProps> = ({
  guides,
  canvasSize,
  zoom,
  isDragging
}) => {
  // Ne render que si on drag et qu'il y a des guides
  const shouldRender = useMemo(() => {
    return isDragging && guides.length > 0;
  }, [isDragging, guides.length]);

  if (!shouldRender) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {guides.map((guide) => (
        <div
          key={guide.id}
          className="absolute transition-opacity duration-200 ease-out"
          style={{
            ...(guide.type === 'vertical' ? {
              left: `${guide.position}px`,
              top: 0,
              width: '1px',
              height: '100%',
            } : {
              top: `${guide.position}px`,
              left: 0,
              height: '1px',
              width: '100%',
            }),
            backgroundColor: guide.color,
            opacity: guide.opacity,
            boxShadow: guide.source === 'canvas-center' 
              ? `0 0 8px ${guide.color}60`
              : `0 0 4px ${guide.color}40`,
            zIndex: guide.source === 'canvas-center' ? 1002 : 1001,
            // Animation pour les guides de centre canvas
            ...(guide.source === 'canvas-center' && {
              animation: 'pulse 1.5s ease-in-out infinite',
            })
          }}
        />
      ))}

      {/* Animation CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: ${guides.find(g => g.source === 'canvas-center')?.opacity || 1};
          }
          50% {
            opacity: ${Math.min((guides.find(g => g.source === 'canvas-center')?.opacity || 1) + 0.3, 1)};
          }
        }
      `}</style>
    </div>
  );
};

export default SmartAlignmentGuides;
