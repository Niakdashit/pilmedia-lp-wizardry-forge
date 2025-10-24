-- Ajoute les colonnes attendues par useCampaignSettings (JSONB)
-- Sans casser le schéma actuel basé sur des colonnes scalaires

ALTER TABLE campaign_settings
  ADD COLUMN IF NOT EXISTS publication jsonb,
  ADD COLUMN IF NOT EXISTS soft_gate jsonb,
  ADD COLUMN IF NOT EXISTS limits jsonb,
  ADD COLUMN IF NOT EXISTS email_verification jsonb,
  ADD COLUMN IF NOT EXISTS legal jsonb,
  ADD COLUMN IF NOT EXISTS winners jsonb,
  ADD COLUMN IF NOT EXISTS output jsonb,
  ADD COLUMN IF NOT EXISTS data_push jsonb,
  ADD COLUMN IF NOT EXISTS advanced jsonb,
  ADD COLUMN IF NOT EXISTS opt_in jsonb,
  ADD COLUMN IF NOT EXISTS tags text[];

-- Index léger sur campaign_id déjà créé, rien à faire ici.
-- RLS/Policies existent déjà, pas besoin d'ajouts.

COMMENT ON COLUMN campaign_settings.publication IS 'Bloc JSON pour dates/horaires/visibilité';
COMMENT ON COLUMN campaign_settings.soft_gate IS 'Paramètres soft gate (préliminaire)';
COMMENT ON COLUMN campaign_settings.limits IS 'Limites d''utilisation';
COMMENT ON COLUMN campaign_settings.email_verification IS 'Paramètres de vérification email';
COMMENT ON COLUMN campaign_settings.legal IS 'Mentions légales / RGPD';
COMMENT ON COLUMN campaign_settings.winners IS 'Gestion des gagnants';
COMMENT ON COLUMN campaign_settings.output IS 'Sorties / intégrations';
COMMENT ON COLUMN campaign_settings.data_push IS 'Poussoir de données';
COMMENT ON COLUMN campaign_settings.advanced IS 'Paramètres avancés';
COMMENT ON COLUMN campaign_settings.opt_in IS 'Opt-in marketing';
COMMENT ON COLUMN campaign_settings.tags IS 'Tags de la campagne';
