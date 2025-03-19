/** @type {import('tailwindcss').Config} */
import primeui from "tailwindcss-primeui";
import theme, { extend } from "tailwindcss-primeui/src/theme";

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // Lock theme to light mode
  plugins: [primeui],
};
