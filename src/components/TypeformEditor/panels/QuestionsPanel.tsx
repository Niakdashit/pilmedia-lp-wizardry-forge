import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Type, Mail, Phone, Hash, List, CheckSquare, BarChart3, AlignLeft, Image as ImageIcon, LayoutTemplate, Sparkles, FileText } from 'lucide-react';
import { TypeformQuestion, TypeformLayout } from '../components/TypeformPreview';
import TemplateModal from '../components/TemplateModal';
import { TypeformTemplate } from '../templates/typeformTemplates';

interface QuestionsPanelProps {
  questions: TypeformQuestion[];
  onQuestionsChange: (questions: TypeformQuestion[]) => void;
  selectedQuestionId?: string;
  onSelectQuestion?: (id: string) => void;
  onOpenProsplayAI?: () => void;
  onApplyTemplate?: (template: TypeformTemplate) => void;
}

const layoutOptions: { value: TypeformLayout; label: string }[] = [
  { value: 'centered-card', label: 'Carte centrée (par défaut)' },
  { value: 'split-left-text-right-image', label: 'Texte gauche / Image droite' },
  { value: 'split-left-image-right-text', label: 'Image gauche / Texte droite' },
  { value: 'scale-horizontal', label: 'Échelle horizontale' },
  { value: 'cards-grid', label: 'Grille de cartes' },
  { value: 'fullwidth-input', label: 'Champ pleine largeur' },
];

const questionTypes = [
  { value: 'text', label: 'Texte court', icon: Type },
  { value: 'long-text', label: 'Texte long', icon: AlignLeft },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Téléphone', icon: Phone },
  { value: 'number', label: 'Nombre', icon: Hash },
  { value: 'choice', label: 'Choix unique', icon: List },
  { value: 'multiple', label: 'Choix multiples', icon: CheckSquare },
  { value: 'scale', label: 'Échelle', icon: BarChart3 },
];

