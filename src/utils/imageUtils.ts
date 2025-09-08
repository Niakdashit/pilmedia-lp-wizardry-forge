/**
 * Utility functions for image processing in ScratchCardEditor
 * Handles thumbnail generation and image optimization without external URLs
 */

export interface CardCover {
  kind: 'blob' | 'data';
  mime: string;
  value: string;
}

/**
 * Converts a File to a data URL with optional resizing for thumbnails
 * @param file - The image file to process
 * @param maxSize - Maximum width/height for the thumbnail (default: 256)
 * @param quality - JPEG/WebP quality (0-1, default: 0.85)
 * @returns Promise resolving to data URL
 */
export function toDataURL(file: File, maxSize: number = 256, quality: number = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = () => {
      img.src = String(reader.result);
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Calculate scaling ratio to fit within maxSize while preserving aspect ratio
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        
        // Draw the resized image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL with appropriate format and quality
        const mimeType = file.type.startsWith('image/') ? file.type : 'image/webp';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validates if a file is a supported image format
 * @param file - File to validate
 * @returns boolean indicating if file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  return supportedTypes.includes(file.type.toLowerCase()) && file.size <= 5 * 1024 * 1024; // 5MB limit
}

/**
 * Creates a CardCover object from a File
 * @param file - The image file
 * @param maxThumbnailSize - Maximum size for thumbnail generation
 * @returns Promise resolving to CardCover object
 */
export async function createCardCover(file: File, maxThumbnailSize: number = 256): Promise<CardCover> {
  if (!isValidImageFile(file)) {
    throw new Error('Invalid image file format or size too large');
  }
  
  const dataUrl = await toDataURL(file, maxThumbnailSize);
  
  return {
    kind: 'data',
    mime: file.type,
    value: dataUrl
  };
}
