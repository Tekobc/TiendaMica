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
        mica: {
          50: "#fdf6f7",
          100: "#fbebee",
          200: "#f8d8de",
          300: "#f2b7c3",
          400: "#ea8ba0",
          500: "#de637f",
          600: "#ca4564",
          700: "#aa344e",
          800: "#8d2e43",
          900: "#762a3b",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e5ede6",
          200: "#cfddcf",
          300: "#acc3ad",
          400: "#83a385",
          500: "#638766",
          600: "#4e6c51",
          700: "#3f5642",
          800: "#354637",
          900: "#2c3b2e",
        },
        cream: {
          50: "#fbfaf8",
          100: "#f7f5f0",
          200: "#efebe2",
          300: "#e3dcce",
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
