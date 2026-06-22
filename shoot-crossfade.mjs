// shoot-crossfade.mjs — deterministic render of exact vp positions in the flip,
// bypassing scroll/lerp/snap so we can see the genuine crossfade frame.
import { chromium } from 'playwright';
import fs from 'fs';

const url    = 'http://localhost:7770';
const outDir = 'screenshots/crossfade';
const vps    = process.argv.slice(2).map(Number);
if (!vps.length) { console.error('pass vp values'); process.exit(1); }
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

// pin the sticky stage so the section is visible (cloak off), then settle
await page.evaluate(() => {
  const outer = document.querySelector('.practice-scroll-outer');
  window.scrollTo(0, outer.offsetTop + window.innerHeight * 1.5);
});
await page.waitForTimeout(1200); // let lerp + snap settle

for (const vp of vps) {
  await page.evaluate((vp) => {
    const TOTAL = 4, SEAM = 0.22, CROSS = 0.16;
    const DRIFT = 24, DRIFT_PHOTO = 12;
    const easeInOut = (t) => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
    function stateOf(i, vp) {
      const start = i, end = i + 1;
      const fadeIn  = (i === 0)         ? 1 : Math.min(1, Math.max(0, (vp - start)/CROSS + 0.5));
      const fadeOut = (i === TOTAL - 1) ? 1 : Math.min(1, Math.max(0, (end - vp)/CROSS + 0.5));
      const opacity = Math.min(fadeIn, fadeOut);
      const enterEnd = start + SEAM, exitStart = end - SEAM;
      let translate;
      if      (vp <= start)      translate = i === 0       ? 0 : DRIFT;
      else if (vp >= end)        translate = i === TOTAL-1 ? 0 : -DRIFT;
      else if (vp < enterEnd)    translate = DRIFT  * (1 - easeInOut((vp - start)    / SEAM));
      else if (vp > exitStart)   translate = -DRIFT *      easeInOut((vp - exitStart) / SEAM);
      else                       translate = 0;
      return { opacity, translate };
    }
    const cards  = document.querySelectorAll('.practice-flip-card');
    const photos = document.querySelectorAll('.practice-flip-photo');
    cards.forEach((c, i) => {
      const s = stateOf(i, vp);
      const tx = s.translate === 0 ? 'none' : `translateY(${s.translate}px)`;
      c.style.setProperty('transition', 'none', 'important');
      c.style.setProperty('transform', tx, 'important');
      c.style.setProperty('opacity', s.opacity, 'important');
    });
    photos.forEach((p, i) => {
      const s = stateOf(i, vp);
      const pt = s.translate * (DRIFT_PHOTO / DRIFT);
      const tx = pt === 0 ? 'none' : `translateY(${pt}px)`;
      p.style.setProperty('transition', 'none', 'important');
      p.style.setProperty('transform', tx, 'important');
      p.style.setProperty('opacity', s.opacity, 'important');
    });
  }, vp);
  await page.waitForTimeout(120);
  const name = `${outDir}/vp-${vp.toFixed(2).replace('.', '_')}.png`;
  await page.screenshot({ path: name });
  console.log('  →', name);
}

await browser.close();
console.log('Done');
