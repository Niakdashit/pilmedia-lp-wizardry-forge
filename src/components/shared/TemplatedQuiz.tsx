import React, { useState, useEffect } from 'react';
import { quizTemplates } from '../../types/quizTemplates';
import type { QuizStyleProps } from '../../types/quiz-style';

// Les types globaux sont maintenant définis dans src/types/global.d.ts

interface TemplatedQuizProps {
  campaign?: any;
  device?: 'desktop' | 'tablet' | 'mobile';
  disabled?: boolean;
  onClick?: () => void;
  templateId?: string;
  onAnswerSelected?: (isCorrect: boolean) => void;
}

const TemplatedQuiz: React.FC<TemplatedQuizProps> = ({
  campaign,
  device = 'desktop',
  disabled = false,
  onClick,
  templateId = 'image-quiz', // Default to the image template as requested
  onAnswerSelected
}) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Interface pour les styles actuels du quiz
  interface CurrentStyles {
    backgroundColor?: string;
    backgroundOpacity?: number;
    textColor?: string;
    borderRadius?: string;
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
    buttonHoverBackgroundColor?: string;
    buttonActiveBackgroundColor?: string;
    width?: string;
    mobileWidth?: string;
    height?: string;
  }

  // Écouter les mises à jour de style du quiz
  const [currentStyles, setCurrentStyles] = useState<CurrentStyles>({
    backgroundColor: '',
    backgroundOpacity: 100,
    textColor: '',
    borderRadius: '',
    buttonBackgroundColor: '',
    buttonTextColor: '',
    buttonHoverBackgroundColor: '',
    buttonActiveBackgroundColor: '',
    width: '',
    mobileWidth: '',
    height: ''
  });
  
  // État local pour suivre le style actuel des boutons
  const [buttonStyles, setButtonStyles] = useState<{
    normal: React.CSSProperties;
    hover: React.CSSProperties;
    active: React.CSSProperties;
  }>({
    normal: {},
    hover: {},
    active: {}
  });

  // Fonction utilitaire pour mettre à jour les styles
  const updateQuizStyles = (styles: Partial<QuizStyleProps>) => {
    if (!styles || Object.keys(styles).length === 0) return;
    
    console.log('🎨 [TemplatedQuiz] Mise à jour des styles:', styles);
    
    setCurrentStyles(prev => {
      const newStyles = {
        ...prev,
        ...styles
      };
      
      console.log('🎨 [TemplatedQuiz] Nouveaux styles après mise à jour:', newStyles);
      return newStyles;
    });
    
    // Forcer un re-render pour s'assurer que les styles sont appliqués
    setForceUpdate(prev => {
      const newValue = prev + 1;
      console.log('🔄 [TemplatedQuiz] Forçage du re-render #' + newValue);
      return newValue;
    });
  };

  // Effet pour gérer les événements de style
  useEffect(() => {
    const handleStyleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<QuizStyleProps>;
      
      console.log(`🔄 [TemplatedQuiz] Réception d'un événement ${event.type}:`, {
        detail: customEvent.detail,
        timestamp: new Date().toISOString(),
        eventType: event.type,
        eventTarget: event.target
      });
      
      if (customEvent.detail) {
        updateQuizStyles(customEvent.detail);
      }
    };
    
    // Ajouter les écouteurs d'événements
    const eventTypes = ['quizStyleUpdate', 'quizStyleUpdateFallback'];
    
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleStyleUpdate as EventListener);
      console.log(`👂 [TemplatedQuiz] Écouteur d'événement ${eventType} ajouté`);
    });
    
    // Nettoyer les écouteurs d'événements lors du démontage du composant
    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleStyleUpdate as EventListener);
        console.log(`👋 [TemplatedQuiz] Écouteur d'événement ${eventType} supprimé`);
      });
    };
  }, []);
  
  // Mettre à jour les styles lorsque la campagne change
  useEffect(() => {
    if (campaign?.design?.quizConfig?.style) {
      console.log('🔄 [TemplatedQuiz] Mise à jour des styles depuis la campagne:', campaign.design.quizConfig.style);
      
      setCurrentStyles(prev => {
        const newStyles: QuizStyleProps = {
          ...prev,
          ...campaign.design.quizConfig.style
        };
        console.log('🎨 [TemplatedQuiz] Nouveaux styles appliqués depuis la campagne:', newStyles);
        return newStyles;
      });
      
      // Forcer un re-render pour s'assurer que les styles sont appliqués
      setForceUpdate(prev => prev + 1);
    }
  }, [campaign]);
  
  // Debug logs
  console.log('🎯 TemplatedQuiz render:', { 
    templateId, 
    currentStyles,
    campaignStyles: campaign?.design?.quizConfig?.style,
    forceUpdate 
  });
  
  // Get the selected template
  const template = quizTemplates.find(t => t.id === templateId) || quizTemplates[1]; // Fallback to image-quiz
  
  console.log('🎯 Selected template:', template.name, template.id);

  // Get quiz data
  const quizConfig = campaign?.gameConfig?.quiz || {
    questions: [
      {
        question: "What is shown in the picture?",
        image: "/api/placeholder/400/200", // Placeholder image
        answers: [
          { text: "A dog swimming in the ocean", isCorrect: false },
          { text: "A lion in a forest", isCorrect: false },
          { text: "A whale jumping out of the water", isCorrect: true }
        ]
      }
    ]
  };

  const questions = quizConfig.questions || [];
  const currentQuestion = questions[0] || {};
  const answers = currentQuestion.answers || [];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Debug log pour vérifier les valeurs actuelles
  useEffect(() => {
    console.log('🎨 [TemplatedQuiz] Current styles:', {
      currentStyles,
      campaignStyles: campaign?.design?.quizConfig?.style,
      templateStyles: template.style
    });
  }, [currentStyles, campaign, template]);
  
  // Calculer le borderRadius uniforme pour tous les éléments
  const unifiedBorderRadius = 
    currentStyles.borderRadius || 
    campaign?.design?.quizConfig?.style?.borderRadius ||
    (typeof template.style.borderRadius === 'number' 
      ? `${template.style.borderRadius}px` 
      : template.style.borderRadius || '8px');
      
  // Mettre à jour les styles des boutons lorsque les couleurs changent
  useEffect(() => {
    console.log('🔄 Mise à jour des styles des boutons', {
      currentStyles,
      campaignStyles: campaign?.design?.quizConfig?.style,
      templateStyles: template.optionStyle
    });
    
    // Récupérer les couleurs en respectant l'ordre de priorité :
    // 1. currentStyles (mis à jour par les événements)
    // 2. campaign.design.quizConfig.style
    // 3. template.optionStyle
    // Couleurs par défaut des boutons (peuvent être surchargées par le panneau)
    const DEFAULT_BTN_BG = '#f3f4f6';
    const DEFAULT_BTN_TEXT = '#000000';
    const DEFAULT_BTN_HOVER = '#9fa4a4';
    const DEFAULT_BTN_ACTIVE = '#a7acb5';

    const bgColor = currentStyles.buttonBackgroundColor || 
                   campaign?.design?.quizConfig?.style?.buttonBackgroundColor || 
                   (template.optionStyle as any)?.background || 
                   DEFAULT_BTN_BG;
                   
    const textColor = currentStyles.buttonTextColor || 
                     campaign?.design?.quizConfig?.style?.buttonTextColor || 
                     (template.optionStyle as any)?.color || 
                     DEFAULT_BTN_TEXT;
                     
    const hoverBgColor = currentStyles.buttonHoverBackgroundColor || 
                        campaign?.design?.quizConfig?.style?.buttonHoverBackgroundColor || 
                        DEFAULT_BTN_HOVER;
                        
    const activeBgColor = currentStyles.buttonActiveBackgroundColor || 
                         campaign?.design?.quizConfig?.style?.buttonActiveBackgroundColor || 
                         DEFAULT_BTN_ACTIVE;
    
    // Styles de base pour les réponses
    const answerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      minHeight: campaign?.design?.quizConfig?.style?.answerMinHeight || 'auto',
      padding: campaign?.design?.quizConfig?.style?.answerPadding || '12px 16px',
      margin: campaign?.design?.quizConfig?.style?.answerMargin || '8px 0',
      backgroundColor: bgColor,
      color: textColor,
      border: template.optionStyle?.border || 'none',
      borderRadius: unifiedBorderRadius,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box',
      whiteSpace: 'normal',
      overflow: 'visible',
      // Ajout pour assurer la compatibilité avec le texte long
      wordBreak: 'break-word',
      overflowWrap: 'break-word'
    };
                        
    console.log('🎨 Mise à jour des styles de bouton:', {
      bgColor,
      textColor,
      hoverBgColor,
      activeBgColor,
      width: `${template.style.containerWidth}px`,
      scale,
      device,
      source: {
        currentStyles,
        campaign: campaign?.design?.quizConfig?.style,
        template: template.optionStyle
      }
    });
    
    // Mettre à jour les styles des boutons avec les couleurs personnalisées
    const newButtonStyles = {
      normal: {
        ...answerStyle,
        backgroundColor: bgColor,
        color: textColor
      },
      hover: {
        ...answerStyle,
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: hoverBgColor,
        color: textColor
      },
      active: {
        ...answerStyle,
        transform: 'translateY(0)',
        boxShadow: 'none',
        backgroundColor: activeBgColor,
        color: textColor
      }
    };
    
    console.log('🎨 Nouveaux styles de bouton:', newButtonStyles);
    setButtonStyles(newButtonStyles);
  }, [
    currentStyles.buttonBackgroundColor,
    currentStyles.buttonTextColor,
    currentStyles.buttonHoverBackgroundColor,
    currentStyles.buttonActiveBackgroundColor,
    campaign?.design?.quizConfig?.style,
    template.optionStyle,
    unifiedBorderRadius
  ]);

  // Les styles d'option sont maintenant gérés directement dans le rendu
  
  // Appliquer les styles avec les surcharges de campagne
  const getResponsiveScale = () => {
    // Calculer le facteur d'échelle basé sur la largeur
    const baseWidth = template.style.containerWidth;
    let targetWidth: string;
    
    if (device === 'mobile') {
      targetWidth = currentStyles.mobileWidth || 
                   campaign?.design?.quizConfig?.style?.mobileWidth || 
                   currentStyles.width || 
                   campaign?.design?.quizConfig?.style?.width || 
                   `${baseWidth}px`;
    } else {
      targetWidth = currentStyles.width || 
                   campaign?.design?.quizConfig?.style?.width || 
                   `${baseWidth}px`;
    }
    
    // Extraire la valeur numérique de la largeur cible
    const targetWidthValue = parseInt(targetWidth.replace(/px|%/, ''));
    const scale = isNaN(targetWidthValue) ? 1 : targetWidthValue / baseWidth;
    
    console.log('🔍 Scale calculation:', {
      device,
      baseWidth,
      targetWidth,
      targetWidthValue,
      scale
    });
    
    return scale;
  };

  const scale = getResponsiveScale();

  // Calculer la couleur de fond avec opacité
  const getBackgroundWithOpacity = () => {
    const bgColor = currentStyles.backgroundColor || 
                   campaign?.design?.quizConfig?.style?.backgroundColor || 
                   template.style.backgroundColor || 
                   '#ffffff';
    
    const opacityValue = currentStyles.backgroundOpacity ?? 
                        campaign?.design?.quizConfig?.style?.backgroundOpacity ?? 
                        100;
    
    // Les valeurs 0 et 1 doivent être complètement transparentes
    const opacity = (opacityValue === 0 || opacityValue === 1) ? 0 : opacityValue / 100;
    
    // Convertir la couleur hex en rgba avec opacité
    if (bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Si c'est déjà une couleur rgba ou autre format, l'utiliser tel quel
    return bgColor;
  };

  const containerStyle: React.CSSProperties = {
    width: `${template.style.containerWidth}px`, // Largeur de base
    transform: `scale(${scale})`, // Appliquer l'échelle proportionnelle
    transformOrigin: 'center center', // Centrer la transformation
    position: 'relative', // Assurer un contexte d'empilement propre
    zIndex: 20, // Au-dessus du CanvasContextMenu (z-index: 1)
    height: currentStyles.height === 'auto' || !currentStyles.height
      ? 'auto'
      : currentStyles.height || 
        campaign?.design?.quizConfig?.style?.height || 
        'auto',
    background: getBackgroundWithOpacity(),
    borderRadius: unifiedBorderRadius,
    padding: typeof template.style.padding === 'number'
      ? `${template.style.padding}px`
      : template.style.padding,
    // Supprimer l'ombre si le fond est transparent (opacité 0 ou 1)
    boxShadow: (() => {
      const opacityValue = currentStyles.backgroundOpacity ?? 
                          campaign?.design?.quizConfig?.style?.backgroundOpacity ?? 
                          100;
      return (opacityValue === 0 || opacityValue === 1) ? 'none' : template.style.boxShadow;
    })(),
    fontFamily: template.style.fontFamily,
    margin: 'auto',
    overflow: 'hidden',
    color: currentStyles.textColor || 
           campaign?.design?.quizConfig?.style?.textColor || 
           template.questionStyle.color || 
           '#000000',
    ...(disabled && { pointerEvents: 'none', opacity: 0.5 }),
    // Assurer que le contenu est bien contenu et défilable si nécessaire
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    maxHeight: '100vh',
    boxSizing: 'border-box'
  };

  // Les styles de bouton sont maintenant utilisés directement via buttonStyles.normal, .hover, .active
  
   // Unused helper functions (commented out to avoid build warnings)
   /*
   function getHoverColor(color: string): string {
     if (!color || !color.startsWith('#')) return color || 'rgba(0,0,0,0.05)';
     try {
       const r = parseInt(color.slice(1, 3), 16);
       const g = parseInt(color.slice(3, 5), 16);
       const b = parseInt(color.slice(5, 7), 16);
       return `rgba(${Math.max(0, r - 25)}, ${Math.max(0, g - 25)}, ${Math.max(0, b - 25)}, 0.9)`;
     } catch (e) {
       return color || 'rgba(0,0,0,0.05)';
     }
   }
   */
  
  /**
   * Assombrit une couleur pour l'état actif (plus foncé que hover)
   * @param color Couleur au format hexadécimal (#RRGGBB) 
   * @returns Couleur assombrie au format rgba()
   */
  /*
  function getActiveColor(color: string): string {
    // Si la couleur est invalide ou n'est pas en hexadécimal, retourner une valeur par défaut
    if (!color || !color.startsWith('#')) return color || 'rgba(0,0,0,0.1)';
    
    try {
      // Convertir la couleur hexadécimale en valeurs RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Assombrir de 20% pour l'état actif (plus foncé que hover)
      return `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, 0.9)`;
    } catch (e) {
      console.error('Erreur lors du calcul de la couleur active:', e);
      return color || 'rgba(0,0,0,0.1)';
    }
  }
  */

  const questionStyle: React.CSSProperties = {
    textAlign: template.questionStyle.textAlign || 'left',
    fontSize: `${template.questionStyle.fontSize || 16}px`,
    fontWeight: template.questionStyle.fontWeight || 600,
    margin: '0 0 16px 0',
    padding: campaign?.design?.quizConfig?.style?.questionPadding || '12px',
    color: currentStyles.textColor || 
           campaign?.design?.quizConfig?.style?.textColor || 
           template.questionStyle.color || 
           '#000000',
    wordWrap: campaign?.design?.quizConfig?.style?.questionTextWrap || 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    width: '100%',
    ...(template.questionStyle.background && { 
      background: template.questionStyle.background 
    }),
    ...(template.questionStyle.border && { 
      border: template.questionStyle.border 
    }),
    borderRadius: unifiedBorderRadius,
    boxSizing: 'border-box'
  };

  const imageStyle: React.CSSProperties = template.imageStyle ? {
    width: template.imageStyle.width,
    borderRadius: unifiedBorderRadius,
    border: template.imageStyle.border,
    marginBottom: `${template.imageStyle.marginBottom}px`,
    display: 'block',
    maxWidth: '100%',
    height: 'auto'
  } : {};

  // Styles pour les lettres (badges) des options
  const letterStyle: React.CSSProperties = {
    border: template.letterStyle.border || 'none',
    borderRadius: unifiedBorderRadius,
    minWidth: `${template.letterStyle.width || 24}px`,
    height: `${template.letterStyle.height || 24}px`,
    display: template.letterStyle.display || 'flex',
    alignItems: template.letterStyle.alignItems || 'center',
    justifyContent: template.letterStyle.justifyContent || 'center',
    marginRight: `${template.letterStyle.marginRight || 12}px`,
    fontWeight: template.letterStyle.fontWeight || 'bold',
    backgroundColor: template.letterStyle.backgroundColor || 'rgba(0,0,0,0.1)',
    color: template.letterStyle.color || '#000000',
    flexShrink: 0
  };

  // Render grid layout for City of Light template
  const renderGridLayout = () => {
    if (!template.hasGrid) return null;
    
    return (
      <div style={{
        background: template.panelStyle?.background || '#ffffff',
        border: template.panelStyle?.border || '1.5px solid #8E8E8E',
        borderRadius: unifiedBorderRadius,
        padding: template.panelStyle?.padding || '18px',
        marginTop: '16px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${template.gridStyle?.columns || 2}, 1fr)`,
          gap: template.gridStyle?.gap || '16px',
          width: '100%'
        }}>
          {answers.slice(0, 4).map((answer: any, index: number) => (
            <button
              key={index}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                ...template.cardStyle
              }}
              onClick={onClick}
              onMouseUp={() => onAnswerSelected?.(!!answer.isCorrect)}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.transform = 'translateY(-2px)';
                target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.transform = '';
                target.style.boxShadow = '';
              }}
            >
              <div style={{
                border: template.imageStyle?.border || '2px solid #6FA8DC',
                borderRadius: unifiedBorderRadius,
                overflow: 'hidden',
                boxShadow: '0 3px 0 rgba(0,0,0,0.2)'
              }}>
                <img
                  src={answer.image || "/api/placeholder/300/200"}
                  alt={answer.text || `Option ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='14'%3EImage %23${index + 1}%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div style={{
                background: currentStyles.buttonBackgroundColor || 
                          campaign?.design?.quizConfig?.style?.buttonBackgroundColor || 
                          template.captionStyle?.background || 
                          '#F0C96A',
                color: currentStyles.buttonTextColor || 
                       campaign?.design?.quizConfig?.style?.buttonTextColor || 
                       template.captionStyle?.color || 
                       '#111',
                borderRadius: unifiedBorderRadius,
                padding: template.captionStyle?.padding || '8px 10px',
                fontWeight: 800,
                textTransform: 'uppercase' as const,
                textAlign: 'center' as const,
                boxShadow: '0 3px 0 rgba(0,0,0,0.25)',
                marginTop: '8px',
                fontSize: '14px',
                letterSpacing: '0.2px',
                whiteSpace: 'normal',
                overflow: 'visible',
                wordWrap: 'break-word',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {letters[index]}. {answer.text || `Option ${index + 1}`}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render standard options layout
  const renderStandardOptions = () => {
    if (template.hasGrid) return null;
    
    return (
      <div>
        {answers.map((answer: any, index: number) => {
          // Styles pour la lettre
          const letterButtonStyle: React.CSSProperties = {
            ...letterStyle,
            background: buttonStyles.normal.backgroundColor as string,
            color: buttonStyles.normal.color as string,
            marginRight: '8px',
            // Assurer que la lettre est bien centrée
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          };

          return (
            <div
              key={index}
              style={{
                ...buttonStyles.normal,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                // S'assurer que le texte est correctement aligné et peut s'étendre
                alignItems: 'center',
                textAlign: 'left',
                // Permettre le retour à la ligne
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                // Assurer que le contenu est bien affiché
                display: 'flex',
                flexDirection: 'row',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement;
                // Appliquer l'effet de survol avec la couleur personnalisée
                Object.assign(target.style, buttonStyles.hover);
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                // Réinitialiser à l'état normal avec les couleurs personnalisées
                Object.assign(target.style, buttonStyles.normal);
              }}
              onMouseDown={(e) => {
                const target = e.currentTarget as HTMLElement;
                // Appliquer l'effet d'enfoncement avec la couleur active personnalisée
                Object.assign(target.style, buttonStyles.active);
                
                // Gérer le relâchement de la souris
                const onMouseUp = () => {
                  document.removeEventListener('mouseup', onMouseUp);
                  // Revenir à l'état survolé
                  Object.assign(target.style, buttonStyles.hover);
                };
                document.addEventListener('mouseup', onMouseUp, { once: true });
              }}
              onClick={onClick}
              onMouseUp={() => onAnswerSelected?.(!!answer.isCorrect)}
              role="button"
              tabIndex={0}
            >
              {template.letterStyle.display !== 'none' && (
                <span style={letterButtonStyle}>
                  {letters[index]}
                </span>
              )}
              <div className="flex-1 min-w-0" style={{ marginLeft: template.letterStyle.display === 'none' ? 0 : '8px', padding: '8px 0' }}>
                <span className="block w-full break-words whitespace-normal">
                  {answer.text || `Option ${index + 1}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div id="quiz-preview-container" style={containerStyle}>
        {/* Optional header/banner */}
        {template.header && (
          <div
            style={{
              height: `${template.header.height}px`,
              background: template.header.backgroundColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                template.header.align === 'left'
                  ? 'flex-start'
                  : template.header.align === 'right'
                  ? 'flex-end'
                  : 'center',
              padding: '0 16px',
              // Suivre exactement l'arrondi du conteneur pour couvrir parfaitement les coins
              borderRadius: `${unifiedBorderRadius} ${unifiedBorderRadius} 0 0`,
              margin: '-16px -16px 16px -16px',
              width: 'calc(100% + 32px)'
            }}
          >
            <span
              style={{
                color: template.header.textColor || '#ffffff',
                fontSize: `${template.header.fontSize || 16}px`,
                fontWeight: template.header.fontWeight || 600,
                padding: '0 16px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: (template.header.align as 'left' | 'center' | 'right') || 'center'
              }}
            >
              {currentQuestion.question || template.header.text || ''}
            </span>
          </div>
        )}
        {/* Question (only shown for non-header templates) */}
        {!template.header && (
          <h2 style={questionStyle}>
            {currentQuestion.question || "What is shown in the picture?"}
          </h2>
        )}
        {/* Image (if template supports it and image exists) */}
        {template.hasImage && !template.hasGrid && (currentQuestion.image || template.id === 'image-quiz') && (
          <img
            style={imageStyle}
            src={currentQuestion.image || "/api/placeholder/400/200"}
            alt="Question image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='16'%3EImage placeholder%3C/text%3E%3C/svg%3E";
            }}
          />
        )}
        {/* Render appropriate options layout */}
        {template.hasGrid ? renderGridLayout() : renderStandardOptions()}
        {/* Empty state */}
        {questions.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', marginBottom: '4px' }}>Aucune question configurée</p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Cliquez pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatedQuiz;
