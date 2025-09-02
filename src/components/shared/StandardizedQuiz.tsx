import React from 'react';

interface StandardizedQuizProps {
  campaign?: any;
  device?: string;
  shouldCropQuiz?: boolean;
  disabled?: boolean;
  getCanonicalConfig?: (options?: { device?: string; shouldCropQuiz?: boolean }) => any;
  updateQuizConfig?: (updates: any) => void;
  extractedColors?: string[];
  quizModalConfig?: any;
  onClick?: () => void;
}

const StandardizedQuiz: React.FC<StandardizedQuizProps> = ({
  campaign,
  device = 'desktop',
  shouldCropQuiz = false,
  disabled = false,
  getCanonicalConfig,
  updateQuizConfig,
  extractedColors = [],
  quizModalConfig,
  onClick
}) => {
  // Get quiz config from campaign
  const quizConfig = campaign?.gameConfig?.quiz || {
    questions: [
      {
        question: "Can you guess our new product?",
        answers: [
          { text: "Big brown bag", isCorrect: true },
          { text: "Stylish", isCorrect: false },
          { text: "Watch romantic movies", isCorrect: false }
        ]
      }
    ],
    globalTimeLimit: 30,
    showCorrectAnswer: true,
    randomizeQuestions: false
  };

  const questions = quizConfig.questions || [];
  const currentQuestion = questions[0] || {};
  const answers = currentQuestion.answers || [];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const containerStyle = {
    base: 'relative bg-white rounded-2xl overflow-hidden font-sans mx-auto',
    sizes: {
      mobile: 'w-[320px]',
      tablet: 'w-[380px]',
      desktop: 'w-[420px]'
    },
    shadow: 'shadow-[0_2px_6px_rgba(0,0,0,0.1)]',
    wrapper: 'w-full h-full flex items-center justify-center p-4'
  };

  return (
    <div className={containerStyle.wrapper}>
      <div 
        className={`${containerStyle.base} ${containerStyle.sizes[device as keyof typeof containerStyle.sizes]} ${containerStyle.shadow}`}
        style={disabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
      >
      {/* En-tête */}
      <div 
        className="bg-[#9C7A5B] text-white text-center py-5 px-6 text-lg font-medium"
        style={{ backgroundColor: '#9C7A5B' }}
      >
        {currentQuestion.question || "Question du quiz"}
      </div>
      
      {/* Options de réponse */}
      <div className="p-4">
        {answers.map((answer: any, index: number) => (
          <div 
            key={index}
            className="flex items-center border-2 border-black rounded-full py-4 px-6 mb-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onClick}
          >
            <span className="flex-shrink-0 flex items-center justify-center border-2 border-[#9C7A5B] text-[#9C7A5B] rounded-full w-9 h-9 font-bold mr-4">
              {letters[index]}
            </span>
            <span className="text-gray-900">{answer.text || `Option ${index + 1}`}</span>
          </div>
        ))}
      </div>
      
        {questions.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500">Aucune question configurée</p>
            <p className="text-sm text-gray-400 mt-1">Cliquez pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardizedQuiz;
