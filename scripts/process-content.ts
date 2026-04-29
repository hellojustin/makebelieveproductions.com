/**
 * Build-time content pipeline. Two responsibilities:
 *
 * 1. Hero pipeline (unchanged): scans `content/hero/` for source images and
 *    writes per-image dot-data JSON to `public/data/`, plus a TypeScript
 *    manifest module at `src/data/manifest.ts` that the homepage imports
 *    directly.
 *
 * 2. Blog pipeline: walks `content/blog/<slug>/`, parses each post's
 *    frontmatter, and for every post's hero image generates:
 *      - `public/data/blog/<slug>.json` — dot data for the animated 50svh
 *        post hero canvas (wide aspect).
 *      - `public/og/blog/<slug>.png` — 1200x630 static PNG for OG/Twitter
 *        unfurls. Generated from a fresh dots pass at the OG aspect so the
 *        framing isn't distorted.
 *      - `public/og/blog/<slug>.square.png` — 800x800 PNG used as the
 *        thumbnail on the blog index card.
 *    A combined manifest is emitted to `src/data/blog-manifest.ts` so the
 *    app imports it directly (no runtime fetch — same pattern as the hero
 *    manifest, which avoids the iOS Safari "Load failed" issue documented
 *    in src/components/DotCanvas.tsx).
 *
 * Both pipelines are idempotent: outputs are skipped when the source is
 * older than every derived artifact. Pass `--force` to rebuild everything.
 *
 * Usage:
 *   npm run process-content
 *   npm run process-content -- --force
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import sharp from "sharp";
import { imageToDots } from "../src/lib/image-to-dots";
import { dotsToPng } from "../src/lib/dots-to-png";

const HERO_SOURCE_DIR = "content/hero";
const HERO_OUTPUT_DIR = "public/data";
const HERO_MANIFEST_PATH = "src/data/manifest.ts";

const BLOG_SOURCE_DIR = "content/blog";
const BLOG_DATA_DIR = "public/data/blog";
const BLOG_OG_DIR = "public/og/blog";
const BLOG_MANIFEST_PATH = "src/data/blog-manifest.ts";

const SUPPORTED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const args = process.argv.slice(2);
const getArg = (flag: string, fallback: string) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const force = args.includes("--force");

const HERO_OPTIONS = {
  gridSpacing: parseInt(getArg("--spacing", "8"), 10),
  canvasWidth: parseInt(getArg("--width", "1920"), 10),
  canvasHeight: parseInt(getArg("--height", "1080"), 10),
  // Threshold of 0 ensures every grid position emits a dot, so dot indices
  // are stable across images and can morph in place without remapping.
  darknessThreshold: 0,
};

// On-screen post hero. Sized per-image (see deriveHeroDims): the grid
// matches the source image's aspect ratio so the entire image survives
// into the dot data, leaving any cropping to the canvas at display time
// (driven by the actual viewport aspect, not by an arbitrary build-time
// choice). BLOG_HERO_TARGET_DOTS is the dot budget the derivation tries
// to hit — currently 2× the count of the original fixed 1920×540 / 8²
// grid, for a noticeably denser field than the homepage; pair with
// BLOG_HERO_MAX_SIZE_FRACTION to make individual dots correspondingly
// smaller so the field reads as higher-resolution rather than crowded.
//
// Note: BLOG_HERO_GRID_SPACING is just a coordinate-scale constant for
// the emitted JSON; the canvas resolves it back out at render time
// (on-screen dot spacing = canvas_display_width / cols, independent of
// gridSpacing). Density is controlled solely by TARGET_DOTS.
const BLOG_HERO_GRID_SPACING = 8;
const BLOG_HERO_TARGET_DOTS = (1920 / 8) * (540 / 8) * 2;
// Override imageToDots' default maxSizeFraction (0.6) for the on-screen
// blog hero. 0.48 = 80% of default → ~20% smaller maximum dot radius,
// so the post hero reads finer than the homepage hero without spilling
// past the per-cell boundary.
const BLOG_HERO_MAX_SIZE_FRACTION = 0.48;
// Standard OG image aspect for Twitter/Facebook/LinkedIn previews.
const BLOG_OG_DIMS = { width: 1200, height: 630, gridSpacing: 6 };
// Square thumbnail used on the blog index card.
const BLOG_SQUARE_DIMS = { width: 800, height: 800, gridSpacing: 6 };

/**
 * Pick on-screen hero canvas dimensions whose aspect matches the source
 * image, while spending roughly the same number of dots as the previous
 * fixed-size grid. Width and height are snapped to multiples of
 * `gridSpacing` so the grid stays regular.
 */
