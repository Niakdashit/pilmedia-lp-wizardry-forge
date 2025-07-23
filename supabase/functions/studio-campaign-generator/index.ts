
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandAnalysisResult {
  brandName: string;
  industry: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  description: string;
  targetAudience: string;
  marketingGoals: string[];
}

interface GeneratedGameConcept {
  gameType: string;
  theme: string;
  content: {
    title: string;
    subtitle: string;
    description: string;
    callToAction: string;
    wheelSegments?: string[];
    questions?: Array<{
      question: string;
      answers: string[];
      correctAnswer: number;
    }>;
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  marketing: {
    targetAudience: string;
    objective: string;
    tone: string;
  };
}

async function analyzeBrandFromWebsite(websiteUrl: string): Promise<BrandAnalysisResult> {
  console.log('🔍 Analyzing brand from website:', websiteUrl);
  
  // Simuler l'analyse de la marque pour le moment
  // Dans une implémentation complète, on ferait du web scraping
  
  const brandName = new URL(websiteUrl).hostname.replace('www.', '').split('.')[0];
  
  const result = {
    brandName: brandName.charAt(0).toUpperCase() + brandName.slice(1),
    industry: "Services",
    primaryColor: "#0066CC",
    secondaryColor: "#FFD700",
    accentColor: "#FF6B35",
    description: `${brandName} est une marque moderne offrant des services de qualité à ses clients.`,
    targetAudience: "Professionnels et particuliers",
    marketingGoals: ["Augmenter l'engagement", "Générer des leads", "Fidéliser les clients"]
  };

  console.log('✅ Brand analysis result:', result);
  return result;
}

async function generateGameFromBrand(brandData: BrandAnalysisResult, campaignType: string, targetAudience: string, objective: string): Promise<GeneratedGameConcept> {
  console.log('🎮 Generating game concept for:', { brandData, campaignType, targetAudience, objective });

  if (!openAIApiKey) {
    console.error('❌ OpenAI API key not configured');
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `En tant qu'expert en marketing gamifié, crée un concept de jeu marketing de type "${campaignType}" pour la marque ${brandData.brandName}.

Informations sur la marque:
- Nom: ${brandData.brandName}
- Secteur: ${brandData.industry}
- Description: ${brandData.description}
- Audience cible: ${targetAudience}
- Objectif: ${objective}

Crée un jeu marketing ${campaignType} innovant et engageant qui:
1. Reflète l'identité de la marque
2. Attire l'audience cible spécifiée
3. Atteint l'objectif marketing défini
4. Utilise les couleurs appropriées à la marque

Réponds en JSON avec cette structure exacte:
{
  "gameType": "${campaignType}",
  "theme": "thème du jeu",
  "content": {
    "title": "titre accrocheur",
    "subtitle": "sous-titre engageant",
    "description": "description du jeu",
    "callToAction": "bouton d'action",
    ${campaignType === 'wheel' ? '"wheelSegments": ["segment1", "segment2", "segment3", "segment4", "segment5", "segment6"],' : ''}
    ${campaignType === 'quiz' ? '"questions": [{"question": "Question exemple?", "answers": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"], "correctAnswer": 0}],' : ''}
  },
  "design": {
    "primaryColor": "${brandData.primaryColor}",
    "secondaryColor": "${brandData.secondaryColor}",
    "backgroundColor": "#F8F9FA",
    "textColor": "#1F2937",
    "accentColor": "${brandData.accentColor}"
  },
  "marketing": {
    "targetAudience": "${targetAudience}",
    "objective": "${objective}",
    "tone": "tone de communication approprié"
  }
}`;

  try {
    console.log('🤖 Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en marketing digital et gamification. Tu réponds uniquement en JSON valide, sans texte additionnel.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📥 OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const generatedContent = data.choices[0].message.content;
    console.log('📝 Generated content:', generatedContent);
    
    // Nettoyer la réponse pour extraire le JSON
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in OpenAI response:', generatedContent);
      throw new Error('Invalid JSON response from OpenAI');
    }
    
    const parsedResult = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed game concept:', parsedResult);
    
    return parsedResult;
  } catch (error) {
    console.error('❌ Error generating game concept:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Studio Campaign Generator called');

    const { websiteUrl, logoUrl, backgroundImageUrl, campaignType, targetAudience, objective } = await req.json();

    console.log('📋 Request data:', { websiteUrl, logoUrl, backgroundImageUrl, campaignType, targetAudience, objective });

    if (!websiteUrl) {
      return new Response(JSON.stringify({ error: 'Website URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!campaignType) {
      return new Response(JSON.stringify({ error: 'Campaign type is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyser la marque à partir de l'URL du site web
    const brandData = await analyzeBrandFromWebsite(websiteUrl);
    
    // Générer le concept de jeu avec OpenAI
    const gameConcept = await generateGameFromBrand(
      brandData, 
      campaignType, 
      targetAudience || 'clients potentiels', 
      objective || 'engagement et conversion'
    );
    
    // Ajouter les URLs des assets uploadés
    const result = {
      ...gameConcept,
      assets: {
        logoUrl,
        backgroundImageUrl
      },
      brandAnalysis: brandData
    };

    console.log('✅ Generated campaign concept:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error in studio-campaign-generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur lors de la génération du branding'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
