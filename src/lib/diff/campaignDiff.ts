import { compare, applyPatch, Operation } from 'fast-json-patch';

/**
 * Génération et application de diffs pour sauvegardes différentielles
 */

export interface CampaignDiff {
  patch: Operation[];
  baseRevision: number;
  targetRevision: number;
  patchSize: number;
}

/**
 * Crée un diff entre deux versions de campagne
 */
export const createDiff = (
  oldCampaign: any,
  newCampaign: any
): CampaignDiff | null => {
  try {
    const patch = compare(oldCampaign, newCampaign);
    
    // Si le patch est vide, pas de changements
    if (patch.length === 0) {
      return null;
    }
    
    const patchSize = new Blob([JSON.stringify(patch)]).size;
    
    return {
      patch,
      baseRevision: oldCampaign.revision || 1,
      targetRevision: newCampaign.revision || 1,
      patchSize,
    };
  } catch (error) {
    console.error('[CampaignDiff] Error creating diff:', error);
    return null;
  }
};

/**
 * Applique un diff à une campagne de base
 */
export const applyDiff = (
  baseCampaign: any,
  diff: CampaignDiff
): any | null => {
  try {
    const result = applyPatch(baseCampaign, diff.patch, true, false);
    return result.newDocument;
  } catch (error) {
    console.error('[CampaignDiff] Error applying diff:', error);
    return null;
  }
};

/**
 * Détermine s'il faut sauvegarder un snapshot complet ou un diff
 * Règle : snapshot complet tous les 10 saves
 */
export const shouldSaveFullSnapshot = (revision: number): boolean => {
  return revision % 10 === 0;
};

/**
 * Calcule l'économie d'espace d'un diff vs snapshot complet
 */
export const calculateSavings = (
  fullSize: number,
  diffSize: number
): { savings: number; ratio: number } => {
  const savings = fullSize - diffSize;
  const ratio = diffSize / fullSize;
  return { savings, ratio };
};
