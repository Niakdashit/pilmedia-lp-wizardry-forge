import React, { useState } from 'react';
import ArticleTextPanel from './panels/ArticleTextPanel';
import { Image, Type, MousePointer, List } from 'lucide-react';
import type { ArticleConfig } from './types/ArticleTypes';

interface ArticleSidebarProps {
  articleConfig: ArticleConfig;
  onArticleConfigChange: (updates: Partial<ArticleConfig>) => void;
  campaignType: string;
}

type TabType = 'banner' | 'text' | 'button' | 'funnel';

/**
 * ArticleSidebar - Panneau latéral adapté au mode Article
 * 
 * Onglets disponibles:
 * - Bannière: Upload/remplacement d'image
 * - Texte: Édition contenu et typographie
 * - Bouton: Personnalisation CTA
 * - Funnel: Configuration du parcours
 */
const ArticleSidebar: React.FC<ArticleSidebarProps> = ({
  articleConfig,
  onArticleConfigChange,
  campaignType,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('banner');

  const tabs = [
    { id: 'banner' as TabType, label: 'Bannière', icon: Image },
    { id: 'text' as TabType, label: 'Texte', icon: Type },
    { id: 'button' as TabType, label: 'Bouton', icon: MousePointer },
    { id: 'funnel' as TabType, label: 'Funnel', icon: List },
  ];

  // Panneau Bannière
  const renderBannerPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Double-cliquez sur la zone de bannière pour uploader ou remplacer l'image. 
          La bannière reste visible à toutes les étapes du funnel et s'adapte automatiquement au format panoramique.
        </p>
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
                onChange={(e) => onArticleConfigChange({
                  frameBorderRadius: Number(e.target.value),
                })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#841b60]"
              />
              <input
                type="number"
                min={0}
                max={96}
                value={(articleConfig as any)?.frameBorderRadius ?? 0}
                onChange={(e) => onArticleConfigChange({
                  frameBorderRadius: Number(e.target.value),
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
                onChange={(e) => onArticleConfigChange({
                  frameBorderWidth: Number(e.target.value),
                })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#841b60]"
              />
              <input
                type="number"
                min={0}
                max={32}
                value={(articleConfig as any)?.frameBorderWidth ?? 0}
                onChange={(e) => onArticleConfigChange({
                  frameBorderWidth: Number(e.target.value),
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
              onChange={(e) => onArticleConfigChange({
                frameBorderColor: e.target.value,
              })}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Panneau Texte (nouveau panel cloné du Full Screen)
  const renderTextPanel = () => (
    <ArticleTextPanel />
  );

  // Panneau Bouton
  const renderButtonPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Texte du bouton</label>
        <input
          type="text"
          value={articleConfig.cta?.text || 'PARTICIPER !'}
          onChange={(e) => onArticleConfigChange({
            cta: { ...articleConfig.cta, text: e.target.value },
          })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          placeholder="PARTICIPER !"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Taille</label>
        <select
          value={articleConfig.cta?.size || 'large'}
          onChange={(e) => onArticleConfigChange({
            cta: { ...articleConfig.cta, size: e.target.value as 'small' | 'medium' | 'large' },
          })}
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
          onChange={(e) => onArticleConfigChange({
            cta: { ...articleConfig.cta, variant: e.target.value as 'primary' | 'secondary' | 'outline' },
          })}
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
          onChange={(e) => onArticleConfigChange({
            cta: { ...articleConfig.cta, icon: e.target.value as 'arrow' | 'external' | 'play' | 'none' },
          })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        >
          <option value="arrow">Flèche →</option>
          <option value="external">Lien externe ↗</option>
          <option value="play">Play ▶</option>
          <option value="none">Aucune</option>
        </select>
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
              onChange={(e) => onArticleConfigChange({
                funnelFlow: {
                  ...articleConfig.funnelFlow,
                  formStep: {
                    ...articleConfig.funnelFlow?.formStep,
                    enabled: e.target.checked,
                    position: articleConfig.funnelFlow?.formStep?.position || 'before-game',
                  },
                },
              })}
              className="text-[#841b60] focus:ring-[#841b60] rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">3. Jeu ({campaignType})</span>
            <input
              type="checkbox"
              checked={articleConfig.funnelFlow?.gameStep?.enabled ?? true}
              onChange={(e) => onArticleConfigChange({
                funnelFlow: {
                  ...articleConfig.funnelFlow,
                  gameStep: {
                    ...articleConfig.funnelFlow?.gameStep,
                    enabled: e.target.checked,
                  },
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
              onChange={(e) => onArticleConfigChange({
                funnelFlow: {
                  ...articleConfig.funnelFlow,
                  resultStep: {
                    ...articleConfig.funnelFlow?.resultStep,
                    enabled: e.target.checked,
                  },
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
          onChange={(e) => onArticleConfigChange({
            funnelFlow: {
              ...articleConfig.funnelFlow,
              formStep: {
                ...articleConfig.funnelFlow?.formStep,
                position: e.target.value as 'before-game' | 'after-game',
                enabled: articleConfig.funnelFlow?.formStep?.enabled ?? true,
              },
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

  return (
    <div className="article-sidebar flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Mode Article</h2>
        <p className="text-xs text-gray-500 mt-1">810×1200px • Simplifié</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#841b60] border-b-2 border-[#841b60] bg-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'banner' && renderBannerPanel()}
        {activeTab === 'text' && renderTextPanel()}
        {activeTab === 'button' && renderButtonPanel()}
        {activeTab === 'funnel' && renderFunnelPanel()}
      </div>
    </div>
  );
};

export default ArticleSidebar;
