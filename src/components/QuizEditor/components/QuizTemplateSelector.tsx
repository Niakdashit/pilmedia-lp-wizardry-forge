import React, { useState } from 'react';
import { Check, Image, Type, Palette, Minimize2 } from 'lucide-react';
import { QuizTemplate, quizTemplates } from '../../../types/quizTemplates';

interface QuizTemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateSelect: (template: QuizTemplate) => void;
}

const QuizTemplateSelector: React.FC<QuizTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const getTemplateIcon = (template: QuizTemplate) => {
    switch (template.id) {
      case 'image-quiz':
        return <Image className="w-5 h-5" />;
      case 'modern-gradient':
        return <Palette className="w-5 h-5" />;
      case 'minimal-card':
        return <Minimize2 className="w-5 h-5" />;
      default:
        return <Type className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Templates de Quiz</h4>
        <span className="text-xs text-gray-500">{quizTemplates.length} disponibles</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {quizTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-purple-500 bg-purple-900/20'
                : hoveredTemplate === template.id
                ? 'border-gray-500 bg-gray-700/50'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
            onClick={() => onTemplateSelect(template)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {/* Selection indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={`p-2 rounded-lg ${
                selectedTemplate === template.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {getTemplateIcon(template)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-white truncate">
                    {template.name}
                  </h5>
                  {template.hasImage && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-300 border border-blue-700/50">
                      <Image className="w-3 h-3 mr-1" />
                      Image
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {template.description}
                </p>

                {/* Template preview info */}
                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                  <span>Largeur: {template.style.containerWidth}px</span>
                  <span>Bordure: {template.style.borderRadius}px</span>
                  {template.hasImage && (
                    <span className="text-blue-400">+ Image support</span>
                  )}
                </div>
              </div>
            </div>

            {/* Preview bar showing colors */}
            <div className="mt-3 flex space-x-1">
              <div 
                className="h-2 flex-1 rounded-full"
                style={{ 
                  background: template.style.backgroundColor.includes('gradient') 
                    ? template.style.backgroundColor 
                    : template.style.backgroundColor 
                }}
              />
              <div 
                className="h-2 w-8 rounded-full"
                style={{ 
                  backgroundColor: template.letterStyle.color || template.letterStyle.backgroundColor || '#9C7A5B'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Template info */}
      {selectedTemplate && (
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-400">Template sélectionné</span>
          </div>
          {(() => {
            const template = quizTemplates.find(t => t.id === selectedTemplate);
            return template ? (
              <div className="space-y-1 text-xs text-gray-400">
                <p><strong className="text-gray-300">Style:</strong> {template.name}</p>
                <p><strong className="text-gray-300">Taille:</strong> {template.style.containerWidth}px de large</p>
                {template.hasImage && (
                  <p><strong className="text-gray-300">Support:</strong> Images intégrées</p>
                )}
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default QuizTemplateSelector;
