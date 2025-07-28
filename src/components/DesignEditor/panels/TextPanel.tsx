import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';

interface TextPanelProps {
  onAddElement: (element: any) => void;
}

// Presets de texte communs
const textPresets = [
  { 
    id: 'heading', 
    text: 'Titre Principal', 
    fontSize: 48, 
    fontWeight: 'bold', 
    color: '#1f2937',
    fontFamily: 'Montserrat'
  },
  { 
    id: 'subheading', 
    text: 'Sous-titre', 
    fontSize: 32, 
    fontWeight: '600', 
    color: '#374151',
    fontFamily: 'Montserrat'
  },
  { 
    id: 'body', 
    text: 'Texte de description', 
    fontSize: 18, 
    fontWeight: 'normal', 
    color: '#4b5563',
    fontFamily: 'Inter'
  },
  { 
    id: 'caption', 
    text: 'Légende ou note', 
    fontSize: 14, 
    fontWeight: 'normal', 
    color: '#6b7280',
    fontFamily: 'Inter'
  },
  { 
    id: 'button', 
    text: 'BOUTON', 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#ffffff',
    fontFamily: 'Inter'
  }
];

const fonts = [
  // Sans Serif Classiques
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Nunito', 'Source Sans Pro', 'Raleway', 'Ubuntu', 'Work Sans', 'Fira Sans', 'Rubik',
  
  // Serif Élégants
  'Playfair Display', 'Merriweather', 'Cormorant Garamond', 'Cinzel',
  
  // Display Bold & Impact
  'Oswald', 'Anton', 'Bebas Neue', 'Fjalla One', 'Kanit', 'Quicksand', 'Comfortaa', 'Alfa Slab One', 'Racing Sans One', 'Teko', 'Staatliches',
  
  // Handwriting & Script
  'Dancing Script', 'Pacifico', 'Kalam', 'Caveat', 'Architects Daughter', 'Sacramento', 'Great Vibes', 'Satisfy', 'Cookie', 'Shadows Into Light', 'Indie Flower',
  
  // Fun & Creative
  'Fredoka One', 'Lobster', 'Righteous', 'Bungee', 'Bungee Shade', 'Bungee Outline', 'Russo One', 'Bangers', 'Amatic SC', 'Permanent Marker', 'Londrina Solid',
  
  // Gaming & Tech
  'Press Start 2P', 'Orbitron', 'Audiowide', 'Exo 2', 'Black Ops One', 'Zen Dots', 'Wallpoet',
  
  // Horror & Special
  'Creepster', 'Eater', 'Metal Mania', 'Nosifer', 'Butcherman', 'New Rocker', 'Griffy', 'Rye',
  
  // Vintage & Retro
  'Special Elite', 'Fontdiner Swanky', 'Macondo',
  
  // Ultra Bold & Strong
  'Titan One', 'Squada One', 'Changa One', 'Impact',
  
  // Decorative & Artistic
  'Fascinate', 'Fascinate Inline', 'Mystery Quest', 'Trade Winds', 'Pirata One', 'Emblema One', 'Plaster', 'Condiment', 'Caesar Dressing', 'Faster One', 'Spicy Rice', 'Ewert', 'Gravitas One', 'Kumar One', 'Kumar One Outline'
];

const stylePresets = [
  {
    id: 'modern-1',
    name: 'Moderne Gradient',
    text: 'MODERNE',
    style: {
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold',
      fontSize: '32px'
    }
  },
  {
    id: 'neon-1',
    name: 'Néon Bleu',
    text: 'NÉON',
    style: {
      color: '#00ffff',
      textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
      fontWeight: 'bold',
      fontSize: '32px'
    }
  },
  {
    id: 'gold-1',
    name: 'Or Luxe',
    text: 'LUXE',
    style: {
      background: 'linear-gradient(45deg, #ffd700, #ffed4a, #ffd700)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold',
      fontSize: '32px'
    }
  },
  {
    id: '3d-1',
    name: '3D Classique',
    text: '3D',
    style: {
      textShadow: '2px 2px 0px #ccc, 4px 4px 0px #aaa, 6px 6px 0px #888',
      fontWeight: 'bold',
      fontSize: '32px',
      color: '#333'
    }
  },
  {
    id: 'outline-1',
    name: 'Contour',
    text: 'CONTOUR',
    style: {
      WebkitTextStroke: '2px #000',
      color: 'transparent',
      fontWeight: 'bold',
      fontSize: '32px'
    }
  },
  {
    id: 'fire-1',
    name: 'Feu',
    text: 'FEU',
    style: {
      background: 'linear-gradient(45deg, #ff6b35, #ff9068, #ffb347)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold',
      fontSize: '32px'
    }
  },
  {
    id: 'ice-1',
    name: 'Glace',
    text: 'GLACE',
    style: {
      background: 'linear-gradient(45deg, #a8e6cf, #dcedc8, #f0f4c3)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 10px rgba(168, 230, 207, 0.7)',
      fontWeight: 'bold',
      fontSize: '32px'
    }
  },
  {
    id: 'retro-1',
    name: 'Rétro',
    text: 'RÉTRO',
    style: {
      background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 10px #ff00ff',
      fontWeight: 'bold',
      fontSize: '32px'
    }
  }
];

