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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  safelist: [
    'bg-yellow-300',
    'bg-blue-400',
    'bg-zinc-500',
    'bg-zinc-950',
    'bg-amber-900',
    'bg-green-500',
    'bg-red-500',
    'bg-orange-500',
  ],
  plugins: [],
};
export default config;
