/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F9F2ED',
          100: '#EDD9CC',
          200: '#D9B19A',
          300: '#C18A67',
          400: '#A6643D',
          500: '#8B4726',
          600: '#6B3620',
          700: '#4A2618',
          800: '#2D1810',
          900: '#1A0E0A',
        },
        secondary: {
          50: '#F0F7FF',
          100: '#DBE9FC',
          200: '#B5D4F7',
          300: '#87B7F0',
          400: '#5C9AE6',
          500: '#3B7DD9',
          600: '#2557A0',
          700: '#1A4270',
          800: '#102B4A',
          900: '#0A1A2E',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F2F2F2',
          200: '#E3E3E3',
          300: '#C7C7C7',
          400: '#A3A3A3',
          500: '#808080',
          600: '#5C5C5C',
          700: '#404040',
          800: '#2B2B2B',
          900: '#1A1A1A',
          950: '#0D0D0D',
        },
        accent: {
          gold: '#D4AF37',
          amber: '#F59E0B',
          emerald: '#10B981',
          ruby: '#DC2626',
          amethyst: '#8B5CF6',
          rose: '#F43F5E',
        },
        midnight: {
          50: '#EEF4FF',
          100: '#D6E2FF',
          200: '#B0C4FF',
          300: '#89A5FF',
          400: '#647DFF',
          500: '#3C4DFF',
          600: '#2024E3',
          700: '#181DB1',
          800: '#10157F',
          900: '#090C4D',
        },
        aurora: {
          pink: '#FF7AD9',
          purple: '#AC7CFF',
          cyan: '#7DE5FF',
          lime: '#B3FFAB',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['96px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '300' }],
        'display-lg': ['72px', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '300' }],
        'display-md': ['56px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '32px',
        '3xl': '48px',
        'glass': '28px',
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'sm': '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'base': '0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'md': '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06)',
        'lg': '0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
        'xl': '0 24px 48px -12px rgba(0, 0, 0, 0.18), 0 16px 32px -8px rgba(0, 0, 0, 0.12)',
        '2xl': '0 32px 64px -16px rgba(0, 0, 0, 0.24), 0 24px 48px -12px rgba(0, 0, 0, 0.16)',
        'primary': '0 8px 24px -4px rgba(139, 71, 38, 0.3)',
        'secondary': '0 8px 24px -4px rgba(37, 87, 160, 0.3)',
        'glass-strong': '0 35px 120px -25px rgba(15, 23, 42, 0.45)',
        'glow': '0 20px 60px rgba(212, 175, 55, 0.45)',
        'neon': '0 8px 30px rgba(124, 58, 237, 0.55), inset 0 0 25px rgba(124, 58, 237, 0.35)',
      },
      dropShadow: {
        aurora: '0 5px 25px rgba(173, 94, 255, 0.55)',
        glow: '0 0 25px rgba(255, 122, 217, 0.65)',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.25), transparent 45%)',
        'hero-radial-2': 'radial-gradient(circle at 80% 0%, rgba(124, 58, 237, 0.25), transparent 35%)',
        'mesh-lux': 'linear-gradient(125deg, rgba(15, 23, 42, 0.95) 0%, rgba(39, 18, 6, 0.92) 50%, rgba(8, 47, 73, 0.95) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 80%)',
        'aurora': 'linear-gradient(120deg, rgba(255,122,217,0.45), rgba(124,58,237,0.35), rgba(125,229,255,0.35))',
      },
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.4, 0, 0.2, 1.4)',
        'glide': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 30s ease-in-out infinite',
        'aurora': 'aurora 18s ease infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'slow-spin': 'slowSpin 18s linear infinite',
        'gradient-pan': 'gradientPan 12s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-30px) translateX(15px)' },
          '50%': { transform: 'translateY(0) translateX(0)' },
          '75%': { transform: 'translateY(30px) translateX(-15px)' },
        },
        aurora: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 0.45 },
          '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: 0.85 },
          '100%': { transform: 'translateY(0) scale(1)', opacity: 0.45 },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.45)' },
          '50%': { boxShadow: '0 0 45px 15px rgba(212, 175, 55, 0)' },
        },
        slowSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        gradientPan: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '40px',
        ultra: '80px',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents }) {
      const newUtilities = {
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },
        '.scroll-performance': {
          'scroll-behavior': 'smooth',
          'transform': 'translate3d(0, 0, 0)',
          'will-change': 'scroll-position',
          '-webkit-overflow-scrolling': 'touch',
        },
        '.hardware-accelerated': {
          'transform': 'translate3d(0, 0, 0)',
          'backface-visibility': 'hidden',
          'perspective': '1000px',
        },
        '.smooth-transform': {
          'transition': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          'will-change': 'transform',
        },
        '.text-gradient-lux': {
          'background': 'linear-gradient(135deg, #FFFFFF 0%, #D4AF37 50%, #FFFFFF 100%)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-size': '200% auto',
        },
        '.glass-panel': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(30px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(30px) saturate(180%)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.premium-border': {
          'border': '1px solid rgba(212, 175, 55, 0.3)',
        },
        '.cursor-premium': {
          'cursor': 'pointer',
        },
      }
      
      const newComponents = {
        '.btn-premium': {
          '@apply px-8 py-4 glass-panel premium-border rounded-2xl text-white font-semibold': {},
          '@apply hover:bg-gradient-to-r hover:from-accent-gold/20 hover:to-accent-amethyst/20': {},
          '@apply transition-all duration-300 transform hover:scale-105 hover:shadow-glow': {},
        },
        '.card-premium': {
          '@apply glass-panel premium-border rounded-3xl p-8 backdrop-blur-xl': {},
          '@apply hover:shadow-glow transition-all duration-500': {},
        },
      }
      
      addUtilities(newUtilities)
      addComponents(newComponents)
    }
  ],
}
