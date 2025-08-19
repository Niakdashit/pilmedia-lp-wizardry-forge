-- Create campaign_settings table to store per-campaign configuration edited in the Campaign Settings UI
-- This matches the fields used by src/hooks/useCampaignSettings.ts

CREATE TABLE IF NOT EXISTS public.campaign_settings (
  campaign_id UUID PRIMARY KEY REFERENCES public.campaigns(id) ON DELETE CASCADE,
  publication JSONB,
  campaign_url JSONB,
  soft_gate JSONB,
  limits JSONB,
  email_verification JSONB,
  legal JSONB,
  winners JSONB,
  data_push JSONB,
  advanced JSONB,
  opt_in JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.campaign_settings ENABLE ROW LEVEL SECURITY;

-- Policies: only the campaign owner (created_by) can read/write their settings
CREATE POLICY IF NOT EXISTS "Campaign owners can view their campaign settings"
  ON public.campaign_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_settings.campaign_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Campaign owners can insert their campaign settings"
  ON public.campaign_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_settings.campaign_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Campaign owners can update their campaign settings"
  ON public.campaign_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_settings.campaign_id
        AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_settings.campaign_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Campaign owners can delete their campaign settings"
  ON public.campaign_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_settings.campaign_id
        AND c.created_by = auth.uid()
    )
  );

-- Helpful index (redundant with PK but future-proof if PK changes)
CREATE INDEX IF NOT EXISTS idx_campaign_settings_campaign_id ON public.campaign_settings(campaign_id);