const TextPanel: React.FC<TextPanelProps> = ({ onAddElement }) => {
  // Ajouter un texte avec préréglages optionnels
  const addText = (preset?: any, stylePreset?: any) => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: preset?.text || stylePreset?.text || 'Nouveau texte',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      fontSize: preset?.fontSize || 24,
      color: preset?.color || '#000000',
      fontFamily: preset?.fontFamily || 'Inter',
      fontWeight: preset?.fontWeight || 'normal',
      textAlign: 'left' as const,
      ...(stylePreset && {
        customCSS: stylePreset.style,
        advancedStyle: {
          id: stylePreset.id,
          name: stylePreset.name,
          category: 'preset',
          css: stylePreset.style
        }
      })
    };

    onAddElement(newElement);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Texte</h3>
        <p className="text-sm text-muted-foreground">Ajoutez et personnalisez du texte</p>
      </div>

      <div className="space-y-6">
          {/* Bouton d'ajout simple */}
          <div>
            <button
              onClick={() => addText()}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <Type className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm text-gray-600">Ajouter du texte</span>
            </button>
          </div>

          {/* Presets de texte */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Styles de texte</h4>
            <div className="grid grid-cols-1 gap-2">
              {textPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => addText(preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div 
                    style={{ 
                      fontSize: `${Math.min(preset.fontSize * 0.5, 18)}px`,
                      color: preset.color,
                      fontFamily: preset.fontFamily,
                      fontWeight: preset.fontWeight 
                    }}
                  >
                    {preset.text}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Styles prédéfinis */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Effets visuels</h4>
            <div className="grid grid-cols-2 gap-2">
              {stylePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => addText(null, preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <div 
                    style={{
                      ...preset.style
                    }}
                  >
                    {preset.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Polices créatives étendues */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Polices créatives</h4>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {fonts.map((font) => (
                <button
                  key={font}
                  onClick={() => addText({ text: 'Exemple de texte', fontFamily: font, fontSize: 24 })}
                  className="p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <span style={{ fontFamily: font }} className="text-sm">
                    {font} - Exemple de texte
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Texte personnalisé avec styles avancés */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Texte personnalisé</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Votre texte..."
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    addText({ text: input.value || 'Nouveau texte', fontSize: 24 });
                    input.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Votre texte..."]') as HTMLInputElement;
                  addText({ text: input?.value || 'Nouveau texte', fontSize: 24 });
                  if (input) input.value = '';
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

          {/* Alignement et style */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Alignement</h4>
            <div className="flex space-x-2">
              <button 
                onClick={() => addText({ text: 'Texte aligné à gauche', textAlign: 'left' })}
                className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-100"
              >
                <AlignLeft className="w-4 h-4 mx-auto" />
              </button>
              <button 
                onClick={() => addText({ text: 'Texte centré', textAlign: 'center' })}
                className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-100"
              >
                <AlignCenter className="w-4 h-4 mx-auto" />
              </button>
              <button 
                onClick={() => addText({ text: 'Texte aligné à droite', textAlign: 'right' })}
                className="flex-1 p-2 border border-gray-200 rounded hover:bg-gray-100"
              >
                <AlignRight className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Style de texte</h4>
            <div className="flex space-x-2">
              <button 
                onClick={() => addText({ text: 'Texte en gras', fontWeight: 'bold' })}
                className="p-2 border border-gray-200 rounded hover:bg-gray-100"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button 
                onClick={() => addText({ text: 'Texte en italique', fontStyle: 'italic' })}
                className="p-2 border border-gray-200 rounded hover:bg-gray-100"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button 
                onClick={() => addText({ text: 'Texte souligné', textDecoration: 'underline' })}
                className="p-2 border border-gray-200 rounded hover:bg-gray-100"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>
        </div>
      </div>
    );
  };

export default TextPanel;