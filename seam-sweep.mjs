// seam-sweep.mjs — dense render of vp 0.78..1.22 through the card-0/card-1 seam
// Usage: node seam-sweep.mjs
import { chromium } from 'playwright';
import fs from 'fs';

const url    = 'http://localhost:7770';
const outDir = 'screenshots/seam-sweep';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// vp steps: 0.78 to 1.22 in steps of 0.04  (12 frames)
const vps = [];
for (let v = 0.78; v <= 1.221; v += 0.04) vps.push(parseFloat(v.toFixed(2)));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

// Scroll into the sticky section so it's attached
await page.evaluate(() => {
  const outer = document.querySelector('.practice-scroll-outer');
  window.scrollTo(0, outer.offsetTop + window.innerHeight * 1.5);
});
await page.waitForTimeout(1200);

const TOTAL = 4, SEAM = 0.22, CROSS = 0.16, DRIFT = 24, DRIFT_PHOTO = 12;

for (const vp of vps) {
  await page.evaluate(({ vp, TOTAL, SEAM, CROSS, DRIFT, DRIFT_PHOTO }) => {
    function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
    function stateOf(i) {
      const start = i, end = i+1;
      const fadeIn  = i===0         ? 1 : Math.min(1, Math.max(0, (vp-start)/CROSS+0.5));
      const fadeOut = i===TOTAL-1   ? 1 : Math.min(1, Math.max(0, (end-vp)/CROSS+0.5));
      const opacity = Math.min(fadeIn, fadeOut);
      const enterEnd = start+SEAM, exitStart = end-SEAM;
      let t;
      if      (vp <= start)      t = i===0       ? 0 : DRIFT;
      else if (vp >= end)        t = i===TOTAL-1 ? 0 : -DRIFT;
      else if (vp < enterEnd)    t = DRIFT*(1-easeInOut((vp-start)/SEAM));
      else if (vp > exitStart)   t = -DRIFT*easeInOut((vp-exitStart)/SEAM);
      else                       t = 0;
      return { opacity, translate: t };
    }
    document.querySelectorAll('.practice-flip-card').forEach((c,i) => {
      const s = stateOf(i);
      c.style.setProperty('transition','none','important');
      c.style.setProperty('opacity', s.opacity, 'important');
      c.style.setProperty('transform', s.translate===0?'none':`translateY(${s.translate}px)`,'important');
    });
    document.querySelectorAll('.practice-flip-photo').forEach((p,i) => {
      const s = stateOf(i);
      const pt = s.translate*(DRIFT_PHOTO/DRIFT);
      p.style.setProperty('transition','none','important');
      p.style.setProperty('opacity', s.opacity, 'important');
      p.style.setProperty('transform', pt===0?'none':`translateY(${pt}px)`,'important');
    });
  }, { vp, TOTAL, SEAM, CROSS, DRIFT, DRIFT_PHOTO });

  await page.waitForTimeout(80);
  const name = `${outDir}/vp-${String(vp.toFixed(2)).replace('.','_')}.png`;
  await page.screenshot({ path: name, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log(`  vp=${vp.toFixed(2)}  →  ${name}`);
}

await browser.close();
console.log('\nDone. Review screenshots/seam-sweep/ for the crossfade frames.');
