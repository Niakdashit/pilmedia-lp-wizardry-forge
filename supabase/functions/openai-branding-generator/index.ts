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
            content: 'Tu es un expert en branding et marketing digital. Tu analyses des sites web pour extraire l\'identité de marque et génères des campagnes de jeu-concours professionnelles. Tu réponds UNIQUEMENT avec du JSON valide, aucun texte supplémentaire.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
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
      
      // Return a fallback response
      const fallbackResult = {
        palette_couleurs: [
          {"nom": "Couleur principale", "hexa": "#3b82f6"},
          {"nom": "Couleur secondaire", "hexa": "#1e40af"},
          {"nom": "Couleur d'accent", "hexa": "#0ea5e9"}
        ],
        polices: [
          {"nom": "Montserrat", "utilisation": "Titres"},
          {"nom": "Roboto", "utilisation": "Texte courant"}
        ],
        ambiance_et_keywords: ["moderne", "professionnel", "dynamique"],
        extrait_du_ton_editorial: "Ton moderne et professionnel, orienté vers l'engagement client.",
        slogan_officiel: null,
        wording_jeu_concours: {
          titre: "Participez et gagnez !",
          sous_titre: "Tentez votre chance et remportez de superbes prix",
          mecanique: "Remplissez le formulaire pour participer",
          avantage_client: "Des prix exceptionnels à gagner",
          call_to_action: "PARTICIPER"
        },
        structure_visuelle: {
          format_pc_16_9: {
            logo: "En haut à gauche",
            image_fond: "En arrière-plan avec overlay",
            emplacements_textes: {
              titre: "Centré en haut",
              sous_titre: "Sous le titre",
              mecanique: "Centre de l'écran",
              avantage_client: "Bas de l'écran",
              call_to_action: "Bouton proéminent en bas"
            }
          },
          format_tablette: {
            logo: "En haut centré",
            image_fond: "Adapté au format tablette",
            emplacements_textes: {
              titre: "Centré",
              sous_titre: "Sous le titre",
              mecanique: "Centre",
              avantage_client: "Bas",
              call_to_action: "Bouton en bas"
            }
          },
          format_mobile_9_16: {
            logo: "En haut centré",
            image_fond: "Optimisé mobile",
            emplacements_textes: {
              titre: "Haut de l'écran",
              sous_titre: "Sous le titre",
              mecanique: "Centre",
              avantage_client: "Avant le bouton",
              call_to_action: "Bouton fixe en bas"
            }
          }
        },
        commentaires_design: "Design moderne et épuré, optimisé pour tous les formats d'écran."
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});