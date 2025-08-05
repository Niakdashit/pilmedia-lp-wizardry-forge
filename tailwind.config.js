
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',    // 2px - pour les petits éléments
        DEFAULT: '0.25rem',  // 4px - par défaut réduit
        'md': '0.375rem',    // 6px - pour les cartes et boutons
        'lg': '0.5rem',      // 8px - pour les grandes cartes
        'xl': '0.75rem',     // 12px - pour les conteneurs principaux
        '2xl': '1rem',       // 16px - pour les grands conteneurs
        '3xl': '1.5rem',     // 24px - maximum pour les éléments spéciaux
        'full': '9999px',    // pour les cercles
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        'brand': ['Titan One', 'Impact', 'Bebas Neue', 'Oswald', 'Anton', 'sans-serif'],
        'sifonn': ['Titan One', 'Impact', 'Bebas Neue', 'sans-serif'],
        'impact': ['Impact', 'Bebas Neue', 'Oswald', 'sans-serif'],
        'condensed': ['Bebas Neue', 'Oswald', 'Anton', 'Impact', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],
        'lobster': ['Lobster', 'cursive'],
      },
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          950: '#0f172a',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        brand: {
          DEFAULT: 'hsl(328 75% 31%)',
          secondary: 'hsl(328 75% 40%)',
          gradient: 'var(--brand-gradient)',
        },
        'brand-dark': 'hsl(328 75% 25%)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'var(--brand-gradient)',
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'glass-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'glass-hover': '0 8px 12px -2px rgb(0 0 0 / 0.05), 0 4px 8px -4px rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}
