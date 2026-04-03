/**
 * Processes all 6 hero reference images into dot data files with a consistent
 * grid — same dot count and positions across every image, so dots can morph
 * between images without remapping.
 *
 * darknessThreshold is set to 0 so no dots are filtered out. Dark pixels get
 * a near-zero size rather than being omitted.
 *
 * Output: public/data/dots-1.json through public/data/dots-6.json
 *
 * Usage:
 *   npm run process-all
 *   npm run process-all -- --spacing 10
 */

import fs from "fs";
import path from "path";
import { imageToDots } from "../src/lib/image-to-dots";

const args = process.argv.slice(2);
const getArg = (flag: string, fallback: string) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const OPTIONS = {
  gridSpacing: parseInt(getArg("--spacing", "8"), 10),
  canvasWidth: parseInt(getArg("--width", "1440"), 10),
  canvasHeight: parseInt(getArg("--height", "900"), 10),
  darknessThreshold: 0, // include ALL grid positions — required for consistent dot count
};

async function main() {
  console.log(
    `Grid: ${OPTIONS.canvasWidth}×${OPTIONS.canvasHeight} @ ${OPTIONS.gridSpacing}px spacing`
  );

  for (let i = 1; i <= 6; i++) {
    const inputPath = path.resolve(
      process.cwd(),
      `.claude/reference/hero-reference-${i}.jpeg`
    );
    const outputPath = path.resolve(process.cwd(), `public/data/dots-${i}.json`);

    if (!fs.existsSync(inputPath)) {
      console.warn(`  ⚠ Skipping: hero-reference-${i}.jpeg not found`);
      continue;
    }

    process.stdout.write(`  Processing image ${i}/6... `);
    const buf = fs.readFileSync(inputPath);
    const result = await imageToDots(buf, OPTIONS);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result));

    const kb = (fs.statSync(outputPath).size / 1024).toFixed(0);
    console.log(`✓  ${result.dots.length.toLocaleString()} dots (${kb} KB)`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
