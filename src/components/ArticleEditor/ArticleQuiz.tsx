import React, { useState } from 'react';

interface ArticleQuizProps {
  campaign: any;
  onComplete?: (result: any) => void;
}

// Questions par défaut si aucune n'est configurée
const defaultQuestions = [
  {
    question: "Quel est votre type de peau ?",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=400&fit=crop",
    answers: [
      { text: "Peau normale", isCorrect: true },
      { text: "Peau sèche", isCorrect: true },
      { text: "Peau grasse", isCorrect: true },
      { text: "Peau mixte", isCorrect: true }
    ]
  },
  {
    question: "Quelle est votre principale préoccupation beauté ?",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=400&fit=crop",
    answers: [
      { text: "Anti-âge", isCorrect: true },
      { text: "Hydratation", isCorrect: true },
      { text: "Éclat du teint", isCorrect: true },
      { text: "Imperfections", isCorrect: true }
    ]
  },
  {
    question: "À quelle fréquence utilisez-vous des soins du visage ?",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=400&fit=crop",
    answers: [
      { text: "Tous les jours", isCorrect: true },
      { text: "Plusieurs fois par semaine", isCorrect: true },
      { text: "Une fois par semaine", isCorrect: true },
      { text: "Rarement", isCorrect: true }
    ]
  }
];

