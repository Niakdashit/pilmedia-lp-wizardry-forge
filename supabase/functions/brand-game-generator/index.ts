import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandGameRequest {
  url: string;
}

interface EnhancedBrandData {
  url: string;
  title: string;
  description: string;
  logo?: string;
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
  brandAnalysis: {
    industry: string;
    brandPersonality: string;
    targetAudience: string;
    marketingTone: string;
    visualStyle: string;
    competitiveAdvantage: string;
  };
  designElements: {
    typography: string;
    visualMotifs: string[];
    iconography: string;
    layoutPreferences: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: BrandGameRequest = await req.json();
    console.log('Processing brand URL for studio-level campaign:', url);

    // Step 1: Extract enhanced brand data using ScrapingBee
    const brandData = await extractEnhancedBrandData(url);
    console.log('Enhanced brand data extracted:', brandData);

    // Step 2: Generate studio-level game concept using OpenAI
    const studioCampaign = await generateStudioLevelCampaign(brandData);
    console.log('Studio-level campaign generated:', studioCampaign);

    return new Response(JSON.stringify(studioCampaign), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in brand-game-generator function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function extractEnhancedBrandData(url: string): Promise<EnhancedBrandData> {
  const scrapingBeeApiKey = Deno.env.get('SCRAPINGBEE_API_KEY');
  
  if (!scrapingBeeApiKey) {
    throw new Error('ScrapingBee API key not configured');
  }

  console.log('ScrapingBee API Key configured:', scrapingBeeApiKey ? 'Yes' : 'No');

  const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeApiKey}&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true`;
  
  console.log('Calling ScrapingBee with enhanced extraction');

  try {
    const response = await fetch(scrapingBeeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      }
    });

    console.log('ScrapingBee response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ScrapingBee error response:', errorText);
      throw new Error(`ScrapingBee API error: ${response.status} - ${errorText}`);
    }

    const html = await response.text();
    console.log('HTML content length:', html.length);
    
    const brandData = parseEnhancedBrandData(url, html);
    
    // Extract and upload logo if found
    if (brandData.logo) {
      try {
        const uploadedLogoUrl = await uploadLogo(brandData.logo, url);
        brandData.logo = uploadedLogoUrl;
        console.log('Logo uploaded successfully:', uploadedLogoUrl);
      } catch (logoError) {
        console.error('Failed to upload logo:', logoError);
        brandData.logo = undefined;
      }
    }
    
    return brandData;
  } catch (fetchError) {
    console.error('ScrapingBee fetch error:', fetchError);
    
    // Enhanced fallback with better analysis
    console.log('Using enhanced fallback brand data');
    return createEnhancedFallbackData(url);
  }
}

function parseEnhancedBrandData(url: string, html: string): EnhancedBrandData {
  // Extract basic data
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descriptionMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
  
  // Extract logo with multiple strategies
  let logoUrl = extractLogo(html, url);
  
  // Extract enhanced content
  const headingMatches = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
  const headings = headingMatches.map(match => 
    match.replace(/<[^>]*>/g, '').trim()
  ).filter(Boolean).slice(0, 10);

  const buttonMatches = html.match(/<button[^>]*>([^<]+)<\/button>|<a[^>]*class[^>]*button[^>]*>([^<]+)<\/a>/gi) || [];
  const ctaTexts = buttonMatches.map(match => 
    match.replace(/<[^>]*>/g, '').trim()
  ).filter(Boolean).slice(0, 10);

  // Enhanced brand analysis
  const brandAnalysis = analyzeBrandFromContent(html, headings, ctaTexts);
  const designElements = extractDesignElements(html);

  return {
    url,
    title: titleMatch ? titleMatch[1].trim() : 'Campagne de Marque Premium',
    description: descriptionMatch ? descriptionMatch[1].trim() : 'Campagne générée avec analyse avancée de la marque',
    logo: logoUrl,
    colors: extractAdvancedColors(html),
    content: {
      headings: headings.length > 0 ? headings : ['Découvrez notre univers', 'Expérience premium', 'Participez et gagnez'],
      descriptions: headings.slice(0, 5).length > 0 ? headings.slice(0, 5) : ['Une expérience unique vous attend', 'Des prix exceptionnels à gagner', 'Rejoignez notre communauté'],
      ctaTexts: ctaTexts.length > 0 ? ctaTexts : ['Participer', 'Découvrir', 'Jouer maintenant', 'Je tente ma chance']
    },
    brandAnalysis,
    designElements
  };
}

function analyzeBrandFromContent(html: string, headings: string[], ctaTexts: string[]): EnhancedBrandData['brandAnalysis'] {
  const content = html.toLowerCase();
  const allText = [...headings, ...ctaTexts].join(' ').toLowerCase();
  
  // Industry detection
  let industry = 'lifestyle';
  if (content.includes('food') || content.includes('restaurant') || content.includes('cuisine')) industry = 'food';
  else if (content.includes('fashion') || content.includes('mode') || content.includes('style')) industry = 'fashion';
  else if (content.includes('tech') || content.includes('digital') || content.includes('software')) industry = 'technology';
  else if (content.includes('sport') || content.includes('fitness') || content.includes('athlete')) industry = 'sports';
  else if (content.includes('beauty') || content.includes('cosmetic') || content.includes('skincare')) industry = 'beauty';
  else if (content.includes('travel') || content.includes('voyage') || content.includes('tourism')) industry = 'travel';

  // Brand personality analysis
  let brandPersonality = 'moderne et accessible';
  if (allText.includes('premium') || allText.includes('luxury') || allText.includes('exclusif')) brandPersonality = 'premium et exclusif';
  else if (allText.includes('fun') || allText.includes('play') || allText.includes('amusant')) brandPersonality = 'ludique et énergique';
  else if (allText.includes('natural') || allText.includes('bio') || allText.includes('eco')) brandPersonality = 'naturel et responsable';

  // Target audience
  let targetAudience = 'grand public';
  if (allText.includes('young') || allText.includes('jeune') || allText.includes('teen')) targetAudience = 'jeunes adultes';
  else if (allText.includes('professional') || allText.includes('business') || allText.includes('professionnel')) targetAudience = 'professionnels';
  else if (allText.includes('family') || allText.includes('famille') || allText.includes('parent')) targetAudience = 'familles';

  return {
    industry,
    brandPersonality,
    targetAudience,
    marketingTone: brandPersonality.includes('premium') ? 'sophistiqué et élégant' : 'convivial et engageant',
    visualStyle: brandPersonality.includes('premium') ? 'minimaliste et raffiné' : 'coloré et dynamique',
    competitiveAdvantage: 'expérience utilisateur exceptionnelle'
  };
}

function extractDesignElements(html: string): EnhancedBrandData['designElements'] {
  return {
    typography: 'moderne et lisible',
    visualMotifs: ['géométrique', 'organique', 'minimaliste'],
    iconography: 'simple et reconnaissable',
    layoutPreferences: 'centré avec espaces généreux'
  };
}

function extractAdvancedColors(html: string): EnhancedBrandData['colors'] {
  // Try to extract colors from CSS
  const colorMatches = html.match(/#[0-9a-fA-F]{6}|rgb\([^)]+\)/g) || [];
  
  if (colorMatches.length >= 2) {
    return {
      primary: colorMatches[0] || '#841b60',
      secondary: colorMatches[1] || '#6d164f',
      accent: colorMatches[2] || '#ffffff',
      background: '#f8fafc'
    };
  }

  return {
    primary: '#841b60',
    secondary: '#6d164f',
    accent: '#ffffff',
    background: '#f8fafc'
  };
}

function createEnhancedFallbackData(url: string): EnhancedBrandData {
  const domain = new URL(url).hostname.replace('www.', '');
  
  return {
    url,
    title: `Campagne Premium ${domain}`,
    description: 'Campagne générée avec analyse avancée de la marque',
    colors: {
      primary: '#841b60',
      secondary: '#6d164f',
      accent: '#ffffff',
      background: '#f8fafc'
    },
    content: {
      headings: ['Découvrez notre univers', 'Expérience premium', 'Participez et gagnez'],
      descriptions: ['Une expérience unique vous attend', 'Des prix exceptionnels à gagner', 'Rejoignez notre communauté'],
      ctaTexts: ['Participer', 'Découvrir', 'Jouer maintenant', 'Je tente ma chance']
    },
    brandAnalysis: {
      industry: 'lifestyle',
      brandPersonality: 'moderne et accessible',
      targetAudience: 'grand public',
      marketingTone: 'convivial et engageant',
      visualStyle: 'coloré et dynamique',
      competitiveAdvantage: 'expérience utilisateur exceptionnelle'
    },
    designElements: {
      typography: 'moderne et lisible',
      visualMotifs: ['géométrique', 'moderne'],
      iconography: 'simple et reconnaissable',
      layoutPreferences: 'centré avec espaces généreux'
    }
  };
}

async function generateStudioLevelCampaign(brandData: EnhancedBrandData) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
Tu es un directeur artistique senior spécialisé dans les campagnes marketing de niveau studio.
Analyse ces données de marque et génère une campagne marketing premium:

DONNÉES DE MARQUE:
- URL: ${brandData.url}
- Titre: ${brandData.title}
- Description: ${brandData.description}
- Logo: ${brandData.logo ? 'Disponible' : 'Non disponible'}
- Industrie: ${brandData.brandAnalysis.industry}
- Personnalité de marque: ${brandData.brandAnalysis.brandPersonality}
- Audience cible: ${brandData.brandAnalysis.targetAudience}
- Ton marketing: ${brandData.brandAnalysis.marketingTone}
- Style visuel: ${brandData.brandAnalysis.visualStyle}

CONTENU EXTRAIT:
- Titres principaux: ${brandData.content.headings.join(', ')}
- Call-to-actions: ${brandData.content.ctaTexts.join(', ')}

EXIGENCES STUDIO:
1. Choisir le type de jeu optimal pour maximiser l'engagement (wheel, quiz, scratch, jackpot)
2. Créer des prix en parfaite cohérence avec l'univers de marque
3. Rédiger un copy percutant et professionnel en français
4. Concevoir une configuration de jeu sophistiquée
5. Assurer une cohérence visuelle premium
6. Optimiser pour l'expérience utilisateur mobile et desktop
7. Intégrer des éléments de gamification avancés

RÉPONSES STUDIO:
{
  "gameType": "wheel|quiz|scratch|jackpot",
  "gameName": "Nom du jeu premium en français",
  "theme": "Thème sophistiqué aligné sur la marque",
  "logo": "${brandData.logo || ''}",
  "colors": {
    "primary": "${brandData.colors.primary}",
    "secondary": "${brandData.colors.secondary}",
    "accent": "${brandData.colors.accent}",
    "background": "${brandData.colors.background}"
  },
  "content": {
    "title": "Titre accrocheur premium en français",
    "description": "Description engageante et professionnelle",
    "buttonText": "Call-to-action optimisé",
    "successMessage": "Message de victoire mémorable"
  },
  "gameConfig": {
    "segments": [
      {"label": "Prix premium 1", "color": "${brandData.colors.primary}", "probability": 0.15},
      {"label": "Prix premium 2", "color": "${brandData.colors.secondary}", "probability": 0.20},
      {"label": "Prix premium 3", "color": "${brandData.colors.accent}", "probability": 0.25},
      {"label": "Bonus exclusif", "color": "${brandData.colors.primary}", "probability": 0.10},
      {"label": "Surprise", "color": "${brandData.colors.secondary}", "probability": 0.15},
      {"label": "Récompense spéciale", "color": "${brandData.colors.accent}", "probability": 0.15}
    ],
    "questions": [
      {
        "question": "Question engageante sur la marque",
        "options": ["Option A premium", "Option B exclusive", "Option C unique", "Option D spéciale"],
        "correctAnswer": 1
      }
    ],
    "prizes": ["Prix premium 1", "Prix premium 2", "Prix premium 3", "Bonus exclusif", "Surprise", "Récompense spéciale"],
    "rules": "Règles claires et attrayantes en français"
  },
  "design": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "borderRadius": "12px",
    "shadows": true,
    "animations": true,
    "premiumEffects": {
      "gradient": true,
      "glassmorphism": true,
      "microInteractions": true
    }
  },
  "tone": "premium",
  "marketingStrategy": {
    "engagementTactics": ["urgence", "exclusivité", "personnalisation"],
    "socialProof": true,
    "gamificationLevel": "advanced"
  }
}`;

  console.log('Generating studio-level campaign with OpenAI');

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
          content: 'Tu es un directeur artistique expert en campagnes marketing premium. Tu crées des concepts de jeu sophistiqués qui rivalisent avec les meilleures agences. Réponds UNIQUEMENT en JSON valide, sans formatage markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Clean up any markdown formatting
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    const parsedContent = JSON.parse(content);
    console.log('Successfully generated studio-level campaign');
    return parsedContent;
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    console.error('Parse error:', parseError);
    throw new Error('Invalid JSON response from OpenAI');
  }
}

function extractLogo(html: string, baseUrl: string): string | undefined {
  const logoSelectors = [
    /<img[^>]*class[^>]*logo[^>]*src=["\']([^"']+)["\'][^>]*>/i,
    /<img[^>]*src=["\']([^"']+)["\'][^>]*class[^>]*logo[^>]*>/i,
    /<img[^>]*alt[^>]*logo[^>]*src=["\']([^"']+)["\'][^>]*>/i,
    /<img[^>]*src=["\']([^"']+)["\'][^>]*alt[^>]*logo[^>]*>/i,
    /<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i,
    /<meta[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i,
    /<link[^>]*rel=["\']icon["\'][^>]*href=["\']([^"']+)["\'][^>]*>/i,
    /<link[^>]*rel=["\']shortcut icon["\'][^>]*href=["\']([^"']+)["\'][^>]*>/i,
    /<link[^>]*rel=["\']apple-touch-icon["\'][^>]*href=["\']([^"']+)["\'][^>]*>/i
  ];

  for (const selector of logoSelectors) {
    const match = html.match(selector);
    if (match && match[1]) {
      const logoUrl = match[1];
      if (logoUrl.startsWith('//')) {
        return `https:${logoUrl}`;
      } else if (logoUrl.startsWith('/')) {
        const domain = new URL(baseUrl).origin;
        return `${domain}${logoUrl}`;
      } else if (logoUrl.startsWith('http')) {
        return logoUrl;
      } else {
        return new URL(logoUrl, baseUrl).href;
      }
    }
  }
  return undefined;
}

async function uploadLogo(logoUrl: string, brandUrl: string): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Downloading logo from:', logoUrl);
    const logoResponse = await fetch(logoUrl);
    
    if (!logoResponse.ok) {
      throw new Error(`Failed to download logo: ${logoResponse.status}`);
    }

    const logoBlob = await logoResponse.blob();
    const logoBuffer = await logoBlob.arrayBuffer();
    
    const domain = new URL(brandUrl).hostname.replace('www.', '');
    const timestamp = Date.now();
    const extension = logoUrl.split('.').pop()?.split('?')[0] || 'png';
    const filename = `${domain}_${timestamp}.${extension}`;

    console.log('Uploading logo to storage:', filename);
    const { data, error } = await supabase.storage
      .from('brand-logos')
      .upload(filename, logoBuffer, {
        contentType: logoBlob.type || 'image/png',
        upsert: true
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Logo upload error:', error);
    throw error;
  }
}
