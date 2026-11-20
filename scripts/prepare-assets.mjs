import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }
const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(siteRoot, '../..');
const photoDir = path.join(workspace, 'output/akang-kasep-website-spec/project-photos');
const approvedHome = path.join(workspace, 'output/AKANG-KASEP-CURRENT-DESIGNS-2026-11-21/Pages/01-Home.png');
const sourceLogo = path.join(workspace, 'design-concepts/akang-kasep-selected-theme/original-logo.jpg');
const assetDir = path.join(siteRoot, 'public/assets');
const docsDir = path.join(siteRoot, 'docs');
await fs.mkdir(assetDir, { recursive: true });
await fs.mkdir(docsDir, { recursive: true });
const sha = data => createHash('sha256').update(data).digest('hex');
const raw = file => sharp(file).removeAlpha().raw().toBuffer();
const inventory = {
  preparedOn: '2026-11-21',
  policy: 'Original photography is preserved. Full-size WebP files use lossless encoding and decode to the exact original RGB pixels. Responsive files resize without upscaling, then use lossless encoding. No AI reconstruction, retouching or fabricated architectural details.',
  photos: [], decorations: [], brand: [], fonts: []
};

const names = (await fs.readdir(photoDir)).filter(name => /^\d{2}-.+\.png$/i.test(name)).sort();
for (const name of names) {
  const source = path.join(photoDir, name);
  const data = await fs.readFile(source);
  const meta = await sharp(data).metadata();
  const id = name.slice(0, 2);
  const sourcePixels = await raw(source);
  const item = {
    id: Number(id), source: `owner-supplied/project-photos/${name}`,
    originalBytes: data.length, originalWidth: meta.width, originalHeight: meta.height,
    originalFileSha256: sha(data), originalRgbSha256: sha(sourcePixels), outputs: []
  };
  for (const requestedWidth of [meta.width, 768, 480]) {
    if (requestedWidth > meta.width) continue;
    const isOriginal = requestedWidth === meta.width;
    const filename = `image-${id}${isOriginal ? '' : '-' + requestedWidth}.webp`;
    const destination = path.join(assetDir, filename);
    let pipeline = sharp(data).removeAlpha();
    if (!isOriginal) pipeline = pipeline.resize({ width: requestedWidth, withoutEnlargement: true, kernel: 'lanczos3' });
    await pipeline.webp({ lossless: true, effort: 6 }).toFile(destination);
    const result = await fs.readFile(destination);
    const resultMeta = await sharp(result).metadata();
    const resultPixels = await raw(destination);
    if (isOriginal && sha(resultPixels) !== sha(sourcePixels)) throw new Error(`Pixel mismatch: ${filename}`);
    item.outputs.push({ file: `/assets/${filename}`, bytes: result.length, width: resultMeta.width, height: resultMeta.height,
      sha256: sha(result), rgbSha256: sha(resultPixels), losslessEncoding: true,
      originalPixelsPreserved: isOriginal, operation: isOriginal ? 'Lossless WebP transcode only' : `Resize to ${requestedWidth}px width without upscaling, then lossless WebP` });
  }
  inventory.photos.push(item);
  console.log(`Prepared photo ${id}`);
}

// Crop the original source logo around its visible colored mark and wordmark.
// Retain white matte and original RGB pixels; CSS mix-blend-mode:multiply can
// integrate this into ivory surfaces without inventing or redrawing the logo.
const logoCrop = { left: 67, top: 231, width: 878, height: 558 };
const logoSourceSha256 = sha(await fs.readFile(sourceLogo));
const homeSourceSha256 = sha(await fs.readFile(approvedHome));
const logoPath = path.join(assetDir, 'logo.webp');
await sharp(sourceLogo).extract(logoCrop).webp({ lossless: true, effort: 6 }).toFile(logoPath);
const expectedLogo = await sharp(sourceLogo).extract(logoCrop).removeAlpha().raw().toBuffer();
if (sha(expectedLogo) !== sha(await raw(logoPath))) throw new Error('Logo crop pixels changed');
inventory.brand.push({ file: '/assets/logo.webp', source: 'original-logo.jpg extracted from physical PDF page 23', sourceFileSha256: logoSourceSha256, crop: logoCrop,
  width: 878, height: 558, sha256: sha(await fs.readFile(logoPath)), operation: 'Crop only, lossless WebP, white matte retained',
  note: 'Use mix-blend-mode:multiply on approved ivory background. No logo redraw or generative edit.' });