const ArticleQuiz: React.FC<ArticleQuizProps> = ({ campaign, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [hoveredAnswer, setHoveredAnswer] = useState<number | null>(null);

  // Utiliser les questions configurées dans l'onglet "Jeu" du QuizEditor
  // (campaign.gameConfig.quiz.questions) avec fallback sur les questions par défaut
  const questions =
    Array.isArray(campaign?.gameConfig?.quiz?.questions) &&
    campaign.gameConfig.quiz.questions.length > 0
      ? campaign.gameConfig.quiz.questions
      : defaultQuestions;
  
  // Lire le style de bouton configuré dans l'onglet Styles
  const buttonStyle = campaign?.gameConfig?.quiz?.buttonStyle || 'radio';
  
  // Debug: afficher la config reçue
  console.log('🎨 [ArticleQuiz] Button style:', {
    buttonStyle,
    fullQuizConfig: campaign?.gameConfig?.quiz,
    campaignId: campaign?.id,
    questionsWithImages: questions.map((q: any) => ({
      question: q.question,
      answers: q.answers?.map((a: any) => ({
        text: a.text,
        hasImage: !!a.image,
        imagePreview: a.image?.substring(0, 50),
        color: a.color
      }))
    }))
  });
  
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune question disponible</p>
      </div>
    );
  }

  const handleAnswerClick = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);

    // Passer à la question suivante après un court délai
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Quiz terminé
        const score = selectedAnswers.filter((answer, idx) => {
          return questions[idx]?.answers?.[answer]?.isCorrect;
        }).length;
        
        onComplete?.({
          score,
          total: questions.length,
          win: score >= Math.ceil(questions.length / 2)
        });
      }
    }, 300);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-8" style={{ backgroundColor: '#ffffff', paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Numéro de question - Style article */}
      <div className="text-center mb-6">
        <span style={{
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.1em',
          color: '#6b7280',
          textTransform: 'uppercase'
        }}>
          Question {currentQuestionIndex + 1} sur {questions.length}
        </span>
      </div>

      {/* Image de la question (configurée dans l'onglet Jeu) */}
      {currentQuestion.image && (
        <div className="mb-8 flex justify-center">
          <img
            src={currentQuestion.image}
            alt={currentQuestion.question || 'Question image'}
            className="w-full max-w-3xl rounded-xl object-cover"
            style={{ maxHeight: '260px' }}
          />
        </div>
      )}

      {/* Question - Style article pur */}
      <h2 
        className="text-center mb-12"
        style={{ 
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '2rem',
          lineHeight: '1.4',
          color: '#111827',
          fontWeight: '400',
          letterSpacing: '-0.01em',
          marginBottom: '3rem'
        }}
      >
        {currentQuestion.question}
      </h2>

      {/* Réponses - Style adapté selon buttonStyle */}
      <div className={`mb-16 ${buttonStyle === 'card' ? 'space-y-4' : buttonStyle === 'split' ? 'relative' : 'space-y-3'}`}>
        {buttonStyle === 'split' && currentQuestion.answers && currentQuestion.answers.length >= 2 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-gray-100">
              <span className="text-2xl font-black text-gray-800">OU</span>
            </div>
          </div>
        )}
        {currentQuestion.answers?.map((answer: any, index: number) => {
          // Style Radio (par défaut)
          if (buttonStyle === 'radio') {
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-left transition-all duration-200"
                style={{
                  padding: '18px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: hoveredAnswer === index ? '#f9fafb' : '#ffffff',
                  fontSize: '16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  boxShadow: hoveredAnswer === index 
                    ? '0 0 0 2px #e5e7eb inset' 
                    : '0 0 0 1px #e5e7eb inset',
                  color: '#374151'
                }}
              >
                <div className="flex items-start">
                  <span 
                    className="flex-shrink-0 mr-4 mt-0.5"
                    style={{ 
                      fontSize: '15px',
                      fontWeight: '600',
                      color: hoveredAnswer === index ? '#111827' : '#9ca3af',
                      transition: 'color 0.2s ease',
                      minWidth: '20px'
                    }}
                  >
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span style={{ 
                    fontWeight: '400',
                    lineHeight: '1.6'
                  }}>
                    {answer.text}
                  </span>
                </div>
              </button>
            );
          }
          
          // Style Checkbox
          if (buttonStyle === 'checkbox') {
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-left transition-all duration-200"
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  border: hoveredAnswer === index ? '2px solid #d1d5db' : '2px solid #e5e7eb',
                  backgroundColor: hoveredAnswer === index ? '#f9fafb' : '#ffffff',
                  fontSize: '16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="flex-shrink-0 mr-4"
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {hoveredAnswer === index && (
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#111827',
                        borderRadius: '2px'
                      }} />
                    )}
                  </div>
                  <span style={{ 
                    fontWeight: '400',
                    lineHeight: '1.6'
                  }}>
                    {answer.text}
                  </span>
                </div>
              </button>
            );
          }
          
          // Style Card
          if (buttonStyle === 'card') {
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-left transition-all duration-300"
                style={{
                  padding: '24px 28px',
                  borderRadius: '16px',
                  border: hoveredAnswer === index ? '2px solid #111827' : '2px solid #e5e7eb',
                  backgroundColor: hoveredAnswer === index ? '#f9fafb' : '#ffffff',
                  fontSize: '17px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: '#111827',
                  boxShadow: hoveredAnswer === index 
                    ? '0 4px 12px rgba(0, 0, 0, 0.08)' 
                    : '0 2px 4px rgba(0, 0, 0, 0.04)',
                  transform: hoveredAnswer === index ? 'translateY(-2px)' : 'translateY(0)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ 
                    fontWeight: '500',
                    lineHeight: '1.6'
                  }}>
                    {answer.text}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: hoveredAnswer === index ? '#111827' : '#9ca3af',
                      transition: 'color 0.2s ease',
                      marginLeft: '16px'
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
              </button>
            );
          }
          
          // Style Button
          if (buttonStyle === 'button') {
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-center transition-all duration-200"
                style={{
                  padding: '18px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: hoveredAnswer === index ? '#111827' : '#374151',
                  fontSize: '16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontWeight: '500',
                  boxShadow: hoveredAnswer === index 
                    ? '0 6px 16px rgba(0, 0, 0, 0.2)' 
                    : '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transform: hoveredAnswer === index ? 'translateY(-2px)' : 'translateY(0)'
                }}
              >
                {answer.text}
              </button>
            );
          }
          
          // Style Minimal
          if (buttonStyle === 'minimal') {
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-left transition-all duration-200"
                style={{
                  padding: '16px 8px',
                  borderRadius: '0',
                  border: 'none',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: 'transparent',
                  fontSize: '17px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: hoveredAnswer === index ? '#111827' : '#374151',
                  fontWeight: hoveredAnswer === index ? '500' : '400'
                }}
              >
                {answer.text}
              </button>
            );
          }
          
          // Style Split (This or That)
          if (buttonStyle === 'split') {
            const defaultColors = ['#8BC34A', '#FFC107', '#03A9F4', '#E91E63', '#9C27B0', '#FF5722'];
            const bgColor = (answer as any).color || defaultColors[index % defaultColors.length];
            const answerImage = (answer as any).image;
            
            console.log('🖼️ [ArticleQuiz] Split answer rendering:', {
              index,
              answerText: answer.text,
              hasImage: !!answerImage,
              imageLength: answerImage?.length,
              color: bgColor,
              fullAnswer: answer
            });
            
            // Pour le style split, on affiche seulement les 2 premières réponses
            if (index > 1) return null;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-center transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  minHeight: '280px',
                  // Arrondir uniquement les bords externes : haut pour le premier bloc, bas pour le second
                  borderRadius: index === 0 ? '24px 24px 0 0' : '0 0 24px 24px',
                  border: 'none',
                  backgroundColor: bgColor,
                  fontSize: '48px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  transform: hoveredAnswer === index ? 'scale(1.02)' : 'scale(1)',
                  marginTop: index === 0 ? '0' : '0',
                  marginBottom: index === 0 ? '0' : '0',
                  position: 'relative'
                }}
              >
                {answerImage ? (
                  /* If image is provided, show it contained with inner margins (no contact with top/bottom) */
                  <div 
                    className="absolute bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${answerImage})`,
                      opacity: hoveredAnswer === index ? 0.95 : 1,
                      transition: 'opacity 0.3s ease',
                      top: '8%',
                      bottom: '8%',
                      left: '8%',
                      right: '8%'
                    }}
                  />
                ) : (
                  /* If no image, show text content */
                  <>
                    {/* Overlay gradient for better text readability */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)`
                      }}
                    />
                    
                    {/* Text content */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="text-6xl font-black mb-3 drop-shadow-lg">{answer.text.split(' ')[0]}</div>
                      <div className="text-2xl font-semibold opacity-90 drop-shadow-md">{answer.text.split(' ').slice(1).join(' ') || answer.text}</div>
                    </div>
                  </>
                )}
              </button>
            );
          }
          
          // Style Gradient
          if (buttonStyle === 'gradient') {
            const gradients = [
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
            ];
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-center transition-all duration-300"
                style={{
                  padding: '20px 28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: gradients[index % gradients.length],
                  fontSize: '17px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontWeight: '600',
                  boxShadow: hoveredAnswer === index 
                    ? '0 8px 20px rgba(0, 0, 0, 0.25)' 
                    : '0 4px 10px rgba(0, 0, 0, 0.15)',
                  transform: hoveredAnswer === index ? 'translateY(-3px)' : 'translateY(0)'
                }}
              >
                {answer.text}
              </button>
            );
          }
          
          // Style Outlined
          if (buttonStyle === 'outlined') {
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-center transition-all duration-200"
                style={{
                  padding: '18px 28px',
                  borderRadius: '12px',
                  border: hoveredAnswer === index ? '3px solid #111827' : '3px solid #d1d5db',
                  backgroundColor: hoveredAnswer === index ? '#f9fafb' : '#ffffff',
                  fontSize: '17px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: hoveredAnswer === index ? '#111827' : '#374151',
                  fontWeight: '600'
                }}
              >
                {answer.text}
              </button>
            );
          }
          
          // Style Pill
          if (buttonStyle === 'pill') {
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-center transition-all duration-200"
                style={{
                  padding: '14px 24px',
                  borderRadius: '9999px',
                  border: hoveredAnswer === index ? '2px solid #111827' : '2px solid #e5e7eb',
                  backgroundColor: hoveredAnswer === index ? '#111827' : '#ffffff',
                  fontSize: '15px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: hoveredAnswer === index ? '#ffffff' : '#374151',
                  fontWeight: '500'
                }}
              >
                {answer.text}
              </button>
            );
          }
          
          // Style Neon
          if (buttonStyle === 'neon') {
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHoveredAnswer(index)}
                onMouseLeave={() => setHoveredAnswer(null)}
                className="w-full text-center transition-all duration-300"
                style={{
                  padding: '20px 28px',
                  borderRadius: '12px',
                  border: hoveredAnswer === index ? '2px solid #00f2fe' : '2px solid #374151',
                  backgroundColor: hoveredAnswer === index ? '#111827' : '#1a1a1a',
                  fontSize: '17px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  cursor: 'pointer',
                  color: hoveredAnswer === index ? '#00f2fe' : '#ffffff',
                  fontWeight: '600',
                  boxShadow: hoveredAnswer === index 
                    ? '0 0 20px rgba(0, 242, 254, 0.5), 0 0 40px rgba(0, 242, 254, 0.3)' 
                    : 'none',
                  textShadow: hoveredAnswer === index ? '0 0 10px rgba(0, 242, 254, 0.8)' : 'none'
                }}
              >
                {answer.text}
              </button>
            );
          }
          
          return null;
        })}
      </div>

      {/* Séparateur décoratif */}
      <div className="flex items-center justify-center mb-8">
        <div style={{
          width: '40px',
          height: '1px',
          backgroundColor: '#d1d5db'
        }} />
      </div>

      {/* Indicateur de progression - Style points */}
      <div className="flex items-center justify-center gap-2">
        {questions.map((_: any, idx: number) => (
          <div
            key={idx}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: idx === currentQuestionIndex ? '#111827' : '#e5e7eb',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ArticleQuiz;
