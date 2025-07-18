
export interface WheelSegment {
  id: string;
  label: string;
  value?: string;
  color?: string;
  textColor?: string;
  icon?: string;
  probability?: number;
}

export interface WheelTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    border: string;
    text: string;
  };
  effects: {
    gradient: boolean;
    glow: boolean;
    shadow: boolean;
    metallic: boolean;
  };
  animation: {
    duration: number;
    easing: string;
    particles: boolean;
  };
}

export interface SmartWheelProps {
  segments: WheelSegment[];
  theme?: WheelTheme | string;
  size?: number;
  disabled?: boolean;
  onSpin?: () => void;
  onResult?: (segment: WheelSegment) => void;
  brandColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  customButton?: {
    text: string;
    color: string;
    textColor: string;
  };
  borderStyle?: string; // Nouveau prop pour le style de bordure
  className?: string;
  maxSize?: number; // Limite la taille maximum de la roue
  buttonPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center'; // Position du bouton (ajout de 'center')
  gamePosition?: { x: number; y: number; scale: number }; // Position du jeu pour auto-repositionnement
  isMode1?: boolean; // Mode 1 (normal) ou Mode 2 (avec formulaire)
  formFields?: Array<{
    id: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>; // Champs de formulaire personnalisés pour le mode 2
}

export interface WheelState {
  isSpinning: boolean;
  rotation: number;
  targetRotation: number;
  currentSegment: WheelSegment | null;
}
