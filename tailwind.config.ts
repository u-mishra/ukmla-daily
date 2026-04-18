import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        accent: "#1A6B52",
        paper: "#F5F5F7",
        ink: "#1A1A1A",
      },
      borderRadius: {
        "2xl": "16px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
