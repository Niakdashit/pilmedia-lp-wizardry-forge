import React from 'react';
import { GitBranch, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { TypeformQuestion } from '../components/TypeformPreview';

interface LogicPanelProps {
  questions: TypeformQuestion[];
  onQuestionsChange: (questions: TypeformQuestion[]) => void;
}

export const LogicPanel: React.FC<LogicPanelProps> = ({
  questions,
  onQuestionsChange
}) => {
  const updateQuestionLogic = (questionId: string, logic: Record<string, string>) => {
    onQuestionsChange(
      questions.map(q => q.id === questionId ? { ...q, logic } : q)
    );
  };

  const addLogicRule = (questionId: string, answer: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const logic = question.logic || {};
    logic[answer] = questions[0]?.id || 'end';
    updateQuestionLogic(questionId, logic);
  };

  const updateLogicRule = (questionId: string, answer: string, nextQuestionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const logic = { ...(question.logic || {}) };
    logic[answer] = nextQuestionId;
    updateQuestionLogic(questionId, logic);
  };

  const deleteLogicRule = (questionId: string, answer: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.logic) return;

    const logic = { ...question.logic };
    delete logic[answer];
    updateQuestionLogic(questionId, logic);
  };

  const getQuestionLabel = (id: string) => {
    const index = questions.findIndex(q => q.id === id);
    const question = questions[index];
    return question ? `Q${index + 1}: ${question.text}` : 'Question inconnue';
  };

  const questionsWithChoices = questions.filter(q => 
    q.type === 'choice' || q.type === 'multiple'
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch size={20} className="text-[#841b60]" />
          <h3 className="text-lg font-semibold text-gray-900">Logique Conditionnelle</h3>
        </div>
        <p className="text-sm text-gray-500">
          Définissez le flux de navigation selon les réponses
        </p>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {questionsWithChoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔀</div>
            <p className="text-gray-500 mb-2">Aucune question avec choix</p>
            <p className="text-sm text-gray-400">
              Ajoutez des questions de type "Choix unique" ou "Choix multiples"<br />
              pour créer une logique conditionnelle
            </p>
          </div>
        ) : (
          questionsWithChoices.map((question, qIndex) => {
            const questionIndex = questions.findIndex(q => q.id === question.id);
            
            return (
              <div key={question.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                {/* Header de la question */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#841b60]">
                      Q{questionIndex + 1}
                    </span>
                    <span className="text-gray-900 font-medium">{question.text}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Type: {question.type === 'choice' ? 'Choix unique' : 'Choix multiples'}
                  </p>
                </div>

                {/* Règles de logique */}
                <div className="space-y-3">
                  {question.options?.map((option, optIndex) => {
                    const hasLogic = question.logic && question.logic[option];
                    const nextQuestionId = question.logic?.[option];

                    return (
                      <div key={optIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-700">
                            Si réponse: <span className="font-medium text-gray-900">"{option}"</span>
                          </span>
                        </div>

                        {hasLogic ? (
                          <div className="flex items-center gap-2">
                            <ArrowRight size={16} className="text-[#841b60]" />
                            <select
                              value={nextQuestionId}
                              onChange={(e) => updateLogicRule(question.id, option, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white text-sm rounded border border-gray-300 focus:border-[#841b60] outline-none"
                            >
                              <option value="">Sélectionner une action</option>
                              <option value="end">🏁 Terminer le formulaire</option>
                              <optgroup label="Aller à la question">
                                {questions
                                  .filter(q => q.id !== question.id)
                                  .map((q, idx) => (
                                    <option key={q.id} value={q.id}>
                                      {getQuestionLabel(q.id)}
                                    </option>
                                  ))
                                }
                              </optgroup>
                            </select>
                            <button
                              onClick={() => deleteLogicRule(question.id, option)}
                              className="p-2 text-red-500 hover:text-red-400 rounded"
                              title="Supprimer la règle"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addLogicRule(question.id, option)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors"
                          >
                            <Plus size={14} />
                            <span>Ajouter une règle</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Info par défaut */}
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-500">
                  💡 Sans règle définie, le formulaire passe à la question suivante
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer avec aide */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">💡 Comment ça marche ?</p>
          <p>• Créez des questions avec choix (unique ou multiples)</p>
          <p>• Définissez où aller selon chaque réponse</p>
          <p>• Vous pouvez terminer le formulaire ou sauter des questions</p>
        </div>
      </div>
    </div>
  );
};

export default LogicPanel;
