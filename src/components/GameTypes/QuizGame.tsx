
import React, { useState, useEffect } from 'react';
import QuizContainer from './Quiz/QuizContainer';
import { createEnhancedQuizDesign } from '../../utils/quizConfigSync';

interface QuizGameProps {
  config: any;
  design?: any;
  onGameComplete?: (result: any) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({
  config,
  design = {},
  onGameComplete
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

  const handleAnswerSelect = (optionId: string, isMultiple: boolean) => {
    if (isMultiple) {
      const current = selectedAnswers[currentQuestionIndex] || [];
      const updated = current.includes(optionId)
        ? current.filter((id: string) => id !== optionId)
        : [...current, optionId];
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestionIndex]: updated
      });
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestionIndex]: [optionId]
      });
    }
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
      <div className="w-full max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quiz non configuré</h3>
          <p className="text-gray-600">Veuillez ajouter des questions pour commencer</p>
        </div>
      </div>
    );
  }

  // Use QuizContainer directly instead of wrapping it
  return (
    <QuizContainer 
      config={config}
      design={enhancedDesign}
      className="max-w-2xl mx-auto"
    />
  );
};

export default QuizGame;
