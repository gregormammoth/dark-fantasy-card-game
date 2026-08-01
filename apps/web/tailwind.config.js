/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        spectral: ['var(--font-spectral)', 'serif'],
      },
      colors: {
        ash: {
          950: '#0b0807',
          900: '#100c0b',
          800: '#161110',
          700: '#241512',
        },
        ember: {
          400: '#e0b552',
          500: '#c9a24a',
          600: '#a67c3a',
        },
        parchment: {
          100: '#f0dfcb',
          200: '#e8ddcf',
          400: '#b7ab9c',
          500: '#8a7f72',
        },
      },
    },
  },
  plugins: [],
};
