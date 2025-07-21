
import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { textVariants } from './variants';
import { useAnimations } from './AnimationProvider';
import type { CustomText } from '../QualifioEditorLayout';
import type { TextAnimationConfig } from './types';

interface AnimatedTextProps {
  text: CustomText;
  animationConfig?: TextAnimationConfig;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  animationConfig,
  children,
  className,
  style
}) => {
  const { state } = useAnimations();
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [hasAnimated, setHasAnimated] = useState(false);

  const config = animationConfig || state.textAnimations[text.id];
  
  useEffect(() => {
    if (!config?.enabled || state.reducedMotion || !state.globalAnimationsEnabled) {
      return;
    }

    const shouldAnimate = () => {
      switch (config.trigger) {
        case 'onLoad':
          return true;
        case 'onScroll':
          return isInView;
        case 'delayed':
          return true;
        case 'manual':
          return state.isPlaying;
        default:
          return true;
      }
    };

    if (shouldAnimate() && !hasAnimated) {
      const timer = setTimeout(() => {
        controls.start('visible');
        setHasAnimated(true);
      }, config.delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [config, isInView, state.isPlaying, state.globalAnimationsEnabled, hasAnimated, controls]);

  if (!config?.enabled || state.reducedMotion || !state.globalAnimationsEnabled) {
    return <div className={className} style={style}>{children}</div>;
  }

  const variants = textVariants[config.type] || textVariants.fadeIn;

  const animationProps = {
    duration: config.duration,
    ease: config.ease || 'easeOut',
    repeat: config.repeat,
    repeatType: config.repeatType
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      animate={controls}
      transition={{
        duration: animationProps.duration,
        ease: animationProps.ease as any,
        repeat: animationProps.repeat,
        repeatType: animationProps.repeatType as any
      }}
      onHoverStart={() => {
        if (config.trigger === 'onHover') {
          controls.start('visible');
        }
      }}
      onClick={() => {
        if (config.trigger === 'onClick') {
          controls.start('visible');
        }
      }}
    >
      {config.type === 'typewriter' ? (
        <TypewriterText 
          text={typeof children === 'string' ? children : text.content}
          speed={config.typewriterSpeed || 50}
        />
      ) : (
        children
      )}
    </motion.div>
  );
};

const TypewriterText: React.FC<{ text: string; speed: number }> = ({ text, speed }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayText}</span>;
};

export default AnimatedText;
