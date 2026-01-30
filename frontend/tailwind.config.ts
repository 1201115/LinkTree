import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F1A",
        aurora: "#7C5CFF",
        cyan: "#19D3FF",
        lime: "#B7FF4A"
      },
      boxShadow: {
        glow: "0 0 24px rgba(25, 211, 255, 0.6)"
      }
    }
  },
  plugins: []
};

export default config;
