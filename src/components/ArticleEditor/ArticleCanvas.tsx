import React from 'react';
import ArticleBanner from './components/ArticleBanner';
import EditableText from './components/EditableText';
import ArticleCTA from './components/ArticleCTA';
import DynamicContactForm from '../forms/DynamicContactForm';
import type { ArticleConfig } from './types/ArticleTypes';
import type { FieldConfig } from '../forms/DynamicContactForm';
import StandardizedWheel from '../shared/StandardizedWheel';
import ArticleQuiz from './ArticleQuiz';
import SlotMachine from '../SlotJackpot/SlotMachine';
import ScratchCardCanvas from '../ScratchCardEditor/ScratchCardCanvas';

interface ArticleCanvasProps {
  articleConfig: ArticleConfig;
  onBannerChange: (imageUrl: string) => void;
  onBannerRemove: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCTAClick: () => void;
  onFormSubmit?: (data: Record<string, string>) => void;
  onGameComplete?: () => void;
  currentStep: 'article' | 'form' | 'game' | 'result';
  editable: boolean;
  maxWidth?: number;
  campaignType: string;
  formFields?: FieldConfig[];
  campaign?: any; // Full campaign data for games
  wheelModalConfig?: any;
  gameModalConfig?: any;
  onStepChange?: (step: 'article' | 'form' | 'game' | 'result') => void;
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
  onFormSubmit,
  onGameComplete,
  currentStep,
  editable,
  maxWidth = 810,
  campaignType,
  formFields = [
    { id: 'firstName', label: 'Prénom', type: 'text', required: true },
    { id: 'lastName', label: 'Nom', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
    { id: 'phone', label: 'Téléphone', type: 'tel', required: false },
  ],
  campaign,
  wheelModalConfig,
  gameModalConfig,
  onStepChange,
}) => {
  console.log('🎨 [ArticleCanvas] Render with articleConfig:', {
    hasBanner: !!articleConfig?.banner,
    bannerImageUrl: articleConfig?.banner?.imageUrl,
    bannerImageUrlLength: articleConfig?.banner?.imageUrl?.length,
    currentStep,
    hasOnCTAClick: !!onCTAClick,
  });

  // Navigation entre les étapes
  const steps: Array<'article' | 'form' | 'game' | 'result'> = ['article', 'form', 'game', 'result'];
  const currentStepIndex = steps.indexOf(currentStep);
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1;

  const handlePreviousStep = () => {
    if (canGoBack && onStepChange) {
      onStepChange(steps[currentStepIndex - 1]);
    }
  };

  const handleNextStep = () => {
    if (canGoForward && onStepChange) {
      onStepChange(steps[currentStepIndex + 1]);
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
              htmlContent={articleConfig.content?.htmlContent}
              onTitleChange={onTitleChange}
              onDescriptionChange={onDescriptionChange}
              onHtmlContentChange={(html) => {
                // Store the full HTML content
                if (articleConfig.content) {
                  onDescriptionChange(html);
                }
              }}
              editable={editable}
              maxWidth={maxWidth}
            />
            
            <ArticleCTA
              text={articleConfig.cta?.text}
              variant={articleConfig.cta?.variant}
              size={articleConfig.cta?.size}
              icon={articleConfig.cta?.icon}
              onClick={() => {
                console.log('🔥 [ArticleCTA] Button clicked!');
                onCTAClick?.();
              }}
              maxWidth={maxWidth}
            />
          </>
        );
      
      case 'form':
        return (
          <div className="py-8 px-6" style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
            <div className="text-center mb-8">
              <h2 
                className="mb-4"
                style={{
                  fontSize: articleConfig.content?.formTitleStyle?.fontSize || '1.875rem',
                  color: articleConfig.content?.formTitleStyle?.color || '#1f2937',
                  fontWeight: articleConfig.content?.formTitleStyle?.fontWeight || '700',
                }}
              >
                Contactez-nous
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Remplissez ce formulaire pour être recontacté(e) et recevoir plus d'informations.
              </p>
            </div>
            <DynamicContactForm
              fields={formFields}
              onSubmit={(data) => {
                console.log('Form submitted:', data);
                onFormSubmit?.(data);
              }}
              submitLabel={campaignType === 'form' ? 'Envoyer' : 'Valider'}
              className="max-w-md mx-auto"
            />
          </div>
        );
      
      case 'game':
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '600px' }}>
            <div className="flex flex-col items-center justify-center w-full">
              {campaignType === 'wheel' && campaign && (
                <StandardizedWheel
                  campaign={campaign}
                  wheelModalConfig={wheelModalConfig}
                  onComplete={(prize: string) => {
                    console.log('🎡 Wheel completed with prize:', prize);
                    onGameComplete?.();
                  }}
                />
              )}
              {campaignType === 'jackpot' && campaign && (
                <SlotMachine
                  campaign={campaign}
                  onWin={(results: string[]) => {
                    console.log('🎰 Jackpot won:', results);
                    onGameComplete?.();
                  }}
                  onLose={() => {
                    console.log('🎰 Jackpot lost');
                    onGameComplete?.();
                  }}
                />
              )}
              {campaignType === 'scratch' && campaign && (
                <div style={{
                  maxWidth: `${maxWidth}px`,
                  width: '100%',
                  margin: '0 auto',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    transform: 'scale(0.6)',
                    transformOrigin: 'center center',
                    width: '100%'
                  }}>
                    <ScratchCardCanvas
                      previewMode={true}
                      selectedDevice="desktop"
                    />
                  </div>
                </div>
              )}
              {campaignType === 'quiz' && campaign && (
                <ArticleQuiz
                  campaign={campaign}
                  onComplete={(result: any) => {
                    console.log('📝 Quiz completed:', result);
                    onGameComplete?.();
                  }}
                />
              )}
            </div>
          </div>
        );
      
      case 'result':
        return (
          <div className="py-8 px-6" style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
            <h2 className="text-2xl font-bold text-center mb-4">
              Merci d'avoir participé !
            </h2>
            <p className="text-center text-gray-600">
              {articleConfig.content?.resultMessage || 'Vous recevrez un email de confirmation avec les détails de votre participation.'}
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="article-canvas mx-auto bg-white relative"
      style={{
        width: `${maxWidth}px`,
        minHeight: '1200px',
        fontFamily: articleConfig.content?.fontFamily || 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Flèches de navigation - Uniquement en mode preview */}
      {onStepChange && (
        <>
          {/* Flèche gauche */}
          {canGoBack && (
            <button
              onClick={handlePreviousStep}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full ml-4 w-12 h-12 bg-white hover:bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
              title="Étape précédente"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Flèche droite */}
          {canGoForward && (
            <button
              onClick={handleNextStep}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full mr-4 w-12 h-12 bg-white hover:bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
              title="Étape suivante"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>
      )}

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
