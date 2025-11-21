import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { WheelTemplate, wheelTemplates } from '../../../types/wheelTemplates';

interface WheelTemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateSelect: (template: WheelTemplate) => void;
}

const WheelTemplateSelector: React.FC<WheelTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Templates de Roue</h4>
        <span className="text-xs text-gray-500">{wheelTemplates.length} disponibles</span>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2">
        {wheelTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-[#44444d] bg-white shadow-lg'
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
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #44444d 0%, #a21d6b 100%)' }}>
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
                background: 'linear-gradient(135deg, #44444d 0%, #a21d6b 100%)'
              } : {}}>
                <Sparkles className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-900 truncate">
                  {template.name}
                </h5>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Preview colors */}
            <div className="mt-3 flex space-x-1">
              <div 
                className="h-2 flex-1 rounded-full"
                style={{ backgroundColor: template.style.backgroundColor }}
              />
              <div 
                className="h-2 w-12 rounded-full"
                style={{ backgroundColor: template.wheelStyle.borderColor }}
              />
              <div 
                className="h-2 w-8 rounded-full"
                style={{ backgroundColor: template.textStyle.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WheelTemplateSelector;
