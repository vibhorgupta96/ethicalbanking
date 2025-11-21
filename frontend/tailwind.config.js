/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        secondary: '#134e4a',
        accent: '#facc15'
      }
    }
  },
  plugins: []
};

