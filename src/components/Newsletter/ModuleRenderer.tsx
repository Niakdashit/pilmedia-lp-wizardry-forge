
import React from 'react';
import { useNewsletterStore } from '@/stores/newsletterStore';
import { Trash2, GripVertical, ChevronUp, ChevronDown, Copy } from 'lucide-react';

interface ModuleRendererProps {
  module: any;
}

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ module }) => {
  const { updateModule, removeModule, selectModule } = useNewsletterStore();

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementation for moving module up
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementation for moving module down
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add duplicate module logic here
  };

  return (
    <div 
      className="relative p-4 border border-gray-200 rounded-lg mb-4 group hover:border-[#841b60] transition-colors duration-200"
      onClick={() => selectModule(module.id)}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
        <button
          onClick={handleMoveUp}
          className="p-1 text-gray-400 hover:text-[#841b60] rounded-lg transition-colors duration-200"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={handleMoveDown}
          className="p-1 text-gray-400 hover:text-[#841b60] rounded-lg transition-colors duration-200"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1 text-gray-400 hover:text-[#841b60] rounded-lg transition-colors duration-200"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeModule(module.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="pl-6 pr-24">
        {module.type === 'text' && (
          <textarea
            value={module.content || ''}
            onChange={(e) => updateModule(module.id, { content: e.target.value })}
            className="w-full p-2 border border-gray-200 rounded resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            placeholder="Saisissez votre texte ici..."
          />
        )}

        {module.type === 'image' && (
          <div className="space-y-2">
            <input
              type="text"
              value={module.content || ''}
              onChange={(e) => updateModule(module.id, { content: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              placeholder="URL de l'image..."
            />
            {module.content && (
              <img
                src={module.content}
                alt=""
                className="max-w-full h-auto rounded"
              />
            )}
          </div>
        )}

        {module.type === 'button' && (
          <div className="space-y-2">
            <input
              type="text"
              value={module.content || ''}
              onChange={(e) => updateModule(module.id, { content: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              placeholder="Texte du bouton..."
            />
            <input
              type="text"
              value={module.settings?.url || ''}
              onChange={(e) => updateModule(module.id, { settings: { ...module.settings, url: e.target.value } })}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
              placeholder="URL du lien..."
            />
            {module.content && (
              <button className="w-full px-6 py-3 bg-[#841b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors duration-200">
                {module.content}
              </button>
            )}
          </div>
        )}

        {module.type === 'divider' && (
          <hr className="border-t border-gray-200 my-2" />
        )}

        {module.type === 'header' && (
          <div className="flex justify-between items-center">
            <div className="w-32 h-10 bg-[#841b60] rounded flex items-center justify-center text-white font-bold">
              LOGO
            </div>
            <div className="flex space-x-4 text-sm">
              <a href="#" className="text-[#841b60] hover:underline">Accueil</a>
              <a href="#" className="text-[#841b60] hover:underline">Produits</a>
              <a href="#" className="text-[#841b60] hover:underline">Contact</a>
            </div>
          </div>
        )}

        {module.type === 'footer' && (
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">Entreprise SAS - 123 rue de l'exemple, 75000 Paris</p>
            <p className="mb-2">Pour vous désabonner, <a href="#" className="text-[#841b60] underline">cliquez ici</a></p>
            <p>&copy; 2023 Tous droits réservés</p>
          </div>
        )}

        {module.type === 'social' && (
          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Suivez-nous sur les réseaux sociaux</p>
            <div className="flex justify-center space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((network) => (
                <a
                  key={network}
                  href="#"
                  className="w-8 h-8 rounded-full bg-[#841b60] flex items-center justify-center text-white hover:bg-[#6d164f] transition-colors duration-200"
                >
                  <i className={`fab fa-${network}`}></i>
                </a>
              ))}
            </div>
          </div>
        )}

        {module.type === 'columns' && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${module.settings?.columns || 2}, 1fr)` }}>
            {Array.from({ length: module.settings?.columns || 2 }).map((_, index) => {
              let columnContent = '';
              try {
                const parsedContent = JSON.parse(module.content || '[]');
                columnContent = Array.isArray(parsedContent) ? (parsedContent[index] || '') : '';
              } catch {
                columnContent = index === 0 ? (module.content || '') : '';
              }
              
              return (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <textarea
                    value={columnContent}
                    onChange={(e) => {
                      try {
                        const parsedContent = JSON.parse(module.content || '[]');
                        const newContent = Array.isArray(parsedContent) ? [...parsedContent] : [];
                        newContent[index] = e.target.value;
                        updateModule(module.id, { content: JSON.stringify(newContent) });
                      } catch {
                        const newContent = new Array(module.settings?.columns || 2).fill('');
                        newContent[index] = e.target.value;
                        updateModule(module.id, { content: JSON.stringify(newContent) });
                      }
                    }}
                    className="w-full p-2 border border-gray-200 rounded resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                    placeholder={`Contenu de la colonne ${index + 1}...`}
                  />
                </div>
              );
            })}
          </div>
        )}

        {module.type === 'html' && (
          <div className="bg-white border border-gray-200 rounded p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Code HTML</label>
            <textarea
              value={String(module.content || '')}
              onChange={(e) => updateModule(module.id, { content: e.target.value })}
              rows={10}
              className="w-full font-mono p-2 border border-gray-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="<div>Mon bloc HTML</div>"
            />
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-500 mb-1">Aperçu :</p>
              <div
                className="bg-gray-50 p-4 border rounded"
                dangerouslySetInnerHTML={{ __html: String(module.content || '<p>(vide)</p>') }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleRenderer;
