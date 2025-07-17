
import React, { useState } from 'react';
import QualifioPreview from './QualifioPreview';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type DisplayMode = 'mode1-banner-game' | 'mode2-background';
export type GameType = 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'dice' | 'memory' | 'puzzle' | 'form';

export interface GamePosition {
  x: number;
  y: number;
  scale: number;
}

export interface DeviceConfig {
  fontSize: number;
  gamePosition?: GamePosition;
  backgroundImage?: string;
}

export interface BrandAssets {
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string;
}

export interface ScratchCard {
  id: string;
  content: string;
  isWinning: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface MemoryPair {
  id: string;
  name?: string;
  image1: string;
  image2?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface EditorConfig {
  displayMode: DisplayMode;
  gameType: GameType;
  storyText?: string;
  publisherLink?: string;
  prizeText?: string;
  customTexts?: CustomText[];
  design?: {
    customImages?: any[];
  };
  
  // Device configurations
  deviceConfig?: {
    mobile: DeviceConfig;
    tablet: DeviceConfig;
    desktop: DeviceConfig;
  };
  
  // Brand assets
  brandAssets?: BrandAssets;
  
  // Button configurations
  participateButtonText?: string;
  participateButtonColor?: string;
  participateButtonTextColor?: string;
  
  // Game-specific configurations
  borderStyle?: 'classic' | 'modern';
  
  // Background and design
  backgroundColor?: string;
  outlineColor?: string;
  
  // Footer
  footerText?: string;
  footerColor?: string;
  
  // Custom code
  customCSS?: string;
  customJS?: string;
  trackingTags?: string;
  
  // General layout
  width?: number;
  height?: number;
  gameMode?: string;
  anchor?: string;
  bannerImage?: string;
  bannerDescription?: string;
  bannerLink?: string;
  centerText?: boolean;
  centerForm?: boolean;
  centerGameZone?: boolean;
  
  // Jackpot
  jackpotBackgroundColor?: string;
  jackpotBorderStyle?: string;
  jackpotSymbols?: string[];
  jackpotWinningCombination?: string[];
  
  // Scratch
  scratchCards?: ScratchCard[];
  scratchSurfaceColor?: string;
  scratchPercentage?: number;
  
  // Dice
  diceWinningNumbers?: number[];
  diceSides?: number;
  diceColor?: string;
  diceDotColor?: string;
  
  // Quiz
  quizQuestions?: QuizQuestion[];
  quizPassingScore?: number;
  
  // Memory
  memoryPairs?: MemoryPair[];
  memoryGridSize?: string;
  memoryTimeLimit?: number;
  memoryCardBackColor?: string;
  
  // Puzzle
  puzzleImage?: string;
  puzzlePieces?: number;
  puzzleTimeLimit?: number;
  puzzleShowPreview?: boolean;
  puzzleDifficulty?: 'easy' | 'medium' | 'hard';
  puzzleBackgroundColor?: string;
  puzzleAutoShuffle?: boolean;
  
  // Form
  formFields?: FormField[];
  formTitle?: string;
  formSuccessMessage?: string;
  formShowProgress?: boolean;
  
  // Wheel
  wheelSegments?: any[];
}

export interface CustomText {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

interface QualifioEditorLayoutProps {
}

const QualifioEditorLayout: React.FC<QualifioEditorLayoutProps> = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [config, setConfig] = useState<EditorConfig>({
    displayMode: 'mode1-banner-game',
    gameType: 'wheel',
    storyText: 'Bienvenue dans notre jeu !',
    prizeText: 'Gagnez des prix fantastiques !',
    customTexts: [],
    design: {
      customImages: []
    },
    deviceConfig: {
      mobile: { fontSize: 14 },
      tablet: { fontSize: 16 },
      desktop: { fontSize: 18 }
    }
  });

  const handleConfigUpdate = (updates: Partial<EditorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Qualifio Editor</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Aperçu :</span>
              <select 
                value={selectedDevice} 
                onChange={(e) => setSelectedDevice(e.target.value as DeviceType)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              Aperçu
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Publier
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
            
            {/* Mode de display */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode d'affichage
              </label>
              <select 
                value={config.displayMode} 
                onChange={(e) => handleConfigUpdate({ displayMode: e.target.value as DisplayMode })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="mode1-banner-game">Mode 1 - Banner + Game</option>
                <option value="mode2-background">Mode 2 - Background</option>
              </select>
            </div>

            {/* Type de jeu */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de jeu
              </label>
              <select 
                value={config.gameType} 
                onChange={(e) => handleConfigUpdate({ gameType: e.target.value as GameType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="wheel">Roue de la fortune</option>
                <option value="quiz">Quiz</option>
                <option value="scratch">Carte à gratter</option>
                <option value="jackpot">Jackpot</option>
                <option value="dice">Dé</option>
                <option value="memory">Memory</option>
                <option value="puzzle">Puzzle</option>
                <option value="form">Formulaire</option>
              </select>
            </div>

            {/* Texte de story */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte de présentation
              </label>
              <textarea 
                value={config.storyText || ''} 
                onChange={(e) => handleConfigUpdate({ storyText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none"
                placeholder="Entrez votre texte de présentation..."
              />
            </div>

            {/* Texte du prix */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte du prix
              </label>
              <input 
                type="text"
                value={config.prizeText || ''} 
                onChange={(e) => handleConfigUpdate({ prizeText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Décrivez le prix à gagner..."
              />
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          <div className="p-6">
            <QualifioPreview 
              device={selectedDevice}
              config={config}
              onConfigUpdate={handleConfigUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifioEditorLayout;
