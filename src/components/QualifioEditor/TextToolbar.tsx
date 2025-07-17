import React from 'react';
import { Bold, Italic, Underline, Trash2 } from 'lucide-react';
import type { CustomText } from './QualifioEditorLayout';

interface TextToolbarProps {
  text: CustomText;
  position: { x: number; y: number };
  onUpdate: (updates: Partial<CustomText>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TextToolbar: React.FC<TextToolbarProps> = ({
  text,
  position,
  onUpdate,
  onDelete,
  onClose
}) => {
  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];
  const fontFamilies = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Source Sans Pro', 
    'Raleway', 'Ubuntu', 'Work Sans', 'Fira Sans', 'Rubik', 'Quicksand', 'Comfortaa', 'Kanit', 
    'Exo 2', 'Arial', 'Helvetica', 'Verdana', 'Playfair Display', 'Merriweather', 'Georgia', 
    'Times New Roman', 'Palatino', 'Oswald', 'Bebas Neue', 'Anton', 'Fjalla One', 'Russo One', 
    'Righteous', 'Impact', 'Orbitron', 'Audiowide', 'Dancing Script', 'Pacifico', 'Lobster', 
    'Great Vibes', 'Sacramento', 'Satisfy', 'Cookie', 'Caveat', 'Kalam', 'Architects Daughter', 
    'Shadows Into Light', 'Indie Flower', 'Permanent Marker', 'Fredoka One', 'Bungee', 'Bangers', 
    'Creepster', 'Amatic SC', 'Press Start 2P', 'Comic Sans MS', 'Anonymous Pro', 'Courier New', 
    'JetBrains Mono', 'Belleza', 'Binate', 'Trebuchet MS'
  ];

  return (
    <>
      {/* Overlay to close toolbar on click outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Toolbar */}
      <div
        className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-lg p-2 flex items-center gap-1"
        style={{
          left: Math.min(position.x, window.innerWidth - 400),
          top: Math.max(10, position.y - 60),
        }}
      >
        {/* Font Size */}
        <select
          value={text.fontSize}
          onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
          className="bg-gray-800 text-white text-sm px-2 py-1 rounded border-none outline-none w-16"
        >
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Font Family */}
        <select
          value={text.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="bg-gray-800 text-white text-sm px-2 py-1 rounded border-none outline-none max-w-24"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Bold */}
        <button
          onClick={() => onUpdate({ fontWeight: text.fontWeight === 'bold' ? 'normal' : 'bold' })}
          className={`p-1 rounded hover:bg-gray-700 ${text.fontWeight === 'bold' ? 'bg-blue-600' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          onClick={() => onUpdate({ fontStyle: text.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`p-1 rounded hover:bg-gray-700 ${text.fontStyle === 'italic' ? 'bg-blue-600' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          onClick={() => onUpdate({ textDecoration: text.textDecoration === 'underline' ? 'none' : 'underline' })}
          className={`p-1 rounded hover:bg-gray-700 ${text.textDecoration === 'underline' ? 'bg-blue-600' : ''}`}
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Color Picker */}
        <input
          type="color"
          value={text.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="w-8 h-6 rounded border-none cursor-pointer"
          title="Couleur du texte"
        />

        {/* Background Color */}
        <input
          type="color"
          value={text.backgroundColor || '#transparent'}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="w-8 h-6 rounded border-none cursor-pointer"
          title="Couleur de fond"
        />

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Delete */}
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-600 text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

export default TextToolbar;