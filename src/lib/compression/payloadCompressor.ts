import { compress, decompress } from 'lz-string';

/**
 * Compression/décompression des payloads pour optimiser le stockage
 */

export interface CompressedPayload {
  data: string;
  compressed: boolean;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compresse un payload JSON
 */
export const compressPayload = (data: any): CompressedPayload => {
  try {
    const json = JSON.stringify(data);
    const originalSize = new Blob([json]).size;
    
    // Ne compresse que si > 1KB
    if (originalSize < 1024) {
      return {
        data: json,
        compressed: false,
        originalSize,
        compressedSize: originalSize,
      };
    }
    
    const compressed = compress(json);
    const compressedSize = new Blob([compressed]).size;
    
    return {
      data: compressed,
      compressed: true,
      originalSize,
      compressedSize,
    };
  } catch (error) {
    console.error('[PayloadCompressor] Compression error:', error);
    const json = JSON.stringify(data);
    const size = new Blob([json]).size;
    return {
      data: json,
      compressed: false,
      originalSize: size,
      compressedSize: size,
    };
  }
};

/**
 * Décompresse un payload
 */
export const decompressPayload = (payload: CompressedPayload | string): any => {
  try {
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    }
    
    const data = payload.compressed ? decompress(payload.data) : payload.data;
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('[PayloadCompressor] Decompression error:', error);
    return null;
  }
};

/**
 * Calcule le ratio de compression
 */
export const getCompressionRatio = (payload: CompressedPayload): number => {
  if (!payload.compressed || payload.originalSize === 0) return 1;
  return payload.compressedSize / payload.originalSize;
};

/**
 * Estime la taille d'un objet en bytes
 */
export const estimateSize = (obj: any): number => {
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch {
    return 0;
  }
};
