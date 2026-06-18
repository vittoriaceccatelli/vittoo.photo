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
    addSR('.pro-entry',        function (i) { return (i % 6) * 55; });
    addSR('.pro-card',         function (i) { return i * 80; });
    addSR('.pipeline__step',   function (i) { return i * 65; });
    addSR('.skill-group',      function (i) { return i * 50; });
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

    srTargets.forEach(function (el) { revealObserver.observe(el); });

    // ── Count-up animation for stat numbers ─────────────────────────
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

});
