/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-dark': {
          // Custom brand-dark palette matching UI aesthetic
          bg: '#1A1B26',        // Deep dark slate-purple for main background
          surface: '#2A2C37',   // Slightly lighter for cards, headers, and surfaces
          'text-primary': '#E0E0E0',  // Off-white, easy-to-read primary text
          accent: '#7A89F0',    // Muted lavender for links, buttons, and highlights
          border: '#3A3C47',    // Subtle border color derived from surface
        },
        night: {
          // Custom night mode palette - lighter for better visibility
          bg: '#3C4043',        // Main background (lighter)
          surface: '#484C52',   // Cards and surfaces (lighter)
          header: '#525862',    // Header background (even lighter)
          text: {
            primary: '#F1F3F4',   // Primary text (brighter white)
            secondary: '#E0E6ED', // Secondary text (brighter)
            muted: '#BDC1C6',     // Muted text
          },
          accent: '#8AB4F8',    // Links and highlights (brighter blue)
          border: '#5F6368',    // Borders
        },
      },
    },
  },
  plugins: [],
}
