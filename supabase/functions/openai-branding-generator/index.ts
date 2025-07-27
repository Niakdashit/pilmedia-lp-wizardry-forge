import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandingRequest {
  prompt: string;
  websiteUrl: string;
  logoUrl?: string;
  backgroundUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const body: BrandingRequest = await req.json();
    console.log('🚀 Branding AI Generator called');
    console.log('📋 Request data:', {
      websiteUrl: body.websiteUrl,
      logoUrl: body.logoUrl ? 'Provided' : 'Not provided',
      backgroundUrl: body.backgroundUrl ? 'Provided' : 'Not provided'
    });

    // First, fetch the website content to analyze
    let websiteContent = '';
    try {
      console.log('🔍 Fetching website content from:', body.websiteUrl);
      const websiteResponse = await fetch(body.websiteUrl);
      websiteContent = await websiteResponse.text();
      // Limit content to avoid excessive tokens
      websiteContent = websiteContent.substring(0, 8000);
      console.log('✅ Website content fetched, length:', websiteContent.length);
    } catch (error) {
      console.warn('⚠️ Could not fetch website content:', error);
      websiteContent = `Site web: ${body.websiteUrl}`;
    }

    // Enhanced prompt with website content
    const enhancedPrompt = `${body.prompt}

CONTENU DU SITE WEB À ANALYSER:
${websiteContent}

${body.logoUrl ? `LOGO FOURNI: ${body.logoUrl}` : 'AUCUN LOGO FOURNI'}
${body.backgroundUrl ? `IMAGE DE FOND FOURNIE: ${body.backgroundUrl}` : 'AUCUNE IMAGE DE FOND FOURNIE'}

Analyse ce contenu web pour extraire l'univers de marque et génère une réponse JSON parfaitement structurée selon le format demandé.`;

    console.log('🤖 Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un directeur artistique senior et expert en branding digital. Tu analyses des sites web pour extraire l\'identité de marque et génères des campagnes visuelles de niveau studio professionnel. Tu dois créer des designs sophistiqués avec une hiérarchie typographique parfaite, des palettes de couleurs harmonieuses et des compositions visuelles impactantes. Tu réponds UNIQUEMENT avec du JSON valide, sans texte supplémentaire.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 OpenAI response received');
    
    const content = data.choices[0].message.content;
    console.log('📝 Raw content:', content.substring(0, 500) + '...');

    try {
      // Clean the content to extract JSON
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      
      // Find JSON in the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : cleanContent;
      
      console.log('🔍 Cleaned JSON content preview:', jsonContent.substring(0, 200) + '...');
      
      const parsedResult = JSON.parse(jsonContent);
      console.log('✅ Successfully parsed branding result');
      console.log('🎨 Generated palette colors:', parsedResult.palette_couleurs?.length || 0);
      console.log('📝 Generated wording:', parsedResult.wording_jeu_concours?.titre || 'No title');

      return new Response(JSON.stringify({ 
        success: true, 
        result: parsedResult 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw content that failed to parse:', content);
      
      // Return a fallback response with studio-level design
      const fallbackResult = {
        campaignTitle: "Campagne Exclusive",
        campaignSubtitle: "Une expérience unique vous attend",
        palette_couleurs: [
          {"nom": "Couleur principale", "hexa": "#2563eb"},
          {"nom": "Couleur secondaire", "hexa": "#1d4ed8"},
          {"nom": "Couleur d'accent", "hexa": "#3b82f6"}
        ],
        polices: [
          {"nom": "Inter", "utilisation": "Titres"},
          {"nom": "Inter", "utilisation": "Texte courant"}
        ],
        ambiance_et_keywords: ["moderne", "premium", "élégant", "professionnel"],
        extrait_du_ton_editorial: "Communication sophistiquée et engageante, ton premium avec une approche moderne et accessible.",
        wording_jeu_concours: {
          titre: "Tentez Votre Chance",
          sous_titre: "Une expérience exceptionnelle vous attend", 
          mecanique: "Tournez la roue et découvrez votre prix",
          avantage_client: "Des récompenses exclusives à gagner",
          call_to_action: "JOUER MAINTENANT"
        },
        wheelSegments: [
          {"label": "Prix Premium", "color": "#2563eb", "probability": 0.2, "isWinning": true},
          {"label": "Cadeau Surprise", "color": "#1d4ed8", "probability": 0.25, "isWinning": true},
          {"label": "Bon d'achat", "color": "#3b82f6", "probability": 0.25, "isWinning": true},
          {"label": "Réessayez", "color": "#64748b", "probability": 0.3, "isWinning": false}
        ],
        designElements: {
          backgroundStyle: "Dégradé sophistiqué avec effets de profondeur",
          graphicElements: ["Formes géométriques", "Éléments premium", "Effets de lumière"],
          layoutStyle: "Composition centrée avec hiérarchie visuelle forte"
        },
        commentaires_design: "Design professionnel avec une approche moderne et des éléments visuels premium pour maximiser l'engagement."
      };

      return new Response(JSON.stringify({ 
        success: true, 
        result: fallbackResult,
        warning: 'Fallback result used due to parsing error'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('💥 Error in openai-branding-generator:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});