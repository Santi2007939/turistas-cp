/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
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
        // Kinetic Drift Design System
        'deep-sea': '#0F172A',
        'electric-blue': '#38BDF8',
        'card-bg': '#F8FAFC',
        'card-border': '#E2E8F0',
        'icon-gray': '#64748B',
      },
      borderRadius: {
        'kinetic': '8px',
      },
      fontFamily: {
        'sans': ['Public Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontWeight: {
        'body': '500',
        'heading': '700',
      },
    },
  },
  plugins: [],
}

