
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
      brandAnalysis = await analyzeBrand(body.websiteUrl, OPENAI_API_KEY, body.backgroundImageUrl, body.logoUrl);
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
        fontFamily: brandAnalysis?.fontFamily || 'Titan One',
        backgroundImageUrl: body.backgroundImageUrl,
        logoUrl: body.logoUrl,
      }
    };

    console.log('Final campaign config:', campaignConfig);

    return new Response(JSON.stringify(campaignConfig), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in studio-campaign-generator:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeBrand(websiteUrl: string, apiKey: string, backgroundImageUrl?: string, logoUrl?: string): Promise<BrandAnalysis> {
  console.log('Analyzing brand from:', websiteUrl);
  console.log('Background image URL:', backgroundImageUrl);
  console.log('Logo URL:', logoUrl);
  
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

  const logoAnalysis = logoUrl ? `

🎨 ANALYSE DU LOGO FOURNI: ${logoUrl}
Analysez visuellement ce logo pour détecter:
1. Style typographique (est-ce condensé comme "Sifonn", "Impact", "Bebas Neue" ?)
2. Si le texte est en majuscules et condensé, utilisez "Titan One" ou "Bebas Neue"
3. Si c'est un style moderne sans-serif épais, utilisez "Oswald" ou "Anton"
4. Si c'est traditionnel, utilisez "Montserrat" ou "Roboto"
5. Couleurs dominantes du logo (à prioriser sur tout le reste)
` : '';

  const backgroundAnalysis = backgroundImageUrl ? `

🖼️ IMAGE DE FOND PRIORITAIRE: ${backgroundImageUrl}
RÈGLE ABSOLUE: Cette image de fond doit être la SOURCE PRINCIPALE des couleurs.
Analysez cette image pour extraire:
1. Couleur la plus dominante (primaryColor) - celle qui occupe le plus d'espace
2. Couleur secondaire contrastante (secondaryColor) 
3. Couleur d'accent claire ou foncée (accentColor) qui ressort bien
4. Ignorez les couleurs du site web si cette image est fournie
5. Assurez-vous que primaryColor et secondaryColor créent un bon contraste
` : '';

  const prompt = `
Tu es un expert en analyse de marque et design visuel. Analyse ce site web et extrais les informations clés.

CONTENU DU SITE WEB:
${websiteContent}
${logoAnalysis}
${backgroundAnalysis}

🔍 INSTRUCTIONS SPÉCIALES POUR LES POLICES:
- Si tu détectes un style "SIFONN", "Impact", "condensé" ou "majuscules épaisses" → utilise "Titan One"
- Si tu vois un style moderne sans-serif épais → utilise "Bebas Neue" ou "Oswald"  
- Si c'est du texte traditionnel → utilise "Montserrat", "Roboto" ou "Open Sans"
- Pour Homair ou style vacances → privilégie "Titan One" ou "Bebas Neue" (impact fort)
- TOUJOURS analyser le logo uploadé en priorité pour la police

🎨 PRIORITÉS DES COULEURS:
1. Image de fond (si fournie) = PRIORITÉ ABSOLUE
2. Logo uploadé = PRIORITÉ ÉLEVÉE  
3. Site web = Seulement si pas d'image/logo

Retourne UNIQUEMENT un objet JSON valide avec cette structure exacte:
{
  "primaryColor": "#hexcode",
  "secondaryColor": "#hexcode", 
  "accentColor": "#hexcode",
  "fontFamily": "nom exact de police détectée",
  "brandName": "nom de la marque",
  "industry": "secteur d'activité",
  "tone": "ton de communication"
}

EXEMPLES DE POLICES À UTILISER:
- "Titan One" (pour style Sifonn/Impact/condensé)
- "Bebas Neue" (moderne condensé)
- "Oswald" (sans-serif condensé)
- "Anton" (bold condensé)
- "Montserrat" (moderne polyvalent)
- "Roboto" (tech/moderne)

⚠️ IMPORTANT: Réponds SEULEMENT avec le JSON, aucun autre texte.
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
          content: 'Tu es un expert en analyse de marque et design visuel. Tu détectes les polices de style "Sifonn", "Impact", condensées et les couleurs dominantes des images. Réponds UNIQUEMENT avec du JSON valide, aucun texte supplémentaire.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log('Raw AI response for brand analysis:', content);
  
  try {
    // Nettoyer le contenu pour extraire le JSON
    let cleanContent = content.trim();
    
    // Supprimer les blocs de code markdown s'il y en a
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    
    // Trouver le JSON dans la réponse
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : cleanContent;
    
    console.log('Cleaned JSON content:', jsonContent);
    
    const parsedResult = JSON.parse(jsonContent);
    console.log('Successfully parsed brand analysis:', parsedResult);
    
    return parsedResult;
  } catch (e) {
    console.error('Failed to parse brand analysis. Raw content:', content);
    console.error('Parse error:', e);
    
    // Fallback intelligent basé sur le contexte
    const fallbackFont = logoUrl || backgroundImageUrl ? 'Titan One' : 'Montserrat';
    
    return {
      primaryColor: '#006799',
      secondaryColor: '#5bbad5', 
      accentColor: '#ffffff',
      fontFamily: fallbackFont,
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
Police: ${brandAnalysis.fontFamily}
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
- Adapté à la marque et son secteur
- Optimisé pour le digital et mobile
- Niveau studio professionnel avec un titre accrocheur

Retournez UNIQUEMENT un objet JSON avec cette structure exacte:
{
  "title": "TITRE PRINCIPAL IMPACTANT (en majuscules si approprié)",
  "subtitle": "Sous-titre complémentaire engageant",
  "callToAction": "CALL TO ACTION PUISSANT",
  "description": "Description détaillée de l'offre et des bénéfices",
  "visualStyle": {
    "typography": "Style typographique recommandé",
    "layout": "Disposition recommandée des éléments", 
    "effectsAndShadows": "Effets visuels et ombres recommandés"
  }
}

Exemples de titres pour différents secteurs:
- Tourisme: "DÉCOUVREZ VOTRE ÉVASION DE RÊVE !"
- Fitness: "TRANSFORMEZ VOTRE CORPS AUJOURD'HUI !"
- Tech: "DÉVERROUILLEZ LE FUTUR !"
- Mode: "RÉVÉLEZ VOTRE STYLE UNIQUE !"

⚠️ IMPORTANT: Réponds SEULEMENT avec le JSON, aucun autre texte.
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
          content: 'Tu es un expert en marketing digital et copywriting. Crée du contenu de niveau studio professionnel. Réponds UNIQUEMENT avec du JSON valide, aucun texte supplémentaire.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log('Raw AI response for content generation:', content);
  
  try {
    // Nettoyer le contenu pour extraire le JSON
    let cleanContent = content.trim();
    
    // Supprimer les blocs de code markdown s'il y en a
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    
    // Trouver le JSON dans la réponse
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : cleanContent;
    
    console.log('Cleaned content JSON:', jsonContent);
    
    const parsedResult = JSON.parse(jsonContent);
    console.log('Successfully parsed campaign content:', parsedResult);
    
    return parsedResult;
  } catch (e) {
    console.error('Failed to parse campaign content. Raw content:', content);
    console.error('Parse error:', e);
    
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
