'use client';

import React, { useState, useEffect, useMemo, lazy } from 'react';
import { useNavigate } from '@/lib/router-adapter';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { DEFAULT_ARTICLE_CONFIG, DEFAULT_ARTICLE_LAYOUT } from './types/ArticleTypes';
import type { OptimizedCampaign } from '../ModernEditor/types/CampaignTypes';
import { useCampaigns } from '@/hooks/useCampaigns';
import ArticleCanvas from './ArticleCanvas';

const ArticleSidebar = lazy(() => import('./ArticleSidebar'));

interface ArticleEditorLayoutProps {
  campaignType: 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form' | 'memory' | 'puzzle';
  campaignId?: string;
}

/**
 * ArticleEditorLayout - Mode Article avec le design du DesignEditor
 * 
 * Réutilise EXACTEMENT les mêmes composants visuels que DesignEditor:
 * - Même header avec logo et boutons
 * - Même toolbar en haut
 * - Même HybridSidebar (adaptée pour Article)
 * - Même zone de canvas/preview
 * - Seul le contenu central change: ArticleCanvas au lieu de DesignCanvas
 */
const ArticleEditorLayout: React.FC<ArticleEditorLayoutProps> = ({
  campaignType,
  campaignId,
}) => {
  const navigate = useNavigate();
  
  const { campaign, setCampaign, setIsLoading, setIsModified } = useEditorStore();
  const { saveCampaign } = useCampaigns();
  
  const [currentStep, setCurrentStep] = useState<'article' | 'form' | 'game' | 'result'>('article');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialisation de la campagne en mode Article
  useEffect(() => {
    if (!campaign || campaign.editorMode !== 'article') {
      const initialCampaign: OptimizedCampaign = {
        id: campaignId,
        name: 'Article - ' + campaignType.charAt(0).toUpperCase() + campaignType.slice(1),
        description: 'Campagne en mode Article',
        type: campaignType,
        editorMode: 'article',
        articleConfig: DEFAULT_ARTICLE_CONFIG,
        articleLayout: DEFAULT_ARTICLE_LAYOUT,
        design: {
          primaryColor: '#841b60',
          secondaryColor: '#b41b60',
        },
        gameConfig: {},
        buttonConfig: {},
        formFields: [
          { id: 'firstName', type: 'text', label: 'Prénom', required: true },
          { id: 'lastName', type: 'text', label: 'Nom', required: true },
          { id: 'email', type: 'email', label: 'Email', required: true },
        ],
      };
      
      setCampaign(initialCampaign);
      setIsLoading(false);
    }
  }, [campaign, campaignId, campaignType, setCampaign, setIsLoading]);

  // Configuration Article avec valeurs par défaut
  const articleConfig = useMemo(() => ({
    ...DEFAULT_ARTICLE_CONFIG,
    ...campaign?.articleConfig,
  }), [campaign?.articleConfig]);

  const articleLayout = useMemo(() => ({
    ...DEFAULT_ARTICLE_LAYOUT,
    ...campaign?.articleLayout,
  }), [campaign?.articleLayout]);

  // Handlers pour la bannière
  const handleBannerChange = (imageUrl: string) => {
    if (!campaign) return;
    
    setCampaign({
      ...campaign,
      articleConfig: {
        ...articleConfig,
        banner: {
          ...articleConfig.banner,
          imageUrl,
        },
      },
    });
    setIsModified(true);
  };

  const handleBannerRemove = () => {
    if (!campaign) return;
    
    setCampaign({
      ...campaign,
      articleConfig: {
        ...articleConfig,
        banner: {
          ...articleConfig.banner,
          imageUrl: undefined,
        },
      },
    });
    setIsModified(true);
  };

  // Handlers pour le contenu texte
  const handleTitleChange = (title: string) => {
    if (!campaign) return;
    
    setCampaign({
      ...campaign,
      articleConfig: {
        ...articleConfig,
        content: {
          ...articleConfig.content,
          title,
        },
      },
    });
    setIsModified(true);
  };

  const handleDescriptionChange = (description: string) => {
    if (!campaign) return;
    
    setCampaign({
      ...campaign,
        articleConfig: {
          ...articleConfig,
          content: {
            ...articleConfig.content,
            description,
          },
        },
    });
    setIsModified(true);
  };

  // Handler pour le bouton CTA
  const handleCTAClick = () => {
    console.log('🎯 CTA clicked, moving to next step');
    setCurrentStep('form');
  };

  // Handler pour la soumission du formulaire
  const handleFormSubmit = (data: Record<string, string>) => {
    console.log('📝 Form submitted:', data);
    // Ici vous pouvez sauvegarder les données du formulaire
    setCurrentStep('game');
  };

  // Handler pour la fin du jeu
  const handleGameComplete = () => {
    console.log('🎮 Game completed');
    setCurrentStep('result');
  };

  // Synchroniser les uploads d'image de fond (panneau gauche) avec la bannière en mode Article
  // Le DesignEditor envoie des événements personnalisés que nous écoutons ici pour mettre à jour
  // `articleConfig.banner.imageUrl` afin que l'image apparaisse immédiatement sur le canvas Article.
  useEffect(() => {
    const handleApplyBackgroundCurrent = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { url?: string } | undefined;
      const url = detail?.url;
      if (!url || !campaign) return;
      setCampaign({
        ...campaign,
        articleConfig: {
          ...articleConfig,
          banner: {
            ...articleConfig.banner,
            imageUrl: url,
          },
        },
      });
      setIsModified(true);
    };

    const handleApplyBackgroundAll = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { url?: string } | undefined;
      const url = detail?.url;
      if (!url || !campaign) return;
      setCampaign({
        ...campaign,
        articleConfig: {
          ...articleConfig,
          banner: {
            ...articleConfig.banner,
            imageUrl: url,
          },
        },
      });
      setIsModified(true);
    };

    const handleClearBackgroundOtherScreens = (_e: Event) => {
      if (!campaign) return;
      setCampaign({
        ...campaign,
        articleConfig: {
          ...articleConfig,
          banner: {
            ...articleConfig.banner,
            imageUrl: undefined,
          },
        },
      });
      setIsModified(true);
    };

    window.addEventListener('applyBackgroundCurrentScreen', handleApplyBackgroundCurrent as EventListener);
    window.addEventListener('applyBackgroundAllScreens', handleApplyBackgroundAll as EventListener);
    window.addEventListener('clearBackgroundOtherScreens', handleClearBackgroundOtherScreens as EventListener);

    return () => {
      window.removeEventListener('applyBackgroundCurrentScreen', handleApplyBackgroundCurrent as EventListener);
      window.removeEventListener('applyBackgroundAllScreens', handleApplyBackgroundAll as EventListener);
      window.removeEventListener('clearBackgroundOtherScreens', handleClearBackgroundOtherScreens as EventListener);
    };
  }, [campaign, articleConfig, setCampaign, setIsModified]);

  // Sauvegarde de la campagne
  const handleSave = async () => {
    if (!campaign) return;
    
    setIsSaving(true);
    try {
      await saveCampaign(campaign as any);
      setIsModified(false);
      console.log('✅ Campagne Article sauvegardée');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la campagne');
    } finally {
      setIsSaving(false);
    }
  };

  // Retour au dashboard
  const handleClose = () => {
    if (confirm('Voulez-vous quitter l\'éditeur Article ? Les modifications non sauvegardées seront perdues.')) {
      navigate('/dashboard');
    }
  };

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#841b60] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'éditeur Article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="article-editor-layout flex h-screen bg-gray-100">
      {/* Barre latérale */}
      {sidebarOpen && (
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <ArticleSidebar
            articleConfig={articleConfig}
            onArticleConfigChange={(updates) => {
              if (!campaign) return;
              setCampaign({
                ...campaign,
                articleConfig: {
                  ...articleConfig,
                  ...updates,
                },
              });
              setIsModified(true);
            }}
            campaignType={campaignType}
          />
        </div>
      )}

      {/* Zone principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header avec boutons d'action */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? 'Masquer panneau' : 'Afficher panneau'}
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <span className="text-sm text-gray-600">
              Mode Article • {articleLayout.width}×{articleLayout.height}px
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isPreviewMode
                  ? 'bg-[#841b60] text-white hover:bg-[#6d164f]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isPreviewMode ? (
                <>
                  <EyeOff className="w-4 h-4 inline mr-2" />
                  Mode Édition
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 inline mr-2" />
                  Prévisualiser
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 text-sm rounded-lg bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-medium hover:from-[#841b60] hover:to-[#6d164f] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>

            <button
              onClick={handleClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer l'éditeur"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zone de contenu Article (810×1200 centré) */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <ArticleCanvas
            articleConfig={articleConfig}
            onBannerChange={handleBannerChange}
            onBannerRemove={handleBannerRemove}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            onCTAClick={handleCTAClick}
            onFormSubmit={handleFormSubmit}
            onGameComplete={handleGameComplete}
            currentStep={currentStep}
            editable={!isPreviewMode}
            maxWidth={articleLayout.maxWidth}
            campaignType={campaignType}
            formFields={campaign?.formFields}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorLayout;
