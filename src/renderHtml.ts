type Note = { id: number; author: string; message: string; created_at: string };

function esc(s: string) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtDate(raw: string) {
	const d = new Date(raw.includes("T") ? raw : raw.replace(" ", "T") + "Z");
	return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

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

export function renderHtml(notes: Note[]) {
	const placesJson = JSON.stringify(PLACES);

	const notesHtml = notes.length === 0
		? `<p class="notes-empty">No notes yet — be the first to write one ❤️</p>`
		: notes.map(({ message, created_at }) => `
        <div class="note-card">
          <div class="note-meta">
            <span class="note-date">${fmtDate(created_at)}</span>
          </div>
          <p class="note-msg">${esc(message)}</p>
        </div>`).join("");

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

    /* ── Countdown ── */
    .countdown-note {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2rem 2rem 1.8rem;
      margin-bottom: 3rem;
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
    .countdown-boxes {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .cbox {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
    }
    .cbox-num {
      font-size: 2.4rem;
      font-weight: 700;
      font-family: 'Playfair Display', Georgia, serif;
      background: linear-gradient(135deg, var(--rose-lt), var(--rose));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      min-width: 2.8ch;
      line-height: 1;
    }
    .cbox-label {
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(252,228,236,0.4);
    }

    /* ── Map ── */
    .map-wrap {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      box-shadow: 0 0 40px rgba(233,30,140,0.15);
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

    /* ── Notes ── */
    .notes-form-wrap {
      margin-bottom: 2rem;
    }
    .notes-form {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .notes-input, .notes-textarea {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 0.9rem 1.1rem;
      color: var(--cream);
      font-family: 'Lato', sans-serif;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
      backdrop-filter: blur(6px);
      width: 100%;
    }
    .notes-input::placeholder, .notes-textarea::placeholder { color: rgba(252,228,236,0.3); }
    .notes-input:focus, .notes-textarea:focus { border-color: var(--rose); }
    .notes-textarea { resize: vertical; min-height: 90px; }
    .notes-btn {
      align-self: flex-end;
      background: linear-gradient(135deg, var(--rose-lt), var(--rose));
      border: none;
      border-radius: 10px;
      color: #fff;
      font-family: 'Lato', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0.7rem 1.6rem;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    .notes-btn:hover { opacity: 0.88; transform: translateY(-1px); }
    .notes-list { display: flex; flex-direction: column; gap: 1rem; }
    .note-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.2rem 1.4rem;
      backdrop-filter: blur(6px);
    }
    .note-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.5rem;
      gap: 1rem;
    }
    .note-author {
      font-weight: 600;
      color: var(--rose-lt);
      font-size: 0.95rem;
    }
    .note-date {
      font-size: 0.75rem;
      color: rgba(252,228,236,0.35);
      white-space: nowrap;
    }
    .note-msg {
      font-size: 0.95rem;
      line-height: 1.65;
      color: rgba(252,228,236,0.88);
      white-space: pre-wrap;
    }
    .cd-fine-print {
      margin-top: 0.8rem;
      font-size: 0.78rem;
      color: rgba(252,228,236,0.3);
      font-style: italic;
    }
    .notes-empty {
      text-align: center;
      color: rgba(252,228,236,0.35);
      font-style: italic;
      padding: 1.5rem 0;
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

  <div class="divider">✦</div>

  <h2 class="section-title">Notes to each other</h2>
  <div class="notes-form-wrap">
    <form method="POST" action="/notes" class="notes-form">
      <textarea class="notes-textarea" name="message" placeholder="Write a note..." required maxlength="1000"></textarea>
      <button class="notes-btn" type="submit">Send ❤️</button>
    </form>
  </div>
  <div class="notes-list">
    ${notesHtml}
  </div>

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

  <div class="countdown-note">
    <p class="note-label">The Mariam Countdown™</p>
    <p class="note-text">It's basically just a couple of weeks until May 12th ❤️</p>
    <div class="countdown-boxes">
      <div class="cbox"><span class="cbox-num" id="cd-weeks">--</span><span class="cbox-label">days</span></div>
    </div>
    <p class="cd-fine-print" id="cd-fine-print"></p>
  </div>

  <div class="divider">✦</div>

  <h2 class="section-title">Places we've been together</h2>
  <div class="map-wrap">
    <div id="map"></div>
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

    /* ── Countdown (Mariam edition) ── */
    (function () {
      const target = new Date('2026-05-12T00:00:00');
      function tick() {
        const diff = target - Date.now();
        if (diff <= 0) {
          document.querySelector('.countdown-note .note-text').textContent = 'Today is the day! 🎉❤️';
          document.getElementById('cd-weeks').textContent = '0';
          document.getElementById('cd-fine-print').textContent = '';
          return;
        }
        const days = Math.ceil(diff / 86400000);
        const mariamDays = Math.round(days * 0.6);
        document.getElementById('cd-weeks').textContent = String(mariamDays);
        document.getElementById('cd-fine-print').textContent = '(technically ' + days + ' days, but it\'s basically nothing)';
      }
      tick();
    })();

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
