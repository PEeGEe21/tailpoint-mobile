/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#008080',
          dark: '#35B8B2',
          blue: '#0294E2',
          lime: '#ADED22',
        },
        canvas: { light: '#F6F8FA', dark: '#0B1220' },
        surface: { light: '#FFFFFF', dark: '#111B2E' },
        ink: {
          light: '#122033',
          dark: '#F5F8FC',
          muted: '#667085',
          'muted-dark': '#AAB6C8',
        },
      },
      borderRadius: { control: '12px', card: '20px', sheet: '24px' },
    },
  },
  plugins: [],
};
