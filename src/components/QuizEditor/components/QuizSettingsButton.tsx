import React from 'react';
interface QuizSettingsButtonProps {
  onClick: () => void;
}

const QuizSettingsButton: React.FC<QuizSettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
      title="Configuration du quiz"
    >
      <div className="w-5 h-5 text-white">?</div>
    </button>
  );
};

export default QuizSettingsButton;
