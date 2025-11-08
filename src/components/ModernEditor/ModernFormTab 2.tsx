import React from 'react';
import { Plus, Trash2, Move, FormInput } from 'lucide-react';
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de champ</label>
          <select
            value={field.type}
            onChange={(e) => updateField(field.id, { type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
        />
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
                />
                <button onClick={() => removeOption(field.id, optionIndex)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addOption(field.id)}
              className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-[#E0004D] transition-colors"
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
          className="mr-2 w-4 h-4 text-[#E0004D] border-gray-300 rounded focus:ring-[#E0004D]"
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
  const formFields = campaign.formFields || [];

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
      placeholder: '',
      options: []
    };

    setCampaign((prev: any) => ({
      ...prev,
      formFields: [...formFields, newField]
    }));
  };

  const updateField = (fieldId: string, updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      formFields: prev.formFields.map((field: any) => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId: string) => {
    setCampaign((prev: any) => ({
      ...prev,
      formFields: prev.formFields.filter((field: any) => field.id !== fieldId)
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formFields.findIndex((f: any) => f.id === active.id);
      const newIndex = formFields.findIndex((f: any) => f.id === over.id);
      const items = arrayMove(formFields, oldIndex, newIndex);
      setCampaign((prev: any) => ({
        ...prev,
        formFields: items
      }));
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration du formulaire</h2>
        <p className="text-sm text-gray-600">
          Configurez les champs de saisie pour collecter les données des participants
        </p>
      </div>

      <button
        onClick={addField}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-[#E0004D] to-[#6B2AA0] text-white rounded-lg hover:bg-[#4D2388] transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Ajouter un champ</span>
      </button>

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
          <p className="text-sm">Cliquez sur "Ajouter un champ" pour commencer</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ModernFormTab);
