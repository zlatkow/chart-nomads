/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      fontSize: {
        '10xl': '10rem', // Manually set size for 10xl (Adjust if needed)
        '11xl': '11rem', // Another option for even bigger text
      },
      fontFamily: {
        balboa: ["var(--font-balboa)", "sans-serif"],
        cascadia: ["var(--font-cascadia-mono)", "monospace"],
      },
      backgroundImage: {
        'radial-custom': 'radial-gradient(circle 1500px at top -300px left, #EDB900 0%, #0f0f0f 50%)'
      }
    },
  },
  plugins: [],
};
