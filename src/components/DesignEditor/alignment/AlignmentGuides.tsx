import React from 'react';
import type { AlignmentGuide } from './AlignmentEngine';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  canvasSize: { width: number; height: number };
  zoom: number;
  isDragging: boolean;
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  guides,
  canvasSize,
  zoom,
  isDragging
}) => {
  // Ne rendre les guides que s'il y en a ET qu'on est en train de dragger
  if (!isDragging || guides.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2000 }}>
      {/* Rendu des guides d'alignement */}
      {guides.map((guide) => (
        <div key={guide.id}>
          <div
            className="absolute transition-all duration-150 ease-out"
            style={{
              ...(guide.type === 'vertical' ? {
                left: `${guide.position}px`,
                top: 0,
                width: '2px',
                height: '100%',
              } : {
                top: `${guide.position}px`,
                left: 0,
                height: '2px',
                width: '100%',
              }),
              backgroundColor: guide.color,
              opacity: guide.opacity,
              boxShadow: `0 0 6px ${guide.color}80`,
              zIndex: 2003,
            }}
          />
          
          {guide.label && (
            <div
              className="absolute px-2 py-1 text-xs font-medium rounded shadow-lg"
              style={{
                ...(guide.type === 'vertical' ? {
                  left: `${guide.position + 8}px`,
                  top: '10px',
                } : {
                  top: `${guide.position + 8}px`,
                  left: '10px',
                }),
                backgroundColor: guide.color,
                color: 'white',
                fontSize: '11px',
                zIndex: 2004,
                whiteSpace: 'nowrap'
              }}
            >
              {guide.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlignmentGuides;
