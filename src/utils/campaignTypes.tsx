
import { 
  Target, 
  Users, 
  HelpCircle, 
  Puzzle, 
  Brain, 
  Dice6, 
  Cookie, 
  ArrowRight, 
  FileText,
  DollarSign
} from 'lucide-react';

export type CampaignType =
  | 'wheel'
  | 'jackpot'
  | 'memory'
  | 'puzzle'
  | 'quiz'
  | 'dice'
  | 'scratch'
  | 'swiper'
  | 'form';

export interface GameConfig {
  wheel: WheelConfig;
  jackpot: JackpotConfig;
  memory: MemoryConfig;
  puzzle: PuzzleConfig;
  quiz: QuizConfig;
  dice: DiceConfig;
  scratch: ScratchConfig;
  swiper: SwiperConfig;
  form: FormConfig;
}

interface BaseConfig {
  buttonLabel: string;
  buttonColor: string;
}

interface WheelConfig extends BaseConfig {
  winProbability: number;
  maxWinners: number;
  winnersCount: number;
}

interface JackpotConfig extends BaseConfig {
  instantWin: InstantWinConfig;
  containerBackgroundColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  slotBorderColor: string;
  slotBorderWidth: number;
  slotBackgroundColor: string;
}

interface ScratchConfig extends BaseConfig {
  instantWin: InstantWinConfig;
  scratchArea: number;
  revealMessage: string;
}

interface MemoryConfig extends BaseConfig {
  difficulty: string;
  timeLimit: number;
}

interface PuzzleConfig extends BaseConfig {
  pieces: number;
  timeLimit: number;
}

interface QuizConfig extends BaseConfig {
  questions: any[];
  timePerQuestion: number;
}

interface DiceConfig extends BaseConfig {
  numberOfDice: number;
  winningCombination: string;
}

interface SwiperConfig extends BaseConfig {
  direction: string;
}

interface FormConfig extends BaseConfig { }

interface InstantWinConfig {
  mode: "instant_winner";
  winProbability: number; // entre 0 et 1
  maxWinners?: number;
  winnersCount?: number;
}

export const getDefaultGameConfig = (type: CampaignType) => {
  const configs = {
    wheel: {
      winProbability: 0.1,
      maxWinners: 10,
      winnersCount: 0,
      buttonLabel: 'Tourner',
      buttonColor: '#841b60'
    },
    jackpot: {
      instantWin: {
        mode: 'instant_winner' as const,
        winProbability: 0.05,
        maxWinners: 10,
        winnersCount: 0
      },
      buttonLabel: 'Lancer le Jackpot',
      buttonColor: '#841b60',
      containerBackgroundColor: '#1f2937',
      backgroundColor: '#c4b5fd30',
      borderColor: '#8b5cf6',
      borderWidth: 3,
      slotBorderColor: '#a78bfa',
      slotBorderWidth: 2,
      slotBackgroundColor: '#ffffff'
    },
    scratch: {
      instantWin: {
        mode: 'instant_winner' as const,
        winProbability: 0.1,
        maxWinners: 10,
        winnersCount: 0
      },
      scratchArea: 70,
      revealMessage: 'Félicitations !',
      buttonLabel: 'Gratter',
      buttonColor: '#841b60'
    },
    memory: {
      difficulty: 'medium',
      timeLimit: 60,
      buttonLabel: 'Commencer',
      buttonColor: '#841b60'
    },
    puzzle: {
      pieces: 9,
      timeLimit: 300,
      buttonLabel: 'Commencer',
      buttonColor: '#841b60'
    },
    quiz: {
      questions: [],
      timePerQuestion: 30,
      buttonLabel: 'Commencer',
      buttonColor: '#841b60'
    },
    dice: {
      numberOfDice: 2,
      winningCombination: 'double',
      buttonLabel: 'Lancer les dés',
      buttonColor: '#841b60'
    },
    swiper: {
      direction: 'horizontal',
      buttonLabel: 'Swiper',
      buttonColor: '#841b60'
    },
    form: {
      buttonLabel: 'Valider',
      buttonColor: '#841b60'
    }
  };

  return configs[type] || {};
};

export const getCampaignTypeIcon = (type: string) => {
  switch (type) {
    case 'wheel':
      return Target;
    case 'jackpot':
      return DollarSign;
    case 'memory':
      return Brain;
    case 'puzzle':
      return Puzzle;
    case 'quiz':
      return HelpCircle;
    case 'dice':
      return Dice6;
    case 'scratch':
      return Cookie;
    case 'swiper':
      return ArrowRight;
    case 'form':
      return FileText;
    case 'contest':
      return Target;
    case 'survey':
      return Users;
    default:
      return HelpCircle;
  }
};

export const getCampaignTypeText = (type: string) => {
  switch (type) {
    case 'wheel':
      return 'Roue';
    case 'jackpot':
      return 'Jackpot';
    case 'memory':
      return 'Memory';
    case 'puzzle':
      return 'Puzzle';
    case 'quiz':
      return 'Quiz';
    case 'dice':
      return 'Dés';
    case 'scratch':
      return 'Grattage';
    case 'swiper':
      return 'Swiper';
    case 'form':
      return 'Formulaire';
    case 'contest':
      return 'Concours';
    case 'survey':
      return 'Sondage';
    default:
      return 'Jeu';
  }
};
