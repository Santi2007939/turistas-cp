/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Caracal Palette - Matte-Drift Design System
        caracal: {
          bg: '#FCF9F5',
          card: '#FFFFFF',
          border: '#EAE3DB',
          text: '#2D2622',
          btn: '#8B5E3C',
          icon: '#4A3B33',
          sand: '#D4A373',
        },
        primary: {
          50: '#FCF9F5',
          100: '#EAE3DB',
          200: '#D4A373',
          300: '#C49A6C',
          400: '#A67C52',
          500: '#8B5E3C',
          600: '#7A5235',
          700: '#69462E',
          800: '#4A3B33',
          900: '#2D2622',
        },
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'matte': '12px',
      },
      spacing: {
        'matte': '24px',
      },
    },
  },
  plugins: [],
}

