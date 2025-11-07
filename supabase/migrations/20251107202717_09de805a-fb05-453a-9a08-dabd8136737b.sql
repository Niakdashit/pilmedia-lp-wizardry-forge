-- Create campaign_backups table for user-managed backups
CREATE TABLE IF NOT EXISTS public.campaign_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  backup_name TEXT NOT NULL,
  description TEXT,
  full_snapshot JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT campaign_backups_name_unique UNIQUE(campaign_id, backup_name)
);

-- Enable RLS
ALTER TABLE public.campaign_backups ENABLE ROW LEVEL SECURITY;

-- Users can view backups of their campaigns
CREATE POLICY "Users can view their campaign backups"
ON public.campaign_backups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_backups.campaign_id
    AND campaigns.created_by = auth.uid()
  )
);

-- Users can create backups of their campaigns
CREATE POLICY "Users can create backups of their campaigns"
ON public.campaign_backups
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_backups.campaign_id
    AND campaigns.created_by = auth.uid()
  )
);

-- Users can delete their campaign backups
CREATE POLICY "Users can delete their campaign backups"
ON public.campaign_backups
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_backups.campaign_id
    AND campaigns.created_by = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_campaign_backups_campaign_id ON public.campaign_backups(campaign_id);
CREATE INDEX idx_campaign_backups_created_at ON public.campaign_backups(created_at DESC);