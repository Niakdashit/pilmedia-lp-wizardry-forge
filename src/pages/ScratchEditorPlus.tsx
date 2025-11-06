import React from 'react';
import ScratchCardEditorLayout from '../components/ScratchCardEditor/ScratchCardEditorLayout';

/**
 * ScratchEditorPlus - Version avancée de l'éditeur Carte à Gratter
 * Accessible via la modale "Mécaniques avancées"
 */
const ScratchEditorPlus: React.FC = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Éditeur principal */}
      <ScratchCardEditorLayout />
    </div>
  );
};

export default ScratchEditorPlus;
