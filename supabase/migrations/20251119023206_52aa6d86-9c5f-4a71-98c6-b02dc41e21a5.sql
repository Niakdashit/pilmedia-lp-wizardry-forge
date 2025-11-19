-- Fix: Sécuriser la fonction get_campaign_analytics avec search_path

DROP FUNCTION IF EXISTS get_campaign_analytics(UUID, DATE, DATE);

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;