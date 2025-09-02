import React from 'react';
import { ArrowLeft } from 'lucide-react';
import QuizTemplateSelector from '../components/QuizTemplateSelector';
import { QuizTemplate } from '../../../types/quizTemplates';

interface QuizConfigPanelProps {
  onBack: () => void;
  quizQuestionCount: number;
  quizTimeLimit: number;
  quizDifficulty: 'easy' | 'medium' | 'hard';
  onQuestionCountChange: (count: number) => void;
  onTimeLimitChange: (time: number) => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  selectedTemplate?: string;
  onTemplateChange?: (template: QuizTemplate) => void;
}

const QuizConfigPanel: React.FC<QuizConfigPanelProps> = ({
  onBack,
  quizQuestionCount,
  quizTimeLimit,
  quizDifficulty,
  onQuestionCountChange,
  onTimeLimitChange,
  onDifficultyChange,
  selectedDevice = 'desktop',
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-700">
        <button
          onClick={onBack}
          className="mr-3 p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h3 className="text-lg font-semibold text-white">Configuration Quiz</h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Templates Section */}
        <div className="space-y-3">
          <QuizTemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateSelect={(template) => {
              console.log('🎯 Template selected:', template.id, template.name);
              onTemplateChange?.(template);
            }}
          />
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Nombre de questions
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="1"
              max="20"
              value={quizQuestionCount}
              onChange={(e) => onQuestionCountChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="bg-gray-700 px-2 py-1 rounded text-sm text-white min-w-[40px] text-center">
              {quizQuestionCount}
            </div>
          </div>
        </div>

        {/* Time Limit */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Temps limite (secondes)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={quizTimeLimit}
              onChange={(e) => onTimeLimitChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="bg-gray-700 px-2 py-1 rounded text-sm text-white min-w-[50px] text-center">
              {quizTimeLimit}s
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Difficulté
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => onDifficultyChange(difficulty)}
                className={`p-3 rounded-lg border transition-all ${
                  quizDifficulty === difficulty
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="text-sm font-medium capitalize">
                  {difficulty === 'easy' ? 'Facile' : 
                   difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Device-specific note */}
        {selectedDevice !== 'desktop' && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              Configuration pour {selectedDevice === 'tablet' ? 'tablette' : 'mobile'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizConfigPanel;
