/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          400: '#73d491',
          500: '#55CA7C',
          600: '#42a764',
        },
        dark: {
          bg: '#09090b',
          card: '#18181b',
          border: '#27272a',
          input: '#121214',
          hover: '#1f1f22',
        },
      },
    },
  },
  plugins: [],
}
