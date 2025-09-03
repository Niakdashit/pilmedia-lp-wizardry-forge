import React, { useState, useEffect } from 'react';
import { quizTemplates } from '../../types/quizTemplates';

interface TemplatedQuizProps {
  campaign?: any;
  device?: 'desktop' | 'tablet' | 'mobile';
  disabled?: boolean;
  onClick?: () => void;
  templateId?: string;
}

const TemplatedQuiz: React.FC<TemplatedQuizProps> = ({
  campaign,
  device = 'desktop',
  disabled = false,
  onClick,
  templateId = 'image-quiz' // Default to the image template as requested
}) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Écouter les mises à jour de style du quiz
  useEffect(() => {
    const handleQuizStyleUpdate = (event: CustomEvent) => {
      console.log('🔄 TemplatedQuiz reçoit mise à jour de style:', event.detail);
      setForceUpdate((prev: number) => prev + 1);
    };
    
    window.addEventListener('quizStyleUpdate', handleQuizStyleUpdate as EventListener);
    return () => window.removeEventListener('quizStyleUpdate', handleQuizStyleUpdate as EventListener);
  }, []);
  
  // Debug logs
  console.log('🎯 TemplatedQuiz render:', { templateId, campaign: campaign?.gameConfig?.quiz?.templateId, forceUpdate });
  
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

  // Generate styles based on template with campaign overrides
  const campaignStyle = campaign?.design?.quizConfig?.style || {};
  console.log('🔍 [TemplatedQuiz] Style overrides:', {
    campaignBorderRadius: campaignStyle.borderRadius,
    templateBorderRadius: template.style.borderRadius,
    appliedBorderRadius: campaignStyle.borderRadius || template.style.borderRadius
  });
  console.log('🎨 Campaign style overrides:', campaignStyle);
  
  // Calculer le borderRadius uniforme pour tous les éléments
  const unifiedBorderRadius = campaignStyle.borderRadius || (typeof template.style.borderRadius === 'number' 
    ? `${template.style.borderRadius}px` 
    : template.style.borderRadius);
  
  const containerStyle: React.CSSProperties = {
    width: `${template.style.containerWidth}px`,
    background: template.style.backgroundColor,
    borderRadius: unifiedBorderRadius,
    padding: typeof template.style.padding === 'number'
      ? `${template.style.padding}px`
      : template.style.padding,
    boxShadow: template.style.boxShadow,
    fontFamily: template.style.fontFamily,
    margin: 'auto',
    overflow: 'hidden',
    ...(disabled && { pointerEvents: 'none', opacity: 0.5 })
  };

  const questionStyle: React.CSSProperties = {
    textAlign: template.questionStyle.textAlign,
    fontSize: `${template.questionStyle.fontSize}px`,
    fontWeight: template.questionStyle.fontWeight,
    marginBottom: `${template.questionStyle.marginBottom}px`,
    color: template.questionStyle.color,
    ...(template.questionStyle.background && { background: template.questionStyle.background }),
    ...(template.questionStyle.border && { border: template.questionStyle.border }),
    ...(template.questionStyle.borderRadius && { 
      borderRadius: unifiedBorderRadius
    }),
    ...(template.questionStyle.padding && { padding: template.questionStyle.padding })
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

  const optionStyle: React.CSSProperties = {
    display: template.optionStyle.display,
    alignItems: template.optionStyle.alignItems,
    border: template.optionStyle.border,
    borderRadius: unifiedBorderRadius,
    padding: template.optionStyle.padding,
    margin: template.optionStyle.margin,
    fontSize: `${template.optionStyle.fontSize}px`,
    fontWeight: template.optionStyle.fontWeight,
    cursor: template.optionStyle.cursor,
    transition: template.optionStyle.transition,
    ...(template.optionStyle.hoverBackground && { 
      '&:hover': { 
        backgroundColor: template.optionStyle.hoverBackground 
      } 
    })
  };

  // Clean up unused style variables since we're using them inline

  const letterStyle: React.CSSProperties = {
    border: template.letterStyle.border,
    borderRadius: unifiedBorderRadius,
    width: `${template.letterStyle.width}px`,
    height: `${template.letterStyle.height}px`,
    display: template.letterStyle.display,
    alignItems: template.letterStyle.alignItems,
    justifyContent: template.letterStyle.justifyContent,
    marginRight: `${template.letterStyle.marginRight}px`,
    fontWeight: template.letterStyle.fontWeight,
    backgroundColor: template.letterStyle.backgroundColor,
    color: template.letterStyle.color
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
                transition: 'transform 0.15s ease',
                ...template.cardStyle
              }}
              onClick={onClick}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
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
                background: template.captionStyle?.background || '#F0C96A',
                color: template.captionStyle?.color || '#111',
                borderRadius: unifiedBorderRadius,
                padding: template.captionStyle?.padding || '8px 10px',
                fontWeight: 800,
                textTransform: 'uppercase' as const,
                textAlign: 'center' as const,
                boxShadow: '0 3px 0 rgba(0,0,0,0.25)',
                marginTop: '8px',
                fontSize: '14px',
                letterSpacing: '0.2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
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
        {answers.map((answer: any, index: number) => (
          <div
            key={index}
            style={{
              ...optionStyle,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
              if ('hoverBackground' in template.optionStyle) {
                (e.currentTarget as HTMLElement).style.backgroundColor = template.optionStyle.hoverBackground as string;
              }
            }}
            onMouseLeave={(e) => {
              if ('hoverBackground' in template.optionStyle) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            {template.letterStyle.display !== 'none' && (
              <span style={letterStyle}>
                {letters[index]}.
              </span>
            )}
            <span>{answer.text || `Option ${index + 1}`}</span>
          </div>
        ))}
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
