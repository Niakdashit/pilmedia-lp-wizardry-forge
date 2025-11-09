import React from 'react';
import { Upload, Type, MousePointer } from 'lucide-react';
import type { OptimizedCampaign } from '../../ModernEditor/types/CampaignTypes';

interface ArticleModePanelProps {
  campaign: OptimizedCampaign | null;
  onCampaignChange: (updates: Partial<OptimizedCampaign>) => void;
  activePanel: 'banner' | 'text' | 'button' | 'funnel';
  grouped?: boolean;
}

/**
 * ArticleModePanel - Panneaux pour le mode Article dans HybridSidebar
 * 
 * Remplace les panneaux normaux (Background, Elements, etc.) par des panneaux
 * spécifiques au mode Article: Bannière, Texte, Bouton, Funnel
 */
const ArticleModePanel: React.FC<ArticleModePanelProps> = ({
  campaign,
  onCampaignChange,
  activePanel,
  grouped = false,
}) => {
  const articleConfig = campaign?.articleConfig || {};
  const [groupTab, setGroupTab] = React.useState<'banner' | 'text' | 'button'>('banner');
  const clampFontSize = React.useCallback((value: number) => {
    return Math.min(120, Math.max(12, Math.round(value)));
  }, []);

  const parseFontSize = React.useCallback((value: string | undefined, fallback: number) => {
    if (!value) return fallback;
    const normalized = value.trim().toLowerCase();
    if (!normalized) return fallback;
    if (normalized.endsWith('rem')) {
      const numeric = Number.parseFloat(normalized.replace('rem', ''));
      return Number.isFinite(numeric) ? clampFontSize(numeric * 16) : fallback;
    }
    if (normalized.endsWith('px')) {
      const numeric = Number.parseFloat(normalized.replace('px', ''));
      return Number.isFinite(numeric) ? clampFontSize(numeric) : fallback;
    }
    const numeric = Number.parseFloat(normalized);
    return Number.isFinite(numeric) ? clampFontSize(numeric) : fallback;
  }, [clampFontSize]);

  const titleFontSize = parseFontSize(articleConfig.content?.titleStyle?.fontSize, 32);

  // Sync with external activePanel only on mount or when explicitly changed
  React.useEffect(() => {
    if (activePanel === 'text' || activePanel === 'button') {
      setGroupTab(activePanel);
    }
  }, []); // Empty deps: only run once on mount

  const handleBannerAspectRatio = (ratio: '2215/1536' | '1500/744') => {
    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        banner: {
          ...articleConfig.banner,
          aspectRatio: ratio,
        },
      },
    });
  };

  const handleTitleStyle = (updates: any) => {
    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        content: {
          ...articleConfig.content,
          titleStyle: {
            ...articleConfig.content?.titleStyle,
            ...updates,
          },
        },
      },
    });
  };

  const handleDescriptionStyle = (updates: any) => {
    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        content: {
          ...articleConfig.content,
          descriptionStyle: {
            ...articleConfig.content?.descriptionStyle,
            ...updates,
          },
        },
      },
    });
  };

  const handleCTAChange = (updates: any) => {
    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        cta: {
          ...articleConfig.cta,
          ...updates,
        },
      },
    });
  };

  const handleBannerImageChange = async (file: File | undefined) => {
    if (!file) return;
    const toDataUrl = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
    try {
      const dataUrl = await toDataUrl(file);
      onCampaignChange({
        articleConfig: {
          ...articleConfig,
          banner: {
            ...articleConfig.banner,
            imageUrl: dataUrl,
          },
        },
      });
      try {
        const evt = new CustomEvent('applyBackgroundCurrentScreen', {
          detail: { url: dataUrl }
        });
        window.dispatchEvent(evt);
      } catch {}
    } catch {}
  };

  const handleBannerImageRemove = () => {
    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        banner: {
          ...articleConfig.banner,
          imageUrl: undefined,
        },
      },
    });
  };

  const handleFunnelChange = (updates: any) => {
    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        funnelFlow: {
          ...articleConfig.funnelFlow,
          ...updates,
        },
      },
    });
  };

  // Panneau Bannière
  const renderBannerPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">IMAGE DE FOND (DESKTOP/TABLET)</h3>
        <label className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors flex flex-col items-center group cursor-pointer">
          <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
          <span className="text-sm text-gray-600 group-hover:text-white">Télécharger pour Desktop/Tablet</span>
          <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG jusqu'à 10MB</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleBannerImageChange(e.target.files?.[0])}
          />
        </label>
        {articleConfig.banner?.imageUrl && (
          <div className="mt-3 flex items-center gap-3">
            <img
              src={articleConfig.banner.imageUrl}
              alt="Bannière"
              className="h-16 w-auto rounded border border-gray-200"
            />
            <button
              onClick={handleBannerImageRemove}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Ratio d'image</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={articleConfig.banner?.aspectRatio === '2215/1536'}
              onChange={() => handleBannerAspectRatio('2215/1536')}
              className="text-[#841b60] focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">2215×1536px (Standard)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={articleConfig.banner?.aspectRatio === '1500/744'}
              onChange={() => handleBannerAspectRatio('1500/744')}
              className="text-[#841b60] focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">1500×744px (Panoramique)</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Panneau Texte
  const renderTextPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Style du titre</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Taille (px)</label>
            <input
              type="number"
              min={12}
              max={120}
              value={titleFontSize}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value, 10);
                if (!Number.isFinite(value)) return;
                const safeValue = clampFontSize(value);
                handleTitleStyle({ fontSize: `${safeValue}px` });
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="32"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Alignement</label>
              <select
                value={articleConfig.content?.titleStyle?.textAlign || 'center'}
                onChange={(e) => handleTitleStyle({ textAlign: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              >
                <option value="left">Gauche</option>
                <option value="center">Centré</option>
                <option value="right">Droite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Graisse</label>
              <select
                value={articleConfig.content?.titleStyle?.fontWeight || 'bold'}
                onChange={(e) => handleTitleStyle({ fontWeight: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              >
                <option value="normal">Normal</option>
                <option value="600">Semi-bold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Interlignage</label>
              <input
                type="number"
                step="0.1"
                min="0.8"
                value={parseFloat(articleConfig.content?.titleStyle?.lineHeight || '1.4')}
                onChange={(e) => {
                  const value = Number.parseFloat(e.target.value || '0');
                  handleTitleStyle({ lineHeight: Number.isFinite(value) ? value.toString() : '1.4' });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Couleur</label>
              <input
                type="color"
                value={articleConfig.content?.titleStyle?.color || '#1f2937'}
                onChange={(e) => handleTitleStyle({ color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Style de la description</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Taille</label>
            <input
              type="text"
              value={articleConfig.content?.descriptionStyle?.fontSize || '1rem'}
              onChange={(e) => handleDescriptionStyle({ fontSize: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="1rem"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Alignement</label>
              <select
                value={articleConfig.content?.descriptionStyle?.textAlign || 'center'}
                onChange={(e) => handleDescriptionStyle({ textAlign: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              >
                <option value="left">Gauche</option>
                <option value="center">Centré</option>
                <option value="right">Droite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Interlignage</label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={parseFloat(articleConfig.content?.descriptionStyle?.lineHeight || '1.75')}
                onChange={(e) => {
                  const value = Number.parseFloat(e.target.value || '0');
                  handleDescriptionStyle({ lineHeight: Number.isFinite(value) ? value.toString() : '1.75' });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur</label>
            <input
              type="color"
              value={articleConfig.content?.descriptionStyle?.color || '#4b5563'}
              onChange={(e) => handleDescriptionStyle({ color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-xs text-purple-800 leading-relaxed">
          💡 Double-cliquez sur le titre ou la description dans le canvas pour les éditer directement.
          Les réglages ci-dessus sont reflétés instantanément sur le canvas Article uniquement.
        </p>
      </div>
    </div>
  );

  // Panneau Bouton
  const renderButtonPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Texte du bouton</label>
        <input
          type="text"
          value={articleConfig.cta?.text || 'PARTICIPER !'}
          onChange={(e) => handleCTAChange({ text: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          placeholder="PARTICIPER !"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Taille</label>
        <select
          value={articleConfig.cta?.size || 'large'}
          onChange={(e) => handleCTAChange({ size: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        >
          <option value="small">Petit</option>
          <option value="medium">Moyen</option>
          <option value="large">Grand</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Style</label>
        <select
          value={articleConfig.cta?.variant || 'primary'}
          onChange={(e) => handleCTAChange({ variant: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        >
          <option value="primary">Principal</option>
          <option value="secondary">Secondaire</option>
          <option value="outline">Contour</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Icône</label>
        <select
          value={articleConfig.cta?.icon || 'arrow'}
          onChange={(e) => handleCTAChange({ icon: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        >
          <option value="arrow">Flèche →</option>
          <option value="external">Lien externe ↗</option>
          <option value="play">Play ▶</option>
          <option value="none">Aucune</option>
        </select>
      </div>

      <div className="h-px bg-gray-200" />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Position verticale (Mobile uniquement)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Ajustez la position du bouton sur l'écran mobile. 0% = en haut, 100% = en bas.
        </p>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={articleConfig.cta?.mobileVerticalPosition ?? 85}
            onChange={(e) => handleCTAChange({ mobileVerticalPosition: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#841b60]"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Haut</span>
            <span className="text-sm font-medium text-[#841b60]">
              {articleConfig.cta?.mobileVerticalPosition ?? 85}%
            </span>
            <span className="text-xs text-gray-500">Bas</span>
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            📱 Cette option n'affecte que l'affichage sur mobile (écrans &lt; 768px). 
            Sur desktop, le bouton reste sous le texte.
          </p>
        </div>
      </div>
    </div>
  );

  // Panneau Funnel
  const renderFunnelPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Étapes du funnel</h3>
        <p className="text-xs text-gray-500 mb-4">
          Configurez les étapes du parcours utilisateur. La bannière reste visible à toutes les étapes.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">1. Article</span>
            <span className="text-xs text-gray-500">Toujours actif</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">2. Formulaire</span>
            <input
              type="checkbox"
              checked={articleConfig.funnelFlow?.formStep?.enabled ?? true}
              onChange={(e) => handleFunnelChange({
                formStep: {
                  ...articleConfig.funnelFlow?.formStep,
                  enabled: e.target.checked,
                },
              })}
              className="text-[#841b60] focus:ring-[#841b60] rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">3. Jeu ({campaign?.type})</span>
            <input
              type="checkbox"
              checked={articleConfig.funnelFlow?.gameStep?.enabled ?? true}
              onChange={(e) => handleFunnelChange({
                gameStep: {
                  ...articleConfig.funnelFlow?.gameStep,
                  enabled: e.target.checked,
                },
              })}
              className="text-[#841b60] focus:ring-[#841b60] rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">4. Résultat</span>
            <input
              type="checkbox"
              checked={articleConfig.funnelFlow?.resultStep?.enabled ?? true}
              onChange={(e) => handleFunnelChange({
                resultStep: {
                  ...articleConfig.funnelFlow?.resultStep,
                  enabled: e.target.checked,
                },
              })}
              className="text-[#841b60] focus:ring-[#841b60] rounded"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200"></div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Position du formulaire</h3>
        <select
          value={articleConfig.funnelFlow?.formStep?.position || 'before-game'}
          onChange={(e) => handleFunnelChange({
            formStep: {
              ...articleConfig.funnelFlow?.formStep,
              position: e.target.value,
            },
          })}
          disabled={!articleConfig.funnelFlow?.formStep?.enabled}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="before-game">Avant le jeu</option>
          <option value="after-game">Après le jeu</option>
        </select>
      </div>
    </div>
  );

  // Mode groupé: onglets internes Design (Bannière / Texte / Bouton)
  if (grouped && activePanel !== 'funnel') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: 'banner' as const, label: 'Bannière', icon: Upload },
            { id: 'text' as const, label: 'Texte', icon: Type },
            { id: 'button' as const, label: 'Bouton', icon: MousePointer },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setGroupTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                groupTab === t.id
                  ? 'text-[#841b60] border-b-2 border-[#841b60] bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {groupTab === 'banner' && renderBannerPanel()}
          {groupTab === 'text' && renderTextPanel()}
          {groupTab === 'button' && renderButtonPanel()}
        </div>
      </div>
    );
  }

  // Rendu selon le panneau actif (mode non-groupé ou pour 'funnel')
  switch (activePanel) {
    case 'banner':
      return renderBannerPanel();
    case 'text':
      return renderTextPanel();
    case 'button':
      return renderButtonPanel();
    case 'funnel':
      return renderFunnelPanel();
    default:
      return null;
  }
};

export default ArticleModePanel;
