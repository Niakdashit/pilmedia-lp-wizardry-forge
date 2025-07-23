import React, { useState, useCallback, useMemo } from 'react';
import { Save, ArrowLeft, ExternalLink, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '@/hooks/useCampaigns';
import { toast } from 'react-toastify';
import GameSidebar from './GameSidebar';
import GameContentPanel from './GameContentPanel';
import GamePreview from './GamePreview';
import DeviceSelector from './DeviceSelector';
import { useDeviceChangeSync } from './hooks/useDeviceChangeSync';
import { useAutoSync } from './hooks/useAutoSync';
import { AnimationProvider } from './Animation/AnimationProvider';

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
  // Nouvelles propriétés d'animation
  animationConfig?: {
    type: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'slideInDown' | 'bounce' | 'typewriter' | 'pulse' | 'rotate' | 'zoomIn' | 'flipX' | 'flipY';
    duration: number;
    delay: number;
    trigger: 'onLoad' | 'onScroll' | 'onClick' | 'onHover' | 'delayed';
    enabled: boolean;
    typewriterSpeed?: number;
    repeat?: number;
    repeatType?: 'loop' | 'reverse' | 'mirror';
    ease?: string;
    stagger?: number;
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
  autoSyncOnDeviceChange?: boolean;
  autoSyncRealTime?: boolean;
  autoSyncBaseDevice?: 'desktop' | 'tablet' | 'mobile';
}

const GameEditorLayout: React.FC = () => {
  
  const { saveCampaign, publishCampaign } = useCampaigns();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [activeTab, setActiveTab] = useState<string>('configuration');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  
  // Fonction pour transformer les données Studio vers le format EditorConfig
  const transformStudioToEditorConfig = (studioData: any): EditorConfig => {
    const customTexts: CustomText[] = [];
    const customImages: any[] = [];
    
    console.log('🔍 Transforming studio data:', studioData);
    console.log('📊 Professional data:', studioData.professionalData);
    
    // Priorité 1: Utiliser les données professionnelles du nouveau format
    if (studioData.professionalData?.wording_jeu_concours) {
      const wording = studioData.professionalData.wording_jeu_concours;
      const fontFamily = studioData.professionalData.polices?.[0]?.nom || studioData.brandAnalysis?.fontFamily || 'Montserrat';
      
      // Positions optimisées pour le mode 2 avec image de fond
      // Titre principal - position haute mais visible
      if (wording.titre) {
        customTexts.push({
          id: 'main-title',
          content: wording.titre,
          x: 50, // Centré horizontalement
          y: 15, // Plus haut pour éviter l'image
          fontSize: 42, // Légèrement plus petit pour s'adapter
          fontFamily: fontFamily,
          color: '#ffffff',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          hasEffect: true,
          isAnimated: false,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent pour lisibilité
          width: 700,
          height: 60
        });
      }
      
      // Sous-titre - juste sous le titre
      if (wording.sous_titre) {
        customTexts.push({
          id: 'subtitle',
          content: wording.sous_titre,
          x: 50,
          y: 85, // Juste sous le titre
          fontSize: 22,
          fontFamily: fontFamily,
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          hasEffect: true,
          isAnimated: false,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          width: 700,
          height: 30
        });
      }
      
      // Mécanique de participation - position basse mais visible
      if (wording.mecanique) {
        customTexts.push({
          id: 'mechanics',
          content: wording.mecanique,
          x: 50,
          y: 1000, // Position basse
          fontSize: 18,
          fontFamily: fontFamily,
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          hasEffect: true,
          isAnimated: false,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          width: 700,
          height: 40
        });
      }
      
      // Avantage client (description de l'offre)
      if (wording.avantage_client) {
        customTexts.push({
          id: 'offer-description',
          content: wording.avantage_client,
          x: 50,
          y: 1050,
          fontSize: 16,
          fontFamily: fontFamily,
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          hasEffect: true,
          isAnimated: false,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          width: 700,
          height: 40
        });
      }
      
      // Mentions légales
      customTexts.push({
        id: 'legal-mentions',
        content: '* Voir conditions d\'utilisation - Jeu gratuit sans obligation d\'achat',
        x: 50,
        y: 1100,
        fontSize: 12,
        fontFamily: fontFamily,
        color: '#ffffff',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        hasEffect: false,
        isAnimated: false,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 700,
        height: 20
      });
      
      console.log('✅ Created customTexts from professional data:', customTexts.length);
    }
    // Priorité 2: Utiliser le format legacy si pas de données professionnelles
    else {
      if (studioData.content?.title) {
        customTexts.push({
          id: 'main-title',
          content: studioData.content.title,
          x: 50,
          y: 20,
          fontSize: 48,
          fontFamily: studioData.brandAnalysis?.fontFamily || 'Arial',
          color: '#ffffff',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          hasEffect: true,
          isAnimated: false,
          width: 700,
          height: 60
        });
      }
      
      if (studioData.content?.subtitle) {
        customTexts.push({
          id: 'subtitle',
          content: studioData.content.subtitle,
          x: 50,
          y: 100,
          fontSize: 24,
          fontFamily: studioData.brandAnalysis?.fontFamily || 'Arial',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          hasEffect: true,
          isAnimated: false,
          width: 700,
          height: 30
        });
      }
      
      if (studioData.content?.description) {
        customTexts.push({
          id: 'description',
          content: studioData.content.description,
          x: 50,
          y: 1000,
          fontSize: 16,
          fontFamily: studioData.brandAnalysis?.fontFamily || 'Arial',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          hasEffect: true,
          isAnimated: false,
          width: 700,
          height: 60
        });
      }
      
      console.log('✅ Created customTexts from legacy data:', customTexts.length);
    }
    
    // Ajouter les logos depuis les données studio
    if (studioData.design?.centerLogo) {
      customImages.push({
        id: 'center-logo',
        src: studioData.design.centerLogo,
        x: 350, // Centré horizontalement
        y: 150, // Position après le titre
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        zIndex: 10
      });
    }
    
    // Ajouter le logo de marque si disponible
    if (studioData.brandAnalysis?.logo && studioData.brandAnalysis.logo !== studioData.design?.centerLogo) {
      customImages.push({
        id: 'brand-logo',
        src: studioData.brandAnalysis.logo,
        x: 50, // Coin supérieur gauche
        y: 50,
        width: 80,
        height: 80,
        rotation: 0,
        opacity: 0.9,
        zIndex: 5
      });
    }
    
    return {
      width: 810,
      height: 1200,
      anchor: 'fixed',
      gameType: 'wheel',
      gameMode: 'mode2-background', // Mode 2 par défaut pour le studio
      displayMode: 'mode2-background',
      storyText: studioData.content?.title || 'Campagne Studio créée',
      publisherLink: '',
      prizeText: studioData.content?.callToAction || 'Participez et tentez de gagner !',
      customTexts: customTexts,
      design: {
        customImages: customImages
      },
      centerText: false,
      centerForm: true,
      centerGameZone: true,
      backgroundColor: studioData.design?.primaryColor || '#ffffff',
      outlineColor: studioData.design?.accentColor || '#ffffff',
      borderStyle: 'classic',
      jackpotBorderStyle: 'classic',
      participateButtonText: studioData.content?.callToAction || 'PARTICIPER !',
      participateButtonColor: studioData.design?.primaryColor || '#ff6b35',
      participateButtonTextColor: studioData.design?.accentColor || '#ffffff',
      footerText: '* Voir conditions d\'utilisation - Jeu gratuit sans obligation d\'achat',
      footerColor: '#f8f9fa',
      customCSS: '',
      customJS: '',
      trackingTags: '',
      deviceConfig: {
        mobile: {
          fontSize: 14,
          backgroundImage: studioData.design?.backgroundImage,
          gamePosition: { x: 0, y: 0, scale: 1.7 }
        },
        tablet: {
          fontSize: 16,
          backgroundImage: studioData.design?.backgroundImage,
          gamePosition: { x: 0, y: 0, scale: 1.7 }
        },
        desktop: {
          fontSize: 18,
          backgroundImage: studioData.design?.backgroundImage,
          gamePosition: { x: 0, y: 0, scale: 1.7 }
        }
      },
      autoSyncOnDeviceChange: false,
      autoSyncRealTime: false,
      autoSyncBaseDevice: 'desktop',
      brandAssets: {
        logo: studioData.design?.centerLogo,
        primaryColor: studioData.design?.primaryColor,
        secondaryColor: studioData.design?.secondaryColor,
        accentColor: studioData.design?.accentColor
      }
    };
  };

  // Fonction pour initialiser la configuration depuis le localStorage ou par défaut
  const initializeConfig = (): EditorConfig => {
    try {
      const savedConfig = localStorage.getItem('editorConfig');
      const studioData = localStorage.getItem('studioPreview');
      
      console.log('📋 Initializing config...');
      console.log('🔧 savedConfig exists:', !!savedConfig);
      console.log('🎬 studioData exists:', !!studioData);
      
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        console.log('✅ Loading campaign from editorConfig:', parsedConfig);
        return parsedConfig;
      }
      
      // Essayer de charger depuis studioPreview si editorConfig n'existe pas
      if (studioData) {
        const studioConfig = JSON.parse(studioData);
        console.log('🎨 Studio data found:', studioConfig);
        console.log('📝 Studio content:', studioConfig.content);
        console.log('🎯 Studio design:', studioConfig.design);
        
        // Transformer les données Studio en format EditorConfig
        const transformedConfig = transformStudioToEditorConfig(studioConfig);
        console.log('🔄 Transformed config:', transformedConfig);
        console.log('📄 Custom texts created:', transformedConfig.customTexts);
        
        return transformedConfig;
      }
    } catch (error) {
      console.error('❌ Error loading saved config:', error);
    }
    
    // Configuration par défaut
    return {
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
      },
      autoSyncOnDeviceChange: false,
      autoSyncRealTime: false,
      autoSyncBaseDevice: 'desktop'
    };
  };

  const [config, setConfig] = useState<EditorConfig>(initializeConfig);

  // Fonction pour repositionner automatiquement les textes selon le mode d'affichage
  const repositionTextsForDisplayMode = useCallback((texts: CustomText[], displayMode: string): CustomText[] => {
    if (!texts || texts.length === 0) return texts;
    
    return texts.map(text => {
      if (displayMode === 'mode2-background') {
        // Repositionnement pour mode 2 avec image de fond
        let newY = text.y;
        
        // Ajuster les positions selon l'ID ou le contenu
        if (text.id === 'main-title' || text.content.includes('Gagnez') || text.content.includes('vacances')) {
          newY = 15; // Titre principal en haut
        } else if (text.id === 'subtitle' || text.content.includes('Participez')) {
          newY = 85; // Sous-titre
        } else if (text.id === 'mechanics' || text.content.includes('Séjour')) {
          newY = 1000; // Description de l'offre
        } else if (text.id === 'offer-description') {
          newY = 1050; // Avantage client
        } else if (text.id === 'legal-mentions' || text.content.includes('conditions')) {
          newY = 1100; // Mentions légales
        }
        
        return {
          ...text,
          y: newY,
          backgroundColor: text.backgroundColor || 'rgba(0, 0, 0, 0.5)', // Fond pour lisibilité
          color: '#ffffff' // Texte blanc pour contraste
        };
      } else {
        // Mode 1 - positions originales
        return {
          ...text,
          backgroundColor: undefined // Pas de fond en mode 1
        };
      }
    });
  }, []);

  // Fonction updateConfig optimisée avec validation et repositionnement automatique
  const updateConfig = useCallback((updates: Partial<EditorConfig>) => {
    try {
      setConfig(prevConfig => {
        const newConfig = { ...prevConfig, ...updates };
        
        console.log('🔄 Config update:', updates);
        console.log('📄 Previous customTexts:', prevConfig.customTexts?.length || 0);
        console.log('📄 New customTexts:', newConfig.customTexts?.length || 0);
        
        // Si on change le displayMode, repositionner automatiquement les textes
        if (updates.displayMode && updates.displayMode !== prevConfig.displayMode) {
          console.log('🔧 Display mode change detected:', prevConfig.displayMode, '→', updates.displayMode);
          
          if (prevConfig.customTexts && prevConfig.customTexts.length > 0) {
            console.log('📝 Repositioning texts for new display mode');
            newConfig.customTexts = repositionTextsForDisplayMode(prevConfig.customTexts, updates.displayMode);
          }
        }
        
        // Conserver les customTexts existants si pas de mise à jour spécifique
        if (!updates.customTexts && prevConfig.customTexts && prevConfig.customTexts.length > 0) {
          newConfig.customTexts = prevConfig.customTexts;
        }
        
        // Conserver les customImages existants
        if (!updates.design?.customImages && prevConfig.design?.customImages) {
          newConfig.design = {
            ...newConfig.design,
            customImages: prevConfig.design.customImages
          };
        }
        
        // Validation des données critiques
        if (newConfig.width < 300) newConfig.width = 300;
        if (newConfig.height < 400) newConfig.height = 400;
        if (newConfig.width > 1200) newConfig.width = 1200;
        if (newConfig.height > 2000) newConfig.height = 2000;
        
        // Synchroniser avec l'aperçu live de manière sécurisée
        try {
          localStorage.setItem('game_live_preview_config', JSON.stringify(newConfig));
        } catch (error) {
          console.warn('Impossible de sauvegarder dans localStorage:', error);
        }
        
        return newConfig;
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
    }
  }, [repositionTextsForDisplayMode]);

  // Memoization des propriétés coûteuses
  const memoizedConfig = useMemo(() => config, [config]);
  const memoizedCustomTexts = useMemo(() => config.customTexts || [], [config.customTexts]);

  // Hook pour auto-sync lors des changements d'appareil avec gestion d'erreur
  useDeviceChangeSync({
    selectedDevice,
    customTexts: memoizedCustomTexts,
    onConfigUpdate: updateConfig,
    isEnabled: config.autoSyncOnDeviceChange || false,
    baseDevice: config.autoSyncBaseDevice || 'desktop'
  });

  // Hook pour auto-sync en temps réel avec gestion d'erreur
  const { triggerAutoSync } = useAutoSync({
    onConfigUpdate: updateConfig,
    isEnabled: config.autoSyncRealTime || false,
    baseDevice: config.autoSyncBaseDevice || 'desktop'
  });

  // Fonction de sauvegarde optimisée avec gestion d'erreur complète
  const handleSaveAndExit = useCallback(async () => {
    setSaving(true);
    
    try {
      const campaignData = {
        name: config.campaignName || 'Nouvelle campagne',
        description: config.storyText,
        type: config.gameType as any,
        status: 'draft' as const,
        config: {
          width: config.width,
          height: config.height,
          anchor: config.anchor,
          gameMode: config.gameMode,
          displayMode: config.displayMode,
          backgroundColor: config.backgroundColor,
          centerText: config.centerText,
          centerForm: config.centerForm,
          centerGameZone: config.centerGameZone,
          customCSS: config.customCSS,
          customJS: config.customJS,
          trackingTags: config.trackingTags
        },
        game_config: {
          gameType: config.gameType,
          wheelSegments: config.wheelSegments,
          quizQuestions: config.quizQuestions,
          quizPassingScore: config.quizPassingScore,
          scratchCards: config.scratchCards,
          jackpotSymbols: config.jackpotSymbols,
          diceSides: config.diceSides,
          diceWinningNumbers: config.diceWinningNumbers
        },
        design: {
          bannerImage: config.bannerImage,
          bannerDescription: config.bannerDescription,
          outlineColor: config.outlineColor,
          borderStyle: config.borderStyle,
          participateButtonText: config.participateButtonText,
          participateButtonColor: config.participateButtonColor,
          participateButtonTextColor: config.participateButtonTextColor,
          footerText: config.footerText,
          footerColor: config.footerColor,
          customTexts: config.customTexts,
          deviceConfig: config.deviceConfig,
          brandAssets: config.brandAssets
        },
        form_fields: config.formFields || [
          { name: 'email', label: 'Email', type: 'email', required: true }
        ],
        start_date: config.startDate,
        end_date: config.endDate
      };

      const savedCampaign = await saveCampaign(campaignData);
      
      if (savedCampaign) {
        // Publier automatiquement la campagne pour la rendre accessible
        await publishCampaign(savedCampaign.id);
        
        // Générer l'URL de la campagne
        const campaignUrl = `${window.location.origin}/c/${savedCampaign.slug}`;
        setGeneratedUrl(campaignUrl);
        setShowUrlModal(true);
        
        toast.success('Campagne sauvegardée et publiée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la campagne');
    } finally {
      setSaving(false);
    }
  }, [config, saveCampaign, publishCampaign]);

  // Fonction de copie d'URL optimisée
  const copyUrlToClipboard = useCallback(async () => {
    if (generatedUrl) {
      try {
        await navigator.clipboard.writeText(generatedUrl);
        toast.success('URL copiée dans le presse-papiers !');
      } catch (error) {
        console.error('Erreur lors de la copie:', error);
        toast.error('Erreur lors de la copie de l\'URL');
      }
    }
  }, [generatedUrl]);

  return (
    <AnimationProvider>
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
              <h1 className="text-xl font-semibold text-brand-primary">Éditeur de Jeux</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <DeviceSelector 
                selectedDevice={selectedDevice}
                onDeviceChange={setSelectedDevice}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    try {
                      const encoded = encodeURIComponent(JSON.stringify(memoizedConfig));
                      localStorage.setItem('game_live_preview_config', JSON.stringify(memoizedConfig));
                      window.open(
                        `${window.location.origin}/live-preview?device=${selectedDevice}&config=${encoded}`,
                        '_blank'
                      );
                    } catch (error) {
                      console.error('Erreur lors de l\'ouverture de l\'aperçu:', error);
                      toast.error('Erreur lors de l\'ouverture de l\'aperçu');
                    }
                  }}
                  className="px-4 py-2 bg-brand-accent text-brand-primary rounded-lg hover:bg-brand-accent/80 transition-colors"
                >
                  Aperçu live
                </button>
                <button 
                  onClick={handleSaveAndExit}
                  disabled={saving}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder & quitter'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar */}
          <GameSidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
          {/* Content Panel */}
          {!isSidebarCollapsed && (
            <GameContentPanel 
              activeTab={activeTab}
              config={memoizedConfig}
              onConfigUpdate={updateConfig}
              triggerAutoSync={() => triggerAutoSync(memoizedCustomTexts)}
            />
          )}
          
          {/* Preview Area */}
          <div className="flex-1 relative">
            <div id="text-toolbar-container" className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
              {/* Toolbar will be rendered here as overlay only when there's an active text */}
            </div>
            
            {/* Preview */}
            <div className="h-full p-6">
              <GamePreview
                device={selectedDevice}
                config={memoizedConfig}
                onConfigUpdate={updateConfig}
                triggerAutoSync={() => triggerAutoSync(memoizedCustomTexts)}
              />
            </div>
          </div>
        </div>
        
        {/* Modal pour afficher l'URL générée */}
        {showUrlModal && generatedUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">URL de la campagne générée</h3>
              <p className="text-gray-600 mb-4">
                Votre campagne a été sauvegardée et publiée avec succès. Voici l'URL publique :
              </p>
              <div className="bg-gray-50 p-3 rounded border flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={generatedUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm"
                />
                <button
                  onClick={copyUrlToClipboard}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copier l'URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(generatedUrl, '_blank')}
                  className="flex-1 px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Voir la campagne
                </button>
                <button
                  onClick={() => setShowUrlModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimationProvider>
  );
};

export default GameEditorLayout;
