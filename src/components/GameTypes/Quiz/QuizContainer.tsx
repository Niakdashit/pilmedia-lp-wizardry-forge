
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QuizQuestion from './QuizQuestion';
import QuizOption from './QuizOption';
import QuizProgress from './QuizProgress';

interface QuizContainerProps {
  config: any;
  design?: any;
  className?: string;
}

const QuizContainer: React.FC<QuizContainerProps> = ({
  config,
  design = {},
  className = ''
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | number)[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Ensure config exists and has questions
  const questions = config?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  if (!config || !questions || questions.length === 0) {
    return (
      <div className={`w-full max-w-2xl mx-auto p-4 ${className}`}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quiz non configuré</h3>
          <p className="text-gray-600">Veuillez ajouter des questions pour commencer</p>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (optionId: string | number) => {
    if (currentQuestion.type === 'multiple') {
      setSelectedAnswers(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedAnswers([optionId]);
    }
  };

  const handleNext = () => {
    // Calculer le score
    const correctAnswers = currentQuestion.options?.filter((opt: any) => opt.isCorrect) || [];
    const isCorrect = selectedAnswers.some(answer => 
      correctAnswers.some((correct: any) => correct.id === answer)
    );
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Passer à la question suivante ou afficher les résultats
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setScore(0);
    setShowResults(false);
  };

  const getContainerStyle = () => ({
    backgroundColor: design.backgroundColor || '#ffffff',
    borderColor: design.primaryColor || '#841b60',
    borderRadius: '24px',
    fontFamily: design.fontFamily || 'Inter, sans-serif'
  });

  const getButtonStyle = () => ({
    backgroundColor: design.primaryColor || '#841b60',
    color: '#ffffff',
    fontWeight: '600',
    borderRadius: '16px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer'
  });

  if (showResults) {
    return (
      <div className={`w-full max-w-2xl mx-auto px-4 ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl border-2 p-8 text-center"
          style={getContainerStyle()}
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: design.titleColor || '#1f2937' }}>
              Quiz terminé !
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Votre score : <span className="font-bold text-2xl" style={{ color: design.primaryColor || '#841b60' }}>
                {score}/{questions.length}
              </span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={getButtonStyle()}
            >
              Recommencer le quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto px-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl border-2 overflow-hidden"
        style={getContainerStyle()}
      >
        {/* Progress Bar */}
        <div className="px-8 pt-8 pb-4">
          <QuizProgress 
            current={currentQuestionIndex + 1} 
            total={questions.length}
            primaryColor={design.primaryColor || '#841b60'}
          />
        </div>

        {/* Question Content */}
        <div className="px-8 pb-8">
          <QuizQuestion 
            question={currentQuestion} 
            design={design}
          />

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options?.map((option: any, index: number) => (
              <QuizOption
                key={option.id}
                option={option}
                isSelected={selectedAnswers.includes(option.id)}
                isMultiple={currentQuestion.type === 'multiple'}
                onSelect={() => handleAnswerSelect(option.id)}
                design={design}
                index={index}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleNext}
              disabled={selectedAnswers.length === 0}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              style={{
                ...getButtonStyle(),
                opacity: selectedAnswers.length === 0 ? 0.5 : 1
              }}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Voir les résultats' : 'Question suivante'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizContainer;
