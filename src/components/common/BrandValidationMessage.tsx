
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrandTheme } from '../../hooks/useBrandTheme';

interface BrandValidationMessageProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
  className?: string;
}

const BrandValidationMessage: React.FC<BrandValidationMessageProps> = ({
  show,
  message,
  type = 'success',
  className = ""
}) => {
  const { primaryColor, secondaryColor, textColor } = useBrandTheme();

  const getMessageStyle = () => {
    if (type === 'success') {
      return {
        backgroundColor: primaryColor,
        color: textColor,
        borderColor: primaryColor
      };
    } else {
      return {
        backgroundColor: secondaryColor,
        color: textColor,
        borderColor: secondaryColor
      };
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
          style={{ position: 'absolute' }}
        >
          <div 
            className="px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center space-x-2 border"
            style={getMessageStyle()}
          >
            <span>{type === 'success' ? '✅' : '❌'}</span>
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandValidationMessage;
