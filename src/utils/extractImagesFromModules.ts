export const extractImagesFromModules = (modularPage: any): string[] => {
  const images: string[] = [];
  
  if (!modularPage?.screens) return images;
  
  Object.values(modularPage.screens).forEach((modules: any) => {
    if (!Array.isArray(modules)) return;
    
    modules.forEach((module: any) => {
      // BlocImage
      if (module.type === 'BlocImage' && module.url) {
        images.push(module.url);
      }
      
      // BlocBouton avec image de fond
      if (module.type === 'BlocBouton' && module.backgroundImage) {
        images.push(module.backgroundImage);
      }
      
      // BlocTexte avec image de fond
      if (module.type === 'BlocTexte' && module.backgroundImage) {
        images.push(module.backgroundImage);
      }
    });
  });
  
  return images;
};

export const extractImagesFromBackgrounds = (screenBackgrounds: any): string[] => {
  const images: string[] = [];
  
  if (!screenBackgrounds) return images;
  
  Object.values(screenBackgrounds).forEach((bg: any) => {
    if (bg?.type === 'image' && bg.value) {
      images.push(bg.value);
    }
    
    // Device-specific backgrounds
    if (bg?.devices) {
      Object.values(bg.devices).forEach((deviceBg: any) => {
        if (deviceBg?.type === 'image' && deviceBg.value) {
          images.push(deviceBg.value);
        }
      });
    }
  });
  
  return images;
};

export const extractImagesFromCanvasElements = (canvasElements: any[]): string[] => {
  const images: string[] = [];
  
  if (!Array.isArray(canvasElements)) return images;
  
  canvasElements.forEach((el: any) => {
    if (el.url) images.push(el.url);
    if (el.backgroundImage) images.push(el.backgroundImage);
    if (el.src) images.push(el.src);
  });
  
  return images;
};

export const extractAllCampaignImages = (campaign: any): string[] => {
  const allImages = new Set<string>();
  
  // From modularPage
  extractImagesFromModules(campaign.modularPage).forEach(img => allImages.add(img));
  
  // From screenBackgrounds
  extractImagesFromBackgrounds(campaign.screenBackgrounds).forEach(img => allImages.add(img));
  
  // From canvasElements
  extractImagesFromCanvasElements(campaign.canvasElements).forEach(img => allImages.add(img));
  
  // From design.backgroundImage
  if (campaign.design?.backgroundImage) {
    allImages.add(campaign.design.backgroundImage);
  }
  if (campaign.design?.mobileBackgroundImage) {
    allImages.add(campaign.design.mobileBackgroundImage);
  }
  
  return Array.from(allImages);
};
