
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito Sans"', 'Poppins', 'Inter', 'sans-serif'],
        brand: ['Poppins', '"Nunito Sans"', 'sans-serif'],
        sifonn: ['Poppins', '"Nunito Sans"', 'sans-serif'],
        impact: ['Poppins', 'Oswald', 'sans-serif'],
        condensed: ['Poppins', 'Oswald', '"Nunito Sans"', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        lobster: ['Lobster', 'cursive'],
      },
      colors: {
        primary: {
          50: '#FFF5F8',
          100: '#FFE6ED',
          200: '#FFC0D0',
          300: '#FF8BAA',
          400: '#FF4F7F',
          500: '#E0004D',
          600: '#C00044',
          700: '#990036',
          800: '#730029',
          900: '#4D001C',
          950: '#2E0011',
        },
        accent: {
          50: '#F6EEFF',
          100: '#E9D9FF',
          200: '#D3B4FF',
          300: '#B88DFF',
          400: '#9F68F7',
          500: '#7E3FD6',
          600: '#642EB0',
          700: '#4D2388',
          800: '#371761',
          900: '#230D3F',
          950: '#160729',
        },
        brand: '#E0004D',
        'brand-dark': '#5C2D91'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
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
