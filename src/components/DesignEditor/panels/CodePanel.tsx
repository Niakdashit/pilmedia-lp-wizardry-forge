import React, { useState } from 'react';
import { Code2, FileJson, FileCode } from 'lucide-react';

interface CodePanelProps {
  campaign: any;
  currentScreen?: 'screen1' | 'screen2' | 'screen3';
  onCampaignChange?: (campaign: any) => void;
}

type CodeType = 'html' | 'css' | 'javascript' | 'json';

const CodePanel: React.FC<CodePanelProps> = ({ campaign, currentScreen = 'screen1', onCampaignChange }) => {
  const [activeCodeType, setActiveCodeType] = useState<CodeType>('html');
  const [editableCode, setEditableCode] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [editedCache, setEditedCache] = useState<Record<string, string>>({});
  const [previewEnabled, setPreviewEnabled] = useState<boolean>(true);
  const [applyToCanvas, setApplyToCanvas] = useState<boolean>(false);

  // Générer le code HTML de la campagne
  const generateHTML = () => {
    const screenData = campaign?.screens?.[currentScreen] || {};
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaign?.name || 'Campagne'} - ${currentScreen}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="campaign-container" data-screen="${currentScreen}">
    <div class="campaign-content">
      <!-- Éléments de la campagne -->
      ${screenData.elements?.map((el: any) => `
      <div class="element element-${el.type}" data-id="${el.id}">
        ${el.type === 'text' ? `<p>${el.content || 'Texte'}</p>` : ''}
        ${el.type === 'image' ? `<img src="${el.src || ''}" alt="${el.alt || ''}" />` : ''}
        ${el.type === 'button' ? `<button>${el.label || 'Bouton'}</button>` : ''}
      </div>
      `).join('') || '<!-- Aucun élément -->'}
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
  };

  // Transform CSS so body/html rules apply to overlay container in canvas
  const scopeCssToOverlay = (css: string): string => {
    try {
      let out = css || '';
      // Map standalone body/html selectors to the overlay
      out = out.replace(/(^|,)\s*body(\s*[,\{\n])/gi, (m, p1, p2) => `${p1}#codepanel-live-html${p2}`);
      out = out.replace(/(^|,)\s*html(\s*[,\{\n])/gi, (m, p1, p2) => `${p1}#codepanel-live-html${p2}`);
      // Map descendant selectors starting with body ...
      out = out.replace(/body\s+(?=[.#\[]|[a-z])/gi, '#codepanel-live-html ');
      // Basic safety: ensure overlay gets height for background visibility
      const prelude = `#codepanel-live-html{min-height:100%;display:block}\n`;
      return prelude + out;
    } catch {
      return css;
    }
  };

  // Générer le code CSS
  const generateCSS = () => {
    const bg = campaign?.design?.background || {};
    return `.campaign-container {
  width: 100%;
  min-height: 100vh;
  background: ${bg.type === 'color' ? bg.value : `url(${bg.value})`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.campaign-content {
  max-width: 1200px;
  width: 100%;
  position: relative;
}

.element {
  position: absolute;
  transition: all 0.3s ease;
}

.element-text p {
  font-family: ${campaign?.design?.fontFamily || 'inherit'};
  color: ${campaign?.design?.textColor || '#000000'};
  font-size: ${campaign?.design?.fontSize || '16'}px;
}

.element-button button {
  background: ${campaign?.design?.buttonColor || '#E0004D'};
  color: ${campaign?.design?.buttonTextColor || '#ffffff'};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.element-button button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(132, 27, 96, 0.3);
}

@media (max-width: 768px) {
  .campaign-container {
    padding: 10px;
  }
}`;
  };

  // Générer le code JavaScript
  const generateJavaScript = () => {
    return `// Interactions personnalisées pour ${campaign?.name || 'la campagne'}
document.addEventListener('DOMContentLoaded', function() {
  console.log('Campagne chargée:', '${currentScreen}');
  
  // Gestion des clics sur les boutons
  const buttons = document.querySelectorAll('.element-button button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Bouton cliqué:', this.textContent);
      
      // Ajouter votre logique ici
      // Exemple: redirection, soumission de formulaire, etc.
    });
  });
  
  // Animation d'entrée des éléments
  const elements = document.querySelectorAll('.element');
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      el.style.transition = 'all 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  // Tracking des interactions
  function trackEvent(eventName, data) {
    console.log('Event:', eventName, data);
    // Intégrer votre solution d'analytics ici
  }
  
  trackEvent('campaign_view', {
    campaign: '${campaign?.id || ''}',
    screen: '${currentScreen}'
  });
});`;
  };

  // Générer le JSON de configuration
  const generateJSON = () => {
    return JSON.stringify({
      id: campaign?.id,
      name: campaign?.name,
      type: campaign?.type,
      screen: currentScreen,
      design: campaign?.design,
      screens: campaign?.screens,
      formFields: campaign?.formFields,
      wheelConfig: campaign?.wheelConfig,
      quizConfig: campaign?.quizConfig,
      scratchConfig: campaign?.scratchConfig,
      jackpotConfig: campaign?.jackpotConfig,
      prizes: campaign?.prizes,
      messages: campaign?.messages
    }, null, 2);
  };

  const getCode = () => {
    switch (activeCodeType) {
      case 'html': return generateHTML();
      case 'css': return generateCSS();
      case 'javascript': return generateJavaScript();
      case 'json': return generateJSON();
      default: return '';
    }
  };

  // Helpers for persistent cache
  const getCacheKey = (screen: string, type: CodeType) => {
    const cid = (campaign?.id || 'temp').toString();
    return `codepanel:${cid}:${screen}:${type}`;
  };

  // Read the most relevant value for a given type (prioritizing live edit, then cache, then generated)
  const getCurrentForType = (type: CodeType): string => {
    const memKey = `${currentScreen}:${type}`;
    const lsKey = getCacheKey(currentScreen, type);
    if (type === activeCodeType && editableCode) return editableCode;
    const mem = editedCache[memKey];
    if (typeof mem === 'string') return mem;
    try {
      const ls = localStorage.getItem(lsKey);
      if (typeof ls === 'string') return ls;
    } catch {}
    switch (type) {
      case 'html': return generateHTML();
      case 'css': return generateCSS();
      case 'javascript': return generateJavaScript();
      case 'json': return generateJSON();
      default: return '';
    }
  };

  // Initialize editable code when code type or screen changes from cache first
  React.useEffect(() => {
    const memKey = `${currentScreen}:${activeCodeType}`;
    const lsKey = getCacheKey(currentScreen, activeCodeType);
    let restored: string | undefined = editedCache[memKey];
    if (restored === undefined) {
      try {
        const fromLS = localStorage.getItem(lsKey);
        if (typeof fromLS === 'string') restored = fromLS;
      } catch {}
    }
    if (typeof restored === 'string') {
      setEditableCode(restored);
      setIsDirty(true);
    } else {
      const code = getCode();
      setEditableCode(code);
      setIsDirty(false);
    }
  }, [activeCodeType, currentScreen]);

  // If campaign changes from outside, refresh code only when editor not dirty
  // and when there is no cached value for the current key
  React.useEffect(() => {
    try {
      const lsKey = getCacheKey(currentScreen, activeCodeType);
      const hasLS = typeof localStorage.getItem(lsKey) === 'string';
      if (!isDirty && !hasLS) {
        setEditableCode(getCode());
      }
    } catch {
      if (!isDirty) setEditableCode(getCode());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  const codeTypes = [
    { id: 'html' as CodeType, label: 'HTML', icon: FileCode },
    { id: 'css' as CodeType, label: 'CSS', icon: FileCode },
    { id: 'javascript' as CodeType, label: 'JavaScript', icon: Code2 },
    { id: 'json' as CodeType, label: 'JSON Config', icon: FileJson }
  ];

  // Build live preview document from the combination of current HTML/CSS/JS (independent of active tab)
  const previewHtml = (() => {
    const htmlSafe = getCurrentForType('html');
    const cssSafe = getCurrentForType('css');
    const jsSafe = getCurrentForType('javascript');

    // If the HTML provided is a full document, use it, otherwise embed in a simple shell
    const hasDoctype = /<!DOCTYPE/i.test(htmlSafe) || /<html[\s>]/i.test(htmlSafe);
    if (hasDoctype) {
      // attempt to inject css/js if missing
      let doc = htmlSafe;
      if (!/<style[\s>]/i.test(doc)) {
        doc = doc.replace(/<head[\s>][\s\S]*?>/, (m) => `${m}\n<style>${cssSafe}</style>`);
      }
      if (!/<script[\s>]/i.test(doc)) {
        doc = doc.replace(/<\/body>/i, `\n<script>\n${jsSafe}\n<\/script>\n</body>`);
      }
      return doc;
    }
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${cssSafe}</style>
</head>
<body>
${htmlSafe}
<script>\n${jsSafe}\n</script>
</body>
</html>`;
  })();

  // Build HTML content to materialize as a BlocHtml (body content + style tag)
  const getMaterializedHtml = (): string => {
    const htmlDoc = getCurrentForType('html');
    const cssDoc = getCurrentForType('css');
    // Extract body content if full document provided
    const bodyMatch = htmlDoc.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
    const bodyInner = bodyMatch && bodyMatch[1] ? bodyMatch[1] : htmlDoc;
    return `<style>${cssDoc}</style>\n${bodyInner}`;
  };

  const upsertBlocHtmlModule = (camp: any, screen: string, htmlContent: string) => {
    const moduleId = `codepanel-html-${screen}`;
    const ensureScreens = (obj: any) => (obj && obj.screens ? obj : { screens: { screen1: [], screen2: [], screen3: [] } });
    const writeInto = (rootObj: any, path: ('design'|'modularPage')) => {
      if (path === 'modularPage') {
        const modularPage = ensureScreens(rootObj.modularPage);
        const screens = { ...modularPage.screens };
        const list = Array.isArray(screens[screen]) ? [...screens[screen]] : [];
        const idx = list.findIndex((m: any) => m?.id === moduleId || (m?.type === 'BlocHtml' && (m as any)._fromCodePanel === screen));
        const newModule = { id: moduleId, type: 'BlocHtml', html: htmlContent, _fromCodePanel: screen };
        if (idx >= 0) list[idx] = { ...list[idx], ...newModule }; else list.push(newModule);
        screens[screen] = list;
        return { ...rootObj, modularPage: { ...modularPage, screens } };
      } else {
        const design = rootObj?.design || {};
        const designModules = ensureScreens(design.designModules);
        const screens = { ...designModules.screens };
        const list = Array.isArray(screens[screen]) ? [...screens[screen]] : [];
        const idx = list.findIndex((m: any) => m?.id === moduleId || (m?.type === 'BlocHtml' && (m as any)._fromCodePanel === screen));
        const newModule = { id: moduleId, type: 'BlocHtml', html: htmlContent, _fromCodePanel: screen };
        if (idx >= 0) list[idx] = { ...list[idx], ...newModule }; else list.push(newModule);
        screens[screen] = list;
        return { ...rootObj, design: { ...design, designModules: { ...designModules, screens } } };
      }
    };

    // Prefer modularPage for quizzes or if modularPage exists; otherwise design.designModules
    const preferModular = (camp?.type === 'quiz') || Boolean(camp?.modularPage?.screens);
    let out = writeInto(camp, preferModular ? 'modularPage' : 'design');
    // As a safety, also mirror to the other store if it exists so both editor/preview paths are covered
    if (preferModular) {
      out = writeInto(out, 'design');
    } else {
      out = writeInto(out, 'modularPage');
    }
    return out;
  };

  // Live injection into the editor canvas (global document) for CSS/JS
  React.useEffect(() => {
    if (!applyToCanvas) {
      // cleanup when disabled
      const s = document.getElementById('codepanel-live-style');
      if (s && s.parentNode) s.parentNode.removeChild(s);
      const js = document.getElementById('codepanel-live-script');
      if (js && js.parentNode) js.parentNode.removeChild(js);
      return;
    }

    // CSS injection
    const ensureStyle = () => {
      let styleEl = document.getElementById('codepanel-live-style') as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'codepanel-live-style';
        document.head.appendChild(styleEl);
      }
      const css = getCurrentForType('css');
      styleEl.textContent = scopeCssToOverlay(css);
    };

    // JS injection (re-create script to re-run)
    const ensureScript = () => {
      const prev = document.getElementById('codepanel-live-script');
      if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
      const scriptEl = document.createElement('script');
      scriptEl.id = 'codepanel-live-script';
      scriptEl.type = 'text/javascript';
      const js = getCurrentForType('javascript');
      scriptEl.text = js || '';
      document.body.appendChild(scriptEl);
    };

    // Always refresh CSS; only refresh JS when JS is edited or active type changes
    ensureStyle();
    ensureScript();

    return () => {
      // optional cleanup on dependency change
      const s = document.getElementById('codepanel-live-style');
      if (s && !applyToCanvas && s.parentNode) s.parentNode.removeChild(s);
      const js = document.getElementById('codepanel-live-script');
      if (js && !applyToCanvas && js.parentNode) js.parentNode.removeChild(js);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyToCanvas, activeCodeType, editableCode, editedCache, currentScreen]);

  // HTML overlay injection into the canvas (non-destructive) — always uses current HTML
  React.useEffect(() => {
    if (!applyToCanvas) {
      const htmlNode = document.getElementById('codepanel-live-html');
      if (htmlNode && htmlNode.parentNode) htmlNode.parentNode.removeChild(htmlNode);
      return;
    }

    // Find canvas wrapper (ModernEditorLayout / DesignEditor)
    const wrapper = document.querySelector('.design-canvas-wrapper') as HTMLElement | null
      || document.querySelector('.design-canvas-container') as HTMLElement | null
      || document.querySelector('[data-editor-root]') as HTMLElement | null
      || document.body;

    if (!wrapper) {
      console.warn('[CodePanel] Canvas wrapper not found for HTML overlay');
      return;
    }

    // Helper: extract body content if a full HTML document is provided
    const extractBody = (html: string) => {
      try {
        const match = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
        if (match && match[1]) return match[1];
      } catch {}
      return html;
    };

    // Target inner device screen to keep overlay INSIDE canvas
    const screenEl = (
      wrapper.querySelector('.rounded-lg.overflow-hidden') as HTMLElement | null
    ) || (
      wrapper.querySelector('.rounded-xl.overflow-hidden') as HTMLElement | null
    ) || (
      wrapper.querySelector('[class*="rounded-"][class*="overflow-hidden"]') as HTMLElement | null
    ) || wrapper;

    // Create or reuse the overlay container INSIDE the screen element
    let container = document.getElementById('codepanel-live-html') as HTMLElement | null;
    let inner = document.getElementById('codepanel-live-html-inner') as HTMLElement | null;
    if (!container) {
      container = document.createElement('div');
      container.id = 'codepanel-live-html';
      container.style.position = 'absolute';
      container.style.inset = '0';
      container.style.pointerEvents = 'auto'; // allow scrolling
      container.style.zIndex = '2000'; // above preview content; below toolbars (~5000)
      container.style.overflow = 'auto'; // enable scroll inside canvas
      (container.style as any).webkitOverflowScrolling = 'touch';
      // Inherit visual clipping from screen element
      const radius = window.getComputedStyle(screenEl).borderRadius;
      if (radius) container.style.borderRadius = radius;
      console.log('[CodePanel] Creating HTML overlay container inside', screenEl.className || screenEl.tagName);
      // Ensure screen is positioned
      const cs = window.getComputedStyle(screenEl);
      if (cs.position === 'static') {
        screenEl.style.position = 'relative';
      }
      // Inner wrapper to disable clicks while allowing scroll on container
      inner = document.createElement('div');
      inner.id = 'codepanel-live-html-inner';
      inner.style.minHeight = '100%';
      inner.style.pointerEvents = 'none';
      container.appendChild(inner);
      screenEl.appendChild(container);
    } else if (!inner) {
      inner = document.createElement('div');
      inner.id = 'codepanel-live-html-inner';
      inner.style.minHeight = '100%';
      inner.style.pointerEvents = 'none';
      container.appendChild(inner);
    }

    const html = extractBody(getCurrentForType('html'));
    console.log('[CodePanel] Updating HTML overlay. Length:', html.length);
    if (inner) {
      inner.innerHTML = html;
    } else {
      container.innerHTML = html;
    }

    return () => {
      // Do not remove container here to avoid flicker when typing; it will be removed on toggle off
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyToCanvas, activeCodeType, editableCode, editedCache, currentScreen]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header avec sélection du type de code */}
      <div className="p-4 border-b border-gray-200">
        {/* Tabs pour les types de code */}
        <div className="flex flex-wrap gap-2">
          {codeTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveCodeType(type.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeCodeType === type.id
                    ? 'bg-[#E0004D] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone de code */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div
          className="relative flex-1"
          style={{ pointerEvents: 'auto', zIndex: 50 }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            value={editableCode}
            onChange={(e) => {
              const next = e.target.value;
              setEditableCode(next);
              const memKey = `${currentScreen}:${activeCodeType}`;
              const lsKey = getCacheKey(currentScreen, activeCodeType);
              setEditedCache((prev) => ({ ...prev, [memKey]: next }));
              try { localStorage.setItem(lsKey, next); } catch {}
              if (!isDirty) setIsDirty(true);
            }}
            className="absolute inset-0 w-full h-full p-4 bg-gray-900 text-gray-100 text-sm font-mono leading-relaxed border-0 outline-none focus:outline-none"
            placeholder="Éditez le code ici..."
            spellCheck={false}
            autoFocus={false}
            style={{ pointerEvents: 'auto' }}
            tabIndex={0}
          />
        </div>
        
        {/* Actions & Aperçu */}
        <div className="p-3 border-t border-gray-700 bg-gray-800 flex items-center justify-between gap-3" style={{ pointerEvents: 'auto', zIndex: 50 }}>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={previewEnabled}
                onChange={(e) => setPreviewEnabled(e.target.checked)}
              />
              Aperçu live
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyToCanvas}
                onChange={(e) => setApplyToCanvas(e.target.checked)}
              />
              Appliquer au canvas (CSS/JS)
            </label>
          </div>
          <button
            onClick={() => {
              try {
                if (activeCodeType === 'json') {
                  const parsedJson = JSON.parse(editableCode);
                  onCampaignChange?.(parsedJson);
                } else {
                  // Materialize combined HTML+CSS into a BlocHtml module for the current screen
                  const htmlForModule = getMaterializedHtml();
                  const updated = upsertBlocHtmlModule(campaign, currentScreen, htmlForModule);
                  onCampaignChange?.(updated);
                  try { window.dispatchEvent(new CustomEvent('editor-request-save')); } catch {}
                }
                setIsDirty(false);
              } catch (error: any) {
                console.error(error);
                alert(`Erreur JSON: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-[#E0004D] text-white text-xs font-medium rounded-lg hover:bg-[#6a154a] transition-colors"
          >
            Appliquer
          </button>
        </div>

        {previewEnabled && (
          <div className="h-80 border-t border-gray-200">
            <iframe
              title="code-preview"
              className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={previewHtml}
            />
          </div>
        )}
      </div>

      
    </div>
  );
};

export default CodePanel;
