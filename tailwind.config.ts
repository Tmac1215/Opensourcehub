import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'grid-slate': 'linear-gradient(rgba(148,163,184,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
    },
  },
  plugins: [],
};

export default config;
