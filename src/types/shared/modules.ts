/**
 * Unified Module Types for All Editors
 * 
 * This file consolidates the previously duplicated types from:
 * - designEditorModular.ts (DesignEditor, TemplateEditor)
 * - modularEditor.ts (QuizEditor, ModelEditor, JackpotEditor, ScratchCardEditor)
 * 
 * All editors should now import from this unified file.
 */

export type ModuleType =
  | 'BlocTexte'
  | 'BlocImage'
  | 'BlocBouton'
  | 'BlocSeparateur'
  | 'BlocVideo'
  | 'BlocReseauxSociaux'
  | 'BlocHtml'
  | 'BlocCarte'
  | 'BlocLogo'
  | 'BlocPiedDePage';

export type SocialIconStyle =
  | 'color'
  | 'grey'
  | 'black';

export type ScreenId = 'screen1' | 'screen2' | 'screen3';

export interface BaseModule {
  id: string; // unique id
  type: ModuleType;
  // common display settings
  spacingTop?: number; // px
  spacingBottom?: number; // px
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
  minHeight?: number; // px
  layoutWidth?: 'full' | 'half' | 'third' | 'twoThirds';
  rotation?: number; // degrees (-180 to 180)
}

export interface BlocTexte extends BaseModule {
  type: 'BlocTexte';
  title?: string;
  titleRichHtml?: string;
  body?: string;
  bodyRichHtml?: string;
  titleFontSize?: number;
  titleBold?: boolean;
  titleItalic?: boolean;
  titleUnderline?: boolean;
  bodyFontSize?: number;
  bodyBold?: boolean;
  bodyItalic?: boolean;
  bodyUnderline?: boolean;
  bodyColor?: string;
  bodyFontFamily?: string;
  accentColor?: string;
  cardBackground?: string;
  cardBorderColor?: string;
  cardBorderWidth?: number;
  cardRadius?: number;
  padding?: number;
  customCSS?: Record<string, any>;
  advancedStyle?: any;
  html?: string;
  text?: string;
}

export interface BlocImage extends BaseModule {
  type: 'BlocImage';
  url: string;
  alt?: string;
  width?: number;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain';
}

export interface BlocBouton extends BaseModule {
  type: 'BlocBouton';
  label: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'link';
  borderRadius?: number;
  background?: string;
  textColor?: string;
  padding?: string;
  boxShadow?: string;
  uppercase?: boolean;
  bold?: boolean;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderWidth?: number;
  borderColor?: string;
}

export interface BlocSeparateur extends BaseModule {
  type: 'BlocSeparateur';
  thickness?: number;
  color?: string;
  widthPercent?: number;
}

export interface BlocVideo extends BaseModule {
  type: 'BlocVideo';
  src: string;
  title?: string;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain';
  width?: number;
}

export interface BlocReseauxSociaux extends BaseModule {
  type: 'BlocReseauxSociaux';
  title?: string;
  description?: string;
  layout?: 'grid' | 'list';
  displayMode?: 'icons' | 'buttons';
  iconSize?: number;
  iconSpacing?: number;
  iconStyle?: SocialIconStyle;
  links: Array<{
    id: string;
    label: string;
    url: string;
    network?: 'facebook' | 'linkedin' | 'instagram' | 'twitter' | 'tiktok' | 'x';
    icon?: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'x' | string;
    iconSvg?: string;
    iconUrl?: string;
  }>;
}

export interface BlocHtml extends BaseModule {
  type: 'BlocHtml';
  html: string;
  language?: string;
}

export interface BlocCarte extends BaseModule {
  type: 'BlocCarte';
  title?: string;
  description?: string;
  children: Module[];
  cardBackground?: string;
  cardBorderColor?: string;
  cardBorderWidth?: number;
  cardRadius?: number;
  padding?: number;
  boxShadow?: string;
  maxWidth?: number;
  textColor?: string;
}

export interface BlocLogo extends BaseModule {
  type: 'BlocLogo';
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  bandHeight?: number;
  bandColor?: string;
  bandPadding?: number;
}

export interface FooterLink {
  id: string;
  text: string;
  url: string;
  openInNewTab?: boolean;
}

export interface FooterSocialLink {
  id: string;
  platform: 'facebook' | 'linkedin' | 'twitter' | 'instagram' | 'youtube' | 'tiktok' | string;
  url: string;
}

export interface BlocPiedDePage extends BaseModule {
  type: 'BlocPiedDePage';
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  bandHeight?: number;
  bandColor?: string;
  bandPadding?: number;
  footerText?: string;
  footerLinks?: FooterLink[];
  textColor?: string;
  linkColor?: string;
  fontSize?: number;
  separator?: string;
  socialLinks?: FooterSocialLink[];
  socialIconSize?: number;
  socialIconColor?: string;
}

export type Module =
  | BlocTexte
  | BlocImage
  | BlocBouton
  | BlocSeparateur
  | BlocVideo
  | BlocReseauxSociaux
  | BlocHtml
  | BlocCarte
  | BlocLogo
  | BlocPiedDePage;

export interface ModularScreen {
  screenId: ScreenId;
  modules: Module[];
}

export interface ModularPage {
  screens: Record<ScreenId, Module[]>;
  _updatedAt?: number;
}

export const createEmptyModularPage = (): ModularPage => ({
  screens: {
    screen1: [],
    screen2: [],
    screen3: []
  },
  _updatedAt: Date.now()
});

// Legacy type aliases for backward compatibility
// These can be removed in a future refactor
export type DesignModuleType = ModuleType;
export type DesignScreenId = ScreenId;
export type DesignBaseModule = BaseModule;
export type DesignBlocTexte = BlocTexte;
export type DesignBlocImage = BlocImage;
export type DesignBlocBouton = BlocBouton;
export type DesignBlocSeparateur = BlocSeparateur;
export type DesignBlocVideo = BlocVideo;
export type DesignBlocReseauxSociaux = BlocReseauxSociaux;
export type DesignBlocHtml = BlocHtml;
export type DesignBlocCarte = BlocCarte;
export type DesignBlocLogo = BlocLogo;
export type DesignFooterLink = FooterLink;
export type DesignFooterSocialLink = FooterSocialLink;
export type DesignBlocPiedDePage = BlocPiedDePage;
export type DesignModule = Module;
export type DesignModularScreen = ModularScreen;
export type DesignModularPage = ModularPage;
export const createEmptyDesignModularPage = createEmptyModularPage;
