import DotCanvas, { type DotCanvasDataSource } from "./DotCanvas";

interface DotCanvasShellProps {
  /**
   * Visible canvas height in `svh` units (small-viewport-height — the
   * worst-case visible area, stable through iOS chrome retraction).
   * Defaults to 100 for the homepage hero. Blog post heroes pass 50.
   */
  heightSvh?: number;
  /**
   * Where the canvas should pull its dot data from. Defaults to the
   * cycling homepage manifest for backwards compatibility with the
   * original homepage usage.
   */
  dataSource?: DotCanvasDataSource;
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
  return (
    <div
      className="dotCanvasShell"
      style={
        // Only set the var when not the default — keeps the CSS rule's
        // fallback (100svh) authoritative for the homepage and avoids
        // a needless inline style.
        heightSvh === 100
          ? undefined
          : ({ ["--mbp-dot-canvas-height" as string]: `${heightSvh}svh` } as React.CSSProperties)
      }
    >
      {/* Sibling whose CSS background tints the iOS Safari chrome.
          See globals.scss for the full explanation. */}
      <div className="iosChromeBg" aria-hidden />
      {/* CSS-rendered cover that masks scrolling content from showing
          through gaps between sparse dots. The gradient stop is driven
          from DotCanvas via the --mbp-dot-cover-stop custom property. */}
      <div className="dotStripCover" aria-hidden />
      <DotCanvas className="dotCanvasBackground" dataSource={dataSource} />
    </div>
  );
}
