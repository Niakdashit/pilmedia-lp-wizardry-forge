// Configuration des styles de texte avancés
export interface TextStyleEffect {
  id: string;
  name: string;
  category: 'gradient' | '3d' | 'neon' | 'metallic' | 'outline' | 'shadow' | 'vintage' | 'modern' | 'gaming' | 'luxury';
  preview?: string;
  css: {
    [key: string]: any;
  };
}

export const advancedTextStyles: TextStyleEffect[] = [
  // GRADIENTS
  {
    id: 'gradient-fire',
    name: 'Feu',
    category: 'gradient',
    css: {
      background: 'linear-gradient(45deg, #ff6b35, #ff9068, #ffb347)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold'
    }
  },
  {
    id: 'gradient-ocean',
    name: 'Océan',
    category: 'gradient',
    css: {
      background: 'linear-gradient(45deg, #0077be, #00a8cc, #40e0d0)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold'
    }
  },
  {
    id: 'gradient-sunset',
    name: 'Coucher de soleil',
    category: 'gradient',
    css: {
      background: 'linear-gradient(45deg, #ff7f50, #ff6347, #ffd700)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold'
    }
  },
  {
    id: 'gradient-purple',
    name: 'Violet mystique',
    category: 'gradient',
    css: {
      background: 'linear-gradient(45deg, #8a2be2, #9932cc, #da70d6)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold'
    }
  },
  {
    id: 'gradient-rainbow',
    name: 'Arc-en-ciel',
    category: 'gradient',
    css: {
      background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold'
    }
  },

  // 3D EFFECTS
  {
    id: '3d-classic',
    name: '3D Classique',
    category: '3d',
    css: {
      textShadow: '1px 1px 0px #ccc, 2px 2px 0px #c9c9c9, 3px 3px 0px #bbb, 4px 4px 0px #b9b9b9, 5px 5px 0px #aaa, 6px 6px 1px rgba(0,0,0,.1), 0px 0px 5px rgba(0,0,0,.1), 1px 1px 3px rgba(0,0,0,.3), 3px 3px 5px rgba(0,0,0,.2), 5px 5px 10px rgba(0,0,0,.25)',
      fontWeight: 'bold'
    }
  },
  {
    id: '3d-red',
    name: '3D Rouge',
    category: '3d',
    css: {
      textShadow: '1px 1px 0px #f88, 2px 2px 0px #f66, 3px 3px 0px #f44, 4px 4px 0px #f22, 5px 5px 0px #f00, 6px 6px 1px rgba(0,0,0,.1), 0px 0px 5px rgba(0,0,0,.1), 1px 1px 3px rgba(0,0,0,.3), 3px 3px 5px rgba(0,0,0,.2), 5px 5px 10px rgba(0,0,0,.25)',
      fontWeight: 'bold'
    }
  },
  {
    id: '3d-blue',
    name: '3D Bleu',
    category: '3d',
    css: {
      textShadow: '1px 1px 0px #88f, 2px 2px 0px #66f, 3px 3px 0px #44f, 4px 4px 0px #22f, 5px 5px 0px #00f, 6px 6px 1px rgba(0,0,0,.1), 0px 0px 5px rgba(0,0,0,.1), 1px 1px 3px rgba(0,0,0,.3), 3px 3px 5px rgba(0,0,0,.2), 5px 5px 10px rgba(0,0,0,.25)',
      fontWeight: 'bold'
    }
  },

  // NEON EFFECTS
  {
    id: 'neon-blue',
    name: 'Néon Bleu',
    category: 'neon',
    css: {
      textShadow: '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff, 0 0 35px #00ffff, 0 0 40px #00ffff',
      fontWeight: 'bold',
      letterSpacing: '2px'
    }
  },
  {
    id: 'neon-pink',
    name: 'Néon Rose',
    category: 'neon',
    css: {
      textShadow: '0 0 5px #ff1177, 0 0 10px #ff1177, 0 0 15px #ff1177, 0 0 20px #ff1177, 0 0 35px #ff1177, 0 0 40px #ff1177',
      fontWeight: 'bold',
      letterSpacing: '2px'
    }
  },
  {
    id: 'neon-green',
    name: 'Néon Vert',
    category: 'neon',
    css: {
      textShadow: '0 0 5px #39ff14, 0 0 10px #39ff14, 0 0 15px #39ff14, 0 0 20px #39ff14, 0 0 35px #39ff14, 0 0 40px #39ff14',
      fontWeight: 'bold',
      letterSpacing: '2px'
    }
  },

  // METALLIC EFFECTS
  {
    id: 'gold',
    name: 'Or',
    category: 'metallic',
    css: {
      background: 'linear-gradient(45deg, #b8860b, #ffd700, #ffff00, #ffd700, #b8860b)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      fontWeight: 'bold'
    }
  },
  {
    id: 'silver',
    name: 'Argent',
    category: 'metallic',
    css: {
      background: 'linear-gradient(45deg, #708090, #c0c0c0, #ffffff, #c0c0c0, #708090)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      fontWeight: 'bold'
    }
  },
  {
    id: 'outline-thick',
    name: 'Contour Épais',
    category: 'outline',
    css: {
      WebkitTextStroke: '3px #000000',
      fontWeight: 'bold'
    }
  },

  {
    id: 'outline-colorful',
    name: 'Contour Coloré',
    category: 'outline',
    css: {
      WebkitTextStroke: '2px #ff6b35',
      fontWeight: 'bold'
    }
  },
  {
    id: 'outline-double',
    name: 'Double Contour',
    category: 'outline',
    css: {
      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff',
      fontWeight: 'bold'
    }
  },

  // SHADOW EFFECTS
  {
    id: 'long-shadow',
    name: 'Ombre Longue',
    category: 'shadow',
    css: {
      textShadow: '1px 1px 0px #aaa, 2px 2px 0px #aaa, 3px 3px 0px #aaa, 4px 4px 0px #aaa, 5px 5px 0px #aaa, 6px 6px 0px #aaa, 7px 7px 0px #aaa, 8px 8px 0px #aaa, 9px 9px 0px #aaa, 10px 10px 0px #aaa',
      fontWeight: 'bold'
    }
  },
  {
    id: 'glow-white',
    name: 'Lueur Blanche',
    category: 'shadow',
    css: {
      textShadow: '0px 0px 20px rgba(255,255,255,0.8), 0px 0px 30px rgba(255,255,255,0.8), 0px 0px 40px rgba(255,255,255,0.8)',
      fontWeight: 'bold'
    }
  },

  // VINTAGE EFFECTS
  {
    id: 'vintage-worn',
    name: 'Vintage Usé',
    category: 'vintage',
    css: {
      textShadow: '2px 2px 0px #d9d9d9, 4px 4px 0px #b3b3b3, 6px 6px 0px #8c8c8c',
      filter: 'sepia(30%)',
      fontWeight: 'bold'
    }
  },
  {
    id: 'retro-neon',
    name: 'Rétro Néon',
    category: 'vintage',
    css: {
      background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff',
      fontWeight: 'bold',
      letterSpacing: '3px'
    }
  },

  // MODERN EFFECTS
  {
    id: 'glass-modern',
    name: 'Verre Moderne',
    category: 'modern',
    css: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
      fontWeight: 'bold'
    }
  },
  {
    id: 'holographic',
    name: 'Holographique',
    category: 'modern',
    css: {
      background: 'linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #ff0080)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 30px rgba(255, 0, 128, 0.5)',
      fontWeight: 'bold',
      letterSpacing: '2px'
    }
  },

  // GAMING EFFECTS
  {
    id: 'pixel-retro',
    name: 'Pixel Rétro',
    category: 'gaming',
    css: {
      textShadow: '2px 0 0 #00ff00, -2px 0 0 #ff0080',
      fontWeight: 'bold',
      letterSpacing: '1px'
    }
  },
  {
    id: 'electric-gaming',
    name: 'Gaming Électrique',
    category: 'gaming',
    css: {
      background: 'linear-gradient(45deg, #00ff41, #0080ff)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
      fontWeight: 'bold'
    }
  },

  // LUXURY EFFECTS
  {
    id: 'diamond-luxury',
    name: 'Diamant Luxe',
    category: 'luxury',
    css: {
      background: 'linear-gradient(45deg, #ffffff, #e0e0e0, #ffffff, #f0f0f0)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
      fontWeight: 'bold'
    }
  },
  {
    id: 'royal-purple',
    name: 'Pourpre Royal',
    category: 'luxury',
    css: {
      background: 'linear-gradient(45deg, #4b0082, #8a2be2, #9932cc)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 10px #8a2be2, 0 0 20px #8a2be2',
      fontWeight: 'bold',
      letterSpacing: '1px'
    }
  }
];

