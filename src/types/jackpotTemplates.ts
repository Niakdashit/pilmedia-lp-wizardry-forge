export interface JackpotTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: {
    containerWidth: number;
    backgroundColor: string;
    borderRadius: number | string;
    padding: number | string;
    boxShadow: string;
    fontFamily: string;
  };
  slotStyle: {
    width: number;
    height: number;
    backgroundColor: string;
    borderRadius: number;
    symbolSize: number;
    spacing: number;
  };
  symbolSet: {
    type: 'classic' | 'fruit' | 'emoji' | 'numbers' | 'luxury' | 'casino';
    symbols: string[];
    colors: string[];
  };
  displayStyle: {
    fontSize: number;
    fontWeight: number | string;
    color: string;
    glowColor?: string;
  };
  buttonStyle: {
    backgroundColor: string;
    color: string;
    borderRadius: number;
    padding: string;
    fontSize: number;
    fontWeight: number | string;
  };
}

export const jackpotTemplates: JackpotTemplate[] = [
  // Machine à Sous Classique
  {
    id: 'jackpot-classic-slots',
    name: 'Classic Slots',
    description: 'Machine à sous classique style Vegas',
    preview: '/templates/jackpot-classic-slots.png',
    style: {
      containerWidth: 420,
      backgroundColor: '#8b0000',
      borderRadius: 24,
      padding: 32,
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      fontFamily: 'Impact, sans-serif'
    },
    slotStyle: {
      width: 90,
      height: 120,
      backgroundColor: '#1a1a1a',
      borderRadius: 12,
      symbolSize: 60,
      spacing: 12
    },
    symbolSet: {
      type: 'classic',
      symbols: ['🍒', '🍋', '🍊', '7️⃣', '💎', '⭐'],
      colors: ['#ff0000', '#ffff00', '#ffa500', '#ffd700', '#00ffff', '#ffffff']
    },
    displayStyle: {
      fontSize: 72,
      fontWeight: 'bold',
      color: '#ffd700',
      glowColor: '#ff0000'
    },
    buttonStyle: {
      backgroundColor: '#ffd700',
      color: '#000000',
      borderRadius: 50,
      padding: '18px 48px',
      fontSize: 24,
      fontWeight: 'bold'
    }
  },

  // Fruits Tropicaux
  {
    id: 'jackpot-tropical-fruits',
    name: 'Tropical Fruits',
    description: 'Thème fruits tropicaux colorés',
    preview: '/templates/jackpot-tropical-fruits.png',
    style: {
      containerWidth: 440,
      backgroundColor: '#ff6b9d',
      borderRadius: 20,
      padding: 28,
      boxShadow: '0 8px 32px rgba(255,107,157,0.4)',
      fontFamily: 'Fredoka, sans-serif'
    },
    slotStyle: {
      width: 95,
      height: 125,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      symbolSize: 65,
      spacing: 14
    },
    symbolSet: {
      type: 'fruit',
      symbols: ['🍎', '🍌', '🍇', '🍉', '🍓', '🥝'],
      colors: ['#ff0000', '#ffff00', '#9370db', '#ff1493', '#ff69b4', '#7cfc00']
    },
    displayStyle: {
      fontSize: 68,
      fontWeight: 'bold',
      color: '#ffffff',
      glowColor: '#ff1493'
    },
    buttonStyle: {
      backgroundColor: '#ffffff',
      color: '#ff6b9d',
      borderRadius: 16,
      padding: '16px 44px',
      fontSize: 22,
      fontWeight: 'bold'
    }
  },

  // Emoji Party
  {
    id: 'jackpot-emoji-party',
    name: 'Emoji Party',
    description: 'Emojis festifs et fun',
    preview: '/templates/jackpot-emoji-party.png',
    style: {
      containerWidth: 400,
      backgroundColor: '#6366f1',
      borderRadius: 28,
      padding: 30,
      boxShadow: '0 12px 36px rgba(99,102,241,0.3)',
      fontFamily: 'Nunito, sans-serif'
    },
    slotStyle: {
      width: 88,
      height: 118,
      backgroundColor: '#ffffff',
      borderRadius: 20,
      symbolSize: 58,
      spacing: 12
    },
    symbolSet: {
      type: 'emoji',
      symbols: ['🎉', '🎊', '🎁', '🎈', '🎆', '✨'],
      colors: ['#ff6347', '#ffd700', '#ff69b4', '#00ced1', '#ff4500', '#ffff00']
    },
    displayStyle: {
      fontSize: 65,
      fontWeight: 'bold',
      color: '#ffffff',
      glowColor: '#ffd700'
    },
    buttonStyle: {
      backgroundColor: '#ffffff',
      color: '#6366f1',
      borderRadius: 25,
      padding: '15px 42px',
      fontSize: 20,
      fontWeight: 'bold'
    }
  },

  // Luxe Diamant
  {
    id: 'jackpot-luxury-diamond',
    name: 'Luxury Diamond',
    description: 'Thème luxueux avec diamants',
    preview: '/templates/jackpot-luxury-diamond.png',
    style: {
      containerWidth: 460,
      backgroundColor: '#000000',
      borderRadius: 16,
      padding: 36,
      boxShadow: '0 0 60px rgba(0,255,255,0.3)',
      fontFamily: 'Cinzel, serif'
    },
    slotStyle: {
      width: 100,
      height: 130,
      backgroundColor: '#1a1a1a',
      borderRadius: 10,
      symbolSize: 68,
      spacing: 16
    },
    symbolSet: {
      type: 'luxury',
      symbols: ['💎', '👑', '💍', '🏆', '⭐', '💰'],
      colors: ['#00ffff', '#ffd700', '#ff1493', '#ffd700', '#ffffff', '#32cd32']
    },
    displayStyle: {
      fontSize: 75,
      fontWeight: 'bold',
      color: '#00ffff',
      glowColor: '#00ffff'
    },
    buttonStyle: {
      backgroundColor: '#ffd700',
      color: '#000000',
      borderRadius: 8,
      padding: '20px 52px',
      fontSize: 26,
      fontWeight: 'bold'
    }
  },

  // Casino Numérique
  {
    id: 'jackpot-digital-casino',
    name: 'Digital Casino',
    description: 'Style casino numérique moderne',
    preview: '/templates/jackpot-digital-casino.png',
    style: {
      containerWidth: 420,
      backgroundColor: '#0f172a',
      borderRadius: 20,
      padding: 32,
      boxShadow: '0 10px 30px rgba(15,23,42,0.5)',
      fontFamily: 'Rajdhani, sans-serif'
    },
    slotStyle: {
      width: 92,
      height: 122,
      backgroundColor: '#1e293b',
      borderRadius: 12,
      symbolSize: 62,
      spacing: 12
    },
    symbolSet: {
      type: 'numbers',
      symbols: ['7️⃣', '🎰', '🃏', '🎲', '🔔', '💵'],
      colors: ['#ef4444', '#fbbf24', '#8b5cf6', '#10b981', '#f59e0b', '#22c55e']
    },
    displayStyle: {
      fontSize: 70,
      fontWeight: 'bold',
      color: '#fbbf24',
      glowColor: '#ef4444'
    },
    buttonStyle: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      borderRadius: 12,
      padding: '17px 46px',
      fontSize: 23,
      fontWeight: 'bold'
    }
  },

  // Néon Cyberpunk
  {
    id: 'jackpot-neon-cyber',
    name: 'Neon Cyberpunk',
    description: 'Style cyberpunk futuriste',
    preview: '/templates/jackpot-neon-cyber.png',
    style: {
      containerWidth: 440,
      backgroundColor: '#0a0e27',
      borderRadius: 0,
      padding: 30,
      boxShadow: '0 0 80px rgba(255,0,255,0.4)',
      fontFamily: 'Orbitron, sans-serif'
    },
    slotStyle: {
      width: 96,
      height: 126,
      backgroundColor: '#1a1a3e',
      borderRadius: 4,
      symbolSize: 64,
      spacing: 14
    },
    symbolSet: {
      type: 'casino',
      symbols: ['⚡', '🔮', '🌟', '💫', '🔥', '⚛️'],
      colors: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0099', '#00ccff']
    },
    displayStyle: {
      fontSize: 72,
      fontWeight: 'bold',
      color: '#00ffff',
      glowColor: '#ff00ff'
    },
    buttonStyle: {
      backgroundColor: '#ff00ff',
      color: '#000000',
      borderRadius: 0,
      padding: '18px 48px',
      fontSize: 24,
      fontWeight: 'bold'
    }
  },

  // Pastel Doux
  {
    id: 'jackpot-pastel-soft',
    name: 'Pastel Soft',
    description: 'Couleurs pastel douces et calmes',
    preview: '/templates/jackpot-pastel-soft.png',
    style: {
      containerWidth: 400,
      backgroundColor: '#fef3f4',
      borderRadius: 32,
      padding: 28,
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      fontFamily: 'Quicksand, sans-serif'
    },
    slotStyle: {
      width: 88,
      height: 118,
      backgroundColor: '#ffffff',
      borderRadius: 24,
      symbolSize: 58,
      spacing: 12
    },
    symbolSet: {
      type: 'emoji',
      symbols: ['🌸', '🌼', '🌺', '🌻', '🌷', '🌹'],
      colors: ['#ffb6c1', '#ffdab9', '#dda0dd', '#f0e68c', '#ffb6d9', '#ff69b4']
    },
    displayStyle: {
      fontSize: 66,
      fontWeight: '600',
      color: '#ff69b4',
      glowColor: '#ffb6c1'
    },
    buttonStyle: {
      backgroundColor: '#ffb6c1',
      color: '#ffffff',
      borderRadius: 30,
      padding: '14px 40px',
      fontSize: 19,
      fontWeight: '600'
    }
  },

  // Rétro Arcade
  {
    id: 'jackpot-retro-arcade',
    name: 'Retro Arcade',
    description: 'Style arcade années 80',
    preview: '/templates/jackpot-retro-arcade.png',
    style: {
      containerWidth: 420,
      backgroundColor: '#2d1b69',
      borderRadius: 12,
      padding: 32,
      boxShadow: '0 10px 30px rgba(45,27,105,0.5)',
      fontFamily: 'Press Start 2P, cursive'
    },
    slotStyle: {
      width: 90,
      height: 120,
      backgroundColor: '#1a0f3a',
      borderRadius: 8,
      symbolSize: 60,
      spacing: 12
    },
    symbolSet: {
      type: 'classic',
      symbols: ['🕹️', '👾', '🎮', '🏁', '🎯', '💥'],
      colors: ['#ff6ec7', '#00ffff', '#ffff00', '#ff00ff', '#00ff00', '#ff0000']
    },
    displayStyle: {
      fontSize: 68,
      fontWeight: 'bold',
      color: '#00ffff',
      glowColor: '#ff00ff'
    },
    buttonStyle: {
      backgroundColor: '#ff6ec7',
      color: '#2d1b69',
      borderRadius: 4,
      padding: '16px 44px',
      fontSize: 20,
      fontWeight: 'bold'
    }
  }
];
