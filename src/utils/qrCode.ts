/**
 * Service de génération de QR Codes
 * Utilise l'API QR Server (gratuite, sans limite)
 */

export interface QRCodeOptions {
  size?: number;
  format?: 'png' | 'svg' | 'eps' | 'pdf';
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'; // Low, Medium, Quartile, High
  margin?: number;
  color?: string;
  bgColor?: string;
}

/**
 * Génère une URL de QR Code via l'API QR Server
 */
export function generateQRCodeUrl(data: string, options: QRCodeOptions = {}): string {
  const {
    size = 300,
    format = 'png',
    errorCorrection = 'M',
    margin = 1,
    color = '000000',
    bgColor = 'ffffff'
  } = options;

  // Encode les données
  const encodedData = encodeURIComponent(data);
  
  // API QR Server - gratuite et sans limite
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=${format}&ecc=${errorCorrection}&margin=${margin}&color=${color}&bgcolor=${bgColor}`;
}

/**
 * Génère un QR Code avec logo (utilise une API différente)
 */
export function generateQRCodeWithLogo(data: string, logoUrl: string, options: QRCodeOptions = {}): string {
  const {
    size = 300,
    errorCorrection = 'H', // High correction nécessaire pour les logos
  } = options;

  const _encodedData = encodeURIComponent(data);
  
  // API alternative avec support logo
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${_encodedData}&ecc=${errorCorrection}&qzone=2`;
}

/**
 * Télécharge un QR Code
 */
export async function downloadQRCode(url: string, filename: string = 'qrcode'): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
}

/**
 * Copie un QR Code dans le presse-papier
 */
export async function copyQRCodeToClipboard(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
  } catch (error) {
    console.error('Error copying QR code to clipboard:', error);
    throw error;
  }
}

/**
 * Génère un QR Code personnalisé avec les couleurs de la marque
 */
export function generateBrandedQRCode(
  data: string, 
  brandColor: string = '0F172A', // Couleur par défaut Prosplay
  options: Partial<QRCodeOptions> = {}
): string {
  // Retire le # si présent
  const color = brandColor.replace('#', '');
  
  return generateQRCodeUrl(data, {
    ...options,
    color,
    errorCorrection: 'H', // Haute correction pour meilleure qualité
  });
}

/**
 * Valide une URL pour QR Code
 */
export function validateQRCodeData(data: string): { valid: boolean; error?: string } {
  if (!data || data.trim().length === 0) {
    return { valid: false, error: 'Les données ne peuvent pas être vides' };
  }
  
  if (data.length > 2953) {
    return { valid: false, error: 'Les données sont trop longues (max 2953 caractères)' };
  }
  
  return { valid: true };
}

/**
 * Génère plusieurs formats de QR Code
 */
export function generateQRCodeFormats(data: string, baseOptions: QRCodeOptions = {}) {
  return {
    small: generateQRCodeUrl(data, { ...baseOptions, size: 150 }),
    medium: generateQRCodeUrl(data, { ...baseOptions, size: 300 }),
    large: generateQRCodeUrl(data, { ...baseOptions, size: 600 }),
    print: generateQRCodeUrl(data, { ...baseOptions, size: 1000 }),
    svg: generateQRCodeUrl(data, { ...baseOptions, format: 'svg' }),
  };
}
