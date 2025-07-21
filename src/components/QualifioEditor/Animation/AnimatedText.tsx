import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimationVariants } from './AnimationPresets';
import type { CustomText } from '../QualifioEditorLayout';

interface AnimatedTextProps {
  text: CustomText;
  children: React.ReactNode;
  isInView?: boolean;
  onAnimationComplete?: () => void;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  children,
  isInView = true,
  onAnimationComplete
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isTypewriting, setIsTypewriting] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const textRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<NodeJS.Timeout>();

  const animationConfig = text.animationConfig;

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

  // Gérer l'animation typewriter
  useEffect(() => {
    if (animationConfig?.type === 'typewriter' && shouldAnimate && !isTypewriting) {
      setIsTypewriting(true);
      setDisplayedText('');
      
      const textContent = textRef.current?.textContent || text.content;
      const speed = animationConfig.typewriterSpeed || 50;
      let currentIndex = 0;

      const typeWriter = () => {
        if (currentIndex < textContent.length) {
          setDisplayedText(textContent.slice(0, currentIndex + 1));
          currentIndex++;
          typewriterRef.current = setTimeout(typeWriter, speed);
        } else {
          setIsTypewriting(false);
          onAnimationComplete?.();
        }
      };

      typeWriter();

      return () => {
        if (typewriterRef.current) {
          clearTimeout(typewriterRef.current);
        }
      };
    }
  }, [animationConfig, shouldAnimate, text.content, onAnimationComplete, isTypewriting]);

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
  

  // Gérer les animations hover et click
  const handleMouseEnter = () => {
    if (animationConfig.trigger === 'onHover') {
      setShouldAnimate(true);
    }
  };

  const handleClick = () => {
    if (animationConfig.trigger === 'onClick') {
      setShouldAnimate(true);
    }
  };

  // Rendu spécial pour typewriter
  if (animationConfig.type === 'typewriter') {
    return (
      <motion.div
        ref={textRef}
        initial={variants.initial}
        animate={shouldAnimate ? variants.animate : variants.initial}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        onAnimationComplete={onAnimationComplete}
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          borderRight: isTypewriting ? '2px solid currentColor' : 'none'
        }}
      >
        {isTypewriting ? displayedText : children}
      </motion.div>
    );
  }

  // Rendu normal avec animations
  return (
    <AnimatePresence mode="wait">
      {shouldAnimate && (
        <motion.div
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
          onAnimationComplete={onAnimationComplete}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};