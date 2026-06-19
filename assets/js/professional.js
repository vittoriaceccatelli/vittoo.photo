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
    addSR('.pro-panel');
    addSR('.pro-entry',              function (i) { return (i % 6) * 55; });
    addSR('.pro-card',               function (i) { return i * 80; });
    addSR('.pipeline__step',         function (i) { return i * 65; });
    addSR('.pro-skills-col',         function (i) { return i * 50; });
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

    // ── 1. Text scramble on h1 ──────────────────────────────────────
    const h1 = document.querySelector('.pro-intro h1');
    if (h1) {
        const finalText = h1.textContent;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—∙';
        const duration = 1100;
        // Each character resolves at a staggered random time
        const resolveAt = finalText.split('').map(function (ch, i) {
            if (ch === ' ') return 0;
            return (i / finalText.length) * duration * 0.7 + Math.random() * duration * 0.4;
        });
        let start = null;

        function scrambleTick(ts) {
            if (!start) start = ts;
            const elapsed = ts - start;
            h1.textContent = finalText.split('').map(function (ch, i) {
                if (ch === ' ') return ' ';
                if (elapsed >= resolveAt[i]) return ch;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            if (elapsed < duration) {
                requestAnimationFrame(scrambleTick);
            } else {
                h1.textContent = finalText;
            }
        }

        setTimeout(function () { requestAnimationFrame(scrambleTick); }, 100);
    }

    // ── 3. Section dot navigation ───────────────────────────────────
    const sections = Array.from(document.querySelectorAll('.pro-section, .pro-panel, .pro-tl-section')).filter(function (s) {
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
                }
            });
        }, { threshold: 0.2 });

        sections.forEach(function (s) { dotObserver.observe(s); });
    }

});
