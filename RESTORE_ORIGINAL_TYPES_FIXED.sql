-- Restore original campaign types based on campaign names
-- This will undo the changes made by FIX_QUIZ_CAMPAIGN_TYPE.sql
-- FIXED: Removed 'swiper' which is not a valid enum value

-- Restore wheel/roue campaigns
UPDATE campaigns
SET type = 'wheel'
WHERE type = 'quiz'
AND (
  LOWER(name) LIKE '%roue%'
  OR LOWER(name) LIKE '%wheel%'
);

-- Restore jackpot campaigns
UPDATE campaigns
SET type = 'jackpot'
WHERE type = 'quiz'
AND (
  LOWER(name) LIKE '%jackpot%'
  OR LOWER(name) LIKE '%jack%'
);

-- Restore scratch campaigns
UPDATE campaigns
SET type = 'scratch'
WHERE type = 'quiz'
AND (
  LOWER(name) LIKE '%scratch%'
);

-- Verify the changes
SELECT 
  id,
  name,
  type,
  updated_at
FROM campaigns
WHERE name IN (
  'Nouveau Jackpot',
  'LA ROUE TEST',
  'roue test',
  'SCRATCHYY',
  'FS JACK JACK',
  'jackpot fs',
  'SCRATCH QUIZ',
  'SCRATCH FS'
)
ORDER BY name;
