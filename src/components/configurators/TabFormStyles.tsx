import React from 'react';

interface TabFormStylesProps {
  design: any;
  onDesignChange: (patch: any) => void;
}

const FormColorInput: React.FC<{ label: string; value?: string; onChange: (v: string) => void }>
  = ({ label, value, onChange }) => {
  const val = typeof value === 'string' ? value : '';
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val) ? val : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 p-0 border border-gray-300 rounded"
          aria-label={label}
        />
        <input
          type="text"
          value={val}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        />
      </div>
    </div>
  );
};

const TabFormStyles: React.FC<TabFormStylesProps> = ({ design = {}, onDesignChange }) => {
  const customColors = design.customColors || {};
  const textStyles = design.textStyles || {};
  
  // Debug log
  console.log('🎨 [TabFormStyles] Current design:', design);


  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Jeu</h3>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Styles</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormColorInput
            label="Fond général"
            value={design.blockColor}
            onChange={(v) => onDesignChange({ blockColor: v })}
          />
          <FormColorInput
            label="Couleur de bordure"
            value={design.borderColor}
            onChange={(v) => onDesignChange({ borderColor: v })}
          />
          <FormColorInput
            label="Couleur du texte"
            value={textStyles?.label?.color}
            onChange={(v) => onDesignChange({ textStyles: { ...textStyles, label: { ...(textStyles.label || {}), color: v } } })}
          />
          <FormColorInput
            label="Couleur bouton"
            value={design.buttonColor || customColors.primary}
            onChange={(v) => onDesignChange({ buttonColor: v, customColors: { ...customColors, primary: v } })}
          />
          <FormColorInput
            label="Couleur texte bouton"
            value={design.textStyles?.button?.color}
            onChange={(v) => onDesignChange({ textStyles: { ...textStyles, button: { ...(textStyles.button || {}), color: v } } })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Police (font-family)</label>
          <input
            type="text"
            value={design.fontFamily || ''}
            onChange={(e) => onDesignChange({ fontFamily: e.target.value })}
            placeholder="Ex: Inter, Arial, sans-serif"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rayon des bords (px)</label>
          <input
            type="number"
            value={Number(design.borderRadius ?? 0)}
            onChange={(e) => onDesignChange({ borderRadius: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <select
            value={design.formPosition || 'right'}
            onChange={(e) => onDesignChange({ formPosition: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          >
            <option value="left">Gauche</option>
            <option value="right">Droite</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Arrondi des champs (px)</label>
          <input
            type="number"
            value={Number(design.inputBorderRadius ?? design.borderRadius ?? 2)}
            onChange={(e) => onDesignChange({ inputBorderRadius: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          />
        </div>
        
        {/* Section Taille du formulaire - Version propre */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Taille du formulaire</h4>
          
          {/* Boutons de taille prédéfinie */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => {
                console.log('🎨 [TabFormStyles] Small button clicked');
                onDesignChange({ formSize: 'small' });
              }}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                design.formSize === 'small' 
                  ? 'bg-purple-100 border-purple-300 text-purple-700' 
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Petit
            </button>
            <button
              onClick={() => {
                console.log('🎨 [TabFormStyles] Medium button clicked');
                onDesignChange({ formSize: 'medium' });
              }}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                design.formSize === 'medium' || !design.formSize
                  ? 'bg-purple-100 border-purple-300 text-purple-700' 
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Moyen
            </button>
            <button
              onClick={() => {
                console.log('🎨 [TabFormStyles] Large button clicked');
                onDesignChange({ formSize: 'large' });
              }}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                design.formSize === 'large' 
                  ? 'bg-purple-100 border-purple-300 text-purple-700' 
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Grand
            </button>
          </div>
          
          {/* Contrôles de taille personnalisée */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largeur du formulaire
              </label>
              <input
                type="range"
                min="300"
                max="800"
                step="50"
                value={design.formWidth || 400}
                onChange={(e) => {
                  console.log('🎨 [TabFormStyles] Width slider changed:', e.target.value);
                  onDesignChange({ formWidth: parseInt(e.target.value) });
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>300px</span>
                <span className="font-medium">{design.formWidth || 400}px</span>
                <span>800px</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hauteur du formulaire
              </label>
              <input
                type="range"
                min="400"
                max="700"
                step="50"
                value={design.formHeight || 500}
                onChange={(e) => {
                  console.log('🎨 [TabFormStyles] Height slider changed:', e.target.value);
                  onDesignChange({ formHeight: parseInt(e.target.value) });
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>400px</span>
                <span className="font-medium">{design.formHeight || 500}px</span>
                <span>700px</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabFormStyles;
