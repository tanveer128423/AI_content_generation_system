import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Paths
const projectRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const svgPath = path.join(projectRoot, 'public', 'favicon.svg');
const outPng = path.join(projectRoot, 'public', 'image.png');

async function generate() {
  if (!fs.existsSync(svgPath)) {
    console.error('SVG source not found:', svgPath);
    process.exit(2);
  }

  // Generate multiple sizes: 64x64 (image.png) and 32x32 (image-32.png)
  const sizes = [64, 32];

  try {
    for (const s of sizes) {
      const buf = await sharp(svgPath)
        .resize(s, s, { fit: 'contain' })
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer();

      const outPath = s === 64 ? outPng : path.join(path.dirname(outPng), `image-${s}.png`);
      await fs.promises.writeFile(outPath, buf);
      console.log('Wrote PNG favicon:', outPath);
    }
  } catch (err) {
    console.error('Failed to generate favicon:', err);
    process.exit(1);
  }
}

generate();
