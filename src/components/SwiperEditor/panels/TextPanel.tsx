import React, { CSSProperties, useMemo, useState } from 'react';

// Polices organisées par catégories - Export needed by other panels
export const fontCategories = [{
  name: "Business",
  fonts: [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Nunito Sans', 'Inter', 'Poppins',
    'Work Sans', 'IBM Plex Sans', 'Segoe UI', 'Noto Sans', 'PT Sans', 'Mulish', 'Rubik', 'Urbanist', 'DM Sans'
  ]
}, {
  name: "Calm",
  fonts: [
    'Libre Baskerville', 'Crimson Text', 'EB Garamond', 'Lora', 'Merriweather', 'Playfair Display',
    'Cormorant Garamond', 'Spectral', 'Source Serif Pro', 'Noto Serif'
  ]
}, {
  name: "Cute",
  fonts: [
    'Caveat', 'Indie Flower', 'Architects Daughter', 'Shadows Into Light', 'Quicksand', 'Comfortaa',
    'Baloo 2', 'Nunito', 'Patrick Hand', 'Grandstander'
  ]
}, {
  name: "Fancy",
  fonts: [
    'Cinzel', 'Cormorant', 'Abril Fatface', 'Yeseva One', 'Bodoni Moda', 'Italiana',
    'Playfair Display SC', 'Unna', 'Prata', 'Alice'
  ]
}, {
  name: "Playful",
  fonts: [
    'Lobster', 'Pacifico', 'Fredoka One', 'Righteous', 'Bungee', 'Chewy',
    'Comic Neue', 'Paytone One', 'Amatic SC', 'Bangers', 'Luckiest Guy'
  ]
}, {
  name: "Artistic",
  fonts: [
    'Dancing Script', 'Great Vibes', 'Allura', 'Satisfy', 'Kaushan Script', 'Tangerine',
    'Parisienne', 'Sacramento', 'Mr Dafoe', 'Alex Brush'
  ]
}];

const TextPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'style' | 'effects'>('style');

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
                <input type="color" defaultValue="#111111" className="w-10 h-8 rounded border border-gray-300" aria-label="Couleur du texte" />
                <input type="text" defaultValue="#111111" className="w-28 text-xs px-2 py-1 border rounded" aria-label="Code hexadécimal" />
              </div>
            </section>

            {/* Catégories de polices */}
            <section>
              <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Catégories de polices</h3>
              <div className="grid grid-cols-2 gap-3">
                {fontCategories.map((group) => (
                  <div key={group.name} className="border rounded-md p-2 bg-[hsl(var(--sidebar-surface))]">
                    <div className="text-xs font-semibold mb-1 text-[hsl(var(--sidebar-text))]">{group.name}</div>
                    <div className="flex flex-wrap gap-1">
                      {group.fonts.map((f) => (
                        <button
                          key={f}
                          className="px-2 py-1 text-xs rounded border hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
                          style={{ fontFamily: `'${f}', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif` }}
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
            <div className="grid grid-cols-2 gap-3">
              {quickEffects.map((ef) => (
                <button
                  key={ef.id}
                  className="border rounded-md p-3 text-left hover:bg-gray-50 transition-colors"
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
