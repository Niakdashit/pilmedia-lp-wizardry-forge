export interface BrandStyle {
  primaryColor: string;
  logoUrl?: string;
  fontUrl?: string;
  faviconUrl?: string;
  secondaryColor?: string;
  lightColor?: string;
  darkColor?: string;
}

export async function analyzeBrandStyle(siteUrl: string): Promise<BrandStyle> {
  const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(siteUrl)}&palette=true&meta=true&screenshot=false`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error('Microlink request failed');
  }
  const json = await res.json();
  const data = json.data || {};
  const palette = data.palette || {};
  const primaryColor =
    palette?.vibrant?.background ||
    palette?.lightVibrant?.background ||
    palette?.darkVibrant?.background ||
    '#841b60';

  return {
    primaryColor,
    logoUrl: data.logo?.url,
    fontUrl: data.font?.url,
    faviconUrl: data.favicon?.url,
    secondaryColor: palette?.lightMuted?.background,
    lightColor: palette?.lightVibrant?.background,
    darkColor: palette?.darkVibrant?.background,
  };
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent?: string;
}

// Central helper to apply a brand color scheme to a wheel configuration
export function applyBrandStyleToWheel(campaign: any, colors: BrandColors) {
  const updatedSegments = (campaign?.config?.roulette?.segments || []).map(
    (segment: any, index: number) => ({
      ...segment,
      color: segment.color || (index % 2 === 0 ? colors.primary : colors.secondary)
    })
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
        segments: updatedSegments
      }
    },
    design: {
      ...(campaign.design || {}),
      customColors: colors
    },
    buttonConfig: {
      ...(campaign.buttonConfig || {}),
      color: colors.accent || colors.primary,
      borderColor: colors.primary
    }
  };
}
