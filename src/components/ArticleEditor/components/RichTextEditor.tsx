import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  htmlContent?: string;
  placeholder?: string;
  editable?: boolean;
  onHtmlContentChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

/**
 * RichTextEditor - Éditeur de texte riche basé sur Tiptap
 * 
 * Remplace EditableText avec une solution robuste qui garantit :
 * - Persistance des styles (couleurs, gras, italique, etc.)
 * - Pas de désynchronisation DOM ↔ state
 * - Contrôle total du HTML généré
 * - Undo/redo natif
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  htmlContent = '',
  placeholder = 'Décrivez votre contenu ici...',
  editable = true,
  onHtmlContentChange,
  onFocus,
  onBlur,
  className = '',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Désactiver les éléments qu'on ne veut pas
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
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: `w-full min-h-[150px] pt-3 px-3 pb-0 focus:outline-none prose prose-lg max-w-none transition-colors duration-200 ${className}`,
      },
    },
  });

  // Synchroniser le contenu uniquement si htmlContent change ET que l'éditeur n'est pas focus
  useEffect(() => {
    if (!editor || editor.isFocused) return;

    const currentHtml = editor.getHTML();
    
    // Ne mettre à jour que si le contenu a vraiment changé
    if (htmlContent !== currentHtml) {
      editor.commands.setContent(htmlContent || '');
    }
  }, [htmlContent, editor]);

  // Mettre à jour l'état editable
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor-wrapper">
      <EditorContent editor={editor} />
      
      <style>{`
        .rich-text-editor-wrapper .ProseMirror {
          outline: none;
        }
        
        .rich-text-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        
        .rich-text-editor-wrapper .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .rich-text-editor-wrapper .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .rich-text-editor-wrapper .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        .rich-text-editor-wrapper .ProseMirror ul,
        .rich-text-editor-wrapper .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .rich-text-editor-wrapper .ProseMirror strong {
          font-weight: 600;
        }
        
        .rich-text-editor-wrapper .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
