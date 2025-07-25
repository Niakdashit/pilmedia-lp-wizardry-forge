
import { WheelTheme } from '../types';

export const PREDEFINED_THEMES: Record<string, WheelTheme> = {
  modern: {
    name: 'Modern',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      border: '#e5e7eb',
      text: '#111827'
    },
    effects: {
      gradient: true,
      glow: true,
      shadow: true,
      metallic: false
    },
    animation: {
      duration: 3000,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      particles: true
    }
  },
  luxury: {
    name: 'Luxury',
    colors: {
      primary: '#d4af37',
      secondary: '#b8860b',
      accent: '#ffd700',
      background: '#1a1a1a',
      border: '#d4af37',
      text: '#ffffff'
    },
    effects: {
      gradient: true,
      glow: true,
      shadow: true,
      metallic: true
    },
    animation: {
      duration: 4000,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      particles: true
    }
  },
  tech: {
    name: 'Tech',
    colors: {
      primary: '#00d4aa',
      secondary: '#0891b2',
      accent: '#06b6d4',
      background: '#0f172a',
      border: '#334155',
      text: '#f1f5f9'
    },
    effects: {
      gradient: true,
      glow: true,
      shadow: false,
      metallic: false
    },
    animation: {
      duration: 2500,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      particles: true
    }
  },
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#111827',
      secondary: '#374151',
      accent: '#6b7280',
      background: '#ffffff',
      border: '#d1d5db',
      text: '#111827'
    },
    effects: {
      gradient: false,
      glow: false,
      shadow: true,
      metallic: false
    },
    animation: {
      duration: 3000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      particles: false
    }
  }
};

export const createBrandTheme = (brandColors: {
  primary: string;
  secondary: string;
  accent?: string;
}): WheelTheme => {
  return {
    name: 'Brand',
    colors: {
      primary: brandColors.primary,
      secondary: brandColors.secondary,
      accent: brandColors.accent || brandColors.primary,
      background: '#ffffff',
      border: brandColors.primary,
      text: '#111827'
    },
    effects: {
      gradient: true,
      glow: true,
      shadow: true,
      metallic: false
    },
    animation: {
      duration: 3000,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      particles: true
    }
  };
};

export const getTheme = (theme: WheelTheme | string, brandColors?: any): WheelTheme => {
  // Si brandColors est fourni, utiliser un thème de marque en priorité
  if (brandColors) {
    return createBrandTheme(brandColors);
  }
  
  if (typeof theme === 'string') {
    return PREDEFINED_THEMES[theme] || PREDEFINED_THEMES.modern;
  }
  
  return theme;
};
