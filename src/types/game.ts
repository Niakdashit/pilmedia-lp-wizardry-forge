export interface GameResult {
  id: string;
  campaignId: string;
  userId: string;
  gameType: GameType;
  result: any;
  score?: number;
  duration?: number;
  isWinner: boolean;
  createdAt: string;
}

export interface CardItem {
  id: string;
  title: string;
  image: string;
}

export interface SwiperGameConfig {
  cards: CardItem[];
}

export interface GameConfig {
  maxWinners: number;
  winRate: number;
  currentWinners?: number;
  swiper?: SwiperGameConfig;
}

export interface BaseGameProps {
  campaignId: string;
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  className?: string;
}

export interface WheelConfig extends GameConfig {
  segments: string[];
  colors: string[];
  speed: number;
}

export interface ScratchConfig extends GameConfig {
  coverImage: string;
  revealImage: string;
  threshold: number;
}

export interface MemoryConfig extends GameConfig {
  pairs: number;
  theme: string;
  timer: boolean;
}

export interface PuzzleConfig extends GameConfig {
  image: string;
  gridSize: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DiceConfig extends GameConfig {
  diceCount: number;
  winningConditions: number[];
}

// ----------- AJOUT CONFIG JACKPOT -----------
export interface JackpotConfig extends GameConfig {
  symbols: string[];
  reels: number;
  winMessage: string;
  loseMessage: string;
  instantWin: {
    enabled: boolean;
    winProbability: number;
    maxWinners?: number;
  };
}

// ----------- AJOUT TYPE GAME "JACKPOT" -----------
export type GameType = 'wheel' | 'scratch' | 'memory' | 'puzzle' | 'dice' | 'jackpot' | 'quiz';
