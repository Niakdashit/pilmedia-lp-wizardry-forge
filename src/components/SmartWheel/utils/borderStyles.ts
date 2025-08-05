// === NOUVEAU SYSTÈME DE BORDURES BURGER KING ===

export type BorderMaterial = 'metal' | 'plastic' | 'wood' | 'glass' | 'neon' | 'ceramic' | 'carbon';
export type BorderFinish = 'matte' | 'glossy' | 'brushed' | 'polished' | 'textured';
export type BorderStyleType = 'classic' | 'modern' | 'luxury' | 'vintage' | 'futuristic' | 'royal';

// Interface de compatibilité pour l'ancien système
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

export interface WheelBorderConfig {
  id: string;
  name: string;
  material: BorderMaterial;
  finish: BorderFinish;
  style: BorderStyleType;
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
    highlight?: string;
  };
  dimensions: {
    width: number;
    innerWidth?: number;
    bevelDepth?: number;
  };
  effects: {
    glow?: {
      enabled: boolean;
      color?: string;
      intensity?: number;
      blur?: number;
    };
    shadow?: {
      enabled: boolean;
      color?: string;
      blur?: number;
      offsetX?: number;
      offsetY?: number;
    };
    metallic?: {
      enabled: boolean;
      reflectionIntensity?: number;
      highlightColor?: string;
    };
    animation?: {
      enabled: boolean;
      type?: 'sparkle' | 'pulse' | 'rotate' | 'shimmer';
      speed?: number;
    };
  };
  customRenderer?: string; // Nom de la fonction de rendu personnalisée
}

// === CONFIGURATIONS DE BORDURES BURGER KING ===
export const WHEEL_BORDER_CONFIGS: Record<string, WheelBorderConfig> = {
  // Style Royal Roulette (Burger King original)
  royalRoulette: {
    id: 'royalRoulette',
    name: 'Royal Roulette',
    material: 'metal',
    finish: 'polished',
    style: 'royal',
    colors: {
      primary: '#D2691E',
      secondary: '#FF8C00',
      accent: '#FFD700',
      highlight: '#FFFFFF'
    },
    dimensions: {
      width: 22,
      innerWidth: 3,
      bevelDepth: 8
    },
    effects: {
      glow: {
        enabled: true,
        color: '#FFD700',
        intensity: 1.2,
        blur: 30
      },
      shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.4)',
        blur: 15,
        offsetX: 2,
        offsetY: 3
      },
      metallic: {
        enabled: true,
        reflectionIntensity: 0.8,
        highlightColor: '#FFFFFF'
      },
      animation: {
        enabled: true,
        type: 'sparkle',
        speed: 1
      }
    },
    customRenderer: 'createRoyalRouletteEffect'
  },

  // Style Or Classique
  goldClassic: {
    id: 'goldClassic',
    name: 'Or Classique',
    material: 'metal',
    finish: 'brushed',
    style: 'classic',
    colors: {
      primary: '#FFD700',
      secondary: '#DAA520',
      accent: '#B8860B'
    },
    dimensions: {
      width: 16,
      innerWidth: 2
    },
    effects: {
      metallic: {
        enabled: true,
        reflectionIntensity: 0.6
      },
      shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10
      }
    }
  },

  // Style Argent Moderne
  silverModern: {
    id: 'silverModern',
    name: 'Argent Moderne',
    material: 'metal',
    finish: 'polished',
    style: 'modern',
    colors: {
      primary: '#C0C0C0',
      secondary: '#A8A8A8',
      accent: '#808080'
    },
    dimensions: {
      width: 14,
      innerWidth: 2
    },
    effects: {
      metallic: {
        enabled: true,
        reflectionIntensity: 0.7
      }
    }
  },

  // Style Néon Futuriste
  neonFuturistic: {
    id: 'neonFuturistic',
    name: 'Néon Futuriste',
    material: 'neon',
    finish: 'glossy',
    style: 'futuristic',
    colors: {
      primary: '#00BFFF',
      secondary: '#1E90FF',
      accent: '#FFFFFF'
    },
    dimensions: {
      width: 10
    },
    effects: {
      glow: {
        enabled: true,
        color: '#00BFFF',
        intensity: 1.5,
        blur: 25
      },
      animation: {
        enabled: true,
        type: 'pulse',
        speed: 1.2
      }
    }
  },

  // Style Casino Luxe
  casinoLuxury: {
    id: 'casinoLuxury',
    name: 'Casino Luxe',
    material: 'metal',
    finish: 'polished',
    style: 'luxury',
    colors: {
      primary: '#DC143C',
      secondary: '#FFD700',
      accent: '#FFFFFF'
    },
    dimensions: {
      width: 18,
      innerWidth: 3
    },
    effects: {
      metallic: {
        enabled: true,
        reflectionIntensity: 0.9
      },
      glow: {
        enabled: true,
        color: '#FFD700',
        intensity: 0.8
      }
    }
  },

  // Style Bois Vintage
  woodVintage: {
    id: 'woodVintage',
    name: 'Bois Vintage',
    material: 'wood',
    finish: 'matte',
    style: 'vintage',
    colors: {
      primary: '#8B4513',
      secondary: '#A0522D',
      accent: '#D2691E'
    },
    dimensions: {
      width: 20,
      bevelDepth: 4
    },
    effects: {
      shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 8
      }
    }
  },

  // Style Plastique Simple
  plasticSimple: {
    id: 'plasticSimple',
    name: 'Plastique Simple',
    material: 'plastic',
    finish: 'matte',
    style: 'classic',
    colors: {
      primary: '#d1d5db',
      secondary: '#9ca3af'
    },
    dimensions: {
      width: 12
    },
    effects: {
      shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.2)',
        blur: 5
      }
    }
  }
};

