
export interface PremiumTheme {
  name: string;
  colors: string[];
  borderColor: string;
  centerGradient: string[];
  effects: {
    glow: boolean;
    metallic: boolean;
    sparkles: boolean;
  };
}

export const PREMIUM_THEMES: Record<string, PremiumTheme> = {
  modern: {
    name: 'Modern Premium',
    colors: ['#FF4444', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#8BC34A', '#FFC107'],
    borderColor: '#FF4444',
    centerGradient: ['#FFF700', '#FFD700', '#DAA520', '#B8860B'],
    effects: {
      glow: true,
      metallic: true,
      sparkles: true
    }
  },
  luxury: {
    name: 'Luxury Gold',
    colors: ['#D4AF37', '#000000', '#FFFFFF', '#C9B037', '#FFD700', '#B8860B', '#DAA520', '#FFF8DC'],
    borderColor: '#D4AF37',
    centerGradient: ['#FFD700', '#DAA520', '#B8860B', '#8B7355'],
    effects: {
      glow: true,
      metallic: true,
      sparkles: false
    }
  },
  neon: {
    name: 'Neon Nights',
    colors: ['#FF073A', '#39FF14', '#0FF0FC', '#FF6EC7', '#FFFF00', '#FF4500', '#8A2BE2', '#00FF7F'],
    borderColor: '#FF073A',
    centerGradient: ['#FF073A', '#39FF14', '#0FF0FC', '#FF6EC7'],
    effects: {
      glow: true,
      metallic: false,
      sparkles: true
    }
  },
  casino: {
    name: 'Casino Royal',
    colors: ['#DC143C', '#000000', '#FFD700', '#8B0000', '#FF0000', '#DAA520', '#B22222', '#2F4F4F'],
    borderColor: '#DC143C',
    centerGradient: ['#FFD700', '#DAA520', '#B8860B', '#8B7355'],
    effects: {
      glow: true,
      metallic: true,
      sparkles: false
    }
  },
  ocean: {
    name: 'Ocean Breeze',
    colors: ['#006994', '#20B2AA', '#4169E1', '#87CEEB', '#00CED1', '#1E90FF', '#0000CD', '#191970'],
    borderColor: '#006994',
    centerGradient: ['#87CEEB', '#20B2AA', '#006994', '#003366'],
    effects: {
      glow: false,
      metallic: true,
      sparkles: false
    }
  }
};

export const getPremiumTheme = (themeName: string): PremiumTheme => {
  return PREMIUM_THEMES[themeName] || PREMIUM_THEMES.modern;
};

export const applyThemeEffects = (
  ctx: CanvasRenderingContext2D,
  theme: PremiumTheme,
  center: number,
  radius: number,
  spinning: boolean
) => {
  if (theme.effects.glow && spinning) {
    // Apply glow effect
    ctx.save();
    ctx.shadowColor = theme.borderColor;
    ctx.shadowBlur = 20;
    ctx.globalAlpha = 0.5;
    
    ctx.beginPath();
    ctx.arc(center, center, radius + 25, 0, 2 * Math.PI);
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.restore();
  }

  if (theme.effects.sparkles && spinning) {
    // Add sparkle particles
    const sparkleCount = 12;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Date.now() * 0.01 + i * 30) * Math.PI / 180;
      const sparkleRadius = radius + 30 + Math.sin(Date.now() * 0.005 + i) * 10;
      const sparkleX = center + sparkleRadius * Math.cos(angle);
      const sparkleY = center + sparkleRadius * Math.sin(angle);
      
      ctx.save();
      ctx.translate(sparkleX, sparkleY);
      ctx.rotate(angle);
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
      gradient.addColorStop(0, theme.colors[i % theme.colors.length]);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.restore();
    }
  }
};
