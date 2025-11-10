/**
 * Récupération de l'adresse IP client
 * 
 * Utilise différentes méthodes pour obtenir la vraie IP publique de l'utilisateur
 */

/**
 * Récupère l'IP publique du client via un service externe
 * Utilise ipify.org (gratuit et fiable)
 */
export async function getClientIP(): Promise<string> {
  try {
    console.log('🌐 [GetClientIP] Fetching public IP...');
    
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const ip = data.ip;
    
    console.log('✅ [GetClientIP] IP retrieved:', ip);
    
    return ip;
  } catch (error) {
    console.error('❌ [GetClientIP] Error fetching IP:', error);
    
    // Fallback: essayer un autre service
    try {
      const response = await fetch('https://api.ipify.org');
      const ip = await response.text();
      console.log('✅ [GetClientIP] IP retrieved (fallback):', ip);
      return ip;
    } catch (fallbackError) {
      console.error('❌ [GetClientIP] Fallback also failed:', fallbackError);
      return 'unknown';
    }
  }
}

/**
 * Récupère l'IP avec timeout
 * Évite de bloquer trop longtemps si le service est lent
 */
export async function getClientIPWithTimeout(timeoutMs: number = 5000): Promise<string> {
  return Promise.race([
    getClientIP(),
    new Promise<string>((resolve) => 
      setTimeout(() => {
        console.warn('⏱️ [GetClientIP] Timeout reached, using unknown');
        resolve('unknown');
      }, timeoutMs)
    )
  ]);
}

/**
 * Valide qu'une IP est au bon format
 */
export function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // IPv6 (basique)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
}

/**
 * Anonymise une IP pour la conformité RGPD
 * Remplace le dernier octet par 0
 */
export function anonymizeIP(ip: string): string {
  if (!isValidIP(ip)) return ip;
  
  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[parts.length - 1] = '0';
    return parts.join('.');
  }
  
  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    parts[parts.length - 1] = '0000';
    return parts.join(':');
  }
  
  return ip;
}

/**
 * Détecte si l'IP est locale/privée
 */
export function isPrivateIP(ip: string): boolean {
  if (!isValidIP(ip)) return false;
  
  // Plages privées IPv4
  const privateRanges = [
    /^127\./,          // Localhost
    /^10\./,           // Classe A privée
    /^172\.(1[6-9]|2\d|3[01])\./, // Classe B privée
    /^192\.168\./      // Classe C privée
  ];
  
  return privateRanges.some(range => range.test(ip));
}

/**
 * Obtient des informations géographiques sur l'IP (optionnel)
 * Nécessite un service externe comme ipapi.co
 */
export async function getIPGeolocation(ip: string): Promise<{
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
} | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      country: data.country_name,
      city: data.city,
      region: data.region,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Error fetching IP geolocation:', error);
    return null;
  }
}
