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
                var cols = (item.dataset.collection || '').split(' ');
                var match = active === 'all' || cols.indexOf(active) !== -1;
                item.classList.toggle('is-hidden', !match);
            });
        });
    });

    // ── Lightbox ─────────────────────────────────────────────
    var lb      = document.getElementById('lightbox');
    var lbImg   = document.getElementById('lb-img');
    var lbTitle = document.getElementById('lb-title');
    var lbLoc   = document.getElementById('lb-location');
    var lbExif  = document.getElementById('lb-exif');
    var lbClose = document.getElementById('lb-close');
    var lbPrev  = document.getElementById('lb-prev');
    var lbNext  = document.getElementById('lb-next');
    var current = -1;

    var panelMode    = false;
    var panelItems   = [];
    var panelCurrent = -1;

    function visibleItems() {
        return items.filter(function (i) { return !i.classList.contains('is-hidden'); });
    }

    function fillLb(el) {
        var img = el.querySelector('img');
        lbImg.src           = img.src;
        lbImg.alt           = el.dataset.title || '';
        lbTitle.textContent = el.dataset.title || '';
        lbLoc.textContent   = (el.dataset.location || '') + (el.dataset.date ? ' · ' + el.dataset.date : '');
        var parts = [];
        if (el.dataset.camera)   parts.push(el.dataset.camera);
        if (el.dataset.aperture) parts.push(el.dataset.aperture);
        if (el.dataset.shutter)  parts.push(el.dataset.shutter);
        if (el.dataset.iso)      parts.push(el.dataset.iso);
        lbExif.textContent = parts.join('  ·  ');
    }

    function openAt(idx) {
        var vis = visibleItems();
        if (idx < 0 || idx >= vis.length) return;
        current = idx;
        fillLb(vis[idx]);
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function openPanelAt(idx) {
        if (idx < 0 || idx >= panelItems.length) return;
        panelMode    = true;
        panelCurrent = idx;
        fillLb(panelItems[idx]);
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        panelMode    = false;
        current      = -1;
        panelCurrent = -1;
        var mo = document.getElementById('map-overlay');
        if (!mo || !mo.classList.contains('is-open')) {
            document.body.style.overflow = '';
        }
    }

    items.forEach(function (item) {
        item.addEventListener('click', function () {
            var vis = visibleItems();
            openAt(vis.indexOf(item));
        });
    });

    lbClose.addEventListener('click', close);

    lbPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        if (panelMode) openPanelAt(panelCurrent - 1);
        else           openAt(current - 1);
    });

    lbNext.addEventListener('click', function (e) {
        e.stopPropagation();
        if (panelMode) openPanelAt(panelCurrent + 1);
        else           openAt(current + 1);
    });

    lb.addEventListener('click', function (e) {
        if (e.target === lb) close();
    });

    document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape')     close();
        if (e.key === 'ArrowLeft')  panelMode ? openPanelAt(panelCurrent - 1) : openAt(current - 1);
        if (e.key === 'ArrowRight') panelMode ? openPanelAt(panelCurrent + 1) : openAt(current + 1);
    });

    // ── Map overlay ──────────────────────────────────────────────
    var mapOverlay    = document.getElementById('map-overlay');
    var mapToggle     = document.getElementById('map-toggle');
    var mapClose      = document.getElementById('map-close');
    var mapHint       = document.getElementById('map-hint');
    var mapPanel      = document.getElementById('map-panel');
    var mapPanelLabel = document.getElementById('map-panel-label');
    var mapPanelCount = document.getElementById('map-panel-count');
    var mapPanelGrid  = document.getElementById('map-panel-grid');
    var mapPanelClose = document.getElementById('map-panel-close');
    var mapInstance   = null;

    var photoCodes = (function () {
        var codes = {};
        items.forEach(function (item) {
            var c = (item.dataset.country || '').toUpperCase();
            if (c && c !== 'CARIBBEAN') codes[c] = true;
        });
        return codes;
    }());

    var ISO_NAMES = {
        'VN': 'Vietnam',      'KH': 'Cambodia',      'ID': 'Indonesia',
        'GB': 'United Kingdom','GR': 'Greece',        'PT': 'Portugal',
        'US': 'United States','BR': 'Brazil',         'TH': 'Thailand',
        'OM': 'Oman',         'MY': 'Malaysia',       'MA': 'Morocco',
        'ZA': 'South Africa', 'EG': 'Egypt',          'LA': 'Laos',
        'NO': 'Norway',       'CH': 'Switzerland',    'IT': 'Italy',
        'LK': 'Sri Lanka'
    };

    var PINS = {
        'Alta, Norway':                     [69.969, 23.272],
        'Bali, Indonesia':                  [-8.409, 115.189],
        'Bangkok, Thailand':                [13.756, 100.502],
        'Brazil':                           [-22.907, -43.173],
        'Caribbean Sea':                    [17.5,  -74.5],
        'Coast of Snowdonia, Wales':        [52.95,  -3.9],
        'Ella–Kandy Train, Sri Lanka': [6.87,   80.87],
        'Essaouira, Morocco':               [31.509, -9.759],
        'Flores, Indonesia':                [-8.657, 121.079],
        'Georgetown, Malaysia':             [5.414, 100.329],
        'Halong Bay, Vietnam':              [20.910, 107.184],
        'Hoi An, Vietnam':                  [15.880, 108.335],
        'Kep, Cambodia':                    [10.483, 104.317],
        'Kew Gardens, England':             [51.479,  -0.295],
        'Koh Rong Sanloem, Cambodia':       [10.599, 103.367],
        'Komodo, Indonesia':                [-8.549, 119.483],
        'Lencois Maranhenses, Brazil':      [-2.523, -43.129],
        'Lisbon, Portugal':                 [38.722,  -9.139],
        'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, Wales': [53.221, -4.205],
        'Luang Prabang, Laos':              [19.885, 102.136],
        'Millenium Bridge, London':         [51.510,  -0.099],
        'Misfat, Oman':                     [23.283,  57.517],
        'Ninh Binh, Vietnam':               [20.251, 105.974],
        'Nong Khiaw, Laos':                 [20.570, 102.610],
        'Petersfield, England':             [51.003,  -0.933],
        'Phnom Penh, Cambodia':             [11.556, 104.928],
        'Porto, Portugal':                  [41.158,  -8.629],
        'Pwllheli, Wales':                  [52.888,  -4.413],
        'Red Sea, Egypt':                   [27.2,   33.8],
        'Rhodes, Greece':                   [36.434,  28.218],
        'Richmond Park, England':           [51.442,  -0.279],
        'Sahara Desert, Morocco':           [31.0,   -4.5],
        'San Francisco, USA':               [37.775, -122.419],
        'Sapa, Vietnam':                    [22.336, 103.844],
        'Seven Sisters Cliffs, England':    [50.751,   0.174],
        'Simi, Greece':                     [36.610,  27.840],
        'South Africa':                     [-33.925, 18.424],
        'Surlej, Switzerland':              [46.467,   9.717],
        'Ubud, Indonesia':                  [-8.507, 115.262],
        'Uluwatu, Indonesia':               [-8.829, 115.088],
        'Val Ferret, Italy':                [45.867,   7.167]
    };

    // ── Animated counter ──────────────────────────────────────
    function animateCount(el, target) {
        var duration = Math.min(700, Math.max(200, target * 25));
        var start = null;
        function tick(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            // ease out cubic
            p = 1 - Math.pow(1 - p, 3);
            var val = Math.round(p * target);
            el.textContent = val + (val === 1 ? ' photo' : ' photos');
            if (p < 1) requestAnimationFrame(tick);
        }
        el.textContent = '0 photos';
        requestAnimationFrame(tick);
    }

    // ── Panel ─────────────────────────────────────────────────
    function openPanel(label, matched) {
        panelItems = matched;
        mapPanelLabel.textContent = label;
        mapHint.style.opacity = '0';
        mapHint.style.pointerEvents = 'none';

        mapPanelGrid.innerHTML = '';
        matched.forEach(function (item, idx) {
            var img = item.querySelector('img');
            var btn = document.createElement('button');
            btn.className = 'g-map-panel__thumb';
            var t = document.createElement('img');
            t.src     = img.src;
            t.alt     = item.dataset.title || img.alt || '';
            t.loading = 'eager';
            btn.appendChild(t);
            btn.addEventListener('click', function () { openPanelAt(idx); });
            mapPanelGrid.appendChild(btn);
        });

        mapPanel.classList.add('is-open');
        animateCount(mapPanelCount, matched.length);
    }

    function closePanel() {
        mapPanel.classList.remove('is-open');
        mapHint.style.opacity = '';
        mapHint.style.pointerEvents = '';
        panelItems = [];
    }

    mapPanelClose.addEventListener('click', closePanel);

    // ── Map init ──────────────────────────────────────────────
    function openMap() {
        mapOverlay.classList.add('is-open');
        mapOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (mapInstance) { mapInstance.invalidateSize(); return; }

        mapInstance = L.map('map', {
            center: [20, 10], zoom: 2, minZoom: 1, maxZoom: 6,
            zoomControl: true, attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd', maxZoom: 20
        }).addTo(mapInstance);

        // Country borders
        if (window.COUNTRIES_GEOJSON) {
            L.geoJSON(window.COUNTRIES_GEOJSON, {
                style: function (feature) {
                    var iso = (feature.properties.ISO_A2 || '').toUpperCase();
                    var has = !!photoCodes[iso];
                    return {
                        fillColor:   has ? '#d8d8d8' : 'transparent',
                        fillOpacity: has ? 0.18 : 0,
                        color:       has ? '#d8d8d8' : '#2a2a2a',
                        weight:      has ? 1.2 : 0.5,
                        opacity:     has ? 0.7 : 0.15
                    };
                },
                onEachFeature: function (feature, layer) {
                    var iso = (feature.properties.ISO_A2 || '').toUpperCase();
                    if (!photoCodes[iso]) return;
                    layer.on({
                        mouseover: function () { layer.setStyle({ fillOpacity: 0.38, weight: 2 }); },
                        mouseout:  function () { layer.setStyle({ fillOpacity: 0.18, weight: 1.2 }); },
                        click: function (e) {
                            L.DomEvent.stopPropagation(e);
                            var code = iso.toLowerCase();
                            var matched = items.filter(function (item) {
                                return item.dataset.country === code;
                            });
                            openPanel(ISO_NAMES[iso] || iso, matched);
                        }
                    });
                }
            }).addTo(mapInstance);
        }

        // Location pins
        Object.keys(PINS).forEach(function (loc) {
            var matched = items.filter(function (item) { return item.dataset.location === loc; });
            if (!matched.length) return;
            var coords = PINS[loc];
            var pin = L.circleMarker(coords, {
                radius: 4, fillColor: '#ffffff',
                color: 'rgba(255,255,255,0.45)', weight: 1.5,
                opacity: 0.9, fillOpacity: 0.9
            });
            pin.bindTooltip(loc, { className: 'map-tip', direction: 'top', offset: [0, -6] });
            pin.on('mouseover', function () { pin.setStyle({ radius: 6 }); });
            pin.on('mouseout',  function () { pin.setStyle({ radius: 4 }); });
            pin.on('click', function (e) {
                L.DomEvent.stopPropagation(e);
                openPanel(loc, matched);
            });
            pin.addTo(mapInstance);
        });
    }

    function closeMap() {
        closePanel();
        mapOverlay.classList.remove('is-open');
        mapOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    mapToggle.addEventListener('click', function (e) { e.preventDefault(); openMap(); });
    mapClose.addEventListener('click', closeMap);
    mapOverlay.addEventListener('click', function (e) { if (e.target === mapOverlay) closeMap(); });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mapOverlay.classList.contains('is-open') &&
            !lb.classList.contains('is-open')) closeMap();
    });

});
