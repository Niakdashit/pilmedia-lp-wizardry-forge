export interface CampaignTemplate {
  id: string;
  name: string;
  style: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      titleFont: string;
      textFont: string;
      titleSize: string;
      subtitleSize: string;
      titleWeight: string;
      letterSpacing: string;
    };
    effects: {
      shadows: boolean;
      gradients: boolean;
      animations: boolean;
      borders: boolean;
      titleBackground?: string;
      titleStyle?: 'normal' | 'italic' | 'underline' | 'gradient' | 'stroke';
      titleStroke?: string;
      titleGradient?: string;
    };
    layout: {
      titlePosition: { x: number; y: number };
      subtitlePosition: { x: number; y: number };
      mechanicsPosition: { x: number; y: number };
      benefitPosition: { x: number; y: number };
      ctaPosition: { x: number; y: number };
      wheelPosition: { x: number; y: number };
    };
  };
  description: string;
  industries: string[];
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'natural',
    name: 'Naturel & Organique',
    description: 'Design épuré avec couleurs naturelles et typographie scripte',
    industries: ['bio', 'santé', 'beauté', 'wellness', 'nature'],
    style: {
      colors: {
        primary: '#5d7c47',
        secondary: '#a8c68f',
        accent: '#f4e4c1',
        background: '#fefefe',
        text: '#2d3e2f'
      },
      typography: {
        titleFont: 'Playfair Display',
        textFont: 'Inter',
        titleSize: '38px',
        subtitleSize: '20px',
        titleWeight: '700',
        letterSpacing: '0.02em'
      },
      effects: {
        shadows: true,
        gradients: false,
        animations: true,
        borders: true,
        titleStyle: 'italic',
        titleBackground: 'rgba(93, 124, 71, 0.15)'
      },
      layout: {
        titlePosition: { x: 0.5, y: 0.15 },
        subtitlePosition: { x: 0.5, y: 0.25 },
        mechanicsPosition: { x: 0.5, y: 0.4 },
        benefitPosition: { x: 0.5, y: 0.55 },
        ctaPosition: { x: 0.5, y: 0.75 },
        wheelPosition: { x: 0.5, y: 0.6 }
      }
    }
  },
  {
    id: 'sporty',
    name: 'Sportif & Dynamique',
    description: 'Design énergique avec couleurs vibrantes et effets de mouvement',
    industries: ['sport', 'fitness', 'outdoor', 'énergie', 'jeunesse'],
    style: {
      colors: {
        primary: '#ff6b35',
        secondary: '#004e89',
        accent: '#ffd23f',
        background: '#1a1a2e',
        text: '#ffffff'
      },
      typography: {
        titleFont: 'Montserrat',
        textFont: 'Open Sans',
        titleSize: '42px',
        subtitleSize: '22px',
        titleWeight: '800',
        letterSpacing: '0.05em'
      },
      effects: {
        shadows: true,
        gradients: true,
        animations: true,
        borders: true,
        titleStyle: 'stroke',
        titleStroke: '#000000',
        titleBackground: 'linear-gradient(45deg, #ff6b35, #ffd23f)'
      },
      layout: {
        titlePosition: { x: 0.5, y: 0.2 },
        subtitlePosition: { x: 0.5, y: 0.3 },
        mechanicsPosition: { x: 0.5, y: 0.45 },
        benefitPosition: { x: 0.5, y: 0.6 },
        ctaPosition: { x: 0.5, y: 0.8 },
        wheelPosition: { x: 0.5, y: 0.65 }
      }
    }
  },
  {
    id: 'travel',
    name: 'Voyage & Luxe',
    description: 'Design premium avec couleurs vives et éléments sophistiqués',
    industries: ['voyage', 'luxe', 'hôtellerie', 'immobilier', 'premium'],
    style: {
      colors: {
        primary: '#d4af37',
        secondary: '#1a4c7a',
        accent: '#ff6b9d',
        background: '#f8f9fa',
        text: '#2c3e50'
      },
      typography: {
        titleFont: 'Cormorant Garamond',
        textFont: 'Lato',
        titleSize: '44px',
        subtitleSize: '24px',
        titleWeight: '600',
        letterSpacing: '0.03em'
      },
      effects: {
        shadows: true,
        gradients: true,
        animations: true,
        borders: true,
        titleStyle: 'gradient',
        titleBackground: 'rgba(26, 76, 122, 0.9)',
        titleGradient: 'linear-gradient(45deg, #d4af37, #ff6b9d)'
      },
      layout: {
        titlePosition: { x: 0.5, y: 0.18 },
        subtitlePosition: { x: 0.5, y: 0.28 },
        mechanicsPosition: { x: 0.5, y: 0.42 },
        benefitPosition: { x: 0.5, y: 0.58 },
        ctaPosition: { x: 0.5, y: 0.78 },
        wheelPosition: { x: 0.5, y: 0.62 }
      }
    }
  },
  {
    id: 'modern',
    name: 'Moderne & Minimaliste',
    description: 'Design épuré avec formes géométriques et couleurs pastel',
    industries: ['tech', 'digital', 'finance', 'consulting', 'moderne'],
    style: {
      colors: {
        primary: '#6c5ce7',
        secondary: '#a29bfe',
        accent: '#fd79a8',
        background: '#f8f9fc',
        text: '#2d3436'
      },
      typography: {
        titleFont: 'Poppins',
        textFont: 'Inter',
        titleSize: '36px',
        subtitleSize: '18px',
        titleWeight: '600',
        letterSpacing: '0.01em'
      },
      effects: {
        shadows: true,
        gradients: true,
        animations: true,
        borders: false,
        titleStyle: 'normal',
        titleBackground: 'rgba(108, 92, 231, 0.1)'
      },
      layout: {
        titlePosition: { x: 0.5, y: 0.22 },
        subtitlePosition: { x: 0.5, y: 0.32 },
        mechanicsPosition: { x: 0.5, y: 0.46 },
        benefitPosition: { x: 0.5, y: 0.6 },
        ctaPosition: { x: 0.5, y: 0.82 },
        wheelPosition: { x: 0.5, y: 0.66 }
      }
    }
  }
];

export const getTemplateByIndustry = (industry: string): CampaignTemplate => {
  const template = CAMPAIGN_TEMPLATES.find(t => 
    t.industries.some(ind => industry.toLowerCase().includes(ind))
  );
  return template || CAMPAIGN_TEMPLATES[0]; // Default to natural
};

export const getTemplateByIndex = (index: number): CampaignTemplate => {
  return CAMPAIGN_TEMPLATES[index % CAMPAIGN_TEMPLATES.length];
};

export const getRandomTemplate = (): CampaignTemplate => {
  return CAMPAIGN_TEMPLATES[Math.floor(Math.random() * CAMPAIGN_TEMPLATES.length)];
};