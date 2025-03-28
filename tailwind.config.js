/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F4D03F',
          DEFAULT: '#DAA520',
          dark: '#B8860B',
        },
        gold: {
          50: '#FDF6E3',
          100: '#FCF3D6',
          200: '#F9E4A9',
          300: '#F6D57C',
          400: '#F4C64F',
          500: '#DAA520',
          600: '#B8860B',
          700: '#956C09',
          800: '#725207',
          900: '#4F3805',
        },
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
