/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        copeland: {
          blue: "#003DA5",
          navy: "#00205B",
          red: "#E4002B",
          gray: "#5B6770",
        },
      },
    },
  },
  plugins: [],
};
