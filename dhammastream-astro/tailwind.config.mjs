/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdedd5',
          200: '#fbd7aa',
          300: '#f8bb74',
          400: '#f4943c',
          500: '#f2761a',
          600: '#ea5a0f',
          700: '#c24410',
          800: '#9a3715',
          900: '#7c2f14',
          950: '#431508',
        },
        orange: {
          50: '#fef7ed',
          100: '#fdedd5',
          200: '#fbd7aa',
          300: '#f8bb74',
          400: '#f4943c',
          500: '#f2761a',
          600: '#ea5a0f',
          700: '#c24410',
          800: '#9a3715',
          900: '#7c2f14',
          950: '#431508',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};