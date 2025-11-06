-- ============================================
-- MIGRATION: Add editor_mode and article_config to campaigns
-- ============================================
-- This migration adds support for article mode campaigns
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- Step 1: Add editor_mode column
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS editor_mode TEXT DEFAULT 'fullscreen';

-- Step 2: Add check constraint to ensure only valid values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'campaigns_editor_mode_check'
  ) THEN
    ALTER TABLE public.campaigns 
    ADD CONSTRAINT campaigns_editor_mode_check 
    CHECK (editor_mode IN ('article', 'fullscreen'));
  END IF;
END $$;

-- Step 3: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_editor_mode ON public.campaigns(editor_mode);

-- Step 4: Add article_config column to store article-specific configuration
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS article_config JSONB DEFAULT NULL;

-- Step 5: Add comments for documentation
COMMENT ON COLUMN public.campaigns.editor_mode IS 'Editor mode: article (for article-style campaigns) or fullscreen (for traditional campaigns)';
COMMENT ON COLUMN public.campaigns.article_config IS 'Article-specific configuration (banner, content, etc.) - only used when editor_mode is article';

-- Step 6: Verify the changes
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
  AND column_name IN ('editor_mode', 'article_config')
ORDER BY column_name;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '   - Added editor_mode column (default: fullscreen)';
  RAISE NOTICE '   - Added article_config column (JSONB)';
  RAISE NOTICE '   - Added check constraint for editor_mode';
  RAISE NOTICE '   - Added index on editor_mode';
END $$;
