
import React from 'react';

interface FacilotabQuizLayoutProps {
  logoUrl?: string;
  backgroundUrl?: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  options: Array<{
    id: string | number;
    text: string;
    isCorrect?: boolean;
  }>;
  selectedAnswers: (string | number)[];
  onAnswerSelect: (optionId: string | number) => void;
  onNext: () => void;
  isNextDisabled: boolean;
  buttonText: string;
}

const FacilotabQuizLayout: React.FC<FacilotabQuizLayoutProps> = ({
  logoUrl,
  backgroundUrl,
  question,
  questionNumber,
  totalQuestions,
  options,
  selectedAnswers,
  onAnswerSelect,
  onNext,
  isNextDisabled,
  buttonText
}) => {
  return (
    <div
      className="flex items-center justify-center min-h-screen w-full"
      style={{
        backgroundImage: backgroundUrl ? `url('${backgroundUrl}')` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: backgroundUrl ? undefined : '#f8fafc'
      }}
    >
      <div className="bg-white/90 rounded-3xl shadow-xl max-w-md w-full mx-4 px-8 py-8 flex flex-col items-center">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="w-48 mb-8"
            style={{ filter: "drop-shadow(0 2px 8px #ae8ac355)" }}
          />
        )}
        
        <div className="w-full text-left">
          <div className="text-sm text-[#5a5a63] font-semibold mb-2">
            Question {questionNumber} sur {totalQuestions}
          </div>
          
          <h2 className="text-2xl font-bold text-[#5a5a63] mb-6 leading-snug">
            {question}
          </h2>
          
          <div className="flex flex-col gap-3 mb-8">
            {options.map((option, idx) => {
              const isSelected = selectedAnswers.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => onAnswerSelect(option.id)}
                  className={`flex items-center w-full border rounded-xl px-5 py-3 font-medium text-lg transition group ${
                    isSelected 
                      ? 'bg-[#ebebed] border-[#5a5a63] text-[#5a5a63]' 
                      : 'bg-[#f5f5f7] border-[#d0d0d5] text-[#44444d] hover:bg-[#ebebed]'
                  }`}
                  type="button"
                >
                  <span className={`rounded-full border-2 bg-white w-6 h-6 flex items-center justify-center mr-4 transition ${
                    isSelected 
                      ? 'border-[#5a5a63]' 
                      : 'border-[#5a5a63] group-hover:border-[#5a5a63]'
                  }`}>
                    <span className="text-xs font-bold text-[#5a5a63]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </span>
                  {option.text}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="w-full py-3 rounded-xl font-bold text-lg bg-[#ae8ac3] text-white hover:bg-[#815194] transition disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilotabQuizLayout;
