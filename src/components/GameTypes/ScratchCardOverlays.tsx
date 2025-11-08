
import React from 'react';

interface ScratchCardOverlaysProps {
  selectable: boolean;
  locked: boolean;
  isSelected: boolean;
  canScratch: boolean;
  isRevealed: boolean;
  result: 'win' | 'lose' | null;
  card: any;
  config: any;
}

const ScratchCardOverlays: React.FC<ScratchCardOverlaysProps> = ({
  selectable,
  locked,
  isSelected,
  canScratch
}) => {
  return (
    <>
      {selectable && !locked && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-sm font-semibold">
          Cliquez pour sélectionner
        </div>
      )}

      {isSelected && !canScratch && !locked && (
        <div className="absolute inset-0 bg-[#E0004D]/20 flex items-center justify-center text-[#E0004D] text-sm font-semibold">
          Carte sélectionnée
        </div>
      )}
    </>
  );
};

export default ScratchCardOverlays;
