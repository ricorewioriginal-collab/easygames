/* Spinwelten 3D – selbst gezeichnete Symbole (Runenmaschine, Gewinnplan, Ergebnisse) und Kartenmotive/Avatare (Canvas 2D). */
(function (SW) {
  'use strict';
  const cache = {}, urls = {};
  function ctx(size) { const c = document.createElement('canvas'); c.width = c.height = size; return [c, c.getContext('2d')]; }
  function star(x, cx, cy, n, r1, r2, rot) { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); }
  function grad(x, c1, c2, s) { const g = x.createLinearGradient(0, 0, 0, s); g.addColorStop(0, c1); g.addColorStop(1, c2); return g; }
  function stroke(x, w) { x.lineJoin = 'round'; x.lineCap = 'round'; x.strokeStyle = 'rgba(20,24,52,.85)'; x.lineWidth = w; x.stroke(); }
  const DRAW = {
    sun(x, s, a, b) { const c = s / 2; x.fillStyle = grad(x, a, b, s); star(x, c, c, 12, s * 0.42, s * 0.3, 0); x.fill(); stroke(x, s * 0.025); x.beginPath(); x.arc(c, c, s * 0.22, 0, 7); x.fillStyle = grad(x, '#fff6c8', a, s); x.fill(); stroke(x, s * 0.025); },
    star(x, s, a, b) { const c = s / 2; x.fillStyle = grad(x, a, b, s); star(x, c, c, 4, s * 0.44, s * 0.13, -Math.PI / 2); x.fill(); stroke(x, s * 0.03); x.fillStyle = 'rgba(255,255,255,.75)'; star(x, c - s * 0.05, c - s * 0.08, 4, s * 0.12, s * 0.04, -Math.PI / 2); x.fill(); },
    gear(x, s, a, b) { const c = s / 2; x.fillStyle = grad(x, a, b, s); star(x, c, c, 10, s * 0.42, s * 0.33, 0); x.fill(); stroke(x, s * 0.025); x.beginPath(); x.arc(c, c, s * 0.13, 0, 7); x.fillStyle = '#2a2140'; x.fill(); },
    storm(x, s, a, b) { const c = s / 2; x.beginPath(); x.moveTo(s * 0.18, s * 0.82); x.quadraticCurveTo(s * 0.3, s * 0.4, c + s * 0.1, c - s * 0.05); x.lineTo(s * 0.5, s * 0.36); x.lineTo(s * 0.86, s * 0.14); x.lineTo(s * 0.62, s * 0.5); x.lineTo(s * 0.7, s * 0.52); x.quadraticCurveTo(s * 0.5, s * 0.8, s * 0.18, s * 0.82); x.closePath(); x.fillStyle = grad(x, a, b, s); x.fill(); stroke(x, s * 0.03); x.beginPath(); x.arc(s * 0.32, s * 0.68, s * 0.1, 0, 7); x.fillStyle = '#fff'; x.fill(); },
    compass(x, s, a, b) { const c = s / 2; x.beginPath(); x.arc(c, c, s * 0.4, 0, 7); x.fillStyle = grad(x, '#fff3d0', a, s); x.fill(); stroke(x, s * 0.03); x.fillStyle = b; star(x, c, c, 4, s * 0.36, s * 0.09, -Math.PI / 2); x.fill(); stroke(x, s * 0.02); x.beginPath(); x.arc(c, c, s * 0.06, 0, 7); x.fillStyle = '#ff7a6b'; x.fill(); },
    orb(x, s, a, b) { const c = s / 2; x.beginPath(); x.arc(c, c, s * 0.4, 0, 7); const g = x.createRadialGradient(c - s * 0.12, c - s * 0.12, s * 0.05, c, c, s * 0.42); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, a); g.addColorStop(1, b); x.fillStyle = g; x.fill(); stroke(x, s * 0.03); x.beginPath(); x.moveTo(c, c - s * 0.2); x.lineTo(c + s * 0.17, c - s * 0.1); x.lineTo(c + s * 0.12, c + s * 0.12); x.lineTo(c, c + s * 0.22); x.lineTo(c - s * 0.12, c + s * 0.12); x.lineTo(c - s * 0.17, c - s * 0.1); x.closePath(); x.fillStyle = 'rgba(255,255,255,.55)'; x.fill(); },
    loop(x, s, a, b) { const c = s / 2; x.lineWidth = s * 0.13; x.lineCap = 'round'; x.strokeStyle = 'rgba(20,24,52,.85)'; x.beginPath(); x.arc(c, c, s * 0.28, 0.5, Math.PI * 1.75); x.stroke(); x.lineWidth = s * 0.09; x.strokeStyle = grad(x, a, b, s); x.stroke(); x.beginPath(); const ax = c + Math.cos(Math.PI * 1.75) * s * 0.28, ay = c + Math.sin(Math.PI * 1.75) * s * 0.28; x.moveTo(ax + s * 0.15, ay - s * 0.02); x.lineTo(ax - s * 0.02, ay - s * 0.16); x.lineTo(ax - s * 0.04, ay + s * 0.12); x.closePath(); x.fillStyle = b; x.fill(); stroke(x, s * 0.02); },
    relic(x, s, a, b) { const c = s / 2; for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { x.beginPath(); const px = c + dx * s * 0.18, py = c + dy * s * 0.18; x.moveTo(px, py - s * 0.16); x.lineTo(px + s * 0.16, py); x.lineTo(px, py + s * 0.16); x.lineTo(px - s * 0.16, py); x.closePath(); x.fillStyle = grad(x, a, b, s); x.fill(); stroke(x, s * 0.022); } },
    portal(x, s, a, b) { const c = s / 2; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(c, c, s * (0.4 - i * 0.11), i, i + 4.8); x.lineWidth = s * 0.07; x.strokeStyle = i % 2 ? b : a; x.lineCap = 'round'; x.stroke(); } x.fillStyle = '#fff'; star(x, c, c, 4, s * 0.1, s * 0.03, 0); x.fill(); },
    wonder(x, s, a, b) { const c = s / 2; x.beginPath(); x.arc(c, c, s * 0.42, 0, 7); x.fillStyle = grad(x, '#3a2a70', '#1a1440', s); x.fill(); x.lineWidth = s * 0.04; x.strokeStyle = b; x.stroke(); x.fillStyle = grad(x, a, b, s); star(x, c, c, 5, s * 0.33, s * 0.14, -Math.PI / 2); x.fill(); stroke(x, s * 0.02); for (let i = 0; i < 4; i++) { const an = i * 1.57 + 0.78; x.fillStyle = '#fff'; star(x, c + Math.cos(an) * s * 0.34, c + Math.sin(an) * s * 0.34, 4, s * 0.05, s * 0.015, 0); x.fill(); } }
  };
  // Symbol als Kachel (für die Walzen: mit Hintergrund) oder frei (für UI)
  function symbol(id, size, tile) {
    const key = id + size + (tile ? 't' : '');
    if (cache[key]) return cache[key];
    const d = SW.REELS.SYMBOLS.find(s => s.id === id) || SW.REELS.SYMBOLS[0];
    const [c, x] = ctx(size);
    if (tile) {
      const g = x.createLinearGradient(0, 0, 0, size); g.addColorStop(0, '#fbf3e1'); g.addColorStop(0.5, '#fffaf0'); g.addColorStop(1, '#efe0c4'); x.fillStyle = g; x.fillRect(0, 0, size, size);
      const r = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.5); r.addColorStop(0, d.col + '66'); r.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = r; x.fillRect(0, 0, size, size);
      x.fillStyle = 'rgba(120,90,50,.25)'; x.fillRect(0, 0, size, size * 0.03); x.fillRect(0, size * 0.97, size, size * 0.03);
      x.save(); x.translate(size * 0.1, size * 0.1); x.scale(0.8, 0.8); DRAW[id](x, size, d.col, d.col2); x.restore();
    } else DRAW[id](x, size, d.col, d.col2);
    return (cache[key] = c);
  }
  function url(id, size) { const k = id + (size || 96); return urls[k] || (urls[k] = symbol(id, size || 96, false).toDataURL()); }
  // ---- Kartenmotive (für 240 Karten): Motiv-Form + Palette der Insel + Seltenheitsrahmen ----
  const MOT = {
    star: (x, s) => { star(x, s / 2, s / 2, 5, s * 0.36, s * 0.15, -Math.PI / 2); x.fill(); stroke(x, s * 0.02); },
    moon: (x, s) => { x.beginPath(); x.arc(s / 2, s / 2, s * 0.32, 0.6, 5.7); x.arc(s * 0.6, s * 0.44, s * 0.25, 5.3, 1.0, true); x.closePath(); x.fill(); stroke(x, s * 0.02); },
    sun: (x, s) => { star(x, s / 2, s / 2, 10, s * 0.36, s * 0.26, 0); x.fill(); stroke(x, s * 0.02); },
    crystal: (x, s) => { x.beginPath(); x.moveTo(s / 2, s * 0.12); x.lineTo(s * 0.72, s * 0.4); x.lineTo(s / 2, s * 0.88); x.lineTo(s * 0.28, s * 0.4); x.closePath(); x.fill(); stroke(x, s * 0.02); x.beginPath(); x.moveTo(s * 0.28, s * 0.4); x.lineTo(s * 0.72, s * 0.4); x.moveTo(s / 2, s * 0.12); x.lineTo(s / 2, s * 0.88); stroke(x, s * 0.012); },
    gear: (x, s) => { star(x, s / 2, s / 2, 9, s * 0.36, s * 0.28, 0); x.fill(); stroke(x, s * 0.02); x.beginPath(); x.arc(s / 2, s / 2, s * 0.1, 0, 7); x.fillStyle = 'rgba(0,0,0,.35)'; x.fill(); },
    leaf: (x, s) => { x.beginPath(); x.moveTo(s * 0.2, s * 0.8); x.quadraticCurveTo(s * 0.15, s * 0.2, s * 0.8, s * 0.2); x.quadraticCurveTo(s * 0.8, s * 0.8, s * 0.2, s * 0.8); x.fill(); stroke(x, s * 0.02); x.beginPath(); x.moveTo(s * 0.2, s * 0.8); x.lineTo(s * 0.65, s * 0.35); stroke(x, s * 0.012); },
    flower: (x, s) => { for (let i = 0; i < 6; i++) { const a = i * 1.047; x.beginPath(); x.ellipse(s / 2 + Math.cos(a) * s * 0.17, s / 2 + Math.sin(a) * s * 0.17, s * 0.13, s * 0.08, a, 0, 7); x.fill(); stroke(x, s * 0.012); } x.beginPath(); x.arc(s / 2, s / 2, s * 0.09, 0, 7); x.fillStyle = '#fff1a8'; x.fill(); },
    drop: (x, s) => { x.beginPath(); x.moveTo(s / 2, s * 0.14); x.bezierCurveTo(s * 0.8, s * 0.5, s * 0.78, s * 0.84, s / 2, s * 0.84); x.bezierCurveTo(s * 0.22, s * 0.84, s * 0.2, s * 0.5, s / 2, s * 0.14); x.fill(); stroke(x, s * 0.02); },
    flame: (x, s) => { x.beginPath(); x.moveTo(s / 2, s * 0.1); x.bezierCurveTo(s * 0.9, s * 0.45, s * 0.75, s * 0.88, s / 2, s * 0.88); x.bezierCurveTo(s * 0.2, s * 0.88, s * 0.15, s * 0.5, s * 0.38, s * 0.35); x.quadraticCurveTo(s * 0.4, s * 0.55, s * 0.5, s * 0.55); x.quadraticCurveTo(s * 0.42, s * 0.3, s / 2, s * 0.1); x.fill(); stroke(x, s * 0.02); },
    snowflake: (x, s) => { x.lineWidth = s * 0.05; for (let i = 0; i < 3; i++) { const a = i * 1.047; x.beginPath(); x.moveTo(s / 2 - Math.cos(a) * s * 0.36, s / 2 - Math.sin(a) * s * 0.36); x.lineTo(s / 2 + Math.cos(a) * s * 0.36, s / 2 + Math.sin(a) * s * 0.36); x.strokeStyle = x.fillStyle; x.stroke(); } },
    wave: (x, s) => { x.beginPath(); x.moveTo(s * 0.1, s * 0.7); for (let i = 0; i <= 8; i++) x.quadraticCurveTo(s * (0.1 + i * 0.1) - s * 0.05, s * (i % 2 ? 0.45 : 0.65), s * (0.1 + i * 0.1), s * 0.6); x.lineTo(s * 0.9, s * 0.85); x.lineTo(s * 0.1, s * 0.85); x.closePath(); x.fill(); stroke(x, s * 0.02); },
    shell: (x, s) => { x.beginPath(); x.moveTo(s / 2, s * 0.82); for (let i = 0; i <= 6; i++) { const a = Math.PI + i * Math.PI / 6; x.lineTo(s / 2 + Math.cos(a) * s * 0.36, s * 0.55 + Math.sin(a) * s * 0.36); } x.closePath(); x.fill(); stroke(x, s * 0.02); },
    key: (x, s) => { x.beginPath(); x.arc(s * 0.32, s * 0.4, s * 0.14, 0, 7); x.fill(); stroke(x, s * 0.02); x.fillRect(s * 0.42, s * 0.37, s * 0.4, s * 0.07); x.fillRect(s * 0.7, s * 0.43, s * 0.06, s * 0.12); x.fillRect(s * 0.58, s * 0.43, s * 0.06, s * 0.09); },
    book: (x, s) => { x.fillRect(s * 0.2, s * 0.25, s * 0.6, s * 0.5); x.strokeRect(s * 0.2, s * 0.25, s * 0.6, s * 0.5); x.beginPath(); x.moveTo(s / 2, s * 0.25); x.lineTo(s / 2, s * 0.75); stroke(x, s * 0.02); },
    bell: (x, s) => { x.beginPath(); x.moveTo(s * 0.25, s * 0.7); x.quadraticCurveTo(s * 0.28, s * 0.2, s / 2, s * 0.2); x.quadraticCurveTo(s * 0.72, s * 0.2, s * 0.75, s * 0.7); x.closePath(); x.fill(); stroke(x, s * 0.02); x.beginPath(); x.arc(s / 2, s * 0.76, s * 0.06, 0, 7); x.fill(); },
    lantern: (x, s) => { x.fillRect(s * 0.33, s * 0.3, s * 0.34, s * 0.42); x.strokeRect(s * 0.33, s * 0.3, s * 0.34, s * 0.42); x.beginPath(); x.arc(s / 2, s / 2, s * 0.1, 0, 7); x.fillStyle = '#fff6c8'; x.fill(); },
    feather: (x, s) => { x.beginPath(); x.moveTo(s * 0.25, s * 0.85); x.quadraticCurveTo(s * 0.3, s * 0.3, s * 0.78, s * 0.15); x.quadraticCurveTo(s * 0.65, s * 0.65, s * 0.25, s * 0.85); x.fill(); stroke(x, s * 0.02); },
    mushroom: (x, s) => { x.beginPath(); x.arc(s / 2, s * 0.5, s * 0.3, Math.PI, 0); x.closePath(); x.fill(); stroke(x, s * 0.02); x.fillStyle = '#fff2df'; x.fillRect(s * 0.42, s * 0.5, s * 0.16, s * 0.28); },
    tree: (x, s) => { x.beginPath(); x.moveTo(s / 2, s * 0.12); x.lineTo(s * 0.78, s * 0.66); x.lineTo(s * 0.22, s * 0.66); x.closePath(); x.fill(); stroke(x, s * 0.02); x.fillStyle = '#8a5a35'; x.fillRect(s * 0.45, s * 0.66, s * 0.1, s * 0.18); },
    fish: (x, s) => { x.beginPath(); x.ellipse(s * 0.45, s / 2, s * 0.26, s * 0.15, 0, 0, 7); x.fill(); stroke(x, s * 0.02); x.beginPath(); x.moveTo(s * 0.68, s / 2); x.lineTo(s * 0.86, s * 0.34); x.lineTo(s * 0.86, s * 0.66); x.closePath(); x.fill(); },
    bird: (x, s) => { x.beginPath(); x.moveTo(s * 0.12, s * 0.5); x.quadraticCurveTo(s * 0.3, s * 0.25, s / 2, s * 0.5); x.quadraticCurveTo(s * 0.7, s * 0.25, s * 0.88, s * 0.5); x.quadraticCurveTo(s * 0.7, s * 0.4, s / 2, s * 0.62); x.quadraticCurveTo(s * 0.3, s * 0.4, s * 0.12, s * 0.5); x.fill(); stroke(x, s * 0.02); },
    ship: (x, s) => { x.beginPath(); x.moveTo(s * 0.15, s * 0.62); x.lineTo(s * 0.85, s * 0.62); x.lineTo(s * 0.72, s * 0.8); x.lineTo(s * 0.28, s * 0.8); x.closePath(); x.fill(); stroke(x, s * 0.02); x.beginPath(); x.moveTo(s * 0.5, s * 0.15); x.lineTo(s * 0.75, s * 0.55); x.lineTo(s * 0.5, s * 0.55); x.closePath(); x.fill(); stroke(x, s * 0.02); },
    compass: (x, s) => { x.beginPath(); x.arc(s / 2, s / 2, s * 0.34, 0, 7); x.stroke(); star(x, s / 2, s / 2, 4, s * 0.3, s * 0.07, -Math.PI / 2); x.fill(); stroke(x, s * 0.02); },
    crown: (x, s) => { x.beginPath(); x.moveTo(s * 0.2, s * 0.72); x.lineTo(s * 0.2, s * 0.32); x.lineTo(s * 0.35, s * 0.5); x.lineTo(s / 2, s * 0.25); x.lineTo(s * 0.65, s * 0.5); x.lineTo(s * 0.8, s * 0.32); x.lineTo(s * 0.8, s * 0.72); x.closePath(); x.fill(); stroke(x, s * 0.02); },
    mask: (x, s) => { x.beginPath(); x.ellipse(s / 2, s / 2, s * 0.32, s * 0.22, 0, 0, 7); x.fill(); stroke(x, s * 0.02); x.fillStyle = '#1a1440'; x.beginPath(); x.ellipse(s * 0.38, s * 0.48, s * 0.07, s * 0.05, 0, 0, 7); x.ellipse(s * 0.62, s * 0.48, s * 0.07, s * 0.05, 0, 0, 7); x.fill(); },
    potion: (x, s) => { x.beginPath(); x.arc(s / 2, s * 0.6, s * 0.24, 0, 7); x.fill(); stroke(x, s * 0.02); x.fillRect(s * 0.44, s * 0.2, s * 0.12, s * 0.2); },
    scroll: (x, s) => { x.fillRect(s * 0.25, s * 0.25, s * 0.5, s * 0.5); x.strokeRect(s * 0.25, s * 0.25, s * 0.5, s * 0.5); x.beginPath(); x.arc(s * 0.25, s * 0.25, s * 0.06, 0, 7); x.arc(s * 0.75, s * 0.75, s * 0.06, 0, 7); x.fill(); for (let i = 0; i < 3; i++) { x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(s * 0.32, s * (0.36 + i * 0.1), s * 0.36, s * 0.03); } },
    heart: (x, s) => { x.beginPath(); x.moveTo(s / 2, s * 0.8); x.bezierCurveTo(s * 0.1, s * 0.5, s * 0.25, s * 0.15, s / 2, s * 0.35); x.bezierCurveTo(s * 0.75, s * 0.15, s * 0.9, s * 0.5, s / 2, s * 0.8); x.fill(); stroke(x, s * 0.02); },
    eye: (x, s) => { x.beginPath(); x.moveTo(s * 0.12, s / 2); x.quadraticCurveTo(s / 2, s * 0.15, s * 0.88, s / 2); x.quadraticCurveTo(s / 2, s * 0.85, s * 0.12, s / 2); x.fill(); stroke(x, s * 0.02); x.beginPath(); x.arc(s / 2, s / 2, s * 0.12, 0, 7); x.fillStyle = '#1a1440'; x.fill(); },
    hourglass: (x, s) => { x.beginPath(); x.moveTo(s * 0.28, s * 0.18); x.lineTo(s * 0.72, s * 0.18); x.lineTo(s * 0.52, s / 2); x.lineTo(s * 0.72, s * 0.82); x.lineTo(s * 0.28, s * 0.82); x.lineTo(s * 0.48, s / 2); x.closePath(); x.fill(); stroke(x, s * 0.02); },
    cloud: (x, s) => { x.beginPath(); x.arc(s * 0.36, s * 0.56, s * 0.15, 0, 7); x.arc(s * 0.52, s * 0.46, s * 0.18, 0, 7); x.arc(s * 0.68, s * 0.58, s * 0.13, 0, 7); x.fill(); },
    mountain: (x, s) => { x.beginPath(); x.moveTo(s * 0.1, s * 0.8); x.lineTo(s * 0.4, s * 0.25); x.lineTo(s * 0.55, s * 0.5); x.lineTo(s * 0.68, s * 0.35); x.lineTo(s * 0.9, s * 0.8); x.closePath(); x.fill(); stroke(x, s * 0.02); },
    dragon: (x, s) => { x.beginPath(); x.moveTo(s * 0.15, s * 0.7); x.quadraticCurveTo(s * 0.35, s * 0.3, s * 0.55, s * 0.55); x.quadraticCurveTo(s * 0.7, s * 0.2, s * 0.88, s * 0.3); x.lineTo(s * 0.75, s * 0.4); x.quadraticCurveTo(s * 0.7, s * 0.75, s * 0.15, s * 0.7); x.fill(); stroke(x, s * 0.02); },
    wing: (x, s) => { x.beginPath(); x.moveTo(s * 0.2, s * 0.7); x.quadraticCurveTo(s * 0.3, s * 0.15, s * 0.85, s * 0.2); x.lineTo(s * 0.7, s * 0.35); x.lineTo(s * 0.78, s * 0.45); x.lineTo(s * 0.6, s * 0.5); x.lineTo(s * 0.65, s * 0.62); x.closePath(); x.fill(); stroke(x, s * 0.02); },
    ring: (x, s) => { x.beginPath(); x.arc(s / 2, s * 0.56, s * 0.24, 0, 7); x.lineWidth = s * 0.08; x.strokeStyle = x.fillStyle; x.stroke(); x.fillStyle = '#bff4ff'; star(x, s / 2, s * 0.26, 4, s * 0.1, s * 0.04, 0); x.fill(); },
    tower: (x, s) => { x.fillRect(s * 0.38, s * 0.3, s * 0.24, s * 0.52); x.strokeRect(s * 0.38, s * 0.3, s * 0.24, s * 0.52); x.beginPath(); x.moveTo(s * 0.33, s * 0.3); x.lineTo(s / 2, s * 0.1); x.lineTo(s * 0.67, s * 0.3); x.closePath(); x.fill(); stroke(x, s * 0.02); }
  };
  function cardArt(card, size) {
    const key = 'card' + card.id + size; if (cache[key]) return cache[key];
    const w = (SW.WORLDS || [])[card.w - 1], pal = w ? w.pal : { sky: '#0d1b3d', horizon: '#3fd8e8', accent: '#ff7a6b', accent2: '#f2d08a', glow: '#fff4c2' };
    const [c, x] = ctx(size), rar = (SW.RARITY || [])[card.r] || { col: '#9fb4c8' };
    const g = x.createLinearGradient(0, 0, size, size); g.addColorStop(0, pal.sky); g.addColorStop(1, pal.horizon); x.fillStyle = g; x.fillRect(0, 0, size, size);
    const rng = SW.rng.seeded(card.id);
    for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.1 + rng.next() * 0.3) + ')'; x.beginPath(); x.arc(rng.next() * size, rng.next() * size, 1 + rng.next() * size * 0.02, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(size / 2, size * 0.52, size * 0.38, 0, 7); x.fill();
    x.fillStyle = card.r >= 2 ? pal.glow : (rng.next() < 0.5 ? pal.accent : pal.accent2);
    x.strokeStyle = 'rgba(20,24,52,.85)';
    x.save(); x.translate(size * 0.12, size * 0.12); x.scale(0.76, 0.76); (MOT[card.motif] || MOT.star)(x, size); x.restore();
    x.lineWidth = size * (0.03 + card.r * 0.012); x.strokeStyle = rar.col; x.strokeRect(x.lineWidth / 2, x.lineWidth / 2, size - x.lineWidth, size - x.lineWidth);
    if (card.r === 3) { x.fillStyle = 'rgba(255,240,180,.25)'; for (let i = 0; i < 6; i++) { star(x, rng.next() * size, rng.next() * size, 4, size * 0.05, size * 0.015, 0); x.fill(); } }
    return (cache[key] = c);
  }
  function cardUrl(card, size) { const k = 'cu' + card.id + (size || 160); return urls[k] || (urls[k] = cardArt(card, size || 160).toDataURL('image/png')); }
  // Avatar für Bots (Farbe, Gesicht, Hut)
  function avatar(look, size) {
    const key = 'av' + JSON.stringify(look) + size; if (urls[key]) return urls[key];
    const [c, x] = ctx(size), s = size;
    const g = x.createRadialGradient(s / 2, s * 0.4, s * 0.1, s / 2, s / 2, s * 0.55); g.addColorStop(0, '#2a3d6e'); g.addColorStop(1, '#0d1b3d'); x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, 7); x.fill();
    x.fillStyle = look.col; x.beginPath();
    if (look.face === 'square') { const r = s * 0.1, X = s * 0.24, Y = s * 0.3, W = s * 0.52, H = s * 0.5; x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); }
    else if (look.face === 'oval') x.ellipse(s / 2, s * 0.56, s * 0.24, s * 0.28, 0, 0, 7);
    else x.arc(s / 2, s * 0.56, s * 0.27, 0, 7);
    x.fill(); stroke(x, s * 0.025);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(s * 0.41, s * 0.52, s * 0.06, 0, 7); x.arc(s * 0.59, s * 0.52, s * 0.06, 0, 7); x.fill();
    x.fillStyle = '#14204a'; x.beginPath(); x.arc(s * 0.42, s * 0.53, s * 0.03, 0, 7); x.arc(s * 0.6, s * 0.53, s * 0.03, 0, 7); x.fill();
    x.beginPath(); x.arc(s / 2, s * 0.64, s * 0.07, 0.2, Math.PI - 0.2); x.lineWidth = s * 0.02; x.strokeStyle = '#14204a'; x.stroke();
    x.fillStyle = '#f2d08a'; x.strokeStyle = 'rgba(20,24,52,.85)';
    const h = look.hat;
    const top = (fn) => { x.save(); x.translate(s * 0.25, -s * 0.02); x.scale(0.5, 0.5); fn(x, s); x.restore(); };
    if (h === 'crown') top(MOT.crown);
    else if (h === 'star') { x.fillStyle = '#ffd98a'; top(MOT.star); }
    else if (h === 'gear') { x.fillStyle = '#d8b26a'; top(MOT.gear); }
    else if (h === 'leaf') { x.fillStyle = '#7bd88f'; top(MOT.leaf); }
    else if (h === 'shell') { x.fillStyle = '#ff9e8a'; top(MOT.shell); }
    else if (h === 'book') { x.fillStyle = '#c58bff'; top(MOT.book); }
    else if (h === 'bolt') { x.fillStyle = '#ffe066'; top(MOT.flame); }
    else { x.fillStyle = { goggles: '#ff7a6b', antenna: '#7fe8ff', explorer: '#c9a46a', pilot: '#9a6a3f', chef: '#ffffff', beanie: '#3fd8e8', jester: '#ff8ae0', helmet: '#2ec4a6' }[h] || '#f2d08a'; x.beginPath(); x.arc(s / 2, s * 0.32, s * 0.2, Math.PI, 0); x.closePath(); x.fill(); stroke(x, s * 0.02); }
    return (urls[key] = c.toDataURL());
  }
  SW.Symbols = { symbol, url, cardArt, cardUrl, avatar, MOTIFS: Object.keys(MOT) };
})(globalThis.SW = globalThis.SW || {});
