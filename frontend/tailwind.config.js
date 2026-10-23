/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./context/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#faf7f2",
        sand: "#efe9de",
        ink: "#1e2a20",
        leaf: { DEFAULT: "#2f5d3a", dark: "#234a2d" },
        clay: "#b4532a",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        toastIn: {
          from: { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: { "toast-in": "toastIn 0.22s ease-out" },
    },
  },
  plugins: [],
};
