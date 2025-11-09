
import React, { useState, useEffect } from 'react';
import FacilotabQuizLayout from './FacilotabQuizLayout';
import QuizResults from './QuizResults';
import { createEnhancedQuizDesign } from '../../../utils/quizConfigSync';

interface CustomQuizGameProps {
  config: any;
  design?: any;
  onGameComplete?: (result: any) => void;
  logoUrl?: string;
  backgroundUrl?: string;
}

const CustomQuizGame: React.FC<CustomQuizGameProps> = ({
  config,
  design = {},
  onGameComplete,
  logoUrl,
  backgroundUrl
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = config?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Utiliser le nouveau système de synchronisation
  const enhancedDesign = createEnhancedQuizDesign({ design });

  useEffect(() => {
    if (currentQuestion?.timeLimit && currentQuestion.timeLimit > 0) {
      const timer = setInterval(() => {
        handleNextQuestion();
      }, currentQuestion.timeLimit * 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (optionId: string | number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: [optionId]
    });
  };

  const calculateCurrentScore = () => {
    let currentScore = 0;
    for (let i = 0; i <= currentQuestionIndex; i++) {
      const question = questions[i];
      const userAnswers = selectedAnswers[i] || [];
      const correctAnswers = question?.options
        ?.filter((opt: any) => opt.isCorrect)
        ?.map((opt: any) => opt.id) || [];
      
      if (JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort())) {
        currentScore++;
      }
    }
    return currentScore;
  };

  const handleNextQuestion = () => {
    const newScore = calculateCurrentScore();
    setScore(newScore);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
      if (onGameComplete) {
        onGameComplete({ score: newScore, total: questions.length });
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (!currentQuestion && !showResults) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white/90 rounded-3xl shadow-xl max-w-md w-full mx-4 px-8 py-8 text-center">
          <p className="text-lg text-[#5a5a63]">
            Aucune question configurée
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white/90 rounded-3xl shadow-xl max-w-md w-full mx-4 px-8 py-8">
          <QuizResults
            score={score}
            totalQuestions={questions.length}
            design={enhancedDesign}
            onRestart={handleRestart}
          />
        </div>
      </div>
    );
  }

  const currentAnswers = selectedAnswers[currentQuestionIndex] || [];

  return (
    <FacilotabQuizLayout
      logoUrl={logoUrl}
      backgroundUrl={backgroundUrl}
      question={currentQuestion.text}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={questions.length}
      options={currentQuestion.options || []}
      selectedAnswers={currentAnswers}
      onAnswerSelect={handleAnswerSelect}
      onNext={handleNextQuestion}
      isNextDisabled={currentAnswers.length === 0}
      buttonText={currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
    />
  );
};

export default CustomQuizGame;
