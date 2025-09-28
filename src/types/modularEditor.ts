// Modular editor types for Quiz Editor (HubSpot-like stacked modules)
// This JSON will be saved under campaign.design.quizModules

export type ModuleType =
  | 'BlocTexte'
  | 'BlocImage'
  | 'BlocBouton'
  | 'BlocSeparateur'
  | 'BlocVideo';

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
  accentColor?: string; // vertical bar color at the left
  cardBackground?: string; // background color of the card
  cardBorderColor?: string; // border color of the card
  cardBorderWidth?: number; // px
  cardRadius?: number; // px
  padding?: number; // px internal padding
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

export type Module = BlocTexte | BlocImage | BlocBouton | BlocSeparateur | BlocVideo;

export interface ModularScreen {
  screenId: ScreenId;
  modules: Module[];
}

export interface ModularPage {
  screens: Record<ScreenId, Module[]>; // ordered list per screen (legacy flat list)
  // Optional: new section-based structure per screen. When present, it takes precedence in UIs that support sections.
  sections?: Record<ScreenId, Section[]>;
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

// ────────────────────────────────────────────────────────────────────────────────
// New: Section-based modular layout
// A Section arranges columns of modules per row (like HubSpot/Email builders).
// Up to 3 columns on Desktop, up to 2 columns on Mobile in a single row.

// Preset layout identifiers
// "1"  => single column (100%)
// "2"  => two equal columns (50/50)
// "3"  => three equal columns on desktop (33/33/33) → on mobile rendered as 2 cols auto-flow
// "1-2" => asymmetric (1/3 + 2/3)
// "2-1" => asymmetric (2/3 + 1/3)
export type SectionLayout = '1' | '2' | '3' | '1-2' | '2-1';

export interface ColumnConfig {
  // Optional min width in px for the column content area
  minWidth?: number;
  // Optional max width in px for the column content area
  maxWidth?: number;
}

export interface SectionBase {
  id: string; // unique id for the section
  layout: SectionLayout;
  // Per-device column limits (defaults: desktop: up to 3, mobile: up to 2)
  columnsDesktop?: number; // 1..3 (enforced to layout max)
  columnsMobile?: number;  // 1..2 (enforced to layout max)
  gutter?: number; // gap between columns (px)
  paddingY?: number; // vertical padding (px)
  backgroundColor?: string;
  // Optional column-level configs (length equals effective column count for layout)
  columns?: ColumnConfig[];
}

// A Section contains N columns, each column holds a vertical stack of modules
export interface Section extends SectionBase {
  // Modules per column; modules[0] is for the first column, etc.
  modules: Module[][];
}

export const createEmptySection = (id: string, layout: SectionLayout = '1'): Section => {
  const columns = layout === '1' ? 1 : layout === '2' ? 2 : layout === '3' ? 3 : 2; // 1-2 or 2-1 → 2 columns
  return {
    id,
    layout,
    columnsDesktop: Math.min(columns, 3),
    columnsMobile: Math.min(columns, 2),
    gutter: 16,
    paddingY: 12,
    backgroundColor: 'transparent',
    columns: Array.from({ length: columns }, () => ({})),
    modules: Array.from({ length: columns }, () => [])
  };
};
