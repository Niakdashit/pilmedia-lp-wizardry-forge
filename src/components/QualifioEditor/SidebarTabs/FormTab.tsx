import React from 'react';
import { FileText, Plus, Trash2, GripVertical } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';
interface FormTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}
interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}
const FormTab: React.FC<FormTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const formFields = config.formFields || [];
  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Nouveau champ',
      placeholder: '',
      required: false
    };
    onConfigUpdate({
      formFields: [...formFields, newField]
    });
  };
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = formFields.map(field => field.id === fieldId ? {
      ...field,
      ...updates
    } : field);
    onConfigUpdate({
      formFields: updatedFields
    });
  };
  const removeField = (fieldId: string) => {
    const updatedFields = formFields.filter(field => field.id !== fieldId);
    onConfigUpdate({
      formFields: updatedFields
    });
  };
  const addOption = (fieldId: string) => {
    const field = formFields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...(field.options || []), 'Nouvelle option'];
      updateField(fieldId, {
        options: newOptions
      });
    }
  };
  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = formFields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, {
        options: newOptions
      });
    }
  };
  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = formFields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, {
        options: newOptions
      });
    }
  };
  return <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="premium-card mx-[30px] my-[30px]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sidebar-text-primary font-medium text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Configuration du formulaire
          </h4>
          <button onClick={addField} className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Ajouter un champ
          </button>
        </div>

        {formFields.length === 0 ? <div className="text-center py-8 text-sidebar-text-muted">
            <FileText className="w-12 h-12 mx-auto mb-4 text-sidebar-text-muted/50" />
            <p className="text-sm">Aucun champ configuré</p>
            <p className="text-xs mt-1">Cliquez sur "Ajouter un champ" pour commencer</p>
          </div> : <div className="space-y-4">
            {formFields.map(field => <div key={field.id} className="border border-sidebar-border rounded-lg p-4 bg-sidebar-surface/50">
                <div className="flex items-start gap-3">
                  <GripVertical className="w-4 h-4 text-sidebar-text-muted mt-2 cursor-move" />
                  
                  <div className="flex-1 space-y-3">
                    {/* Type et suppression */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <select value={field.type} onChange={e => updateField(field.id, {
                    type: e.target.value as FormField['type']
                  })} className="px-3 py-1 text-sm border border-sidebar-border rounded-md bg-sidebar-surface">
                          <option value="text">Texte</option>
                          <option value="email">Email</option>
                          <option value="tel">Téléphone</option>
                          <option value="textarea">Zone de texte</option>
                          <option value="select">Liste déroulante</option>
                        </select>
                        
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, {
                      required: e.target.checked
                    })} className="rounded border-sidebar-border" />
                          Requis
                        </label>
                      </div>
                      
                      <button onClick={() => removeField(field.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Label */}
                    <div className="form-group-premium">
                      <label className="text-xs">Label</label>
                      <input type="text" value={field.label} onChange={e => updateField(field.id, {
                  label: e.target.value
                })} placeholder="Label du champ" className="w-full" />
                    </div>

                    {/* Placeholder */}
                    {field.type !== 'select' && <div className="form-group-premium">
                        <label className="text-xs">Placeholder</label>
                        <input type="text" value={field.placeholder} onChange={e => updateField(field.id, {
                  placeholder: e.target.value
                })} placeholder="Texte d'aide" className="w-full" />
                      </div>}

                    {/* Options pour select */}
                    {field.type === 'select' && <div className="form-group-premium">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs">Options</label>
                          <button onClick={() => addOption(field.id)} className="text-xs text-primary hover:text-primary/80">
                            + Ajouter
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(field.options || []).map((option, optionIndex) => <div key={optionIndex} className="flex items-center gap-2">
                              <input type="text" value={option} onChange={e => updateOption(field.id, optionIndex, e.target.value)} className="flex-1 px-2 py-1 text-sm border border-sidebar-border rounded" />
                              <button onClick={() => removeOption(field.id, optionIndex)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>)}
                        </div>
                      </div>}
                  </div>
                </div>
              </div>)}
          </div>}
      </div>

      {/* Aperçu */}
      {formFields.length > 0 && <div className="premium-card">
          <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Aperçu du formulaire</h4>
          
          <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
            <div className="space-y-4">
              {formFields.map(field => <div key={field.id} className="space-y-1">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? <textarea placeholder={field.placeholder} className="w-full px-3 py-2 text-sm border border-sidebar-border rounded-md bg-background" rows={3} disabled /> : field.type === 'select' ? <select className="w-full px-3 py-2 text-sm border border-sidebar-border rounded-md bg-background" disabled>
                      <option value="">Sélectionner...</option>
                      {(field.options || []).map((option, index) => <option key={index} value={option}>{option}</option>)}
                    </select> : <input type={field.type} placeholder={field.placeholder} className="w-full px-3 py-2 text-sm border border-sidebar-border rounded-md bg-background" disabled />}
                </div>)}
            </div>
          </div>
        </div>}
    </div>;
};
export default FormTab;