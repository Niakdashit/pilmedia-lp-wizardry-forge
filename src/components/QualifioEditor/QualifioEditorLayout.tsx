import React, { useState } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import QualifioSidebar from './QualifioSidebar';
import QualifioPreview from './QualifioPreview';
import DeviceSelector from './DeviceSelector';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface CustomText {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export interface DeviceConfig {
  fontSize: number;
  backgroundImage?: string;
  gamePosition?: {
    x: number; // Position horizontale (-100 à 100)
    y: number; // Position verticale (-100 à 100)
    scale: number; // Échelle (0.5 à 2.0)
  };
}

export interface EditorConfig {
  // General
  width: number;
  height: number;
  anchor: 'fixed' | 'center';
  
  // Game type and modes
  gameType: 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'dice' | 'memory' | 'puzzle' | 'form';
  gameMode: 'mode1-sequential' | 'mode2-background';
  displayMode: 'mode1-banner-game' | 'mode2-background';
  
  // Banner
  bannerImage?: string;
  bannerDescription?: string;
  bannerLink?: string;
  backgroundColor?: string;
  outlineColor?: string;
  
  // Wheel settings
  borderStyle?: string;
  
  // Text content
  storyText?: string;
  publisherLink?: string;
  prizeText?: string;
  
  // Custom texts
  customTexts?: CustomText[];
  
  // Design elements
  design?: {
    customImages?: any[];
  };
  
  // Layout
  centerText?: boolean;
  centerForm?: boolean;
  centerGameZone?: boolean;
  
  // Buttons
  participateButtonText?: string;
  participateButtonColor?: string;
  participateButtonTextColor?: string;
  
  // Footer
  footerText?: string;
  footerColor?: string;
  
  // Custom code
  customCSS?: string;
  customJS?: string;
  trackingTags?: string;
  
  // Brand assets
  brandAssets?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  
  // Device-specific configurations
  deviceConfig?: {
    mobile: DeviceConfig;
    tablet: DeviceConfig;
    desktop: DeviceConfig;
  };

  formFields?: Array<{
    id: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }>;

  // Game-specific configurations
  wheelSegments?: any[];
  quizQuestions?: any[];
  quizPassingScore?: number;
  scratchCards?: any[];
  scratchSurfaceColor?: string;
  scratchPercentage?: number;
  jackpotSymbols?: string[];
  jackpotWinningCombination?: string[];
  jackpotBackgroundColor?: string;
  jackpotBorderStyle?: string;
  jackpotBorderColor?: string;
  jackpotBorderWidth?: number;
  diceSides?: number;
  diceWinningNumbers?: number[];
  diceColor?: string;
  diceDotColor?: string;
  memoryPairs?: any[];
  memoryGridSize?: string;
  memoryTimeLimit?: number;
  memoryCardBackColor?: string;
  puzzleImage?: string;
  puzzlePieces?: number;
  puzzleTimeLimit?: number;
  puzzleShowPreview?: boolean;
  puzzleAutoShuffle?: boolean;
  puzzleDifficulty?: string;
  puzzleBackgroundColor?: string;
  formTitle?: string;
  formSuccessMessage?: string;
  formShowProgress?: boolean;
}

const QualifioEditorLayout: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [config, setConfig] = useState<EditorConfig>({
    width: 810,
    height: 1200,
    anchor: 'fixed',
    gameType: 'wheel',
    gameMode: 'mode1-sequential',
    displayMode: 'mode1-banner-game',
    storyText: `Valentine et son frère aîné, Antoine, ont 13 ans d'écart. Orphelins de mère, ils viennent de perdre leur père, César Mestre. Le jour des obsèques, une inconnue leur remet une lettre de leur père. La lettre n'explicite pas grand-chose, mais évoque une fracture, des réparations qui n'ont pas eu le temps d'être faites. Antoine s'en détourne vite et retourne à sa vie rangée avec sa femme et ses enfants. Mais Valentine ne reconnaît pas dans ces lignes l'enfance qu'elle a vécue et se donne pour mission de comprendre ce que leur père a voulu leur dire et va enquêter. À son récit s'enchâsse celui de Laure, factrice à Loisel, un petit village normand, et qui vient de faire la connaissance de César. Elle s'est réfugiée là quatre ans plus tôt, après une dépression, et laissant la garde de son fils à son ex-mari, fils avec lequel elle tente peu à peu de renouer un lien fort. Le destin des deux femmes va se croiser.`,
    publisherLink: 'editions.flammarion.com',
    prizeText: 'Jouez et tentez de remporter l\'un des 10 exemplaires de "Les notes invisibles" d\'une valeur unitaire de 21 euros !',
    customTexts: [],
    centerText: false,
    centerForm: true,
    centerGameZone: true,
    backgroundColor: '#ffffff',
    outlineColor: '#ffffff',
    borderStyle: 'classic',
    jackpotBorderStyle: 'classic',
    participateButtonText: 'PARTICIPER !',
    participateButtonColor: '#ff6b35',
    participateButtonTextColor: '#ffffff',
    footerText: '',
    footerColor: '#f8f9fa',
    customCSS: '',
    customJS: '',
    trackingTags: '',
    deviceConfig: {
      mobile: {
        fontSize: 14,
        backgroundImage: undefined,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      },
      tablet: {
        fontSize: 16,
        backgroundImage: undefined,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      },
      desktop: {
        fontSize: 18,
        backgroundImage: undefined,
        gamePosition: { x: 0, y: 0, scale: 1.0 }
      }
    }
  });

  const updateConfig = (updates: Partial<EditorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-brand-accent">
      {/* Header avec couleurs de marque */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/gamification"
              className="flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
            <h1 className="text-xl font-semibold text-brand-primary">Éditeur Qualifio</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <DeviceSelector 
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-brand-accent text-brand-primary rounded-lg hover:bg-brand-accent/80 transition-colors">
                Sauvegarder le template
              </button>
              <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Sauvegarder & quitter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <QualifioSidebar 
          config={config}
          onConfigUpdate={updateConfig}
        />
        
        {/* Preview Area */}
        <div className="flex-1 p-6">
          <QualifioPreview 
            device={selectedDevice}
            config={config}
            onConfigUpdate={updateConfig}
          />
        </div>
      </div>
    </div>
  );
};

export default QualifioEditorLayout;
