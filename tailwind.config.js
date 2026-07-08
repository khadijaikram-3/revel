/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        'secondary-bg': '#141414',
        'card-bg': '#1E1E1E',
        border: '#2C2C2C',
        'primary-text': '#FFFFFF',
        'secondary-text': '#A1A1AA',
        'muted-text': '#6B6B76',
        danger: '#E11D48',
        'danger-hover': '#FF3B5C',
        silver: '#C0C0C0',
        'silver-hover': '#E8E8E8',
        'high-risk': '#E11D48',
        'medium-risk': '#C2410C',
        'low-risk': '#166534',
        warning: '#F4C95D',
        success: '#34D399',
        primary: '#5DA9FF',
        glow: '#00E5FF',
        'terminal-green': '#00FF41',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'typing': 'typing 0.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
        'gauge-fill': 'gaugeFill 1.5s ease-out forwards',
        'needle-swing': 'needleSwing 1.5s ease-out forwards',
        'card-enter': 'cardEnter 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(225, 29, 72, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(225, 29, 72, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        gaugeFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--gauge-offset)' },
        },
        needleSwing: {
          '0%': { transform: 'rotate(-90deg)' },
          '100%': { transform: 'rotate(var(--needle-angle))' },
        },
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      backdropBlur: {
        glass: '10px',
      },
    },
  },
  plugins: [],
};
