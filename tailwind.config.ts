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
        "primary": "#FFC901",
        "secondary": "#E06D06",
        "background": "#22211E",
        "foreground": "#2A2926",
        "text": "#B8B8AB",
        "text-light": "#F7F9BE",
        'success': '#20CE70',
        'error': '#FF0000',
        'warning': '#FFA500',
      },
    },
  },
  plugins: [],
};
export default config;
