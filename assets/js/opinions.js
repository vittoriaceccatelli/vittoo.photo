document.addEventListener('DOMContentLoaded', function () {

    // ── Header ───────────────────────────────────────────────
    var header = document.getElementById('op-header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('is-scrolled', window.scrollY > 10);
        }, { passive: true });
    }

    // ── Hamburger menu ───────────────────────────────────────
    var burger = document.getElementById('op-burger');
    var mobileNav = document.getElementById('op-nav');
    if (burger && mobileNav) {
        burger.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = burger.classList.toggle('is-open');
            mobileNav.classList.toggle('is-open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        });
        document.addEventListener('click', function (e) {
            if (mobileNav.classList.contains('is-open') && !mobileNav.contains(e.target) && e.target !== burger) {
                burger.classList.remove('is-open');
                mobileNav.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        });
    }

    // ── Dropdown click (mobile) ──────────────────────────────
    document.querySelectorAll('.op-dropdown__btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
                var dropdown = btn.closest('.op-dropdown');
                var wasOpen = dropdown.classList.contains('is-open');
                document.querySelectorAll('.op-dropdown').forEach(function (d) { d.classList.remove('is-open'); });
                if (!wasOpen) dropdown.classList.add('is-open');
            }
        });
    });

    // ── Lightbox ─────────────────────────────────────────────
    var lb      = document.getElementById('op-lightbox');
    var lbCover = document.getElementById('op-lb-cover');
    var lbImg   = document.getElementById('op-lb-img');
    var lbTitle = document.getElementById('op-lb-title');
    var lbMeta  = document.getElementById('op-lb-meta');
    var lbText  = document.getElementById('op-lb-commentary');
    var lbClose = document.getElementById('op-lb-close');

    function openLb(el) {
        var img = el.querySelector('img');
        if (img && img.src && img.src !== window.location.href) {
            lbImg.src = img.src;
            lbImg.alt = img.alt || '';
            lbImg.style.display = '';
        } else {
            lbImg.style.display = 'none';
        }
        var titleEl = el.querySelector('.op-item__title');
        var metaEl  = el.querySelector('.op-item__meta');
        var noteEl  = el.querySelector('.op-item__note');
        lbTitle.textContent = titleEl ? titleEl.textContent : '';
        lbMeta.textContent  = metaEl  ? metaEl.textContent  : '';
        lbText.textContent  = el.dataset.commentary || (noteEl ? noteEl.textContent : '');
        lb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeLb() {
        lb.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    var items = document.querySelectorAll('.op-item');

    items.forEach(function (item) {
        item.addEventListener('click', function () {
            openLb(item);
        });
    });

    if (lbClose) lbClose.addEventListener('click', closeLb);

    lb.addEventListener('click', function (e) {
        if (e.target === lb) closeLb();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLb();
    });

});
