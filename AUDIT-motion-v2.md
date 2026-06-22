-init# Motion Architecture Audit v2 — PACTA EDITORIAL

> Stan na: 2026-06-03. Re-audit po wdrożeniu #1–#5, paska postępu i #4.
> Zakres: perceived premium quality, editorial feeling, motion as narrative,
> continuity between sections, visual hierarchy through motion, premium UX.
> NIE ocenia poprawności kodu.

---

## Status wdrożeń (z pierwotnego Top 10)

| Punkt | Opis | Status |
|---|---|---|
| #1 | Animacja wejścia Contact (heading `scroll-reveal-text` + form `reveal-fade`) | ✅ ZROBIONE |
| #2 | Usunięcie `box-shadow` + `scale(1.05)` z press hover | ✅ ZROBIONE |
| #3 | `scroll-reveal-text` na nagłówkach Recognition / Press / Contact | ✅ ZROBIONE |
| #5 | Scroll-driven Practices (300vh sticky, flip, mobile=taby) + pasek postępu | ✅ ZROBIONE |
| #4 | Kurtyna clip-path Practices→Team (`initTeamReveal`, feature flag, reduced-motion) | ✅ ZROBIONE |
| #6 | Mega-słowa dla Recognition (`UZNANIE`) i Press (`PRASA`) + About (`ZAUFANIE`) — `initMegaGrow`, `data-mega-max` | ✅ ZROBIONE |
| #7 | Hero: rozdzielić color-reveal (wejście) od scrub-fade (wyjście) — martwa strefa `exitP`, transition tylko `color` | ✅ ZROBIONE |
| #8 | Ujednolicić gramatykę wejścia treści — `--reveal-lift: 14px`, color-light + lift, jeden easing | ✅ ZROBIONE |
| #9 | Press→Contact: niebieski wzbiera (climax) — `initContactClimax`, overlay `.contact-rise`, flaga + reduced-motion | ✅ ZROBIONE |
| #10 | Numerale 01–05 jako scroll chapter-indicator — `.chapter-nav` `mix-blend-mode: difference`, `initChapterNav` | ✅ ZROBIONE |
| #11 | Team→Recognition lustrzana kurtyna — `initTeamReveal` rozszerzony o fazę wyjścia (jeden clip-path) | ✅ ZROBIONE |
| #12 | Wyciszenie niebieskiego panelu w WIĘCEJ+ (`.btn-more-split-grad` → neutralny szary) | ✅ ZROBIONE |
| #13 | Asymetryczny split Practices 42/58 (`.practice-tabs-grid` `0.42fr 0.58fr`) | ✅ ZROBIONE |
| #14 | Różnicowanie Recognition (od lewej, `.from-left`) vs Press (od dołu) | ✅ ZROBIONE |

---

## Diagnoza systemowa

Pierwszy audyt: „kinowe Hero przyklejone do generycznego korpusu, seria niezależnych sekcji".
Teraz obraz odwrócił się połowicznie:

- **Górna połowa (Hero→About→Practices→Team) = ciągła narracja.** Scroll jest narratorem
  przez całość; Practices→Team to najlepszy moment strony (kurtyna clip-path).
- **Dolna połowa (Team→Recognition→Press→Contact) = wciąż seria niezależnych bloków
  z martwymi cięciami.**

Kluczowa konsekwencja: **#4 podniósł poprzeczkę i obnażył dół.** Strona to dziś *pół narracji*:
pięknie buduje do Team, po czym opada w rozłączone kafelki. Sukces #4 sprawił, że dół wygląda
gorzej niż przed zmianami — bo istnieje już punkt odniesienia, że można lepiej.

---

## Oceny sekcji (delta względem pierwszego audytu)

