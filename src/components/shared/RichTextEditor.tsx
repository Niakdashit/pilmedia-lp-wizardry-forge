import React, { useEffect, useMemo, useRef, useState } from 'react';

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

// Lightweight contentEditable-based editor with a minimal toolbar.
// Uses document.execCommand for broad compatibility without adding deps.
const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const suppressSyncRef = useRef(false);
  const lastRangeRef = useRef<Range | null>(null);
  const wasFocusedRef = useRef(false);
  const composingRef = useRef(false);
  const [showSource, setShowSource] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [localHtml, setLocalHtml] = useState<string>(value || '');

  // Refocus if a parent re-render stole the focus
  useEffect(() => {
    if (!ref.current) return;
    if (!wasFocusedRef.current) return;
    if (document.activeElement !== ref.current) {
      requestAnimationFrame(() => {
        ref.current?.focus();
        const sel = window.getSelection?.();
        if (sel && lastRangeRef.current) {
          try {
            sel.removeAllRanges();
            sel.addRange(lastRangeRef.current);
          } catch {}
        }
      });
    }
  });

  useEffect(() => {
    if (!ref.current) return;
    if (suppressSyncRef.current || wasFocusedRef.current) return; // don't override during local edits
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
      setLocalHtml(value || '');
    }
    // If it was focused before update, try to refocus and restore selection
    if (wasFocusedRef.current) {
      requestAnimationFrame(() => {
        ref.current?.focus();
        const sel = window.getSelection?.();
        if (sel && lastRangeRef.current) {
          sel.removeAllRanges();
          sel.addRange(lastRangeRef.current);
        }
      });
    }
  }, [value]);

  const apply = (cmd: string, arg?: string) => {
    suppressSyncRef.current = true;
    document.execCommand(cmd, false, arg);
    if (ref.current) {
      const html = ref.current.innerHTML;
      requestAnimationFrame(() => {
        onChange(html);
        suppressSyncRef.current = false;
      });
    } else {
      requestAnimationFrame(() => { suppressSyncRef.current = false; });
    }
  };

  const blockFormats = useMemo(() => (
    [
      { label: 'Paragraphe', tag: 'P' },
      { label: 'Titre 1', tag: 'H1' },
      { label: 'Titre 2', tag: 'H2' },
      { label: 'Titre 3', tag: 'H3' },
    ]
  ), []);

  const onInput = (e?: React.FormEvent<HTMLDivElement>) => {
    suppressSyncRef.current = true;
    if (ref.current) {
      if (!composingRef.current) {
        const html = ref.current.innerHTML;
        setLocalHtml(html);
      }
      // Save current selection range
      const sel = window.getSelection?.();
      if (sel && sel.rangeCount > 0) {
        try { lastRangeRef.current = sel.getRangeAt(0).cloneRange(); } catch {}
      }
      // Ensure the editor keeps focus
      if (document.activeElement !== ref.current) {
        requestAnimationFrame(() => {
          ref.current?.focus();
          const s = window.getSelection?.();
          if (s && lastRangeRef.current) {
            try { s.removeAllRanges(); s.addRange(lastRangeRef.current); } catch {}
          }
        });
      }
    }
    requestAnimationFrame(() => { suppressSyncRef.current = false; });
  };

  const applyFont = (family: string) => {
    suppressSyncRef.current = true;
    document.execCommand('fontName', false, family);
    if (ref.current) {
      const html = ref.current.innerHTML;
      setLocalHtml(html);
    }
    requestAnimationFrame(() => { suppressSyncRef.current = false; });
  };

  const applyColor = (color: string) => {
    suppressSyncRef.current = true;
    document.execCommand('foreColor', false, color);
    if (ref.current) {
      const html = ref.current.innerHTML;
      setLocalHtml(html);
    }
    requestAnimationFrame(() => { suppressSyncRef.current = false; });
  };

  const insertCodeBlock = () => {
    suppressSyncRef.current = true;
    // Prefer PRE block for code
    document.execCommand('formatBlock', false, 'pre');
    if (ref.current) {
      const html = ref.current.innerHTML;
      setLocalHtml(html);
    }
    requestAnimationFrame(() => { suppressSyncRef.current = false; });
  };

  const insertImage = () => {
    const url = prompt('URL de l’image:');
    if (url) {
      suppressSyncRef.current = true;
      document.execCommand('insertImage', false, url);
      if (ref.current) {
        const html = ref.current.innerHTML;
        setLocalHtml(html);
      }
      requestAnimationFrame(() => { suppressSyncRef.current = false; });
    }
  };

  const insertTable = () => {
    suppressSyncRef.current = true;
    const htmlTable = '<table style="width:100%;border-collapse:collapse" border="1"><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>';
    document.execCommand('insertHTML', false, htmlTable);
    if (ref.current) {
      const html = ref.current.innerHTML;
      setLocalHtml(html);
    }
    requestAnimationFrame(() => { suppressSyncRef.current = false; });
  };

  const insertHR = () => {
    suppressSyncRef.current = true;
    document.execCommand('insertHorizontalRule');
    if (ref.current) {
      const html = ref.current.innerHTML;
      setLocalHtml(html);
    }
    requestAnimationFrame(() => { suppressSyncRef.current = false; });
  };

  // Simple inline SVG icons
  const iconCls = 'w-4 h-4 text-gray-700';
  const BoldIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 12a4 4 0 0 0 0-8H7v16h8a4 4 0 0 0 0-8H7"/></svg>
  );
  const ItalicIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
  );
  const UnderlineIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v6a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
  );
  const StrikeIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 5.5a6 6 0 0 0-8 0"/><path d="M12 12c-4.5 0-6 2-6 4a4 4 0 0 0 4 4h4a4 4 0 0 0 3.7-2.5"/><line x1="4" y1="12" x2="20" y2="12"/></svg>
  );
  const OrderedListIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M3 6h1v4"/><path d="M4 18h-1l2-3h-2"/></svg>
  );
  const UnorderedListIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="6" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="18" r="1"/><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/></svg>
  );
  const OutdentIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="10" y2="6"/><line x1="21" y1="12" x2="10" y2="12"/><line x1="21" y1="18" x2="10" y2="18"/><polyline points="7 8 3 12 7 16"/></svg>
  );
  const IndentIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="14" y1="6" x2="21" y2="6"/><line x1="14" y1="12" x2="21" y2="12"/><line x1="14" y1="18" x2="21" y2="18"/><polyline points="3 8 7 12 3 16"/><line x1="9" y1="6" x2="9" y2="6"/></svg>
  );
  const AlignLeftIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  );
  const AlignCenterIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  );
  const AlignRightIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  );
  const JustifyIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  );
  const LinkIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 1 7 0l1 1a5 5 0 0 1 0 7 5 5 0 0 1-7 0l-1-1"/><path d="M14 11a5 5 0 0 1-7 0l-1-1a5 5 0 0 1 0-7 5 5 0 0 1 7 0l1 1"/></svg>
  );
  const UnlinkIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7l-1-1a5 5 0 0 0-7 0l-1 1a5 5 0 0 0 0 7l1 1"/><path d="M7 17l1 1a5 5 0 0 0 7 0l1-1a5 5 0 0 0 0-7l-1-1"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
  );
  const CodeIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  );
  const ImageIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
  );
  const TableIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
  );
  const HrIcon = () => (
    <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/></svg>
  );

  return (
    <div className={className}>
      <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 px-2 py-1 bg-gray-100 border-b border-gray-300 relative">
          <select
            onChange={(e) => apply('formatBlock', e.target.value)}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded"
            defaultValue="P"
            aria-label="Format"
          >
            {blockFormats.map(f => (
              <option key={f.tag} value={f.tag}>{f.label}</option>
            ))}
          </select>

          {/* Font/Color dropdown A▾ */}
          <div className="relative">
            <button type="button" className="rte-btn" title="Police / Couleur" aria-label="Police / Couleur" onMouseDown={(e)=>e.preventDefault()} onClick={() => setShowStyleMenu(s => !s)}>A▾</button>
            {showStyleMenu && (
              <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-300 rounded shadow p-2" onMouseLeave={() => setShowStyleMenu(false)}>
                <div className="mb-2">
                  <label className="block text-xs text-gray-500 mb-1">Police</label>
                  <select className="w-full px-2 py-1 text-sm border border-gray-300 rounded" onChange={(e)=>applyFont(e.target.value)} defaultValue="">
                    <option value="" disabled>Choisir…</option>
                    <option value="inherit">Par défaut</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Monaco">Monaco</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Couleur du texte</label>
                  <input type="color" className="w-full h-8 border border-gray-300 rounded" onChange={(e)=>applyColor(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <button type="button" className="rte-btn" title="Gras" aria-label="Gras" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('bold')}><BoldIcon/></button>
          <button type="button" className="rte-btn" title="Italique" aria-label="Italique" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('italic')}><ItalicIcon/></button>
          <button type="button" className="rte-btn" title="Souligné" aria-label="Souligné" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('underline')}><UnderlineIcon/></button>
          <button type="button" className="rte-btn" title="Barré" aria-label="Barré" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('strikeThrough')}><StrikeIcon/></button>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <button type="button" className="rte-btn" title="Liste numérotée" aria-label="Liste numérotée" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('insertOrderedList')}><OrderedListIcon/></button>
          <button type="button" className="rte-btn" title="Liste à puces" aria-label="Liste à puces" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('insertUnorderedList')}><UnorderedListIcon/></button>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <button type="button" className="rte-btn" title="Diminuer le retrait" aria-label="Diminuer le retrait" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('outdent')}><OutdentIcon/></button>
          <button type="button" className="rte-btn" title="Augmenter le retrait" aria-label="Augmenter le retrait" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('indent')}><IndentIcon/></button>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <button type="button" className="rte-btn" title="Aligner à gauche" aria-label="Aligner à gauche" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('justifyLeft')}><AlignLeftIcon/></button>
          <button type="button" className="rte-btn" title="Centrer" aria-label="Centrer" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('justifyCenter')}><AlignCenterIcon/></button>
          <button type="button" className="rte-btn" title="Aligner à droite" aria-label="Aligner à droite" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('justifyRight')}><AlignRightIcon/></button>
          <button type="button" className="rte-btn" title="Justifier" aria-label="Justifier" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('justifyFull')}><JustifyIcon/></button>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <button type="button" className="rte-btn" title="Insérer un lien" aria-label="Insérer un lien" onMouseDown={(e)=>e.preventDefault()} onClick={() => { const url = prompt('Lien URL:'); if (url) apply('createLink', url); }}><LinkIcon/></button>
          <button type="button" className="rte-btn" title="Supprimer le lien" aria-label="Supprimer le lien" onMouseDown={(e)=>e.preventDefault()} onClick={() => apply('unlink')}><UnlinkIcon/></button>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <button type="button" className="rte-btn" title="Insérer un bloc de code" aria-label="Insérer un bloc de code" onMouseDown={(e)=>e.preventDefault()} onClick={insertCodeBlock}><CodeIcon/></button>
          <button type="button" className="rte-btn" title="Insérer une image" aria-label="Insérer une image" onMouseDown={(e)=>e.preventDefault()} onClick={insertImage}><ImageIcon/></button>
          <button type="button" className="rte-btn" title="Insérer un tableau" aria-label="Insérer un tableau" onMouseDown={(e)=>e.preventDefault()} onClick={insertTable}><TableIcon/></button>
          <button type="button" className="rte-btn" title="Insérer une ligne horizontale" aria-label="Insérer une ligne horizontale" onMouseDown={(e)=>e.preventDefault()} onClick={insertHR}><HrIcon/></button>
          <div className="ml-auto">
            <button type="button" className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50" onClick={() => setShowSource(s => !s)}>
              Source
            </button>
          </div>
        </div>

        {/* Editor area or source */}
        {!showSource ? (
          <div
            ref={ref}
            onInput={onInput}
            onBeforeInput={() => {
              // Capture selection as early as possible
              const sel = window.getSelection?.();
              if (sel && sel.rangeCount > 0) {
                try { lastRangeRef.current = sel.getRangeAt(0).cloneRange(); } catch {}
              }
              suppressSyncRef.current = true;
            }}
            onKeyDown={() => {
              const sel = window.getSelection?.();
              if (sel && sel.rangeCount > 0) {
                try { lastRangeRef.current = sel.getRangeAt(0).cloneRange(); } catch {}
              }
              suppressSyncRef.current = true;
            }}
            onCompositionStart={() => { composingRef.current = true; suppressSyncRef.current = true; }}
            onCompositionEnd={() => {
              composingRef.current = false;
              // flush value at composition end
              if (ref.current) onChange(ref.current.innerHTML);
              requestAnimationFrame(() => { suppressSyncRef.current = false; });
            }}
            contentEditable={true}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            tabIndex={0}
            spellCheck={true}
            onClick={() => ref.current?.focus()}
            onFocus={() => {
              wasFocusedRef.current = true;
              suppressSyncRef.current = true;
              // restore selection if we have one
              const sel = window.getSelection?.();
              if (sel && lastRangeRef.current) {
                try {
                  sel.removeAllRanges();
                  sel.addRange(lastRangeRef.current);
                } catch {}
              }
              // Ensure the DOM shows localHtml while focused
              if (ref.current && ref.current.innerHTML !== localHtml) {
                ref.current.innerHTML = localHtml;
              }
            }}
            onBlur={(e) => {
              e.stopPropagation();
              // Immediately refocus to avoid unwanted blur during typing
              // Flush localHtml to parent on real blur
              onChange(localHtml);
              wasFocusedRef.current = false;
              requestAnimationFrame(() => { suppressSyncRef.current = false; });
            }}
            className="min-h-[240px] p-3 bg-white focus:outline-none prose max-w-none whitespace-pre-wrap"
            data-placeholder={placeholder || ''}
          />
        ) : (
          <textarea
            className="min-h-[240px] w-full p-3 font-mono text-xs outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {/* Footer pills */}
        <div className="flex items-center justify-end gap-2 px-2 py-1 bg-gray-100 border-t border-gray-300">
          <button type="button" className="px-3 py-1 text-xs rounded-full border border-gray-300 bg-white text-gray-700">Tags</button>
          <button type="button" className="px-3 py-1 text-xs rounded-full border border-gray-300 bg-white text-gray-700">{`{ }`} Variables dynamiques</button>
        </div>
      </div>
      <style>{`
        .rte-btn { display:inline-flex; align-items:center; justify-content:center; padding: 0.25rem 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background: #fff; font-size: 0.875rem; line-height: 1.25rem; }
        .rte-btn:hover { background: #f3f4f6; }
        [contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #9ca3af; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
