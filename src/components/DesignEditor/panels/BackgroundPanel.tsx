import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import ColorThief from 'colorthief';

interface BackgroundPanelProps {
  onBackgroundChange: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  extractedColors?: string[];
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ 
  onBackgroundChange, 
  onExtractedColorsChange,
  currentBackground,
  extractedColors = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Détermination de la sélection courante (pour l'état "sélectionné" dans l'UI)
  const currentBgValue = currentBackground?.type === 'color' ? currentBackground.value : undefined;
  const isTurquoiseSelected = (currentBgValue || '').toLowerCase() === '#4ecdc4';
  const cloudGradient = 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)';
  const isCloudGradientSelected = currentBgValue === cloudGradient;

  const backgroundColors = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
    '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8C69', '#87CEEB', '#98FB98', '#F0E68C'
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

  return (
    <div className="p-4 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="sr-only"
      />

      {/* Upload Background Image */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">IMAGE DE FOND</h3>
        <button
          onClick={triggerFileUpload}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors flex flex-col items-center group"
        >
          <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
          <span className="text-sm text-gray-600 group-hover:text-white">Télécharger une image</span>
          <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG jusqu'à 10MB</span>
        </button>
      </div>

      {/* Solid Colors */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">COULEURS UNIES</h3>
        <div className="grid grid-cols-5 gap-2">
          {backgroundColors.map((color, index) => (
            <button
              key={index}
              onClick={() => onBackgroundChange({ type: 'color', value: color })}
              className="w-10 h-10 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors relative"
              style={{ backgroundColor: color }}
              title={color}
            >
              {color === '#FFFFFF' && (
                <div className="absolute inset-0 border border-gray-300 rounded"></div>
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
                onClick={() => onBackgroundChange({ type: 'color', value: color })}
                className="w-10 h-10 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors relative group"
                style={{ backgroundColor: color }}
                title={color}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-opacity"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Predefined Backgrounds */
      /* Affiche l'état sélectionné pour refléter la couleur actuelle */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">ARRIÈRE-PLANS PRÉDÉFINIS</h3>
        <div className="space-y-2">
          <button
            onClick={() => onBackgroundChange({ 
              type: 'color', 
              value: '#4ECDC4'
            })}
            aria-selected={isTurquoiseSelected}
            className={`w-full p-3 border rounded-lg transition-colors text-left group ${
              isTurquoiseSelected
                ? 'border-[hsl(var(--primary))] bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                : 'border-gray-200 hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded mr-3"
                style={{ background: '#4ECDC4' }}
              ></div>
              <span className="text-sm group-hover:text-white">Turquoise (défaut template)</span>
            </div>
          </button>
          <button
            onClick={() => onBackgroundChange({ 
              type: 'color', 
              value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' 
            })}
            aria-selected={isCloudGradientSelected}
            className={`w-full p-3 border rounded-lg transition-colors text-left group ${
              isCloudGradientSelected
                ? 'border-[hsl(var(--primary))] bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                : 'border-gray-200 hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded mr-3"
                style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }}
              ></div>
              <span className="text-sm group-hover:text-white">Ciel avec nuages</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel;