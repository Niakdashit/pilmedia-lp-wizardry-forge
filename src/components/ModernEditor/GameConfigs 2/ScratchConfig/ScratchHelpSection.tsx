
import React from 'react';

interface ScratchHelpSectionProps {
  maxCards: number;
  scratchArea: number;
}

const ScratchHelpSection: React.FC<ScratchHelpSectionProps> = ({
  maxCards,
  scratchArea
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Conseils d'utilisation</h4>
      <ul className="text-xs text-blue-700 space-y-1">
        <li>• Maximum {maxCards} cartes à gratter par jeu</li>
        <li>• Les joueurs doivent gratter {scratchArea}% de la surface</li>
        <li>• Chaque carte peut avoir son propre message et image</li>
        <li>• La grille s'adapte automatiquement : 2 cartes/ligne sur mobile, 3 sur desktop</li>
      </ul>
    </div>
  );
};

export default ScratchHelpSection;
