// @ts-nocheck
import React from 'react';
import ArticleTextPanel from '@/components/ArticleEditor/panels/ArticleTextPanel';
import { Upload, Type, MousePointer } from 'lucide-react';
import type { OptimizedCampaign } from '../../ModernEditor/types/CampaignTypes';
import { useButtonStore } from '@/stores/buttonStore';

interface ArticleModePanelProps {
  campaign: OptimizedCampaign | null;
  onCampaignChange: (updates: Partial<OptimizedCampaign>) => void;
  activePanel: 'banner' | 'text' | 'button' | 'funnel' | 'result';
  grouped?: boolean;
  currentGameResult?: 'winner' | 'loser';
  onGameResultChange?: (result: 'winner' | 'loser') => void;
  onStepChange?: (step: 'article' | 'form' | 'game' | 'result') => void;
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
  currentGameResult = 'winner',
  onGameResultChange,
  onStepChange,
}) => {
  const articleConfig = campaign?.articleConfig || {};
  const [groupTab, setGroupTab] = React.useState<'banner' | 'text' | 'button'>('banner');
  const [bgOpen, setBgOpen] = React.useState(true);
  const [bannerOpen, setBannerOpen] = React.useState(true);
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [footerOpen, setFooterOpen] = React.useState(false);
  // Hidden color pickers for the rainbow custom color circle
  const customBannerColorRef = React.useRef<HTMLInputElement>(null);
  const customPageColorRef = React.useRef<HTMLInputElement>(null);

  const handleCTAChange = (updates: any) => {
    const prevCta = articleConfig.cta || {};
    const nextCta = {
      ...prevCta,
      ...updates,
    } as any;

    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        cta: nextCta,
      },
    });

    try {
      const { updateButtonStyle } = useButtonStore.getState();
      updateButtonStyle({
        bgColor: nextCta.backgroundColor || '#000000',
        textColor: nextCta.textColor || '#ffffff',
        borderColor: nextCta.borderColor || '#000000',
        borderRadius: typeof nextCta.borderRadius === 'number' ? nextCta.borderRadius : 9999,
        borderWidth: typeof nextCta.borderWidth === 'number' ? nextCta.borderWidth : 0,
        scale: typeof nextCta.scale === 'number' ? nextCta.scale : 1,
      });
    } catch (e) {
      console.warn('[ArticleModePanel] Failed to sync CTA to button store', e);
    }
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

  const handleHeaderImageChange = async (file: File | undefined) => {
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
          // @ts-ignore - header exists in ArticleConfig
          header: {
            ...(articleConfig as any)?.header,
            imageUrl: dataUrl,
          },
        },
      });
    } catch {}
  };

  const handleHeaderImageRemove = () => {
    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        // @ts-ignore - header exists in ArticleConfig
        header: { imageUrl: undefined },
      },
    });
  };

  const handleFooterImageChange = async (file: File | undefined) => {
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
          // @ts-ignore - footer exists in ArticleConfig
          footer: {
            ...(articleConfig as any)?.footer,
            imageUrl: dataUrl,
          },
        },
      });
    } catch {}
  };

  const handleFooterImageRemove = () => {
    onCampaignChange({
      articleConfig: {
        ...articleConfig,
        // @ts-ignore - footer exists in ArticleConfig
        footer: { imageUrl: undefined },
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

  // Panneau Bannière (accordéon + palette rapide)
  const renderBannerPanel = () => (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setBannerOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700"
        >
          Bannière + Couleurs (rapide)
          <span className="text-xs text-gray-500">{bannerOpen ? 'Masquer' : 'Afficher'}</span>
        </button>
        {bannerOpen && (
          <div className="p-3 space-y-4">
            {/* Uploader bannière */}
            <div>
              <h4 className="font-medium text-xs text-gray-700 mb-2">Bannière</h4>
              <label className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[#44444d] hover:text-white transition-colors flex flex-col items-center group cursor-pointer">
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

            {/* Palette de couleurs rapide (seconde palette) */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Couleurs unies (rapide)</h4>
              <div className="grid grid-cols-5 gap-2">
                {/* Couleurs personnalisées: cercle arc-en-ciel ouvrant un color picker */}
                <button
                  onClick={() => customBannerColorRef.current?.click()}
                  className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-gray-300 hover:scale-110 transition-transform relative overflow-hidden"
                  title="Couleurs personnalisées"
                >
                  <span
                    className="absolute inset-0"
                    style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                  />
                  <span className="relative block w-full h-full rounded-full border border-white/70" />
                </button>
                {[
                  '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
                  '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
                  '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
                  '#FFEAA7', '#DDA0DD', '#FF8C69', '#87CEEB'
                ].map((color) => (
                  <button
                    key={`quick-${color}`}
                    onClick={() => onCampaignChange({
                      articleConfig: {
                        ...articleConfig,
                        frameColor: color,
                      },
                    })}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-[#44444d] transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              {/* Hidden input for custom banner/frame color */}
              <input
                ref={customBannerColorRef}
                type="color"
                className="hidden"
                value={(articleConfig as any)?.frameColor || '#ffffff'}
                onChange={(e) => onCampaignChange({
                  articleConfig: {
                    ...articleConfig,
                    frameColor: e.target.value,
                  },
                })}
              />
            </div>

            {/* Cadre: arrondi + bordure */}
            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-700 mb-3">Cadre (arrondi + bordure)</h4>
              <div className="grid grid-cols-1 gap-4">
                {/* Rayon d'arrondi */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Arrondi du cadre (px)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={48}
                      step={1}
                      value={(articleConfig as any)?.frameBorderRadius ?? 0}
                      onChange={(e) => onCampaignChange({
                        articleConfig: {
                          ...articleConfig,
                          frameBorderRadius: Number(e.target.value),
                        },
                      })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#44444d]"
                    />
                    <input
                      type="number"
                      min={0}
                      max={96}
                      value={(articleConfig as any)?.frameBorderRadius ?? 0}
                      onChange={(e) => onCampaignChange({
                        articleConfig: {
                          ...articleConfig,
                          frameBorderRadius: Number(e.target.value),
                        },
                      })}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>

                {/* Épaisseur de bordure */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Épaisseur de bordure (px)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={16}
                      step={1}
                      value={(articleConfig as any)?.frameBorderWidth ?? 0}
                      onChange={(e) => onCampaignChange({
                        articleConfig: {
                          ...articleConfig,
                          frameBorderWidth: Number(e.target.value),
                        },
                      })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#44444d]"
                    />
                    <input
                      type="number"
                      min={0}
                      max={32}
                      value={(articleConfig as any)?.frameBorderWidth ?? 0}
                      onChange={(e) => onCampaignChange({
                        articleConfig: {
                          ...articleConfig,
                          frameBorderWidth: Number(e.target.value),
                        },
                      })}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>

                {/* Couleur de bordure */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Couleur de bordure</label>
                  <input
                    type="color"
                    value={(articleConfig as any)?.frameBorderColor ?? '#e5e7eb'}
                    onChange={(e) => onCampaignChange({
                      articleConfig: {
                        ...articleConfig,
                        frameBorderColor: e.target.value,
                      },
                    })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Apparence de page (Accordion) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setBgOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700"
        >
          Apparence de page (fond + couleurs)
          <span className="text-xs text-gray-500">{bgOpen ? 'Masquer' : 'Afficher'}</span>
        </button>
        {bgOpen && (
          <div className="p-3 space-y-6">
            {/* Fond de page complet */}
            <div>
              <h4 className="font-medium text-xs text-gray-700 mb-2">Fond de page (plein écran)</h4>
              <label className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[#44444d] hover:text-white transition-colors flex flex-col items-center group cursor-pointer">
                <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
                <span className="text-sm text-gray-600 group-hover:text-white">Télécharger une image de fond</span>
                <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG jusqu'à 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
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
                          pageBackground: {
                            ...(articleConfig as any)?.pageBackground,
                            imageUrl: dataUrl,
                          },
                        },
                      });
                      try {
                        const evt = new CustomEvent('applyFullPageBackground', { detail: { url: dataUrl } });
                        window.dispatchEvent(evt);
                      } catch {}
                    } catch {}
                  }}
                />
              </label>
              {(articleConfig as any)?.pageBackground?.imageUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={(articleConfig as any).pageBackground.imageUrl}
                    alt="Fond de page"
                    className="h-16 w-auto rounded border border-gray-200"
                  />
                  <button
                    onClick={() => {
                      onCampaignChange({
                        articleConfig: {
                          ...articleConfig,
                          pageBackground: { imageUrl: undefined },
                        },
                      });
                      try {
                        const evt = new CustomEvent('applyFullPageBackground', { detail: { url: undefined } });
                        window.dispatchEvent(evt);
                      } catch {}
                    }}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            {/* Palette de couleurs */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Couleurs unies</h4>
              <div className="grid grid-cols-5 gap-2">
                {/* Couleurs personnalisées: cercle arc-en-ciel ouvrant un color picker */}
                <button
                  onClick={() => customPageColorRef.current?.click()}
                  className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-gray-300 hover:scale-110 transition-transform relative overflow-hidden"
                  title="Couleurs personnalisées"
                >
                  <span
                    className="absolute inset-0"
                    style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                  />
                  <span className="relative block w-full h-full rounded-full border border-white/70" />
                </button>
                {[
                  '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
                  '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
                  '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
                  '#FFEAA7', '#DDA0DD', '#FF8C69', '#87CEEB'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => onCampaignChange({
                      articleConfig: {
                        ...articleConfig,
                        brandColors: {
                          ...(articleConfig as any)?.brandColors,
                          primary: color,
                        },
                      },
                    })}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-[#44444d] transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              {/* Hidden input for custom page brand primary color */}
              <input
                ref={customPageColorRef}
                type="color"
                className="hidden"
                value={(articleConfig as any)?.brandColors?.primary || '#44444d'}
                onChange={(e) => onCampaignChange({
                  articleConfig: {
                    ...articleConfig,
                    brandColors: {
                      ...(articleConfig as any)?.brandColors,
                      primary: e.target.value,
                    },
                  },
                })}
              />
              {/* Removed old visible custom color input in favor of rainbow circle */}
            </div>
          </div>
        )}
      </div>

      {/* Header uploader */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setHeaderOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700"
        >
          En-tête (header)
          <span className="text-xs text-gray-500">{headerOpen ? 'Masquer' : 'Afficher'}</span>
        </button>
        {headerOpen && (
          <div className="p-3">
            <label className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[#44444d] hover:text-white transition-colors flex flex-col items-center group cursor-pointer">
              <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
              <span className="text-sm text-gray-600 group-hover:text-white">Télécharger une image d'en-tête</span>
              <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG jusqu'à 10MB</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleHeaderImageChange(e.target.files?.[0])}
              />
            </label>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onCampaignChange({
                  articleConfig: {
                    ...articleConfig,
                    header: {
                      ...(articleConfig as any)?.header,
                      mode: 'cover',
                    },
                  },
                })}
                className={`px-3 py-1 text-xs rounded border ${((articleConfig as any)?.header?.mode || 'cover') === 'cover' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Remplir
              </button>
              <button
                onClick={() => onCampaignChange({
                  articleConfig: {
                    ...articleConfig,
                    header: {
                      ...(articleConfig as any)?.header,
                      mode: 'contain',
                    },
                  },
                })}
                className={`px-3 py-1 text-xs rounded border ${((articleConfig as any)?.header?.mode || 'cover') === 'contain' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Adapté
              </button>
            </div>
            {(articleConfig as any)?.header?.imageUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={(articleConfig as any).header.imageUrl}
                  alt="Header"
                  className="h-16 w-auto rounded border border-gray-200"
                />
                <button
                  onClick={handleHeaderImageRemove}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer uploader */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setFooterOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700"
        >
          Pied de page (footer)
          <span className="text-xs text-gray-500">{footerOpen ? 'Masquer' : 'Afficher'}</span>
        </button>
        {footerOpen && (
          <div className="p-3">
            <label className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[#44444d] hover:text-white transition-colors flex flex-col items-center group cursor-pointer">
              <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
              <span className="text-sm text-gray-600 group-hover:text-white">Télécharger une image de pied de page</span>
              <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG jusqu'à 10MB</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFooterImageChange(e.target.files?.[0])}
              />
            </label>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onCampaignChange({
                  articleConfig: {
                    ...articleConfig,
                    footer: {
                      ...(articleConfig as any)?.footer,
                      mode: 'cover',
                    },
                  },
                })}
                className={`px-3 py-1 text-xs rounded border ${((articleConfig as any)?.footer?.mode || 'cover') === 'cover' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Remplir
              </button>
              <button
                onClick={() => onCampaignChange({
                  articleConfig: {
                    ...articleConfig,
                    footer: {
                      ...(articleConfig as any)?.footer,
                      mode: 'contain',
                    },
                  },
                })}
                className={`px-3 py-1 text-xs rounded border ${((articleConfig as any)?.footer?.mode || 'cover') === 'contain' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Adapté
              </button>
            </div>
            {(articleConfig as any)?.footer?.imageUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={(articleConfig as any).footer.imageUrl}
                  alt="Footer"
                  className="h-16 w-auto rounded border border-gray-200"
                />
                <button
                  onClick={handleFooterImageRemove}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Panneau Texte (remplacé par le panel cloné de Full Screen)
  const renderTextPanel = () => (
    <ArticleTextPanel />
  );

  // Panneau Bouton
  const renderButtonPanel = () => (
    <div className="space-y-6">
      {/* Texte du bouton */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Texte du bouton</label>
        <input
          type="text"
          value={articleConfig.cta?.text || 'PARTICIPER !'}
          onChange={(e) => handleCTAChange({ text: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d]"
          placeholder="PARTICIPER !"
        />
      </div>

      {/* Couleurs de fond / texte */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Couleur de fond</label>
          <div className="space-y-2">
            <input
              type="color"
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              value={articleConfig.cta?.backgroundColor || '#000000'}
              onChange={(e) => handleCTAChange({ backgroundColor: e.target.value })}
            />
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
              value={articleConfig.cta?.backgroundColor || '#000000'}
              onChange={(e) => handleCTAChange({ backgroundColor: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Couleur du texte</label>
          <div className="space-y-2">
            <input
              type="color"
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              value={articleConfig.cta?.textColor || '#ffffff'}
              onChange={(e) => handleCTAChange({ textColor: e.target.value })}
            />
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
              value={articleConfig.cta?.textColor || '#ffffff'}
              onChange={(e) => handleCTAChange({ textColor: e.target.value })}
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Arrondi des angles */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Arrondi des angles</label>
          <span className="text-[11px] text-gray-600">{articleConfig.cta?.borderRadius ?? 9999}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={9999}
          value={articleConfig.cta?.borderRadius ?? 9999}
          onChange={(e) => handleCTAChange({ borderRadius: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Épaisseur de bordure */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Épaisseur de bordure</label>
          <span className="text-[11px] text-gray-600">{articleConfig.cta?.borderWidth ?? 0}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          value={articleConfig.cta?.borderWidth ?? 0}
          onChange={(e) => handleCTAChange({ borderWidth: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Couleur de bordure */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Couleur de bordure</label>
        <div className="space-y-2">
          <input
            type="color"
            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            value={articleConfig.cta?.borderColor || '#000000'}
            onChange={(e) => handleCTAChange({ borderColor: e.target.value })}
          />
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
            value={articleConfig.cta?.borderColor || '#000000'}
            onChange={(e) => handleCTAChange({ borderColor: e.target.value })}
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Majuscules / Gras / Ombre */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleCTAChange({ uppercase: !articleConfig.cta?.uppercase })}
          className={`px-3 py-1.5 rounded text-xs ${articleConfig.cta?.uppercase ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Majuscules
        </button>
        <button
          type="button"
          onClick={() => handleCTAChange({ bold: !articleConfig.cta?.bold })}
          className={`px-3 py-1.5 rounded text-xs ${articleConfig.cta?.bold ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Gras
        </button>
        <button
          type="button"
          onClick={() => handleCTAChange({ boxShadow: articleConfig.cta?.boxShadow ? '' : '0 12px 30px rgba(132,27,96,0.35)' })}
          className={`px-3 py-1.5 rounded text-xs ${articleConfig.cta?.boxShadow ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'}`}
        >
          Ombre
        </button>
      </div>

      <div className="h-px bg-gray-200" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
            Taille du bouton
          </label>
          <span className="text-[11px] text-gray-600">
            {Math.round((articleConfig.cta?.scale ?? 1) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={150}
          step={5}
          value={Math.round((articleConfig.cta?.scale ?? 1) * 100)}
          onChange={(e) => {
            const value = Number(e.target.value) / 100;
            handleCTAChange({ scale: value });
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#44444d]"
        />
        <p className="text-[11px] text-gray-500">
          Ajuste la taille globale du bouton (hauteur + largeur) sur tout le funnel.
        </p>
      </div>
    </div>
  );

  // Panneau Sortie (Result)
  const renderResultPanel = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Astuce :</strong> Personnalisez les messages affichés selon que le joueur gagne ou perd.
        </p>
      </div>

      {/* Sélecteur de message à éditer */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Message à éditer</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onGameResultChange?.('winner');
              onStepChange?.('result');
            }}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              currentGameResult === 'winner'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎉 Message GAGNANT
          </button>
          <button
            onClick={() => {
              onGameResultChange?.('loser');
              onStepChange?.('result');
            }}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              currentGameResult === 'loser'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            😔 Message PERDANT
          </button>
        </div>
      </div>

      {/* Indication du message actuel */}
      <div className={`p-4 rounded-lg ${
        currentGameResult === 'winner' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
      }`}>
        <p className="text-sm font-medium mb-2">
          {currentGameResult === 'winner' ? '🎉 Édition du message GAGNANT' : '😔 Édition du message PERDANT'}
        </p>
        <p className="text-xs text-gray-600">
          {currentGameResult === 'winner' 
            ? 'Ce message s\'affiche quand le joueur gagne un lot (segment avec dotation).'
            : 'Ce message s\'affiche quand le joueur ne gagne rien (segment sans dotation).'}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Comment ça marche ?</h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Cliquez sur un bouton ci-dessus pour choisir le message à éditer</li>
          <li>Modifiez le texte directement dans l'écran de sortie (étape 4)</li>
          <li>Le bon message s'affichera automatiquement selon le résultat du jeu</li>
        </ul>
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
              className="text-[#44444d] focus:ring-[#44444d] rounded"
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
              className="text-[#44444d] focus:ring-[#44444d] rounded"
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
              className="text-[#44444d] focus:ring-[#44444d] rounded"
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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444d] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ? 'text-[#44444d] border-b-2 border-[#44444d] bg-white'
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

  // Rendu selon le panneau actif (mode non-groupé ou pour 'funnel' ou 'result')
  switch (activePanel) {
    case 'banner':
      return renderBannerPanel();
    case 'text':
      return renderTextPanel();
    case 'button':
      return renderButtonPanel();
    case 'funnel':
      return renderFunnelPanel();
    case 'result':
      return renderResultPanel();
    default:
      return null;
  }
};

export default ArticleModePanel;
