type LoveNote = { id: number; reason: string; icon: string };

const PLACES = [
	{ name: "Madeira", lat: 32.7607, lng: -16.9595 },
	{ name: "Athens", lat: 37.9838, lng: 23.7275 },
	{ name: "Porto", lat: 41.1579, lng: -8.6291 },
	{ name: "Copenhagen", lat: 55.6761, lng: 12.5683 },
	{ name: "Tbilisi", lat: 41.6938, lng: 44.8015 },
	{ name: "Kutaisi", lat: 42.2679, lng: 42.6946 },
	{ name: "Juta", lat: 42.65, lng: 44.517 },
	{ name: "Santorini", lat: 36.3932, lng: 25.4615 },
];

export function renderHtml(notes: LoveNote[]) {
	const cards = notes
		.map(
			({ reason, icon }) => `
        <div class="card">
          <div class="card-icon">${icon}</div>
          <p class="card-reason">${reason}</p>
        </div>`
		)
		.join("");

	const placesJson = JSON.stringify(PLACES);

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>For Mariam ❤️</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400&display=swap');

    :root {
      --rose:    #e91e8c;
      --rose-lt: #ff6baa;
      --cream:   #fce4ec;
      --bg1:     #0f0715;
      --bg2:     #1e0a2e;
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
      0%   { transform: translateY(0)   rotate(0deg);   opacity: 0; }
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
    .hero {
      text-align: center;
      margin-bottom: 3.5rem;
    }
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

    /* ── Letter ── */
    .letter {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2.2rem 2.5rem;
      margin-bottom: 3rem;
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

    /* ── Section heading ── */
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.7rem;
      font-weight: 400;
      color: var(--rose-lt);
      margin-bottom: 1.8rem;
      text-align: center;
    }

    /* ── Map ── */
    .map-wrap {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      box-shadow: 0 0 40px rgba(233,30,140,0.15);
      margin-bottom: 4rem;
      height: 420px;
    }
    #map { width: 100%; height: 100%; }

    /* Leaflet overrides */
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
      font-weight: 400;
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

    /* Custom pin marker */
    .pin-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: radial-gradient(circle at 40% 35%, #ff6baa, #e91e8c);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 12px rgba(233,30,140,0.6);
      border: 2px solid rgba(255,255,255,0.25);
    }
    .pin-marker::after {
      content: '❤';
      transform: rotate(45deg);
      font-size: 13px;
      color: #fff;
      display: block;
    }

    /* ── Cards grid ── */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.2rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.6rem 1.4rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.9rem;
      backdrop-filter: blur(6px);
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: var(--rose);
      box-shadow: 0 8px 32px rgba(233,30,140,0.25);
    }
    .card-icon { font-size: 2.2rem; line-height: 1; }
    .card-reason {
      font-size: 0.95rem;
      line-height: 1.6;
      color: rgba(252,228,236,0.88);
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
    <p class="subtitle">A few of the reasons I love you</p>
  </section>

  <div class="divider">✦</div>

  <article class="letter">
    <p>
      There are moments in life that quietly redefine everything — and you, Mariam,
      are one of those moments for me. Every single day I spend with you reminds me
      how lucky I am.
    </p>
    <p>
      I made this little page because I wanted you to know — in a way I hope feels
      as real as I mean it — just how much you mean to me. These are not just words.
      They are the truest things I know.
    </p>
    <p>
      You are my favourite person. Always.
    </p>
    <p class="sign">— Yours, forever ❤️</p>
  </article>

  <div class="divider">✦</div>

  <h2 class="section-title">Places we've been together</h2>
  <div class="map-wrap">
    <div id="map"></div>
  </div>

  <h2 class="section-title">Reasons I love you</h2>
  <div class="grid">
    ${cards}
  </div>
</main>

<footer>made with love, just for you ✦ mariam</footer>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  (function () {
    /* ── Floating hearts ── */
    const canvas = document.getElementById('hearts-canvas');
    const emojis = ['❤️', '🌸', '✨', '💕', '💗', '🌹'];
    function spawnHeart() {
      const el = document.createElement('span');
      el.className = 'heart';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = Math.random() * 100 + 'vw';
      const dur = 7 + Math.random() * 8;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = (Math.random() * 3) + 's';
      el.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
      canvas.appendChild(el);
      setTimeout(() => el.remove(), (dur + 3) * 1000);
    }
    for (let i = 0; i < 12; i++) setTimeout(spawnHeart, i * 600);
    setInterval(spawnHeart, 1800);

    /* ── Map ── */
    const places = ${placesJson};

    const map = L.map('map', { zoomControl: true, scrollWheelZoom: false }).setView([44, 18], 4);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: '',
      html: '<div class="pin-marker"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34],
    });

    places.forEach(function(p) {
      L.marker([p.lat, p.lng], { icon: pinIcon })
        .bindPopup('<strong>' + p.name + '</strong>')
        .addTo(map);
    });
  })();
</script>
</body>
</html>`;
}
