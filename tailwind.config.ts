import type { Config } from "tailwindcss";

/**
 * FF TRUST — Tailwind v4 companion config.
 *
 * Tailwind v4 reads design tokens from `@theme` in globals.css (oklch-based,
 * the FF TRUST visual constitution). This JS file only retains the bits v4
 * still consumes via config: dark mode strategy + content roots + the animate
 * plugin. Color/radius/animation tokens are intentionally NOT redefined here —
 * doing so created the v3-vs-v4 conflict flagged in the PROMPT 01 audit.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
