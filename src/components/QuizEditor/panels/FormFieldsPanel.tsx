import React from 'react';

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox';

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
}

interface FormFieldsPanelProps {
  campaign: any;
  setCampaign: (updater: any) => void;
}

const fieldTypeOptions: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Texte' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'number', label: 'Nombre' },
  { value: 'textarea', label: 'Zone de texte' },
  { value: 'select', label: 'Liste' },
  { value: 'checkbox', label: 'Case à cocher' },
];

const ensureArray = (v: any): FieldConfig[] => (Array.isArray(v) ? v : []);

const FormFieldsPanel: React.FC<FormFieldsPanelProps> = ({ campaign, setCampaign }) => {
  const fields: FieldConfig[] = ensureArray(campaign?.formFields);
  const showFormBeforeResult = campaign?.showFormBeforeResult ?? true; // Default to true for backward compatibility

  const updateFields = (next: FieldConfig[]) => {
    setCampaign((prev: any) => ({
      ...(prev || {}),
      formFields: next,
      form_fields: next,
      _lastUpdate: Date.now(),
    }));
  };

  const addField = () => {
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      label: 'Nouveau champ',
      type: 'text',
      required: false,
    };
    updateFields([...(fields || []), newField]);
  };

  const deleteField = (id: string) => {
    updateFields((fields || []).filter(f => f.id !== id));
  };

  const updateField = (id: string, patch: Partial<FieldConfig>) => {
    updateFields((fields || []).map(f => (f.id === id ? { ...f, ...patch } : f)));
  };

  const moveField = (id: string, dir: 'up' | 'down') => {
    const arr = [...(fields || [])];
    const idx = arr.findIndex(f => f.id === id);
    if (idx < 0) return;
    const swapWith = dir === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= arr.length) return;
    const tmp = arr[idx];
    arr[idx] = arr[swapWith];
    arr[swapWith] = tmp;
    updateFields(arr);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Toggle pour activer/désactiver le formulaire */}
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
            <p className="text-xs text-gray-600 mt-1">
              Si activé, le formulaire de participation s'affichera entre la dernière question du quiz et l'écran de résultat.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Champs du formulaire</h3>
        <button
          onClick={addField}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
        >
          + Champ
        </button>
      </div>

      <div className="space-y-3">
        {(fields && fields.length > 0 ? fields : []).map((field, index) => (
          <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">{`Champ ${index + 1}`}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveField(field.id, 'up')}
                  className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                  disabled={index === 0}
                  title="Monter"
                >↑</button>
                <button
                  onClick={() => moveField(field.id, 'down')}
                  className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                  disabled={index === (fields.length - 1)}
                  title="Descendre"
                >↓</button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50"
                  title="Supprimer"
                >Supprimer</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Label du champ</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type de champ</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                >
                  {fieldTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                id={`required-${field.id}`}
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor={`required-${field.id}`} className="text-xs text-gray-700">Champ obligatoire</label>
            </div>
          </div>
        ))}

        {(!fields || fields.length === 0) && (
          <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
            Aucun champ défini. Cliquez sur "+ Champ" pour commencer.
          </div>
        )}
      </div>
    </div>
  );
};

export default FormFieldsPanel;
