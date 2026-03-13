import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          50: '#F0EFFF',
          100: '#E1DEFF',
          200: '#C3BDFF',
          300: '#A59CFF',
          400: '#877BFF',
          500: '#6C63FF',
          600: '#4D42FF',
          700: '#2E21FF',
          800: '#1200FF',
          900: '#0F00D6',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#FF6584',
          50: '#FFF0F3',
          100: '#FFE0E7',
          200: '#FFC2CF',
          300: '#FFA3B7',
          400: '#FF849F',
          500: '#FF6584',
          600: '#FF3762',
          700: '#FF0940',
          800: '#DA0035',
          900: '#AC002A',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#43D39E',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#FFB443',
          foreground: '#FFFFFF',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px',
        xl: '16px',
        '2xl': '20px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108, 99, 255, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(108, 99, 255, 0)' },
        },
        'xp-pop': {
          '0%': { transform: 'scale(0) translateY(0)', opacity: '1' },
          '70%': { transform: 'scale(1.2) translateY(-20px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(-40px)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'xp-pop': 'xp-pop 1s ease-out forwards',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
