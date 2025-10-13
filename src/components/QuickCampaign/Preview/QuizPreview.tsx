
import React from 'react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

interface QuizPreviewProps {
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    textColor?: string;
  };
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ customColors }) => {
  const { quizQuestions } = useQuickCampaignStore();
  const firstQuestion = quizQuestions[0];

  if (!firstQuestion) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full mx-auto">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quiz non configuré</h3>
          <p className="text-gray-600">Ajoutez des questions pour voir l'aperçu</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-2xl shadow-lg p-8 max-w-2xl w-full mx-auto"
      style={{ 
        backgroundColor: customColors.secondary || '#ffffff',
        border: `2px solid ${customColors.primary}` 
      }}
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question 1 sur {quizQuestions.length}</span>
          <span>Preview Mode</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: customColors.primary,
              width: `${(1 / quizQuestions.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 
          className="text-xl font-semibold mb-4"
          style={{ color: customColors.textColor || '#1f2937' }}
        >
          {firstQuestion.text}
        </h3>
        
        {firstQuestion.image && (
          <div className="mb-4">
            <img 
              src={firstQuestion.image} 
              alt="Question" 
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {firstQuestion.options?.map((option: any, index: number) => (
          <button
            key={option.id}
            className="w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]"
            style={{
              borderColor: customColors.primary,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: customColors.textColor || '#1f2937'
            }}
          >
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center"
                style={{ borderColor: customColors.primary }}
              >
                <span className="text-sm font-medium">{String.fromCharCode(65 + index)}</span>
              </div>
              {option.text}
            </div>
          </button>
        ))}
      </div>

      {/* Submit button */}
      <button
        className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:opacity-90"
        style={{
          backgroundColor: customColors.accent || customColors.primary,
          color: customColors.primary === '#ffffff' ? '#000000' : '#ffffff'
        }}
      >
        Question suivante
      </button>
    </div>
  );
};

export default QuizPreview;
