export interface ResponsiveElementBase {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ResponsiveTextElement extends ResponsiveElementBase {
  type: 'text';
  content: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  // Advanced styling properties
  backgroundColor?: string;
  backgroundOpacity?: number;
  textShadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  borderRadius?: number;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontStyle?: 'normal' | 'italic';
  textDecoration?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight?: number;
  textStroke?: {
    width: number;
    color: string;
  };
  // Advanced CSS effects
  advancedStyle?: {
    id: string;
    name: string;
    category: string;
    css: Record<string, any>;
  };
  customCSS?: Record<string, any>;
  // Allow additional properties for compatibility
  [key: string]: any;
}

export interface ResponsiveImageElement extends ResponsiveElementBase {
  type: 'image';
  src: string;
  alt?: string;
}

export interface ResponsiveShapeElement extends ResponsiveElementBase {
  type: 'shape';
  backgroundColor: string;
  borderRadius?: number;
}

export interface ResponsiveWheelElement extends ResponsiveElementBase {
  type: 'wheel';
  segments: any[];
  colors: string[];
}

export type ResponsiveElement = 
  | ResponsiveTextElement 
  | ResponsiveImageElement 
  | ResponsiveShapeElement 
  | ResponsiveWheelElement;

export interface DeviceConfig {
  desktop?: Partial<ResponsiveElement>;
  tablet?: Partial<ResponsiveElement>;
  mobile?: Partial<ResponsiveElement>;
}

export interface ResponsiveElementWithConfig {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  deviceConfig?: DeviceConfig;
  isCentered?: {
    horizontal: boolean;
    vertical: boolean;
    both: boolean;
  };
  // Allow additional properties for compatibility
  [key: string]: any;
}

export interface ResponsiveCalculationResult {
  element: ResponsiveElementWithConfig;
  needsAdaptation: boolean;
  adaptationReasons: string[];
}