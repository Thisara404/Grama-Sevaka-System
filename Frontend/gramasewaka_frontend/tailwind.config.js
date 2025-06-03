/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0118D8',
        secondary: '#1B56FD',
        cream: '#E9DFC3',
        light: '#FFF8F8',
      }
    },
  },
  plugins: [],
}