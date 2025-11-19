-- Corriger les 4 dernières fonctions avec le warning search_path

-- 1. Fonction increment_campaign_revision
CREATE OR REPLACE FUNCTION public.increment_campaign_revision()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.revision = OLD.revision + 1;
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Fonction auto_create_campaign_snapshot
CREATE OR REPLACE FUNCTION public.auto_create_campaign_snapshot()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (
    OLD.config IS DISTINCT FROM NEW.config OR
    OLD.design IS DISTINCT FROM NEW.design OR
    OLD.game_config IS DISTINCT FROM NEW.game_config OR
    OLD.article_config IS DISTINCT FROM NEW.article_config OR
    OLD.form_fields IS DISTINCT FROM NEW.form_fields
  ) THEN
    INSERT INTO public.campaign_snapshots (
      campaign_id,
      revision,
      config,
      design,
      game_config,
      article_config,
      form_fields,
      snapshot_type,
      created_by,
      payload_size_bytes
    ) VALUES (
      NEW.id,
      NEW.revision,
      NEW.config,
      NEW.design,
      NEW.game_config,
      NEW.article_config,
      NEW.form_fields,
      'auto',
      auth.uid(),
      octet_length(
        COALESCE(NEW.config::text, '') || 
        COALESCE(NEW.design::text, '') || 
        COALESCE(NEW.game_config::text, '') ||
        COALESCE(NEW.article_config::text, '') ||
        COALESCE(NEW.form_fields::text, '')
      )
    )
    ON CONFLICT (campaign_id, revision) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Fonction compute_campaign_status
CREATE OR REPLACE FUNCTION public.compute_campaign_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  is_active_flag boolean;
  now_ts timestamptz;
BEGIN
  now_ts := now();
  
  is_active_flag := COALESCE((NEW.config->>'isActive')::boolean, true);
  
  IF is_active_flag = false THEN
    NEW.status := 'paused'::campaign_status;
  ELSIF NEW.start_date IS NULL OR NEW.end_date IS NULL THEN
    NEW.status := 'draft'::campaign_status;
  ELSIF now_ts < NEW.start_date THEN
    NEW.status := 'draft'::campaign_status;
  ELSIF now_ts >= NEW.start_date AND now_ts <= NEW.end_date THEN
    NEW.status := 'active'::campaign_status;
  ELSE
    NEW.status := 'ended'::campaign_status;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. Fonction log_campaign_action
CREATE OR REPLACE FUNCTION public.log_campaign_action(p_campaign_id uuid, p_action text, p_changes jsonb DEFAULT NULL::jsonb, p_description text DEFAULT NULL::text, p_revision_before integer DEFAULT NULL::integer, p_revision_after integer DEFAULT NULL::integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.campaign_audit_logs (
    campaign_id,
    action,
    changes,
    description,
    revision_before,
    revision_after,
    actor_id,
    actor_email
  ) VALUES (
    p_campaign_id,
    p_action,
    p_changes,
    p_description,
    p_revision_before,
    p_revision_after,
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$function$;