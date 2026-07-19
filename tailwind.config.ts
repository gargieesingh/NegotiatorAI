import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        negotiator: {
          bg: '#0A0E1A',
          surface: '#111827',
          'surface-2': '#1C2333',
          border: '#1E2D45',
          accent: '#2563EB',
          'accent-glow': '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          live: '#10B981',
        },
      },
      fontFamily: {
        primary: ['var(--font-primary)'],
        mono: ['var(--font-mono)'],
      },
      keyframes: {
        waveform: { '0%': { height: '4px' }, '100%': { height: '28px' } },
      },
      animation: {
        waveform: 'waveform 0.4s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
