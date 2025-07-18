
import React, { useState } from 'react';
import { Settings, MousePointer, Gamepad2, Type } from 'lucide-react';
import GeneralTab from './SidebarTabs/GeneralTab';
import GameZoneTab from './SidebarTabs/GameZoneTab';
import ButtonsTab from './SidebarTabs/ButtonsTab';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface CustomText {
  id: string;
  text: string;
  content?: string;
  fontSize: string;
  fontWeight: string;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  color: string;
  backgroundColor?: string;
  position: { x: number; y: number };
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  device: DeviceType;
}

export interface EditorConfig {
  gameType?: 'wheel' | 'jackpot' | 'scratch' | 'dice' | 'quiz' | 'memory' | 'puzzle' | 'form';
  displayMode?: 'mode1-banner-game' | 'mode2-background';
  brandAssets?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    logoUrl?: string;
  };
  borderStyle?: string;
  formFields?: FormField[];
  wheelButtonPosition?: 'bottom' | 'center' | 'top';
  wheelCenterButtonPosition?: boolean;
  participateButtonText?: string;
  participateButtonColor?: string;
  participateButtonTextColor?: string;
  deviceConfig?: {
    [key in DeviceType]: {
      backgroundImage?: string;
      fontSize?: number;
      gamePosition?: { x: number; y: number; scale?: number };
    };
  };
  wheelSegments?: Array<{ id: string; label: string; color?: string }>;
  customTexts?: CustomText[];
  design?: {
    customImages?: Array<{
      id: string;
      url: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      device: DeviceType;
    }>;
    customTexts?: CustomText[];
    backgroundColor?: string;
  };
  
  // Content properties
  storyText?: string;
  publisherLink?: string;
  prizeText?: string;
  
  // Game-specific properties
  jackpotBackgroundColor?: string;
  jackpotBorderStyle?: string;
  scratchCards?: Array<{
    content: string;
    isWinning: boolean;
  }>;
  scratchSurfaceColor?: string;
  diceWinningNumbers?: number[];
  quizQuestions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  quizPassingScore?: number;
  memoryPairs?: Array<{
    id: string;
    image1: string;
    image2?: string;
  }>;
  memoryGridSize?: string;
  memoryTimeLimit?: number;
  puzzleImage?: string;
  puzzlePieces?: number;
  puzzleTimeLimit?: number;
  puzzleShowPreview?: boolean;
  puzzleDifficulty?: string;
  puzzleBackgroundColor?: string;
  
  // Code properties
  customCSS?: string;
  customJS?: string;
  trackingTags?: string;
}

const QualifioEditorLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<EditorConfig>({
    gameType: 'wheel',
    displayMode: 'mode1-banner-game',
    brandAssets: {
      primaryColor: '#4ECDC4',
      secondaryColor: '#F7B731',
      accentColor: '#E74C3C'
    },
    borderStyle: 'classic',
    formFields: [],
    wheelButtonPosition: 'bottom',
    wheelCenterButtonPosition: false,
    participateButtonText: 'PARTICIPER !',
    participateButtonColor: '#ff6b35',
    participateButtonTextColor: '#ffffff',
    deviceConfig: {
      desktop: {
        backgroundImage: '',
        fontSize: 16,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      },
      tablet: {
        backgroundImage: '',
        fontSize: 14,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      },
      mobile: {
        backgroundImage: '',
        fontSize: 12,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      }
    },
    wheelSegments: [],
    customTexts: [],
    design: {
      customImages: [],
      customTexts: [],
      backgroundColor: '#ffffff'
    },
    storyText: '',
    publisherLink: '',
    prizeText: '',
    jackpotBackgroundColor: '#f3f4f6',
    jackpotBorderStyle: 'classic',
    scratchCards: [],
    scratchSurfaceColor: '#C0C0C0',
    diceWinningNumbers: [7, 11],
    quizQuestions: [],
    quizPassingScore: 70,
    memoryPairs: [],
    memoryGridSize: '4x3',
    memoryTimeLimit: 60,
    puzzlePieces: 9,
    puzzleTimeLimit: 120,
    puzzleShowPreview: true,
    puzzleDifficulty: 'medium',
    puzzleBackgroundColor: '#f0f0f0',
    customCSS: '',
    customJS: '',
    trackingTags: ''
  });

  const handleConfigUpdate = (updates: Partial<EditorConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'game-zone', label: 'Zone de jeu', icon: Gamepad2 },
    { id: 'buttons', label: 'Boutons', icon: MousePointer },
    { id: 'typography', label: 'Typographie', icon: Type }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab config={config} onConfigUpdate={handleConfigUpdate} />;
      case 'game-zone':
        return <GameZoneTab config={config} onConfigUpdate={handleConfigUpdate} />;
      case 'buttons':
        return <ButtonsTab config={config} onConfigUpdate={handleConfigUpdate} />;
      case 'typography':
        return <div className="p-4 text-gray-500">Onglet Typographie en cours de développement</div>;
      default:
        return <GeneralTab config={config} onConfigUpdate={handleConfigUpdate} />;
    }
  };

  return (
    <div>
      {/* Sidebar */}
      <div className="w-64 bg-sidebar-background border-r border-sidebar-border h-full py-4 px-3 space-y-6">
        <div className="space-y-2">
          <h2 className="text-sidebar-text-primary font-semibold text-lg">Configuration</h2>
          <p className="text-sidebar-text-muted text-sm">Personnalisez votre jeu</p>
        </div>

        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-item-hover ${activeTab === tab.id ? 'bg-sidebar-item-active text-white' : 'text-sidebar-text-primary'}`}
            >
              <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-sidebar-icon'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default QualifioEditorLayout;
