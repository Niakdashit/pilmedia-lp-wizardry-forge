import React, { useState } from 'react';
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
      {/* Police du Funnel */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Police du funnel</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Police principale</label>
            <select
              value={articleConfig.theme?.fontFamily || 'Inter, system-ui, sans-serif'}
              onChange={(e) => onArticleConfigChange({
                theme: {
                  ...articleConfig.theme,
                  fontFamily: e.target.value,
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="Inter, system-ui, sans-serif">Inter (Moderne)</option>
              <option value="system-ui, sans-serif">System (Classique)</option>
              <option value="Georgia, serif">Georgia (Élégant)</option>
              <option value="Arial, sans-serif">Arial (Simple)</option>
              <option value="Times New Roman, serif">Times New Roman (Traditionnel)</option>
              <option value="Helvetica, sans-serif">Helvetica (Pro)</option>
              <option value="Roboto, sans-serif">Roboto (Moderne)</option>
              <option value="Open Sans, sans-serif">Open Sans (Lisible)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Police des titres</label>
            <select
              value={articleConfig.theme?.headingFontFamily || 'Inter, system-ui, sans-serif'}
              onChange={(e) => onArticleConfigChange({
                theme: {
                  ...articleConfig.theme,
                  headingFontFamily: e.target.value,
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="Inter, system-ui, sans-serif">Inter (Moderne)</option>
              <option value="system-ui, sans-serif">System (Classique)</option>
              <option value="Georgia, serif">Georgia (Élégant)</option>
              <option value="Arial, sans-serif">Arial (Simple)</option>
              <option value="Times New Roman, serif">Times New Roman (Traditionnel)</option>
              <option value="Helvetica, sans-serif">Helvetica (Pro)</option>
              <option value="Roboto, sans-serif">Roboto (Moderne)</option>
              <option value="Open Sans, sans-serif">Open Sans (Lisible)</option>
              <option value="Playfair Display, serif">Playfair Display (Élégant)</option>
              <option value="Montserrat, sans-serif">Montserrat (Audacieux)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* Styles des Boutons Globaux */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Style des boutons (Global)</h3>
        <p className="text-xs text-gray-500 mb-4">Ces styles s'appliquent à tous les boutons du funnel (Participer, Valider, Rejouer, etc.)</p>

        <div className="space-y-4">
          {/* Couleurs principales */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Fond</label>
              <input
                type="color"
                value={articleConfig.theme?.buttonStyle?.backgroundColor || '#841b60'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      backgroundColor: e.target.value,
                    },
                  },
                })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Texte</label>
              <input
                type="color"
                value={articleConfig.theme?.buttonStyle?.textColor || '#ffffff'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      textColor: e.target.value,
                    },
                  },
                })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Hover */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Fond au survol</label>
              <input
                type="color"
                value={articleConfig.theme?.buttonStyle?.hoverBackgroundColor || '#6d164f'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      hoverBackgroundColor: e.target.value,
                    },
                  },
                })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Texte au survol</label>
              <input
                type="color"
                value={articleConfig.theme?.buttonStyle?.hoverTextColor || '#ffffff'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      hoverTextColor: e.target.value,
                    },
                  },
                })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Bordures */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Bordure</label>
              <input
                type="color"
                value={articleConfig.theme?.buttonStyle?.borderColor || '#841b60'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      borderColor: e.target.value,
                    },
                  },
                })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Épaisseur bordure</label>
              <select
                value={articleConfig.theme?.buttonStyle?.borderWidth || '0px'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      borderWidth: e.target.value,
                    },
                  },
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              >
                <option value="0px">Aucune</option>
                <option value="1px">Fine</option>
                <option value="2px">Moyenne</option>
                <option value="3px">Épaisse</option>
              </select>
            </div>
          </div>

          {/* Typographie */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Taille texte</label>
              <select
                value={articleConfig.theme?.buttonStyle?.fontSize || '16px'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      fontSize: e.target.value,
                    },
                  },
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              >
                <option value="14px">Petit</option>
                <option value="16px">Normal</option>
                <option value="18px">Grand</option>
                <option value="20px">Très grand</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Graisse</label>
              <select
                value={articleConfig.theme?.buttonStyle?.fontWeight || '600'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      fontWeight: e.target.value,
                    },
                  },
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              >
                <option value="400">Normal</option>
                <option value="500">Moyen</option>
                <option value="600">Gras</option>
                <option value="700">Très gras</option>
              </select>
            </div>
          </div>

          {/* Coins arrondis et espacement */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Coins arrondis</label>
              <select
                value={articleConfig.theme?.buttonStyle?.borderRadius || '8px'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      borderRadius: e.target.value,
                    },
                  },
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              >
                <option value="0px">Carré</option>
                <option value="4px">Léger</option>
                <option value="8px">Normal</option>
                <option value="12px">Arrondi</option>
                <option value="16px">Très arrondi</option>
                <option value="50px">Pills</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Espacement interne</label>
              <select
                value={articleConfig.theme?.buttonStyle?.padding || '12px 24px'}
                onChange={(e) => onArticleConfigChange({
                  theme: {
                    ...articleConfig.theme,
                    buttonStyle: {
                      ...articleConfig.theme?.buttonStyle,
                      padding: e.target.value,
                    },
                  },
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              >
                <option value="8px 16px">Compact</option>
                <option value="10px 20px">Normal</option>
                <option value="12px 24px">Confortable</option>
                <option value="14px 28px">Large</option>
                <option value="16px 32px">Extra large</option>
              </select>
            </div>
          </div>

          {/* Ombre */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ombre</label>
            <select
              value={articleConfig.theme?.buttonStyle?.boxShadow || '0 2px 4px rgba(0,0,0,0.1)'}
              onChange={(e) => onArticleConfigChange({
                theme: {
                  ...articleConfig.theme,
                  buttonStyle: {
                    ...articleConfig.theme?.buttonStyle,
                    boxShadow: e.target.value,
                  },
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="none">Aucune</option>
              <option value="0 1px 2px rgba(0,0,0,0.1)">Légère</option>
              <option value="0 2px 4px rgba(0,0,0,0.1)">Normale</option>
              <option value="0 4px 8px rgba(0,0,0,0.15)">Moyenne</option>
              <option value="0 8px 16px rgba(0,0,0,0.2)">Forte</option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* Titre du Formulaire de Contact */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Titre du formulaire de contact</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Taille</label>
            <select
              value={articleConfig.theme?.formTitleStyle?.fontSize || '1.875rem'}
              onChange={(e) => onArticleConfigChange({
                theme: {
                  ...articleConfig.theme,
                  formTitleStyle: {
                    ...articleConfig.theme?.formTitleStyle,
                    fontSize: e.target.value,
                  },
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="1.5rem">Petit</option>
              <option value="1.875rem">Normal</option>
              <option value="2.25rem">Grand</option>
              <option value="3rem">Très grand</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur</label>
            <input
              type="color"
              value={articleConfig.theme?.formTitleStyle?.color || '#1f2937'}
              onChange={(e) => onArticleConfigChange({
                theme: {
                  ...articleConfig.theme,
                  formTitleStyle: {
                    ...articleConfig.theme?.formTitleStyle,
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
              value={articleConfig.theme?.formTitleStyle?.textAlign || 'center'}
              onChange={(e) => onArticleConfigChange({
                theme: {
                  ...articleConfig.theme,
                  formTitleStyle: {
                    ...articleConfig.theme?.formTitleStyle,
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

          <div>
            <label className="block text-xs text-gray-600 mb-1">Marge inférieure</label>
            <select
              value={articleConfig.theme?.formTitleStyle?.marginBottom || '1rem'}
              onChange={(e) => onArticleConfigChange({
                theme: {
                  ...articleConfig.theme,
                  formTitleStyle: {
                    ...articleConfig.theme?.formTitleStyle,
                    marginBottom: e.target.value,
                  },
                },
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            >
              <option value="0.5rem">Petite</option>
              <option value="1rem">Normale</option>
              <option value="1.5rem">Grande</option>
              <option value="2rem">Très grande</option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* Message de Sortie */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Message de sortie</h3>
        <p className="text-xs text-gray-500 mb-3">Ce message s'affiche à la fin du funnel (étape Résultat)</p>

        <textarea
          value={articleConfig.theme?.exitMessage || "Merci d'avoir participé !\n\nVous recevrez un email de confirmation avec les détails de votre participation."}
          onChange={(e) => onArticleConfigChange({
            theme: {
              ...articleConfig.theme,
              exitMessage: e.target.value,
            },
          })}
          placeholder="Message affiché à la fin du funnel..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] resize-none"
          rows={4}
        />
      </div>

      <div>
        <p className="text-xs text-gray-500 leading-relaxed">
          💡 Les modifications de style s'appliquent en temps réel dans l'aperçu.
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
        {activeTab === 'banner' && renderBannerPanel()}
        {activeTab === 'text' && renderTextPanel()}
        {activeTab === 'button' && renderButtonPanel()}
        {activeTab === 'funnel' && renderFunnelPanel()}
      </div>
    </div>
  );
};

export default ArticleSidebar;
