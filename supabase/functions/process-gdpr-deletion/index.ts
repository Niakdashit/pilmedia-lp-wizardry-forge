import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeletionRequest {
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

    console.log('🗑️ Starting GDPR deletion processing...');

    // Récupérer toutes les demandes de suppression en attente
    const { data: pendingRequests, error: fetchError } = await supabase
      .from('gdpr_requests')
      .select('*')
      .eq('request_type', 'deletion')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching pending deletion requests:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${pendingRequests?.length || 0} pending deletion requests`);

    if (!pendingRequests || pendingRequests.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending deletion requests', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let processedCount = 0;
    let errorCount = 0;

    // Traiter chaque demande
    for (const request of pendingRequests as DeletionRequest[]) {
      try {
        console.log(`🗑️ Processing deletion for user ${request.user_id}...`);

        // Marquer comme en cours de traitement
        await supabase
          .from('gdpr_requests')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', (request as any).id);

        // Appeler la fonction DB pour anonymiser les données
        const { data, error: anonymizeError } = await supabase
          .rpc('anonymize_user_data', { target_user_id: request.user_id });

        if (anonymizeError) {
          console.error(`❌ Error anonymizing data for user ${request.user_id}:`, anonymizeError);
          throw anonymizeError;
        }

        console.log(`✅ Data anonymized for user ${request.user_id}`);

        // Logger l'action dans data_processing_log
        await supabase
          .from('data_processing_log')
          .insert({
            user_id: request.user_id,
            action_type: 'deletion',
            table_name: 'multiple',
            action_description: 'User data anonymized following GDPR deletion request',
            performed_by: 'system'
          });

        // Supprimer l'utilisateur de auth.users (si nécessaire)
        // Note: Cela supprimera aussi automatiquement le profil via CASCADE
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
          request.user_id
        );

        if (deleteAuthError) {
          console.warn(`⚠️ Could not delete auth user ${request.user_id}:`, deleteAuthError);
          // On continue quand même, les données sont anonymisées
        }

        // Marquer la demande comme complétée
        await supabase
          .from('gdpr_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', (request as any).id);

        console.log(`✅ Deletion completed for user ${request.user_id}`);
        processedCount++;

      } catch (error) {
        console.error(`❌ Error processing deletion for user ${request.user_id}:`, error);
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
        message: 'Deletion processing completed',
        processed: processedCount,
        errors: errorCount,
        total: pendingRequests.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Fatal error in GDPR deletion processing:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
