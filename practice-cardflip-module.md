# Practice Cards — Card-Flip (Opcja B)

Uproszczony scroll-driven flip: praktyki zajmują to samo miejsce,
obracają się na osi Y przy scroll. 80% efektu cube Ario, stabilne.

---

## Jak to działa

```
Sekcja practices = wysoka (np. 400vh — 100vh na każdą z 4 praktyk)
W środku sticky stage (100vh) z kartami ułożonymi na sobie.
Scroll przez sekcję → JS oblicza progres → obraca aktywną kartę rotateY.

Karta 0: progres 0.00-0.25 → widoczna prosto, potem flip out (rotateY -90°)
Karta 1: progres 0.25-0.50 → flip in (rotateY 90°→0), potem flip out
Karta 2: progres 0.50-0.75 → ...
Karta 3: progres 0.75-1.00 → flip in, zostaje
```

Synchronicznie zdjęcie obok flipuje w przeciwną stronę (jak druga ścianka cube).

---

## KROK 1: Struktura HTML (zamień obecną .practices-list)

```html
<section id="practices" class="section bg-base" aria-labelledby="practices-h">
  <div class="container">
    <p class="f-meta">Praktyki</p>
    <h2 id="practices-h" class="f-display scroll-reveal-text">
      Działamy w wielu obszarach prawa
    </h2>
    <p class="f-lead scroll-reveal-text">
      Nasza przewaga to zaangażowanie legislacyjne — wdrażamy nowe
      rozwiązania w strategiach klientów jako pierwsi.
    </p>
  </div>

  <!-- Flip stage — wysoki kontener scroll, sticky w środku -->
  <div class="practice-flip-section" data-practice-count="4">
    <div class="practice-flip-stage">
      <div class="container practice-flip-grid">

        <!-- Karty tekstowe (obracają się) -->
        <div class="practice-flip-cards">
          <article class="practice-flip-card is-active" data-index="0">
            <span class="practice-card-num">01</span>
            <p class="practice-card-name">SPORY SĄDOWE</p>
            <div class="practice-card-table">
              <div class="practice-card-table-row">
                <span class="practice-card-table-label">Head of Practice</span>
                <span>Anna Mazur</span>
              </div>
              <div class="practice-card-table-row">
                <span class="practice-card-table-label">Zespół</span>
                <span>10+ prawników</span>
              </div>
            </div>
            <a href="praktyki/spory.html" class="btn-more">Więcej</a>
          </article>

          <article class="practice-flip-card" data-index="1">
            <span class="practice-card-num">02</span>
            <p class="practice-card-name">PRAWO KARNE GOSPODARCZE</p>
            <div class="practice-card-table">
              <div class="practice-card-table-row">
                <span class="practice-card-table-label">Head of Practice</span>
                <span>Tomasz Lewandowski</span>
              </div>
              <div class="practice-card-table-row">
                <span class="practice-card-table-label">Zespół</span>
                <span>8+ prawników</span>
              </div>
            </div>
            <a href="praktyki/karne.html" class="btn-more">Więcej</a>
          </article>

          <article class="practice-flip-card" data-index="2">
            <span class="practice-card-num">03</span>
            <p class="practice-card-name">RESTRUKTURYZACJA</p>
            <div class="practice-card-table">
              <div class="practice-card-table-row">
                <span class="practice-card-table-label">Head of Practice</span>
                <span>Piotr Wójcik</span>
              </div>
              <div class="practice-card-table-row">
                <span class="practice-card-table-label">Zespół</span>
                <span>5+ prawników</span>
              </div>
            </div>
            <a href="praktyki/restrukturyzacja.html" class="btn-more">Więcej</a>
          </article>

          <article class="practice-flip-card" data-index="3">
            <span class="practice-card-num">04</span>
            <p class="practice-card-name">PRAWO KORPORACYJNE I M&amp;A</p>
            <div class="practice-card-table">
              <div class="practice-card-table-row">
                <span class="practice-card-table-label">Head of Practice</span>
                <span>Julia Kowalczyk</span>
              </div>
              <div class="practice-card-table-row">
                <span class="practice-card-table-label">Zespół</span>
                <span>5+ prawników</span>
              </div>
            </div>
            <a href="praktyki/korporacyjne.html" class="btn-more">Więcej</a>
          </article>
        </div>

        <!-- Zdjęcia (flip synchroniczny, przeciwna oś) -->
        <div class="practice-flip-photos">
          <div class="practice-flip-photo is-active" data-index="0">
            <img src="assets/images/practice-litigation.jpg" alt="Spory sądowe" loading="lazy">
          </div>
          <div class="practice-flip-photo" data-index="1">
            <img src="assets/images/practice-criminal.jpg" alt="Prawo karne" loading="lazy">
          </div>
          <div class="practice-flip-photo" data-index="2">
            <img src="assets/images/practice-restructuring.jpg" alt="Restrukturyzacja" loading="lazy">
          </div>
          <div class="practice-flip-photo" data-index="3">
            <img src="assets/images/practice-corporate.jpg" alt="Prawo korporacyjne" loading="lazy">
          </div>
        </div>

      </div>

      <!-- Wskaźnik postępu (kropki) -->
      <div class="practice-flip-dots" aria-hidden="true">
        <span class="is-active"></span><span></span><span></span><span></span>
      </div>
    </div>
  </div>

  <div class="container">
    <a href="praktyki.html" class="btn-more-split">
      <span class="btn-more-split-text">WIĘCEJ +</span>
      <span class="btn-more-split-grad" aria-hidden="true"></span>
    </a>
  </div>
</section>
```

