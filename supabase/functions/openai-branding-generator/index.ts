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

    // Enhanced prompt with website content and professional specifications
    const enhancedPrompt = `MISSION: Analyser cette marque et créer une campagne de jeu-concours visuelle de niveau studio professionnel avec VISUELS DE FOND COLORÉS ET POLICES ULTRA-STYLISÉES.

CONTENU DU SITE WEB À ANALYSER:
${websiteContent}

${body.logoUrl ? `LOGO FOURNI: ${body.logoUrl}` : 'AUCUN LOGO FOURNI'}
${body.backgroundUrl ? `IMAGE DE FOND FOURNIE: ${body.backgroundUrl}` : 'AUCUNE IMAGE DE FOND FOURNIE'}

EXEMPLES DE STYLES DE POLICES À REPRODUIRE:
1. STYLE NATUREL: Typographie scripte italique avec ombres douces (ex: "Roue de la Chance" en écriture cursive)
2. STYLE SPORTIF: Blocs de texte ÉNORMES en MAJUSCULES avec backgrounds colorés jaune/vert fluo (ex: "GAGNEZ 1 MOIS DE FITNESS GRATUIT !")  
3. STYLE VOYAGE: Texte blanc sur fond sombre avec éléments premium et typographie élégante
4. STYLE MODERNE: Texte sur blocs colorés noirs/pastel avec éléments décoratifs floraux

INSTRUCTIONS SPÉCIFIQUES:
1. Analyse le secteur d'activité et choisis le STYLE le plus adapté parmi les 4 disponibles
2. Génère une palette de couleurs harmonieuse en cohérence avec la marque
3. Crée des textes accrocheurs et brandés pour le jeu-concours avec EFFETS VISUELS ULTRA-STYLISÉS
4. Décris précisément les VISUELS DE FOND colorés à générer
5. Spécifie les EFFETS TYPOGRAPHIQUES avancés (ombres, contours, dégradés, blocs colorés)
6. Assure-toi que tous les éléments suivent une hiérarchie visuelle claire
7. Optimise pour l'engagement et la conversion

FORMAT JSON REQUIS:
{
  "styleChoisi": "naturel|sportif|voyage|moderne",
  "campaignTitle": "Titre principal accrocheur",
  "campaignSubtitle": "Sous-titre engageant",
  "palette_couleurs": [
    {"nom": "Couleur principale", "hexa": "#hexcode"},
    {"nom": "Couleur secondaire", "hexa": "#hexcode"},
    {"nom": "Couleur d'accent", "hexa": "#hexcode"}
  ],
  "polices": [
    {"nom": "FontName", "utilisation": "Titres"},
    {"nom": "FontName", "utilisation": "Texte"}
  ],
  "ambiance_et_keywords": ["mot1", "mot2", "mot3"],
  "extrait_du_ton_editorial": "Description du ton de communication",
  "wording_jeu_concours": {
    "titre": "Titre du jeu accrocheur avec effets visuels",
    "sous_titre": "Sous-titre qui donne envie",
    "mecanique": "Explication simple du jeu",
    "avantage_client": "Bénéfice clair pour l'utilisateur",
    "call_to_action": "CTA puissant en MAJUSCULES"
  },
  "wheelSegments": [
    {"label": "Prix 1", "color": "#hexcode", "probability": 0.3, "isWinning": true},
    {"label": "Prix 2", "color": "#hexcode", "probability": 0.25, "isWinning": true},
    {"label": "Prix 3", "color": "#hexcode", "probability": 0.25, "isWinning": true},
    {"label": "Réessayez", "color": "#hexcode", "probability": 0.2, "isWinning": false}
  ],
  "designElements": {
    "backgroundStyle": "Description détaillée du visuel de fond coloré à générer",
    "graphicElements": ["Element1", "Element2"],
    "layoutStyle": "Description de la composition",
    "typographyEffects": {
      "titleEffect": "Description précise de l'effet typographique du titre (ombre, contour, dégradé, bloc coloré)",
      "backgroundElements": "Description des éléments visuels de fond à générer",
      "colorBlocks": "Description des blocs colorés pour le texte si applicable"
    }
  },
  "visualGeneration": {
    "backgroundPrompt": "Prompt détaillé pour générer l'image de fond colorée stylisée",
    "titleStylePrompt": "Prompt pour générer le style typographique ultra-stylisé du titre"
  },
  "commentaires_design": "Justification des choix créatifs avec focus sur les effets visuels"
}

Génère UNIQUEMENT le JSON, sans texte supplémentaire.`;

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
            content: `Tu es un directeur artistique senior expert en branding digital et design UX/UI. Tu analyses des sites web pour créer des campagnes visuelles de niveau studio professionnel.

STYLES DISPONIBLES (choisis le plus adapté à la marque):
1. NATUREL & ORGANIQUE: Couleurs organiques (#5d7c47, #a8c68f, #f4e4c1), typographie Playfair Display, design épuré et chaleureux
2. SPORTIF & DYNAMIQUE: Couleurs vibrantes (#ff6b35, #004e89, #ffd23f), typographie Montserrat bold, énergie et mouvement
3. VOYAGE & LUXE: Couleurs premium (#d4af37, #1a4c7a, #ff6b9d), typographie Cormorant Garamond, sophistication et élégance
4. MODERNE & MINIMALISTE: Couleurs tech (#6c5ce7, #a29bfe, #fd79a8), typographie Poppins, design épuré et géométrique

EXIGENCES DE DESIGN:
- Hiérarchie typographique parfaite avec tailles et poids optimisés
- Palettes harmonieuses avec contraste optimal pour accessibilité
- Compositions centrées avec positionnement précis des éléments
- Effets visuels professionnels (ombres, dégradés, animations)
- Cohérence visuelle totale entre tous les éléments
- Adaptation parfaite au secteur d'activité analysé

Tu dois analyser le contenu web fourni et générer un JSON parfaitement structuré selon le format demandé, en choisissant le style le plus adapté à l'univers de la marque analysée.`
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

      // Generate stylized visual image using OpenAI's image API
      let generatedImageUrl = null;
      
      if (parsedResult.visualGeneration?.backgroundPrompt) {
        try {
          console.log('🎨 Generating stylized visual with OpenAI image API...');
          
          const imagePrompt = `Professional marketing campaign visual in ${parsedResult.styleChoisi} style: ${parsedResult.visualGeneration.backgroundPrompt}. 
          Include stylized text "${parsedResult.wording_jeu_concours?.titre || parsedResult.campaignTitle}" with ultra-modern typography effects like shadows, outlines, gradients, and colored backgrounds. 
          Colors: ${parsedResult.palette_couleurs?.map(c => c.hexa).join(', ')}. 
          Style: ${parsedResult.designElements?.backgroundStyle}. 
          ${parsedResult.visualGeneration.titleStylePrompt}
          High quality, professional studio-level design, 16:9 aspect ratio`;

          const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-image-1',
              prompt: imagePrompt,
              n: 1,
              size: '1536x1024',
              quality: 'high',
              output_format: 'png'
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            generatedImageUrl = imageData.data[0].b64_json;
            console.log('✅ Generated stylized visual successfully');
          } else {
            console.warn('⚠️ Image generation failed:', imageResponse.statusText);
          }
        } catch (imageError) {
          console.error('❌ Error generating image:', imageError);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        result: parsedResult,
        generatedImage: generatedImageUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw content that failed to parse:', content);
      
      // Return a fallback response with studio-level design
      const fallbackResult = {
        styleChoisi: "voyage",
        campaignTitle: "Découvrez l'Exception",
        campaignSubtitle: "Une expérience premium vous attend",
        palette_couleurs: [
          {"nom": "Couleur principale", "hexa": "#d4af37"},
          {"nom": "Couleur secondaire", "hexa": "#1a4c7a"},
          {"nom": "Couleur d'accent", "hexa": "#ff6b9d"}
        ],
        polices: [
          {"nom": "Cormorant Garamond", "utilisation": "Titres"},
          {"nom": "Inter", "utilisation": "Texte courant"}
        ],
        ambiance_et_keywords: ["voyage", "premium", "luxe", "sophistication"],
        extrait_du_ton_editorial: "Communication élégante et sophistiquée, ton premium avec une approche chaleureuse et exclusive.",
        wording_jeu_concours: {
          titre: "Tentez Votre Chance",
          sous_titre: "Une aventure exceptionnelle vous attend", 
          mecanique: "Tournez la roue et découvrez votre prix",
          avantage_client: "Des récompenses exclusives à gagner",
          call_to_action: "JOUER MAINTENANT"
        },
        wheelSegments: [
          {"label": "Séjour Premium", "color": "#d4af37", "probability": 0.2, "isWinning": true},
          {"label": "Week-end Détente", "color": "#1a4c7a", "probability": 0.25, "isWinning": true},
          {"label": "Bon d'achat", "color": "#ff6b9d", "probability": 0.25, "isWinning": true},
          {"label": "Réessayez", "color": "#64748b", "probability": 0.3, "isWinning": false}
        ],
        designElements: {
          backgroundStyle: "Dégradé sophistiqué bleu-doré avec effets de profondeur",
          graphicElements: ["Formes géométriques élégantes", "Éléments premium", "Effets de lumière dorée"],
          layoutStyle: "Composition centrée avec hiérarchie visuelle forte"
        },
        visualGeneration: {
          backgroundPrompt: "Professional luxury travel campaign background with golden and blue gradients",
          titleStylePrompt: "Elegant stylized text with golden effects and sophisticated typography"
        },
        commentaires_design: "Design premium avec une approche voyage luxe et des éléments visuels sophistiqués pour maximiser l'engagement."
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