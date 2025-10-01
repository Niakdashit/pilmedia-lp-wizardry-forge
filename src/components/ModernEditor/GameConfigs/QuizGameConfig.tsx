
import React from 'react';
import { HelpCircle, Plus, Trash2, Clock } from 'lucide-react';

interface QuizGameConfigProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const QuizGameConfig: React.FC<QuizGameConfigProps> = ({
  campaign,
  setCampaign
}) => {
  const questions = campaign.gameConfig?.quiz?.questions || [];

  const addQuestion = () => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        quiz: {
          ...prev.gameConfig?.quiz,
          questions: [
            ...questions,
            {
              id: Date.now(),
              text: '',
              type: 'multiple',
              options: [
                { id: Date.now() + 1, text: '', isCorrect: true },
                { id: Date.now() + 2, text: '', isCorrect: false }
              ],
              feedback: {
                correct: 'Bonne réponse !',
                incorrect: 'Mauvaise réponse.'
              },
              timeLimit: 0
            }
          ]
        }
      }
    }));
  };

  const updateQuestion = (questionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value };
    
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        quiz: {
          ...prev.gameConfig?.quiz,
          questions: updatedQuestions
        }
      }
    }));
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({
      id: Date.now(),
      text: '',
      isCorrect: false
    });
    
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        quiz: {
          ...prev.gameConfig?.quiz,
          questions: updatedQuestions
        }
      }
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        quiz: {
          ...prev.gameConfig?.quiz,
          questions: updatedQuestions
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Configuration générale */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Configuration générale</h4>
        
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-2" />
            Temps limite par question (secondes, 0 = illimité)
          </label>
          <input
            type="number"
            value={campaign.gameConfig?.quiz?.timeLimit || 30}
            onChange={(e) => setCampaign((prev: any) => ({
              ...prev,
              gameConfig: {
                ...prev.gameConfig,
                quiz: {
                  ...prev.gameConfig?.quiz,
                  timeLimit: parseInt(e.target.value) || 0
                }
              }
            }))}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showCorrectAnswers"
            checked={campaign.gameConfig?.quiz?.showCorrectAnswers || false}
            onChange={(e) => setCampaign((prev: any) => ({
              ...prev,
              gameConfig: {
                ...prev.gameConfig,
                quiz: {
                  ...prev.gameConfig?.quiz,
                  showCorrectAnswers: e.target.checked
                }
              }
            }))}
            className="rounded border-gray-300 text-[#d4dbe8] focus:ring-[#d4dbe8]"
          />
          <label htmlFor="showCorrectAnswers" className="text-sm font-medium text-gray-700">
            Afficher les bonnes réponses à la fin
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <HelpCircle className="w-4 h-4 mr-2" />
            Questions du quiz
          </label>
          <button
            onClick={addQuestion}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-gradient-to-br from-[#d4dbe8] to-[#b41b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions.map((question: any, questionIndex: number) => (
            <div key={question.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Question {questionIndex + 1}</span>
                <button
                  onClick={() => {
                    const updatedQuestions = questions.filter((_: any, i: number) => i !== questionIndex);
                    setCampaign((prev: any) => ({
                      ...prev,
                      gameConfig: {
                        ...prev.gameConfig,
                        quiz: {
                          ...prev.gameConfig?.quiz,
                          questions: updatedQuestions
                        }
                      }
                    }));
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <input
                type="text"
                value={question.text || ''}
                onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                placeholder="Texte de la question"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#d4dbe8] focus:border-transparent"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Options de réponse</span>
                  <button
                    onClick={() => addOption(questionIndex)}
                    className="text-xs text-[#d4dbe8] hover:text-[#6d164f]"
                  >
                    + Ajouter option
                  </button>
                </div>
                
                {question.options?.map((option: any, optionIndex: number) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={option.isCorrect}
                      onChange={() => {
                        // Marquer cette option comme correcte et les autres comme incorrectes
                        const updatedQuestions = [...questions];
                        updatedQuestions[questionIndex].options.forEach((opt: any, idx: number) => {
                          opt.isCorrect = idx === optionIndex;
                        });
                        setCampaign((prev: any) => ({
                          ...prev,
                          gameConfig: {
                            ...prev.gameConfig,
                            quiz: {
                              ...prev.gameConfig?.quiz,
                              questions: updatedQuestions
                            }
                          }
                        }));
                      }}
                      className="text-[#d4dbe8] focus:ring-[#d4dbe8]"
                    />
                    <input
                      type="text"
                      value={option.text || ''}
                      onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#d4dbe8] focus:border-transparent"
                    />
                    {question.options.length > 2 && (
                      <button
                        onClick={() => {
                          const updatedQuestions = [...questions];
                          updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_: any, i: number) => i !== optionIndex);
                          setCampaign((prev: any) => ({
                            ...prev,
                            gameConfig: {
                              ...prev.gameConfig,
                              quiz: {
                                ...prev.gameConfig?.quiz,
                                questions: updatedQuestions
                              }
                            }
                          }));
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Aucune question configurée</p>
            <p className="text-xs">Cliquez sur "Ajouter" pour créer votre première question</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGameConfig;
