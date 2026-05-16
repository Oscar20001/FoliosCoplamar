/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        imss: {
          green: '#006341',
          light: '#f4f6f5',
          dark: '#00422b',
          gold: '#bda45d',
        }
      }
    },
  },
  plugins: [],
}
