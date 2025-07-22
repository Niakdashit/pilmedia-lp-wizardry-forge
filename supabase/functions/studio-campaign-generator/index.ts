import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudioCampaignRequest {
  websiteUrl?: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
  campaignType?: string;
  targetAudience?: string;
  objective?: string;
}

interface BrandAnalysis {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  brandName: string;
  industry: string;
  tone: string;
}

interface GeneratedContent {
  title: string;
  subtitle: string;
  callToAction: string;
  description: string;
  visualStyle: {
    typography: string;
    layout: string;
    effectsAndShadows: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const body: StudioCampaignRequest = await req.json();
    console.log('Studio campaign request:', body);

    // 1. Analyser le site web pour extraire les infos de marque
    let brandAnalysis: BrandAnalysis | null = null;
    if (body.websiteUrl) {
      brandAnalysis = await analyzeBrand(body.websiteUrl, OPENAI_API_KEY, body.backgroundImageUrl);
    }

    // 2. Générer le contenu de campagne avec IA
    const generatedContent = await generateCampaignContent(
      body,
      brandAnalysis,
      OPENAI_API_KEY
    );

    // 3. Créer la configuration complète de la campagne
    const campaignConfig = {
      brandAnalysis,
      content: generatedContent,
      design: {
        primaryColor: brandAnalysis?.primaryColor || '#841b60',
        secondaryColor: brandAnalysis?.secondaryColor || '#dc2626',
        accentColor: brandAnalysis?.accentColor || '#ffffff',
        fontFamily: brandAnalysis?.fontFamily || 'Montserrat',
        backgroundImageUrl: body.backgroundImageUrl,
        logoUrl: body.logoUrl,
      }
    };

    return new Response(JSON.stringify(campaignConfig), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-campaign-generator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeBrand(websiteUrl: string, apiKey: string, backgroundImageUrl?: string): Promise<BrandAnalysis> {
  console.log('Analyzing brand from:', websiteUrl);
  
  // Récupérer le contenu du site web
  let websiteContent = '';
  try {
    const response = await fetch(websiteUrl);
    websiteContent = await response.text();
    // Limiter le contenu pour éviter les tokens excessifs
    websiteContent = websiteContent.substring(0, 10000);
  } catch (error) {
    console.warn('Could not fetch website content:', error);
    websiteContent = `Site web: ${websiteUrl}`;
  }

  const backgroundAnalysis = backgroundImageUrl ? `

IMPORTANT: Une image de fond a été fournie: ${backgroundImageUrl}
Vous devez analyser cette image pour extraire les couleurs dominantes et les utiliser comme base pour votre palette de couleurs. Les couleurs de l'image de fond doivent être prioritaires sur celles du site web.

Analysez cette image de fond pour:
1. Couleur dominante (primaryColor)
2. Couleur secondaire visible (secondaryColor) 
3. Couleur d'accent qui contraste bien (accentColor)
4. Assurez-vous que les couleurs extraites créent un bon contraste pour la lisibilité du texte
` : '';

  const prompt = `
Analysez ce site web et extrayez les informations de marque clés. Voici le contenu HTML:

${websiteContent}
${backgroundAnalysis}

Retournez un objet JSON avec cette structure exacte:
{
  "primaryColor": "#hexcode",
  "secondaryColor": "#hexcode", 
  "accentColor": "#hexcode",
  "fontFamily": "nom exact de la police principale détectée (Google Fonts de préférence)",
  "brandName": "nom exact de la marque trouvé",
  "industry": "secteur d'activité précis",
  "tone": "ton de communication (moderne, élégant, dynamique, familial, etc.)"
}

Instructions spéciales:
- Si une image de fond est fournie, PRIORITÉ aux couleurs de cette image
- Pour fontFamily, cherchez les vraies polices utilisées (Montserrat, Roboto, Open Sans, etc.)
- Analysez le CSS et les balles link pour détecter les Google Fonts
- Les couleurs doivent être harmonieuses et professionnelles
- accentColor doit contraster avec primaryColor pour les boutons
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un expert en analyse de marque, design et extraction de couleurs. Réponds uniquement avec du JSON valide. Sois précis dans la détection des polices et couleurs.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Nettoyer le contenu pour extraire le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;
    return JSON.parse(jsonContent);
  } catch (e) {
    console.error('Failed to parse brand analysis:', content);
    // Fallback avec des valeurs par défaut
    return {
      primaryColor: '#006799',
      secondaryColor: '#5bbad5',
      accentColor: '#ffffff',
      fontFamily: 'Averta',
      brandName: 'Votre Marque',
      industry: 'général',
      tone: 'moderne'
    };
  }
}

async function generateCampaignContent(
  request: StudioCampaignRequest,
  brandAnalysis: BrandAnalysis | null,
  apiKey: string
): Promise<GeneratedContent> {
  console.log('Generating campaign content...');

  const brandInfo = brandAnalysis ? `
Marque: ${brandAnalysis.brandName}
Secteur: ${brandAnalysis.industry}
Ton: ${brandAnalysis.tone}
Couleurs: ${brandAnalysis.primaryColor}, ${brandAnalysis.secondaryColor}
` : '';

  const prompt = `
Créez une campagne marketing de niveau STUDIO professionnel avec ces informations:

${brandInfo}
Type de campagne: ${request.campaignType || 'jeu-concours'}
Public cible: ${request.targetAudience || 'général'}
Objectif: ${request.objective || 'engagement'}

Créez du contenu percutant qui ressemble aux meilleures campagnes Canva/Adobe. Le contenu doit être:
- IMPACTANT et MÉMORABLE
- Adapté à la marque
- Optimisé pour le digital
- Niveau studio professionnel

Retournez un objet JSON avec cette structure exacte:
{
  "title": "TITRE PRINCIPAL IMPACTANT (en majuscules si approprié)",
  "subtitle": "Sous-titre complémentaire",
  "callToAction": "CALL TO ACTION PUISSANT",
  "description": "Description détaillée de l'offre",
  "visualStyle": {
    "typography": "Style typographique recommandé (gras, italique, taille, etc.)",
    "layout": "Disposition recommandée des éléments",
    "effectsAndShadows": "Effets visuels et ombres recommandés"
  }
}

Exemples de titres impactants:
- "TOURNEZ LA ROUE DE LA CHANCE"
- "GAGNEZ 1 MOIS DE FITNESS GRATUIT !"
- "DÉVERROUILLEZ VOTRE CADEAU MYSTÈRE"

Soyez créatif et professionnel !
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un expert en marketing digital et copywriting. Crée du contenu de niveau studio professionnel. Réponds uniquement avec du JSON valide.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse campaign content:', content);
    // Fallback avec du contenu par défaut
    return {
      title: 'PARTICIPEZ & GAGNEZ',
      subtitle: 'Une expérience unique vous attend',
      callToAction: 'JOUER MAINTENANT',
      description: 'Tentez votre chance et remportez des prix exceptionnels',
      visualStyle: {
        typography: 'Titre en gras, sous-titre léger',
        layout: 'Centré avec hiérarchie claire',
        effectsAndShadows: 'Ombres portées subtiles'
      }
    };
  }
}