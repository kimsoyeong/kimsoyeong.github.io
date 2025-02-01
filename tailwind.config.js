/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "source-code": ["Source Code Pro", "monospace"], // Custom name for Source Code Pro
      },
    },
  },
  plugins: [],
};
