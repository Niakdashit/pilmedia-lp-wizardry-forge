export interface CampaignDesign {
  background?: string;
  backgroundImage?: string;
  customTexts?: CustomText[];
  customImages?: CustomImage[];
  
  // Wheel specific design properties
  wheelBorderStyle?: string;
  wheelConfig?: {
    borderColor?: string;
    scale?: number;
    borderStyle?: string;
    borderWidth?: number;
  };
  
  // Brand colors
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  
  // Design colors
  primaryColor?: string;
  secondaryColor?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  
  // Logo
  logoUrl?: string;
  
  // Mobile specific
  mobileBackgroundImage?: string;
  
  // Quiz specific design configuration (optional)
  quizConfig?: {
    templateId?: string;
    style?: {
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string | number;
    };
  };
}

export interface CustomText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: string;
  color: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface CustomImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  alt?: string;
  rotation?: number;
  deviceConfig?: {
    mobile?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    };
  };
}

export interface ButtonConfig {
  text?: string;
  color?: string;
  textColor?: string;
  borderRadius?: string;
  fontSize?: string;
}

export interface GameConfig {
  wheel?: WheelConfig;
  scratch?: ScratchConfig;
  jackpot?: JackpotConfig;
  quiz?: QuizConfig;
  dice?: DiceConfig;
  memory?: MemoryConfig;
  puzzle?: PuzzleConfig;
  form?: FormConfig;
}

export interface WheelConfig {
  segments?: WheelSegment[];
  winProbability?: number;
  maxWinners?: number;
  buttonLabel?: string;
  buttonColor?: string;
}

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  probability: number;
  isWinning?: boolean;
}

export interface ScratchConfig {
  cards?: ScratchCard[];
  buttonLabel?: string;
  buttonColor?: string;
}

export interface ScratchCard {
  id: string;
  content: string;
  isWinning: boolean;
}

export interface ScratchResultMessages {
  winner: {
    title: string;
    message: string;
    subMessage?: string;
    buttonText: string;
    buttonAction: 'replay' | 'close' | 'redirect';
    redirectUrl?: string;
    showPrizeImage: boolean;
  };
  loser: {
    title: string;
    message: string;
    subMessage?: string;
    buttonText: string;
    buttonAction: 'replay' | 'close' | 'redirect';
    redirectUrl?: string;
  };
}

export interface JackpotConfig {
  symbols?: string[];
  winningCombination?: string[];
  buttonLabel?: string;
  buttonColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface QuizConfig {
  questions?: QuizQuestion[];
  passingScore?: number;
  buttonLabel?: string;
  buttonColor?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface DiceConfig {
  sides?: number;
  winningNumbers?: number[];
  buttonLabel?: string;
  buttonColor?: string;
}

export interface MemoryConfig {
  cards?: MemoryCard[];
  buttonLabel?: string;
  buttonColor?: string;
}

export interface MemoryCard {
  id: string;
  content: string;
  isMatched?: boolean;
}

export interface PuzzleConfig {
  pieces?: PuzzlePiece[];
  buttonLabel?: string;
  buttonColor?: string;
}

export interface PuzzlePiece {
  id: string;
  position: { x: number; y: number };
  correctPosition: { x: number; y: number };
}

export interface FormConfig {
  fields?: FormField[];
  buttonLabel?: string;
  buttonColor?: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select';
  label: string;
  required?: boolean;
  options?: string[];
}

export interface MobileConfig {
  gamePosition?: 'left' | 'right' | 'center' | 'top' | 'bottom';
  gameVerticalOffset?: number;
  gameHorizontalOffset?: number;
  screenBackground?: string;
  contentLayout?: string;
  buttonPosition?: string;
  hideLaunchButton?: boolean;
  
  // Visual properties
  backgroundImage?: string;
  backgroundMode?: string;
  backgroundColor?: string;
  logoOverlay?: string;
  logoPosition?: string;
  decorativeOverlay?: string;
  
  // Game placement properties
  gameVerticalAlign?: string;
  fullscreenGame?: boolean;
  gameMaxWidth?: number;
  gameMaxHeight?: number;
  gamePaddingX?: number;
  gamePaddingY?: number;
  customTemplate?: string;
  autoResize?: boolean;
  
  // Content display properties
  showTitle?: boolean;
  showDescription?: boolean;
  
  // Text content properties
  title?: string;
  description?: string;
  fontFamily?: string;
  
  // Title styling
  titleColor?: string;
  titleSize?: string;
  titleWeight?: string;
  titleAlignment?: string;
  
  // Description styling
  descriptionColor?: string;
  descriptionSize?: string;
  descriptionAlignment?: string;
  
  // Button properties
  buttonPlacement?: string;
  horizontalPadding?: number;
  buttonSize?: 'small' | 'medium' | 'large';
  buttonWidth?: number;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonShape?: string;
  buttonShadow?: string;
  buttonText?: string;
  buttonActionType?: string;
  buttonLink?: string;
  buttonMargin?: number;
  buttonHoverEffect?: boolean;
  
  // Layout properties
  textPosition?: string;
  verticalSpacing?: number;
  
  buttonStyle?: {
    backgroundColor?: string;
    color?: string;
    borderRadius?: string;
  };
  textStyles?: {
    title?: {
      fontSize?: string;
      color?: string;
      fontWeight?: string;
    };
    subtitle?: {
      fontSize?: string;
      color?: string;
    };
  };
  contrastBackground?: {
    enabled?: boolean;
    color?: string;
    opacity?: number;
    padding?: number;
    borderRadius?: number;
    applyToGame?: boolean;
  };
}

export interface MobileElement {
  id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  deviceConfig?: {
    mobile?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    };
  };
}

export interface OptimizedCampaign {
  id?: string;
  name: string;
  description?: string;
  type: 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form' | 'memory' | 'puzzle';
  design: CampaignDesign;
  gameConfig: GameConfig;
  buttonConfig: ButtonConfig;
  gamePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  gameSize?: 'small' | 'medium' | 'large';
  
