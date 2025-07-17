import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { EditorConfig, FormField } from '../../QualifioEditorLayout';

interface FormMechanicConfigProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const FormMechanicConfig: React.FC<FormMechanicConfigProps> = ({ config, onConfigUpdate }) => {
  const formFields: FormField[] = config.formFields || [
    { id: '1', label: 'Nom', type: 'text', required: true, placeholder: 'Votre nom' },
    { id: '2', label: 'Email', type: 'email', required: true, placeholder: 'votre.email@exemple.com' },
    { id: '3', label: 'Téléphone', type: 'tel', required: false, placeholder: '+33 6 00 00 00 00' },
  ];

  const updateFields = (newFields: FormField[]) => {
    onConfigUpdate({ formFields: newFields });
  };

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      label: 'Nouveau champ',
      type: 'text',
      required: false,
      placeholder: ''
    };
    updateFields([...formFields, newField]);
  };

  const removeField = (id: string) => {
    if (formFields.length > 1) {
      updateFields(formFields.filter(f => f.id !== id));
    }
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    updateFields(formFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const currentIndex = formFields.findIndex(f => f.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;

    const newFields = [...formFields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    updateFields(newFields);
  };

  const addOption = (fieldId: string) => {
    const field = formFields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
      updateField(fieldId, { options: newOptions });
    }
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = formFields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = formFields.find(f => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter((_, i) => i !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const fieldTypes = [
    { value: 'text', label: 'Texte' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Téléphone' },
    { value: 'textarea', label: 'Zone de texte' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'checkbox', label: 'Case à cocher' },
  ];

  return (
    <div className="space-y-6">
      {/* Form Settings */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres du formulaire</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Titre du formulaire</label>
            <input
              type="text"
              value={config.formTitle || 'Formulaire de participation'}
              onChange={(e) => onConfigUpdate({ formTitle: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="form-group-premium">
            <label>Message de confirmation</label>
            <textarea
              value={config.formSuccessMessage || 'Merci pour votre participation !'}
              onChange={(e) => onConfigUpdate({ formSuccessMessage: e.target.value })}
              rows={2}
              className="w-full"
            />
          </div>

          <div className="form-group-premium">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.formShowProgress || false}
                onChange={(e) => onConfigUpdate({ formShowProgress: e.target.checked })}
              />
              Afficher la barre de progression
            </label>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sidebar-text-primary font-medium text-base">Champs du formulaire</h4>
          <button
            onClick={addField}
            className="flex items-center gap-2 px-3 py-1 bg-sidebar-active text-white rounded-lg text-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-4">
          {formFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-sidebar-surface rounded-lg border border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-sidebar-text-muted cursor-move" />
                <span className="text-sm font-medium text-sidebar-text">Champ {index + 1}</span>
                <div className="ml-auto flex gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => moveField(field.id, 'up')}
                      className="text-sidebar-text-muted hover:text-sidebar-text"
                    >
                      ↑
                    </button>
                  )}
                  {index < formFields.length - 1 && (
                    <button
                      onClick={() => moveField(field.id, 'down')}
                      className="text-sidebar-text-muted hover:text-sidebar-text"
                    >
                      ↓
                    </button>
                  )}
                  {formFields.length > 1 && (
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group-premium">
                    <label className="text-xs">Libellé</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="form-group-premium">
                    <label className="text-xs">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                      className="w-full text-sm"
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {field.type !== 'checkbox' && (
                  <div className="form-group-premium">
                    <label className="text-xs">Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      className="w-full text-sm"
                    />
                  </div>
                )}

                {field.type === 'select' && (
                  <div className="form-group-premium">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs">Options</label>
                      <button
                        onClick={() => addOption(field.id)}
                        className="text-xs text-sidebar-active hover:underline"
                      >
                        + Ajouter option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(field.options || []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                            className="flex-1 text-sm"
                          />
                          {field.options && field.options.length > 1 && (
                            <button
                              onClick={() => removeOption(field.id, optionIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group-premium">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    />
                    Champ obligatoire
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormMechanicConfig;
