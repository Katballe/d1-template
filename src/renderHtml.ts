const PLACES = [
	{ name: "Madeira",    lat: 32.7607, lng: -16.9595, green: false },
	{ name: "Athens",     lat: 37.9838, lng:  23.7275, green: false },
	{ name: "Porto",      lat: 41.1579, lng:  -8.6291, green: false },
	{ name: "Copenhagen", lat: 55.6761, lng:  12.5683, green: false },
	{ name: "Tbilisi",    lat: 41.6938, lng:  44.8015, green: false },
	{ name: "Kutaisi",    lat: 42.2679, lng:  42.6946, green: false },
	{ name: "Juta",       lat: 42.65,   lng:  44.517,  green: false },
	{ name: "Santorini",  lat: 36.3932, lng:  25.4615, green: false },
	{ name: "Lisbon",     lat: 38.7169, lng:  -9.1399, green: true  },
];

function getMariamCountdown() {
	const target = new Date('2026-05-12T00:00:00Z').getTime();
	const real = Math.max(0, Math.ceil((target - Date.now()) / 86400000));
	return { real, mariam: Math.round(real * 0.6) };
}

export function renderHtml() {
	const placesJson = JSON.stringify(PLACES);
	const { real: realDays, mariam: mariamDays } = getMariamCountdown();

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>For Mariam ❤️</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400&display=swap');

    :root {
      --rose:    #e91e8c;
      --rose-lt: #ff6baa;
      --cream:   #fce4ec;
      --card-bg: rgba(255,255,255,0.04);
      --card-border: rgba(233,30,140,0.35);
    }

    body {
      font-family: 'Lato', 'Segoe UI', sans-serif;
      background: radial-gradient(ellipse at top left, #2a0a2e 0%, #0f0715 50%, #1a0520 100%);
      min-height: 100vh;
      color: var(--cream);
      overflow-x: hidden;
    }

    /* ── Floating hearts ── */
    #hearts-canvas {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .heart {
      position: absolute;
      bottom: -40px;
      font-size: 1.4rem;
      animation: rise linear infinite;
      opacity: 0;
      user-select: none;
    }
    @keyframes rise {
      0%   { transform: translateY(0)   rotate(0deg);  opacity: 0; }
      5%   { opacity: 0.7; }
      90%  { opacity: 0.3; }
      100% { transform: translateY(-110vh) rotate(25deg); opacity: 0; }
    }

    /* ── Layout ── */
    main {
      position: relative;
      z-index: 1;
      max-width: 900px;
      margin: 0 auto;
      padding: 4rem 1.5rem 6rem;
    }

    /* ── Hero ── */
    .hero { text-align: center; margin-bottom: 3.5rem; }
    .hero-heart {
      font-size: 4rem;
      display: block;
      animation: pulse 1.6s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.15); }
    }
    .hero h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(2.4rem, 6vw, 3.8rem);
      font-weight: 700;
      background: linear-gradient(135deg, var(--rose-lt), var(--rose), #c2185b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0.6rem 0 0.4rem;
      line-height: 1.15;
    }
    .hero .subtitle {
      font-size: 1.05rem;
      font-weight: 300;
      color: rgba(252,228,236,0.7);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* ── Divider ── */
    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 2.5rem 0;
      color: var(--rose);
      opacity: 0.6;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--rose));
    }
    .divider::after { background: linear-gradient(to left, transparent, var(--rose)); }

    /* ── Countdown ── */
    .countdown-note {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2rem 2rem 1.8rem;
      margin-bottom: 2rem;
      text-align: center;
      backdrop-filter: blur(8px);
    }
    .countdown-note .note-label {
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(252,228,236,0.5);
      margin-bottom: 0.5rem;
    }
    .countdown-note .note-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.2rem;
      font-style: italic;
      color: rgba(252,228,236,0.9);
      margin-bottom: 1.4rem;
      line-height: 1.6;
    }
    .countdown-boxes { display: flex; justify-content: center; gap: 1rem; }
    .cbox { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
    .cbox-num {
      font-size: 2.4rem;
      font-weight: 700;
      font-family: 'Playfair Display', Georgia, serif;
      background: linear-gradient(135deg, var(--rose-lt), var(--rose));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }
    .cbox-label {
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(252,228,236,0.4);
    }
    .cd-fine-print {
      margin-top: 0.8rem;
      font-size: 0.78rem;
      color: rgba(252,228,236,0.3);
      font-style: italic;
    }

    /* ── Map ── */
    .map-wrap {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      box-shadow: 0 0 40px rgba(233,30,140,0.15);
      height: 420px;
      margin-bottom: 2rem;
    }
    #map { width: 100%; height: 100%; }

    .leaflet-container { background: #0f0715; }
    .leaflet-popup-content-wrapper {
      background: #1e0a2e;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      color: var(--cream);
      box-shadow: 0 4px 20px rgba(233,30,140,0.3);
    }
    .leaflet-popup-tip { background: #1e0a2e; }
    .leaflet-popup-content {
      margin: 10px 14px;
      font-family: 'Lato', sans-serif;
      font-size: 0.95rem;
      white-space: nowrap;
    }
    .leaflet-popup-close-button { color: var(--rose-lt) !important; }
    .leaflet-control-zoom a {
      background: #1e0a2e !important;
      color: var(--rose-lt) !important;
      border-color: var(--card-border) !important;
    }
    .leaflet-control-attribution {
      background: rgba(15,7,21,0.7) !important;
      color: rgba(252,228,236,0.3) !important;
    }
    .leaflet-control-attribution a { color: rgba(252,228,236,0.4) !important; }

    .pin-marker, .pin-marker-green {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid rgba(255,255,255,0.25);
    }
    .pin-marker {
      background: radial-gradient(circle at 40% 35%, #ff6baa, #e91e8c);
      box-shadow: 0 2px 12px rgba(233,30,140,0.6);
    }
    .pin-marker-green {
      background: radial-gradient(circle at 40% 35%, #69f0ae, #00c853);
      box-shadow: 0 2px 12px rgba(0,200,83,0.6);
    }
    .pin-marker::after, .pin-marker-green::after {
      content: '❤';
      transform: rotate(45deg);
      font-size: 13px;
      color: #fff;
      display: block;
    }

    /* ── Letter ── */
    .letter {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2.2rem 2.5rem;
      backdrop-filter: blur(8px);
      line-height: 1.85;
      font-size: 1.05rem;
      font-style: italic;
      color: rgba(252,228,236,0.9);
    }
    .letter p + p { margin-top: 1.1rem; }
    .letter .sign {
      margin-top: 1.6rem;
      text-align: right;
      font-style: normal;
      font-weight: 400;
      color: var(--rose-lt);
    }

    /* ── Footer ── */
    footer {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 2rem 1rem 3rem;
      font-size: 0.85rem;
      color: rgba(252,228,236,0.35);
      letter-spacing: 0.06em;
    }
  </style>
</head>
<body>

<div id="hearts-canvas"></div>

<main>
  <section class="hero">
    <span class="hero-heart">❤️</span>
    <h1>For Mariam</h1>
    <p class="subtitle">with all my love</p>
  </section>

  <div class="countdown-note">
    <p class="note-label">The Mariam Countdown™</p>
    <p class="note-text">It's basically just a couple of weeks until May 12th ❤️</p>
    <div class="countdown-boxes">
      <div class="cbox">
        <span class="cbox-num">${mariamDays === 0 ? "🎉" : mariamDays}</span>
        <span class="cbox-label">days</span>
      </div>
    </div>
    <p class="cd-fine-print">${realDays === 0 ? "Today is the day!" : "(technically " + realDays + " days, but it's basically nothing)"}</p>
  </div>

  <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:1.7rem;font-weight:400;color:var(--rose-lt);margin-bottom:1.2rem;text-align:center;">Places we've been together</h2>
  <div class="map-wrap">
    <div id="map"></div>
  </div>

  <div class="divider">✦</div>

  <article class="letter">
    <p>
      From day one, our relationship has veen a surreal adventure - a fairytale. 
      We talked like friends, laughed like there was nobody around and started a journey which neither knew where would end.
      First it took us to Santorini, and my love, and my perspective on vacations changed. I had an experience which might 
      be matched. An experience which proved to me that you and I are connected - we have to make this work. 
    </p>
    <p>
      I made this update to the page to show you how much I still care. There's a decent chance you'll never see this update. 
      And even when you don't see it - the love is there. Like this update. We are making this work - and I don't want it any 
      other way.
    </p>
    <p>
      You are my favourite person. Always.
    </p>
    <p class="sign">— Yours, forever ❤️</p>
  </article>
</main>

<footer>made with love, just for you ✦ mariam</footer>

<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  try {
    var _places = ${placesJson};
    var _map = L.map('map', { zoomControl: true, scrollWheelZoom: false }).setView([44, 18], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(_map);
    _places.forEach(function(p) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="' + (p.green ? 'pin-marker-green' : 'pin-marker') + '"></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34]
      });
      L.marker([p.lat, p.lng], { icon: icon }).bindPopup('<strong>' + p.name + '</strong>').addTo(_map);
    });
  } catch(e) {}
</script>

<script>
  try {
    var _canvas = document.getElementById('hearts-canvas');
    var _emojis = ['❤️','🌸','✨','💕','💗','🌹'];
    function _spawnHeart() {
      var el = document.createElement('span');
      el.className = 'heart';
      el.textContent = _emojis[Math.floor(Math.random() * _emojis.length)];
      el.style.left = Math.random() * 100 + 'vw';
      var dur = 7 + Math.random() * 8;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = (Math.random() * 3) + 's';
      el.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
      _canvas.appendChild(el);
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, (dur + 3) * 1000);
    }
    for (var _i = 0; _i < 12; _i++) setTimeout(_spawnHeart, _i * 600);
    setInterval(_spawnHeart, 1800);
  } catch(e) {}
</script>
</body>
</html>`;
}
