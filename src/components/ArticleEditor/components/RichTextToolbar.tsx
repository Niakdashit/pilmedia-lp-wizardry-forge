import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Undo, Redo, Type } from 'lucide-react';

interface RichTextToolbarProps {
  editor: Editor | null;
  colors?: string[];
}

/**
 * RichTextToolbar - Barre d'outils pour l'éditeur Tiptap
 * 
 * Fournit des boutons pour :
 * - Formatage (gras, italique)
 * - Listes (à puces, numérotées)
 * - Couleurs de texte
 * - Undo/redo
 */
export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  editor,
  colors = [
    '#000000', // Noir
    '#FF0000', // Rouge
    '#FF6B00', // Orange
    '#FFD700', // Or
    '#00FF00', // Vert
    '#0000FF', // Bleu
    '#4B0082', // Indigo
    '#9400D3', // Violet
    '#FFFFFF', // Blanc
  ],
}) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    icon: React.ReactNode;
    title: string;
  }> = ({ onClick, isActive, icon, title }) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? 'bg-gray-300' : 'bg-transparent'
      }`}
      title={title}
      type="button"
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-white flex-wrap">
      {/* Formatage de texte */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold size={18} />}
          title="Gras (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic size={18} />}
          title="Italique (Ctrl+I)"
        />
      </div>

      {/* Listes */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List size={18} />}
          title="Liste à puces"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered size={18} />}
          title="Liste numérotée"
        />
      </div>

      {/* Couleurs */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <Type size={18} className="text-gray-500 mr-1" />
        {colors.map((color) => (
          <button
            key={color}
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setColor(color).run();
            }}
            className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
              editor.isActive('textStyle', { color })
                ? 'border-blue-500 scale-110'
                : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            title={`Couleur: ${color}`}
            type="button"
          />
        ))}
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().unsetColor().run();
          }}
          className="ml-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
          title="Réinitialiser la couleur"
          type="button"
        >
          ✕
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          icon={<Undo size={18} />}
          title="Annuler (Ctrl+Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          icon={<Redo size={18} />}
          title="Rétablir (Ctrl+Shift+Z)"
        />
      </div>
    </div>
  );
};

export default RichTextToolbar;
