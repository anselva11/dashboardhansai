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
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
        },
        ocean: {
          50: '#F0F9FB',
          100: '#D3EFF4',
          200: '#A7DFE8',
          300: '#6CC6D5',
          400: '#3AAEC3',
          500: '#23A6C7',
          600: '#176B87',
          700: '#12546A',
          800: '#0E3E4F',
          900: '#082530',
        },
        hansai: {
          primary: '#102A43',
          secondary: '#176B87',
          accent: '#23A6C7',
          bg: '#F4F7FA',
          surface: '#FFFFFF',
          success: '#15966B',
          warning: '#E6A23C',
          danger: '#DC4C4C',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 42, 67, 0.06), 0 1px 2px 0 rgba(16, 42, 67, 0.04)',
        'card-hover': '0 10px 15px -3px rgba(16, 42, 67, 0.08), 0 4px 6px -2px rgba(16, 42, 67, 0.04)',
        'dropdown': '0 20px 25px -5px rgba(16, 42, 67, 0.1), 0 10px 10px -5px rgba(16, 42, 67, 0.04)',
      }
    },
  },
  plugins: [],
}

