/**
 * Configuration des templates de formulaires inspirés de marques reconnues
 * Chaque template a sa propre identité visuelle : 3 couleurs + 1 police
 */

export interface FormTemplate {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: 'feedback' | 'contact' | 'survey' | 'registration' | 'lead' | 'quiz' | 'order';
  
  // Design system
  colors: {
    primary: string;    // Couleur principale (fond, accents)
    secondary: string;  // Couleur secondaire (texte sur fond clair)
    accent: string;     // Couleur d'accentuation (boutons, bordures)
  };
  font: string;         // Une seule police pour tout
  
  // Contenu
  logo?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  questionCount: number;
}

export const formTemplates: FormTemplate[] = [
  // STYLE MINIMALISTE PREMIUM
  {
    id: 'minimal-luxury-1',
    name: 'Premium Experience Survey',
    brand: 'Luxury Minimal',
    description: 'Elegant survey for luxury brands',
    category: 'feedback',
    colors: {
      primary: '#F5F5F0',
      secondary: '#1A1A1A',
      accent: '#B8860B'
    },
    font: 'Cormorant Garamond',
    title: 'Share Your Experience',
    subtitle: 'Your feedback shapes our excellence',
    ctaText: 'Begin',
    questionCount: 7
  },
  
  // STYLE TECH MODERNE
  {
    id: 'tech-modern-1',
    name: 'Product Feedback',
    brand: 'TechFlow',
    description: 'Modern tech product feedback',
    category: 'feedback',
    colors: {
      primary: '#0A0E27',
      secondary: '#FFFFFF',
      accent: '#00D4FF'
    },
    font: 'Inter',
    title: 'Help us improve',
    subtitle: 'Your input drives innovation',
    ctaText: 'Start Survey',
    questionCount: 8
  },

  // STYLE NATUREL ORGANIQUE
  {
    id: 'organic-natural-1',
    name: 'Wellness Survey',
    brand: 'PureNature',
    description: 'Organic wellness brand survey',
    category: 'survey',
    colors: {
      primary: '#E8F4EA',
      secondary: '#2C5530',
      accent: '#7FB069'
    },
    font: 'Lora',
    title: 'Your Wellness Journey',
    subtitle: 'Together towards better health',
    ctaText: 'Start',
    questionCount: 6
  },

  // STYLE ARTISTIQUE CRÉATIF
  {
    id: 'creative-artistic-1',
    name: 'Creative Brief',
    brand: 'Artisan Studio',
    description: 'Creative agency project brief',
    category: 'lead',
    colors: {
      primary: '#FFF8E7',
      secondary: '#2D2D2D',
      accent: '#FF6B35'
    },
    font: 'Playfair Display',
    title: 'Let\'s Create Together',
    subtitle: 'Share your vision with us',
    ctaText: 'Begin Project',
    questionCount: 9
  },

  // STYLE CORPORATE PROFESSIONNEL
  {
    id: 'corporate-pro-1',
    name: 'Business Contact',
    brand: 'Enterprise Solutions',
    description: 'Professional B2B contact form',
    category: 'contact',
    colors: {
      primary: '#F8F9FA',
      secondary: '#1E3A5F',
      accent: '#0066CC'
    },
    font: 'Roboto',
    title: 'Get in Touch',
    subtitle: 'Our team will respond within 24 hours',
    ctaText: 'Contact Us',
    questionCount: 5
  },

  // STYLE FITNESS DYNAMIQUE
  {
    id: 'fitness-dynamic-1',
    name: 'Fitness Assessment',
    brand: 'PowerFit',
    description: 'Dynamic fitness evaluation',
    category: 'survey',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#FF0000'
    },
    font: 'Montserrat',
    title: 'Your Fitness Profile',
    subtitle: 'Unlock your potential',
    ctaText: 'Start Assessment',
    questionCount: 10
  },

  // STYLE COSMÉTIQUE ÉLÉGANT
  {
    id: 'beauty-elegant-1',
    name: 'Skin Quiz',
    brand: 'Beauté Pure',
    description: 'Elegant beauty product finder',
    category: 'quiz',
    colors: {
      primary: '#FFF5F7',
      secondary: '#4A4A4A',
      accent: '#D4A5A5'
    },
    font: 'Crimson Text',
    title: 'Find Your Perfect Match',
    subtitle: 'Personalized skincare just for you',
    ctaText: 'Discover',
    questionCount: 8
  },

  // STYLE RESTAURANT GASTRONOMIQUE
  {
    id: 'restaurant-gastro-1',
    name: 'Table Reservation',
    brand: 'Le Gourmet',
    description: 'Fine dining reservation',
    category: 'registration',
    colors: {
      primary: '#1C1C1C',
      secondary: '#F8F8F8',
      accent: '#C9A961'
    },
    font: 'Libre Baskerville',
    title: 'Reserve Your Table',
    subtitle: 'An unforgettable culinary experience',
    ctaText: 'Book Now',
    questionCount: 6
  },

  // STYLE IMMOBILIER MODERNE
  {
    id: 'realestate-modern-1',
    name: 'Property Interest',
    brand: 'Urban Spaces',
    description: 'Modern real estate lead form',
    category: 'lead',
    colors: {
      primary: '#FAFAFA',
      secondary: '#2C3E50',
      accent: '#3498DB'
    },
    font: 'Raleway',
    title: 'Find Your Dream Home',
    subtitle: 'Let us help you discover the perfect property',
    ctaText: 'Get Started',
    questionCount: 7
  },

  // STYLE VOYAGE AVENTURE
  {
    id: 'travel-adventure-1',
    name: 'Travel Plans',
    brand: 'Wanderlust',
    description: 'Adventure travel planning',
    category: 'lead',
    colors: {
      primary: '#E8F3F1',
      secondary: '#1A5653',
      accent: '#FF9A56'
    },
    font: 'Nunito',
    title: 'Plan Your Adventure',
    subtitle: 'Where will your journey take you?',
    ctaText: 'Explore',
    questionCount: 9
  },

  // STYLE MODE FASHION
  {
    id: 'fashion-chic-1',
    name: 'Style Quiz',
    brand: 'Élégance',
    description: 'Fashion style quiz',
    category: 'quiz',
    colors: {
      primary: '#FAF9F6',
      secondary: '#000000',
      accent: '#C41E3A'
    },
    font: 'Bodoni Moda',
    title: 'Discover Your Style',
    subtitle: 'Curated fashion for your unique personality',
    ctaText: 'Start Quiz',
    questionCount: 10
  },

  // STYLE ÉDUCATION ACADÉMIQUE
  {
    id: 'education-academic-1',
    name: 'Course Registration',
    brand: 'Academy Pro',
    description: 'Professional course registration',
    category: 'registration',
    colors: {
      primary: '#F0F4F8',
      secondary: '#1A365D',
      accent: '#4299E1'
    },
    font: 'Source Sans Pro',
    title: 'Register for Course',
    subtitle: 'Advance your career with expert-led training',
    ctaText: 'Enroll Now',
    questionCount: 7
  },

  // STYLE CAFÉ ARTISANAL
  {
    id: 'coffee-artisan-1',
    name: 'Coffee Preferences',
    brand: 'Artisan Brew',
    description: 'Coffee subscription preferences',
    category: 'survey',
    colors: {
      primary: '#F4E8D8',
      secondary: '#3E2723',
      accent: '#8D6E63'
    },
    font: 'Merriweather',
    title: 'Your Coffee Profile',
    subtitle: 'Craft the perfect blend for your taste',
    ctaText: 'Start Brewing',
    questionCount: 6
  },

  // STYLE AUTOMOBILE LUXE
  {
    id: 'auto-luxury-1',
    name: 'Test Drive Request',
    brand: 'Prestige Auto',
    description: 'Luxury car test drive',
    category: 'lead',
    colors: {
      primary: '#E5E5E5',
      secondary: '#1A1A1A',
      accent: '#C0C0C0'
    },
    font: 'Cinzel',
    title: 'Experience Excellence',
    subtitle: 'Schedule your exclusive test drive',
    ctaText: 'Book Test Drive',
    questionCount: 5
  },

  // STYLE TECH STARTUP
  {
    id: 'startup-tech-1',
    name: 'Beta Access',
    brand: 'InnovateLab',
    description: 'Beta program signup',
    category: 'registration',
    colors: {
      primary: '#F7F7FF',
      secondary: '#1F1F1F',
      accent: '#6366F1'
    },
    font: 'Space Grotesk',
    title: 'Join the Beta',
    subtitle: 'Be among the first to experience the future',
    ctaText: 'Sign Up',
    questionCount: 6
  },

  // STYLE SANTÉ WELLNESS
  {
    id: 'health-wellness-1',
    name: 'Health Assessment',
    brand: 'VitalCare',
    description: 'Comprehensive health check',
    category: 'survey',
    colors: {
      primary: '#F0F9FF',
      secondary: '#0C4A6E',
      accent: '#38BDF8'
    },
    font: 'Open Sans',
    title: 'Your Health Matters',
    subtitle: 'Complete wellness evaluation',
    ctaText: 'Begin Assessment',
    questionCount: 12
  },

  // STYLE BIJOUTERIE LUXE
  {
    id: 'jewelry-luxury-1',
    name: 'Custom Design',
    brand: 'Lumière Joaillerie',
    description: 'Bespoke jewelry consultation',
    category: 'lead',
    colors: {
      primary: '#FFF9F5',
      secondary: '#2D2926',
      accent: '#D4AF37'
    },
    font: 'Cormorant',
    title: 'Create Your Masterpiece',
    subtitle: 'Timeless elegance, crafted for you',
    ctaText: 'Start Design',
    questionCount: 8
  },

  // STYLE ARCHITECTURE MODERNE
  {
    id: 'architecture-modern-1',
    name: 'Project Inquiry',
    brand: 'Modern Space',
    description: 'Architectural project consultation',
    category: 'contact',
    colors: {
      primary: '#FEFEFE',
      secondary: '#1C1C1C',
      accent: '#4A4A4A'
    },
    font: 'Work Sans',
    title: 'Design Your Space',
    subtitle: 'Where form meets function',
    ctaText: 'Get Started',
    questionCount: 9
  },

  // STYLE VIN & GASTRONOMIE
  {
    id: 'wine-gastro-1',
    name: 'Wine Club',
    brand: 'Château Élégance',
    description: 'Wine club membership',
    category: 'registration',
    colors: {
      primary: '#FAF7F2',
      secondary: '#3B1F2B',
      accent: '#8B4367'
    },
    font: 'EB Garamond',
    title: 'Join Our Circle',
    subtitle: 'Exceptional wines, curated for connoisseurs',
    ctaText: 'Become Member',
    questionCount: 7
  },

  // STYLE PHOTOGRAPHIE ART
  {
    id: 'photography-art-1',
    name: 'Photoshoot Booking',
    brand: 'Lens & Light',
    description: 'Professional photo session',
    category: 'registration',
    colors: {
      primary: '#FFFBF5',
      secondary: '#2C2C2C',
      accent: '#E8A87C'
    },
    font: 'Josefin Sans',
    title: 'Capture the Moment',
    subtitle: 'Professional photography for life\'s special occasions',
    ctaText: 'Book Session',
    questionCount: 8
  }
];

