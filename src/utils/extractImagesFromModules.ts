/**
 * Phase 4: Extraction des images depuis la structure modulaire
 * Parse modularPage pour identifier toutes les images utilisées
 */

import type { ModularPage } from '@/types/modularEditor';

/**
 * Extrait toutes les URLs d'images depuis la structure modulaire
 */
export const extractImagesFromModules = (modularPage?: ModularPage): string[] => {
  if (!modularPage?.screens) return [];

  const imageUrls = new Set<string>();

  // Parser tous les écrans
  Object.values(modularPage.screens).forEach((modules) => {
    if (!Array.isArray(modules)) return;

    modules.forEach((module: any) => {
      // Images dans BlocImage
      if (module.type === 'BlocImage' && module.src) {
        imageUrls.add(module.src);
      }

      // Images de fond dans n'importe quel module
      if (module.backgroundImage) {
        imageUrls.add(module.backgroundImage);
      }

      // Images dans BlocTexte (images inline via Tiptap)
      if (module.type === 'BlocTexte' && module.content) {
        const imgMatches = module.content.match(/<img[^>]+src="([^">]+)"/g);
        if (imgMatches) {
          imgMatches.forEach((match: string) => {
            const srcMatch = match.match(/src="([^">]+)"/);
            if (srcMatch?.[1]) {
              imageUrls.add(srcMatch[1]);
            }
          });
        }
      }

      // Images dans les avatars (types personnalisés)
      if (module.avatarUrl) {
        imageUrls.add(module.avatarUrl);
      }

      // Logo dans header (types personnalisés)
      if (module.logoUrl) {
        imageUrls.add(module.logoUrl);
      }

      // Images dans les cartes produit (types personnalisés)
      if (module.imageUrl) {
        imageUrls.add(module.imageUrl);
      }

      // Icônes personnalisées
      if (module.iconUrl) {
        imageUrls.add(module.iconUrl);
      }
    });
  });

  return Array.from(imageUrls);
};

/**
 * Extrait les images depuis les backgrounds par écran
 */
export const extractImagesFromBackgrounds = (screenBackgrounds?: any): string[] => {
  if (!screenBackgrounds) return [];

  const imageUrls = new Set<string>();

  Object.values(screenBackgrounds).forEach((bg: any) => {
    if (bg?.type === 'image' && bg?.value) {
      imageUrls.add(bg.value);
    }

    // Backgrounds spécifiques par device
    if (bg?.desktop?.type === 'image' && bg?.desktop?.value) {
      imageUrls.add(bg.desktop.value);
    }
    if (bg?.tablet?.type === 'image' && bg?.tablet?.value) {
      imageUrls.add(bg.tablet.value);
    }
    if (bg?.mobile?.type === 'image' && bg?.mobile?.value) {
      imageUrls.add(bg.mobile.value);
    }
  });

  return Array.from(imageUrls);
};

/**
 * Extrait toutes les images depuis les éléments du canvas
 */
export const extractImagesFromCanvasElements = (canvasElements?: any[]): string[] => {
  if (!canvasElements || !Array.isArray(canvasElements)) return [];

  const imageUrls = new Set<string>();

  canvasElements.forEach((element) => {
    // Images directes
    if (element.type === 'image' && element.src) {
      imageUrls.add(element.src);
    }

    // Backgrounds
    if (element.backgroundImage) {
      imageUrls.add(element.backgroundImage);
    }
  });

  return Array.from(imageUrls);
};

/**
 * Extrait TOUTES les images utilisées dans une campagne
 * Combine modularPage, screenBackgrounds et canvasElements
 */
export const extractAllCampaignImages = (campaign: {
  modularPage?: ModularPage;
  screenBackgrounds?: any;
  canvasElements?: any[];
  design?: any;
}): string[] => {
  const allImages = new Set<string>();

  // Images des modules
  extractImagesFromModules(campaign.modularPage).forEach((url) => allImages.add(url));

  // Images des backgrounds
  extractImagesFromBackgrounds(campaign.screenBackgrounds).forEach((url) => allImages.add(url));

  // Images du canvas
  extractImagesFromCanvasElements(campaign.canvasElements).forEach((url) => allImages.add(url));

  // Images dans design (legacy)
  if (campaign.design?.backgroundImage) {
    allImages.add(campaign.design.backgroundImage);
  }
  if (campaign.design?.mobileBackgroundImage) {
    allImages.add(campaign.design.mobileBackgroundImage);
  }

  return Array.from(allImages);
};
