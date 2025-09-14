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
