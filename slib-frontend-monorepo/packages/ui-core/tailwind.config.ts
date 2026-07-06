import type { Config } from "tailwindcss";

const sharedConfig: Config = {
  darkMode: 'class',
  content: [
    "../../apps/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-core/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        secondary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        admin: {
          bg: '#0f172a',
          card: '#1e293b',
          text: '#f8fafc'
        }
      },
    },
  },
  plugins: [],
};

export default sharedConfig;