function deriveHeroDims(
  imageWidth: number,
  imageHeight: number,
): { width: number; height: number; gridSpacing: number } {
  const aspect = imageWidth / imageHeight;
  const gs = BLOG_HERO_GRID_SPACING;
  // Solve for column/row counts that hit the dot budget at the image's
  // aspect: cols/rows = aspect, cols*rows = budget.
  const rows = Math.max(1, Math.round(Math.sqrt(BLOG_HERO_TARGET_DOTS / aspect)));
  const cols = Math.max(1, Math.round(rows * aspect));
  return { width: cols * gs, height: rows * gs, gridSpacing: gs };
}

interface BlogManifestEntry {
  slug: string;
  /** Folder name under content/blog/ (may include a YYYY-MM-DD- prefix). */
  folder: string;
  title: string;
  date: string;
  description: string;
  author: string;
  tags: string[];
  heroAlt: string;
  dotsPath: string;
  ogImagePath: string;
  squareImagePath: string;
  readingTimeMinutes: number;
  canonical: string | null;
  draft: boolean;
  sourceMtime: string;
}

async function processHeroPipeline(): Promise<void> {
  const sourceDir = path.resolve(process.cwd(), HERO_SOURCE_DIR);
  const outputDir = path.resolve(process.cwd(), HERO_OUTPUT_DIR);

  if (!fs.existsSync(sourceDir)) {
    console.warn(`Hero source directory not found, skipping: ${HERO_SOURCE_DIR}`);
    return;
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const sourceFiles = fs
    .readdirSync(sourceDir)
    .filter((name) => SUPPORTED_IMAGE_EXTS.has(path.extname(name).toLowerCase()))
    .sort();

  if (sourceFiles.length === 0) {
    console.warn(`No images found in ${HERO_SOURCE_DIR}`);
  } else {
    console.log(
      `[hero] Grid: ${HERO_OPTIONS.canvasWidth}x${HERO_OPTIONS.canvasHeight} @ ${HERO_OPTIONS.gridSpacing}px spacing`,
    );
    console.log(`[hero] Found ${sourceFiles.length} image(s) in ${HERO_SOURCE_DIR}`);
  }

  const manifest: { source: string; output: string }[] = [];
  let processed = 0;
  let skipped = 0;

  for (const filename of sourceFiles) {
    const inputPath = path.join(sourceDir, filename);
    const outputName = `${path.basename(filename, path.extname(filename))}.json`;
    const outputPath = path.join(outputDir, outputName);

    manifest.push({ source: filename, output: outputName });

    const inputStat = fs.statSync(inputPath);
    const outputExists = fs.existsSync(outputPath);
    const outputStat = outputExists ? fs.statSync(outputPath) : null;

    if (!force && outputStat && outputStat.mtimeMs >= inputStat.mtimeMs) {
      skipped++;
      console.log(`[hero]   skip ${filename} (up to date)`);
      continue;
    }

    process.stdout.write(`[hero]   process ${filename}... `);
    const buf = fs.readFileSync(inputPath);
    const result = await imageToDots(buf, HERO_OPTIONS);
    fs.writeFileSync(outputPath, JSON.stringify(result));
    processed++;
    const kb = (fs.statSync(outputPath).size / 1024).toFixed(0);
    console.log(`ok  ${result.dots.length.toLocaleString()} dots (${kb} KB)`);
  }

  // Drop stale outputs whose source has been removed.
  const expected = new Set(manifest.map((e) => e.output));
  for (const existing of fs.readdirSync(outputDir)) {
    if (!existing.endsWith(".json")) continue;
    if (!expected.has(existing)) {
      fs.unlinkSync(path.join(outputDir, existing));
      console.log(`[hero]   remove stale ${existing}`);
    }
  }

  const manifestModulePath = path.resolve(process.cwd(), HERO_MANIFEST_PATH);
  fs.mkdirSync(path.dirname(manifestModulePath), { recursive: true });
  const imagesLiteral = manifest
    .map((e) => `  ${JSON.stringify(e.output)},`)
    .join("\n");
  const manifestSource = `// Auto-generated by scripts/process-content.ts. Do not edit by hand.
// Regenerate via \`npm run process-content\` (also runs on dev/build).

export interface HeroManifest {
  generatedAt: string;
  images: readonly string[];
}

export const heroManifest: HeroManifest = {
  generatedAt: ${JSON.stringify(new Date().toISOString())},
  images: [
${imagesLiteral}
  ],
};
`;
  fs.writeFileSync(manifestModulePath, manifestSource);

  console.log(
    `[hero] Done. ${processed} processed, ${skipped} skipped, ${manifest.length} in manifest.`,
  );
}

/**
 * Strip a leading `YYYY-MM-DD-` prefix from a folder name so URLs stay
 * clean while folders sort chronologically on disk. Folders without the
 * prefix are returned unchanged.
 */
function folderToSlug(folder: string): string {
  const match = folder.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1] : folder;
}

