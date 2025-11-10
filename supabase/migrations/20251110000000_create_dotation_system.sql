-- =====================================================
-- Système d'Attribution des Lots (Dotation)
-- Migration: 20251110000000_create_dotation_system.sql
-- =====================================================

-- Table: dotation_configs
-- Stocke la configuration de dotation pour chaque campagne
CREATE TABLE IF NOT EXISTS public.dotation_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  prizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  global_strategy JSONB DEFAULT NULL,
  anti_fraud JSONB DEFAULT NULL,
  notifications JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT unique_campaign_dotation UNIQUE(campaign_id),
  CONSTRAINT valid_prizes CHECK (jsonb_typeof(prizes) = 'array')
);

-- Index pour recherche rapide par campagne
CREATE INDEX idx_dotation_configs_campaign_id ON public.dotation_configs(campaign_id);

-- Table: attribution_history
-- Historique de toutes les attributions de lots
CREATE TABLE IF NOT EXISTS public.attribution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  prize_id TEXT NOT NULL,
  participant_id UUID DEFAULT NULL,
  participant_email TEXT DEFAULT NULL,
  result JSONB NOT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  device_fingerprint TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_result CHECK (jsonb_typeof(result) = 'object')
);

-- Index pour recherche rapide
CREATE INDEX idx_attribution_history_campaign_id ON public.attribution_history(campaign_id);
CREATE INDEX idx_attribution_history_prize_id ON public.attribution_history(prize_id);
CREATE INDEX idx_attribution_history_participant_email ON public.attribution_history(participant_email);
CREATE INDEX idx_attribution_history_created_at ON public.attribution_history(created_at DESC);
CREATE INDEX idx_attribution_history_ip_address ON public.attribution_history(ip_address);

-- Table: dotation_stats
-- Statistiques de dotation (mise à jour en temps réel)
CREATE TABLE IF NOT EXISTS public.dotation_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  total_prizes INTEGER NOT NULL DEFAULT 0,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  total_awarded INTEGER NOT NULL DEFAULT 0,
  total_remaining INTEGER NOT NULL DEFAULT 0,
  attribution_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_participants INTEGER NOT NULL DEFAULT 0,
  total_winners INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  prize_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT unique_campaign_stats UNIQUE(campaign_id),
  CONSTRAINT valid_prize_stats CHECK (jsonb_typeof(prize_stats) = 'array')
);

-- Index pour recherche rapide
CREATE INDEX idx_dotation_stats_campaign_id ON public.dotation_stats(campaign_id);

-- =====================================================
-- Fonctions Utilitaires
-- =====================================================

-- Fonction: update_dotation_stats
-- Met à jour les statistiques de dotation après chaque attribution
CREATE OR REPLACE FUNCTION public.update_dotation_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_config JSONB;
  v_total_prizes INTEGER;
  v_total_quantity INTEGER;
  v_total_awarded INTEGER;
  v_total_participants INTEGER;
  v_total_winners INTEGER;
BEGIN
  -- Récupérer la configuration de dotation
  SELECT prizes INTO v_config
  FROM public.dotation_configs
  WHERE campaign_id = NEW.campaign_id;
  
  IF v_config IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculer les statistiques
  SELECT 
    jsonb_array_length(v_config),
    COALESCE(SUM((prize->>'totalQuantity')::INTEGER), 0),
    COALESCE(SUM((prize->>'awardedQuantity')::INTEGER), 0)
  INTO v_total_prizes, v_total_quantity, v_total_awarded
  FROM jsonb_array_elements(v_config) AS prize;
  
  -- Compter les participants et gagnants
  SELECT 
    COUNT(DISTINCT participant_email),
    COUNT(DISTINCT CASE WHEN (result->>'isWinner')::BOOLEAN THEN participant_email END)
  INTO v_total_participants, v_total_winners
  FROM public.attribution_history
  WHERE campaign_id = NEW.campaign_id;
  
  -- Mettre à jour ou insérer les statistiques
  INSERT INTO public.dotation_stats (
    campaign_id,
    total_prizes,
    total_quantity,
    total_awarded,
    total_remaining,
    attribution_rate,
    total_participants,
    total_winners,
    win_rate,
    last_updated
  ) VALUES (
    NEW.campaign_id,
    v_total_prizes,
    v_total_quantity,
    v_total_awarded,
    v_total_quantity - v_total_awarded,
    CASE WHEN v_total_quantity > 0 THEN (v_total_awarded::DECIMAL / v_total_quantity * 100) ELSE 0 END,
    v_total_participants,
    v_total_winners,
    CASE WHEN v_total_participants > 0 THEN (v_total_winners::DECIMAL / v_total_participants * 100) ELSE 0 END,
    NOW()
  )
  ON CONFLICT (campaign_id) DO UPDATE SET
    total_prizes = EXCLUDED.total_prizes,
    total_quantity = EXCLUDED.total_quantity,
    total_awarded = EXCLUDED.total_awarded,
    total_remaining = EXCLUDED.total_remaining,
    attribution_rate = EXCLUDED.attribution_rate,
    total_participants = EXCLUDED.total_participants,
    total_winners = EXCLUDED.total_winners,
    win_rate = EXCLUDED.win_rate,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Mise à jour automatique des stats après attribution
