import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://vmkwascgjntopgkbmctv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_KEY or VITE_SUPABASE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;

-- Create separate policies
DROP POLICY IF EXISTS "Users can create campaigns" ON public.campaigns;
CREATE POLICY "Users can create campaigns"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
`;

console.log('🔧 Applying RLS policy fix...');
console.log('📋 SQL to execute:');
console.log(sql);
console.log('\n✅ Policies will be fixed!');
console.log('\n⚠️  Note: This script needs a service_role key to execute DDL statements.');
console.log('Please run this SQL manually in your Supabase Dashboard SQL Editor:');
console.log('\n1. Go to https://supabase.com/dashboard/project/vmkwascgjntopgkbmctv/sql');
console.log('2. Paste the SQL above');
console.log('3. Click "Run"');
