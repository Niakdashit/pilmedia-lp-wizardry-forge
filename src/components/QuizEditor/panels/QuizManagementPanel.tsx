import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Clock, HelpCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answers: Answer[];
  correctAnswerId: string;
  timeLimit?: number;
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
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

    updateQuestion(questionId, {
      answers: updatedAnswers,
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
    updateQuestion(questionId, { correctAnswerId: answerId });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'questions'
              ? 'text-white border-b-2 border-purple-500 bg-gray-800'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          }`}
        >
          <HelpCircle className="w-4 h-4 inline mr-2" />
          Questions
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-white border-b-2 border-purple-500 bg-gray-800'
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          }`}
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
              className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-colors group"
            >
              <Plus className="w-5 h-5 mx-auto mb-1 text-gray-400 group-hover:text-purple-400" />
              <span className="text-sm text-gray-400 group-hover:text-purple-400">
                Ajouter une question
              </span>
            </button>

            {/* Questions List */}
            {quizConfig.questions.map((question: Question, index: number) => (
              <div key={question.id} className="bg-gray-800 rounded-lg border border-gray-700">
                {/* Question Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-400">
                      Question {index + 1}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingQuestion(
                          editingQuestion === question.id ? null : question.id
                        )}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-1 hover:bg-red-600 rounded transition-colors"
                        disabled={quizConfig.questions.length <= 1}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  {editingQuestion === question.id ? (
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      className="w-full mt-2 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
                      rows={2}
                      placeholder="Entrez votre question..."
                    />
                  ) : (
                    <p className="mt-2 text-white text-sm">{question.question}</p>
                  )}
                </div>

                {/* Answers */}
                <div className="p-4 space-y-2">
                  {question.answers.map((answer: Answer) => (
                    <div key={answer.id} className="flex items-center space-x-2">
                      <button
                        onClick={() => setCorrectAnswer(question.id, answer.id)}
                        className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          question.correctAnswerId === answer.id
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-500 hover:border-green-400'
                        }`}
                      />
                      {editingQuestion === question.id ? (
                        <input
                          value={answer.text}
                          onChange={(e) => updateAnswer(question.id, answer.id, e.target.value)}
                          className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          placeholder="Réponse..."
                        />
                      ) : (
                        <span className={`flex-1 text-sm ${
                          question.correctAnswerId === answer.id ? 'text-green-400' : 'text-gray-300'
                        }`}>
                          {answer.text}
                        </span>
                      )}
                      {editingQuestion === question.id && question.answers.length > 2 && (
                        <button
                          onClick={() => deleteAnswer(question.id, answer.id)}
                          className="p-1 hover:bg-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {editingQuestion === question.id && question.answers.length < 6 && (
                    <button
                      onClick={() => addAnswer(question.id)}
                      className="w-full p-2 border border-dashed border-gray-600 rounded text-sm text-gray-400 hover:text-purple-400 hover:border-purple-500 transition-colors"
                    >
                      + Ajouter une réponse
                    </button>
                  )}
                </div>
              </div>
            ))}

            {quizConfig.questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-sm">Aucune question créée</p>
                <p className="text-xs mt-1">Cliquez sur "Ajouter une question" pour commencer</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Global Time Limit */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Temps limite global (secondes)
              </label>
              <div className="flex items-center space-x-3">
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
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="bg-gray-700 px-2 py-1 rounded text-sm text-white min-w-[50px] text-center">
                  {quizConfig.globalTimeLimit}s
                </div>
              </div>
            </div>

            {/* Show Correct Answer */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Afficher la bonne réponse
              </label>
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
                className={`w-12 h-6 rounded-full transition-colors ${
                  quizConfig.showCorrectAnswer ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  quizConfig.showCorrectAnswer ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Randomize Questions */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Mélanger les questions
              </label>
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
                className={`w-12 h-6 rounded-full transition-colors ${
                  quizConfig.randomizeQuestions ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  quizConfig.randomizeQuestions ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Quiz Stats */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3">Statistiques du quiz</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Questions:</span>
                  <span className="text-white ml-2">{quizConfig.questions.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Durée estimée:</span>
                  <span className="text-white ml-2">
                    {Math.ceil(quizConfig.questions.length * quizConfig.globalTimeLimit / 60)}min
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManagementPanel;
