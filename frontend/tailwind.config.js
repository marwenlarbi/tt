/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#8657ff',
        'primary-dark': '#6a45cc',
        'secondary': '#f3f4f6',
        'dark-gray': '#121212',
        'dark-card': '#1e1e1e',
        'dark-accent': '#2d2d2d',
        'custom-purple': '#6B46C1', // Purple thumb for both modes
        'custom-light-track': '#E5E7EB', // Light gray track for light mode
        'custom-dark-track': '#1F2937', // Dark track for dark mode
      },
      backgroundColor: {
        'dark-gray': '#121212',
        'dark-card': '#1e1e1e',
      },
      textColor: {
        'dark-text': '#e0e0e0',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};