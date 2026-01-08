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
        // Safe Room Design System Colors
        'sr-background': '#F4F4F4',
        'sr-surface': '#FFFFFF',
        'sr-primary': '#1A1A1A',
        'sr-accent': '#FFB400',
        'sr-border': '#D1D1D1',
      },
      fontFamily: {
        'mono': ['Roboto Mono', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sr': '2px',
      },
      spacing: {
        'sr': '24px',
      },
    },
  },
  plugins: [],
}

