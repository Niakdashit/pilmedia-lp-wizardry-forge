export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  hasImage: boolean;
  style: {
    containerWidth: number;
    backgroundColor: string;
    borderRadius: number;
    padding: number;
    boxShadow: string;
    fontFamily: string;
  };
  questionStyle: {
    textAlign: 'left' | 'center' | 'right';
    fontSize: number;
    fontWeight: number;
    marginBottom: number;
    color: string;
  };
  imageStyle?: {
    width: string;
    borderRadius: number;
    border: string;
    marginBottom: number;
  };
  optionStyle: {
    display: string;
    alignItems: string;
    border: string;
    borderRadius: number;
    padding: string;
    margin: string;
    fontSize: number;
    fontWeight: number;
    cursor: string;
    transition: string;
    hoverBackground: string;
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
    questionStyle: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 500,
      marginBottom: 20,
      color: '#ffffff'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '2px solid #000000',
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
      border: '2px solid #9C7A5B',
      borderRadius: '50%',
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: 'bold',
      color: '#9C7A5B'
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
      border: '2px solid #000000',
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
    id: 'modern-gradient',
    name: 'Moderne Dégradé',
    description: 'Design moderne avec dégradé coloré',
    preview: '/templates/modern-gradient-preview.png',
    hasImage: false,
    style: {
      containerWidth: 400,
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 24,
      padding: 24,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      fontFamily: 'Inter, sans-serif'
    },
    questionStyle: {
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 600,
      marginBottom: 24,
      color: '#ffffff'
    },
    optionStyle: {
      display: 'flex',
      alignItems: 'center',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: 20,
      padding: '14px 20px',
      margin: '10px 0',
      fontSize: 15,
      fontWeight: 500,
      cursor: 'pointer',
      transition: '0.3s ease',
      hoverBackground: 'rgba(255,255,255,0.1)'
    },
    letterStyle: {
      border: '2px solid #ffffff',
      borderRadius: '50%',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      fontWeight: 'bold',
      backgroundColor: '#ffffff',
      color: '#667eea'
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
      border: '1px solid #e5e7eb',
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
  }
];
