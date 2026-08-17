/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — adjust once the team picks a name/identity
        brand: {
          DEFAULT: '#f97316', // warm orange — roads, clay, chai
          dark: '#c2410c',
          light: '#ffedd5',
        },
        earth: {
          DEFAULT: '#78716c', // muted stone for secondary text
          light: '#f5f5f4',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
