
export interface JackpotInstantWinConfig {
  mode: 'instant_winner';
  winProbability: number;
  maxWinners?: number;
  winnersCount?: number;
}

export interface JackpotProps {
  isPreview?: boolean;
  instantWinConfig?: JackpotInstantWinConfig;
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  /** Désactive le démarrage du jackpot (formulaire non validé) */
  disabled?: boolean;
  buttonLabel?: string;
  buttonColor?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  borderStyle?: string;
  borderColor?: string;
  borderWidth?: number;
  slotBorderColor?: string;
  slotBorderWidth?: number;
  slotBackgroundColor?: string;
  containerBackgroundColor?: string;
}

export type GameResult = 'win' | 'lose' | null;
