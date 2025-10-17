/**
 * Centralized Design Tokens and Button Helpers
 * 
 * This file consolidates all design constants and button styling functions
 * to prevent duplication across editors (QuizEditor, JackpotEditor, ScratchCardEditor, etc.)
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export const designTokens = {
  radius: 12,
  shadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  padding: '14px 28px',
  fontWeight: 600,
};

/**
 * Launch Button Default Values
 * Centralized constants previously duplicated in QuizEditor, JackpotEditor, ScratchCardEditor
 */
export const LAUNCH_BUTTON_DEFAULTS = {
  GRADIENT: '#000000',
  TEXT_COLOR: '#ffffff',
  PADDING: '14px 28px',
  SHADOW: '0 4px 12px rgba(0, 0, 0, 0.15)',
  BORDER_RADIUS: '12px',
  FONT_WEIGHT: 600,
  MIN_WIDTH: '200px',
};

export const resolveBrandColor = (campaign: any, key: 'primary' | 'secondary', fallback: string) => {
  try {
    const v = (campaign as any)?.design?.customColors?.[key];
    return typeof v === 'string' && v.length ? v : fallback;
  } catch {
    return fallback;
  }
};

export const buildButtonStyles = (
  opts: {
    background?: string;
    color?: string;
    radius?: number | string;
    padding?: string;
    shadow?: string;
    minWidth?: string | number;
    minHeight?: string | number;
    width?: string | number;
    height?: string | number;
  } = {}
) => {
  const radius = typeof opts.radius === 'number' ? `${opts.radius}px` : (opts.radius ?? designTokens.radius);
  return {
    background: opts.background ?? '#4ECDC4',
    color: opts.color ?? '#ffffff',
    padding: opts.padding ?? designTokens.padding,
    borderRadius: radius as any,
    boxShadow: opts.shadow ?? designTokens.shadow,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: designTokens.fontWeight as any,
    minWidth: opts.minWidth as any,
    minHeight: opts.minHeight as any,
    width: opts.width as any,
    height: opts.height as any,
  } as React.CSSProperties;
};

/**
 * Build Launch Button Styles
 * 
 * Unified function for building launch button styles across all editors.
 * Previously duplicated in QuizEditor and JackpotEditor.
 * 
 * @param buttonModule - Button module configuration
 * @param styleOverrides - Additional style overrides
 * @param config - Button configuration options
 */
export const buildLaunchButtonStyles = (
  buttonModule: any | undefined,
  styleOverrides: Record<string, any>,
  config?: {
    brandColors?: { primary?: string; secondary?: string };
    defaultGradient?: string;
    defaultTextColor?: string;
  }
): React.CSSProperties => {
  const brandPrimary = config?.brandColors?.primary;
  const fallbackGradient = config?.defaultGradient || LAUNCH_BUTTON_DEFAULTS.GRADIENT;
  const fallbackTextColor = config?.defaultTextColor || LAUNCH_BUTTON_DEFAULTS.TEXT_COLOR;

  // Extract button properties
  const background = buttonModule?.background || styleOverrides.background;
  const textColor = buttonModule?.textColor || styleOverrides.color || fallbackTextColor;
  const borderRadius = buttonModule?.borderRadius ?? styleOverrides.borderRadius ?? LAUNCH_BUTTON_DEFAULTS.BORDER_RADIUS;
  
  // Build padding
  let padding = buttonModule?.padding || styleOverrides.padding || LAUNCH_BUTTON_DEFAULTS.PADDING;
  if (buttonModule?.paddingVertical && buttonModule?.paddingHorizontal) {
    padding = `${buttonModule.paddingVertical}px ${buttonModule.paddingHorizontal}px`;
  }

  const boxShadow = buttonModule?.boxShadow || styleOverrides.boxShadow || LAUNCH_BUTTON_DEFAULTS.SHADOW;

  // Resolve background with brand colors if needed
  let finalBackground = background;
  if (!finalBackground && brandPrimary) {
    finalBackground = `linear-gradient(135deg, ${brandPrimary} 0%, ${brandPrimary}dd 100%)`;
  } else if (!finalBackground) {
    finalBackground = fallbackGradient;
  }

  return {
    background: finalBackground,
    color: textColor,
    padding,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    boxShadow,
    fontWeight: buttonModule?.bold ? 700 : LAUNCH_BUTTON_DEFAULTS.FONT_WEIGHT,
    textTransform: buttonModule?.uppercase ? 'uppercase' : undefined,
    border: buttonModule?.borderWidth 
      ? `${buttonModule.borderWidth}px solid ${buttonModule.borderColor || 'transparent'}`
      : 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: styleOverrides.minWidth || LAUNCH_BUTTON_DEFAULTS.MIN_WIDTH,
    transition: 'all 0.3s ease',
    ...styleOverrides,
  } as React.CSSProperties;
};

