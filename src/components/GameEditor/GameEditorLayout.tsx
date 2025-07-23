import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../ui/use-toast';
import GamePreview from './GamePreview';
import EditorSidebar from './EditorSidebar';
import { transformStudioToEditorConfig } from './utils/studioToEditorTransform';
import { repositionTextsForDisplayMode } from './utils/textRepositioning';

export interface CustomText {
  id: string;
  content: string;
  x: number;
  y: number;
  size: string;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  enabled: boolean;
  showFrame: boolean;
  frameColor: string;
  frameBorderColor: string;
  animationConfig?: any;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textAlign?: string;
  listType?: string;
  hasEffect?: boolean;
  isAnimated?: boolean;
  deviceConfig?: any;
}

export interface CustomImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  enabled: boolean;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type GameType = 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'dice' | 'memory' | 'puzzle' | 'form';

export interface EditorConfig {
  gameType: GameType;
  displayMode: 'mode1-banner-game' | 'mode2-background';
  customTexts?: CustomText[];
  design?: {
    backgroundImage?: string | null;
    mobileBackgroundImage?: string | null;
    centerLogo?: string | null;
    customImages?: CustomImage[];
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: string;
  };
  gameConfig?: {
    wheelSegments?: any[];
    buttonLabel?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
  formFields?: any[];
  source?: string;
  _isTransformed?: boolean;
  
  // Additional properties to fix TypeScript errors
  deviceConfig?: any;
  participateButtonColor?: string;
  participateButtonText?: string;
  participateButtonTextColor?: string;
  storyText?: string;
  publisherLink?: string;
  prizeText?: string;
  brandAssets?: any;
  jackpotBackgroundColor?: string;
  jackpotBorderStyle?: string;
  scratchCards?: any[];
  scratchSurfaceColor?: string;
  diceWinningNumbers?: any[];
  quizQuestions?: any[];
  quizPassingScore?: number;
  memoryPairs?: any[];
  memoryGridSize?: number;
  memoryTimeLimit?: number;
  puzzleImage?: string;
  puzzlePieces?: number;
  puzzleTimeLimit?: number;
  puzzleShowPreview?: boolean;
  puzzleDifficulty?: string;
  puzzleBackgroundColor?: string;
  borderStyle?: string;
  wheelButtonPosition?: string;
  customCSS?: string;
  customJS?: string;
  trackingTags?: string;
  campaignName?: string;
  campaignUrl?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  width?: number;
  height?: number;
  anchor?: string;
  backgroundColor?: string;
  outlineColor?: string;
  bannerImage?: string;
  bannerDescription?: string;
  bannerLink?: string;
  footerText?: string;
  footerColor?: string;
  diceSides?: number;
  diceColor?: string;
  diceDotColor?: string;
  formTitle?: string;
  formSuccessMessage?: string;
  formShowProgress?: boolean;
  jackpotSymbols?: any[];
  jackpotWinningCombination?: any[];
  memoryCardBackColor?: string;
  puzzleAutoShuffle?: boolean;
  scratchPercentage?: number;
  gameMode?: string;
  wheelSegments?: any[];
  centerText?: boolean;
  centerForm?: boolean;
  centerGameZone?: boolean;
  autoSyncOnDeviceChange?: boolean;
  autoSyncRealTime?: boolean;
  autoSyncBaseDevice?: string;
}

const GameEditorLayout: React.FC = () => {
  const { id } = useParams();
  
  const { toast } = useToast();
  
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [config, setConfig] = useState<EditorConfig>({
    gameType: 'wheel',
    displayMode: 'mode1-banner-game',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const getCampaign = async (id: string) => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          id: id,
          name: 'Mock Campaign',
          type: 'wheel',
          displayMode: 'mode2-background',
          design: {
            primaryColor: '#3b82f6',
            secondaryColor: '#10b981',
            accentColor: '#f59e0b',
            textColor: '#1f2937',
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderRadius: '8px',
          },
          gameConfig: {
            wheelSegments: [
              { id: 1, label: 'Segment 1', color: '#f472b6' },
              { id: 2, label: 'Segment 2', color: '#3b82f6' },
            ],
            buttonLabel: 'Spin',
            buttonColor: '#3b82f6',
            buttonTextColor: '#ffffff',
          },
          formFields: [
            { id: 1, label: 'Name', type: 'text' },
            { id: 2, label: 'Email', type: 'email' },
          ],
        };
        resolve(mockData);
      }, 500);
    });
  };

  const saveCampaign = async () => {
    setIsSaving(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setLastSaved(new Date());
        setIsSaving(false);
        toast({
          title: "Succès",
          description: "Campagne sauvegardée avec succès",
        });
        resolve(true);
      }, 500);
    });
  };

  const publishCampaign = async () => {
    setIsPublishing(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsPublishing(false);
        toast({
          title: "Succès",
          description: "Campagne publiée avec succès",
        });
        resolve(true);
      }, 500);
    });
  };

  const loadCampaignData = useCallback(async () => {
    if (!id) return;
    
    try {
      if (id === 'new') {
        // Create new campaign
        setConfig({
          gameType: 'wheel',
          displayMode: 'mode1-banner-game',
        });
      } else {
        // Load existing campaign
        const campaignData: any = await getCampaign(id);
        
        if (campaignData) {
          // Check if this is a quick campaign that needs transformation
          if (campaignData.source === 'quick-campaign' || campaignData._isQuickCampaign) {
            console.log('🔄 Transforming quick campaign data:', campaignData);
            const transformedConfig = transformStudioToEditorConfig(campaignData);
            console.log('✅ Transformed config:', transformedConfig);
            
            // Debug: Log the custom texts specifically
            if (transformedConfig.customTexts) {
              console.log('📝 Custom texts after transformation:', transformedConfig.customTexts);
              transformedConfig.customTexts.forEach((text: CustomText, index: number) => {
                console.log(`Text ${index}:`, {
                  id: text.id,
                  content: text.content,
                  x: text.x,
                  y: text.y,
                  color: text.color,
                  enabled: text.enabled
                });
              });
            }
            
            setConfig(transformedConfig);
          } else {
            // Regular campaign
            setConfig(campaignData as EditorConfig);
          }
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la campagne",
        variant: "destructive"
      });
    }
  }, [id, toast]);

  const updateConfig = useCallback((updates: Partial<EditorConfig>) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig, ...updates };
      
      // Debug: Log before repositioning
      if (updates.displayMode && updates.displayMode !== prevConfig.displayMode) {
        console.log('🔄 Display mode changed from', prevConfig.displayMode, 'to', updates.displayMode);
        console.log('📝 Texts before repositioning:', newConfig.customTexts);
        
        // Reposition texts when display mode changes
        const repositionedTexts = repositionTextsForDisplayMode(
          newConfig.customTexts || [],
          updates.displayMode,
          prevConfig.displayMode
        );
        
        console.log('📝 Texts after repositioning:', repositionedTexts);
        newConfig.customTexts = repositionedTexts;
      }
      
      return newConfig;
    });
  }, []);

  useEffect(() => {
    loadCampaignData();
  }, [loadCampaignData]);

  const handleSave = async () => {
    try {
      await saveCampaign();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la campagne",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async () => {
    try {
      await publishCampaign();
    } catch (error) {
      console.error('Error publishing campaign:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier la campagne",
        variant: "destructive"
      });
    }
  };

  const triggerAutoSync = () => {
    // Implement auto-sync logic here
    console.log('Auto-sync triggered');
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          <GamePreview
            device={device}
            config={config}
            onConfigUpdate={updateConfig}
            isLivePreview={true}
            triggerAutoSync={triggerAutoSync}
          />
        </div>
      </div>
      <EditorSidebar
        config={config}
        onConfigUpdate={updateConfig}
        device={device}
        onDeviceChange={setDevice}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        isPublishing={isPublishing}
        lastSaved={lastSaved}
      />
    </div>
  );
};

export default GameEditorLayout;
