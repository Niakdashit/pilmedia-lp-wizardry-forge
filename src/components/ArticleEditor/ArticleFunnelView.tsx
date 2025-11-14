import React from 'react';
import ArticleCanvas from './ArticleCanvas';
import type { ArticleConfig } from './types/ArticleTypes';
import type { FieldConfig } from '../forms/DynamicContactForm';

export type ArticleFunnelStep = 'article' | 'form' | 'game' | 'result';

interface ArticleFunnelViewProps {
  articleConfig: ArticleConfig;
  campaignType: string;
  campaign?: any;
  wheelModalConfig?: any;
  gameModalConfig?: any;
  currentStep: ArticleFunnelStep;
  editable: boolean;
  formFields?: FieldConfig[];
  maxWidth?: number;
  onBannerChange?: (imageUrl: string) => void;
  onBannerRemove?: () => void;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  onCTAClick?: () => void;
  onFormSubmit?: (data: Record<string, string>) => void;
  onGameComplete?: () => void;
  currentGameResult?: 'winner' | 'loser';
  onGameResultChange?: (result: 'winner' | 'loser') => void;
  onWinnerContentChange?: (content: string) => void;
  onLoserContentChange?: (content: string) => void;
  onStepChange?: (step: ArticleFunnelStep) => void;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

const DEFAULT_CONTAINER_CLASS = 'w-full min-h-screen flex items-center justify-center overflow-y-auto py-8 px-8';

const ArticleFunnelView: React.FC<ArticleFunnelViewProps> = ({
  articleConfig,
  campaignType,
  campaign,
  wheelModalConfig,
  gameModalConfig,
  currentStep,
  currentGameResult,
  onGameResultChange,
  onWinnerContentChange,
  onLoserContentChange,
  editable,
  formFields,
  maxWidth = 810,
  onBannerChange,
  onBannerRemove,
  onTitleChange,
  onDescriptionChange,
  onCTAClick,
  onFormSubmit,
  onGameComplete,
  onStepChange,
  containerClassName,
  containerStyle
}) => {
  const composedClassName = containerClassName
    ? `${DEFAULT_CONTAINER_CLASS} ${containerClassName}`.trim()
    : DEFAULT_CONTAINER_CLASS;

  const handleBannerChange = (imageUrl: string) => onBannerChange?.(imageUrl);
  const handleBannerRemove = () => onBannerRemove?.();
  const handleTitleChange = (title: string) => onTitleChange?.(title);
  const handleDescriptionChange = (description: string) => onDescriptionChange?.(description);
  const handleCTAClick = () => onCTAClick?.();
  const handleFormSubmit = (data: Record<string, string>) => onFormSubmit?.(data);
  const handleGameComplete = () => onGameComplete?.();
  const handleStepChange = (step: ArticleFunnelStep) => onStepChange?.(step);
  const handleGameResultChange = (result: 'winner' | 'loser') => onGameResultChange?.(result);
  const handleWinnerContentChange = (content: string) => onWinnerContentChange?.(content);
  const handleLoserContentChange = (content: string) => onLoserContentChange?.(content);

  // Apply background color or image
  React.useEffect(() => {
    const container = document.querySelector('.article-funnel-container');
    if (!container) return;

    const pageBackground = (articleConfig as any)?.pageBackground;
    const brandColors = (articleConfig as any)?.brandColors;
    
    // 🎯 CORRECTION: Même couleur de fond en mode édition ET preview pour un rendu identique
    // Le mode preview doit être un mirroring exact du mode édition
    const defaultColor = '#f3f4f6';
    
    if (pageBackground?.imageUrl) {
      // Image de fond
      (container as HTMLElement).style.backgroundImage = `url(${pageBackground.imageUrl})`;
      (container as HTMLElement).style.backgroundSize = 'cover';
      (container as HTMLElement).style.backgroundPosition = 'center';
      (container as HTMLElement).style.backgroundColor = '';
    } else {
      // Couleur unie (personnalisée ou par défaut)
      (container as HTMLElement).style.backgroundImage = '';
      (container as HTMLElement).style.backgroundColor = brandColors?.primary || defaultColor;
    }
  }, [(articleConfig as any)?.pageBackground?.imageUrl, (articleConfig as any)?.brandColors?.primary]);

  return (
    <div className={`${composedClassName} article-funnel-container`} style={containerStyle}>
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
        editable={editable}
        maxWidth={maxWidth}
        campaignType={campaignType}
        formFields={formFields}
        campaign={campaign}
        wheelModalConfig={wheelModalConfig}
        gameModalConfig={gameModalConfig}
        onStepChange={handleStepChange}
        currentGameResult={currentGameResult}
        onGameResultChange={handleGameResultChange}
        onWinnerContentChange={handleWinnerContentChange}
        onLoserContentChange={handleLoserContentChange}
      />
    </div>
  );
};

export default ArticleFunnelView;
