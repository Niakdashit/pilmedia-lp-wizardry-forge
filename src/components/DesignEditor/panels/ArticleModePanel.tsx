import React from 'react';
import { Upload, Type, MousePointer, List } from 'lucide-react';
import type { OptimizedCampaign } from '../../ModernEditor/types/CampaignTypes';

interface ArticleModePanelProps {
  campaign: OptimizedCampaign | null;
  onCampaignChange: (updates: Partial<OptimizedCampaign>) => void;
  activePanel: 'banner' | 'text' | 'button' | 'funnel';
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
}) => {
  const articleConfig = campaign?.articleConfig || {};

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

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 leading-relaxed">
          💡 Double-cliquez sur la zone de bannière dans le canvas pour uploader une image. 
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
              value={articleConfig.content?.titleStyle?.fontSize || '2rem'}
              onChange={(e) => handleTitleStyle({ fontSize: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="2rem"
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
              onChange={(e) => handleDescriptionStyle({ fontSize: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="1rem"
            />
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

  // Rendu selon le panneau actif
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
