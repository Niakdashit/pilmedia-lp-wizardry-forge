import React from 'react';
import { Palette, Upload, Layout, Spacing, CornerUpRight } from 'lucide-react';

interface FormDesignPanelProps {
  config: any;
  onConfigUpdate: (updates: any) => void;
}

const FormDesignPanel: React.FC<FormDesignPanelProps> = ({
  config,
  onConfigUpdate
}) => {
  const design = config.design || {};
  const buttonConfig = config.buttonConfig || {};

  const updateDesign = (updates: any) => {
    onConfigUpdate({
      design: {
        ...design,
        ...updates
      }
    });
  };

  const updateButtonConfig = (updates: any) => {
    onConfigUpdate({
      buttonConfig: {
        ...buttonConfig,
        ...updates
      }
    });
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateDesign({
          background: {
            type: 'image',
            value: e.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    updateDesign({
      background: {
        type: 'color',
        value: color
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Arrière-plan */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-purple-600" />
          Arrière-plan
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'arrière-plan
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBackgroundColorChange(design.background?.value || '#f8fafc')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  design.background?.type === 'color' || !design.background?.type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Couleur
              </button>
              <button
                onClick={() => document.getElementById('backgroundImage')?.click()}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  design.background?.type === 'image'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Image
              </button>
            </div>
          </div>

          {design.background?.type === 'color' || !design.background?.type ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur d'arrière-plan
              </label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                  style={{ backgroundColor: design.background?.value || '#f8fafc' }}
                  onClick={() => document.getElementById('bgColorPicker')?.click()}
                />
                <input
                  id="bgColorPicker"
                  type="color"
                  value={design.background?.value || '#f8fafc'}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="sr-only"
                />
                <input
                  type="text"
                  value={design.background?.value || '#f8fafc'}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#f8fafc"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image d'arrière-plan
              </label>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choisir une image</span>
                  <input
                    id="backgroundImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {design.background?.value && design.background?.type === 'image' && (
                <div className="mt-3">
                  <img 
                    src={design.background.value} 
                    alt="Aperçu arrière-plan" 
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Couleurs du formulaire */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-blue-600" />
          Couleurs
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur principale
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: design.primaryColor || '#3b82f6' }}
                onClick={() => document.getElementById('primaryColor')?.click()}
              />
              <input
                id="primaryColor"
                type="color"
                value={design.primaryColor || '#3b82f6'}
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={design.primaryColor || '#3b82f6'}
                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3b82f6"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Utilisée pour les bordures et les éléments actifs</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur secondaire
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: design.secondaryColor || '#64748b' }}
                onClick={() => document.getElementById('secondaryColor')?.click()}
              />
              <input
                id="secondaryColor"
                type="color"
                value={design.secondaryColor || '#64748b'}
                onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={design.secondaryColor || '#64748b'}
                onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#64748b"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Utilisée pour les textes et les éléments secondaires</p>
          </div>
        </div>
      </div>

      {/* Layout et espacement */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Layout className="w-5 h-5 mr-2 text-green-600" />
          Mise en page
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disposition des champs
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => updateDesign({ layout: 'vertical' })}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  design.layout === 'vertical' || !design.layout
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Verticale
              </button>
              <button
                onClick={() => updateDesign({ layout: 'horizontal' })}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  design.layout === 'horizontal'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Horizontale
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Espacement
            </label>
            <div className="flex space-x-2">
              {['compact', 'normal', 'spacious'].map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => updateDesign({ spacing })}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    design.spacing === spacing || (!design.spacing && spacing === 'normal')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {spacing === 'compact' ? 'Compact' : 
                   spacing === 'normal' ? 'Normal' : 'Spacieux'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rayon des bordures ({design.borderRadius || 8}px)
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={design.borderRadius || 8}
              onChange={(e) => updateDesign({ borderRadius: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px (carré)</span>
              <span>10px</span>
              <span>20px (arrondi)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration du bouton */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CornerUpRight className="w-5 h-5 mr-2 text-orange-600" />
          Bouton de soumission
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={buttonConfig.text || 'Envoyer'}
              onChange={(e) => updateButtonConfig({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Envoyer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur du bouton
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: buttonConfig.color || '#3b82f6' }}
                onClick={() => document.getElementById('buttonColor')?.click()}
              />
              <input
                id="buttonColor"
                type="color"
                value={buttonConfig.color || '#3b82f6'}
                onChange={(e) => updateButtonConfig({ color: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={buttonConfig.color || '#3b82f6'}
                onChange={(e) => updateButtonConfig({ color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur du texte
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: buttonConfig.textColor || '#ffffff' }}
                onClick={() => document.getElementById('buttonTextColor')?.click()}
              />
              <input
                id="buttonTextColor"
                type="color"
                value={buttonConfig.textColor || '#ffffff'}
                onChange={(e) => updateButtonConfig({ textColor: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={buttonConfig.textColor || '#ffffff'}
                onChange={(e) => updateButtonConfig({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte pendant l'envoi
            </label>
            <input
              type="text"
              value={buttonConfig.loadingText || 'Envoi en cours...'}
              onChange={(e) => updateButtonConfig({ loadingText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Envoi en cours..."
            />
          </div>
        </div>
      </div>

      {/* Aperçu des styles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Aperçu des styles
        </h3>
        
        <div className="p-4 border rounded-lg" style={{ backgroundColor: design.background?.value || '#f8fafc' }}>
          {/* Exemple de champ */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: design.secondaryColor || '#64748b' }}>
              Exemple de champ
            </label>
            <input
              type="text"
              placeholder="Aperçu du placeholder"
              className="w-full px-3 py-2 border-2 rounded-lg bg-white"
              style={{ 
                borderColor: design.primaryColor || '#3b82f6',
                borderRadius: `${design.borderRadius || 8}px`
              }}
              readOnly
            />
          </div>
          
          {/* Exemple de bouton */}
          <button
            className="px-6 py-3 font-medium rounded-lg shadow-sm"
            style={{
              backgroundColor: buttonConfig.color || '#3b82f6',
              color: buttonConfig.textColor || '#ffffff',
              borderRadius: `${design.borderRadius || 8}px`
            }}
          >
            {buttonConfig.text || 'Envoyer'}
          </button>
        </div>
      </div>

      {/* Conseils de design */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">🎨 Conseils de design</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Utilisez des couleurs contrastées pour une meilleure lisibilité</li>
          <li>• Gardez un espacement cohérent entre les éléments</li>
          <li>• Testez votre formulaire sur différents appareils</li>
          <li>• Utilisez des bordures arrondies pour un look moderne</li>
        </ul>
      </div>
    </div>
  );
};

export default FormDesignPanel;
