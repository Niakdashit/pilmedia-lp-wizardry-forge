
import { Variants } from 'framer-motion';
import type { AnimationType } from './types';

export const textVariants: Record<AnimationType, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slideInLeft: {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  slideInRight: {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  slideInUp: {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  slideInDown: {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  bounce: {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  },
  typewriter: {
    hidden: { width: 0 },
    visible: { width: "auto" }
  },
  pulse: {
    hidden: { scale: 1 },
    visible: { 
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5
      }
    }
  },
  rotate: {
    hidden: { rotate: 0 },
    visible: { rotate: 360 }
  },
  zoomIn: {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  },
  flipX: {
    hidden: { rotateX: -90, opacity: 0 },
    visible: { rotateX: 0, opacity: 1 }
  },
  flipY: {
    hidden: { rotateY: -90, opacity: 0 },
    visible: { rotateY: 0, opacity: 1 }
  },
  slideInScale: {
    hidden: { scale: 0.8, y: 20, opacity: 0 },
    visible: { scale: 1, y: 0, opacity: 1 }
  },
  bounceIn: {
    hidden: { scale: 0.3, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  }
};

export const gameVariants: Variants = {
  entrance: {
    hidden: { scale: 0.8, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  },
  exit: {
    visible: { scale: 1, opacity: 1, y: 0 },
    hidden: { scale: 0.9, opacity: 0, y: -20 }
  },
  feedback: {
    idle: { scale: 1 },
    success: { 
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    error: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5
      }
    }
  }
};
