
import type { TextAnimationConfig, ImageAnimationConfig } from './types';

export const textAnimationPresets: Record<string, Partial<TextAnimationConfig>> = {
  'Apparition simple': {
    type: 'fadeIn',
    duration: 0.6,
    delay: 0,
    trigger: 'onLoad',
    enabled: true
  },
  'Entrée par la gauche': {
    type: 'slideInLeft',
    duration: 0.8,
    delay: 0.2,
    trigger: 'onLoad',
    enabled: true
  },
  'Rebond': {
    type: 'bounce',
    duration: 0.8,
    delay: 0,
    trigger: 'onLoad',
    enabled: true
  },
  'Machine à écrire': {
    type: 'typewriter',
    duration: 2,
    delay: 0.5,
    trigger: 'onLoad',
    typewriterSpeed: 80,
    enabled: true
  },
  'Pulsation': {
    type: 'pulse',
    duration: 1.5,
    delay: 0,
    trigger: 'onLoad',
    repeat: Infinity,
    enabled: true
  },
  'Zoom avant': {
    type: 'zoomIn',
    duration: 0.6,
    delay: 0,
    trigger: 'onScroll',
    enabled: true
  }
};

export const imageAnimationPresets: Record<string, Partial<ImageAnimationConfig>> = {
  'Apparition douce': {
    type: 'fadeIn',
    duration: 0.8,
    delay: 0,
    trigger: 'onLoad',
    enabled: true
  },
  'Zoom spectaculaire': {
    type: 'zoomIn',
    duration: 1,
    delay: 0.3,
    trigger: 'onLoad',
    enabled: true
  },
  'Retournement X': {
    type: 'flipX',
    duration: 0.8,
    delay: 0,
    trigger: 'onLoad',
    enabled: true
  },
  'Rebond énergique': {
    type: 'bounceIn',
    duration: 1,
    delay: 0,
    trigger: 'onLoad',
    enabled: true
  },
  'Glissé avec effet': {
    type: 'slideInScale',
    duration: 0.8,
    delay: 0.2,
    trigger: 'onScroll',
    hoverEffect: true,
    enabled: true
  },
  'Effet parallax': {
    type: 'slideInUp',
    duration: 1.2,
    delay: 0,
    trigger: 'onScroll',
    parallax: true,
    enabled: true
  }
};

export const gameAnimationPresets = {
  'Entrée fluide': {
    entrance: {
      type: 'slideInUp' as const,
      duration: 0.8,
      delay: 0,
      trigger: 'onLoad' as const,
      enabled: true
    },
    exit: {
      type: 'fadeIn' as const,
      duration: 0.5,
      delay: 0,
      trigger: 'manual' as const,
      enabled: true
    }
  },
  'Entrée dynamique': {
    entrance: {
      type: 'bounceIn' as const,
      duration: 1,
      delay: 0.2,
      trigger: 'onLoad' as const,
      enabled: true
    },
    exit: {
      type: 'zoomIn' as const,
      duration: 0.6,
      delay: 0,
      trigger: 'manual' as const,
      enabled: true
    }
  }
};
