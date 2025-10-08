import React, { CSSProperties, useMemo, useState } from 'react';

// Polices organisées par catégories - Export needed by other panels
export const fontCategories = [{
  name: "Business",
  fonts: ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Nunito Sans', 'Inter', 'Poppins', 'Work Sans', 'IBM Plex Sans']
}, {
  name: "Calm",
  fonts: ['Libre Baskerville', 'Crimson Text', 'EB Garamond', 'Lora', 'Merriweather', 'Playfair Display']
}, {
  name: "Cute",
  fonts: ['Caveat', 'Indie Flower', 'Architects Daughter', 'Shadows Into Light', 'Quicksand', 'Comfortaa']
}, {
  name: "Fancy",
  fonts: ['Cinzel', 'Cormorant', 'Abril Fatface', 'Yeseva One', 'Bodoni Moda', 'Italiana']
}, {
  name: "Playful",
  fonts: ['Lobster', 'Pacifico', 'Fredoka One', 'Righteous', 'Bungee', 'Chewy']
}, {
  name: "Artistic",
  fonts: ['Dancing Script', 'Great Vibes', 'Allura', 'Satisfy', 'Kaushan Script', 'Tangerine']
}];

interface TextPanelProps {
  onAddElement?: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  elements?: any[];
}

const TextPanel: React.FC<TextPanelProps> = ({ 
  selectedElement, 
  onElementUpdate 
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'effects'>('style');
  
  // Obtenir la couleur actuelle du texte sélectionné
  const currentColor = selectedElement?.color || '#111111';
  
  // Handlers pour appliquer les changements
  const handleColorChange = (color: string) => {
    if (selectedElement && onElementUpdate) {
      onElementUpdate({ color });
    }
  };
  
  const handleFontChange = (fontFamily: string) => {
    if (selectedElement && onElementUpdate) {
      onElementUpdate({ fontFamily });
    }
  };
  
  const handleEffectApply = (effect: { id: string; name: string; css: CSSProperties }) => {
    if (selectedElement && onElementUpdate) {
      if (effect.id === 'none') {
        // Supprimer les effets personnalisés
        onElementUpdate({ 
          customCSS: {},
          backgroundColor: undefined,
          padding: undefined,
          borderRadius: undefined
        });
      } else {
        // Appliquer l'effet via customCSS
        onElementUpdate({ customCSS: effect.css });
      }
    }
  };

  // Effets rapides (identiques/compatibles avec SimpleTextEffectsModal)
  const quickEffects = useMemo<Array<{ id: string; name: string; css: CSSProperties }>>(() => ([
    { id: 'none', name: 'Aucun effet', css: {} },
    {
      id: 'background',
      name: 'Fond',
      css: { backgroundColor: 'rgba(251,255,0,1)', color: '#000', padding: '8px 16px', borderRadius: '4px' }
    },
    {
      id: 'yellow-button',
      name: 'Bouton Jaune',
      css: {
        backgroundColor: '#FFD700', color: '#000', fontWeight: 'bold', padding: '10px 24px', borderRadius: '24px',
        textAlign: 'center', display: 'inline-block', minWidth: '120px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      } as CSSProperties
    }
  ]), []);

  return (
    <div className="h-full flex flex-col">
      {/* Sous-onglets */}
      <div className="flex border-b border-[hsl(var(--sidebar-border))]">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'text-[hsl(var(--sidebar-text-primary))] border-b-2 border-[hsl(var(--sidebar-active))]'
              : 'text-[hsl(var(--sidebar-text))] hover:text-[hsl(var(--sidebar-text-primary))]'
          }`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'effects'
              ? 'text-[hsl(var(--sidebar-text-primary))] border-b-2 border-[hsl(var(--sidebar-active))]'
              : 'text-[hsl(var(--sidebar-text))] hover:text-[hsl(var(--sidebar-text-primary))]'
          }`}
          onClick={() => setActiveTab('effects')}
        >
          Effets
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'style' && (
          <>
            {/* Couleur de texte */}
            <section>
              <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Couleur du texte</h3>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={currentColor} 
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer" 
                  aria-label="Couleur du texte"
                  disabled={!selectedElement || selectedElement.type !== 'text'}
                />
                <input 
                  type="text" 
                  value={currentColor} 
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-28 text-xs px-2 py-1 border rounded" 
                  aria-label="Code hexadécimal"
                  disabled={!selectedElement || selectedElement.type !== 'text'}
                />
              </div>
              {(!selectedElement || selectedElement.type !== 'text') && (
                <p className="text-xs text-gray-500 mt-2">Sélectionnez un élément de texte pour modifier sa couleur</p>
              )}
            </section>

            {/* Catégories de polices */}
            <section>
              <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Catégories de polices</h3>
              {(!selectedElement || selectedElement.type !== 'text') && (
                <p className="text-xs text-gray-500 mb-3">Sélectionnez un élément de texte pour modifier sa police</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {fontCategories.map((group) => (
                  <div key={group.name} className="border rounded-md p-2 bg-[hsl(var(--sidebar-surface))]">
                    <div className="text-xs font-semibold mb-1 text-[hsl(var(--sidebar-text))]">{group.name}</div>
                    <div className="flex flex-wrap gap-1">
                      {group.fonts.map((f) => (
                        <button
                          key={f}
                          onClick={() => handleFontChange(f)}
                          disabled={!selectedElement || selectedElement.type !== 'text'}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            selectedElement?.fontFamily === f 
                              ? 'bg-[#841b60] text-white border-[#841b60]' 
                              : 'hover:bg-[hsl(var(--sidebar-hover))]'
                          } ${(!selectedElement || selectedElement.type !== 'text') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          style={{ fontFamily: `'${f}', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif` }}
                          title={`Appliquer la police ${f}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'effects' && (
          <section>
            <h3 className="text-sm font-semibold mb-3 text-[hsl(var(--sidebar-text-primary))]">Effets rapides</h3>
            {(!selectedElement || selectedElement.type !== 'text') && (
              <p className="text-xs text-gray-500 mb-3">Sélectionnez un élément de texte pour appliquer des effets</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {quickEffects.map((ef) => (
                <button
                  key={ef.id}
                  onClick={() => handleEffectApply(ef)}
                  disabled={!selectedElement || selectedElement.type !== 'text'}
                  className={`border rounded-md p-3 text-left transition-colors ${
                    (!selectedElement || selectedElement.type !== 'text') 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  style={ef.css}
                  title={ef.name}
                >
                  {ef.name}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TextPanel;