---

## KROK 2: CSS (dodaj do design-system-editorial.css)

```css
/* ─── Practice card-flip (scroll-driven rotateY) ───────────── */

.practice-flip-section {
  position: relative;
  height: 400vh;              /* 100vh × 4 praktyki */
}
.practice-flip-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}
.practice-flip-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  align-items: stretch;
  height: 70vh;
  perspective: 1600px;        /* głębia 3D */
}

/* Kontener kart — pozycja względna, karty na sobie */
.practice-flip-cards,
.practice-flip-photos {
  position: relative;
  transform-style: preserve-3d;
}

/* Pojedyncza karta tekstowa */
.practice-flip-card {
  position: absolute;
  inset: 0;
  background: #FFFFFF;
  color: #000000;
  padding: var(--space-xl) var(--space-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backface-visibility: hidden;
  transform-origin: center center;
  transform: rotateY(90deg);   /* domyślnie schowana (bok) */
  opacity: 0;
  transition: transform 0.1s linear, opacity 0.1s linear;
  /* krzyż jak na kartce Ario */
}
.practice-flip-card::before {
  content: '';
  position: absolute;
  top: var(--space-lg); left: var(--space-lg); right: var(--space-lg);
  height: 1px; background: rgba(0,0,0,0.2);
}
.practice-flip-card.is-active {
  transform: rotateY(0deg);
  opacity: 1;
}

/* Zdjęcie — flip w przeciwną stronę (efekt cube) */
.practice-flip-photo {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  transform-origin: center center;
  transform: rotateY(-90deg);
  opacity: 0;
  overflow: hidden;
  transition: transform 0.1s linear, opacity 0.1s linear;
}
.practice-flip-photo.is-active {
  transform: rotateY(0deg);
  opacity: 1;
}
.practice-flip-photo img {
  width: 100%; height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
}

/* Numeral + nazwa wewnątrz flip card */
.practice-flip-card .practice-card-num {
  font-size: clamp(4rem, 10vw, 8rem);
  font-weight: var(--weight-black);
  line-height: 1;
  color: #000;
}
.practice-flip-card .practice-card-name {
  font-size: var(--text-h3);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  color: #000;
}

/* Kropki postępu */
.practice-flip-dots {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  margin-top: var(--space-lg);
}
.practice-flip-dots span {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--text-faint);
  transition: background var(--dur-fast) var(--ease);
}
.practice-flip-dots span.is-active {
  background: var(--text);
}

/* Mobile — wyłącz flip, pokaż karty pod sobą (stabilność) */
@media (max-width: 768px) {
  .practice-flip-section { height: auto; }
  .practice-flip-stage { position: static; height: auto; display: block; }
  .practice-flip-grid {
    grid-template-columns: 1fr;
    height: auto;
    perspective: none;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
  }
  .practice-flip-card,
  .practice-flip-photo {
    position: relative;
    inset: auto;
    transform: none;
    opacity: 1;
    transition: none;
  }
  .practice-flip-photo { height: 250px; }
  .practice-flip-dots { display: none; }
  /* Na mobile karty i zdjęcia naprzemiennie */
  .practice-flip-cards, .practice-flip-photos { display: contents; }
}

@media (prefers-reduced-motion: reduce) {
  .practice-flip-section { height: auto; }
  .practice-flip-stage { position: static; height: auto; }
  .practice-flip-card, .practice-flip-photo {
    position: relative; transform: none; opacity: 1;
    inset: auto; transition: none;
  }
  .practice-flip-card:not(.is-active),
  .practice-flip-photo:not(.is-active) { display: none; }
}
```

