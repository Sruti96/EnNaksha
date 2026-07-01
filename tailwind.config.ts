import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F2E8D5",        // warm beige — page background
        sand: "#E0CCAA",         // teak-washed linen — card backgrounds
        charcoal: "#2E1B0E",     // deep walnut — primary text
        "warm-brown": "#7C4A1E", // rich teak wood — primary CTA / accent
        terracotta: "#B5651D",   // aged saffron / burnt sienna — highlights
        forest: "#4A6741",       // muted sage — success / positive
        muted: "#8C7355",        // warm taupe — secondary text
        ivory: "#FBF5E6",        // warm cream — surface white
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        dancing: ["var(--font-dancing)", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
