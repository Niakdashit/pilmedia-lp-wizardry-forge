import React from 'react';
import ArticleBanner from './components/ArticleBanner';
import EditableText from './components/EditableText';
import ArticleCTA from './components/ArticleCTA';
import type { ArticleConfig } from './types/ArticleTypes';

interface ArticleCanvasProps {
  articleConfig: ArticleConfig;
  onBannerChange: (imageUrl: string) => void;
  onBannerRemove: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCTAClick: () => void;
  currentStep: 'article' | 'form' | 'game' | 'result';
  editable: boolean;
  maxWidth?: number;
  campaignType: string;
}

/**
 * ArticleCanvas - Zone de contenu central pour le mode Article
 * 
 * Contient: Bannière + Texte + CTA dans un format 810×1200px
 * S'affiche dans la zone centrale du DesignEditor (comme les modules)
 */
const ArticleCanvas: React.FC<ArticleCanvasProps> = ({
  articleConfig,
  onBannerChange,
  onBannerRemove,
  onTitleChange,
  onDescriptionChange,
  onCTAClick,
  currentStep,
  editable,
  maxWidth = 810,
  campaignType,
}) => {
  console.log('🎨 [ArticleCanvas] Render with articleConfig:', {
    hasBanner: !!articleConfig?.banner,
    bannerImageUrl: articleConfig?.banner?.imageUrl,
    bannerImageUrlLength: articleConfig?.banner?.imageUrl?.length,
  });
  // Rendu du contenu selon l'étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 'article':
        return (
          <>
            <EditableText
              title={articleConfig.content?.title}
              description={articleConfig.content?.description}
              onTitleChange={onTitleChange}
              onDescriptionChange={onDescriptionChange}
              editable={editable}
              maxWidth={maxWidth}
            />
            
            <ArticleCTA
              text={articleConfig.cta?.text}
              variant={articleConfig.cta?.variant}
              size={articleConfig.cta?.size}
              icon={articleConfig.cta?.icon}
              onClick={onCTAClick}
              disabled={!editable}
              maxWidth={maxWidth}
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
          <div className="py-8 px-6" style={{ maxWidth: `${maxWidth}px` }}>
            <p className="text-center text-gray-600">
              Formulaire de contact (intégré avec le système existant)
            </p>
          </div>
        );
      
      case 'game':
        return (
          <div className="py-8 px-6" style={{ maxWidth: `${maxWidth}px` }}>
            <p className="text-center text-gray-600">
              Mécanique de jeu: {campaignType}
            </p>
          </div>
        );
      
      case 'result':
        return (
          <div className="py-8 px-6" style={{ maxWidth: `${maxWidth}px` }}>
            <h2 className="text-2xl font-bold text-center mb-4">
              Merci d'avoir participé !
            </h2>
            <p className="text-center text-gray-600">
              Vous recevrez un email de confirmation avec les détails de votre participation.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="article-canvas mx-auto bg-white"
      style={{
        width: `${maxWidth}px`,
        minHeight: '1200px',
      }}
    >
      {/* Bannière (toujours visible) */}
      <ArticleBanner
        key={articleConfig.banner?.imageUrl || 'no-banner'}
        imageUrl={articleConfig.banner?.imageUrl}
        onImageChange={onBannerChange}
        onImageRemove={onBannerRemove}
        editable={editable}
        aspectRatio={articleConfig.banner?.aspectRatio}
        maxWidth={maxWidth}
      />

      {/* Contenu selon l'étape */}
      {renderStepContent()}
    </div>
  );
};

export default ArticleCanvas;
