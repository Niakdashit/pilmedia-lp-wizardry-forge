export interface WheelTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: {
    wheelSize: number;
    backgroundColor: string;
    borderRadius: number | string;
    padding: number | string;
    boxShadow: string;
    fontFamily: string;
  };
  wheelStyle: {
    borderWidth: number;
    borderColor: string;
    shadowColor: string;
    segmentBorderWidth: number;
    centerSize: number;
    centerColor: string;
    pointerColor: string;
  };
  segmentColors: string[];
  textStyle: {
    fontSize: number;
    fontWeight: number | string;
    color: string;
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

export const wheelTemplates: WheelTemplate[] = [
  // Roue Fortune TV classique
  {
    id: 'wheel-fortune-classic',
    name: 'Fortune TV Classic',
    description: 'Style roue de la fortune télévisée',
    preview: '/templates/wheel-fortune-classic.png',
    style: {
      wheelSize: 400,
      backgroundColor: '#1a1a2e',
      borderRadius: 16,
      padding: 40,
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      fontFamily: 'Impact, sans-serif'
    },
    wheelStyle: {
      borderWidth: 12,
      borderColor: '#ffd700',
      shadowColor: 'rgba(255,215,0,0.5)',
      segmentBorderWidth: 3,
      centerSize: 60,
      centerColor: '#ffd700',
      pointerColor: '#ff0000'
    },
    segmentColors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    textStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff'
    },
    buttonStyle: {
      backgroundColor: '#ffd700',
      color: '#000000',
      borderRadius: 50,
      padding: '16px 48px',
      fontSize: 24,
      fontWeight: 'bold'
    }
  },

  // Style Vegas Luxe
  {
    id: 'wheel-vegas-luxe',
    name: 'Vegas Luxe',
    description: 'Style casino de Las Vegas',
    preview: '/templates/wheel-vegas-luxe.png',
    style: {
      wheelSize: 420,
      backgroundColor: '#0d0d0d',
      borderRadius: 0,
      padding: 50,
      boxShadow: '0 0 60px rgba(255,215,0,0.4)',
      fontFamily: 'Bebas Neue, sans-serif'
    },
    wheelStyle: {
      borderWidth: 15,
      borderColor: '#ffd700',
      shadowColor: 'rgba(255,215,0,0.6)',
      segmentBorderWidth: 4,
      centerSize: 70,
      centerColor: '#ffffff',
      pointerColor: '#ff0000'
    },
    segmentColors: ['#000000', '#ff0000', '#000000', '#ffd700', '#000000', '#ff0000'],
    textStyle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffd700'
    },
    buttonStyle: {
      backgroundColor: '#ff0000',
      color: '#ffffff',
      borderRadius: 8,
      padding: '20px 60px',
      fontSize: 28,
      fontWeight: 'bold'
    }
  },

  // Style Modern Gradient
  {
    id: 'wheel-modern-gradient',
    name: 'Modern Gradient',
    description: 'Design moderne avec gradients',
    preview: '/templates/wheel-modern-gradient.png',
    style: {
      wheelSize: 380,
      backgroundColor: '#ffffff',
      borderRadius: 24,
      padding: 32,
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      fontFamily: 'Poppins, sans-serif'
    },
    wheelStyle: {
      borderWidth: 8,
      borderColor: '#667eea',
      shadowColor: 'rgba(102,126,234,0.3)',
      segmentBorderWidth: 2,
      centerSize: 55,
      centerColor: '#667eea',
      pointerColor: '#f093fb'
    },
    segmentColors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'],
    textStyle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff'
    },
    buttonStyle: {
      backgroundColor: '#667eea',
      color: '#ffffff',
      borderRadius: 12,
      padding: '14px 40px',
      fontSize: 18,
      fontWeight: '600'
    }
  },

  // Style Neon Futuriste
  {
    id: 'wheel-neon-future',
    name: 'Neon Future',
    description: 'Style néon futuriste',
    preview: '/templates/wheel-neon-future.png',
    style: {
      wheelSize: 400,
      backgroundColor: '#0a0e27',
      borderRadius: 20,
      padding: 40,
      boxShadow: '0 0 80px rgba(0,255,255,0.3)',
      fontFamily: 'Orbitron, sans-serif'
    },
    wheelStyle: {
      borderWidth: 10,
      borderColor: '#00ffff',
      shadowColor: 'rgba(0,255,255,0.8)',
      segmentBorderWidth: 3,
      centerSize: 65,
      centerColor: '#ff00ff',
      pointerColor: '#00ff00'
    },
    segmentColors: ['#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff0099', '#00ccff'],
    textStyle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#ffffff'
    },
    buttonStyle: {
      backgroundColor: '#00ffff',
      color: '#0a0e27',
      borderRadius: 0,
      padding: '16px 48px',
      fontSize: 20,
      fontWeight: 'bold'
    }
  },

  // Style Pastel Doux
  {
    id: 'wheel-pastel-soft',
    name: 'Pastel Soft',
    description: 'Couleurs pastel douces',
    preview: '/templates/wheel-pastel-soft.png',
    style: {
      wheelSize: 360,
      backgroundColor: '#fef6f8',
      borderRadius: 30,
      padding: 36,
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      fontFamily: 'Quicksand, sans-serif'
    },
    wheelStyle: {
      borderWidth: 6,
      borderColor: '#ffb6c1',
      shadowColor: 'rgba(255,182,193,0.3)',
      segmentBorderWidth: 2,
      centerSize: 50,
      centerColor: '#ffd1dc',
      pointerColor: '#ff69b4'
    },
    segmentColors: ['#ffb6c1', '#dda0dd', '#b0e0e6', '#f0e68c', '#ffdab9', '#e6e6fa'],
    textStyle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#5a5a5a'
    },
    buttonStyle: {
      backgroundColor: '#ffb6c1',
      color: '#ffffff',
      borderRadius: 25,
      padding: '12px 36px',
      fontSize: 16,
      fontWeight: '600'
    }
  },

  // Style Monochrome Élégant
  {
    id: 'wheel-mono-elegant',
    name: 'Monochrome Elegant',
    description: 'Design monochrome sophistiqué',
    preview: '/templates/wheel-mono-elegant.png',
    style: {
      wheelSize: 390,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 35,
      boxShadow: '0 5px 20px rgba(0,0,0,0.12)',
      fontFamily: 'Montserrat, sans-serif'
    },
    wheelStyle: {
      borderWidth: 8,
      borderColor: '#2c3e50',
      shadowColor: 'rgba(44,62,80,0.2)',
      segmentBorderWidth: 2,
      centerSize: 58,
      centerColor: '#34495e',
      pointerColor: '#e74c3c'
    },
    segmentColors: ['#2c3e50', '#34495e', '#95a5a6', '#7f8c8d', '#bdc3c7', '#ecf0f1'],
    textStyle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff'
    },
    buttonStyle: {
      backgroundColor: '#2c3e50',
      color: '#ffffff',
      borderRadius: 8,
      padding: '14px 42px',
      fontSize: 17,
      fontWeight: '600'
    }
  },

  // Style Candy Pop
  {
    id: 'wheel-candy-pop',
    name: 'Candy Pop',
    description: 'Couleurs vives et ludiques',
    preview: '/templates/wheel-candy-pop.png',
    style: {
      wheelSize: 380,
      backgroundColor: '#fff5f7',
      borderRadius: 50,
      padding: 38,
      boxShadow: '0 12px 28px rgba(255,105,180,0.2)',
      fontFamily: 'Comic Sans MS, cursive'
    },
    wheelStyle: {
      borderWidth: 10,
      borderColor: '#ff1493',
      shadowColor: 'rgba(255,20,147,0.4)',
      segmentBorderWidth: 3,
      centerSize: 62,
      centerColor: '#ff69b4',
      pointerColor: '#ffd700'
    },
    segmentColors: ['#ff1493', '#ff69b4', '#ffd700', '#00ff7f', '#1e90ff', '#ff6347'],
    textStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff'
    },
    buttonStyle: {
      backgroundColor: '#ff1493',
      color: '#ffffff',
      borderRadius: 50,
      padding: '16px 44px',
      fontSize: 22,
      fontWeight: 'bold'
    }
  },

  // Style Corporate Pro
  {
    id: 'wheel-corporate-pro',
    name: 'Corporate Pro',
    description: 'Style professionnel et corporate',
    preview: '/templates/wheel-corporate-pro.png',
    style: {
      wheelSize: 400,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      padding: 32,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'Inter, sans-serif'
    },
    wheelStyle: {
      borderWidth: 6,
      borderColor: '#0a66c2',
      shadowColor: 'rgba(10,102,194,0.2)',
      segmentBorderWidth: 2,
      centerSize: 54,
      centerColor: '#0a66c2',
      pointerColor: '#ff9900'
    },
    segmentColors: ['#0a66c2', '#1e3a8a', '#059669', '#dc2626', '#f59e0b', '#8b5cf6'],
    textStyle: {
      fontSize: 15,
      fontWeight: '500',
      color: '#ffffff'
    },
    buttonStyle: {
      backgroundColor: '#0a66c2',
      color: '#ffffff',
      borderRadius: 6,
      padding: '12px 38px',
      fontSize: 16,
      fontWeight: '600'
    }
  }
];
