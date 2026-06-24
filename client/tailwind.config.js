/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      colors: {
        // Light mode tokens
        canvas: '#F5F5F7',
        surface: '#FFFFFF',
        ink: '#1D1D1F',
        muted: '#6E6E73',
        hairline: '#D2D2D7',
        accent: '#B45309',
        success: '#34C759',
        warning: '#FF9F0A',
        danger: '#FF3B30',
        // Dark mode tokens
        'canvas-dark': '#000000',
        'surface-dark': '#1C1C1E',
        'ink-dark': '#F5F5F7',
        'muted-dark': '#98989D',
        'hairline-dark': '#38383A',
        'accent-dark': '#B45309',
      },
      borderRadius: {
        '2xl': '16px',
        xl: '12px',
      },
      boxShadow: {
        soft: '0 2px 20px rgba(0,0,0,0.06)',
        'soft-lg': '0 8px 40px rgba(0,0,0,0.10)',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
