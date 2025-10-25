// @ts-nocheck
import React, { useState } from 'react';
import { Image, Type, MousePointer, List, Palette, Plus, FormInput, Gamepad2, MessageSquare } from 'lucide-react';
import type { ArticleConfig } from '@/components/ArticleEditor/types/ArticleTypes';
import { BackgroundPanel, CompositeElementsPanel } from '@/components/shared';
import ModernFormTab from '../ModernEditor/ModernFormTab';
import GameManagementPanel from '../DesignEditor/panels/GameManagementPanel';
import MessagesPanel from '../DesignEditor/panels/MessagesPanel';

interface ArticleSidebarProps {
  articleConfig: ArticleConfig;
  onArticleConfigChange: (updates: Partial<ArticleConfig>) => void;
  campaignType: string;
  // Props pour les onglets HybridSidebar
  onAddElement?: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  extractedColors?: string[];
  campaignConfig?: any;
  onCampaignConfigChange?: (cfg: any) => void;
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

type TabType = 'banner' | 'text' | 'button' | 'funnel' | 'background' | 'elements' | 'form' | 'game' | 'messages';

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
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  currentBackground,
  extractedColors,
  campaignConfig,
  onCampaignConfigChange,
  elements,
  onElementsChange,
  selectedElement,
  onElementUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('banner');

  // Tous les onglets : Article + HybridSidebar
  const tabs = [
    // Onglets Article
    { id: 'banner' as TabType, label: 'Bannière', icon: Image },
    { id: 'text' as TabType, label: 'Texte', icon: Type },
    { id: 'button' as TabType, label: 'Bouton', icon: MousePointer },
    { id: 'funnel' as TabType, label: 'Funnel', icon: List },
    // Onglets HybridSidebar
    { id: 'background' as TabType, label: 'Design', icon: Palette },
    { id: 'elements' as TabType, label: 'Éléments', icon: Plus },
    { id: 'form' as TabType, label: 'Formulaire', icon: FormInput },
    { id: 'game' as TabType, label: 'Jeu', icon: Gamepad2 },
    { id: 'messages' as TabType, label: 'Sortie', icon: MessageSquare },
  ];

