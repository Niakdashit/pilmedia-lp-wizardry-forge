import React from 'react';

interface DesignPanelProps {
  onAddElement: (element: any) => void;
}

const DesignPanel: React.FC<DesignPanelProps> = ({ onAddElement }) => {
  const templates = [
    { id: 1, name: 'Post Instagram', size: '1080 × 1080 px', color: 'bg-pink-100' },
    { id: 2, name: 'Story Instagram', size: '1080 × 1920 px', color: 'bg-purple-100' },
    { id: 3, name: 'Publication Facebook', size: '1200 × 630 px', color: 'bg-[hsl(var(--primary))]' },
    { id: 4, name: 'Bannière LinkedIn', size: '1584 × 396 px', color: 'bg-indigo-100' },
    { id: 5, name: 'Logo', size: '500 × 500 px', color: 'bg-green-100' },
    { id: 6, name: 'Flyer', size: '2480 × 3508 px', color: 'bg-orange-100' },
  ];

  const handleTemplateClick = (template: any) => {
    // Add a template as a background element
    onAddElement({
      id: `template-${Date.now()}`,
      type: 'template',
      x: 0,
      y: 0,
      template: template.name,
      zIndex: 0
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher des designs..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
        />
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">FORMATS POPULAIRES</h3>
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-[hsl(var(--primary))] cursor-pointer transition-colors"
            >
              <div className={`w-12 h-12 ${template.color} rounded-lg mr-3 flex items-center justify-center`}>
                <div className="w-8 h-8 bg-white rounded opacity-80"></div>
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">{template.name}</div>
                <div className="text-xs text-gray-500">{template.size}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">DIMENSIONS PERSONNALISÉES</h3>
        <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors">
          + Créer un design personnalisé
        </button>
      </div>
    </div>
  );
};

export default DesignPanel;