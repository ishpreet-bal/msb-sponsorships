import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1426",
        paper: "#fbf6ee",
        card: "#ffffff",
        line: "#eadfcd",
        saffron: { DEFAULT: "#e8891c", soft: "#fdebd3", deep: "#b5620a" },
        phulkari: { DEFAULT: "#b8215e", soft: "#f9dde8" },
        indigo: { DEFAULT: "#2a2f6b", soft: "#e2e4f5" },
        leaf: { DEFAULT: "#2f7a4f", soft: "#dcefe3" },
        muted: "#6f6577",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
