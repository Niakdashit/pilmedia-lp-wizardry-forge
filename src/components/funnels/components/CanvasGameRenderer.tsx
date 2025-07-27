import React, { useMemo } from 'react';
import ValidationMessage from '../../common/ValidationMessage';
import WheelPreview from '../../GameTypes/WheelPreview';
import CustomElementsRenderer from '../../ModernEditor/components/CustomElementsRenderer';
import { useUniversalResponsive } from '../../../hooks/useUniversalResponsive';

interface CanvasGameRendererProps {
  campaign: any;
  formValidated: boolean;
  showValidationMessage: boolean;
  previewMode: 'mobile' | 'tablet' | 'desktop';
  mobileConfig?: any;
  onGameFinish: (result: 'win' | 'lose') => void;
  onGameStart: () => void;
  onGameButtonClick: () => void;
}

const CanvasGameRenderer: React.FC<CanvasGameRendererProps> = ({
  campaign,
  formValidated,
  showValidationMessage,
  previewMode,
  onGameFinish,
  onGameStart,
  onGameButtonClick
}) => {
  // Configuration du canvas depuis la campagne
  const canvasConfig = campaign.canvasConfig || {};
  const canvasElements = canvasConfig.elements || [];
  const canvasBackground = canvasConfig.background || campaign.design?.background;
  
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

  // Utiliser prioritairement les données structurées de design
  const responsiveTexts = useMemo(() => {
    const customTexts = campaign.design?.customTexts || [];
    if (!customTexts.length) return [];
    
    const convertedTexts = customTexts.map((text: any) => ({
      ...text,
      type: 'text' as const,
      x: text.x || 0,
      y: text.y || 0,
      fontSize: text.fontSize || parseInt(text.style?.fontSize) || 16,
      textAlign: text.textAlign || text.style?.textAlign || 'left',
      color: text.color || text.style?.color || '#000000',
      fontWeight: text.fontWeight || text.style?.fontWeight || 'normal'
    }));
    return applyAutoResponsive(convertedTexts);
  }, [campaign.design?.customTexts, applyAutoResponsive]);

  // Convertir les images en format responsif
  const responsiveImages = useMemo(() => {
    const customImages = campaign.design?.customImages || [];
    if (!customImages.length) return [];
    
    const convertedImages = customImages.map((image: any) => ({
      ...image,
      type: 'image' as const,
      x: image.x || 0,
      y: image.y || 0,
      width: image.width || 150,
      height: image.height || 150
    }));
    return applyAutoResponsive(convertedImages);
  }, [campaign.design?.customImages, applyAutoResponsive]);

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
            className="pointer-events-none select-none"
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
            className="pointer-events-none select-none"
          />
        );
      default:
        return null;
    }
  };

  const renderGameComponent = () => {
    if (campaign.type === 'wheel') {
      return (
        <div 
          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2/5 opacity-100`}
          style={{ zIndex: 10 }}
        >
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
            gamePosition={'center'}
            previewDevice={previewMode}
            disabled={!formValidated}
            disableForm={false}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <div 
        className="canvas-container relative bg-white overflow-hidden w-full h-full"
        style={previewMode === 'desktop' ? {
          width: '100%',
          height: '100vh',
        } : previewMode === 'mobile' ? {
          width: '100%',
          height: '100vh',
        } : {
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          margin: '0 auto',
          // Utiliser la même logique de transformation que l'éditeur pour cohérence
          transform: previewMode === 'tablet' ? 'scale(0.9)' : 'scale(1)',
          transformOrigin: 'top center'
        }}
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

      </div>

      <ValidationMessage
        show={showValidationMessage}
        message="Formulaire validé ! Vous pouvez maintenant jouer."
        type="success"
      />
    </div>
  );
};

export default CanvasGameRenderer;