// === FONCTIONS UTILITAIRES ===
export const getBorderConfig = (configId: string): WheelBorderConfig => {
  return WHEEL_BORDER_CONFIGS[configId] || WHEEL_BORDER_CONFIGS.plasticSimple;
};

// Styles de bordure legacy pour compatibilité
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
  },
  
  royalRoulette: {
    name: 'Royal Roulette',
    type: 'luxury',
    colors: ['#D2691E', '#FF8C00', '#FFD700', '#FFA500', '#FF7F00', '#B8860B'],
    width: 22,
    effects: {
      metallic: true,
      glow: true,
      shadow: true,
      animated: true
    }
  }
};

// Fonction de compatibilité pour l'ancien système
export const getBorderStyle = (styleName: string): BorderStyle => {
  return BORDER_STYLES[styleName] || BORDER_STYLES.classic;
};

// Fonction pour obtenir la nouvelle configuration
export const getBorderStyleConfig = (styleName: string): WheelBorderConfig => {
  // Mapping des anciens noms vers les nouveaux
  const legacyMapping: Record<string, string> = {
    'classic': 'plasticSimple',
    'gold': 'goldClassic',
    'silver': 'silverModern',
    'neonBlue': 'neonFuturistic',
    'casino': 'casinoLuxury',
    'royalRoulette': 'royalRoulette'
  };
  
  const configId = legacyMapping[styleName] || styleName;
  return getBorderConfig(configId);
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
  
  // Couleurs arc-en-ciel pour l'effet rainbow
  const colors = ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'];
  const offset = (animationTime * 0.001) % 1; // Animation basée sur le temps
  
  colors.forEach((color: string, index: number) => {
    const position = ((index / colors.length) + offset) % 1;
    gradient.addColorStop(position, color);
  });
  
  return gradient;
};

export const createRoyalRouletteEffect = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  animationTime: number = 0,
  wheelSize: number = 200
) => {
  ctx.save();
  
  // Calculer le facteur d'échelle pour les largeurs de bordure
  const scaleFactor = wheelSize / 200;
  const borderWidth = 22 * scaleFactor; // Bordure très épaisse comme Burger King
  
  // === BORDURE EXTÉRIEURE PRINCIPALE ===
  // Gradient radial doré/orange comme Burger King
  const mainGradient = ctx.createRadialGradient(
    centerX, centerY, radius * 0.6,
    centerX, centerY, radius * 1.1
  );
  
  // Couleurs exactes Burger King : orange foncé vers doré brillant
  mainGradient.addColorStop(0, '#D2691E'); // Orange foncé
  mainGradient.addColorStop(0.2, '#FF8C00'); // Orange vif
  mainGradient.addColorStop(0.4, '#FFD700'); // Or brillant
  mainGradient.addColorStop(0.6, '#FFA500'); // Orange doré
  mainGradient.addColorStop(0.8, '#FF7F00'); // Orange moyen
  mainGradient.addColorStop(1, '#B8860B'); // Or sombre
  
  // Effet de lueur dorée intense
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 30 * scaleFactor;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.globalAlpha = 1;
  
  // Dessiner la bordure principale
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = mainGradient;
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';
  ctx.stroke();
  
  // === EFFET MÉTALLIQUE SUPÉRIEUR ===
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.8;
  
  // Reflet métallique en haut (comme sur la roue BK)
  const topHighlight = ctx.createLinearGradient(
    centerX, centerY - radius - (borderWidth/2),
    centerX, centerY - radius + (borderWidth/2)
  );
  topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  topHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
  topHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI * 1.1, Math.PI * 1.9);
  ctx.strokeStyle = topHighlight;
  ctx.lineWidth = borderWidth * 0.8;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';
  ctx.stroke();
  
  // === BORDURE INTERNE DORÉE ===
  ctx.globalAlpha = 0.9;
  
  // Gradient interne pour l'effet de profondeur
  const innerGradient = ctx.createRadialGradient(
    centerX, centerY, radius - (borderWidth * 0.7),
    centerX, centerY, radius - (borderWidth * 0.3)
  );
  innerGradient.addColorStop(0, '#B8860B'); // Or sombre
  innerGradient.addColorStop(0.5, '#DAA520'); // Or moyen
  innerGradient.addColorStop(1, '#FFD700'); // Or brillant
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - (borderWidth * 0.5), 0, 2 * Math.PI);
  ctx.strokeStyle = innerGradient;
  ctx.lineWidth = 3 * scaleFactor;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';
  ctx.stroke();
  
  // === EFFET DE BRILLANCE ANIMÉ ===
  if (animationTime > 0) {
    const sparkleOffset = (animationTime * 0.001) % (2 * Math.PI);
    ctx.globalAlpha = 0.4;
    
    // Points de brillance qui tournent
    for (let i = 0; i < 3; i++) {
      const angle = sparkleOffset + (i * 2 * Math.PI / 3);
      const sparkleX = centerX + Math.cos(angle) * radius;
      const sparkleY = centerY + Math.sin(angle) * radius;
      
      const sparkleGradient = ctx.createRadialGradient(
        sparkleX, sparkleY, 0,
        sparkleX, sparkleY, 8 * scaleFactor
      );
      sparkleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      sparkleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 6 * scaleFactor, 0, 2 * Math.PI);
      ctx.fillStyle = sparkleGradient;
      ctx.fill();
    }
  }
  
  ctx.restore();
};
