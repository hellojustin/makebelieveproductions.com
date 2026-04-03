/**
 * Build-time script: converts the hero reference image into dot data
 * and writes it to public/data/hero-dots.json.
 *
 * Usage:
 *   npx tsx scripts/process-hero.ts [imagePath] [options]
 *
 * Options (all optional):
 *   --input     Path to source image. Default: .claude/reference/hero-reference-1.jpeg
 *   --output    Path for JSON output.  Default: public/data/hero-dots.json
 *   --spacing   Grid spacing in px.   Default: 8
 *   --width     Canvas width in px.   Default: 1440
 *   --height    Canvas height in px.  Default: 900
 *
 * Examples:
 *   npx tsx scripts/process-hero.ts
 *   npx tsx scripts/process-hero.ts --input .claude/reference/hero-reference-3.jpeg --spacing 6
 */

import fs from "fs";
import path from "path";
import { imageToDots, ImageToDotsOptions } from "../src/lib/image-to-dots";

function parseArgs(): { input: string; output: string; options: ImageToDotsOptions } {
  const args = process.argv.slice(2);
  const get = (flag: string, fallback: string) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
  };

  return {
    input: get("--input", ".claude/reference/hero-reference-1.jpeg"),
    output: get("--output", "public/data/hero-dots.json"),
    options: {
      gridSpacing: parseInt(get("--spacing", "8"), 10),
      canvasWidth: parseInt(get("--width", "1440"), 10),
      canvasHeight: parseInt(get("--height", "900"), 10),
    },
  };
}

async function main() {
  const { input, output, options } = parseArgs();

  const inputPath = path.resolve(process.cwd(), input);
  const outputPath = path.resolve(process.cwd(), output);

  if (!fs.existsSync(inputPath)) {
    console.error(`Image not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Processing: ${input}`);
  console.log(`  Canvas:  ${options.canvasWidth} × ${options.canvasHeight}`);
  console.log(`  Spacing: ${options.gridSpacing}px`);

  const imageBuffer = fs.readFileSync(inputPath);
  const result = await imageToDots(imageBuffer, options);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result));

  const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log(`✓ ${result.dots.length.toLocaleString()} dots → ${output} (${fileSizeKB} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
