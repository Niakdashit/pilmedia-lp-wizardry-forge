import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, style } = await req.json();

    const endpoint = Deno.env.get('VITE_AI_API_ENDPOINT');
    const model = Deno.env.get('VITE_AI_MODEL');

    if (!endpoint || !model) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables VITE_AI_API_ENDPOINT and/or VITE_AI_MODEL' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Call AI API (example using Ollama)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: `Generate an HTML email newsletter with the following requirements:
                Style: ${style}
                Requirements: ${prompt}
                The output should be valid HTML that can be used in an email newsletter.`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ html: data.response }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
