/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent colors from logo
        teal: {
          DEFAULT: '#4FD1C5',
          50: '#E6F9F7',
          100: '#CCF3EF',
          200: '#99E7DF',
          300: '#66DBCF',
          400: '#4FD1C5',
          500: '#3DB8AD',
          600: '#2A9F95',
          700: '#20867D',
          800: '#156D65',
          900: '#0B544D',
        },
        aqua: {
          DEFAULT: '#5EEAD4',
          50: '#E6FBF8',
          100: '#CCF7F1',
          200: '#99EFE3',
          300: '#66E7D5',
          400: '#5EEAD4',
          500: '#4BD4C0',
          600: '#38BEAC',
          700: '#2EA896',
          800: '#249280',
          900: '#1A7C6A',
        },
        'soft-green': {
          DEFAULT: '#6EE7B7',
          50: '#E6FBF3',
          100: '#CCF7E7',
          200: '#99EFCF',
          300: '#66E7B7',
          400: '#6EE7B7',
          500: '#5BD1A0',
          600: '#48BB89',
          700: '#3BA572',
          800: '#2E8F5B',
          900: '#217944',
        },
        // Background system
        'app-bg': '#0E1116',
        'sidebar-bg': '#12161D',
        'card-bg': '#181D26',
        'card-hover': '#1F2530',
        'border': '#2A2F3A',
        // Text colors
        'text-primary': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
