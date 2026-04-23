"use client";

import { extendTheme } from "@mui/joy/styles";

/**
 * Joy UI theme tuned to the existing dark indigo + violet palette.
 * The site is dark-only for now (no light mode toggle), so we override
 * the dark-color-scheme tokens and leave light defaults untouched.
 */
const theme = extendTheme({
  cssVarPrefix: "mbp",
  fontFamily: {
    body: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    // `display` is intentionally a serif while `body` stays sans — Section
    // headers and Card titles use display to read as Fraunces italic, while
    // the rest of the site keeps Geist for body copy. See typography below.
    display: "var(--font-fraunces), 'Fraunces', Georgia, serif",
    code: "var(--font-geist-mono), ui-monospace, monospace",
  },
  // Override only the levels we use as headers (Section + Card titles) so
  // they pick up the display family and render italic. Other levels (body-*,
  // h1, h2, h4, title-md/sm) are untouched and keep Joy's defaults.
  typography: {
    h3: {
      fontFamily: "var(--mbp-fontFamily-display)",
      fontStyle: "italic",
      fontWeight: 400,
    },
    "title-lg": {
      fontFamily: "var(--mbp-fontFamily-display)",
      fontStyle: "italic",
      fontWeight: 400,
    },
  },
  colorSchemes: {
    dark: {
      palette: {
        background: {
          body: "#0A081a",
          surface: "#0d0a24",
          level1: "#13102e",
          level2: "#1a1638",
          level3: "#221d44",
        },
        text: {
          primary: "#ffffff",
          secondary: "rgba(196, 181, 253, 0.7)", // violet-300/70
          tertiary: "rgba(196, 181, 253, 0.5)",
        },
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          plainColor: "var(--mbp-palette-primary-300)",
          plainHoverBg: "rgba(196, 181, 253, 0.08)",
          plainActiveBg: "rgba(196, 181, 253, 0.12)",
        },
        neutral: {
          plainColor: "rgba(255, 255, 255, 0.6)",
          plainHoverColor: "#ffffff",
          plainHoverBg: "rgba(255, 255, 255, 0.05)",
          plainActiveBg: "rgba(255, 255, 255, 0.08)",
        },
        divider: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
});

export default theme;
