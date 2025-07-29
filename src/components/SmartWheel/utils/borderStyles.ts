
export interface BorderStyle {
  name: string;
  type: 'solid' | 'gradient' | 'metallic' | 'luxury' | 'neon' | 'pattern';
  colors: string[];
  width: number;
  effects: {
    glow?: boolean;
    shadow?: boolean;
    metallic?: boolean;
    animated?: boolean;
  };
}

export const BORDER_STYLES: Record<string, BorderStyle> = {
  classic: {
    name: 'Classique',
    type: 'solid',
    colors: ['#d1d5db'],
    width: 12,
    effects: {
      shadow: true
    }
  },
  
  gold: {
    name: 'Or',
    type: 'luxury',
    colors: ['#FFD700', '#DAA520', '#B8860B'],
    width: 16,
    effects: {
      metallic: true,
      glow: true,
      shadow: true
    }
  },
  
  silver: {
    name: 'Argent',
    type: 'metallic',
    colors: ['#C0C0C0', '#A8A8A8', '#808080'],
    width: 12,
    effects: {
      metallic: true,
      shadow: true
    }
  },
  
  copper: {
    name: 'Cuivre',
    type: 'metallic',
    colors: ['#B87333', '#A0522D', '#8B4513'],
    width: 12,
    effects: {
      metallic: true,
      shadow: true
    }
  },
  
  neonBlue: {
    name: 'Néon Bleu',
    type: 'neon',
    colors: ['#00BFFF', '#1E90FF'],
    width: 8,
    effects: {
      glow: true,
      animated: true
    }
  },
  
  neonPink: {
    name: 'Néon Rose',
    type: 'neon',
    colors: ['#FF1493', '#FF69B4'],
    width: 8,
    effects: {
      glow: true,
      animated: true
    }
  },
  
  rainbow: {
    name: 'Arc-en-ciel',
    type: 'gradient',
    colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
    width: 12,
    effects: {
      animated: true,
      glow: true
    }
  },
  
  fire: {
    name: 'Feu',
    type: 'gradient',
    colors: ['#FF4500', '#FF6347', '#FFD700'],
    width: 10,
    effects: {
      glow: true,
      animated: true
    }
  },
  
  ice: {
    name: 'Glace',
    type: 'gradient',
    colors: ['#E0FFFF', '#B0E0E6', '#87CEEB'],
    width: 10,
    effects: {
      glow: true,
      shadow: true
    }
  },
  
  casino: {
    name: 'Casino',
    type: 'luxury',
    colors: ['#DC143C', '#FFD700'],
    width: 16,
    effects: {
      metallic: true,
      glow: true,
      shadow: true
    }
  }
};

export const getBorderStyle = (styleName: string): BorderStyle => {
  return BORDER_STYLES[styleName] || BORDER_STYLES.classic;
};

export const createMetallicGradient = (
  ctx: CanvasRenderingContext2D,
  colors: string[],
  centerX: number,
  centerY: number,
  radius: number
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(
    centerX - radius, centerY - radius,
    centerX + radius, centerY + radius
  );
  
  colors.forEach((color, index) => {
    const position = colors.length === 1 ? 0 : index / (colors.length - 1);
    gradient.addColorStop(position, color);
  });
  
  return gradient;
};

export const createNeonEffect = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string,
  intensity: number = 1
) => {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 20 * intensity;
  ctx.globalAlpha = 0.8 * intensity;
  
  // Effet de lueur multiple
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + (i * 2), 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  ctx.restore();
};

export const createRainbowGradient = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  animationTime: number = 0
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(
    centerX - radius, centerY - radius,
    centerX + radius, centerY + radius
  );
  
  const colors = BORDER_STYLES.rainbow.colors;
  const offset = (animationTime * 0.001) % 1; // Animation basée sur le temps
  
  colors.forEach((color, index) => {
    const position = ((index / colors.length) + offset) % 1;
    gradient.addColorStop(position, color);
  });
  
  return gradient;
};
