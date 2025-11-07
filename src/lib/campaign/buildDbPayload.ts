/**
 * Unified DB payload builder for campaign updates
 * Strips all internal/UI-only fields and maps to exact DB columns
 */

export interface DbCampaignPayload {
  name?: string;
  description?: string;
  slug?: string;
  type?: string;
  status?: string;
  editor_mode?: string;
  config?: Record<string, any>;
  design?: Record<string, any>;
  game_config?: Record<string, any>;
  article_config?: Record<string, any>;
  form_fields?: any[];
  start_date?: string;
  end_date?: string;
  thumbnail_url?: string;
  banner_url?: string;
}

/**
 * Builds a clean DB payload from campaign editor state
 * - Removes all keys starting with "_" (internal React state)
 * - Removes functions
 * - Maps to exact DB column names
 */
export const buildCampaignUpdatePayload = (campaign: any): DbCampaignPayload => {
  if (!campaign) return {};

  const payload: DbCampaignPayload = {};

  // Simple fields
  if (campaign.name !== undefined) payload.name = campaign.name;
  if (campaign.description !== undefined) payload.description = campaign.description;
  if (campaign.slug !== undefined) payload.slug = campaign.slug;
  if (campaign.type !== undefined) payload.type = campaign.type;
  if (campaign.status !== undefined) payload.status = campaign.status;
  
  // Editor mode (check both formats)
  const editorMode = campaign.editor_mode || campaign.editorMode;
  if (editorMode !== undefined) payload.editor_mode = editorMode;

  // Dates
  if (campaign.start_date !== undefined) payload.start_date = campaign.start_date;
  if (campaign.end_date !== undefined) payload.end_date = campaign.end_date;

  // URLs
  if (campaign.thumbnail_url !== undefined) payload.thumbnail_url = campaign.thumbnail_url;
  if (campaign.banner_url !== undefined) payload.banner_url = campaign.banner_url;

  // Complex fields - clean them recursively
  if (campaign.config !== undefined) {
    payload.config = cleanObject(campaign.config);
  }

  if (campaign.design !== undefined) {
    payload.design = cleanObject(campaign.design);
  }

  if (campaign.game_config !== undefined) {
    payload.game_config = cleanObject(campaign.game_config);
  }

  // Article config (check both formats)
  const articleConfig = campaign.article_config || campaign.articleConfig;
  if (articleConfig !== undefined) {
    payload.article_config = cleanObject(articleConfig);
  }

  if (campaign.form_fields !== undefined) {
    payload.form_fields = Array.isArray(campaign.form_fields) 
      ? campaign.form_fields.map((field: any) => cleanObject(field))
      : campaign.form_fields;
  }

  return payload;
};

/**
 * Recursively cleans an object:
 * - Removes keys starting with "_"
 * - Removes functions
 * - Removes volatile/UI-only fields
 */
const cleanObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanObject);

  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip internal fields
    if (key.startsWith('_')) continue;
    
    // Skip functions
    if (typeof value === 'function') continue;
    
    // Skip known volatile fields
    if (['selectedDevice', 'canvasZoom'].includes(key)) continue;

    // Recursively clean nested objects
    if (value && typeof value === 'object') {
      cleaned[key] = cleanObject(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
};
