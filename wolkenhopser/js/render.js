/* Wolkenhopser – Zeichnen mit Canvas 2D (leicht für jedes Gerät): Himmel je nach Höhe (Wiese, Wolken, Abend, Nacht, All),
 * Parallax-Hügel, Wolken und Sterne, Plattformen, Federn, Gegenstände, Monster, Münzen, Hopsi mit Skins, Partikel. */
(function () {
  'use strict';
  const WH = window.WH, W = WH.W;
  let cv, g, dpr = 1, scale = 1, offX = 0, vh = 700, low = false, t = 0, parts = [], stars = [], clouds = [];
  const SKY = [['#7fd3ff', '#d8f3ff'], ['#9ac8ff', '#f4e6ff'], ['#ff9a76', '#ffd6a5'], ['#1d2b64', '#3a3f8f'], ['#05060f', '#141a3a']];
  function init(canvas, opt) {
    cv = canvas; g = cv.getContext('2d'); low = !!(opt && opt.low);
    const r = Math.random; for (let i = 0; i < 90; i++) stars.push({ x: r() * W, y: r() * 2000, s: .5 + r() * 1.6, p: r() * 6 });
    for (let i = 0; i < 9; i++) clouds.push({ x: r() * W, y: r() * 1600, s: .6 + r() * .9, sp: 6 + r() * 14 });
    resize(); addEventListener('resize', resize);
  }
  function resize() { if (!cv) return; dpr = Math.min(devicePixelRatio || 1, low ? 1 : 2); const w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); scale = Math.min(cv.width / W, cv.height / 620); offX = (cv.width - W * scale) / 2; vh = cv.height / scale; }
  const mix = (a, b, k) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = s => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k); return 'rgb(' + c(16) + ',' + c(8) + ',' + c(0) + ')'; };
  function skyAt(y) { const Z = WH.ZONES; let i = WH.zoneAt(y); const z0 = Z[i], z1 = Z[i + 1]; if (!z1) return SKY[i]; const k = Math.max(0, Math.min(1, (y - z1.y + 1200) / 1200)); return [mix(SKY[i][0], SKY[i + 1][0], k), mix(SKY[i][1], SKY[i + 1][1], k)]; }
  const sy = (G, y) => (G.camY + vh - y);   // Weltkoordinate → Bildschirm (y nach unten)
  function rr(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
  function burst(x, y, n, cols, sp) { if (low) n = Math.ceil(n / 2); for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = sp * (.3 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s + sp * .4, l: .5 + Math.random() * .5, c: cols[i % cols.length], r: 2 + Math.random() * 3 }); } }
  function fx(e) {
    if (e.k === 'jump' && e.type === 'vanish') burst(e.x, e.y, 10, ['#ffffff', '#c8f1ff'], 160);
    else if (e.k === 'spring') burst(e.x, e.y, 10, ['#ffd23f', '#ffffff'], 200);
    else if (e.k === 'tramp') burst(e.x, e.y, 18, ['#ff5c7a', '#ffd23f', '#7bdc5a'], 260);
    else if (e.k === 'break') burst(e.x, e.y, 14, ['#a0683a', '#7a4b26'], 140);
    else if (e.k === 'coin') burst(e.x, e.y, 8, ['#ffd23f', '#fff2b8'], 140);
    else if (e.k === 'kill') burst(e.x, e.y, 22, ['#ff5c7a', '#ffffff', '#8e5cff'], 240);
    else if (e.k === 'hurt') burst(e.x, e.y, 8, ['#ffffff'], 160);
    else if (e.k === 'shieldPop') burst(e.x || 200, e.y || 0, 20, ['#8fe3ff', '#ffffff'], 220);
  }
  // Hopsi zeichnen (eigene Figur: runde Bohne mit Sprungfedern)
  function hopsi(x, y, sk, face, squash, P, tt) {
    const s = 1 + squash * .25, w = 38 * (1 + squash * .18), h = 42 * (1 - squash * .2);
    g.save(); g.translate(x, y); if (P && P.flip) g.rotate(P.flip * Math.PI); g.scale(face, 1);
    // Federbeine
    g.strokeStyle = '#3b2f4f'; g.lineWidth = 3; for (const lx of [-9, 9]) { g.beginPath(); g.moveTo(lx, 0); for (let k = 1; k <= 4; k++) g.lineTo(lx + (k % 2 ? 4 : -4), 3 + k * 3 * (1 - squash * .6)); g.stroke(); }
    g.fillStyle = '#3b2f4f'; for (const lx of [-9, 9]) { rr(lx - 6, 14 * (1 - squash * .6) + 2, 12, 5, 3); g.fill(); }
    // Körper
    g.fillStyle = sk.body; g.strokeStyle = '#2a2140'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -h / 2, w / 2, h / 2, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = sk.belly; g.beginPath(); g.ellipse(2, -h / 2 + 7, w / 3.2, h / 3.4, 0, 0, 7); g.fill();
    // Gesicht
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(7, -h * .66, 7, 8, 0, 0, 7); g.fill(); g.strokeStyle = '#2a2140'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#2a2140'; g.beginPath(); g.arc(9, -h * .64, 3.4, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(10, -h * .67, 1.2, 0, 7); g.fill();
    g.strokeStyle = '#2a2140'; g.lineWidth = 2.5; g.beginPath(); g.arc(12, -h * .42, 5, .2, Math.PI - .6); g.stroke();
    g.fillStyle = 'rgba(255,120,150,.5)'; g.beginPath(); g.ellipse(-2, -h * .45, 4, 2.5, 0, 0, 7); g.fill();
    // Extras je Skin
    const ex = sk.ex; g.lineWidth = 3; g.strokeStyle = '#2a2140';
    if (ex === 'stem') { g.strokeStyle = '#3c8d2f'; g.beginPath(); g.moveTo(0, -h); g.quadraticCurveTo(4, -h - 12, 10, -h - 14); g.stroke(); g.fillStyle = '#5cc04a'; g.beginPath(); g.ellipse(8, -h - 10, 6, 3, -.5, 0, 7); g.fill(); }
    else if (ex === 'band') { g.fillStyle = '#ff3b3b'; g.fillRect(-w / 2 + 2, -h * .8, w - 4, 6); g.beginPath(); g.moveTo(-w / 2 + 2, -h * .78); g.lineTo(-w / 2 - 10, -h * .9 + Math.sin(tt * 12) * 3); g.lineTo(-w / 2 - 8, -h * .7); g.fill(); }
    else if (ex === 'helmet') { g.strokeStyle = 'rgba(140,200,255,.9)'; g.lineWidth = 2.5; g.beginPath(); g.arc(0, -h / 2 - 2, w / 2 + 6, 0, 7); g.stroke(); g.fillStyle = 'rgba(180,220,255,.18)'; g.fill(); }
    else if (ex === 'antenna') { g.beginPath(); g.moveTo(0, -h); g.lineTo(0, -h - 12); g.stroke(); g.fillStyle = Math.sin(tt * 8) > 0 ? '#ff3b3b' : '#ffd23f'; g.beginPath(); g.arc(0, -h - 14, 4, 0, 7); g.fill(); }
    else if (ex === 'scoop') { g.fillStyle = '#ff9ec4'; g.beginPath(); g.arc(0, -h + 2, 11, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(0, -h - 10, 4, 0, 7); g.fill(); }
    else if (ex === 'horns') { g.fillStyle = '#fff2b8'; for (const hx of [-8, 6]) { g.beginPath(); g.moveTo(hx - 4, -h + 4); g.lineTo(hx, -h - 10); g.lineTo(hx + 4, -h + 4); g.closePath(); g.fill(); g.stroke(); } }
    else if (ex === 'crown') { g.fillStyle = '#ffb703'; g.beginPath(); g.moveTo(-10, -h + 2); g.lineTo(-10, -h - 8); g.lineTo(-5, -h - 2); g.lineTo(0, -h - 10); g.lineTo(5, -h - 2); g.lineTo(10, -h - 8); g.lineTo(10, -h + 2); g.closePath(); g.fill(); g.stroke(); }
    // Propeller / Rakete / Schild
    if (P && P.prop > 0) { g.fillStyle = '#ff5c7a'; rr(-12, -h - 6, 24, 7, 3); g.fill(); g.stroke(); const a = tt * 40; g.strokeStyle = '#3a86ff'; g.lineWidth = 4; g.beginPath(); g.moveTo(-18 * Math.cos(a), -h - 9); g.lineTo(18 * Math.cos(a), -h - 9); g.stroke(); }
    if (P && P.jet > 0) { g.fillStyle = '#9aa6b8'; rr(-w / 2 - 12, -h * .8, 12, 26, 4); g.fill(); g.stroke(); g.fillStyle = Math.random() < .5 ? '#ffd23f' : '#ff6b35'; g.beginPath(); g.moveTo(-w / 2 - 11, -h * .8 + 26); g.lineTo(-w / 2 - 6, -h * .8 + 44 + Math.random() * 12); g.lineTo(-w / 2 - 1, -h * .8 + 26); g.fill(); }
    g.restore();
    if (P && P.shield) { g.strokeStyle = 'rgba(143,227,255,' + (.6 + Math.sin(tt * 6) * .3) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(x, y - 22, 34, 0, 7); g.stroke(); }
  }
  // Plattformen
  function plat(G, p) {
    const x = p.x, y = sy(G, p.y + WH.PLH), w = p.w, h = WH.PLH;
    if (p.gone) return;
    g.lineWidth = 2.5; g.strokeStyle = '#2a2140';
    if (p.type === 'normal') { g.fillStyle = '#8b5a33'; rr(x, y + 4, w, h - 2, 6); g.fill(); g.stroke(); g.fillStyle = '#6ed04a'; rr(x - 1, y, w + 2, 8, 5); g.fill(); g.stroke(); g.fillStyle = '#9bf06f'; g.fillRect(x + 6, y + 2, w - 24, 2); }
    else if (p.type === 'move') { g.fillStyle = '#3a86ff'; rr(x, y, w, h, 7); g.fill(); g.stroke(); g.fillStyle = '#cfe2ff'; g.font = '900 11px system-ui'; g.textAlign = 'center'; g.fillText('◀ ▶', x + w / 2, y + 11); }
    else if (p.type === 'vanish') { g.fillStyle = 'rgba(255,255,255,.95)'; g.setLineDash([5, 4]); rr(x, y, w, h, 7); g.fill(); g.stroke(); g.setLineDash([]); }
    else if (p.type === 'break') { const a = p.alive ? 0 : Math.min(1, (p.fall || 0) * 2); g.save(); g.globalAlpha = 1 - a * .6; g.fillStyle = '#c08552'; for (const [ox, rot] of [[0, -a * .5], [w / 2, a * .5]]) { g.save(); g.translate(x + ox + w / 4, y + h / 2); g.rotate(rot); rr(-w / 4, -h / 2, w / 2, h, 4); g.fill(); g.stroke(); g.restore(); } g.strokeStyle = '#5a3418'; g.beginPath(); g.moveTo(x + w / 2, y + 1); g.lineTo(x + w / 2 - 3, y + h / 2); g.lineTo(x + w / 2 + 2, y + h - 1); g.stroke(); g.restore(); }
  }
  function item(G, it) {
    const p = G.plats.find(q => q.id === it.pid); if (!p || p.gone || it.got) return; const x = p.x + it.dx, y = sy(G, p.y + WH.PLH);
    g.lineWidth = 2; g.strokeStyle = '#2a2140';
    if (it.type === 'spring') { const ext = it.used ? 10 : 0; g.strokeStyle = '#7a7f8c'; g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 4; k++) g.lineTo(x + 4 + (k % 2) * 12, y - 2 - k * (3 + ext / 4)); g.stroke(); g.fillStyle = '#ffd23f'; g.strokeStyle = '#2a2140'; g.lineWidth = 2; rr(x, y - 16 - ext, 20, 5, 2); g.fill(); g.stroke(); }
    else if (it.type === 'tramp') { g.fillStyle = '#ff5c7a'; rr(x, y - 12, 40, 6, 3); g.fill(); g.stroke(); g.strokeStyle = '#2a2140'; g.beginPath(); g.moveTo(x + 4, y - 6); g.lineTo(x + 2, y); g.moveTo(x + 36, y - 6); g.lineTo(x + 38, y); g.stroke(); }
    else { const em = { prop: '🧢', jet: '🚀', shield: '🫧' }[it.type]; g.font = '22px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; g.textAlign = 'center'; g.fillText(em, x + 12, y - 4 + Math.sin(t * 4) * 2); }
  }
  function mon(G, m) {
    const x = m.x, y = sy(G, m.y + m.h), w = m.w, h = m.h; g.lineWidth = 2.5; g.strokeStyle = '#2a2140';
    g.save(); if (!m.alive) { g.translate(x + w / 2, y + h / 2); g.rotate((m.fall || 0) * 6); g.translate(-x - w / 2, -y - h / 2); }
    if (m.kind === 'blob') { g.fillStyle = '#8e5cff'; g.beginPath(); g.moveTo(x, y + h); for (let k = 0; k <= 6; k++) g.lineTo(x + k * w / 6, y + h - (k % 2 ? 6 : 0)); g.lineTo(x + w, y + h * .45); g.quadraticCurveTo(x + w / 2, y - 6, x, y + h * .45); g.closePath(); g.fill(); g.stroke(); eyes(x + w / 2, y + h * .42, 8); }
    else if (m.kind === 'bat') { const f = Math.sin(t * 16) * 8; g.fillStyle = '#3d3355'; g.beginPath(); g.moveTo(x + w / 2, y + h / 2); g.lineTo(x - 6, y + f); g.lineTo(x + 8, y + h / 2 + 6); g.lineTo(x + w / 2, y + h / 2 + 4); g.lineTo(x + w - 8, y + h / 2 + 6); g.lineTo(x + w + 6, y + f); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#5b4d7d'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 12, 0, 7); g.fill(); g.stroke(); eyes(x + w / 2, y + h / 2 - 2, 5, '#ffd23f'); }
    else { g.fillStyle = '#9aa6b8'; g.beginPath(); g.ellipse(x + w / 2, y + h * .65, w / 2, h * .3, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(160,230,255,.85)'; g.beginPath(); g.arc(x + w / 2, y + h * .5, w * .24, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = '#7bdc5a'; g.beginPath(); g.arc(x + w / 2, y + h * .48, 7, 0, 7); g.fill(); for (let k = 0; k < 4; k++) { g.fillStyle = Math.sin(t * 10 + k) > 0 ? '#ffd23f' : '#ff5c7a'; g.beginPath(); g.arc(x + 10 + k * (w - 20) / 3, y + h * .72, 3, 0, 7); g.fill(); } if (m.hp > 1) { g.fillStyle = '#fff'; g.font = '900 10px system-ui'; g.textAlign = 'center'; g.fillText('●●', x + w / 2, y + 8); } }
    g.restore();
  }
  function eyes(cx, cy, r, col) { for (const dx of [-r * 1.2, r * 1.2]) { g.fillStyle = col || '#fff'; g.beginPath(); g.arc(cx + dx, cy, r, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#2a2140'; g.beginPath(); g.arc(cx + dx + r * .25, cy + r * .2, r * .45, 0, 7); g.fill(); } }
  // Bild zeichnen. ghosts: [{ y, name, col }] (Online-Rennen)
  function draw(G, sk, dt, ghosts) {
    if (!g) return; t += dt; g.setTransform(scale, 0, 0, scale, offX, 0); const ex = offX / scale;
    const cam = G ? G.camY : 0, [c0, c1] = skyAt(cam + vh / 2), grd = g.createLinearGradient(0, 0, 0, vh); grd.addColorStop(0, c0); grd.addColorStop(1, c1); g.fillStyle = grd; g.fillRect(-ex - 2, 0, W + ex * 2 + 4, vh);
    // Sterne ab Abendhimmel
    const z = WH.zoneAt(cam); if (z >= 2) { const a = Math.min(1, (cam - 5000) / 3000); g.fillStyle = '#ffffff'; for (const s of stars) { const yy = (s.y - cam * .15) % 2000; const py = ((yy % 2000) + 2000) % 2000 * vh / 2000; g.globalAlpha = a * (.5 + Math.sin(t * 2 + s.p) * .4); g.fillRect(s.x, py, s.s, s.s); } g.globalAlpha = 1; }
    if (z >= 4) { g.fillStyle = '#ff9f1c'; g.beginPath(); g.arc(320, 120 + (cam * .02 % 400), 34, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = 4; g.beginPath(); g.ellipse(320, 120 + (cam * .02 % 400), 56, 12, -.3, 0, 7); g.stroke(); }
    // Hügel am Boden (Parallax)
    if (cam < 1200) { const base = vh + cam * .5; g.fillStyle = '#9be37a'; g.beginPath(); g.moveTo(-ex, base); for (let x = Math.floor(-ex / 20) * 20; x <= W + ex + 20; x += 20) g.lineTo(x, base - 60 - Math.sin(x / 60) * 25); g.lineTo(W + ex + 20, vh + 400); g.lineTo(-ex - 20, vh + 400); g.fill(); g.fillStyle = '#6fcf4a'; g.beginPath(); g.moveTo(-ex, vh + cam); for (let x = Math.floor(-ex / 20) * 20; x <= W + ex + 20; x += 20) g.lineTo(x, vh + cam - 30 - Math.sin(x / 40 + 1) * 14); g.lineTo(W + ex + 20, vh + 400 + cam); g.lineTo(-ex - 20, vh + 400 + cam); g.fill(); }
    // Wolken (unter Abendhimmel weiß, nachts dunkel)
    if (z < 3) { g.fillStyle = z === 2 ? 'rgba(255,214,190,.75)' : 'rgba(255,255,255,.8)'; for (const c of clouds) { c.x += c.sp * dt; if (c.x > W + 80) c.x = -80; const py = (((c.y - cam * .4) % 1600) + 1600) % 1600 * vh / 1600; g.beginPath(); g.ellipse(c.x, py, 40 * c.s, 14 * c.s, 0, 0, 7); g.ellipse(c.x + 22 * c.s, py - 8 * c.s, 26 * c.s, 14 * c.s, 0, 0, 7); g.ellipse(c.x - 20 * c.s, py - 4 * c.s, 22 * c.s, 11 * c.s, 0, 0, 7); g.fill(); } }
    if (G) {
      for (const h of G.holes) { const x = h.x, y = sy(G, h.y); if (y < -80 || y > vh + 80) continue; const gr = g.createRadialGradient(x, y, 4, x, y, h.r * 1.8); gr.addColorStop(0, '#000'); gr.addColorStop(.5, 'rgba(60,20,90,.9)'); gr.addColorStop(1, 'rgba(60,20,90,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, h.r * 1.8, 0, 7); g.fill(); g.strokeStyle = 'rgba(200,150,255,.6)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x, y, h.r * (.6 + k * .35), t * (2 + k) , t * (2 + k) + 2); g.stroke(); } }
      for (const p of G.plats) { const y = sy(G, p.y); if (y > -30 && y < vh + 30) plat(G, p); }
      for (const it of G.items) item(G, it);
      for (const c of G.coins) { if (c.got) continue; const y = sy(G, c.y); if (y < -20 || y > vh + 20) continue; const w = Math.abs(Math.cos(t * 3 + c.x)) * 9 + 2; g.fillStyle = '#ffd23f'; g.strokeStyle = '#b8860b'; g.lineWidth = 2; g.beginPath(); g.ellipse(c.x, y, w, 10, 0, 0, 7); g.fill(); g.stroke(); }
      for (const m of G.mons) { const y = sy(G, m.y); if (y > -60 && y < vh + 60) mon(G, m); }
      g.fillStyle = '#ffd23f'; for (const s of G.shots) { g.beginPath(); g.arc(s.x, sy(G, s.y), 5, 0, 7); g.fill(); g.strokeStyle = '#2a2140'; g.lineWidth = 1.5; g.stroke(); }
      if (ghosts) for (const gh of ghosts) { const y = sy(G, gh.y); g.fillStyle = gh.col; g.strokeStyle = '#2a2140'; g.lineWidth = 2; const cy = Math.max(26, Math.min(vh - 26, y)); g.beginPath(); g.moveTo(W - 4, cy); g.lineTo(W - 18, cy - 9); g.lineTo(W - 18, cy + 9); g.closePath(); g.fill(); g.stroke(); g.font = '900 11px system-ui'; g.textAlign = 'right'; g.fillStyle = '#2a2140'; g.fillText(gh.name, W - 22, cy + 4); }
      const P = G.p; if (!G.dead || P.y > cam - 200) { const px = P.x + WH.PW / 2, py = sy(G, P.y); hopsi(px, py, sk, P.face, P.squash, P, t); if (px < 20) hopsi(px + W, py, sk, P.face, P.squash, P, t); if (px > W - 20) hopsi(px - W, py, sk, P.face, P.squash, P, t); }
    }
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.l -= dt; if (q.l <= 0) { parts.splice(i, 1); continue; } q.x += q.vx * dt; q.y += q.vy * dt; q.vy -= 400 * dt; if (!G) continue; g.globalAlpha = Math.min(1, q.l * 2); g.fillStyle = q.c; g.beginPath(); g.arc(q.x, sy(G, q.y), q.r, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    if (ex > 4) { g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(-ex - 2, 0, ex + 2, vh); g.fillRect(W, 0, ex + 2, vh); g.strokeStyle = 'rgba(34,48,90,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, vh); g.moveTo(W, 0); g.lineTo(W, vh); g.stroke(); }
  }
  window.WHRender = { init, resize, draw, fx, hopsi: (c, sk) => { const old = g; g = c.getContext('2d'); g.save(); g.clearRect(0, 0, c.width, c.height); g.translate(c.width / 2, c.height * .85); g.scale(c.width / 70, c.width / 70); hopsi(0, 0, sk, 1, 0, null, 0); g.restore(); g = old; }, get vh() { return vh; } };
})();
