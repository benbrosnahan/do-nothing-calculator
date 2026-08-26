import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#FFFCEC",
        card: "#FFFFFF",
        ink: {
          DEFAULT: "#275B2D",
          muted: "#5C7F5F",
          faint: "#8CA98E",
        },
        brand: {
          DEFAULT: "#275B2D",
          hover: "#1E4623",
          light: "#EAF3E7",
          border: "#BFDCB8",
        },
        line: "#DCE7D8",
        accent: {
          DEFAULT: "#C1652E",
          hover: "#A8531F",
          light: "#F7E4D6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
export default config;
