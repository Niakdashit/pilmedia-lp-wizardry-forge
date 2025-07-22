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

interface ProfessionalCampaignResult {
  palette_couleurs: Array<{
    nom: string;
    hexa: string;
  }>;
  polices: Array<{
    nom: string;
    utilisation: string;
  }>;
  ambiance_et_keywords: string[];
  extrait_du_ton_editorial: string;
  slogan_officiel: string | null;
  wording_jeu_concours: {
    titre: string;
    sous_titre: string;
    mecanique: string;
    avantage_client: string;
    call_to_action: string;
  };
  structure_visuelle: {
    format_pc_16_9: {
      logo: string;
      image_fond: string;
      emplacements_textes: {
        titre: string;
        sous_titre: string;
        mecanique: string;
        avantage_client: string;
        call_to_action: string;
      };
    };
    format_tablette: {
      logo: string;
      image_fond: string;
      emplacements_textes: {
        titre: string;
        sous_titre: string;
        mecanique: string;
        avantage_client: string;
        call_to_action: string;
      };
    };
    format_mobile_9_16: {
      logo: string;
      image_fond: string;
      emplacements_textes: {
        titre: string;
        sous_titre: string;
        mecanique: string;
        avantage_client: string;
        call_to_action: string;
      };
    };
  };
  commentaires_design: string;
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
    console.log('🎬 Studio campaign request:', body);

    // Générer la campagne avec votre prompt structuré exact
    const professionalCampaign = await generateProfessionalCampaign(
      body,
      OPENAI_API_KEY
    );

    console.log('✅ Professional campaign generated:', professionalCampaign);

    // Transformer le résultat pour l'ancien format (compatibilité)
    const campaignConfig = transformToLegacyFormat(professionalCampaign, body);

    console.log('🔄 Final campaign config:', campaignConfig);

