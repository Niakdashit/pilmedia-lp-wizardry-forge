/**
 * Génère l'URL de preview publique pour une campagne
 * @param campaignId - L'ID de la campagne
 * @returns L'URL complète de preview
 */
export function getPreviewUrl(campaignId: string): string {
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
