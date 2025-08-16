import type { CSSProperties } from 'react';

export interface TitleStylePreset {
  id: string;
  name: string;
  style: CSSProperties;
}

export interface TitlePreset {
  id: string;
  name: string;
  sample: string;
  description: string;
  idealUse: string;
  orientation: 'horizontal' | 'vertical';
  preset: {
    fontFamily: string;
    fontWeight?: number | string;
    fontSize: number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    letterSpacing?: number;
    lineHeight?: number;
  };
  stylePreset?: TitleStylePreset;
}

// Multi-layer composite title templates
export interface TitleCompositeLayer {
  text?: string;
  preset: {
    fontFamily: string;
    fontWeight?: number | string;
    fontSize: number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    letterSpacing?: number;
    lineHeight?: number;
  };
  stylePreset?: TitleStylePreset;
  offsetX?: number; // px
  offsetY?: number; // px
  zIndex?: number;  // insertion order helper; higher means on top
}

export interface TitleCompositePreset {
  id: string;
  name: string;
  sample: string;
  description: string;
  idealUse: string;
  orientation: 'horizontal' | 'vertical';
  layers: TitleCompositeLayer[];
}

// Only use fonts present in index.html
export const titlePresets: TitlePreset[] = [
  {
    id: 'cyber-glow',
    name: 'Cyber Glow',
    sample: 'CYBER GLOW',
    description: 'Techno futuriste avec glow cyan multi-niveaux.',
    idealUse: 'Gaming, tech, streaming overlays, YouTube thumbnails',
    orientation: 'horizontal',
    preset: { fontFamily: 'Orbitron', fontWeight: 700, fontSize: 48, color: '#E6FDFF', textAlign: 'center', letterSpacing: 1 },
    stylePreset: { id: 'glow-cyan-strong', name: 'Glow Cyan', style: { textShadow: '0 0 6px #00e5ff,0 0 12px #00e5ff,0 0 24px #00e5ff,0 0 36px #00e5ff' } }
  },
  {
    id: 'retro-sunset',
    name: 'Retro Sunset',
    sample: 'RETRO SUNSET',
    description: 'Dégradé sunset 80s avec ombre douce.',
    idealUse: 'Affiches rétro, playlists, stories IG',
    orientation: 'horizontal',
    preset: { fontFamily: 'Righteous', fontWeight: 700, fontSize: 52, textAlign: 'center', letterSpacing: 1 },
    stylePreset: { id: 'gradient-sunset', name: 'Sunset Gradient', style: { backgroundImage: 'linear-gradient(180deg,#ffb347,#ff7096 60%,#ff3c78)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 6px 16px rgba(255,60,120,0.35)' } }
  },
  {
    id: 'luxury-serif-gold',
    name: 'Luxury Serif',
    sample: 'GOLDEN HOUR',
    description: 'Serif premium doré avec léger relief.',
    idealUse: 'Luxe, joaillerie, hôtels, mode',
    orientation: 'horizontal',
    preset: { fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 56, color: '#d4af37', textAlign: 'center', letterSpacing: 0.5 },
    stylePreset: { id: 'gold-emboss', name: 'Gold Emboss', style: { textShadow: '0 1px 0 #8a6e21, 0 2px 6px rgba(0,0,0,0.25)' } }
  },
  {
    id: 'kawaii-bubble',
    name: 'Kawaii Bubble',
    sample: 'SUPER KAWAII',
    description: 'Bubble pastel avec contour épais.',
    idealUse: 'Kids, kawaii, stickers, miniatures YouTube',
    orientation: 'horizontal',
    preset: { fontFamily: 'Fredoka One', fontWeight: 700, fontSize: 54, color: '#ffffff', textAlign: 'center', letterSpacing: 0.5 },
    stylePreset: { id: 'bubble-outline-pastel', name: 'Pastel Bubble', style: { WebkitTextStroke: '10px #ff6ec7', textShadow: '0 6px 0 #c23a88, 0 12px 16px rgba(0,0,0,0.25)' } }
  },
  {
    id: 'vaporwave-rgb',
    name: 'Vaporwave RGB',
    sample: 'PRESS START',
    description: 'Split RGB rétro avec effet glitch léger.',
    idealUse: 'Gaming, synthwave, flyers évènements',
    orientation: 'horizontal',
    preset: { fontFamily: 'Press Start 2P', fontSize: 34, color: '#ffffff', textAlign: 'center', letterSpacing: 2 },
    stylePreset: { id: 'rgb-shift', name: 'RGB Shift', style: { textShadow: '2px 0 0 #f00, -2px 0 0 #0ff, 0 2px 0 #0f0' } }
  },
  {
    id: 'street-paint',
    name: 'Street Paint',
    sample: 'CUSTOM PAINT',
    description: 'Brush nerveux + sans serif percutant.',
    idealUse: 'Street food, urban, concerts',
    orientation: 'horizontal',
    preset: { fontFamily: 'Permanent Marker', fontWeight: 400, fontSize: 48, color: '#ff5722', textAlign: 'left' },
    stylePreset: { id: 'spray-rough', name: 'Spray Rough', style: { textShadow: '0 2px 0 #1b1b1b, 0 6px 12px rgba(0,0,0,0.5)' } }
  },
  {
    id: 'extrusion-3d',
    name: '3D Extrusion',
    sample: 'GAME OVER',
    description: 'Extrusion 3D via couches de shadow.',
    idealUse: 'Miniatures YouTube gaming, affiches évènementielles',
    orientation: 'horizontal',
    preset: { fontFamily: 'Bowlby One', fontWeight: 700, fontSize: 52, color: '#ff307a', textAlign: 'center' },
    stylePreset: { id: 'multi-shadow-3d', name: 'Multi Shadow 3D', style: { textShadow: '1px 1px 0 #0bd3ff, 2px 2px 0 #0bd3ff, 3px 3px 0 #0bd3ff, 4px 4px 0 #0bd3ff, 6px 6px 12px rgba(0,0,0,0.4)' } }
  },
  {
    id: 'outline-impact',
    name: 'Outline Impact',
    sample: "LET'S PARTY!",
    description: 'Bold cartoon avec contour blanc + drop shadow.',
    idealUse: 'Flyers fête, stories IG, TikTok covers',
    orientation: 'horizontal',
    preset: { fontFamily: 'Luckiest Guy', fontWeight: 700, fontSize: 50, color: '#ff0044', textAlign: 'center' },
    stylePreset: { id: 'white-outline', name: 'White Outline', style: { WebkitTextStroke: '8px #ffffff', textShadow: '0 8px 14px rgba(0,0,0,0.35)' } }
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    sample: 'soft pastel',
    description: 'Dégradé pastel soyeux + graisse medium.',
    idealUse: 'Lifestyle, bien-être, stories, carrousels',
    orientation: 'horizontal',
    preset: { fontFamily: 'Comfortaa', fontWeight: 600, fontSize: 44, textAlign: 'center', letterSpacing: 0.5 },
    stylePreset: { id: 'pastel-gradient', name: 'Pastel Gradient', style: { backgroundImage: 'linear-gradient(90deg,#ffd1ff,#e0c3fc,#8ec5fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } }
  },
  {
    id: 'comic-pop',
    name: 'Comic Pop',
    sample: 'COLOR POP',
    description: 'Cartoon bubble avec outline et ombre portée.',
    idealUse: 'Miniatures YouTube, gaming, enfants',
    orientation: 'horizontal',
    preset: { fontFamily: 'Bangers', fontWeight: 400, fontSize: 54, color: '#1a52ff', textAlign: 'center' },
    stylePreset: { id: 'pop-outline', name: 'Pop Outline', style: { WebkitTextStroke: '10px #ffea00', textShadow: '0 10px 0 #ffd000, 0 18px 18px rgba(0,0,0,0.25)' } }
  },
  {
    id: 'neon-sign',
    name: 'Neon Sign',
    sample: 'NEON SIGN',
    description: 'Effet enseigne néon rose et halo diffus.',
    idealUse: 'Bars, nightlife, promos, thumbnails',
    orientation: 'horizontal',
    preset: { fontFamily: 'Shadows Into Light', fontWeight: 400, fontSize: 52, color: '#ff66cc', textAlign: 'center' },
    stylePreset: { id: 'pink-neon', name: 'Pink Neon', style: { textShadow: '0 0 6px #ff66cc, 0 0 12px #ff66cc, 0 0 24px #ff66cc, 0 0 36px #ff66cc' } }
  },
  {
    id: 'mint-glow',
    name: 'Mint Glow',
    sample: 'POOL PARTY',
    description: 'Glow aqua sur sans serif arrondi.',
    idealUse: 'Été, loisirs, event aquatique',
    orientation: 'horizontal',
    preset: { fontFamily: 'Varela Round', fontWeight: 600, fontSize: 48, color: '#a8fff1', textAlign: 'center' },
    stylePreset: { id: 'aqua-glow', name: 'Aqua Glow', style: { textShadow: '0 0 6px #13f6d0,0 0 16px #13f6d0' } }
  },
  {
    id: 'mono-contrast',
    name: 'Mono Contrast',
    sample: 'new MENU',
    description: 'Upper/lower contrastées pour style éditorial.',
    idealUse: 'Menus, posts éditoriaux, blogs',
    orientation: 'horizontal',
    preset: { fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 60, color: '#7db2ff', textAlign: 'left', lineHeight: 0.9 },
    stylePreset: { id: 'editorial', name: 'Editorial', style: { } }
  },
  {
    id: 'art-nouveau',
    name: 'Art Nouveau',
    sample: 'Art or NOT',
    description: 'Mix italique fin + small caps contrasté.',
    idealUse: 'Affiches art/design, expositions',
    orientation: 'horizontal',
    preset: { fontFamily: 'Cormorant', fontWeight: 500, fontSize: 56, color: '#ffffff', textAlign: 'center', lineHeight: 0.95 },
    stylePreset: { id: 'soft-shadow', name: 'Soft Shadow', style: { textShadow: '0 2px 10px rgba(0,0,0,0.35)' } }
  },
  {
    id: 'baked-fresh',
    name: 'Baked Fresh',
    sample: 'BAKED FRESH',
    description: 'Dégradé cuivre et crème façon pâtisserie.',
    idealUse: 'Boulangeries, food content, stories',
    orientation: 'horizontal',
    preset: { fontFamily: 'Bree Serif', fontWeight: 700, fontSize: 52, textAlign: 'center' },
    stylePreset: { id: 'copper-cream', name: 'Copper Cream', style: { backgroundImage: 'linear-gradient(180deg,#f0e0d6,#c27d54)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 3px 10px rgba(194,125,84,0.25)' } }
  },
  {
    id: 'cut-and-paste',
    name: 'Cut & Paste',
    sample: 'CUT & PASTE',
    description: 'Collage punk fluo avec superpositions.',
    idealUse: 'Flyers soirées, musique indie, posts edgy',
    orientation: 'horizontal',
    preset: { fontFamily: 'Fascinate', fontWeight: 400, fontSize: 50, color: '#111827', textAlign: 'left' },
    stylePreset: { id: 'sticker-shadow', name: 'Sticker Shadow', style: { WebkitTextStroke: '8px #b1ff00' } }
  },
  {
    id: 'tattoo-script',
    name: 'Tattoo Script',
    sample: 'Tattoo studio',
    description: 'Script élégant sombre, courbes fines.',
    idealUse: 'Tatoueurs, barbers, marques alternatives',
    orientation: 'horizontal',
    preset: { fontFamily: 'Great Vibes', fontWeight: 400, fontSize: 52, color: '#222', textAlign: 'center' },
    stylePreset: { id: 'black-gloss', name: 'Black Gloss', style: { textShadow: '0 2px 8px rgba(0,0,0,0.4)' } }
  },
  {
    id: 'now-open-neon',
    name: 'Now Open Neon',
    sample: 'Now Open!',
    description: 'Néon bleu halo doux et italique.',
    idealUse: 'Annonces ouverture, boutiques, restos',
    orientation: 'horizontal',
    preset: { fontFamily: 'Pacifico', fontWeight: 400, fontSize: 50, color: '#8ac7ff', textAlign: 'center' },
    stylePreset: { id: 'blue-neon', name: 'Blue Neon', style: { textShadow: '0 0 6px #4fa3ff,0 0 16px #4fa3ff' } }
  },
  {
    id: 'sine-wave',
    name: 'Sine Wave',
    sample: 'shares are appreciated!',
    description: 'Effet vague via spacing + skew léger.',
    idealUse: 'CTA subtils, signatures, posts fun',
    orientation: 'horizontal',
    preset: { fontFamily: 'Kalam', fontWeight: 600, fontSize: 28, color: '#b0e77e', textAlign: 'center', letterSpacing: 2 },
    stylePreset: { id: 'wavy', name: 'Wavy', style: { transform: 'skewX(-5deg)' } }
  },
  {
    id: 'big-sale-duo',
    name: 'Big Sale Duo',
    sample: 'BIG sale',
    description: 'Caps bold + script fin en overlay.',
    idealUse: 'Promotions retail, e-commerce',
    orientation: 'horizontal',
    preset: { fontFamily: 'Sigmar One', fontWeight: 700, fontSize: 64, color: '#c0c0ff', textAlign: 'left', lineHeight: 0.85 },
    stylePreset: { id: 'duo-overlay', name: 'Duo Overlay', style: { textShadow: '0 6px 12px rgba(0,0,0,0.35)' } }
  },
  {
    id: 'awesome-news',
    name: 'Awesome News',
    sample: 'Awesome NEWS',
    description: 'Sans serif propre avec contraste de casse.',
    idealUse: 'Annonces, newsletters visuelles',
    orientation: 'horizontal',
    preset: { fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 50, color: '#ff7a59', textAlign: 'left' }
  },
  {
    id: 'happy-hour-neon',
    name: 'Happy Hour',
    sample: 'HAPPY HOUR',
    description: 'Néon lime très lumineux.',
    idealUse: 'Bars, pubs, événements',
    orientation: 'horizontal',
    preset: { fontFamily: 'Righteous', fontWeight: 700, fontSize: 50, color: '#c9ff7a', textAlign: 'center' },
    stylePreset: { id: 'lime-neon', name: 'Lime Neon', style: { textShadow: '0 0 6px #9dff00,0 0 18px #9dff00' } }
  },
  {
    id: 'great-work-stack',
    name: 'Great Work Stack',
    sample: 'great work!',
    description: 'Empilement avec ombre portée volumineuse.',
    idealUse: 'Posts félicitations, réseaux sociaux',
    orientation: 'horizontal',
    preset: { fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 48, color: '#5f77ff', textAlign: 'left', lineHeight: 0.9 },
    stylePreset: { id: 'stack-shadow', name: 'Stack Shadow', style: { textShadow: '0 10px 0 #c7d0ff, 0 18px 14px rgba(0,0,0,0.25)' } }
  },
  {
    id: 'mystic-gradient',
    name: 'Mystic Tours',
    sample: 'MYSTIC',
    description: 'Dégradé bleu-vert mystique + léger bevel.',
    idealUse: 'Voyages, aventure, nature',
    orientation: 'horizontal',
    preset: { fontFamily: 'Orbitron', fontWeight: 700, fontSize: 52, textAlign: 'center' },
    stylePreset: { id: 'teal-gradient', name: 'Teal Gradient', style: { backgroundImage: 'linear-gradient(90deg,#4ade80,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 10px rgba(34,211,238,0.35)' } }
  },
  {
    id: 'static-grunge',
    name: 'Static Grunge',
    sample: 'static',
    description: 'Grunge jaune acide avec contours irréguliers.',
    idealUse: 'Musique alternative, contenus edgy',
    orientation: 'horizontal',
    preset: { fontFamily: 'Special Elite', fontWeight: 400, fontSize: 46, color: '#d6ff00', textAlign: 'center' },
    stylePreset: { id: 'acid', name: 'Acid', style: { textShadow: '0 3px 12px rgba(214,255,0,0.45)' } }
  },
  {
    id: 'family-time-serif',
    name: 'Family Time',
    sample: 'Family Time',
    description: 'Serif chaleureux et doré discret.',
    idealUse: 'Famille, blogs, lifestyle',
    orientation: 'horizontal',
    preset: { fontFamily: 'Merriweather', fontWeight: 700, fontSize: 44, color: '#d1b67a', textAlign: 'center' },
    stylePreset: { id: 'warm-shadow', name: 'Warm Shadow', style: { textShadow: '0 2px 6px rgba(0,0,0,0.2)' } }
  },
  {
    id: 'birthday-script',
    name: 'Birthday Script',
    sample: 'Happy BIRTHDAY',
    description: 'Script festif + sans serif en contraste.',
    idealUse: 'Anniversaire, fêtes, cartes',
    orientation: 'horizontal',
    preset: { fontFamily: 'Lobster', fontWeight: 400, fontSize: 50, color: '#ffffff', textAlign: 'center' },
    stylePreset: { id: 'soft-glow', name: 'Soft Glow', style: { textShadow: '0 2px 14px rgba(255,100,180,0.4)' } }
  },
  {
    id: 'street-food-neon',
    name: 'Street Food',
    sample: 'STREET FOOD',
    description: 'Glow blanc brut et gras.',
    idealUse: 'Street food, bars, urban',
    orientation: 'horizontal',
    preset: { fontFamily: 'Shrikhand', fontWeight: 400, fontSize: 50, color: '#ffffff', textAlign: 'center' },
    stylePreset: { id: 'white-glow', name: 'White Glow', style: { textShadow: '0 0 8px rgba(255,255,255,0.75), 0 0 22px #fff' } }
  },
  {
    id: 'revenue-growth',
    name: 'Revenue Growth',
    sample: 'REVENUE GROWTH',
    description: 'Sans-serif géant menthe + outline sombre.',
    idealUse: 'Business slides, thumbnails business',
    orientation: 'horizontal',
    preset: { fontFamily: 'Sora', fontWeight: 800, fontSize: 60, color: '#b9ffd8', textAlign: 'center', letterSpacing: 1 },
    stylePreset: { id: 'mint-outline', name: 'Mint Outline', style: { WebkitTextStroke: '8px #1b2832' } }
  },
  {
    id: 'stay-fearless',
    name: 'Stay Fearless',
    sample: 'Stay Fearless',
    description: 'Script rouge énergique italique.',
    idealUse: 'Motivation, sport, lifestyle',
    orientation: 'horizontal',
    preset: { fontFamily: 'Kaushan Script', fontWeight: 400, fontSize: 52, color: '#ff3b3b', textAlign: 'left' },
    stylePreset: { id: 'red-ink', name: 'Red Ink', style: { textShadow: '0 3px 12px rgba(255,59,59,0.35)' } }
  },
  {
    id: 'feelin-cute',
    name: "Feelin' Cute",
    sample: "FEELIN' CUTE",
    description: 'Rounded turquoise + outline rose.',
    idealUse: 'Kawaii, lifestyle fun, stories',
    orientation: 'horizontal',
    preset: { fontFamily: 'Varela Round', fontWeight: 800, fontSize: 52, color: '#baffff', textAlign: 'center' },
    stylePreset: { id: 'cute-outline', name: 'Cute Outline', style: { WebkitTextStroke: '10px #ff79c6' } }
  },
  {
    id: 'game-over-rgb',
    name: 'Game Over',
    sample: 'GAME OVER',
    description: 'RGB split + extrusion légère.',
    idealUse: 'Gaming, arcades, streams',
    orientation: 'horizontal',
    preset: { fontFamily: 'Orbitron', fontWeight: 800, fontSize: 52, color: '#ffffff', textAlign: 'center' },
    stylePreset: { id: 'rgb-extrude', name: 'RGB Extrude', style: { textShadow: '2px 0 #0ff, -2px 0 #f0f, 0 2px #0f0, 0 6px 18px rgba(0,0,0,0.4)' } }
  },
  {
    id: 'comic-cartoon',
    name: 'Comic Cartoon',
    sample: 'COMIC CARTOON',
    description: 'Cartoon rose + outline cyan.',
    idealUse: 'Kids, comics, fun content',
    orientation: 'horizontal',
    preset: { fontFamily: 'Luckiest Guy', fontWeight: 400, fontSize: 50, color: '#ff4fa3', textAlign: 'center' },
    stylePreset: { id: 'cyan-outline', name: 'Cyan Outline', style: { WebkitTextStroke: '9px #00e5ff' } }
  },
  {
    id: 'espresso-menu',
    name: 'Espresso Menu',
    sample: 'ESPRESSO',
    description: 'Caps serif doré sobre pour menus.',
    idealUse: 'Restaurants, cafés, cartes',
    orientation: 'horizontal',
    preset: { fontFamily: 'Cinzel', fontWeight: 700, fontSize: 44, color: '#d7b06a', textAlign: 'left', letterSpacing: 1 },
    stylePreset: { id: 'menu-shadow', name: 'Menu Shadow', style: { textShadow: '0 2px 8px rgba(0,0,0,0.25)' } }
  },
  {
    id: 'awesome-outline',
    name: 'Awesome Outline',
    sample: 'WOW!',
    description: 'Calligraphie noir profond sans remplissage.',
    idealUse: 'Affiches arty, citations',
    orientation: 'horizontal',
    preset: { fontFamily: 'Homemade Apple', fontWeight: 400, fontSize: 58, color: 'transparent', textAlign: 'center' },
    stylePreset: { id: 'black-stroke', name: 'Black Stroke', style: { WebkitTextStroke: '3px #111' } }
  },
  {
    id: 'vertical-neon',
    name: 'Vertical Neon',
    sample: 'NEON',
    description: 'Orientation verticale avec glow vert.',
    idealUse: 'Affiches urbaines, side banners',
    orientation: 'vertical',
    preset: { fontFamily: 'Righteous', fontWeight: 700, fontSize: 56, color: '#c0ff7a', textAlign: 'center', letterSpacing: 1 },
    stylePreset: { id: 'green-glow', name: 'Green Glow', style: { textShadow: '0 0 8px #7dff5f, 0 0 22px #7dff5f' } }
  },
  {
    id: 'diagonal-punch',
    name: 'Diagonal Punch',
    sample: 'NEW DROP',
    description: 'Alignement décalé + ombre dure.',
    idealUse: 'Drops produit, streetwear',
    orientation: 'horizontal',
    preset: { fontFamily: 'Bungee', fontWeight: 700, fontSize: 54, color: '#ff6b6b', textAlign: 'left' },
    stylePreset: { id: 'hard-shadow', name: 'Hard Shadow', style: { transform: 'skewX(-8deg)', textShadow: '8px 8px 0 #111' } }
  },
  {
    id: 'shadow-poster',
    name: 'Shadow Poster',
    sample: 'POSTER',
    description: 'Large caps avec ombre postérisée.',
    idealUse: 'Affiches musique, cinéma',
    orientation: 'horizontal',
    preset: { fontFamily: 'Titan One', fontWeight: 700, fontSize: 62, color: '#ffffff', textAlign: 'center' },
    stylePreset: { id: 'posterize', name: 'Posterize', style: { textShadow: '0 1px 0 #222, 0 14px 0 #222, 0 20px 24px rgba(0,0,0,0.45)' } }
  },
  {
    id: 'cream-outline',
    name: 'Cream Outline',
    sample: 'CREAMY',
    description: 'Outline crème + remplissage lavande.',
    idealUse: 'Beauté, lifestyle, food doux',
    orientation: 'horizontal',
    preset: { fontFamily: 'Lilita One', fontWeight: 700, fontSize: 52, color: '#bca7ff', textAlign: 'center' },
    stylePreset: { id: 'cream-stroke', name: 'Cream Stroke', style: { WebkitTextStroke: '8px #fff2d6' } }
  },
  {
    id: 'editorial-serif-sans',
    name: 'Editorial Mix',
    sample: 'New Story',
    description: 'Serif + sans en contraste tailles.',
    idealUse: 'Magazines, blogs, portfolios',
    orientation: 'horizontal',
    preset: { fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 58, color: '#111', textAlign: 'left', lineHeight: 0.95 }
  },
  {
    id: 'glamp-neon',
    name: 'Glamping Neon',
    sample: 'Glamping',
    description: 'Script doux avec glow violet.',
    idealUse: 'Tourisme, lifestyle premium',
    orientation: 'horizontal',
    preset: { fontFamily: 'Parisienne', fontWeight: 400, fontSize: 56, color: '#e4bfff', textAlign: 'center' },
    stylePreset: { id: 'violet-neon', name: 'Violet Neon', style: { textShadow: '0 0 6px #b087ff,0 0 16px #b087ff' } }
  },
  {
    id: 'business-model',
    name: 'Business Model',
    sample: 'BUSINESS MODEL',
    description: 'Serif noir fin, très sobre et premium.',
    idealUse: 'Slides business, rapports',
    orientation: 'horizontal',
    preset: { fontFamily: 'Cormorant', fontWeight: 500, fontSize: 52, color: '#111', textAlign: 'center', letterSpacing: 1 }
  },
  {
    id: 'golden-serif',
    name: 'Golden Serif',
    sample: 'GOLDEN',
    description: 'Serif doré élégant.',
    idealUse: 'Mariages, évènements chic',
    orientation: 'horizontal',
    preset: { fontFamily: 'Cinzel', fontWeight: 700, fontSize: 54, color: '#d4af37', textAlign: 'center' },
    stylePreset: { id: 'gold-soft', name: 'Gold Soft', style: { textShadow: '0 3px 10px rgba(168,134,36,0.35)' } }
  },
  {
    id: 'wavy-script',
    name: 'Wavy Script',
    sample: 'celebration!',
    description: 'Arc courbé (usage d’alignement sur canevas).',
    idealUse: 'Fêtes, célébrations',
    orientation: 'horizontal',
    preset: { fontFamily: 'Alex Brush', fontWeight: 400, fontSize: 58, color: '#6db1ff', textAlign: 'center' },
    stylePreset: { id: 'subtle-glow', name: 'Subtle Glow', style: { textShadow: '0 2px 10px rgba(109,177,255,0.35)' } }
  },
  {
    id: 'menu-editorial',
    name: 'Menu Editorial',
    sample: 'new MENU',
    description: 'Sans géométrique bleu, style éditorial.',
    idealUse: 'Restaurants, cartes modernes',
    orientation: 'horizontal',
    preset: { fontFamily: 'Manrope', fontWeight: 800, fontSize: 56, color: '#7db2ff', textAlign: 'left' }
  },
  {
    id: 'neon-pink-mini',
    name: 'Glow Pink',
    sample: 'GLOW',
    description: 'Glow rose minimaliste.',
    idealUse: 'Stories, promos, nightlife',
    orientation: 'horizontal',
    preset: { fontFamily: 'Righteous', fontWeight: 700, fontSize: 50, color: '#ff8ad6', textAlign: 'center' },
    stylePreset: { id: 'pink-glow', name: 'Pink Glow', style: { textShadow: '0 0 6px #ff8ad6,0 0 18px #ff8ad6' } }
  },
  {
    id: 'green-lit',
    name: 'Green Lit',
    sample: 'GREEN LIT',
    description: 'Glow vert dramatique.',
    idealUse: 'Gaming, tech, nightlife',
    orientation: 'horizontal',
    preset: { fontFamily: 'Bowlby One', fontWeight: 700, fontSize: 54, color: '#cfff7a', textAlign: 'center' },
    stylePreset: { id: 'green-outer', name: 'Green Outer', style: { textShadow: '0 0 6px #9dff00,0 0 22px #5bff00' } }
  },
  {
    id: 'pool-party',
    name: 'Pool Party',
    sample: 'POOL PARTY',
    description: 'Rounded aqua + ombre douce.',
    idealUse: 'Été, fun, loisirs',
    orientation: 'horizontal',
    preset: { fontFamily: 'Varela Round', fontWeight: 800, fontSize: 52, color: '#b6fff6', textAlign: 'center' },
    stylePreset: { id: 'pool-glow', name: 'Pool Glow', style: { textShadow: '0 0 10px rgba(0,255,214,0.4)' } }
  },
  {
    id: 'press-start-glitch',
    name: 'Press Start',
    sample: 'PRESS START',
    description: 'Pixel retro + glitch léger.',
    idealUse: 'Retro gaming, pixels, arcades',
    orientation: 'horizontal',
    preset: { fontFamily: 'Press Start 2P', fontSize: 34, color: '#a0f3ff', textAlign: 'center', letterSpacing: 2 },
    stylePreset: { id: 'glitch-lite', name: 'Glitch Lite', style: { textShadow: '2px 0 #f00,-2px 0 #0ff' } }
  }
];

// Composite presets using multiple layers (fonts + effects), aligned with examples
export const compositeTitlePresets: TitleCompositePreset[] = [
  {
    id: 'beach-please-duo',
    name: 'Beach Please Duo',
    sample: 'Beach Please',
    description: 'Deux scripts superposés aux couleurs surf (aqua + jaune) avec léger décalage.',
    idealUse: 'Été, vacances, lifestyle',
    orientation: 'horizontal',
    layers: [
      {
        text: 'Beach',
        preset: { fontFamily: 'Pacifico', fontWeight: 400, fontSize: 56, color: '#74e8e7', textAlign: 'left', letterSpacing: 0.5 },
        stylePreset: { id: 'beach-back', name: 'Aqua Back', style: { WebkitTextStroke: '6px #0aa7a0', textShadow: '6px 6px 0 rgba(0,0,0,0.15)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'Please',
        preset: { fontFamily: 'Pacifico', fontWeight: 400, fontSize: 52, color: '#ffd058', textAlign: 'left' },
        stylePreset: { id: 'beach-front', name: 'Sunny Front', style: { textShadow: '2px 2px 0 rgba(0,0,0,0.15)' } },
        offsetX: 100,
        offsetY: 14,
        zIndex: 2
      }
    ]
  },
  {
    id: 'you-are-the-best',
    name: 'You Are The Best',
    sample: 'You are the\nbest',
    description: 'Heading mix: petite ligne sans serif + script épais avec contour.',
    idealUse: 'Compliments, social, stickers',
    orientation: 'horizontal',
    layers: [
      {
        text: 'YOU ARE THE',
        preset: { fontFamily: 'Manrope', fontWeight: 800, fontSize: 22, color: '#a1f29b', textAlign: 'left', letterSpacing: 1.5 },
        stylePreset: { id: 'small-caps-soft', name: 'Small Caps', style: { textShadow: '0 2px 4px rgba(0,0,0,0.15)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'best',
        preset: { fontFamily: 'Lobster', fontWeight: 400, fontSize: 64, color: '#22c55e', textAlign: 'left', lineHeight: 0.9 },
        stylePreset: { id: 'best-outline', name: 'Best Outline', style: { WebkitTextStroke: '8px #ffffff', textShadow: '0 10px 16px rgba(0,0,0,0.25)' } },
        offsetX: 0,
        offsetY: 18,
        zIndex: 2
      }
    ]
  },
  {
    id: 'green-lit-stack-composite',
    name: 'Green LIT Stack',
    sample: 'GREEN\nLIT',
    description: 'Deux lignes empilées: petit "GREEN" + grand "LIT" avec glow.',
    idealUse: 'Gaming, tech, nightlife',
    orientation: 'horizontal',
    layers: [
      {
        text: 'GREEN',
        preset: { fontFamily: 'Bowlby One', fontWeight: 700, fontSize: 36, color: '#2bd96f', textAlign: 'left' },
        stylePreset: { id: 'green-top', name: 'Green Top', style: { textShadow: '0 4px 8px rgba(43,217,111,0.35)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'LIT',
        preset: { fontFamily: 'Bowlby One', fontWeight: 700, fontSize: 72, color: '#b6ff83', textAlign: 'left', letterSpacing: 1 },
        stylePreset: { id: 'green-lit-glow', name: 'Green Glow', style: { textShadow: '0 0 10px #7fff00, 0 0 22px #58ff00' } },
        offsetX: 10,
        offsetY: 26,
        zIndex: 2
      }
    ]
  },
  {
    id: 'be-brave-outline-composite',
    name: 'Be Brave Outline',
    sample: 'BE BRAVE',
    description: 'Double couche: outline violet épais + remplissage lavande au-dessus.',
    idealUse: 'Motivation, posters, stories',
    orientation: 'horizontal',
    layers: [
      {
        text: 'BE BRAVE',
        preset: { fontFamily: 'Lilita One', fontWeight: 700, fontSize: 56, color: 'transparent', textAlign: 'center', letterSpacing: 1 },
        stylePreset: { id: 'brave-stroke', name: 'Brave Stroke', style: { WebkitTextStroke: '10px #6b21a8' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'BE BRAVE',
        preset: { fontFamily: 'Lilita One', fontWeight: 700, fontSize: 56, color: '#c4b5fd', textAlign: 'center', letterSpacing: 1 },
        stylePreset: { id: 'brave-fill', name: 'Brave Fill', style: { textShadow: '0 6px 12px rgba(0,0,0,0.25)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 2
      }
    ]
  },
  {
    id: 'comic-cartoon-duo',
    name: 'Comic Cartoon Duo',
    sample: 'COMIC\nCARTOON',
    description: 'Titre fun en deux styles: gros "COMIC" aqua avec contour + sous-titre rose.',
    idealUse: 'Cartoons, enfants, thumbnails YouTube',
    orientation: 'horizontal',
    layers: [
      {
        text: 'COMIC',
        preset: { fontFamily: 'Luckiest Guy', fontWeight: 400, fontSize: 64, color: '#61F0E9', textAlign: 'center', letterSpacing: 1 },
        stylePreset: { id: 'comic-outline', name: 'Comic Outline', style: { WebkitTextStroke: '6px #0aa7a0', textShadow: '0 4px 0 rgba(0,0,0,0.25)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'CARTOON',
        preset: { fontFamily: 'Fredoka One', fontWeight: 400, fontSize: 32, color: '#ff2d8f', textAlign: 'center', letterSpacing: 1 },
        stylePreset: { id: 'cartoon-clean', name: 'Cartoon Clean', style: { textShadow: '0 2px 4px rgba(0,0,0,0.18)' } },
        offsetX: 0,
        offsetY: 50,
        zIndex: 2
      }
    ]
  },
  {
    id: 'not-old-vintage',
    name: 'Not old, VINTAGE.',
    sample: 'Not old,\nVINTAGE.',
    description: 'Petit chapeau serif italique gris + grand titre serif bleu vintage.',
    idealUse: 'Affiches rétro, éditorial, citations',
    orientation: 'horizontal',
    layers: [
      {
        text: 'Not old,',
        preset: { fontFamily: 'Lora', fontWeight: 400, fontSize: 28, color: '#c0c0c0', textAlign: 'left', letterSpacing: 0.5, lineHeight: 1.1 },
        stylePreset: { id: 'subtle-italic', name: 'Subtle Italic', style: { fontStyle: 'italic', textShadow: '0 2px 4px rgba(0,0,0,0.20)' } as any },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'VINTAGE.',
        preset: { fontFamily: 'Cinzel', fontWeight: 600, fontSize: 58, color: '#5f7cff', textAlign: 'left', letterSpacing: 0.5 },
        stylePreset: { id: 'vintage-blue', name: 'Vintage Blue', style: { textShadow: '0 4px 10px rgba(0,0,0,0.25)' } },
        offsetX: 0,
        offsetY: 26,
        zIndex: 2
      }
    ]
  },
  {
    id: 'scary-story-duo',
    name: 'Scary story',
    sample: 'SCARY\nstory',
    description: 'Gros titre horreur gris + script rouge agressif.',
    idealUse: 'Horreur, Halloween, stories',
    orientation: 'horizontal',
    layers: [
      {
        text: 'SCARY',
        preset: { fontFamily: 'Jolly Lodger', fontWeight: 400, fontSize: 62, color: '#bdbdbd', textAlign: 'left', letterSpacing: 1 },
        stylePreset: { id: 'scary-grunge', name: 'Scary Grunge', style: { textShadow: '0 2px 6px rgba(0,0,0,0.35)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'story',
        preset: { fontFamily: 'Permanent Marker', fontWeight: 400, fontSize: 46, color: '#ff4b4b', textAlign: 'left' },
        stylePreset: { id: 'blood-red', name: 'Blood Red', style: { textShadow: '0 3px 8px rgba(0,0,0,0.35)' } },
        offsetX: 8,
        offsetY: 40,
        zIndex: 2
      }
    ]
  },
  {
    id: 'street-vibes-duo',
    name: 'Street Vibes',
    sample: 'STREET\nVibes',
    description: 'Titre percutant style street + script chill.',
    idealUse: 'Streetwear, events, flyers',
    orientation: 'horizontal',
    layers: [
      {
        text: 'STREET',
        preset: { fontFamily: 'Bangers', fontWeight: 400, fontSize: 64, color: '#10F1F1', textAlign: 'left', letterSpacing: 1 },
        stylePreset: { id: 'street-stroke', name: 'Street Stroke', style: { WebkitTextStroke: '6px #111111', textShadow: '0 5px 0 rgba(0,0,0,0.35)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'Vibes',
        preset: { fontFamily: 'Satisfy', fontWeight: 400, fontSize: 48, color: '#f472b6', textAlign: 'left' },
        stylePreset: { id: 'vibes-soft', name: 'Vibes Soft', style: { textShadow: '0 2px 6px rgba(0,0,0,0.25)' } },
        offsetX: 12,
        offsetY: 40,
        zIndex: 2
      }
    ]
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    sample: 'NEON\nnights',
    description: 'Gros néon turquoise + script violet.',
    idealUse: 'Bar, events, nightlife',
    orientation: 'horizontal',
    layers: [
      {
        text: 'NEON',
        preset: { fontFamily: 'Bowlby One', fontWeight: 700, fontSize: 68, color: '#3cffff', textAlign: 'left' },
        stylePreset: { id: 'neon-glow', name: 'Neon Glow', style: { textShadow: '0 0 8px #00e5ff, 0 0 18px #00e5ff' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'nights',
        preset: { fontFamily: 'Lobster', fontWeight: 400, fontSize: 44, color: '#a78bfa', textAlign: 'left' },
        stylePreset: { id: 'purple-soft', name: 'Purple Soft', style: { textShadow: '0 4px 10px rgba(167,139,250,0.45)' } },
        offsetX: 10,
        offsetY: 46,
        zIndex: 2
      }
    ]
  },
  {
    id: 'ice-cream-duo',
    name: 'Ice Cream',
    sample: 'ICE\ncream',
    description: 'Titre gourmand aqua + script rose.',
    idealUse: 'Food, desserts, posters',
    orientation: 'horizontal',
    layers: [
      {
        text: 'ICE',
        preset: { fontFamily: 'Fredoka One', fontWeight: 400, fontSize: 64, color: '#78f0ff', textAlign: 'left' },
        stylePreset: { id: 'ice-stroke', name: 'Ice Stroke', style: { WebkitTextStroke: '6px #0ea5a3' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'cream',
        preset: { fontFamily: 'Pacifico', fontWeight: 400, fontSize: 46, color: '#ff6ba8', textAlign: 'left' },
        stylePreset: { id: 'cream-soft', name: 'Cream Soft', style: { textShadow: '0 2px 6px rgba(0,0,0,0.25)' } },
        offsetX: 6,
        offsetY: 44,
        zIndex: 2
      }
    ]
  },
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    sample: 'GOLD\nluxury',
    description: 'Cinzel doré + sous-titre serif fin.',
    idealUse: 'Luxe, marque, affiches premium',
    orientation: 'horizontal',
    layers: [
      {
        text: 'GOLD',
        preset: { fontFamily: 'Cinzel', fontWeight: 600, fontSize: 64, color: '#FFD166', textAlign: 'left' },
        stylePreset: { id: 'gold-shadow', name: 'Gold Shadow', style: { textShadow: '0 6px 14px rgba(0,0,0,0.35)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'luxury',
        preset: { fontFamily: 'Cormorant', fontWeight: 400, fontSize: 30, color: '#9CA3AF', textAlign: 'left', letterSpacing: 2 },
        stylePreset: { id: 'luxury-clean', name: 'Luxury Clean', style: {} },
        offsetX: 4,
        offsetY: 50,
        zIndex: 2
      }
    ]
  },
  {
    id: 'sport-energy',
    name: 'Sport Energy',
    sample: 'SPORT\nenergy',
    description: 'Titre puissant + sous-titre moderne.',
    idealUse: 'Sport, fitness, banners',
    orientation: 'horizontal',
    layers: [
      {
        text: 'SPORT',
        preset: { fontFamily: 'Titan One', fontWeight: 400, fontSize: 66, color: '#fb923c', textAlign: 'left' },
        stylePreset: { id: 'sport-depth', name: 'Sport Depth', style: { textShadow: '0 8px 14px rgba(0,0,0,0.35)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'energy',
        preset: { fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, color: '#34d399', textAlign: 'left', letterSpacing: 2 },
        stylePreset: { id: 'energy-tight', name: 'Energy Tight', style: {} },
        offsetX: 4,
        offsetY: 48,
        zIndex: 2
      }
    ]
  },
  {
    id: 'retro-wave',
    name: 'Retro Wave',
    sample: 'RETRO\nWAVE',
    description: 'Retro pixels + techno moderne.',
    idealUse: 'Retro gaming, synthwave',
    orientation: 'horizontal',
    layers: [
      {
        text: 'RETRO',
        preset: { fontFamily: 'Press Start 2P', fontWeight: 400, fontSize: 28, color: '#7CFC00', textAlign: 'left', letterSpacing: 2 },
        stylePreset: { id: 'retro-pixel', name: 'Retro Pixel', style: { textShadow: '0 0 10px rgba(124,252,0,0.55)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'WAVE',
        preset: { fontFamily: 'Orbitron', fontWeight: 700, fontSize: 56, color: '#ff6bd6', textAlign: 'left' },
        stylePreset: { id: 'wave-glow', name: 'Wave Glow', style: { textShadow: '0 0 12px rgba(255,107,214,0.55)' } },
        offsetX: 6,
        offsetY: 24,
        zIndex: 2
      }
    ]
  },
  {
    id: 'fresh-juice',
    name: 'Fresh Juice',
    sample: 'FRESH\njuice',
    description: 'Titre vert punchy + script orange.',
    idealUse: 'Food, smoothies, social',
    orientation: 'horizontal',
    layers: [
      {
        text: 'FRESH',
        preset: { fontFamily: 'Lilita One', fontWeight: 700, fontSize: 60, color: '#22c55e', textAlign: 'left' },
        stylePreset: { id: 'fresh-glow', name: 'Fresh Glow', style: { textShadow: '0 6px 12px rgba(0,0,0,0.25)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'juice',
        preset: { fontFamily: 'Pacifico', fontWeight: 400, fontSize: 44, color: '#fb923c', textAlign: 'left' },
        stylePreset: { id: 'juice-soft', name: 'Juice Soft', style: { textShadow: '0 3px 10px rgba(0,0,0,0.25)' } },
        offsetX: 12,
        offsetY: 40,
        zIndex: 2
      }
    ]
  },
  {
    id: 'urban-graffiti',
    name: 'Urban Graffiti',
    sample: 'URBAN\ngraffiti',
    description: 'Marqueur urbain blanc + serif grunge jaune.',
    idealUse: 'Street art, covers, events',
    orientation: 'horizontal',
    layers: [
      {
        text: 'URBAN',
        preset: { fontFamily: 'Permanent Marker', fontWeight: 400, fontSize: 62, color: '#ffffff', textAlign: 'left' },
        stylePreset: { id: 'urban-stroke', name: 'Urban Stroke', style: { WebkitTextStroke: '6px #111111' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'graffiti',
        preset: { fontFamily: 'Special Elite', fontWeight: 400, fontSize: 36, color: '#facc15', textAlign: 'left' },
        stylePreset: { id: 'grunge-noise', name: 'Grunge Noise', style: { textShadow: '0 3px 6px rgba(0,0,0,0.35)' } },
        offsetX: 14,
        offsetY: 46,
        zIndex: 2
      }
    ]
  },
  {
    id: 'elegant-beauty',
    name: 'Elegant Beauty',
    sample: 'Elegant\nBeauty',
    description: 'Serif élégant + script raffiné.',
    idealUse: 'Beauté, éditorial, luxe',
    orientation: 'horizontal',
    layers: [
      {
        text: 'Elegant',
        preset: { fontFamily: 'Playfair Display', fontWeight: 600, fontSize: 48, color: '#e5e7eb', textAlign: 'left' },
        stylePreset: { id: 'elegant-soft', name: 'Elegant Soft', style: { textShadow: '0 2px 8px rgba(0,0,0,0.25)', fontStyle: 'italic' } as any },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'Beauty',
        preset: { fontFamily: 'Parisienne', fontWeight: 400, fontSize: 54, color: '#a78bfa', textAlign: 'left' },
        stylePreset: { id: 'beauty-glow', name: 'Beauty Glow', style: { textShadow: '0 6px 12px rgba(167,139,250,0.45)' } },
        offsetX: 10,
        offsetY: 30,
        zIndex: 2
      }
    ]
  },
  {
    id: 'festival-summer',
    name: 'Festival Summer',
    sample: 'FESTIVAL\nsummer',
    description: 'Titre festif jaune + script corail.',
    idealUse: 'Festival, musique, été',
    orientation: 'horizontal',
    layers: [
      {
        text: 'FESTIVAL',
        preset: { fontFamily: 'Bungee', fontWeight: 400, fontSize: 56, color: '#fde047', textAlign: 'left' },
        stylePreset: { id: 'festival-stroke', name: 'Festival Stroke', style: { WebkitTextStroke: '4px #111827' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'summer',
        preset: { fontFamily: 'Lobster', fontWeight: 400, fontSize: 46, color: '#fb7185', textAlign: 'left' },
        stylePreset: { id: 'summer-soft', name: 'Summer Soft', style: { textShadow: '0 4px 10px rgba(251,113,133,0.45)' } },
        offsetX: 8,
        offsetY: 38,
        zIndex: 2
      }
    ]
  },
  {
    id: 'mystic-night',
    name: 'Mystic Night',
    sample: 'MYSTIC\nnight',
    description: 'Serif mystique + script lumineux.',
    idealUse: 'Citations, affiches, fantasy',
    orientation: 'horizontal',
    layers: [
      {
        text: 'MYSTIC',
        preset: { fontFamily: 'Cormorant', fontWeight: 600, fontSize: 54, color: '#60a5fa', textAlign: 'left' },
        stylePreset: { id: 'mystic-soft', name: 'Mystic Soft', style: { textShadow: '0 6px 14px rgba(0,0,0,0.35)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'night',
        preset: { fontFamily: 'Tangerine', fontWeight: 700, fontSize: 64, color: '#ffffff', textAlign: 'left' },
        stylePreset: { id: 'night-glow', name: 'Night Glow', style: { textShadow: '0 0 12px rgba(255,255,255,0.8)' } },
        offsetX: 12,
        offsetY: 26,
        zIndex: 2
      }
    ]
  },
  {
    id: 'game-start',
    name: 'Game Start',
    sample: 'GAME\nSTART',
    description: 'Futur techno + pixel retro.',
    idealUse: 'Gaming overlays, stream',
    orientation: 'horizontal',
    layers: [
      {
        text: 'GAME',
        preset: { fontFamily: 'Orbitron', fontWeight: 700, fontSize: 52, color: '#c7d2fe', textAlign: 'left' },
        stylePreset: { id: 'game-glow', name: 'Game Glow', style: { textShadow: '0 0 12px rgba(199,210,254,0.6)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'START',
        preset: { fontFamily: 'Press Start 2P', fontWeight: 400, fontSize: 28, color: '#22d3ee', textAlign: 'left', letterSpacing: 2 },
        stylePreset: { id: 'start-neon', name: 'Start Neon', style: { textShadow: '0 0 10px rgba(34,211,238,0.7)' } },
        offsetX: 8,
        offsetY: 34,
        zIndex: 2
      }
    ]
  },
  {
    id: 'coffee-break',
    name: 'Coffee Break',
    sample: 'COFFEE\nbreak',
    description: 'Titres café bruns + script crème.',
    idealUse: 'Cafés, stories, menus',
    orientation: 'horizontal',
    layers: [
      {
        text: 'COFFEE',
        preset: { fontFamily: 'Merriweather', fontWeight: 700, fontSize: 50, color: '#8B5E3C', textAlign: 'left' },
        stylePreset: { id: 'coffee-shadow', name: 'Coffee Shadow', style: { textShadow: '0 6px 12px rgba(0,0,0,0.25)' } },
        offsetX: 0,
        offsetY: 0,
        zIndex: 1
      },
      {
        text: 'break',
        preset: { fontFamily: 'Courgette', fontWeight: 400, fontSize: 42, color: '#f5e6d3', textAlign: 'left' },
        stylePreset: { id: 'cream-soft', name: 'Cream Soft', style: { textShadow: '0 2px 8px rgba(0,0,0,0.25)' } },
        offsetX: 10,
        offsetY: 30,
        zIndex: 2
      }
    ]
  }
];
