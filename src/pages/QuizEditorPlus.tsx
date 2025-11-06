import React from 'react';
import DesignEditorLayout from '../components/QuizEditor/DesignEditorLayout';

/**
 * QuizEditorPlus - Version avancée de l'éditeur Quiz
 * Accessible via la modale "Mécaniques avancées"
 */
const QuizEditorPlus: React.FC = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Éditeur principal */}
      <DesignEditorLayout />
    </div>
  );
};

export default QuizEditorPlus;