---

## KROK 3: JS (dodaj do animations-editorial.js)

```javascript
/* ─── Practice card-flip (scroll-driven) ───────────────────── */
function initPracticeFlip() {
  var section = document.querySelector('.practice-flip-section');
  if (!section) return;

  var cards = section.querySelectorAll('.practice-flip-card');
  var photos = section.querySelectorAll('.practice-flip-photo');
  var dots = section.querySelectorAll('.practice-flip-dots span');
  var count = cards.length;
  if (!count) return;

  /* Mobile / reduced-motion: nie odpalaj flip (CSS pokazuje statycznie) */
  if (reduceMotion || window.matchMedia('(max-width: 768px)').matches) {
    cards.forEach(function (c) { c.classList.add('is-active'); });
    photos.forEach(function (p) { p.classList.add('is-active'); });
    return;
  }

  var ticking = false;

  function update() {
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight;
    /* progres 0→1 przez całą wysokość sekcji */
    var total = rect.height - vh;
    var scrolled = -rect.top;
    var progress = Math.max(0, Math.min(1, scrolled / total));

    /* który indeks jest aktywny */
    var active = Math.min(count - 1, Math.floor(progress * count));

    cards.forEach(function (card, i) {
      card.classList.toggle('is-active', i === active);
    });
    photos.forEach(function (photo, i) {
      photo.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update(); /* stan początkowy */
}
```

Dodaj `initPracticeFlip();` do funkcji `init()`.

---

## KROK 4: Test (dodaj do TEST-animacje.md)

```javascript
// Test flip — scroll przez sekcję praktyk, sprawdź czy karty się zmieniają
const section = document.querySelector('.practice-flip-section');
section.scrollIntoView();
window.scrollBy(0, window.innerHeight * 2); // scroll do 3. praktyki
await new Promise(r => setTimeout(r, 300));
const active = document.querySelector('.practice-flip-card.is-active');
console.log('Aktywna karta po scroll:', active?.querySelector('.practice-card-num')?.textContent);
// Powinno pokazać 03 (nie 01)
```

---

## Uwaga o wysokości sekcji

`height: 400vh` znaczy że sekcja praktyk zajmuje 4 ekrany scrolla. To jest
celowe — daje czas na obejrzenie każdej praktyki. Jeśli czujesz że to za długo,
zmniejsz do `300vh` (szybszy flip) lub zwiększ do `500vh` (wolniejszy, więcej
"oddechu" na każdą).
```
