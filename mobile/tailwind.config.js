/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F16B44",
        secondary: "#39B54A",
        grey: "#F5F5F5",
        darkgrey: "#9E9E9E",
        error: "#F44336",
        black: "#000000",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