interface RawPost {
  folder: string;
  slug: string;
  postPath: string;
  frontmatter: Record<string, unknown>;
  body: string;
  heroPath: string;
  sourceMtimeMs: number;
}

function readPosts(): RawPost[] {
  const sourceDir = path.resolve(process.cwd(), BLOG_SOURCE_DIR);
  if (!fs.existsSync(sourceDir)) return [];

  const folders = fs
    .readdirSync(sourceDir)
    .filter((name) => {
      const full = path.join(sourceDir, name);
      return fs.statSync(full).isDirectory();
    });

  const posts: RawPost[] = [];
  for (const folder of folders) {
    const folderPath = path.join(sourceDir, folder);
    const postPath = path.join(folderPath, "post.mdx");
    if (!fs.existsSync(postPath)) {
      console.warn(`[blog]   skip ${folder}: no post.mdx`);
      continue;
    }
    const raw = fs.readFileSync(postPath, "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data;
    const heroField = typeof fm.hero === "string" ? fm.hero : "hero.jpg";
    const heroPath = path.join(folderPath, heroField);
    if (!fs.existsSync(heroPath)) {
      console.warn(
        `[blog]   skip ${folder}: hero "${heroField}" not found at ${heroPath}`,
      );
      continue;
    }
    const slug = folderToSlug(folder);
    const postMtime = fs.statSync(postPath).mtimeMs;
    const heroMtime = fs.statSync(heroPath).mtimeMs;
    posts.push({
      folder,
      slug,
      postPath,
      frontmatter: fm,
      body: parsed.content,
      heroPath,
      sourceMtimeMs: Math.max(postMtime, heroMtime),
    });
  }
  return posts;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function asISODate(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

async function processBlogPipeline(): Promise<void> {
  const blogDataDir = path.resolve(process.cwd(), BLOG_DATA_DIR);
  const blogOgDir = path.resolve(process.cwd(), BLOG_OG_DIR);
  fs.mkdirSync(blogDataDir, { recursive: true });
  fs.mkdirSync(blogOgDir, { recursive: true });

  const posts = readPosts();
  if (posts.length === 0) {
    console.log(`[blog] No posts found in ${BLOG_SOURCE_DIR}`);
  } else {
    console.log(`[blog] Found ${posts.length} post(s) in ${BLOG_SOURCE_DIR}`);
  }

  const entries: BlogManifestEntry[] = [];
  let processed = 0;
  let skipped = 0;

  for (const post of posts) {
    const dotsPath = path.join(blogDataDir, `${post.slug}.json`);
    const ogPath = path.join(blogOgDir, `${post.slug}.png`);
    const squarePath = path.join(blogOgDir, `${post.slug}.square.png`);

    const allOutputsFresh =
      !force &&
      fs.existsSync(dotsPath) &&
      fs.existsSync(ogPath) &&
      fs.existsSync(squarePath) &&
      fs.statSync(dotsPath).mtimeMs >= post.sourceMtimeMs &&
      fs.statSync(ogPath).mtimeMs >= post.sourceMtimeMs &&
      fs.statSync(squarePath).mtimeMs >= post.sourceMtimeMs;

    if (allOutputsFresh) {
      skipped++;
      console.log(`[blog]   skip ${post.slug} (up to date)`);
    } else {
      process.stdout.write(`[blog]   process ${post.slug}... `);
      const buf = fs.readFileSync(post.heroPath);

      // Read the source's actual dimensions so the on-screen hero grid
      // can match its aspect ratio. Without this, sharp's `cover` fit
      // inside imageToDots would discard image content (top + bottom of
      // a portrait-leaning image, sides of a panorama) before the canvas
      // ever got to make a layout decision.
      const meta = await sharp(buf).metadata();
      if (!meta.width || !meta.height) {
        throw new Error(
          `[blog] ${post.slug}: hero image is missing width/height metadata`,
        );
      }
      const heroDims = deriveHeroDims(meta.width, meta.height);

      const heroDots = await imageToDots(buf, {
        gridSpacing: heroDims.gridSpacing,
        canvasWidth: heroDims.width,
        canvasHeight: heroDims.height,
        maxSizeFraction: BLOG_HERO_MAX_SIZE_FRACTION,
        darknessThreshold: 0,
      });
      fs.writeFileSync(dotsPath, JSON.stringify(heroDots));

      const ogDots = await imageToDots(buf, {
        gridSpacing: BLOG_OG_DIMS.gridSpacing,
        canvasWidth: BLOG_OG_DIMS.width,
        canvasHeight: BLOG_OG_DIMS.height,
        darknessThreshold: 0,
      });
      const ogPng = await dotsToPng(ogDots, {
        width: BLOG_OG_DIMS.width,
        height: BLOG_OG_DIMS.height,
      });
      fs.writeFileSync(ogPath, ogPng);

      const squareDots = await imageToDots(buf, {
        gridSpacing: BLOG_SQUARE_DIMS.gridSpacing,
        canvasWidth: BLOG_SQUARE_DIMS.width,
        canvasHeight: BLOG_SQUARE_DIMS.height,
        darknessThreshold: 0,
      });
      const squarePng = await dotsToPng(squareDots, {
        width: BLOG_SQUARE_DIMS.width,
        height: BLOG_SQUARE_DIMS.height,
      });
      fs.writeFileSync(squarePath, squarePng);

      processed++;
      const dotsKb = (fs.statSync(dotsPath).size / 1024).toFixed(0);
      const ogKb = (fs.statSync(ogPath).size / 1024).toFixed(0);
      const sqKb = (fs.statSync(squarePath).size / 1024).toFixed(0);
      console.log(
        `ok  dots ${heroDots.dots.length.toLocaleString()} (${dotsKb}KB), og ${ogKb}KB, square ${sqKb}KB`,
      );
    }

    const fm = post.frontmatter;
    const stats = readingTime(post.body);
    entries.push({
      slug: post.slug,
      folder: post.folder,
      title: asString(fm.title, post.slug),
      date: asISODate(fm.date),
      description: asString(fm.description),
      author: asString(fm.author, "Justin Paulin"),
      tags: asStringArray(fm.tags),
      heroAlt: asString(fm.heroAlt),
      dotsPath: `/data/blog/${post.slug}.json`,
      ogImagePath: `/og/blog/${post.slug}.png`,
      squareImagePath: `/og/blog/${post.slug}.square.png`,
      readingTimeMinutes: Math.max(1, Math.round(stats.minutes)),
      canonical: asString(fm.canonical) || null,
      draft: fm.draft === true,
      sourceMtime: new Date(post.sourceMtimeMs).toISOString(),
    });
  }

  // Drop stale outputs whose post has been removed.
  const liveSlugs = new Set(entries.map((e) => e.slug));
  for (const dir of [blogDataDir, blogOgDir]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      const slug = file.replace(/\.(square\.)?png$/, "").replace(/\.json$/, "");
      if (!liveSlugs.has(slug)) {
        fs.unlinkSync(path.join(dir, file));
        console.log(`[blog]   remove stale ${path.basename(dir)}/${file}`);
      }
    }
  }

  // Sort newest-first; this is the order the index page will use.
  entries.sort((a, b) => (a.date < b.date ? 1 : -1));

  const manifestModulePath = path.resolve(process.cwd(), BLOG_MANIFEST_PATH);
  fs.mkdirSync(path.dirname(manifestModulePath), { recursive: true });
  const manifestSource = `// Auto-generated by scripts/process-content.ts. Do not edit by hand.
// Regenerate via \`npm run process-content\` (also runs on dev/build).

export interface BlogManifestEntry {
  slug: string;
  /** Folder name under content/blog/ (may include a YYYY-MM-DD- prefix). */
  folder: string;
  title: string;
  /** ISO 8601 date string (frontmatter \`date\`) */
  date: string;
  description: string;
  author: string;
  tags: readonly string[];
  heroAlt: string;
  /** Absolute URL path (under /public) for the dot-data JSON. */
  dotsPath: string;
  /** 1200x630 OG image path. */
  ogImagePath: string;
  /** 800x800 square thumbnail used by the blog index card. */
  squareImagePath: string;
  readingTimeMinutes: number;
  canonical: string | null;
  draft: boolean;
  /** Mtime of the most-recently-edited post asset (mdx or hero). */
  sourceMtime: string;
}

export interface BlogManifest {
  generatedAt: string;
  posts: readonly BlogManifestEntry[];
}

export const blogManifest: BlogManifest = {
  generatedAt: ${JSON.stringify(new Date().toISOString())},
  posts: ${JSON.stringify(entries, null, 2)},
};
`;
  fs.writeFileSync(manifestModulePath, manifestSource);

  console.log(
    `[blog] Done. ${processed} processed, ${skipped} skipped, ${entries.length} in manifest.`,
  );
}

async function main() {
  await processHeroPipeline();
  await processBlogPipeline();
  console.log("All content pipelines complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
