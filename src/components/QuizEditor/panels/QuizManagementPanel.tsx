import React, { useState } from 'react';
import { Plus, Trash2, Edit3, HelpCircle, Image as ImageIcon, Palette } from 'lucide-react';
import { quizTemplates } from '../../../types/quizTemplates';

interface Question {
  id: string;
  question: string;
  answers: Answer[];
  correctAnswerId: string;
  timeLimit?: number;
  image?: string; // optional question image for image-based templates
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  image?: string; // optional answer image for grid/image-option templates
  color?: string; // optional custom color for This or That style
}

interface QuizManagementPanelProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QuizManagementPanel: React.FC<QuizManagementPanelProps> = ({
  campaign,
  setCampaign
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'styles'>('questions');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  
  // Detect selected quiz template to decide if we show image uploaders
  // Prefer design.quizConfig as the source of truth to stay consistent with preview
  const selectedTemplateId: string = campaign?.design?.quizConfig?.templateId
    || campaign?.gameConfig?.quiz?.templateId
    || 'image-quiz';
  const selectedTemplate = quizTemplates.find(t => t.id === selectedTemplateId) || quizTemplates[1];
  const showQuestionImageUploader = !!selectedTemplate.hasImage && !selectedTemplate.hasGrid;

  // Get quiz config from campaign
  const quizConfig = campaign?.gameConfig?.quiz || {
    questions: [],
    globalTimeLimit: 30,
    showCorrectAnswer: true,
    randomizeQuestions: false
  };

  // Always ensure there is at least one question by default
  const initializedRef = React.useRef(false);
  React.useEffect(() => {
    if (initializedRef.current) return;
    const hasNoQuestions = !Array.isArray(quizConfig.questions) || quizConfig.questions.length === 0;
    if (hasNoQuestions) {
      initializedRef.current = true;
      addQuestion();
    }
  }, [quizConfig.questions?.length]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      question: 'Nouvelle question',
      answers: [
        { id: `a_${Date.now()}_1`, text: 'Réponse 1', isCorrect: true },
        { id: `a_${Date.now()}_2`, text: 'Réponse 2', isCorrect: false }
      ],
      correctAnswerId: `a_${Date.now()}_1`
    };

    const updatedCampaign = {
      ...campaign,
      gameConfig: {
        ...campaign.gameConfig,
        quiz: {
          ...quizConfig,
          questions: [...quizConfig.questions, newQuestion]
        }
      }
    };

    setCampaign(updatedCampaign);
    setEditingQuestion(newQuestion.id);
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = quizConfig.questions.filter((q: Question) => q.id !== questionId);
    
    const updatedCampaign = {
      ...campaign,
      gameConfig: {
        ...campaign.gameConfig,
        quiz: {
          ...quizConfig,
          questions: updatedQuestions
        }
      }
    };

    setCampaign(updatedCampaign);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    const updatedQuestions = quizConfig.questions.map((q: Question) =>
      q.id === questionId ? { ...q, ...updates } : q
    );

    const updatedCampaign = {
      ...campaign,
      gameConfig: {
        ...campaign.gameConfig,
        quiz: {
          ...quizConfig,
          questions: updatedQuestions
        }
      }
    };

    setCampaign(updatedCampaign);
  };

  const addAnswer = (questionId: string) => {
    const question = quizConfig.questions.find((q: Question) => q.id === questionId);
    if (!question || question.answers.length >= 6) return;

    const newAnswer: Answer = {
      id: `a_${Date.now()}`,
      text: `Réponse ${question.answers.length + 1}`,
      isCorrect: false
    };

    updateQuestion(questionId, {
      answers: [...question.answers, newAnswer]
    });
  };

  const deleteAnswer = (questionId: string, answerId: string) => {
    const question = quizConfig.questions.find((q: Question) => q.id === questionId);
    if (!question || question.answers.length <= 2) return;

    const updatedAnswers = question.answers.filter((a: Answer) => a.id !== answerId);
    
    // Si on supprime la bonne réponse, définir la première comme correcte
    let correctAnswerId = question.correctAnswerId;
    if (answerId === correctAnswerId && updatedAnswers.length > 0) {
      correctAnswerId = updatedAnswers[0].id;
    }

    // Sync isCorrect flags
    const syncedAnswers = updatedAnswers.map((a: Answer) => ({
      ...a,
      isCorrect: a.id === correctAnswerId
    }));

    updateQuestion(questionId, {
      answers: syncedAnswers,
      correctAnswerId
    });
  };

  const updateAnswer = (questionId: string, answerId: string, text: string) => {
    const question = quizConfig.questions.find((q: Question) => q.id === questionId);
    if (!question) return;

    const updatedAnswers = question.answers.map((a: Answer) =>
      a.id === answerId ? { ...a, text } : a
    );

    updateQuestion(questionId, { answers: updatedAnswers });
  };

  const setCorrectAnswer = (questionId: string, answerId: string) => {
    const question = quizConfig.questions.find((q: Question) => q.id === questionId);
    if (!question) return;
    const updatedAnswers = question.answers.map((a: Answer) => ({
      ...a,
      isCorrect: a.id === answerId
    }));
    updateQuestion(questionId, { correctAnswerId: answerId, answers: updatedAnswers });
  };

  // Image upload helpers
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleQuestionImageUpload = async (questionId: string, file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateQuestion(questionId, { image: dataUrl });
    } catch (e) {
      console.error('Failed to read question image', e);
    }
  };

  const handleAnswerImageUpload = async (questionId: string, answerId: string, file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const question = quizConfig.questions.find((q: Question) => q.id === questionId);
      if (!question) return;
      const updatedAnswers = question.answers.map((a: Answer) =>
        a.id === answerId ? { ...a, image: dataUrl } : a
      );
      updateQuestion(questionId, { answers: updatedAnswers });
    } catch (e) {
      console.error('Failed to read answer image', e);
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <HelpCircle className="w-4 h-4 mr-2" style={{ color: '#44444d' }} />
          Gestion du Quiz
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'questions'
              ? 'border-b-2 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          style={activeTab === 'questions' ? { color: '#44444d', borderBottomColor: '#44444d' } : {}}
        >
          <HelpCircle className="w-4 h-4 inline mr-2" />
          Questions
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'styles'
              ? 'border-b-2 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          style={activeTab === 'styles' ? { color: '#44444d', borderBottomColor: '#44444d' } : {}}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Styles
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'questions' ? (
          <div className="p-4 space-y-4">
            {/* Add Question Button */}
            <button
              onClick={addQuestion}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl transition-all duration-200 group backdrop-blur-sm"
              style={{ background: 'linear-gradient(135deg, rgba(132, 27, 96, 0.05), rgba(109, 22, 79, 0.05))' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#44444d';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(132, 27, 96, 0.1), rgba(109, 22, 79, 0.1))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(132, 27, 96, 0.05), rgba(109, 22, 79, 0.05))';
              }}
            >
              <Plus 
                className="w-5 h-5 mx-auto mb-2 text-gray-400 transition-colors" 
                onMouseEnter={(e) => e.currentTarget.style.color = '#44444d'} 
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(156 163 175)'} 
              />
              <span 
                className="text-sm text-gray-400 font-medium transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.color = '#44444d'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(156 163 175)'}
              >
                Ajouter une question
              </span>
            </button>

            {/* Questions List */}
            {quizConfig.questions.map((question: Question, index: number) => (
              <div key={question.id} className="bg-white rounded-xl border border-gray-200 backdrop-blur-sm hover:border-gray-300 transition-all duration-200">
                {/* Question Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#44444d', opacity: 0.2 }}>
                        <span className="text-xs font-semibold" style={{ color: '#44444d' }}>{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#44444d' }}>
                        Question {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingQuestion(
                          editingQuestion === question.id ? null : question.id
                        )}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                        title="Modifier la question"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#44444d'} onMouseLeave={(e) => e.currentTarget.style.color = ''} />
                      </button>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
                        disabled={quizConfig.questions.length <= 1}
                        title="Supprimer la question"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                      </button>
                    </div>
                  </div>
                  
                  {editingQuestion === question.id ? (
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      className="w-full mt-3 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm resize-none transition-all"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#44444d';
                        e.currentTarget.style.boxShadow = `0 0 0 2px rgba(132, 27, 96, 0.2)`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      rows={2}
                      placeholder="Entrez votre question..."
                    />
                  ) : (
                    <p className="mt-3 text-gray-900 text-sm leading-relaxed">{question.question}</p>
                  )}
                  {/* Question image uploader: only for templates with a single question image */}
                  {showQuestionImageUploader && (
                    <div className="mt-3 flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400">Image de la question</span>
                      </div>
                      <label className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-gray-50 border border-gray-300 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#44444d'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(209 213 219)'}>
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Choisir un fichier
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleQuestionImageUpload(question.id, file);
                          }}
                        />
                      </label>
                      {question.image && (
                        <div className="relative h-10 w-16">
                          <img
                            src={question.image}
                            alt="Question"
                            className="h-10 w-16 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuestion(question.id, { image: undefined })}
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] leading-none text-gray-500 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-colors"
                            title="Supprimer l'image"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Answers */}
                <div className="p-4 space-y-3">
                  {question.answers.map((answer: Answer) => (
                    <div key={answer.id} className="bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 p-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={answer.isCorrect}
                          onChange={() => setCorrectAnswer(question.id, answer.id)}
                          className="w-4 h-4 focus:ring-2 transition-colors flex-shrink-0"
                          style={{ accentColor: '#44444d' }}
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 0 2px rgba(132, 27, 96, 0.2)`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => updateAnswer(question.id, answer.id, e.target.value)}
                          className="flex-1 min-w-0 p-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm transition-all"
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#44444d';
                            e.currentTarget.style.boxShadow = `0 0 0 2px rgba(132, 27, 96, 0.2)`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          placeholder="Réponse..."
                        />
                        <button
                          onClick={() => deleteAnswer(question.id, answer.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 group flex-shrink-0"
                          disabled={question.answers.length <= 2}
                          title="Supprimer la réponse"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed" />
                        </button>
                      </div>
                      
                      {/* Image & Color customization for This or That style */}
                      <div className="mt-3 flex items-center gap-3">
                        {/* Image upload - Always visible */}
                        <label className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-white border border-gray-300 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#44444d'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(209 213 219)'}>
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAnswerImageUpload(question.id, answer.id, file);
                            }}
                          />
                        </label>
                        {answer.image && (
                          <div className="relative">
                            <img
                              src={answer.image}
                              alt="Answer"
                              className="h-8 w-12 object-cover rounded border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedQuestions = quizConfig.questions.map((q: Question) => {
                                  if (q.id === question.id) {
                                    return {
                                      ...q,
                                      answers: q.answers.map((a: Answer) =>
                                        a.id === answer.id ? { ...a, image: undefined } : a
                                      )
                                    };
                                  }
                                  return q;
                                });
                                const updatedCampaign = {
                                  ...campaign,
                                  gameConfig: {
                                    ...campaign.gameConfig,
                                    quiz: {
                                      ...quizConfig,
                                      questions: updatedQuestions
                                    }
                                  }
                                };
                                setCampaign(updatedCampaign);
                              }}
                              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] leading-none text-gray-500 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-colors"
                              title="Supprimer l'image"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        
                        {/* Color picker */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Couleur:</label>
                          <input
                            type="color"
                            value={(answer as any).color || '#8BC34A'}
                            onChange={(e) => {
                              const updatedQuestions = quizConfig.questions.map((q: Question) => {
                                if (q.id === question.id) {
                                  return {
                                    ...q,
                                    answers: q.answers.map((a: Answer) =>
                                      a.id === answer.id ? { ...a, color: e.target.value } : a
                                    )
                                  };
                                }
                                return q;
                              });
                              const updatedCampaign = {
                                ...campaign,
                                gameConfig: {
                                  ...campaign.gameConfig,
                                  quiz: {
                                    ...quizConfig,
                                    questions: updatedQuestions
                                  }
                                }
                              };
                              setCampaign(updatedCampaign);
                            }}
                            className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            title="Choisir une couleur"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {editingQuestion === question.id && question.answers.length < 6 && (
                    <button
                      onClick={() => addAnswer(question.id)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 transition-all duration-200 font-medium"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#44444d';
                        e.currentTarget.style.borderColor = '#44444d';
                        e.currentTarget.style.background = 'linear-gradient(to right, rgba(132, 27, 96, 0.05), rgba(109, 22, 79, 0.05))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(107 114 128)';
                        e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Ajouter une réponse
                    </button>
                  )}
                </div>
              </div>
            ))}

            {quizConfig.questions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <HelpCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-300 mb-1">Aucune question créée</p>
                <p className="text-xs text-gray-500">Cliquez sur "Ajouter une question" pour commencer</p>
              </div>
            )}
          </div>
        ) : (
        <div className="p-6 space-y-6">
          {/* Button Style Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" style={{ color: '#44444d' }} />
              <label className="block text-sm font-semibold text-gray-900">
                Style des boutons de réponse
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Choisissez comment les réponses seront affichées dans le quiz
            </p>
            
            {/* Button Style Options - Single-column vertical list */}
            <div className="flex flex-col gap-3">
              {/* Radio Buttons */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'radio'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'radio' || !quizConfig.buttonStyle
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      quizConfig.buttonStyle === 'radio' || !quizConfig.buttonStyle
                        ? 'border-[#44444d]'
                        : 'border-gray-300'
                    }`}>
                      {(quizConfig.buttonStyle === 'radio' || !quizConfig.buttonStyle) && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#44444d' }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Boutons radio</p>
                      <p className="text-xs text-gray-500">Style classique avec cercles de sélection</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                    <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                  </div>
                </div>
              </button>

              {/* Checkbox Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'checkbox'
                      }
                    }
                  };
                  console.log('🎨 [QuizManagementPanel] Setting buttonStyle to checkbox:', updatedCampaign.gameConfig.quiz);
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'checkbox'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      quizConfig.buttonStyle === 'checkbox'
                        ? 'border-[#44444d]'
                        : 'border-gray-300'
                    }`}>
                      {quizConfig.buttonStyle === 'checkbox' && (
                        <svg className="w-3 h-3" style={{ color: '#44444d' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cases à cocher</p>
                      <p className="text-xs text-gray-500">Style avec cases carrées</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-3 h-3 rounded border-2 border-gray-300" />
                    <div className="w-3 h-3 rounded border-2 border-gray-300" />
                  </div>
                </div>
              </button>

              {/* Card Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'card'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'card'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${
                      quizConfig.buttonStyle === 'card'
                        ? 'border-[#44444d] bg-[#44444d]'
                        : 'border-gray-300'
                    }`}>
                      {quizConfig.buttonStyle === 'card' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Cartes</p>
                      <p className="text-xs text-gray-500">Grandes cartes cliquables avec effet hover</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 text-xs text-gray-400">
                    <div className="w-12 h-2 rounded bg-gray-200" />
                    <div className="w-12 h-2 rounded bg-gray-200" />
                  </div>
                </div>
              </button>

              {/* Button Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'button'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'button'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${
                      quizConfig.buttonStyle === 'button'
                        ? 'border-[#44444d] bg-[#44444d]'
                        : 'border-gray-300'
                    }`}>
                      {quizConfig.buttonStyle === 'button' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Boutons pleins</p>
                      <p className="text-xs text-gray-500">Boutons colorés avec fond plein</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="px-3 py-1 rounded-lg text-[10px] font-medium text-white" style={{ backgroundColor: '#44444d' }}>
                      BTN
                    </div>
                  </div>
                </div>
              </button>

              {/* Minimal Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'minimal'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'minimal'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Minimal</p>
                  <p className="text-xs text-gray-500">Sans bordure, texte simple</p>
                </div>
              </button>

              {/* This or That Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'split'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'split'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">This or That</p>
                  <p className="text-xs text-gray-500">Zones colorées séparées</p>
                </div>
              </button>

              {/* Gradient Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'gradient'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'gradient'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Gradient</p>
                  <p className="text-xs text-gray-500">Dégradés de couleurs</p>
                </div>
              </button>

              {/* Outlined Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'outlined'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'outlined'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Outlined</p>
                  <p className="text-xs text-gray-500">Bordure épaisse colorée</p>
                </div>
              </button>

              {/* Pill Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'pill'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'pill'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Pill</p>
                  <p className="text-xs text-gray-500">Boutons arrondis compacts</p>
                </div>
              </button>

              {/* Neon Style */}
              <button
                onClick={() => {
                  const updatedCampaign = {
                    ...campaign,
                    gameConfig: {
                      ...campaign.gameConfig,
                      quiz: {
                        ...quizConfig,
                        buttonStyle: 'neon'
                      }
                    }
                  };
                  setCampaign(updatedCampaign);
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  quizConfig.buttonStyle === 'neon'
                    ? 'border-[#44444d] bg-gradient-to-br from-[#44444d]/5 to-[#6d164f]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Neon</p>
                  <p className="text-xs text-gray-500">Effet lumineux au hover</p>
                </div>
              </button>
            </div>
          </div>

          {/* Preview Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>💡 Astuce :</strong> Le style sélectionné sera appliqué à toutes les questions du quiz. Vous pouvez prévisualiser le rendu en mode Article.
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default QuizManagementPanel;
