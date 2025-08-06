
export const createWheelGradients = (
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  theme: string,
  customColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  }
) => {
  console.log('Creating wheel gradients with:', { theme, customColors });
  
  const gradients: any = {};

  // Validate and provide fallback colors
  const safeCustomColors = customColors && customColors.primary && customColors.secondary ? {
    primary: customColors.primary || '#841b60',
    secondary: customColors.secondary || '#1e40af',
    accent: customColors.accent || customColors.secondary || '#1e40af'
  } : null;

  console.log('Safe custom colors:', safeCustomColors);

  // Base wheel gradient
  gradients.wheel = ctx.createRadialGradient(center, center, 0, center, center, radius);
  
  if (safeCustomColors) {
    gradients.wheel.addColorStop(0, safeCustomColors.primary);
    gradients.wheel.addColorStop(0.5, safeCustomColors.secondary);
    gradients.wheel.addColorStop(1, safeCustomColors.accent);
  } else {
    switch (theme) {
      case 'casino':
        gradients.wheel.addColorStop(0, '#000000');
        gradients.wheel.addColorStop(0.5, '#FFD700');
        gradients.wheel.addColorStop(1, '#8B0000');
        break;
      case 'luxury':
        gradients.wheel.addColorStop(0, '#2C1810');
        gradients.wheel.addColorStop(0.5, '#D4AF37');
        gradients.wheel.addColorStop(1, '#1A1A1A');
        break;
      case 'noel':
        gradients.wheel.addColorStop(0, '#228B22');
        gradients.wheel.addColorStop(0.5, '#FFD700');
        gradients.wheel.addColorStop(1, '#DC143C');
        break;
      default:
        gradients.wheel.addColorStop(0, '#f8f9fa');
        gradients.wheel.addColorStop(0.5, '#e9ecef');
        gradients.wheel.addColorStop(1, '#dee2e6');
    }
  }

  // Metallic border gradient
  gradients.border = ctx.createLinearGradient(0, center - radius, 0, center + radius);
  gradients.border.addColorStop(0, '#ffffff');
  gradients.border.addColorStop(0.2, '#f8f9fa');
  gradients.border.addColorStop(0.5, '#6c757d');
  gradients.border.addColorStop(0.8, '#343a40');
  gradients.border.addColorStop(1, '#212529');

  // Center highlight gradient
  gradients.centerHighlight = ctx.createRadialGradient(
    center - 10, center - 10, 0,
    center, center, 30
  );
  gradients.centerHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  gradients.centerHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

  // Shadow gradient
  gradients.shadow = ctx.createRadialGradient(center, center, 0, center, center, radius + 30);
  gradients.shadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradients.shadow.addColorStop(0.8, 'rgba(0, 0, 0, 0.2)');
  gradients.shadow.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

  return gradients;
};

export const createSegmentGradient = (
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  color: string,
  theme: string
) => {
  // Validate color parameter
  const safeColor = color && typeof color === 'string' && color.startsWith('#') ? color : '#841b60';
  console.log('Creating segment gradient with color:', { original: color, safe: safeColor });
  
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  
  switch (theme) {
    case 'casino':
      gradient.addColorStop(0, lightenColor(safeColor, 30));
      gradient.addColorStop(0.4, safeColor);
      gradient.addColorStop(0.8, darkenColor(safeColor, 20));
      gradient.addColorStop(1, darkenColor(safeColor, 40));
      break;
    case 'luxury':
      gradient.addColorStop(0, lightenColor(safeColor, 50));
      gradient.addColorStop(0.3, lightenColor(safeColor, 20));
      gradient.addColorStop(0.6, safeColor);
      gradient.addColorStop(1, darkenColor(safeColor, 30));
      break;
    case 'noel':
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.2, lightenColor(safeColor, 40));
      gradient.addColorStop(0.7, safeColor);
      gradient.addColorStop(1, darkenColor(safeColor, 20));
      break;
    default:
      gradient.addColorStop(0, lightenColor(safeColor, 20));
      gradient.addColorStop(0.5, safeColor);
      gradient.addColorStop(1, darkenColor(safeColor, 15));
  }
  
  return gradient;
};

// Utility functions with better error handling
const lightenColor = (color: string, percent: number): string => {
  try {
    if (!color || !color.startsWith('#')) {
      console.warn('Invalid color for lightening:', color);
      return '#841b60'; // Default brand color
    }
    
    const num = parseInt(color.replace("#", ""), 16);
    if (isNaN(num)) {
      console.warn('Invalid hex color:', color);
      return '#3b82f6';
    }
    
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  } catch (error) {
    console.error('Error lightening color:', error);
    return color || '#841b60';
  }
};

const darkenColor = (color: string, percent: number): string => {
  try {
    if (!color || !color.startsWith('#')) {
      console.warn('Invalid color for darkening:', color);
      return '#6b1f47'; // Default dark brand color
    }
    
    const num = parseInt(color.replace("#", ""), 16);
    if (isNaN(num)) {
      console.warn('Invalid hex color:', color);
      return '#1e40af';
    }
    
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  } catch (error) {
    console.error('Error darkening color:', error);
    return color || '#1e40af';
  }
};