### Hero — 8/10 (bez zmian)
Najmocniejszy bespoke-scrub. Dług: statement ma równolegle `scroll-reveal-text` i scrub-fade —
dwa systemy walczą o ten sam element (#7).

### About — 5/10 (bez zmian)
„Nagłówek + 2 liczby + fade-in". Brak signature/mega-słowa. Najsłabsze ogniwo górnej połowy —
dolina między dwoma szczytami.

### Practices — 7.5/10 (▲ z 4)
Scroll-driven przywrócony (narracja zamiast widgetu). Pasek postępu = affordance + sygnał końca,
czysto editorial. Flip rotateY elegancki, wymiary naprawione.
Słabości: split 50/50 (template sygnał), niebieski panel w WIĘCEJ+ miga przed białą kurtyną.

### Team — 8/10 (▲ z 7)
#4 dał dramatyczne wejście — biały arkusz schodzi po czerni. Mega-grow i word-reveal teraz
„zarobione" reveal-em. Słabość: **wyjście z Team jest martwe** (instant-cut do czerni) —
asymetria wejścia/wyjścia rażąca.

### Recognition — 5/10 (▲ z 4)
Dostał `scroll-reveal-text` na nagłówku. Wciąż brak mega-słowa, wciąż stagger-lista.
Marginalny skok. Nadal „lista nagród".

### Press — 5.5/10 (▲ z 5)
`scroll-reveal-text` heading + usunięto łamiące doktrynę cienie/scale. Hover czysty, na-marce.
Wciąż generyczny grid 3 kart, brak mega-słowa. Recognition i Press wciąż mają tę samą teksturę
ruchu — czytają się jak ta sama sekcja dwa razy.

### Contact — 5/10 (▲ z 3)
Nagłówek + formularz mają wreszcie ruch. Słabość: szew Press→Contact (czarny→niebieski,
kulminacja kolorystyczna) wciąż instant-cut (#9). Gradient powinien wzbierać.

---

## Przejścia

| Przejście | Tło | Było → Teraz | Diagnoza |
|---|---|---|---|
| Hero → About | czarny→czarny | 5 → 5 | Brak handoffu. |
| About → Practices | czarny→czarny | 3 → 6 ▲ | Scroll pozostaje narratorem, pasek tłumaczy co się dzieje. |
| Practices → Team | czarny→BIAŁY | 4 → 8 ▲▲ | Najlepszy szew strony. Kurtyna clip-path. |
| Team → Recognition | biały→czarny | 4 → 4 | Niezmienione cięcie. Teraz NAJGORSZY szew. |
| Recognition → Press | czarny→czarny | 3 → 4 ▲ | Ta sama tekstura. Wrażenie powtórki. |
| Press → Contact | czarny→NIEBIESKI | 3 → 3.5 | Kulminacja koloru wciąż bez ruchu. Najbardziej rażący niezrobiony szew. |

**Werdykt:** Górna połowa = jedna narracja. Dolna połowa = wciąż seria niezależnych sekcji.
Punkt przegięcia w Team: wpływasz przez kinową kurtynę, wypływasz przez martwy cut.

---

## Motion Architecture V2 — kierunek

Strona odkryła swój sygnaturowy ruch (kurtyna clip-path na szwie koloru).
V2 nie wymyśla nowego języka — **systematyzuje sprawdzony** i rozciąga go na całość.

### Zasada nadrzędna: każda zmiana koloru tła = wydarzenie, nie cięcie
Sekwencja czarny→biały→czarny→niebieski to kręgosłup strony. Dziś 1 z 3 szwów ożywiony.
V2: wszystkie trzy stają się reveal-ami (powiel `initTeamReveal()`):
- **Team → Recognition (biały→czarny):** lustro #4 — czerń wsuwa się nad biel.
- **Press → Contact (czarny→niebieski):** climax — gradient wzbiera od dołu, nagłówek na fali.

### Trzy warstwy ruchu
1. **Seam grammar** (NOWA, częściowo wdrożona) — kurtyny na szwach koloru. Zostają 2 zastosowania.
2. **Reveal grammar (treść)** — ujednolicić miks (scrub-fade / color-light / reveal-fade / stagger)
   do jednego gestu wejścia (#8).
3. **Micro-interaction** — już posprzątana (#2). Bez dalszej pracy.

### Mega-word jako nić rozdziałów
Hero „MAZUR", Team „ZESPÓŁ" mają sygnatury. Recognition/Press wciąż statyczne — domknąć (#6).

### Domknięcia długu
- Hero #7: rozdzielić color-reveal (wejście) od scrub-fade (wyjście) — sekwencyjnie.
- Numerale #10: trwały wskaźnik rozdziału sprzężony ze scrollem.

---

## Top 10 Highest Impact Improvements (kolejność do wykonania)

Sort: największy wpływ na premium × najniższy koszt. Wzorzec kurtyny (#4) jest udowodniony
i tani do powielenia — lustrzane szwy na szczycie.

| # | Ulepszenie | Wpływ | Koszt | Uwaga |
|---|---|---|---|---|
| 1 | **Press→Contact: niebieski wzbiera od dołu (climax)** | ⬛⬛⬛⬛⬛ | 🟢 niski | Reuse `initTeamReveal()`. Najważniejszy emocjonalnie szew wciąż martwy. |
| 2 | **Team→Recognition: lustrzana kurtyna (czerń nad biel)** | ⬛⬛⬛⬛⬛ | 🟢 niski | Teraz najgorszy szew. Reuse #4. Domyka asymetrię Team. |
| 3 | **Mega-słowa dla Recognition i Press** | ⬛⬛⬛⬛ | 🟡 średni | Reuse `initHeroWordmarkGrow`. Domyka nić sygnatur. |
| 4 | **Usunąć/wyciszyć niebieski panel w WIĘCEJ+ przed Team** | ⬛⬛⬛ | 🟢 b. niski | Łamie „niebieski tylko w contact", mąci kurtynę #4. ~3 linie CSS. |
| 5 | **Hero #7: rozdzielić color-reveal od scrub-fade** | ⬛⬛⬛ | 🟢 niski | Jedyny dług w najlepszej sekcji. |
| 6 | **Ujednolicić gramatykę wejścia treści** | ⬛⬛⬛⬛ | 🟡 średni | Eliminuje wrażenie „różnych stron" w dolnej połowie. |
| 7 | **About: signature/mega-słowo** | ⬛⬛⬛ | 🟡 średni | Najsłabsze ogniwo górnej połowy. |
| 8 | **Asymetryczny split Practices (42/58)** | ⬛⬛ | 🟢 niski | Usuwa jedyny „template" sygnał w Practices. |
| 9 | **Numerale 01–05 jako scroll chapter-indicator** | ⬛⬛⬛ | 🟡 średni | Trwała nić łącząca rozdziały. |
| 10 | **Różnicować Recognition vs Press (tekstura ruchu)** | ⬛⬛ | 🟡 średni | Po #3 częściowo rozwiązane — niższy priorytet. |

---

## Rekomendowany następny krok
**#1 (Press→Contact climax)** — symetryczny odpowiednik wdrożonego #4. Mechanizm już istnieje
(`initTeamReveal` jako wzorzec), więc najtańszy-najmocniejszy ruch z całej listy.

Para #1 + #2 (oba lustrzane szwy) domyka „każda zmiana koloru = wydarzenie" i zamienia dolną
połowę z serii bloków w ciąg narracyjny — to dziś najwyższy zwrot z pozostałej pracy.
