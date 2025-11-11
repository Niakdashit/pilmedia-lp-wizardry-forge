
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
  /** Callback appelé quand l'utilisateur clique sur le jackpot désactivé (pour ouvrir le formulaire) */
  onButtonClick?: () => void;
  /** Désactive le démarrage du jackpot (formulaire non validé) */
  disabled?: boolean;
  buttonLabel?: string;
  buttonColor?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  borderStyle?: string;
  slotBorderColor?: string;
  slotBorderWidth?: number;
  slotBackgroundColor?: string;
  containerBackgroundColor?: string;
  /** Symboles configurés pour le jackpot (emojis ou images) */
  symbols?: any[];
  /** Campagne complète pour accéder à la configuration */
  campaign?: any;
}

export type GameResult = 'win' | 'lose' | null;
