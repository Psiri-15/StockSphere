/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B192C',
          800: '#1E3E62',
          700: '#2A4D78',
          600: '#3B6998',
          100: '#E6EFF8',
          50: '#F0F6FB',
        },
        royal: {
          900: '#1E3A8A',
          800: '#1E40AF',
          700: '#1D4ED8',
          600: '#2563EB',
          500: '#3B82F6',
          400: '#60A5FA',
          100: '#DBEAFE',
          50: '#EFF6FF',
        },
        teal: {
          800: '#115E59',
          700: '#0F766E',
          600: '#0D9488',
          500: '#14B8A6',
          400: '#2DD4BF',
          100: '#CCFBF1',
          50: '#F0FDFA',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(11, 25, 44, 0.05), 0 1px 2px -1px rgba(11, 25, 44, 0.05)',
        card: '0 4px 6px -1px rgba(11, 25, 44, 0.07), 0 2px 4px -2px rgba(11, 25, 44, 0.07)',
        elevated: '0 10px 15px -3px rgba(11, 25, 44, 0.08), 0 4px 6px -4px rgba(11, 25, 44, 0.05)',
      }
    },
  },
  plugins: [],
}
