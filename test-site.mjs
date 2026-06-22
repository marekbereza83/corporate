/* ============================================================
   TEST-SITE — pełny audyt całej witryny PACTA EDITORIAL
   Uzupełnia test-animations.mjs (stany animacji homepage) o:
   - status HTTP wszystkich stron
   - SEO/meta (title, description, canonical, favicon, lang, schema)
   - błędy konsoli / pageerror
   - martwe linki wewnętrzne (crawl) + martwe #anchory
   - GUARD wyrównania kart praktyk (łapie regresję „karta 04 od środka")
   - GUARD niebieskiego poza contact-footer (łapie blue-heading bug)
   - GUARD: krzyż na kartach-dokumentach usunięty
   Wymaga serwera na :7770 (npx serve . -l 7770).
   Exit code 1 gdy jakikolwiek assert czerwony.
   ============================================================ */
import { chromium, request } from 'playwright';

const BASE = 'http://localhost:7770';

/* lista wszystkich stron (ścieżki jak w <a href>) */
const PAGES = [
  { path: '/',                              schema: true  },
  { path: '/o-kancelarii.html',             schema: true  },
  { path: '/praktyki.html',                 schema: false },
  { path: '/praktyki/spory.html',           schema: true  },
  { path: '/praktyki/karne.html',           schema: true  },
  { path: '/praktyki/restrukturyzacja.html',schema: true  },
  { path: '/praktyki/korporacyjne.html',    schema: true  },
  { path: '/zespol.html',                   schema: false },
  { path: '/aktualnosci.html',              schema: false },
  { path: '/kontakt.html',                  schema: true  },
  { path: '/privacy-policy.html',           schema: false },
  { path: '/404.html',                      schema: false },
];

const errors = [];
const fail = (page, msg) => errors.push(`[${page}] ${msg}`);

console.log('=== TEST-SITE: pełny audyt PACTA EDITORIAL ===\n');

const browser = await chromium.launch({ headless: true });
const api = await request.newContext();

const allInternalTargets = new Set();   /* do crawl linków */

/* ─── 1. Audyt per-strona ────────────────────────────────────── */
for (const { path, schema } of PAGES) {
  const url = BASE + path;
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

  let status = 0;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    status = resp.status();
  } catch (e) {
    fail(path, 'goto failed: ' + e.message);
    await page.close();
    continue;
  }

  if (status >= 400) fail(path, `HTTP ${status}`);

  /* meta / SEO */
  const meta = await page.evaluate(() => ({
    title:     document.title,
    desc:      document.querySelector('meta[name="description"]')?.content || '',
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    favicon:   document.querySelector('link[rel="icon"]')?.href || '',
    lang:      document.documentElement.getAttribute('lang'),
    skip:      !!document.querySelector('.skip-link'),
    nav:       !!document.querySelector('nav.nav'),
    schema:    !!document.querySelector('script[type="application/ld+json"]'),
    h1count:   document.querySelectorAll('h1').length,
  }));

  if (!meta.title)               fail(path, 'brak <title>');
  if (meta.lang !== 'pl')        fail(path, `lang="${meta.lang}" (oczekiwane pl)`);
  if (!meta.favicon)             fail(path, 'brak favicon');
  if (!meta.skip)                fail(path, 'brak .skip-link');
  if (!meta.nav)                 fail(path, 'brak nav.nav');
  /* privacy/404 mają noindex — description/canonical opcjonalne tam */
  if (path !== '/404.html' && path !== '/privacy-policy.html') {
    if (!meta.desc)              fail(path, 'brak meta description');
    if (!meta.canonical)         fail(path, 'brak canonical');
  }
  if (schema && !meta.schema)    fail(path, 'brak Schema.org JSON-LD (oczekiwany)');
  if (meta.h1count !== 1)        fail(path, `<h1> = ${meta.h1count} (oczekiwane 1)`);

  /* zbierz linki wewnętrzne + #anchory */
  const { links, anchors } = await page.evaluate(() => {
    const links = [], anchors = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (!h) return;
      if (h.startsWith('#')) { if (h.length > 1) anchors.push(h.slice(1)); return; }
      if (/^(https?:|mailto:|tel:|data:)/.test(h)) return;
      links.push(new URL(h, location.href).pathname);
    });
    return { links, anchors };
  });
  links.forEach(l => allInternalTargets.add(l));

  /* martwe #anchory na tej stronie */
  for (const id of anchors) {
    const exists = await page.evaluate(a => !!document.getElementById(a), id);
    if (!exists) fail(path, `martwy #anchor: #${id}`);
  }

  /* GUARD niebieskiego poza contact-footer (blue-heading bug) */
  const blueLeaks = await page.evaluate(() => {
    const leaks = [];
    const isBlue = (c) => {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return false;
      const [r, g, b] = [+m[1], +m[2], +m[3]];
      return b > 140 && b > r * 1.4 && b > g * 1.3;   /* niebieskawy */
    };
    document.querySelectorAll('h1,h2,h3,a,p,span').forEach(el => {
      if (el.closest('.contact-footer-wrap')) return;     /* tu niebieski OK */
      if (!el.offsetParent && el.tagName !== 'BODY') return; /* niewidoczny */
      /* tylko elementy z BEZPOŚREDNIM tekstem — kolor dotyczy tekstu własnego,
         nie dzieci (dzieci mają swój color i są sprawdzane osobno). To eliminuje
         fałszywe alarmy z <a> opakowujących białe <span>/<h2>. */
      const directText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (!directText) return;
      const txt = el.textContent.trim();
      const col = getComputedStyle(el).color;
      if (isBlue(col)) leaks.push(`<${el.tagName.toLowerCase()}> "${txt.slice(0,30)}" → ${col}`);
    });
    return leaks.slice(0, 5);
  });
  blueLeaks.forEach(l => fail(path, 'niebieski poza contact-footer: ' + l));

  if (consoleErrors.length) consoleErrors.forEach(e => fail(path, 'console: ' + e));

  const ok = errors.filter(e => e.startsWith(`[${path}]`)).length === 0;
  console.log(`${ok ? '✅' : '❌'}  ${path.padEnd(32)} ${status}  ${meta.title.slice(0,38)}`);
  await page.close();
}

