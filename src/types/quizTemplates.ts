export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  hasImage: boolean;
  hasGrid?: boolean;
  style: {
    containerWidth: number;
    backgroundColor: string;
    borderRadius: number | string;
    padding: number | string;
    boxShadow: string;
    fontFamily: string;
  };
  header?: {
    height: number;
    backgroundColor: string;
    text?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: number;
    align?: 'left' | 'center' | 'right';
  };
  panelStyle?: {
    background: string;
    border: string;
    borderRadius: string;
    padding: string;
  };
  gridStyle?: {
    gap: string;
    columns: number;
  };
  cardStyle?: {
    background: string;
    border: string;
    padding: string | number;
    cursor: string;
  };
  captionStyle?: {
    background: string;
    color: string;
    borderRadius: string;
    padding: string;
    fontWeight: number;
    textTransform: string;
    textAlign: string;
    boxShadow: string;
    marginTop: string;
    fontSize: string;
    letterSpacing: string;
  };
  questionStyle: {
    textAlign: 'left' | 'center' | 'right';
    fontSize: number;
    fontWeight: number;
    marginBottom: number;
    color: string;
    background?: string;
    border?: string;
    borderRadius?: number | string;
    padding?: string;
  };
  imageStyle?: {
    width: string;
    borderRadius: number;
    border: string;
    marginBottom: number;
    overflow?: string;
    boxShadow?: string;
  };
  optionStyle: {
    display: string;
    alignItems: string;
    border?: string;
    borderRadius: number | string;
    padding: string | number;
    margin: string | number;
    fontSize: number;
    fontWeight: number;
    cursor: string;
    transition: string;
    hoverBackground?: string;
    flexDirection?: string;
    overflow?: string;
    background?: string;
  };
  letterStyle: {
    border: string;
    borderRadius: string;
    width: number;
    height: number;
    display: string;
    alignItems: string;
    justifyContent: string;
    marginRight: number;
    fontWeight: string;
    backgroundColor?: string;
    color?: string;
  };
}

