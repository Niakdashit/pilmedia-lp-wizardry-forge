export interface BrandStyle {
  primaryColor: string;
  logoUrl?: string;
  fontUrl?: string;
  faviconUrl?: string;
  secondaryColor?: string;
  lightColor?: string;
  darkColor?: string;
}

export interface BrandPalette {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface BrandTheme {
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  logoUrl?: string;
}

interface BrandfetchColor {
  hex?: string;
  [key: string]: unknown;
}

interface BrandfetchData {
  colors?: BrandfetchColor[];
  logos?: Array<{
    formats?: Array<{
      src?: string;
    }>;
  }>;
}

interface CampaignConfig {
  roulette?: {
    segments?: Array<{
      color?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CampaignData {
  config?: CampaignConfig;
  design?: {
    customColors?: BrandColors;
    [key: string]: unknown;
  };
  buttonConfig?: {
    color?: string;
    borderColor?: string;
    textColor?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// --- APPEL API Brandfetch AVEC CLÉ ---
async function fetchBrandfetchData(domain: string): Promise<BrandfetchData | null> {
  const apiKey =
    (typeof import.meta !== "undefined" &&
      (import.meta as { env?: Record<string, string> }).env?.VITE_BRANDFETCH_KEY) ||
    process.env.VITE_BRANDFETCH_KEY;
  if (!apiKey) {
    console.warn(
      "[BrandStyleAnalyzer] VITE_BRANDFETCH_KEY is undefined. Skipping Brandfetch request.",
    );
    return null;
  }
  const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error("Brandfetch request failed");
  return res.json();
}

// Helper principal : Génération d'un thème complet à partir d'une URL
export async function generateBrandThemeFromUrl(
  url: string,
): Promise<BrandTheme> {
  try {
    if (!/^https?:/.test(url)) url = `https://${url}`;
    const domain = new URL(url).hostname;
    let brandData: BrandfetchData | null = null;
    let logoUrl: string | undefined;
    try {
      brandData = await fetchBrandfetchData(domain);
      logoUrl = brandData?.logos?.[0]?.formats?.[0]?.src;
    } catch (err) {
      console.warn("⚠️ Brandfetch error:", err);
    }
    // 1. Couleurs directes Brandfetch
    if (brandData?.colors?.length) {
      const colors = brandData.colors.map((c) => c.hex || String(c));
      const primary = colors[0];
      const secondary = colors[1] || primary;
      const accent = colors[2] || "#ffffff";
      return {
        customColors: {
          primary,
          secondary,
          accent,
          text: getAccessibleTextColor(accent),
        },
        logoUrl,
      };
    }
    // 2. Extraction des couleurs du logo avec ColorThief (priorité absolue)
    if (logoUrl && typeof window !== "undefined") {
      try {
        const logoColors = await extractColorsFromLogo(logoUrl);
        if (logoColors.length >= 2) {
          const palette = generateAdvancedPaletteFromColors(logoColors);
          return {
            customColors: {
              primary: palette.primaryColor,
              secondary: palette.secondaryColor,
              accent: palette.accentColor,
              text: palette.textColor,
            },
            logoUrl,
          };
        }
      } catch (error) {
        console.warn("⚠️ Échec extraction logo ColorThief:", error);
      }
    }
    // 3. Fallback final : Palette par défaut
    return {
      customColors: {
        primary: "#841b60",
        secondary: "#dc2626",
        accent: "#ffffff",
        text: "#ffffff",
      },
      logoUrl,
    };
  } catch (error) {
    // Palette d'urgence
    return {
      customColors: {
        primary: "#841b60",
        secondary: "#dc2626",
        accent: "#ffffff",
        text: "#ffffff",
      },
    };
  }
}

// Génération d'un thème de marque à partir d'un fichier logo local
export async function generateBrandThemeFromFile(
  file: File,
): Promise<BrandTheme> {
  const logoUrl = URL.createObjectURL(file);
  try {
    const logoColors = await extractColorsFromLogo(logoUrl);
    if (logoColors.length >= 2) {
      const palette = generateAdvancedPaletteFromColors(logoColors);
      return {
        customColors: {
          primary: palette.primaryColor,
          secondary: palette.secondaryColor,
          accent: palette.accentColor,
          text: palette.textColor,
        },
        logoUrl,
      };
    }
  } catch (error) {
    console.warn("⚠️ Échec extraction logo local:", error);
  }
  return {
    customColors: {
      primary: "#841b60",
      secondary: "#dc2626",
      accent: "#ffffff",
      text: "#ffffff",
    },
    logoUrl,
  };
}

// Récupération des données Brandfetch
async function fetchBrandData(siteUrl: string): Promise<any> {
  const domain = new URL(siteUrl).hostname;
  const data = await fetchBrandfetchData(domain);
  return data || {};
}

// Analyse la charte graphique depuis l'API et retourne la palette prête pour l'app
export async function analyzeBrandStyle(siteUrl: string): Promise<BrandStyle> {
  const data = await fetchBrandData(siteUrl);
  const brandPalette = await extractBrandPaletteFromBrandfetch(data);
  return {
    primaryColor: brandPalette.primaryColor,
    logoUrl: data.logos?.[0]?.formats?.[0]?.src,
    fontUrl: data.fonts?.[0]?.files?.regular,
    faviconUrl: data.icon,
    secondaryColor: brandPalette.secondaryColor,
    lightColor: brandPalette.accentColor,
    darkColor: brandPalette.backgroundColor,
  };
}

// Calcul automatique du texte contrasté
export function getAccessibleTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
export const getReadableTextColor = getAccessibleTextColor;

// ColorThief utilitaires
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const h = x.toString(16);
        return h.length === 1 ? "0" + h : h;
      })
      .join("")
  );
}

// Extraction ColorThief via <img> avec filtrage amélioré
export async function extractColorsFromLogo(
  logoUrl: string,
): Promise<string[]> {
  try {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const { default: ColorThief } = await import('colorthief');
          const colorThief = new ColorThief();
          const dominantColor = colorThief.getColor(img, 10);
          const palette = colorThief.getPalette(img, 12, 10);
          const dominantHex = rgbToHex(
            dominantColor[0],
            dominantColor[1],
            dominantColor[2],
          );
          const paletteHex = palette.map(([r, g, b]: number[]) =>
            rgbToHex(r, g, b),
          );
          const allColors = [dominantHex, ...paletteHex];
          // Filtrage amélioré : ni gris, ni trop clair, ni trop foncé, avec plus de seuils
          const filteredColors = allColors.filter((color) => {
            return (
              !isGrayish(color) && 
              !isTooLight(color) && 
              !isTooDark(color) &&
              getColorSaturation(color) > 0.3 && // Plus de saturation
              getLuminance(color) > 0.15 && getLuminance(color) < 0.85 // Meilleur contraste
            );
          });
          const unique = deduplicateColors(filteredColors, 40).filter(Boolean);
          const finalColors =
            unique.length >= 2 ? unique.slice(0, 5) : allColors.slice(0, 3);
          resolve(finalColors);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Logo load failed"));
      img.src = logoUrl;
    });
  } catch (error) {
    return [];
  }
}

