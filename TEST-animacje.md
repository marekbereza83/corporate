# TEST — diagnostyka animacji EDITORIAL

## Po co ten plik

Claude Code generuje HTML i "widzi" że klasy są na miejscu — ale nie widzi
czy animacje FAKTYCZNIE się odpalają w przeglądarce. Ten plik daje konkretne
testy do uruchomienia, żeby Claude Code wiedział co działa, a co nie.

---

## Problem zgłoszony przez użytkownika

> "praktyki 01, 02, 03 w ogóle nie są animowane — nie kręcą się, nie wlatują"

Diagnoza: practice cards mają tylko `.reveal-fade` (delikatny fade + 20px).
W Ario karty praktyk wjeżdżały z rotacją 3D — dramatycznie, jak dokumenty.
Trzeba dodać `.practice-card-reveal` z transform: rotate + translate.

---

## TEST 1: Czy IntersectionObserver odpala klasy

Uruchom w konsoli przeglądarki (F12 → Console) PO załadowaniu strony:

```javascript
// Sprawdź czy elementy reveal dostały klasę is-visible/is-lit
console.log('=== TEST ANIMACJI ===');

const revealFade = document.querySelectorAll('.reveal-fade');
const visible = document.querySelectorAll('.reveal-fade.is-visible');
console.log(`reveal-fade: ${revealFade.length} elementów, ${visible.length} z is-visible`);

const scrollText = document.querySelectorAll('.scroll-reveal-text');
const lit = document.querySelectorAll('.scroll-reveal-text.is-lit');
console.log(`scroll-reveal-text: ${scrollText.length} elementów, ${lit.length} z is-lit`);

const wordReveal = document.querySelectorAll('.word-reveal');
const wordVisible = document.querySelectorAll('.word-reveal.is-visible');
console.log(`word-reveal: ${wordReveal.length} elementów, ${wordVisible.length} z is-visible`);

const wordSpans = document.querySelectorAll('.word-reveal span');
console.log(`word-reveal spany (po splicie): ${wordSpans.length} (powinno być >0)`);

const counters = document.querySelectorAll('.count-up');
counters.forEach((c,i) => console.log(`counter ${i}: tekst="${c.textContent}" target="${c.dataset.target}"`));
```

**Oczekiwany wynik PO przescrollowaniu całej strony:**
- reveal-fade: X elementów, X z is-visible (wszystkie powinny dostać klasę)
- word-reveal spany: >0 (jeśli 0 — split nie zadziałał)
- counter: tekst powinien = target+suffix (np. "10+"), nie "0+"

**Jeśli is-visible = 0** → IntersectionObserver nie odpala. Możliwe przyczyny:
1. animations-editorial.js nie załadowany (sprawdź Network tab — 404?)
2. Błąd JS przerwał wykonanie (sprawdź Console — czerwone błędy?)
3. threshold za wysoki — elementy nie osiągają 40% widoczności

---

## TEST 2: Czy practice cards mają animację wjazdu

```javascript
const cards = document.querySelectorAll('.practice-card');
cards.forEach((card, i) => {
  const cs = getComputedStyle(card);
  console.log(`practice-card ${i}: opacity=${cs.opacity} transform=${cs.transform}`);
});
```

**Problem jeśli:** transform = "none" na wszystkich → karty nie mają efektu ruchu.
**Naprawa:** patrz sekcja FIX poniżej.

---

## TEST 3: Czy CSS startowy stan istnieje

```javascript
// Tymczasowo usuń is-visible i sprawdź stan startowy
const card = document.querySelector('.reveal-fade');
card.classList.remove('is-visible');
const cs = getComputedStyle(card);
console.log(`Stan startowy reveal-fade: opacity=${cs.opacity} (powinno 0) transform=${cs.transform} (powinno translateY)`);
```

**Jeśli opacity=1 w stanie startowym** → CSS nie ma reguły `.reveal-fade { opacity: 0 }`.
Sprawdź czy design-system-editorial.css jest załadowany (Network tab).

---

## FIX: Practice cards mają wjeżdżać z rotacją (jak Ario)

W `design-system-editorial.css` ZNAJDŹ `.practice-card` i DODAJ osobną
klasę animacji wjazdu (nie ruszaj samego `.practice-card`):

