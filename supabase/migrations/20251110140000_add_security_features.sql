-- Migration: Ajout des fonctionnalités de sécurité
-- Date: 2025-11-10
-- Description: Ajoute device fingerprinting, security logs, et contraintes de sécurité

-- 1. Ajouter device_fingerprint à participations
ALTER TABLE participations 
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

-- 2. Modifier ip_address pour utiliser TEXT au lieu de INET (plus flexible)
DO $$ 
BEGIN
    -- Vérifier si la colonne existe et son type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participations' 
        AND column_name = 'ip_address'
        AND data_type = 'inet'
    ) THEN
        -- Convertir de INET à TEXT
        ALTER TABLE participations 
        ALTER COLUMN ip_address TYPE TEXT USING ip_address::TEXT;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participations' 
        AND column_name = 'ip_address'
    ) THEN
        -- Créer la colonne si elle n'existe pas
        ALTER TABLE participations 
        ADD COLUMN ip_address TEXT;
    END IF;
END $$;

-- 3. Index pour rate limiting (optimisation des requêtes)
CREATE INDEX IF NOT EXISTS idx_participations_campaign_ip_created 
ON participations(campaign_id, ip_address, created_at)
WHERE ip_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_participations_campaign_email_created 
ON participations(campaign_id, user_email, created_at)
WHERE user_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_participations_device_fingerprint 
ON participations(device_fingerprint)
WHERE device_fingerprint IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_participations_campaign_device_created 
ON participations(campaign_id, device_fingerprint, created_at)
WHERE device_fingerprint IS NOT NULL;

-- 4. Contrainte unique: 1 participation par email par campagne
-- Utiliser un index unique partiel pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_participation_email 
ON participations(campaign_id, user_email)
WHERE user_email IS NOT NULL AND user_email != '';

-- 5. Table pour logs de sécurité
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'rate_limit_exceeded', 'suspicious_activity', 'blocked_ip', etc.
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  ip_address TEXT,
  device_fingerprint TEXT,
  email TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour security_logs
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_campaign ON security_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_logs_email ON security_logs(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);

-- 6. Activer RLS sur security_logs
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- 7. Politiques RLS pour security_logs
-- Seuls les propriétaires de campagne peuvent lire les logs
DROP POLICY IF EXISTS "Campaign owners can read security logs" ON security_logs;
CREATE POLICY "Campaign owners can read security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = security_logs.campaign_id 
      AND campaigns.created_by = auth.uid()
    )
  );

-- Permettre l'insertion pour tous (système de sécurité)
DROP POLICY IF EXISTS "System can create security logs" ON security_logs;
CREATE POLICY "System can create security logs"
  ON security_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 8. Fonction pour nettoyer les anciens logs (> 90 jours)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Commentaires pour documentation
COMMENT ON TABLE security_logs IS 'Logs de sécurité pour tracking des tentatives suspectes et rate limiting';
COMMENT ON COLUMN participations.device_fingerprint IS 'Empreinte unique de l''appareil pour détecter les multi-comptes';
COMMENT ON COLUMN participations.ip_address IS 'Adresse IP publique du participant';

-- 10. Vue pour statistiques de sécurité par campagne
CREATE OR REPLACE VIEW campaign_security_stats AS
SELECT 
  c.id AS campaign_id,
  c.name AS campaign_name,
  COUNT(DISTINCT p.user_email) AS unique_participants,
  COUNT(DISTINCT p.ip_address) AS unique_ips,
  COUNT(DISTINCT p.device_fingerprint) AS unique_devices,
  COUNT(p.id) AS total_participations,
  COALESCE(sl.blocked_attempts, 0) AS blocked_attempts,
  ROUND(
    CASE 
      WHEN COUNT(p.id) > 0 
      THEN (COALESCE(sl.blocked_attempts, 0)::DECIMAL / COUNT(p.id)) * 100 
      ELSE 0 
    END, 
    2
  ) AS block_rate_percent
FROM campaigns c
LEFT JOIN participations p ON p.campaign_id = c.id
LEFT JOIN (
  SELECT 
    campaign_id, 
    COUNT(*) AS blocked_attempts
  FROM security_logs
  WHERE event_type = 'rate_limit_exceeded'
  GROUP BY campaign_id
) sl ON sl.campaign_id = c.id
GROUP BY c.id, c.name, sl.blocked_attempts;

COMMENT ON VIEW campaign_security_stats IS 'Statistiques de sécurité agrégées par campagne';

-- 11. Fonction pour détecter les comportements suspects
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
  p_campaign_id UUID,
  p_ip_address TEXT,
  p_device_fingerprint TEXT
) RETURNS TABLE (
  is_suspicious BOOLEAN,
  reason TEXT,
  risk_score INTEGER
) AS $$
DECLARE
  v_ip_count INTEGER;
  v_device_count INTEGER;
  v_risk_score INTEGER := 0;
  v_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Compter participations depuis cette IP (dernières 24h)
  SELECT COUNT(*) INTO v_ip_count
  FROM participations
  WHERE campaign_id = p_campaign_id
    AND ip_address = p_ip_address
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Compter participations depuis ce device (dernières 24h)
  SELECT COUNT(*) INTO v_device_count
  FROM participations
  WHERE campaign_id = p_campaign_id
    AND device_fingerprint = p_device_fingerprint
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Calculer le score de risque
  IF v_ip_count > 5 THEN
    v_risk_score := v_risk_score + 30;
    v_reasons := array_append(v_reasons, 'IP abuse: ' || v_ip_count || ' participations');
  END IF;
  
  IF v_device_count > 3 THEN
    v_risk_score := v_risk_score + 40;
    v_reasons := array_append(v_reasons, 'Device abuse: ' || v_device_count || ' participations');
  END IF;
  
  -- Vérifier si IP ou device est déjà bloqué
  IF EXISTS (
    SELECT 1 FROM security_logs
    WHERE (ip_address = p_ip_address OR device_fingerprint = p_device_fingerprint)
      AND event_type IN ('blocked_ip', 'blocked_device')
      AND created_at > NOW() - INTERVAL '7 days'
  ) THEN
    v_risk_score := v_risk_score + 50;
    v_reasons := array_append(v_reasons, 'Previously blocked');
  END IF;
  
  RETURN QUERY SELECT 
    v_risk_score > 50,
    array_to_string(v_reasons, '; '),
    v_risk_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION detect_suspicious_activity IS 'Détecte les comportements suspects basés sur IP et device fingerprint';

-- 12. Trigger pour logger automatiquement les tentatives de participation
CREATE OR REPLACE FUNCTION log_participation_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'insertion échoue à cause de la contrainte unique, logger
  -- (Ceci sera appelé avant l'insertion)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Le trigger sera ajouté si nécessaire

-- 13. Afficher un résumé de la migration
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📊 Added columns: device_fingerprint to participations';
  RAISE NOTICE '🔒 Created table: security_logs';
  RAISE NOTICE '📈 Created view: campaign_security_stats';
  RAISE NOTICE '🛡️ Added security indexes and constraints';
  RAISE NOTICE '⚙️ Created security functions: detect_suspicious_activity, cleanup_old_security_logs';
END $$;
