-- Fix Quiz campaigns that have wrong type in database
-- This script updates all campaigns that should be 'quiz' type but have a different type

-- Update campaigns that have quiz modules but wrong type
UPDATE campaigns
SET type = 'quiz'
WHERE (
  -- Has quiz modules in design
  (design->'quizModules' IS NOT NULL)
  OR
  -- Has quiz modules in config
  (config->'modularPage' IS NOT NULL)
  OR
  -- Has quiz config
  (config->'quiz' IS NOT NULL)
  OR
  -- Has game_config with quiz data
  (game_config->'quiz' IS NOT NULL)
)
AND type != 'quiz';

-- Log the changes
SELECT 
  id,
  name,
  type,
  created_at
FROM campaigns
WHERE type = 'quiz'
ORDER BY updated_at DESC
LIMIT 20;
