
export interface BrandConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  shadow?: string;
}

export interface ScratchCardState {
  isScratching: boolean;
  scratchPercentage: number;
  isCompleted: boolean;
  hasStarted: boolean;
}

export interface ScratchCardProps {
  width?: number;
  height?: number;
  scratchColor?: string;
  revealContent: React.ReactNode;
  onComplete?: (percentage: number) => void;
  threshold?: number;
  brushSize?: number;
  disabled?: boolean;
  showProgress?: boolean;
  animationDuration?: number;
  brandConfig?: BrandConfig;
  className?: string;
}

export interface ScratchCanvasHookProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scratchColor: string;
  brushSize: number;
  threshold: number;
  onComplete: (percentage: number) => void;
}

export interface RevealContentProps {
  type: 'win' | 'lose' | 'custom';
  title?: string;
  message?: string;
  image?: string;
  customContent?: React.ReactNode;
  brandConfig?: BrandConfig;
}
