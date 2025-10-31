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
  onStepChange?: (step: ArticleFunnelStep) => void;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

const DEFAULT_CONTAINER_CLASS = 'w-full h-full flex items-start justify-center bg-gray-100 overflow-y-auto p-8';

const ArticleFunnelView: React.FC<ArticleFunnelViewProps> = ({
  articleConfig,
  campaignType,
  campaign,
  wheelModalConfig,
  gameModalConfig,
  currentStep,
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

  return (
    <div className={composedClassName} style={containerStyle}>
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
      />
    </div>
  );
};

export default ArticleFunnelView;
