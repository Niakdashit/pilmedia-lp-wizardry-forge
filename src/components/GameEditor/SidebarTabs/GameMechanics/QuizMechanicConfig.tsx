import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EditorConfig } from '../../GameEditorLayout';

interface QuizMechanicConfigProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuizMechanicConfig: React.FC<QuizMechanicConfigProps> = ({ config, onConfigUpdate }) => {
  const quizQuestions: QuizQuestion[] = config.quizQuestions || [
    {
      id: '1',
      question: 'Quelle est la capitale de la France ?',
      options: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
      correctAnswer: 0
    }
  ];

  const updateQuestions = (newQuestions: QuizQuestion[]) => {
    onConfigUpdate({ quizQuestions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: 'Nouvelle question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0
    };
    updateQuestions([...quizQuestions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (quizQuestions.length > 1) {
      updateQuestions(quizQuestions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    updateQuestions(quizQuestions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = quizQuestions.find(q => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres du quiz</h4>
        
        <div className="form-group-premium">
          <label>Score minimum pour gagner (%)</label>
          <input
            type="number"
            value={config.quizPassingScore || 70}
            onChange={(e) => onConfigUpdate({ quizPassingScore: parseInt(e.target.value) || 70 })}
            min="0"
            max="100"
            className="w-full"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sidebar-text-primary font-medium text-base">Questions</h4>
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-3 py-1 bg-sidebar-active text-white rounded-lg text-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-4">
          {quizQuestions.map((question, index) => (
            <div key={question.id} className="p-4 bg-sidebar-surface rounded-lg border border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-sidebar-text">Question {index + 1}</span>
                {quizQuestions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="form-group-premium">
                  <label className="text-xs">Question</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                    rows={2}
                    className="w-full text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-sidebar-text">Options de réponse</label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => updateQuestion(question.id, { correctAnswer: optionIndex })}
                        className="flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizMechanicConfig;