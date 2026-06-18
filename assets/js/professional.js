document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.pro-dropdown');

    dropdowns.forEach(function (dropdown) {
        const btn = dropdown.querySelector('.pro-dropdown__btn');
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('is-open');
            dropdowns.forEach(function (d) { d.classList.remove('is-open'); });
            if (!isOpen) dropdown.classList.add('is-open');
            btn.setAttribute('aria-expanded', String(!isOpen));
        });
    });

    document.addEventListener('click', function () {
        dropdowns.forEach(function (d) {
            d.classList.remove('is-open');
            const btn = d.querySelector('.pro-dropdown__btn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    });
});
