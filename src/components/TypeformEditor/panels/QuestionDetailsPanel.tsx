import React, { useState } from 'react';
import { X, Image as ImageIcon, Trash2, ChevronLeft, ChevronRight, Video, GitBranch, Layout, Palette, Type as TypeIcon, Link } from 'lucide-react';
import { TypeformQuestion, SubField, TypeformLayout } from '../components/TypeformPreview';

interface QuestionDetailsPanelProps {
  question: TypeformQuestion | undefined;
  isOpen: boolean;
  onClose: () => void;
  onChange: (updated: TypeformQuestion) => void;
  onAddOption?: () => void;
  onUpdateOption?: (index: number, value: string) => void;
  onUpdateOptionImage?: (index: number, url: string) => void;
  onDeleteOption?: (index: number) => void;
  onAddSubField?: () => void;
  onUpdateSubField?: (index: number, updates: Partial<SubField>) => void;
  onDeleteSubField?: (index: number) => void;
}

const questionTypes = [
  { value: 'text', label: 'Texte court' },
  { value: 'long-text', label: 'Texte long' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Téléphone' },
  { value: 'number', label: 'Nombre' },
  { value: 'choice', label: 'Choix unique' },
  { value: 'multiple', label: 'Choix multiples' },
  { value: 'scale', label: 'Échelle' },
  { value: 'form', label: 'Formulaire multi-champs' },
  { value: 'welcome', label: 'Page d\'accueil' },
  { value: 'thankyou', label: 'Page de remerciement' },
];

export const QuestionDetailsPanel: React.FC<QuestionDetailsPanelProps> = ({
  question,
  isOpen,
  onClose,
  onChange,
  onAddOption,
  onUpdateOption,
  onUpdateOptionImage,
  onDeleteOption,
  onAddSubField,
  onUpdateSubField,
  onDeleteSubField,
}) => {
  const [isLeft, setIsLeft] = useState(false);

  if (!question) return null;

  return (
    <>
      {/* Overlay transparent (juste pour fermer au clic) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Modale flottante */}
      <div
        className={`fixed w-[500px] max-h-[90vh] bg-white shadow-2xl z-50 transition-all duration-500 ease-out ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
        style={{
          top: '50%',
          [isLeft ? 'left' : 'right']: '24px',
          transform: 'translateY(-50%)',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header avec gradient */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-[18px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeft(!isLeft)}
              className="p-2 text-gray-400 hover:text-[#841b60] hover:bg-[#841b60]/10 rounded-lg transition-all duration-200 hover:scale-110"
              title={isLeft ? "Déplacer à droite" : "Déplacer à gauche"}
            >
              {isLeft ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Édition de question</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu scrollable avec scrollbar personnalisée */}
        <div className="overflow-y-auto max-h-[calc(90vh-73px)] p-6 space-y-8 custom-scrollbar">
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 10px;
              transition: background 0.2s;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #841b60;
            }
          `}</style>

          {/* Section: Question */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#841b60] rounded-full"></div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Question</h3>
            </div>

            {/* Titre */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Titre de la question
              </label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => onChange({ ...question, text: e.target.value })}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none transition-all duration-200 hover:border-gray-300"
                placeholder="Ex: Quel est votre nom ?"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={question.description || ''}
                onChange={(e) => onChange({ ...question, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none transition-all duration-200 resize-none hover:border-gray-300"
                placeholder="Texte d'aide..."
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Type de question
              </label>
              <select
                value={question.type}
                onChange={(e) => {
                  const newType = e.target.value as any;
                  onChange({ ...question, type: newType });
                }}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none transition-all duration-200 hover:border-gray-300 cursor-pointer"
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Answer (Options pour choice/multiple) */}
          {(question.type === 'choice' || question.type === 'multiple') && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Réponses</h3>

              <div className="space-y-3">
                {(question.options || []).map((option, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                    {/* Texte de l'option */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => onUpdateOption?.(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none text-sm"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => onDeleteOption?.(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Image de l'option */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={(question.optionImages || [])[index] || ''}
                        onChange={(e) => onUpdateOptionImage?.(index, e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-white text-gray-900 text-sm rounded border border-gray-200 focus:border-[#841b60] outline-none"
                        placeholder="URL de l'image..."
                      />
                      <label className="px-2 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer inline-flex items-center justify-center">
                        <ImageIcon size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const objectUrl = URL.createObjectURL(file);
                            onUpdateOptionImage?.(index, objectUrl);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={onAddOption}
                  className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-dashed border-gray-300 transition-colors text-sm font-medium"
                >
                  + Ajouter une option
                </button>
              </div>
            </div>
          )}

          {/* Section: Form Fields (pour type 'form') */}
          {question.type === 'form' && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Champs du formulaire</h3>
              
              <div className="space-y-3">
                {(question.subFields || []).map((subField, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    {/* Label et Titre */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={subField.label || ''}
                        onChange={(e) => onUpdateSubField?.(index, { label: e.target.value })}
                        className="px-2 py-1.5 bg-white text-gray-900 text-sm rounded border border-gray-200 focus:border-[#841b60] outline-none"
                        placeholder="Label du champ"
                      />
                      <input
                        type="text"
                        value={subField.title || ''}
                        onChange={(e) => onUpdateSubField?.(index, { title: e.target.value })}
                        className="px-2 py-1.5 bg-white text-gray-900 text-sm rounded border border-gray-200 focus:border-[#841b60] outline-none"
                        placeholder="Titre (optionnel)"
                      />
                    </div>
                    
                    {/* Placeholder */}
                    <input
                      type="text"
                      value={subField.placeholder || ''}
                      onChange={(e) => onUpdateSubField?.(index, { placeholder: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white text-gray-900 text-sm rounded border border-gray-200 focus:border-[#841b60] outline-none"
                      placeholder="Placeholder"
                    />
                    
                    {/* Type, Largeur, Supprimer */}
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={subField.type || 'text'}
                        onChange={(e) => onUpdateSubField?.(index, { type: e.target.value as any })}
                        className="px-2 py-1.5 bg-white text-gray-900 text-sm rounded border border-gray-200 focus:border-[#841b60] outline-none"
                      >
                        <option value="text">Texte</option>
                        <option value="email">Email</option>
                        <option value="phone">Téléphone</option>
                        <option value="number">Nombre</option>
                      </select>
                      
                      <select
                        value={subField.width || 'full'}
                        onChange={(e) => onUpdateSubField?.(index, { width: e.target.value as any })}
                        className="px-2 py-1.5 bg-white text-gray-900 text-sm rounded border border-gray-200 focus:border-[#841b60] outline-none"
                      >
                        <option value="full">Pleine largeur</option>
                        <option value="half">Demi-largeur</option>
                      </select>
                      
                      <button
                        onClick={() => onDeleteSubField?.(index)}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {/* Checkbox requis */}
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subField.required || false}
                        onChange={(e) => onUpdateSubField?.(index, { required: e.target.checked })}
                        className="rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]"
                      />
                      Champ requis
                    </label>
                  </div>
                ))}
                
                <button
                  onClick={onAddSubField}
                  className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-dashed border-gray-300 transition-colors text-sm font-medium"
                >
                  + Ajouter un champ
                </button>
              </div>
            </div>
          )}

          {/* Section: Scale (min/max) */}
          {question.type === 'scale' && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Échelle</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum
                  </label>
                  <input
                    type="number"
                    value={question.min || 0}
                    onChange={(e) => onChange({ ...question, min: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum
                  </label>
                  <input
                    type="number"
                    value={question.max || 10}
                    onChange={(e) => onChange({ ...question, max: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Comportement */}
          <div className="space-y-5 pt-8 border-t-2 border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#841b60] rounded-full"></div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Comportement</h3>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
              <input
                type="checkbox"
                checked={question.required || false}
                onChange={(e) => onChange({ ...question, required: e.target.checked })}
                className="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#841b60] focus:ring-4 focus:ring-[#841b60]/20 cursor-pointer transition-all"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Réponse requise</span>
            </label>

            {/* Options avancées pour choice/multiple */}
            {(question.type === 'choice' || question.type === 'multiple') && (
              <div className="space-y-3 pt-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
                  <input
                    type="checkbox"
                    checked={question.type === 'multiple'}
                    onChange={(e) => onChange({ ...question, type: e.target.checked ? 'multiple' : 'choice' })}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#841b60] focus:ring-4 focus:ring-[#841b60]/20 cursor-pointer transition-all"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Sélection multiple</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
                  <input
                    type="checkbox"
                    checked={(question as any).randomize || false}
                    onChange={(e) => onChange({ ...question, randomize: e.target.checked } as any)}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#841b60] focus:ring-4 focus:ring-[#841b60]/20 cursor-pointer transition-all"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Mélanger les options</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
                  <input
                    type="checkbox"
                    checked={(question as any).showLabels !== false}
                    onChange={(e) => onChange({ ...question, showLabels: e.target.checked } as any)}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#841b60] focus:ring-4 focus:ring-[#841b60]/20 cursor-pointer transition-all"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Afficher les lettres (A, B, C...)</span>
                </label>
              </div>
            )}
          </div>

          {/* Section: Média */}
          <div className="space-y-5 pt-8 border-t-2 border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#841b60] rounded-full"></div>
              <Video size={16} className="text-[#841b60]" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Média</h3>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Image ou vidéo
              </label>
              <input
                type="text"
                value={question.imageUrl || ''}
                onChange={(e) => onChange({ ...question, imageUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none transition-all duration-200 hover:border-gray-300"
                placeholder="https://exemple.com/image.jpg"
              />
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                Formats supportés : JPG, PNG, GIF, MP4, YouTube, Vimeo
              </p>
            </div>
          </div>

          {/* Section: Layout */}
          <div className="space-y-5 pt-8 border-t-2 border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#841b60] rounded-full"></div>
              <Layout size={16} className="text-[#841b60]" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Layout</h3>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Disposition de la question
              </label>
              <select
                value={question.layout || 'centered-card'}
                onChange={(e) => onChange({ ...question, layout: e.target.value as TypeformLayout })}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none transition-all duration-200 hover:border-gray-300 cursor-pointer"
              >
                <option value="centered-card">Carte centrée</option>
                <option value="split-left-text-right-image">Texte gauche / Image droite</option>
                <option value="split-left-image-right-text">Image gauche / Texte droite</option>
                <option value="split-left-text-right-image-card">Texte gauche / Image card</option>
                <option value="scale-horizontal">Échelle horizontale</option>
                <option value="cards-grid">Grille de cartes</option>
                <option value="fullwidth-input">Champ pleine largeur</option>
              </select>
            </div>
          </div>

          {/* Section: Couleurs */}
          <div className="space-y-5 pt-8 border-t-2 border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#841b60] rounded-full"></div>
              <Palette size={16} className="text-[#841b60]" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Couleurs</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Couleur de fond */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Fond
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(question as any).backgroundColor || '#ffffff'}
                    onChange={(e) => onChange({ ...question, backgroundColor: e.target.value } as any)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(question as any).backgroundColor || '#ffffff'}
                    onChange={(e) => onChange({ ...question, backgroundColor: e.target.value } as any)}
                    className="flex-1 px-3 py-2 text-sm bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:border-[#841b60] focus:ring-2 focus:ring-[#841b60]/10 outline-none"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Couleur de texte */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Texte
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(question as any).textColor || '#000000'}
                    onChange={(e) => onChange({ ...question, textColor: e.target.value } as any)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(question as any).textColor || '#000000'}
                    onChange={(e) => onChange({ ...question, textColor: e.target.value } as any)}
                    className="flex-1 px-3 py-2 text-sm bg-white text-gray-900 rounded-lg border-2 border-gray-200 focus:border-[#841b60] focus:ring-2 focus:ring-[#841b60]/10 outline-none"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Typographie */}
          <div className="space-y-5 pt-8 border-t-2 border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#841b60] rounded-full"></div>
              <TypeIcon size={16} className="text-[#841b60]" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Typographie</h3>
            </div>
            
            <div className="space-y-4">
              {/* Police */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Police de caractères
                </label>
                <select
                  value={(question as any).fontFamily || 'Inter'}
                  onChange={(e) => onChange({ ...question, fontFamily: e.target.value } as any)}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none transition-all duration-200 hover:border-gray-300 cursor-pointer"
                >
                  <option value="Inter">Inter (par défaut)</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Lato">Lato</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>

              {/* Taille de texte */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Taille du texte
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="14"
                    max="32"
                    value={(question as any).fontSize || 18}
                    onChange={(e) => onChange({ ...question, fontSize: parseInt(e.target.value) } as any)}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                    {(question as any).fontSize || 18}px
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Lien hypertexte */}
          <div className="space-y-5 pt-8 border-t-2 border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#841b60] rounded-full"></div>
              <Link size={16} className="text-[#841b60]" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Lien hypertexte</h3>
            </div>
            
            <div className="space-y-4">
              {/* Texte du lien */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Texte du lien
                </label>
                <input
                  type="text"
                  value={(question as any).linkText || ''}
                  onChange={(e) => onChange({ ...question, linkText: e.target.value } as any)}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none transition-all duration-200 hover:border-gray-300"
                  placeholder="En savoir plus"
                />
              </div>

              {/* URL du lien */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  URL du lien
                </label>
                <input
                  type="url"
                  value={(question as any).linkUrl || ''}
                  onChange={(e) => onChange({ ...question, linkUrl: e.target.value } as any)}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-[#841b60] focus:ring-4 focus:ring-[#841b60]/10 outline-none transition-all duration-200 hover:border-gray-300"
                  placeholder="https://exemple.com"
                />
              </div>
            </div>
          </div>

          {/* Section: Logique */}
          <div className="space-y-5 pt-8 border-t-2 border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#841b60] rounded-full"></div>
              <GitBranch size={16} className="text-[#841b60]" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Logique conditionnelle</h3>
            </div>
            
            {/* Règles de logique existantes */}
            {question.logic && Object.keys(question.logic).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(question.logic).map(([answer, nextQuestionId], index) => (
                  <div 
                    key={index}
                    className="p-4 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">SI</span>
                        <span className="text-sm text-gray-700 font-medium truncate">"{answer}"</span>
                      </div>
                      <div className="text-purple-500">→</div>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">ALLER À</span>
                        <span className="text-sm text-gray-700 font-medium truncate">Q{nextQuestionId}</span>
                      </div>
                      <button
                        onClick={() => {
                          const newLogic = { ...question.logic };
                          delete newLogic[answer];
                          onChange({ ...question, logic: newLogic });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Aucune règle de logique définie. Ajoutez des conditions pour diriger les utilisateurs vers différentes questions selon leurs réponses.
                </p>
              </div>
            )}
            
            {/* Bouton ajouter une règle */}
            <button
              className="w-full px-5 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 rounded-xl transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                // TODO: Ouvrir le modal d'ajout de règle
                alert('Fonctionnalité d\'ajout de règle à venir\n\nVous pourrez définir:\n- Si réponse = X → aller à question Y\n- Si réponse contient Z → aller à question W\n- Etc.');
              }}
            >
              <GitBranch size={18} />
              Ajouter une règle
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
