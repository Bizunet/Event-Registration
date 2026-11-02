import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b2f2d",
        plum: "#0b5d57",
        oatmeal: "#dff3ff",
        paper: "#f4efe9",
        gold: "#f0bf53",
        accent: "#0b5d57",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      backgroundImage: {
        "sky-gradient": "linear-gradient(135deg, #dff3ff 0%, #66add8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
