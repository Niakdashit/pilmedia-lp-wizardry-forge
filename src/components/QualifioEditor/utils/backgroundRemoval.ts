
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js pour une meilleure performance
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 512; // Réduit pour de meilleures performances

// Cache pour le modèle
let segmenterCache: any = null;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  let scale = 1;

  // Redimensionner si l'image est trop grande
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    scale = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  canvas.width = width;
  canvas.height = height;
  
  // Améliorer la qualité de rendu
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, width, height);
  
  return { width, height, wasResized: scale < 1 };
}

function applyMaskWithFeathering(
  outputCtx: CanvasRenderingContext2D, 
  mask: any, 
  width: number, 
  height: number
) {
  const imageData = outputCtx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Créer un masque flou pour des contours plus doux
  const smoothMask = new Float32Array(mask.data.length);
  
  // Appliquer un flou gaussien simple sur le masque
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nx = x + kx;
          const ny = y + ky;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = ny * width + nx;
            sum += mask.data[idx];
            count++;
          }
        }
      }
      
      const idx = y * width + x;
      smoothMask[idx] = count > 0 ? sum / count : mask.data[idx];
    }
  }
  
  // Appliquer le masque lissé
  for (let i = 0; i < smoothMask.length; i++) {
    // Inverser le masque et appliquer une courbe pour de meilleurs résultats
    let alpha = 1 - smoothMask[i];
    
    // Améliorer le contraste du masque
    alpha = alpha > 0.5 ? Math.pow(alpha, 0.8) : Math.pow(alpha, 1.2);
    
    // Appliquer l'alpha
    data[i * 4 + 3] = Math.round(alpha * 255);
  }
  
  outputCtx.putImageData(imageData, 0, 0);
}

