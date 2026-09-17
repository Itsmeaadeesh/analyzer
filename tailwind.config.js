/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1A73E8',
          blueHover: '#1557B0',
          blueLight: '#E8F0FE',
          red: '#EA4335',
          redHover: '#D93025',
          redLight: '#FCE8E6',
          yellow: '#FBBC04',
          yellowLight: '#FEF7E0',
          green: '#34A853',
          greenLight: '#E6F4EA',
          dark: '#202124',
          gray: '#5F6368',
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
