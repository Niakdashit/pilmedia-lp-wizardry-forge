import React, { useState } from 'react';
import { 
  Type, Bold, Italic, Underline, 
  Trash2, Copy, Settings 
} from 'lucide-react';
import type { CustomText } from './QualifioEditorLayout';

interface TextElementEditorProps {
  text: CustomText;
  onUpdate: (updates: Partial<CustomText>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const TextElementEditor: React.FC<TextElementEditorProps> = ({
  text,
  onUpdate,
  onDelete,
  onDuplicate
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Tahoma'
  ];

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      {/* Header avec contrôles rapides */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Élément texte</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Paramètres avancés"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-100 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Contenu du texte */}
      <div className="form-group-premium">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Contenu</label>
        <textarea
          value={text.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
          rows={3}
          placeholder="Saisissez votre texte..."
        />
      </div>

      {/* Style du texte */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group-premium">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Taille</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="72"
              value={text.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-8">{text.fontSize}px</span>
          </div>
        </div>

        <div className="form-group-premium">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Couleur</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={text.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={text.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      {/* Style de police */}
      <div className="space-y-3">
        <div className="form-group-premium">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Police</label>
          <select
            value={text.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          >
            {fontFamilies.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Boutons de style */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate({ 
              fontWeight: text.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
            className={`p-2 rounded transition-colors ${
              text.fontWeight === 'bold' 
                ? 'bg-brand-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Gras"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onUpdate({ 
              fontStyle: text.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
            className={`p-2 rounded transition-colors ${
              text.fontStyle === 'italic' 
                ? 'bg-brand-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Italique"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onUpdate({ 
              textDecoration: text.textDecoration === 'underline' ? 'none' : 'underline' 
            })}
            className={`p-2 rounded transition-colors ${
              text.textDecoration === 'underline' 
                ? 'bg-brand-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Souligné"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group-premium">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Position X</label>
          <input
            type="number"
            value={text.x}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
        <div className="form-group-premium">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Position Y</label>
          <input
            type="number"
            value={text.y}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Paramètres avancés */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700">Paramètres avancés</h5>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group-premium">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Largeur</label>
              <input
                type="number"
                value={text.width || 200}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 200 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="50"
              />
            </div>
            <div className="form-group-premium">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Hauteur</label>
              <input
                type="number"
                value={text.height || 50}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                min="20"
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Couleur de fond</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={text.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={text.backgroundColor || ''}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="Transparent"
              />
              <button
                onClick={() => onUpdate({ backgroundColor: undefined })}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextElementEditor;