
// Couleurs exactes pour les marques connues
const EXACT_BRAND_COLORS: Record<string, { primary: string; secondary: string; accent?: string }> = {
  'sfr.fr': {
    primary: '#e20a16', // Rouge SFR exact
    secondary: '#ffffff',
    accent: '#000000'
  },
  'tikayan.com': {
    primary: '#ff6b47', // Orange coral Tikayan
    secondary: '#4fb3a9', // Teal Tikayan
    accent: '#ffffff'
  },
  'bouyguestelecom.fr': {
    primary: '#009ddc', // Bleu Bouygues
    secondary: '#00c08b', // Vert Bouygues
    accent: '#ff6900' // Orange Bouygues
  }
};

export const getExactBrandColors = (siteUrl: string) => {
  if (!siteUrl) return null;
  
  const domain = extractDomain(siteUrl);
  if (process.env.NODE_ENV !== 'production') {
    console.log('Recherche des couleurs exactes pour:', domain);
  }
  
  // Recherche exacte
  if (EXACT_BRAND_COLORS[domain]) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Couleurs exactes trouvées:', EXACT_BRAND_COLORS[domain]);
    }
    return EXACT_BRAND_COLORS[domain];
  }
  
  // Recherche partielle
  for (const [brandDomain, colors] of Object.entries(EXACT_BRAND_COLORS)) {
    if (domain.includes(brandDomain.split('.')[0]) || brandDomain.includes(domain.split('.')[0])) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Couleurs trouvées par correspondance partielle:', colors);
      }
      return colors;
    }
  }
  
  return null;
};

const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
  }
};
