export interface ScratchTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: {
    cardWidth: number;
    cardHeight: number;
    backgroundColor: string;
    borderRadius: number | string;
    padding: number | string;
    boxShadow: string;
    fontFamily: string;
  };
  scratchArea: {
    backgroundColor: string;
    foregroundColor: string;
    pattern?: 'solid' | 'gradient' | 'confetti' | 'stars';
    brushSize: number;
    revealPercentage: number;
  };
  revealStyle: {
    fontSize: number;
    fontWeight: number | string;
    color: string;
    backgroundColor: string;
    animation?: string;
  };
}

export const scratchTemplates: ScratchTemplate[] = [
  // Style Loterie Classique
  {
    id: 'scratch-lottery-classic',
    name: 'Lottery Classic',
    description: 'Carte à gratter style loterie classique',
    preview: '/templates/scratch-lottery-classic.png',
    style: {
      cardWidth: 380,
      cardHeight: 280,
      backgroundColor: '#c8102e',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      fontFamily: 'Impact, sans-serif'
    },
    scratchArea: {
      backgroundColor: '#ffd700',
      foregroundColor: '#c0c0c0',
      pattern: 'solid',
      brushSize: 40,
      revealPercentage: 60
    },
    revealStyle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#c8102e',
      backgroundColor: '#ffd700',
      animation: 'bounce'
    }
  },

  // Style Or Luxe
  {
    id: 'scratch-gold-luxury',
    name: 'Gold Luxury',
    description: 'Design luxueux doré',
    preview: '/templates/scratch-gold-luxury.png',
    style: {
      cardWidth: 400,
      cardHeight: 300,
      backgroundColor: '#1a1a1a',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 10px 40px rgba(255,215,0,0.3)',
      fontFamily: 'Playfair Display, serif'
    },
    scratchArea: {
      backgroundColor: '#000000',
      foregroundColor: '#ffd700',
      pattern: 'gradient',
      brushSize: 45,
      revealPercentage: 65
    },
    revealStyle: {
      fontSize: 52,
      fontWeight: 'bold',
      color: '#ffd700',
      backgroundColor: '#000000',
      animation: 'glow'
    }
  },

  // Style Moderne Gradient
  {
    id: 'scratch-modern-gradient',
    name: 'Modern Gradient',
    description: 'Gradients colorés modernes',
    preview: '/templates/scratch-modern-gradient.png',
    style: {
      cardWidth: 360,
      cardHeight: 260,
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 18,
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
      fontFamily: 'Poppins, sans-serif'
    },
    scratchArea: {
      backgroundColor: '#f3f4f6',
      foregroundColor: '#667eea',
      pattern: 'gradient',
      brushSize: 38,
      revealPercentage: 55
    },
    revealStyle: {
      fontSize: 42,
      fontWeight: '700',
      color: '#667eea',
      backgroundColor: '#f3f4f6',
      animation: 'scale'
    }
  },

  // Style Confetti Festif
  {
    id: 'scratch-confetti-party',
    name: 'Confetti Party',
    description: 'Style festif avec confettis',
    preview: '/templates/scratch-confetti-party.png',
    style: {
      cardWidth: 380,
      cardHeight: 280,
      backgroundColor: '#ff6b9d',
      borderRadius: 24,
      padding: 22,
      boxShadow: '0 8px 24px rgba(255,107,157,0.3)',
      fontFamily: 'Quicksand, sans-serif'
    },
    scratchArea: {
      backgroundColor: '#ffffff',
      foregroundColor: '#ffd1dc',
      pattern: 'confetti',
      brushSize: 42,
      revealPercentage: 60
    },
    revealStyle: {
      fontSize: 46,
      fontWeight: 'bold',
      color: '#ff1493',
      backgroundColor: '#ffffff',
      animation: 'shake'
    }
  },

  // Style Spatial Étoilé
  {
    id: 'scratch-space-stars',
    name: 'Space Stars',
    description: 'Thème spatial avec étoiles',
    preview: '/templates/scratch-space-stars.png',
    style: {
      cardWidth: 390,
      cardHeight: 290,
      backgroundColor: '#0a0e27',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 0 40px rgba(0,255,255,0.3)',
      fontFamily: 'Orbitron, sans-serif'
    },
    scratchArea: {
      backgroundColor: '#1a1a3e',
      foregroundColor: '#00ffff',
      pattern: 'stars',
      brushSize: 40,
      revealPercentage: 65
    },
    revealStyle: {
      fontSize: 50,
      fontWeight: 'bold',
      color: '#00ffff',
      backgroundColor: '#1a1a3e',
      animation: 'pulse'
    }
  },

  // Style Nature Zen
  {
    id: 'scratch-nature-zen',
    name: 'Nature Zen',
    description: 'Couleurs naturelles apaisantes',
    preview: '/templates/scratch-nature-zen.png',
    style: {
      cardWidth: 370,
      cardHeight: 270,
      backgroundColor: '#8fbc8f',
      borderRadius: 18,
      padding: 20,
      boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
      fontFamily: 'Lora, serif'
    },
    scratchArea: {
      backgroundColor: '#f0fff0',
      foregroundColor: '#90ee90',
      pattern: 'solid',
      brushSize: 38,
      revealPercentage: 58
    },
    revealStyle: {
      fontSize: 44,
      fontWeight: '600',
      color: '#2e7d32',
      backgroundColor: '#f0fff0',
      animation: 'fade'
    }
  },

  // Style Bonbon Sucré
  {
    id: 'scratch-candy-sweet',
    name: 'Candy Sweet',
    description: 'Design sucré et coloré',
    preview: '/templates/scratch-candy-sweet.png',
    style: {
      cardWidth: 360,
      cardHeight: 260,
      backgroundColor: '#ffb6c1',
      borderRadius: 30,
      padding: 18,
      boxShadow: '0 10px 25px rgba(255,182,193,0.4)',
      fontFamily: 'Comic Sans MS, cursive'
    },
    scratchArea: {
      backgroundColor: '#fff0f5',
      foregroundColor: '#ff69b4',
      pattern: 'confetti',
      brushSize: 42,
      revealPercentage: 62
    },
    revealStyle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#ff1493',
      backgroundColor: '#fff0f5',
      animation: 'bounce'
    }
  },

  // Style Minimaliste Pro
  {
    id: 'scratch-minimal-pro',
    name: 'Minimal Pro',
    description: 'Design minimaliste professionnel',
    preview: '/templates/scratch-minimal-pro.png',
    style: {
      cardWidth: 380,
      cardHeight: 280,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 20,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'Inter, sans-serif'
    },
    scratchArea: {
      backgroundColor: '#f8f9fa',
      foregroundColor: '#e9ecef',
      pattern: 'solid',
      brushSize: 36,
      revealPercentage: 55
    },
    revealStyle: {
      fontSize: 40,
      fontWeight: '600',
      color: '#212529',
      backgroundColor: '#f8f9fa',
      animation: 'none'
    }
  },

  // Style Néon Urbain
  {
    id: 'scratch-neon-urban',
    name: 'Neon Urban',
    description: 'Style urbain néon',
    preview: '/templates/scratch-neon-urban.png',
    style: {
      cardWidth: 390,
      cardHeight: 290,
      backgroundColor: '#1a1a1a',
      borderRadius: 12,
      padding: 22,
      boxShadow: '0 0 50px rgba(255,0,255,0.4)',
      fontFamily: 'Teko, sans-serif'
    },
    scratchArea: {
      backgroundColor: '#2d2d2d',
      foregroundColor: '#ff00ff',
      pattern: 'gradient',
      brushSize: 44,
      revealPercentage: 68
    },
    revealStyle: {
      fontSize: 54,
      fontWeight: 'bold',
      color: '#00ff00',
      backgroundColor: '#2d2d2d',
      animation: 'glow'
    }
  },

  // Style Rétro Vintage
  {
    id: 'scratch-retro-vintage',
    name: 'Retro Vintage',
    description: 'Look rétro années 80',
    preview: '/templates/scratch-retro-vintage.png',
    style: {
      cardWidth: 380,
      cardHeight: 280,
      backgroundColor: '#f4a460',
      borderRadius: 8,
      padding: 20,
      boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
      fontFamily: 'Courier New, monospace'
    },
    scratchArea: {
      backgroundColor: '#ffefd5',
      foregroundColor: '#cd853f',
      pattern: 'solid',
      brushSize: 40,
      revealPercentage: 60
    },
    revealStyle: {
      fontSize: 46,
      fontWeight: 'bold',
      color: '#8b4513',
      backgroundColor: '#ffefd5',
      animation: 'slide'
    }
  }
];
