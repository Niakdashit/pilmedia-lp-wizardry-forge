import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimationVariants } from './AnimationPresets';

interface AnimatedImageProps {
  image: any;
  children: React.ReactNode;
  isInView?: boolean;
  onAnimationComplete?: () => void;
}

export const AnimatedImage: React.FC<AnimatedImageProps> = ({
  image,
  children,
  isInView = true,
  onAnimationComplete
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const animationConfig = image.animationConfig;

  // Gérer les triggers d'animation
  useEffect(() => {
    if (!animationConfig?.enabled) {
      setShouldAnimate(true);
      return;
    }

    switch (animationConfig.trigger) {
      case 'onLoad':
        setShouldAnimate(true);
        break;
      case 'onScroll':
        setShouldAnimate(isInView);
        break;
      case 'delayed':
        const timer = setTimeout(() => {
          setShouldAnimate(true);
        }, (animationConfig.delay || 0) * 1000);
        return () => clearTimeout(timer);
      default:
        setShouldAnimate(true);
    }
  }, [animationConfig, isInView]);

  // Si pas d'animation configurée, rendu normal
  if (!animationConfig?.enabled) {
    return <>{children}</>;
  }

  // Obtenir les variants d'animation
  const variants = animationConfig?.enabled ? getAnimationVariants(animationConfig) : {
    initial: {},
    animate: {},
    exit: {}
  };
  

  // Variants pour les effets hover
  const combinedVariants = {
    initial: variants.initial,
    animate: variants.animate,
    exit: variants.exit,
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: { duration: 0.3 }
    }
  };

  // Gérer les animations hover et click
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (animationConfig.trigger === 'onHover') {
      setShouldAnimate(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    if (animationConfig.trigger === 'onClick') {
      setShouldAnimate(true);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {shouldAnimate && (
        <motion.div
          initial={combinedVariants.initial}
          animate={isHovered ? combinedVariants.hover : combinedVariants.animate}
          exit={combinedVariants.exit}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onAnimationComplete={onAnimationComplete}
          whileHover={{ scale: 1.02 }}
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};