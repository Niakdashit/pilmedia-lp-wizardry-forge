-- Add editor_mode column to campaigns table
-- This column stores whether the campaign uses 'article' or 'fullscreen' editor mode

ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS editor_mode TEXT DEFAULT 'fullscreen';

-- Add check constraint to ensure only valid values
ALTER TABLE public.campaigns 
ADD CONSTRAINT campaigns_editor_mode_check 
CHECK (editor_mode IN ('article', 'fullscreen'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_editor_mode ON public.campaigns(editor_mode);

-- Add article_config column to store article-specific configuration
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS article_config JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.campaigns.editor_mode IS 'Editor mode: article (for article-style campaigns) or fullscreen (for traditional campaigns)';
COMMENT ON COLUMN public.campaigns.article_config IS 'Article-specific configuration (banner, content, etc.) - only used when editor_mode is article';
