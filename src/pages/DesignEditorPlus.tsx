import React from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';

/**
 * DesignEditorPlus - Version avancée de l'éditeur Roue de la Fortune
 * Accessible via la modale "Mécaniques avancées"
 */
const DesignEditorPlus: React.FC = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Éditeur principal */}
      <DesignEditorLayout />
    </div>
  );
};

export default DesignEditorPlus;
