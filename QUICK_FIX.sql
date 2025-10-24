-- Quick fix for RLS policies on campaigns
BEGIN;

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

-- Insert into migration history
INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
VALUES 
  ('20251024120000', ARRAY['-- Fixed RLS policies'], 'fix_campaigns_insert_policy')
ON CONFLICT (version) DO NOTHING;

COMMIT;
