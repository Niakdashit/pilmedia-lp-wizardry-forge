export interface FontOption {
  value: string;
  label: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'artistic' | 'monospace' | 'fun' | 'branded';
  preview?: string;
}

export const fontCategories = {
  'sans-serif': 'Sans Serif',
  'serif': 'Serif', 
  'display': 'Display',
  'handwriting': 'Handwriting',
  'artistic': 'Artistic & Script',
  'monospace': 'Monospace',
  'fun': 'Fun & Creative',
  'branded': 'Branded Style'
};

export const fontOptions: FontOption[] = [
  // Sans Serif
  { value: 'Inter, sans-serif', label: 'Inter', category: 'sans-serif' },
  { value: 'Roboto, sans-serif', label: 'Roboto', category: 'sans-serif' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans', category: 'sans-serif' },
  { value: 'Lato, sans-serif', label: 'Lato', category: 'sans-serif' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat', category: 'sans-serif' },
  { value: 'Poppins, sans-serif', label: 'Poppins', category: 'sans-serif' },
  { value: 'Nunito, sans-serif', label: 'Nunito', category: 'sans-serif' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro', category: 'sans-serif' },
  { value: 'Raleway, sans-serif', label: 'Raleway', category: 'sans-serif' },
  { value: 'Ubuntu, sans-serif', label: 'Ubuntu', category: 'sans-serif' },
  { value: 'Work Sans, sans-serif', label: 'Work Sans', category: 'sans-serif' },
  { value: 'Fira Sans, sans-serif', label: 'Fira Sans', category: 'sans-serif' },
  { value: 'Rubik, sans-serif', label: 'Rubik', category: 'sans-serif' },
  { value: 'Quicksand, sans-serif', label: 'Quicksand', category: 'sans-serif' },
  { value: 'Comfortaa, sans-serif', label: 'Comfortaa', category: 'sans-serif' },
  { value: 'Kanit, sans-serif', label: 'Kanit', category: 'sans-serif' },
  { value: 'Exo 2, sans-serif', label: 'Exo 2', category: 'sans-serif' },
  { value: 'Arial, sans-serif', label: 'Arial', category: 'sans-serif' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica', category: 'sans-serif' },
  { value: 'Verdana, sans-serif', label: 'Verdana', category: 'sans-serif' },

  // Serif
  { value: 'Playfair Display, serif', label: 'Playfair Display', category: 'serif' },
  { value: 'Merriweather, serif', label: 'Merriweather', category: 'serif' },
  { value: 'Georgia, serif', label: 'Georgia', category: 'serif' },
  { value: 'Times New Roman, serif', label: 'Times New Roman', category: 'serif' },
  { value: 'Palatino, serif', label: 'Palatino', category: 'serif' },

  // Display
  { value: 'Oswald, sans-serif', label: 'Oswald', category: 'display' },
  { value: 'Bebas Neue, sans-serif', label: 'Bebas Neue', category: 'display' },
  { value: 'Anton, sans-serif', label: 'Anton', category: 'display' },
  { value: 'Fjalla One, sans-serif', label: 'Fjalla One', category: 'display' },
  { value: 'Russo One, sans-serif', label: 'Russo One', category: 'display' },
  { value: 'Righteous, sans-serif', label: 'Righteous', category: 'display' },
  { value: 'Impact, sans-serif', label: 'Impact', category: 'display' },
  { value: 'Orbitron, sans-serif', label: 'Orbitron', category: 'display' },
  { value: 'Audiowide, sans-serif', label: 'Audiowide', category: 'display' },

  // Handwriting & Script
  { value: 'Dancing Script, cursive', label: 'Dancing Script', category: 'handwriting' },
  { value: 'Pacifico, cursive', label: 'Pacifico', category: 'handwriting' },
  { value: 'Lobster, cursive', label: 'Lobster', category: 'handwriting' },
  { value: 'Great Vibes, cursive', label: 'Great Vibes', category: 'handwriting' },
  { value: 'Sacramento, cursive', label: 'Sacramento', category: 'handwriting' },
  { value: 'Satisfy, cursive', label: 'Satisfy', category: 'handwriting' },
  { value: 'Cookie, cursive', label: 'Cookie', category: 'handwriting' },
  { value: 'Caveat, cursive', label: 'Caveat', category: 'handwriting' },
  { value: 'Kalam, cursive', label: 'Kalam', category: 'handwriting' },
  { value: 'Architects Daughter, cursive', label: 'Architects Daughter', category: 'handwriting' },
  { value: 'Shadows Into Light, cursive', label: 'Shadows Into Light', category: 'handwriting' },
  { value: 'Indie Flower, cursive', label: 'Indie Flower', category: 'handwriting' },
  { value: 'Permanent Marker, cursive', label: 'Permanent Marker', category: 'handwriting' },

  // Artistic & Script (polices très artistiques de TestPage)
  { value: 'Kaushan Script, cursive', label: 'Kaushan Script', category: 'artistic' },
  { value: 'Tangerine, cursive', label: 'Tangerine', category: 'artistic' },
  { value: 'Yellowtail, cursive', label: 'Yellowtail', category: 'artistic' },
  { value: 'Pinyon Script, cursive', label: 'Pinyon Script', category: 'artistic' },
  { value: 'Marck Script, cursive', label: 'Marck Script', category: 'artistic' },
  { value: 'Allura, cursive', label: 'Allura', category: 'artistic' },
  { value: 'Homemade Apple, cursive', label: 'Homemade Apple', category: 'artistic' },
  { value: 'Covered By Your Grace, cursive', label: 'Covered By Your Grace', category: 'artistic' },
  { value: 'Rock Salt, cursive', label: 'Rock Salt', category: 'artistic' },

  // Fun & Creative
  { value: 'Fredoka One, cursive', label: 'Fredoka One', category: 'fun' },
  { value: 'Bungee, cursive', label: 'Bungee', category: 'fun' },
  { value: 'Bangers, cursive', label: 'Bangers', category: 'fun' },
  { value: 'Creepster, cursive', label: 'Creepster', category: 'fun' },
  { value: 'Amatic SC, cursive', label: 'Amatic SC', category: 'fun' },
  { value: 'Press Start 2P, cursive', label: 'Press Start 2P', category: 'fun' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS', category: 'fun' },

  // Monospace
  { value: 'Anonymous Pro, monospace', label: 'Anonymous Pro', category: 'monospace' },
  { value: 'Courier New, monospace', label: 'Courier New', category: 'monospace' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono', category: 'monospace' },

  // Branded Style (inspiré des styles Canva)
  { value: 'Belleza, sans-serif', label: 'Belleza', category: 'branded' },
  { value: 'Binate, sans-serif', label: 'Binate', category: 'branded' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS', category: 'branded' },
];

// Simplified font options for basic selectors
export const simpleFontOptions = fontOptions.map(font => ({
  value: font.value,
  label: font.label
}));

// Get fonts by category
export const getFontsByCategory = (category: FontOption['category']) => {
  return fontOptions.filter(font => font.category === category);
};

// Font sizes
export const fontSizeOptions = [
  { value: 'xs', label: '12px' },
  { value: 'sm', label: '14px' },
  { value: 'base', label: '16px' },
  { value: 'lg', label: '18px' },
  { value: 'xl', label: '20px' },
  { value: '2xl', label: '24px' },
  { value: '3xl', label: '28px' },
  { value: '4xl', label: '32px' },
  { value: '5xl', label: '36px' },
  { value: '6xl', label: '48px' },
  { value: '7xl', label: '60px' },
  { value: '8xl', label: '72px' },
  { value: '9xl', label: '96px' }
];

// Simple font sizes for basic selectors
export const simpleFontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];