export const quizTemplates: QuizTemplate[] = [
  // Apple-inspired - Minimaliste et élégant
  {
    id: 'apple-minimal',
    name: 'Apple Minimal',
    description: 'Design épuré inspiré d\'Apple',
    preview: '/templates/apple-minimal.png',
    hasImage: false,
    style: {
      containerWidth: 500,
      backgroundColor: '#ffffff',
      borderRadius: 24,
      padding: 32,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 28,
      fontWeight: 600,
      marginBottom: 32,
      color: '#1d1d1f'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #d2d2d7',
      borderRadius: 12,
      padding: '16px 24px',
      margin: '12px 0',
      fontSize: 17,
      fontWeight: 400,
      cursor: 'pointer',
      transition: '0.3s ease',
      hoverBackground: '#f5f5f7'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '50%',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '600',
      backgroundColor: '#f5f5f7',
      color: '#1d1d1f'
    }
  },

  // Google Material Design
  {
    id: 'google-material',
    name: 'Google Material',
    description: 'Material Design de Google',
    preview: '/templates/google-material.png',
    hasImage: false,
    style: {
      containerWidth: 480,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: 'Roboto, sans-serif'
    },
    questionStyle: {
      textAlign: 'left',
      fontSize: 24,
      fontWeight: 500,
      marginBottom: 24,
      color: '#202124'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #dadce0',
      borderRadius: 4,
      padding: '16px 20px',
      margin: '12px 0',
      fontSize: 16,
      fontWeight: 400,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f8f9fa'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '50%',
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '500',
      backgroundColor: '#4285f4',
      color: '#ffffff'
    }
  },

  // Nike - Bold et énergique
  {
    id: 'nike-bold',
    name: 'Nike Bold',
    description: 'Design audacieux et sportif',
    preview: '/templates/nike-bold.png',
    hasImage: true,
    style: {
      containerWidth: 520,
      backgroundColor: '#000000',
      borderRadius: 0,
      padding: 40,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      fontFamily: 'Helvetica Neue, Arial, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 32,
      color: '#ffffff'
    },
    imageStyle: {
      width: '100%',
      borderRadius: 0,
      border: 'none',
      marginBottom: 24
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '2px solid #ffffff',
      borderRadius: 0,
      padding: '18px 28px',
      margin: '16px 0',
      fontSize: 18,
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#ffffff',
      background: 'transparent'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '0',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '700',
      backgroundColor: '#ff0000',
      color: '#000000'
    }
  },

  // Airbnb - Chaleureux et accueillant
  {
    id: 'airbnb-warm',
    name: 'Airbnb Warm',
    description: 'Style chaleureux et accueillant',
    preview: '/templates/airbnb-warm.png',
    hasImage: true,
    style: {
      containerWidth: 500,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 28,
      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
      fontFamily: 'Circular, sans-serif'
    },
    questionStyle: {
      textAlign: 'left',
      fontSize: 26,
      fontWeight: 600,
      marginBottom: 24,
      color: '#222222'
    },
    imageStyle: {
      width: '100%',
      borderRadius: 12,
      border: 'none',
      marginBottom: 20
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #dddddd',
      borderRadius: 12,
      padding: '16px 20px',
      margin: '12px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f7f7f7'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '50%',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      fontWeight: '600',
      backgroundColor: '#ff385c',
      color: '#ffffff'
    }
  },

  // Spotify - Moderne et musical
  {
    id: 'spotify-music',
    name: 'Spotify Music',
    description: 'Style musical et moderne',
    preview: '/templates/spotify-music.png',
    hasImage: false,
    style: {
      containerWidth: 460,
      backgroundColor: '#121212',
      borderRadius: 8,
      padding: 32,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      fontFamily: 'Circular, Helvetica, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 28,
      color: '#ffffff'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 6,
      padding: '14px 20px',
      margin: '10px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#282828',
      background: '#181818'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '50%',
      width: 34,
      height: 34,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '700',
      backgroundColor: '#1db954',
      color: '#000000'
    }
  },

  // Netflix - Cinématique
  {
    id: 'netflix-cinema',
    name: 'Netflix Cinema',
    description: 'Style cinématique',
    preview: '/templates/netflix-cinema.png',
    hasImage: true,
    style: {
      containerWidth: 560,
      backgroundColor: '#141414',
      borderRadius: 4,
      padding: 0,
      boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
      fontFamily: 'Netflix Sans, Helvetica, sans-serif'
    },
    header: {
      height: 60,
      backgroundColor: '#e50914',
      textColor: '#ffffff',
      fontSize: 18,
      fontWeight: 700,
      align: 'center'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 600,
      marginBottom: 24,
      color: '#ffffff',
      padding: '24px'
    },
    imageStyle: {
      width: '100%',
      borderRadius: 0,
      border: 'none',
      marginBottom: 20
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 0,
      padding: '16px 24px',
      margin: '0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#2f2f2f',
      background: '#1a1a1a'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '0',
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '700',
      backgroundColor: '#e50914',
      color: '#ffffff'
    }
  },

  // Instagram - Gradient moderne
  {
    id: 'instagram-gradient',
    name: 'Instagram Gradient',
    description: 'Gradients colorés modernes',
    preview: '/templates/instagram-gradient.png',
    hasImage: true,
    hasGrid: true,
    style: {
      containerWidth: 480,
      backgroundColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      borderRadius: 20,
      padding: 24,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      fontFamily: 'system-ui, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 20,
      color: '#ffffff',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '16px',
      padding: '16px'
    },
    gridStyle: {
      gap: '12px',
      columns: 2
    },
    imageStyle: {
      width: '100%',
      borderRadius: 12,
      border: '3px solid #ffffff',
      marginBottom: 0,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    },
    optionStyle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      border: 'none',
      borderRadius: 12,
      padding: 0,
      margin: 0,
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      background: 'transparent'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '0',
      width: 0,
      height: 0,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 0,
      fontWeight: 'normal'
    }
  },

  // LinkedIn - Professionnel
  {
    id: 'linkedin-pro',
    name: 'LinkedIn Professional',
    description: 'Style professionnel et corporate',
    preview: '/templates/linkedin-pro.png',
    hasImage: false,
    style: {
      containerWidth: 520,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 28,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'system-ui, sans-serif'
    },
    header: {
      height: 56,
      backgroundColor: '#0a66c2',
      textColor: '#ffffff',
      fontSize: 18,
      fontWeight: 600,
      align: 'center'
    },
    questionStyle: {
      textAlign: 'left',
      fontSize: 22,
      fontWeight: 600,
      marginBottom: 24,
      color: '#000000'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: '16px 20px',
      margin: '12px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f3f6f8'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '4px',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      fontWeight: '600',
      backgroundColor: '#0a66c2',
      color: '#ffffff'
    }
  },

  // Duolingo - Ludique et éducatif
  {
    id: 'duolingo-fun',
    name: 'Duolingo Fun',
    description: 'Style ludique et éducatif',
    preview: '/templates/duolingo-fun.png',
    hasImage: true,
    style: {
      containerWidth: 440,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: 'DIN Round, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 24,
      color: '#3c3c3c'
    },
    imageStyle: {
      width: '80%',
      borderRadius: 12,
      border: 'none',
      marginBottom: 20
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '2px solid #e5e5e5',
      borderRadius: 16,
      padding: '16px 20px',
      margin: '12px 0',
      fontSize: 17,
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f7f7f7'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '50%',
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '700',
      backgroundColor: '#58cc02',
      color: '#ffffff'
    }
  },

  // Notion - Minimaliste et élégant
  {
    id: 'notion-minimal',
    name: 'Notion Minimal',
    description: 'Design épuré et fonctionnel',
    preview: '/templates/notion-minimal.png',
    hasImage: false,
    style: {
      containerWidth: 500,
      backgroundColor: '#ffffff',
      borderRadius: 3,
      padding: 32,
      boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px',
      fontFamily: 'ui-sans-serif, sans-serif'
    },
    questionStyle: {
      textAlign: 'left',
      fontSize: 24,
      fontWeight: 600,
      marginBottom: 24,
      color: '#37352f'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 3,
      padding: '12px 16px',
      margin: '6px 0',
      fontSize: 16,
      fontWeight: 400,
      cursor: 'pointer',
      transition: '0.1s ease',
      hoverBackground: 'rgba(55, 53, 47, 0.08)',
      background: 'transparent'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '3px',
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      fontWeight: '500',
      backgroundColor: 'rgba(55, 53, 47, 0.08)',
      color: '#37352f'
    }
  },

  // Stripe - Clean et moderne
  {
    id: 'stripe-clean',
    name: 'Stripe Clean',
    description: 'Design clean et moderne',
    preview: '/templates/stripe-clean.png',
    hasImage: false,
    style: {
      containerWidth: 500,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 32,
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      fontFamily: 'system-ui, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 26,
      fontWeight: 600,
      marginBottom: 28,
      color: '#0a2540'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #e3e8ee',
      borderRadius: 8,
      padding: '16px 20px',
      margin: '12px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f6f9fc'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '6px',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '600',
      backgroundColor: '#635bff',
      color: '#ffffff'
    }
  },

  // Slack - Coloré et fun
  {
    id: 'slack-colorful',
    name: 'Slack Colorful',
    description: 'Style coloré et dynamique',
    preview: '/templates/slack-colorful.png',
    hasImage: false,
    style: {
      containerWidth: 480,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 28,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      fontFamily: 'Lato, sans-serif'
    },
    questionStyle: {
      textAlign: 'left',
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 24,
      color: '#1d1c1d'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #e0e0e0',
      borderRadius: 6,
      padding: '14px 18px',
      margin: '10px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f8f8f8'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '6px',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      fontWeight: '600',
      backgroundColor: '#4a154b',
      color: '#ffffff'
    }
  },

  // Discord - Gaming style
  {
    id: 'discord-gaming',
    name: 'Discord Gaming',
    description: 'Style gaming et moderne',
    preview: '/templates/discord-gaming.png',
    hasImage: false,
    style: {
      containerWidth: 480,
      backgroundColor: '#36393f',
      borderRadius: 8,
      padding: 28,
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      fontFamily: 'Whitney, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 600,
      marginBottom: 24,
      color: '#ffffff'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 4,
      padding: '14px 18px',
      margin: '8px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#40444b',
      background: '#2f3136'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '50%',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      fontWeight: '700',
      backgroundColor: '#5865f2',
      color: '#ffffff'
    }
  },

  // TikTok - Dynamique
  {
    id: 'tiktok-dynamic',
    name: 'TikTok Dynamic',
    description: 'Style dynamique et jeune',
    preview: '/templates/tiktok-dynamic.png',
    hasImage: true,
    style: {
      containerWidth: 400,
      backgroundColor: '#000000',
      borderRadius: 0,
      padding: 24,
      boxShadow: '0 10px 40px rgba(254,44,85,0.3)',
      fontFamily: 'Proxima Nova, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 24,
      color: '#ffffff'
    },
    imageStyle: {
      width: '100%',
      borderRadius: 8,
      border: '2px solid #fe2c55',
      marginBottom: 20
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #fe2c55',
      borderRadius: 4,
      padding: '14px 18px',
      margin: '10px 0',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: 'rgba(254,44,85,0.1)',
      background: 'transparent'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '50%',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      fontWeight: '700',
      backgroundColor: '#fe2c55',
      color: '#ffffff'
    }
  },

  // Twitter/X - Moderne et épuré
  {
    id: 'twitter-modern',
    name: 'Twitter Modern',
    description: 'Style Twitter/X moderne',
    preview: '/templates/twitter-modern.png',
    hasImage: false,
    style: {
      containerWidth: 500,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 28,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: 'TwitterChirp, sans-serif'
    },
    questionStyle: {
      textAlign: 'left',
      fontSize: 23,
      fontWeight: 700,
      marginBottom: 24,
      color: '#0f1419'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #eff3f4',
      borderRadius: 9999,
      padding: '14px 20px',
      margin: '12px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f7f9f9'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '50%',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      fontWeight: '700',
      backgroundColor: '#1d9bf0',
      color: '#ffffff'
    }
  },

  // Amazon - Orange et professionnel
  {
    id: 'amazon-orange',
    name: 'Amazon Professional',
    description: 'Style e-commerce professionnel',
    preview: '/templates/amazon-orange.png',
    hasImage: true,
    style: {
      containerWidth: 520,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 24,
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      fontFamily: 'Amazon Ember, sans-serif'
    },
    questionStyle: {
      textAlign: 'left',
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 20,
      color: '#0f1111'
    },
    imageStyle: {
      width: '100%',
      borderRadius: 4,
      border: '1px solid #ddd',
      marginBottom: 20
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #d5d9d9',
      borderRadius: 8,
      padding: '12px 16px',
      margin: '10px 0',
      fontSize: 16,
      fontWeight: 400,
      cursor: 'pointer',
      transition: '0.15s ease',
      hoverBackground: '#f7f8f8'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '4px',
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      fontWeight: '700',
      backgroundColor: '#ff9900',
      color: '#000000'
    }
  },

  // Dropbox - Bleu et simple
  {
    id: 'dropbox-simple',
    name: 'Dropbox Simple',
    description: 'Design simple et efficace',
    preview: '/templates/dropbox-simple.png',
    hasImage: false,
    style: {
      containerWidth: 480,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 28,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      fontFamily: 'AtlasGrotesk, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 26,
      fontWeight: 600,
      marginBottom: 28,
      color: '#1e1919'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #c8c8c8',
      borderRadius: 6,
      padding: '16px 20px',
      margin: '12px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f7f5f2'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '6px',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '600',
      backgroundColor: '#0061ff',
      color: '#ffffff'
    }
  },

  // Pinterest - Créatif et visuel
  {
    id: 'pinterest-creative',
    name: 'Pinterest Creative',
    description: 'Style créatif et visuel',
    preview: '/templates/pinterest-creative.png',
    hasImage: true,
    hasGrid: true,
    style: {
      containerWidth: 480,
      backgroundColor: '#efefef',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: 'system-ui, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 20,
      color: '#333333',
      background: '#ffffff',
      borderRadius: '12px',
      padding: '16px'
    },
    gridStyle: {
      gap: '16px',
      columns: 2
    },
    imageStyle: {
      width: '100%',
      borderRadius: 16,
      border: 'none',
      marginBottom: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    optionStyle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      border: 'none',
      borderRadius: 16,
      padding: 0,
      margin: 0,
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      background: 'transparent'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '0',
      width: 0,
      height: 0,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 0,
      fontWeight: 'normal'
    }
  },

  // Twitch - Gaming violet
  {
    id: 'twitch-gaming',
    name: 'Twitch Gaming',
    description: 'Style streaming et gaming',
    preview: '/templates/twitch-gaming.png',
    hasImage: true,
    style: {
      containerWidth: 500,
      backgroundColor: '#18181b',
      borderRadius: 6,
      padding: 24,
      boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
      fontFamily: 'Roobert, Inter, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 600,
      marginBottom: 24,
      color: '#efeff1'
    },
    imageStyle: {
      width: '100%',
      borderRadius: 4,
      border: '2px solid #9147ff',
      marginBottom: 20
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 4,
      padding: '12px 16px',
      margin: '8px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#3a3a3d',
      background: '#26262c'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '4px',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      fontWeight: '700',
      backgroundColor: '#9147ff',
      color: '#ffffff'
    }
  },

  // Uber - Noir élégant
  {
    id: 'uber-elegant',
    name: 'Uber Elegant',
    description: 'Design noir et élégant',
    preview: '/templates/uber-elegant.png',
    hasImage: false,
    style: {
      containerWidth: 480,
      backgroundColor: '#000000',
      borderRadius: 8,
      padding: 32,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontFamily: 'UberMove, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 26,
      fontWeight: 600,
      marginBottom: 28,
      color: '#ffffff'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #333333',
      borderRadius: 8,
      padding: '16px 20px',
      margin: '12px 0',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#1a1a1a',
      background: '#000000'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '6px',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: '700',
      backgroundColor: '#ffffff',
      color: '#000000'
    }
  },

  // Templates existants (conservés)
  {
    id: 'classic',
    name: 'Classique',
    description: 'Template simple et épuré',
    preview: '/templates/classic-preview.png',
    hasImage: false,
    style: {
      containerWidth: 630,
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 16,
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      fontFamily: 'Inter, sans-serif'
    },
    header: {
      height: 52,
      backgroundColor: '#0b1014',
      textColor: '#ffffff',
      fontSize: 16,
      fontWeight: 700,
      align: 'center'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 500,
      marginBottom: 20,
      color: '#000000'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 30,
      padding: '16px 24px',
      margin: '16px 0',
      fontSize: 16,
      fontWeight: 400,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f5f5f5'
    },
    letterStyle: {
      border: '2px solid #0b1014',
      borderRadius: '50%',
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: 'bold',
      color: '#0b1014'
    }
  },
  {
    id: 'image-quiz',
    name: 'Quiz avec Image',
    description: 'Template avec support d\'image illustrative',
    preview: '/templates/image-quiz-preview.png',
    hasImage: true,
    style: {
      containerWidth: 450,
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 20,
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      fontFamily: 'Inter, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 20,
      color: '#000000'
    },
    imageStyle: {
      width: '100%',
      borderRadius: 12,
      border: '2px solid #cccccc',
      marginBottom: 25
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 30,
      padding: '15px 20px',
      margin: '12px 0',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f5f5f5'
    },
    letterStyle: {
      border: '2px solid #000000',
      borderRadius: '50%',
      width: 35,
      height: 35,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
      fontWeight: 'bold',
      color: '#000000'
    }
  },
  {
    id: 'minimal-card',
    name: 'Carte Minimaliste',
    description: 'Design épuré avec bordures subtiles',
    preview: '/templates/minimal-card-preview.png',
    hasImage: false,
    style: {
      containerWidth: 380,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      fontFamily: 'Inter, sans-serif'
    },
    questionStyle: {
      textAlign: 'left',
      fontSize: 19,
      fontWeight: 600,
      marginBottom: 20,
      color: '#1f2937'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 12,
      padding: '12px 16px',
      margin: '8px 0',
      fontSize: 15,
      fontWeight: 400,
      cursor: 'pointer',
      transition: '0.2s ease',
      hoverBackground: '#f9fafb'
    },
    letterStyle: {
      border: '1px solid #d1d5db',
      borderRadius: '50%',
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      fontWeight: '500',
      backgroundColor: '#f3f4f6',
      color: '#6b7280'
    }
  },
  {
    id: 'city-of-light',
    name: 'City of Light',
    description: 'Grille de 4 images avec légendes',
    preview: '/templates/city-of-light-preview.png',
    hasImage: true,
    hasGrid: true,
    style: {
      containerWidth: 560,
      backgroundColor: '#EEEBD8',
      borderRadius: 18,
      padding: 20,
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 800,
      marginBottom: 16,
      color: '#111',
      background: '#ffffff',
      border: '1.5px solid #8E8E8E',
      borderRadius: '18px',
      padding: '16px 18px'
    },
    panelStyle: {
      background: '#ffffff',
      border: '1.5px solid #8E8E8E',
      borderRadius: '22px',
      padding: '18px'
    },
    gridStyle: {
      gap: '16px',
      columns: 2
    },
    cardStyle: {
      background: 'transparent',
      border: 'none',
      padding: 0,
      cursor: 'pointer'
    },
    imageStyle: {
      border: '2px solid #6FA8DC',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 3px 0 rgba(0,0,0,0.2)',
      width: '100%',
      marginBottom: 0
    },
    captionStyle: {
      background: '#F0C96A',
      color: '#111',
      borderRadius: '10px',
      padding: '8px 10px',
      fontWeight: 800,
      textTransform: 'uppercase',
      textAlign: 'center',
      boxShadow: '0 3px 0 rgba(0,0,0,0.25)',
      marginTop: '8px',
      fontSize: '14px',
      letterSpacing: '0.2px'
    },
    optionStyle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      border: 'none',
      borderRadius: 14,
      padding: '0',
      margin: '0',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'transform 0.15s ease',
      overflow: 'hidden',
      background: 'transparent'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '0',
      width: 0,
      height: 0,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 0,
      fontWeight: 'normal'
    }
  },
  {
    id: 'this-or-that',
    name: 'This or That',
    description: 'Deux grandes zones avec "OU" au centre',
    preview: '/templates/this-or-that-preview.png',
    hasImage: true,
    style: {
      containerWidth: 420,
      backgroundColor: '#ffffff',
      borderRadius: 24,
      padding: 16,
      boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 500,
      marginBottom: 16,
      color: '#111827'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: 'none',
      borderRadius: 0,
      padding: 0,
      margin: 0,
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.2s ease',
      background: 'transparent'
    },
    letterStyle: {
      border: 'none',
      borderRadius: '0',
      width: 0,
      height: 0,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 0,
      fontWeight: 'normal'
    }
  }
];
