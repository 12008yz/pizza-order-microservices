/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: { 'tt-firs-neue': ['TT Firs Neue', 'sans-serif'] },
    },
  },
  plugins: [],
};
