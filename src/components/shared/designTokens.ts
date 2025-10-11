export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export const designTokens = {
  radius: 12,
  shadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  padding: '14px 28px',
  fontWeight: 600,
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

