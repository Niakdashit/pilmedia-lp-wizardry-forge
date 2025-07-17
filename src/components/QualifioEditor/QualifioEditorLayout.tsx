
import React from 'react';

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
  gamePosition: GamePosition;
  backgroundImage?: string;
}

export interface BrandAssets {
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string;
}

export interface ScratchCard {
  content: string;
  isWinning: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface MemoryPair {
  id: string;
  image1: string;
  image2?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required: boolean;
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
  
  // Jackpot
  jackpotBackgroundColor?: string;
  jackpotBorderStyle?: string;
  
  // Scratch
  scratchCards?: ScratchCard[];
  scratchSurfaceColor?: string;
  
  // Dice
  diceWinningNumbers?: number[];
  
  // Quiz
  quizQuestions?: QuizQuestion[];
  quizPassingScore?: number;
  
  // Memory
  memoryPairs?: MemoryPair[];
  memoryGridSize?: string;
  memoryTimeLimit?: number;
  
  // Puzzle
  puzzleImage?: string;
  puzzlePieces?: number;
  puzzleTimeLimit?: number;
  puzzleShowPreview?: boolean;
  puzzleDifficulty?: 'easy' | 'medium' | 'hard';
  puzzleBackgroundColor?: string;
  
  // Form
  formFields?: FormField[];
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
  return (
    <div>
      {/* Contenu de l'éditeur Qualifio */}
    </div>
  );
};

export default QualifioEditorLayout;
