
import React from 'react';

interface GridToggleProps {
  showGridLines: boolean;
  onToggle: () => void;
}

const GridToggle: React.FC<GridToggleProps> = ({ onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-lg shadow-sm text-xs z-40"
      title="Afficher/masquer la grille d'alignement"
    >
      📐
    </button>
  );
};

export default GridToggle;
