/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-purple': '#9333ea',
        'cyber-cyan': '#06b6d4',
        'dark-bg': '#0a0a0f',
        'dark-surface': '#1a1a2e',
      },
    },
  },
  plugins: [],
}