```css
/* Practice card — wjazd z rotacją 3D (Ario klatka 8, 10) */
.practice-card.reveal-fade {
  opacity: 0;
  transform: perspective(1200px) rotateY(12deg) translateY(40px);
  transition: opacity 0.8s var(--ease),
              transform 0.8s var(--ease);
}
.practice-card.reveal-fade.is-visible {
  opacity: 1;
  transform: perspective(1200px) rotateY(0) translateY(0);
}

/* Stagger między kartami — każda kolejna z opóźnieniem */
.practice-card.reveal-fade:nth-child(1) { transition-delay: 0s; }
.practice-card.reveal-fade:nth-child(2) { transition-delay: 0.12s; }
.practice-card.reveal-fade:nth-child(3) { transition-delay: 0.24s; }
.practice-card.reveal-fade:nth-child(4) { transition-delay: 0.36s; }

@media (prefers-reduced-motion: reduce) {
  .practice-card.reveal-fade {
    opacity: 1;
    transform: none;
  }
}
```

To daje efekt "wlatywania z obrotem" którego brakowało.

---

## FIX 2: Jeśli karty są od razu w viewport (nie odpalają się)

Problem: jeśli practice section jest wysoko i karty są widoczne przy załadowaniu,
IntersectionObserver z `unobserve` może je pominąć lub odpalić zanim CSS gotowy.

W `animations-editorial.js` w funkcji initFadeReveal, ZMIEŃ threshold i dodaj
sprawdzenie początkowe:

```javascript
function initFadeReveal() {
  var els = document.querySelectorAll('.reveal-fade');
  if (!els.length) return;
  if (reduceMotion) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // mały delay żeby CSS transition złapał stan startowy
        requestAnimationFrame(function() {
          entry.target.classList.add('is-visible');
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  els.forEach(function (el) { obs.observe(el); });
}
```

---

## TEST 4: Pełny scenariusz E2E (do uruchomienia przez Claude Code)

Jeśli Claude Code ma Playwright/Puppeteer:

```javascript
// test-animations.mjs
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file:///FULL_PATH/index.html');

// Czekaj na załadowanie
await page.waitForLoadState('networkidle');

// TEST: scroll do practices i sprawdź czy karty dostają is-visible
await page.evaluate(() => {
  document.querySelector('#practices').scrollIntoView();
});
await page.waitForTimeout(1500); // czekaj na animację

const results = await page.evaluate(() => {
  const cards = document.querySelectorAll('.practice-card.reveal-fade');
  const visible = document.querySelectorAll('.practice-card.reveal-fade.is-visible');
  const counters = Array.from(document.querySelectorAll('.count-up')).map(c => c.textContent);
  const wordSpans = document.querySelectorAll('.word-reveal span').length;
  return {
    totalCards: cards.length,
    visibleCards: visible.length,
    counters,
    wordSpans
  };
});

console.log('WYNIKI:', JSON.stringify(results, null, 2));

// ASSERTY
const errors = [];
if (results.visibleCards < results.totalCards)
  errors.push(`Practice cards: ${results.visibleCards}/${results.totalCards} animowane`);
if (results.wordSpans === 0)
  errors.push('word-reveal spany = 0 (split nie zadziałał)');
if (results.counters.some(c => c.startsWith('0')))
  errors.push(`Countery nie doliczyły: ${results.counters}`);

if (errors.length) {
  console.error('❌ BŁĘDY:', errors);
  process.exit(1);
} else {
  console.log('✅ Wszystkie animacje działają');
}

await browser.close();
```

Uruchom: `node test-animations.mjs`

---

## Checklist dla Claude Code

Po naprawie sprawdź:
- [ ] animations-editorial.js ładuje się bez 404 (Network tab)
- [ ] Console bez czerwonych błędów JS
- [ ] Practice cards: wszystkie dostają .is-visible po scroll
- [ ] Practice cards: transform pokazuje rotateY w stanie startowym
- [ ] word-reveal: spany utworzone (>0), dostają .is-visible
- [ ] count-up: liczby doliczają do target (10+, 30+), nie zostają na 0+
- [ ] scroll-reveal-text: dostają .is-lit przy scroll
- [ ] prefers-reduced-motion: wszystko widoczne bez animacji
