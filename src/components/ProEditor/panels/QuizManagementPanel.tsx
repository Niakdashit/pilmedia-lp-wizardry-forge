import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Clock, HelpCircle, Image as ImageIcon } from 'lucide-react';
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
}

interface QuizManagementPanelProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QuizManagementPanel: React.FC<QuizManagementPanelProps> = ({
  campaign,
  setCampaign
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  
  // Detect selected quiz template to decide if we show image uploaders
  // Prefer design.quizConfig as the source of truth to stay consistent with preview
  const selectedTemplateId: string = campaign?.design?.quizConfig?.templateId
    || campaign?.gameConfig?.quiz?.templateId
    || 'image-quiz';
  const selectedTemplate = quizTemplates.find(t => t.id === selectedTemplateId) || quizTemplates[1];
  const showQuestionImageUploader = !!selectedTemplate.hasImage && !selectedTemplate.hasGrid;
  const showAnswerImageUploader = !!selectedTemplate.hasGrid;

  // Get quiz config from campaign
  const quizConfig = campaign?.gameConfig?.quiz || {
    questions: [],
    globalTimeLimit: 30,
    showCorrectAnswer: true,
    randomizeQuestions: false
  };

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
          <HelpCircle className="w-4 h-4 mr-2" style={{ color: '#841b60' }} />
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
          style={activeTab === 'questions' ? { color: '#841b60', borderBottomColor: '#841b60' } : {}}
        >
          <HelpCircle className="w-4 h-4 inline mr-2" />
          Questions
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'settings'
              ? 'border-b-2 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          style={activeTab === 'settings' ? { color: '#841b60', borderBottomColor: '#841b60' } : {}}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Paramètres
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
                e.currentTarget.style.borderColor = '#841b60';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(132, 27, 96, 0.1), rgba(109, 22, 79, 0.1))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(132, 27, 96, 0.05), rgba(109, 22, 79, 0.05))';
              }}
            >
              <Plus 
                className="w-5 h-5 mx-auto mb-2 text-gray-400 transition-colors" 
                onMouseEnter={(e) => e.currentTarget.style.color = '#841b60'} 
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(156 163 175)'} 
              />
              <span 
                className="text-sm text-gray-400 font-medium transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.color = '#841b60'}
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
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#841b60', opacity: 0.2 }}>
                        <span className="text-xs font-semibold" style={{ color: '#841b60' }}>{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#841b60' }}>
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
                        <Edit3 className="w-4 h-4 text-gray-400 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#841b60'} onMouseLeave={(e) => e.currentTarget.style.color = ''} />
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
                        e.currentTarget.style.borderColor = '#841b60';
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
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#841b60'}
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
                        <img
                          src={question.image}
                          alt="Question"
                          className="h-10 w-16 object-cover rounded-lg border border-gray-200"
                        />
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
                          style={{ accentColor: '#841b60' }}
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
                            e.currentTarget.style.borderColor = '#841b60';
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
                      {showAnswerImageUploader && (
                        <div className="mt-3 flex justify-start">
                          <label className="inline-flex items-center px-3 py-2 text-xs rounded-lg bg-white border border-gray-300 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#841b60'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(209 213 219)'}>
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Ajouter image
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
                            <img
                              src={answer.image}
                              alt="Answer"
                              className="ml-3 h-8 w-12 object-cover rounded border border-gray-200"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {editingQuestion === question.id && question.answers.length < 6 && (
                    <button
                      onClick={() => addAnswer(question.id)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 transition-all duration-200 font-medium"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#841b60';
                        e.currentTarget.style.borderColor = '#841b60';
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
        <div className="p-6 space-y-8">
          {/* Global Time Limit */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-fuchsia-400" />
              <label className="block text-sm font-semibold text-gray-900">
                Temps limite global
              </label>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={quizConfig.globalTimeLimit}
                  onChange={(e) => {
                    const updatedCampaign = {
                      ...campaign,
                      gameConfig: {
                        ...campaign.gameConfig,
                        quiz: {
                          ...quizConfig,
                          globalTimeLimit: parseInt(e.target.value)
                        }
                      }
                    };
                    setCampaign(updatedCampaign);
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="px-3 py-2 rounded-lg border" style={{ backgroundColor: 'rgba(132, 27, 96, 0.05)', borderColor: 'rgba(132, 27, 96, 0.2)' }}>
                  <span className="text-sm font-medium" style={{ color: '#841b60' }}>
                    {quizConfig.globalTimeLimit}s
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Temps maximum pour répondre à toutes les questions
              </p>
            </div>
          </div>

          {/* Show Correct Answer */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" style={{ color: '#841b60' }} />
              <label className="block text-sm font-semibold text-gray-900">
                Afficher la bonne réponse
              </label>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 mb-1">Révéler la réponse correcte</p>
                  <p className="text-xs text-gray-400">Affiche automatiquement la bonne réponse après chaque question</p>
                </div>
                <button
                  onClick={() => {
                    const updatedCampaign = {
                      ...campaign,
                      gameConfig: {
                        ...campaign.gameConfig,
                        quiz: {
                          ...quizConfig,
                          showCorrectAnswer: !quizConfig.showCorrectAnswer
                        }
                      }
                    };
                    setCampaign(updatedCampaign);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    quizConfig.showCorrectAnswer ? '' : 'bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: quizConfig.showCorrectAnswer ? '#841b60' : 'rgb(75 85 99)'
                  }}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                    quizConfig.showCorrectAnswer ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Randomize Questions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" style={{ color: '#841b60' }} />
              <label className="block text-sm font-semibold text-gray-900">
                Mélanger les questions
              </label>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 mb-1">Ordre aléatoire</p>
                  <p className="text-xs text-gray-400">Les questions apparaîtront dans un ordre différent pour chaque utilisateur</p>
                </div>
                <button
                  onClick={() => {
                    const updatedCampaign = {
                      ...campaign,
                      gameConfig: {
                        ...campaign.gameConfig,
                        quiz: {
                          ...quizConfig,
                          randomizeQuestions: !quizConfig.randomizeQuestions
                        }
                      }
                    };
                    setCampaign(updatedCampaign);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    quizConfig.randomizeQuestions ? '' : 'bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: quizConfig.randomizeQuestions ? '#841b60' : 'rgb(75 85 99)'
                  }}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                    quizConfig.randomizeQuestions ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" style={{ color: '#841b60' }} />
              <label className="block text-sm font-semibold text-gray-900">
                Statistiques du quiz
              </label>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Questions</div>
                  <div className="text-lg font-semibold" style={{ color: '#841b60' }}>{quizConfig.questions.length}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Durée estimée</div>
                  <div className="text-lg font-semibold" style={{ color: '#841b60' }}>
                    {Math.ceil(quizConfig.questions.length * quizConfig.globalTimeLimit / 60)}min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default QuizManagementPanel;
