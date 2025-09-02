import React from 'react';
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
  // Debug logs
  console.log('🎯 TemplatedQuiz render:', { templateId, campaign: campaign?.gameConfig?.quiz?.templateId });
  
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

  // Generate styles based on template
  const containerStyle: React.CSSProperties = {
    width: `${template.style.containerWidth}px`,
    background: template.style.backgroundColor,
    borderRadius: `${template.style.borderRadius}px`,
    padding: `${template.style.padding}px`,
    boxShadow: template.style.boxShadow,
    fontFamily: template.style.fontFamily,
    margin: 'auto',
    ...(disabled && { pointerEvents: 'none', opacity: 0.5 })
  };

  const questionStyle: React.CSSProperties = {
    textAlign: template.questionStyle.textAlign,
    fontSize: `${template.questionStyle.fontSize}px`,
    fontWeight: template.questionStyle.fontWeight,
    marginBottom: `${template.questionStyle.marginBottom}px`,
    color: template.questionStyle.color
  };

  const imageStyle: React.CSSProperties = template.imageStyle ? {
    width: template.imageStyle.width,
    borderRadius: `${template.imageStyle.borderRadius}px`,
    border: template.imageStyle.border,
    marginBottom: `${template.imageStyle.marginBottom}px`,
    display: 'block'
  } : {};

  const optionStyle: React.CSSProperties = {
    display: template.optionStyle.display,
    alignItems: template.optionStyle.alignItems,
    border: template.optionStyle.border,
    borderRadius: `${template.optionStyle.borderRadius}px`,
    padding: template.optionStyle.padding,
    margin: template.optionStyle.margin,
    fontSize: `${template.optionStyle.fontSize}px`,
    fontWeight: template.optionStyle.fontWeight,
    cursor: template.optionStyle.cursor,
    transition: template.optionStyle.transition
  };

  const letterStyle: React.CSSProperties = {
    border: template.letterStyle.border,
    borderRadius: template.letterStyle.borderRadius,
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

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div style={containerStyle}>
        {/* Question */}
        <h2 style={questionStyle}>
          {currentQuestion.question || "What is shown in the picture?"}
        </h2>

        {/* Image (if template supports it and image exists) */}
        {template.hasImage && (currentQuestion.image || template.id === 'image-quiz') && (
          <img
            style={imageStyle}
            src={currentQuestion.image || "/api/placeholder/400/200"}
            alt="Question image"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='16'%3EImage placeholder%3C/text%3E%3C/svg%3E";
            }}
          />
        )}

        {/* Options */}
        <div>
          {answers.map((answer: any, index: number) => (
            <div
              key={index}
              style={optionStyle}
              onClick={onClick}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = template.optionStyle.hoverBackground;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <span style={letterStyle}>
                {letters[index]}.
              </span>
              <span>{answer.text || `Option ${index + 1}`}</span>
            </div>
          ))}
        </div>

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
