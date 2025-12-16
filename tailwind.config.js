import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    fontFamily: {
      sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1.5' }],      // 12px
      'sm': ['0.875rem', { lineHeight: '1.5' }],      // 14px
      'base': ['1rem', { lineHeight: '1.5' }],        // 16px - Odoo base
      'lg': ['1.125rem', { lineHeight: '1.5' }],      // 18px
      'xl': ['1.25rem', { lineHeight: '1.4' }],      // 20px - h4
      '2xl': ['1.5rem', { lineHeight: '1.4' }],      // 24px - h3
      '3xl': ['1.75rem', { lineHeight: '1.3' }],      // 28px - h2
      '4xl': ['2rem', { lineHeight: '1.2' }],        // 32px - h1
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))', /* Uses Primary (#714B67) */
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Semantic Colors - Using Odoo Brand Colors
        success: {
          DEFAULT: 'hsl(var(--success))', /* Uses Secondary (#017E84) */
          bg: 'hsl(var(--success-bg))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))', /* Uses Primary (#714B67) */
          bg: 'hsl(var(--warning-bg))',
          border: 'hsl(var(--warning-border))',
          text: 'hsl(var(--warning-text))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))', /* Uses Primary (#714B67) */
          bg: 'hsl(var(--danger-bg))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))', /* Uses Secondary (#017E84) */
          bg: 'hsl(var(--info-bg))',
        },
        gray: {
          DEFAULT: 'hsl(var(--gray))', /* #8F8F8F - Odoo Gray */
          dark: 'hsl(var(--gray-dark))',
          light: 'hsl(var(--gray-light))',
          lighter: 'hsl(var(--gray-lighter))',
        },
        text: {
          DEFAULT: 'hsl(var(--text))',
          muted: 'hsl(var(--text-muted))',
          light: 'hsl(var(--text-light))',
        },
        bg: {
          DEFAULT: 'hsl(var(--bg))',
          gray: 'hsl(var(--bg-gray))',
          'gray-light': 'hsl(var(--bg-gray-light))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      }
    }
  },
  plugins: [tailwindcssAnimate],
}
