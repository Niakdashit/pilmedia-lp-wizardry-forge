import { useCallback } from 'react';

/**
 * Hook unifié pour synchroniser le contenu article entre l'éditeur et le state de campagne
 * Centralise toute la logique de mise à jour pour éviter les duplications et incohérences
 */
export const useArticleContentSync = (
  campaignState: any,
  setCampaign: (campaign: any) => void
) => {
  const handleBannerChange = useCallback((imageUrl: string) => {
    if (campaignState) {
      setCampaign({
        ...campaignState,
        articleConfig: {
          ...(campaignState as any).articleConfig,
          banner: {
            ...(campaignState as any).articleConfig?.banner,
            imageUrl,
          },
        },
      });
    }
  }, [campaignState, setCampaign]);

  const handleBannerRemove = useCallback(() => {
    if (campaignState) {
      setCampaign({
        ...campaignState,
        articleConfig: {
          ...(campaignState as any).articleConfig,
          banner: {
            ...(campaignState as any).articleConfig?.banner,
            imageUrl: undefined,
          },
        },
      });
    }
  }, [campaignState, setCampaign]);

  const handleTitleChange = useCallback((title: string) => {
    if (campaignState) {
      setCampaign({
        ...campaignState,
        articleConfig: {
          ...(campaignState as any).articleConfig,
          content: {
            ...(campaignState as any).articleConfig?.content,
            title,
          },
        },
      });
    }
  }, [campaignState, setCampaign]);

  const handleDescriptionChange = useCallback((description: string) => {
    if (campaignState) {
      setCampaign({
        ...campaignState,
        articleConfig: {
          ...(campaignState as any).articleConfig,
          content: {
            ...(campaignState as any).articleConfig?.content,
            description,
          },
        },
      });
    }
  }, [campaignState, setCampaign]);

  const handleArticleHtmlContentChange = useCallback((html: string) => {
    if (campaignState) {
      setCampaign({
        ...campaignState,
        articleConfig: {
          ...(campaignState as any).articleConfig,
          content: {
            ...(campaignState as any).articleConfig?.content,
            htmlContent: html,
          },
        },
      });
    }
  }, [campaignState, setCampaign]);

  const handleFormContentChange = useCallback((html: string) => {
    if (campaignState) {
      setCampaign({
        ...campaignState,
        articleConfig: {
          ...(campaignState as any).articleConfig,
          formHtmlContent: html,
        },
      });
    }
  }, [campaignState, setCampaign]);

  const handleWinnerContentChange = useCallback((content: string) => {
    if (campaignState) {
      setCampaign({
        ...campaignState,
        articleConfig: {
          ...(campaignState as any).articleConfig,
          winnerContent: content,
        },
      });
    }
  }, [campaignState, setCampaign]);

  const handleLoserContentChange = useCallback((content: string) => {
    if (campaignState) {
      setCampaign({
        ...campaignState,
        articleConfig: {
          ...(campaignState as any).articleConfig,
          loserContent: content,
        },
      });
    }
  }, [campaignState, setCampaign]);

  return {
    handleBannerChange,
    handleBannerRemove,
    handleTitleChange,
    handleDescriptionChange,
    handleArticleHtmlContentChange,
    handleFormContentChange,
    handleWinnerContentChange,
    handleLoserContentChange,
  };
};