/* ─── 2. Crawl: każdy unikalny link wewnętrzny musi zwracać <400 ── */
console.log('\n── Linki wewnętrzne ─────────────────────────');
allInternalTargets.add('/robots.txt');
allInternalTargets.add('/sitemap.xml');
let linkFails = 0;
for (const target of [...allInternalTargets].sort()) {
  const resp = await api.get(BASE + target, { maxRedirects: 5 });
  if (resp.status() >= 400) { fail('links', `${target} → HTTP ${resp.status()}`); linkFails++; }
}
console.log(`Sprawdzono ${allInternalTargets.size} unikalnych celów, ${linkFails} martwych`);

/* ─── 3. GUARD wyrównania kart praktyk (homepage) ───────────────
   Łapie regresję typu „karta 04 startuje od środka" — wszystkie
   4 .practice-card-inner muszą mieć identyczny justify-content. */
console.log('\n── Spójność kart praktyk (homepage) ─────────');
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const aligns = await page.evaluate(() =>
    [...document.querySelectorAll('.practice-flip-card .practice-card-inner')]
      .map(el => getComputedStyle(el).justifyContent)
  );
  console.log('justify-content kart:', aligns.join(', ') || '(brak)');
  if (aligns.length === 0) fail('homepage', 'brak .practice-card-inner');
  if (new Set(aligns).size > 1) fail('homepage', `karty mają różny justify-content: [${aligns}] — niespójne wyrównanie`);

  /* GUARD: krzyż na kartach-dokumentach usunięty (::before/::after bez content) */
  const docCross = await page.evaluate(() => {
    const el = document.querySelector('.practice-card-doc');
    if (!el) return 'brak-elementu';  /* OK — migrowane na practice-index-row */
    const b = getComputedStyle(el, '::before').content;
    const a = getComputedStyle(el, '::after').content;
    return (b !== 'none' || a !== 'none') ? 'KRZYZ-OBECNY' : 'brak-krzyza';
  });
  if (docCross === 'KRZYZ-OBECNY') fail('homepage', 'krzyż na .practice-card-doc nadal renderowany');
  console.log('krzyż practice-card-doc:', docCross);
  await page.close();
}

/* ─── 4. GUARD praktyki.html — editorial directory, nie doc-cards ─ */
console.log('\n── praktyki.html — struktura katalogu ───────');
{
  const page = await browser.newPage();
  await page.goto(BASE + '/praktyki.html', { waitUntil: 'networkidle' });
  const info = await page.evaluate(() => ({
    rows:     document.querySelectorAll('.practice-index-row').length,
    docCards: document.querySelectorAll('.practice-card-doc').length,
    blueH2:   [...document.querySelectorAll('.practice-index-row h2')]
                .filter(h => { const m = getComputedStyle(h).color.match(/\d+/g);
                  return m && +m[2] > 140 && +m[2] > +m[0] * 1.4; }).length,
  }));
  console.log(`practice-index-row: ${info.rows} | doc-cards: ${info.docCards} | niebieskie h2: ${info.blueH2}`);
  if (info.rows !== 4)    fail('praktyki.html', `practice-index-row = ${info.rows} (oczekiwane 4)`);
  if (info.docCards > 0)  fail('praktyki.html', `pozostały doc-cards z tabelą: ${info.docCards}`);
  if (info.blueH2 > 0)    fail('praktyki.html', `niebieskie nagłówki h2: ${info.blueH2}`);
  await page.close();
}

await api.dispose();
await browser.close();

/* ─── Wynik ──────────────────────────────────────────────────── */
console.log('\n════════════════════════════════════════════');
if (errors.length === 0) {
  console.log('✅ WSZYSTKO ZIELONE — STATUS: OK');
  process.exit(0);
} else {
  console.log(`❌ ${errors.length} BŁĘDÓW:\n`);
  errors.forEach(e => console.log('  ❌ ' + e));
  console.log('\nSTATUS: BŁĘDY');
  process.exit(1);
}
