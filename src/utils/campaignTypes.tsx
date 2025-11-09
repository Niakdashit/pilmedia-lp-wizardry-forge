
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

interface WheelSegment {
  id: number;
  label: string;
  color: string;
  textColor: string;
  probability: number;
}

interface WheelConfig extends BaseConfig {
  winProbability: number;
  maxWinners: number;
  winnersCount: number;
  segments: WheelSegment[];
}

interface JackpotConfig extends BaseConfig {
  symbols: string[];
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
  cards?: ScratchCard[];
}

interface ScratchCard {
  id: number;
  revealImage: string;
  revealMessage: string;
}

interface MemoryConfig extends BaseConfig {
  pairs: number;
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
  diceCount: number;
  winningConditions: number[];
}

interface SwiperConfig extends BaseConfig {
  direction: string;
}

interface FormConfig extends BaseConfig { }

interface InstantWinConfig {
  mode: "instant_winner";
  winProbability: number;
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
      buttonColor: '#44444d',
      segments: [
        {
          id: 1,
          label: 'Segment 1',
          color: '#ff6b6b',
          textColor: '#ffffff',
          probability: 50
        },
        {
          id: 2,
          label: 'Segment 2',
          color: '#4ecdc4',
          textColor: '#ffffff',
          probability: 50
        }
      ]
    },
    jackpot: {
      instantWin: {
        mode: 'instant_winner' as const,
        winProbability: 0.05,
        maxWinners: 10,
        winnersCount: 0
      },
      symbols: ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'],
      buttonLabel: 'Lancer le Jackpot',
      buttonColor: '#44444d',
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
      cards: [
        { id: 1, revealImage: '', revealMessage: 'Félicitations !' }
      ],
      buttonLabel: 'Gratter',
      buttonColor: '#44444d'
    },
    memory: {
      pairs: 8,
      difficulty: 'medium',
      timeLimit: 60,
      buttonLabel: 'Commencer',
      buttonColor: '#44444d'
    },
    puzzle: {
      pieces: 9,
      timeLimit: 300,
      buttonLabel: 'Commencer',
      buttonColor: '#44444d'
    },
    quiz: {
      questions: [],
      timePerQuestion: 30,
      buttonLabel: 'Commencer',
      buttonColor: '#44444d'
    },
    dice: {
      diceCount: 2,
      winningConditions: [7, 11],
      buttonLabel: 'Lancer les dés',
      buttonColor: '#44444d'
    },
    swiper: {
      direction: 'horizontal',
      buttonLabel: 'Swiper',
      buttonColor: '#44444d'
    },
    form: {
      buttonLabel: 'Valider',
      buttonColor: '#44444d'
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
