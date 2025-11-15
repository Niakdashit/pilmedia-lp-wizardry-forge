export type EditorDeviceOverride = 'desktop';

const STORAGE_KEY = 'allowMobileEditorUI';

/**
 * Détecte si l'appareil est un vrai mobile (téléphone)
 */
const isRealMobilePhone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  const width = window.innerWidth;
  
  // Détection basée sur user agent ET largeur d'écran
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isPhone = width < 768; // Téléphones < 768px
  
  return isMobileUA && isPhone;
};

/**
 * Centralise la logique de forçage du mode desktop.
 * Les vrais téléphones mobiles utilisent l'UI mobile par défaut.
 * Les tablettes et desktop utilisent l'UI desktop.
 */
export const getEditorDeviceOverride = (): EditorDeviceOverride | null => {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  try {
    const allowMobile = window.localStorage.getItem(STORAGE_KEY);
    // Si l'utilisateur force l'UI mobile via localStorage
    if (allowMobile && allowMobile.toLowerCase() === 'true') {
      return null;
    }
    // Si l'utilisateur force l'UI desktop via localStorage
    if (allowMobile && allowMobile.toLowerCase() === 'false') {
      return 'desktop';
    }
  } catch {
    // En cas d'erreur d'accès au storage, continuer avec la détection auto
  }

  // Si c'est un vrai téléphone mobile, ne pas forcer le desktop
  if (isRealMobilePhone()) {
    return null;
  }

  // Pour les tablettes et desktop, forcer le mode desktop
  return 'desktop';
};

export const shouldForceDesktopEditorUI = (): boolean => getEditorDeviceOverride() === 'desktop';
