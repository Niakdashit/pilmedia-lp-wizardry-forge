
import React from 'react';
import { motion } from 'framer-motion';

interface QuizProgressProps {
  current: number;
  total: number;
  primaryColor?: string;
}

const QuizProgress: React.FC<QuizProgressProps> = ({ 
  current, 
  total, 
  primaryColor = '#841b60' 
}) => {
  const progressPercentage = (current / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-600">
          Question {current} sur {total}
        </span>
        <span className="text-sm font-medium text-gray-500">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div 
          className="h-full rounded-full"
          style={{ backgroundColor: primaryColor }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default QuizProgress;
