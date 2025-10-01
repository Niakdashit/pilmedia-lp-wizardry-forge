
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

interface QuizOptionProps {
  option: any;
  isSelected: boolean;
  isMultiple: boolean;
  onSelect: () => void;
  design?: any;
  index: number;
}

const QuizOption: React.FC<QuizOptionProps> = ({
  option,
  isSelected,
  isMultiple,
  onSelect,
  design = {},
  index
}) => {
  const optionStyle = {
    backgroundColor: isSelected 
      ? `${design.primaryColor || '#d4dbe8'}08` 
      : '#ffffff',
    borderColor: isSelected 
      ? design.primaryColor || '#d4dbe8' 
      : 'transparent',
    color: design.textColor || '#374151',
    borderRadius: '16px',
    borderWidth: '2px',
    transition: 'all 0.2s ease'
  };

  const iconColor = isSelected ? design.primaryColor || '#d4dbe8' : '#9ca3af';

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="w-full p-5 text-left transition-all duration-200 hover:shadow-xl group bg-white"
      style={optionStyle}
    >
      <div className="flex items-center space-x-4">
        {/* Selection indicator */}
        <div className="flex-shrink-0">
          {isMultiple ? (
            <div className="relative">
              {isSelected ? (
                <CheckCircle className="w-6 h-6" style={{ color: iconColor }} />
              ) : (
                <div 
                  className="w-6 h-6 border-2 rounded-md flex items-center justify-center"
                  style={{ borderColor: iconColor }}
                >
                  <div className="w-3 h-3 bg-gray-200 rounded-sm opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              {isSelected ? (
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ borderColor: iconColor }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: iconColor }} />
                </div>
              ) : (
                <Circle className="w-6 h-6" style={{ color: iconColor }} />
              )}
            </div>
          )}
        </div>

        {/* Option text */}
        <span className="flex-1 font-medium text-lg group-hover:translate-x-1 transition-transform duration-200">
          {option.text}
        </span>

        {/* Option letter */}
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
          style={{ 
            backgroundColor: isSelected ? `${design.primaryColor || '#d4dbe8'}20` : '#f3f4f6',
            color: isSelected ? design.primaryColor || '#d4dbe8' : '#6b7280'
          }}
        >
          {String.fromCharCode(65 + index)}
        </div>
      </div>
    </motion.button>
  );
};

export default QuizOption;
