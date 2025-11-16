/**
 * Types pour le mode Article
 * 
 * Le mode Article est un clone visuel simplifié des éditeurs existants
 * avec un contenu épuré (bannière + texte + CTA).
 */

export interface ArticleConfig {
  // Contenu de l'article
  banner?: ArticleBanner;
  content?: ArticleContent;
  cta?: ArticleCTA;
  // Contenu spécifique à l'étape formulaire (étape 2)
  formDescription?: string;
  formHtmlContent?: string;
  
  // Configuration du funnel
  funnelFlow?: ArticleFunnelFlow;
  
  // Styles globaux
  theme?: ArticleTheme;
  brandColors?: ArticleBrandColors;
  pageBackground?: ArticlePageBackground;
  frameColor?: string;
  frameBorderWidth?: number;
  frameBorderColor?: string;
  frameBorderRadius?: number;
  
  // Header/Footer
  header?: { imageUrl?: string; mode?: 'cover' | 'contain' };
  footer?: { imageUrl?: string; mode?: 'cover' | 'contain' };
}

// Couleurs de marque utilisées par le mode Article
export interface ArticleBrandColors {
  primary?: string;
}

// Arrière-plan de page (image plein écran)
export interface ArticlePageBackground {
  imageUrl?: string;
}

export interface ArticleBanner {
  imageUrl?: string;
  aspectRatio?: '2215/1536' | '1500/744';
  alt?: string;
  
  // Bannière mobile (optionnel)
  mobileImageUrl?: string;
}

export interface ArticleContent {
  title?: string;
  description?: string;
  htmlContent?: string; // Contenu HTML enrichi
  
  // Styles de texte
  titleStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: string;
  };
  
  descriptionStyle?: {
    fontSize?: string;
    color?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: string;
  };
}

export interface ArticleCTA {
  text?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: 'arrow' | 'external' | 'play' | 'none';

  // Largeur du bouton dans la mise en page (1/1, 1/2, 2/3, 1/3)
  layoutWidth?: 'full' | 'half' | 'twoThirds' | 'third';
  // Facteur de zoom global du bouton (1 = taille normale)
  scale?: number;
  
  // Action
  action?: 'next-step' | 'external-link' | 'custom';
  href?: string;
  
  // Styles personnalisés
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  uppercase?: boolean;
  bold?: boolean;
  boxShadow?: string;
}

export interface ArticleFunnelFlow {
  // Étapes activées
  steps?: ArticleFunnelStep[];
  
  // Configuration de chaque étape
  formStep?: {
    enabled: boolean;
    position: 'before-game' | 'after-game';
  };
  
  gameStep?: {
    enabled: boolean;
    type?: 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'memory' | 'puzzle';
  };
  
  resultStep?: {
    enabled: boolean;
  };
}

export type ArticleFunnelStep = 
  | 'article' // Étape 1: Bannière + Contenu + CTA
  | 'form'    // Étape 2a: Formulaire de contact (optionnel)
  | 'game'    // Étape 2b/3: Mécanique de jeu (optionnel)
  | 'result'; // Étape finale: Message de résultat

export interface ArticleTheme {
  // Couleurs principales
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  
  // Typographie
  fontFamily?: string;
  headingFontFamily?: string;
  
  // Espacements
  containerPadding?: string;
  sectionSpacing?: string;
  
  // Bordures et coins
  borderRadius?: string;
  
  // Arrière-plan
  backgroundColor?: string;
  backgroundImage?: string;
}

/**
 * Extension du type OptimizedCampaign pour supporter le mode Article
 */
export interface ArticleModeCampaign {
  // Mode de l'éditeur
  editorMode?: 'fullscreen' | 'article';
  
  // Configuration Article (si mode = 'article')
  articleConfig?: ArticleConfig;
  
  // Dimensions du conteneur Article
  articleLayout?: {
    width: number;  // Fixe: 810px
    height: number; // Fixe: 1200px
    maxWidth?: number;
  };
}

/**
 * État de l'éditeur Article
 */
export interface ArticleEditorState {
  // Étape actuelle du funnel
  currentStep: ArticleFunnelStep;
  
  // Historique de navigation
  stepHistory: ArticleFunnelStep[];
  
  // État d'édition
  isEditingBanner: boolean;
  isEditingContent: boolean;
  isEditingCTA: boolean;
  
  // Preview
  isPreviewMode: boolean;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Props des panneaux latéraux en mode Article
 */
export interface ArticleSidebarPanelProps {
  articleConfig?: ArticleConfig;
  onArticleConfigChange: (config: Partial<ArticleConfig>) => void;
  editorMode: 'fullscreen' | 'article';
}

/**
 * Configuration par défaut pour le mode Article
 */
export const DEFAULT_ARTICLE_CONFIG: ArticleConfig = {
  banner: {
    aspectRatio: '1500/744',
    alt: 'Bannière article',
  },
  content: {
    title: '',
    description: 'Décrivez votre contenu ici...',
    titleStyle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      textAlign: 'center',
      lineHeight: '1.4',
    },
    descriptionStyle: {
      fontSize: '1rem',
      color: '#4b5563',
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: '1.75',
    },
  },
  cta: {
    text: 'PARTICIPER !',
    variant: 'primary',
    size: 'large',
    icon: 'arrow',
    action: 'next-step',
  },
  funnelFlow: {
    steps: ['article', 'form', 'game', 'result'],
    formStep: {
      enabled: true,
      position: 'before-game',
    },
    gameStep: {
      enabled: true,
      type: 'wheel',
    },
    resultStep: {
      enabled: true,
    },
  },
  theme: {
    primaryColor: '#841b60',
    secondaryColor: '#b41b60',
    accentColor: '#6d164f',
    fontFamily: 'Inter, system-ui, sans-serif',
    containerPadding: '1.5rem',
    sectionSpacing: '2rem',
    borderRadius: '0.75rem',
    backgroundColor: '#ffffff',
  },
  header: { imageUrl: undefined, mode: 'cover' },
  footer: { imageUrl: undefined, mode: 'cover' },
};

/**
 * Layout par défaut du mode Article
 */
export const DEFAULT_ARTICLE_LAYOUT = {
  width: 810,
  height: 1200,
  maxWidth: 810,
};
