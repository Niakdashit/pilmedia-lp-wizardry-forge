
import React from 'react';
import { HelpCircle, Plus, Trash2, Check } from 'lucide-react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';

interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: number;
  text: string;
  type: string;
  options: QuizOption[];
  feedback: {
    correct: string;
    incorrect: string;
  };
}

const QuizConfiguration: React.FC = () => {
  const { quizQuestions, setQuizQuestions } = useQuickCampaignStore();

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      text: 'Nouvelle question',
      type: 'multiple',
      options: [
        { id: 1, text: 'Option A', isCorrect: false },
        { id: 2, text: 'Option B', isCorrect: true },
        { id: 3, text: 'Option C', isCorrect: false },
        { id: 4, text: 'Option D', isCorrect: false }
      ],
      feedback: {
        correct: 'Bonne réponse !',
        incorrect: 'Mauvaise réponse, essayez encore !'
      }
    };
    setQuizQuestions([...quizQuestions, newQuestion]);
  };

  const removeQuestion = (questionId: number) => {
    setQuizQuestions(quizQuestions.filter((q: QuizQuestion) => q.id !== questionId));
  };

  const updateQuestion = (questionId: number, field: string, value: any) => {
    setQuizQuestions(quizQuestions.map((q: QuizQuestion) => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: number, optionId: number, field: string, value: any) => {
    setQuizQuestions(quizQuestions.map((q: QuizQuestion) => 
      q.id === questionId ? {
        ...q,
        options: q.options.map((opt: QuizOption) => 
          opt.id === optionId ? { ...opt, [field]: value } : opt
        )
      } : q
    ));
  };

  const setCorrectAnswer = (questionId: number, optionId: number) => {
    setQuizQuestions(quizQuestions.map((q: QuizQuestion) => 
      q.id === questionId ? {
        ...q,
        options: q.options.map((opt: QuizOption) => ({ ...opt, isCorrect: opt.id === optionId }))
      } : q
    ));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Configuration Quiz</h3>
        </div>
        <button
          onClick={addQuestion}
          className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une question</span>
        </button>
      </div>

      <div className="space-y-6">
        {quizQuestions.map((question: QuizQuestion, index: number) => (
          <div key={question.id} className="border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
              {quizQuestions.length > 1 && (
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tapez votre question ici..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options de réponse
              </label>
              <div className="space-y-2">
                {question.options.map((option: QuizOption) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <button
                      onClick={() => setCorrectAnswer(question.id, option.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        option.isCorrect 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                      title={option.isCorrect ? 'Bonne réponse' : 'Cliquer pour marquer comme bonne réponse'}
                    >
                      {option.isCorrect && <Check className="w-3 h-3" />}
                    </button>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(question.id, option.id, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Option ${String.fromCharCode(65 + question.options.indexOf(option))}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message de bonne réponse
                </label>
                <input
                  type="text"
                  value={question.feedback?.correct || ''}
                  onChange={(e) => updateQuestion(question.id, 'feedback', { 
                    ...question.feedback, 
                    correct: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Félicitations !"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message de mauvaise réponse
                </label>
                <input
                  type="text"
                  value={question.feedback?.incorrect || ''}
                  onChange={(e) => updateQuestion(question.id, 'feedback', { 
                    ...question.feedback, 
                    incorrect: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Essayez encore !"
                />
              </div>
            </div>
          </div>
        ))}

        {quizQuestions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune question configurée</p>
            <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
          </div>
        )}
      </div>
    </>
  );
};

export default QuizConfiguration;
