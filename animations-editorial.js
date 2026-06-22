/* ============================================================
   PACTA EDITORIAL — animations.js
   Vanilla JS, zero dependencies (bez GSAP, bez Barba)
   Wszystkie animacje z reverse engineering ario.law
   ============================================================ */

(function () {
  'use strict';

  /* Respektuj prefers-reduced-motion — nie odpalaj animacji */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Feature flags ─────────────────────────────────────────── */
  var ENABLE_TEAM_REVEAL     = true;   /* #4 wejście + #2 wyjście kurtyny Team */
  var ENABLE_CONTACT_CLIMAX  = true;   /* #1 Press→Contact: niebieski wzbiera od dołu */
  var ENABLE_CHAPTER_NAV     = true;   /* #9 wskaźnik rozdziału 01–05 */

  /* clamp helper */
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  /* ─── 1. Scroll-color text reveal ──────────────────────────
     Tekst startuje dim (rgba 0.25), rozjaśnia się gdy w viewport.
     Klasy: .scroll-reveal-text → dodaje .is-lit */
  function initScrollColor() {
    var els = document.querySelectorAll('.scroll-reveal-text');
    if (!els.length) return;
    if (reduceMotion) {
      els.forEach(function (el) { el.classList.add('is-lit'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-lit');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ─── 2. Word reveal (Team: "love the law / take action") ──
     Splituje tekst na <span> per słowo, stagger reveal.
     Klasa: .word-reveal → dzieci <span> animowane */
  function initWordReveal() {
    var els = document.querySelectorAll('.word-reveal');
    if (!els.length) return;

    els.forEach(function (el) {
      /* Split na słowa jeśli nie ma jeszcze <span> */
      if (!el.querySelector('span')) {
        var words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        words.forEach(function (word, i) {
          var span = document.createElement('span');
          span.textContent = word;
          span.style.transitionDelay = (i * 0.06) + 's';
          el.appendChild(span);
          if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        });
      }
    });

    if (reduceMotion) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ─── 3. Section fade reveal ───────────────────────────────
     Sekcje wjeżdżają: opacity 0→1 + translateY.
     Klasa: .reveal-fade → dodaje .is-visible */
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
          /* rAF — gwarantuje że CSS złapie stan startowy przed transition */
          requestAnimationFrame(function () {
            entry.target.classList.add('is-visible');
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ─── 4. Stagger list ──────────────────────────────────────
     Dzieci kontenera wjeżdżają z opóźnieniem.
     Klasa: .stagger-list → dzieci dostają .is-visible sekwencyjnie */
  function initStaggerList() {
    var lists = document.querySelectorAll('.stagger-list');
    if (!lists.length) return;

    lists.forEach(function (list) {
      var children = Array.prototype.slice.call(list.children);
      if (reduceMotion) {
        children.forEach(function (c) { c.classList.add('is-visible'); });
        return;
      }
      children.forEach(function (c, i) {
        c.style.transitionDelay = (i * 0.08) + 's';
      });
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            children.forEach(function (c) { c.classList.add('is-visible'); });
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      obs.observe(list);
    });
  }

  /* ─── 5. Counter (10+, 30+) ────────────────────────────────
     Liczba animuje od 0 do data-target.
     Klasa: .count-up data-target="30" data-suffix="+" */
  function initCounters() {
    var els = document.querySelectorAll('.count-up');
    if (!els.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var dur = 1200, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);  /* easeOutCubic */
        el.textContent = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ─── 6. Partner panel (CLOSE X) ───────────────────────────
     Klik na .partner-trigger otwiera .partner-panel z danymi.
     Wymaga: data-partner na triggerze + #panel-{id} w DOM */
  function initPartnerPanel() {
    var triggers = document.querySelectorAll('.partner-trigger');
    if (!triggers.length) return;
    var lastFocused = null;

    function openPanel(id) {
      var panel = document.getElementById('panel-' + id);
      if (!panel) return;
      lastFocused = document.activeElement;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      var closeBtn = panel.querySelector('.partner-panel-close');
      if (closeBtn) closeBtn.focus();
      document.addEventListener('keydown', onEsc);
    }
    function closePanel(panel) {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onEsc);
      if (lastFocused) lastFocused.focus();
    }
    function onEsc(e) {
      if (e.key === 'Escape') {
        var open = document.querySelector('.partner-panel.is-open');
        if (open) closePanel(open);
      }
    }

    triggers.forEach(function (t) {
      t.addEventListener('click', function () {
        openPanel(t.getAttribute('data-partner'));
      });
    });
    document.querySelectorAll('.partner-panel-close').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.closest('.partner-panel');
        if (panel) closePanel(panel);
      });
    });
  }

  /* ─── 7. Mobile nav overlay ────────────────────────────────
     Klik #menu-toggle → #mobile-menu fade overlay (01-05) */
  function initMobileNav() {
    var toggle = document.getElementById('menu-toggle');
    var close = document.getElementById('menu-close');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    var lastFocused = null;

    function open() {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
      lastFocused = document.activeElement;
      if (close) close.focus();
      document.addEventListener('keydown', onKey);
    }
    function closeMenu() {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
      if (lastFocused) lastFocused.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') closeMenu();
    }

    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ─── 8. Contact form (honeypot + walidacja) ───────────────
     Klasa: #contact-form z polami name/email/message + honeypot */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      /* honeypot — bot wypełnił ukryte pole */
      var hp = form.querySelector('[name="_hp"]');
      if (hp && hp.value) return;

      var success = document.getElementById('form-success');
      /* tu podłącz prawdziwy fetch() do backendu / Netlify Forms */
      if (success) {
        success.classList.add('is-visible');
        success.focus();
      }
      form.reset();
    });
  }

  /* ─── Practice — scroll-driven SCRUB z lerp (desktop) / taby (mobile) ─── */
  function initPracticeFlip() {
    var outer  = document.querySelector('.practice-scroll-outer');
    var tabs   = document.querySelectorAll('.practice-tab');
    var cards  = document.querySelectorAll('.practice-flip-card');
    var photos = document.querySelectorAll('.practice-flip-photo');
    var dots   = document.querySelectorAll('.practice-flip-dots span');
    if (!tabs.length) return;

    var TOTAL    = cards.length;   // 4
    var SEAM     = 0.22;           // fraction of 1 segment used per seam edge
    var LERP     = 0.09;           // inertia — wyżej = szybszy chase, niżej = więcej masy

    /* ─── Easing ─────────────────────────────────────────────── */
    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /* ─── Stan pojedynczej karty dla vp = 0..TOTAL ───────────── */
    var DRIFT      = 24;   /* px — karta wchodzi z dołu, wychodzi do góry */
    var DRIFT_PHOTO = 12;  /* px — zdjęcie dryfuje mniej */

    function stateOf(i, vp) {
      var start = i;
      var end   = i + 1;

      /* Opacity — crossfade przez granicę seamu */
      var CROSS   = 0.16;
      var fadeIn  = (i === 0)         ? 1 : Math.min(1, Math.max(0, (vp - start) / CROSS + 0.5));
      var fadeOut = (i === TOTAL - 1) ? 1 : Math.min(1, Math.max(0, (end - vp)   / CROSS + 0.5));
      var opacity = Math.min(fadeIn, fadeOut);

      /* Translate — wejście z dołu, wyjście ku górze */
      var enterEnd  = start + SEAM;
      var exitStart = end   - SEAM;
      var translate;

      if (vp <= start) {
        translate = i === 0 ? 0 : DRIFT;
      } else if (vp >= end) {
        translate = i === TOTAL - 1 ? 0 : -DRIFT;
      } else if (vp < enterEnd) {
        translate = DRIFT * (1 - easeInOut((vp - start) / SEAM));
      } else if (vp > exitStart) {
        translate = -DRIFT * easeInOut((vp - exitStart) / SEAM);
      } else {
        translate = 0;
      }

      return { opacity: opacity, translate: translate };
    }

    /* ─── Mobile / reduced-motion: stary toggle, stabilny ───── */
    function showTab(idx) {
      tabs.forEach(function (t, i)  { t.classList.toggle('is-active', i === idx); });
      cards.forEach(function (c, i) { c.classList.toggle('is-active', i === idx); });
      photos.forEach(function (p, i){ p.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i)  { d.classList.toggle('is-active', i === idx); });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        if (!outer || window.matchMedia('(max-width: 768px)').matches || reduceMotion) {
          showTab(i); return;
        }
        /* Desktop: płynny scroll do środka segmentu karty */
        var rect      = outer.getBoundingClientRect();
        var available = rect.height - window.innerHeight;
        var targetP   = (i + 0.5) / TOTAL;
        var targetY   = window.scrollY + rect.top + targetP * available;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });

    if (!outer || window.matchMedia('(max-width: 768px)').matches || reduceMotion) return;

    /* ─── Desktop scrub z lerp ─────────────────────────────── */

    /* Wyłącz CSS transition — JS jest jedynym sterownikiem */
    cards.forEach(function (c)  { c.style.transition = 'none'; });
    photos.forEach(function (p) { p.style.transition = 'none'; });

    var currentVP  = 0;   /* visual position (lerped), 0..TOTAL */
    var targetVP   = 0;
    var rafId      = null;
    var navEl      = document.querySelector('.practice-tabs-nav');
    var indicator  = navEl ? navEl.querySelector('.practice-tab-indicator') : null;
    var lastActive = -1;

    function render(vp) {
      var active = Math.min(TOTAL - 1, Math.max(0, Math.round(vp - 0.5)));

      /* PHOTOS — continuous crossfade, unchanged */
      photos.forEach(function (photo, i) {
        var s = stateOf(i, vp);
        var pt = s.translate * (DRIFT_PHOTO / DRIFT);
        photo.style.transform = pt === 0 ? 'none' : 'translateY(' + pt + 'px)';
        photo.style.opacity   = s.opacity;
      });

      /* CARDS (text) — Option D: discrete switch, never two texts simultaneously */
      cards.forEach(function (card, i) {
        card.style.opacity   = (i === active) ? 1 : 0;
        card.style.transform = (i === active) ? 'none' : 'translateY(24px)';
      });

      /* Tabs + dots */
      tabs.forEach(function (t, i) { t.classList.toggle('is-active', i === active); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === active); });

      /* Traveling indicator — aktualizuj tylko przy zmianie aktywnego taba */
      if (indicator && active !== lastActive) {
        lastActive = active;
        var t = tabs[active];
        indicator.style.left  = t.offsetLeft  + 'px';
        indicator.style.width = t.offsetWidth + 'px';
      }
    }

    function tick() {
      currentVP += (targetVP - currentVP) * LERP;
      render(currentVP);

      if (Math.abs(targetVP - currentVP) > 0.0004) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentVP = targetVP;
        render(currentVP);
        rafId = null;
      }
    }

    var snapTimer = null;

    function snapNearest() {
      if (targetVP <= 0 || targetVP >= TOTAL) return;
      var frac = targetVP - Math.floor(targetVP);
      if (frac > SEAM && frac < 1 - SEAM) return;   /* na plateau — nic */
      var snapTarget = frac < 0.5
        ? Math.floor(targetVP) + 0.5
        : Math.ceil(targetVP)  + 0.5;
      targetVP = snapTarget;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function onScroll() {
      var rect      = outer.getBoundingClientRect();
      var scrolled  = -rect.top;
      var available = rect.height - window.innerHeight;
      var progress  = Math.max(0, Math.min(1, scrolled / available));
      targetVP = progress * TOTAL;

      if (!rafId) rafId = requestAnimationFrame(tick);
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapNearest, 150);

      // cloak: ukryj sticky zanim się przyczepi
      var isStuck = outer.getBoundingClientRect().top <= 81;
      outer.querySelector('.practice-tabs-section').style.opacity = isStuck ? '' : '0';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* stan początkowy */
  }

  /* ─── Mega-słowa grow-on-scroll (nić sygnatur rozdziałów) ─────
     Każdy .mega-grow rośnie i blaknie gdy jego sekcja przewija przez
     viewport. Wspólny gest dla: Team „ZESPÓŁ", About „ZAUFANIE",
     Recognition „UZNANIE", Press „PRASA".
     data-mega-max = górny pułap opacity (1 dla focal Team, ~0.08 dla
     subtelnych watermarków na czarnych sekcjach). */
  function initMegaGrow() {
    var els = document.querySelectorAll('.mega-grow');
    if (!els.length || reduceMotion) return;

    els.forEach(function (el) {
      var section = el.closest('section');
      if (!section) return;
      var maxOp = parseFloat(el.getAttribute('data-mega-max'));
      if (isNaN(maxOp)) maxOp = 1;
      var ticking = false;

      function update() {
        var rect = section.getBoundingClientRect();
        var progress = clamp01(-rect.top / (rect.height * 0.6));
        el.style.transform = 'scale(' + (1 + progress * 1.5) + ')';
        el.style.opacity   = maxOp * (1 - progress * 0.6);
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      window.addEventListener('resize', function () {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });

      update();
    });
  }

  /* ─── Hero scroll — jeden zsynchronizowany system ─────────────
     Jeden progress steruje wszystkimi elementami hero razem. */
  function initHeroScroll() {
    var hero      = document.querySelector('.hero-editorial');
    var video     = document.querySelector('.hero-video');
    var statement = document.querySelector('.hero-statement');
    var wordmark  = document.querySelector('.hero-wordmark');
    var cta       = document.querySelector('.hero-cta');
    if (!hero) return;
    if (reduceMotion) return;

    var ticking = false;

    function update() {
      var rect = hero.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.8)));

      /* VIDEO: wjeżdża na pierwszy plan — rośnie i opada */
      if (video) {
        var scale = 1 + p * 0.6;
        var drop  = p * 80;
        video.style.transform = 'scale(' + scale + ') translateY(' + drop + 'px)';
      }

      /* #5 WYJŚCIE = scrub-fade, z martwą strefą [0, 0.12] tak by NIE
         nakładał się na wejście (color-reveal). Sekwencyjnie: kolor
         rozjaśnia na wejściu → strefa spoczynku → dopiero potem fade-out. */
      var exitP = clamp01((p - 0.12) / (0.50 - 0.12));
      if (statement) {
        statement.style.opacity   = 1 - exitP;
        statement.style.transform = 'translateY(' + (exitP * -30) + 'px)';
      }
      if (cta) {
        cta.style.opacity = 1 - exitP;
      }

      /* WORDMARK: rośnie przez cały scroll, znika razem z tekstem (faza wyjścia) */
      var wmScale   = 1 + p * 1.5;
      var wmOpacity = 1 - exitP;
      if (wordmark) {
        wordmark.style.transform = 'scale(' + wmScale + ')';
        wordmark.style.opacity   = wmOpacity;
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    update();
  }

  /* ─── #4 + #2 Team curtain — wejście i lustrzane wyjście ──────
     Jedna funkcja, jeden clip-path łączący obie fazy (brak konfliktu
     dwóch listenerów na tym samym elemencie):
       • WEJŚCIE (#4, Practices→Team): biel odsłania się od dołu w górę
         (inset bottom: 100%→0%) gdy sekcja wjeżdża.
       • WYJŚCIE (#2, Team→Recognition): czerń (tło body) wsuwa się NAD
         biel od góry (inset top: 0%→100%) gdy sekcja wyjeżdża — lustro #4. */
  function initTeamReveal() {
    if (!ENABLE_TEAM_REVEAL) return;
    if (reduceMotion) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    var teamSection = document.querySelector('.section-white');
    if (!teamSection) return;
    var teamInner = teamSection.querySelector(':scope > .container');

    var ticking = false;

    function update() {
      var rect = teamSection.getBoundingClientRect();
      var vh   = window.innerHeight;

      /* Obie fazy klipują tę samą krawędź dolną (inset bottom) — tylko ona
         jest widoczna przy wejściu (góra strzela w dół) i przy wyjściu
         (dół = szew, tu widać pasek bieli). Jeden parametr, brak konfliktu. */
      var enter = clamp01((vh * 0.85 - rect.top)    / (vh * 0.70));  /* 0→1 wjazd */
      var exit  = clamp01((vh * 0.85 - rect.bottom) / (vh * 0.70));  /* 0→1 wyjazd */

      /* 100 (ukryte) → 0 (pełna biel) → 100 (czerń wsuwa się od szwu w górę) */
      var bottomClip = Math.min(100, (1 - enter) * 100 + exit * 100);

      teamSection.style.clipPath = 'inset(0 0 ' + bottomClip + '% 0)';
      if (teamInner) teamInner.style.transform =
        'translateY(' + ((1 - enter) * 40) + 'px)';

      ticking = false;
    }

    function onScroll() {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ─── #1 Contact climax — niebieski wzbiera od dołu ──────────
     Czarny overlay (.contact-rise) cofa się od dołu gdy #contact
     wchodzi w viewport → blue gradient „wzbiera". Mirror dla #2. */
  function initContactClimax() {
    if (!ENABLE_CONTACT_CLIMAX) return;
    if (reduceMotion) return;
    var section = document.getElementById('contact');
    var overlay = section && section.querySelector('.contact-rise');
    if (!section || !overlay) return;

    var ticking = false;

    function update() {
      var rect = section.getBoundingClientRect();
      var vh   = window.innerHeight;
      /* progress 0→1 gdy top sekcji wjeżdża z 0.9vh do 0.3vh */
      var progress = clamp01((vh * 0.9 - rect.top) / (vh * 0.6));
      /* overlay klipowany od dołu: inset bottom rośnie → blue od dołu w górę */
      overlay.style.clipPath = 'inset(0 0 ' + (progress * 100) + '% 0)';
      ticking = false;
    }

    function onScroll() {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ─── #9 Chapter indicator — podświetla aktywny rozdział ─────
     Sprzężony ze scrollem. Recognition i Press dzielą rozdział 04
     („Aktualności"), zgodnie z numeracją nawigacji. */
  function initChapterNav() {
    if (!ENABLE_CHAPTER_NAV) return;
    var nav = document.querySelector('.chapter-nav');
    if (!nav) return;
    if (window.matchMedia('(max-width: 1100px)').matches) return;

    var map = [
      ['#about', 0], ['#practices', 1], ['#team', 2],
      ['#recognition', 3], ['#press', 3], ['#contact', 4]
    ];
    var sections = map
      .map(function (m) { return { el: document.querySelector(m[0]), ch: m[1] }; })
      .filter(function (s) { return s.el; });
    var links = nav.querySelectorAll('[data-chapter]');
    if (!sections.length || !links.length) return;

    var ticking = false, current = -1;

    function setActive(ch) {
      if (ch === current) return;
      current = ch;
      links.forEach(function (l) {
        l.classList.toggle('is-active', parseInt(l.getAttribute('data-chapter'), 10) === ch);
      });
    }

    function update() {
      var line = window.innerHeight * 0.4;
      var ch = 0;
      sections.forEach(function (s) {
        if (s.el.getBoundingClientRect().top <= line) ch = s.ch;
      });
      setActive(ch);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    update();
  }

  /* ─── Hero video fade-in — pojawia się gdy dane załadowane ─── */
  function initHeroVideoFade() {
    var vid = document.querySelector('.hero-video video');
    if (!vid) return;
    if (vid.readyState >= 3) {
      vid.style.opacity = '1';
      return;
    }
    vid.addEventListener('loadeddata', function () {
      vid.style.opacity = '1';
    }, { once: true });
  }

  /* ─── Init wszystkie ───────────────────────────────────────  */
  function init() {
    initHeroVideoFade();
    initScrollColor();
    initWordReveal();
    initFadeReveal();
    initStaggerList();
    initCounters();
    initPartnerPanel();
    initMobileNav();
    initContactForm();
    initPracticeFlip();
    initMegaGrow();
    initHeroScroll();
    initTeamReveal();
    initContactClimax();
    initChapterNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
