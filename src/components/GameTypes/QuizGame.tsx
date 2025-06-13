import React, { useState } from 'react';
import { useGameResult } from '../../hooks/useGameResult';

interface QuizGameProps {
  campaignId: string;
  config: any;
}

const QuizGame: React.FC<QuizGameProps> = ({ campaignId, config = {} }) => {
  const questions = config.questions || [];
  const { checkWinningCondition, saveResult } = useGameResult(campaignId, config);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleAnswer = async (index: number) => {
    const newAnswers = [...answers, index];
    if (current + 1 < questions.length) {
      setAnswers(newAnswers);
      setCurrent(current + 1);
    } else {
      const finalAnswers = newAnswers;
      const score = questions.reduce((acc: number, q: any, i: number) => {
        const option = q.options?.[finalAnswers[i]];
        return acc + (option && option.isCorrect ? 1 : 0);
      }, 0);
      const isWinner = await checkWinningCondition();
      await saveResult({
        campaignId,
        userId: 'anonymous',
        gameType: 'quiz',
        result: finalAnswers,
        score,
        isWinner,
      });
      setAnswers(finalAnswers);
      setCompleted(true);
    }
  };

  if (completed) {
    return <div className="text-center p-4">Merci d\'avoir participé !</div>;
  }

  const question = questions[current];
  if (!question) {
    return <div className="text-center p-4">Aucune question configurée</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.text}</h3>
      {question.options?.map((option: any, idx: number) => (
        <button
          key={option.id}
          onClick={() => handleAnswer(idx)}
          className="block w-full px-4 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f]"
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};

export default QuizGame;
