# PACTA EDITORIAL — Design System

**Wersja:** 1.0
**Archetyp:** editorial-luxury law firm
**Stack:** vanilla JS + CSS (bez GSAP, bez Barba)

---

## Tożsamość systemu

PACTA EDITORIAL obsługuje ambitne kancelarie które chcą komunikować się jak firma ze świata designu i kultury, nie jak instytucja prawna. Klient nie szuka "solidnego prawnika" — szuka partnera który myśli tak jak on. Strona ma wywoływać reakcję "to nie wygląda jak żadna inna kancelaria" — i to jest cel, nie efekt uboczny.

Dominuje **czerń absolutna #020202** i **biel #FFFFFF**. Jedyny kolor to niebieski gradient wyłącznie w sekcji kontakt+footer. Typografia jest architekturą — gigantyczne słowa wypełniają viewport jako elementy graficzne, nie tylko jako tekst. Ruch jest obecny przez cały scroll, ale nigdy nie przeszkadza.

Fundamentalna różnica od PACTA PREMIUM: PREMIUM komunikuje prestiż przez *brak* ozdobników. EDITORIAL komunikuje energię przez *skalę i ruch*. To są przeciwne filozofie prowadzące do podobnego efektu (premium feeling) zupełnie różnymi środkami.

---

## Kolory

```
--bg:               #020202    czerń absolutna — tło całej strony
--bg-elevated:      #0A0A0A    ledwie jaśniejsze — wyróżnione bloki
--text:             #FFFFFF    biel — tekst aktywny
--text-dim:         rgba(255,255,255,0.25)   scroll-color stan startowy
--text-muted:       rgba(255,255,255,0.55)   secondary, captions
--text-faint:       rgba(255,255,255,0.40)   numerale, daty, meta
--border:           rgba(255,255,255,0.12)   subtelne linie
--border-strong:    rgba(255,255,255,0.30)   wyraźniejsze linie

SECTION WHITE (Team):
  background: #FFFFFF
  text:       #000000
  Jedyna sekcja z białym tłem — kontrast czarny→biały→czarny

CONTACT + FOOTER (jeden ciągły gradient):
  background: linear-gradient(180deg, #1E5BB8 0%, #1a4a9a 60%, #0d3070 100%)
  Jedyny kolor w systemie — pojawia się TYLKO tutaj
```

---

## Typografia

```
Font: Inter (proxy dla ario-sans — geometric grotesque)
Jeden font przez cały system — różnicowanie przez skalę i wagę

Skala:
  --text-mega:    clamp(4rem, 20vw, 18rem)   słowa-architektura (ARIO, TEAM, Practice)
  --text-display: clamp(2.5rem, 8vw, 7rem)   nagłówki sekcji
  --text-h1:      clamp(2rem, 5vw, 4rem)     hero statement
  --text-h2:      clamp(1.75rem, 4vw, 3rem)  section headline
  --text-h3:      clamp(1.25rem, 2.5vw, 1.75rem)
  --text-lg:      1.25rem   lead, ważny body
  --text-base:    1rem      body
  --text-sm:      0.875rem  nav, caption, meta
  --text-xs:      0.75rem   numerale nav (01-05), daty

Wagi: 400 / 700 / 900
Line-height display: 0.95 (bardzo ciasny — mega words)
Letter-spacing mega: -0.04em
```

---

## Layout

```
Padding boczny:   100px desktop / 24px mobile (zmierzone)
Content width:    880px (zmierzone — bloki treści NIE full-width)
Container max:    1600px
Border-radius:    0 wszędzie
Shadow:           brak

Broken/asymmetric grid:
  Bloki treści są wąskie (~880px) i celowo nie wypełniają szerokości
  Display words (mega) ŁAMIĄ tę regułę — wychodzą na pełną szerokość
  To jest signature editorial: wąski content + gigantyczna typografia
```

---

## Sekwencja sekcji (homepage)

```
1.  NAV            sticky, czarny, numerowane 01-05 w mobile overlay
2.  HERO           video po prawej + tekst po lewej + ARIO mega na dole
                   scroll-color na tekście hero
3.  ABOUT          manifesto + dwie liczby (10+, 30+)
4.  PRACTICES      4 karty-dokumenty — biała kartka + B&W zdjęcie
                   scroll-color na nagłówku "We excel in various areas of law"
5.  TEAM           BIAŁE TŁO (kontrast z czernią)
                   "First and foremost, Ario is a TEAM" (mega)
                   word-reveal: "love the law / take action / ..."
                   collage zdjęć + partner cards klikalne
6.  RECOGNITION    powrót do czerni
                   ranking wall: nazwa + rok, stagger reveal
7.  PRESS CENTER   4 karty newsów (3D rotated CSS)
8.  CONTACT+FOOTER jeden ciągły niebieski gradient
                   formularz + dane + ARIO LAW gigantyczne na dole
```

