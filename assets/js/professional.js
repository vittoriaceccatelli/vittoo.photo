document.addEventListener('DOMContentLoaded', function () {

    // ── Dropdown ────────────────────────────────────────────────────
    const dropdowns = document.querySelectorAll('.pro-dropdown');

    dropdowns.forEach(function (dropdown) {
        const btn = dropdown.querySelector('.pro-dropdown__btn');
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('is-open');
            dropdowns.forEach(function (d) {
                d.classList.remove('is-open');
                const b = d.querySelector('.pro-dropdown__btn');
                if (b) b.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                dropdown.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    document.addEventListener('click', function () {
        dropdowns.forEach(function (d) {
            d.classList.remove('is-open');
            const b = d.querySelector('.pro-dropdown__btn');
            if (b) b.setAttribute('aria-expanded', 'false');
        });
    });

    // ── Header glass on scroll ──────────────────────────────────────
    const header = document.querySelector('.pro-header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('is-scrolled', window.scrollY > 24);
        }, { passive: true });
    }

    // ── Scroll reveal ───────────────────────────────────────────────
    const srTargets = [];

    function addSR(selector, delayFn) {
        document.querySelectorAll(selector).forEach(function (el, i) {
            el.classList.add('sr');
            if (delayFn) el.style.transitionDelay = delayFn(i) + 'ms';
            srTargets.push(el);
        });
    }

    addSR('.pro-section');
    addSR('.pro-entry',              function (i) { return (i % 6) * 55; });
    addSR('.pro-card',               function (i) { return i * 80; });
    addSR('.pipeline__step',         function (i) { return i * 65; });
    addSR('.vtl-entry',              function (i) { return i * 50; });
    addSR('.pro-skill-row',          function (i) { return i * 40; });
    addSR('.pro-figure');
    addSR('.thesis-stats');

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('sr--visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });

    srTargets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add('sr--visible');  // already in viewport on load
        } else {
            revealObserver.observe(el);       // off-screen: reveal on scroll
        }
    });

    // ── Count-up animation ──────────────────────────────────────────
    function animateNum(el) {
        const raw = el.textContent.trim();
        const isPercent = raw.endsWith('%');
        const hasDecimal = raw.includes('.');
        const target = parseFloat(raw);
        if (isNaN(target)) return;

        const duration = 900;
        const interval = 16;
        const steps = Math.round(duration / interval);
        let frame = 0;

        const timer = setInterval(function () {
            frame++;
            const progress = 1 - Math.pow(1 - frame / steps, 3);
            const val = target * progress;
            el.textContent = (hasDecimal ? val.toFixed(1) : Math.floor(val)) + (isPercent ? '%' : '');
            if (frame >= steps) {
                el.textContent = (hasDecimal ? target.toFixed(1) : target) + (isPercent ? '%' : '');
                clearInterval(timer);
            }
        }, interval);
    }

    const statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.thesis-stat__num').forEach(animateNum);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.thesis-stats').forEach(function (el) {
        statObserver.observe(el);
    });

    // ── 1. Text scramble on name spans ─────────────────────────────
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—∙';

    function scrambleSpan(el, delay) {
        var finalText = el.textContent.trim();
        var duration = 900;
        var resolveAt = finalText.split('').map(function (ch, i) {
            return (i / finalText.length) * duration * 0.65 + Math.random() * duration * 0.4;
        });
        var start = null;

        function tick(ts) {
            if (!start) start = ts;
            var elapsed = ts - start;
            el.textContent = finalText.split('').map(function (ch, i) {
                if (elapsed >= resolveAt[i]) return ch;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            if (elapsed < duration) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = finalText;
            }
        }

        setTimeout(function () { requestAnimationFrame(tick); }, delay);
    }

    document.querySelectorAll('.pro-about__name span').forEach(function (span, i) {
        scrambleSpan(span, 80 + i * 260);
    });

    // ── 2. Timeline scroll dot ──────────────────────────────────────
    var tlSection = document.querySelector('.pro-tl-section');
    var vtlEl     = document.querySelector('.vtl');
    var scrollDot = document.querySelector('.vtl__scroll-dot');

    if (tlSection && vtlEl && scrollDot) {
        var targetProg  = 0;
        var currentProg = 0;
        var dotRaf      = null;

        function getScrollProgress() {
            var vtlRect     = vtlEl.getBoundingClientRect();
            var totalTravel = Math.max(1, vtlEl.offsetHeight - window.innerHeight);
            var scrolled    = -(vtlRect.top - 80);
            return Math.max(0, Math.min(1, scrolled / totalTravel));
        }

        var spine = document.querySelector('.vtl__spine');

        function animateDot() {
            var dist = targetProg - currentProg;
            currentProg += dist * 0.012; // low factor = heavy lag
            var pct = (currentProg * 100).toFixed(2) + '%';
            scrollDot.style.top = pct;
            if (spine) spine.style.setProperty('--dot-pct', pct);
            if (Math.abs(dist) > 0.0002) {
                dotRaf = requestAnimationFrame(animateDot);
            } else {
                currentProg = targetProg;
                dotRaf = null;
            }
        }

        window.addEventListener('scroll', function () {
            targetProg = getScrollProgress();
            if (!dotRaf) dotRaf = requestAnimationFrame(animateDot);
        }, { passive: true });

        targetProg  = getScrollProgress();
        currentProg = targetProg;
        var initPct = (currentProg * 100).toFixed(2) + '%';
        scrollDot.style.top = initPct;
        if (spine) spine.style.setProperty('--dot-pct', initPct);
    }

    // ── Card positioning: top of bar (end date), collision-resolved ──
    (function positionCards() {
        var TOTAL_M = 77;
        var GAP_PX  = 8;

        function resolve() {
            document.querySelectorAll('.vtl__col').forEach(function (col) {
                var colH    = col.offsetHeight;
                if (!colH) return;

                var entries = Array.from(col.querySelectorAll('.vtl-entry'));

                // Reset all cards so heights are accurate
                entries.forEach(function (el) {
                    var card = el.querySelector('.vtl-entry__card');
                    if (card) card.style.top = '0px';
                });

                var items = entries.map(function (el) {
                    var st       = el.getAttribute('style') || '';
                    var topM     = st.match(/top:\s*([\d.]+)%/);
                    var durM_m   = st.match(/--dur-m:\s*(\d+)/);
                    var startPct = topM   ? parseFloat(topM[1])   : 0;
                    var durM     = durM_m ? parseInt(durM_m[1], 10) : 0;
                    // end date is above start date on the spine
                    var midPct   = startPct - (durM / 2 / TOTAL_M * 100);
                    var card     = el.querySelector('.vtl-entry__card');
                    var override = el.dataset.cardPct;
                    var idealPx  = override
                        ? parseFloat(override) / 100 * colH
                        : Math.max(0, midPct / 100 * colH);
                    return {
                        card:     card,
                        idealPx:  idealPx,
                        entryPx:  el.offsetTop,
                        cardH:    card ? card.offsetHeight : 0
                    };
                }).sort(function (a, b) { return a.idealPx - b.idealPx; });

                var floor = 0;
                items.forEach(function (it) {
                    var colPos = Math.max(it.idealPx - it.cardH / 2, floor);
                    if (it.card) it.card.style.top = (colPos - it.entryPx) + 'px';
                    floor = colPos + it.cardH + GAP_PX;
                });
            });
        }

        requestAnimationFrame(function () { requestAnimationFrame(resolve); });
    }());

    // ── Month ticks on spine ─────────────────────────────────────────
    (function buildMonthTicks() {
        var spine = document.querySelector('.vtl__spine');
        if (!spine) return;
        var yearSpans = Array.from(spine.querySelectorAll('span'));
        if (yearSpans.length < 2) return;

        var spineTop = spine.getBoundingClientRect().top + window.scrollY;

        yearSpans.forEach(function (span, i) {
            if (i >= yearSpans.length - 1) return;
            var r1   = span.getBoundingClientRect();
            var r2   = yearSpans[i + 1].getBoundingClientRect();
            var topY = (r1.top + window.scrollY + r1.height / 2) - spineTop;
            var botY = (r2.top + window.scrollY + r2.height / 2) - spineTop;
            var gap  = botY - topY;
            for (var m = 1; m <= 11; m++) {
                var tick = document.createElement('div');
                tick.className = 'vtl__month-tick';
                tick.style.top = (topY + (m / 12) * gap) + 'px';
                spine.appendChild(tick);
            }
        });
    }());

    // ── 3. Section dot navigation ───────────────────────────────────
    const sections = Array.from(document.querySelectorAll('.pro-about, .pro-tl-section, .pro-skills-section, .pro-projects-section')).filter(function (s) {
        return s.dataset.label || s.querySelector('h2');
    });

    if (sections.length >= 3) {
        const dotNav = document.createElement('nav');
        dotNav.className = 'section-dots';
        dotNav.setAttribute('aria-label', 'Page sections');

        sections.forEach(function (s) {
            const label = s.dataset.label
                || (s.querySelector('h2') || s.querySelector('.pro-panel__title') || {textContent: ''}).textContent.trim();
            const dot = document.createElement('button');
            dot.className = 'section-dot';
            dot.title = label;
            dot.setAttribute('aria-label', label);
            dot.addEventListener('click', function () {
                s.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            dotNav.appendChild(dot);
        });

        document.body.appendChild(dotNav);

        const dots = Array.from(dotNav.querySelectorAll('.section-dot'));

        const dotObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const idx = sections.indexOf(entry.target);
                    dots.forEach(function (d) { d.classList.remove('is-active'); });
                    if (idx >= 0) dots[idx].classList.add('is-active');
                    dotNav.classList.add('is-dark');
                }
            });
        }, { threshold: 0.2 });

        sections.forEach(function (s) { dotObserver.observe(s); });
    }

});
