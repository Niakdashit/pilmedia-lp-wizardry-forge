// @ts-nocheck
import React, { useMemo } from 'react';
import ContrastBackground from '../../common/ContrastBackground';
import ValidationMessage from '../../common/ValidationMessage';
import WheelPreview from '../../GameTypes/WheelPreview';
import { Jackpot } from '../../GameTypes';
import QuizPreview from '../../GameTypes/QuizPreview';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import DicePreview from '../../GameTypes/DicePreview';
import { GAME_SIZES, GameSize } from '../../configurators/GameSizeSelector';
import useCenteredStyles from '../../../hooks/useCenteredStyles';
import { getCampaignBackgroundImage } from '../../../utils/background';
import { useUniversalResponsive } from '../../../hooks/useUniversalResponsive';
import { useEditorStore } from '../../../stores/editorStore';
import FormPreview from '../../GameTypes/FormPreview';
import CustomElementsRenderer from '../../ModernEditor/components/CustomElementsRenderer';

// Import statique pour éviter les remounts et Suspense en plein spin
import SlotJackpot from '../../SlotJackpot';
import FullscreenJackpotPortal from '../../SlotJackpot/FullscreenJackpotPortal';

interface CanvasGameRendererProps {
  campaign: any;
  formValidated: boolean;
  showValidationMessage: boolean;
  previewMode: 'mobile' | 'tablet' | 'desktop';
  mobileConfig?: any;
  wheelModalConfig?: any; // Configuration en temps réel depuis le Design Editor
  onGameFinish: (result: 'win' | 'lose') => void;
  onGameStart: () => void;
  onGameButtonClick: () => void;
  /** When true, render the preview on a fixed full-screen overlay to ensure parity with other editors */
  fullScreen?: boolean;
}

