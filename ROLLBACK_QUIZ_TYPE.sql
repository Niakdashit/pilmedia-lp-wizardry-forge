-- ROLLBACK: Restore original campaign types
-- WARNING: This will revert the type changes made by FIX_QUIZ_CAMPAIGN_TYPE.sql

-- Option 1: If you know the original type was 'swiper' for these campaigns
-- Uncomment and run this if your quiz campaigns were originally 'swiper' type:
/*
UPDATE campaigns
SET type = 'swiper'
WHERE type = 'quiz'
AND (
  (design->'quizModules' IS NOT NULL)
  OR (config->'modularPage' IS NOT NULL)
);
*/

-- Option 2: Check what campaigns were affected
-- Run this first to see which campaigns were changed:
SELECT 
  id,
  name,
  type,
  created_at,
  updated_at,
  CASE 
    WHEN design->'quizModules' IS NOT NULL THEN 'Has quizModules in design'
    WHEN config->'modularPage' IS NOT NULL THEN 'Has modularPage in config'
    WHEN config->'quiz' IS NOT NULL THEN 'Has quiz in config'
    WHEN game_config->'quiz' IS NOT NULL THEN 'Has quiz in game_config'
    ELSE 'Unknown'
  END as reason
FROM campaigns
WHERE type = 'quiz'
ORDER BY updated_at DESC;

-- Option 3: Restore from a specific backup timestamp
-- If you have a backup, you can restore specific campaigns:
/*
UPDATE campaigns
SET type = 'swiper'  -- or whatever the original type was
WHERE id IN (
  'campaign-id-1',
  'campaign-id-2'
  -- Add the IDs of campaigns you want to restore
);
*/
