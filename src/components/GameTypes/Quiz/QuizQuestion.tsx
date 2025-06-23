
import React from 'react';
import { motion } from 'framer-motion';

interface QuizQuestionProps {
  question: any;
  design?: any;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  design = {}
}) => {
  const questionStyle = {
    color: design.titleColor || design.textColor || '#1f2937',
    fontFamily: design.fontFamily || 'Inter, sans-serif',
    fontSize: '1.5rem',
    fontWeight: '700',
    lineHeight: '1.4'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      {/* Question image */}
      {question.image && (
        <motion.div
          className="mb-8 rounded-2xl overflow-hidden shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <img
            src={question.image}
            alt="Question illustration"
            className="w-full max-h-72 object-cover"
          />
        </motion.div>
      )}

      {/* Question text */}
      <motion.h3
        className="leading-relaxed text-center sm:text-left"
        style={questionStyle}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {question.text}
      </motion.h3>
    </motion.div>
  );
};

export default QuizQuestion;
