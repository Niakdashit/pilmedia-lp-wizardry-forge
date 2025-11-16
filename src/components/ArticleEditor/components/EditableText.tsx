import React, { useState, useRef, useEffect, useCallback } from 'react';

interface EditableTextProps {
  title?: string;
  description?: string;
  htmlContent?: string; // Add this to store full HTML
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  onHtmlContentChange?: (html: string) => void; // Add this callback
  editable?: boolean;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  maxWidth?: number;
  compact?: boolean;
  defaultAlign?: 'left' | 'center' | 'right';
}

const EditableText: React.FC<EditableTextProps> = ({
  title = '',
  description = 'Décrivez votre contenu ici...',
  htmlContent: propHtmlContent,
  onTitleChange,
  onDescriptionChange,
  onHtmlContentChange,
  editable = true,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  maxWidth = 810,
  compact = false,
  defaultAlign = 'center',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isInitializedRef = useRef(false);
  // Track the last propHtmlContent value that has been applied to the editor
  const lastSyncedPropHtmlRef = useRef<string | undefined>(undefined);
  
  // Initialize htmlContent ONCE with proper default
  // CRITICAL: Only depend on propHtmlContent to avoid regenerating HTML when description changes
  const getInitialContent = useCallback(() => {
    // ALWAYS prioritize propHtmlContent if it exists
    if (propHtmlContent && propHtmlContent.trim().length > 0) {
      return propHtmlContent;
    }
    // Only generate HTML from description on first mount when no propHtmlContent exists
    const contentTitle = title || '';
    const contentDescription = description || 'Décrivez votre contenu ici...';
    const align = defaultAlign || 'center';
    return `<h2>${contentTitle}</h2><p style="font-weight:500; text-align:${align}">${contentDescription.replace(/\n/g, `</p><p style=\"font-weight:500; text-align:${align}\">`)}</p>`;
  }, [propHtmlContent, title, description, defaultAlign]);
  
  const [htmlContent, setHtmlContent] = useState(() => getInitialContent());
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sourceDraft, setSourceDraft] = useState('');
  const [customColor, setCustomColor] = useState('#000000');
  const [customColorHex, setCustomColorHex] = useState('#000000');
  const [customColorHsl, setCustomColorHsl] = useState({ h: 0, s: 0, l: 0 });
  const [selectedImageElement, setSelectedImageElement] = useState<HTMLImageElement | null>(null);
  const [imageLinkUrl, setImageLinkUrl] = useState('');
  const [imageBorderWidth, setImageBorderWidth] = useState('0');
  const [imageBorderColor, setImageBorderColor] = useState('#000000');
  const [imageBorderRadius, setImageBorderRadius] = useState('0');
  const [isDragging, setIsDragging] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const savedRangeRef = useRef<Range | null>(null);
  const [linkDisplayMode, setLinkDisplayMode] = useState<'url' | 'custom'>('url');
  // Function to format HTML for better readability
  const formatHTML = (html: string): string => {
    let formatted = html;
    let indent = 0;
    
    // Ajouter des sauts de lignes après chaque balise
    formatted = formatted
      // Ajouter saut de ligne après balises ouvrantes de bloc
      .replace(/(<(div|p|h[1-6]|ul|ol|li|table|tr|td|th|section|article|header|footer|nav|main|aside)[^>]*>)/gi, '\n$1\n')
      // Ajouter saut de ligne après balises fermantes de bloc
      .replace(/(<\/(div|p|h[1-6]|ul|ol|li|table|tr|td|th|section|article|header|footer|nav|main|aside)>)/gi, '\n$1\n')
      // Ajouter saut de ligne après balises auto-fermantes
      .replace(/(<(br|hr|img)[^>]*\/?>)/gi, '\n$1\n');
    
    // Diviser en lignes et indenter
    const lines = formatted.split('\n').filter(line => line.trim());
    const indented: string[] = [];
    let previousWasClosingBlock = false;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Détecter les balises fermantes pour diminuer l'indentation
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }
      
      // Ajouter ligne vide avant les balises ouvrantes de bloc de niveau 0 (sauf la première)
      const isTopLevelOpenTag = indent === 0 && trimmed.match(/^<(div|p|h[1-6]|section|article|header|footer|nav|main|aside)[^>]*>/i);
      if (isTopLevelOpenTag && indented.length > 0 && previousWasClosingBlock) {
        indented.push(''); // Ligne vide
      }
      
      // Ajouter la ligne avec indentation
      indented.push('  '.repeat(indent) + trimmed);
      
      // Marquer si c'est une balise fermante de bloc de niveau 0
      const isTopLevelCloseTag = indent === 0 && !!trimmed.match(/^<\/(div|p|h[1-6]|section|article|header|footer|nav|main|aside)>/i);
      previousWasClosingBlock = isTopLevelCloseTag;
      
      // Détecter les balises ouvrantes pour augmenter l'indentation
      const openTagMatch = trimmed.match(/<(\w+)[^>]*>/);
      const closeTagMatch = trimmed.match(/<\/(\w+)>/);
      const selfClosing = trimmed.endsWith('/>') || trimmed.includes('<br') || trimmed.includes('<hr') || trimmed.includes('<img');
      
      if (openTagMatch && !closeTagMatch && !selfClosing) {
        const tagName = openTagMatch[1].toLowerCase();
        const blockTags = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'];
        if (blockTags.includes(tagName)) {
          indent++;
        }
      }
    });
    
    return indented.join('\n');
  };

  // Ensure a Google Font stylesheet is loaded for a given family (idempotent)
  const ensureGoogleFontLoaded = useCallback((family: string) => {
    try {
      const slug = family.trim().replace(/\s+/g, '+');
      const linkId = `gf-${slug.toLowerCase()}`;
      if (document.getElementById(linkId)) return; // already loaded
      const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}&display=swap`;
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    } catch {}
  }, []);

  const applyFontFamily = (family: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const sel = window.getSelection();

    let range: Range | null = null;
    if (savedRangeRef.current) {
      range = savedRangeRef.current;
    } else if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    }
    if (!range) return;
    if (!editor.contains(range.commonAncestorContainer)) return;

    const selectedText = range.toString();
    try {
      if (selectedText && selectedText.trim().length > 0) {
        const span = document.createElement('span');
        span.style.fontFamily = `'${family}', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);

        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.collapse(true);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      } else {
        let container: Node | null = range.commonAncestorContainer;
        if (container.nodeType === Node.TEXT_NODE) container = container.parentElement;
        let blockEl: HTMLElement | null = null;
        while (container && editor.contains(container)) {
          if (container instanceof HTMLElement) {
            const tag = container.tagName;
            const display = window.getComputedStyle(container).display;
            if (['P','H1','H2','H3','H4','H5','H6','DIV','LI'].includes(tag) || display === 'block' || display === 'list-item') {
              blockEl = container;
              break;
            }
          }
          container = container.parentNode;
        }
        if (blockEl) {
          (blockEl as HTMLElement).style.fontFamily = `'${family}', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
        }
      }

      savedRangeRef.current = null;
      updateContent();
    } catch (e) {
      console.error('❌ [applyFontFamily] Error:', e);
    }
  };

  const applyFontSize = (px: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const sel = window.getSelection();

    // Récupérer le range (priorité à la sélection sauvegardée)
    let range: Range | null = null;
    if (savedRangeRef.current) {
      range = savedRangeRef.current;
    } else if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    }
    if (!range) return;
    if (!editor.contains(range.commonAncestorContainer)) return;

    const selectedText = range.toString();
    try {
      if (selectedText && selectedText.trim().length > 0) {
        // Appliquer sur la sélection via un span inline
        const span = document.createElement('span');
        span.style.fontSize = px;
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);

        // Placer le curseur après
        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.collapse(true);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      } else {
        // Pas de sélection: appliquer sur le bloc courant
        let container: Node | null = range.commonAncestorContainer;
        if (container.nodeType === Node.TEXT_NODE) container = container.parentElement;
        let blockEl: HTMLElement | null = null;
        while (container && editor.contains(container)) {
          if (container instanceof HTMLElement) {
            const tag = container.tagName;
            const display = window.getComputedStyle(container).display;
            if (['P','H1','H2','H3','H4','H5','H6','DIV','LI'].includes(tag) || display === 'block' || display === 'list-item') {
              blockEl = container;
              break;
            }
          }
          container = container.parentNode;
        }
        if (blockEl) {
          (blockEl as HTMLElement).style.fontSize = px;
        }
      }

      savedRangeRef.current = null;
      updateContent();
    } catch (e) {
      console.error('❌ [applyFontSize] Error:', e);
    }
  };
  const updateColorFromPosition = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    const s = Math.max(0, Math.min(100, x * 100));
    const v = Math.max(0, Math.min(100, (1 - y) * 100));
    
    const h = customColorHsl.h;
    const c = (v / 100) * (s / 100);
    const x2 = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = (v / 100) - c;
    let r, g, b;
    
    if (0 <= h && h < 60) {
      r = c; g = x2; b = 0;
    } else if (60 <= h && h < 120) {
      r = x2; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x2;
    } else if (180 <= h && h < 240) {
      r = 0; g = x2; b = c;
    } else if (240 <= h && h < 300) {
      r = x2; g = 0; b = c;
    } else {
      r = c; g = 0; b = x2;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    setCustomColorHex(hex);
    setCustomColor(hex);
    setCustomColorHsl({ h, s, l: v });
  }, [customColorHsl.h]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const paletteElement = document.querySelector('[data-color-palette]');
        if (paletteElement) {
          updateColorFromPosition(e.clientX, e.clientY, paletteElement as HTMLElement);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateColorFromPosition]);
  
  // Handle width change with aspect ratio preservation
  const handleWidthChange = (value: string) => {
    setImageWidth(value);
    if (originalAspectRatio && value) {
      const width = parseInt(value);
      const height = Math.round(width / originalAspectRatio);
      setImageHeight(height.toString());
    }
  };

  // Handle height change with aspect ratio preservation
  const handleHeightChange = (value: string) => {
    setImageHeight(value);
    if (originalAspectRatio && value) {
      const height = parseInt(value);
      const width = Math.round(height * originalAspectRatio);
      setImageWidth(width.toString());
    }
  };
  const handleImageDoubleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      setSelectedImageElement(img);
      
      // Extract current properties
      const computedStyle = window.getComputedStyle(img);
      setImageLinkUrl(img.parentElement?.tagName === 'A' ? (img.parentElement as HTMLAnchorElement).href : '');
      setImageBorderWidth(computedStyle.borderWidth || '0');
      setImageBorderColor(computedStyle.borderColor || '#000000');
      setImageBorderRadius(computedStyle.borderRadius || '0');
      setImageWidth(img.width ? img.width.toString() : '');
      setImageHeight(img.height ? img.height.toString() : '');
      
      // Calculate original aspect ratio
      if (img.naturalWidth && img.naturalHeight) {
        setOriginalAspectRatio(img.naturalWidth / img.naturalHeight);
      } else {
        setOriginalAspectRatio(img.width / img.height);
      }
      
      setShowImageEditModal(true);
    }
  }, []);

  // Bridge: apply font family from the ArticleTextPanel sidebar without losing selection
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { family?: string } | undefined;
      if (!detail?.family) return;
      // Load the font stylesheet first (non-blocking)
      ensureGoogleFontLoaded(detail.family);
      // Try to restore the last saved selection if present
      if (savedRangeRef.current) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      }
      applyFontFamily(detail.family);
    };
    window.addEventListener('article:applyFontFamily', handler as EventListener);
    return () => window.removeEventListener('article:applyFontFamily', handler as EventListener);
  }, [ensureGoogleFontLoaded]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && !isSourceMode) {
      editor.addEventListener('dblclick', handleImageDoubleClick);
      return () => editor.removeEventListener('dblclick', handleImageDoubleClick);
    }
  }, [handleImageDoubleClick, isSourceMode]);

  // Mémoriser la dernière sélection non vide dans l’éditeur
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!range.collapsed && editor.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    };

    editor.addEventListener('mouseup', handleSelectionUpdate);
    editor.addEventListener('keyup', handleSelectionUpdate);

    return () => {
      editor.removeEventListener('mouseup', handleSelectionUpdate);
      editor.removeEventListener('keyup', handleSelectionUpdate);
    };
  }, []);

  // Initialize editor content ONCE on mount
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Only initialize if editor is empty (prevents reinit on remount)
    const editorIsEmpty = !editorRef.current.innerHTML || editorRef.current.innerHTML.trim() === '';
    const shouldInitialize = !isInitializedRef.current && editorIsEmpty;
    
    if (shouldInitialize) {
      const initialContent = getInitialContent();
      editorRef.current.innerHTML = initialContent;
      isInitializedRef.current = true;
      lastSyncedPropHtmlRef.current = propHtmlContent || initialContent;
      
      console.log('✅ [EditableText] Initialized with content:', initialContent.substring(0, 100));
    }
  }, []);
  
  // Sync propHtmlContent changes ONLY when it actually changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Skip if focused (user is editing)
    if (isFocused) return;
    
    // Skip if no propHtmlContent provided
    if (!propHtmlContent || propHtmlContent.trim().length === 0) return;

    // If the prop value hasn't changed since last sync, do nothing
    if (lastSyncedPropHtmlRef.current === propHtmlContent) {
      return;
    }
    
    const currentContent = editorRef.current.innerHTML;
    // Only sync if content is actually different
    if (currentContent !== propHtmlContent) {
      console.log('🔄 [EditableText] Syncing external content change:', {
        currentLength: currentContent.length,
        newLength: propHtmlContent.length,
        preview: propHtmlContent.substring(0, 100)
      });
      setHtmlContent(propHtmlContent);
      editorRef.current.innerHTML = propHtmlContent;
      lastSyncedPropHtmlRef.current = propHtmlContent;
    }
  }, [propHtmlContent, isFocused]);

  // No need for constant sync - removed to prevent reinitialization

  const updateContent = () => {
    setTimeout(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        setHtmlContent(content);
        
        // Call onHtmlContentChange if provided
        if (onHtmlContentChange) {
          onHtmlContentChange(content);
        }
        
        // Also parse and call legacy callbacks for backward compatibility
        const div = document.createElement('div');
        div.innerHTML = content;
        const h2 = div.querySelector('h2');
        const titleText = h2?.textContent || '';
        h2?.remove();
        onTitleChange?.(titleText);
        onDescriptionChange?.(div.innerHTML);
      }
    }, 10);
  };

  const exec = (cmd: string, val?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    // Special handling for colors - use direct CSS instead of execCommand
    if (cmd === 'foreColor' && val) {
      if (savedRangeRef.current) {
        const sel = window.getSelection();
        if (sel) {
          try {
            sel.removeAllRanges();
            sel.addRange(savedRangeRef.current);

            // Apply color using CSS instead of execCommand
            const range = savedRangeRef.current;
            const selectedText = range.toString();

            if (selectedText) {
              // Create a span with the color
              const span = document.createElement('span');
              span.style.color = val;
              span.textContent = selectedText;

              // Replace the selected text with the colored span
              range.deleteContents();
              range.insertNode(span);

              // Move cursor after the span
              sel.removeAllRanges();
              const newRange = document.createRange();
              newRange.setStartAfter(span);
              newRange.collapse(true);
              sel.addRange(newRange);
            }

            savedRangeRef.current = null;
            updateContent();
          } catch (e) {
            console.error('Error applying color:', e);
            savedRangeRef.current = null;
          }
        }
      }
      return;
    }

    // For other commands, use execCommand as before
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
          document.execCommand(cmd, false, val);
          savedRangeRef.current = null;
        } catch (e) {
          console.error('Error restoring selection:', e);
          savedRangeRef.current = null;
        }
      }
    } else {
      document.execCommand(cmd, false, val);
    }
  };

  const applyLinkAtSelection = (url: string, mode: 'url' | 'custom', text: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    editor.focus();

    // Get the range to work with
    let range: Range | null = null;
    if (savedRangeRef.current) {
      range = savedRangeRef.current.cloneRange();
    } else {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        range = sel.getRangeAt(0).cloneRange();
      }
    }

    if (!range) return;

    // Ensure the selection belongs to the editor
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) {
      // Fallback: if range is invalid but we have saved text (linkText), find it in the editor
      if (linkText.trim()) {
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
        let found = false;
        let node: Node | null = walker.nextNode();
        
        while (node && !found) {
          const nodeValue = node.nodeValue || '';
          const index = nodeValue.indexOf(linkText);
          
          if (index !== -1) {
            // Found the text! Create a new range
            range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + linkText.length);
            found = true;
            break;
          }
          node = walker.nextNode();
        }
        
        if (!found) return; // Can't find the text, abort
      } else {
        return; // Range is invalid and no fallback available
      }
    }

    // Create the link element
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    
    // Determine link text - USE THE SAVED TEXT FROM linkText STATE
    // The range becomes invalid when modal opens, but we saved the text in linkText
    if (mode === 'custom' && text.trim()) {
      // Use the custom text provided
      link.textContent = text;
    } else {
      // No selection or range is invalid, use URL as text
      link.textContent = url;
    }
    
    // Find and replace the text in the editor
    if (text.trim()) {
      // We have the text that was selected, find it in the editor
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      let node: Node | null = walker.nextNode();
      let found = false;
      
      while (node && !found) {
        const nodeValue = node.nodeValue || '';
        const index = nodeValue.indexOf(text);
        
        if (index !== -1) {
          // Found the text! Create a new range and replace it
          const replaceRange = document.createRange();
          replaceRange.setStart(node, index);
          replaceRange.setEnd(node, index + text.length);
          
          // Delete the text and insert the link
          replaceRange.deleteContents();
          replaceRange.insertNode(link);
          found = true;
          break;
        }
        node = walker.nextNode();
      }
      
      if (!found) {
        // Fallback: append at the end
        editor.appendChild(link);
      }
    } else {
      // No text to replace, just insert the link at the end
      editor.appendChild(link);
    }
    
    // Move cursor after the link
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStartAfter(link);
      newRange.collapse(true);
      sel.addRange(newRange);
    }
    
    // Clean up and update
    savedRangeRef.current = null;
    updateContent();
  };

  const applyFormat = (tag: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    
    console.log('🔍 [applyFormat] Called with tag:', tag);
    console.log('🔍 [applyFormat] savedRangeRef.current:', savedRangeRef.current);

    // Récupérer le range à partir de la sélection sauvegardée ou courante
    let range: Range | null = null;
    if (savedRangeRef.current) {
      range = savedRangeRef.current;
      console.log('✅ [applyFormat] Using savedRangeRef');
    } else {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
        console.log('⚠️ [applyFormat] Using current selection');
      }
    }

    if (!range) {
      console.error('❌ [applyFormat] No range available');
      return;
    }

    console.log('🔍 [applyFormat] Range:', {
      collapsed: range.collapsed,
      text: range.toString(),
      startContainer: range.startContainer.nodeName,
      endContainer: range.endContainer.nodeName
    });

    // S'assurer que le range est bien dans l'éditeur
    if (!editor.contains(range.commonAncestorContainer)) {
      console.error('❌ [applyFormat] Range not in editor');
      return;
    }

    try {
      const selectedText = range.toString();
      console.log('🔍 [applyFormat] Selected text:', selectedText);

      if (selectedText && selectedText.trim().length > 0) {
        // 🔹 Cas A : du texte est sélectionné → on enveloppe exactement cette sélection
        console.log('✅ [applyFormat] Applying format to selection');
        
        // Restaurer la sélection visuelle d'abord
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        
        const wrapper = document.createElement(tag);
        const fragment = range.extractContents();
        wrapper.appendChild(fragment);
        range.insertNode(wrapper);

        // Placer le curseur après le bloc inséré
        const newRange = document.createRange();
        newRange.setStartAfter(wrapper);
        newRange.collapse(true);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        
        console.log('✅ [applyFormat] Format applied successfully');
      } else {
        console.warn('⚠️ [applyFormat] No text selected, skipping');
        return;
      }

      // Clear saved range after use
      savedRangeRef.current = null;
      
      updateContent();
    } catch (e) {
      console.error('❌ [applyFormat] Error:', e);
    }
  };

  return (
    <div 
      className={`article-text-content px-6 relative ${className}`} 
      style={{ 
        maxWidth: `${maxWidth}px`,
        paddingTop: editable ? (compact ? '0.25rem' : '2rem') : (compact ? '0.125rem' : '1rem'),
        paddingBottom: editable ? (compact ? '0.25rem' : '2rem') : (compact ? '0.125rem' : '1rem')
      }}
    >
      {/* Toolbar - Uniquement visible en mode édition */}
      {editable && (
        <div 
          className="mb-3 flex items-center gap-0.5 bg-white border border-gray-300 rounded p-1 whitespace-nowrap flex-nowrap"
          onMouseDown={(e) => {
            // Capture selection BEFORE any button click to prevent loss
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0);
              // Save if selection/caret is within the editor (even when collapsed)
              if (editorRef.current?.contains(range.commonAncestorContainer)) {
                savedRangeRef.current = range.cloneRange();
              }
            }
          }}
          style={{ userSelect: 'none' }}
        >
        <div className="relative inline-block">
          <button
            className="px-2.5 py-1 text-sm bg-white border-r border-gray-300 hover:bg-gray-50"
            onMouseDown={(e) => {
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                if (editorRef.current?.contains(range.commonAncestorContainer)) {
                  savedRangeRef.current = range.cloneRange();
                }
              }
              e.preventDefault();
            }}
            onClick={() => setShowSizeMenu((v) => !v)}
          >
            Taille ▾
          </button>
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-[200] min-w-[120px] p-1 whitespace-normal flex flex-col">
              {['12','14','16','18','20','24','28','32'].map((s) => (
                <button
                  key={s}
                  className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                      const range = sel.getRangeAt(0);
                      if (editorRef.current?.contains(range.commonAncestorContainer)) {
                        savedRangeRef.current = range.cloneRange();
                      }
                    }
                    applyFontSize(`${s}px`);
                    setShowSizeMenu(false);
                  }}
                >
                  {s} px
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative">
          <input 
            ref={colorInputRef} 
            type="color" 
            defaultValue="#000000" 
            className="absolute top-full left-0 w-10 h-10 opacity-0 pointer-events-none" 
            onChange={() => exec('foreColor', colorInputRef.current?.value)} 
          />
          
          {/* Dropdown de couleurs */}
          <div className="relative">
            <button 
              className="w-12 h-8 flex items-center justify-center gap-1 border-r border-gray-300 hover:bg-gray-100" 
              onMouseDown={e => e.preventDefault()} 
              onClick={() => setShowColorPalette(!showColorPalette)}
              title="Couleur du texte"
            >
              <span className="font-semibold text-sm">A</span>
              <span className="inline-block w-3 h-3 bg-black border border-gray-400"></span>
              <span className="text-xs">▾</span>
            </button>
            
            {/* Palette de couleurs */}
            {showColorPalette && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-[200] w-48"
                onMouseDown={(e) => {
                  // Capture selection BEFORE any color button click
                  const sel = window.getSelection();
                  if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    // Only save if selection is within the editor AND not collapsed (has actual selection)
                    if (editorRef.current?.contains(range.commonAncestorContainer) && !range.collapsed) {
                      savedRangeRef.current = range.cloneRange();
                    }
                  }
                }}
              >
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {/* Couleurs personnalisées (ouvre le color picker) */}
                  <button
                    className="w-6 h-6 rounded-full border-2 border-white ring-2 ring-gray-300 hover:scale-110 transition-transform relative overflow-hidden"
                    onClick={() => {
                      setShowColorPalette(false);
                      setShowCustomColorPicker(true);
                    }}
                    title="Couleurs personnalisées"
                  >
                    <span
                      className="absolute inset-0"
                      style={{
                        background:
                          'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
                      }}
                    />
                    <span className="relative block w-full h-full rounded-full border border-white/70" />
                  </button>
                  {/* Couleurs prédéfinies */}
                  {[
                    '#000000', '#374151', '#6B7280', '#9CA3AF', // Gris
                    '#DC2626', '#EA580C', '#D97706', '#65A30D', // Rouge, orange, jaune, vert
                    '#2563EB', '#7C3AED', '#DB2777', '#EC4899', // Bleu, violet, rose
                    '#0891B2', '#059669', '#0D9488', '#7C2D12'  // Cyan, vert, teal, marron
                  ].map(color => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        exec('foreColor', color);
                        setShowColorPalette(false);
                      }}
                      title={`Couleur ${color}`}
                    />
                  ))}
                </div>
                
                {/* Bouton Autre */}
                <button
                  className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 flex items-center justify-center gap-2"
                  onClick={() => {
                    setShowColorPalette(false);
                    setShowCustomColorPicker(true);
                  }}
                >
                  <span>🎨</span>
                  <span>Autre couleur</span>
                </button>
              </div>
            )}
            
            {/* Modal Color Picker Personnalisé - Style Natif */}
            {showCustomColorPicker && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md p-2 shadow-2xl w-48 z-[200]"
                onClick={e => e.stopPropagation()}
                onMouseDown={(e) => {
                  // Capture selection BEFORE any color picker interaction
                  const sel = window.getSelection();
                  if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    // Only save if selection is within the editor AND not collapsed (has actual selection)
                    if (editorRef.current?.contains(range.commonAncestorContainer) && !range.collapsed) {
                      savedRangeRef.current = range.cloneRange();
                    }
                  }
                }}
              >
                {/* Bouton de fermeture */}
                <button
                  onClick={() => setShowCustomColorPicker(false)}
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Fermer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                
                <h3 className="text-gray-900 text-sm font-medium mb-2 pr-6">Choisir une couleur</h3>
                
                {/* Palette de couleur principale */}
                <div className="relative mb-3">
                  <div 
                    className="w-full h-24 rounded border border-gray-300 cursor-crosshair relative overflow-hidden"
                    data-color-palette
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, #000 100%),
                                  linear-gradient(to right, #fff 0%, hsl(${customColorHsl.h}, 100%, 50%) 100%)`
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                      updateColorFromPosition(e.clientX, e.clientY, e.currentTarget);
                    }}
                    onMouseMove={(e) => {
                      if (isDragging) {
                        updateColorFromPosition(e.clientX, e.clientY, e.currentTarget);
                      }
                    }}
                    onMouseUp={() => {
                      setIsDragging(false);
                    }}
                    onClick={(e) => {
                      if (!isDragging) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top) / rect.height;
                        
                        // Canva logic: x = saturation (0-100%), y = value/brightness (100-0%)
                        const s = Math.max(0, Math.min(100, x * 100));
                        const v = Math.max(0, Math.min(100, (1 - y) * 100));
                        
                        // Convert HSV to RGB
                        const h = customColorHsl.h;
                        const c = (v / 100) * (s / 100);
                        const x2 = c * (1 - Math.abs((h / 60) % 2 - 1));
                        const m = (v / 100) - c;
                        let r, g, b;
                        
                        if (0 <= h && h < 60) {
                          r = c; g = x2; b = 0;
                        } else if (60 <= h && h < 120) {
                          r = x2; g = c; b = 0;
                        } else if (120 <= h && h < 180) {
                          r = 0; g = c; b = x2;
                        } else if (180 <= h && h < 240) {
                          r = 0; g = x2; b = c;
                        } else if (240 <= h && h < 300) {
                          r = x2; g = 0; b = c;
                        } else {
                          r = c; g = 0; b = x2;
                        }
                        
                        r = Math.round((r + m) * 255);
                        g = Math.round((g + m) * 255);
                        b = Math.round((b + m) * 255);
                        
                        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                        setCustomColorHex(hex);
                        setCustomColor(hex);
                        
                        // Store as HSV for cursor positioning
                        setCustomColorHsl({ h, s, l: v });
                      }
                    }}>
                    {/* Curseur sur la palette */}
                    <div 
                      className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none z-10"
                      style={{
                        left: `${customColorHsl.s}%`,
                        top: `${100 - customColorHsl.l}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                  
                  {/* Slider de teinte */}
                  <div className="w-full h-3 rounded border border-gray-300 mt-2 relative overflow-hidden cursor-pointer">
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                      }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const h = Math.max(0, Math.min(360, (x / rect.width) * 360));
                        
                        const newHsv = { ...customColorHsl, h };
                        setCustomColorHsl(newHsv);
                        
                        // Convert HSV to RGB
                        const s = newHsv.s / 100;
                        const v = newHsv.l / 100;
                        const c = v * s;
                        const x2 = c * (1 - Math.abs((h / 60) % 2 - 1));
                        const m = v - c;
                        let r, g, b;
                        
                        if (0 <= h && h < 60) {
                          r = c; g = x2; b = 0;
                        } else if (60 <= h && h < 120) {
                          r = x2; g = c; b = 0;
                        } else if (120 <= h && h < 180) {
                          r = 0; g = c; b = x2;
                        } else if (180 <= h && h < 240) {
                          r = 0; g = x2; b = c;
                        } else if (240 <= h && h < 300) {
                          r = x2; g = 0; b = c;
                        } else {
                          r = c; g = 0; b = x2;
                        }
                        
                        r = Math.round((r + m) * 255);
                        g = Math.round((g + m) * 255);
                        b = Math.round((b + m) * 255);
                        
                        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                        setCustomColorHex(hex);
                        setCustomColor(hex);
                      }}
                    />
                    {/* Curseur de teinte */}
                    <div 
                      className="absolute top-0 w-1 h-3 bg-white border border-gray-400 pointer-events-none"
                      style={{
                        left: `${(customColorHsl.h / 360) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </div>
                
                {/* Aperçu et HEX */}
                <div className="flex items-center justify-center gap-3">
                  {/* Aperçu de couleur */}
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: customColor }}
                  />
                  
                  {/* Champ HEX */}
                  <div className="flex flex-col">
                    <input
                      type="text"
                      value={customColorHex}
                      onChange={(e) => {
                        const hex = e.target.value;
                        setCustomColorHex(hex);
                        if (/^#[0-9A-F]{6}$/i.test(hex)) {
                          setCustomColor(hex);
                          // Convert HEX to RGB
                          const r = parseInt(hex.slice(1, 3), 16) / 255;
                          const g = parseInt(hex.slice(3, 5), 16) / 255;
                          const b = parseInt(hex.slice(5, 7), 16) / 255;
                          
                          // Convert RGB to HSV
                          const max = Math.max(r, g, b);
                          const min = Math.min(r, g, b);
                          const d = max - min;
                          let h: number = 0;
                          const s = max === 0 ? 0 : d / max;
                          const v = max;
                          
                          if (max !== min) {
                            switch (max) {
                              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                              case g: h = (b - r) / d + 2; break;
                              case b: h = (r - g) / d + 4; break;
                            }
                            h /= 6;
                          }
                          
                          setCustomColorHsl({ 
                            h: Math.round(h * 360), 
                            s: Math.round(s * 100), 
                            l: Math.round(v * 100) 
                          });
                        }
                      }}
                      className="text-gray-900 text-sm font-medium bg-transparent border border-gray-300 rounded px-2 py-1 text-center w-20"
                      placeholder="#000000"
                    />
                  </div>
                  
                  {/* Bouton OK */}
                  <button
                    onClick={() => {
                      exec('foreColor', customColor);
                      setShowCustomColorPicker(false);
                    }}
                    className="px-3 py-1.5 bg-[#841b60] hover:bg-[#a0246e] text-white rounded text-sm font-medium"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('bold')} title="Gras">
          <span className="font-bold">B</span>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('italic')} title="Italique">
          <span className="italic font-serif">I</span>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('underline')} title="Souligné">
          <span className="underline">U</span>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => { exec('removeFormat'); exec('unlink'); }} title="Supprimer formatage">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L2 6v2h16V6l-8-4zM2 10h16v2H2v-2zm0 4h16v2H2v-2z"/><line x1="3" y1="3" x2="17" y2="17" stroke="red" strokeWidth="2"/></svg>
        </button>
        
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('insertOrderedList')} title="Liste numérotée">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><text x="1" y="6" fontSize="5" fontWeight="bold">1.</text><path d="M7 4h11v1.5H7V4z"/><text x="1" y="11" fontSize="5" fontWeight="bold">2.</text><path d="M7 9.5h11V11H7V9.5z"/><text x="1" y="16" fontSize="5" fontWeight="bold">3.</text><path d="M7 15h11v1.5H7V15z"/></svg>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('insertUnorderedList')} title="Liste à puces">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 5h10v2H7V5zm0 5h10v2H7v-2zm0 5h10v2H7v-2z"/><circle cx="4" cy="6" r="1.5"/><circle cx="4" cy="11" r="1.5"/><circle cx="4" cy="16" r="1.5"/></svg>
        </button>
        
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('justifyLeft')} title="Aligner à gauche">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm0 4h10v2H3V8zm0 4h14v2H3v-2zm0 4h10v2H3v-2z"/></svg>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('justifyCenter')} title="Centrer">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm2 4h10v2H5V8zm-2 4h14v2H3v-2zm2 4h10v2H5v-2z"/></svg>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('justifyRight')} title="Aligner à droite">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm4 4h10v2H7V8zm-4 4h14v2H3v-2zm4 4h10v2H7v-2z"/></svg>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('justifyFull')} title="Justifier">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14v2H3V4zm0 4h14v2H3V8zm0 4h14v2H3v-2zm0 4h14v2H3v-2z"/></svg>
        </button>
        
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => {
          e.preventDefault();

          // CRITICAL: Capture selection in onMouseDown BEFORE it's lost
          const sel = window.getSelection();
          const selectedText = sel?.toString() || '';

          if (selectedText.trim()) {
            // Clone the range immediately before it becomes invalid
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0);
              const clonedRange = range.cloneRange();
              savedRangeRef.current = clonedRange;
            }
            // Text is selected - go directly to custom text mode
            setLinkText(selectedText);
            setLinkDisplayMode('custom');
          } else {
            // No text selected - show URL input first
            setLinkText('');
            savedRangeRef.current = null;
            setLinkDisplayMode('url');
          }

          // Open modal immediately in onMouseDown to prevent selection loss
          setShowLinkModal(true);
        }} title="Lien">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/></svg>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => setShowImageModal(true)} title="Image">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>
        </button>
        <button className="w-9 h-8 flex items-center justify-center border-r border-gray-300 hover:bg-gray-100" onMouseDown={e => e.preventDefault()} onClick={() => exec('insertHTML', '<table border="1" style="width:100%;border-collapse:collapse"><tr><td style="padding:8px">1</td><td style="padding:8px">2</td></tr></table>')} title="Tableau">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20" strokeWidth="1.5"><rect x="2" y="2" width="16" height="16" rx="1"/><line x1="2" y1="8" x2="18" y2="8"/><line x1="2" y1="14" x2="18" y2="14"/><line x1="10" y1="2" x2="10" y2="18"/></svg>
        </button>
        
        {/* Source (safe modal) */}
        <button
          className="px-3 py-1.5 text-sm hover:bg-gray-50 ml-auto"
          onMouseDown={e => e.preventDefault()}
          onClick={() => {
            // Open modal with current HTML formatted
            const currentHtml = editorRef.current ? editorRef.current.innerHTML : (htmlContent || '');
            setSourceDraft(formatHTML(currentHtml));
            setShowSourceModal(true);
          }}
        >
          Source
        </button>
      </div>
      )}
      
      {editable ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            // Ne PAS mettre à jour htmlContent pendant l'édition
            // Cela évite la perte du caret et la réinitialisation des couleurs
            // La mise à jour se fait uniquement lors du blur
          }}
          onFocus={() => {
            console.log('📝 [EditableText] Focus gained');
            setIsFocused(true);
          }}
          onBlur={() => {
            console.log('📝 [EditableText] Focus lost, updating parent');
            setIsFocused(false);
            // Update htmlContent and parent on blur
            if (editorRef.current) {
              const content = editorRef.current.innerHTML;
              console.log('💾 [EditableText] Saving content on blur:', {
                length: content.length,
                preview: content.substring(0, 150),
                hasColorStyles: content.includes('style="color')
              });
              setHtmlContent(content);
            }
            updateContent();
          }}
          className={`w-full ${compact ? 'min-h-[40px]' : 'min-h-[150px]'} pt-3 px-3 pb-0 focus:outline-none prose prose-lg max-w-none transition-colors duration-200 ${
            isFocused ? 'bg-gray-50' : ''
          }`}
          style={{ 
            direction: 'ltr', 
            textAlign: 'left'
          }}
        />
      ) : (
        <>
          <style>{`
            .article-preview-content h1 {
              font-size: 2.25rem;
              font-weight: 800;
              line-height: 2.5rem;
              margin-top: 0;
              margin-bottom: 0.875rem;
            }
            .article-preview-content h2 {
              font-size: 1.875rem;
              font-weight: 700;
              line-height: 2.25rem;
              margin-top: 0;
              margin-bottom: 0.75rem;
            }
            .article-preview-content h3 {
              font-size: 1.5rem;
              font-weight: 600;
              line-height: 2rem;
              margin-top: 0;
              margin-bottom: 0.625rem;
            }
            .article-preview-content p {
              margin-top: 0;
              margin-bottom: 1rem;
              line-height: 1.75rem;
            }
            .article-preview-content ul, .article-preview-content ol {
              margin-top: 0;
              margin-bottom: 1rem;
              padding-left: 1.625rem;
            }
            .article-preview-content li {
              margin-top: 0.5rem;
              margin-bottom: 0.5rem;
            }
            .article-preview-content strong {
              font-weight: 600;
            }
            .article-preview-content a {
              color: #3b82f6;
              text-decoration: underline;
            }
          `}</style>
          <div
            className={`article-preview-content w-full ${compact ? 'min-h-[40px]' : 'min-h-[150px]'} pt-3 px-3 pb-0`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{ 
              direction: 'ltr', 
              textAlign: 'left',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          />
        </>
      )}

      {/* Source Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center" onMouseDown={() => setShowSourceModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[min(900px,95vw)] max-h-[85vh] flex flex-col" onMouseDown={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold">Édition du HTML</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowSourceModal(false)}>✕</button>
            </div>
            <textarea
              className="flex-1 m-4 border rounded p-3 font-mono text-xs leading-5 resize-none"
              style={{ minHeight: '300px' }}
              value={sourceDraft}
              onChange={(e) => setSourceDraft(e.target.value)}
            />
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded" onClick={() => setShowSourceModal(false)}>Annuler</button>
              <button
                className="px-3 py-1.5 text-sm text-white rounded"
                style={{ background: '#841b60' }}
                onClick={() => {
                  // Apply edited HTML safely
                  setHtmlContent(sourceDraft);
                  if (editorRef.current) {
                    editorRef.current.innerHTML = sourceDraft || '';
                  }
                  updateContent();
                  setShowSourceModal(false);
                }}
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        [contenteditable] h1 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 0;
          margin-bottom: 0.5em;
        }
        [contenteditable] h1:not(:first-child) {
          margin-top: 0.75em;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 0;
          margin-bottom: 0.5em;
        }
        [contenteditable] h2:not(:first-child) {
          margin-top: 0.75em;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.5;
          margin-top: 0;
          margin-bottom: 0.5em;
        }
        [contenteditable] h3:not(:first-child) {
          margin-top: 0.75em;
        }
        [contenteditable] p {
          font-size: 1rem;
          line-height: 1.75;
          margin-top: 0;
          margin-bottom: 0.5em;
        }
        [contenteditable] p:not(:first-child) {
          margin-top: 0.5em;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin-left: 1.5em;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          padding-left: 1em;
        }
        [contenteditable] ul {
          list-style-type: disc;
        }
        [contenteditable] ol {
          list-style-type: decimal;
        }
        [contenteditable] ul ul {
          list-style-type: circle;
        }
        [contenteditable] ul ul ul {
          list-style-type: square;
        }
        [contenteditable] ol ol {
          list-style-type: lower-alpha;
        }
        [contenteditable] ol ol ol {
          list-style-type: lower-roman;
        }
        [contenteditable] li {
          margin-bottom: 0.25em;
          line-height: 1.75;
          display: list-item;
        }
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        [contenteditable] td, [contenteditable] th {
          border: 1px solid #ddd;
          padding: 8px;
        }
        [contenteditable] a {
          color: #007bff;
          text-decoration: underline;
        }
        /* Styles pour les liens en mode preview (sans contenteditable) */
        .article-text-content a {
          color: #007bff;
          text-decoration: underline;
          cursor: pointer;
        }
        .article-text-content a:hover {
          color: #0056b3;
          text-decoration: underline;
        }
      `}</style>
      
      {/* Modal Lien - Style Prosplay - Seulement en mode édition */}
      {editable && showLinkModal && (
        <div className="fixed inset-0 flex items-end justify-center pb-16 z-[200]" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white border border-gray-300 rounded-md p-5 w-96 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-gray-900 text-base font-medium mb-1">Insérer un lien</h3>
            <p className="text-gray-600 text-xs mb-3">URL</p>
            <input
              type="text"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e]"
              placeholder="https://..."
              autoFocus
            />
            
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkDisplay"
                  checked={linkDisplayMode === 'url'}
                  onChange={() => setLinkDisplayMode('url')}
                  className="w-4 h-4 text-[#841b60] focus:ring-[#841b60]"
                />
                <span className="text-gray-900 text-sm">Afficher l'URL directement</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkDisplay"
                  checked={linkDisplayMode === 'custom'}
                  onChange={() => setLinkDisplayMode('custom')}
                  className="w-4 h-4 text-[#841b60] focus:ring-[#841b60]"
                />
                <span className="text-gray-900 text-sm">Personnaliser le texte du lien</span>
              </label>
            </div>
            
            {linkDisplayMode === 'custom' && (
              <div className="mt-3">
                <p className="text-gray-600 text-xs mb-2">Texte à afficher</p>
                <input
                  type="text"
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e]"
                  placeholder="Cliquez ici"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => { 
                  setShowLinkModal(false); 
                  setLinkUrl(''); 
                  setLinkText('');
                  savedRangeRef.current = null;
                  setLinkDisplayMode('url');
                }}
                className="px-4 py-1.5 text-[#841b60] hover:text-[#a0246e] text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (linkUrl) {
                    if (editorRef.current) {
                      applyLinkAtSelection(linkUrl, linkDisplayMode, linkText);
                    }
                    setShowLinkModal(false);
                    setLinkUrl('');
                    setLinkText('');
                    savedRangeRef.current = null;
                    setLinkDisplayMode('url');
                  }
                }}
                className="px-5 py-1.5 bg-[#841b60] hover:bg-[#a0246e] text-white rounded text-sm font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Image - Style Prosplay - Seulement en mode édition */}
      {editable && showImageModal && (
        <div className="fixed inset-0 flex items-end justify-center pb-16 z-[200]" onClick={() => setShowImageModal(false)}>
          <div className="bg-white border border-gray-300 rounded-md p-5 w-96 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-gray-900 text-base font-medium mb-1">Insérer une image</h3>
            
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="imageInputMode"
                  checked={imageInputMode === 'url'}
                  onChange={() => setImageInputMode('url')}
                  className="w-4 h-4 text-[#841b60] focus:ring-[#841b60]"
                />
                <span className="text-gray-900 text-sm">Entrer une URL</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="imageInputMode"
                  checked={imageInputMode === 'upload'}
                  onChange={() => setImageInputMode('upload')}
                  className="w-4 h-4 text-[#841b60] focus:ring-[#841b60]"
                />
                <span className="text-gray-900 text-sm">Uploader un fichier</span>
              </label>
            </div>
            
            {imageInputMode === 'url' ? (
              <div className="mt-3">
                <p className="text-gray-600 text-xs mb-2">URL image</p>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e]"
                  placeholder="https://..."
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && imageUrl) {
                      exec('insertImage', imageUrl);
                      setShowImageModal(false);
                      setImageUrl('');
                    }
                  }}
                />
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-gray-600 text-xs mb-2">Sélectionner une image</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      // Create object URL for preview
                      const url = URL.createObjectURL(file);
                      setImageUrl(url);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#841b60] file:text-white hover:file:bg-[#a0246e]"
                />
                {imageFile && (
                  <div className="mt-2 text-xs text-gray-600">
                    Fichier sélectionné : {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => { 
                  setShowImageModal(false); 
                  setImageUrl(''); 
                  setImageFile(null);
                  setImageInputMode('url');
                  if (imageFile) URL.revokeObjectURL(imageUrl);
                }}
                className="px-4 py-1.5 text-[#841b60] hover:text-[#a0246e] text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if ((imageInputMode === 'url' && imageUrl) || (imageInputMode === 'upload' && imageFile)) {
                    exec('insertImage', imageUrl);
                    setShowImageModal(false);
                    setImageUrl('');
                    setImageFile(null);
                    setImageInputMode('url');
                  }
                }}
                className="px-5 py-1.5 bg-[#841b60] hover:bg-[#a0246e] text-white rounded text-sm font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Édition Image - Style Prosplay - Seulement en mode édition */}
      {editable && showImageEditModal && (
        <div className="fixed inset-0 flex items-end justify-center pb-16 z-[200]" onClick={() => setShowImageEditModal(false)}>
          <div className="bg-white border border-gray-300 rounded-md p-5 w-96 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-gray-900 text-base font-medium mb-1">Éditer l'image</h3>
            
            <div className="space-y-4">
              {/* URL du lien */}
              <div>
                <p className="text-gray-600 text-xs mb-2">URL du lien (cliquable)</p>
                <input
                  type="text"
                  value={imageLinkUrl}
                  onChange={e => setImageLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e]"
                  placeholder="https://..."
                />
              </div>
              
              {/* Bordure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600 text-xs mb-2">Épaisseur bordure (px)</p>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={imageBorderWidth.replace('px', '')}
                    onChange={e => setImageBorderWidth(e.target.value + 'px')}
                    className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e]"
                  />
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-2">Couleur bordure</p>
                  <input
                    type="color"
                    value={imageBorderColor}
                    onChange={e => setImageBorderColor(e.target.value)}
                    className="w-full h-10 bg-white border border-[#841b60] rounded cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600 text-xs mb-2">Largeur (px)</p>
                  <input
                    type="number"
                    min="10"
                    max="1200"
                    value={imageWidth}
                    onChange={e => handleWidthChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e]"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-2">Hauteur (px)</p>
                  <input
                    type="number"
                    min="10"
                    max="1200"
                    value={imageHeight}
                    onChange={e => handleHeightChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e]"
                    placeholder="Auto"
                  />
                </div>
              </div>
              
              {/* Arrondis */}
              <div>
                <p className="text-gray-600 text-xs mb-2">Arrondis (px)</p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={imageBorderRadius.replace('px', '')}
                  onChange={e => setImageBorderRadius(e.target.value + 'px')}
                  className="w-full px-3 py-2 bg-white border border-[#841b60] rounded text-gray-900 text-sm focus:outline-none focus:border-[#a0246e]"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => { 
                  setShowImageEditModal(false);
                  setSelectedImageElement(null);
                  setImageLinkUrl('');
                  setImageBorderWidth('0');
                  setImageBorderColor('#000000');
                  setImageBorderRadius('0');
                  setImageWidth('');
                  setImageHeight('');
                }}
                className="px-4 py-1.5 text-[#841b60] hover:text-[#a0246e] text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (selectedImageElement) {
                    // Apply link if provided
                    if (imageLinkUrl.trim()) {
                      // Check if image is already wrapped in a link
                      const parent = selectedImageElement.parentElement;
                      if (parent?.tagName === 'A') {
                        (parent as HTMLAnchorElement).href = imageLinkUrl;
                      } else {
                        // Wrap image in link
                        const link = document.createElement('a');
                        link.href = imageLinkUrl;
                        link.target = '_blank';
                        selectedImageElement.parentNode?.insertBefore(link, selectedImageElement);
                        link.appendChild(selectedImageElement);
                      }
                    } else {
                      // Remove link if no URL provided
                      const parent = selectedImageElement.parentElement;
                      if (parent?.tagName === 'A') {
                        parent.parentNode?.insertBefore(selectedImageElement, parent);
                        parent.remove();
                      }
                    }
                    
                    // Apply styling
                    selectedImageElement.style.borderWidth = imageBorderWidth;
                    selectedImageElement.style.borderColor = imageBorderColor;
                    selectedImageElement.style.borderStyle = imageBorderWidth !== '0px' ? 'solid' : 'none';
                    selectedImageElement.style.borderRadius = imageBorderRadius;
                    
                    // Apply dimensions
                    if (imageWidth) {
                      selectedImageElement.style.width = imageWidth + 'px';
                      selectedImageElement.style.height = 'auto'; // Maintain aspect ratio
                    } else {
                      selectedImageElement.style.width = '';
                      selectedImageElement.style.height = '';
                    }
                    
                    if (imageHeight && !imageWidth) {
                      selectedImageElement.style.height = imageHeight + 'px';
                      selectedImageElement.style.width = 'auto';
                    }
                    
                    // Update content
                    updateContent();
                  }
                  
                  setShowImageEditModal(false);
                  setSelectedImageElement(null);
                }}
                className="px-5 py-1.5 bg-[#841b60] hover:bg-[#a0246e] text-white rounded text-sm font-medium"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default EditableText;
