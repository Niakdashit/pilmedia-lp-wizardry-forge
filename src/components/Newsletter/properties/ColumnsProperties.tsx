
import React from 'react';
import { ModuleData } from '@/stores/newsletterStore';

interface ColumnsPropertiesProps {
  module: ModuleData;
  onUpdate: (id: string, updates: Partial<ModuleData>) => void;
}

export const ColumnsProperties: React.FC<ColumnsPropertiesProps> = ({ module, onUpdate }) => {
  const handleColumnCountChange = (count: number) => {
    onUpdate(module.id, {
      settings: {
        ...module.settings,
        columns: count
      }
    });
  };

  const handleColumnContentChange = (index: number, content: string) => {
    try {
      const parsedContent = JSON.parse(module.content || '[]');
      const newContent = Array.isArray(parsedContent) ? [...parsedContent] : [];
      newContent[index] = content;
      onUpdate(module.id, { content: JSON.stringify(newContent) });
    } catch {
      const newContent = new Array(module.settings?.columns || 2).fill('');
      newContent[index] = content;
      onUpdate(module.id, { content: JSON.stringify(newContent) });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de colonnes
        </label>
        <div className="flex gap-2">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => handleColumnCountChange(count)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                module.settings?.columns === count
                  ? 'bg-[#841b60] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Contenu des colonnes
        </label>
        {Array.from({ length: module.settings?.columns || 2 }).map((_, index) => {
          let columnContent = '';
          try {
            const parsedContent = JSON.parse(module.content || '[]');
            columnContent = Array.isArray(parsedContent) ? (parsedContent[index] || '') : '';
          } catch {
            columnContent = index === 0 ? (module.content || '') : '';
          }
          
          return (
            <div key={index}>
              <label className="block text-xs text-gray-500 mb-1">
                Colonne {index + 1}
              </label>
              <textarea
                value={columnContent}
                onChange={(e) => handleColumnContentChange(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                placeholder={`Contenu de la colonne ${index + 1}...`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