**Ważne: Team sekcja ma BIAŁE tło — to jest celowy kontrast, nie błąd.**

---

## Reguły kompozycji

### 1. Typografia jako architektura
Mega words (ARIO, TEAM, Practice, OPPORTUNITIES) są elementami graficznymi, nie tylko tekstem. Wypełniają viewport. Nie ma tu "headline 48px" — jest "słowo które jest sekcją". Każda sekcja ma swoje mega-słowo jako wizytówkę.

### 2. Scroll-color jako narracja
Tekst startuje przyciemniony (rgba 0.25) i rozjaśnia się gdy wchodzi w viewport. To sprawia że scrollowanie *ujawnia* treść jak odkrywanie czegoś ukrytego. Stosuj na długich zdaniach i listach — nie na pojedynczych słowach.

### 3. Czarny → biały → czarny → niebieski
Sekwencja kolorów tła jest celowa i rytmiczna:
- Czarny (hero, practices, recognition) — dominuje, buduje powagę
- Biały (team) — oddech, humanizuje, kontrast
- Niebieski (contact+footer) — jedyny kolor, ładunek emocjonalny na końcu

Nigdy nie łam tej sekwencji. Biały pojawia się TYLKO w Team.

### 4. Practice cards jako dokumenty
Każda praktyka to biała "kartka" z numeralem, nazwą CAPS, tabelką Head/Team. Obok B&W zdjęcie. Czarne tło otacza. To nie są "karty z ikoną" — to są wizualne dokumenty. To odróżnia EDITORIAL od wszystkich innych archetypów.

### 5. MORE+ split button
Przycisk "MORE +" to dwa panele: lewa połowa biała z tekstem, prawa połowa niebieski gradient. Pojawia się na końcu każdej practice card i na końcu sekcji practices. To signature element — nie używaj zwykłego przycisku w tym archeotypie.

### 6. Partner panel zamiast osobnej strony
Kliknięcie na partnera otwiera panel na tej samej stronie (position:fixed, CLOSE X). Duże zdjęcie po lewej, dane kontaktowe po prawej. Nie przekierowanie na podstronę. Barba.js w oryginale to obsługuje — w vanilla implementacji to panel JS.

### 7. Bez ikon
Zero ikon dekoracyjnych. Jedyne symbole: "+" w MORE+ i "×" w CLOSE X. To są elementy typograficzne, nie ikony SVG.

### 8. B&W photo treatment
Wszystkie zdjęcia w praktykach i niektóre w teamie są czarno-białe (CSS filter: grayscale(100%)). Zdjęcia partnerów w Team section mogą być kolorowe gdy są pełnoekranowe (klatka 30 — Anna Sydorovych w kolorze).

### 9. Collage w Team section
Zdjęcia w Team nie są w regularnym gridzie — są rozmieszczone asymetrycznie, niektóre z rotacją (CSS transform: rotate(-3deg)). To buduje "editorial magazine" feeling.

### 10. Recognition: rok jako data, nie achievement
Recognition wall pokazuje "Nazwa rankingu | Rok" — bez opisów, bez gwiazdek, bez "Top 10". Sam fakt pojawienia się w rankingu wystarczy. Minimalizm jest komunikatem: "Nie musimy się chwalić."

### 11. Whitespace jest treścią
Sekcje mają section-padding 8-12rem. Między practice cards są przestrzenie. Między recognition items są odstępy. Pustka sygnalizuje pewność siebie — nie ma się czym "zapełniać".

### 12. Footer wordmark jako dekoracja
Na dole footer (niebieski gradient) gigantyczne "ARIO LAW" w bardzo niskiej opacity (~0.15) jako dekoracja tła. Nie jest to CTA ani element informacyjny — to typograficzna dekoracja zamykająca stronę.

---

## Motion system

### Vanilla JS — IntersectionObserver (bez GSAP)

**Timing defaults:**
```
--dur-fast: 0.4s    hover, krótkie transitions
--dur-med:  0.6s    sekcje wjeżdżające
--dur-slow: 1.0s    duże elementy (mega words, zdjęcia)
--stagger:  0.06s   per-element opóźnienie w grupach
--ease:     cubic-bezier(0.16, 1, 0.3, 1)   power3.out equivalent
```

### Lista animacji (vanilla JS)

