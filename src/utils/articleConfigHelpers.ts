import type { ArticleConfig } from '@/components/ArticleEditor/types/ArticleTypes';

/**
 * Valeurs par défaut pour articleConfig si absent ou incomplet
 */
export const DEFAULT_ARTICLE_CONFIG: ArticleConfig = {
  banner: {
    imageUrl: undefined,
    aspectRatio: '1500/744'
  },
  content: {
    title: 'Titre de votre article',
    description: 'Ajoutez une description captivante pour engager vos visiteurs...',
    htmlContent: '<p>Ajoutez une description captivante pour engager vos visiteurs...</p>',
    titleStyle: {
      fontSize: '32px',
      color: '#1f2937',
      textAlign: 'center',
      lineHeight: '1.4'
    }
  },
  // Couleurs et fond par défaut (nécessaires pour que "Couleurs unies" fonctionne)
  brandColors: {
    primary: '#f3f4f6'
  },
  pageBackground: {
    imageUrl: undefined
  },
  frameColor: '#ffffff',
  frameBorderWidth: 0,
  frameBorderColor: '#e5e7eb',
  frameBorderRadius: 0,
  header: { imageUrl: undefined, mode: 'cover' },
  footer: { imageUrl: undefined, mode: 'cover' },
  cta: {
    text: 'Participer maintenant',
    variant: 'primary',
    size: 'large',
    icon: 'arrow'
  }
};

/**
 * Parse et normalise l'articleConfig depuis différentes sources
 * Gère les cas où article_config est string, objet, ou absent
 */
export const parseArticleConfig = (
  campaignData: any,
  fallback: Partial<ArticleConfig> = {}
): ArticleConfig => {
  let parsed: Partial<ArticleConfig> = {};

  // 1. Essayer depuis campaignData.articleConfig (déjà en objet)
  if (campaignData?.articleConfig && typeof campaignData.articleConfig === 'object') {
    parsed = campaignData.articleConfig;
  }
  // 2. Essayer depuis campaignData.article_config (peut être string JSON)
  else if (campaignData?.article_config) {
    try {
      if (typeof campaignData.article_config === 'string') {
        parsed = JSON.parse(campaignData.article_config);
      } else {
        parsed = campaignData.article_config;
      }
    } catch (e) {
      console.warn('[parseArticleConfig] Failed to parse article_config:', e);
      parsed = {};
    }
  }

  // 3. Merger avec les valeurs par défaut
  const result: ArticleConfig = {
    banner: {
      ...DEFAULT_ARTICLE_CONFIG.banner,
      ...fallback.banner,
      ...parsed.banner
    },
    content: {
      ...DEFAULT_ARTICLE_CONFIG.content!,
      ...fallback.content,
      ...parsed.content,
      titleStyle: {
        ...DEFAULT_ARTICLE_CONFIG.content!.titleStyle!,
        ...fallback.content?.titleStyle,
        ...parsed.content?.titleStyle
      }
    },
    // Fusionner brandColors et pageBackground
    brandColors: {
      ...DEFAULT_ARTICLE_CONFIG.brandColors,
      ...(fallback as any)?.brandColors,
      ...(parsed as any)?.brandColors,
    },
    pageBackground: {
      ...DEFAULT_ARTICLE_CONFIG.pageBackground,
      ...(fallback as any)?.pageBackground,
      ...(parsed as any)?.pageBackground,
    },
    header: {
      ...DEFAULT_ARTICLE_CONFIG.header,
      ...(fallback as any)?.header,
      ...(parsed as any)?.header,
    },
    footer: {
      ...DEFAULT_ARTICLE_CONFIG.footer,
      ...(fallback as any)?.footer,
      ...(parsed as any)?.footer,
    },
    frameColor: (parsed as any)?.frameColor ?? (fallback as any)?.frameColor ?? DEFAULT_ARTICLE_CONFIG.frameColor,
    frameBorderWidth: (parsed as any)?.frameBorderWidth ?? (fallback as any)?.frameBorderWidth ?? DEFAULT_ARTICLE_CONFIG.frameBorderWidth,
    frameBorderColor: (parsed as any)?.frameBorderColor ?? (fallback as any)?.frameBorderColor ?? DEFAULT_ARTICLE_CONFIG.frameBorderColor,
    frameBorderRadius: (parsed as any)?.frameBorderRadius ?? (fallback as any)?.frameBorderRadius ?? DEFAULT_ARTICLE_CONFIG.frameBorderRadius,
    cta: {
      ...DEFAULT_ARTICLE_CONFIG.cta,
      ...fallback.cta,
      ...parsed.cta
    }
  };

  return result;
};

/**
 * Vérifie si un articleConfig est vide ou incomplet
 */
export const isArticleConfigEmpty = (config: any): boolean => {
  if (!config) return true;
  
  const hasContent = config.content?.title || config.content?.description;
  const hasBanner = !!config.banner?.imageUrl;
  const hasCTA = !!config.cta?.text;
  
  return !hasContent && !hasBanner && !hasCTA;
};

/**
 * Prépare l'articleConfig pour la sauvegarde en base de données
 */
export const prepareArticleConfigForSave = (config: ArticleConfig): string => {
  return JSON.stringify(config);
};

/**
 * Hook helper pour récupérer l'articleConfig avec fallback
 */
export const getArticleConfigWithDefaults = (
  campaignState: any,
  campaignData: any
): ArticleConfig => {
  // Priorité 1: campaignState (en mémoire, plus récent)
  if (campaignState?.articleConfig && !isArticleConfigEmpty(campaignState.articleConfig)) {
    return parseArticleConfig(campaignState);
  }
  
  // Priorité 2: campaignData (depuis DB)
  if (campaignData) {
    return parseArticleConfig(campaignData);
  }
  
  // Fallback: valeurs par défaut
  return DEFAULT_ARTICLE_CONFIG;
};
