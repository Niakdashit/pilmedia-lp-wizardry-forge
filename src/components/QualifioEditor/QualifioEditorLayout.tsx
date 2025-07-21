import React, { useState, useCallback } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import QualifioSidebar from './QualifioSidebar';
import QualifioContentPanel from './QualifioContentPanel';
import QualifioPreview from './QualifioPreview';
import DeviceSelector from './DeviceSelector';
import { useAutoSync } from './hooks/useAutoSync';
import { useDeviceChangeSync } from './hooks/useDeviceChangeSync';
import { applyResponsiveConsistency } from './utils/responsiveUtils';

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
  textDecoration: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  listType?: 'none' | 'bullet' | 'numbered';
  hasEffect?: boolean;
  isAnimated?: boolean;
  backgroundColor?: string;
  width?: number;
  height?: number;
  deviceConfig?: {
    mobile?: {
      x?: number;
      y?: number;
      fontSize?: number;
      width?: number;
      height?: number;
    };
    tablet?: {
      x?: number;
      y?: number;
      fontSize?: number;
      width?: number;
      height?: number;
    };
    desktop?: {
      x?: number;
      y?: number;
      fontSize?: number;
      width?: number;
      height?: number;
    };
  };
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
  width: number;
  height: number;
  anchor: 'fixed' | 'center';
  gameType: 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'dice' | 'memory' | 'puzzle' | 'form';
  gameMode: 'mode1-sequential' | 'mode2-background';
  displayMode: 'mode1-banner-game' | 'mode2-background';
  bannerImage?: string;
  bannerDescription?: string;
  bannerLink?: string;
  backgroundColor?: string;
  outlineColor?: string;
  borderStyle?: string;
  storyText?: string;
  publisherLink?: string;
  prizeText?: string;
  customTexts?: CustomText[];
  design?: {
    customImages?: any[];
  };
  centerText?: boolean;
  centerForm?: boolean;
  centerGameZone?: boolean;
  participateButtonText?: string;
  participateButtonColor?: string;
  participateButtonTextColor?: string;
  wheelButtonPosition?: 'external' | 'center';
  footerText?: string;
  footerColor?: string;
  customCSS?: string;
  customJS?: string;
  trackingTags?: string;
  campaignName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  campaignUrl?: string;
  brandAssets?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
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
  const [activeTab, setActiveTab] = useState<string>('configuration');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);
  const [isRealTimeSyncEnabled, setIsRealTimeSyncEnabled] = useState<boolean>(false);
  
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

  // Auto-sync hook for real-time synchronization
  const { triggerSync } = useAutoSync({
    isEnabled: isRealTimeSyncEnabled,
    customTexts: config.customTexts || [],
    onUpdate: (synchronizedTexts) => {
      setConfig(prev => ({
        ...prev,
        customTexts: synchronizedTexts
      }));
    },
    baseDevice: 'desktop',
    debounceMs: 500
  });

  // Handle manual auto-sync trigger
  const handleAutoSync = useCallback((baseDevice: DeviceType = 'desktop') => {
    if (config.customTexts && config.customTexts.length > 0) {
      console.log(`🔄 Manual auto-sync from ${baseDevice}`);
      const synchronizedTexts = applyResponsiveConsistency(config.customTexts, baseDevice);
      setConfig(prev => ({
        ...prev,
        customTexts: synchronizedTexts
      }));
    }
  }, [config.customTexts]);

  // Device change auto-sync
  useDeviceChangeSync({
    currentDevice: selectedDevice,
    isAutoSyncEnabled,
    customTexts: config.customTexts || [],
    onAutoSync: handleAutoSync
  });

  const updateConfig = (updates: Partial<EditorConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    
    // Trigger real-time sync if enabled and custom texts were updated
    if (isRealTimeSyncEnabled && updates.customTexts) {
      triggerSync();
    }
    
    // Synchroniser avec l'aperçu live
    localStorage.setItem('qualifio_live_preview_config', JSON.stringify(newConfig));
  };

  // Pass auto-sync settings to content panel
  const autoSyncSettings = {
    isAutoSyncEnabled,
    setIsAutoSyncEnabled,
    isRealTimeSyncEnabled,
    setIsRealTimeSyncEnabled,
    onManualSync: handleAutoSync
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
            {isAutoSyncEnabled && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Auto-sync ON
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <DeviceSelector 
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const encoded = encodeURIComponent(
                    JSON.stringify({
                      width: config.width,
                      height: config.height,
                      anchor: config.anchor,
                      gameType: config.gameType,
                      gameMode: config.gameMode,
                      displayMode: config.displayMode,
                      bannerImage: config.bannerImage,
                      bannerDescription: config.bannerDescription,
                      bannerLink: config.bannerLink,
                      backgroundColor: config.backgroundColor,
                      outlineColor: config.outlineColor,
                      borderStyle: config.borderStyle,
                      jackpotBorderStyle: config.jackpotBorderStyle,
                      storyText: config.storyText,
                      publisherLink: config.publisherLink,
                      prizeText: config.prizeText,
                      customTexts: config.customTexts,
                      centerText: config.centerText,
                      centerForm: config.centerForm,
                      centerGameZone: config.centerGameZone,
                      participateButtonText: config.participateButtonText,
                      participateButtonColor: config.participateButtonColor,
                      participateButtonTextColor: config.participateButtonTextColor,
                      footerText: config.footerText,
                      footerColor: config.footerColor,
                      customCSS: config.customCSS,
                      customJS: config.customJS,
                      trackingTags: config.trackingTags,
                      deviceConfig: config.deviceConfig
                    })
                  );
                  localStorage.setItem('qualifio_live_preview_config', JSON.stringify(config));
                  window.open(
                    `${window.location.origin}/qualifio-live?device=${selectedDevice}&config=${encoded}`,
                    '_blank'
                  );
                }}
                className="px-4 py-2 bg-brand-accent text-brand-primary rounded-lg hover:bg-brand-accent/80 transition-colors"
              >
                Aperçu live
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
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        {/* Content Panel */}
        {!isSidebarCollapsed && (
          <QualifioContentPanel 
            activeTab={activeTab}
            config={config}
            onConfigUpdate={updateConfig}
            autoSyncSettings={autoSyncSettings}
          />
        )}
        
        {/* Preview Area */}
        <div className="flex-1 relative">
          <div id="text-toolbar-container" className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
            {/* Toolbar will be rendered here as overlay only when there's an active text */}
          </div>
          
          {/* Preview */}
          <div className="h-full p-6">
            <QualifioPreview 
              device={selectedDevice}
              config={config}
              onConfigUpdate={updateConfig}
              isRealTimeSyncEnabled={isRealTimeSyncEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifioEditorLayout;
