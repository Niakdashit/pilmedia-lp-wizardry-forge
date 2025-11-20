/**
 * Génère l'URL de preview avec modale pour une campagne
 * @param campaignId - L'ID de la campagne
 * @returns L'URL complète de preview avec modale
 */
export function getPreviewUrl(campaignId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/preview/${campaignId}`;
}

/**
 * Génère l'URL publique de la campagne (sans modale)
 * @param campaignId - L'ID de la campagne
 * @returns L'URL complète publique
 */
export function getPublicUrl(campaignId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/campaign/${campaignId}`;
}

/**
 * Copie l'URL de preview dans le presse-papiers
 * @param campaignId - L'ID de la campagne
 * @returns Promise qui se résout quand la copie est terminée
 */
export async function copyPreviewUrl(campaignId: string): Promise<void> {
  const url = getPreviewUrl(campaignId);
  await navigator.clipboard.writeText(url);
}
