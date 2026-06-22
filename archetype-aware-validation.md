# Archetype-aware walidacja — jak hard.ts przestaje być zakrzepłym playbookiem

## Problem (twój obecny stan)

Twój `hard.ts` ma reguły hardcoded dla JEDNEGO archetypu:

```typescript
// V3: index page must have pricing section
if (!indexPage?.sections.find(s => s.id === 'pricing')) {
  errors.push({ rule: 'V3', ... })
}

// V9: hero section must not contain image-type field
if (heroSection) {
  for (const [fieldName, field] of Object.entries(heroSection.fields)) {
    if (field.type === 'image') errors.push({ rule: 'V9', ... })
  }
}
```

To są reguły **forma/premium**. Dla EDITORIAL (Ario):
- V3 (pricing required) → FAŁSZ. Ario nie ma cennika. Kancelaria premium nie pokazuje cen.
- V9 (hero no image) → SPRZECZNE. Ario MA video w hero. EDITORIAL hero wymaga media.

Gdybyś dziś wygenerował stronę EDITORIAL, twoja walidacja **odrzuciłaby ją** za brak pricing i za video w hero. To jest dowód że reguły = zakrzepły playbook jednego archetypu.

## Rozwiązanie: reguły jako dane, ewaluator jako kod

Dokument z cms.zip nazwał to wprost: *"Przenieś V2–V14 do playbook.rules, zostaw w kodzie tylko ewaluator reguł."* Oto jak to wygląda konkretnie.

### Krok 1: ArchetypePlaybook jako typ

```typescript
// types/archetype.ts

export interface ArchetypePlaybook {
  id: string                    // 'authority-led' | 'editorial-led' | 'trust-led-solo' ...
  designSystem: string          // 'pacta-premium' | 'pacta-editorial' ...

  requiredSections: string[]    // sekcje które MUSZĄ być na index
  forbiddenSections: string[]   // sekcje które NIE MOGĄ wystąpić

  heroRules: {
    allowImage: boolean         // premium: false, editorial: true
    allowVideo: boolean         // premium: false, editorial: true
    maxCtas: number
  }

  pricingRules: {
    required: boolean           // forma: true, premium: false, editorial: false
    maxPackages: number
  }

  proofSystem: 'transactions' | 'recognition-wall' | 'testimonials' | 'before-after' | 'response-time'
  // ↑ TO jest oś na której archetypy są nieredukowalne (cms.zip)

  forbiddenPhrases: string[]    // voice guide jako dane
  ctaStyle: 'booking' | 'urgency' | 'low-pressure' | 'editorial-line'
}
```

### Krok 2: Playbooki jako rekordy danych

```typescript
// playbooks/authority-led.ts (twój obecny premium)
export const authorityLed: ArchetypePlaybook = {
  id: 'authority-led',
  designSystem: 'pacta-premium',
  requiredSections: ['hero', 'praktyki', 'team', 'contact-cta', 'footer'],
  forbiddenSections: ['pricing', 'testimonials'],
  heroRules: { allowImage: false, allowVideo: false, maxCtas: 1 },
  pricingRules: { required: false, maxPackages: 0 },
  proofSystem: 'transactions',
  forbiddenPhrases: ['kompleksowe usługi', 'indywidualne podejście', 'z pasją'],
  ctaStyle: 'low-pressure',
}

// playbooks/editorial-led.ts (NOWY — Ario)
export const editorialLed: ArchetypePlaybook = {
  id: 'editorial-led',
  designSystem: 'pacta-editorial',
  requiredSections: ['hero', 'about', 'practices', 'team', 'recognition', 'press', 'contact', 'footer'],
  forbiddenSections: ['pricing'],
  heroRules: { allowImage: true, allowVideo: true, maxCtas: 1 },  // ← video OK!
  pricingRules: { required: false, maxPackages: 0 },
  proofSystem: 'recognition-wall',   // ← INNY proof niż premium
  forbiddenPhrases: ['kompleksowe usługi', 'tradycja i nowoczesność'],
  ctaStyle: 'editorial-line',
}

// playbooks/forma-agency.ts (twoja sales page — z pricing!)
export const formaAgency: ArchetypePlaybook = {
  id: 'forma-agency',
  designSystem: 'forma',
  requiredSections: ['hero', 'pricing', 'cta-finale', 'footer'],  // pricing required
  forbiddenSections: [],
  heroRules: { allowImage: true, allowVideo: false, maxCtas: 2 },
  pricingRules: { required: true, maxPackages: 2 },   // ← V3, V7 jako dane
  proofSystem: 'testimonials',
  forbiddenPhrases: [],
  ctaStyle: 'low-pressure',
}
```

### Krok 3: hard.ts staje się generycznym ewaluatorem

