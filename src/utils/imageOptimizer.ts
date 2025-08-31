/**
 * Utilitaire pour optimiser les images uploadées pour les segments de roue
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface OptimizedImage {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

/**
 * Optimise une image pour l'affichage dans les segments de roue
 */
export const optimizeImageForSegment = (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> => {
  const {
    maxWidth = 200,
    maxHeight = 200,
    quality = 0.9,
    // Utiliser PNG par défaut pour préserver la transparence
    format = 'png'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculer les nouvelles dimensions en maintenant le ratio d'aspect
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Configurer le canvas
      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée (préserver la transparence : ne pas peindre de fond)
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en data URL avec compression
      const mimeType = format === 'png' ? 'image/png' : `image/${format}`;
      const dataUrl = mimeType === 'image/png'
        ? canvas.toDataURL(mimeType)
        : canvas.toDataURL(mimeType, quality);

      // Calculer la taille approximative
      const base64Length = dataUrl.split(',')[1].length;
      const sizeInBytes = Math.round((base64Length * 3) / 4);

      resolve({
        dataUrl,
        width,
        height,
        size: sizeInBytes,
        format: mimeType
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Charger l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Valide un fichier image avant l'upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux. Taille maximale : 5MB'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format non supporté. Utilisez JPG, PNG, GIF ou WebP'
    };
  }

  return { valid: true };
};

/**
 * Crée une miniature carrée pour l'aperçu
 */
export const createSquareThumbnail = (
  imageUrl: string,
  size: number = 64
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;

      // Calculer le crop pour obtenir un carré centré
      const minDimension = Math.min(img.width, img.height);
      const cropX = (img.width - minDimension) / 2;
      const cropY = (img.height - minDimension) / 2;

      // Préserver la transparence : ne pas ajouter de fond
      ctx.clearRect(0, 0, size, size);

      // Dessiner l'image croppée et redimensionnée
      ctx.drawImage(
        img,
        cropX, cropY, minDimension, minDimension,
        0, 0, size, size
      );

      // Exporter en PNG pour conserver l'alpha
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = imageUrl;
  });
};
