import React, { useMemo } from 'react';
import { useEditorStore } from '../../../stores/editorStore';
import WheelPreview from '../../GameTypes/WheelPreview';
import CustomElementsRenderer from '../../ModernEditor/components/CustomElementsRenderer';
import { useUniversalResponsive } from '../../../hooks/useUniversalResponsive';
import ValidationMessage from '../../common/ValidationMessage';

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
}

const CanvasGameRenderer: React.FC<CanvasGameRendererProps> = ({
  campaign,
  formValidated,
  showValidationMessage,
  previewMode,
  wheelModalConfig,
  onGameFinish,
  onGameStart,
  onGameButtonClick
}) => {
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

  // Calculer les dimensions du canvas selon l'appareil
  const getCanvasSize = () => {
    switch (previewMode) {
      case 'desktop':
        return { width: '100%', height: '100%' };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'mobile':
        return { width: 360, height: 640 };
      default:
        return { width: 360, height: 640 };
    }
  };

  const canvasSize = getCanvasSize();


  const handleGameComplete = (result: 'win' | 'lose') => {
    console.log('Game completed with result:', result);
    onGameFinish(result);
  };

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
      
      // Utiliser le même composant que l'éditeur pour garantir la parité visuelle
      const SlotJackpot = React.lazy(() => import('../../SlotJackpot'));
      
      return (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          <React.Suspense fallback={<div>Loading...</div>}>
            <SlotJackpot
              key={`slotjackpot-${effectiveTemplate || 'default'}-${(effectiveSymbols?.length || 0)}-${effectiveCustomUrl || 'no-url'}-${effectiveBorderColor || 'no-border'}-${effectiveBackgroundColor || 'no-bg'}`}
              templateOverride={effectiveTemplate}
              symbols={effectiveSymbols}
              onWin={() => handleGameComplete('win')}
              onLose={() => handleGameComplete('lose')}
              disabled={!formValidated}
            />
          </React.Suspense>
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

  return (
    <div className="w-full h-[100dvh] min-h-[100dvh]">
      <div
        className="canvas-container relative overflow-hidden w-full"
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

        {/* Overlay pour déclencher le formulaire si pas validé */}
        {!formValidated && (
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
    </div>
  );
};

export default CanvasGameRenderer;