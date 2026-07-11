document.addEventListener('DOMContentLoaded', function () {

    // ── Click-to-expand panels (works on touch, trackpad, mouse) ──
    var panels = document.querySelectorAll('.panel--vittoria, .panel--personal');

    panels.forEach(function (panel) {
        panel.addEventListener('click', function (e) {
            if (e.target.closest('a')) return; // let the link navigate

            var wasExpanded = panel.classList.contains('is-expanded');
            panels.forEach(function (p) { p.classList.remove('is-expanded'); });
            if (!wasExpanded) panel.classList.add('is-expanded');
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.panel--vittoria, .panel--personal')) {
            panels.forEach(function (p) { p.classList.remove('is-expanded'); });
        }
    });
});
