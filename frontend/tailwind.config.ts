import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        f1red: "#d90429",
        f1yellow: "#ffe600",
      },
      backgroundColor: {
        'white/10': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        f1: ["'Barlow Condensed'", "Arial", "sans-serif"],
        barlow: ["'Barlow Condensed'", "sans-serif"],
      },
      dropShadow: {
        f1: "0 0 12px #d90429cc",
      },
      animation: {
        "f1-slide": "f1slide 0.7s cubic-bezier(.4,0,.2,1)",
        "f1-glow": "f1glow 1.2s ease-in-out infinite alternate",
        "f1-pulse": "f1pulse 0.8s infinite alternate",
      },
      keyframes: {
        f1slide: {
          "0%": { opacity: "0", transform: "translateY(60px) scale(0.98)" },
          "100%": { opacity: "1", transform: "none" },
        },
        f1glow: {
          "0%": { textShadow: "0 0 8px #ffe600, 0 0 2px #d90429" },
          "100%": { textShadow: "0 0 24px #ffe600, 0 0 8px #d90429" },
        },
        f1pulse: {
          "0%": { boxShadow: "0 0 32px 8px #d90429cc, 0 2px 8px #000a" },
          "100%": { boxShadow: "0 0 64px 16px #ffe600cc, 0 2px 8px #000a" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