// Fonction pour détecter la compatibilité WebGPU
async function getOptimalDevice(): Promise<string> {
  try {
    // Vérifier si WebGPU est disponible
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      const adapter = await (navigator as any).gpu?.requestAdapter();
      if (adapter) {
        console.log('WebGPU détecté et disponible');
        return 'webgpu';
      }
    }
  } catch (error) {
    console.warn('WebGPU non disponible:', error);
  }
  
  console.log('Utilisation de WASM pour le traitement');
  return 'wasm'; // Changé de 'cpu' vers 'wasm'
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Démarrage de la suppression d\'arrière-plan...');
    
    // Détecter le meilleur périphérique disponible
    const device = await getOptimalDevice();
    
    // Réutiliser le modèle en cache si disponible
    if (!segmenterCache) {
      console.log('Chargement du modèle de segmentation...');
      
      const modelOptions: any = {
        device: device,
        dtype: device === 'webgpu' ? 'fp16' : 'fp32'
      };
      
      try {
        segmenterCache = await pipeline(
          'image-segmentation', 
          'Xenova/segformer-b0-finetuned-ade-512-512',
          modelOptions
        );
        console.log(`Modèle chargé avec succès sur ${device}`);
      } catch (modelError) {
        console.warn('Erreur lors du chargement avec le premier modèle, tentative avec WASM...');
        
        // Fallback vers WASM au lieu de CPU
        segmenterCache = await pipeline(
          'image-segmentation', 
          'Xenova/segformer-b0-finetuned-ade-512-512',
          { device: 'wasm', dtype: 'fp32' }
        );
        console.log('Modèle de fallback chargé sur WASM');
      }
    }
    
    // Préparer l'image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Impossible d\'obtenir le contexte canvas');
    
    const { width, height, wasResized } = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'redimensionnée' : 'conservée'}. Dimensions: ${width}x${height}`);
    
    // Convertir en format optimisé
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Traitement avec le modèle
    console.log('Segmentation en cours...');
    const result = await segmenterCache(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Résultat de segmentation invalide - le modèle n\'a pas pu traiter l\'image');
    }
    
    console.log('Segmentation terminée, application du masque...');
    
    // Créer le canvas de sortie avec la taille originale
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = imageElement.naturalWidth;
    outputCanvas.height = imageElement.naturalHeight;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Impossible d\'obtenir le contexte canvas de sortie');
    
    // Dessiner l'image originale à sa taille complète
    outputCtx.imageSmoothingEnabled = true;
    outputCtx.imageSmoothingQuality = 'high';
    outputCtx.drawImage(imageElement, 0, 0);
    
    // Redimensionner le masque si nécessaire et l'appliquer
    if (wasResized) {
      // Créer un canvas temporaire pour redimensionner le masque
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = imageElement.naturalWidth;
      maskCanvas.height = imageElement.naturalHeight;
      const maskCtx = maskCanvas.getContext('2d');
      
      if (maskCtx) {
        // Créer une ImageData pour le masque redimensionné
        const originalMaskData = new ImageData(
          new Uint8ClampedArray(result[0].mask.data.map((v: number) => [255, 255, 255, Math.round((1-v) * 255)]).flat()),
          width,
          height
        );
        
        // Dessiner et redimensionner le masque
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.putImageData(originalMaskData, 0, 0);
          maskCtx.imageSmoothingEnabled = true;
          maskCtx.imageSmoothingQuality = 'high';
          maskCtx.drawImage(tempCanvas, 0, 0, imageElement.naturalWidth, imageElement.naturalHeight);
          
          // Appliquer le masque redimensionné
          const resizedMaskData = maskCtx.getImageData(0, 0, imageElement.naturalWidth, imageElement.naturalHeight);
          const outputImageData = outputCtx.getImageData(0, 0, imageElement.naturalWidth, imageElement.naturalHeight);
          
          for (let i = 0; i < resizedMaskData.data.length; i += 4) {
            outputImageData.data[i + 3] = resizedMaskData.data[i + 3];
          }
          
          outputCtx.putImageData(outputImageData, 0, 0);
        }
      }
    } else {
      // Appliquer directement le masque avec lissage
      applyMaskWithFeathering(outputCtx, result[0].mask, width, height);
    }
    
    console.log('Masque appliqué avec succès');
    
    // Convertir en blob avec compression optimisée
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Image avec arrière-plan supprimé créée avec succès');
            resolve(blob);
          } else {
            reject(new Error('Échec de la création du blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'arrière-plan:', error);
    
    // Messages d'erreur plus spécifiques
    let errorMessage = 'Erreur inconnue';
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Impossible de télécharger le modèle. Vérifiez votre connexion internet.';
      } else if (error.message.includes('WebGL') || error.message.includes('WebGPU')) {
        errorMessage = 'Votre navigateur ne supporte pas l\'accélération matérielle requise.';
      } else if (error.message.includes('memory') || error.message.includes('OOM')) {
        errorMessage = 'Image trop volumineuse. Essayez avec une image plus petite.';
      } else if (error.message.includes('segmentation')) {
        errorMessage = 'Le modèle n\'a pas pu analyser cette image. Essayez avec une autre image.';
      } else {
        errorMessage = error.message;
      }
    }
    
    throw new Error(`Échec de la suppression d'arrière-plan: ${errorMessage}`);
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Pour éviter les problèmes CORS
    img.onload = () => {
      URL.revokeObjectURL(img.src); // Nettoyer la mémoire
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Impossible de charger l\'image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Fonction utilitaire pour précharger le modèle
export const preloadBackgroundRemovalModel = async (): Promise<void> => {
  try {
    if (!segmenterCache) {
      console.log('Préchargement du modèle de suppression d\'arrière-plan...');
      const device = await getOptimalDevice();
      segmenterCache = await pipeline(
        'image-segmentation', 
        'Xenova/segformer-b0-finetuned-ade-512-512',
        {
          device: device,
          dtype: device === 'webgpu' ? 'fp16' : 'fp32'
        }
      );
      console.log('Modèle préchargé avec succès');
    }
  } catch (error) {
    console.warn('Impossible de précharger le modèle:', error);
  }
};
