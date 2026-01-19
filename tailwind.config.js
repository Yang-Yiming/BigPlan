/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vanilla Cream - 主色（交互元素）
        vanilla: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fef3e7',
          300: '#fde8d0',
          400: '#fbd9b4',
          500: '#f9c98d',
          600: '#f5b563',
          700: '#d89748',
          800: '#b07638',
          900: '#8a5a2b',
        },
        // Honey - 次要色（强调和高亮）
        honey: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Maple - 边框色（柔和强调）
        maple: {
          50: '#fdf8f6',
          100: '#f9efe8',
          200: '#f3dfd0',
          300: '#e7cab5',
          400: '#d9b39a',
          500: '#c99a7d',
          600: '#b07f5f',
          700: '#8f6446',
          800: '#6f4e35',
          900: '#533a27',
        },
        // Neutral - 中性色（文字和背景）
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(185, 122, 72, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(185, 122, 72, 0.1), 0 1px 2px -1px rgba(185, 122, 72, 0.1)',
        'md': '0 4px 6px -1px rgba(185, 122, 72, 0.1), 0 2px 4px -2px rgba(185, 122, 72, 0.1)',
        'lg': '0 10px 15px -3px rgba(185, 122, 72, 0.1), 0 4px 6px -4px rgba(185, 122, 72, 0.1)',
        'xl': '0 20px 25px -5px rgba(185, 122, 72, 0.1), 0 8px 10px -6px rgba(185, 122, 72, 0.1)',
        '2xl': '0 25px 50px -12px rgba(185, 122, 72, 0.15)',
        'inner': 'inset 0 2px 4px 0 rgba(185, 122, 72, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0em',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
