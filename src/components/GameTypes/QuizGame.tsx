
import React from 'react';
import QuizContainer from './Quiz/QuizContainer';
import { createEnhancedQuizDesign } from '../../utils/quizConfigSync';

interface QuizGameProps {
  config: any;
  design?: any;
  onGameComplete?: (result: any) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({
  config,
  design = {}
}) => {
  const questions = config?.questions || [];

  // Utiliser le nouveau système de synchronisation
  const enhancedDesign = createEnhancedQuizDesign({ design });

  if (!questions.length) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quiz non configuré</h3>
          <p className="text-gray-600">Veuillez ajouter des questions pour commencer</p>
        </div>
      </div>
    );
  }

  // Use QuizContainer directly instead of wrapping it
  return (
    <QuizContainer 
      config={config}
      design={enhancedDesign}
      className="max-w-2xl mx-auto"
    />
  );
};

export default QuizGame;
