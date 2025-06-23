
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizPreview from './QuizPreview';

interface QuizProps {
  isPreview: boolean;
  config?: any;
  onFinish?: (result: { win: boolean; score?: number }) => void;
  buttonColor?: string;
  buttonLabel?: string;
  design?: any;
  className?: string;
}

const Quiz: React.FC<QuizProps> = ({ 
  isPreview = false, 
  config = {}, 
  onFinish,
  buttonColor = '#841b60',
  buttonLabel = 'Commencer le quiz',
  design = {},
  className = ''
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = config?.questions || [];

  useEffect(() => {
    if (isPreview) {
      setHasStarted(true);
    }
  }, [isPreview]);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setScore(0);
    setShowResults(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    
    // Check if answer is correct
    if (currentQuestion?.options?.[selectedAnswer]?.isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
      if (onFinish) {
        const finalScore = score + (currentQuestion?.options?.[selectedAnswer]?.isCorrect ? 1 : 0);
        onFinish({
          win: finalScore > questions.length / 2,
          score: finalScore
        });
      }
    }
  };

  const containerStyle = {
    backgroundColor: design?.backgroundColor || '#ffffff',
    borderRadius: '24px',
    fontFamily: design?.fontFamily || 'Inter, sans-serif'
  };

  if (!hasStarted && !isPreview) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`} style={containerStyle}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🧠</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Quiz Challenge
          </h3>
          
          <p className="text-gray-600 mb-8 max-w-md">
            Testez vos connaissances avec notre quiz interactif !
          </p>
          
          <button
            onClick={handleStart}
            className="px-8 py-4 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: buttonColor }}
          >
            {buttonLabel}
          </button>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`} style={containerStyle}>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quiz non configuré</h3>
          <p className="text-gray-600">Aucune question disponible</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`} style={containerStyle}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🎉</span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Quiz terminé !
          </h3>
          
          <p className="text-lg text-gray-600 mb-8">
            Votre score : <span className="font-bold text-2xl" style={{ color: buttonColor }}>
              {score}/{questions.length}
            </span>
          </p>
          
          <button
            onClick={handleStart}
            className="px-8 py-4 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: buttonColor }}
          >
            Recommencer
          </button>
        </motion.div>
      </div>
    );
  }

  // For preview mode, use QuizPreview
  if (isPreview) {
    return (
      <QuizPreview 
        config={config}
        design={design}
        className={className}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`} style={containerStyle}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: buttonColor,
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6" style={{ color: design?.titleColor || '#1f2937' }}>
              {currentQuestion?.text}
            </h3>
            
            {currentQuestion?.image && (
              <div className="mb-6">
                <img 
                  src={currentQuestion.image} 
                  alt="Question" 
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion?.options?.map((option: any, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                  selectedAnswer === index
                    ? 'border-current bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                style={{
                  borderColor: selectedAnswer === index ? buttonColor : undefined,
                  backgroundColor: selectedAnswer === index ? `${buttonColor}08` : undefined
                }}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedAnswer === index ? 'border-current' : 'border-gray-300'
                    }`}
                    style={{ borderColor: selectedAnswer === index ? buttonColor : undefined }}
                  >
                    {selectedAnswer === index && (
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: buttonColor }}
                      />
                    )}
                  </div>
                  <span className="font-medium">{option.text}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Next button */}
          <div className="flex justify-center">
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === undefined}
              className="px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 enabled:hover:shadow-lg"
              style={{ backgroundColor: buttonColor }}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
