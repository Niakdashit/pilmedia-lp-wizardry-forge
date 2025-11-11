-- Migration pour ajouter les détails complets des partenaires médias
-- Emplacements publicitaires, conditions de partenariat, etc.

-- 1. Ajouter des colonnes supplémentaires à media_partners
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS age_range text;
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS gender_distribution jsonb;
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS interests jsonb;
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS rating numeric(2,1);
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS partnerships_count integer DEFAULT 0;
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS member_since date DEFAULT CURRENT_DATE;
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS contact_address text;

-- 2. Table des emplacements publicitaires disponibles
CREATE TABLE IF NOT EXISTS media_ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media_partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  format text, -- '728x90px', '800-1200 mots', etc.
  position text, -- 'Header', 'Section Partenaires', etc.
  estimated_visibility integer, -- Nombre de vues estimées
  available_slots integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Table des conditions de partenariat
CREATE TABLE IF NOT EXISTS media_partnership_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media_partners(id) ON DELETE CASCADE,
  duration_min integer, -- Durée minimale en jours
  duration_max integer, -- Durée maximale en jours
  validation_delay integer, -- Délai de validation en jours
  min_dotation_value numeric(10,2), -- Valeur minimale des dotations
  max_dotation_value numeric(10,2), -- Valeur maximale des dotations
  dotation_types jsonb, -- Types de dotations acceptées
  specific_conditions jsonb, -- Conditions spécifiques
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Activer RLS
ALTER TABLE media_ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_partnership_conditions ENABLE ROW LEVEL SECURITY;

-- 5. Policies pour media_ad_placements
DROP POLICY IF EXISTS "Anyone can view ad placements" ON media_ad_placements;
CREATE POLICY "Anyone can view ad placements"
  ON media_ad_placements FOR SELECT
  TO authenticated
  USING (true);

-- 6. Policies pour media_partnership_conditions
DROP POLICY IF EXISTS "Anyone can view partnership conditions" ON media_partnership_conditions;
CREATE POLICY "Anyone can view partnership conditions"
  ON media_partnership_conditions FOR SELECT
  TO authenticated
  USING (true);

-- 7. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_media_ad_placements_media_id ON media_ad_placements(media_id);
CREATE INDEX IF NOT EXISTS idx_media_partnership_conditions_media_id ON media_partnership_conditions(media_id);

-- 8. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_media_ad_placements_updated_at ON media_ad_placements;
CREATE TRIGGER update_media_ad_placements_updated_at
  BEFORE UPDATE ON media_ad_placements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_partnership_conditions_updated_at ON media_partnership_conditions;
CREATE TRIGGER update_media_partnership_conditions_updated_at
  BEFORE UPDATE ON media_partnership_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
