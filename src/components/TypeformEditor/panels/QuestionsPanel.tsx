import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Type, Mail, Phone, Hash, List, CheckSquare, BarChart3, AlignLeft, Image as ImageIcon, LayoutTemplate, Sparkles, FileText, Copy, Search, Palette, Keyboard, Undo2, Redo2, CheckCircle2 } from 'lucide-react';
import { TypeformQuestion, TypeformLayout } from '../components/TypeformPreview';
import TemplateModal from '../components/TemplateModal';
import { TypeformTemplate } from '../templates/typeformTemplates';
import { useToast, ToastContainer } from '../components/Toast';
import { Accordion } from '../components/Accordion';
import { useHistory } from '../hooks/useHistory';
import { QuestionDetailsPanel } from './QuestionDetailsPanel';

interface QuestionsPanelProps {
  questions: TypeformQuestion[];
  onQuestionsChange: (questions: TypeformQuestion[]) => void;
  selectedQuestionId?: string;
  onSelectQuestion?: (id: string) => void;
  onOpenProsplayAI?: () => void;
  onApplyTemplate?: (template: TypeformTemplate) => void;
  design?: {
    backgroundColor?: string;
    textColor?: string;
    primaryColor?: string;
    typeformFontFamily?: string;
  };
  onDesignChange?: (design: any) => void;
}

const layoutOptions: { value: TypeformLayout; label: string }[] = [
  { value: 'centered-card', label: 'Carte centrée (par défaut)' },
  { value: 'split-left-text-right-image', label: 'Texte gauche / Image droite' },
  { value: 'split-left-image-right-text', label: 'Image gauche / Texte droite' },
  { value: 'split-left-text-right-image-card', label: 'Texte gauche / Image card arrondie' },
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
  { value: 'form', label: 'Formulaire multi-champs', icon: FileText },
];

