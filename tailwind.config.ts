
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tontine: {
          // Palette de verts avec des nuances
          'green-50': '#F0FFF4',   // Vert très clair
          'green-100': '#C6F6D5',  // Vert pastel
          'green-200': '#9AE6B4',  // Vert tendre
          'green-300': '#68D391',  // Vert moyen
          'green-400': '#48BB78',  // Vert principal
          'green-500': '#38A169',  // Vert foncé
          'green-600': '#2F855A',  // Vert profond
          'green-700': '#276749',  // Vert très foncé
        },
        // Dégradés de verts
        gradient: {
          'green-light': 'linear-gradient(135deg, #C6F6D5 0%, #9AE6B4 100%)',
          'green-medium': 'linear-gradient(135deg, #9AE6B4 0%, #48BB78 100%)',
          'green-dark': 'linear-gradient(135deg, #48BB78 0%, #2F855A 100%)',
        }
      },
      // Ajout d'animations et de transitions
      keyframes: {
        'green-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' }
        }
      },
      animation: {
        'green-pulse': 'green-pulse 2s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
