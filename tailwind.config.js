/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        bangla: ['var(--font-bangla)', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(16, 185, 129, 0.16)',
      },
    },
  },
  plugins: [],
};
