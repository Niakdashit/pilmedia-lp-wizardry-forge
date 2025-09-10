// @ts-nocheck
import { Settings, HelpCircle } from 'lucide-react';

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
      <HelpCircle className="w-5 h-5" />
    </button>
  );
};

export default QuizSettingsButton;
