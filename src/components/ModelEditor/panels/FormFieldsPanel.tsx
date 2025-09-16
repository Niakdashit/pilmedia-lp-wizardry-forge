import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Mail, 
  Phone, 
  MessageSquare, 
  List, 
  CheckSquare, 
  Circle, 
  Hash, 
  Calendar,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormField, FormFieldType, createDefaultField, FormStructure } from '../../../types/FormField';

interface FormFieldsPanelProps {
  formStructure: FormStructure;
  onChange: (structure: FormStructure) => void;
}

const FIELD_TYPE_ICONS: Record<FormFieldType, React.ComponentType<any>> = {
  text: Type,
  email: Mail,
  tel: Phone,
  textarea: MessageSquare,
  select: List,
  checkbox: CheckSquare,
  radio: Circle,
  number: Hash,
  date: Calendar
};

const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: 'Texte',
  email: 'Email',
  tel: 'Téléphone',
  textarea: 'Zone de texte',
  select: 'Liste déroulante',
  checkbox: 'Cases à cocher',
  radio: 'Boutons radio',
  number: 'Nombre',
  date: 'Date'
};

interface DraggableFieldProps {
  field: FormField;
  index: number;
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
  moveField: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  index,
  onEdit,
  onDelete,
  moveField
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'field',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveField(item.index, index);
        item.index = index;
      }
    }
  });

  const IconComponent = FIELD_TYPE_ICONS[field.type];

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white border border-gray-200 rounded-lg p-3 cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <IconComponent className="w-4 h-4 text-purple-600" />
          <div>
            <div className="font-medium text-sm text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </div>
            <div className="text-xs text-gray-500">
              {FIELD_TYPE_LABELS[field.type]}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(field)}
            className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
            title="Modifier"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(field.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface FieldEditorProps {
  field: FormField | null;
  onSave: (field: FormField) => void;
  onCancel: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel }) => {
  const [editedField, setEditedField] = useState<FormField | null>(field);

  if (!editedField) return null;

  const handleSave = () => {
    if (editedField) {
      onSave(editedField);
    }
  };

  const updateField = (updates: Partial<FormField>) => {
    if (editedField) {
      setEditedField({ ...editedField, ...updates });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Modifier le champ</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={editedField.label}
              onChange={(e) => updateField({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Placeholder */}
          {['text', 'email', 'tel', 'textarea', 'number'].includes(editedField.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={editedField.placeholder || ''}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Required */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={editedField.required}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="required" className="text-sm text-gray-700">
              Champ obligatoire
            </label>
          </div>

          {/* Options pour select, radio, checkbox */}
          {['select', 'radio', 'checkbox'].includes(editedField.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {(editedField as any).options?.map((option: any, index: number) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...(editedField as any).options];
                        newOptions[index] = { ...option, label: e.target.value, value: e.target.value.toLowerCase() };
                        updateField({ options: newOptions } as any);
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => {
                        const newOptions = (editedField as any).options.filter((_: any, i: number) => i !== index);
                        updateField({ options: newOptions } as any);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOption = {
                      id: `opt_${Date.now()}`,
                      label: `Option ${((editedField as any).options?.length || 0) + 1}`,
                      value: `option${((editedField as any).options?.length || 0) + 1}`
                    };
                    const newOptions = [...((editedField as any).options || []), newOption];
                    updateField({ options: newOptions } as any);
                  }}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  + Ajouter une option
                </button>
              </div>
            </div>
          )}

          {/* Textarea rows */}
          {editedField.type === 'textarea' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de lignes
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={(editedField as any).rows || 3}
                onChange={(e) => updateField({ rows: parseInt(e.target.value) } as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

const FormFieldsPanel: React.FC<FormFieldsPanelProps> = ({
  formStructure,
  onChange
}) => {
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const addField = (type: FormFieldType) => {
    const newField = createDefaultField(type, formStructure.fields.length);
    const updatedStructure = {
      ...formStructure,
      fields: [...formStructure.fields, newField]
    };
    onChange(updatedStructure);
  };

  const updateField = (updatedField: FormField) => {
    const updatedFields = formStructure.fields.map(field =>
      field.id === updatedField.id ? updatedField : field
    );
    onChange({
      ...formStructure,
      fields: updatedFields
    });
    setEditingField(null);
  };

  const deleteField = (fieldId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce champ ?')) {
      const updatedFields = formStructure.fields.filter(field => field.id !== fieldId);
      // Réorganiser les ordres
      const reorderedFields = updatedFields.map((field, index) => ({
        ...field,
        order: index
      }));
      onChange({
        ...formStructure,
        fields: reorderedFields
      });
    }
  };

  const moveField = (dragIndex: number, hoverIndex: number) => {
    const draggedField = formStructure.fields[dragIndex];
    const newFields = [...formStructure.fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    
    // Mettre à jour les ordres
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index
    }));

    onChange({
      ...formStructure,
      fields: reorderedFields
    });
  };

  const updateFormMeta = (updates: Partial<FormStructure>) => {
    onChange({
      ...formStructure,
      ...updates
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Structure du formulaire</h3>
          
          {/* Métadonnées du formulaire */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du formulaire
              </label>
              <input
                type="text"
                value={formStructure.title || ''}
                onChange={(e) => updateFormMeta({ title: e.target.value })}
                placeholder="Participez au jeu"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formStructure.description || ''}
                onChange={(e) => updateFormMeta({ description: e.target.value })}
                placeholder="Remplissez le formulaire pour participer"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texte du bouton
              </label>
              <input
                type="text"
                value={formStructure.submitButtonText}
                onChange={(e) => updateFormMeta({ submitButtonText: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Boutons d'ajout de champs */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ajouter un champ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(FIELD_TYPE_LABELS).map(([type, label]) => {
                const IconComponent = FIELD_TYPE_ICONS[type as FormFieldType];
                return (
                  <button
                    key={type}
                    onClick={() => addField(type as FormFieldType)}
                    className="flex flex-col items-center gap-1 p-2 text-xs border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    <IconComponent className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Liste des champs */}
        <div className="flex-1 overflow-y-auto p-4">
          {formStructure.fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Aucun champ ajouté</p>
              <p className="text-sm">Utilisez les boutons ci-dessus pour ajouter des champs</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formStructure.fields
                .sort((a, b) => a.order - b.order)
                .map((field, index) => (
                  <DraggableField
                    key={field.id}
                    field={field}
                    index={index}
                    onEdit={setEditingField}
                    onDelete={deleteField}
                    moveField={moveField}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Éditeur de champ */}
        {editingField && (
          <FieldEditor
            field={editingField}
            onSave={updateField}
            onCancel={() => setEditingField(null)}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default FormFieldsPanel;
