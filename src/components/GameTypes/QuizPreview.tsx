
import React from 'react';
import QuizContainer from './Quiz/QuizContainer';
import { ScreenLayoutWrapper, useLayoutFromCampaign } from '../Layout/ScreenLayoutWrapper';

interface QuizPreviewProps {
  config: any;
  design?: any;
  className?: string;
  campaign?: any; // Pour récupérer la configuration de layout
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ 
  config, 
  design = {},
  className = '',
  campaign
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
    primaryColor: '#E0004D',
    backgroundColor: '#ffffff',
    titleColor: '#1f2937',
    textColor: '#374151',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '24px',
    ...design
  };

  // 🎯 Récupérer le layout depuis la campagne
  const layout = useLayoutFromCampaign(campaign);

  return (
    <ScreenLayoutWrapper layout={layout} className={className}>
      <QuizContainer 
        config={finalConfig}
        design={enhancedDesign}
        className="w-full"
      />
    </ScreenLayoutWrapper>
  );
};

export default QuizPreview;
