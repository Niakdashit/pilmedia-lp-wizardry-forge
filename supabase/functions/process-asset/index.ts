import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, path, expiresIn } = await req.json();

    if (action === 'signedUrl') {
      // Generate signed URL for private access
      const { data, error } = await supabase.storage
        .from('campaign-assets')
        .createSignedUrl(path, expiresIn || 3600);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ signedUrl: data.signedUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'publicUrl') {
      // Get public URL
      const { data } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(path);

      return new Response(
        JSON.stringify({ publicUrl: data.publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      // Delete asset
      const { error } = await supabase.storage
        .from('campaign-assets')
        .remove([path]);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[process-asset] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