// Utilitaires couleurs : filtrage et déduplication
function isGrayish(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return saturation < 0.25; // Seuil plus strict pour éviter les gris
}
function isTooLight(hex: string): boolean {
  return getLuminance(hex) > 0.95;
}
function isTooDark(hex: string): boolean {
  return getLuminance(hex) < 0.05;
}
function deduplicateColors(colors: string[], threshold = 40): string[] {
  const unique: string[] = [];
  const distance = (c1: string, c2: string) => {
    const [r1, g1, b1] = hexToRgb(c1);
    const [r2, g2, b2] = hexToRgb(c2);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  };
  colors.forEach((color) => {
    if (!unique.some((u) => distance(u, color) < threshold)) {
      unique.push(color);
    }
  });
  return unique;
}

// Génération palette avancée depuis couleurs ColorThief
export function generateAdvancedPaletteFromColors(
  colors: string[],
): BrandPalette {
  // Tri par saturation puis par luminance (plus saturée/vive en premier)
  const sortedColors = colors.sort((a, b) => {
    const satA = getColorSaturation(a);
    const satB = getColorSaturation(b);
    const lumA = getLuminance(a);
    const lumB = getLuminance(b);
    if (Math.abs(satA - satB) > 0.1) {
      return satB - satA;
    }
    return Math.abs(lumB - 0.5) - Math.abs(lumA - 0.5);
  });
  const primaryColor = sortedColors[0] || "#841b60";
  const secondaryColor =
    findContrastingColor(sortedColors, primaryColor) ||
    sortedColors[1] ||
    "#dc2626";
  const accentColor =
    findAccentColor(sortedColors, primaryColor, secondaryColor) || "#ffffff";
  const textColor = getAccessibleTextColor(accentColor);
  return {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: "#ffffff",
    textColor,
  };
}
function getColorSaturation(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  return max === 0 ? 0 : (max - min) / max;
}
function findContrastingColor(
  colors: string[],
  excludeColor: string,
): string | null {
  const excludeLuminance = getLuminance(excludeColor);
  for (const color of colors) {
    if (color === excludeColor) continue;
    const luminance = getLuminance(color);
    const contrast = Math.abs(luminance - excludeLuminance);
    if (contrast > 0.3) return color;
  }
  return null;
}
function findAccentColor(
  colors: string[],
  primaryColor: string,
  secondaryColor: string,
): string | null {
  for (const color of colors) {
    if (color === primaryColor || color === secondaryColor) continue;
    const luminance = getLuminance(color);
    if (luminance > 0.2 && luminance < 0.8) return color;
  }
  return null;
}

