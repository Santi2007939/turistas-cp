/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Caracal Matte Design System
        caracal: {
          bg: '#FCF9F5',
          card: '#FFFFFF',
          border: '#EAE3DB',
          text: '#2D2622',
          icon: '#4A3B33',
          badge: '#F2E9E1',
          primary: '#8B5E3C',
          'primary-hover': '#7A5235',
          secondary: '#D4A373',
          'secondary-hover': '#C49565',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      borderRadius: {
        'caracal': '16px',
        'caracal-btn': '12px',
      },
      boxShadow: {
        'caracal': '0 2px 8px rgba(74, 59, 51, 0.05)',
      },
    },
  },
  plugins: [],
}