CREATE TRIGGER trigger_update_dotation_stats
AFTER INSERT ON public.attribution_history
FOR EACH ROW
EXECUTE FUNCTION public.update_dotation_stats();

-- Fonction: update_dotation_config_timestamp
-- Met à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_dotation_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Mise à jour automatique du timestamp
CREATE TRIGGER trigger_update_dotation_config_timestamp
BEFORE UPDATE ON public.dotation_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_dotation_config_timestamp();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.dotation_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dotation_stats ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres configurations
CREATE POLICY "Users can view their own dotation configs"
ON public.dotation_configs FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE created_by = auth.uid()
  )
);

-- Politique: Les utilisateurs peuvent créer leurs propres configurations
CREATE POLICY "Users can create their own dotation configs"
ON public.dotation_configs FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE created_by = auth.uid()
  )
);

-- Politique: Les utilisateurs peuvent modifier leurs propres configurations
CREATE POLICY "Users can update their own dotation configs"
ON public.dotation_configs FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE created_by = auth.uid()
  )
);

-- Politique: Les utilisateurs peuvent supprimer leurs propres configurations
CREATE POLICY "Users can delete their own dotation configs"
ON public.dotation_configs FOR DELETE
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE created_by = auth.uid()
  )
);

-- Politique: Les utilisateurs peuvent voir l'historique de leurs campagnes
CREATE POLICY "Users can view their own attribution history"
ON public.attribution_history FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE created_by = auth.uid()
  )
);

-- Politique: Le système peut insérer dans l'historique
CREATE POLICY "System can insert attribution history"
ON public.attribution_history FOR INSERT
WITH CHECK (true);

-- Politique: Les utilisateurs peuvent voir les stats de leurs campagnes
CREATE POLICY "Users can view their own dotation stats"
ON public.dotation_stats FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE created_by = auth.uid()
  )
);

-- =====================================================
-- Commentaires
-- =====================================================

COMMENT ON TABLE public.dotation_configs IS 'Configuration de dotation pour chaque campagne';
COMMENT ON TABLE public.attribution_history IS 'Historique de toutes les attributions de lots';
COMMENT ON TABLE public.dotation_stats IS 'Statistiques de dotation en temps réel';

COMMENT ON COLUMN public.dotation_configs.prizes IS 'Liste des lots au format JSON';
COMMENT ON COLUMN public.dotation_configs.global_strategy IS 'Stratégie globale de distribution';
COMMENT ON COLUMN public.dotation_configs.anti_fraud IS 'Paramètres anti-fraude';
COMMENT ON COLUMN public.dotation_configs.notifications IS 'Configuration des notifications';

COMMENT ON COLUMN public.attribution_history.result IS 'Résultat de l''attribution au format JSON';
COMMENT ON COLUMN public.attribution_history.device_fingerprint IS 'Empreinte unique de l''appareil';

-- =====================================================
-- Données de test (optionnel)
-- =====================================================

-- Exemple de configuration de dotation pour tests
-- INSERT INTO public.dotation_configs (campaign_id, prizes) VALUES (
--   'CAMPAIGN_ID_HERE',
--   '[
--     {
--       "id": "prize-1",
--       "name": "iPhone 15 Pro",
--       "totalQuantity": 1,
--       "awardedQuantity": 0,
--       "attribution": {
--         "method": "calendar",
--         "scheduledDate": "2025-12-25",
--         "scheduledTime": "12:00"
--       },
--       "status": "active"
--     }
--   ]'::jsonb
-- );
