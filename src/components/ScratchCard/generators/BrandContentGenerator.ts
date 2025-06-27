
export interface BrandInfo {
  name: string;
  industry: string;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  style: 'modern' | 'classic' | 'playful' | 'elegant' | 'bold';
  targetAudience: string;
}

export interface GeneratedContent {
  winMessages: string[];
  loseMessages: string[];
  scratchSurfaceTexts: string[];
  brandConfig: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: string;
    shadow: string;
  };
}

export class BrandContentGenerator {
  private static instance: BrandContentGenerator;

  private constructor() {}

  public static getInstance(): BrandContentGenerator {
    if (!BrandContentGenerator.instance) {
      BrandContentGenerator.instance = new BrandContentGenerator();
    }
    return BrandContentGenerator.instance;
  }

  async generateContent(brandInfo: BrandInfo): Promise<GeneratedContent> {
    // Simulation de génération - sera remplacé par l'appel OpenAI
    return this.generateMockContent(brandInfo);
  }

  private generateMockContent(brandInfo: BrandInfo): GeneratedContent {
    const industryMessages = this.getIndustrySpecificMessages(brandInfo.industry);
    const styleConfig = this.getStyleConfig(brandInfo.style, brandInfo.colors);

    return {
      winMessages: [
        `Félicitations ! Vous avez gagné avec ${brandInfo.name} !`,
        `🎉 Bravo ! ${brandInfo.name} vous offre ce prix !`,
        `Victoire ! Réclamez votre gain ${brandInfo.name} !`,
        ...industryMessages.win
      ],
      loseMessages: [
        `Dommage ! Tentez votre chance à nouveau avec ${brandInfo.name}`,
        `Pas de chance cette fois... ${brandInfo.name} vous invite à réessayer !`,
        `Presque ! ${brandInfo.name} vous encourage à continuer`,
        ...industryMessages.lose
      ],
      scratchSurfaceTexts: [
        `Grattez avec ${brandInfo.name}`,
        'Découvrez votre prix !',
        'Bonne chance !',
        `${brandInfo.name} vous gâte`
      ],
      brandConfig: styleConfig
    };
  }

  private getIndustrySpecificMessages(industry: string) {
    const messages = {
      retail: {
        win: ['Bon d\'achat gagné !', 'Réduction exclusive !', 'Cadeau surprise !'],
        lose: ['Prochaines promos bientôt !', 'Restez connecté !']
      },
      food: {
        win: ['Menu gratuit !', 'Dessert offert !', 'Boisson gratuite !'],
        lose: ['À bientôt pour plus de saveurs !', 'La prochaine sera la bonne !']
      },
      beauty: {
        win: ['Soin gratuit !', 'Produit offert !', 'Séance beauté !'],
        lose: ['Votre beauté n\'attend pas !', 'Restez radieuse !']
      },
      tech: {
        win: ['Accessoire gratuit !', 'Réduction high-tech !', 'Gadget offert !'],
        lose: ['L\'innovation continue !', 'Restez connecté !']
      },
      default: {
        win: ['Prix spécial !', 'Cadeau exclusif !', 'Surprise !'],
        lose: ['Tentez encore !', 'La chance tourne !']
      }
    };

    return messages[industry as keyof typeof messages] || messages.default;
  }

  private getStyleConfig(style: string, colors: BrandInfo['colors']) {
    const baseConfig = {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent || colors.primary,
      backgroundColor: '#ffffff',
      textColor: '#333333'
    };

    const styleConfigs = {
      modern: {
        ...baseConfig,
        fontFamily: 'Inter, -apple-system, sans-serif',
        borderRadius: '16px',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      },
      classic: {
        ...baseConfig,
        fontFamily: 'Georgia, serif',
        borderRadius: '8px',
        shadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
      },
      playful: {
        ...baseConfig,
        fontFamily: 'Comic Sans MS, cursive',
        borderRadius: '20px',
        shadow: '0 12px 24px rgba(255, 107, 107, 0.3)'
      },
      elegant: {
        ...baseConfig,
        fontFamily: 'Playfair Display, serif',
        borderRadius: '12px',
        shadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
      },
      bold: {
        ...baseConfig,
        fontFamily: 'Montserrat, sans-serif',
        borderRadius: '4px',
        shadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
      }
    };

    return styleConfigs[style as keyof typeof styleConfigs] || styleConfigs.modern;
  }

  // Méthode pour intégration future avec OpenAI
  async generateWithAI(brandInfo: BrandInfo): Promise<GeneratedContent> {
    // TODO: Intégrer l'appel à l'API OpenAI
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: prompt }]
    // });

    // Pour l'instant, on retourne le contenu mock
    return this.generateMockContent(brandInfo);
  }
}
