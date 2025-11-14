
import React from 'react';
import QuizContainer from './Quiz/QuizContainer';
import QuizCanvasPreview from './Quiz/QuizCanvasPreview';
import { ScreenLayoutWrapper, useLayoutFromCampaign } from '../Layout/ScreenLayoutWrapper';

interface QuizPreviewProps {
  config: any;
  design?: any;
  className?: string;
  campaign?: any; // Pour récupérer la configuration de layout
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
  isCanvasPreview?: boolean; // Mode mirroring pur du canvas
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ 
  config, 
  design = {},
  className = '',
  campaign,
  previewDevice = 'desktop',
  isCanvasPreview = true // Par défaut, on affiche le canvas en mode preview
}) => {
  // 🎯 Mode Canvas Preview : Affiche les 3 écrans du canvas en plein écran (mirroring pur)
  if (isCanvasPreview) {
    return (
      <QuizCanvasPreview
        campaign={campaign}
        previewDevice={previewDevice}
        className={className}
      />
    );
  }

  // Mode Quiz Interactif : Affiche le swiper de questions (ancien comportement)
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
    primaryColor: '#44444d',
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
