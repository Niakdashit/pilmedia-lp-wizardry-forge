
import React from 'react';
import QuizGame from './QuizGame';
import { createSynchronizedQuizCampaign } from '../../utils/quizConfigSync';

interface QuizPreviewProps {
  question?: any;
  config?: any;
  design?: any;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ 
  question, 
  config, 
  design, 
  gameSize = 'medium',
  className = ""
}) => {
  // Créer une campagne temporaire pour utiliser le système de synchronisation
  const tempCampaign = {
    design: design || {},
    gameConfig: { quiz: config || {} }
  };

  const synchronizedCampaign = createSynchronizedQuizCampaign(tempCampaign);

  const getSizeStyles = () => {
    switch (gameSize) {
      case 'small':
        return { maxWidth: '300px', padding: '24px' };
      case 'large':
        return { maxWidth: '700px', padding: '32px' };
      case 'xlarge':
        return { maxWidth: '900px', padding: '40px' };
      default:
        return { maxWidth: '600px', padding: '32px' };
    }
  };

  const containerStyle = {
    backgroundColor: synchronizedCampaign.design.containerBackgroundColor || '#ffffff',
    borderColor: synchronizedCampaign.design.borderColor || '#e5e7eb',
    borderRadius: synchronizedCampaign.design.borderRadius || '16px',
    borderWidth: '2px',
    borderStyle: 'solid',
    boxShadow: synchronizedCampaign.design.enableShadow !== false 
      ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' 
      : 'none',
    ...getSizeStyles()
  };

  // Si on a une question spécifique, on crée une config temporaire
  if (question) {
    const tempConfig = {
      questions: [question],
      ...config
    };
    
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div style={containerStyle}>
          <QuizGame
            config={tempConfig}
            design={synchronizedCampaign.design}
            onGameComplete={() => {}}
          />
        </div>
      </div>
    );
  }

  // Si on n'a pas de question mais une config, on l'utilise directement
  if (config?.questions?.length > 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div style={containerStyle}>
          <QuizGame
            config={config}
            design={synchronizedCampaign.design}
            onGameComplete={() => {}}
          />
        </div>
      </div>
    );
  }

  // Fallback pour le cas où il n'y a pas de données
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div style={containerStyle}>
        <div className="text-center space-y-3 p-8">
          <div className="text-lg font-medium text-gray-500">Quiz non configuré</div>
          <div className="text-sm text-gray-400">Ajoutez des questions dans l'onglet "Jeu" pour commencer</div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
