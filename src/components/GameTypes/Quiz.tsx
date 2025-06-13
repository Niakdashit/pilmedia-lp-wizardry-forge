
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Type, Clock } from 'lucide-react';
import QuizPreview from './QuizPreview';

interface QuizProps {
  config: any;
  onConfigChange: (config: any) => void;
  activeQuestion?: number;
  onActiveQuestionChange?: (index: number) => void;
  onQuestionChange?: (question: any) => void;
}

const Quiz: React.FC<QuizProps> = ({
  config,
  onConfigChange,
  activeQuestion: externalActive,
  onActiveQuestionChange,
  onQuestionChange
}) => {
  const [internalActive, setInternalActive] = useState(externalActive ?? 0);
  const activeQuestion = externalActive ?? internalActive;
  const setActiveQuestion = onActiveQuestionChange ?? setInternalActive;

  // Ensure config has a default structure
const safeConfig = config || { questions: [] };
const questions = safeConfig.questions || [];

useEffect(() => {
  if (onQuestionChange) {
    onQuestionChange(questions[activeQuestion]);
  }
}, [activeQuestion, questions, onQuestionChange]);

  const addQuestion = () => {
    const newConfig = {
      ...safeConfig,
      questions: [
        ...questions,
        {
          id: Date.now(),
          text: '',
          type: 'multiple',
          image: '',
          options: [
            { id: Date.now() + 1, text: '', isCorrect: false },
            { id: Date.now() + 2, text: '', isCorrect: false }
          ],
          feedback: {
            correct: 'Bonne réponse !',
            incorrect: 'Mauvaise réponse.'
          },
          timeLimit: 0
        }
      ]
    };
    onConfigChange(newConfig);
    setActiveQuestion(newConfig.questions.length - 1);
    if (onQuestionChange) {
      onQuestionChange(newConfig.questions[newConfig.questions.length - 1]);
    }
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    onConfigChange({ ...safeConfig, questions: newQuestions });
    if (activeQuestion >= newQuestions.length) {
      setActiveQuestion(Math.max(0, newQuestions.length - 1));
    }
    if (onQuestionChange) {
      onQuestionChange(newQuestions[Math.max(0, newQuestions.length - 1)]);
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    onConfigChange({ ...safeConfig, questions: newQuestions });
    if (onQuestionChange) {
      onQuestionChange(newQuestions[activeQuestion]);
    }
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({
      id: Date.now(),
      text: '',
      isCorrect: false
    });
    onConfigChange({ ...safeConfig, questions: newQuestions });
    if (onQuestionChange) {
      onQuestionChange(newQuestions[questionIndex]);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    onConfigChange({ ...safeConfig, questions: newQuestions });
    if (onQuestionChange) {
      onQuestionChange(newQuestions[questionIndex]);
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = {
      ...newQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    onConfigChange({ ...safeConfig, questions: newQuestions });
    if (onQuestionChange) {
      onQuestionChange(newQuestions[questionIndex]);
    }
  };

  // If no questions exist, show empty state
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Aucune question configurée</p>
        <button
          onClick={addQuestion}
          className="flex items-center px-4 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] mx-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter la première question
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {questions.map((question: any, index: number) => (
          <button
            key={question.id}
            onClick={() => {
              setActiveQuestion(index);
              if (onQuestionChange) {
                onQuestionChange(questions[index]);
              }
            }}
            className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
              activeQuestion === index
                ? 'bg-[#841b60] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Question {index + 1}
          </button>
        ))}
        <button
          onClick={addQuestion}
          className="flex items-center px-4 py-2 bg-[#f8f0f5] text-[#841b60] rounded-lg hover:bg-[#f0e5ec] whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une question
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {questions[activeQuestion] ? (
          <>
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Type className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={questions[activeQuestion].text}
                        onChange={(e) => updateQuestion(activeQuestion, 'text', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                        placeholder="Saisissez votre question"
                      />
                    </div>
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (optionnelle)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={questions[activeQuestion].image}
                    onChange={(e) => updateQuestion(activeQuestion, 'image', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                    placeholder="URL de l'image"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de réponse
                </label>
                <select
                  value={questions[activeQuestion].type}
                  onChange={(e) => updateQuestion(activeQuestion, 'type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                >
                  <option value="multiple">Choix multiple</option>
                  <option value="single">Choix unique</option>
                  <option value="true-false">Vrai/Faux</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de temps (en secondes, 0 = pas de limite)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={questions[activeQuestion].timeLimit}
                    onChange={(e) => updateQuestion(activeQuestion, 'timeLimit', parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                  />
                </div>
              </div>
            </div>

                <button
                  onClick={() => removeQuestion(activeQuestion)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  disabled={questions.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Options de réponse
                  </label>
                  <button
                    onClick={() => addOption(activeQuestion)}
                    className="text-sm text-[#841b60] hover:text-[#6d164f] font-medium flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter une option
                  </button>
                </div>

                <div className="space-y-3">
                  {questions[activeQuestion].options?.map((option: any, optionIndex: number) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <input
                        type={questions[activeQuestion].type === 'multiple' ? 'checkbox' : 'radio'}
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(activeQuestion, optionIndex, 'isCorrect', e.target.checked)}
                        className="w-5 h-5 text-[#841b60] border-gray-300 focus:ring-[#841b60]"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(activeQuestion, optionIndex, 'text', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        onClick={() => removeOption(activeQuestion, optionIndex)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        disabled={questions[activeQuestion].options?.length <= 2}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message réponse correcte
                  </label>
                  <input
                    type="text"
                    value={questions[activeQuestion].feedback?.correct || ''}
                    onChange={(e) => updateQuestion(activeQuestion, 'feedback', {
                      ...questions[activeQuestion].feedback,
                      correct: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                    placeholder="Bravo !"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message réponse incorrecte
                  </label>
                  <input
                    type="text"
                    value={questions[activeQuestion].feedback?.incorrect || ''}
                    onChange={(e) => updateQuestion(activeQuestion, 'feedback', {
                      ...questions[activeQuestion].feedback,
                      incorrect: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                    placeholder="Dommage..."
                  />
                </div>
              </div>
            </div>
            <QuizPreview question={questions[activeQuestion]} />
          </>
        ) : (
          <div className="md:col-span-2 text-center py-12 text-gray-500">
            Sélectionnez ou ajoutez une question pour la prévisualiser
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
