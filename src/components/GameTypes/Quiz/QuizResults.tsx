
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  design?: any;
  onRestart?: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  design = {},
  onRestart
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  React.useEffect(() => {
    if (percentage >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [percentage]);

  const getResultMessage = () => {
    if (percentage >= 90) return { text: "Exceptionnel !", icon: Trophy, color: "#fbbf24" };
    if (percentage >= 80) return { text: "Excellent !", icon: Star, color: "#10b981" };
    if (percentage >= 60) return { text: "Bien joué !", icon: Target, color: "#3b82f6" };
    return { text: "Continuez vos efforts !", icon: Sparkles, color: "#8b5cf6" };
  };

  const result = getResultMessage();
  const ResultIcon = result.icon;

  const resultStyle = {
    backgroundColor: design.containerBackgroundColor || '#ffffff',
    color: design.textColor || '#1f2937'
  };

  const buttonStyle = {
    backgroundColor: design.primaryColor || '#E0004D',
    color: design.buttonTextColor || '#ffffff',
    borderRadius: design.borderRadius || '12px'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center p-8 space-y-6"
      style={resultStyle}
    >
      {/* Result icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${result.color}20` }}
        >
          <ResultIcon className="w-10 h-10" style={{ color: result.color }} />
        </div>
      </motion.div>

      {/* Result message */}
      <motion.h3
        className="text-3xl font-bold"
        style={{ color: result.color }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {result.text}
      </motion.h3>

      {/* Score display */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-5xl font-bold" style={{ color: design.primaryColor || '#E0004D' }}>
          {score}/{totalQuestions}
        </div>
        <div className="text-xl" style={{ color: design.textColor || '#6b7280' }}>
          {percentage}% de réussite
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="w-full max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: result.color }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Restart button */}
      {onRestart && (
        <motion.button
          onClick={onRestart}
          className="px-8 py-3 font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
          style={buttonStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Recommencer le quiz
        </motion.button>
      )}
    </motion.div>
  );
};

export default QuizResults;
