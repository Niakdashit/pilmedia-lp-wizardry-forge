-- ============================================
-- FIX RLS POLICY FOR CAMPAIGNS INSERT
-- ============================================
-- INSTRUCTIONS:
-- 1. Allez sur https://supabase.com/dashboard
-- 2. Sélectionnez votre projet
-- 3. Allez dans SQL Editor
-- 4. Copiez-collez ce script complet
-- 5. Cliquez sur "Run"
-- ============================================

BEGIN;

-- Drop the old policy that was blocking INSERT
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;

-- Create separate policies for better clarity and control

-- 1. Allow authenticated users to INSERT campaigns (will be owned by them)
CREATE POLICY "Users can create campaigns"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- 2. Allow users to SELECT their own campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- 3. Allow users to UPDATE their own campaigns
CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Note: DELETE policy already exists from migration 20251024111500
-- Note: Public access policy already exists for published campaigns

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify policies are correctly set:
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'campaigns'
ORDER BY cmd, policyname;

-- Expected result: You should see 5-6 policies including:
-- - "Users can create campaigns" (INSERT)
-- - "Users can view their own campaigns" (SELECT)
-- - "Users can update their own campaigns" (UPDATE)
-- - "Campaign owners can delete campaigns" (DELETE)
-- - "Public can view published campaigns" (SELECT)
-- - "Admins can manage campaigns" (ALL)
