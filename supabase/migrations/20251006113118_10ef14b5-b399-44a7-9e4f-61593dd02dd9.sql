-- Fix security issues in database functions by adding SET search_path

-- Update generate_campaign_slug function with security improvements
CREATE OR REPLACE FUNCTION public.generate_campaign_slug(campaign_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = public, pg_temp
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Validate input
  IF campaign_name IS NULL OR campaign_name = '' THEN
    RAISE EXCEPTION 'Campaign name cannot be empty';
  END IF;
  
  -- Limit length to prevent DoS
  IF length(campaign_name) > 200 THEN
    campaign_name := substring(campaign_name, 1, 200);
  END IF;
  
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
    -- Prevent infinite loops
    IF counter > 1000 THEN
      RAISE EXCEPTION 'Unable to generate unique slug';
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Update update_campaign_stats trigger function with security improvements
CREATE OR REPLACE FUNCTION public.update_campaign_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Update participation count for campaigns table
  IF TG_TABLE_NAME = 'participations' THEN
    UPDATE public.campaigns 
    SET total_participants = (
      SELECT COUNT(*) 
      FROM public.participations 
      WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- Update view count for campaigns table  
  IF TG_TABLE_NAME = 'campaign_views' THEN
    UPDATE public.campaigns 
    SET total_views = (
      SELECT COUNT(*) 
      FROM public.campaign_views 
      WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$function$;