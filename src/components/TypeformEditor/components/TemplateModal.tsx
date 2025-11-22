import React from 'react';
import { X, FileText, Users, ClipboardList, Calendar, Briefcase } from 'lucide-react';
import { TypeformTemplate, typeformTemplates } from '../templates/typeformTemplates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TypeformTemplate) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  feedback: <ClipboardList size={20} />,
  contact: <Briefcase size={20} />,
  survey: <Users size={20} />,
  registration: <Calendar size={20} />,
};

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [activeTab, setActiveTab] = React.useState<'templates' | 'import' | 'ai'>('templates');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Overlay transparent (juste pour fermer au clic) */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[85vh] overflow-hidden pointer-events-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ajouter des questions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Choisissez un template ou créez vos questions
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 -mb-px">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'templates'
                  ? 'text-[#841b60] border-[#841b60]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'import'
                  ? 'text-[#841b60] border-[#841b60]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Importer des questions
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'ai'
                  ? 'text-[#841b60] border-[#841b60]'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Créer avec l'IA
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeformTemplates.map((template) => {
              // Choisir l'aperçu : thumbnail explicite > image de la première question welcome > rien
              const welcomeQuestion = template.questions.find((q) => q.type === 'welcome');
              const previewImage = template.thumbnail || welcomeQuestion?.imageUrl;

              return (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-[#841b60] hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                {previewImage && (
                  <div className="mb-4 rounded-lg overflow-hidden h-32 bg-gray-100">
                    <img
                      src={previewImage}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Category Icon */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-[#841b60]/10 rounded-lg text-[#841b60]">
                    {categoryIcons[template.category] || <FileText size={20} />}
                  </div>
                  <span className="text-xs font-medium text-[#841b60] uppercase tracking-wide">
                    {template.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>

                {/* Questions Count */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{template.questions.length} questions</span>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#841b60] rounded-xl pointer-events-none transition-all" />
              </button>
            );})}
            </div>
          )}
          
          {activeTab === 'import' && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Importer des questions
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Copiez et collez vos questions ou importez depuis Google Forms
                </p>
                <textarea
                  placeholder="Collez vos questions ici, une par ligne..."
                  className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none resize-none"
                />
                <button className="mt-4 px-6 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d1650] transition-colors">
                  Importer
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'ai' && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Créer avec l'IA
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Décrivez votre formulaire et l'IA générera les questions pour vous
                </p>
                <textarea
                  placeholder="Ex: Je veux créer un formulaire de satisfaction client avec des questions sur le produit, le service et la livraison..."
                  className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none resize-none"
                />
                <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
                  Générer avec l'IA
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: You can customize any template after selecting it
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