  // Panneau Bannière
  const renderBannerPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Ratio d'image</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="aspectRatio"
              checked={articleConfig.banner?.aspectRatio === '2215/1536'}
              onChange={() => onArticleConfigChange({
                banner: { ...articleConfig.banner, aspectRatio: '2215/1536' }
              })}
              className="text-[#841b60] focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">2215×1536px (Standard)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="aspectRatio"
              checked={articleConfig.banner?.aspectRatio === '1500/744'}
              onChange={() => onArticleConfigChange({
                banner: { ...articleConfig.banner, aspectRatio: '1500/744' }
              })}
              className="text-[#841b60] focus:ring-[#841b60]"
            />
            <span className="text-sm text-gray-700">1500×744px (Panoramique)</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Double-cliquez sur la zone de bannière pour uploader ou remplacer l'image. 
          La bannière reste visible à toutes les étapes du funnel.
        </p>
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
            <label className="block text-xs text-gray-600 mb-1">Taille</label>
            <input
              type="text"
              value={articleConfig.content?.titleStyle?.fontSize || '32px'}
              onChange={(e) => onArticleConfigChange({
                content: {
                  ...articleConfig.content,
                  titleStyle: {
                    ...articleConfig.content?.titleStyle,
                    fontSize: e.target.value,
                  },
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="2rem"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur</label>
            <input
              type="color"
              value={articleConfig.content?.titleStyle?.color || '#1f2937'}
              onChange={(e) => onArticleConfigChange({
                content: {
                  ...articleConfig.content,
                  titleStyle: {
                    ...articleConfig.content?.titleStyle,
                    color: e.target.value,
                  },
                },
              })}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Alignement</label>
            <select
              value={articleConfig.content?.titleStyle?.textAlign || 'center'}
              onChange={(e) => onArticleConfigChange({
                content: {
                  ...articleConfig.content,
                  titleStyle: {
                    ...articleConfig.content?.titleStyle,
                    textAlign: e.target.value as 'left' | 'center' | 'right',
                  },
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="left">Gauche</option>
              <option value="center">Centré</option>
              <option value="right">Droite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200"></div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Style de la description</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Taille</label>
            <input
              type="text"
              value={articleConfig.content?.descriptionStyle?.fontSize || '1rem'}
              onChange={(e) => onArticleConfigChange({
                content: {
                  ...articleConfig.content,
                  descriptionStyle: {
                    ...articleConfig.content?.descriptionStyle,
                    fontSize: e.target.value,
                  },
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="1rem"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur</label>
            <input
              type="color"
              value={articleConfig.content?.descriptionStyle?.color || '#4b5563'}
              onChange={(e) => onArticleConfigChange({
                content: {
                  ...articleConfig.content,
                  descriptionStyle: {
                    ...articleConfig.content?.descriptionStyle,
                    color: e.target.value,
                  },
                },
              })}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 leading-relaxed">
          💡 Double-cliquez sur le titre ou la description dans l'aperçu pour les éditer directement.
        </p>
      </div>
    </div>
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
          onChange={(e) => onArticleConfigChange({
            cta: { ...articleConfig.cta, text: e.target.value },
          })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          placeholder="PARTICIPER !"
        />
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* Couleurs du bouton */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Couleurs</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur de fond</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={articleConfig.cta?.backgroundColor || '#841b60'}
                onChange={(e) => onArticleConfigChange({
                  cta: { ...articleConfig.cta, backgroundColor: e.target.value },
                })}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={articleConfig.cta?.backgroundColor || '#841b60'}
                onChange={(e) => onArticleConfigChange({
                  cta: { ...articleConfig.cta, backgroundColor: e.target.value },
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                placeholder="#841b60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur du texte</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={articleConfig.cta?.textColor || '#ffffff'}
                onChange={(e) => onArticleConfigChange({
                  cta: { ...articleConfig.cta, textColor: e.target.value },
                })}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={articleConfig.cta?.textColor || '#ffffff'}
                onChange={(e) => onArticleConfigChange({
                  cta: { ...articleConfig.cta, textColor: e.target.value },
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* Forme du bouton */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Forme</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Arrondi des angles</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="50"
                value={articleConfig.cta?.borderRadius || 8}
                onChange={(e) => onArticleConfigChange({
                  cta: { ...articleConfig.cta, borderRadius: parseInt(e.target.value) },
                })}
                className="flex-1"
              />
              <div className="w-12 text-right text-xs text-gray-700">
                {articleConfig.cta?.borderRadius || 8}px
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Taille</label>
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
        </div>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* Contour du bouton */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Contour</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Épaisseur</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                value={articleConfig.cta?.borderWidth || 0}
                onChange={(e) => onArticleConfigChange({
                  cta: { ...articleConfig.cta, borderWidth: parseInt(e.target.value) },
                })}
                className="flex-1"
              />
              <div className="w-12 text-right text-xs text-gray-700">
                {articleConfig.cta?.borderWidth || 0}px
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur du contour</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={articleConfig.cta?.borderColor || '#841b60'}
                onChange={(e) => onArticleConfigChange({
                  cta: { ...articleConfig.cta, borderColor: e.target.value },
                })}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                disabled={!articleConfig.cta?.borderWidth}
              />
              <input
                type="text"
                value={articleConfig.cta?.borderColor || '#841b60'}
                onChange={(e) => onArticleConfigChange({
                  cta: { ...articleConfig.cta, borderColor: e.target.value },
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="#841b60"
                disabled={!articleConfig.cta?.borderWidth}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* Icône */}
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
        {/* Panneaux Article */}
        {activeTab === 'banner' && renderBannerPanel()}
        {activeTab === 'text' && renderTextPanel()}
        {activeTab === 'button' && renderButtonPanel()}
        {activeTab === 'funnel' && renderFunnelPanel()}
        
        {/* Panneaux HybridSidebar */}
        {activeTab === 'background' && onBackgroundChange && (
          <BackgroundPanel
            onBackgroundChange={onBackgroundChange}
            onExtractedColorsChange={onExtractedColorsChange}
            currentBackground={currentBackground}
            extractedColors={extractedColors}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        )}
        
        {activeTab === 'elements' && onAddElement && (
          <CompositeElementsPanel
            onAddElement={onAddElement}
            elements={elements}
            onElementsChange={onElementsChange}
            currentScreen="screen1"
            onAddModule={() => {}}
          />
        )}
        
        {activeTab === 'form' && campaignConfig && onCampaignConfigChange && (
          <ModernFormTab
            campaign={campaignConfig}
            setCampaign={onCampaignConfigChange}
          />
        )}
        
        {activeTab === 'game' && campaignConfig && onCampaignConfigChange && (
          <GameManagementPanel
            campaign={campaignConfig}
            setCampaign={onCampaignConfigChange}
          />
        )}
        
        {activeTab === 'messages' && onCampaignConfigChange && (
          <MessagesPanel
            campaignConfig={campaignConfig}
            onCampaignConfigChange={onCampaignConfigChange}
          />
        )}
      </div>
    </div>
  );
};

export default ArticleSidebar;