export const QuestionsPanel: React.FC<QuestionsPanelProps> = ({
  questions,
  onQuestionsChange,
  selectedQuestionId,
  onSelectQuestion,
  onOpenProsplayAI
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const addQuestion = (initialLayout?: TypeformLayout) => {
    const newQuestion: TypeformQuestion = {
      id: `q${Date.now()}`,
      type: 'text',
      text: 'Nouvelle question',
      required: false,
      placeholder: 'Votre réponse...',
      layout: initialLayout || 'fullwidth-input' // Layout par défaut pour texte
    };
    onQuestionsChange([...questions, newQuestion]);
    setEditingId(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<TypeformQuestion>) => {
    onQuestionsChange(
      questions.map(q => q.id === id ? { ...q, ...updates } : q)
    );
  };

  const deleteQuestion = (id: string) => {
    onQuestionsChange(questions.filter(q => q.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    onQuestionsChange(newQuestions);
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    const options = question.options || [];
    updateQuestion(questionId, {
      options: [...options, `Option ${options.length + 1}`]
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const deleteOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;
    updateQuestion(questionId, {
      options: question.options.filter((_, i) => i !== optionIndex)
    });
  };

  const handleSelectTemplate = (template: TypeformTemplate) => {
    // Appliquer les questions
    onQuestionsChange(template.questions);
    
    // Appliquer le thème si le callback est fourni
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
    
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
            <span className="text-sm text-gray-500">{questions.length} question(s)</span>
          </div>
          {onOpenProsplayAI && (
            <button
              type="button"
              onClick={onOpenProsplayAI}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100"
            >
              <Sparkles size={14} />
              <span>Prosplay AI</span>
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#841b60] border border-[#841b60] rounded-lg transition-colors"
          >
            <FileText size={18} />
            <span>Templates</span>
          </button>
          <button
            onClick={() => addQuestion()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#841b60] hover:bg-[#6d1650] text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Nouvelle question</span>
          </button>
        </div>
      </div>

      {/* Template Modal */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Liste des questions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">Aucune question</p>
            <p className="text-sm text-gray-400">
              Cliquez sur "Ajouter une question" pour commencer
            </p>
          </div>
        ) : (
          questions.map((question, index) => {
            const isEditing = editingId === question.id;
            const TypeIcon = questionTypes.find(t => t.value === question.type)?.icon || Type;

            return (
              <div
                key={question.id}
                className={`bg-white rounded-lg border transition-all shadow-sm ${
                  selectedQuestionId === question.id
                    ? 'border-[#841b60]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header de la question */}
                <div className="px-3 py-3 pr-6 flex items-center gap-2">
                  <button
                    className="text-gray-500 hover:text-gray-300 cursor-move"
                    title="Déplacer"
                  >
                    <GripVertical size={18} />
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Q{index + 1}</span>
                    <span className="text-gray-900 font-medium truncate">
                      {question.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => moveQuestion(index, 'up')}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Monter"
                      >
                        ↑
                      </button>
                    )}

                    {index < questions.length - 1 && (
                      <button
                        onClick={() => moveQuestion(index, 'down')}
                        className="p-1 text-gray-400 hover:text-white rounded"
                        title="Descendre"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => setEditingId(isEditing ? null : question.id)}
                      className="px-2 py-1 text-xs text-[#841b60] hover:bg-gray-100 rounded"
                    >
                      {isEditing ? 'Fermer' : 'Éditer'}
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-1 mr-3 text-red-500 hover:text-red-400 rounded"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Formulaire d'édition */}
                {isEditing && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                    {/* Texte de la question */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                        className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Description (optionnel)
                      </label>
                      <input
                        type="text"
                        value={question.description || ''}
                        onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                        className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                        placeholder="Texte d'aide..."
                      />
                    </div>

                    {/* Type de question */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Type de question
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => {
                          const newType = e.target.value as any;
                          // Définir le layout par défaut selon le type de question
                          let defaultLayout: TypeformLayout = 'centered-card';
                          
                          if (newType === 'scale') {
                            defaultLayout = 'scale-horizontal';
                          } else if (newType === 'choice' || newType === 'multiple') {
                            defaultLayout = 'cards-grid';
                          } else if (newType === 'text' || newType === 'email' || newType === 'phone' || newType === 'number') {
                            defaultLayout = 'fullwidth-input';
                          }
                          
                          updateQuestion(question.id, { 
                            type: newType,
                            layout: defaultLayout,
                            // Ajouter des options par défaut pour les choix
                            ...(newType === 'choice' || newType === 'multiple' ? {
                              options: question.options?.length ? question.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4']
                            } : {}),
                            // Ajouter min/max par défaut pour les échelles
                            ...(newType === 'scale' ? {
                              min: question.min ?? 0,
                              max: question.max ?? 10
                            } : {})
                          });
                        }}
                        className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Template de mise en page */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <LayoutTemplate size={14} />
                        Template visuel
                      </label>
                      <select
                        value={question.layout || 'centered-card'}
                        onChange={(e) => updateQuestion(question.id, { layout: e.target.value as TypeformLayout })}
                        className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                      >
                        {layoutOptions
                          .filter((opt) => {
                            // Filtrer les layouts selon le type de question
                            if (opt.value === 'cards-grid') {
                              return question.type === 'choice' || question.type === 'multiple';
                            }
                            if (opt.value === 'scale-horizontal') {
                              return question.type === 'scale';
                            }
                            // Les autres layouts sont disponibles pour tous les types
                            return true;
                          })
                          .map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Image associée (pour layouts split / cartes) */}
                    {['split-left-text-right-image', 'split-left-image-right-text', 'cards-grid'].includes(
                      (question.layout || 'centered-card') as string
                    ) && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <ImageIcon size={14} />
                          Image
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={question.imageUrl || ''}
                            onChange={(e) => updateQuestion(question.id, { imageUrl: e.target.value })}
                            className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                            placeholder="URL..."
                          />
                          <label className="px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 cursor-pointer inline-flex items-center justify-center">
                            <ImageIcon size={14} />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const objectUrl = URL.createObjectURL(file);
                                updateQuestion(question.id, { imageUrl: objectUrl });
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Couleur de fond du panneau texte (layouts split) */}
                    {['split-left-text-right-image', 'split-left-image-right-text'].includes(
                      (question.layout || 'centered-card') as string
                    ) && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Couleur du panneau texte
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={question.panelBackgroundColor || '#ffffff'}
                            onChange={(e) => updateQuestion(question.id, { panelBackgroundColor: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-300 cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={question.panelBackgroundColor || '#ffffff'}
                            onChange={(e) => updateQuestion(question.id, { panelBackgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Background avancé */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arrière-plan de la question
                      </label>
                      
                      {/* Type de background */}
                      <div className="mb-3">
                        <select
                          value={question.backgroundType || 'color'}
                          onChange={(e) => updateQuestion(question.id, { backgroundType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none text-sm"
                        >
                          <option value="color">Couleur unie</option>
                          <option value="image">Image</option>
                          <option value="gradient">Dégradé</option>
                          <option value="video">Vidéo</option>
                        </select>
                      </div>

                      {/* Image background */}
                      {question.backgroundType === 'image' && (
                        <div className="mb-3">
                          <label className="block text-xs text-gray-600 mb-1">URL de l'image</label>
                          <input
                            type="text"
                            value={question.backgroundImage || ''}
                            onChange={(e) => updateQuestion(question.id, { backgroundImage: e.target.value })}
                            className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none text-sm"
                            placeholder="https://..."
                          />
                        </div>
                      )}

                      {/* Gradient background */}
                      {question.backgroundType === 'gradient' && (
                        <div className="mb-3">
                          <label className="block text-xs text-gray-600 mb-1">CSS Gradient</label>
                          <input
                            type="text"
                            value={question.backgroundGradient || ''}
                            onChange={(e) => updateQuestion(question.id, { backgroundGradient: e.target.value })}
                            className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none text-sm"
                            placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          />
                        </div>
                      )}

                      {/* Video background */}
                      {question.backgroundType === 'video' && (
                        <div className="mb-3">
                          <label className="block text-xs text-gray-600 mb-1">URL de la vidéo (MP4)</label>
                          <input
                            type="text"
                            value={question.backgroundVideo || ''}
                            onChange={(e) => updateQuestion(question.id, { backgroundVideo: e.target.value })}
                            className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none text-sm"
                            placeholder="https://..."
                          />
                        </div>
                      )}

                      {/* Overlay pour image/video */}
                      {(question.backgroundType === 'image' || question.backgroundType === 'video') && (
                        <>
                          <div className="mb-2">
                            <label className="block text-xs text-gray-600 mb-1">
                              Opacité de l'overlay ({Math.round((question.backgroundOverlayOpacity || 0) * 100)}%)
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={question.backgroundOverlayOpacity || 0}
                              onChange={(e) => updateQuestion(question.id, { backgroundOverlayOpacity: parseFloat(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Couleur de l'overlay</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={question.backgroundOverlayColor || '#000000'}
                                onChange={(e) => updateQuestion(question.id, { backgroundOverlayColor: e.target.value })}
                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={question.backgroundOverlayColor || '#000000'}
                                onChange={(e) => updateQuestion(question.id, { backgroundOverlayColor: e.target.value })}
                                className="flex-1 px-2 py-1 bg-white text-gray-900 rounded border border-gray-300 focus:border-[#841b60] outline-none text-xs"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Typographie */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typographie
                      </label>
                      
                      {/* Police */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600 mb-1">Police</label>
                        <select
                          value={question.fontFamily || 'default'}
                          onChange={(e) => updateQuestion(question.id, { fontFamily: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none text-sm"
                        >
                          <option value="default">Par défaut (System)</option>
                          <option value="Inter">Inter</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Merriweather">Merriweather</option>
                          <option value="Raleway">Raleway</option>
                          <option value="Nunito">Nunito</option>
                        </select>
                      </div>

                      {/* Taille */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Taille</label>
                        <select
                          value={question.fontSize || 'medium'}
                          onChange={(e) => updateQuestion(question.id, { fontSize: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none text-sm"
                        >
                          <option value="small">Petite</option>
                          <option value="medium">Moyenne</option>
                          <option value="large">Grande</option>
                          <option value="xlarge">Très grande</option>
                        </select>
                      </div>
                    </div>

                    {/* Options pour choix unique/multiples */}
                    {(question.type === 'choice' || question.type === 'multiple') && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {(question.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              <button
                                onClick={() => deleteOption(question.id, optIndex)}
                                className="p-2 text-red-500 hover:text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(question.id)}
                            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-dashed border-gray-300 transition-colors"
                          >
                            + Ajouter une option
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Min/Max pour échelle */}
                    {question.type === 'scale' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Minimum
                          </label>
                          <input
                            type="number"
                            value={question.min || 1}
                            onChange={(e) => updateQuestion(question.id, { min: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Maximum
                          </label>
                          <input
                            type="number"
                            value={question.max || 5}
                            onChange={(e) => updateQuestion(question.id, { max: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#841b60] outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Placeholder */}
                    {['text', 'email', 'phone', 'number', 'long-text'].includes(question.type) && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={question.placeholder || ''}
                          onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#841b60] outline-none"
                          placeholder="Texte d'exemple..."
                        />
                      </div>
                    )}

                    {/* Requis */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.required || false}
                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]"
                      />
                      <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
                        Question obligatoire
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuestionsPanel;
