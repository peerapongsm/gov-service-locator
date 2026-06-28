// gen-icons.mjs — generate PWA icons using sharp (SVG → PNG)
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icon');
mkdirSync(outDir, { recursive: true });

function makeSvg(size) {
  const s = size;
  const pad = Math.round(s * 0.12);
  const w = s - pad * 2;
  // Government building: base, columns, pediment, dome-pin
  const cx = s / 2;
  const baseY = s - pad;
  const baseH = Math.round(s * 0.1);
  const colW = Math.round(w * 0.1);
  const colGap = Math.round(w * 0.06);
  const colH = Math.round(s * 0.32);
  const colY = baseY - baseH - colH;
  const pedH = Math.round(s * 0.12);
  const pedW = Math.round(w * 0.72);
  const pedY = colY - pedH;
  // dome/circle on top
  const domeR = Math.round(s * 0.1);
  const domeY = pedY - domeR * 0.7;
  // 3 columns evenly spaced
  const col1x = cx - colGap - colW;
  const col2x = cx - colW / 2;
  const col3x = cx + colGap;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${Math.round(s * 0.15)}" fill="#0B3954"/>
  <!-- base -->
  <rect x="${cx - w / 2}" y="${baseY - baseH}" width="${w}" height="${baseH}" rx="2" fill="#D9891A"/>
  <!-- columns -->
  <rect x="${col1x}" y="${colY}" width="${colW}" height="${colH}" rx="2" fill="#D9891A"/>
  <rect x="${col2x}" y="${colY}" width="${colW}" height="${colH}" rx="2" fill="#D9891A"/>
  <rect x="${col3x}" y="${colY}" width="${colW}" height="${colH}" rx="2" fill="#D9891A"/>
  <!-- pediment (triangle) -->
  <polygon points="${cx - pedW / 2},${pedY + pedH} ${cx + pedW / 2},${pedY + pedH} ${cx},${pedY}" fill="#D9891A"/>
  <!-- dome -->
  <circle cx="${cx}" cy="${domeY}" r="${domeR}" fill="#D9891A"/>
</svg>`;
}

async function genIcon(size) {
  const svg = Buffer.from(makeSvg(size), 'utf8');
  const outPath = join(outDir, `icon-${size}.png`);
  await sharp(svg).png().toFile(outPath);
  console.log(`Generated ${outPath}`);
}

await genIcon(192);
await genIcon(512);
console.log('Icons done.');
