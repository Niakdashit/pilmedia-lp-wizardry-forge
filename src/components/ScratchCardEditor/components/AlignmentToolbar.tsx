// @ts-nocheck
import React from 'react';
import type { ElementBounds } from '../core/AlignmentSystem';
import { useAlignmentSystem } from '../hooks/useAlignmentSystem';

interface AlignmentToolbarProps {
  selectedElements: string[];
  onElementUpdate: (id: string, updates: Partial<any>) => void;
  elements: any[];
  canvasSize: { width: number; height: number };
  zoom: number;
}

const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({
  selectedElements,
  onElementUpdate,
  elements,
  canvasSize,
  zoom
}) => {
  const alignmentSystem = useAlignmentSystem({
    elements: elements.map(el => ({
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height
    })),
    canvasSize,
    zoom,
    snapTolerance: 8,
    gridSize: 20,
    showGrid: false
  });

  const handleCanvasAlignment = (alignment: 'center-h' | 'center-v' | 'top' | 'bottom' | 'left' | 'right') => {
    selectedElements.forEach(elementId => {
      const element = elements.find(el => el.id === elementId);
      if (element) {
        const newPosition = alignmentSystem.alignToCanvas(element, alignment);
        onElementUpdate(elementId, newPosition);
      }
    });
  };

  const handleDistribution = (direction: 'horizontal' | 'vertical') => {
    if (selectedElements.length < 2) return;
    
    const selectedElementData = selectedElements.map(id => 
      elements.find(el => el.id === id)
    ).filter(Boolean);

    const positions = alignmentSystem.distributeElements(selectedElementData, direction);
    positions.forEach(pos => {
      onElementUpdate(pos.id, { x: pos.x, y: pos.y });
    });
  };

  return (
    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-1">
      {/* Alignements Canvas */}
      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <button
          onClick={() => handleCanvasAlignment('left')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Aligner à gauche"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h1v12H2V2zm3 3h8v2H5V5zm0 4h6v2H5V9z"/>
          </svg>
        </button>
        
        <button
          onClick={() => handleCanvasAlignment('center-h')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Centrer horizontalement"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v12h-1V2h1zM4 5h8v2H4V5zm2 4h4v2H6V9z"/>
          </svg>
        </button>
        
        <button
          onClick={() => handleCanvasAlignment('right')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Aligner à droite"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13 2h1v12h-1V2zM3 5h8v2H3V5zm2 4h6v2H5V9z"/>
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <button
          onClick={() => handleCanvasAlignment('top')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Aligner en haut"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2v1h12V2H2zm3 3v8h2V5H5zm4 0v6h2V5H9z"/>
          </svg>
        </button>
        
        <button
          onClick={() => handleCanvasAlignment('center-v')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Centrer verticalement"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 8h12v1H2V8zM5 4v8h2V4H5zm4 2v4h2V6H9z"/>
          </svg>
        </button>
        
        <button
          onClick={() => handleCanvasAlignment('bottom')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Aligner en bas"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 14v1h12v-1H2zM5 3v8h2V3H5zm4 2v6h2V5H9z"/>
          </svg>
        </button>
      </div>

      {/* Distribution (si 2+ éléments) */}
      {selectedElements.length >= 2 && (
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={() => handleDistribution('horizontal')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Distribuer horizontalement"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 6h3v4H2V6zm5 0h2v4H7V6zm5 0h2v4h-2V6z"/>
            </svg>
          </button>
          
          <button
            onClick={() => handleDistribution('vertical')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Distribuer verticalement"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 2h4v3H6V2zm0 5h4v2H6V7zm0 5h4v2H6v-2z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AlignmentToolbar;
