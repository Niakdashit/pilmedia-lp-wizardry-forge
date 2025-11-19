import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  user_id: string;
  request_type: string;
  status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting GDPR export processing...');

    // Récupérer toutes les demandes d'export en attente
    const { data: pendingRequests, error: fetchError } = await supabase
      .from('gdpr_requests')
      .select('*')
      .eq('request_type', 'export')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching pending requests:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${pendingRequests?.length || 0} pending export requests`);

    if (!pendingRequests || pendingRequests.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending export requests', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let processedCount = 0;
    let errorCount = 0;

    // Traiter chaque demande
    for (const request of pendingRequests as ExportRequest[]) {
      try {
        console.log(`📦 Processing export for user ${request.user_id}...`);

        // Marquer comme en cours de traitement
        await supabase
          .from('gdpr_requests')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', (request as any).id);

        // Appeler la fonction DB pour générer l'export
        const { data: exportData, error: exportError } = await supabase
          .rpc('get_user_data_export', { target_user_id: request.user_id });

        if (exportError) {
          console.error(`❌ Error generating export for user ${request.user_id}:`, exportError);
          throw exportError;
        }

        console.log(`✅ Export generated for user ${request.user_id}`);

        // Créer un fichier JSON dans le storage
        const fileName = `exports/${request.user_id}/${Date.now()}_export.json`;
        const { error: uploadError } = await supabase.storage
          .from('campaign-assets')
          .upload(fileName, JSON.stringify(exportData, null, 2), {
            contentType: 'application/json',
            upsert: false
          });

        if (uploadError) {
          console.error(`❌ Error uploading export file:`, uploadError);
          throw uploadError;
        }

        // Générer l'URL publique (expire dans 7 jours)
        const { data: urlData } = await supabase.storage
          .from('campaign-assets')
          .createSignedUrl(fileName, 7 * 24 * 60 * 60); // 7 jours en secondes

        console.log(`📤 Export file uploaded: ${fileName}`);

        // Mettre à jour la demande avec l'URL
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await supabase
          .from('gdpr_requests')
          .update({
            status: 'completed',
            export_url: urlData?.signedUrl || null,
            export_expires_at: expiresAt.toISOString(),
            completed_at: new Date().toISOString()
          })
          .eq('id', (request as any).id);

        console.log(`✅ Export completed for user ${request.user_id}`);
        processedCount++;

      } catch (error) {
        console.error(`❌ Error processing export for user ${request.user_id}:`, error);
        errorCount++;

        // Marquer comme erreur
        await supabase
          .from('gdpr_requests')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', (request as any).id);
      }
    }

    console.log(`✅ Processing complete. Success: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        message: 'Export processing completed',
        processed: processedCount,
        errors: errorCount,
        total: pendingRequests.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Fatal error in GDPR export processing:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
