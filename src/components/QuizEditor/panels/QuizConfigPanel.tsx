import React from 'react';
import { ArrowLeft } from 'lucide-react';
import QuizTemplateSelector from '../components/QuizTemplateSelector';
import { QuizTemplate } from '../../../types/quizTemplates';

interface QuizConfigPanelProps {
  onBack: () => void;
  quizQuestionCount: number;
  quizTimeLimit: number;
  quizDifficulty: 'easy' | 'medium' | 'hard';
  quizBorderRadius?: number;
  onQuestionCountChange: (count: number) => void;
  onTimeLimitChange: (time: number) => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onBorderRadiusChange?: (radius: number) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  selectedTemplate?: string;
  onTemplateChange?: (template: QuizTemplate) => void;
  // Style overrides
  backgroundColor?: string;
  textColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonHoverBackgroundColor?: string;
  buttonActiveBackgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
  onButtonBackgroundColorChange?: (color: string) => void;
  onButtonTextColorChange?: (color: string) => void;
  onButtonHoverBackgroundColorChange?: (color: string) => void;
  onButtonActiveBackgroundColorChange?: (color: string) => void;
}

const QuizConfigPanel: React.FC<QuizConfigPanelProps> = ({
  onBack,
  quizQuestionCount,
  quizTimeLimit,
  quizDifficulty,
  quizBorderRadius = 12,
  onQuestionCountChange,
  onTimeLimitChange,
  onDifficultyChange,
  onBorderRadiusChange,
  selectedDevice = 'desktop',
  selectedTemplate,
  onTemplateChange,
  backgroundColor,
  textColor,
  buttonBackgroundColor = '#4f46e5',
  buttonTextColor = '#ffffff',
  buttonHoverBackgroundColor = '#4338ca',
  buttonActiveBackgroundColor = '#3730a3',
  onBackgroundColorChange,
  onTextColorChange,
  onButtonBackgroundColorChange,
  onButtonTextColorChange,
  onButtonHoverBackgroundColorChange,
  onButtonActiveBackgroundColorChange
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
          <div className="flex space-x-2">
            {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => onDifficultyChange(difficulty)}
                className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
                  quizDifficulty === difficulty
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Couleur de fond du quiz
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={backgroundColor || '#ffffff'}
                onChange={(e) => onBackgroundColorChange?.(e.target.value)}
                className="w-10 h-10 rounded-md border border-gray-600 bg-gray-700 p-0"
                aria-label="Couleur de fond"
              />
              <input
                type="text"
                value={backgroundColor || ''}
                onChange={(e) => onBackgroundColorChange?.(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Couleur du texte du quiz
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={textColor || '#111111'}
                onChange={(e) => onTextColorChange?.(e.target.value)}
                className="w-10 h-10 rounded-md border border-gray-600 bg-gray-700 p-0"
                aria-label="Couleur du texte"
              />
              <input
                type="text"
                value={textColor || ''}
                onChange={(e) => onTextColorChange?.(e.target.value)}
                placeholder="#111111"
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>

          {/* Bouton - Couleur de fond */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Couleur des boutons
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={buttonBackgroundColor}
                onChange={(e) => onButtonBackgroundColorChange?.(e.target.value)}
                className="w-10 h-10 rounded-md border border-gray-600 bg-gray-700 p-0"
                aria-label="Couleur de fond des boutons"
              />
              <input
                type="text"
                value={buttonBackgroundColor || ''}
                onChange={(e) => onButtonBackgroundColorChange?.(e.target.value)}
                placeholder="#4f46e5"
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>

          {/* Bouton - Couleur du texte */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Couleur du texte des boutons
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={buttonTextColor}
                onChange={(e) => onButtonTextColorChange?.(e.target.value)}
                className="w-10 h-10 rounded-md border border-gray-600 bg-gray-700 p-0"
                aria-label="Couleur du texte des boutons"
              />
              <input
                type="text"
                value={buttonTextColor || ''}
                onChange={(e) => onButtonTextColorChange?.(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>

          {/* Bouton - Couleur de survol */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Couleur de survol des boutons
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={buttonHoverBackgroundColor}
                onChange={(e) => onButtonHoverBackgroundColorChange?.(e.target.value)}
                className="w-10 h-10 rounded-md border border-gray-600 bg-gray-700 p-0"
                aria-label="Couleur de survol des boutons"
              />
              <input
                type="text"
                value={buttonHoverBackgroundColor || ''}
                onChange={(e) => onButtonHoverBackgroundColorChange?.(e.target.value)}
                placeholder="#4338ca"
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>

          {/* Bouton - Couleur active */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Couleur active des boutons
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={buttonActiveBackgroundColor}
                onChange={(e) => onButtonActiveBackgroundColorChange?.(e.target.value)}
                className="w-10 h-10 rounded-md border border-gray-600 bg-gray-700 p-0"
                aria-label="Couleur active des boutons"
              />
              <input
                type="text"
                value={buttonActiveBackgroundColor || ''}
                onChange={(e) => onButtonActiveBackgroundColorChange?.(e.target.value)}
                placeholder="#3730a3"
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Border Radius */}
        {onBorderRadiusChange && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Arrondi des coins
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={quizBorderRadius}
                onChange={(e) => onBorderRadiusChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="bg-gray-700 px-2 py-1 rounded text-sm text-white min-w-[40px] text-center">
                {quizBorderRadius}px
              </div>
            </div>
          </div>
        )}

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