/**
 * Générateur de templates additionnels basés sur des variations
 */
export function generateAdditionalTemplates(count: number = 50): FormTemplate[] {
  const baseTemplates = formTemplates;
  const additionalTemplates: FormTemplate[] = [];
  
  const colorVariations = [
    { primary: '#E8E2D8', secondary: '#3D3D3D', accent: '#A67C52' },
    { primary: '#F5F5DC', secondary: '#2F4F4F', accent: '#DAA520' },
    { primary: '#FFF8DC', secondary: '#4B0082', accent: '#9370DB' },
    { primary: '#F0EAD6', secondary: '#556B2F', accent: '#9ACD32' },
    { primary: '#FAF0E6', secondary: '#8B4513', accent: '#CD853F' },
    { primary: '#FFF5EE', secondary: '#483D8B', accent: '#6A5ACD' },
    { primary: '#F8F8FF', secondary: '#2F4F4F', accent: '#5F9EA0' },
    { primary: '#FDF5E6', secondary: '#8B0000', accent: '#DC143C' },
  ];
  
  const fontVariations = [
    'Spectral', 'Bitter', 'Cardo', 'Alegreya', 'Neuton',
    'Archivo', 'Karla', 'Rubik', 'Barlow', 'DM Sans'
  ];
  
  for (let i = 0; i < count; i++) {
    const base = baseTemplates[i % baseTemplates.length];
    const colorVar = colorVariations[i % colorVariations.length];
    const fontVar = fontVariations[i % fontVariations.length];
    
    additionalTemplates.push({
      ...base,
      id: `${base.id}-var-${i}`,
      name: `${base.name} ${String.fromCharCode(65 + (i % 26))}`,
      brand: `${base.brand} Edition`,
      colors: colorVar,
      font: fontVar
    });
  }
  
  return additionalTemplates;
}

/**
 * Obtenir tous les templates (base + générés)
 */
export function getAllFormTemplates(): FormTemplate[] {
  return [...formTemplates, ...generateAdditionalTemplates(80)];
}

/**
 * Filtrer par catégorie
 */
export function getTemplatesByCategory(category: FormTemplate['category']): FormTemplate[] {
  return getAllFormTemplates().filter(t => t.category === category);
}