for (const width of [256, 512]) {
  const filename = `logo-${width}.webp`;
  const destination = path.join(assetDir, filename);
  await sharp(sourceLogo).extract(logoCrop).resize({ width, withoutEnlargement: true }).webp({ lossless: true, effort: 6 }).toFile(destination);
  inventory.brand.push({ file: '/assets/' + filename, source: 'original-logo.jpg extracted from physical PDF page 23', sourceFileSha256: logoSourceSha256, crop: logoCrop,
    width, operation: `Crop original logo, resize to ${width}px width, lossless WebP`, bytes: (await fs.stat(destination)).size,
    sha256: sha(await fs.readFile(destination)), note: 'Responsive header variant; use with srcset and mix-blend-mode:multiply.' });
}
const faviconPath = path.join(assetDir, 'favicon.png');
await sharp(sourceLogo).extract({ left: 67, top: 231, width: 878, height: 468 })
  .resize(128, 128, { fit: 'contain', background: '#ffffff' }).png({ compressionLevel: 9 }).toFile(faviconPath);
inventory.brand.push({ file: '/assets/favicon.png', source: 'original-logo.jpg', sourceFileSha256: logoSourceSha256,
  operation: 'Crop the AK symbol (exclude wordmark), fit into 128x128 white square, lossless PNG', sha256: sha(await fs.readFile(faviconPath)) });

for (const [filename, crop, description] of [
  ['paper-texture.webp', { left: 0, top: 90, width: 128, height: 128 }, 'Clean ivory paper texture from the approved homepage left margin'],
  ['green-texture.webp', { left: 0, top: 1402, width: 256, height: 80 }, 'Clean deep green texture from the approved homepage closing CTA, clear of text and buttons']
]) {
  const destination = path.join(assetDir, filename);
  await sharp(approvedHome).extract(crop).webp({ lossless: true, effort: 6 }).toFile(destination);
  const expectedPixels = await sharp(approvedHome).extract(crop).removeAlpha().raw().toBuffer();
  if (sha(expectedPixels) !== sha(await raw(destination))) throw new Error(`Texture crop mismatch: ${filename}`);
  inventory.decorations.push({ file: '/assets/' + filename, source: 'approved-current/01-Home.png', sourceFileSha256: homeSourceSha256, crop, description,
    operation: 'Exact source-pixel crop with lossless WebP encoding', bytes: (await fs.stat(destination)).size,
    sha256: sha(await fs.readFile(destination)) });
}

const fonts = [
  ['heading.woff2', 'DM Serif Display', 'normal', '400', 'https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFnOHM81r4j6k0gjAW3mujVU2B2G_Bx0g.woff2', 'LICENSE-DM-Serif-Display.txt'],
  ['heading-italic.woff2', 'DM Serif Display', 'italic', '400', 'https://fonts.gstatic.com/s/dmserifdisplay/v17/-nFhOHM81r4j6k0gjAW3mujVU2B2G_VB0PD2.woff2', 'LICENSE-DM-Serif-Display.txt'],
  ['body.woff2', 'Manrope', 'normal', '400 800', 'https://fonts.gstatic.com/s/manrope/v23/xn7gYHE41ni1AdIRggexSg.woff2', 'LICENSE-Manrope.txt'],
];
for (const [file, family, style, weight, sourceUrl, license] of fonts) {
  const filePath = path.join(assetDir, file);
  const data = await fs.readFile(filePath);
  inventory.fonts.push({ file: '/assets/' + file, family, style, weight, subset: 'latin', format: 'woff2', sourceUrl,
    license: 'SIL Open Font License 1.1', licenseFile: '/assets/' + license, sha256: sha(data), bytes: data.length,
    matchStatus: 'Visual match selected for the raster design; exact original family cannot be established from generated artwork' });
}
inventory.totals = {
  originalPhotoBytes: inventory.photos.reduce((sum, item) => sum + item.originalBytes, 0),
  losslessOriginalSizePhotoBytes: inventory.photos.reduce((sum, item) => sum + item.outputs[0].bytes, 0),
  allResponsivePhotoBytes: inventory.photos.reduce((sum, item) => sum + item.outputs.reduce((a, f) => a + f.bytes, 0), 0),
  fontBytes: inventory.fonts.reduce((sum, item) => sum + item.bytes, 0)
};
inventory.totals.losslessOriginalSizeSavingsPercent = Number((100 * (1 - inventory.totals.losslessOriginalSizePhotoBytes / inventory.totals.originalPhotoBytes)).toFixed(2));
await fs.writeFile(path.join(docsDir, 'asset-inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
console.log(JSON.stringify(inventory.totals));
