# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What this is

**PACTA EDITORIAL** — strona kancelarii prawnej (Mazur Wspólnicy), archetyp editorial-luxury. Static HTML, vanilla JS, zero frameworków. Stack: `index.html` + `design-system-editorial.css` + `animations-editorial.js`. Serwowany przez `npx serve`.

---

## Komendy

```powershell
# Serwer lokalny
npx --yes serve . -l 7770
# → http://localhost:7770

# Pełny audyt całej witryny (wszystkie podstrony + SEO + guardy wizualne)
node test-site.mjs
# → exit 0 gdy OK, exit 1 gdy błędy. Uruchamiaj po każdej zmianie.

# Screenshoty Playwright (3 viewporty: 1920/768/375)
node screenshot.js http://localhost:7770 screenshots/<nazwa>

# Test animacji E2E homepage
node test-animations.mjs

# Diagnostyka crossfade praktyk
node shoot-crossfade.mjs 0.5 1.0 1.5    # → screenshots/crossfade/vp-*.png
node shoot.mjs http://localhost:7770 screenshots/ seam "#practices+600"
REDUCE=1 node shoot.mjs http://localhost:7770 screenshots/reduced seam  # reduced-motion
node seam-sweep.mjs                      # → screenshots/seam-sweep/vp-*.png
```

---

## Deploy na Cloudflare Pages

```powershell
# Jednorazowy setup
npm install -g wrangler
wrangler login

# Deploy (z katalogu projektu)
wrangler pages deploy . --project-name mazur-wspolnicy
```

**Pliki do wgrania:** wszystkie `.html`, `design-system-editorial.css`, `animations-editorial.js`, `assets/images/*.jpg` (bez `* — kopia.*`), `assets/video/hero.mp4`, `robots.txt`, `sitemap.xml`.

**Pominąć:** `*.mjs`, `*.md`, `*.json`, `screenshot.js`, `serve.log`, `* — kopia.*`, `www_mazur/`, `.claude/`.

⚠️ `www_mazur/` to stara kopia sprzed naprawek — **nie wgrywaj**. Żywe pliki są tylko w katalogu głównym.

⚠️ `assets/images/og-mazur.jpg` **nie istnieje** — brakuje OG image dla social share. Wymagany rozmiar: 1200×630px.

---

## Architektura i data flow

```
fixture-editorial.json          ← dane treści (brand, sekcje, pola)
section-recipes-editorial.md    ← przepisy HTML per sekcja
SYSTEM-EDITORIAL.md             ← doktryna designu, reguły, flag patterns E01-E14
practice-cardflip-module.md     ← spec modułu flip kart praktyk
        ↓
index.html                      ← strona główna (plik wyjściowy)
design-system-editorial.css     ← tokeny CSS + wszystkie komponenty
animations-editorial.js         ← vanilla JS: IntersectionObserver + rAF scrub
```

`fixture-editorial.json` to źródło prawdy dla contentu. Przy regeneracji: czytaj fixture → recipe → generuj HTML. Nie wymyślaj klas CSS — wszystkie są w `design-system-editorial.css`.

---

## Sekcje strony i implementacja (index.html)

| Sekcja | Klucze JS/CSS |
|--------|---------------|
| Nav | `.nav`, `#mobile-menu`, `.nav-burger` |
| Hero | `.hero-editorial`, `.hero-wordmark`, `.scroll-reveal-text` |
| About | `.stats-row`, `.count-up[data-target]`, `.stagger-list` |
| Practices | `.practice-scroll-outer`, `.practice-flip-cards`, `.practice-flip-photos`, `.practice-tab`, `initPracticeFlip()` |
| Team | `.section-white`, `.word-reveal`, `.partner-trigger`, `.partner-panel` |
| Recognition | `.recognition-item`, `.stagger-list` |
| Press | `.press-card`, `.press-grid` |
| Contact+Footer | `.contact-footer-wrap` (jeden gradient) |

**Practices** — scroll-driven crossfade. Desktop: scrub z LERP=0.09 + snap (SEAM=0.22). Mobile/reduced-motion: taby `.practice-tab`. CSS transition wyłączone na desktopie (JS jedynym sterownikiem).

---

## CSS — krytyczne zasady

**Tokeny** (używaj zmiennych, nie wartości hardcoded):
- Kolory: `--bg`, `--text`, `--text-dim`, `--text-muted`, `--text-faint`, `--border`
- Typografia: `--text-mega` → `--text-xs`, `--weight-*`, `--leading-*`
- Spacing: `--space-xs` (8px) → `--space-2xl` (192px). `--space-sm`=16px, `--space-md`=32px, `--space-lg`=64px
- Motion: `--dur-fast/med/slow`, `--ease`

**Sekwencja tła — niezmienna:**
```
Hero/About/Practices/Recognition/Press → #020202 (czarny)
Team                                   → #FFFFFF (biały)
Contact + Footer                       → linear-gradient blue (JEDYNY kolor niebieski)
```

**Zero tolerancji:** `border-radius: 0`. Brak ikon SVG (tylko `+` i `×`). Brak cieni.

**`.section-white` overrides** (Team): `.f-lead`, `.f-meta`, `.btn-more`, `.partner-name` mają hardcoded white w bazowych klasach — nadpisz przez `.section-white .class { color: #000 }`. Overrides na końcu CSS.

### Znany gotcha: `<img>` z `aspect-ratio` + atrybutami HTML

Zawsze dodawaj `height: auto` gdy używasz `aspect-ratio` na `<img>` z atrybutami `width`/`height` — dotyczy zarówno CSS jak i inline style:

```css
/* ✅ działa */
img { width: 100%; height: auto; aspect-ratio: 3/4; object-fit: cover; }

/* ❌ HTML height="1448" bije aspect-ratio — obraz ma pełną naturalną wysokość */
img { width: 100%; aspect-ratio: 3/4; object-fit: cover; }
```

To samo w inline: `style="width:100%;height:auto;..."` — bez `height:auto` przeglądarka liczy aspect-ratio z HTML atrybutów i wciska portret w poziomy kadr.

Dotyczy: `.partner-trigger img` (CSS), zdjęcia Head of Practice na podstronach praktyk (inline style).

---

## JS — kontrakt klas animacji

| Klasa HTML | JS dodaje | CSS reaguje |
|-----------|-----------|-------------|
| `.scroll-reveal-text` | `.is-lit` | kolor dim → pełny |
| `.reveal-fade` | `.is-visible` | opacity 0 → 1, translateY |
| `.word-reveal` | `.is-visible` (na rodzicu) | spany wjeżdżają |
| `.stagger-list` | `.is-visible` (na dzieciach) | delay 0.08s/item |
| `.count-up[data-target]` | podmienia `textContent` | licznik 0→target |
| `.partner-trigger` | otwiera `#panel-{data-partner}` | `.partner-panel.is-open` |
| `.practice-flip-card/photo` | inline `opacity`+`transform` (desktop), `.is-active` (mobile) | crossfade |
| `.contact-rise` | inline `opacity` | niebieski overlay nad Press |
| `.mega-word[data-mega-max]` | inline `font-size` | mega-słowa rosną w scroll |
| `.section-team` | `--reveal-clip` | kurtyna clip-path |

---

## Architektura practice-card-inner (aktualna)

`.practice-card-inner` używa **CSS Grid z 3 wierszami** — nie flex:

```css
.practice-card-inner {
  display: grid;
  grid-template-rows: auto 1fr auto;  /* eyebrow | lead (1fr) | footer */
  row-gap: var(--space-sm);
  height: 100%;
}
```

HTML wewnątrz karty: eyebrow → lead → **`.practice-card-footer`** (wrapper dla stat + rule + sig + btn). Bez tego wrappera grid nie działa. `1fr` row sprawia że lead zawsze zakotwiczony u góry, footer zawsze u dołu — eliminuje skok statu podczas crossfade.

Na desktopie: `.practice-card-stat { min-height: calc(var(--text-h3) * 3.3) }` normalizuje footer do 2 linii (scoped do `@media (min-width: 769px)`).

---

## Mobile — kluczowe overrides (`@media max-width: 768px`)

- **Team grid**: `grid-template-columns: 1fr` (zamiast `repeat(3,1fr)` który wypychał 3. partnera poza ekran)
- **Partner panel**: `display: flex; flex-direction: column; overflow: hidden` (nie grid — patrz sekcja niżej)
- **Practice card inner**: `padding: var(--space-md) var(--space-md)` (32px, nie 64px — inaczej content width = 199px → wszystko zawija się ekstremalnie)
- **Card-1 bleed reset**: `width: 100%; overflow: hidden`
- **Card-2 extra padding reset**: `padding-left: var(--space-md)`
- **Practice card lead**: `min-height: 8em` (normalizuje wysokość kart — różnica 156px → 33px)

---

## Partner panel — architektura (iOS/Android safe)

Panel partnera (`#panel-{id}.partner-panel`) to `position: fixed; inset: 0; z-index: 200`. Na mobile musi być flex-stack z **CLOSE poza scrollowalnym divem**:

```html
<!-- ✅ poprawna kolejność — CLOSE jako pierwsze dziecko .partner-panel -->
<div class="partner-panel">
  <button class="partner-panel-close">CLOSE</button>   <!-- poza info! -->
  <div class="partner-panel-photo"><img ...></div>
  <div class="partner-panel-info">                     <!-- tu bio/kontakty -->
    <h2>...</h2>
    ...
  </div>
</div>
```

```css
/* mobile */
.partner-panel      { display: flex; flex-direction: column; overflow: hidden; }
.partner-panel-photo { flex: 0 0 50vh; height: 50vh; }
.partner-panel-info  { flex: 1 1 0; min-height: 0; overflow-y: scroll;
                       overflow-x: hidden; width: 100%; box-sizing: border-box; }
.partner-panel-close { position: absolute; /* = relative to .partner-panel (fixed) */ }
```

**Dlaczego tak, nie inaczej:**
- `position: fixed` na CLOSE wewnątrz `overflow: scroll` = bug iOS Safari + Android Chrome (clipping / scroll przechwytuje body). Rozwiązanie: CLOSE jako direct child panelu (position:fixed), `position:absolute` na CLOSE = kotwica do viewportu bez fixed-inside-overflow.
- `min-height: 0` na flex-dziecku z overflow jest krytyczne — bez niego Android Chrome nie constrainuje wysokości i scroll nie działa.
- `overflow-x: hidden` na info + `overflow-wrap: anywhere` na `.partner-contacts dd` — emaile i telefony nie mogą rozpychać panelu w poziomie (Android Chrome przy `overflow-y:scroll` automatycznie promuje `overflow-x` do `auto`).

**DevTools mobile emulation nie wykrywa tych bugów** — zawsze testuj na prawdziwym urządzeniu lub deployuj.

---

## Android — poziomy scroll całej strony

Mega-teksty dekoracyjne (`.section-mega`, `.footer-wordmark`) celowo wychodzą poza ramę. iOS je przycina, Android Chrome robi z nich poziomy pasek przewijania. Globalne zabezpieczenie w CSS:

```css
html { overflow-x: clip; }   /* clip, nie hidden — hidden blokuje position:sticky */
body { overflow-x: clip; }
```

`overflow-x: clip` przycina na osi X bez tworzenia scroll-kontenera, więc pionowy `position: sticky` (sekcja praktyk) działa bez zmian.

---

## Struktura stron (multi-page)

| Plik | URL |
|------|-----|
| `index.html` | `/` — pełna animacja scroll-driven |
| `o-kancelarii.html` | `/o-kancelarii` |
| `zespol.html` | `/zespol` — siatka partnerów, panele |
| `praktyki.html` | `/praktyki` — 4 rzędy practice-index-row |
| `praktyki/spory.html` | `/praktyki/spory` |
| `praktyki/karne.html` | `/praktyki/karne` |
| `praktyki/restrukturyzacja.html` | `/praktyki/restrukturyzacja` |
| `praktyki/korporacyjne.html` | `/praktyki/korporacyjne` |
| `aktualnosci.html` | `/aktualnosci` |
| `kontakt.html` | `/kontakt` |
| `privacy-policy.html` | `/privacy-policy` |
| `404.html` | `/404` |

Pełne animacje scroll-driven tylko na `index.html`. Pozostałe strony: reveal-fade, count-up, partner-panel.

---

## Assets — wymiary rzeczywiste

```
assets/images/
  hero-poster.jpg            ← poster <video>, 1280×720 (generowany z hero.mp4)
  practice-litigation.jpg    ← 1672×941 (16:9 landscape)
  practice-criminal.jpg      ← 923×941 (≈1:1)
  practice-restructuring.jpg ← 1448×1086 (4:3 landscape)
  practice-corporate.jpg     ← 1448×1086 (4:3 landscape)
  partner-mazur.jpg          ← 1086×1448 (3:4 portret)
  partner-lewandowski.jpg    ← 1086×1448 (3:4 portret)
  partner-kowalczyk.jpg      ← 1086×1448 (3:4 portret)
  partner-wojcik.jpg         ← 1086×1448 (3:4 portret) — nieużywany w HTML
  logo.jpg                   ← 1529×898
  og-mazur.jpg               ← ⚠️ BRAKUJE — potrzebny 1200×630px

assets/video/
  hero.mp4                   ← aktywny (autoplay muted loop)
  hero1.mp4 / hero2.mp4      ← backupy/warianty, nie serwowane
```

Pliki `* — kopia.*` to ręczne backupy — nie edytuj, nie serwuj.

---

## Pliki specyfikacji (nie modyfikować bez powodu)

- `SYSTEM-EDITORIAL.md` — doktryna, flag patterns E01-E14
- `section-recipes-editorial.md` — HTML przepisy per sekcja
- `fixture-editorial.json` — dane klienta
- `practice-cardflip-module.md` — spec modułu flip
- `TEST-animacje.md` — diagnostyka animacji
- `archetype-aware-validation.md` — reguły walidacji fixture
- `AUDIT-motion-v2.md` — audyt motion v2
