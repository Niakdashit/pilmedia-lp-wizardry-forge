
import React from 'react';
import QuizContainer from './Quiz/QuizContainer';

interface QuizPreviewProps {
  config: any;
  design?: any;
  className?: string;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ 
  config, 
  design = {},
  className = ''
}) => {
  // Configuration par défaut si aucune question n'est fournie
  const defaultConfig = {
    questions: [
      {
        id: 1,
        text: 'Quelle est votre couleur préférée ?',
        type: 'single',
        options: [
          { id: 1, text: 'Rouge', isCorrect: false },
          { id: 2, text: 'Bleu', isCorrect: true },
          { id: 3, text: 'Vert', isCorrect: false },
          { id: 4, text: 'Jaune', isCorrect: false }
        ]
      }
    ]
  };

  const finalConfig = config?.questions?.length > 0 ? config : defaultConfig;

  // Design par défaut amélioré
  const enhancedDesign = {
    primaryColor: '#841b60',
    backgroundColor: '#ffffff',
    titleColor: '#1f2937',
    textColor: '#374151',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '24px',
    ...design
  };

  return (
    <div
      className={`quiz-preview-container w-full h-screen flex items-center justify-center ${className}`}
    >
      <QuizContainer 
        config={finalConfig}
        design={enhancedDesign}
        className="w-full"
      />
    </div>
  );
};

export default QuizPreview;
