import React from 'react';
import { Plus, Trash2, Move, FormInput } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

interface ModernFormTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCampaign((prev: any) => ({
      ...prev,
      formFields: items
    }));
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
        className="flex items-center space-x-2 px-4 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Ajouter un champ</span>
      </button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="form-fields">
          {(provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {formFields.map((field: any, index: number) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-4 bg-white border border-gray-200 rounded-lg space-y-4 ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div {...provided.dragHandleProps} className="cursor-move">
                            <Move className="w-4 h-4 text-gray-400" />
                          </div>
                          <FormInput className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{field.label}</span>
                        </div>
                        <button
                          onClick={() => removeField(field.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label du champ
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type de champ
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(field.id, { type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                        />
                      </div>

                      {field.type === 'select' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options
                          </label>
                          <div className="space-y-2">
                            {(field.options || []).map((option: string, optionIndex: number) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                                />
                                <button
                                  onClick={() => removeOption(field.id, optionIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(field.id)}
                              className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-[#841b60] transition-colors"
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
                          className="mr-2 w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
                        />
                        <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
                          Champ obligatoire
                        </label>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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

export default ModernFormTab;
