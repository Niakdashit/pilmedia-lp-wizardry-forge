export interface CampaignDesign {
  background?: string;
  backgroundImage?: string;
  customTexts?: CustomText[];
  customImages?: CustomImage[];
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

export interface OptimizedCampaign {
  id?: string;
  name: string;
  type: 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form';
  design: CampaignDesign;
  gameConfig: GameConfig;
  buttonConfig: ButtonConfig;
  gamePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  gameSize?: 'small' | 'medium' | 'large';
  
  // Internal tracking
  _lastUpdate?: number;
  _version?: number;
  _updateId?: number;
  _initialized?: boolean;
  _loaded?: boolean;
  _error?: boolean;
  _errorMessage?: string;
}

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export interface EditorState {
  activeTab: string;
  previewDevice: PreviewDevice;
  isLoading: boolean;
  isModified: boolean;
  isSaving: boolean;
}