import type { TextEffect } from '../stores/useTextEffectsStore';

export const modernTextEffects: TextEffect[] = [
  // BASIC EFFECTS
  {
    id: 'none',
    name: 'Aucun',
    category: 'basic',
    preview: 'ABC',
    css: {},
  },
  {
    id: 'basic-shadow',
    name: 'Ombre simple',
    category: 'basic',
    preview: 'ABC',
    css: {
      textShadow: 'calc($intensity / 20)px calc($intensity / 20)px calc($blur / 10)px rgba(0, 0, 0, $opacity)',
    },
    controls: {
      intensity: { min: 0, max: 100, default: 30 },
      blur: { min: 0, max: 100, default: 20 },
      opacity: { min: 0, max: 100, default: 50 },
    },
  },

  // SHADOW EFFECTS
  {
    id: 'drop-shadow',
    name: 'Ombre portée',
    category: 'shadow',
    preview: 'ABC',
    css: {
      filter: 'drop-shadow(calc($intensity / 10)px calc($intensity / 10)px calc($blur / 5)px rgba(0, 0, 0, $opacity))',
    },
    controls: {
      intensity: { min: 0, max: 100, default: 40 },
      blur: { min: 0, max: 100, default: 30 },
      opacity: { min: 0, max: 100, default: 60 },
    },
  },
  {
    id: 'inner-shadow',
    name: 'Ombre interne',
    category: 'shadow',
    preview: 'ABC',
    css: {
      textShadow: 'inset calc($intensity / 20)px calc($intensity / 20)px calc($blur / 10)px rgba(0, 0, 0, $opacity)',
      filter: 'invert(1)',
    },
    controls: {
      intensity: { min: 0, max: 100, default: 20 },
      blur: { min: 0, max: 100, default: 10 },
      opacity: { min: 0, max: 100, default: 40 },
    },
  },
  {
    id: 'long-shadow',
    name: 'Ombre longue',
    category: 'shadow',
    preview: 'ABC',
    css: {
      textShadow: '1px 1px 0 rgba(0,0,0,$opacity), 2px 2px 0 rgba(0,0,0,$opacity), 3px 3px 0 rgba(0,0,0,$opacity), 4px 4px 0 rgba(0,0,0,$opacity), 5px 5px 0 rgba(0,0,0,$opacity), 6px 6px 0 rgba(0,0,0,$opacity), 7px 7px 0 rgba(0,0,0,$opacity), 8px 8px 0 rgba(0,0,0,$opacity)',
    },
    controls: {
      opacity: { min: 0, max: 100, default: 30 },
    },
  },
  {
    id: 'perspective-shadow',
    name: 'Ombre perspective',
    category: 'shadow',
    preview: 'ABC',
    css: {
      transform: 'perspective(500px) rotateX(15deg)',
      textShadow: '0px calc($intensity / 5)px calc($blur / 5)px rgba(0, 0, 0, $opacity)',
    },
    controls: {
      intensity: { min: 0, max: 100, default: 50 },
      blur: { min: 0, max: 100, default: 40 },
      opacity: { min: 0, max: 100, default: 50 },
    },
  },

  // OUTLINE EFFECTS
  {
    id: 'stroke-outline',
    name: 'Contour trait',
    category: 'outline',
    preview: 'ABC',
    css: {
      WebkitTextStroke: 'calc($intensity / 25)px $color',
      color: 'transparent',
    },
    controls: {
      intensity: { min: 1, max: 100, default: 50 },
      color: { default: '#000000' },
    },
  },
  {
    id: 'double-outline',
    name: 'Double contour',
    category: 'outline',
    preview: 'ABC',
    css: {
      textShadow: '-1px -1px 0 $color, 1px -1px 0 $color, -1px 1px 0 $color, 1px 1px 0 $color, -2px -2px 0 rgba(255,255,255,$opacity), 2px -2px 0 rgba(255,255,255,$opacity), -2px 2px 0 rgba(255,255,255,$opacity), 2px 2px 0 rgba(255,255,255,$opacity)',
    },
    controls: {
      color: { default: '#000000' },
      opacity: { min: 0, max: 100, default: 80 },
    },
  },
  {
    id: 'glow-outline',
    name: 'Contour lumineux',
    category: 'outline',
    preview: 'ABC',
    css: {
      textShadow: '0 0 calc($intensity / 10)px $color, 0 0 calc($intensity / 5)px $color, 0 0 calc($intensity / 2)px $color',
    },
    controls: {
      intensity: { min: 1, max: 100, default: 40 },
      color: { default: '#00ffff' },
    },
  },

  // GRADIENT EFFECTS
  {
    id: 'linear-gradient',
    name: 'Dégradé linéaire',
    category: 'gradient',
    preview: 'ABC',
    css: {
      background: 'linear-gradient($angledeg, $color, #ff00ff)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
    },
    controls: {
      angle: { min: 0, max: 360, default: 45 },
      color: { default: '#ff0080' },
    },
  },
  {
    id: 'radial-gradient',
    name: 'Dégradé radial',
    category: 'gradient',
    preview: 'ABC',
    css: {
      background: 'radial-gradient(circle, $color, #000000)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    controls: {
      color: { default: '#ff6b35' },
    },
  },
  {
    id: 'rainbow-gradient',
    name: 'Arc-en-ciel',
    category: 'gradient',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundSize: '400% 400%',
      animation: 'rainbow-shift 3s ease-in-out infinite',
    },
  },
  {
    id: 'holographic',
    name: 'Holographique',
    category: 'gradient',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #ff0080)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundSize: '300% 300%',
      animation: 'hologram-shift 2s ease-in-out infinite',
    },
  },

  // 3D EFFECTS
  {
    id: 'extruded-3d',
    name: '3D extrudé',
    category: '3d',
    preview: 'ABC',
    css: {
      textShadow: '1px 1px 0px #ccc, 2px 2px 0px #c9c9c9, 3px 3px 0px #bbb, 4px 4px 0px #b9b9b9, 5px 5px 0px #aaa, 6px 6px 1px rgba(0,0,0,.1), 0px 0px 5px rgba(0,0,0,.1), 1px 1px 3px rgba(0,0,0,.3), 3px 3px 5px rgba(0,0,0,.2), 5px 5px 10px rgba(0,0,0,.25)',
      transform: 'perspective(500px) rotateY(calc($angle / 10)deg) rotateX(10deg)',
    },
    controls: {
      angle: { min: -100, max: 100, default: 15 },
    },
  },
  {
    id: 'beveled-3d',
    name: '3D biseauté',
    category: '3d',
    preview: 'ABC',
    css: {
      textShadow: 'inset 2px 2px 4px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.3), 2px 2px 8px rgba(0,0,0,0.3)',
      background: 'linear-gradient(145deg, #f0f0f0, #cacaca)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
    },
  },
  {
    id: 'isometric-3d',
    name: '3D isométrique',
    category: '3d',
    preview: 'ABC',
    css: {
      transform: 'perspective(500px) rotateX(30deg) rotateY(calc($angle)deg)',
      textShadow: 'calc($intensity / 20)px calc($intensity / 30)px 0px rgba(0,0,0,0.3), calc($intensity / 10)px calc($intensity / 15)px 0px rgba(0,0,0,0.2)',
    },
    controls: {
      intensity: { min: 0, max: 100, default: 40 },
      angle: { min: -45, max: 45, default: -15 },
    },
  },

  // NEON EFFECTS
  {
    id: 'classic-neon',
    name: 'Néon classique',
    category: 'neon',
    preview: 'ABC',
    css: {
      color: '$color',
      textShadow: '0 0 calc($intensity / 10)px $color, 0 0 calc($intensity / 5)px $color, 0 0 calc($intensity / 2)px $color, 0 0 calc($intensity)px $color',
    },
    controls: {
      intensity: { min: 5, max: 100, default: 30 },
      color: { default: '#ff00ff' },
    },
  },
  {
    id: 'electric-neon',
    name: 'Néon électrique',
    category: 'neon',
    preview: 'ABC',
    css: {
      color: '$color',
      textShadow: '0 0 calc($intensity / 20)px $color, 0 0 calc($intensity / 10)px $color, 0 0 calc($intensity / 5)px $color, 0 0 calc($intensity / 2)px $color, 0 0 calc($intensity)px $color',
      animation: 'electric-flicker 0.1s infinite',
    },
    controls: {
      intensity: { min: 10, max: 100, default: 50 },
      color: { default: '#00ffff' },
    },
  },
  {
    id: 'tube-neon',
    name: 'Tube néon',
    category: 'neon',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(90deg, transparent, $color, transparent)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 calc($intensity / 5)px $color',
      filter: 'blur(0.5px)',
    },
    controls: {
      intensity: { min: 5, max: 100, default: 25 },
      color: { default: '#39ff14' },
    },
  },

  // METALLIC EFFECTS
  {
    id: 'gold-metallic',
    name: 'Or métallique',
    category: 'metallic',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(145deg, #b8860b, #ffd700, #ffff00, #ffd700, #b8860b)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '2px 2px 4px rgba(0,0,0,$opacity)',
      filter: 'brightness(calc(100 + $metalness)%) contrast(calc(100 + $roughness)%)',
    },
    controls: {
      metalness: { min: 0, max: 100, default: 20 },
      roughness: { min: 0, max: 100, default: 10 },
      opacity: { min: 0, max: 100, default: 30 },
    },
  },
  {
    id: 'silver-metallic',
    name: 'Argent métallique',
    category: 'metallic',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(145deg, #708090, #c0c0c0, #ffffff, #c0c0c0, #708090)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '1px 1px 2px rgba(0,0,0,$opacity)',
      filter: 'brightness(calc(100 + $metalness)%) contrast(calc(100 + $roughness)%)',
    },
    controls: {
      metalness: { min: 0, max: 100, default: 15 },
      roughness: { min: 0, max: 100, default: 5 },
      opacity: { min: 0, max: 100, default: 25 },
    },
  },
  {
    id: 'copper-metallic',
    name: 'Cuivre métallique',
    category: 'metallic',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(145deg, #8B4513, #CD853F, #F4A460, #CD853F, #8B4513)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '2px 2px 3px rgba(139, 69, 19, $opacity)',
    },
    controls: {
      opacity: { min: 0, max: 100, default: 40 },
    },
  },

  // GLASS EFFECTS
  {
    id: 'frosted-glass',
    name: 'Verre dépoli',
    category: 'glass',
    preview: 'ABC',
    css: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(calc($blur / 10)px)',
      WebkitBackdropFilter: 'blur(calc($blur / 10)px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '8px 16px',
      textShadow: '0 0 calc($intensity / 10)px rgba(255, 255, 255, $opacity)',
    },
    controls: {
      blur: { min: 1, max: 100, default: 30 },
      intensity: { min: 0, max: 100, default: 20 },
      opacity: { min: 0, max: 100, default: 60 },
    },
  },
  {
    id: 'crystal-glass',
    name: 'Verre cristal',
    category: 'glass',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
      textShadow: '0 0 calc($intensity / 5)px rgba(255, 255, 255, $opacity), inset 0 0 calc($intensity / 10)px rgba(255, 255, 255, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      borderRadius: '4px',
      padding: '4px 12px',
    },
    controls: {
      intensity: { min: 5, max: 100, default: 30 },
      opacity: { min: 0, max: 100, default: 80 },
    },
  },

  // VINTAGE EFFECTS
  {
    id: 'retro-vintage',
    name: 'Rétro vintage',
    category: 'vintage',
    preview: 'ABC',
    css: {
      color: '#8B4513',
      textShadow: '2px 2px 0px #D2B48C, 4px 4px 0px #A0522D',
      filter: 'sepia(calc($intensity)%) contrast(120%)',
    },
    controls: {
      intensity: { min: 0, max: 100, default: 60 },
    },
  },
  {
    id: 'grunge-vintage',
    name: 'Grunge vintage',
    category: 'vintage',
    preview: 'ABC',
    css: {
      textShadow: '2px 2px 0px rgba(0,0,0,0.3), 4px 4px 0px rgba(0,0,0,0.2)',
      filter: 'sepia(40%) brightness(90%) contrast(calc(100 + $intensity)%)',
      background: 'linear-gradient(45deg, transparent, rgba(139, 69, 19, 0.1), transparent)',
    },
    controls: {
      intensity: { min: 0, max: 100, default: 30 },
    },
  },

  // GAMING EFFECTS
  {
    id: 'glitch-gaming',
    name: 'Glitch gaming',
    category: 'gaming',
    preview: 'ABC',
    css: {
      color: '$color',
      textShadow: 'calc($intensity / 25)px 0 #ff00ff, calc(-$intensity / 25)px 0 #00ffff',
      animation: 'glitch-effect 0.3s infinite',
    },
    controls: {
      intensity: { min: 1, max: 100, default: 50 },
      color: { default: '#ffffff' },
    },
  },
  {
    id: 'cyberpunk-gaming',
    name: 'Cyberpunk',
    category: 'gaming',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(45deg, #ff0080, #0080ff)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 calc($intensity / 10)px #ff0080, 0 0 calc($intensity / 5)px #0080ff',
    },
    controls: {
      intensity: { min: 5, max: 100, default: 40 },
    },
  },

  // LUXURY EFFECTS
  {
    id: 'diamond-luxury',
    name: 'Diamant luxe',
    category: 'luxury',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(45deg, #ffffff, #f0f8ff, #ffffff)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 1px 0 #ddd, 0 2px 0 #ccc, 0 3px 0 #bbb, 0 4px 0 #aaa, 0 5px 0 #999, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25)',
      filter: 'brightness(calc(110 + $intensity)%)',
    },
    controls: {
      intensity: { min: 0, max: 100, default: 20 },
    },
  },

  // DISTORTION EFFECTS
  {
    id: 'wave-distortion',
    name: 'Distorsion vague',
    category: 'distortion',
    preview: 'ABC',
    css: {
      filter: 'url(#wave-filter)',
      animation: 'wave-distort calc($intensity / 10)s ease-in-out infinite',
    },
    controls: {
      intensity: { min: 10, max: 100, default: 30 },
    },
  },
  {
    id: 'ripple-distortion',
    name: 'Distorsion ondulation',
    category: 'distortion',
    preview: 'ABC',
    css: {
      transform: 'perspective(400px) rotateX(calc($angle / 10)deg)',
      filter: 'url(#ripple-filter)',
    },
    controls: {
      angle: { min: -100, max: 100, default: 15 },
    },
  },

  // MATERIAL EFFECTS
  {
    id: 'fabric-material',
    name: 'Tissu',
    category: 'material',
    preview: 'ABC',
    css: {
      background: 'repeating-linear-gradient(45deg, $color, $color 2px, transparent 2px, transparent 4px)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    },
    controls: {
      color: { default: '#654321' },
    },
  },
  {
    id: 'wood-material',
    name: 'Bois',
    category: 'material',
    preview: 'ABC',
    css: {
      background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 25%, #CD853F 50%, #A0522D 75%, #8B4513 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: 'contrast(calc(120 + $roughness)%) brightness(calc(90 + $metalness)%)',
    },
    controls: {
      roughness: { min: 0, max: 100, default: 20 },
      metalness: { min: 0, max: 100, default: 10 },
    },
  },
];

// Categories for filtering
export const effectCategories = [
  { id: 'all', name: 'Tous', icon: '✨' },
  { id: 'basic', name: 'Basique', icon: '📝' },
  { id: 'shadow', name: 'Ombre', icon: '🌫️' },
  { id: 'outline', name: 'Contour', icon: '⭕' },
  { id: 'gradient', name: 'Dégradé', icon: '🌈' },
  { id: '3d', name: '3D', icon: '📦' },
  { id: 'neon', name: 'Néon', icon: '💡' },
  { id: 'metallic', name: 'Métal', icon: '⚡' },
  { id: 'glass', name: 'Verre', icon: '💎' },
  { id: 'vintage', name: 'Vintage', icon: '📻' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'luxury', name: 'Luxe', icon: '👑' },
  { id: 'distortion', name: 'Distorsion', icon: '🌊' },
  { id: 'material', name: 'Matériau', icon: '🪵' },
];