import React, { useState } from 'react';
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown, Type, Mail, Phone, Calendar, CheckSquare, List, Hash } from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
}

interface FormFieldsPanelProps {
  config: any;
  onConfigUpdate: (updates: any) => void;
}

const FormFieldsPanel: React.FC<FormFieldsPanelProps> = ({
  config,
  onConfigUpdate
}) => {
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const fields = config.fields || [];

  const updateFields = (newFields: FormField[]) => {
    onConfigUpdate({
      fields: newFields
    });
  };

  const addField = (field: Omit<FormField, 'id'>) => {
    const newField: FormField = {
      ...field,
      id: `field-${Date.now()}`
    };
    updateFields([...fields, newField]);
    setShowAddForm(false);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field: FormField) =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    updateFields(updatedFields);
    setEditingField(null);
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = fields.filter((field: FormField) => field.id !== fieldId);
    updateFields(updatedFields);
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    updateFields(newFields);
  };

  const moveFieldDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    updateFields(newFields);
  };


  const getFieldIcon = (type: FormField['type']) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'tel': return <Phone className="w-4 h-4" />;
      case 'number': return <Hash className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'select': return <List className="w-4 h-4" />;
      case 'checkbox': return <CheckSquare className="w-4 h-4" />;
      case 'textarea': return <Type className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const getFieldTypeLabel = (type: FormField['type']) => {
    const labels = {
      text: 'Texte',
      email: 'Email',
      tel: 'Téléphone',
      number: 'Nombre',
      date: 'Date',
      select: 'Liste déroulante',
      checkbox: 'Case à cocher',
      textarea: 'Zone de texte'
    };
    return labels[type] || 'Texte';
  };

  const FieldForm: React.FC<{
    field?: FormField;
    onSave: (field: Omit<FormField, 'id'> | FormField) => void;
    onCancel: () => void;
  }> = ({ field, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<FormField, 'id'>>({
      type: field?.type || 'text',
      label: field?.label || '',
      placeholder: field?.placeholder || '',
      required: field?.required !== false,
      options: field?.options || [],
      validation: field?.validation || {}
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (field) {
        onSave({ ...field, ...formData });
      } else {
        onSave(formData);
      }
    };

    const addOption = () => {
      setFormData({
        ...formData,
        options: [...(formData.options || []), '']
      });
    };

    const updateOption = (index: number, value: string) => {
      const newOptions = [...(formData.options || [])];
      newOptions[index] = value;
      setFormData({
        ...formData,
        options: newOptions
      });
    };

    const removeOption = (index: number) => {
      const newOptions = [...(formData.options || [])];
      newOptions.splice(index, 1);
      setFormData({
        ...formData,
        options: newOptions
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de champ
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as FormField['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">Texte</option>
              <option value="email">Email</option>
              <option value="tel">Téléphone</option>
              <option value="number">Nombre</option>
              <option value="date">Date</option>
              <option value="select">Liste déroulante</option>
              <option value="checkbox">Case à cocher</option>
              <option value="textarea">Zone de texte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libellé
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom du champ"
              required
            />
          </div>
        </div>

        {formData.type !== 'checkbox' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={formData.placeholder}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Texte d'aide"
            />
          </div>
        )}

        {formData.type === 'select' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {(formData.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                + Ajouter une option
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={formData.required}
            onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="required" className="ml-2 text-sm text-gray-700">
            Champ obligatoire
          </label>
        </div>

        {/* Validation */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Validation</h4>
          
          {(formData.type === 'text' || formData.type === 'textarea') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Longueur min.
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.validation?.minLength || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    validation: {
                      ...formData.validation,
                      minLength: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Longueur max.
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.validation?.maxLength || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    validation: {
                      ...formData.validation,
                      maxLength: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-2">
            <label className="block text-xs text-gray-600 mb-1">
              Message d'erreur personnalisé
            </label>
            <input
              type="text"
              value={formData.validation?.message || ''}
              onChange={(e) => setFormData({
                ...formData,
                validation: {
                  ...formData.validation,
                  message: e.target.value
                }
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Message affiché en cas d'erreur"
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {field ? 'Modifier' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Type className="w-5 h-5 mr-2 text-blue-600" />
          Champs du formulaire
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter un champ
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">
            {fields.length}
          </div>
          <div className="text-sm text-blue-700">Champs total</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-600">
            {fields.filter((f: FormField) => f.required).length}
          </div>
          <div className="text-sm text-red-700">Obligatoires</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">
            {fields.filter((f: FormField) => !f.required).length}
          </div>
          <div className="text-sm text-green-700">Optionnels</div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <FieldForm
          onSave={addField}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Formulaire d'édition */}
      {editingField && (
        <FieldForm
          field={editingField}
          onSave={(updatedField) => updateField(editingField.id, updatedField as FormField)}
          onCancel={() => setEditingField(null)}
        />
      )}

      {/* Liste des champs avec drag & drop */}
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Type className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun champ configuré</p>
            <p className="text-sm">Ajoutez votre premier champ pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
        {fields.map((field: FormField, index: number) => (
          <div
            key={field.id}
            className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveFieldUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveFieldDown(index)}
                    disabled={index === fields.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getFieldIcon(field.type)}
                  <div>
                    <div className="font-medium text-gray-900">{field.label}</div>
                    <div className="text-sm text-gray-500">
                      {field.type} {field.required && '• Requis'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingField(field)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {field.placeholder && (
              <div className="mt-2 text-sm text-gray-500">
                Placeholder: {field.placeholder}
              </div>
            )}
            
            {field.options && field.options.length > 0 && (
              <div className="mt-2">
                <div className="text-sm text-gray-500 mb-1">Options:</div>
                <div className="flex flex-wrap gap-1">
                  {field.options.map((option, optIndex) => (
                    <span
                      key={optIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Conseils pour vos champs</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Utilisez des libellés clairs et concis</li>
          <li>• Ajoutez des placeholders pour guider l'utilisateur</li>
          <li>• Limitez le nombre de champs obligatoires</li>
          <li>• Organisez les champs par ordre logique</li>
        </ul>
      </div>
    </div>
  );
};

export default FormFieldsPanel;
