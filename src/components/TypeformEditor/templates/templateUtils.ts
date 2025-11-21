import { TypeformTemplate } from './typeformTemplates';

/**
 * Applique les couleurs du thème à toutes les questions d'un template
 * Utilise les 3 teintes (dark, medium, light) pour varier les fonds
 */
export const applyThemeColorsToTemplate = (template: TypeformTemplate): TypeformTemplate => {
  if (!template.theme) return template;

  const { backgroundColor } = template.theme;
  
  // Générer 3 teintes à partir de la couleur de base
  const shades = generateColorShades(backgroundColor || '#ffffff');
  
  // Appliquer les couleurs aux questions
  const enhancedQuestions = template.questions.map((question, index) => {
    // Ne pas modifier les écrans welcome et thankyou qui ont déjà leurs propres configs
    if (question.type === 'welcome' || question.type === 'thankyou') {
      return question;
    }

    // Si la question a déjà une panelBackgroundColor, la garder
    if (question.panelBackgroundColor) {
      return question;
    }

    // Alterner entre les 3 teintes
    const shadeIndex = index % 3;
    const selectedShade = shadeIndex === 0 ? shades.dark : shadeIndex === 1 ? shades.medium : shades.light;

    return {
      ...question,
      panelBackgroundColor: selectedShade,
      backgroundType: question.backgroundType || 'color',
    };
  });

  return {
    ...template,
    questions: enhancedQuestions,
  };
};

/**
 * Génère 3 teintes (foncé, moyen, clair) à partir d'une couleur hexadécimale
 */
function generateColorShades(hex: string): { dark: string; medium: string; light: string } {
  // Convertir hex en RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Convertir RGB en HSL
  const hsl = rgbToHsl(r, g, b);

  // Générer 3 variantes en modifiant la luminosité
  const darkHsl = { ...hsl, l: Math.max(hsl.l - 0.15, 0) };
  const mediumHsl = hsl;
  const lightHsl = { ...hsl, l: Math.min(hsl.l + 0.15, 1) };

  return {
    dark: hslToHex(darkHsl.h, darkHsl.s, darkHsl.l),
    medium: hslToHex(mediumHsl.h, mediumHsl.s, mediumHsl.l),
    light: hslToHex(lightHsl.h, lightHsl.s, lightHsl.l),
  };
}

/**
 * Convertit RGB en HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
}

/**
 * Convertit HSL en Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Applique les couleurs à une liste de templates
 */
export const applyThemeColorsToAllTemplates = (templates: TypeformTemplate[]): TypeformTemplate[] => {
  return templates.map(applyThemeColorsToTemplate);
};
