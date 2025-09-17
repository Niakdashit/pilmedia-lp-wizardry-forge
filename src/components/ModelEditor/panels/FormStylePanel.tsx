import React, { useState } from 'react';
import { Palette, Type, Move, Maximize2, AlertTriangle } from 'lucide-react';
import { FormConfig, DEFAULT_FORM_CONFIG } from '../../GameTypes/FormCanvas';

interface FormStylePanelProps {
  config: Partial<FormConfig>;
  onChange: (propName: keyof FormConfig, value: any) => void;
  onValidate?: (errors: Record<string, string>) => void;
}

const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' }
];

const FormStylePanel: React.FC<FormStylePanelProps> = ({
  config,
  onChange,
  onValidate
}) => {
  const formConfig = { ...DEFAULT_FORM_CONFIG, ...config };
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation des couleurs
  const validateColor = (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbaRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/;
    return hexRegex.test(color) || rgbaRegex.test(color);
  };

  // Validation en temps réel
  const handleChange = (propName: keyof FormConfig, value: any) => {
    const newErrors = { ...errors };

    // Validation selon le type de propriété
    switch (propName) {
      case 'backgroundColor':
      case 'borderColor':
      case 'textColor':
      case 'buttonColor':
      case 'buttonTextColor':
        if (!validateColor(value)) {
          newErrors[propName] = 'Format couleur invalide (#RRGGBB ou rgba())';
        } else {
          delete newErrors[propName];
        }
        break;
      
      case 'borderRadius':
      case 'fieldRadius':
        const radius = parseInt(value);
        if (isNaN(radius) || radius < 0 || radius > 48) {
          newErrors[propName] = 'Valeur entre 0 et 48 pixels';
        } else {
          delete newErrors[propName];
        }
        break;
      
      case 'widthPx':
        const width = parseInt(value);
        if (isNaN(width) || width < 240 || width > 720) {
          newErrors[propName] = 'Largeur entre 240 et 720 pixels';
        } else {
          delete newErrors[propName];
        }
        break;
      
      default:
        delete newErrors[propName];
    }

    setErrors(newErrors);
    onValidate?.(newErrors);

    // Appliquer le changement si pas d'erreur
    if (!newErrors[propName]) {
      onChange(propName, value);
    }
  };

  // Vérification du contraste
  const getContrastRatio = (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };
    
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  const buttonContrast = getContrastRatio(formConfig.buttonColor, formConfig.buttonTextColor);
  const textContrast = getContrastRatio(formConfig.backgroundColor, formConfig.textColor);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Style du formulaire</h3>
      </div>

      {/* Avertissements contraste */}
      {(buttonContrast < 4.5 || textContrast < 4.5) && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Contraste insuffisant</p>
              {buttonContrast < 4.5 && (
                <p>• Bouton: {buttonContrast.toFixed(1)}:1 (min. 4.5:1)</p>
              )}
              {textContrast < 4.5 && (
                <p>• Texte: {textContrast.toFixed(1)}:1 (min. 4.5:1)</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Couleurs */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Couleurs
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Fond */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur de fond
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formConfig.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-12 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formConfig.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className={`flex-1 px-3 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 ${
                  errors.backgroundColor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="#FFFFFF"
              />
            </div>
            {errors.backgroundColor && (
              <p className="text-xs text-red-600 mt-1">{errors.backgroundColor}</p>
            )}
          </div>

          {/* Bordure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur de bordure
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formConfig.borderColor}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                className="w-12 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formConfig.borderColor}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                className={`flex-1 px-3 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 ${
                  errors.borderColor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="#E5E7EB"
              />
            </div>
            {errors.borderColor && (
              <p className="text-xs text-red-600 mt-1">{errors.borderColor}</p>
            )}
          </div>

          {/* Texte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du texte
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formConfig.textColor}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className="w-12 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formConfig.textColor}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className={`flex-1 px-3 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 ${
                  errors.textColor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="#111827"
              />
            </div>
            {errors.textColor && (
              <p className="text-xs text-red-600 mt-1">{errors.textColor}</p>
            )}
          </div>

          {/* Bouton */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du bouton
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formConfig.buttonColor}
                onChange={(e) => handleChange('buttonColor', e.target.value)}
                className="w-12 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formConfig.buttonColor}
                onChange={(e) => handleChange('buttonColor', e.target.value)}
                className={`flex-1 px-3 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 ${
                  errors.buttonColor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="#111827"
              />
            </div>
            {errors.buttonColor && (
              <p className="text-xs text-red-600 mt-1">{errors.buttonColor}</p>
            )}
          </div>

          {/* Texte bouton */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur texte bouton
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formConfig.buttonTextColor}
                onChange={(e) => handleChange('buttonTextColor', e.target.value)}
                className="w-12 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                value={formConfig.buttonTextColor}
                onChange={(e) => handleChange('buttonTextColor', e.target.value)}
                className={`flex-1 px-3 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 ${
                  errors.buttonTextColor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="#FFFFFF"
              />
            </div>
            {errors.buttonTextColor && (
              <p className="text-xs text-red-600 mt-1">{errors.buttonTextColor}</p>
            )}
          </div>
        </div>
      </div>

      {/* Typographie */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Typographie
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Police
          </label>
          <select
            value={formConfig.fontFamily}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
          >
            {FONT_OPTIONS.map(font => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dimensions et position */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Maximize2 className="w-4 h-4" />
          Dimensions
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Arrondi formulaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrondi formulaire
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="48"
                value={formConfig.borderRadius}
                onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-8">{formConfig.borderRadius}px</span>
            </div>
            {errors.borderRadius && (
              <p className="text-xs text-red-600 mt-1">{errors.borderRadius}</p>
            )}
          </div>

          {/* Arrondi champs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrondi champs
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="48"
                value={formConfig.fieldRadius}
                onChange={(e) => handleChange('fieldRadius', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-8">{formConfig.fieldRadius}px</span>
            </div>
            {errors.fieldRadius && (
              <p className="text-xs text-red-600 mt-1">{errors.fieldRadius}</p>
            )}
          </div>
        </div>

        {/* Largeur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Largeur (240-720px)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="240"
              max="720"
              step="10"
              value={formConfig.widthPx}
              onChange={(e) => handleChange('widthPx', parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min="240"
              max="720"
              value={formConfig.widthPx}
              onChange={(e) => handleChange('widthPx', parseInt(e.target.value))}
              className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 ${
                errors.widthPx ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">px</span>
          </div>
          {errors.widthPx && (
            <p className="text-xs text-red-600 mt-1">{errors.widthPx}</p>
          )}
        </div>
      </div>

      {/* Position */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Move className="w-4 h-4" />
          Position
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alignement
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleChange('position', 'left')}
              className={`flex-1 px-3 py-2 text-sm border rounded transition-colors ${
                formConfig.position === 'left'
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Gauche
            </button>
            <button
              type="button"
              onClick={() => handleChange('position', 'right')}
              className={`flex-1 px-3 py-2 text-sm border rounded transition-colors ${
                formConfig.position === 'right'
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Droite
            </button>
          </div>
        </div>
      </div>

      {/* Bouton reset */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            Object.entries(DEFAULT_FORM_CONFIG).forEach(([key, value]) => {
              onChange(key as keyof FormConfig, value);
            });
            setErrors({});
          }}
          className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Réinitialiser les styles
        </button>
      </div>
    </div>
  );
};

export default FormStylePanel;
