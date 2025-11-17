import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Move, FormInput, Search, ChevronDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Modal from '@/components/common/Modal';
import { useSavedForms } from '@/hooks/useSavedForms';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';

interface ModernFormTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

interface SortableFieldProps {
  field: any;
  fieldTypes: { value: string; label: string }[];
  updateField: (fieldId: string, updates: any) => void;
  removeField: (fieldId: string) => void;
  addOption: (fieldId: string) => void;
  updateOption: (fieldId: string, optionIndex: number, value: string) => void;
  removeOption: (fieldId: string, optionIndex: number) => void;
}

function SortableField({
  field,
  fieldTypes,
  updateField,
  removeField,
  addOption,
  updateOption,
  removeOption
}: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button {...attributes} {...listeners} className="cursor-move">
            <Move className="w-4 h-4 text-gray-400" />
          </button>
          <FormInput className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">{field.label}</span>
        </div>
        <button onClick={() => removeField(field.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label du champ</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de champ</label>
          <select
            value={field.type}
            onChange={(e) => updateField(field.id, { type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {field.type === 'select' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-2">
            {(field.options || []).map((option: string, optionIndex: number) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
                />
                <button onClick={() => removeOption(field.id, optionIndex)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addOption(field.id)}
              className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-[#44444d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une option</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${field.id}`}
          checked={field.required || false}
          onChange={(e) => updateField(field.id, { required: e.target.checked })}
          className="mr-2 w-4 h-4 text-[#44444d] border-gray-300 rounded focus:ring-[#44444d]"
        />
        <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
          Champ obligatoire
        </label>
      </div>
    </div>
  );
}

const ModernFormTab: React.FC<ModernFormTabProps> = ({
  campaign,
  setCampaign
}) => {
  const formFields = campaign?.formFields || [];
  const showFormBeforeResult = campaign?.showFormBeforeResult ?? true;
  const { syncFormFields } = useEditorPreviewSync();

  // Saved forms state & logic
  const { forms, fetchForms, createForm, updateForm, error: formsError } = useSavedForms();
  const [search, setSearch] = useState('');
  const [selectedSavedFormId, setSelectedSavedFormId] = useState<string>('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [updateExisting, setUpdateExisting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchForms();
  }, [fetchForms]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filteredForms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return forms;
    return forms.filter((f) => f.name.toLowerCase().includes(q));
  }, [forms, search]);

  const fieldTypes = [
    { value: 'text', label: 'Texte' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Téléphone' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'textarea', label: 'Zone de texte' },
    { value: 'checkbox', label: 'Case à cocher' }
  ];

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'Nouveau champ',
      type: 'text',
      required: false,
      options: []
    };

    const updatedFields = [...(formFields || []), newField];
    
    setCampaign((prev: any) => (prev ? {
      ...prev,
      formFields: updatedFields,
      _lastUpdate: Date.now() // Force sync avec preview
    } : prev));
    
    // Synchroniser avec le preview en temps réel
    syncFormFields(updatedFields);
  };

  const updateField = (fieldId: string, updates: any) => {
    const updatedFields = (formFields || []).map((field: any) => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    setCampaign((prev: any) => (prev ? {
      ...prev,
      formFields: updatedFields,
      _lastUpdate: Date.now() // Force sync avec preview
    } : prev));
    
    // Synchroniser avec le preview en temps réel
    syncFormFields(updatedFields);
  };

  const removeField = (fieldId: string) => {
    const updatedFields = (formFields || []).filter((field: any) => field.id !== fieldId);
    
    setCampaign((prev: any) => (prev ? {
      ...prev,
      formFields: updatedFields,
      _lastUpdate: Date.now() // Force sync avec preview
    } : prev));
    
    // Synchroniser avec le preview en temps réel
    syncFormFields(updatedFields);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formFields.findIndex((f: any) => f.id === active.id);
      const newIndex = formFields.findIndex((f: any) => f.id === over.id);
      const items = arrayMove(formFields, oldIndex, newIndex);
      
      setCampaign((prev: any) => (prev ? {
        ...prev,
        formFields: items,
        _lastUpdate: Date.now() // Force sync avec preview
      } : prev));
      
      // Synchroniser avec le preview en temps réel
      syncFormFields(items);
    }
  };

  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(formFields.find((f: any) => f.id === fieldId)?.options || []), 'Nouvelle option']
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = formFields.find((f: any) => f.id === fieldId);
    if (field) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = formFields.find((f: any) => f.id === fieldId);
    if (field) {
      const newOptions = field.options.filter((_: any, index: number) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const handleLoadSavedForm = (id?: string) => {
    const targetId = id || selectedSavedFormId;
    if (!targetId) return;
    const selected = forms.find((f) => f.id === targetId);
    if (!selected) return;
    const proceed = formFields.length === 0 || window.confirm('Charger ce formulaire remplacera les champs existants. Continuer ?');
    if (!proceed) return;
    
    const loadedFields = Array.isArray(selected.fields) ? selected.fields : [];
    
    setCampaign((prev: any) => (prev ? {
      ...prev,
      formFields: loadedFields,
      _lastUpdate: Date.now() // Force sync avec preview
    } : prev));
    
    // Synchroniser avec le preview en temps réel
    syncFormFields(loadedFields);
  };

  const handleSelectAndLoad = (id: string) => {
    setSelectedSavedFormId(id);
    setIsDropdownOpen(false);
    handleLoadSavedForm(id);
  };

  const openSaveModal = () => {
    const selected = forms.find((f) => f.id === selectedSavedFormId);
    setSaveName(selected?.name || '');
    setUpdateExisting(!!selected);
    setIsSaveModalOpen(true);
  };

  const handleSaveForm = async () => {
    try {
      if (updateExisting && selectedSavedFormId) {
        const existing = forms.find((f) => f.id === selectedSavedFormId);
        await updateForm(selectedSavedFormId, saveName || existing?.name || 'Formulaire', formFields);
      } else {
        const created = await createForm(saveName || 'Formulaire', formFields);
        setSelectedSavedFormId(created.id);
      }
      setIsSaveModalOpen(false);
    } catch (e) {
      // Errors are handled in hook state; keep UI minimal here
    }
  };

  const currentFormTextColor = campaign?.articleConfig?.formTextColor || '#000000';

  return (
    <div className="space-y-6">
      {/* Toggle pour activer/désactiver le formulaire après le quiz */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <input
            id="show-form-toggle"
            type="checkbox"
            checked={showFormBeforeResult}
            onChange={(e) => {
              setCampaign((prev: any) => ({
                ...(prev || {}),
                showFormBeforeResult: e.target.checked,
                _lastUpdate: Date.now(),
              }));
            }}
            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <label htmlFor="show-form-toggle" className="block text-sm font-semibold text-gray-900 cursor-pointer">
              Afficher le formulaire
            </label>
          </div>
        </div>
      </div>

      {/* Titre du formulaire */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Titre du formulaire
        </label>
        <input
          type="text"
          value={campaign?.articleConfig?.formTitle || 'Merci de compléter ce formulaire afin de valider votre participation :'}
          onChange={(e) => {
            setCampaign((prev: any) => ({
              ...(prev || {}),
              articleConfig: {
                ...(prev?.articleConfig || {}),
                formTitle: e.target.value,
              },
              _lastUpdate: Date.now(),
            }));
          }}
          placeholder="Titre affiché au-dessus du formulaire"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
        />
        <p className="text-xs text-gray-500">
          Ce texte s'affichera au-dessus des champs du formulaire
        </p>
      </div>

      {/* Couleur des textes du formulaire */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Couleur des textes du formulaire
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={currentFormTextColor}
            onChange={(e) => {
              const value = e.target.value || '#ffffff';
              setCampaign((prev: any) => ({
                ...(prev || {}),
                articleConfig: {
                  ...(prev?.articleConfig || {}),
                  formTextColor: value,
                },
                _lastUpdate: Date.now(),
              }));
            }}
            className="w-10 h-10 rounded border border-gray-300 bg-white p-0 cursor-pointer"
            aria-label="Couleur des textes du formulaire"
          />
          <input
            type="text"
            value={currentFormTextColor}
            onChange={(e) => {
              const value = e.target.value || '#ffffff';
              setCampaign((prev: any) => ({
                ...(prev || {}),
                articleConfig: {
                  ...(prev?.articleConfig || {}),
                  formTextColor: value,
                },
                _lastUpdate: Date.now(),
              }));
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            placeholder="#ffffff"
          />
        </div>
        <p className="text-xs text-gray-500">
          S'applique au titre et aux textes du formulaire dans le mode article.
        </p>
      </div>

      {/* Saved forms searchable dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen((v) => !v)}
          className="w-full text-left px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-between hover:border-[#44444d]"
        >
          <span className="text-gray-700">
            {forms.find((f) => f.id === selectedSavedFormId)?.name || 'Chercher un questionnaire existant'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
        {isDropdownOpen && (
          <div className="absolute z-20 mt-2 w-full bg-gray-50 border border-gray-200 rounded-lg shadow-lg">
            <div className="p-3 border-b">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-2 text-sm text-gray-600">Chercher un questionnaire existant</p>
            </div>
            <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Dernières créations</div>
            <div className="max-h-72 overflow-y-auto">
              {filteredForms.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">Aucun résultat</div>
              )}
              {filteredForms.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelectAndLoad(f.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t first:border-t-0"
                >
                  <div className="text-sm text-gray-900">{f.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {formsError && <p className="mt-2 text-xs text-red-600">{formsError}</p>}
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={formFields.map((f: any) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {formFields.map((field: any) => (
              <SortableField
                key={field.id}
                field={field}
                fieldTypes={fieldTypes}
                updateField={updateField}
                removeField={removeField}
                addOption={addOption}
                updateOption={updateOption}
                removeOption={removeOption}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {formFields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FormInput className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun champ configuré</p>
          <p className="text-sm">Cliquez sur "+ Champ" pour commencer</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={addField}
          className="px-4 py-2 bg-gradient-to-br from-[#44444d] to-[#44444d] text-white rounded-lg hover:bg-[#5a5a63] transition-colors"
        >
          + Champ
        </button>
        <button
          onClick={openSaveModal}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50"
          type="button"
        >
          Enregistrer
        </button>
      </div>

      {isSaveModalOpen && (
        <Modal title="Enregistrer le formulaire" onClose={() => setIsSaveModalOpen(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du formulaire</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Ex: Formulaire Prospect"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="update-existing"
                type="checkbox"
                checked={updateExisting && !!selectedSavedFormId}
                onChange={(e) => setUpdateExisting(e.target.checked)}
                disabled={!selectedSavedFormId}
                className="w-4 h-4 text-[#44444d] border-gray-300 rounded focus:ring-[#44444d]"
              />
              <label htmlFor="update-existing" className="text-sm text-gray-700">
                Mettre à jour le formulaire sélectionné
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 border rounded-lg"
                onClick={() => setIsSaveModalOpen(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-[#44444d] text-white rounded-lg hover:opacity-90"
                onClick={handleSaveForm}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default React.memo(ModernFormTab);
