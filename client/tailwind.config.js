/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        accent: {
          DEFAULT: "#818cf8",
          light: "#a5b4fc",
          dark: "#6366f1",
          glow: "rgba(129, 140, 248, 0.25)",
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "glow-pulse": {
          "0%": { boxShadow: "0 0 15px rgba(129,140,248,0.15)" },
          "100%": { boxShadow: "0 0 30px rgba(129,140,248,0.30)" },
        },
      },
    },
  },
  plugins: [],
};
