import React, { CSSProperties, useMemo, useState } from 'react';
import { fontCategories } from './TextPanel';

// Simple color palette inspired by existing FS panel UI
const TEXT_COLORS: string[] = [
  '#111827','#374151','#4B5563','#6B7280','#9CA3AF','#D1D5DB','#111111','#1F2937',
  '#EF4444','#10B981','#06B6D4','#60A5FA','#34D399','#A78BFA','#F59E0B','#F97316',
  '#000000','#FFFFFF'
];

const QUICK_EFFECTS: Array<{ id: string; name: string; css: CSSProperties }> = [
  { id: 'none', name: 'Aucun effet', css: {} },
  { id: 'background', name: 'Fond', css: { backgroundColor: 'rgba(251,255,0,1)', color: '#000', padding: '8px 16px', borderRadius: '4px' } },
  { id: 'yellow-button', name: 'Bouton Jaune', css: { backgroundColor: '#FFD700', color: '#000', fontWeight: 'bold', padding: '10px 24px', borderRadius: '24px', textAlign: 'center', display: 'inline-block', minWidth: '120px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'} }
];

const ArticleTextPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'style' | 'effects'>('style');
  const [selectedCategory, setSelectedCategory] = useState(fontCategories[0]);

  const categories = useMemo(() => fontCategories, []);

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

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'style' && (
          <>
            {/* Couleurs de texte */}
            <section>
              <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">COULEURS DE TEXTE</h3>
              <div className="grid grid-cols-6 gap-2">
                {/* picker "multicolor" faux pour UI */}
                <button className="w-8 h-8 rounded-full border border-gray-300 bg-[conic-gradient(from_180deg,_#f00,_#ff0,_#0f0,_#0ff,_#00f,_#f0f,_#f00)]" title="Personnalisé" />
                {TEXT_COLORS.map((c) => (
                  <button key={c} className="w-8 h-8 rounded-full border border-gray-300" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </section>

            {/* Catégories de polices */}
            <section>
              <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">CATÉGORIES DE POLICES</h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {categories.map((group) => (
                  <button
                    key={group.name}
                    className={`p-2 text-xs rounded transition-all duration-200 ${
                      selectedCategory.name === group.name ? 'bg-[#44444d] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setSelectedCategory(group)}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">{selectedCategory.name}</h4>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                  {selectedCategory.fonts.map((font) => (
                    <button key={font} className="p-3 border rounded text-left transition-colors hover:border-[hsl(var(--primary))] hover:bg-[#44444d] hover:text-white">
                      <span style={{ fontFamily: font }} className="text-lg font-medium">{font}</span>
                      <span className="block text-[11px] mt-1 text-gray-500">{selectedCategory.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'effects' && (
          <section>
            <h3 className="text-sm font-semibold mb-3 text-[hsl(var(--sidebar-text-primary))]">Effets rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_EFFECTS.map((ef) => (
                <button key={ef.id} className="border rounded-md p-3 text-left hover:bg-gray-50 transition-colors" style={ef.css} title={ef.name}>
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

export default ArticleTextPanel;
