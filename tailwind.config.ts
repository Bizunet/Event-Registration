import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#48291f",
        plum: "#6f3a2b",
        oatmeal: "#ead8c5",
        paper: "#faf7f1",
        white: "#faf7f1",
        gold: "#d7a073",
        accent: "#8a5039",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      backgroundImage: {
        "warm-gradient": "linear-gradient(135deg, #faf7f1 0%, #ead8c5 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
