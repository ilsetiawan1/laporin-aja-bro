import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0F172A",
        blue: "#1E40AF",
        orange: "#F97316",
        red: "#EF4444",
        bg: "#F8FAFC",
      },
    },
  },
  plugins: [],
};

export default config;