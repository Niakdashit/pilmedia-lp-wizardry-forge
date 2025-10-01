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
        <h4 className="text-sm font-medium text-gray-700">Templates de Quiz</h4>
        <span className="text-xs text-gray-500">{quizTemplates.length} disponibles</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {quizTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-[#d4dbe8] bg-white shadow-lg'
                : hoveredTemplate === template.id
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => onTemplateSelect(template)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {/* Selection indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d4dbe8 0%, #a21d6b 100%)' }}>
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={`p-2 rounded-lg ${
                selectedTemplate === template.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600'
              }`} style={selectedTemplate === template.id ? {
                background: 'linear-gradient(135deg, #d4dbe8 0%, #a21d6b 100%)'
              } : {}}>
                {getTemplateIcon(template)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-gray-900 truncate">
                    {template.name}
                  </h5>
                  {template.hasImage && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs text-white border" style={{
                      background: 'linear-gradient(135deg, #d4dbe8 0%, #a21d6b 100%)',
                      borderColor: '#d4dbe8'
                    }}>
                      <Image className="w-3 h-3 mr-1" />
                      Image
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {template.description}
                </p>

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

      {/* Bloc d'information "Template sélectionné" supprimé */}
    </div>
  );
};

export default QuizTemplateSelector;
