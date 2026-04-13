/**
 * screenshot.mjs — takes a Puppeteer screenshot of a localhost URL
 *
 * Usage:
 *   node screenshot.mjs http://localhost:3000
 *   node screenshot.mjs http://localhost:3000 label
 *
 * Screenshots are saved to ./temporary screenshots/screenshot-N[-label].png
 * (auto-incremented, never overwritten).
 *
 * Puppeteer is located via the PUPPETEER_EXECUTABLE_PATH env var or
 * auto-detected from common Windows install locations.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// ── Output directory ──────────────────────────────────────────────────────────
const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── Auto-increment filename ───────────────────────────────────────────────────
function nextFilename() {
  let n = 1;
  while (true) {
    const name = label
      ? `screenshot-${n}-${label}.png`
      : `screenshot-${n}.png`;
    if (!fs.existsSync(path.join(outDir, name))) return name;
    n++;
  }
}

// ── Launch & screenshot ───────────────────────────────────────────────────────
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log(`Navigating to ${url} …`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait a moment for animations to settle
  await new Promise(r => setTimeout(r, 800));

  const filename = nextFilename();
  const filePath = path.join(outDir, filename);

  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Screenshot saved: temporary screenshots/${filename}`);

  await browser.close();
})().catch(err => {
  console.error('Screenshot failed:', err.message);
  console.error('\nMake sure Puppeteer is installed:');
  console.error('  npm install puppeteer');
  process.exit(1);
});
