
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
    CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'ended', 'archived');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_type') THEN
    CREATE TYPE game_type AS ENUM ('wheel', 'quiz', 'contest', 'survey', 'jackpot', 'dice');
  END IF;
END $$;

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type game_type NOT NULL DEFAULT 'wheel',
  status campaign_status NOT NULL DEFAULT 'draft',
  
  -- Configuration
  config JSONB NOT NULL DEFAULT '{}',
  game_config JSONB NOT NULL DEFAULT '{}',
  design JSONB NOT NULL DEFAULT '{}',
  form_fields JSONB NOT NULL DEFAULT '[]',
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Media
  thumbnail_url TEXT,
  banner_url TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Stats cache
  total_participants INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0
);

-- Create participations table
CREATE TABLE public.participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- User data
  user_email TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  
  -- Tracking
  ip_address INET,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Game result
  game_result JSONB,
  is_winner BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate participations per campaign
  UNIQUE(campaign_id, user_email)
);

-- Create campaign views table for analytics
CREATE TABLE public.campaign_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Tracking data
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaign stats table for aggregated data
CREATE TABLE public.campaign_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Date for daily aggregation
  date DATE NOT NULL,
  
  -- Metrics
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  participations INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Updated timestamp
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per campaign per day
  UNIQUE(campaign_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Public can view published campaigns"
  ON public.campaigns
  FOR SELECT
  USING (status IN ('active', 'ended'));

CREATE POLICY "Users can manage their own campaigns"
  ON public.campaigns
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for participations
CREATE POLICY "Public can create participations"
  ON public.participations
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Campaign owners can view participations"
  ON public.participations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = participations.campaign_id 
      AND campaigns.created_by = auth.uid()
    )
  );

-- RLS Policies for campaign views
CREATE POLICY "Public can create views"
  ON public.campaign_views
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Campaign owners can view analytics"
  ON public.campaign_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_views.campaign_id 
      AND campaigns.created_by = auth.uid()
    )
  );

-- RLS Policies for campaign stats
CREATE POLICY "Campaign owners can view stats"
  ON public.campaign_stats
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_stats.campaign_id 
      AND campaigns.created_by = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_campaigns_slug ON public.campaigns(slug);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX idx_participations_campaign_id ON public.participations(campaign_id);
CREATE INDEX idx_participations_email ON public.participations(user_email);
CREATE INDEX idx_campaign_views_campaign_id ON public.campaign_views(campaign_id);
CREATE INDEX idx_campaign_views_date ON public.campaign_views(viewed_at);
CREATE INDEX idx_campaign_stats_campaign_date ON public.campaign_stats(campaign_id, date);

-- Function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_campaign_slug(campaign_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from campaign name
  base_slug := regexp_replace(
    regexp_replace(
      regexp_replace(lower(campaign_name), '[àáâãäå]', 'a', 'g'),
      '[èéêë]', 'e', 'g'
    ),
    '[^a-z0-9]+', '-', 'g'
  );
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is unique
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.campaigns WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to update campaign stats
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update participation count for campaigns table
  IF TG_TABLE_NAME = 'participations' THEN
    UPDATE public.campaigns 
    SET total_participants = (
      SELECT COUNT(*) FROM public.participations 
      WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- Update view count for campaigns table  
  IF TG_TABLE_NAME = 'campaign_views' THEN
    UPDATE public.campaigns 
    SET total_views = (
      SELECT COUNT(*) FROM public.campaign_views 
      WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_campaign_participant_count
  AFTER INSERT OR DELETE ON public.participations
  FOR EACH ROW EXECUTE FUNCTION update_campaign_stats();

CREATE TRIGGER update_campaign_view_count
  AFTER INSERT ON public.campaign_views
  FOR EACH ROW EXECUTE FUNCTION update_campaign_stats();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('campaign-assets', 'campaign-assets', true),
  ('campaign-thumbnails', 'campaign-thumbnails', true);

-- Storage policies
CREATE POLICY "Public can view campaign assets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('campaign-assets', 'campaign-thumbnails'));

CREATE POLICY "Authenticated users can upload campaign assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('campaign-assets', 'campaign-thumbnails'));

CREATE POLICY "Users can update their own campaign assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('campaign-assets', 'campaign-thumbnails'));
