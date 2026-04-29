import { Box } from "@mui/joy";
import DotCanvas, { type DotCanvasDataSource } from "./DotCanvas";

/**
 * A height value in `svh` units, optionally varying across Joy breakpoints
 * (xs / sm / md / lg / xl). A bare number applies at every breakpoint;
 * the object form uses Joy's normal mobile-first cascade — each
 * breakpoint inherits the value below it until overridden.
 */
export type ResponsiveHeightSvh = number | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", number>>;

interface DotCanvasShellProps {
  /**
   * Visible canvas height in `svh` units (small-viewport-height — the
   * worst-case visible area, stable through iOS chrome retraction).
   * Defaults to 100 for the homepage hero. Blog post heroes pass a
   * responsive map (see BLOG_HERO_HEIGHT_SVH in PostHero.tsx).
   */
  heightSvh?: ResponsiveHeightSvh;
  /**
   * Where the canvas should pull its dot data from. Defaults to the
   * cycling homepage manifest for backwards compatibility with the
   * original homepage usage.
   */
  dataSource?: DotCanvasDataSource;
}

/**
 * Convert a `ResponsiveHeightSvh` into the value shape Joy's sx system
 * expects when assigning a CSS custom property — either a string for the
 * simple case, or a breakpoint-keyed object of strings that Joy compiles
 * into media queries.
 */
function toCssVarValue(h: ResponsiveHeightSvh): string | Record<string, string> {
  if (typeof h === "number") return `${h}svh`;
  return Object.fromEntries(
    Object.entries(h).map(([bp, v]) => [bp, `${v}svh`]),
  );
}

/**
 * The page-wide animated dot field, wrapped in the markup that handles
 * the iOS 26 Safari chrome-tinting workaround documented in
 * `src/app/globals.scss`. Use this anywhere a fixed dot canvas is needed
 * at the top of the viewport (homepage hero, blog post hero, ...).
 *
 * `heightSvh` controls the visible canvas height. The strip-fade math in
 * `DotCanvas` keys off the canvas's own height, so a 50svh hero will
 * compress to the persistent top strip after scrolling 50% of the
 * viewport, while a 100svh hero takes a full viewport. The CSS surfaces
 * the height as the custom property `--mbp-dot-canvas-height`, which the
 * `.dotCanvasBackground` and `.dotStripCover` rules read.
 */
export default function DotCanvasShell({
  heightSvh = 100,
  dataSource,
}: DotCanvasShellProps) {
  // Skip emitting the custom property when it would just match the
  // CSS default (100svh) — this keeps the CSS rule's fallback
  // authoritative for the homepage and avoids a needless inline style.
  const isDefault = typeof heightSvh === "number" && heightSvh === 100;
  return (
    <Box
      className="dotCanvasShell"
      sx={isDefault ? undefined : { "--mbp-dot-canvas-height": toCssVarValue(heightSvh) }}
    >
      {/* Sibling whose CSS background tints the iOS Safari chrome.
          See globals.scss for the full explanation. */}
      <div className="iosChromeBg" aria-hidden />
      {/* CSS-rendered cover that masks scrolling content from showing
          through gaps between sparse dots. The gradient stop is driven
          from DotCanvas via the --mbp-dot-cover-stop custom property. */}
      <div className="dotStripCover" aria-hidden />
      <DotCanvas className="dotCanvasBackground" dataSource={dataSource} />
    </Box>
  );
}
