
import React from 'react';

interface ScratchCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canScratch: boolean;
  isRevealed: boolean;
}

const ScratchCanvas: React.FC<ScratchCanvasProps> = ({
  canvasRef,
  canScratch,
  isRevealed
}) => {
  if (!canScratch || isRevealed) {
    return null;
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full cursor-crosshair" 
      style={{ touchAction: 'none' }} 
    />
  );
};

export default ScratchCanvas;
