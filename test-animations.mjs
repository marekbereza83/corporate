// TEST 4 — E2E animacje EDITORIAL (z TEST-animacje.md)
import { chromium } from 'playwright';

const URL = 'http://localhost:7770';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

console.log('=== TEST 4: PACTA EDITORIAL — animacje E2E ===\n');

await page.goto(URL, { waitUntil: 'networkidle' });

// TEST 1: stan po załadowaniu (elementy w viewport)
const afterLoad = await page.evaluate(() => {
  const revealFade  = document.querySelectorAll('.reveal-fade').length;
  const visible     = document.querySelectorAll('.reveal-fade.is-visible').length;
  const scrollTexts = document.querySelectorAll('.scroll-reveal-text').length;
  const lit         = document.querySelectorAll('.scroll-reveal-text.is-lit').length;
  const wordSpans   = document.querySelectorAll('.word-reveal span').length;
  const counters    = Array.from(document.querySelectorAll('.count-up')).map(c => ({
    text: c.textContent, target: c.dataset.target
  }));
  return { revealFade, visible, scrollTexts, lit, wordSpans, counters };
});

console.log('── TEST 1: Stan po załadowaniu ──────────────');
console.log(`reveal-fade:       ${afterLoad.revealFade} elementów, ${afterLoad.visible} z is-visible`);
console.log(`scroll-reveal-text: ${afterLoad.scrollTexts} elementów, ${afterLoad.lit} z is-lit`);
console.log(`word-reveal spany:  ${afterLoad.wordSpans} (powinno być >0)`);
afterLoad.counters.forEach((c, i) =>
  console.log(`  counter ${i}: "${c.text}" (target=${c.target})`));

// TEST 2: stan startowy flip-card nieaktywnej (opacity=0, transform rotateY 90deg)
const startState = await page.evaluate(() => {
  const card = document.querySelector('.practice-flip-card:not(.is-active)');
  if (!card) return { error: 'Brak nieaktywnej .practice-flip-card' };
  const cs = getComputedStyle(card);
  return { opacity: cs.opacity, transform: cs.transform };
});

console.log('\n── TEST 2: Stan startowy practice-flip-card ──');
if (startState.error) {
  console.log('  ERROR:', startState.error);
} else {
  console.log(`  opacity:   ${startState.opacity}   (oczekiwane: 0)`);
  console.log(`  transform: ${startState.transform}`);
  const hasRotate = startState.transform && startState.transform !== 'none';
  console.log(`  rotacja 3D: ${hasRotate ? '✅' : '❌ BRAK'}`);
}

// TEST 3: scroll krok po kroku — symulacja realnego użytkownika
// block:'start' = sekcja od góry, żeby IO złapał każdy element wchodzący z dołu
const scrollTargets = [
  { sel: '#about',                       wait: 500 },
  { sel: '#practices',                   wait: 500 },  // top → karta 1
  { sel: '.practice-card:nth-child(2)',  wait: 400 },
  { sel: '.practice-card:nth-child(3)',  wait: 400 },
  { sel: '.practice-card:nth-child(4)',  wait: 500 },
  { sel: '.btn-more-split',              wait: 400 },
  { sel: '#team',                        wait: 500 },  // word-reveal 1-3
  { sel: '.word-reveal:last-child',      wait: 500 },  // word-reveal 4-5
  { sel: '.team-grid',                   wait: 500 },  // partner cards
  { sel: '#recognition',                 wait: 600 },
  { sel: '#press',                       wait: 800 },  // press-grid IO
  { sel: '.press-grid',                  wait: 600 },  // ensure stagger fires
  { sel: '#contact',                     wait: 500 },
];
for (const { sel, wait } of scrollTargets) {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, sel);
  await page.waitForTimeout(wait);
}
await page.waitForTimeout(800);

const afterScroll = await page.evaluate(() => {
  const totalCards   = document.querySelectorAll('.practice-card.reveal-fade').length;
  const visibleCards = document.querySelectorAll('.practice-card.reveal-fade.is-visible').length;
  const lit          = document.querySelectorAll('.scroll-reveal-text.is-lit').length;
  const scrollTexts  = document.querySelectorAll('.scroll-reveal-text').length;
  const wordVisible  = document.querySelectorAll('.word-reveal.is-visible').length;
  const wordTotal    = document.querySelectorAll('.word-reveal').length;
  const counters     = Array.from(document.querySelectorAll('.count-up')).map(c => c.textContent);
  const staggerItems = document.querySelectorAll('.stagger-list > *.is-visible').length;
  const staggerTotal = document.querySelectorAll('.stagger-list > *').length;
  return { totalCards, visibleCards, lit, scrollTexts, wordVisible, wordTotal, counters, staggerItems, staggerTotal };
});

console.log('\n── TEST 3: Stan po pełnym scrollu ───────────');
console.log(`practice-cards:    ${afterScroll.visibleCards}/${afterScroll.totalCards} is-visible`);
console.log(`scroll-reveal-text: ${afterScroll.lit}/${afterScroll.scrollTexts} is-lit`);
console.log(`word-reveal:       ${afterScroll.wordVisible}/${afterScroll.wordTotal} is-visible`);
console.log(`stagger items:     ${afterScroll.staggerItems}/${afterScroll.staggerTotal} is-visible`);
console.log(`counters:          ${afterScroll.counters.join(', ')}`);

// ASSERTY
console.log('\n── ASSERTY ──────────────────────────────────');
const errors = [];

if (afterLoad.wordSpans === 0)
  errors.push('word-reveal spany = 0 (split JS nie zadziałał)');

if (startState.transform === 'none' || !startState.transform)
  errors.push('practice-flip-card: brak transform w stanie startowym (brak rotacji 3D)');

if (parseFloat(startState.opacity) !== 0)
  errors.push(`practice-flip-card: opacity=${startState.opacity} w stanie startowym (powinno być 0)`);

if (afterScroll.lit < afterScroll.scrollTexts)
  errors.push(`scroll-reveal-text: tylko ${afterScroll.lit}/${afterScroll.scrollTexts} dostały is-lit`);

if (afterScroll.wordVisible < afterScroll.wordTotal)
  errors.push(`word-reveal: tylko ${afterScroll.wordVisible}/${afterScroll.wordTotal} dostały is-visible`);

if (afterScroll.counters.some(c => c.startsWith('0')))
  errors.push(`countery nie doliczyły: [${afterScroll.counters.join(', ')}]`);

if (errors.length) {
  console.log('');
  errors.forEach(e => console.log('  ❌ ' + e));
  console.log('\nSTATUS: BŁĘDY — wymagają naprawy');
} else {
  console.log('\n  ✅ Wszystkie animacje działają poprawnie');
  console.log('\nSTATUS: OK');
}

await browser.close();
