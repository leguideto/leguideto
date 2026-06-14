/* ============================================================
   leGuideTO — main.js
   - Shared header + footer injection (single source of truth)
   - Language toggle (FR / EN) with localStorage
   - Newsletter signup (homepage + every footer)
   - Live search (homepage cards, directory, guide highlight)
   - Contact form
   - Interactive Leaflet map (map page)
   - Budget calculator (budget page)
   ============================================================ */

(function () {
  'use strict';
  var fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  document.head.appendChild(fa);

  var STORAGE_KEY = 'leguideto-lang';
  var DEFAULT_LANG = 'fr';

  /* ---------- Navigation model (single source of truth) ---------- */
  var NAV = [
    { href: '/', fr: 'Accueil', en: 'Home' },
    { href: '/guide', fr: 'Guide', en: 'Guide' },
    { href: '/directory', fr: 'Annuaire', en: 'Directory' },
    { href: '/map', fr: 'Carte', en: 'Map' },
    { href: '/toronto', fr: 'Quartiers', en: 'Neighbourhoods' },
    { href: '/budget', fr: 'Budget', en: 'Budget' },
    { href: '/money', fr: 'Économies', en: 'Savings' },
    { href: '/housing', fr: 'Logement', en: 'Housing' },
    { href: '/work', fr: 'Travail', en: 'Work' },
    { href: '/health', fr: 'Santé', en: 'Health' },
    { href: '/events', fr: 'Événements', en: 'Events' },
    { href: '/about', fr: 'À propos', en: 'About' }
  ];

  /* ---------- Francophone organizations (shared by directory + map) ---------- */
  var ORGS = [
    {
      name: 'Centre francophone du Grand Toronto',
      cats: ['settlement', 'health', 'employment'],
      catFr: 'Accueil & installation', catEn: 'Settlement',
      address: '555 Richmond St W, Toronto',
      phone: '416-922-2672',
      website: 'centrefranco.org',
      lat: 43.6479, lng: -79.4007,
      descFr: "Le point de départ pour beaucoup de francophones : accueil des nouveaux arrivants, aide à l'installation, emploi, et une clinique de santé en français.",
      descEn: 'The starting point for many francophones: newcomer reception, settlement help, employment, and a health clinic in French.'
    },
    {
      name: 'La Passerelle-I.D.É.',
      cats: ['settlement', 'employment'],
      catFr: 'Accueil & installation', catEn: 'Settlement',
      address: 'Toronto, ON',
      phone: '416-431-1144',
      website: 'lapasserelle.ca',
      lat: 43.6512, lng: -79.3790,
      descFr: "Intégration et développement économique : accompagnement à l'emploi, entrepreneuriat, services aux familles et aux jeunes.",
      descEn: 'Integration and economic development: employment support, entrepreneurship, services for families and youth.'
    },
    {
      name: 'Collège Boréal',
      cats: ['education', 'employment', 'settlement'],
      catFr: 'Éducation & formation', catEn: 'Education',
      address: '1 Yonge St, Toronto',
      phone: '416-289-5130',
      website: 'collegeboreal.ca',
      lat: 43.6419, lng: -79.3757,
      descFr: "Collège de langue française : formations, cours d'anglais (LINC), aide à la recherche d'emploi et services d'établissement.",
      descEn: 'French-language college: training, English classes (LINC), job-search help and settlement services.'
    },
    {
      name: 'TFO',
      cats: ['culture', 'education'],
      catFr: 'Culture & médias', catEn: 'Culture',
      address: '21 College St, Toronto',
      phone: '416-968-0650',
      website: 'tfo.org',
      lat: 43.6606, lng: -79.3849,
      descFr: "La chaîne éducative et culturelle de langue française de l'Ontario : contenus jeunesse, documentaires et ressources.",
      descEn: "Ontario's French-language educational and cultural broadcaster: kids' content, documentaries and resources."
    },
    {
      name: 'ACFO Toronto',
      cats: ['settlement', 'culture'],
      catFr: 'Accueil & installation', catEn: 'Settlement',
      address: 'Toronto, ON',
      phone: '416-538-1500',
      website: 'acfotoronto.ca',
      lat: 43.6555, lng: -79.3830,
      descFr: "L'Association des communautés franco-ontariennes du grand Toronto : défense des droits, vie communautaire et orientation.",
      descEn: 'The association of Franco-Ontarian communities of Greater Toronto: rights advocacy, community life and referrals.'
    }
  ];

  /* ---------- Language ---------- */
  function getLang() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; }
    catch (e) { return DEFAULT_LANG; }
  }
  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }
  function applyLang(lang) {
    var attr = 'data-' + lang;
    document.querySelectorAll('[data-fr][data-en]').forEach(function (el) {
      var value = el.getAttribute(attr);
      if (value === null) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setAttribute('placeholder', value);
      } else {
        el.innerHTML = value;
      }
    });
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.lang-toggle').forEach(function (btn) {
      btn.textContent = lang === 'fr' ? 'EN' : 'FR';
      btn.setAttribute('aria-label', lang === 'fr' ? 'Switch to English' : 'Passer en français');
    });
  }
  function setLang(lang) { saveLang(lang); applyLang(lang); }
  function toggleLang() { setLang(getLang() === 'fr' ? 'en' : 'fr'); }

  /* ---------- Header / footer injection ---------- */
  function currentPath() {
    var p = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (p === '') p = '/';
    if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
    return p;
  }

  function navLinksHTML(active, mobile) {
    return NAV.map(function (item) {
      var isActive = item.href === active ? ' active' : '';
      var cls = mobile ? ('class="' + (isActive ? 'active' : '') + '"') : ('class="' + (isActive ? 'active' : '') + '"');
      return '<a href="' + item.href + '" ' + cls + ' data-fr="' + item.fr + '" data-en="' + item.en + '">' + item.fr + '</a>';
    }).join(mobile ? '\n' : '');
  }

  function renderHeader() {
    var host = document.getElementById('site-header');
    if (!host) return;
    var active = currentPath();
    var links = NAV.map(function (item) {
      var a = item.href === active ? ' active' : '';
      return '<li><a href="' + item.href + '" class="' + a + '" data-fr="' + item.fr + '" data-en="' + item.en + '">' + item.fr + '</a></li>';
    }).join('');
    var mobileLinks = NAV.map(function (item) {
      var a = item.href === active ? 'active' : '';
      return '<a href="' + item.href + '" class="' + a + '" data-fr="' + item.fr + '" data-en="' + item.en + '">' + item.fr + '</a>';
    }).join('');

    host.className = 'site-header';
    host.innerHTML =
      '<nav class="nav">' +
        '<a href="/" class="brand"><span class="brand-le">leGuide</span><span class="brand-to">TO</span></a>' +
        '<ul class="nav-links">' + links + '</ul>' +
        '<div class="nav-right">' +
          '<button class="lang-toggle" type="button">EN</button>' +
          '<button class="menu-btn" type="button" aria-label="Menu">☰</button>' +
        '</div>' +
      '</nav>' +
      '<div class="mobile-menu">' + mobileLinks + '</div>';
  }

  function renderFooter() {
    var host = document.getElementById('site-footer');
    if (!host) return;
    var col = function (items) {
      return items.map(function (i) {
        return '<a href="' + i.href + '" data-fr="' + i.fr + '" data-en="' + i.en + '">' + i.fr + '</a>';
      }).join('');
    };
    var explore = NAV.slice(1, 6);
    var more = NAV.slice(6);

    host.className = 'site-footer';
    host.innerHTML =
      '<div class="footer-news">' +
        '<div class="container">' +
          newsletterMarkup(true) +
        '</div>' +
      '</div>' +
      '<div class="footer-inner"><div class="container">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<div class="footer-brand"><span class="brand-le">leGuide</span><span class="brand-to">TO</span></div><div class="footer-social"><a href="https://www.instagram.com/leguideto/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i> Instagram</a></div>' +
            '<p data-fr="Le guide pratique des francophones qui s\'installent dans le Grand Toronto. Économisez du temps, de l\'argent et du stress." data-en="The practical guide for French-speakers settling in the Greater Toronto Area. Save time, money and stress.">Le guide pratique des francophones qui s\'installent dans le Grand Toronto.</p>' +
          '</div>' +
          '<div><h4 data-fr="Explorer" data-en="Explore">Explorer</h4>' + col(explore) + '</div>' +
          '<div><h4 data-fr="Plus" data-en="More">Plus</h4>' + col(more) + '</div>' +
          '<div><h4 data-fr="Langue" data-en="Language">Langue</h4>' +
            '<a href="#" class="lang-toggle-link" data-fr="English" data-en="Français">English</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© 2026 leGuideTO</span>' +
          '<span data-fr="Fait avec ❤️ à Toronto" data-en="Made with ❤️ in Toronto">Fait avec ❤️ à Toronto</span>' +
        '</div>' +
      '</div></div>';
  }

  function newsletterMarkup(compact) {
    return '' +
      '<div class="newsletter' + (compact ? ' compact' : '') + '">' +
        '<h2 data-fr="Restez informé" data-en="Stay informed">Restez informé</h2>' +
        '<p data-fr="Recevez nos guides et conseils directement dans votre boîte mail." data-en="Get our guides and tips delivered to your inbox.">Recevez nos guides et conseils directement dans votre boîte mail.</p>' +
        '<form class="newsletter-form" novalidate>' +
          '<input type="text" name="firstname" required data-fr="Prénom" data-en="First name" placeholder="Prénom" aria-label="First name" />' +
          '<input type="email" name="email" required data-fr="Adresse courriel" data-en="Email address" placeholder="Adresse courriel" aria-label="Email" />' +
          '<button type="submit" class="btn" data-fr="S\'abonner" data-en="Subscribe">S\'abonner</button>' +
        '</form>' +
        '<p class="newsletter-status" role="status" aria-live="polite"></p>' +
      '</div>';
  }

  /* ---------- Newsletter behaviour ---------- */
  function initNewsletter() {
    document.querySelectorAll('.newsletter-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var status = form.parentElement.querySelector('.newsletter-status');
        var lang = getLang();
        var email = form.email.value.trim();
        var first = form.firstname.value.trim();
        if (!email || !first) {
          if (status) {
            status.style.color = 'var(--red)';
            status.textContent = lang === 'fr' ? 'Remplis ton prénom et ton courriel.' : 'Please enter your first name and email.';
          }
          return;
        }
        var formData = new FormData(); formData.append("EMAIL", email); formData.append("FNAME", first); formData.append("b_5bf69d758332e602c49d7fe89_e91929c925", ""); fetch("https://leguideto.us1.list-manage.com/subscribe/post?u=5bf69d758332e602c49d7fe89&id=e91929c925&f_id=004676e0f0", { method: "POST", mode: "no-cors", body: formData }).then(function(){ form.reset(); if(status){ status.style.color = "#2a9d4a"; status.textContent = lang === "fr" ? "Merci " + first + " ! Tu es bien inscrit·e. ✅" : "Thanks " + first + "! You are subscribed. ✅"; } }).catch(function(){ form.reset(); if(status){ status.style.color = "#2a9d4a"; status.textContent = lang === "fr" ? "Merci " + first + " ! Tu es bien inscrit·e. ✅" : "Thanks " + first + "! You are subscribed. ✅"; } });
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var btn = document.querySelector('.menu-btn');
    var menu = document.querySelector('.mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () { menu.classList.toggle('open'); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }

  /* ---------- Directory category filter ---------- */
  function initFilters() {
    var buttons = document.querySelectorAll('.filter-btn');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter');
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('[data-category]').forEach(function (item) {
          var cats = item.getAttribute('data-category');
          var show = cat === 'all' || (cats && cats.split(' ').indexOf(cat) !== -1);
          item.dataset.filterHidden = show ? '' : '1';
          applyItemVisibility(item);
        });
      });
    });
  }

  // An item is visible only if neither the filter nor the search hides it.
  function applyItemVisibility(item) {
    var hidden = item.dataset.filterHidden === '1' || item.dataset.searchHidden === '1';
    item.classList.toggle('hidden', hidden);
  }

  /* ---------- Live search ---------- */
  function initSearch() {
    document.querySelectorAll('.js-search').forEach(function (input) {
      var targetSel = input.getAttribute('data-target');
      var mode = input.getAttribute('data-mode') || 'filter';
      var emptyMsg = document.querySelector(input.getAttribute('data-empty') || '___none___');

      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        var items = document.querySelectorAll(targetSel);
        var anyVisible = false;

        items.forEach(function (item) {
          var text = (item.textContent || '').toLowerCase();
          var match = q === '' || text.indexOf(q) !== -1;

          if (mode === 'highlight') {
            item.classList.remove('search-hit', 'search-dim');
            if (q !== '') {
              if (match) item.classList.add('search-hit');
              else item.classList.add('search-dim');
            }
            if (match) anyVisible = true;
          } else {
            item.dataset.searchHidden = match ? '' : '1';
            applyItemVisibility(item);
            if (match && item.dataset.filterHidden !== '1') anyVisible = true;
          }
        });

        if (emptyMsg) emptyMsg.style.display = anyVisible ? 'none' : 'block';
      });
    });
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = { name: form.name.value, email: form.email.value, message: form.message.value };
      fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); })
        .then(function () { var formData = new FormData(); formData.append("EMAIL", email); formData.append("FNAME", first); formData.append("b_5bf69d758332e602c49d7fe89_e91929c925", ""); fetch("https://leguideto.us1.list-manage.com/subscribe/post?u=5bf69d758332e602c49d7fe89&id=e91929c925&f_id=004676e0f0", { method: "POST", mode: "no-cors", body: formData }).then(function(){ form.reset(); if(status){ status.style.color = "#2a9d4a"; status.textContent = lang === "fr" ? "Merci " + first + " ! Tu es bien inscrit·e. ✅" : "Thanks " + first + "! You are subscribed. ✅"; } }).catch(function(){ form.reset(); if(status){ status.style.color = "#2a9d4a"; status.textContent = lang === "fr" ? "Merci " + first + " ! Tu es bien inscrit·e. ✅" : "Thanks " + first + "! You are subscribed. ✅"; } }); contactStatus(status, true); })
        .catch(function () { contactStatus(status, false); });
    });
  }
  function contactStatus(el, ok) {
    if (!el) return;
    var lang = getLang();
    el.style.color = ok ? '#2a9d4a' : 'var(--red)';
    if (ok) el.textContent = lang === 'fr' ? 'Merci ! Ton message a bien été envoyé.' : 'Thanks! Your message was sent.';
    else el.textContent = lang === 'fr' ? "Oups, une erreur s'est produite. Réessaie plus tard." : 'Oops, something went wrong. Please try again later.';
  }

  /* ---------- Map (Leaflet) ---------- */
  function initMap() {
    var el = document.getElementById('map');
    if (!el || typeof L === 'undefined') return;

    var map = L.map('map', { scrollWheelZoom: false }).setView([43.6532, -79.3832], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var redIcon = L.divIcon({
      className: 'lg-marker',
      html: '<div style="background:#e8323c;width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 18],
      popupAnchor: [0, -18]
    });

    var lang = getLang();
    var markers = ORGS.map(function (org) {
      var m = L.marker([org.lat, org.lng], { icon: redIcon }).addTo(map);
      m._org = org;
      bindPopup(m, lang);
      return m;
    });

    // expose so the language toggle can refresh popups
    window.__lgMarkers = markers;
    window.__lgMap = map;

    // filter buttons
    document.querySelectorAll('.map-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter');
        document.querySelectorAll('.map-filter').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        markers.forEach(function (m) {
          var show = cat === 'all' || m._org.cats.indexOf(cat) !== -1;
          if (show) m.addTo(map); else map.removeLayer(m);
        });
      });
    });

    // recalc size once laid out
    setTimeout(function () { map.invalidateSize(); }, 200);
  }

  function bindPopup(marker, lang) {
    var o = marker._org;
    var cat = lang === 'fr' ? o.catFr : o.catEn;
    var desc = lang === 'fr' ? o.descFr : o.descEn;
    var phoneLbl = lang === 'fr' ? 'Tél' : 'Phone';
    marker.bindPopup(
      '<div class="map-popup">' +
        '<span class="badge">' + cat + '</span>' +
        '<h4>' + o.name + '</h4>' +
        '<p>' + desc + '</p>' +
        '<p>📍 ' + o.address + '</p>' +
        '<p>📞 ' + phoneLbl + ' : ' + o.phone + '</p>' +
        '<p><a href="https://' + o.website + '" target="_blank" rel="noopener">' + o.website + ' ↗</a></p>' +
      '</div>'
    );
  }

  function refreshMapPopups() {
    if (!window.__lgMarkers) return;
    var lang = getLang();
    window.__lgMarkers.forEach(function (m) { bindPopup(m, lang); });
  }

  /* ---------- Budget calculator ---------- */
  var BUDGET_CATS = [
    { key: 'rent', fr: 'Loyer', en: 'Rent', min: 600, max: 3500, def: 2300, step: 50, color: '#e8323c',
      presets: [{ fr: '1 chambre', en: '1-bdr', v: 2300 }, { fr: 'Chambre', en: 'Room', v: 900 }, { fr: 'Sous-sol', en: 'Basement', v: 1500 }] },
    { key: 'groceries', fr: 'Épicerie', en: 'Groceries', min: 200, max: 1200, def: 400, step: 25, color: '#f0883e',
      presets: [{ fr: 'Solo', en: 'Single', v: 400 }, { fr: 'Couple', en: 'Couple', v: 650 }, { fr: 'Famille 4', en: 'Family 4', v: 900 }] },
    { key: 'transport', fr: 'Transport', en: 'Transport', min: 0, max: 1000, def: 156, step: 10, color: '#3fb950',
      presets: [{ fr: 'TTC', en: 'TTC pass', v: 156 }, { fr: 'Voiture', en: 'Car', v: 800 }] },
    { key: 'phone', fr: 'Téléphone', en: 'Phone', min: 15, max: 120, def: 55, step: 5, color: '#2f81f7',
      presets: [{ fr: 'Éco', en: 'Budget', v: 25 }, { fr: 'Moyen', en: 'Mid', v: 55 }, { fr: 'Premium', en: 'Premium', v: 85 }] },
    { key: 'internet', fr: 'Internet', en: 'Internet', min: 30, max: 120, def: 60, step: 5, color: '#a371f7', presets: [] },
    { key: 'utilities', fr: 'Électricité / services', en: 'Hydro / utilities', min: 0, max: 300, def: 125, step: 5, color: '#db61a2', presets: [] },
    { key: 'misc', fr: 'Divers', en: 'Miscellaneous', min: 0, max: 600, def: 200, step: 10, color: '#8b949e', presets: [] }
  ];

  function fmt(n) { return '$' + Math.round(n).toLocaleString('en-CA'); }

  function initBudget() {
    var wrap = document.getElementById('budget-sliders');
    if (!wrap) return;
    var lang = getLang();

    var tipHref = '/money';
    wrap.innerHTML = BUDGET_CATS.map(function (c) {
      var presets = c.presets.map(function (p) {
        return '<button type="button" class="preset-btn" data-cat="' + c.key + '" data-val="' + p.v + '" data-fr="' + p.fr + ' · $' + p.v + '" data-en="' + p.en + ' · $' + p.v + '">' + p.fr + ' · $' + p.v + '</button>';
      }).join('');
      return '' +
        '<div class="slider-row">' +
          '<div class="slider-head">' +
            '<span class="cat-name" data-fr="' + c.fr + '" data-en="' + c.en + '">' + c.fr + '</span>' +
            '<span class="cat-val" id="val-' + c.key + '">' + fmt(c.def) + '</span>' +
          '</div>' +
          '<input type="range" id="slider-' + c.key + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.def + '" />' +
          (presets ? '<div class="presets">' + presets + '</div>' : '') +
          '<p class="cat-tip"><a href="' + tipHref + '" data-fr="Comment réduire ce coût →" data-en="How to reduce this cost →">Comment réduire ce coût →</a></p>' +
        '</div>';
    }).join('');

    BUDGET_CATS.forEach(function (c) {
      var slider = document.getElementById('slider-' + c.key);
      slider.addEventListener('input', function () {
        document.getElementById('val-' + c.key).textContent = fmt(slider.value);
        recalcBudget();
      });
    });

    wrap.querySelectorAll('.preset-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-cat');
        var val = btn.getAttribute('data-val');
        var slider = document.getElementById('slider-' + key);
        slider.value = val;
        document.getElementById('val-' + key).textContent = fmt(val);
        recalcBudget();
      });
    });

    var income = document.getElementById('income');
    if (income) income.addEventListener('input', recalcBudget);

    recalcBudget();
  }

  function recalcBudget() {
    var lang = getLang();
    var income = parseFloat((document.getElementById('income') || {}).value) || 0;

    var total = 0;
    var segs = '';
    var legend = '';
    BUDGET_CATS.forEach(function (c) {
      var s = document.getElementById('slider-' + c.key);
      if (!s) return;
      var v = parseFloat(s.value) || 0;
      total += v;
    });

    BUDGET_CATS.forEach(function (c) {
      var s = document.getElementById('slider-' + c.key);
      if (!s) return;
      var v = parseFloat(s.value) || 0;
      var pct = total > 0 ? (v / total * 100) : 0;
      segs += '<div class="breakdown-seg" style="width:' + pct + '%;background:' + c.color + '" title="' + (lang === 'fr' ? c.fr : c.en) + '"></div>';
      legend += '<span><i class="legend-dot" style="background:' + c.color + '"></i>' + (lang === 'fr' ? c.fr : c.en) + ' ' + fmt(v) + '</span>';
    });

    setText('res-income', fmt(income));
    setText('res-expenses', fmt(total));

    var leftover = income - total;
    var leftoverEl = document.getElementById('leftover');
    var leftoverVal = document.getElementById('leftover-val');
    var leftoverLabel = document.getElementById('leftover-label');
    if (leftoverVal) leftoverVal.textContent = (leftover < 0 ? '-' : '') + fmt(Math.abs(leftover));
    if (leftoverEl) {
      leftoverEl.classList.toggle('positive', leftover >= 0);
      leftoverEl.classList.toggle('negative', leftover < 0);
    }
    if (leftoverLabel) {
      leftoverLabel.setAttribute('data-fr', leftover >= 0 ? 'Reste à la fin du mois' : 'Déficit mensuel');
      leftoverLabel.setAttribute('data-en', leftover >= 0 ? 'Left over each month' : 'Monthly deficit');
      leftoverLabel.textContent = lang === 'fr'
        ? (leftover >= 0 ? 'Reste à la fin du mois' : 'Déficit mensuel')
        : (leftover >= 0 ? 'Left over each month' : 'Monthly deficit');
    }

    // expenses vs income bar
    var fill = document.getElementById('bar-fill');
    if (fill) {
      var ratio = income > 0 ? Math.min(total / income * 100, 100) : (total > 0 ? 100 : 0);
      fill.style.width = ratio + '%';
      fill.classList.toggle('ok', income > 0 && total <= income);
    }
    var caption = document.getElementById('bar-caption');
    if (caption) {
      var pctUsed = income > 0 ? Math.round(total / income * 100) : 0;
      caption.textContent = income > 0
        ? (lang === 'fr' ? pctUsed + ' % de ton revenu part en dépenses' : pctUsed + '% of your income goes to expenses')
        : (lang === 'fr' ? 'Entre ton revenu pour voir le portrait complet' : 'Enter your income to see the full picture');
    }

    var bd = document.getElementById('breakdown-bar');
    if (bd) bd.innerHTML = segs;
    var lg = document.getElementById('breakdown-legend');
    if (lg) lg.innerHTML = legend;
  }

  function setText(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }

  /* ---------- Guide interactive checklist ---------- */
  var GUIDE_KEY = 'leguideto-guide';

  function loadGuideState() {
    try { return JSON.parse(localStorage.getItem(GUIDE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveGuideState(state) {
    try { localStorage.setItem(GUIDE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function initGuideChecklist() {
    var wrap = document.getElementById('guide-checklist');
    if (!wrap) return;
    var boxes = wrap.querySelectorAll('input[type="checkbox"]');
    if (!boxes.length) return;

    var state = loadGuideState();

    function refreshProgress() {
      var done = 0;
      boxes.forEach(function (b) { if (b.checked) done++; });
      var total = boxes.length;
      var bar = document.getElementById('guide-bar');
      if (bar) bar.style.width = (total ? (done / total * 100) : 0) + '%';
      var label = document.getElementById('guide-progress-label');
      if (label) {
        var lang = getLang();
        var txt = lang === 'fr'
          ? (done + ' sur ' + total + ' étapes complétées')
          : (done + ' of ' + total + ' steps completed');
        label.textContent = txt;
        label.setAttribute('data-fr', done + ' sur ' + total + ' étapes complétées');
        label.setAttribute('data-en', done + ' of ' + total + ' steps completed');
      }
    }

    boxes.forEach(function (box) {
      var id = box.id;
      var item = box.closest('.check-item');
      if (state[id]) { box.checked = true; if (item) item.classList.add('done'); }
      box.addEventListener('change', function () {
        if (item) item.classList.toggle('done', box.checked);
        state[id] = box.checked;
        saveGuideState(state);
        refreshProgress();
      });
    });

    var reset = document.getElementById('guide-reset');
    if (reset) {
      reset.addEventListener('click', function () {
        boxes.forEach(function (box) {
          box.checked = false;
          var item = box.closest('.check-item');
          if (item) item.classList.remove('done');
        });
        state = {};
        saveGuideState(state);
        refreshProgress();
      });
    }

    refreshProgress();
    // refresh label wording when language toggles
    window.__lgGuideRefresh = refreshProgress;
  }

  /* ---------- Cost-of-living calculator (budget page) ---------- */
  var RENT = {
    downtown:    { room: 1200, basement: 1800, br1: 2246, br2: 2939, br3: 3700, br4: 4400 },
    northyork:   { room: 900,  basement: 1400, br1: 1900, br2: 2500, br3: 3100, br4: 3700 },
    scarborough: { room: 800,  basement: 1200, br1: 1700, br2: 2200, br3: 2700, br4: 3200 },
    etobicoke:   { room: 850,  basement: 1300, br1: 1800, br2: 2400, br3: 2950, br4: 3500 },
    eastyork:    { room: 850,  basement: 1350, br1: 1850, br2: 2450, br3: 3000, br4: 3600 },
    york:        { room: 800,  basement: 1250, br1: 1750, br2: 2300, br3: 2850, br4: 3400 }
  };
  var GROCERY = { budget: 400, mid: 722, premium: 1000 };
  var GROC_FACTOR = { p1: 0.7, p2: 1.0, f3: 1.3, f4: 1.6 };
  var TRANSPORT = { ttc: 156, car: 800, both: 956 };
  var HYDRO = 145, PHONE = 55, INTERNET = 60, CHILDCARE = 440;

  function initCostCalculator() {
    var form = document.getElementById('calc-form');
    if (!form) return;

    function el(id) { return document.getElementById(id); }
    function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }

    // Show/hide the "Personnalisé" text field tied to a select; returns true if custom is active.
    function toggleCustom(selId, customId) {
      var sel = el(selId), c = el(customId);
      if (!sel || !c) return false;
      var custom = sel.value === 'custom';
      c.classList.toggle('hidden', !custom);
      return custom;
    }

    // Editable number field with a fallback default when empty/invalid.
    function override(id, def) {
      var f = el(id);
      if (!f || f.value === '') return def;
      var n = parseFloat(f.value);
      return isNaN(n) ? def : n;
    }

    function recalc() {
      var rent = (RENT[el('calc-hood').value] && RENT[el('calc-hood').value][el('calc-housing').value]) || 0;

      // Groceries — custom value used as-is; presets scale with household size.
      var groceries;
      if (toggleCustom('calc-groceries', 'calc-groceries-custom')) {
        groceries = num(el('calc-groceries-custom').value);
      } else {
        groceries = Math.round((GROCERY[el('calc-groceries').value] || 0) * (GROC_FACTOR[el('calc-household').value] || 1));
      }

      // Transport
      var transport = toggleCustom('calc-transport', 'calc-transport-custom')
        ? num(el('calc-transport-custom').value)
        : (TRANSPORT[el('calc-transport').value] || 0);

      // Childcare
      var ccSel = el('calc-childcare').value;
      var ccCustom = toggleCustom('calc-childcare', 'calc-childcare-custom');
      var childcare = ccCustom ? num(el('calc-childcare-custom').value) : (ccSel === 'yes' ? CHILDCARE : 0);
      var ccRow = el('row-childcare');
      if (ccRow) ccRow.classList.toggle('hidden-row', ccSel === 'no');

      // Editable defaults
      var hydro = override('calc-hydro', HYDRO);
      var phone = override('calc-phone', PHONE);
      var internet = override('calc-internet', INTERNET);

      setText('val-rent', fmt(rent));
      setText('val-groceries', fmt(groceries));
      setText('val-transport', fmt(transport));
      setText('val-hydro', fmt(hydro));
      setText('val-phone', fmt(phone));
      setText('val-internet', fmt(internet));
      setText('val-childcare', fmt(childcare));

      var total = rent + groceries + transport + hydro + phone + internet + childcare;
      setText('val-total', fmt(total));
    }

    form.querySelectorAll('select, input').forEach(function (c) {
      c.addEventListener('change', recalc);
      c.addEventListener('input', recalc);
    });
    recalc();
  }

  /* ---------- Toronto neighbourhood map (toronto page) ---------- */
  // Official City of Toronto neighbourhood boundaries (Open Data, 158 areas), served
  // same-origin to avoid CORS. Source dataset: open.toronto.ca/dataset/neighbourhoods/
  var GEO_URL = '/data/toronto-neighbourhoods.geojson';

  var DISTRICTS = {
    downtown:    { fr: 'Downtown / Old Toronto', en: 'Downtown / Old Toronto', color: '#e8f4f8' },
    northyork:   { fr: 'North York',  en: 'North York',  color: '#e8f8e8' },
    scarborough: { fr: 'Scarborough', en: 'Scarborough', color: '#fff3e8' },
    etobicoke:   { fr: 'Etobicoke',   en: 'Etobicoke',   color: '#f3e8f8' },
    eastyork:    { fr: 'East York',   en: 'East York',   color: '#f8f8e8' },
    york:        { fr: 'York',        en: 'York',        color: '#f8e8e8' }
  };

  // Approximate each neighbourhood to a former municipality from its centroid.
  // (Boundaries are irregular — this is a best-effort geographic grouping.)
  function districtFor(lat, lng) {
    if (lng >= -79.29) return 'scarborough';      // east of Victoria Park Ave
    if (lng <= -79.49) return 'etobicoke';        // west of the Humber River
    if (lat >= 43.715) return 'northyork';        // northern central band
    if (lng <= -79.45 && lat >= 43.66) return 'york';        // west-central (Weston, Mt Dennis)
    if (lng >= -79.355 && lat >= 43.685) return 'eastyork';  // east of the Don, north of Danforth
    return 'downtown';                            // central south core
  }

  function geoCentroid(geom) {
    var pts = [];
    (function collect(c) {
      if (typeof c[0] === 'number') { pts.push(c); return; }
      for (var i = 0; i < c.length; i++) collect(c[i]);
    })(geom.coordinates);
    var sx = 0, sy = 0;
    for (var i = 0; i < pts.length; i++) { sx += pts[i][0]; sy += pts[i][1]; }
    return { lng: sx / pts.length, lat: sy / pts.length };
  }

  function hoodName(props) {
    var n = props.AREA_NAME || props.AREA_NA7 || props.Neighbourhood || props.name || props.NAME || '';
    return String(n).replace(/\s*\(\d+\)\s*$/, '').trim();
  }

  function initHoodMap() {
    var el = document.getElementById('hood-map');
    if (!el || typeof L === 'undefined') return;

    var map = L.map('hood-map', { scrollWheelZoom: false }).setView([43.6532, -79.3832], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    setTimeout(function () { map.invalidateSize(); }, 200);

    function showError() {
      var lang = getLang();
      var box = document.createElement('div');
      box.className = 'map-error';
      box.innerHTML =
        '<h4>' + (lang === 'fr' ? '🗺️ Carte indisponible' : '🗺️ Map unavailable') + '</h4>' +
        '<p>' + (lang === 'fr'
          ? "Impossible de charger les frontières des quartiers pour le moment. Consulte les données officielles : "
          : 'Could not load the neighbourhood boundaries right now. See the official data: ') +
        '<a href="https://open.toronto.ca/dataset/neighbourhoods/" target="_blank" rel="noopener">Toronto Open Data</a></p>';
      el.parentNode.replaceChild(box, el);
    }

    fetch(GEO_URL)
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (data) { renderGeo(map, data); })
      .catch(function () { showError(); });
  }

  function renderGeo(map, data) {
    var lang = getLang();
    var layersByDistrict = { downtown: [], northyork: [], scarborough: [], etobicoke: [], eastyork: [], york: [] };

    function styleFor(district, faded) {
      return {
        fillColor: DISTRICTS[district].color,
        fillOpacity: faded ? 0.06 : 0.6,
        color: faded ? '#cfcfcf' : '#7a7a7a',
        weight: faded ? 0.5 : 1,
        opacity: faded ? 0.3 : 1
      };
    }

    var geo = L.geoJSON(data, {
      style: function (f) { return styleFor(f.__district, false); },
      onEachFeature: function (feature, layer) {
        var name = hoodName(feature.properties || {});
        var c = geoCentroid(feature.geometry);
        var district = districtFor(c.lat, c.lng);
        feature.__district = district;
        layer.__district = district;
        layer.__faded = false;
        layer.setStyle(styleFor(district, false));

        var dLabel = (lang === 'fr' ? DISTRICTS[district].fr : DISTRICTS[district].en);
        if (name) {
          layer.bindTooltip(name, { permanent: true, direction: 'center', className: 'hood-label', opacity: 1 });
        }
        layer.bindPopup(
          '<div class="hood-popup">' +
            '<span class="zone">' + dLabel + '</span>' +
            '<h4>' + (name || '—') + '</h4>' +
            '<p>' + (lang === 'fr' ? 'Secteur : ' : 'District: ') + dLabel + '</p>' +
          '</div>'
        );

        // Hover: darker border + raise the name label; reset respects the active filter.
        layer.on('mouseover', function (e) {
          var l = e.target;
          if (l.__faded) return;
          l.setStyle({ weight: 2.5, color: '#333', fillOpacity: 0.75 });
          if (l.bringToFront) l.bringToFront();
          if (l.getTooltip()) l.openTooltip();
        });
        layer.on('mouseout', function (e) {
          var l = e.target;
          l.setStyle(styleFor(l.__district, l.__faded));
        });

        layersByDistrict[district].push(layer);
      }
    }).addTo(map);

    try { map.fitBounds(geo.getBounds(), { padding: [10, 10] }); } catch (e) {}

    document.querySelectorAll('.hood-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var d = btn.getAttribute('data-filter');
        document.querySelectorAll('.hood-filter').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        geo.eachLayer(function (layer) {
          var match = d === 'all' || layer.__district === d;
          layer.__faded = !match;
          layer.setStyle(styleFor(layer.__district, !match));
          if (layer.getTooltip()) {
            if (match) layer.openTooltip(); else layer.closeTooltip();
          }
        });
      });
    });
  }

  /* ---------- Unsplash images (hero banners + in-article) ---------- */
  // Build a compressed src + responsive srcset from a photo id like "photo-123-abc".
  function unsplash(id, crop) {
    var base = 'https://images.unsplash.com/' + id;
    // Centre on the main subject by default; "top" keeps full height of tall buildings/skylines.
    var tail = '&q=80&auto=format&fit=crop&crop=' + (crop === 'top' ? 'top' : 'center');
    return {
      src: base + '?w=1200' + tail,
      srcset: [1200, 1600, 2000].map(function (w) {
        return base + '?w=' + w + tail + ' ' + w + 'w';
      }).join(', ')
    };
  }
  function creditHTML() {
    return '<a class="photo-credit" href="https://unsplash.com" target="_blank" rel="noopener nofollow">Photo: Unsplash</a>';
  }

  // Full-width hero banner, inserted right below the navigation.
  function injectHero() {
    var id = document.body.getAttribute('data-hero');
    var host = document.getElementById('site-header');
    if (!id || !host) return;
    var img = unsplash(id, document.body.getAttribute('data-hero-crop'));
    var alt = document.body.getAttribute('data-hero-alt') || 'Toronto';
    var banner = document.createElement('section');
    banner.className = 'hero-banner';
    // Hero is the LCP element → load eagerly with high priority (article images stay lazy).
    banner.innerHTML =
      '<img src="' + img.src + '" srcset="' + img.srcset + '" sizes="100vw" alt="' + alt + '" fetchpriority="high" decoding="async" />' +
      creditHTML();
    host.parentNode.insertBefore(banner, host.nextSibling);
  }

  // Expand <div class="media-embed" data-img="photo-..." data-alt="..."> into a lazy, responsive figure.
  function injectMedia() {
    document.querySelectorAll('.media-embed[data-img]').forEach(function (el) {
      var img = unsplash(el.getAttribute('data-img'), el.getAttribute('data-crop'));
      var alt = el.getAttribute('data-alt') || 'Toronto';
      el.classList.add('media');
      el.innerHTML =
        '<img loading="lazy" decoding="async" src="' + img.src + '" srcset="' + img.srcset + '" sizes="(max-width: 820px) 100vw, 780px" alt="' + alt + '" />' +
        creditHTML();
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    injectHero();
    renderFooter();
    injectMedia();

    applyLang(getLang());

    document.querySelectorAll('.lang-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () { toggleLang(); afterLangChange(); });
    });
    document.querySelectorAll('.lang-toggle-link').forEach(function (link) {
      link.addEventListener('click', function (e) { e.preventDefault(); toggleLang(); afterLangChange(); });
    });

    initMenu();
    initNewsletter();
    initFilters();
    initSearch();
    initContactForm();
    initMap();
    initBudget();
    initGuideChecklist();
    initCostCalculator();
    initHoodMap();
  });

  function afterLangChange() {
    refreshMapPopups();
    if (document.getElementById('budget-sliders')) recalcBudget();
    if (typeof window.__lgGuideRefresh === 'function') window.__lgGuideRefresh();
    if (typeof window.__lgHoodRefresh === 'function') window.__lgHoodRefresh();
  }
})();
