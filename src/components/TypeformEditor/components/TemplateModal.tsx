import React from 'react';
import { X, FileText, Users, ClipboardList, Calendar, Briefcase, ShoppingCart, Heart, UserCheck, GraduationCap, Plane, DollarSign, UtensilsCrossed, Dumbbell, Sparkles, Laptop, MessageCircle, HandHeart } from 'lucide-react';
import { TypeformTemplate, typeformTemplates } from '../templates/typeformTemplates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TypeformTemplate) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  feedback: <ClipboardList size={20} />,
  contact: <FileText size={20} />,
  survey: <Users size={20} />,
  registration: <Calendar size={20} />,
  'lead-generation': <Briefcase size={20} />,
  'e-commerce': <ShoppingCart size={20} />,
  healthcare: <Heart size={20} />,
  hr: <UserCheck size={20} />,
  education: <GraduationCap size={20} />,
  travel: <Plane size={20} />,
  finance: <DollarSign size={20} />,
  food: <UtensilsCrossed size={20} />,
  fitness: <Dumbbell size={20} />,
  beauty: <Sparkles size={20} />,
  saas: <Laptop size={20} />,
  community: <MessageCircle size={20} />,
  nonprofit: <HandHeart size={20} />,
};

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-sm text-gray-500 mt-1">
              Start with a pre-built form and customize it to your needs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typeformTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-[#841b60] hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                {template.thumbnail && (
                  <div className="mb-4 rounded-lg overflow-hidden h-32 bg-gray-100">
                    <img
                      src={template.thumbnail}
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
            ))}
          </div>
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