| Animacja | Klasa CSS | Trigger | Efekt |
|---|---|---|---|
| Scroll-color | `.scroll-reveal-text` | IO threshold 0.3 | opacity 0.25→1 |
| Word reveal | `.word-reveal > span` | IO na rodzicu | translateY(0.4em)→0 + opacity, stagger 0.06s |
| Section fade | `.reveal-fade` | IO threshold 0.15 | opacity 0→1, translateY(20px)→0 |
| Stagger list | `.stagger-list > *` | IO na rodzicu | dzieci z opóźnieniem 0.08s |
| Counter | `.count-up[data-target]` | IO | liczba od 0 do data-target |
| Partner panel | `.partner-trigger` | click | panel.classList.add('is-open') |
| Nav mobile | `#menu-toggle` | click | overlay fade |

### Co NIE jest animowane
- Page transitions (Barba pominięty)
- Parallax (zbyt kosztowny bez GSAP)
- Scrub proporcjonalny do scroll position

---

## Komponenty — inventory

### Practice card (dokument-style)
```html
<div class="practice-card">
  <div class="practice-card-doc">
    <span class="practice-card-num">01</span>
    <p class="practice-card-name">LITIGATION</p>
    <div class="practice-card-table">
      <div class="practice-card-table-row">
        <span class="practice-card-table-label">Head of Practice</span>
        <span>Anna Sydorovych</span>
      </div>
      <div class="practice-card-table-row">
        <span class="practice-card-table-label">Team</span>
        <span>10+ lawyers</span>
      </div>
    </div>
  </div>
  <div class="practice-card-photo">
    <img src="..." alt="..." />
  </div>
</div>
```

### MORE+ split button
```html
<a href="..." class="btn-more-split">
  <span class="btn-more-split-text">MORE +</span>
  <span class="btn-more-split-grad"></span>
</a>
```

### Word reveal (Team section)
```html
<p class="word-reveal f-display section-white">
  <span>love</span> <span>the</span> <span>law</span>
</p>
```
JS splituje automatycznie lub ręcznie.

### Recognition item
```html
<div class="recognition-row stagger-list">
  <a href="..." class="recognition-item">
    <span class="recognition-name">Legal 500</span>
    <span class="recognition-year">2024</span>
    <span class="recognition-plus">+</span>
  </a>
  ...
</div>
```

### Partner card (klikalna)
```html
<button class="partner-trigger" data-partner="anna">
  <img src="..." alt="Anna Sydorovych" />
  <span class="partner-name">ANNA SYDOROVYCH</span>
  <span class="partner-title">PARTNER</span>
</button>
```

---

## Voice guide

### Zakazane
- "kompleksowe usługi" / "indywidualne podejście" / "z pasją"
- "zapraszamy do kontaktu" / "zachęcamy"
- Formalny dystans "Państwo" — za instytucjonalne dla tego archetypu
- Wykrzykniki gdziekolwiek
- Listy bulleted jako proof ("✓ SEO ✓ Mobile ✓ Lighthouse")

### Polecane
- Pewne krótkie zdania: "We enjoy the law." "Our mission is your opportunities."
- Pierwsza osoba plural "we" — nie "I", nie bezosobowe
- Energia bez agresji: "adore the drive, crisis situations motivate"
- Liczby jako fakty: "10+ years", "30+ lawyers", "2024"
- Angielski lub polski — nie mieszaj na jednej stronie

---

## Flag patterns

- `[FLAG-E01]` Sekcja Team ma ciemne tło — powinna być biała
- `[FLAG-E02]` Practice cards mają ikony zamiast numerali + dokument-style
- `[FLAG-E03]` Użyto zwykłego przycisku zamiast MORE+ split
- `[FLAG-E04]` Footer i contact to osobne sekcje — powinny być jednym gradientem
- `[FLAG-E05]` Brak recognition wall (ranking + rok)
- `[FLAG-E06]` Brak scroll-color na tekście hero i practices
- `[FLAG-E07]` Brak mega-word dla każdej sekcji
- `[FLAG-E08]` Zdjęcia są kolorowe w practice cards — powinny być B&W
- `[FLAG-E09]` Pricing section istnieje — nie powinna
- `[FLAG-E10]` border-radius niezerowy gdziekolwiek
- `[FLAG-E11]` Ikony dekoracyjne (Lucide, Tabler) użyte jako elementy sekcji
- `[FLAG-E12]` Biały jest użyty poza sekcją Team i contact/footer
- `[FLAG-E13]` Word reveal w Team section brakuje
- `[FLAG-E14]` Partner cards nie są klikalne (brak panel CLOSE X)

---

## Lista plików systemu

| Plik | Cel |
|---|---|
| `SYSTEM-EDITORIAL.md` | Ten plik. Doktryna, reguły, flags. |
| `design-system-editorial.css` | Tokeny CSS + wszystkie komponenty. |
| `section-recipes-editorial.md` | Per-sekcja prompty + HTML snippety. |
| `animations-editorial.js` | Vanilla JS — wszystkie 12 animacji. |
| `fixture-editorial.json` | Site.model zgodny z CMS contractem. |
