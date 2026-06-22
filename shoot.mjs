// shoot.mjs — viewport screenshots at given scroll positions (for seam verification)
// Usage: node shoot.mjs <url> <outDir> <label> [selectorOrFraction ...]
//   target forms:  "#contact"  (scroll element into view, then nudge)
//                  "0.55"      (scroll to fraction of full page height)
//                  "#contact+300" (element top + offset px)
import { chromium } from 'playwright';
import fs from 'fs';

const url    = process.argv[2] || 'http://localhost:7770';
const outDir = process.argv[3] || 'screenshots';
const label  = process.argv[4] || 'seam';
const targets = process.argv.slice(5);
const reduce  = process.env.REDUCE === '1';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });
if (reduce) await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

async function shoot(name) {
  const f = `${outDir}/${label}-${name}.png`;
  await page.screenshot({ path: f });
  console.log('  →', f);
}

for (const t of targets) {
  let pos;
  if (t.startsWith('#')) {
    const [sel, offRaw] = t.split('+');
    const off = offRaw ? parseInt(offRaw, 10) : 0;
    pos = await page.evaluate(({ sel, off }) => {
      const el = document.querySelector(sel);
      if (!el) return 0;
      return window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.35 + off;
    }, { sel, off });
  } else {
    const frac = parseFloat(t);
    pos = await page.evaluate((frac) => (document.body.scrollHeight - window.innerHeight) * frac, frac);
  }
  await page.evaluate((y) => window.scrollTo(0, y), pos);
  await page.waitForTimeout(700);
  const safe = t.replace(/[#+.]/g, '_');
  await shoot(safe);
}

await browser.close();
console.log('Done', label);
