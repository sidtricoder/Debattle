/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',
        },
        foreground: {
          DEFAULT: '#0f172a',
          dark: '#ffffff',
        },
        primary: {
          DEFAULT: '#1e40af',
          light: '#3b82f6',
        },
        secondary: {
          DEFAULT: '#64748b',
          light: '#cbd5e1',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          light: '#a855f7',
        },
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
        },
        white: {
          DEFAULT: '#ffffff',
          light: '#f8fafc',
        },
        dark: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
        },
        border: {
          DEFAULT: '#e5e7eb', // light gray for borders
          dark: '#334155',    // dark mode border
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 50%, #1e40af 100%)',
        'card-gradient-light': 'linear-gradient(90deg, #eff6ff 0%, #f3e8ff 100%)',
        'card-gradient-dark': 'linear-gradient(90deg, #1e293b 0%, #4c1d95 100%)',
        'button-gradient': 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};