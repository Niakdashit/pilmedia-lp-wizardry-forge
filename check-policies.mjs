import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmkwascgjntopgkbmctv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Besoin de SUPABASE_SERVICE_KEY ou VITE_SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Vérification des policies sur la table campaigns...\n');

const { data, error } = await supabase
  .from('campaigns')
  .select('id')
  .limit(1);

if (error) {
  console.log('❌ Erreur lors de la requête SELECT:', error.message);
  console.log('Code:', error.code);
  console.log('\n📋 Cela confirme le problème RLS!');
} else {
  console.log('✅ SELECT fonctionne, policies OK pour SELECT');
  console.log('Data:', data);
}

// Test INSERT
console.log('\n🧪 Test d\'insertion...');
const testCampaign = {
  name: 'Test Campaign RLS',
  slug: `test-rls-${Date.now()}`,
  type: 'wheel',
  status: 'draft'
};

const { data: insertData, error: insertError } = await supabase
  .from('campaigns')
  .insert(testCampaign)
  .select();

if (insertError) {
  console.log('❌ INSERT échoue:', insertError.message);
  console.log('Code:', insertError.code);
  console.log('\n🔴 PROBLÈME CONFIRMÉ: Les policies INSERT sont défaillantes!');
} else {
  console.log('✅ INSERT réussi!', insertData);
}
