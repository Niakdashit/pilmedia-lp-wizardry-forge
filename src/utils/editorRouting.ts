/**
 * Maps campaign types to their corresponding editor routes
 */
export const EDITOR_ROUTES = {
  wheel: '/design-editor',
  quiz: '/quiz-editor',
  form: '/form-editor',
  jackpot: '/jackpot-editor',
  scratch: '/scratch-editor',
  dice: '/scratch-editor', // alias legacy type → scratch editor
  swiper: '/swiper-editor', // swiper editor
} as const;

export type CampaignType = keyof typeof EDITOR_ROUTES;

/**
 * Get the editor route for a campaign type
 * @param type - The campaign type
 * @returns The editor route path
 */
export function getEditorRoute(type: string | null | undefined): string {
  if (!type) return EDITOR_ROUTES.wheel;
  return EDITOR_ROUTES[type as CampaignType] || EDITOR_ROUTES.wheel;
}

/**
 * Build a full editor URL with campaign ID
 * @param type - The campaign type
 * @param campaignId - The campaign ID
 * @param editorMode - Optional editor mode ('article' or 'fullscreen')
 * @returns The complete editor URL with query params
 */
export function getEditorUrl(type: string | null | undefined, campaignId: string, editorMode?: 'article' | 'fullscreen'): string {
  const route = getEditorRoute(type);
  const params = new URLSearchParams({ campaign: campaignId });
  if (editorMode === 'article') {
    params.set('mode', 'article');
  }
  return `${route}?${params.toString()}`;
}