// Génération palette complète cohérente depuis Brandfetch
export function extractCompletePaletteFromBrandfetch(
  palette: BrandfetchColor[],
): BrandPalette {
  const colors = palette.map((c) => c.hex || String(c)).filter(Boolean);
  const primaryColor = colors[0] || "#841b60";
  const secondaryColor = colors[1] || primaryColor;
  const accentColor = colors[2] || "#ffffff";
  const backgroundColor = "#ffffff";
  const textColor = getAccessibleTextColor(accentColor);
  return {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    textColor,
  };
}

// Pour compatibilité avec anciens noms
export function generateBrandThemeFromMicrolinkPalette(
  palette: BrandfetchColor[],
): BrandPalette {
  return extractCompletePaletteFromBrandfetch(palette);
}
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
}

// Application de la charte sur la roue
export interface BrandColors {
  primary: string;
  secondary: string;
  accent?: string;
}
export function applyBrandStyleToWheel(campaign: CampaignData, colors: BrandColors) {
  const updatedSegments = (campaign?.config?.roulette?.segments || []).map(
    (segment, index: number) => ({
      ...segment,
      color:
        segment.color || (index % 2 === 0 ? colors.primary : colors.secondary),
    }),
  );
  return {
    ...campaign,
    config: {
      ...campaign.config,
      roulette: {
        ...(campaign.config?.roulette || {}),
        borderColor: colors.primary,
        borderOutlineColor: colors.accent || colors.secondary || colors.primary,
        segmentColor1: colors.primary,
        segmentColor2: colors.secondary,
        segments: updatedSegments,
      },
    },
    design: {
      ...(campaign.design || {}),
      customColors: colors,
    },
    buttonConfig: {
      ...(campaign.buttonConfig || {}),
      color: colors.accent || colors.primary,
      borderColor: colors.primary,
      textColor: getAccessibleTextColor(colors.accent || colors.primary),
    },
  };
}

// Palette Brandfetch ou logo
export async function extractBrandPaletteFromBrandfetch(
  data: BrandfetchData,
): Promise<BrandPalette> {
  const colors = data?.colors || [];
  return extractCompletePaletteFromBrandfetch(colors);
}
