import React from 'react';

interface GridOverlayProps {
  canvasSize: { width: number; height: number };
  showGrid: boolean;
  gridSize?: number;
  opacity?: number;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  canvasSize,
  showGrid,
  gridSize = 20,
  opacity = 0.1
}) => {
  if (!showGrid) return null;

  const verticalLines = [];
  const horizontalLines = [];

  // Create vertical grid lines
  for (let x = gridSize; x < canvasSize.width; x += gridSize) {
    verticalLines.push(
      <div
        key={`vertical-${x}`}
        className="absolute bg-gray-400"
        style={{
          left: `${x}px`,
          top: 0,
          width: '1px',
          height: '100%',
          opacity
        }}
      />
    );
  }

  // Create horizontal grid lines
  for (let y = gridSize; y < canvasSize.height; y += gridSize) {
    horizontalLines.push(
      <div
        key={`horizontal-${y}`}
        className="absolute bg-gray-400"
        style={{
          top: `${y}px`,
          left: 0,
          height: '1px',
          width: '100%',
          opacity
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-5">
      {verticalLines}
      {horizontalLines}
      
      {/* Center lines with different style */}
      <div
        className="absolute bg-[hsl(var(--primary))]"
        style={{
          left: `${canvasSize.width / 2}px`,
          top: 0,
          width: '1px',
          height: '100%',
          opacity: opacity * 2
        }}
      />
      <div
        className="absolute bg-[hsl(var(--primary))]"
        style={{
          top: `${canvasSize.height / 2}px`,
          left: 0,
          height: '1px',
          width: '100%',
          opacity: opacity * 2
        }}
      />
    </div>
  );
};

export default GridOverlay;