import React, { useState, useRef, useEffect, useCallback } from 'react';
import RichTextToolbar from './RichTextToolbar';

interface EditableTextProps {
  title?: string;
  description?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  editable?: boolean;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  maxWidth?: number;
}

/**
 * EditableText - Texte descriptif éditable (titre + description)
 * 
 * Caractéristiques:
 * - Édition inline au double-clic
 * - Styles repris du thème typographique de l'éditeur
 * - Sauvegarde dans le store de campagne
 * - Placé directement sous la bannière
 */
const EditableText: React.FC<EditableTextProps> = ({
  title = 'Titre de votre article',
  description = 'Décrivez votre contenu ici...',
  onTitleChange,
  onDescriptionChange,
  editable = true,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  maxWidth = 810,
}) => {
  const isEditing = true;
  const [localCombined, setLocalCombined] = useState<string>('');
  
  const combinedRef = useRef<HTMLTextAreaElement>(null);
  const wysiwygRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState<boolean>(false);
  // Cache selection for WYSIWYG (contentEditable)
  const savedRangeRef = useRef<Range | null>(null);
  // Cache selection for Source (textarea)
  const savedTextSelectionRef = useRef<{ start: number; end: number } | null>(null);
  // Debounce timer for input updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update to prevent cursor jumping
  const debouncedUpdate = useCallback((newContent: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const { titleText, bodyHtml } = splitHtmlTitleBody(newContent || '');
      setLocalCombined(newContent);
      onTitleChange && onTitleChange(titleText);
      onDescriptionChange && onDescriptionChange(bodyHtml);
    }, 150); // 150ms debounce
  }, [onTitleChange, onDescriptionChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Helper: escape text for HTML
  const escapeHtml = (t: string) => t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Sync avec les props externes (always compose as HTML <p>title</p> + bodyHtml)
  useEffect(() => {
    const safeTitle = title ? `<p>${escapeHtml(title)}</p>` : '';
    const body = description || '';
    setLocalCombined(`${safeTitle}${body}`);
    // Si on est en mode WYSIWYG, pousser dans le DOM sans casser le caret
    try {
      if (wysiwygRef.current && !isSourceMode) {
        const { bodyHtml } = splitHtmlTitleBody(`${safeTitle}${body}`);
        wysiwygRef.current.innerHTML = bodyHtml || '';
      }
    } catch {}
  }, [title, description]);

  // Helper: split HTML into first block (title text) and remaining HTML (body)
  const splitHtmlTitleBody = (html: string): { titleText: string; bodyHtml: string } => {
    try {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html || '';
      // If wrapper has no element yet but only text, browser usually wraps as text node; normalize
      const nodes = Array.from(wrapper.childNodes);
      let firstIndex = -1;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const txt = (n.textContent || '').trim();
        if (txt.length > 0) { firstIndex = i; break; }
      }
      if (firstIndex === -1) return { titleText: '', bodyHtml: html || '' };
      const firstNode = nodes[firstIndex];
      let titleText = (firstNode.textContent || '').trim();
      // Remove only the first node from body
      wrapper.removeChild(firstNode);
      return { titleText, bodyHtml: wrapper.innerHTML };
    } catch {
      return { titleText: '', bodyHtml: html || '' };
    }
  };

  // Focus automatique lors de l'édition
  useEffect(() => {
    if (!isEditing) return;
    if (isSourceMode) {
      if (combinedRef.current) {
        combinedRef.current.focus();
        combinedRef.current.select();
      }
    } else if (wysiwygRef.current) {
      wysiwygRef.current.focus();
    }
  }, [isEditing]);

  // Lorsque l'on bascule en WYSIWYG, réinjecter le body courant dans le DOM
  useEffect(() => {
    if (!isSourceMode && wysiwygRef.current) {
      try {
        const { bodyHtml } = splitHtmlTitleBody(localCombined || '');
        wysiwygRef.current.innerHTML = bodyHtml || '';
      } catch {}
    }
  }, [isSourceMode]);

  // Track selection changes for WYSIWYG to keep current Range
  useEffect(() => {
    const handleSelectionChange = () => {
      try {
        const sel = document.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        // Only save if selection is inside our editor
        if (wysiwygRef.current && wysiwygRef.current.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range.cloneRange();
        }
      } catch {}
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const restoreWysiwygSelection = () => {
    try {
      if (!wysiwygRef.current) return;
      const sel = document.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      if (savedRangeRef.current) {
        sel.addRange(savedRangeRef.current);
      } else {
        const range = document.createRange();
        range.selectNodeContents(wysiwygRef.current);
        range.collapse(false);
        sel.addRange(range);
      }
    } catch {}
  };

  const handleDoubleClick = () => {};

  const handleCombinedKeyDown = (_e: React.KeyboardEvent) => {};

  const applyExec = (cmd: string, value?: string) => {
    try {
      if (!isSourceMode) restoreWysiwygSelection();
      const success = document.execCommand(cmd, false, value);
      if (success && wysiwygRef.current) {
        const body = wysiwygRef.current.innerHTML;
        const { titleText: currentTitle } = splitHtmlTitleBody(localCombined || '');
        const merged = (currentTitle ? `<p>${escapeHtml(currentTitle)}</p>` : '') + body;
        // Use debounced update for toolbar actions too
        debouncedUpdate(merged);
      }
    } catch {}
  };

  const wrapSelectionInSource = (before: string, after: string = before) => {
    const ta = combinedRef.current;
    if (!ta) return;
    // restore last known selection if current selection collapsed due to toolbar click
    if (savedTextSelectionRef.current) {
      ta.focus();
      ta.setSelectionRange(savedTextSelectionRef.current.start, savedTextSelectionRef.current.end);
    }
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const val = ta.value;
    const selected = val.substring(start, end);
    const next = val.substring(0, start) + before + selected + after + val.substring(end);
    // Use debounced update for source mode too
    debouncedUpdate(next);
    setTimeout(() => {
      ta.focus();
      const pos = start + before.length + selected.length + after.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleBold = () => (isSourceMode ? wrapSelectionInSource('<b>', '</b>') : applyExec('bold'));
  const handleItalic = () => (isSourceMode ? wrapSelectionInSource('<i>', '</i>') : applyExec('italic'));
  const handleUnderline = () => (isSourceMode ? wrapSelectionInSource('<u>', '</u>') : applyExec('underline'));
  const handleSubscript = () => (isSourceMode ? wrapSelectionInSource('<sub>', '</sub>') : applyExec('subscript'));
  const handleOrderedList = () => (isSourceMode ? wrapSelectionInSource('<ol><li>', '</li></ol>') : applyExec('insertOrderedList'));
  const handleUnorderedList = () => (isSourceMode ? wrapSelectionInSource('<ul><li>', '</li></ul>') : applyExec('insertUnorderedList'));
  const handleTextColor = (hex: string) => (
    isSourceMode ? wrapSelectionInSource(`<span style="color:${hex}">`, '</span>') : applyExec('foreColor', hex)
  );
  const handleAlign = (align: 'left'|'center'|'right'|'justify') => (
    isSourceMode ? wrapSelectionInSource(`<div style="text-align:${align}">`, '</div>') : applyExec(`justify${align === 'left' ? 'Left' : align === 'right' ? 'Right' : align === 'center' ? 'Center' : 'Full'}`)
  );
  const handleLink = () => {
    const url = prompt('URL du lien:') || '';
    if (!url) return;
    if (isSourceMode) wrapSelectionInSource(`<a href="${url}">`, '</a>');
    else applyExec('createLink', url);
  };
  const handleUnlink = () => (isSourceMode ? wrapSelectionInSource('', '') : applyExec('unlink'));
  const handleImage = () => {
    const src = prompt('URL de l\'image:') || '';
    if (!src) return;
    if (isSourceMode) wrapSelectionInSource(`<img src="${src}" alt="" />`, '');
    else applyExec('insertImage', src);
  };
  const handleFormat = (tag: 'p'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6') => {
    if (isSourceMode) {
      wrapSelectionInSource(`<${tag}>`, `</${tag}>`);
    } else {
      try {
        // Ensure the editor has focus
        if (wysiwygRef.current) {
          wysiwygRef.current.focus();
        }
        
        // Restore selection if we have one saved
        restoreWysiwygSelection();
        
        // Apply the format
        const success = document.execCommand('formatBlock', false, `<${tag}>`);
        
        if (success && wysiwygRef.current) {
          const body = wysiwygRef.current.innerHTML;
          const { titleText: currentTitle } = splitHtmlTitleBody(localCombined || '');
          const merged = (currentTitle ? `<p>${escapeHtml(currentTitle)}</p>` : '') + body;
          // Use debounced update for format actions too
          debouncedUpdate(merged);
        }
      } catch (e) {
        console.error('Format error:', e);
      }
    }
  };

  return (
    <div 
      className={`article-text-content py-8 px-6 ${className}`}
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div className="relative group">
        {isEditing && (
          <div className="mb-2">
            <RichTextToolbar
              onFormat={handleFormat}
              onBold={handleBold}
              onItalic={handleItalic}
              onUnderline={handleUnderline}
              onSubscript={handleSubscript}
              onOrderedList={handleOrderedList}
              onUnorderedList={handleUnorderedList}
              onTextColor={handleTextColor}
              onAlignLeft={() => handleAlign('left')}
              onAlignCenter={() => handleAlign('center')}
              onAlignRight={() => handleAlign('right')}
              onAlignJustify={() => handleAlign('justify')}
              onLink={handleLink}
              onUnlink={handleUnlink}
              onImage={handleImage}
              onSpecialChar={() => {}}
              onToggleSource={() => setIsSourceMode((v) => !v)}
              isSourceMode={isSourceMode}
            />
          </div>
        )}
        {isEditing ? (
          <div className="relative">
            {isSourceMode ? (
              <textarea
                ref={combinedRef}
                value={localCombined}
                onChange={(e) => {
                  const html = e.target.value;
                  setLocalCombined(html);
                  const { titleText, bodyHtml } = splitHtmlTitleBody(html || '');
                  onTitleChange && onTitleChange(titleText);
                  onDescriptionChange && onDescriptionChange(bodyHtml);
                }}
                onSelect={() => {
                  const ta = combinedRef.current;
                  if (!ta) return;
                  savedTextSelectionRef.current = { start: ta.selectionStart ?? 0, end: ta.selectionEnd ?? 0 };
                }}
                onKeyUp={() => {
                  const ta = combinedRef.current;
                  if (!ta) return;
                  savedTextSelectionRef.current = { start: ta.selectionStart ?? 0, end: ta.selectionEnd ?? 0 };
                }}
                onMouseUp={() => {
                  const ta = combinedRef.current;
                  if (!ta) return;
                  savedTextSelectionRef.current = { start: ta.selectionStart ?? 0, end: ta.selectionEnd ?? 0 };
                }}
                onKeyDown={handleCombinedKeyDown}
                className={`w-full text-base text-gray-700 leading-relaxed bg-white border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:ring-opacity-50 ${descriptionClassName}`}
                rows={10}
                placeholder="Titre sur la première ligne, puis votre description..."
              />
            ) : (
              <div
                ref={wysiwygRef as any}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  const newBody = (e.target as HTMLDivElement).innerHTML;
                  // Conserver le titre courant, mettre à jour l'état sans re-render le contenu DOM
                  const { titleText } = splitHtmlTitleBody(localCombined || '');
                  const merged = titleText ? `<p>${escapeHtml(titleText)}</p>${newBody}` : newBody;
                  setLocalCombined(merged);
                  onTitleChange && onTitleChange(titleText);
                  onDescriptionChange && onDescriptionChange(newBody);
                }}
                className={`w-full min-h-[220px] text-base text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:ring-opacity-50 ${descriptionClassName}`}
              />
            )}
            {/* No save/cancel buttons in always-on edit mode */}
          </div>
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className={`relative ${editable ? 'cursor-pointer' : ''}`}
          >
            {(() => {
              const { titleText, bodyHtml } = splitHtmlTitleBody(localCombined || '');
              return (
                <>
                  <h1 className={`text-3xl font-bold text-gray-900 leading-tight mb-3 ${titleClassName}`}>{titleText || 'Titre de votre article'}</h1>
                  <div className={`text-base text-gray-700 leading-relaxed ${descriptionClassName}`} dangerouslySetInnerHTML={{ __html: bodyHtml || 'Décrivez votre contenu ici...' }} />
                </>
              );
            })()}
          </div>
        )}
      </div>

      {editable && !isEditing && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          💡 Double-cliquez pour éditer le titre et la description dans une seule zone
        </p>
      )}
    </div>
  );
};

export default EditableText;
