// seam-optionD.mjs — dense render of vp 0.78..1.22 with Option D logic
// PHOTOS: continuous crossfade (stateOf)
// CARDS (text): discrete — binary opacity based on active card
import { chromium } from 'playwright';
import fs from 'fs';

const url    = 'http://localhost:7770';
const outDir = 'screenshots/seam-optionD';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const vps = [];
for (let v = 0.78; v <= 1.221; v += 0.04) vps.push(parseFloat(v.toFixed(2)));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

await page.evaluate(() => {
  const outer = document.querySelector('.practice-scroll-outer');
  window.scrollTo(0, outer.offsetTop + window.innerHeight * 1.5);
});
await page.waitForTimeout(1500); // extra wait to ensure lerp fully settled

const TOTAL = 4, SEAM = 0.22, CROSS = 0.16, DRIFT = 24, DRIFT_PHOTO = 12;

for (const vp of vps) {
  await page.evaluate(({ vp, TOTAL, SEAM, CROSS, DRIFT, DRIFT_PHOTO }) => {
    function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
    function stateOf(i) {
      const start = i, end = i+1;
      const fadeIn  = i===0       ? 1 : Math.min(1, Math.max(0, (vp-start)/CROSS+0.5));
      const fadeOut = i===TOTAL-1 ? 1 : Math.min(1, Math.max(0, (end-vp)/CROSS+0.5));
      const opacity = Math.min(fadeIn, fadeOut);
      const enterEnd = start+SEAM, exitStart = end-SEAM;
      let t;
      if      (vp <= start)    t = i===0       ? 0 : DRIFT;
      else if (vp >= end)      t = i===TOTAL-1 ? 0 : -DRIFT;
      else if (vp < enterEnd)  t = DRIFT*(1-easeInOut((vp-start)/SEAM));
      else if (vp > exitStart) t = -DRIFT*easeInOut((vp-exitStart)/SEAM);
      else                     t = 0;
      return { opacity, translate: t };
    }

    const active = Math.min(TOTAL-1, Math.max(0, Math.round(vp - 0.5)));

    /* PHOTOS: continuous crossfade — same as original */
    document.querySelectorAll('.practice-flip-photo').forEach((p, i) => {
      const s = stateOf(i);
      const pt = s.translate * (DRIFT_PHOTO / DRIFT);
      p.style.setProperty('transition', 'none', 'important');
      p.style.setProperty('opacity', String(s.opacity), 'important');
      p.style.setProperty('transform', pt === 0 ? 'none' : `translateY(${pt}px)`, 'important');
    });

    /* CARDS (text): Option D — discrete binary switch */
    document.querySelectorAll('.practice-flip-card').forEach((c, i) => {
      c.style.setProperty('transition', 'none', 'important');
      c.style.setProperty('opacity', (i === active) ? '1' : '0', 'important');
      c.style.setProperty('transform', (i === active) ? 'none' : 'translateY(24px)', 'important');
    });
  }, { vp, TOTAL, SEAM, CROSS, DRIFT, DRIFT_PHOTO });

  await page.waitForTimeout(80);
  const name = `${outDir}/vp-${String(vp.toFixed(2)).replace('.','_')}.png`;
  await page.screenshot({ path: name, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  const active = Math.min(3, Math.max(0, Math.round(vp - 0.5)));
  console.log(`  vp=${vp.toFixed(2)}  active=${active}  →  ${name}`);
}

await browser.close();
console.log('\nDone.');
