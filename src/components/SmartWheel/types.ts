
export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  textColor?: string;
  value?: any;
}

export interface CustomButton {
  text: string;
  color: string;
  textColor: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface WheelTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  effects: {
    gradient: boolean;
    shadow: boolean;
    glow: boolean;
    metallic?: boolean;
    animated?: boolean;
  };
}

export interface WheelState {
  rotation: number;
  isSpinning: boolean;
  currentSegment: WheelSegment | null;
  hasSpun: boolean;
}

export interface SmartWheelProps {
  segments: WheelSegment[];
  theme?: string;
  size?: number;
  disabled?: boolean;
  onSpin?: () => void;
  onResult?: (segment: WheelSegment) => void;
  brandColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  customButton?: CustomButton;
  borderStyle?: string;
  className?: string;
  maxSize?: number;
  buttonPosition?: 'top' | 'bottom' | 'left' | 'right';
  gamePosition?: { x: number; y: number };
  isMode1?: boolean;
  formFields?: Array<{
    id: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea';
    required: boolean;
    placeholder?: string;
  }>;
}
