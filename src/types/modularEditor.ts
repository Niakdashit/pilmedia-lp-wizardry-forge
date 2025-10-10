// Modular editor types for Quiz Editor (HubSpot-like stacked modules)
// This JSON will be saved under campaign.design.quizModules

export type ModuleType =
  | 'BlocTexte'
  | 'BlocImage'
  | 'BlocBouton'
  | 'BlocSeparateur'
  | 'BlocVideo'
  | 'BlocReseauxSociaux'
  | 'BlocHtml';

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
}

export interface BlocTexte extends BaseModule {
  type: 'BlocTexte';
  // HubSpot-like card fields
  title?: string;
  titleRichHtml?: string; // rich text html for title
  body?: string;
  bodyRichHtml?: string; // rich text html for body
  // Font controls (toolbar mapping)
  titleFontSize?: number; // px
  titleBold?: boolean;
  titleItalic?: boolean;
  titleUnderline?: boolean;
  bodyFontSize?: number; // px
  bodyBold?: boolean;
  bodyItalic?: boolean;
  bodyUnderline?: boolean;
  bodyColor?: string; // text color
  bodyFontFamily?: string; // font family
  accentColor?: string; // vertical bar color at the left
  cardBackground?: string; // background color of the card
  cardBorderColor?: string; // border color of the card
  cardBorderWidth?: number; // px
  cardRadius?: number; // px
  padding?: number; // px internal padding
  // Advanced text effects
  customCSS?: Record<string, any>; // Advanced CSS styles (gradients, shadows, etc.)
  advancedStyle?: any; // Reference to the advanced style applied
  // Backward compatibility
  html?: string; // rich text html
  text?: string; // fallback plain text
}

export interface BlocImage extends BaseModule {
  type: 'BlocImage';
  url: string;
  alt?: string;
  width?: number; // px max-width
  borderRadius?: number; // px
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
  paddingVertical?: number; // px, used to build padding string if set
  paddingHorizontal?: number; // px, used to build padding string if set
  borderWidth?: number; // px
  borderColor?: string;
}

export interface BlocSeparateur extends BaseModule {
  type: 'BlocSeparateur';
  thickness?: number; // px
  color?: string;
  widthPercent?: number; // 0-100
}

export interface BlocVideo extends BaseModule {
  type: 'BlocVideo';
  src: string; // embed url
  title?: string;
  borderRadius?: number; // px
  objectFit?: 'cover' | 'contain';
  width?: number; // px max-width for the video box
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

export type Module =
  | BlocTexte
  | BlocImage
  | BlocBouton
  | BlocSeparateur
  | BlocVideo
  | BlocReseauxSociaux
  | BlocHtml;

export interface ModularScreen {
  screenId: ScreenId;
  modules: Module[];
}

export interface ModularPage {
  screens: Record<ScreenId, Module[]>; // ordered list per screen
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
