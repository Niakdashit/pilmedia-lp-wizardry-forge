-- Migration partie 2: Corriger les types de campagnes existantes

-- Mettre à jour les campagnes avec le bon type basé sur leur nom
UPDATE public.campaigns
SET type = CASE
  -- Détecter Scratch
  WHEN name ~* 'scratch|gratt' THEN 'scratch'::game_type
  
  -- Détecter Jackpot
  WHEN name ~* 'jackpot' THEN 'jackpot'::game_type
  
  -- Détecter Quiz
  WHEN name ~* 'quiz|questionnaire' THEN 'quiz'::game_type
  
  -- Détecter Form
  WHEN name ~* 'form|formulaire|contact' THEN 'form'::game_type
  
  -- Garder le type actuel par défaut
  ELSE type
END
WHERE type = 'wheel' 
  AND name IS NOT NULL
  AND name != ''
  AND (
    name ~* 'scratch|gratt|jackpot|quiz|questionnaire|form|formulaire|contact'
  );

-- Convertir les anciennes campagnes 'dice' vers 'scratch'
UPDATE public.campaigns
SET type = 'scratch'::game_type
WHERE type = 'dice';