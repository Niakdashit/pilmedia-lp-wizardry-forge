export interface AnimationPreset {
  id: string;
  name: string;
  type: string;
  duration: number;
  delay: number;
  ease: string;
  trigger: string;
  description: string;
  variants: {
    initial: any;
    animate: any;
    exit?: any;
  };
}

export const animationPresets: AnimationPreset[] = [
  {
    id: 'fadeIn',
    name: 'Apparition en fondu',
    type: 'fadeIn',
    duration: 0.6,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Apparition douce avec effet de fondu',
    variants: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  },
  {
    id: 'slideInLeft',
    name: 'Glissement depuis la gauche',
    type: 'slideInLeft',
    duration: 0.8,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Entrée par glissement depuis la gauche',
    variants: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 }
    }
  },
  {
    id: 'slideInRight',
    name: 'Glissement depuis la droite',
    type: 'slideInRight',
    duration: 0.8,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Entrée par glissement depuis la droite',
    variants: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 }
    }
  },
  {
    id: 'slideInUp',
    name: 'Glissement depuis le bas',
    type: 'slideInUp',
    duration: 0.8,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Entrée par glissement depuis le bas',
    variants: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 }
    }
  },
  {
    id: 'slideInDown',
    name: 'Glissement depuis le haut',
    type: 'slideInDown',
    duration: 0.8,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Entrée par glissement depuis le haut',
    variants: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 }
    }
  },
  {
    id: 'bounce',
    name: 'Rebond',
    type: 'bounce',
    duration: 1.2,
    delay: 0,
    ease: 'easeInOut',
    trigger: 'onLoad',
    description: 'Effet de rebond énergique',
    variants: {
      initial: { scale: 0, opacity: 0 },
      animate: { 
        scale: [0, 1.2, 1], 
        opacity: 1,
        transition: {
          scale: { times: [0, 0.6, 1], type: "spring", stiffness: 300, damping: 10 }
        }
      },
      exit: { scale: 0, opacity: 0 }
    }
  },
  {
    id: 'zoomIn',
    name: 'Zoom avant',
    type: 'zoomIn',
    duration: 0.6,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Apparition par zoom avant',
    variants: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 }
    }
  },
  {
    id: 'pulse',
    name: 'Pulsation',
    type: 'pulse',
    duration: 2,
    delay: 0,
    ease: 'easeInOut',
    trigger: 'onLoad',
    description: 'Effet de pulsation continue',
    variants: {
      initial: { scale: 1 },
      animate: { 
        scale: [1, 1.05, 1],
        transition: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }
    }
  },
  {
    id: 'rotate',
    name: 'Rotation',
    type: 'rotate',
    duration: 0.8,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Apparition avec rotation',
    variants: {
      initial: { rotate: -180, opacity: 0 },
      animate: { rotate: 0, opacity: 1 },
      exit: { rotate: 180, opacity: 0 }
    }
  },
  {
    id: 'flipX',
    name: 'Retournement horizontal',
    type: 'flipX',
    duration: 0.8,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Retournement sur l\'axe horizontal',
    variants: {
      initial: { rotateY: -90, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 },
      exit: { rotateY: 90, opacity: 0 }
    }
  },
  {
    id: 'flipY',
    name: 'Retournement vertical',
    type: 'flipY',
    duration: 0.8,
    delay: 0,
    ease: 'easeOut',
    trigger: 'onLoad',
    description: 'Retournement sur l\'axe vertical',
    variants: {
      initial: { rotateX: -90, opacity: 0 },
      animate: { rotateX: 0, opacity: 1 },
      exit: { rotateX: 90, opacity: 0 }
    }
  },
  {
    id: 'typewriter',
    name: 'Machine à écrire',
    type: 'typewriter',
    duration: 2,
    delay: 0,
    ease: 'linear',
    trigger: 'onLoad',
    description: 'Effet de frappe à la machine',
    variants: {
      initial: { width: 0 },
      animate: { width: "auto" }
    }
  }
];

export const getAnimationPreset = (type: string): AnimationPreset | undefined => {
  return animationPresets.find(preset => preset.type === type);
};

export const getAnimationVariants = (animationConfig: any) => {
  const preset = getAnimationPreset(animationConfig.type);
  if (!preset) return {};

  const duration = animationConfig.duration || preset.duration;
  const delay = animationConfig.delay || preset.delay;
  const ease = animationConfig.ease || preset.ease;

  return {
    initial: preset.variants.initial,
    animate: {
      ...preset.variants.animate,
      transition: {
        duration,
        delay,
        ease,
        ...preset.variants.animate.transition
      }
    },
    exit: preset.variants.exit
  };
};