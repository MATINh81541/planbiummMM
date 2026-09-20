/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'Noto Sans Arabic', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Vazirmatn', 'Noto Sans Arabic', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      colors: {
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },
        blueberry: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        gray: {
          25: '#f9f9f9',
          50: '#f5f5f5',
          100: '#f0f0f0',
          150: '#e8e8e8',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      borderRadius: {
        'glass': '1.5rem',
        'glass-lg': '2rem',
        'glass-xl': '2.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06), 0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.08), 0 4px 16px 0 rgba(0, 0, 0, 0.05)',
        'glass-hover': '0 20px 60px 0 rgba(0, 0, 0, 0.10), 0 6px 20px 0 rgba(0, 0, 0, 0.06)',
        'soft': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-lg': '24px',
      },
      animation: {
        'letter-stamp': 'letterStamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'breathing': 'breathing 4s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-medium': 'floatMedium 6s ease-in-out infinite',
        'float-fast': 'floatFast 5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'accordion-open': 'accordionOpen 0.35s ease-out forwards',
      },
      keyframes: {
        letterStamp: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(1.3)', filter: 'blur(8px)' },
          '60%': { opacity: '1', transform: 'translateY(-4px) scale(0.95)', filter: 'blur(0px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0px)' },
        },
        breathing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.88' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -20px) rotate(3deg)' },
          '66%': { transform: 'translate(-20px, 15px) rotate(-2deg)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-25px, 20px)' },
        },
        floatFast: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(15px, -10px) scale(1.05)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        accordionOpen: {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '500px' },
        },
      },
      transitionTimingFunction: {
        'glass': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