```typescript
// validation/hard.ts — TERAZ archetype-aware

import type { SiteModel, Section } from '../types'
import type { Violation } from './types'
import { getPlaybook } from '../playbooks'

const PRICE_AMOUNT_RE = /^\d[\d\s ]*$/
const PRICE_VAGUE = /wycen|zapytaj|kontakt/i
const EMOJI_RE = /\p{Extended_Pictographic}/u
const SAFE_URL_RE = /^https?:\/\//i

export function validateHard(model: SiteModel): Violation[] {
  const errors: Violation[] = []
  const playbook = getPlaybook(model.archetype)   // ← reguły z danych, nie z kodu
  const indexPage = model.pages.find(p => p.slug === 'index')

  // ── Required sections (było V2/V3/V4 — teraz dane) ──────────
  for (const required of playbook.requiredSections) {
    if (!indexPage?.sections.find(s => s.id === required)) {
      errors.push({
        rule: 'REQUIRED_SECTION',
        field: `pages.index.${required}`,
        message: `Archetyp "${playbook.id}" wymaga sekcji "${required}" na stronie głównej`,
      })
    }
  }

  // ── Forbidden sections (NOWE — uniemożliwia np. pricing w premium) ──
  for (const page of model.pages) {
    for (const section of page.sections) {
      if (playbook.forbiddenSections.includes(section.id)) {
        errors.push({
          rule: 'FORBIDDEN_SECTION',
          field: section.id,
          message: `Archetyp "${playbook.id}" nie dopuszcza sekcji "${section.id}"`,
        })
      }
    }
  }

  // ── Hero media (było V9 — teraz per-archetyp) ───────────────
  const heroSection = findSection(model, 'hero')
  if (heroSection) {
    for (const [fieldName, field] of Object.entries(heroSection.fields)) {
      if (field.type === 'image' && !playbook.heroRules.allowImage) {
        errors.push({ rule: 'HERO_IMAGE', field: `hero.${fieldName}`,
          message: `Archetyp "${playbook.id}" nie dopuszcza obrazu w hero` })
      }
      if (field.type === 'video' && !playbook.heroRules.allowVideo) {
        errors.push({ rule: 'HERO_VIDEO', field: `hero.${fieldName}`,
          message: `Archetyp "${playbook.id}" nie dopuszcza wideo w hero` })
      }
    }
  }

  // ── Pricing (było V3/V7 — teraz per-archetyp) ───────────────
  const pricingSection = findSection(model, 'pricing')
  if (playbook.pricingRules.required && !pricingSection) {
    errors.push({ rule: 'PRICING_REQUIRED', field: 'pages.index.pricing',
      message: `Archetyp "${playbook.id}" wymaga sekcji cennika` })
  }
  if (pricingSection) {
    const count = Object.values(pricingSection.fields).filter(f => f.type === 'price').length
    if (count > playbook.pricingRules.maxPackages) {
      errors.push({ rule: 'PRICING_MAX', field: 'pricing',
        message: `Maksymalnie ${playbook.pricingRules.maxPackages} pakiety dla "${playbook.id}"` })
    }
  }

  // ── Forbidden phrases (voice guide jako dane) ───────────────
  for (const page of model.pages) {
    for (const section of page.sections) {
      for (const [fieldName, field] of Object.entries(section.fields)) {
        if (typeof field.value !== 'string') continue
        for (const phrase of playbook.forbiddenPhrases) {
          if (field.value.toLowerCase().includes(phrase.toLowerCase())) {
            errors.push({ rule: 'FORBIDDEN_PHRASE', field: `${section.id}.${fieldName}`,
              message: `Zakazana fraza "${phrase}" dla archetypu "${playbook.id}"` })
          }
        }
      }
    }
  }

  // ── UNIWERSALNE reguły (zostają — to mechanizm, nie znaczenie) ──
  // V1 (price numeric), V8 (package features), V10 (numeral), V11 (footer ≤6),
  // V12 (no emoji), V13/V14 (portfolio count), V15 (safe URL)
  // ↑ te NIE zależą od archetypu — walidują strukturę, nie semantykę biznesową
  // [... zostają bez zmian z obecnego hard.ts ...]

  return errors
}

function findSection(model: SiteModel, id: string): Section | undefined {
  for (const page of model.pages) {
    const s = page.sections.find(s => s.id === id)
    if (s) return s
  }
  return undefined
}
```

## Co to daje

| Przed | Po |
|---|---|
| V3 pricing hardcoded | `playbook.pricingRules.required` |
| V9 hero no-image hardcoded | `playbook.heroRules.allowImage/Video` |
| Dodanie archetypu = edycja hard.ts | Dodanie archetypu = nowy plik playbooka |
| Voice guide w SYSTEM.md (nie egzekwowany) | `playbook.forbiddenPhrases` (egzekwowany) |
| Jeden zakrzepły archetyp | N archetypów przez ten sam ewaluator |

## Granica — co zostaje uniwersalne

NIE wszystko idzie do playbooka. Te reguły są **mechanizmem, nie znaczeniem** — zostają w kodzie:

- **V1** — cena musi być liczbą (gdy pricing istnieje). To walidacja typu, nie semantyka archetypu.
- **V12** — brak emoji w nagłówkach. Uniwersalna higiena.
- **V15** — bezpieczne URL (anty-XSS). Bezpieczeństwo, nie biznes.
- **V8** — pakiet ma features (gdy pricing istnieje). Integralność danych.

To jest twoja granica Warstwa 1 / Warstwa 2 z cms.zip: *"uogólniaj mechanizm, nigdy nie uogólniaj znaczenia"*.

## Następny krok refactoru (gdy będziesz gotów)

1. Stwórz `playbooks/` z 3 rekordami: `authority-led`, `editorial-led`, `forma-agency`
2. Wyciągnij V2/V3/V4/V7/V9 z hard.ts do tych rekordów
3. Przepisz hard.ts jako ewaluator (kod wyżej)
4. Zostaw V1/V8/V12/V15 jako uniwersalne
5. Test: czy stara strona premium nadal przechodzi? Czy EDITORIAL z video przechodzi?

Jeśli oba przejdą — granica jest dobrze postawiona. To jest empiryczny dowód architektury, nie teoria.
