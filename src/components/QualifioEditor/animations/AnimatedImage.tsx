
import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { textVariants } from './variants';
import { useAnimations } from './AnimationProvider';
import type { ImageAnimationConfig } from './types';

interface AnimatedImageProps {
  imageId: string;
  animationConfig?: ImageAnimationConfig;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedImage: React.FC<AnimatedImageProps> = ({
  imageId,
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

  const config = animationConfig || state.imageAnimations[imageId];
  
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

  const hoverVariants = config.hoverEffect ? {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  } : {};

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={{ ...variants, ...hoverVariants }}
      initial="hidden"
      animate={controls}
      whileHover={config.hoverEffect ? "hover" : undefined}
      transition={animationProps}
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
      {children}
    </motion.div>
  );
};

export default AnimatedImage;
