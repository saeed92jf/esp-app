// tailwind.config.ts
import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ============================================
      // رنگ‌های سفارشی (در Tailwind وجود ندارد)
      // ============================================
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          disabled: 'var(--color-primary-disabled)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
          hover: 'var(--color-secondary-hover)',
          active: 'var(--color-secondary-active)',
          disabled: 'var(--color-secondary-disabled)',
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
          hover: 'var(--color-success-hover)',
          active: 'var(--color-success-active)',
          disabled: 'var(--color-success-disabled)',
          50: 'var(--color-success-50)',
          100: 'var(--color-success-100)',
          200: 'var(--color-success-200)',
          300: 'var(--color-success-300)',
          400: 'var(--color-success-400)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
          700: 'var(--color-success-700)',
          800: 'var(--color-success-800)',
          900: 'var(--color-success-900)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          foreground: 'var(--color-danger-foreground)',
          hover: 'var(--color-danger-hover)',
          active: 'var(--color-danger-active)',
          disabled: 'var(--color-danger-disabled)',
          50: 'var(--color-danger-50)',
          100: 'var(--color-danger-100)',
          200: 'var(--color-danger-200)',
          300: 'var(--color-danger-300)',
          400: 'var(--color-danger-400)',
          500: 'var(--color-danger-500)',
          600: 'var(--color-danger-600)',
          700: 'var(--color-danger-700)',
          800: 'var(--color-danger-800)',
          900: 'var(--color-danger-900)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
          hover: 'var(--color-warning-hover)',
          active: 'var(--color-warning-active)',
          disabled: 'var(--color-warning-disabled)',
          50: 'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          200: 'var(--color-warning-200)',
          300: 'var(--color-warning-300)',
          400: 'var(--color-warning-400)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
          700: 'var(--color-warning-700)',
          800: 'var(--color-warning-800)',
          900: 'var(--color-warning-900)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
          hover: 'var(--color-info-hover)',
          active: 'var(--color-info-active)',
          disabled: 'var(--color-info-disabled)',
          50: 'var(--color-info-50)',
          100: 'var(--color-info-100)',
          200: 'var(--color-info-200)',
          300: 'var(--color-info-300)',
          400: 'var(--color-info-400)',
          500: 'var(--color-info-500)',
          600: 'var(--color-info-600)',
          700: 'var(--color-info-700)',
          800: 'var(--color-info-800)',
          900: 'var(--color-info-900)',
        },
        gray: {
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)',
          950: 'var(--color-gray-950)',
        },
        white: 'var(--color-white)',
        black: 'var(--color-black)',
      },
      
      // ============================================
      // Border Radius (افزودن سایزهای بزرگتر)
      // ============================================
      borderRadius: {
        '4xl': 'var(--radius-4xl)',  // 2rem - Tailwind ندارد
        '5xl': 'var(--radius-5xl)',  // 2.5rem - Tailwind ندارد
      },
      
      // ============================================
      // Box Shadow (افزودن سایه‌های بزرگتر)
      // ============================================
      boxShadow: {
        '3xl': 'var(--shadow-3xl)',  // Tailwind ندارد
        '4xl': 'var(--shadow-4xl)',  // Tailwind ندارد
        'glow-sm': 'var(--shadow-glow-sm)',
        'glow-md': 'var(--shadow-glow-md)',
        'glow-lg': 'var(--shadow-glow-lg)',
      },
      
      // ============================================
      // Screens (افزودن breakpoint‌های جدید)
      // ============================================
      screens: {
        'xs': 'var(--breakpoint-xs)',    // 475px - Tailwind ندارد
        '3xl': 'var(--breakpoint-3xl)',  // 1600px - Tailwind ندارد
        '4xl': 'var(--breakpoint-4xl)',  // 1920px - Tailwind ندارد
      },
      
      // ============================================
      // Font Family (فونت‌های سفارشی)
      // ============================================
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      
      // ============================================
      // Z-Index (افزودن مقادیر بالاتر)
      // ============================================
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
       // ===== Animation =====
      animation: {
        // Fade Animations
  'fade-in': 'fade-in var(--duration-base) var(--ease-out)',
  'fade-out': 'fade-out var(--duration-base) var(--ease-in)',
  'fade-in-up': 'fade-in-up var(--duration-slow) var(--ease-out)',
  'fade-in-down': 'fade-in-down var(--duration-slow) var(--ease-out)',
  'fade-in-left': 'fade-in-left var(--duration-slow) var(--ease-out)',
  'fade-in-right': 'fade-in-right var(--duration-slow) var(--ease-out)',
  
  // Slide Animations
  'slide-in-top': 'slide-in-top var(--duration-base) var(--ease-out)',
  'slide-out-top': 'slide-out-top var(--duration-base) var(--ease-in)',
  'slide-in-bottom': 'slide-in-bottom var(--duration-base) var(--ease-out)',
  'slide-out-bottom': 'slide-out-bottom var(--duration-base) var(--ease-in)',
  'slide-in-left': 'slide-in-left var(--duration-base) var(--ease-out)',
  'slide-out-left': 'slide-out-left var(--duration-base) var(--ease-in)',
  'slide-in-right': 'slide-in-right var(--duration-base) var(--ease-out)',
  'slide-out-right': 'slide-out-right var(--duration-base) var(--ease-in)',
  
  // Scale Animations
  'scale-in': 'scale-in var(--duration-base) var(--ease-out)',
  'scale-out': 'scale-out var(--duration-base) var(--ease-in)',
  'scale-elastic': 'scale-elastic var(--duration-slow) var(--ease-elastic)',
  
  // Rotate Animations
  'spin': 'spin var(--duration-slow) linear infinite',
  'spin-slow': 'spin-slow var(--duration-slower) linear infinite',
  'ping': 'ping var(--duration-slow) var(--ease-out) infinite',
  
  // Pulse & Bounce Animations
  'pulse': 'pulse 2s ease-in-out infinite',
  'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  'bounce': 'bounce 1s infinite',
  'bounce-soft': 'bounce-soft 1.5s ease-in-out infinite',
  
  // Special Effects
  'shimmer': 'shimmer 1.5s infinite',
  'float': 'float 3s ease-in-out infinite',
  'float-soft': 'float-soft 2s ease-in-out infinite',
  'wiggle': 'wiggle 0.5s ease-in-out',
  'shake': 'shake 0.3s ease-in-out',
  'glow': 'glow 2s ease-in-out infinite',
  'ripple': 'ripple 0.6s ease-out',
  'swing': 'swing 0.5s ease-in-out',
      },
    },
  },
  plugins: [
    forms({
      strategy: 'class',
    }),
  ],
}

export default config