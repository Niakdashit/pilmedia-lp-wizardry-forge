/**
 * Configuration unifiée pour tous les types de jeux
 * Remplace wheelModalConfig et quizModalConfig
 */

export type GameType = 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'form' | 'dice';

export interface WheelConfig {
  extractedColors?: string[];
  segments?: any[];
  prizes?: any[];
  spinDuration?: number;
  [key: string]: any;
}

export interface QuizConfig {
  questions?: any[];
  theme?: string;
  [key: string]: any;
}

export interface ScratchConfig {
  cards?: any[];
  revealThreshold?: number;
  brushSize?: number;
  [key: string]: any;
}

export interface JackpotConfig {
  symbols?: string[];
  winProbability?: number;
  buttonColor?: string;
  [key: string]: any;
}

export interface GameModalConfig {
  type: GameType;
  extractedColors?: string[];
  
  // Config spécifique selon le type
  wheelConfig?: WheelConfig;
  quizConfig?: QuizConfig;
  scratchConfig?: ScratchConfig;
  jackpotConfig?: JackpotConfig;
  
  // Données communes
  formValidated?: boolean;
  isPreview?: boolean;
  
  // Pour rétro-compatibilité (à supprimer plus tard)
  [key: string]: any;
}

/**
 * Helper pour créer un config depuis wheelModalConfig (rétro-compatibilité)
 */
export const createGameConfigFromWheel = (wheelConfig: any): GameModalConfig => {
  return {
    type: 'wheel',
    extractedColors: wheelConfig?.extractedColors,
    wheelConfig: wheelConfig,
  };
};

/**
 * Helper pour créer un config depuis quizModalConfig (rétro-compatibilité)
 */
export const createGameConfigFromQuiz = (quizConfig: any, gameType: 'quiz' | 'scratch' | 'jackpot' = 'quiz'): GameModalConfig => {
  return {
    type: gameType,
    extractedColors: quizConfig?.extractedColors,
    quizConfig: quizConfig,
  };
};
