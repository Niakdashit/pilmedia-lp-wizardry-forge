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
  
  // Configuration du funnel
  funnelFlow?: ArticleFunnelFlow;
  
  // Styles globaux
  theme?: ArticleTheme;
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
  
  // Styles de texte
  titleStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
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
  
  // Action
  action?: 'next-step' | 'external-link' | 'custom';
  href?: string;
  
  // Styles personnalisés
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  borderColor?: string;
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
  
  // Styles des boutons globaux
  buttonStyle?: ArticleButtonStyle;
  
  // Styles du formulaire
  formTitleStyle?: ArticleFormTitleStyle;
  
  // Messages
  exitMessage?: string;
}

export interface ArticleButtonStyle {
  // Apparence
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  
  // Typographie
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  
  // Espacement
  padding?: string;
  
  // Effets
  boxShadow?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  hoverBoxShadow?: string;
}

export interface ArticleFormTitleStyle {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  marginBottom?: string;
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
    aspectRatio: '2215/1536',
    alt: 'Bannière article',
  },
  content: {
    title: '',
    description: 'Décrivez votre contenu ici...',
    titleStyle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      textAlign: 'center',
    },
    descriptionStyle: {
      fontSize: '1rem',
      color: '#4b5563',
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
    
    // Styles des boutons globaux
    buttonStyle: {
      backgroundColor: '#841b60',
      textColor: '#ffffff',
      borderColor: '#841b60',
      borderWidth: '0px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      padding: '12px 24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      hoverBackgroundColor: '#6d164f',
      hoverTextColor: '#ffffff',
      hoverBoxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    
    // Styles du titre du formulaire
    formTitleStyle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: '1rem',
    },
    
    // Message de sortie
    exitMessage: "Merci d'avoir participé !\n\nVous recevrez un email de confirmation avec les détails de votre participation.",
  },
};

/**
 * Layout par défaut du mode Article
 */
export const DEFAULT_ARTICLE_LAYOUT = {
  width: 810,
  height: 1200,
  maxWidth: 810,
};
