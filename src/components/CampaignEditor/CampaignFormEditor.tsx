
import React, { useState, useEffect } from 'react';

// Types des champs disponibles
type FieldType = 'text' | 'email' | 'tel' | 'select';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // pour select uniquement
}

interface FormEditorProps {
  formFields: FormField[];
  setFormFields: (fields: FormField[]) => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Texte court' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'select', label: 'Liste déroulante' },
];

// Générateur d'id unique simple
const generateId = () => Math.random().toString(36).substring(2, 10);

const CampaignFormEditor: React.FC<FormEditorProps> = ({ formFields, setFormFields }) => {
  const [fields, setFields] = useState<FormField[]>(formFields || []);

  // Sync parent <-> local
  useEffect(() => { setFields(formFields || []); }, [formFields]);

  const updateParent = (newFields: FormField[]) => {
    setFields(newFields);
    setFormFields(newFields);
  };

  const addField = () => {
    updateParent([
      ...fields,
      { id: generateId(), label: '', type: 'text', required: false }
    ]);
  };

  const updateField = (idx: number, changes: Partial<FormField>) => {
    const newFields = fields.map((f, i) =>
      i === idx ? { ...f, ...changes } : f
    );
    updateParent(newFields);
  };

  const removeField = (idx: number) => {
    const newFields = fields.filter((_, i) => i !== idx);
    updateParent(newFields);
  };

  const moveField = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return;
    const arr = [...fields];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    updateParent(arr);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Champs du formulaire</h3>
        <button
          type="button"
          className="bg-brand-gradient text-white px-4 py-2 rounded-lg font-medium"
          onClick={addField}
        >
          Ajouter un champ
        </button>
      </div>
      
      {fields.length === 0 && (
        <div className="text-gray-400 text-center italic py-6">
          Aucun champ pour l'instant.
        </div>
      )}
      
      <div className="space-y-6">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="p-6 rounded-md border flex flex-col md:flex-row md:items-end gap-6 bg-gray-50 relative"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Label */}
              <div>
                <label className="block text-xs mb-1 font-medium">Label affiché</label>
                <input
                  type="text"
                  className="px-2 py-1 border rounded w-full text-sm"
                  value={field.label}
                  placeholder="ex: Votre email"
                  onChange={e => updateField(idx, { label: e.target.value })}
                />
              </div>
              {/* Type */}
              <div>
                <label className="block text-xs mb-1 font-medium">Type</label>
                <select
                  className="px-2 py-1 border rounded w-full text-sm"
                  value={field.type}
                  onChange={e => updateField(idx, { type: e.target.value as FieldType, options: undefined })}
                >
                  {FIELD_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Obligatoire */}
              <div className="flex items-center mt-2 md:mt-0">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={e => updateField(idx, { required: e.target.checked })}
                  className="mr-2"
                  id={`required-${field.id}`}
                />
                <label htmlFor={`required-${field.id}`} className="text-sm">Obligatoire</label>
              </div>
            </div>
            
            {/* Options pour select */}
            {field.type === 'select' && (
              <div className="col-span-3 mt-4">
                <label className="block text-xs mb-1 font-medium">Options (une par ligne)</label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-sm"
                  rows={2}
                  placeholder={"Option 1\nOption 2"}
                  value={field.options ? field.options.join('\n') : ''}
                  onChange={e => updateField(idx, { options: e.target.value.split('\n').filter(Boolean) })}
                />
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-row gap-2 absolute top-2 right-2">
              <button
                type="button"
                className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => moveField(idx, idx - 1)}
                disabled={idx === 0}
              >
                ↑
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => moveField(idx, idx + 1)}
                disabled={idx === fields.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700"
                onClick={() => removeField(idx)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignFormEditor;