// Polices spécialisées par catégorie
export const specializedFonts = {
  '3d': ['Anton', 'Bebas Neue', 'Oswald', 'Impact', 'Alfa Slab One'],
  'gaming': ['Orbitron', 'Press Start 2P', 'Audiowide', 'Exo 2', 'Teko', 'Black Ops One'],
  'luxury': ['Playfair Display', 'Cormorant Garamond', 'Cinzel', 'Merriweather'],
  'vintage': ['Special Elite', 'Fontdiner Swanky', 'Griffy', 'Rye', 'Nosifer'],
  'modern': ['Rubik', 'Work Sans', 'Fira Sans', 'Kanit', 'Nunito'],
  'fun': ['Fredoka One', 'Pacifico', 'Lobster', 'Dancing Script', 'Caveat', 'Righteous'],
  'horror': ['Creepster', 'Eater', 'Metal Mania', 'Nosifer', 'Butcherman', 'New Rocker'],
  'tech': ['Orbitron', 'Saira Extra Condensed', 'Zen Dots', 'Wallpoet', 'Staatliches'],
  'bold': ['Titan One', 'Russo One', 'Racing Sans One', 'Squada One', 'Bangers']
};

// Fonction pour obtenir les styles par catégorie
export const getStylesByCategory = (category: string): TextStyleEffect[] => {
  return advancedTextStyles.filter(style => style.category === category);
};

// Fonction pour appliquer un style à un élément
export const applyTextStyle = (element: any, styleId: string): any => {
  const style = advancedTextStyles.find(s => s.id === styleId);
  if (!style) return element;

  return {
    ...element,
    advancedStyle: style,
    // Sauvegarder les propriétés CSS pour le rendu
    customCSS: style.css
  };
};