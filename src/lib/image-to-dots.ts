import sharp from "sharp";

export interface Dot {
  /** Normalized horizontal position (0–1) */
  x: number;
  /** Normalized vertical position (0–1) */
  y: number;
  /** Red channel (0–255) */
  r: number;
  /** Green channel (0–255) */
  g: number;
  /** Blue channel (0–255) */
  b: number;
  /** Dot radius in pixels, relative to gridSpacing */
  size: number;
}

export interface ImageToDotsOptions {
  /**
   * Distance between dot centers in pixels, at the target canvas size.
   * Smaller = more dots, more detail. Default: 8
   */
  gridSpacing?: number;
  /**
   * Target canvas width in pixels. Dots will be placed to fill this width.
   * Default: 1440
   */
  canvasWidth?: number;
  /**
   * Target canvas height in pixels.
   * Default: 900
   */
  canvasHeight?: number;
  /**
   * Maximum dot radius as a fraction of gridSpacing. Default: 0.48
   * (just under half, so dots don't touch at full size)
   */
  maxSizeFraction?: number;
  /**
   * Minimum dot radius as a fraction of gridSpacing. Default: 0.08
   */
  minSizeFraction?: number;
  /**
   * Luminance threshold below which dots are omitted entirely (0–1).
   * Prevents placing invisible dots on near-black regions. Default: 0.02
   */
  darknessThreshold?: number;
  /**
   * Maximum random offset applied to each dot's position, as a fraction of
   * gridSpacing. Gives the grid an organic, hand-placed feel. Default: 0.4
   * Jitter is deterministic (seeded by column/row) so the same image always
   * produces the same dot positions.
   */
  jitter?: number;
}

export interface ImageToDotsResult {
  dots: Dot[];
  columns: number;
  rows: number;
  gridSpacing: number;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Convert an image buffer into an array of colored dots suitable for
 * rendering on an HTML canvas with a physics interaction layer.
 *
 * Accepts a Buffer so it works both as a build-time CLI script and as a
 * Next.js API route handler for user-uploaded images.
 */
export async function imageToDots(
  input: Buffer | string,
  options: ImageToDotsOptions = {}
): Promise<ImageToDotsResult> {
  const {
    gridSpacing = 8,
    canvasWidth = 1440,
    canvasHeight = 900,
    maxSizeFraction = 0.48,
    minSizeFraction = 0.08,
    darknessThreshold = 0.02,
    jitter = 0.4,
  } = options;

  // Deterministic pseudo-random: seeded by col, row, and axis (0 or 1)
  // Returns a value in [-1, 1]
  function seededJitter(col: number, row: number, axis: number): number {
    let h = (col * 1664525 + row * 22695477 + axis * 2891336453) >>> 0;
    h ^= h >>> 16;
    h = (h * 0x45d9f3b) >>> 0;
    h ^= h >>> 16;
    return (h / 0xffffffff) * 2 - 1;
  }

  const columns = Math.floor(canvasWidth / gridSpacing);
  const rows = Math.floor(canvasHeight / gridSpacing);

  // Resize image to exactly the grid dimensions so each pixel = one dot
  const { data, info } = await sharp(input)
    .resize(columns, rows, { fit: "cover", position: "centre" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const dots: Dot[] = [];
  const maxRadius = gridSpacing * maxSizeFraction;
  const minRadius = gridSpacing * minSizeFraction;

  for (let row = 0; row < info.height; row++) {
    for (let col = 0; col < info.width; col++) {
      // Compute jittered position first, then sample color there
      const jitterPx = gridSpacing * jitter;
      const jitteredCol = col + 0.5 + seededJitter(col, row, 0) * jitterPx / gridSpacing;
      const jitteredRow = row + 0.5 + seededJitter(col, row, 1) * jitterPx / gridSpacing;

      // Sample color at the jittered position (clamped to image bounds)
      const sampleCol = Math.max(0, Math.min(info.width - 1, Math.round(jitteredCol)));
      const sampleRow = Math.max(0, Math.min(info.height - 1, Math.round(jitteredRow)));
      const idx = (sampleRow * info.width + sampleCol) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Perceived luminance (ITU-R BT.709)
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      if (luminance < darknessThreshold) continue;

      // Size driven by luminance at the jittered position
      const size = minRadius + (maxRadius - minRadius) * luminance;

      // Normalized position
      const x = jitteredCol / info.width;
      const y = jitteredRow / info.height;

      dots.push({ x, y, r, g, b, size });
    }
  }

  return { dots, columns, rows, gridSpacing, canvasWidth, canvasHeight };
}
