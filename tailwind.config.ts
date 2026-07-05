import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom color mapping to automatically apply the modern navy/teal aesthetic of modernlook.html
        zinc: {
          50: '#e8ecf4',      // var(--text-primary)
          100: '#e8ecf4',
          200: '#e8ecf4',
          300: '#9aa3bf',     // var(--text-secondary)
          400: '#6b7494',     // var(--text-muted)
          500: '#4a5270',     // var(--text-faint)
          600: '#232942',     // var(--bg-surface-3)
          700: '#1c2237',     // var(--bg-surface-2)
          800: '#161b2e',     // border / surface
          900: '#0f1320',     // panel base bg
          950: '#0a0e1a',     // deep page bg
        },
        blue: {
          400: '#22d3bb',     // Teal accent
          500: '#1aab98',     // Teal accent dim
          600: '#148f7f',
        }
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
