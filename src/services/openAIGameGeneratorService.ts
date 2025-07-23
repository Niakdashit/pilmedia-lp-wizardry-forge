
export interface GeneratedGameConcept {
  gameType: 'wheel' | 'quiz' | 'scratch' | 'jackpot';
  gameName: string;
  theme: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  content: {
    title: string;
    description: string;
    buttonText: string;
    successMessage: string;
  };
  gameConfig: {
    segments?: Array<{
      label: string;
      color: string;
      probability: number;
    }>;
    questions?: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
    prizes: string[];
    rules: string;
  };
  design: {
    fontFamily: string;
    borderRadius: string;
    shadows: boolean;
    animations: boolean;
    premiumEffects?: {
      gradient?: boolean;
      glassmorphism?: boolean;
      microInteractions?: boolean;
    };
  };
  tone: string;
  marketingStrategy?: {
    engagementTactics: string[];
    socialProof: boolean;
    gamificationLevel: string;
  };
}

export interface BrandAnalysisResult {
  url: string;
  brandName: string;
  industry: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo?: string;
  description: string;
  suggestedGameType: 'wheel' | 'quiz' | 'scratch' | 'jackpot';
  suggestedPrizes: string[];
  brandAnalysis: {
    personality: string;
    targetAudience: string;
    marketingTone: string;
    visualStyle: string;
  };
}

export class OpenAIGameGeneratorService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateStudioLevelGameFromBrand(brandData: BrandAnalysisResult): Promise<GeneratedGameConcept> {
    const prompt = `
    Créer un concept de jeu marketing de niveau studio basé sur cette analyse de marque:
    
    Marque: ${brandData.brandName}
    Industrie: ${brandData.industry}
    Description: ${brandData.description}
    Couleurs: ${JSON.stringify(brandData.colors)}
    Logo: ${brandData.logo ? 'Disponible' : 'Non disponible'}
    Type de jeu suggéré: ${brandData.suggestedGameType}
    Prix suggérés: ${brandData.suggestedPrizes.join(', ')}
    
    Analyse de marque:
    - Personnalité: ${brandData.brandAnalysis.personality}
    - Audience cible: ${brandData.brandAnalysis.targetAudience}
    - Ton marketing: ${brandData.brandAnalysis.marketingTone}
    - Style visuel: ${brandData.brandAnalysis.visualStyle}
    
    Créer un concept de jeu qui rivalise avec les meilleures agences créatives.
    Le concept doit être premium, engageant et parfaitement aligné sur l'identité de marque.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un directeur artistique expert en campagnes marketing premium. Tu crées des concepts de jeu sophistiqués de niveau studio qui rivalisent avec les meilleures agences créatives.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}
