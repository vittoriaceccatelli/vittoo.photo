document.addEventListener('DOMContentLoaded', function () {

    // ── Header glass ──────────────────────────────────────────
    var header = document.querySelector('.g-header');
    window.addEventListener('scroll', function () {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });

    // ── Filter ───────────────────────────────────────────────
    var filters = document.querySelectorAll('.g-filter');
    var items   = Array.from(document.querySelectorAll('.g-item'));
    var active  = 'all';

    filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
            active = btn.dataset.filter;
            filters.forEach(function (b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');

            items.forEach(function (item) {
                var match = active === 'all' || item.dataset.collection === active;
                item.classList.toggle('is-hidden', !match);
            });
        });
    });

    // ── Lightbox ─────────────────────────────────────────────
    var lb        = document.getElementById('lightbox');
    var lbImg     = document.getElementById('lb-img');
    var lbTitle   = document.getElementById('lb-title');
    var lbLoc     = document.getElementById('lb-location');
    var lbExif    = document.getElementById('lb-exif');
    var lbClose   = document.getElementById('lb-close');
    var lbPrev    = document.getElementById('lb-prev');
    var lbNext    = document.getElementById('lb-next');
    var current   = -1;

    function visibleItems() {
        return items.filter(function (i) { return !i.classList.contains('is-hidden'); });
    }

    function openAt(idx) {
        var vis = visibleItems();
        if (idx < 0 || idx >= vis.length) return;
        current = idx;
        var el  = vis[idx];
        var img = el.querySelector('img');

        lbImg.src       = img.src;
        lbImg.alt       = el.dataset.title || '';
        lbTitle.textContent   = el.dataset.title   || '';
        lbLoc.textContent     = (el.dataset.location || '') + (el.dataset.date ? ' · ' + el.dataset.date : '');

        var exifParts = [];
        if (el.dataset.camera)  exifParts.push(el.dataset.camera);
        if (el.dataset.aperture) exifParts.push(el.dataset.aperture);
        if (el.dataset.shutter)  exifParts.push(el.dataset.shutter);
        if (el.dataset.iso)      exifParts.push(el.dataset.iso);
        lbExif.textContent = exifParts.join('  ·  ');

        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        current = -1;
    }

    items.forEach(function (item, i) {
        item.addEventListener('click', function () {
            var vis = visibleItems();
            openAt(vis.indexOf(item));
        });
    });

    lbClose.addEventListener('click', close);

    lbPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        openAt(current - 1);
    });

    lbNext.addEventListener('click', function (e) {
        e.stopPropagation();
        openAt(current + 1);
    });

    lb.addEventListener('click', function (e) {
        if (e.target === lb) close();
    });

    document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape')      close();
        if (e.key === 'ArrowLeft')   openAt(current - 1);
        if (e.key === 'ArrowRight')  openAt(current + 1);
    });

});
