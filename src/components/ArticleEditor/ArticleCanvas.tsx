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
  currentGameResult?: 'winner' | 'loser';
  onGameResultChange?: (result: 'winner' | 'loser') => void;
  onWinnerContentChange?: (content: string) => void;
  onLoserContentChange?: (content: string) => void;
  availableSteps?: Array<'article' | 'form' | 'game' | 'result'>; // Custom steps for different campaign types
  // Dedicated callback for article step rich HTML content
  onArticleHtmlContentChange?: (html: string) => void;
  // Dedicated callback for form step rich text so it doesn't overwrite article step
  onFormContentChange?: (html: string) => void;
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
  currentGameResult: externalGameResult,
  onGameResultChange,
  onWinnerContentChange,
  onLoserContentChange,
  availableSteps,
}) => {
  // Separate states for winner and loser result content
  const [winnerHtmlContent, setWinnerHtmlContent] = React.useState<string>(
    (articleConfig as any)?.winnerContent ||
    ((campaignType === 'form' || campaignType === 'quiz')
      ? "<h2>Votre participation est validée !</h2><p>Merci d'avoir complété le formulaire. Un email de confirmation vient de vous être envoyé avec tous les détails.</p>"
      : '<h2>🎉 Félicitations !</h2><p>Vous avez gagné ! Vous recevrez un email de confirmation avec les détails de votre lot.</p>')
  );
  const [loserHtmlContent, setLoserHtmlContent] = React.useState<string>(
    (articleConfig as any)?.loserContent || '<h2>Merci d\'avoir participé !</h2><p>Vous n\'avez pas gagné cette fois-ci, mais vous recevrez un email de confirmation.</p>'
  );
  
  console.log('🎨 [ArticleCanvas] Initial state:', {
    winnerHtmlContent: winnerHtmlContent?.substring(0, 100),
    loserHtmlContent: loserHtmlContent?.substring(0, 100),
    articleConfigWinnerContent: (articleConfig as any)?.winnerContent?.substring(0, 100),
    articleConfigLoserContent: (articleConfig as any)?.loserContent?.substring(0, 100)
  });
  
  // Sync local state with articleConfig when it changes
  React.useEffect(() => {
    console.log('🔄 [ArticleCanvas] articleConfig changed, syncing state:', {
      newWinnerContent: (articleConfig as any)?.winnerContent?.substring(0, 100),
      newLoserContent: (articleConfig as any)?.loserContent?.substring(0, 100),
      currentWinnerHtmlContent: winnerHtmlContent?.substring(0, 100),
      currentLoserHtmlContent: loserHtmlContent?.substring(0, 100)
    });
    
    if ((articleConfig as any)?.winnerContent && (articleConfig as any).winnerContent !== winnerHtmlContent) {
      console.log('🔄 [ArticleCanvas] Updating winnerHtmlContent from articleConfig');
      setWinnerHtmlContent((articleConfig as any).winnerContent);
    }
    if ((articleConfig as any)?.loserContent && (articleConfig as any).loserContent !== loserHtmlContent) {
      console.log('🔄 [ArticleCanvas] Updating loserHtmlContent from articleConfig');
      setLoserHtmlContent((articleConfig as any).loserContent);
    }
  }, [(articleConfig as any)?.winnerContent, (articleConfig as any)?.loserContent]);
  
  // Track game result (winner/loser)
  const [gameResult, setGameResult] = React.useState<'winner' | 'loser' | null>(null);
  console.log('🎨 [ArticleCanvas] Render with articleConfig:', {
    hasBanner: !!articleConfig.banner,
    bannerImageUrl: articleConfig.banner?.imageUrl,
    bannerImageUrlLength: articleConfig.banner?.imageUrl?.length,
    currentStep,
    hasOnCTAClick: !!onCTAClick,
    hasContent: !!articleConfig.content,
    contentTitle: articleConfig.content?.title,
    contentDescription: articleConfig.content?.description,
    contentHtmlContent: articleConfig.content?.htmlContent?.substring(0, 100),
    fullContent: articleConfig.content
  });

  // Navigation entre les étapes - use custom steps if provided (e.g., form campaigns skip 'article')
  const steps: Array<'article' | 'form' | 'game' | 'result'> = availableSteps || ['article', 'form', 'game', 'result'];
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
    console.log('🎬 [ArticleCanvas] Rendering step:', {
      currentStep,
      campaignType,
      hasCampaign: !!campaign,
      campaignId: campaign?.id
    });
    
    switch (currentStep) {
      case 'article':
        // CRITICAL: Generate default HTML only if no rich content exists
        // 1) Prefer htmlContent when present (rich HTML from EditableText)
        // 2) Fallback to description (which may also contain styled HTML)
        // 3) Final fallback: static default paragraph
        const defaultArticleHtml =
          (articleConfig.content?.htmlContent && articleConfig.content.htmlContent.trim().length > 0)
            ? articleConfig.content.htmlContent
            : (articleConfig.content?.description && articleConfig.content.description.trim().length > 0
                ? articleConfig.content.description
                : '<p style="font-weight:500; text-align:left">Décrivez votre contenu ici...</p>');
        
        return (
          <>
            <EditableText
              title={articleConfig.content?.title}
              description=""
              // CRITICAL: Always prioritize htmlContent to preserve styles (colors, formatting, etc.)
              // Never pass description prop when htmlContent exists, otherwise EditableText will regenerate HTML and lose styles
              htmlContent={defaultArticleHtml}
              onTitleChange={onTitleChange}
              onDescriptionChange={onDescriptionChange}
              onHtmlContentChange={(html) => {
                // CRITICAL: Always use onArticleHtmlContentChange for article step to preserve styles
                if (typeof onArticleHtmlContentChange === 'function') {
                  onArticleHtmlContentChange(html);
                } else if (articleConfig.content) {
                  // Backward compat: if onArticleHtmlContentChange is not wired yet, fall back to legacy behavior
                  onDescriptionChange(html);
                }
              }}
              editable={editable}
              maxWidth={maxWidth}
              defaultAlign="left"
            />
            
            <div className="max-w-md mx-auto">
              <ArticleCTA
                text={articleConfig.cta?.text}
                variant={articleConfig.cta?.variant}
                size={articleConfig.cta?.size}
                icon="none"
                fullWidth={false}
                style={{ width: 'auto' }}
                className={`${articleConfig.cta?.uppercase ? ' uppercase' : ''}${articleConfig.cta?.bold ? ' font-bold' : ''}`}
                onClick={() => {
                  console.log('🔥 [ArticleCTA] Button clicked!');
                  onCTAClick?.();
                }}
                maxWidth={maxWidth}
              />
            </div>
          </>
        );
      
      case 'form':
        return (
          <div className="py-8 px-6" style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
            {/* Texte du formulaire : réutilise le même contenu que l'étape Article SANS le titre */}
            <div className="mb-4">
              <EditableText
                title=""
                description=""
                // CRITICAL: Always prioritize formHtmlContent to preserve styles (colors, formatting, etc.)
                // Never pass description prop when htmlContent exists, otherwise EditableText will regenerate HTML and lose styles
                htmlContent={
                  (articleConfig as any)?.formHtmlContent &&
                  (articleConfig as any).formHtmlContent.trim().length > 0
                    ? (articleConfig as any).formHtmlContent
                    : (
                        articleConfig.content?.htmlContent &&
                        articleConfig.content.htmlContent.trim().length > 0 &&
                        !articleConfig.content.htmlContent.includes('Décrivez votre contenu ici...')
                          ? articleConfig.content.htmlContent
                          : '<p style="font-weight:600; text-align:center">Merci de compléter ce formulaire afin de valider votre participation :</p>'
                      )
                }
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
                onHtmlContentChange={(html) => {
                  // CRITICAL: Always use onFormContentChange for form step to avoid overwriting article content
                  if (typeof onFormContentChange === 'function') {
                    onFormContentChange(html);
                  } else if (articleConfig.content) {
                    // Backward compat: if onFormContentChange is not wired yet, fall back to legacy behavior
                    onDescriptionChange(html);
                  }
                }}
                editable={editable}
                maxWidth={maxWidth}
                defaultAlign="center"
                compact
              />
            </div>
            <DynamicContactForm
              fields={formFields}
              onSubmit={(data) => {
                console.log('Form submitted:', data);
                onFormSubmit?.(data);
              }}
              submitLabel={campaignType === 'form' ? 'Envoyer' : 'Valider'}
              className="max-w-md mx-auto"
              buttonAlign="center"
              launchButtonStyles={{ width: 'auto' }}
            />
          </div>
        );
      
      case 'game':
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '600px' }}>
            <div className="flex flex-col items-center justify-center w-full">
              {campaignType === 'wheel' && campaign && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <StandardizedWheel
                    campaign={campaign}
                    wheelModalConfig={wheelModalConfig}
                    shouldCropWheel={false}
                    className="mx-auto"
                    onComplete={(prize: string) => {
                      console.log('🎡 Wheel completed with prize:', prize);
                      const isWinner = prize && !['Perdu', 'Dommage', 'Rien', 'Vide', ''].includes(prize);
                      const result: 'winner' | 'loser' = isWinner ? 'winner' : 'loser';
                      setGameResult(result);
                      console.log('🎯 Game result detected:', result, 'Prize:', prize);
                      onGameComplete?.();
                      if (onStepChange) {
                        setTimeout(() => onStepChange('result'), 4000);
                      }
                    }}
                  />
                </div>
              )}
              {campaignType === 'jackpot' && campaign && (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SlotMachine
                    campaign={campaign}
                    onWin={(results: string[]) => {
                      console.log('🎰 Jackpot won:', results);
                      onGameComplete?.();
                      if (onStepChange) {
                        setTimeout(() => onStepChange('result'), 4000);
                      }
                    }}
                    onLose={() => {
                      console.log('🎰 Jackpot lost');
                      onGameComplete?.();
                      if (onStepChange) {
                        setTimeout(() => onStepChange('result'), 4000);
                      }
                    }}
                  />
                </div>
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
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArticleQuiz
                    campaign={campaign}
                    onComplete={(result: any) => {
                      console.log('📝 Quiz completed:', result);
                      onGameComplete?.();
                    }}
                  />
                </div>
              )}
              {campaignType === 'quiz' && !campaign && (
                <div className="text-center text-red-500 p-8">
                  ⚠️ Campaign data missing for quiz
                </div>
              )}
              {campaignType !== 'quiz' && campaignType !== 'wheel' && campaignType !== 'jackpot' && campaignType !== 'scratch' && (
                <div className="text-center text-gray-500 p-8">
                  ℹ️ Game type: {campaignType}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'result': {
        // Pour les campagnes Quiz et Formulaire, on ne gère pas de gagnant/perdant :
        // un seul message de sortie générique, sans bandeau d'information.
        const isQuizOrForm = campaignType === 'quiz' || campaignType === 'form';

        // Use external game result for display (from parent) or fallback to internal state
        const effectiveGameResult = externalGameResult || gameResult || 'winner';

        // Contenu affiché :
        // - Quiz/Form: toujours winnerHtmlContent comme message unique
        // - Autres types: winner ou loser selon effectiveGameResult
        const displayContent = isQuizOrForm
          ? winnerHtmlContent
          : effectiveGameResult === 'winner'
            ? winnerHtmlContent
            : loserHtmlContent;

        const setDisplayContent = isQuizOrForm
          ? setWinnerHtmlContent
          : effectiveGameResult === 'winner'
            ? setWinnerHtmlContent
            : setLoserHtmlContent;
        
        console.log('🎬 [ArticleCanvas] Result step - displayContent:', {
          isQuizOrForm,
          effectiveGameResult,
          displayContent: displayContent?.substring(0, 200),
          hasDisplayContent: !!displayContent,
          displayContentLength: displayContent?.length
        });
        
        return (
          <div className="space-y-4">
            {/* Bandeau d'information uniquement pour les jeux avec gagnant/perdant (wheel, jackpot, scratch...) */}
            {editable && !isQuizOrForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Mode édition :</strong> Vous éditez actuellement le message {effectiveGameResult === 'winner' ? 'GAGNANT' : 'PERDANT'}. 
                  Changez via l'onglet "Sortie" dans le panneau Design.
                </p>
              </div>
            )}
            <EditableText
              title=""
              description=""
              htmlContent={displayContent}
              onHtmlContentChange={(html) => {
                console.log('📝 [ArticleCanvas] onHtmlContentChange called:', {
                  html: html?.substring(0, 100),
                  htmlLength: html?.length,
                  isQuizOrForm,
                  effectiveGameResult,
                  hasOnWinnerContentChange: !!onWinnerContentChange,
                  hasOnLoserContentChange: !!onLoserContentChange
                });
                
                // Stocker le contenu dans l'état approprié
                setDisplayContent(html);
                
                // Sauvegarder vers la campagne
                if (isQuizOrForm) {
                  // Message unique pour Quiz/Form : on le mappe sur le contenu gagnant
                  console.log('📝 [ArticleCanvas] Calling onWinnerContentChange (Quiz/Form)');
                  if (onWinnerContentChange) {
                    onWinnerContentChange(html);
                  }
                } else if (effectiveGameResult === 'winner' && onWinnerContentChange) {
                  console.log('📝 [ArticleCanvas] Calling onWinnerContentChange (Winner)');
                  onWinnerContentChange(html);
                } else if (effectiveGameResult === 'loser' && onLoserContentChange) {
                  console.log('📝 [ArticleCanvas] Calling onLoserContentChange (Loser)');
                  onLoserContentChange(html);
                }
              }}
              editable={editable}
              maxWidth={maxWidth}
              defaultAlign="left"
            />
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="article-canvas mx-auto relative"
      style={{
        width: `${maxWidth}px`,
        minHeight: 'auto',
        backgroundColor: (articleConfig as any)?.frameColor || '#ffffff',
        borderStyle: 'solid',
        borderWidth: `${(articleConfig as any)?.frameBorderWidth ?? 0}px`,
        borderColor: (articleConfig as any)?.frameBorderColor ?? '#e5e7eb',
        borderRadius: `${(articleConfig as any)?.frameBorderRadius ?? 0}px`,
      }}
    >
      {/* Flèches de navigation - uniquement en mode édition */}
      {editable && onStepChange && (
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
      {/* Wrapper interne qui clippe le contenu selon l'arrondi */}
      <div className="overflow-hidden">
        {/* Image d'en-tête (header) */}
      {(articleConfig as any)?.header?.imageUrl && (
        <div className="w-full">
          <img
            src={(articleConfig as any).header.imageUrl}
            alt="Header"
            className="w-full object-cover"
            style={{
              maxHeight: `${Math.max(48, Math.round(maxWidth * 0.1))}px`,
              objectFit: ((articleConfig as any)?.header?.mode || 'cover') as any,
            }}
          />
        </div>
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

      {/* Image de pied de page (footer) */}
      {(articleConfig as any)?.footer?.imageUrl && (
        <div className="w-full">
          <img
            src={(articleConfig as any).footer.imageUrl}
            alt="Footer"
            className="w-full object-cover"
            style={{
              maxHeight: `${Math.max(48, Math.round(maxWidth * 0.1))}px`,
              objectFit: ((articleConfig as any)?.footer?.mode || 'cover') as any,
            }}
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default ArticleCanvas;
