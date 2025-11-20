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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
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
    // New: alignments controlled from toolbar
    questionTextAlign?: 'left' | 'center' | 'right' | 'justify';
    optionsTextAlign?: 'left' | 'center' | 'right' | 'justify';
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
  const currentQuestion = questions[currentQuestionIndex] || {};
  const answers = currentQuestion.answers || [];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // Fonction pour gérer la sélection d'une réponse
  const handleAnswerClick = (isCorrect: boolean) => {
    console.log('🎯 [TemplatedQuiz] Answer clicked:', { 
      currentQuestionIndex, 
      totalQuestions: questions.length, 
      isCorrect 
    });
    
    // Notifier la réponse sélectionnée
    onAnswerSelected?.(isCorrect);
    
    // Si c'est la dernière question, appeler onClick pour passer à l'étape suivante
    if (currentQuestionIndex >= questions.length - 1) {
      console.log('✅ [TemplatedQuiz] Last question answered, calling onClick');
      onClick?.();
    } else {
      // Sinon, passer à la question suivante
      console.log('➡️ [TemplatedQuiz] Moving to next question');
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

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
    let scale = isNaN(targetWidthValue) ? 1 : targetWidthValue / baseWidth;

    // Pour le template "This or That" en mode mobile, appliquer un zoom supplémentaire
    // pour que la carte occupe plus de largeur dans le téléphone, mais légèrement réduit (~+30%).
    if (device === 'mobile' && template.id === 'this-or-that') {
      scale = scale * 1.3;
    }
    
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
    // Ne pas masquer l'image de fond d'écran: par défaut, fond transparent
    // N'appliquer une couleur que si elle est explicitement définie par l'utilisateur ou la campagne
    const explicitBg = currentStyles.backgroundColor ||
                       campaign?.design?.quizConfig?.style?.backgroundColor ||
                       template.style.backgroundColor ||
                       '#ffffff';

    const opacityValue = currentStyles.backgroundOpacity ??
                        campaign?.design?.quizConfig?.style?.backgroundOpacity ??
                        100;

    // Utiliser directement le pourcentage 0..100 -> 0..1
    const opacity = Math.max(0, Math.min(1, Number(opacityValue) / 100));

    // Convertir la couleur hex en rgba avec opacité
    if (explicitBg.startsWith('#')) {
      const r = parseInt(explicitBg.slice(1, 3), 16);
      const g = parseInt(explicitBg.slice(3, 5), 16);
      const b = parseInt(explicitBg.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // Si c'est déjà une couleur rgba ou autre format, l'utiliser tel quel
    return explicitBg;
  };

  // Helper: apply alpha to a color (supports #RRGGBB and rgba)
  const applyOpacityToColor = (color?: string, alpha?: number): string | undefined => {
    if (!color) return color;
    if (alpha == null) return color;
    if (color.startsWith('#')) {
      try {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } catch {
        return color;
      }
    }
    if (color.startsWith('rgba')) {
      return color.replace(/rgba\(([^)]+)\)/, (_, inner) => {
        const parts = inner.split(',').map((p: string) => p.trim());
        const [r, g, b] = parts;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      });
    }
    if (color.startsWith('rgb(')) {
      return color.replace(/rgb\(([^)]+)\)/, (_, inner) => `rgba(${inner}, ${alpha})`);
    }
    return color;
  };

  const containerStyle: React.CSSProperties = {
    // Sur mobile, utiliser toute la largeur disponible (safe zone) sans scaling.
    // Sur desktop/tablette, conserver la largeur de base + transform scale.
    width: device === 'mobile' ? '100%' : `${template.style.containerWidth}px`,
    transform: device === 'mobile' ? undefined : `scale(${scale})`,
    transformOrigin: device === 'mobile' ? undefined : 'center center',
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
      const alpha = Math.max(0, Math.min(1, Number(opacityValue) / 100));
      return alpha === 0 ? 'none' : template.style.boxShadow;
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
  
  /**
   * Assombrit une couleur pour l'état hover
   * @param color Couleur au format hexadécimal (#RRGGBB)
   * @returns Couleur assombrie au format rgba()
   */
  // Removed unused hover color utility function (fixed syntax)

  const questionStyle: React.CSSProperties = {
    textAlign: (currentStyles.questionTextAlign || campaign?.design?.quizConfig?.style?.questionTextAlign || template.questionStyle.textAlign || 'left') as any,
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
      background: (() => {
        const qOpacityValue = currentStyles.backgroundOpacity ??
                               campaign?.design?.quizConfig?.style?.backgroundOpacity ??
                               100;
        const qAlpha = Math.max(0, Math.min(1, Number(qOpacityValue) / 100));
        return applyOpacityToColor(template.questionStyle.background as string, qAlpha) as any;
      })()
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
    // Compute effective alpha from style or campaign (same rule as container)
    const panelOpacityValue = currentStyles.backgroundOpacity ??
                              campaign?.design?.quizConfig?.style?.backgroundOpacity ??
                              100;
    const panelAlpha = Math.max(0, Math.min(1, Number(panelOpacityValue) / 100));
    // Choose a base color priority: explicit bg from styles, then campaign, then template default
    const basePanelBg = currentStyles.backgroundColor ||
                        campaign?.design?.quizConfig?.style?.backgroundColor ||
                        (template.panelStyle?.background as string) ||
                        '#ffffff';
    const effectivePanelBg = applyOpacityToColor(basePanelBg, panelAlpha);

    return (
      <div style={{
        background: effectivePanelBg,
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
              onClick={() => handleAnswerClick(!!answer.isCorrect)}
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
                textAlign: ((currentStyles.optionsTextAlign || campaign?.design?.quizConfig?.style?.optionsTextAlign || 'center')) as any,
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
                justifyContent: (() => {
                  const a = (currentStyles.optionsTextAlign || campaign?.design?.quizConfig?.style?.optionsTextAlign || 'center');
                  return a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : a === 'justify' ? 'space-between' : 'center';
                })()
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

    // Custom fullscreen layout for "This or That" template
    if (template.id === 'this-or-that') {
      const splitAnswers = answers.slice(0, 2);

      return (
        <div style={{ position: 'relative', marginTop: '8px' }}>
          {/* OU circle */}
          {splitAnswers.length >= 2 && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '4px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(15,23,42,0.18)'
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#111827'
                  }}
                >
                  OU
                </span>
              </div>
            </div>
          )}

          {splitAnswers.map((answer: any, index: number) => {
            const defaultColors = ['#8BC34A', '#FFC107', '#03A9F4', '#E91E63'];
            const bgColor = (answer as any).color || defaultColors[index % defaultColors.length];
            const answerImage = (answer as any).image;

            const handleClick = () => handleAnswerClick(!!answer.isCorrect);

            const baseMinHeight = 260;
            // Sur mobile, hauteur très légèrement étirée (~+5% vs base)
            const minHeight = device === 'mobile' ? Math.round(baseMinHeight * 1.05) : baseMinHeight;

            return (
              <button
                key={index}
                onClick={handleClick}
                disabled={disabled}
                style={{
                  width: '100%',
                  // Hauteur étirée, avec +25% uniquement sur le sélecteur mobile
                  minHeight,
                  border: 'none',
                  borderRadius: index === 0 ? '24px 24px 0 0' : '0 0 24px 24px',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: bgColor,
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'transform 0.15s ease',
                  transform: disabled ? 'none' : undefined
                }}
              >
                {answerImage ? (
                  // Image en plein centre avec marges internes
                  <div
                    style={{
                      position: 'absolute',
                      // Marges réduites pour que l'image occupe plus de hauteur
                      top: '6%',
                      bottom: '6%',
                      left: '8%',
                      right: '8%',
                      backgroundImage: `url(${answerImage})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: 'contain'
                    }}
                  />
                ) : (
                  // Fallback texte si aucune image
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      fontWeight: 900,
                      letterSpacing: '0.16em',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 4 }}>{answer.text?.split(' ')[0] || `Réponse ${index + 1}`}</div>
                    <div style={{ fontSize: 18 }}>{answer.text?.split(' ').slice(1).join(' ')}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // Default: normal button list
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
                textAlign: (currentStyles.optionsTextAlign || campaign?.design?.quizConfig?.style?.optionsTextAlign || 'left') as any,
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
              onClick={() => handleAnswerClick(!!answer.isCorrect)}
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
    <div
      className="w-full h-full flex justify-center p-4"
      style={{ alignItems: template.id === 'this-or-that' ? 'flex-start' : 'center' }}
    >
      <div id="quiz-preview-container" style={containerStyle}>
        {/* Progress indicator */}
        {questions.length > 1 && (
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: currentStyles.textColor || campaign?.design?.quizConfig?.style?.textColor || '#6b7280',
            marginBottom: '12px',
            fontWeight: 500
          }}>
            Question {currentQuestionIndex + 1} sur {questions.length}
          </div>
        )}
        
        {/* Optional header/banner */}
        {template.header && (
          <div
            style={{
              background: (template.header as any).background || template.header.backgroundColor || '#3B82F6',
              padding: (template.header as any).padding || '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: template.header.align || 'center',
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
                textAlign: (currentStyles.questionTextAlign || campaign?.design?.quizConfig?.style?.questionTextAlign || (template.header.align as 'left' | 'center' | 'right') || 'center') as any
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
