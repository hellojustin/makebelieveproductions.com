import sharp from "sharp";
import type { ImageToDotsResult } from "./image-to-dots";

export interface DotsToPngOptions {
  /** Output width in px. */
  width: number;
  /** Output height in px. */
  height: number;
  /**
   * Background color used to fill the area not covered by dots.
   * Defaults to the site's deep-indigo page background (#0A081a).
   */
  background?: string;
  /**
   * Multiplier applied to each dot's radius after scaling. The animated
   * canvas adds a tiny floor (`Math.max(size, 0.3)`) to keep tiny dots
   * visible at small sizes — for the static raster we use a slightly
   * larger floor to avoid sub-pixel circles vanishing in the PNG.
   */
  radiusMultiplier?: number;
  /**
   * Minimum dot radius in pixels. Anything smaller than this is bumped up
   * so it survives downsampling/anti-aliasing.
   */
  minRadiusPx?: number;
}

/**
 * Render a `ImageToDotsResult` to a PNG buffer at the requested size.
 *
 * The dots from `image-to-dots` carry normalized coordinates in [0,1] and
 * sizes calibrated to the original `canvasWidth/Height`. We scale them
 * with `cover` semantics (matching `DotCanvas.buildDots`) so the image
 * fills the target without distorting aspect.
 *
 * Implementation note: we compose an SVG (each dot is a `<circle>`) and
 * pipe it through sharp. SVG-of-tens-of-thousands-of-circles is large
 * but sharp parses and rasterizes it quickly because every node is a
 * single primitive with no transforms. For a 240x135 grid (~32k dots)
 * this stays under a few hundred ms per render on a modern Mac.
 */
export async function dotsToPng(
  data: ImageToDotsResult,
  opts: DotsToPngOptions,
): Promise<Buffer> {
  const {
    width,
    height,
    background = "#0A081a",
    radiusMultiplier = 1,
    minRadiusPx = 0.6,
  } = opts;

  const scale = Math.max(
    width / data.canvasWidth,
    height / data.canvasHeight,
  );
  const offsetX = (width - data.canvasWidth * scale) / 2;
  const offsetY = (height - data.canvasHeight * scale) / 2;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  );
  parts.push(
    `<rect width="${width}" height="${height}" fill="${background}"/>`,
  );

  for (const d of data.dots) {
    const cx = d.x * data.canvasWidth * scale + offsetX;
    const cy = d.y * data.canvasHeight * scale + offsetY;
    const r = Math.max(minRadiusPx, d.size * scale * radiusMultiplier);
    if (
      cx + r < 0 ||
      cy + r < 0 ||
      cx - r > width ||
      cy - r > height
    ) {
      continue;
    }
    parts.push(
      `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="rgb(${d.r},${d.g},${d.b})"/>`,
    );
  }
  parts.push("</svg>");

  const svg = Buffer.from(parts.join(""));

  return sharp(svg, { density: 72 }).png({ compressionLevel: 9 }).toBuffer();
}
