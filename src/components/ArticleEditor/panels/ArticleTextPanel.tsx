import React, { useMemo, useState } from 'react';
import { fontCategories } from '@/components/SwiperEditor/panels/TextPanel';

// Quick effects removed

const ArticleTextPanel: React.FC = () => {
  // Tabs removed; only style section remains
  const [selectedCategory, setSelectedCategory] = useState(fontCategories[0]);

  const categories = useMemo(() => fontCategories, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Section Style */}
        <>
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
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSelectedCategory(group)}
                >
                  {group.name}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">{selectedCategory.name}</h4>
              <div className="grid grid-cols-1 gap-2 pr-1">
                {selectedCategory.fonts.map((font) => (
                  <button
                    key={font}
                    className="p-3 border rounded text-left transition-colors hover:border-[hsl(var(--primary))] hover:bg-[#44444d] hover:text-white"
                    onClick={() => {
                      try {
                        const evt = new CustomEvent('article:applyFontFamily', { detail: { family: font } });
                        window.dispatchEvent(evt);
                      } catch {}
                    }}
                  >
                    <span style={{ fontFamily: font }} className="text-lg font-medium">{font}</span>
                    <span className="block text-[11px] mt-1 text-gray-500">{selectedCategory.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      </div>
    </div>
  );
};

export default ArticleTextPanel;
