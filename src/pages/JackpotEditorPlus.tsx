import React from 'react';
import JackpotEditorLayout from '../components/JackpotEditor/JackpotEditorLayout';

/**
 * JackpotEditorPlus - Version avancée de l'éditeur Jackpot
 * Accessible via la modale "Mécaniques avancées"
 */
const JackpotEditorPlus: React.FC = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Éditeur principal */}
      <JackpotEditorLayout />
    </div>
  );
};

export default JackpotEditorPlus;
