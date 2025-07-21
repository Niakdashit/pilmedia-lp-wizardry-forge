import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedGameContainerProps {
  children: React.ReactNode;
  gameType: string;
  isVisible?: boolean;
  onAnimationComplete?: () => void;
  device?: 'mobile' | 'tablet' | 'desktop';
}

export const AnimatedGameContainer: React.FC<AnimatedGameContainerProps> = ({
  children,
  isVisible = true,
  onAnimationComplete,
  device = 'desktop'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Délai pour permettre le chargement
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animation plus rapide sur mobile pour la performance
  const duration = device === 'mobile' ? 0.4 : 0.6;

  return (
    <AnimatePresence mode="wait">
      {isVisible && isLoaded && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration, type: "spring", stiffness: 100 }}
          onAnimationComplete={onAnimationComplete}
          style={{
            transformStyle: 'preserve-3d',
            perspective: 1000
          }}
          className="game-animation-container"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};