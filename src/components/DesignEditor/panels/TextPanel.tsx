import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';

interface TextPanelProps {
  onAddElement: (element: any) => void;
}

const TextPanel: React.FC<TextPanelProps> = ({ onAddElement }) => {
  const textPresets = [
    { id: 'heading', text: 'Titre principal', fontSize: 48, fontWeight: 'bold' },
    { id: 'subheading', text: 'Sous-titre', fontSize: 32, fontWeight: '600' },
    { id: 'body', text: 'Texte du corps', fontSize: 16, fontWeight: 'normal' },
    { id: 'caption', text: 'Légende', fontSize: 12, fontWeight: 'normal' },
  ];

  const fonts = [
    // Polices Impact & Display
    'Bebas Neue', 'Anton', 'Oswald', 'Fjalla One', 'Bangers', 'Russo One',
    'Righteous', 'Fredoka One', 'Titan One', 'Squada One', 'Changa One',
    
    // Polices Modernes
    'Montserrat', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Nunito',
    'Raleway', 'Source Sans Pro', 'Work Sans', 'Rubik', 'Fira Sans',
    'Kanit', 'Exo 2',
    
    // Polices Script & Décorative
    'Dancing Script', 'Pacifico', 'Lobster', 'Great Vibes', 'Sacramento',
    'Satisfy', 'Cookie', 'Caveat', 'Kalam', 'Shadows Into Light',
    'Amatic SC', 'Indie Flower', 'Permanent Marker', 'Architects Daughter',
    
    // Polices Élégantes
    'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Libre Baskerville',
    
    // Polices Tech & Gaming
    'Orbitron', 'Audiowide', 'Press Start 2P', 'Creepster', 'Bungee',
    
    // Polices Classiques Améliorées
    'Ubuntu', 'Quicksand', 'Comfortaa', 'Inter'
  ];

const stylePresets = [
    {
      id: 'concours',
      name: 'Concours Impact',
      preview: 'CONCOURS',
      style: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        backgroundColor: '#1A1A1A',
        borderRadius: 15,
        padding: { top: 16, right: 32, bottom: 16, left: 32 },
        fontFamily: 'Bebas Neue',
        textShadow: { color: '#000000', blur: 8, offsetX: 2, offsetY: 2 },
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }
    },
    {
      id: 'jeu-concours',
      name: 'Jeu Concours',
      preview: 'JEU CONCOURS',
      style: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,100,0,0.8)',
        borderRadius: 12,
        padding: { top: 20, right: 30, bottom: 20, left: 30 },
        fontFamily: 'Montserrat',
        textShadow: { color: '#000000', blur: 6, offsetX: 3, offsetY: 3 },
        letterSpacing: '1.5px'
      }
    },
    {
      id: 'gagnez-fitness',
      name: 'Fitness Gagnez',
      preview: 'GAGNEZ',
      style: {
        fontSize: 48,
        fontWeight: '900',
        color: '#000000',
        backgroundColor: '#CCFF00',
        borderRadius: 0,
        padding: { top: 12, right: 24, bottom: 12, left: 24 },
        fontFamily: 'Bebas Neue',
        textShadow: { color: '#666666', blur: 2, offsetX: 2, offsetY: 2 },
        letterSpacing: '3px'
      }
    },
    {
      id: 'gratuit-fitness',
      name: 'Gratuit Fitness',
      preview: 'GRATUIT !',
      style: {
        fontSize: 40,
        fontWeight: '900',
        color: '#000000',
        backgroundColor: '#CCFF00',
        borderRadius: 0,
        padding: { top: 16, right: 32, bottom: 16, left: 32 },
        fontFamily: 'Anton',
        letterSpacing: '2px'
      }
    },
    {
      id: 'roue-chance',
      name: 'Roue Chance Script',
      preview: 'Roue de la Chance',
      style: {
        fontSize: 32,
        fontWeight: '700',
        color: '#6B8E23',
        fontFamily: 'Dancing Script',
        fontStyle: 'italic',
        textShadow: { color: '#B8D4A8', blur: 3, offsetX: 2, offsetY: 2 }
      }
    },
    {
      id: 'tempo-modern',
      name: 'Tempo Moderne',
      preview: 'Tempo',
      style: {
        fontSize: 38,
        fontWeight: '800',
        color: '#2D2D2D',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 25,
        padding: { top: 12, right: 28, bottom: 12, left: 28 },
        fontFamily: 'Poppins',
        letterSpacing: '1px'
      }
    },
    {
      id: 'valeur-prix',
      name: 'Valeur Prix',
      preview: 'VALEUR 890€',
      style: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2D2D2D',
        backgroundColor: '#FFD700',
        borderRadius: 30,
        padding: { top: 14, right: 28, bottom: 14, left: 28 },
        fontFamily: 'Montserrat',
        letterSpacing: '1px'
      }
    },
    {
      id: 'swipe-up',
      name: 'Swipe Up',
      preview: 'swipe up',
      style: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Caveat',
        fontStyle: 'italic',
        textShadow: { color: '#000000', blur: 4, offsetX: 2, offsetY: 2 }
      }
    },
    {
      id: 'tournez-roue',
      name: 'Tournez la Roue',
      preview: 'TOURNEZ LA ROUE >',
      style: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4A5D2A',
        backgroundColor: 'rgba(200,220,180,0.9)',
        borderRadius: 8,
        padding: { top: 12, right: 20, bottom: 12, left: 20 },
        fontFamily: 'Oswald',
        letterSpacing: '1px'
      }
    },
    {
      id: 'cadeau-mystere',
      name: 'Cadeau Mystère',
      preview: 'CADEAU MYSTÈRE',
      style: {
        fontSize: 32,
        fontWeight: '900',
        color: '#2D4A2D',
        fontFamily: 'Anton',
        letterSpacing: '2px',
        textShadow: { color: 'rgba(0,0,0,0.3)', blur: 2, offsetX: 1, offsetY: 1 }
      }
    }
  ];

  const addText = (preset?: any, stylePreset?: any) => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      content: preset?.text || stylePreset?.preview || 'Votre texte ici',
      fontSize: preset?.fontSize || stylePreset?.style?.fontSize || 16,
      fontWeight: preset?.fontWeight || stylePreset?.style?.fontWeight || 'normal',
      fontFamily: stylePreset?.style?.fontFamily || 'Montserrat',
      color: stylePreset?.style?.color || '#000000',
      textAlign: 'left',
      zIndex: 10,
      // Support for advanced typography
      letterSpacing: stylePreset?.style?.letterSpacing || 'normal',
      textTransform: stylePreset?.style?.textTransform || 'none',
      lineHeight: stylePreset?.style?.lineHeight || 1.2,
      ...(stylePreset?.style || {})
    };
    onAddElement(newText);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <button
          onClick={() => addText()}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center"
        >
          <Type className="w-5 h-5 mr-2 text-gray-600" />
          <span className="text-sm text-gray-600">Ajouter du texte</span>
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">STYLES DE TEXTE</h3>
        <div className="space-y-2">
          {textPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => addText(preset)}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div 
                style={{ 
                  fontSize: Math.min(preset.fontSize / 2, 20),
                  fontWeight: preset.fontWeight 
                }}
              >
                {preset.text}
              </div>
            </button>
          ))}
          
          {stylePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => addText(undefined, preset)}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              title={preset.name}
            >
              <div 
                style={{ 
                  fontSize: 14,
                  fontWeight: preset.style.fontWeight || 'normal',
                  color: preset.style.color,
                  backgroundColor: preset.style.backgroundColor,
                  borderRadius: preset.style.borderRadius ? `${preset.style.borderRadius}px` : '0',
                  padding: preset.style.padding ? 
                    `${preset.style.padding.top}px ${preset.style.padding.right}px ${preset.style.padding.bottom}px ${preset.style.padding.left}px` : 
                    '2px 4px',
                  textShadow: preset.style.textShadow ? 
                    `${preset.style.textShadow.offsetX}px ${preset.style.textShadow.offsetY}px ${preset.style.textShadow.blur}px ${preset.style.textShadow.color}` : 
                    'none',
                  fontStyle: preset.style.fontStyle || 'normal',
                  fontFamily: preset.style.fontFamily || 'Arial',
                  letterSpacing: preset.style.letterSpacing || 'normal',
                  display: 'inline-block'
                }}
              >
                {preset.preview}
              </div>
              <div className="text-xs text-gray-500 mt-1">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">POLICES POPULAIRES</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {fonts.map((font) => (
            <button
              key={font}
              className="w-full p-2 text-left text-sm rounded hover:bg-gray-100 transition-colors"
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">ALIGNEMENT</h3>
        <div className="flex space-x-1">
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">STYLE</h3>
        <div className="flex space-x-1">
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <Bold className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <Italic className="w-4 h-4" />
          </button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-100">
            <Underline className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;