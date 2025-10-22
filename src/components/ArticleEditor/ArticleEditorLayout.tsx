'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@/lib/router-adapter';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { DEFAULT_ARTICLE_CONFIG, DEFAULT_ARTICLE_LAYOUT } from './types/ArticleTypes';
import type { OptimizedCampaign } from '../ModernEditor/types/CampaignTypes';
import { useCampaigns } from '@/hooks/useCampaigns';

// Import des composants Article
import ArticleSidebar from './ArticleSidebar';
import ArticleBanner from './components/ArticleBanner';
import EditableText from './components/EditableText';
import ArticleCTA from './components/ArticleCTA';

interface ArticleEditorLayoutProps {
  campaignType: 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form' | 'memory' | 'puzzle';
  campaignId?: string;
}

/**
 * ArticleEditorLayout - Mode Article avec sidebar personnalisée
 * 
 * Utilise ArticleSidebar pour une personnalisation complète:
 * - Onglet Bannière pour l'image de fond
 * - Onglet Texte pour le titre et la description
 * - Onglet Bouton pour la personnalisation complète du CTA
 * - Onglet Funnel pour la configuration du parcours
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
    // Navigation vers l'étape suivante du funnel
    const steps = articleConfig.funnelFlow?.steps || ['article', 'form', 'game', 'result'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as typeof currentStep);
    }
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
      await saveCampaign(campaign);
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

  // Rendu du contenu selon l'étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 'article':
        return (
          <>
            <EditableText
              title={articleConfig.content?.title}
              description={articleConfig.content?.description}
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
              editable={!isPreviewMode}
              maxWidth={articleLayout.maxWidth}
            />
            
            <ArticleCTA
              text={articleConfig.cta?.text}
              variant={articleConfig.cta?.variant}
              size={articleConfig.cta?.size}
              icon={articleConfig.cta?.icon}
              onClick={handleCTAClick}
              disabled={isPreviewMode}
              maxWidth={articleLayout.maxWidth}
              backgroundColor={articleConfig.cta?.backgroundColor}
              textColor={articleConfig.cta?.textColor}
              borderRadius={articleConfig.cta?.borderRadius}
              borderColor={articleConfig.cta?.borderColor}
              borderWidth={articleConfig.cta?.borderWidth}
            />
          </>
        );
      
      case 'form':
        return (
          <div className="py-8 px-6" style={{ maxWidth: `${articleLayout.maxWidth}px` }}>
            <p className="text-center text-gray-600">
              Formulaire de contact (à implémenter avec le formulaire existant)
            </p>
          </div>
        );
      
      case 'game':
        return (
          <div className="py-8 px-6" style={{ maxWidth: `${articleLayout.maxWidth}px` }}>
            <p className="text-center text-gray-600">
              Mécanique de jeu ({campaignType}) (à implémenter avec le jeu existant)
            </p>
          </div>
        );
      
      case 'result':
        return (
          <div className="py-8 px-6" style={{ maxWidth: `${articleLayout.maxWidth}px` }}>
            <h2 className="text-2xl font-bold text-center mb-4">Merci d'avoir participé !</h2>
            <p className="text-center text-gray-600">
              Vous recevrez un email de confirmation avec les détails de votre participation.
            </p>
          </div>
        );
      
      default:
        return null;
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
          <div 
            className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              width: `${articleLayout.width}px`,
              minHeight: `${articleLayout.height}px`,
            }}
          >
            {/* Bannière (toujours visible) */}
            <ArticleBanner
              imageUrl={articleConfig.banner?.imageUrl}
              onImageChange={handleBannerChange}
              onImageRemove={handleBannerRemove}
              editable={!isPreviewMode}
              aspectRatio={articleConfig.banner?.aspectRatio}
              maxWidth={articleLayout.maxWidth}
            />

            {/* Contenu selon l'étape */}
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorLayout;
