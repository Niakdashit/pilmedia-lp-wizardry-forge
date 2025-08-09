import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import ColorThief from 'colorthief';

interface BackgroundPanelProps {
  onBackgroundChange: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ 
  onBackgroundChange, 
  onExtractedColorsChange 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgroundColors = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
    '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8C69', '#87CEEB', '#98FB98', '#F0E68C'
  ];

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  ];

  const extractColorsFromImage = async (imageUrl: string) => {
    return new Promise<string[]>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          // Extraire uniquement la couleur dominante
          const dominantColor = colorThief.getColor(img);
          const extractedColor = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
          resolve([extractedColor]);
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
        className="hidden"
      />

      {/* Upload Background Image */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">IMAGE DE FOND</h3>
        <button
          onClick={triggerFileUpload}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors flex flex-col items-center"
        >
          <Upload className="w-6 h-6 text-gray-600 mb-2" />
          <span className="text-sm text-gray-600">Télécharger une image</span>
          <span className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</span>
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

      {/* Gradients */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">DÉGRADÉS</h3>
        <div className="grid grid-cols-2 gap-2">
          {gradients.map((gradient, index) => (
            <button
              key={index}
              onClick={() => onBackgroundChange({ type: 'color', value: gradient })}
              className="w-full h-12 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
              style={{ background: gradient }}
              title={`Dégradé ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Predefined Backgrounds */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">ARRIÈRE-PLANS PRÉDÉFINIS</h3>
        <div className="space-y-2">
          <button
            onClick={() => onBackgroundChange({ 
              type: 'color', 
              value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' 
            })}
            className="w-full p-3 border border-gray-200 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors text-left"
          >
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded mr-3"
                style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }}
              ></div>
              <span className="text-sm">Ciel avec nuages</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel;