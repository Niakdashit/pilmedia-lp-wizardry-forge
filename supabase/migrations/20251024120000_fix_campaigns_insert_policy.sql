-- Fix RLS policy to allow INSERT for campaigns
-- The existing policy only had USING which blocks INSERT operations
-- We need WITH CHECK for INSERT to work properly

-- Drop the old policy
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON public.campaigns;

-- Create separate policies for better clarity and control

-- Allow authenticated users to INSERT campaigns (will be owned by them)
CREATE POLICY "Users can create campaigns"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Allow users to SELECT their own campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Allow users to UPDATE their own campaigns
CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE policy already exists in migration 20251024111500
-- "Campaign owners can delete campaigns" handles this

-- Keep public access to published campaigns
-- "Public can view published campaigns" already exists
