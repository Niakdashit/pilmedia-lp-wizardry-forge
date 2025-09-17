import React from 'react';

interface TabFormProps {
  campaign: any;
  setCampaign: (updater: any) => void;
}

const LabeledRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#841b60] ${props.className || ''}`} />
);

const ColorInput: React.FC<{ value?: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-lg shadow-inner" />
);

const NumberInput: React.FC<{ value?: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }> = ({ value, onChange, min = 0, max = 100, step = 1 }) => (
  <input type="number" value={value ?? 0} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#841b60]" />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#841b60] ${props.className || ''}`}></select>
);

const TabForm: React.FC<TabFormProps> = ({ campaign, setCampaign }) => {
  if (!campaign) return <div className="p-4 text-gray-300">Chargement…</div>;

  const design = campaign?.design || {};
  const screens = Array.isArray(campaign?.screens) ? campaign.screens : [];
  const screenIndex = 1; // Convention: écran formulaire
  const screen = screens[screenIndex] || {};

  const updateDesign = (updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      design: {
        ...(prev?.design || {}),
        ...updates,
      },
      _lastUpdate: Date.now(), // Force sync avec preview
    }));
  };

  const updateScreen = (updates: any) => {
    setCampaign((prev: any) => {
      const arr = Array.isArray(prev?.screens) ? [...prev.screens] : [];
      const base = arr[screenIndex] || {};
      arr[screenIndex] = { ...base, ...updates };
      return { ...prev, screens: arr, _lastUpdate: Date.now() }; // Force sync avec preview
    });
  };

  const updateButtonText = (text: string) => {
    setCampaign((prev: any) => ({
      ...prev,
      buttonConfig: {
        ...(prev?.buttonConfig || {}),
        text,
      },
      _lastUpdate: Date.now(), // Force sync avec preview
    }));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Contenu</h3>
        <LabeledRow label="Titre du formulaire">
          <Input value={screen.title || ''} onChange={(e) => updateScreen({ title: e.target.value })} placeholder="Ex: Vos informations" />
        </LabeledRow>
        <LabeledRow label="Description">
          <Input value={screen.description || ''} onChange={(e) => updateScreen({ description: e.target.value })} placeholder="Ex: Remplissez le formulaire pour continuer" />
        </LabeledRow>
        <LabeledRow label="Texte du bouton">
          <Input value={campaign?.buttonConfig?.text || ''} onChange={(e) => updateButtonText(e.target.value)} placeholder="Ex: Valider le formulaire" />
        </LabeledRow>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Styles</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-xs text-gray-500 mb-1">Fond général</span>
            <ColorInput value={design.blockColor} onChange={(v) => updateDesign({ blockColor: v })} />
          </div>
          <div>
            <span className="block text-xs text-gray-500 mb-1">Couleur de bordure</span>
            <ColorInput value={design.borderColor} onChange={(v) => updateDesign({ borderColor: v })} />
          </div>
          <div>
            <span className="block text-xs text-gray-500 mb-1">Couleur du texte</span>
            <ColorInput value={design.textStyles?.label?.color} onChange={(v) => setCampaign((prev: any) => ({
              ...prev,
              design: {
                ...(prev?.design || {}),
                textStyles: {
                  ...(prev?.design?.textStyles || {}),
                  label: { ...(prev?.design?.textStyles?.label || {}), color: v },
                },
              },
            }))} />
          </div>
          <div>
            <span className="block text-xs text-gray-500 mb-1">Couleur bouton</span>
            <ColorInput value={design.buttonColor} onChange={(v) => updateDesign({ buttonColor: v })} />
          </div>
          <div>
            <span className="block text-xs text-gray-500 mb-1">Couleur texte bouton</span>
            <ColorInput value={design.buttonTextColor} onChange={(v) => updateDesign({ buttonTextColor: v })} />
          </div>
        </div>

        <LabeledRow label="Police (font-family)">
          <Input value={design.fontFamily || ''} onChange={(e) => updateDesign({ fontFamily: e.target.value })} placeholder="Ex: Inter, Arial, sans-serif" />
        </LabeledRow>

        <div className="grid grid-cols-1 gap-4">
          <LabeledRow label="Rayon des bords (px)">
            <NumberInput value={typeof design.borderRadius === 'number' ? design.borderRadius : parseInt(String(design.borderRadius || '12'), 10)} min={0} max={48} step={1}
              onChange={(v) => updateDesign({ borderRadius: v })} />
          </LabeledRow>
          <LabeledRow label="Position">
            <Select value={design.formPosition || 'right'} onChange={(e) => updateDesign({ formPosition: e.target.value })}>
              <option value="left">Gauche</option>
              <option value="right">Droite</option>
            </Select>
          </LabeledRow>
          <LabeledRow label="Arrondi des champs (px)">
            <NumberInput value={typeof design.inputBorderRadius === 'number' ? design.inputBorderRadius : parseInt(String(design.inputBorderRadius ?? design.borderRadius ?? '2'), 10)} min={0} max={32} step={1}
              onChange={(v) => updateDesign({ inputBorderRadius: v })} />
          </LabeledRow>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <LabeledRow label="Largeur du panneau (240-720px)">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="240"
                max="720"
                step="10"
                value={parseInt(String(design.formConfig?.widthPx || 360))}
                onChange={(e) => {
                  const widthPx = parseInt(e.target.value);
                  updateDesign({ 
                    formConfig: { ...(design.formConfig || {}), widthPx },
                    formWidth: `${widthPx}px`,
                    _lastUpdate: Date.now()
                  });
                }}
                className="flex-1"
              />
              <input
                type="number"
                min="240"
                max="720"
                value={parseInt(String(design.formConfig?.widthPx || 360))}
                onChange={(e) => {
                  const widthPx = parseInt(e.target.value) || 360;
                  updateDesign({ 
                    formConfig: { ...(design.formConfig || {}), widthPx },
                    formWidth: `${widthPx}px`,
                    _lastUpdate: Date.now()
                  });
                }}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              />
              <span className="text-sm text-gray-600">px</span>
            </div>
          </LabeledRow>
          <LabeledRow label="Hauteur (200-800px)">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="200"
                max="800"
                step="10"
                value={parseInt(String(design.formConfig?.heightPx || 500))}
                onChange={(e) => {
                  const heightPx = parseInt(e.target.value);
                  updateDesign({ 
                    formConfig: { ...(design.formConfig || {}), heightPx },
                    formHeight: `${heightPx}px`
                  });
                }}
                className="flex-1"
              />
              <input
                type="number"
                min="200"
                max="800"
                value={parseInt(String(design.formConfig?.heightPx || 500))}
                onChange={(e) => {
                  const heightPx = parseInt(e.target.value) || 500;
                  updateDesign({ 
                    formConfig: { ...(design.formConfig || {}), heightPx },
                    formHeight: `${heightPx}px`
                  });
                }}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              />
              <span className="text-sm text-gray-600">px</span>
            </div>
          </LabeledRow>
        </div>
      </div>
    </div>
  );
};

export default TabForm;
