
import { BrandData } from './scrapingBeeService';

export interface GeneratedGameConcept {
  gameType: 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'dice' | 'memory' | 'puzzle';
  gameName: string;
  theme: string;
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
    segments?: Array<{ label: string; color: string; probability?: number }>;
    questions?: Array<{ question: string; options: string[]; correctAnswer: number }>;
    prizes: string[];
    rules: string;
  };
  design: {
    fontFamily: string;
    borderRadius: string;
    shadows: boolean;
    animations: boolean;
  };
  tone: 'professional' | 'playful' | 'luxury' | 'energetic' | 'casual';
}

export class OpenAIGameGeneratorService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateGameConcept(brandData: BrandData): Promise<GeneratedGameConcept> {
    try {
      const prompt = this.buildPrompt(brandData);
      
      const response = await fetch(this.baseUrl, {
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
              content: 'You are a marketing game designer. Generate complete game concepts that match brand identity perfectly. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return JSON.parse(content) as GeneratedGameConcept;
    } catch (error) {
      console.error('OpenAI generation failed:', error);
      throw error;
    }
  }

  private buildPrompt(brandData: BrandData): string {
    return `
Analyze this brand data and generate a complete marketing game concept:

BRAND DATA:
- URL: ${brandData.url}
- Title: ${brandData.title}
- Description: ${brandData.description}
- Primary Color: ${brandData.colors.primary}
- Secondary Color: ${brandData.colors.secondary}
- Font: ${brandData.fonts.primary}
- Key Content: ${brandData.content.headings.join(', ')}
- CTA Examples: ${brandData.content.ctaTexts.join(', ')}

REQUIREMENTS:
1. Choose the BEST game type for this brand (wheel, quiz, scratch, jackpot, dice, memory, puzzle)
2. Create prizes relevant to the brand's industry
3. Match the visual style and tone perfectly
4. Generate engaging copy that sounds like the brand

RESPOND WITH VALID JSON ONLY:
{
  "gameType": "wheel|quiz|scratch|jackpot|dice|memory|puzzle",
  "gameName": "Brand-specific game name",
  "theme": "Brief theme description",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex", 
    "accent": "#hex",
    "background": "#hex"
  },
  "content": {
    "title": "Engaging title",
    "description": "Campaign description", 
    "buttonText": "CTA text",
    "successMessage": "Win message"
  },
  "gameConfig": {
    "segments": [{"label": "Prize name", "color": "#hex", "probability": 1}] // for wheel
    "questions": [{"question": "Q", "options": ["A","B","C","D"], "correctAnswer": 0}], // for quiz
    "prizes": ["Prize 1", "Prize 2", "Prize 3"],
    "rules": "Game rules explanation"
  },
  "design": {
    "fontFamily": "Font name",
    "borderRadius": "0.5rem",
    "shadows": true|false,
    "animations": true|false  
  },
  "tone": "professional|playful|luxury|energetic|casual"
}
`;
  }
}
