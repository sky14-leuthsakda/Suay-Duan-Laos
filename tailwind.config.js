/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        lao: ['"Noto Sans Lao"', 'sans-serif'],
        sans: ['"Noto Sans Lao"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        sos: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        emergency: {
          fire: '#EA580C',
          medical: '#DC2626',
          accident: '#D97706',
          crime: '#2563EB',
          flood: '#0891B2',
          other: '#6B7280',
        },
        status: {
          received: '#94A3B8',
          acknowledged: '#3B82F6',
          dispatched: '#F59E0B',
          on_the_way: '#EC4899',
          arrived: '#10B981',
          resolved: '#059669',
          cancelled: '#64748B',
        }
      },
      minHeight: {
        'touch': '56px',
      },
      minWidth: {
        'touch': '56px',
      },
      screens: {
        'xs': '360px',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
};
