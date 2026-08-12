import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1062FE",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;