import { 
  Square, 
  Circle, 
  Triangle, 
  Heart, 
  Star, 
  Plus, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  Cloud, 
  MessageCircle, 
  MessageSquare, 
  Hexagon
} from 'lucide-react';

export interface ShapeDefinition {
  id: string;
  type: string;
  label: string;
  icon: any;
  color: string;
  aspectRatio?: number;
  borderRadius?: string;
  viewBox?: string;
  paths?: Array<{
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit';
    strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit';
    fillRule?: 'nonzero' | 'evenodd' | 'inherit';
    clipRule?: 'nonzero' | 'evenodd' | 'inherit';
    opacity?: number | string;
  }>;
}

// Formes exactement comme dans l'image
export const shapes: ShapeDefinition[] = [
  { id: 'rectangle', type: 'rectangle', label: 'Rectangle', icon: Square, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M0 0H100V60H0Z', fill: 'currentColor' }] },
  { id: 'rounded-rectangle', type: 'rounded-rectangle', label: 'Rectangle arrondi', icon: Square, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M10 0H90C95.5228 0 100 4.47715 100 10V50C100 55.5228 95.5228 60 90 60H10C4.47715 60 0 55.5228 0 50V10C0 4.47715 4.47715 0 10 0Z', fill: 'currentColor' }] },
  { id: 'circle', type: 'circle', label: 'Cercle', icon: Circle, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100Z', fill: 'currentColor' }] },
  { id: 'triangle-up', type: 'triangle', label: 'Triangle', icon: Triangle, color: '#D1D5DB', viewBox: '0 0 100 87', paths: [{ d: 'M50 0L100 87H0L50 0Z', fill: 'currentColor' }] },
  { id: 'triangle-down', type: 'triangle', label: 'Triangle inversé', icon: Triangle, color: '#D1D5DB', viewBox: '0 0 100 87', paths: [{ d: 'M50 87L0 0H100L50 87Z', fill: 'currentColor' }] },
  { id: 'diamond', type: 'diamond', label: 'Losange', icon: Square, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 0L100 50L50 100L0 50L50 0Z', fill: 'currentColor' }] },
  { id: 'pentagon', type: 'pentagon', label: 'Pentagone', icon: Square, color: '#D1D5DB', viewBox: '0 0 100 95', paths: [{ d: 'M50 0L95.1 36.3L76.9 95H23.1L4.9 36.3L50 0Z', fill: 'currentColor' }] },
  { id: 'hexagon', type: 'hexagon', label: 'Hexagone', icon: Hexagon, color: '#D1D5DB', viewBox: '0 0 100 87', paths: [{ d: 'M25 0H75L100 43.5L75 87H25L0 43.5L25 0Z', fill: 'currentColor' }] },
  { id: 'octagon', type: 'octagon', label: 'Octogone', icon: Square, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M29.3 0H70.7L100 29.3V70.7L70.7 100H29.3L0 70.7V29.3L29.3 0Z', fill: 'currentColor' }] },
  { id: 'star-4', type: 'star', label: 'Étoile 4 branches', icon: Star, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 0L60 40H100L70 60L80 100L50 80L20 100L30 60L0 40H40L50 0Z', fill: 'currentColor' }] },
  { id: 'star-5', type: 'star', label: 'Étoile 5 branches', icon: Star, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 95', paths: [{ d: 'M50 0L61.8 35.3H100L69.1 57.4L80.9 92.7L50 70.6L19.1 92.7L30.9 57.4L0 35.3H38.2L50 0Z', fill: 'currentColor' }] },
  { id: 'star-6', type: 'star', label: 'Étoile 6 branches', icon: Star, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 0L65 25H100L75 50L100 75H65L50 100L35 75H0L25 50L0 25H35L50 0Z', fill: 'currentColor' }] },
  { id: 'star-8', type: 'star', label: 'Étoile 8 branches', icon: Star, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 0L57.3 17.7L75 25L57.3 32.3L50 50L42.7 32.3L25 25L42.7 17.7L50 0ZM82.3 42.7L100 50L82.3 57.3L75 75L67.7 57.3L50 50L67.7 42.7L75 25L82.3 42.7ZM57.3 67.7L50 50L42.7 67.7L25 75L42.7 82.3L50 100L57.3 82.3L75 75L57.3 67.7ZM17.7 42.7L0 50L17.7 57.3L25 75L32.3 57.3L50 50L32.3 42.7L25 25L17.7 42.7Z', fill: 'currentColor' }] },
  { id: 'star-12', type: 'star', label: 'Étoile 12 branches', icon: Star, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 10C55.5228 10 60 5.52285 60 0C60 5.52285 64.4772 10 70 10C64.4772 10 60 14.4772 60 20C60 14.4772 55.5228 10 50 10ZM50 90C55.5228 90 60 94.4772 60 100C60 94.4772 64.4772 90 70 90C64.4772 90 60 85.5228 60 80C60 85.5228 55.5228 90 50 90ZM10 50C10 44.4772 5.52285 40 0 40C5.52285 40 10 35.5228 10 30C10 35.5228 14.4772 40 20 40C14.4772 40 10 44.4772 10 50ZM90 50C90 44.4772 94.4772 40 100 40C94.4772 40 90 35.5228 90 30C90 35.5228 85.5228 40 80 40C85.5228 40 90 44.4772 90 50Z', fill: 'currentColor' }] },
  { id: 'star-16', type: 'star', label: 'Étoile 16 branches', icon: Star, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 0L52 12L64 16L52 20L50 32L48 20L36 16L48 12L50 0ZM68 18L70 22L82 26L70 30L68 42L66 30L54 26L66 22L68 18ZM82 32L84 36L96 40L84 44L82 56L80 44L68 40L80 36L82 32ZM82 68L84 64L96 60L84 56L82 44L80 56L68 60L80 64L82 68ZM68 82L70 78L82 74L70 70L68 58L66 70L54 74L66 78L68 82ZM50 100L52 88L64 84L52 80L50 68L48 80L36 84L48 88L50 100ZM32 82L34 78L46 74L34 70L32 58L30 70L18 74L30 78L32 82ZM18 68L20 64L32 60L20 56L18 44L16 56L4 60L16 64L18 68ZM18 32L20 36L32 40L20 44L18 56L16 44L4 40L16 36L18 32ZM32 18L34 22L46 26L34 30L32 42L30 30L18 26L30 22L32 18Z', fill: 'currentColor' }] },
  { id: 'gear', type: 'gear', label: 'Engrenage', icon: Star, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 20C61.05 20 70 28.95 70 40C70 51.05 61.05 60 50 60C38.95 60 30 51.05 30 40C30 28.95 38.95 20 50 20ZM45 0H55L57 10H43L45 0ZM90 10L95 20L85 25L80 15L90 10ZM100 45V55L90 57V43L100 45ZM95 80L90 90L80 85L85 75L95 80ZM55 100H45L43 90H57L55 100ZM10 90L5 80L15 75L20 85L10 90ZM0 55V45L10 43V57L0 55ZM5 20L10 10L20 15L15 25L5 20Z', fill: 'currentColor' }] },
  { id: 'sun', type: 'star', label: 'Soleil', icon: Star, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M50 25C61.05 25 70 33.95 70 45C70 56.05 61.05 65 50 65C38.95 65 30 56.05 30 45C30 33.95 38.95 25 50 25ZM50 0L52 8L58 10L52 12L50 20L48 12L42 10L48 8L50 0ZM71 7L73 11L79 13L73 15L71 23L69 15L63 13L69 11L71 7ZM93 29L95 33L100 35L95 37L93 45L91 37L85 35L91 33L93 29ZM93 71L95 67L100 65L95 63L93 55L91 63L85 65L91 67L93 71ZM71 93L73 89L79 87L73 85L71 77L69 85L63 87L69 89L71 93ZM50 100L52 92L58 90L52 88L50 80L48 88L42 90L48 92L50 100ZM29 93L31 89L37 87L31 85L29 77L27 85L21 87L27 89L29 93ZM7 71L9 67L15 65L9 63L7 55L5 63L0 65L5 67L7 71ZM7 29L9 33L15 35L9 37L7 45L5 37L0 35L5 33L7 29ZM29 7L31 11L37 13L31 15L29 23L27 15L21 13L27 11L29 7Z', fill: 'currentColor' }] },
  { id: 'arrow-right', type: 'arrow', label: 'Flèche droite', icon: ArrowRight, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M0 20H70L60 10L80 30L60 50L70 40H0V20Z', fill: 'currentColor' }] },
  { id: 'arrow-left', type: 'arrow', label: 'Flèche gauche', icon: ArrowLeft, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M100 20H30L40 10L20 30L40 50L30 40H100V20Z', fill: 'currentColor' }] },
  { id: 'arrow-up', type: 'arrow', label: 'Flèche haut', icon: ArrowUp, color: '#D1D5DB', viewBox: '0 0 60 100', paths: [{ d: 'M20 100V30L10 40L30 20L50 40L40 30V100H20Z', fill: 'currentColor' }] },
  { id: 'arrow-down', type: 'arrow', label: 'Flèche bas', icon: ArrowDown, color: '#D1D5DB', viewBox: '0 0 60 100', paths: [{ d: 'M20 0V70L10 60L30 80L50 60L40 70V0H20Z', fill: 'currentColor' }] },
  { id: 'arrow-left-right', type: 'arrow', label: 'Flèche gauche-droite', icon: ArrowRight, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M0 30L20 10V20H80V10L100 30L80 50V40H20V50L0 30Z', fill: 'currentColor' }] },
  { id: 'arrow-right-block', type: 'arrow', label: 'Flèche bloc droite', icon: ArrowRight, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M0 0H60V15H80L100 30L80 45H60V60H0V0Z', fill: 'currentColor' }] },
  { id: 'banner-left', type: 'banner', label: 'Bannière gauche', icon: Square, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M0 0H80L100 30L80 60H0V0Z', fill: 'currentColor' }] },
  { id: 'banner-right', type: 'banner', label: 'Bannière droite', icon: Square, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M20 0H100V60H20L0 30L20 0Z', fill: 'currentColor' }] },
  { id: 'hexagon-banner', type: 'banner', label: 'Bannière hexagone', icon: Hexagon, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M15 0H85L100 30L85 60H15L0 30L15 0Z', fill: 'currentColor' }] },
  { id: 'oval-banner', type: 'banner', label: 'Bannière ovale', icon: Circle, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M50 0C77.6142 0 100 13.4315 100 30C100 46.5685 77.6142 60 50 60C22.3858 60 0 46.5685 0 30C0 13.4315 22.3858 0 50 0Z', fill: 'currentColor' }] },
  { id: 'speech-bubble', type: 'bubble', label: 'Bulle de dialogue', icon: MessageSquare, color: '#D1D5DB', viewBox: '0 0 100 80', paths: [{ d: 'M10 0H90C95.5228 0 100 4.47715 100 10V50C100 55.5228 95.5228 60 90 60H25L10 75L15 60H10C4.47715 60 0 55.5228 0 50V10C0 4.47715 4.47715 0 10 0Z', fill: 'currentColor' }] },
  { id: 'thought-bubble', type: 'bubble', label: 'Bulle de pensée', icon: MessageCircle, color: '#D1D5DB', viewBox: '0 0 100 80', paths: [{ d: 'M70 10C81.05 10 90 18.95 90 30C90 41.05 81.05 50 70 50H65C63.34 50 62 51.34 62 53C62 54.66 60.66 56 59 56C57.34 56 56 57.34 56 59C56 60.66 54.66 62 53 62C51.34 62 50 60.66 50 59C50 57.34 48.66 56 47 56C45.34 56 44 54.66 44 53C44 51.34 42.66 50 41 50H30C18.95 50 10 41.05 10 30C10 18.95 18.95 10 30 10H70ZM25 65C27.76 65 30 67.24 30 70C30 72.76 27.76 75 25 75C22.24 75 20 72.76 20 70C20 67.24 22.24 65 25 65ZM15 75C16.66 75 18 76.34 18 78C18 79.66 16.66 81 15 81C13.34 81 12 79.66 12 78C12 76.34 13.34 75 15 75Z', fill: 'currentColor' }] },
  { id: 'heart', type: 'heart', label: 'Cœur', icon: Heart, color: '#D1D5DB', viewBox: '0 0 100 90', paths: [{ d: 'M50 85L10 45C0 35 0 20 10 10C20 0 35 0 45 10L50 15L55 10C65 0 80 0 90 10C100 20 100 35 90 45L50 85Z', fill: 'currentColor' }] },
  { id: 'plus', type: 'plus', label: 'Plus', icon: Plus, color: '#D1D5DB', aspectRatio: 1, viewBox: '0 0 100 100', paths: [{ d: 'M35 0H65V35H100V65H65V100H35V65H0V35H35V0Z', fill: 'currentColor' }] },
  { id: 'cloud', type: 'cloud', label: 'Nuage', icon: Cloud, color: '#D1D5DB', viewBox: '0 0 100 60', paths: [{ d: 'M80 45C85.5228 45 90 40.5228 90 35C90 29.4772 85.5228 25 80 25C79.3 25 78.63 25.08 78 25.22C76.25 15.2 67.28 8 56.5 8C44.07 8 34 18.07 34 30.5C34 31.38 34.07 32.25 34.2 33.1C32.32 32.4 30.29 32 28.17 32C18.61 32 11 39.61 11 49.17C11 54.4 13.5 59.07 17.5 62H80C88.28 62 95 55.28 95 47C95 38.72 88.28 32 80 32V45Z', fill: 'currentColor' }] },
  { id: 'shield', type: 'shield', label: 'Bouclier', icon: Square, color: '#D1D5DB', viewBox: '0 0 100 120', paths: [{ d: 'M50 0L90 20V60C90 80 70 100 50 120C30 100 10 80 10 60V20L50 0Z', fill: 'currentColor' }] }
];

// Fonction utilitaire pour récupérer une forme par ID
export const getShapeById = (id: string): ShapeDefinition | undefined => {
  return shapes.find(shape => shape.id === id || shape.type === id);
};

// Alias pour compatibilité
export const allShapes = shapes;
export const basicShapes = shapes;
