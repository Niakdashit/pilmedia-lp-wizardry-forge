-- Migration: Enrichir les données de tracking pour analytics niveau Qualifio
-- Objectif: Ajouter des colonnes enrichies et créer une table d'interactions

-- 1. Ajouter des colonnes enrichies à campaign_views
ALTER TABLE campaign_views
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS screen_resolution TEXT,
ADD COLUMN IF NOT EXISTS viewport_size TEXT,
ADD COLUMN IF NOT EXISTS time_on_page INTEGER, -- en secondes
ADD COLUMN IF NOT EXISTS max_scroll_depth INTEGER; -- pourcentage (0-100)

-- 2. Ajouter index pour améliorer les requêtes analytics
CREATE INDEX IF NOT EXISTS idx_campaign_views_device_type ON campaign_views(device_type);
CREATE INDEX IF NOT EXISTS idx_campaign_views_browser ON campaign_views(browser);
CREATE INDEX IF NOT EXISTS idx_campaign_views_utm_source ON campaign_views(utm_source);
CREATE INDEX IF NOT EXISTS idx_campaign_views_viewed_at ON campaign_views(viewed_at DESC);

-- 3. Créer une table pour les interactions détaillées
CREATE TABLE IF NOT EXISTS campaign_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL, -- 'click', 'scroll', 'form_focus', 'form_blur', 'game_start', 'game_complete', etc.
  event_data JSONB DEFAULT '{}'::jsonb,
  element_id TEXT,
  element_type TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  
  CONSTRAINT fk_campaign_interactions_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Index pour les requêtes analytics d'interactions
CREATE INDEX IF NOT EXISTS idx_interactions_campaign_id ON campaign_interactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_interactions_event_type ON campaign_interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON campaign_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON campaign_interactions(session_id);

-- 4. Ajouter des métriques enrichies aux participations
ALTER TABLE participations
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS time_to_complete INTEGER, -- temps pour compléter le formulaire en secondes
ADD COLUMN IF NOT EXISTS form_interactions JSONB DEFAULT '{}'::jsonb; -- données de tracking du formulaire

-- Index pour les participations
CREATE INDEX IF NOT EXISTS idx_participations_device_type ON participations(device_type);
CREATE INDEX IF NOT EXISTS idx_participations_created_at ON participations(created_at DESC);

-- 5. RLS policies pour campaign_interactions
ALTER TABLE campaign_interactions ENABLE ROW LEVEL SECURITY;

-- Les propriétaires de campagne peuvent voir les interactions de leurs campagnes
CREATE POLICY "Campaign owners can view interactions"
ON campaign_interactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_interactions.campaign_id
    AND campaigns.created_by = auth.uid()
  )
);

-- Tout le monde peut créer des interactions (anonymes)
CREATE POLICY "Anyone can create interactions"
ON campaign_interactions
FOR INSERT
WITH CHECK (true);

-- 6. Fonction pour calculer les statistiques enrichies
CREATE OR REPLACE FUNCTION get_campaign_analytics(p_campaign_id UUID, p_start_date DATE DEFAULT NULL, p_end_date DATE DEFAULT NULL)
RETURNS TABLE (
  total_views BIGINT,
  unique_ips BIGINT,
  total_participations BIGINT,
  avg_time_on_page NUMERIC,
  avg_scroll_depth NUMERIC,
  device_breakdown JSONB,
  browser_breakdown JSONB,
  utm_source_breakdown JSONB,
  hourly_distribution JSONB,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH view_stats AS (
    SELECT 
      COUNT(*) as views,
      COUNT(DISTINCT ip_address) as unique_ips,
      AVG(time_on_page) as avg_time,
      AVG(max_scroll_depth) as avg_scroll,
      jsonb_object_agg(
        COALESCE(device_type, 'unknown'), 
        COUNT(*)
      ) FILTER (WHERE device_type IS NOT NULL) as devices,
      jsonb_object_agg(
        COALESCE(browser, 'unknown'), 
        COUNT(*)
      ) FILTER (WHERE browser IS NOT NULL) as browsers,
      jsonb_object_agg(
        COALESCE(utm_source, 'direct'), 
        COUNT(*)
      ) FILTER (WHERE utm_source IS NOT NULL OR utm_source IS NULL) as utm_sources,
      jsonb_object_agg(
        EXTRACT(HOUR FROM viewed_at)::TEXT, 
        COUNT(*)
      ) as hourly
    FROM campaign_views
    WHERE campaign_id = p_campaign_id
    AND (p_start_date IS NULL OR viewed_at::DATE >= p_start_date)
    AND (p_end_date IS NULL OR viewed_at::DATE <= p_end_date)
  ),
  participation_stats AS (
    SELECT COUNT(*) as participations
    FROM participations
    WHERE campaign_id = p_campaign_id
    AND (p_start_date IS NULL OR created_at::DATE >= p_start_date)
    AND (p_end_date IS NULL OR created_at::DATE <= p_end_date)
  )
  SELECT 
    v.views,
    v.unique_ips,
    p.participations,
    ROUND(v.avg_time, 2),
    ROUND(v.avg_scroll, 2),
    COALESCE(v.devices, '{}'::jsonb),
    COALESCE(v.browsers, '{}'::jsonb),
    COALESCE(v.utm_sources, '{}'::jsonb),
    COALESCE(v.hourly, '{}'::jsonb),
    CASE 
      WHEN v.views > 0 THEN ROUND((p.participations::NUMERIC / v.views::NUMERIC) * 100, 2)
      ELSE 0
    END
  FROM view_stats v, participation_stats p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;