const CanvasGameRenderer: React.FC<CanvasGameRendererProps> = ({
  campaign,
  formValidated,
  showValidationMessage,
  previewMode,
  wheelModalConfig,
  onGameFinish,
  onGameStart,
  onGameButtonClick,
  fullScreen = true
}) => {
  // Plus de logique portail locale: on utilise un composant singleton dédié pour le fullscreen
  // Configuration du canvas depuis la campagne - essayer plusieurs sources
  const canvasConfig = campaign.canvasConfig || {};
  const canvasElements = canvasConfig.elements || campaign.elements || [];
  const canvasBackground = canvasConfig.background || campaign.design?.background;
  
  // Debug logging pour identifier le problème
  console.log('🔍 CanvasGameRenderer Debug:', {
    campaignType: campaign.type,
    canvasConfigExists: !!campaign.canvasConfig,
    campaignElementsExists: !!campaign.elements,
    canvasElementsCount: canvasElements.length,
    canvasElements: canvasElements,
    customTextsCount: campaign.design?.customTexts?.length || 0,
    customImagesCount: campaign.design?.customImages?.length || 0,
    previewMode
  });
  
  // Form display mode (for form campaigns)
  const displayMode: 'overlay' | 'embedded' = (campaign?.design?.formDisplayMode as any) || 'overlay';

  // Système responsif pour les éléments customisés
  const { applyAutoResponsive, getPropertiesForDevice } = useUniversalResponsive('desktop');

  // Size map pour le rendu responsive
  const sizeMap = useMemo(() => ({
    xs: '12px',
    sm: '14px', 
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px'
  }), []);

  // Utiliser prioritairement les données structurées de design, puis fallback sur canvasConfig
  const responsiveTexts = useMemo(() => {
    const customTexts = campaign.design?.customTexts || [];
    const canvasTexts = canvasElements.filter((el: any) => el.type === 'text') || [];
    const allTexts = customTexts.length > 0 ? customTexts : canvasTexts;
    
    console.log('🔍 ResponsiveTexts Debug:', {
      customTextsCount: customTexts.length,
      canvasTextsCount: canvasTexts.length,
      allTextsCount: allTexts.length,
      allTexts: allTexts
    });
    
    if (!allTexts.length) return [];
    
    const convertedTexts = allTexts.map((text: any) => ({
      ...text,
      type: 'text' as const,
      x: text.x || 0,
      y: text.y || 0,
      fontSize: text.fontSize || parseInt(text.style?.fontSize) || 16,
      textAlign: text.textAlign || text.style?.textAlign || 'left',
      color: text.color || text.style?.color || '#000000',
      fontWeight: text.fontWeight || text.style?.fontWeight || 'normal'
    }));
    
    console.log('🔍 ConvertedTexts:', convertedTexts);
    
    return applyAutoResponsive(convertedTexts);
  }, [campaign.design?.customTexts, canvasElements, applyAutoResponsive]);

  // Convertir les images en format responsif
  const responsiveImages = useMemo(() => {
    const customImages = campaign.design?.customImages || [];
    const canvasImages = canvasElements.filter((el: any) => el.type === 'image') || [];
    const allImages = customImages.length > 0 ? customImages : canvasImages;
    if (!allImages.length) return [];
    
    const convertedImages = allImages.map((image: any) => ({
      ...image,
      type: 'image' as const,
      x: image.x || 0,
      y: image.y || 0,
      width: image.width || 150,
      height: image.height || 150
    }));
    return applyAutoResponsive(convertedImages);
  }, [campaign.design?.customImages, canvasElements, applyAutoResponsive]);

  // Préparer les éléments pour CustomElementsRenderer
  const customTextsForRenderer = useMemo(() => {
    return responsiveTexts.map((text: any) => {
      const textProps = getPropertiesForDevice(text, previewMode);
      return { ...text, ...textProps };
    });
  }, [responsiveTexts, getPropertiesForDevice, previewMode]);

  const customImagesForRenderer = useMemo(() => {
    return responsiveImages.map((image: any) => {
      const imageProps = getPropertiesForDevice(image, previewMode);
      return { ...image, ...imageProps };
    });
  }, [responsiveImages, getPropertiesForDevice, previewMode]);

  // Générer les classes CSS d'animation

  // Calculer les dimensions du canvas selon l'appareil - UTILISER LES DIMENSIONS STANDARD
  const getCanvasSize = () => {
    switch (previewMode) {
      case 'desktop':
        return { width: '100%', height: '100%' };
      case 'tablet':
        return { width: 820, height: 1180 }; // Dimensions standard
      case 'mobile':
        return { width: 430, height: 932 }; // Dimensions standard (iPhone 14 Pro Max)
      default:
        return { width: 430, height: 932 };
    }
  };

  const canvasSize = getCanvasSize();


  const handleGameComplete = React.useCallback((result: 'win' | 'lose') => {
    console.log('🎯 [CanvasGameRenderer] Game completed with result:', result);
    // Délai pour laisser l'animation se terminer complètement avant d'appeler onGameFinish
    // Victoire: 1500ms pour voir les confettis, Défaite: 1200ms pour voir le résultat
    const delay = result === 'win' ? 1500 : 1200;
    console.log(`⏱️ [CanvasGameRenderer] Will call onGameFinish in ${delay}ms`);
    setTimeout(() => {
      console.log('✅ [CanvasGameRenderer] Now calling onGameFinish');
      onGameFinish(result);
    }, delay);
  }, [onGameFinish]);

  const handleWin = React.useCallback(() => handleGameComplete('win'), [handleGameComplete]);
  const handleLose = React.useCallback(() => handleGameComplete('lose'), [handleGameComplete]);

  const handleGameStartInternal = () => {
    console.log('Game started');
    onGameStart();
  };

  const renderCanvasElement = (element: any) => {
    const elementStyle = {
      position: 'absolute' as const,
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: element.width ? `${element.width}px` : 'auto',
      height: element.height ? `${element.height}px` : 'auto',
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      zIndex: element.zIndex || 1,
      ...element.style
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={elementStyle}
            className="pointer-events-none select-text"
          >
            {element.content}
          </div>
        );
      case 'image':
        return (
          <img
            key={element.id}
            src={element.src}
            alt={element.alt || ''}
            style={elementStyle}
            className="pointer-events-none select-text"
          />
        );
      default:
        return null;
    }
  };

  // S'abonner à la configuration jackpot du store pour une synchronisation automatique
  const storeJackpotCfg = useEditorStore((s: any) => s.campaign?.gameConfig?.jackpot);

  const renderGameComponent = () => {
    console.log('🎮 Rendering game component for type:', campaign.type);
    console.log('🎮 Full campaign object:', campaign);
    
    if (campaign.type === 'wheel') {
      return (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          <WheelPreview
            campaign={campaign}
            config={{
              mode: 'instant_winner' as const,
              winProbability: campaign.gameConfig?.wheel?.winProbability || 0.1,
              maxWinners: campaign.gameConfig?.wheel?.maxWinners,
              winnersCount: 0
            }}
            onFinish={handleGameComplete}
            onStart={handleGameStartInternal}
            gameSize={'medium'}
            previewDevice={previewMode}
            wheelModalConfig={{
              ...wheelModalConfig,
              extractedColors: campaign?.design?.extractedColors || []
            }}
            disabled={!formValidated}
            disableForm={false}
          />
        </div>
      );
    }
    
    if (campaign.type === 'form') {
      const displayMode = campaign?.design?.formDisplayMode || 'overlay'; // 'overlay' | 'embedded'
      const formPosition = campaign?.design?.formPosition === 'left' ? 'left' : 'right';
      if (displayMode === 'embedded') {
        // Embedded layout: 70% background/content + 30% form panel
        return (
          <div className="absolute inset-0 flex" style={{ zIndex: 10 }}>
            {formPosition === 'left' && (
              <div className="w-[30%] min-w-[280px] max-w-[520px] h-full flex items-center justify-center p-4">
                <FormPreview campaign={campaign} gameSize="medium" className="w-full" />
              </div>
            )}
            <div className="flex-1 relative">
              {/* Background + custom elements in the remaining 70% */}
              <div 
                className="absolute inset-0" 
                style={{
                  background: campaign.design?.background?.type === 'image' 
                    ? `url(${campaign.design.background.value}) center/cover no-repeat` 
                    : campaign.design?.background?.value || canvasBackground?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                }}
              >
                <CustomElementsRenderer
                  customTexts={customTextsForRenderer}
                  customImages={customImagesForRenderer}
                  previewDevice={previewMode}
                  sizeMap={sizeMap}
                />
              </div>
            </div>
            {formPosition === 'right' && (
              <div className="w-[30%] min-w-[280px] max-w-[520px] h-full flex items-center justify-center p-4">
                <FormPreview campaign={campaign} gameSize="medium" className="w-full" />
              </div>
            )}
          </div>
        );
      }
      // Default overlay behavior: keep as before
      return (
        <div className="absolute inset-0 flex items-center justify-end pr-6" style={{ zIndex: 10 }}>
          <FormPreview
            campaign={campaign}
            gameSize="medium"
            className="pointer-events-auto"
          />
        </div>
      );
    }

    if (campaign.type === 'jackpot') {
      // Fusionner campagne fournie et store réactif (le store gagne si la campagne est vide)
      const campaignJackpot = campaign?.gameConfig?.jackpot || {};
      const effectiveTemplate = campaignJackpot?.template ?? storeJackpotCfg?.template;
      const effectiveSymbols = campaignJackpot?.symbols ?? storeJackpotCfg?.symbols;
      const effectiveCustomUrl = campaignJackpot?.customTemplateUrl ?? storeJackpotCfg?.customTemplateUrl;
      
      // Récupérer toutes les configurations pour assurer la parité avec le mode édition
      const effectiveBorderColor = campaignJackpot?.borderColor ?? storeJackpotCfg?.borderColor;
      const effectiveBackgroundColor = campaignJackpot?.backgroundColor ?? storeJackpotCfg?.backgroundColor;
      const effectiveTextColor = campaignJackpot?.textColor ?? storeJackpotCfg?.textColor;
      const effectiveCustomFrame = campaignJackpot?.customFrame ?? storeJackpotCfg?.customFrame;
      const effectiveButton = campaignJackpot?.button ?? storeJackpotCfg?.button;
      void effectiveCustomFrame; // Reserved for future functionality
      void effectiveButton; // Reserved for future functionality
      
      console.log('🎰 Rendering Jackpot component (SlotJackpot)', {
        template: effectiveTemplate,
        symbols: Array.isArray(effectiveSymbols) ? effectiveSymbols.length : 0,
        borderColor: effectiveBorderColor,
        backgroundColor: effectiveBackgroundColor,
        textColor: effectiveTextColor,
        campaignTemplate: campaignJackpot?.template,
        storeTemplate: storeJackpotCfg?.template,
        effectiveTemplate
      });
      
      // En fullscreen, utiliser le portail singleton pour éviter tout unmount
      if (fullScreen) {
        return (
          <FullscreenJackpotPortal
            templateOverride={effectiveTemplate}
            symbols={effectiveSymbols}
            onWin={handleWin}
            onLose={handleLose}
          />
        );
      }

      // Mode non-fullscreen: rendu direct
      return (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          <SlotJackpot
            key="slotjackpot-stable"
            templateOverride={effectiveTemplate}
            symbols={effectiveSymbols}
            onWin={handleWin}
            onLose={handleLose}
            disabled={!formValidated}
          />
        </div>
      );
    }
    
    if (campaign.type === 'quiz') {
      console.log('🎯 Rendering Quiz component', {
        quizConfig: campaign.gameConfig?.quiz,
        design: campaign.design,
        hasQuizConfig: !!campaign.gameConfig?.quiz,
        hasDesign: !!campaign.design
      });
      
      const QuizPreview = React.lazy(() => import('../../GameTypes/QuizPreview'));
      
      return (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          <React.Suspense fallback={<div>Loading quiz...</div>}>
            <QuizPreview
              config={campaign.gameConfig?.quiz || {}}
              design={campaign.design || {}}
            />
          </React.Suspense>
        </div>
      );
    }
    
    console.log('⚠️ No game component found for type:', campaign.type);
    return null;
  };

  const containerStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = {
      margin: '0 auto',
      touchAction: 'manipulation'
    };

    if (previewMode === 'desktop') {
      return {
        ...base,
        width: '100%',
        height: '100dvh'
      };
    }

    if (previewMode === 'mobile') {
      return {
        ...base,
        height: '100dvh'
      };
    }

    return {
      ...base,
      width: '100%',
      height: '100dvh'
    };
  }, [previewMode, canvasSize]);

  // Wrapper styles: either fixed full-screen overlay (preferred in editors) or normal flow
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (fullScreen) {
      const node = (
        <div className="fixed inset-0 z-[9999] w-screen h-[100dvh] min-h-[100dvh]">
          {children}
        </div>
      );
      // Use a portal to escape any transformed ancestor that would clip a fixed element
      return typeof document !== 'undefined' ? (createPortal(node, document.body)) as any : (node as any);
    }
    return <div className="w-full h-[100dvh] min-h-[100dvh]">{children}</div>;
  };

  return (
    <Wrapper>
      <div
        className="canvas-container relative overflow-visible w-full"
        style={containerStyle}
      >
        {/* Canvas Background */}
        <div 
          className="absolute inset-0" 
          style={{
            background: campaign.design?.background?.type === 'image' 
              ? `url(${campaign.design.background.value}) center/cover no-repeat` 
              : campaign.design?.background?.value || canvasBackground?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
          }}
        >
          {/* Rendu des éléments responsive customisés (textes et images) */}
          <CustomElementsRenderer
            customTexts={customTextsForRenderer}
            customImages={customImagesForRenderer}
            previewDevice={previewMode}
            sizeMap={sizeMap}
          />
          
          {/* Rendu des éléments du canvas uniquement pour les types non gérés par CustomElementsRenderer */}
          {canvasElements
            .filter((element: any) => !['text', 'image'].includes(element.type))
            .map(renderCanvasElement)
          }
          
          {/* Composant de jeu (roue) */}
          {renderGameComponent()}
        </div>

        {/* Overlay pour déclencher le formulaire si pas validé
           - En fullscreen pour le jackpot, on saute l'overlay pour que le premier clic lance directement le jeu */}
        {!formValidated && displayMode !== 'embedded' && ['wheel', 'scratch', 'jackpot'].includes(campaign.type) && !(fullScreen && campaign.type === 'jackpot') && (
          <div 
            onClick={() => {
              console.log('Canvas overlay clicked - triggering form');
              onGameButtonClick();
            }}
            className="absolute inset-0 flex items-center justify-center z-30 rounded-lg cursor-pointer bg-black/0" 
          />
        )}

        {/* Message de validation en overlay pour éviter d'ajouter de la hauteur à la page */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
          <ValidationMessage
            show={showValidationMessage}
            message="Formulaire validé ! Vous pouvez maintenant jouer."
            type="success"
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default CanvasGameRenderer;