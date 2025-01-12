/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#D9F8FA", // Lightest shade
          200: "#B3EEF4",
          300: "#8DE4ED",
          400: "#66DAE7",
          500: "#2FC3D2", // Base shade (main color)
          600: "#29ABB6",
          700: "#238F9A",
          800: "#1D737D",
          900: "#165860", // Darkest shade
        },
      },
    },
  },
  plugins: [],
};
