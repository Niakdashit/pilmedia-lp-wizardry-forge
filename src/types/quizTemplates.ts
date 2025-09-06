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
  {
    id: 'classic',
    name: 'Classique',
    description: 'Template simple et épuré',
    preview: '/templates/classic-preview.png',
    hasImage: false,
    style: {
      containerWidth: 420,
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
    hasGrid: true, // Nouvelle propriété pour indiquer l'utilisation d'une grille
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
  }
];
