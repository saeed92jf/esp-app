import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {

       // ===== Font Family با پشتیبانی از دو زبان =====
      fontFamily: {
        'shabnam': ['var(--font-shabnam)'],
        'inter': ['var(--font-inter)'],
        'persian': ['var(--font-persian)'],
        'english': ['var(--font-english)'],
         sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
         serif: ['var(--font-serif)', 'Georgia', 'serif'],
         mono: ['var(--font-mono)', 'monospace'],
      },

      colors: {
        // ===== Primary  =====
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
        
        // ===== Secondary (رنگ ثانویه) =====
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
        
        // ===== Success (رنگ موفقیت) =====
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
        
        // ===== Danger/Error (رنگ خطا) =====
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
        
        // ===== Warning (رنگ هشدار) =====
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
        
        // ===== Info (رنگ اطلاع‌رسانی) =====
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

        // ===== Gray (رنگ‌های خنثی - ثابت) =====
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
      
      // ===== Background Colors (معنایی) =====
     backgroundColor: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        inverse: 'var(--bg-inverse)',
        input: 'var(--bg-input)',
        overlay: 'var(--bg-overlay)',
        error: 'var(--bg-error)',
        // Shadcn-like background
        DEFAULT: 'var(--bg-primary)',
        subtle: 'var(--bg-secondary)',
        muted: 'var(--bg-tertiary)',
        // Opacity variants
        'primary-5': 'var(--bg-primary-5)',
        'primary-10': 'var(--bg-primary-10)',
        'primary-20': 'var(--bg-primary-20)',
        'primary-30': 'var(--bg-primary-30)',
        'primary-40': 'var(--bg-primary-40)',
        'primary-50': 'var(--bg-primary-50)',
        'primary-60': 'var(--bg-primary-60)',
        'primary-70': 'var(--bg-primary-70)',
        'primary-80': 'var(--bg-primary-80)',
        'primary-90': 'var(--bg-primary-90)',
        // Light variants
        'primary-light': 'var(--bg-primary-light)',
        'primary-light-10': 'var(--bg-primary-light-10)',
        'primary-light-20': 'var(--bg-primary-light-20)',
        'primary-light-30': 'var(--bg-primary-light-30)',
        'primary-light-40': 'var(--bg-primary-light-40)',
        'primary-light-50': 'var(--bg-primary-light-50)',
      },
      
      // ===== Text Colors (معنایی) =====
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        inverse: 'var(--text-inverse)',
        disabled: 'var(--text-disabled)',
      },
      
      // ===== Border Colors (معنایی) =====
      borderColor: {
        'extra-light': 'var(--border-extra-light)',
        light: 'var(--border-light)',
        medium: 'var(--border-medium)',
        dark: 'var(--border-dark)',
        focus: 'var(--border-focus)',
        error: 'var(--border-error)',
        success: 'var(--border-success)',
        warning: 'var(--border-warning)',
        info: 'var(--border-info)',
        input: 'var(--border-input)',
        primary: 'var(--border-primary)',
      },
      
      // ===== Ring Color =====
      ringColor: {
        DEFAULT: 'var(--ring)',
      },
    
      
      // ===== Font Size =====
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--font-size-6xl)',
        '7xl': 'var(--font-size-7xl)',
        '8xl': 'var(--font-size-8xl)',
        '9xl': 'var(--font-size-9xl)',
      },
      
      // ===== Font Weight =====
      fontWeight: {
        thin: 'var(--font-thin)',
        extralight: 'var(--font-extralight)',
        light: 'var(--font-light)',
        normal: 'var(--font-normal)',
        medium: 'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold: 'var(--font-bold)',
        extrabold: 'var(--font-extrabold)',
        black: 'var(--font-black)',
      },
      
      // ===== Line Height =====
      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose: 'var(--leading-loose)',
      },
      
      // ===== Letter Spacing =====
      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
        widest: 'var(--tracking-widest)',
      },
      
      // ===== Spacing =====
      spacing: {
        '0': 'var(--space-0)',
        '0.5': 'var(--space-0-5)',
        '1': 'var(--space-1)',
        '1.5': 'var(--space-1-5)',
        '2': 'var(--space-2)',
        '2.5': 'var(--space-2-5)',
        '3': 'var(--space-3)',
        '3.5': 'var(--space-3-5)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '7': 'var(--space-7)',
        '8': 'var(--space-8)',
        '9': 'var(--space-9)',
        '10': 'var(--space-10)',
        '11': 'var(--space-11)',
        '12': 'var(--space-12)',
        '14': 'var(--space-14)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '28': 'var(--space-28)',
        '32': 'var(--space-32)',
        '36': 'var(--space-36)',
        '40': 'var(--space-40)',
        '44': 'var(--space-44)',
        '48': 'var(--space-48)',
        '52': 'var(--space-52)',
        '56': 'var(--space-56)',
        '60': 'var(--space-60)',
        '64': 'var(--space-64)',
        '72': 'var(--space-72)',
        '80': 'var(--space-80)',
        '96': 'var(--space-96)',
      },
      
      // ===== Border Radius =====
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-base)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        '4xl': 'var(--radius-4xl)',
        full: 'var(--radius-full)',
      },
      
      // ===== Box Shadow =====
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        '3xl': 'var(--shadow-3xl)',
        inner: 'var(--shadow-inner)',
        none: 'var(--shadow-none)',
      },
      
      // ===== Screens (Breakpoints) =====
      screens: {
        xs: 'var(--breakpoint-xs)',
        sm: 'var(--breakpoint-sm)',
        md: 'var(--breakpoint-md)',
        lg: 'var(--breakpoint-lg)',
        xl: 'var(--breakpoint-xl)',
        '2xl': 'var(--breakpoint-2xl)',
        '3xl': 'var(--breakpoint-3xl)',
      },
      
      // ===== Z-Index =====
      zIndex: {
        '0': 'var(--z-0)',
        '10': 'var(--z-10)',
        '20': 'var(--z-20)',
        '30': 'var(--z-30)',
        '40': 'var(--z-40)',
        '50': 'var(--z-50)',
        auto: 'var(--z-auto)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        modalBackdrop: 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
        toast: 'var(--z-toast)',
      },
      
      // ===== Transition Duration =====
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        DEFAULT: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
        slowest: 'var(--duration-slowest)',
      },
      
      // ===== Transition Timing Function =====
      transitionTimingFunction: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        bounce: 'var(--ease-bounce)',
        elastic: 'var(--ease-elastic)',
        smooth: 'var(--ease-smooth)',
        'bounce-soft': 'var(--ease-bounce-soft)',
      },
      
       // ============================================
      // TRANSITION DELAY
      // ============================================
      transitionDelay: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
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
      
      // ===== Opacity (اضافی) =====
      opacity: {
        '10': '0.10',
        '15': '0.15',
        '20': '0.20',
        '25': '0.25',
        '30': '0.30',
        '35': '0.35',
        '40': '0.40',
        '45': '0.45',
        '50': '0.50',
        '55': '0.55',
        '60': '0.60',
        '65': '0.65',
        '70': '0.70',
        '75': '0.75',
        '80': '0.80',
        '85': '0.85',
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