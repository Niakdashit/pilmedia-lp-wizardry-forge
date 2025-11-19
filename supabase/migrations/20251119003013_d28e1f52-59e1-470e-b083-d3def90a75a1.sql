-- Corriger toutes les fonctions restantes

-- 1. generate_campaign_slug
CREATE OR REPLACE FUNCTION public.generate_campaign_slug(campaign_name text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF campaign_name IS NULL OR campaign_name = '' THEN
    RAISE EXCEPTION 'Campaign name cannot be empty';
  END IF;
  
  IF length(campaign_name) > 200 THEN
    campaign_name := substring(campaign_name, 1, 200);
  END IF;
  
  base_slug := regexp_replace(
    regexp_replace(
      regexp_replace(lower(campaign_name), '[àáâãäå]', 'a', 'g'),
      '[èéêë]', 'e', 'g'
    ),
    '[^a-z0-9]+', '-', 'g'
  );
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.campaigns WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
    IF counter > 1000 THEN
      RAISE EXCEPTION 'Unable to generate unique slug';
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- 2. generate_integration_url
CREATE OR REPLACE FUNCTION public.generate_integration_url(_campaign_id uuid, _integration_type text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  campaign_slug TEXT;
  base_url TEXT;
  random_suffix TEXT;
  final_url TEXT;
BEGIN
  SELECT slug INTO campaign_slug
  FROM public.campaigns
  WHERE id = _campaign_id;
  
  IF campaign_slug IS NULL THEN
    RAISE EXCEPTION 'Campaign not found';
  END IF;
  
  random_suffix := substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);
  base_url := 'https://app.leadya.fr/c/';
  final_url := base_url || campaign_slug || '-' || random_suffix;
  
  RETURN final_url;
END;
$function$;

-- 3. cleanup_old_snapshots
CREATE OR REPLACE FUNCTION public.cleanup_old_snapshots(p_keep_count integer DEFAULT 50, p_keep_days integer DEFAULT 90)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_deleted_count integer := 0;
BEGIN
  WITH ranked_snapshots AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY campaign_id 
        ORDER BY revision DESC
      ) as rn,
      created_at
    FROM public.campaign_snapshots
    WHERE snapshot_type = 'auto'
  )
  DELETE FROM public.campaign_snapshots
  WHERE id IN (
    SELECT id FROM ranked_snapshots
    WHERE rn > p_keep_count
    AND created_at < now() - (p_keep_days || ' days')::interval
  );
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$function$;

-- 4. update_campaign_settings_updated_at
CREATE OR REPLACE FUNCTION public.update_campaign_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 5. sync_campaign_dates_from_settings
CREATE OR REPLACE FUNCTION public.sync_campaign_dates_from_settings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  final_start_date timestamp with time zone;
  final_end_date timestamp with time zone;
BEGIN
  final_start_date := NEW.start_date;
  final_end_date := NEW.end_date;
  
  IF final_start_date IS NULL AND NEW.publication IS NOT NULL THEN
    BEGIN
      final_start_date := (NEW.publication->>'start')::timestamp with time zone;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
  
  IF final_end_date IS NULL AND NEW.publication IS NOT NULL THEN
    BEGIN
      final_end_date := (NEW.publication->>'end')::timestamp with time zone;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
  
  UPDATE public.campaigns
  SET 
    start_date = final_start_date,
    end_date = final_end_date,
    updated_at = now()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$function$;