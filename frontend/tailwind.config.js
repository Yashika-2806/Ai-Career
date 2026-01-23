module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0a0e27',
        },
        cyan: {
          DEFAULT: '#00d4ff',
          50: '#e6f9ff',
          100: '#ccf3ff',
          200: '#99e7ff',
          300: '#66dbff',
          400: '#33cfff',
          500: '#00d4ff',
          600: '#0ea5e9',
          700: '#0284c7',
          800: '#0369a1',
          900: '#075985',
        },
        navy: {
          DEFAULT: '#0a0e27',
          50: '#e5e7eb',
          100: '#cbd5e1',
          200: '#94a3b8',
          300: '#64748b',
          400: '#475569',
          500: '#334155',
          600: '#1e293b',
          700: '#1a1f3a',
          800: '#0f1629',
          900: '#0a0e27',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
          },
        },
        borderGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 212, 255, 0.4), 0 0 30px rgba(0, 212, 255, 0.2)',
        'glow-cyan-lg': '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
