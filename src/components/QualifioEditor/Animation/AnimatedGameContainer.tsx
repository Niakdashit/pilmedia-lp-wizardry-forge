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
  gameType,
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

  // Variants d'animation spécifiques aux mécaniques de jeu
  const gameVariants = {
    wheel: {
      initial: { 
        scale: 0.8, 
        opacity: 0, 
        rotateY: -30 
      },
      animate: { 
        scale: 1, 
        opacity: 1, 
        rotateY: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 1.2
        }
      },
      exit: { 
        scale: 0.8, 
        opacity: 0, 
        rotateY: 30,
        transition: { duration: 0.5 }
      }
    },
    jackpot: {
      initial: { 
        y: 50, 
        opacity: 0, 
        scale: 0.9 
      },
      animate: { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 120,
          damping: 20,
          staggerChildren: 0.1
        }
      },
      exit: { 
        y: -50, 
        opacity: 0, 
        scale: 0.9,
        transition: { duration: 0.4 }
      }
    },
    scratch: {
      initial: { 
        scale: 0.7, 
        opacity: 0, 
        rotateX: -20 
      },
      animate: { 
        scale: 1, 
        opacity: 1, 
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 150,
          damping: 25,
          duration: 0.8
        }
      },
      exit: { 
        scale: 0.7, 
        opacity: 0, 
        rotateX: 20,
        transition: { duration: 0.4 }
      }
    },
    dice: {
      initial: { 
        scale: 0.5, 
        opacity: 0, 
        rotate: -180 
      },
      animate: { 
        scale: 1, 
        opacity: 1, 
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 30,
          duration: 1
        }
      },
      exit: { 
        scale: 0.5, 
        opacity: 0, 
        rotate: 180,
        transition: { duration: 0.5 }
      }
    },
    quiz: {
      initial: { 
        x: -100, 
        opacity: 0 
      },
      animate: { 
        x: 0, 
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          staggerChildren: 0.2
        }
      },
      exit: { 
        x: 100, 
        opacity: 0,
        transition: { duration: 0.3 }
      }
    },
    memory: {
      initial: { 
        scale: 0.8, 
        opacity: 0, 
        blur: 5 
      },
      animate: { 
        scale: 1, 
        opacity: 1, 
        blur: 0,
        transition: {
          type: "spring",
          stiffness: 120,
          damping: 25,
          staggerChildren: 0.1
        }
      },
      exit: { 
        scale: 0.8, 
        opacity: 0, 
        blur: 5,
        transition: { duration: 0.4 }
      }
    },
    puzzle: {
      initial: { 
        scale: 0.9, 
        opacity: 0, 
        rotateZ: 5 
      },
      animate: { 
        scale: 1, 
        opacity: 1, 
        rotateZ: 0,
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 20,
          staggerChildren: 0.05
        }
      },
      exit: { 
        scale: 0.9, 
        opacity: 0, 
        rotateZ: -5,
        transition: { duration: 0.4 }
      }
    },
    form: {
      initial: { 
        y: 30, 
        opacity: 0 
      },
      animate: { 
        y: 0, 
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          staggerChildren: 0.1
        }
      },
      exit: { 
        y: -30, 
        opacity: 0,
        transition: { duration: 0.3 }
      }
    }
  };

  // Variants par défaut si le type de jeu n'est pas trouvé
  const defaultVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.6 }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const variants = gameVariants[gameType as keyof typeof gameVariants] || defaultVariants;

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