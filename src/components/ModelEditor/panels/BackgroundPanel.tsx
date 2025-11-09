import React, { useRef, useState } from 'react';
import { Upload, Pipette } from 'lucide-react';
import ColorThief from 'colorthief';

interface BackgroundPanelProps {
  onBackgroundChange: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  extractedColors?: string[];
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  // 'fill' applies text color or shape background; 'border' applies shape borderColor
  colorEditingContext?: 'fill' | 'border' | 'text';
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ 
  onBackgroundChange, 
  onExtractedColorsChange,
  currentBackground,
  extractedColors = [],
  selectedElement,
  onElementUpdate,
  colorEditingContext = 'fill'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [customColor, setCustomColor] = useState('#FF0000');

  // Vérifier si un élément est sélectionné
  const isTextSelected = selectedElement && selectedElement.type === 'text';
  const isShapeSelected = selectedElement && selectedElement.type === 'shape';
  
  // Déterminer la couleur actuelle en fonction de la sélection et du contexte
  const getCurrentColor = () => {
    if (isTextSelected) {
      if (colorEditingContext === 'border') {
        // Texte peut ne pas avoir de bordure; fallback à la couleur du texte si absent
        return selectedElement.borderColor || selectedElement.color || '#000000';
      }
      return selectedElement.color || '#000000';
    }
    if (isShapeSelected) {
      if (colorEditingContext === 'border') {
        return selectedElement.borderColor || '#000000';
      }
      if (colorEditingContext === 'text') {
        return selectedElement.textColor || '#000000';
      }
      return selectedElement.backgroundColor || '#3B82F6';
    }
    return currentBackground?.type === 'color' ? currentBackground.value : undefined;
  };

  // Fonction pour appliquer une couleur
  const applyColor = (color: string) => {
    if (isTextSelected && onElementUpdate) {
      // Texte: bordure optionnelle, sinon couleur du texte
      if (colorEditingContext === 'border') {
        onElementUpdate({ borderColor: color });
      } else {
        onElementUpdate({ color });
      }
    } else if (isShapeSelected && onElementUpdate) {
      // Forme: selon le contexte
      if (colorEditingContext === 'border') {
        onElementUpdate({ borderColor: color });
      } else if (colorEditingContext === 'text') {
        onElementUpdate({ textColor: color });
      } else {
        onElementUpdate({ backgroundColor: color });
      }
    } else {
      // Appliquer à l'arrière-plan (toujours fill)
      onBackgroundChange({ type: 'color', value: color });
    }
  };

  // La fonction getCurrentColor() est utilisée directement dans le rendu

  const backgroundColors = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
    '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8C69', '#87CEEB', '#98FB98'
  ];

  const extractColorsFromImage = async (imageUrl: string) => {
    return new Promise<string[]>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          // Extraire une palette de 8 couleurs pour avoir un bon choix
          const palette = colorThief.getPalette(img, 8);
          const extractedColors = palette.map(color => 
            `rgb(${color[0]}, ${color[1]}, ${color[2]})`
          );
          resolve(extractedColors);
        } catch (error) {
          console.error('Error extracting colors:', error);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imageUrl;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        onBackgroundChange({ type: 'image', value: imageUrl });
        
        // Extract colors from the uploaded image
        const extractedColors = await extractColorsFromImage(imageUrl);
        if (onExtractedColorsChange && extractedColors.length > 0) {
          onExtractedColorsChange(extractedColors);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerColorPicker = () => {
    colorInputRef.current?.click();
  };

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setCustomColor(newColor);
    applyColor(newColor);
  };

  return (
    <div className="p-4 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="sr-only"
      />
      
      <input
        ref={colorInputRef}
        type="color"
        value={customColor}
        onChange={handleCustomColorChange}
        className="sr-only"
      />

      {/* Indicateur de ce qui sera modifié */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800 font-medium">
          {isTextSelected ? (
            <>
              📝 Modification du texte sélectionné
              <span className="block text-xs text-blue-600 mt-1">
                {colorEditingContext === 'border' 
                  ? 'Les couleurs seront appliquées à la bordure du texte (si supportée)'
                  : `Les couleurs seront appliquées au texte "${selectedElement.text || 'Texte'}"`}
              </span>
            </>
          ) : (
            <>
              {isShapeSelected ? '⬛ Modification de la forme sélectionnée' : '🖼️ Modification de l\'arrière-plan'}
              <span className="block text-xs text-blue-600 mt-1">
                {isShapeSelected
                  ? (colorEditingContext === 'border' 
                      ? 'Les couleurs seront appliquées à la bordure de la forme'
                      : 'Les couleurs seront appliquées au remplissage de la forme')
                  : 'Les couleurs seront appliquées à l\'arrière-plan du design'}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Upload Background Image - Seulement si pas de texte sélectionné */}
      {!isTextSelected && (
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-3">IMAGE DE FOND</h3>
          <button
            onClick={triggerFileUpload}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[#44444d] hover:text-white transition-colors flex flex-col items-center group"
          >
            <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
            <span className="text-sm text-gray-600 group-hover:text-white">Télécharger une image</span>
            <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG jusqu'à 10MB</span>
          </button>
        </div>
      )}

      {/* Solid Colors */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">
          {isShapeSelected
            ? (colorEditingContext === 'border' ? 'COULEURS DE BORDURE' : 'COULEURS DE REMPLISSAGE')
            : (isTextSelected
                ? (colorEditingContext === 'border' ? 'COULEURS DE BORDURE (TEXTE)' : 'COULEURS DE TEXTE')
                : 'COULEURS UNIES')}
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {/* Sélecteur de couleur personnalisé en première position */}
          <button
            onClick={triggerColorPicker}
            className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors relative overflow-hidden"
            style={{
              background: `conic-gradient(from 0deg, #ff0000 0deg, #ffff00 60deg, #00ff00 120deg, #00ffff 180deg, #0000ff 240deg, #ff00ff 300deg, #ff0000 360deg)`
            }}
            title="Couleur personnalisée"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Pipette className="w-3 h-3 text-gray-700" />
              </div>
            </div>
          </button>
          
          {backgroundColors.map((color, index) => (
            <button
              key={index}
              onClick={() => applyColor(color)}
              className={`w-10 h-10 rounded-full border-2 transition-colors relative ${
                getCurrentColor() === color 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            >
              {color === '#FFFFFF' && (
                <div className="absolute inset-0 border border-gray-300 rounded-full"></div>
              )}
              {getCurrentColor() === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Colors */}
      {extractedColors.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-3">COULEURS EXTRAITES</h3>
          <div className="grid grid-cols-5 gap-2">
            {extractedColors.map((color, index) => (
              <button
                key={index}
                onClick={() => applyColor(color)}
                className={`w-10 h-10 rounded-full border-2 transition-colors relative group ${
                  getCurrentColor() === color 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-opacity"></div>
                {getCurrentColor() === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundPanel;