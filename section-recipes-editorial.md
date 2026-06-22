# PACTA EDITORIAL — Section Recipes

Per-sekcja przepisy do generowania HTML. Każdy recipe = jedna funkcja renderera.
Klasy CSS zgodne z `design-system-editorial.css`. Pola zgodne z `fixture-editorial.json`.

---

## nav-editorial

**Cel:** sticky czarny nav, logo + linki, mobile overlay z numerami 01-05.

```html
<nav class="nav" aria-label="Główna nawigacja">
  <div class="nav-inner">
    <a href="index.html" class="nav-logo">
      MAZUR<span class="nav-logo-sub">10 LAT</span>
    </a>
    <ul class="nav-links">
      <li><a href="o-kancelarii.html">O nas</a></li>
      <li><a href="index.html#practices">Praktyki</a></li>
      <li><a href="zespol.html">Zespół</a></li>
      <li><a href="aktualnosci.html">Aktualności</a></li>
      <li><a href="#contact">Kontakt</a></li>
    </ul>
    <button id="menu-toggle" class="nav-burger" aria-expanded="false"
            aria-controls="mobile-menu" aria-label="Otwórz menu">≡</button>
  </div>
</nav>

<div id="mobile-menu" aria-hidden="true">
  <button id="menu-close" aria-label="Zamknij menu">×</button>
  <a href="o-kancelarii.html"><span class="f-numeral">01</span>O nas</a>
  <a href="index.html#practices"><span class="f-numeral">02</span>Praktyki</a>
  <a href="zespol.html"><span class="f-numeral">03</span>Zespół</a>
  <a href="aktualnosci.html"><span class="f-numeral">04</span>Aktualności</a>
  <a href="#contact"><span class="f-numeral">05</span>Kontakt</a>
</div>
```

**MUST:** ctaInHeader = false (brak CTA button w nav). Numerale 01-05 tylko w mobile overlay.

---

## hero-editorial-video

**Cel:** video po prawej + scroll-color tekst po lewej + mega wordmark na dole.

```html
<section class="hero-editorial bg-base" aria-label="Hero">
  <div class="hero-grid">
    <p class="f-h1 scroll-reveal-text hero-statement">
      Lubimy prawo, kochamy tempo. Kryzys nas motywuje, zmiana inspiruje.
      Nasz zespół to więcej niż prawnicy.
    </p>
    <div class="hero-video">
      <video autoplay muted loop playsinline
             poster="assets/images/hero-poster.jpg">
        <source src="assets/video/hero.mp4" type="video/mp4">
      </video>
    </div>
  </div>
  <div class="hero-wordmark f-mega" aria-hidden="true">MAZUR</div>
  <a href="#about" class="btn-text hero-cta">Szczegóły</a>
</section>
```

**MUST:** video ma autoplay muted loop playsinline + poster. Tekst hero = scroll-reveal-text.
Wordmark = aria-hidden (dekoracja).

---

## about-manifesto

**Cel:** manifesto + dwie liczby (count-up) + MORE.

```html
<section id="about" class="section bg-base" aria-labelledby="about-h">
  <div class="container">
    <p class="f-meta">O nas</p>
    <h2 id="about-h" class="f-display scroll-reveal-text">
      Kształtujemy przyszłość w zgodzie z prawem
    </h2>
    <div class="stats-row stagger-list">
      <div class="stat">
        <span class="trust-number count-up" data-target="10" data-suffix="+">0+</span>
        <span class="trust-label">lat na rynku prawnym</span>
      </div>
      <div class="stat">
        <span class="trust-number count-up" data-target="30" data-suffix="+">0+</span>
        <span class="trust-label">prawników w zespole</span>
      </div>
    </div>
    <a href="o-kancelarii.html" class="btn-more">Więcej</a>
  </div>
</section>
```

**MUST:** liczby = count-up z data-target i data-suffix. Headline = scroll-reveal-text.

---

## practices-editorial-cards

**Cel:** 4 karty-dokumenty (biała kartka + B&W zdjęcie) + MORE+ split.

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

    <!-- powtórz dla każdej praktyki (01-04) -->
    <article class="practice-card reveal-fade">
      <div class="practice-card-doc">
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
      </div>
      <div class="practice-card-photo">
        <img src="assets/images/practice-litigation.jpg"
             alt="Spory sądowe — Mazur Wspólnicy" loading="lazy">
      </div>
    </article>
    <!-- ... 02, 03, 04 ... -->

    <a href="praktyki.html" class="btn-more-split">
      <span class="btn-more-split-text">WIĘCEJ +</span>
      <span class="btn-more-split-grad" aria-hidden="true"></span>
    </a>
  </div>
</section>
```

**MUST:** zdjęcia B&W (CSS grayscale + loading="lazy"). Numeral + nazwa CAPS + tabela.
MORE+ split na końcu sekcji.

---

## team-editorial-white

**Cel:** BIAŁE tło, mega TEAM, word-reveal, partner cards klikalne.

```html
<section id="team" class="section section-white" aria-labelledby="team-h">
  <div class="container">
    <p class="f-meta">Zespół</p>
    <p class="f-lead">Przede wszystkim Mazur to</p>
    <h2 id="team-h" class="f-mega">ZESPÓŁ</h2>

    <!-- word reveal — każde słowo osobno -->
    <p class="f-display word-reveal">kochają prawo</p>
    <p class="f-display word-reveal">działają</p>
    <p class="f-display word-reveal">podejmują wyzwania</p>
    <p class="f-display word-reveal">sięgają dalej</p>
    <p class="f-display word-reveal">nie zatrzymują się</p>

    <!-- partner cards klikalne -->
    <div class="team-grid stagger-list">
      <button class="partner-trigger" data-partner="anna-mazur">
        <img src="assets/images/partner-mazur.jpg" alt="Anna Mazur" loading="lazy">
        <span class="partner-name">ANNA MAZUR</span>
        <span class="partner-title">Partner Zarządzający</span>
      </button>
      <!-- ... pozostali partnerzy ... -->
    </div>

    <a href="zespol.html" class="btn-more">Więcej</a>
  </div>
</section>

<!-- panele partnerów (poza sekcją, position:fixed) -->
<div id="panel-anna-mazur" class="partner-panel" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="partner-panel-photo">
    <img src="assets/images/partner-mazur.jpg" alt="Anna Mazur">
  </div>
  <div class="partner-panel-info">
    <button class="partner-panel-close" aria-label="Zamknij">CLOSE</button>
    <h3 class="f-h2">Anna Mazur</h3>
    <p class="f-caption">Partner Zarządzający · Spory sądowe</p>
    <dl class="partner-contacts">
      <dt>Telefon</dt><dd><a href="tel:+48220000001">+48 22 000 00 01</a></dd>
      <dt>Email</dt><dd><a href="mailto:a.mazur@mazurlegal.pl">a.mazur@mazurlegal.pl</a></dd>
    </dl>
  </div>
</div>
```

**MUST:** section-white (białe tło). Mega ZESPÓŁ. word-reveal per fraza.
Każdy partner-trigger ma odpowiadający #panel-{id}.

---

## recognition-wall

**Cel:** wiersze "Rok | Nazwa | +", stagger reveal, hover rotate +.

```html
<section id="recognition" class="section bg-base" aria-labelledby="recog-h">
  <div class="container">
    <p class="f-meta">Wyróżnienia</p>
    <h2 id="recog-h" class="f-display">Recognition</h2>
    <div class="recognition-row stagger-list">
      <a href="https://www.legal500.com" class="recognition-item" target="_blank" rel="noopener">
        <span class="recognition-year">2024</span>
        <span class="recognition-name">Legal 500</span>
        <span class="recognition-plus" aria-hidden="true">+</span>
      </a>
      <!-- ... pozostałe rankingi ... -->
    </div>
  </div>
</section>
```

**MUST:** format "rok | nazwa | +". Bez opisów, bez gwiazdek. Zewnętrzne linki rel="noopener".

---

## press-cards-3d

**Cel:** 3 karty newsów z rotacją 3D, daty, kategorie.

```html
<section id="press" class="section bg-base" aria-labelledby="press-h">
  <div class="container">
    <p class="f-meta">Aktualności</p>
    <h2 id="press-h" class="f-display">Centrum prasowe</h2>
    <div class="press-grid stagger-list">
      <a href="..." class="press-card">
        <div class="press-card-head">
          <span class="press-card-cat">Prawo karne gospodarcze</span>
          <span class="press-card-tags">Aktualności</span>
          <span class="press-card-date">04 czerwca 2025</span>
        </div>
        <p class="press-card-title">
          Mazur Wspólnicy doradcą w sprawie restrukturyzacji grupy energetycznej
        </p>
      </a>
      <!-- ... -->
    </div>
    <a href="aktualnosci.html" class="btn-more">Więcej</a>
  </div>
</section>
```

**MUST:** data w formacie "DD miesiąc YYYY". Kategoria + tagi nad tytułem.
Opcjonalnie CSS transform: rotate dla 3D efektu.

---

## contact-editorial-gradient

**Cel:** niebieski gradient, formularz, honeypot.

```html
<section id="contact" class="contact-footer-wrap" aria-labelledby="contact-h">
  <div class="container section">
    <h2 id="contact-h" class="f-display">Masz pytania?</h2>
    <form id="contact-form" class="contact-form">
      <input type="text" name="_hp" tabindex="-1" autocomplete="off"
             aria-hidden="true" style="position:absolute;left:-9999px">
      <input type="text" name="name" placeholder="Imię*" required aria-label="Imię">
      <input type="email" name="email" placeholder="Email*" required aria-label="Email">
      <textarea name="message" placeholder="Wiadomość" aria-label="Wiadomość"></textarea>
      <button type="submit" class="btn-text">Wyślij</button>
      <p id="form-success" tabindex="-1">Dziękujemy. Odpowiemy najszybciej jak to możliwe.</p>
    </form>
  </div>
</section>
```

**MUST:** honeypot _hp (ukryte pole). Wszystkie inputy aria-label. form-success focusable.

---

## footer-editorial

**Cel:** część niebieskiego gradientu, kolumny + mega wordmark dekoracja.

```html
<footer class="footer" aria-label="Stopka">
  <div class="container footer-cols">
    <div>
      <p class="f-meta">Nawigacja</p>
      <a href="o-kancelarii.html">O nas</a>
      <a href="index.html#practices">Praktyki</a>
      <a href="zespol.html">Zespół</a>
      <a href="aktualnosci.html">Aktualności</a>
    </div>
    <div>
      <p class="f-meta">Kontakt</p>
      <p>ul. Próżna 9, 00-107 Warszawa</p>
      <a href="tel:+48220000000">+48 22 000 00 00</a>
      <a href="mailto:kontakt@mazurlegal.pl">kontakt@mazurlegal.pl</a>
    </div>
  </div>
  <div class="footer-wordmark" aria-hidden="true">MAZUR LEGAL</div>
  <p class="footer-copyright">© 2026 Mazur Wspólnicy. Wszelkie prawa zastrzeżone.</p>
</footer>
```

**MUST:** wewnątrz contact-footer-wrap (jeden gradient). Wordmark aria-hidden.
Max 6 linków (zgodność z V11). Tel + mailto jako prawdziwe linki.

---

## Mapa recipe → field types

| Recipe | Pola | Typy |
|---|---|---|
| nav-editorial | logoText, logoSubtext, ctaInHeader | text |
| hero-editorial-video | headline, videoSrc, wordmark, ctaLabel, ctaHref | text, video, cta |
| about-manifesto | sectionLabel, headline, stats, moreHref | text, list |
| practices-editorial-cards | sectionLabel, headline, subheadline, items | text, list |
| team-editorial-white | sectionLabel, headlineMega, leadIn, wordReveal, partners, moreHref | text, list |
| recognition-wall | sectionLabel, items | text, list |
| press-cards-3d | sectionLabel, headline, cards, moreHref | text, list |
| contact-editorial-gradient | headline, submitLabel, emailDisplay, emailHref, phoneDisplay, phoneHref | text, cta, contact |
| footer-editorial | wordmark, addressPrimary, email, phone, links, copyright | text, contact, list |

**UWAGA CMS:** typ `video` (hero-editorial-video.videoSrc) jest NOWY — nie istnieje
w obecnym types.ts. Wymaga dodania `'video'` do FieldType union przed walidacją.
Patrz: archetype-aware-validation.md.
