
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandGameRequest {
  url: string;
}

interface BrandData {
  url: string;
  title: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  content: {
    headings: string[];
    descriptions: string[];
    ctaTexts: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: BrandGameRequest = await req.json();
    console.log('Processing brand URL:', url);

    // Step 1: Extract brand data using ScrapingBee
    const brandData = await extractBrandData(url);
    console.log('Brand data extracted:', brandData);

    // Step 2: Generate game concept using OpenAI
    const gameConcept = await generateGameConcept(brandData);
    console.log('Game concept generated:', gameConcept);

    return new Response(JSON.stringify(gameConcept), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in brand-game-generator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function extractBrandData(url: string): Promise<BrandData> {
  const scrapingBeeApiKey = Deno.env.get('SCRAPINGBEE_API_KEY');
  
  if (!scrapingBeeApiKey) {
    throw new Error('ScrapingBee API key not configured');
  }

  const response = await fetch('https://app.scrapingbee.com/api/v1/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: scrapingBeeApiKey,
      url: url,
      render_js: true,
      premium_proxy: true,
      country_code: 'US'
    })
  });

  if (!response.ok) {
    throw new Error(`ScrapingBee API error: ${response.status}`);
  }

  const html = await response.text();
  return parseBrandData(url, html);
}

function parseBrandData(url: string, html: string): BrandData {
  // Simple HTML parsing - in production, you'd use a proper HTML parser
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descriptionMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
  
  // Extract headings
  const headingMatches = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
  const headings = headingMatches.map(match => {
    const content = match.replace(/<[^>]*>/g, '').trim();
    return content;
  }).filter(Boolean).slice(0, 5);

  // Extract button/CTA texts
  const buttonMatches = html.match(/<button[^>]*>([^<]+)<\/button>|<a[^>]*class[^>]*button[^>]*>([^<]+)<\/a>/gi) || [];
  const ctaTexts = buttonMatches.map(match => {
    const content = match.replace(/<[^>]*>/g, '').trim();
    return content;
  }).filter(Boolean).slice(0, 5);

  return {
    url,
    title: titleMatch ? titleMatch[1].trim() : 'Brand Campaign',
    description: descriptionMatch ? descriptionMatch[1].trim() : 'Generated brand campaign',
    colors: {
      primary: '#841b60',
      secondary: '#6d164f',
      accent: '#ffffff',
      background: '#f8fafc'
    },
    content: {
      headings,
      descriptions: headings.slice(0, 3), // Use headings as descriptions for now
      ctaTexts: ctaTexts.length > 0 ? ctaTexts : ['Participer', 'Découvrir', 'Jouer']
    }
  };
}

async function generateGameConcept(brandData: BrandData) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
Analyze this brand data and generate a complete marketing game concept in French:

BRAND DATA:
- URL: ${brandData.url}
- Title: ${brandData.title}
- Description: ${brandData.description}
- Key Content: ${brandData.content.headings.join(', ')}
- CTA Examples: ${brandData.content.ctaTexts.join(', ')}

REQUIREMENTS:
1. Choose the BEST game type for this brand (wheel, quiz, scratch, jackpot)
2. Create prizes relevant to the brand's industry
3. Generate engaging French copy that sounds professional
4. Create game configuration appropriate for the chosen type

RESPOND WITH VALID JSON ONLY:
{
  "gameType": "wheel|quiz|scratch|jackpot",
  "gameName": "Nom du jeu en français",
  "theme": "Description du thème",
  "colors": {
    "primary": "#841b60",
    "secondary": "#6d164f", 
    "accent": "#ffffff",
    "background": "#f8fafc"
  },
  "content": {
    "title": "Titre accrocheur en français",
    "description": "Description de la campagne en français", 
    "buttonText": "Texte du bouton en français",
    "successMessage": "Message de félicitations en français"
  },
  "gameConfig": {
    "segments": [{"label": "Prix 1", "color": "#841b60", "probability": 1}],
    "questions": [{"question": "Question", "options": ["A","B","C","D"], "correctAnswer": 0}],
    "prizes": ["Prix 1", "Prix 2", "Prix 3"],
    "rules": "Règles du jeu en français"
  },
  "design": {
    "fontFamily": "Inter",
    "borderRadius": "0.5rem",
    "shadows": true,
    "animations": true  
  },
  "tone": "professional"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a French marketing game designer. Generate complete game concepts that match brand identity perfectly. Always respond with valid JSON only in French.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Invalid JSON response from OpenAI');
  }
}
