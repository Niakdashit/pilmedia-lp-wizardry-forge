
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Eye } from 'lucide-react';
import DynamicContactForm from '../forms/DynamicContactForm';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormEditorProps {
  formFields: FormField[];
  setFormFields: (fields: FormField[]) => void;
  campaign?: any;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texte court' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'select', label: 'Liste déroulante' },
  { value: 'checkbox', label: 'Case à cocher' }
];

const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const FormEditor: React.FC<FormEditorProps> = ({
  formFields,
  setFormFields,
  campaign
}) => {
  const [fields, setFields] = useState<FormField[]>(formFields || []);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setFields(formFields || []);
  }, [formFields]);

  const updateParent = (newFields: FormField[]) => {
    setFields(newFields);
    setFormFields(newFields);
  };

  const addField = () => {
    const newField: FormField = {
      id: generateId(),
      label: 'Nouveau champ',
      type: 'text',
      required: false,
      placeholder: ''
    };
    updateParent([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = fields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    );
    updateParent(newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    updateParent(newFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    updateParent(newFields);
  };

  const handlePreview = () => {
    // Dans un vrai cas, on pourrait envoyer ça à une API de test
  };

  return (
    <div className="h-[calc(150vh-3rem)] flex flex-col my-[24px] mx-[21px]">
      <div className="bg-[#f9f0f5] border border-[#e9d0e5] rounded-lg p-4 mb-6">
        <p className="text-[#E0004D] text-sm">
          Créez et personnalisez les champs de votre formulaire. Les utilisateurs rempliront ce formulaire avant d'accéder au jeu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Configuration des champs</h3>
            <button onClick={addField} className="flex items-center gap-2 bg-gradient-to-br from-[#E0004D] to-[#6B2AA0] text-white px-4 py-2 rounded-lg hover:bg-[#6d1550] transition-colors">
              <Plus className="w-4 h-4" />
              Ajouter un champ
            </button>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun champ configuré</p>
              <p className="text-sm">Cliquez sur "Ajouter un champ" pour commencer</p>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                  <button
                    onClick={() => removeField(index)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={e => updateField(index, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
                      placeholder="Ex: Votre prénom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={field.type}
                      onChange={e => updateField(index, {
                        type: e.target.value as FormField['type'],
                        options: e.target.value === 'select' ? ['Option 1', 'Option 2'] : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
                    >
                      {FIELD_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={e => updateField(index, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
                      placeholder="Texte d'aide (optionnel)"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={e => updateField(index, { required: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor={`required-${field.id}`} className="text-sm">
                      Champ obligatoire
                    </label>
                  </div>
                </div>

                {field.type === 'select' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Options (une par ligne)</label>
                    <textarea
                      value={field.options?.join('\n') || ''}
                      onChange={e => updateField(index, {
                        options: e.target.value.split('\n').filter(opt => opt.trim())
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E0004D]"
                      rows={3}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Aperçu en direct</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {showPreview && fields.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h4 className="font-medium mb-4">Formulaire tel que vu par l'utilisateur :</h4>
              <DynamicContactForm
                fields={fields}
                onSubmit={handlePreview}
                submitLabel="Aperçu - Valider"
                textStyles={{
                  label: campaign?.design?.textStyles?.label,
                  button: campaign?.design?.textStyles?.button
                }}
              />
            </div>
          )}

          {showPreview && fields.length === 0 && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 text-center text-gray-500">
              Ajoutez des champs pour voir l'aperçu
            </div>
          )}

          {!showPreview && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 text-center text-gray-500">
              Cliquez sur "Afficher" pour voir l'aperçu du formulaire
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
