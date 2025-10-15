/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      // Define our new color palette
      colors: {
        primary: {
          DEFAULT: '#2563eb', // Blue for buttons and links
          hover: '#1d4ed8'   // Darker blue for hover
        },
        danger: {
          DEFAULT: '#dc2626', // Red for logout/delete
          hover: '#b91c1c'   // Darker red for hover
        },
        success: {
          DEFAULT: '#16a34a', // Green for success
          hover: '#15803d'   // Darker green for hover
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          500: '#64748b',
          700: '#334155',
          800: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}