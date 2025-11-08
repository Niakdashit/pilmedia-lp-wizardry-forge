import React, { useState, useRef, useEffect } from 'react';

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
  // Color picker for foreColor command
  const colorInputRef = useRef<HTMLInputElement>(null);

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
      document.getSelection()?.selectAllChildren(wysiwygRef.current);
    }
  }, [isEditing]);

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

  // After content updates, restore caret to previous position to avoid jump
  useEffect(() => {
    if (isSourceMode) return;
    // Only if the editor is focused
    if (document.activeElement === wysiwygRef.current) {
      setTimeout(() => restoreWysiwygSelection(), 0);
    }
  }, [localCombined, isSourceMode]);

  // Initialize WYSIWYG content when switching from source → wysiwyg
  useEffect(() => {
    if (!isSourceMode && wysiwygRef.current) {
      const bodyHtml = splitHtmlTitleBody(localCombined || '').bodyHtml || '';
      // Only set if different to avoid wiping caret
      if (wysiwygRef.current.innerHTML !== bodyHtml) {
        wysiwygRef.current.innerHTML = bodyHtml;
      }
    }
  }, [isSourceMode]);

  const handleDoubleClick = () => {};

  const handleCombinedKeyDown = (_e: React.KeyboardEvent) => {};

  const applyExec = (cmd: string, value?: string) => {
    try {
      if (!isSourceMode) {
        // Make sure the editor has focus so execCommand applies
        if (wysiwygRef.current) wysiwygRef.current.focus();
        restoreWysiwygSelection();
      }
      document.execCommand(cmd, false, value);
      if (wysiwygRef.current) {
        const body = wysiwygRef.current.innerHTML;
        const { titleText: currentTitle } = splitHtmlTitleBody(localCombined || '');
        const merged = (currentTitle ? `<p>${escapeHtml(currentTitle)}</p>` : '') + body;
        setLocalCombined(merged);
        onTitleChange && onTitleChange(currentTitle);
        onDescriptionChange && onDescriptionChange(body);
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
    setLocalCombined(next);
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
  const ensureEditorHasBlock = () => {
    if (!wysiwygRef.current) return;
    const html = (wysiwygRef.current.innerHTML || '').trim();
    if (html === '' || html === '<br>' || html === '<br/>' || html === '<p><br></p>') {
      wysiwygRef.current.innerHTML = '<p><br></p>';
      const range = document.createRange();
      range.selectNodeContents(wysiwygRef.current);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const handleOrderedList = () => {
    if (isSourceMode) return wrapSelectionInSource('<ol><li>', '</li></ol>');
    if (!wysiwygRef.current) return;
    
    wysiwygRef.current.focus();
    ensureEditorHasBlock();
    
    // Try execCommand first
    try {
      document.execCommand('insertOrderedList', false);
    } catch {
      // Direct DOM manipulation fallback
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parentElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement;
      
      // Check if already in a list
      const existingList = parentElement?.closest('ol, ul');
      if (existingList) {
        // Remove list formatting
        const items = Array.from(existingList.querySelectorAll('li'));
        const textContent = items.map(li => li.textContent).join('\n');
        const p = document.createElement('p');
        p.textContent = textContent;
        existingList.replaceWith(p);
      } else {
        // Create new ordered list
        const ol = document.createElement('ol');
        const li = document.createElement('li');
        
        if (range.toString()) {
          li.textContent = range.toString();
          range.deleteContents();
        } else {
          li.innerHTML = '<br>';
        }
        
        ol.appendChild(li);
        range.insertNode(ol);
        
        // Move cursor to end of list item
        const newRange = document.createRange();
        newRange.setStart(li, li.childNodes.length);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
    
    // Persist state
    setTimeout(() => {
      if (!wysiwygRef.current) return;
      const body = wysiwygRef.current.innerHTML;
      const { titleText: currentTitle } = splitHtmlTitleBody(localCombined || '');
      const merged = (currentTitle ? `<p>${escapeHtml(currentTitle)}</p>` : '') + body;
      setLocalCombined(merged);
      onTitleChange && onTitleChange(currentTitle);
      onDescriptionChange && onDescriptionChange(body);
    }, 0);
  };

  const handleUnorderedList = () => {
    if (isSourceMode) return wrapSelectionInSource('<ul><li>', '</li></ul>');
    if (!wysiwygRef.current) return;
    
    wysiwygRef.current.focus();
    ensureEditorHasBlock();
    
    // Try execCommand first
    try {
      document.execCommand('insertUnorderedList', false);
    } catch {
      // Direct DOM manipulation fallback
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parentElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement;
      
      // Check if already in a list
      const existingList = parentElement?.closest('ol, ul');
      if (existingList) {
        // Remove list formatting
        const items = Array.from(existingList.querySelectorAll('li'));
        const textContent = items.map(li => li.textContent).join('\n');
        const p = document.createElement('p');
        p.textContent = textContent;
        existingList.replaceWith(p);
      } else {
        // Create new unordered list
        const ul = document.createElement('ul');
        const li = document.createElement('li');
        
        if (range.toString()) {
          li.textContent = range.toString();
          range.deleteContents();
        } else {
          li.innerHTML = '<br>';
        }
        
        ul.appendChild(li);
        range.insertNode(ul);
        
        // Move cursor to end of list item
        const newRange = document.createRange();
        newRange.setStart(li, li.childNodes.length);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
    
    // Persist state
    setTimeout(() => {
      if (!wysiwygRef.current) return;
      const body = wysiwygRef.current.innerHTML;
      const { titleText: currentTitle } = splitHtmlTitleBody(localCombined || '');
      const merged = (currentTitle ? `<p>${escapeHtml(currentTitle)}</p>` : '') + body;
      setLocalCombined(merged);
      onTitleChange && onTitleChange(currentTitle);
      onDescriptionChange && onDescriptionChange(body);
    }, 0);
  };
  const handleForeColor = (color?: string) => {
    const c = color || colorInputRef.current?.value || '#000000';
    if (isSourceMode) wrapSelectionInSource(`<span style=\"color:${c}\">`, '</span>');
    else applyExec('foreColor', c);
  };
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
  const handleTable = () => {
    const html = '<table style="width:100%;border-collapse:collapse"><tr><th>Col 1</th><th>Col 2</th></tr><tr><td> </td><td> </td></tr></table>';
    if (isSourceMode) wrapSelectionInSource(html, '');
    else if (wysiwygRef.current) {
      wysiwygRef.current.focus();
      applyExec('insertHTML', html as any);
    }
  };
  const handleFormat = (tag: 'p'|'h1'|'h2') => {
    if (isSourceMode) wrapSelectionInSource(`<${tag}>`, `</${tag}>`);
    else applyExec('formatBlock', tag);
  };

  return (
    <div 
      className={`article-text-content py-8 px-6 ${className}`}
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div className="relative group">
        {isEditing && (
          <div className="mb-3 flex items-center gap-0.5 bg-white border border-gray-300 rounded p-1.5">
            <select
              className="px-3 py-1.5 text-sm bg-white border-r border-gray-300 hover:bg-gray-50 focus:outline-none cursor-pointer"
              onChange={(e) => handleFormat(e.target.value as any)}
              defaultValue=""
            >
              <option value="" disabled>Format</option>
              <option value="p">Paragraphe</option>
              <option value="h1">Titre 1</option>
              <option value="h2">Titre 2</option>
            </select>
            {/* Color picker button A ▾ */}
            <input ref={colorInputRef} type="color" defaultValue="#111111" className="hidden" onChange={() => handleForeColor()} />
            <button
              className="w-12 h-8 flex items-center justify-center gap-1 border-r border-gray-300 hover:bg-gray-100"
              onMouseDown={(e)=>e.preventDefault()}
              onClick={() => colorInputRef.current?.click()}
              title="Couleur du texte"
            >
              <span className="font-semibold text-sm">A</span>
              <span className="inline-block w-3 h-3 bg-black border border-gray-400"></span>
              <span className="text-xs">▾</span>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleBold} title="Gras">
              <span className="font-bold text-base">B</span>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleItalic} title="Italique">
              <span className="italic font-serif text-base">I</span>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleUnderline} title="Souligné">
              <span className="underline text-base">U</span>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleSubscript} title="Indice">
              <span className="text-sm">x₂</span>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleOrderedList} title="Liste numérotée">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <text x="1" y="6" fontSize="5" fontWeight="bold">1.</text>
                <path d="M7 4h11v1.5H7V4z"/>
                <text x="1" y="11" fontSize="5" fontWeight="bold">2.</text>
                <path d="M7 9.5h11V11H7V9.5z"/>
                <text x="1" y="16" fontSize="5" fontWeight="bold">3.</text>
                <path d="M7 15h11v1.5H7V15z"/>
              </svg>
            </button>
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleUnorderedList} title="Liste à puces">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 5h10v2H7V5zm0 5h10v2H7v-2zm0 5h10v2H7v-2z"/>
                <circle cx="4" cy="6" r="1.5" />
                <circle cx="4" cy="11" r="1.5" />
                <circle cx="4" cy="16" r="1.5" />
              </svg>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={() => handleAlign('left')} title="Aligner à gauche">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm0 4h10v2H3V8zm0 4h14v2H3v-2zm0 4h10v2H3v-2z"/></svg>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={() => handleAlign('center')} title="Centrer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm2 4h10v2H5V8zm-2 4h14v2H3v-2zm2 4h10v2H5v-2z"/></svg>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={() => handleAlign('right')} title="Aligner à droite">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm4 4h10v2H7V8zm-4 4h14v2H3v-2zm4 4h10v2H7v-2z"/></svg>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={() => handleAlign('justify')} title="Justifier">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm0 4h14v2H3V8zm0 4h14v2H3v-2zm0 4h14v2H3v-2z"/></svg>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleLink} title="Insérer un lien">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/></svg>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleUnlink} title="Supprimer le lien">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                <path d="M8 5l-3 3 3 3M12 5l3 3-3 3"/>
                <line x1="3" y1="3" x2="17" y2="17" stroke="red" strokeWidth="2"/>
              </svg>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleImage} title="Insérer une image">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>
            </button>
            
            <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={(e)=>e.preventDefault()} onClick={handleTable} title="Insérer un tableau">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20" strokeWidth="1.5">
                <rect x="2" y="2" width="16" height="16" rx="1"/>
                <line x1="2" y1="8" x2="18" y2="8"/>
                <line x1="2" y1="14" x2="18" y2="14"/>
                <line x1="10" y1="2" x2="10" y2="18"/>
              </svg>
            </button>
            
            <button className="px-3 py-1.5 text-sm hover:bg-gray-50 ml-auto" onClick={() => setIsSourceMode((v) => !v)}>
              Source
            </button>
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
                className={`w-full text-base text-gray-700 leading-relaxed bg-white border-2 border-[#E0004D] rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#E0004D] focus:ring-opacity-50 text-left ${descriptionClassName}`}
                dir="ltr"
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
                  const { titleText } = splitHtmlTitleBody(localCombined || '');
                  const merged = titleText ? `<p>${titleText}</p>${newBody}` : newBody;
                  // Update external state for persistence, but do not control innerHTML via React
                  setLocalCombined(merged);
                  onTitleChange && onTitleChange(titleText);
                  onDescriptionChange && onDescriptionChange(newBody);
                }}
                className={`w-full min-h-[220px] text-base text-gray-700 leading-relaxed bg-white border-2 border-[#E0004D] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E0004D] focus:ring-opacity-50 text-left ${descriptionClassName}`}
                dir="ltr"
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
