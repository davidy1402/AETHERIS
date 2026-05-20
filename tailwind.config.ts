import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cardBg: "var(--card-bg)",
        cardBorder: "var(--card-border)",
        glowColor: "var(--glow-color)",
        profit: {
          light: "#34c759",
          dark: "#30d158",
          DEFAULT: "var(--color-profit)",
        },
        loss: {
          light: "#ff3b30",
          dark: "#ff453a",
          DEFAULT: "var(--color-loss)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
