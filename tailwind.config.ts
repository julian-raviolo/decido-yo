import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        // Colores temáticos: cambian con el modo (Clásico / HOT) vía CSS vars.
        night: 'rgb(var(--c-bg) / <alpha-value>)',
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        lime: 'rgb(var(--c-accent) / <alpha-value>)',
        special: 'rgb(var(--c-special) / <alpha-value>)',
        felt: 'rgb(var(--c-felt) / <alpha-value>)',
        cream: '#FFFDF7',
        food: '#FF5722',
        social: '#FFD600',
        destiny: '#AA00FF',
        defense: '#00E5FF',
        devil: '#1A0006',
        angel: '#FFF1C9',
        halo: '#FFD166',
      },
      boxShadow: {
        brutal: '6px 6px 0px 0px #000000',
        'brutal-sm': '3px 3px 0px 0px #000000',
        'brutal-lg': '10px 10px 0px 0px #000000',
        'brutal-cream': '6px 6px 0px 0px #FFFDF7',
        'brutal-accent': '6px 6px 0px 0px rgb(var(--c-accent))',
      },
      fontFamily: {
        display: ['"Arial Black"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
