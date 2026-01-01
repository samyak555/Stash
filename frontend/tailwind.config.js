/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // STASH Logo-Aligned Color System
        // Primary / Trust (navigation, headers)
        'deep-blue': {
          DEFAULT: '#1E3A8A',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#1E40AF',
        },
        'teal-blue': {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#1E40AF',
        },
        // Insight / Intelligence
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
        // Growth / Success
        'light-green': {
          DEFAULT: '#6EE7B7',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        'dark-green': {
          DEFAULT: '#166534',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#166534',
          900: '#064E3B',
        },
        // Legacy support (map to new colors)
        teal: {
          DEFAULT: '#2563EB', // Map to teal-blue
        },
        'soft-green': {
          DEFAULT: '#6EE7B7', // Map to light-green
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
