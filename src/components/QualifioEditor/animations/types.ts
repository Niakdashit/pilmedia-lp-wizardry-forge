
export type AnimationType = 
  | 'fadeIn' 
  | 'slideInLeft' 
  | 'slideInRight' 
  | 'slideInUp' 
  | 'slideInDown' 
  | 'bounce' 
  | 'typewriter' 
  | 'pulse' 
  | 'rotate'
  | 'zoomIn'
  | 'flipX'
  | 'flipY'
  | 'slideInScale'
  | 'bounceIn';

export type AnimationTrigger = 
  | 'onLoad' 
  | 'onScroll' 
  | 'onClick' 
  | 'onHover' 
  | 'delayed'
  | 'manual';

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay: number;
  trigger: AnimationTrigger;
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  ease?: string;
  enabled: boolean;
}

export interface TextAnimationConfig extends AnimationConfig {
  typewriterSpeed?: number;
  stagger?: number;
}

export interface ImageAnimationConfig extends AnimationConfig {
  scale?: number;
  rotation?: number;
  parallax?: boolean;
  hoverEffect?: boolean;
}

export interface GameAnimationConfig {
  entrance: AnimationConfig;
  exit: AnimationConfig;
  feedback: AnimationConfig;
  transition: AnimationConfig;
}