export const QuestionsPanel: React.FC<QuestionsPanelProps> = ({
  questions,
  onQuestionsChange,
  selectedQuestionId,
  onSelectQuestion,
  onOpenProsplayAI,
  onApplyTemplate,
  design,
  onDesignChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const { toasts, success } = useToast();
  
  // Système Undo/Redo
  const { state: historyQuestions, setState: setHistoryQuestions, undo, redo, canUndo, canRedo } = useHistory<TypeformQuestion[]>(questions);
  
  // Synchroniser les questions avec l'historique
  const updateQuestionsWithHistory = (newQuestions: TypeformQuestion[]) => {
    setHistoryQuestions(newQuestions);
    onQuestionsChange(newQuestions);
  };

  // Permettre d'ouvrir la modale Templates depuis la preview (bouton Templates dans TypeformPreview)
  useEffect(() => {
    const handleOpenTemplates = () => {
      setShowTemplateModal(true);
    };

    window.addEventListener('typeform-open-templates', handleOpenTemplates);

    return () => {
      window.removeEventListener('typeform-open-templates', handleOpenTemplates);
    };
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl+N ou Cmd+N : Nouvelle question
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addQuestion();
        return;
      }

      // Ctrl+D ou Cmd+D : Dupliquer la question sélectionnée
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && editingId) {
        e.preventDefault();
        duplicateQuestion(editingId);
        return;
      }

      // Delete ou Backspace : Supprimer la question sélectionnée
      if ((e.key === 'Delete' || e.key === 'Backspace') && editingId && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        deleteQuestion(editingId);
        return;
      }

      // Escape : Fermer l'édition
      if (e.key === 'Escape' && editingId) {
        e.preventDefault();
        setEditingId(null);
        return;
      }

      // Ctrl+Z ou Cmd+Z : Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          success('Action annulée');
        }
        return;
      }

      // Ctrl+Y ou Cmd+Shift+Z : Redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        if (canRedo) {
          redo();
          success('Action rétablie');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingId, questions, canUndo, canRedo, undo, redo]);

  // Synchroniser l'historique avec les changements externes
  useEffect(() => {
    if (JSON.stringify(historyQuestions) !== JSON.stringify(questions)) {
      onQuestionsChange(historyQuestions);
    }
  }, [historyQuestions]);

  const addQuestion = (initialLayout?: TypeformLayout) => {
    const isFirstQuestion = questions.length === 0;
    success('Question ajoutée avec succès !');
    
    // Si c'est la première question, créer une carte d'accueil (welcome)
    if (isFirstQuestion) {
      const welcomeCard: TypeformQuestion = {
        id: 'welcome',
        type: 'welcome',
        text: 'Bienvenue à notre formulaire',
        description: 'Cela ne prendra que quelques minutes',
        required: false,
        placeholder: '',
        layout: initialLayout || 'centered-card',
        backgroundType: 'gradient',
        backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter',
        fontSize: 'xlarge',
      };

      const firstQuestion: TypeformQuestion = {
        id: `q${Date.now()}`,
        type: 'text',
        text: 'Nouvelle question',
        required: false,
        placeholder: 'Votre réponse...',
        layout: 'fullwidth-input',
      };

      const thankyouCard: TypeformQuestion = {
        id: 'thankyou',
        type: 'thankyou',
        text: 'Merci pour vos réponses ! 🎉',
        description: 'Vos réponses ont été enregistrées',
        required: false,
        placeholder: '',
        layout: 'centered-card',
        backgroundType: 'gradient',
        backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter',
        fontSize: 'xlarge',
      };

      onQuestionsChange([welcomeCard, firstQuestion, thankyouCard]);
      setEditingId(welcomeCard.id);
      return;
    }

    // Sinon, créer une question normale
    const newQuestion: TypeformQuestion = {
      id: `q${Date.now()}`,
      type: 'text',
      text: 'Nouvelle question',
      required: false,
      placeholder: 'Votre réponse...',
      layout: initialLayout || 'fullwidth-input',
    };

    // Insérer avant la thankyou card s'il y en a une
    const thankyouIndex = questions.findIndex(q => q.type === 'thankyou');
    if (thankyouIndex !== -1) {
      const newQuestions = [...questions];
      newQuestions.splice(thankyouIndex, 0, newQuestion);
      onQuestionsChange(newQuestions);
    } else {
      onQuestionsChange([...questions, newQuestion]);
    }
    
    setEditingId(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<TypeformQuestion>) => {
    onQuestionsChange(
      questions.map(q => q.id === id ? { ...q, ...updates } : q)
    );
  };

  const deleteQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    updateQuestionsWithHistory(questions.filter(q => q.id !== id));
    if (editingId === id) setEditingId(null);
    success(`Question "${question?.text?.substring(0, 30)}..." supprimée`);
  };

  // Bulk actions
  const toggleSelectQuestion = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(questions.map(q => q.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const deleteBulk = () => {
    updateQuestionsWithHistory(questions.filter(q => !selectedIds.includes(q.id)));
    success(`${selectedIds.length} question(s) supprimée(s)`);
    setSelectedIds([]);
    setBulkMode(false);
  };

  const duplicateBulk = () => {
    const newQuestions = [...questions];
    selectedIds.forEach(id => {
      const question = questions.find(q => q.id === id);
      if (question) {
        const newQuestion: TypeformQuestion = {
          ...question,
          id: `q${Date.now()}-${Math.random()}`,
          text: `${question.text} (copie)`,
        };
        newQuestions.push(newQuestion);
      }
    });
    updateQuestionsWithHistory(newQuestions);
    success(`${selectedIds.length} question(s) dupliquée(s)`);
    setSelectedIds([]);
    setBulkMode(false);
  };

  const duplicateQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (!question) return;
    
    const newQuestion: TypeformQuestion = {
      ...question,
      id: `q${Date.now()}`,
      text: `${question.text} (copie)`,
    };
    
    const questionIndex = questions.findIndex(q => q.id === id);
    const newQuestions = [...questions];
    newQuestions.splice(questionIndex + 1, 0, newQuestion);
    onQuestionsChange(newQuestions);
    success('Question dupliquée avec succès !');
    setEditingId(newQuestion.id);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    onQuestionsChange(newQuestions);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newQuestions = [...questions];
    const [draggedItem] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(dropIndex, 0, draggedItem);
    
    onQuestionsChange(newQuestions);
    success('Question déplacée avec succès !');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    const options = question.options || [];
    const optionImages = question.optionImages || [];
    updateQuestion(questionId, {
      options: [...options, `Option ${options.length + 1}`],
      optionImages: [...optionImages, '']
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const updateOptionImage = (questionId: string, optionIndex: number, imageUrl: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    const optionImages = question.optionImages || [];
    const newImages = [...optionImages];
    newImages[optionIndex] = imageUrl;
    updateQuestion(questionId, { optionImages: newImages });
  };

  const deleteOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;
    const optionImages = question.optionImages || [];
    updateQuestion(questionId, {
      options: question.options.filter((_, i) => i !== optionIndex),
      optionImages: optionImages.filter((_, i) => i !== optionIndex)
    });
  };

  // Gestion des subFields (champs de formulaire)
  const addSubField = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    const subFields = question.subFields || [];
    updateQuestion(questionId, {
      subFields: [...subFields, {
        id: `field_${Date.now()}`,
        label: `Champ ${subFields.length + 1}`,
        placeholder: '',
        type: 'text' as const,
        required: false,
        width: 'full' as const,
      }]
    });
  };

  const updateSubField = (questionId: string, fieldIndex: number, updates: any) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.subFields) return;
    const newSubFields = [...question.subFields];
    newSubFields[fieldIndex] = { ...newSubFields[fieldIndex], ...updates };
    updateQuestion(questionId, { subFields: newSubFields });
  };

  const deleteSubField = (questionId: string, fieldIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.subFields) return;
    updateQuestion(questionId, {
      subFields: question.subFields.filter((_, i) => i !== fieldIndex)
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
    success(`Template "${template.name}" appliqué avec succès !`);
  };

  // Filtrer les questions selon la recherche
  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fonction pour obtenir la couleur selon le type de question
  const getQuestionBadgeColor = (type: string) => {
    if (type === 'welcome') return 'bg-green-100 text-green-700 border-green-200';
    if (type === 'thankyou') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };


  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          {onOpenProsplayAI && (
            <button
              type="button"
              onClick={onOpenProsplayAI}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100"
            >
              <Sparkles size={12} />
              <span>Prosplay AI</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-[#841b60] border border-[#841b60] rounded-lg transition-colors text-sm"
          >
            <FileText size={14} />
            <span>Templates</span>
          </button>
          <button
            onClick={() => addQuestion()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#841b60] hover:bg-[#6d1650] text-white rounded-lg transition-colors text-sm"
          >
            <Plus size={14} />
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

      {/* Section Style Global */}
      {onDesignChange && design && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <Accordion
            title="Style global"
            icon={<Palette size={16} className="text-[#841b60]" />}
            defaultOpen={false}
          >
            <div className="space-y-3 pt-2">
            {/* Couleur de fond */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Couleur de fond
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.backgroundColor || '#ffffff'}
                  onChange={(e) => onDesignChange({ ...design, backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.backgroundColor || '#ffffff'}
                  onChange={(e) => onDesignChange({ ...design, backgroundColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 bg-white text-gray-900 rounded border border-gray-300 focus:border-[#841b60] outline-none text-xs"
                />
              </div>
            </div>

            {/* Couleur du texte */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Couleur du texte
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.textColor || '#000000'}
                  onChange={(e) => onDesignChange({ ...design, textColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.textColor || '#000000'}
                  onChange={(e) => onDesignChange({ ...design, textColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 bg-white text-gray-900 rounded border border-gray-300 focus:border-[#841b60] outline-none text-xs"
                />
              </div>
            </div>

            {/* Couleur primaire */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Couleur primaire (boutons)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.primaryColor || '#841b60'}
                  onChange={(e) => onDesignChange({ ...design, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.primaryColor || '#841b60'}
                  onChange={(e) => onDesignChange({ ...design, primaryColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 bg-white text-gray-900 rounded border border-gray-300 focus:border-[#841b60] outline-none text-xs"
                />
              </div>
            </div>

            {/* Police de caractères */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Police de caractères
              </label>
              <select
                value={design.typeformFontFamily || 'Inter'}
                onChange={(e) => onDesignChange({ ...design, typeformFontFamily: e.target.value })}
                className="w-full px-2 py-1.5 bg-white text-gray-900 rounded border border-gray-300 focus:border-[#841b60] outline-none text-xs"
              >
                <option value="Inter">Inter (par défaut)</option>
                <option value="Apercu Pro">Apercu Pro</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
                <option value="Raleway">Raleway</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
              </select>
            </div>
            </div>
          </Accordion>
        </div>
      )}

      {/* Liste des questions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {questions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune question</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Commencez par créer votre première question ou choisissez un template pré-conçu
            </p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">Aucun résultat</p>
            <p className="text-sm text-gray-400">
              Aucune question ne correspond à votre recherche
            </p>
          </div>
        ) : (
          filteredQuestions.map((question, index) => {
            const isEditing = editingId === question.id;

            return (
              <div
                key={question.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-lg border transition-all duration-200 shadow-sm hover:shadow-md animate-question-enter ${
                  selectedQuestionId === question.id
                    ? 'border-[#841b60] ring-2 ring-[#841b60]/20'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverIndex === index && draggedIndex !== index ? 'border-[#841b60] border-2 scale-105 animate-pulse-border' : ''
                } ${
                  selectedIds.includes(question.id) && bulkMode ? 'ring-2 ring-purple-500/30 border-purple-400' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Header de la question */}
                <div className="px-3 py-3 pr-6 flex items-center gap-2">
                  {/* Checkbox en mode bulk */}
                  {bulkMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(question.id)}
                      onChange={() => toggleSelectQuestion(question.id)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  
                  <div
                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    title="Glisser pour déplacer"
                  >
                    <GripVertical size={18} />
                  </div>

                  <div className="flex-1 flex items-start gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${getQuestionBadgeColor(question.type)}`}>
                      {question.type === 'welcome' 
                        ? '🏁 Accueil' 
                        : question.type === 'thankyou' 
                        ? '🎉 Sortie' 
                        : `Q${questions.indexOf(question)}`}
                    </span>
                    <span className="text-gray-900 font-medium whitespace-pre-wrap break-words">
                      {question.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateQuestion(question.id)}
                      className="p-1 text-gray-400 hover:text-[#841b60] hover:bg-purple-50 rounded transition-all duration-200 hover:scale-110"
                      title="Dupliquer"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(isEditing ? null : question.id)}
                      className="px-2 py-1 text-xs text-[#841b60] hover:bg-[#841b60] hover:text-white rounded transition-all duration-200"
                    >
                      {isEditing ? 'Fermer' : 'Éditer'}
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-1 mr-3 text-red-500 hover:text-white hover:bg-red-500 rounded transition-all duration-200 hover:scale-110"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer d'édition de question */}
      <QuestionDetailsPanel
        question={questions.find(q => q.id === editingId)}
        isOpen={!!editingId}
        onClose={() => setEditingId(null)}
        onChange={(updated) => {
          onQuestionsChange(
            questions.map(q => q.id === updated.id ? updated : q)
          );
        }}
        onAddOption={() => addOption(editingId!)}
        onUpdateOption={(index, value) => updateOption(editingId!, index, value)}
        onUpdateOptionImage={(index, url) => updateOptionImage(editingId!, index, url)}
        onDeleteOption={(index) => deleteOption(editingId!, index)}
        onAddSubField={() => addSubField(editingId!)}
        onUpdateSubField={(index, updates) => updateSubField(editingId!, index, updates)}
        onDeleteSubField={(index) => deleteSubField(editingId!, index)}
      />
    </div>
  );
};

export default QuestionsPanel;
