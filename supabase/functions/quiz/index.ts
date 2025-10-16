
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing OPENAI_API_KEY' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
  try {
    const body = await req.json();

    const {
      logoUrl = "",
      desktopVisualUrl = "",
      mobileVisualUrl = "",
      websiteUrl = "",
      productName = "",
      manualContent = ""
    } = body || {};

    // ----- PROMPT RENFORCÉ POUR UNE PERSONNALISATION MAXIMALE -----
    const gptPrompt = `
Tu es un expert en gamification et en génération de quiz pédagogiques interactifs pour des marques.

OBJECTIF :
Analyse au maximum les informations fournies (nom, url, résumé, visuels) pour générer un quiz vraiment personnalisé à la marque/produit.

1️⃣ COMMENCE par ENONCER (en français) :
- Un secteur ou thématique déduit du nom/URL/texte (invente si besoin)
- Un persona/cible principale plausible pour cette marque
- 2-3 éléments différenciants ou valeurs de la marque/du produit (même si tu dois déduire ou inventer à partir des données fournies).
- Liste 3 anecdotes/faits/propriétés spécifiques exploités dans tes questions.

2️⃣ UTILISE impérativement ces éléments DANS TOUT LE QUIZ (questions, choix, feedback, intro, cta).

3️⃣ Structure ta réponse STRICTEMENT en JSON (pas de texte autour), avec CES CHAMPS :
{
  "intro": "Phrase d’intro motivante adaptée à la marque, personnalisée avec la thématique, la cible.",
  "cta": "Libellé du bouton pour lancer le quiz, adapté à la marque/cible",
  "questions": [
    {
      "question": "Texte d’une question contextualisée (utilise le nom, le secteur, anecdotes, valeurs…)",
      "choices": ["Choix n°1", "Choix n°2", "Choix n°3", "Choix n°4"],
      "answer": "Texte du choix correct"
    },
    ...
  ],
  "errorText": "Texte positif personnalisé affiché en cas de mauvaise réponse",
  "successText": "Félicitations personnalisées",
  "explicationsGPT": {
    "secteur": "XX",
    "cible": "XX",
    "valeurs": ["X", "Y"],
    "faits_remarquables": ["X", "Y"],
    "commentaires": "Brève justification de tes choix de questions et d’axes de personnalisation."
  }
}
Si une information n’est pas fournie, invente au mieux. Tu DOIS toujours inclure le champ explicationsGPT. Strictement aucun texte de ta part en dehors de ce JSON.
Informations de contexte :
- Nom du produit/marque : ${productName || "inconnu"}
- URL du site : ${websiteUrl || "non communiqué"}
- (Facultatif) Résumé fourni :
"""
${manualContent}
"""
- Logo : ${logoUrl}
- Visuel desktop : ${desktopVisualUrl}
- Visuel mobile : ${mobileVisualUrl}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'o3-2025-04-16',
        messages: [
          { role: 'system', content: 'Tu es un assistant expert en gamification.' },
          { role: 'user', content: gptPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1400
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    let quizJSON = null;
    try {
      const msg = data.choices?.[0]?.message?.content || "";
      const jsonMatch = msg.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizJSON = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      quizJSON = null;
    }

    return new Response(JSON.stringify(quizJSON || {
      error: "Erreur lors du parsing du quiz généré. Voici la réponse brute de GPT-4o : " + (data.choices?.[0]?.message?.content || "")
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

