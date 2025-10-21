import React from 'react';

interface FormConfigPanelProps {
  campaign: any;
  onCampaignChange: (campaign: any) => void;
}

const FormConfigPanel: React.FC<FormConfigPanelProps> = ({ campaign, onCampaignChange }) => {
  // Valeurs par défaut pour le formulaire
  const formConfig = campaign?.design?.formConfig || {
    title: 'Vos informations',
    description: 'Remplissez le formulaire pour participer',
    submitLabel: 'SPIN',
    panelBg: '#ffffff',
    borderColor: '#e5e7eb',
    textColor: '#000000',
    buttonColor: '#841b60',
    buttonTextColor: '#ffffff',
    fontFamily: 'inherit',
    displayMode: 'overlay',
    position: 'right',
    borderRadius: 12,
    fieldBorderRadius: 2,
    width: 500,
    height: 500
  };

  const updateFormConfig = (updates: Partial<typeof formConfig>) => {
    onCampaignChange({
      ...campaign,
      design: {
        ...campaign?.design,
        formConfig: {
          ...formConfig,
          ...updates
        },
        customColors: {
          ...campaign?.design?.customColors,
          panelBg: updates.panelBg || formConfig.panelBg,
          textColor: updates.textColor || formConfig.textColor,
          buttonColor: updates.buttonColor || formConfig.buttonColor,
          buttonTextColor: updates.buttonTextColor || formConfig.buttonTextColor
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration Jeu</h2>
      </div>

      {/* Section Contenu */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contenu</h3>

        {/* Titre du formulaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du formulaire
          </label>
          <input
            type="text"
            value={formConfig.title}
            onChange={(e) => updateFormConfig({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formConfig.description}
            onChange={(e) => updateFormConfig({ description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        {/* Texte du bouton */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte du bouton
          </label>
          <input
            type="text"
            value={formConfig.submitLabel}
            onChange={(e) => updateFormConfig({ submitLabel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>
      </div>

      {/* Section Styles */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Styles</h3>

        {/* Grille de couleurs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Fond général */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fond général
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formConfig.panelBg}
                onChange={(e) => updateFormConfig({ panelBg: e.target.value })}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Couleur de bordure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de bordure
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formConfig.borderColor}
                onChange={(e) => updateFormConfig({ borderColor: e.target.value })}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Couleur du texte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur du texte
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formConfig.textColor}
                onChange={(e) => updateFormConfig({ textColor: e.target.value })}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Couleur bouton */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur bouton
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formConfig.buttonColor}
                onChange={(e) => updateFormConfig({ buttonColor: e.target.value })}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Couleur texte bouton */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur texte bouton
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formConfig.buttonTextColor}
                onChange={(e) => updateFormConfig({ buttonTextColor: e.target.value })}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Police */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Police (font-family)
          </label>
          <input
            type="text"
            value={formConfig.fontFamily}
            onChange={(e) => updateFormConfig({ fontFamily: e.target.value })}
            placeholder="Ex: Inter, Arial, sans-serif"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        {/* Affichage du formulaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Affichage du formulaire
          </label>
          <select
            value={formConfig.displayMode || 'overlay'}
            onChange={(e) => updateFormConfig({ displayMode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          >
            <option value="overlay">Survol (par-dessus l'arrière-plan)</option>
            <option value="integrated">Intégré (dans l'arrière-plan)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            En mode intégré, le formulaire occupe ~30% de la largeur et l'arrière-plan reste visible sur ~70%.
          </p>
        </div>

        {/* Rayon des bords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rayon des bords (px)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formConfig.borderRadius}
            onChange={(e) => updateFormConfig({ borderRadius: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <select
            value={formConfig.position}
            onChange={(e) => updateFormConfig({ position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          >
            <option value="left">Gauche</option>
            <option value="right">Droite</option>
            <option value="center">Centre</option>
          </select>
        </div>

        {/* Arrondi des champs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arrondi des champs (px)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={formConfig.fieldBorderRadius}
            onChange={(e) => updateFormConfig({ fieldBorderRadius: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        {/* Largeur du panneau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Largeur du panneau (240-720px)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="240"
              max="720"
              value={formConfig.width}
              onChange={(e) => updateFormConfig({ width: Number(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              min="240"
              max="720"
              value={formConfig.width}
              onChange={(e) => updateFormConfig({ width: Number(e.target.value) })}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-sm text-gray-600">px</span>
          </div>
        </div>

        {/* Hauteur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hauteur (200-800px)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="200"
              max="800"
              value={formConfig.height}
              onChange={(e) => updateFormConfig({ height: Number(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              min="200"
              max="800"
              value={formConfig.height}
              onChange={(e) => updateFormConfig({ height: Number(e.target.value) })}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-sm text-gray-600">px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormConfigPanel;
