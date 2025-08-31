import React from 'react';

interface AlignmentToolbarProps {
  selectedElements: string[];
  onAlignToCanvas: (elementId: string, type: 'center-horizontal' | 'center-vertical' | 'top' | 'bottom' | 'left' | 'right') => void;
  onAlignToElement: (elementId: string, targetId: string, type: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical') => void;
  onDistribute: (elementIds: string[], direction: 'horizontal' | 'vertical') => void;
}

const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({
  selectedElements,
  onAlignToCanvas,
  onAlignToElement,
  onDistribute
}) => {
  if (selectedElements.length === 0) return null;

  const handleCanvasAlignment = (type: 'center-horizontal' | 'center-vertical' | 'top' | 'bottom' | 'left' | 'right') => {
    selectedElements.forEach(elementId => {
      onAlignToCanvas(elementId, type);
    });
  };

  const handleDistribution = (direction: 'horizontal' | 'vertical') => {
    if (selectedElements.length >= 2) {
      onDistribute(selectedElements, direction);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg border p-2">
      {/* Alignements Canvas */}
      <div className="flex items-center gap-1 border-r pr-2">
        <span className="text-xs text-gray-600 mr-1">Canvas:</span>
        
        {/* Centre Horizontal */}
        <button
          onClick={() => handleCanvasAlignment('center-horizontal')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Centrer horizontalement"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="6" width="12" height="4" fill="#ff6b35" opacity="0.7"/>
            <line x1="8" y1="0" x2="8" y2="16" stroke="#ff6b35" strokeWidth="2"/>
          </svg>
        </button>

        {/* Centre Vertical */}
        <button
          onClick={() => handleCanvasAlignment('center-vertical')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Centrer verticalement"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="6" y="2" width="4" height="12" fill="#ff6b35" opacity="0.7"/>
            <line x1="0" y1="8" x2="16" y2="8" stroke="#ff6b35" strokeWidth="2"/>
          </svg>
        </button>

        {/* Haut */}
        <button
          onClick={() => handleCanvasAlignment('top')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Aligner en haut"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="4" y="2" width="8" height="4" fill="#4ecdc4" opacity="0.7"/>
            <line x1="0" y1="2" x2="16" y2="2" stroke="#4ecdc4" strokeWidth="2"/>
          </svg>
        </button>

        {/* Bas */}
        <button
          onClick={() => handleCanvasAlignment('bottom')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Aligner en bas"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="4" y="10" width="8" height="4" fill="#4ecdc4" opacity="0.7"/>
            <line x1="0" y1="14" x2="16" y2="14" stroke="#4ecdc4" strokeWidth="2"/>
          </svg>
        </button>

        {/* Gauche */}
        <button
          onClick={() => handleCanvasAlignment('left')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Aligner à gauche"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="4" width="4" height="8" fill="#4ecdc4" opacity="0.7"/>
            <line x1="2" y1="0" x2="2" y2="16" stroke="#4ecdc4" strokeWidth="2"/>
          </svg>
        </button>

        {/* Droite */}
        <button
          onClick={() => handleCanvasAlignment('right')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Aligner à droite"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="10" y="4" width="4" height="8" fill="#4ecdc4" opacity="0.7"/>
            <line x1="14" y1="0" x2="14" y2="16" stroke="#4ecdc4" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {/* Distribution (seulement si 2+ éléments) */}
      {selectedElements.length >= 2 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 mr-1">Distribuer:</span>
          
          {/* Distribution Horizontale */}
          <button
            onClick={() => handleDistribution('horizontal')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Distribuer horizontalement"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="6" width="3" height="4" fill="#f7b731" opacity="0.7"/>
              <rect x="6.5" y="6" width="3" height="4" fill="#f7b731" opacity="0.7"/>
              <rect x="12" y="6" width="3" height="4" fill="#f7b731" opacity="0.7"/>
              <path d="M4.5 8 L6 8 M10 8 L11.5 8" stroke="#f7b731" strokeWidth="1" markerEnd="url(#arrow)"/>
            </svg>
          </button>

          {/* Distribution Verticale */}
          <button
            onClick={() => handleDistribution('vertical')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Distribuer verticalement"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="6" y="1" width="4" height="3" fill="#f7b731" opacity="0.7"/>
              <rect x="6" y="6.5" width="4" height="3" fill="#f7b731" opacity="0.7"/>
              <rect x="6" y="12" width="4" height="3" fill="#f7b731" opacity="0.7"/>
              <path d="M8 4.5 L8 6 M8 10 L8 11.5" stroke="#f7b731" strokeWidth="1" markerEnd="url(#arrow)"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AlignmentToolbar;
