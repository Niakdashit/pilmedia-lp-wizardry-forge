
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
  };
  tone: string;
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
}

export class OpenAIGameGeneratorService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateGameFromBrand(brandData: BrandAnalysisResult): Promise<GeneratedGameConcept> {
    const prompt = `
    Generate a complete marketing game concept based on this brand analysis:
    
    Brand: ${brandData.brandName}
    Industry: ${brandData.industry}
    Description: ${brandData.description}
    Colors: ${JSON.stringify(brandData.colors)}
    Logo: ${brandData.logo ? 'Available' : 'Not available'}
    Suggested Game Type: ${brandData.suggestedGameType}
    Suggested Prizes: ${brandData.suggestedPrizes.join(', ')}
    
    Create a game concept that matches the brand identity perfectly.
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
            content: 'You are a marketing game designer. Create engaging game concepts that match brand identities.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}
