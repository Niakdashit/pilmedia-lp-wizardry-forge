
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
  const gradients: any = {};

  // Base wheel gradient
  gradients.wheel = ctx.createRadialGradient(center, center, 0, center, center, radius);
  
  if (customColors) {
    gradients.wheel.addColorStop(0, customColors.primary);
    gradients.wheel.addColorStop(0.5, customColors.secondary);
    gradients.wheel.addColorStop(1, customColors.accent || customColors.secondary);
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
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  
  switch (theme) {
    case 'casino':
      gradient.addColorStop(0, lightenColor(color, 30));
      gradient.addColorStop(0.4, color);
      gradient.addColorStop(0.8, darkenColor(color, 20));
      gradient.addColorStop(1, darkenColor(color, 40));
      break;
    case 'luxury':
      gradient.addColorStop(0, lightenColor(color, 50));
      gradient.addColorStop(0.3, lightenColor(color, 20));
      gradient.addColorStop(0.6, color);
      gradient.addColorStop(1, darkenColor(color, 30));
      break;
    case 'noel':
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.2, lightenColor(color, 40));
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, darkenColor(color, 20));
      break;
    default:
      gradient.addColorStop(0, lightenColor(color, 20));
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, darkenColor(color, 15));
  }
  
  return gradient;
};

// Utility functions
const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

const darkenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
};
