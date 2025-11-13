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
  
  // Utiliser les questions de la campagne ou les questions par défaut
  const questions = (campaign?.questions && campaign.questions.length > 0) 
    ? campaign.questions 
    : defaultQuestions;
  
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

      {/* Réponses - Style article minimaliste */}
      <div className="space-y-3 mb-16">
        {currentQuestion.answers?.map((answer: any, index: number) => (
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
        ))}
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