  // Editor mode (Article vs Fullscreen)
  editorMode?: 'fullscreen' | 'article';
  
  // Article mode configuration
  articleConfig?: {
    banner?: {
      imageUrl?: string;
      aspectRatio?: '2215/1536' | '1500/744';
      alt?: string;
      mobileImageUrl?: string;
    };
    content?: {
      title?: string;
      description?: string;
      titleStyle?: {
        fontSize?: string;
        fontWeight?: string;
        color?: string;
        fontFamily?: string;
        textAlign?: 'left' | 'center' | 'right';
      };
      descriptionStyle?: {
        fontSize?: string;
        color?: string;
        fontFamily?: string;
        textAlign?: 'left' | 'center' | 'right';
        lineHeight?: string;
      };
    };
    cta?: {
      text?: string;
      variant?: 'primary' | 'secondary' | 'outline';
      size?: 'small' | 'medium' | 'large';
      icon?: 'arrow' | 'external' | 'play' | 'none';
      action?: 'next-step' | 'external-link' | 'custom';
      href?: string;
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string;
      borderColor?: string;
    };
    funnelFlow?: {
      steps?: ('article' | 'form' | 'game' | 'result')[];
      formStep?: {
        enabled: boolean;
        position: 'before-game' | 'after-game';
      };
      gameStep?: {
        enabled: boolean;
        type?: 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'memory' | 'puzzle';
      };
      resultStep?: {
        enabled: boolean;
      };
    };
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontFamily?: string;
      headingFontFamily?: string;
      containerPadding?: string;
      sectionSpacing?: string;
      borderRadius?: string;
      backgroundColor?: string;
      backgroundImage?: string;
    };
  };
  
  // Article layout dimensions (810x1200 fixed)
  articleLayout?: {
    width: number;
    height: number;
    maxWidth?: number;
  };
  
  // Campaign settings
  rewards?: {
    enabled?: boolean;
    type?: string;
    value?: string;
    mode?: string;
    probability?: number;
  };
  previewEnabled?: boolean;
  accessibility?: {
    enabled?: boolean;
    features?: string[];
    highContrast?: boolean;
  };
  analytics?: {
    enabled?: boolean;
    trackingId?: string;
    gaId?: string;
  };
  
  // Mobile configuration
  config?: {
    mobileConfig?: MobileConfig;
  };
  mobileConfig?: MobileConfig;
  
  // Scratch card result messages
  scratchResultMessages?: ScratchResultMessages;
  
  // Scratch card configuration
  scratchConfig?: any;
  
  // Internal tracking
  _lastUpdate?: number;
  _version?: number;
  _updateId?: number;
  _initialized?: boolean;
  _loaded?: boolean;
  _error?: boolean;
  _errorMessage?: string;
  
  // Form and canvas configuration
  formFields?: any[];
  canvasConfig?: any;
}

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export interface EditorState {
  activeTab: string;
  previewDevice: PreviewDevice;
  isLoading: boolean;
  isModified: boolean;
  isSaving: boolean;
}