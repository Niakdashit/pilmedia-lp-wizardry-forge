// Design Editor modular types (independent from other editors)
// This JSON will be saved under campaign.design.designModules

export type DesignModuleType =
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

export type DesignScreenId = 'screen1' | 'screen2' | 'screen3';

export interface DesignBaseModule {
  id: string; // unique id
  type: DesignModuleType;
  // common display settings
  screenId?: DesignScreenId;
  spacingTop?: number; // px
  spacingBottom?: number; // px
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
  minHeight?: number; // px
  layoutWidth?: 'full' | 'half' | 'third' | 'twoThirds';
  rotation?: number; // degrees (-180 to 180)
}

export interface DesignBlocTexte extends DesignBaseModule {
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

export interface DesignBlocImage extends DesignBaseModule {
  type: 'BlocImage';
  url: string;
  alt?: string;
  width?: number;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain';
}

export interface DesignBlocBouton extends DesignBaseModule {
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

export interface DesignBlocSeparateur extends DesignBaseModule {
  type: 'BlocSeparateur';
  thickness?: number;
  color?: string;
  widthPercent?: number;
}

export interface DesignBlocVideo extends DesignBaseModule {
  type: 'BlocVideo';
  src: string;
  title?: string;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain';
  width?: number;
}

export interface DesignBlocReseauxSociaux extends DesignBaseModule {
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

export interface DesignBlocHtml extends DesignBaseModule {
  type: 'BlocHtml';
  html: string;
  language?: string;
}

export interface DesignBlocCarte extends DesignBaseModule {
  type: 'BlocCarte';
  title?: string;
  description?: string;
  children: DesignModule[];
  cardBackground?: string;
  cardBorderColor?: string;
  cardBorderWidth?: number;
  cardRadius?: number;
  padding?: number;
  boxShadow?: string;
  maxWidth?: number;
  textColor?: string;
}

export interface DesignBlocLogo extends DesignBaseModule {
  type: 'BlocLogo';
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  bandHeight?: number;
  bandColor?: string;
  bandPadding?: number;
}

export interface DesignFooterLink {
  id: string;
  text: string;
  url: string;
  openInNewTab?: boolean;
}

export interface DesignFooterSocialLink {
  id: string;
  platform: 'facebook' | 'linkedin' | 'twitter' | 'instagram' | 'youtube' | 'tiktok' | string;
  url: string;
}

export interface DesignBlocPiedDePage extends DesignBaseModule {
  type: 'BlocPiedDePage';
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  bandHeight?: number;
  bandColor?: string;
  bandPadding?: number;
  footerText?: string;
  footerLinks?: DesignFooterLink[];
  textColor?: string;
  linkColor?: string;
  fontSize?: number;
  separator?: string;
  socialLinks?: DesignFooterSocialLink[];
  socialIconSize?: number;
  socialIconColor?: string;
}

export type DesignModule =
  | DesignBlocTexte
  | DesignBlocImage
  | DesignBlocBouton
  | DesignBlocSeparateur
  | DesignBlocVideo
  | DesignBlocReseauxSociaux
  | DesignBlocHtml
  | DesignBlocCarte
  | DesignBlocLogo
  | DesignBlocPiedDePage;

export interface DesignModularScreen {
  screenId: DesignScreenId;
  modules: DesignModule[];
}

export interface DesignModularPage {
  screens: Record<DesignScreenId, DesignModule[]>;
  _updatedAt?: number;
}

export const createEmptyDesignModularPage = (): DesignModularPage => ({
  screens: {
    screen1: [],
    screen2: [],
    screen3: []
  },
  _updatedAt: Date.now()
});
