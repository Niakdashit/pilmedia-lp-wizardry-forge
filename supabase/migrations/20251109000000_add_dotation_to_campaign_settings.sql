-- Migration: Ajouter la colonne dotation à campaign_settings
-- Date: 2025-11-09
-- Description: Ajoute le support du système de double mécanique avec lots programmés

-- Vérifier si la colonne existe déjà avant de l'ajouter
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'campaign_settings' 
        AND column_name = 'dotation'
    ) THEN
        -- Ajouter la colonne dotation (JSONB pour stocker les lots programmés)
        ALTER TABLE public.campaign_settings 
        ADD COLUMN dotation JSONB DEFAULT NULL;

        -- Ajouter un commentaire pour documenter la colonne
        COMMENT ON COLUMN public.campaign_settings.dotation IS 
        'Configuration des lots programmés pour le système de double mécanique. Structure: { timed_prizes: TimedPrize[] }';

        RAISE NOTICE 'Colonne dotation ajoutée avec succès à campaign_settings';
    ELSE
        RAISE NOTICE 'Colonne dotation existe déjà dans campaign_settings';
    END IF;
END $$;

-- Créer un index pour améliorer les performances des requêtes sur dotation
CREATE INDEX IF NOT EXISTS idx_campaign_settings_dotation 
ON public.campaign_settings USING GIN (dotation);

-- Ajouter une contrainte pour valider la structure JSON (optionnel)
-- Vérifie que dotation contient bien un tableau timed_prizes si défini
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'campaign_settings_dotation_check'
    ) THEN
        ALTER TABLE public.campaign_settings
        ADD CONSTRAINT campaign_settings_dotation_check
        CHECK (
            dotation IS NULL OR 
            (
                jsonb_typeof(dotation) = 'object' AND
                (
                    dotation ? 'timed_prizes' = false OR
                    jsonb_typeof(dotation->'timed_prizes') = 'array'
                )
            )
        );
        
        RAISE NOTICE 'Contrainte de validation ajoutée pour dotation';
    ELSE
        RAISE NOTICE 'Contrainte de validation existe déjà pour dotation';
    END IF;
END $$;

-- Exemple de structure de données attendue (commentaire)
/*
Structure attendue pour dotation:
{
  "timed_prizes": [
    {
      "id": "prize-1699876543210",
      "name": "iPhone 15 Pro",
      "description": "Dernier modèle Apple 256GB",
      "date": "2025-11-13",
      "time": "13:54",
      "enabled": true
    }
  ]
}
*/
