import React, { useEffect, useState } from 'react';
import ValidationMessage from '../../common/ValidationMessage';
import WheelPreview from '../../GameTypes/WheelPreview';
import { GameSize } from '../../configurators/GameSizeSelector';

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
  const animationConfig = canvasConfig.animations || campaign.design?.animationConfig || {};
  
  const [shouldTriggerAnimation, setShouldTriggerAnimation] = useState(false);
  
  const gameSize: GameSize = 'medium';
  const gamePosition = 'center';

  // Gérer les déclencheurs d'animation
  useEffect(() => {
    const handleAnimationTrigger = () => {
      switch (animationConfig.trigger) {
        case 'onLoad':
          setTimeout(() => {
            setShouldTriggerAnimation(true);
          }, animationConfig.delay || 0);
          break;
        case 'onScroll':
          const handleScroll = () => {
            if (window.scrollY > 100) {
              setTimeout(() => {
                setShouldTriggerAnimation(true);
              }, animationConfig.delay || 0);
            }
          };
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        case 'onVisible':
          // Intersection Observer pour detecter la visibilité
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  setShouldTriggerAnimation(true);
                }, animationConfig.delay || 0);
              }
            });
          });
          const element = document.querySelector('.canvas-container');
          if (element) observer.observe(element);
          return () => observer.disconnect();
        default:
          setShouldTriggerAnimation(true);
      }
    };

    handleAnimationTrigger();
  }, [animationConfig]);

  // Générer les classes CSS d'animation
  const getAnimationClasses = () => {
    if (!shouldTriggerAnimation) return '';
    
    const duration = `duration-${Math.round(animationConfig.duration / 100) * 100 || 800}`;
    const delay = animationConfig.delay ? `delay-${Math.round(animationConfig.delay / 100) * 100}` : '';
    
    let animationClass = '';
    
    switch (animationConfig.type) {
      case 'fadeIn':
        animationClass = 'animate-fade-in opacity-100';
        break;
      case 'slideIn':
        switch (animationConfig.direction) {
          case 'top':
            animationClass = 'animate-slide-in-from-top';
            break;
          case 'bottom':
            animationClass = 'animate-slide-in-from-bottom';
            break;
          case 'left':
            animationClass = 'animate-slide-in-from-left';
            break;
          case 'right':
            animationClass = 'animate-slide-in-from-right';
            break;
          default:
            animationClass = 'animate-slide-in-right';
        }
        break;
      case 'scaleIn':
        animationClass = 'animate-scale-in scale-100';
        break;
      case 'bounceIn':
        animationClass = 'animate-bounce-in';
        break;
      case 'rotateIn':
        animationClass = 'animate-spin-once';
        break;
      case 'flipIn':
        animationClass = 'animate-flip-in';
        break;
      default:
        animationClass = 'animate-fade-in opacity-100';
    }
    
    return `${animationClass} ${duration} ${delay}`.trim();
  };

  const getInitialClasses = () => {
    if (shouldTriggerAnimation) return '';
    
    switch (animationConfig.type) {
      case 'fadeIn':
        return 'opacity-0';
      case 'slideIn':
        switch (animationConfig.direction) {
          case 'top':
            return 'transform -translate-y-full';
          case 'bottom':
            return 'transform translate-y-full';
          case 'left':
            return 'transform -translate-x-full';
          case 'right':
            return 'transform translate-x-full';
          default:
            return 'transform translate-x-full';
        }
      case 'scaleIn':
        return 'transform scale-0';
      case 'bounceIn':
        return 'transform scale-0';
      case 'rotateIn':
        return 'transform rotate-180 scale-0';
      case 'flipIn':
        return 'transform rotateY-90 scale-95';
      default:
        return 'opacity-0';
    }
  };

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
  const scale = previewMode === 'desktop' ? 1 : previewMode === 'tablet' ? 0.9 : 1;

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
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all ease-out ${getInitialClasses()} ${getAnimationClasses()}`}
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
            gameSize={gameSize}
            gamePosition={gamePosition}
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
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Canvas Background */}
        <div 
          className="absolute inset-0" 
          style={{
            background: canvasBackground?.type === 'image' 
              ? `url(${canvasBackground.value}) center/cover no-repeat` 
              : canvasBackground?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
          }}
        >
          {/* Rendu des éléments du canvas */}
          {canvasElements.map(renderCanvasElement)}
          
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