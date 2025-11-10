/**
 * Device Fingerprinting - Détection et tracking des appareils
 * 
 * Utilise FingerprintJS pour générer une empreinte unique de l'appareil
 * permettant de détecter les multi-comptes et comportements suspects.
 */

// Note: FingerprintJS sera installé via: npm install @fingerprintjs/fingerprintjs
// Pour l'instant, on utilise une implémentation basique

export interface DeviceInfo {
  fingerprint: string;
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  hardwareConcurrency: number;
}

/**
 * Génère une empreinte unique de l'appareil
 * Version basique sans dépendance externe
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      navigator.platform
    ];
    
    // Créer un hash simple
    const fingerprint = await simpleHash(components.join('|'));
    
    console.log('🔍 [DeviceFingerprint] Generated:', fingerprint.substring(0, 16) + '...');
    
    return fingerprint;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    return 'unknown';
  }
}

/**
 * Obtient des informations détaillées sur l'appareil
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const fingerprint = await getDeviceFingerprint();
  
  return {
    fingerprint,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: screen.colorDepth,
    hardwareConcurrency: navigator.hardwareConcurrency || 0
  };
}

/**
 * Hash simple pour créer une empreinte
 * Utilise l'API SubtleCrypto pour SHA-256
 */
async function simpleHash(str: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Fallback si crypto.subtle n'est pas disponible
    console.warn('crypto.subtle not available, using fallback hash');
    return fallbackHash(str);
  }
}

/**
 * Hash fallback simple (non cryptographique)
 * Utilisé uniquement si crypto.subtle n'est pas disponible
 */
function fallbackHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Vérifie si deux fingerprints correspondent
 */
export function matchFingerprints(fp1: string, fp2: string): boolean {
  return fp1 === fp2;
}

/**
 * Détecte si l'appareil est un mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Détecte si l'appareil est une tablette
 */
export function isTabletDevice(): boolean {
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
}

/**
 * Obtient le type d'appareil
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
}
