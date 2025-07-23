
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
    subtitle?: string;
    description: string;
    buttonText: string;
    callToAction?: string;
    legalText?: string;
    successMessage: string;
    editableTexts?: Array<{
      id: string;
      text: string;
      type: 'title' | 'subtitle' | 'description' | 'legal' | 'cta';
      position: { x: number; y: number };
      style: {
        fontSize: string;
        fontWeight: string;
        color: string;
        textAlign: string;
        textShadow?: string;
      };
      editable: boolean;
    }>;
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
    
    IMPORTANT: Le concept doit inclure des textes éditables structurés pour l'interface.
    
    Structure requise pour "content":
    {
      "title": "Titre principal accrocheur (ex: 'Gagnez vos vacances de rêve !')", 
      "subtitle": "Sous-titre engageant (ex: 'Participez pour tenter de remporter un séjour inoubliable avec ${brandData.brandName}.')",
      "description": "Description du prix ou de l'offre (ex: 'Séjour tout compris dans l'une de nos magnifiques destinations.')",
      "callToAction": "Texte du bouton d'action (ex: 'Participez maintenant !')",
      "legalText": "Mentions légales (ex: '* Voir conditions d'utilisation - Jeu gratuit sans obligation d'achat')",
      "editableTexts": [
        {
          "id": "main-title",
          "text": "Titre principal visible sur l'image de fond",
          "type": "title",
          "position": { "x": 50, "y": 100 },
          "style": {
            "fontSize": "48px",
            "fontWeight": "bold", 
            "color": "#ffffff",
            "textAlign": "center",
            "textShadow": "2px 2px 4px rgba(0,0,0,0.8)"
          },
          "editable": true
        },
        {
          "id": "subtitle", 
          "text": "Sous-titre descriptif",
          "type": "subtitle",
          "position": { "x": 50, "y": 200 },
          "style": {
            "fontSize": "24px",
            "fontWeight": "medium",
            "color": "#ffffff", 
            "textAlign": "center",
            "textShadow": "1px 1px 3px rgba(0,0,0,0.7)"
          },
          "editable": true
        },
        {
          "id": "description",
          "text": "Description du prix ou offre", 
          "type": "description",
          "position": { "x": 50, "y": 650 },
          "style": {
            "fontSize": "18px",
            "fontWeight": "normal",
            "color": "#ffffff",
            "textAlign": "center", 
            "textShadow": "1px 1px 2px rgba(0,0,0,0.7)"
          },
          "editable": true
        },
        {
          "id": "legal",
          "text": "Mentions légales en bas",
          "type": "legal", 
          "position": { "x": 50, "y": 750 },
          "style": {
            "fontSize": "12px",
            "fontWeight": "normal",
            "color": "#ffffff",
            "textAlign": "center",
            "textShadow": "1px 1px 2px rgba(0,0,0,0.8)"
          },
          "editable": true
        }
      ]
    }
    
    Créer un concept de jeu qui rivalise avec les meilleures agences créatives.
    Le concept doit être premium, engageant et parfaitement aligné sur l'identité de marque.
    ASSURE-TOI que tous les textes générés soient visibles, contrastés et éditables.
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
