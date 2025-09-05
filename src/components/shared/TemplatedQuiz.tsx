import React, { useState, useEffect } from 'react';
import { quizTemplates } from '../../types/quizTemplates';

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
  
  // Écouter les mises à jour de style du quiz
  const [currentStyles, setCurrentStyles] = useState({
    backgroundColor: '',
    textColor: '',
    borderRadius: '',
    buttonBackgroundColor: '',
    buttonTextColor: '',
    buttonHoverBackgroundColor: '',
    buttonActiveBackgroundColor: ''
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

  useEffect(() => {
    const handleQuizStyleUpdate = (event: CustomEvent) => {
      console.log('🔄 TemplatedQuiz reçoit mise à jour de style:', event.detail);
      
      setCurrentStyles(prev => ({
        ...prev,
        ...event.detail
      }));
      
      // Forcer un re-render pour s'assurer que les styles sont appliqués
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('quizStyleUpdate', handleQuizStyleUpdate as EventListener);
    return () => window.removeEventListener('quizStyleUpdate', handleQuizStyleUpdate as EventListener);
  }, []);
  
  // Mettre à jour les styles lorsque la campagne change
  useEffect(() => {
    if (campaign?.design?.quizConfig?.style) {
      setCurrentStyles(prev => ({
        ...prev,
        ...campaign.design.quizConfig.style
      }));
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
    const bgColor = currentStyles.buttonBackgroundColor || 
                   campaign?.design?.quizConfig?.style?.buttonBackgroundColor || 
                   template.optionStyle?.backgroundColor || 
                   '#4f46e5';
                   
    const textColor = currentStyles.buttonTextColor || 
                     campaign?.design?.quizConfig?.style?.buttonTextColor || 
                     template.optionStyle?.color || 
                     '#ffffff';
                     
    const hoverBgColor = currentStyles.buttonHoverBackgroundColor || 
                        campaign?.design?.quizConfig?.style?.buttonHoverBackgroundColor || 
                        getHoverColor(bgColor);
                        
    const activeBgColor = currentStyles.buttonActiveBackgroundColor || 
                         campaign?.design?.quizConfig?.style?.buttonActiveBackgroundColor || 
                         getActiveColor(bgColor);
    
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
      border: template.optionStyle?.border || '1px solid #e5e7eb',
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

  // Définir les styles d'option avant de les utiliser
  const optionStyle: React.CSSProperties = {
    display: template.optionStyle.display || 'flex',
    alignItems: template.optionStyle.alignItems || 'center',
    border: template.optionStyle.border || '1px solid #e5e7eb',
    borderRadius: unifiedBorderRadius,
    padding: template.optionStyle.padding || '12px 16px',
    margin: template.optionStyle.margin || '8px 0',
    backgroundColor: currentStyles.buttonBackgroundColor || 
                   campaign?.design?.quizConfig?.style?.buttonBackgroundColor || 
                   template.optionStyle.backgroundColor || 
                   'transparent',
    color: currentStyles.buttonTextColor || 
           campaign?.design?.quizConfig?.style?.buttonTextColor || 
           template.optionStyle.color || 
           'inherit',
    cursor: template.optionStyle.cursor || 'pointer',
    transition: template.optionStyle.transition || 'all 0.2s ease',
    width: '100%',
    fontSize: typeof template.optionStyle.fontSize === 'number' ? `${template.optionStyle.fontSize}px` : template.optionStyle.fontSize,
    fontWeight: template.optionStyle.fontWeight
  };
  
  // Appliquer les styles avec les surcharges de campagne
  const containerStyle: React.CSSProperties = {
    width: `${template.style.containerWidth}px`,
    background: currentStyles.backgroundColor || 
               campaign?.design?.quizConfig?.style?.backgroundColor || 
               template.style.backgroundColor || 
               '#ffffff',
    borderRadius: unifiedBorderRadius,
    padding: typeof template.style.padding === 'number'
      ? `${template.style.padding}px`
      : template.style.padding,
    boxShadow: template.style.boxShadow,
    fontFamily: template.style.fontFamily,
    margin: 'auto',
    overflow: 'hidden',
    color: currentStyles.textColor || 
           campaign?.design?.quizConfig?.style?.textColor || 
           template.questionStyle.color || 
           '#000000',
    ...(disabled && { pointerEvents: 'none', opacity: 0.5 })
  };

  // Utiliser les styles de bouton mis en cache
  const { normal: buttonBaseStyle, hover: buttonHoverStyle, active: buttonActiveStyle } = buttonStyles;
  
  /**
   * Assombrit une couleur pour l'état hover
   * @param color Couleur au format hexadécimal (#RRGGBB)
   * @returns Couleur assombrie au format rgba()
   */
  function getHoverColor(color: string): string {
    // Si la couleur est invalide ou n'est pas en hexadécimal, retourner une valeur par défaut
    if (!color || !color.startsWith('#')) return color || 'rgba(0,0,0,0.05)';
    
    try {
      // Convertir la couleur hexadécimale en valeurs RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Assombrir de 10% pour l'état hover
      return `rgba(${Math.max(0, r - 25)}, ${Math.max(0, g - 25)}, ${Math.max(0, b - 25)}, 0.9)`;
    } catch (e) {
      console.error('Erreur lors du calcul de la couleur hover:', e);
      return color || 'rgba(0,0,0,0.05)';
    }
  }
  
  /**
   * Assombrit une couleur pour l'état actif (plus foncé que hover)
   * @param color Couleur au format hexadécimal (#RRGGBB)
   * @returns Couleur assombrie au format rgba()
   */
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
    
    // Récupérer les couleurs personnalisées
    const bgColor = currentStyles.buttonBackgroundColor || 
                   campaign?.design?.quizConfig?.style?.buttonBackgroundColor || 
                   template.optionStyle?.backgroundColor || 
                   '#4f46e5';
    const textColor = currentStyles.buttonTextColor || 
                     campaign?.design?.quizConfig?.style?.buttonTextColor || 
                     template.optionStyle?.color || 
                     '#ffffff';
    const hoverBgColor = currentStyles.buttonHoverBackgroundColor || 
                        campaign?.design?.quizConfig?.style?.buttonHoverBackgroundColor || 
                        getHoverColor(bgColor);
    
    return (
      <div>
        {answers.map((answer: any, index: number) => {
          // Styles pour la lettre
          const letterButtonStyle = {
            ...letterStyle,
            backgroundColor: bgColor,
            color: textColor,
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
                ...buttonBaseStyle,
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
                // Appliquer les styles personnalisés
                backgroundColor: bgColor,
                color: textColor,
                border: template.optionStyle?.border || '1px solid #e5e7eb',
                borderRadius: unifiedBorderRadius,
                // Espacement interne pour le texte
                padding: campaign?.design?.quizConfig?.style?.answerPadding || '12px 16px',
                // Marge entre les réponses
                margin: campaign?.design?.quizConfig?.style?.answerMargin || '8px 0',
                // Hauteur minimale pour les réponses
                minHeight: campaign?.design?.quizConfig?.style?.answerMinHeight || 'auto',
                // Assurer que le contenu est bien affiché
                display: 'flex',
                flexDirection: 'row',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement;
                // Appliquer l'effet de survol avec la couleur personnalisée
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                target.style.backgroundColor = hoverBgColor;
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                // Réinitialiser à l'état normal avec les couleurs personnalisées
                target.style.transform = '';
                target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                target.style.backgroundColor = bgColor;
              }}
              onMouseDown={(e) => {
                const target = e.currentTarget as HTMLElement;
                // Appliquer l'effet d'enfoncement avec la couleur active personnalisée
                const activeBgColor = currentStyles.buttonActiveBackgroundColor || 
                                   campaign?.design?.quizConfig?.style?.buttonActiveBackgroundColor || 
                                   getActiveColor(bgColor);
                target.style.transform = 'translateY(1px)';
                target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                target.style.backgroundColor = activeBgColor;
                
                // Gérer le relâchement de la souris
                const onMouseUp = () => {
                  document.removeEventListener('mouseup', onMouseUp);
                  // Revenir à l'état survolé
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  target.style.backgroundColor = hoverBgColor;
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
      <div style={containerStyle}>
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
              borderRadius: '18px 18px 0 0',
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
