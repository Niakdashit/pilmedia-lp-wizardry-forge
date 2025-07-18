
import React, { useState } from 'react';
import { DeviceSelector } from './Controls/DeviceSelector';
import { Sidebar } from './Sidebar/Sidebar';
import { Preview } from './Preview/Preview';

export interface BrandAssets {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logo?: string;
}

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  textColor?: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface DeviceConfig {
  desktop?: {
    gamePosition?: { x: number; y: number; scale: number };
    backgroundImage?: string;
  };
  tablet?: {
    gamePosition?: { x: number; y: number; scale: number };
    backgroundImage?: string;
  };
  mobile?: {
    gamePosition?: { x: number; y: number; scale: number };
    backgroundImage?: string;
  };
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

export interface CustomImage {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  device: DeviceType;
}

export interface EditorConfig {
  // Paramètres de base
  borderStyle?: string;
  participateButtonText?: string;
  participateButtonColor?: string;
  participateButtonTextColor?: string;
  wheelButtonPosition?: 'bottom' | 'center';
  
  // Type de jeu
  gameType?: 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'dice' | 'memory' | 'puzzle' | 'form';
  
  // Contenu textuel
  storyText?: string;
  publisherLink?: string;
  prizeText?: string;
  
  // Couleurs et design
  backgroundColor?: string;
  
  // Ressources de marque
  brandAssets?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logo?: string;
  };
  
  // Configuration des segments de roue
  wheelSegments?: Array<{
    id: string;
    label: string;
    color: string;
    textColor?: string;
  }>;
  
  // Champs de formulaire
  formFields?: Array<{
    id: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
  
  // Configuration par appareil
  deviceConfig?: {
    desktop?: {
      gamePosition?: { x: number; y: number; scale: number };
      backgroundImage?: string;
    };
    tablet?: {
      gamePosition?: { x: number; y: number; scale: number };
      backgroundImage?: string;
    };
    mobile?: {
      gamePosition?: { x: number; y: number; scale: number };
      backgroundImage?: string;
    };
  };
  
  // Configuration Jackpot
  jackpotBackgroundColor?: string;
  jackpotBorderStyle?: string;
  
  // Configuration Scratch
  scratchCards?: Array<{
    id: string;
    image?: string;
    winText?: string;
    isWinning?: boolean;
  }>;
  scratchSurfaceColor?: string;
  
  // Configuration Dice
  diceWinningNumbers?: number[];
  
  // Configuration Quiz
  quizQuestions?: Array<{
    id: string;
    question: string;
    answers: string[];
    correctAnswer: number;
  }>;
  quizPassingScore?: number;
  
  // Configuration Memory
  memoryPairs?: Array<{
    id: string;
    image: string;
  }>;
  memoryGridSize?: number;
  memoryTimeLimit?: number;
  
  // Configuration Puzzle
  puzzleImage?: string;
  puzzlePieces?: number;
  puzzleTimeLimit?: number;
  puzzleShowPreview?: boolean;
  puzzleDifficulty?: 'easy' | 'medium' | 'hard';
  puzzleBackgroundColor?: string;
  
  // Code personnalisé
  customCSS?: string;
  customJS?: string;
  trackingTags?: string;
  
  // Éléments personnalisés
  customTexts?: CustomText[];
  design?: {
    customImages?: CustomImage[];
  };
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

const QualifioEditorLayout: React.FC = () => {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');
  const [activeTab, setActiveTab] = useState<string>('design');
  const [config, setConfig] = useState<EditorConfig>({
    borderStyle: 'classic',
    participateButtonText: 'PARTICIPER !',
    participateButtonColor: '#ff6b35',
    participateButtonTextColor: '#ffffff',
    wheelButtonPosition: 'bottom',
    gameType: 'wheel',
    wheelSegments: [
      { id: '1', label: 'Cadeau 1', color: '#4ECDC4' },
      { id: '2', label: 'Cadeau 2', color: '#F7B731' },
      { id: '3', label: 'Cadeau 3', color: '#E74C3C' },
      { id: '4', label: 'Dommage', color: '#95A5A6' }
    ],
    deviceConfig: {
      desktop: { gamePosition: { x: 0, y: 0, scale: 1 } },
      tablet: { gamePosition: { x: 0, y: 0, scale: 1 } },
      mobile: { gamePosition: { x: 0, y: 0, scale: 1 } }
    },
    customTexts: [],
    design: {
      customImages: []
    }
  });

  const handleConfigUpdate = (updates: Partial<EditorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header avec sélecteur d'appareil */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Éditeur Qualifio</h1>
          <DeviceSelector currentDevice={currentDevice} onDeviceChange={setCurrentDevice} />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          config={config}
          onConfigUpdate={handleConfigUpdate}
          currentDevice={currentDevice}
        />

        {/* Zone de prévisualisation */}
        <Preview
          config={config}
          onConfigUpdate={handleConfigUpdate}
          currentDevice={currentDevice}
        />
      </div>
    </div>
  );
};

export default QualifioEditorLayout;
