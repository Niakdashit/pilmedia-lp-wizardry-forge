import type { BlocReseauxSociaux, SocialIconStyle } from '@/types/modularEditor';

export type SocialNetworkId = 'facebook' | 'linkedin' | 'x' | 'instagram';

type SocialPreset = {
  id: SocialNetworkId;
  label: string;
  defaultUrl: string;
  iconSvg: string | undefined;
};

export const SOCIAL_PRESETS: Record<SocialNetworkId, SocialPreset> = {
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    defaultUrl: 'https://facebook.com',
    iconSvg: undefined
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    defaultUrl: 'https://linkedin.com',
    iconSvg: undefined
  },
  x: {
    id: 'x',
    label: 'X',
    defaultUrl: 'https://x.com',
    iconSvg: undefined
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    defaultUrl: 'https://instagram.com',
    iconSvg: undefined
  }
};

export const SOCIAL_OPTIONS = Object.values(SOCIAL_PRESETS).map((preset) => ({
  value: preset.id,
  label: preset.label
}));

export const SOCIAL_BRAND_COLORS: Record<SocialNetworkId, string> = {
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  x: '#000000',
  instagram: '#E1306C'
};

export type SocialIconStyleConfig = {
  background: string;
  iconColor: string;
  borderRadius: string;
  borderWidth?: number;
  borderStyle?: 'none' | 'solid';
  boxShadow?: string;
  glyphScale?: number;
};

const FALLBACK_BRAND_COLOR = '#4b5563';

const resolveBrandColor = (network?: SocialNetworkId) => {
  if (!network) return FALLBACK_BRAND_COLOR;
  return SOCIAL_BRAND_COLORS[network] ?? FALLBACK_BRAND_COLOR;
};

export const getIconStyleConfig = (
  style: SocialIconStyle,
  network?: SocialNetworkId
): SocialIconStyleConfig => {
  const brand = resolveBrandColor(network);
  switch (style) {
    case 'color':
      return {
        background: 'transparent',
        iconColor: brand,
        borderRadius: '0px',
        borderStyle: 'none',
        glyphScale: 0.6
      };
    case 'grey':
      return {
        background: 'transparent',
        iconColor: '#6B7280',
        borderRadius: '0px',
        borderStyle: 'none',
        glyphScale: 0.6
      };
    case 'black':
      return {
        background: 'transparent',
        iconColor: '#000000',
        borderRadius: '0px',
        borderStyle: 'none',
        glyphScale: 0.6
      };
    default:
      return {
        background: 'transparent',
        iconColor: brand,
        borderRadius: '0px',
        borderStyle: 'none',
        glyphScale: 0.6
      };
  }
};

const SOCIAL_GLYPHS: Record<SocialNetworkId, string> = {
  facebook: `<svg width="100%" height="100%" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M39 20h-4.5c-1.6 0-2.5.9-2.5 2.4V26H39l-1 6h-6v18h-7V32h-5v-6h5v-5c0-5.2 3.2-8 7.7-8 2.2 0 4 .2 4.5.3V20z"/></svg>`,
  linkedin: `<svg width="100%" height="100%" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M23.3 26.4h-6.6V45h6.6V26.4zM19.9 18.5a3.8 3.8 0 11-.1 7.6 3.8 3.8 0 01.1-7.6zM34.6 26c-3.6 0-6.1 1.9-7.1 3.8h-.1V26.4h-6.3c.1 2.1 0 18.6 0 18.6h6.3v-10c0-.5 0-1 .2-1.4.5-1 1.6-2 3.3-2 2.4 0 3.4 1.5 3.4 3.8V45h6.3v-10.6c0-5.6-3-8.4-7-8.4z"/></svg>`,
  x: `<svg width="100%" height="100%" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M21 17l10.6 14.9L21 47h6.5l6.8-9.5 6.9 9.5H49l-10.7-15L49 17h-6.5l-6.2 8.7L29.7 17z"/></svg>`,
  instagram: `<svg width="100%" height="100%" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="17" width="30" height="30" rx="9" ry="9" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="32" r="9" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="41" cy="23" r="3" fill="currentColor"/></svg>`
};

export const getGlyphSvg = (network?: SocialNetworkId) => {
  if (!network) return undefined;
  return SOCIAL_GLYPHS[network];
};

export const getSocialIconUrl = (network: SocialNetworkId, color: 'default' | 'grey' | 'black' = 'default'): string => {
  return `/assets/social/${network}${color === 'default' ? '' : `-${color}`}.svg`;
};

export const applyNetworkPresetToLink = (network: SocialNetworkId, link: BlocReseauxSociaux['links'][number]) => {
  const preset = SOCIAL_PRESETS[network];
  return {
    ...link,
    network,
    label: preset.label,
    icon: network,
    iconUrl: getSocialIconUrl(network),
    iconSvg: preset.iconSvg,
    url: link.url && link.url.trim().length > 0 ? link.url : preset.defaultUrl
  };
};
