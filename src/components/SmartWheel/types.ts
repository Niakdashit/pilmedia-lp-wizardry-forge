export interface WheelSegment {
  id: string;
  label: string;
  value: string;
  color?: string;
  textColor?: string;
  weight?: number;
  probability?: number;
  isWinner?: boolean;
  isWinning?: boolean;
  prizeId?: string | number;
  icon?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
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
  /** When true, disables the pointer wobble/click animation */
  disablePointerAnimation?: boolean;
  onSpin?: () => void;
  onResult?: (segment: WheelSegment) => void;
  onComplete?: (prize: string) => void; // Callback quand le jeu est terminé
  onShowParticipationModal?: () => void; // Callback pour ouvrir le modal de participation au niveau supérieur
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
  customBorderColor?: string; // Couleur personnalisée pour le style de bordure classic
  customBorderWidth?: number; // Largeur personnalisée pour la bordure
  showBulbs?: boolean; // Afficher 15 petites ampoules blanches sur la bordure

  className?: string;
  maxSize?: number; // Limite la taille maximum de la roue
  buttonPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center'; // Position du bouton
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

  // Nouvelles options de spin
  spinMode?: 'random' | 'instant_winner' | 'probability';
  winProbability?: number; // Utilisé uniquement pour instant_winner
  speed?: 'slow' | 'medium' | 'fast';
}

export interface WheelState {
  isSpinning: boolean;
  rotation: number;
  targetRotation: number;
  currentSegment: WheelSegment | null;
}

