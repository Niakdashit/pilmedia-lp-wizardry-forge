import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Undo, Redo, Type } from 'lucide-react';

interface RichTextEditorWithToolbarProps {
  htmlContent?: string;
  placeholder?: string;
  editable?: boolean;
  onHtmlContentChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  colors?: string[];
  showToolbar?: boolean;
}

/**
 * RichTextEditorWithToolbar - Éditeur Tiptap avec toolbar intégrée
 * 
 * Remplace complètement EditableText avec :
 * - Toolbar de formatage (gras, italique, listes)
 * - Sélecteur de couleurs
 * - Undo/redo
 * - Persistance garantie des styles
 */
export const RichTextEditorWithToolbar: React.FC<RichTextEditorWithToolbarProps> = ({
  htmlContent = '',
  placeholder = 'Décrivez votre contenu ici...',
  editable = true,
  onHtmlContentChange,
  onFocus,
  onBlur,
  className = '',
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
  showToolbar = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        blockquote: false,
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: htmlContent,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onHtmlContentChange?.(html);
    },
    onFocus: () => {
      setIsFocused(true);
      onFocus?.();
    },
    onBlur: () => {
      setIsFocused(false);
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: `w-full min-h-[150px] pt-3 px-3 pb-0 focus:outline-none prose prose-lg max-w-none transition-colors duration-200 ${className}`,
      },
    },
  });

  // Synchroniser le contenu uniquement si htmlContent change ET que l'éditeur n'est pas focus
  React.useEffect(() => {
    if (!editor || editor.isFocused) return;

    const currentHtml = editor.getHTML();
    
    if (htmlContent !== currentHtml) {
      editor.commands.setContent(htmlContent || '');
    }
  }, [htmlContent, editor]);

  // Mettre à jour l'état editable
  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

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
      onMouseDown={(e) => {
        // IMPORTANT: utiliser onMouseDown + preventDefault pour que le bouton
        // n'enlève pas le focus ni la sélection de l'éditeur Tiptap.
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
    <div className="rich-text-editor-container border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar - visible uniquement en mode édition et si showToolbar est true */}
      {editable && showToolbar && isFocused && (
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
          {/* Formatage de texte */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
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
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
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
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Type size={18} className="text-gray-500 mr-1" />
            {colors.map((color) => (
              <button
                key={color}
                onMouseDown={(e) => {
                  // Même logique: empêcher le bouton de voler le focus à l'éditeur
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
              onMouseDown={(e) => {
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
      )}

      {/* Éditeur */}
      <EditorContent editor={editor} />
      
      <style>{`
        .rich-text-editor-container .ProseMirror {
          outline: none;
        }
        
        .rich-text-editor-container .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        
        .rich-text-editor-container .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .rich-text-editor-container .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .rich-text-editor-container .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        .rich-text-editor-container .ProseMirror ul,
        .rich-text-editor-container .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .rich-text-editor-container .ProseMirror strong {
          font-weight: 600;
        }
        
        .rich-text-editor-container .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditorWithToolbar;