    return new Response(JSON.stringify(campaignConfig), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in studio-campaign-generator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateProfessionalCampaign(
  request: StudioCampaignRequest,
  apiKey: string
): Promise<ProfessionalCampaignResult> {
  console.log('🎨 Generating professional campaign...');

  // Récupérer le contenu du site web si fourni
  let websiteContent = '';
  if (request.websiteUrl) {
    try {
      console.log('🌐 Fetching website content from:', request.websiteUrl);
      const response = await fetch(request.websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CampaignGenerator/1.0)'
        }
      });
      websiteContent = await response.text();
      // Limiter le contenu pour éviter les tokens excessifs
      websiteContent = websiteContent.substring(0, 15000);
      console.log('✅ Website content fetched, length:', websiteContent.length);
    } catch (error) {
      console.warn('⚠️ Could not fetch website content:', error);
      websiteContent = `Site web fourni: ${request.websiteUrl}`;
    }
  }

  const logoInfo = request.logoUrl ? `\nLogo fourni: ${request.logoUrl}` : '';
  const backgroundInfo = request.backgroundImageUrl ? `\nImage de fond fournie: ${request.backgroundImageUrl}` : '';

  // Votre prompt exact
  const prompt = `Génère une campagne de jeu concours digital adapté à une marque donnée, prêt à l'emploi, en t'appuyant sur les éléments suivants : l'URL officielle du site de la marque (à explorer pour comprendre l'univers visuel/la tonalité), un logo fourni (à utiliser sans modification), et une image de fond fournie (ou à défaut, propose une ambiance en cohérence avec la marque). Le visuel doit être décliné pour trois formats (PC 16:9, tablette et mobile 9:16), respecter strictement la charte graphique et le ton de la marque, sans jamais paraître générique ou IA généré.

Procède ainsi :
- Analyse l'URL pour identifier et extraire : 
    - Couleurs dominantes (en hexa) 
    - Polices principales (noms précis si trouvés)
    - Ambiance visuelle/mots-clés descriptifs 
    - Ton éditorial 
    - Slogan officiel de la marque (si existant et pertinent)
- Utilise obligatoirement (sans aucune modification ni génération) :
    - Le logo uploadé 
    - L'image de fond uploadée (ou, s'il n'y en a pas : crée une proposition d'ambiance fidèle à la marque)
- Structure le wording typique d'un jeu concours selon les usages français (évite tournures artificielles ou IA, reste professionnel et fluide) : 
    - Titre principal impactant 
    - Sous-titre/explanation 
    - Mécanique de participation claire (ex : "Tournez la roue", "Remplissez le formulaire…")
    - Avantage/bénéfice client 
    - Call-to-action percutant 
- Peaufine tout wording pour la cible (style moderne/sobre/ludique selon secteur).
- Propose une structure visuelle pour le rendu : 
    - Placement du logo
    - Positionnement de l'image de fond
    - Recommandations d'emplacement pour chaque bloc de texte, par version POS (PC / tablette / mobile)
- Le tout en garantissant un rendu niveau design studio.
- Assure-toi que le rendu final respecte à la lettre la charte, l'univers, et cible de la marque (jamais d'effet générique ou IA).

DONNÉES D'ENTRÉE :
URL du site: ${request.websiteUrl || 'non fournie'}
${logoInfo}
${backgroundInfo}
Type de campagne: ${request.campaignType || 'roue de la fortune'}
Public cible: ${request.targetAudience || 'grand public'}
Objectif: ${request.objective || 'engagement et génération de leads'}

CONTENU DU SITE WEB À ANALYSER :
${websiteContent}

Format de ta réponse (en français, structuré et exhaustif) en JSON :
{
  "palette_couleurs": [
    {"nom": "[Nom ou brève description de la couleur]", "hexa": "[#RRGGBB]"}
    // ...jusqu'à 5 couleurs principales
  ],
  "polices": [
    {"nom": "[Nom exact de la police]", "utilisation": "[titres, texte courant, etc.]"}
    // ...autant que nécessaire
  ],
  "ambiance_et_keywords": ["mot-clé1", "mot-clé2", "adjectif1", ...],
  "extrait_du_ton_editorial": "[court extrait ou description du registre et du ton de la marque identifié sur son site]",
  "slogan_officiel": "[slogan ou null]",
  "wording_jeu_concours": {
    "titre": "[Titre principal accrocheur]",
    "sous_titre": "[Phrase explicative ou incitative]",
    "mecanique": "[Description de la mécanique de participation]",
    "avantage_client": "[Formulation de l'avantage/lot ciblé]",
    "call_to_action": "[CTA engageant et concis]"
  },
  "structure_visuelle": {
    "format_pc_16_9": {
      "logo": "[suggestion précise de placement]",
      "image_fond": "[description de l'utilisation]",
      "emplacements_textes": {
        "titre": "[suggestion de placement]",
        "sous_titre": "[suggestion de placement]",
        "mecanique": "[suggestion de placement]",
        "avantage_client": "[suggestion de placement]",
        "call_to_action": "[suggestion emplacement/format]"
      }
    },
    "format_tablette": {
      "logo": "[suggestion précise de placement]",
      "image_fond": "[description de l'utilisation]",
      "emplacements_textes": {
        "titre": "[suggestion de placement]",
        "sous_titre": "[suggestion de placement]",
        "mecanique": "[suggestion de placement]",
        "avantage_client": "[suggestion de placement]",
        "call_to_action": "[suggestion emplacement/format]"
      }
    },
    "format_mobile_9_16": {
      "logo": "[suggestion précise de placement]",
      "image_fond": "[description de l'utilisation]",
      "emplacements_textes": {
        "titre": "[suggestion de placement]",
        "sous_titre": "[suggestion de placement]",
        "mecanique": "[suggestion de placement]",
        "avantage_client": "[suggestion de placement]",
        "call_to_action": "[suggestion emplacement/format]"
      }
    }
  },
  "commentaires_design": "[Consignes additionnelles pour studio : style, intégration, détails pour éviter l'effet template, etc.]"
}

RAPPEL INSTRUCTIONS CLÉS :  
- Explore précisément l'URL pour l'univers et charte.
- Utilise le logo et l'image fournie seulement (pas d'altération ou IA).
- Rends le wording et le rendu irréprochables, sans aucun effet "template".
- Structure ta sortie en JSON exhaustif, en français.

⚠️ IMPORTANT: Réponds SEULEMENT avec le JSON, aucun autre texte.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un expert en analyse de marque et génération de campagnes marketing de niveau studio professionnel. Tu analyses les sites web pour comprendre l\'univers visuel, la tonalité et la charte graphique des marques. Tu génères des campagnes sans effet générique ou IA. Réponds UNIQUEMENT avec du JSON valide, aucun texte supplémentaire.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log('🤖 Raw AI response:', content);
  
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
    
    console.log('🧹 Cleaned JSON content:', jsonContent);
    
    const parsedResult = JSON.parse(jsonContent);
    console.log('✅ Successfully parsed professional campaign:', parsedResult);
    
    return parsedResult;
  } catch (e) {
    console.error('❌ Failed to parse professional campaign. Raw content:', content);
    console.error('Parse error:', e);
    
    // Fallback avec du contenu professionnel par défaut
    return {
      palette_couleurs: [
        { nom: "Bleu identité", hexa: "#006799" },
        { nom: "Blanc pur", hexa: "#FFFFFF" },
        { nom: "Bleu accent", hexa: "#35A7FF" }
      ],
      polices: [
        { nom: "Montserrat", utilisation: "Titres" },
        { nom: "Roboto", utilisation: "Texte courant" }
      ],
      ambiance_et_keywords: ["professionnel", "moderne", "digital", "engagement"],
      extrait_du_ton_editorial: "Ton professionnel et engageant, adapté au digital moderne.",
      slogan_officiel: null,
      wording_jeu_concours: {
        titre: "Participez à notre grand jeu concours !",
        sous_titre: "Une expérience unique vous attend",
        mecanique: "Tournez la roue pour découvrir votre cadeau",
        avantage_client: "Des prix exceptionnels à gagner chaque jour !",
        call_to_action: "Je joue maintenant"
      },
      structure_visuelle: {
        format_pc_16_9: {
          logo: "En haut à gauche, bien visible sur fond contrasté",
          image_fond: "En pleine largeur, avec overlay léger pour lisibilité",
          emplacements_textes: {
            titre: "Centré en haut, grande taille impactante",
            sous_titre: "Sous le titre, taille moyenne",
            mecanique: "Centre de l'écran, bien visible",
            avantage_client: "En bas à droite, mise en valeur",
            call_to_action: "Bouton proéminent en bas au centre"
          }
        },
        format_tablette: {
          logo: "En haut à gauche, taille adaptée",
          image_fond: "Pleine largeur, overlay adapté",
          emplacements_textes: {
            titre: "Centré, taille adaptée à l'écran",
            sous_titre: "Sous le titre, bien espacé",
            mecanique: "Centre, lisibilité optimisée",
            avantage_client: "En bas, bien visible",
            call_to_action: "Bouton central, taille optimale"
          }
        },
        format_mobile_9_16: {
          logo: "En haut, centré ou à gauche",
          image_fond: "Pleine hauteur, optimisé mobile",
          emplacements_textes: {
            titre: "Haut de l'écran, lecture verticale",
            sous_titre: "Sous le titre, compact",
            mecanique: "Milieu d'écran, concis",
            avantage_client: "Vers le bas, accrocheur",
            call_to_action: "Bouton fixe en bas d'écran"
          }
        }
      },
      commentaires_design: "Maintenir la cohérence de marque, éviter l'effet template générique, optimiser la lisibilité sur tous supports."
    };
  }
}

function transformToLegacyFormat(professionalCampaign: ProfessionalCampaignResult, request: StudioCampaignRequest) {
  // Extraire la couleur primaire (première couleur de la palette)
  const primaryColor = professionalCampaign.palette_couleurs[0]?.hexa || '#006799';
  const secondaryColor = professionalCampaign.palette_couleurs[1]?.hexa || '#FFFFFF';
  const accentColor = professionalCampaign.palette_couleurs[2]?.hexa || '#35A7FF';
  
  // Extraire la police principale
  const fontFamily = professionalCampaign.polices[0]?.nom || 'Montserrat';

  return {
    // Nouveau format professionnel complet
    professionalData: professionalCampaign,
    
    // Format legacy pour compatibilité
    brandAnalysis: {
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      brandName: 'Marque',
      industry: professionalCampaign.ambiance_et_keywords[0] || 'général',
      tone: professionalCampaign.extrait_du_ton_editorial
    },
    content: {
      title: professionalCampaign.wording_jeu_concours.titre,
      subtitle: professionalCampaign.wording_jeu_concours.sous_titre,
      callToAction: professionalCampaign.wording_jeu_concours.call_to_action,
      description: professionalCampaign.wording_jeu_concours.avantage_client,
      visualStyle: {
        typography: fontFamily,
        layout: professionalCampaign.structure_visuelle.format_pc_16_9.emplacements_textes.titre,
        effectsAndShadows: professionalCampaign.commentaires_design
      }
    },
    design: {
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      backgroundImageUrl: request.backgroundImageUrl,
      logoUrl: request.logoUrl,
    }
  };
}