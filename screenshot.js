// screenshot.js — full-page screenshots at desktop, tablet, and mobile viewports
// Usage: node screenshot.js <url> [output-dir]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'mobile',  width: 375,  height: 812  },
];

async function main() {
  const url    = process.argv[2] || 'http://localhost:3000';
  const outDir = process.argv[3] || 'screenshots';
  const ts     = Date.now();

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  console.log(`Taking screenshots of: ${url}\n`);

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Extra wait for SPAs — remove if not needed
    // await page.waitForTimeout(2000);

    const filePath = path.join(outDir, `${vp.name}-${ts}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`  ${vp.name.padEnd(8)} (${vp.width}x${vp.height})  →  ${filePath}`);
    await page.close();
  }

  await browser.close();
  console.log('\nDone. Open the PNG files to review each viewport.');
}

main().catch(err => { console.error(err); process.exit(1); });
