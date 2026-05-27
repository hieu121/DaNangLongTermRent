/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        choTot: {
          yellow: "#ffba00",
          blue: "#1771f1"
        }
      }
    }
  },
  plugins: []
};
