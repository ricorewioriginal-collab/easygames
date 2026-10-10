/* Wobbel – drei Bonusspiele (Canvas 2D, je ca. 30–45 s). Jedes Spiel: create(cv, api) → {start, stop}.
   api: {look, sfx(name,...args), hud(text), end(score)}. Logische Größe 360×480. */
import { drawWobbel } from './draw.js';
export const W = 360, H = 480;
const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function loop(step) { let id = 0, last = 0, run = false; const f = t => { if (!run) return; id = requestAnimationFrame(f); const dt = Math.min(0.05, (t - last) / 1000); last = t; step(dt); }; return { start() { if (run) return; run = true; last = performance.now(); id = requestAnimationFrame(f); }, stop() { run = false; cancelAnimationFrame(id); } }; }
const pos = (cv, e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
function bg(g, c1, c2) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function pearl(g, x, y, r, gold) { g.fillStyle = gold ? '#ffd24a' : '#fff'; g.strokeStyle = '#1b2748'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); g.fillStyle = gold ? '#fff7c2' : '#cfeaff'; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .3, 0, 7); g.fill(); }
function urchin(g, x, y, r) { g.fillStyle = '#5a3a8a'; g.strokeStyle = '#1b2748'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * .7 : r * 1.25; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#ff5a6a'; g.beginPath(); g.arc(x, y, r * .3, 0, 7); g.fill(); }
const heart = (g, x, y, on) => { g.font = '22px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = on ? 1 : .25; g.fillText('❤️', x, y); g.globalAlpha = 1; };

// ---------------------------------------------------------------- 1. Perlenfang
function perlenfang(cv, api) {
  const g = cv.getContext('2d'); let x, tx, items, t, score, lives, spawn, over, keys = {}, bounce;
  const reset = () => { x = tx = W / 2; items = []; t = 40; score = 0; lives = 3; spawn = 0; over = false; bounce = 0; };
  const L = loop(dt => {
    t -= dt; spawn -= dt; if (keys.ArrowLeft || keys.a) tx -= 330 * dt; if (keys.ArrowRight || keys.d) tx += 330 * dt; tx = clamp(tx, 30, W - 30); x += (tx - x) * Math.min(1, dt * 16); bounce = Math.max(0, bounce - dt * 4);
    const level = 1 + (40 - t) / 14;
    if (spawn <= 0) { spawn = rnd(0.35, 0.7) / Math.min(1.8, level); const k = Math.random(); items.push({ x: rnd(26, W - 26), y: -20, v: rnd(110, 160) * Math.min(1.7, level), kind: k < .22 ? 'urchin' : k < .3 ? 'gold' : 'pearl' }); }
    items.forEach(i => { i.y += i.v * dt; if (!i.dead && Math.abs(i.y - (H - 70)) < 34 && Math.abs(i.x - x) < 40) { i.dead = true; bounce = 1; if (i.kind === 'urchin') { lives--; api.sfx('bad'); } else { score += i.kind === 'gold' ? 3 : 1; api.sfx('coin'); } } if (i.y > H + 30) i.dead = true; });
    items = items.filter(i => !i.dead); draw();
    if (!over && (t <= 0 || lives <= 0)) { over = true; L.stop(); api.end(score); }
  });
  function draw() {
    bg(g, '#7fd2ff', '#2f8fd8'); g.fillStyle = '#f3dd9a'; g.fillRect(0, H - 56, W, 56); g.fillStyle = '#e0c474'; g.fillRect(0, H - 56, W, 6);
    items.forEach(i => i.kind === 'urchin' ? urchin(g, i.x, i.y, 15) : pearl(g, i.x, i.y, 11, i.kind === 'gold'));
    drawWobbel(g, x, H - 70 - bounce * 8, 30, api.look, false);
    api.hud(`⏱ ${Math.max(0, Math.ceil(t))} · 🫧 ${score}`); for (let i = 0; i < 3; i++) heart(g, W - 24 - i * 28, 22, i < lives);
  }
  const mv = e => { tx = pos(cv, e).x; }, kd = e => { keys[e.key] = true; }, ku = e => { keys[e.key] = false; };
  cv.addEventListener('pointermove', mv); cv.addEventListener('pointerdown', mv); addEventListener('keydown', kd); addEventListener('keyup', ku);
  return { start() { reset(); L.start(); }, stop() { L.stop(); } };
}

// ---------------------------------------------------------------- 2. Melodie-Memory
function melodie(cv, api) {
  const g = cv.getContext('2d'), COL = ['#ff5a6a', '#4cd964', '#4aa8ff', '#ffd24a'], CELL = [[20, 90], [190, 90], [20, 270], [190, 270]];
  let seq, phase, idx, lit, timer, rounds, over, msg;
  const timers = new Set(), later = (f, ms) => { const id = setTimeout(() => { timers.delete(id); f(); }, ms); timers.add(id); };
  const clear = () => { timers.forEach(clearTimeout); timers.clear(); };
  const flash = (i, ms) => { lit = i; api.sfx('tone', i, ms / 1000 + .05); draw(); later(() => { lit = -1; draw(); }, ms); };
  function play() { phase = 'show'; idx = 0; msg = 'Merk dir die Reihenfolge …'; draw(); const ms = Math.max(260, 520 - rounds * 22); seq.forEach((c, k) => later(() => flash(c, ms * .8), 600 + k * ms)); later(() => { phase = 'in'; idx = 0; msg = 'Du bist dran!'; draw(); }, 600 + seq.length * ms + 100); }
  function next() { seq.push(Math.floor(Math.random() * 4)); play(); }
  function pick(e) { if (phase !== 'in' || over) return; const p = pos(cv, e), i = CELL.findIndex(([x, y]) => p.x >= x && p.x <= x + 150 && p.y >= y && p.y <= y + 150); if (i < 0) return; flash(i, 200);
    if (i !== seq[idx]) { over = true; phase = 'x'; api.sfx('bad'); msg = 'Oje – falsch!'; draw(); later(() => api.end(rounds), 900); return; }
    idx++; if (idx === seq.length) { rounds++; phase = 'wait'; api.sfx('coin'); msg = 'Super!'; draw(); later(next, 800); } }
  function draw() {
    bg(g, '#ffe9a8', '#ffb877'); CELL.forEach(([x, y], i) => { g.fillStyle = '#1b2748'; g.beginPath(); g.roundRect(x - 3, y - 3, 156, 162, 26); g.fill(); g.fillStyle = COL[i]; g.globalAlpha = lit === i ? 1 : .55; g.beginPath(); g.roundRect(x, y, 150, 150, 24); g.fill(); g.globalAlpha = 1; g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['●', '▲', '■', '★'][i], x + 75, y + 78); });
    g.fillStyle = '#1b2748'; g.font = '700 22px sans-serif'; g.textAlign = 'center'; g.fillText(msg || '', W / 2, 62); drawWobbel(g, W / 2, 438, 26, api.look, lit >= 0 && phase === 'show');
    api.hud(`Runde ${rounds + 1} · ✔ ${rounds}`);
  }
  cv.addEventListener('pointerdown', pick);
  return { start() { clear(); seq = []; rounds = 0; over = false; lit = -1; next(); }, stop() { clear(); } };
}

// ---------------------------------------------------------------- 3. Wobbel-Huschen
function huschen(cv, api) {
  const g = cv.getContext('2d'); const HOLE = Array.from({ length: 9 }, (_, i) => ({ x: 70 + (i % 3) * 110, y: 150 + ((i / 3) | 0) * 105 }));
  let t, score, pops, spawn, over = true, fx;
  const reset = () => { t = 35; score = 0; pops = HOLE.map(() => null); spawn = .5; over = false; fx = []; };
  const L = loop(dt => {
    t -= dt; spawn -= dt; const lvl = 1 + (35 - t) / 12;
    if (spawn <= 0) { spawn = rnd(.35, .65) / Math.min(2, lvl); const free = pops.map((p, i) => p ? -1 : i).filter(i => i >= 0); if (free.length) { const i = free[(Math.random() * free.length) | 0], k = Math.random(); pops[i] = { kind: k < .2 ? 'crate' : k < .28 ? 'gold' : 'wob', age: 0, life: rnd(.8, 1.2) / Math.min(1.8, lvl) }; } }
    pops.forEach((p, i) => { if (p) { p.age += dt; if (p.age > p.life) pops[i] = null; } }); fx.forEach(f => { f.t += dt; }); fx = fx.filter(f => f.t < .6); draw();
    if (!over && t <= 0) { over = true; L.stop(); api.end(Math.max(0, score)); }
  });
  function draw() {
    bg(g, '#9be86f', '#4fb84a'); g.fillStyle = '#1b2748'; g.font = '700 20px sans-serif'; g.textAlign = 'center'; g.fillText('Tippe die Wobbel – nicht die Kisten!', W / 2, 70);
    HOLE.forEach((h, i) => { const p = pops[i]; g.fillStyle = '#4a2f1c'; g.beginPath(); g.ellipse(h.x, h.y + 22, 44, 17, 0, 0, 7); g.fill();
      if (p) { const k = Math.sin(Math.min(1, p.age / .15) * Math.PI / 2) * (p.age > p.life - .12 ? Math.max(0, (p.life - p.age) / .12) : 1), y = h.y + 22 - k * 32; g.save(); g.beginPath(); g.rect(h.x - 60, 0, 120, h.y + 22); g.clip();
        if (p.kind === 'crate') { g.fillStyle = '#7a4a28'; g.fillRect(h.x - 28, y - 30, 56, 52); g.fillStyle = '#e8b062'; g.fillRect(h.x - 23, y - 25, 46, 42); g.strokeStyle = '#a8683a'; g.lineWidth = 4; g.beginPath(); g.moveTo(h.x - 20, y - 22); g.lineTo(h.x + 20, y + 14); g.moveTo(h.x + 20, y - 22); g.lineTo(h.x - 20, y + 14); g.stroke(); }
        else drawWobbel(g, h.x, y - 12, 30, p.kind === 'gold' ? { color: '#ffd24a', hat: 'crown' } : api.look, false); g.restore(); }
      g.fillStyle = '#6b4526'; g.beginPath(); g.ellipse(h.x, h.y + 22, 44, 10, 0, 0, Math.PI); g.fill(); });
    fx.forEach(f => { g.globalAlpha = 1 - f.t / .6; g.fillStyle = f.c; g.font = '700 26px sans-serif'; g.fillText(f.s, f.x, f.y - f.t * 60); g.globalAlpha = 1; });
    api.hud(`⏱ ${Math.max(0, Math.ceil(t))} · ⭐ ${score}`);
  }
  cv.addEventListener('pointerdown', e => { if (over) return; const p = pos(cv, e); HOLE.forEach((h, i) => { const o = pops[i]; if (!o || Math.abs(p.x - h.x) > 46 || p.y < h.y - 50 || p.y > h.y + 40) return; pops[i] = null; const d = o.kind === 'crate' ? -2 : o.kind === 'gold' ? 3 : 1; score += d; api.sfx(d < 0 ? 'bad' : 'coin'); fx.push({ x: h.x, y: h.y - 20, t: 0, s: (d > 0 ? '+' : '') + d, c: d > 0 ? '#fff' : '#ff4a4a' }); }); });
  return { start() { reset(); L.start(); }, stop() { over = true; L.stop(); } };
}

// ---------------------------------------------------------------- 4. Kisten-Sortierer
function sortier(cv, api) {
  const g = cv.getContext('2d'), COL = ['#ff5a6a', '#4cd964', '#4aa8ff'], SYM = ['●', '▲', '■'], BIN = [[20, 372], [130, 372], [240, 372]];
  let t, score, lives, cur, queue, over = true, fx, wob, keys = {};
  const newCrate = () => ({ c: Math.floor(Math.random() * 3), y: 70, v: 0 });
  const reset = () => { t = 40; score = 0; lives = 3; over = false; fx = []; wob = 0; cur = newCrate(); cur.v = 90; queue = [newCrate(), newCrate()]; };
  const speed = () => 90 + (40 - t) * 4.5;
  function answer(i) { if (over || !cur) return; if (i === cur.c) { score++; api.sfx('coin'); fx.push({ x: BIN[i][0] + 45, y: 360, t: 0, s: '+1', c: '#fff' }); wob = 1; } else { lives--; api.sfx('bad'); fx.push({ x: BIN[i][0] + 45, y: 360, t: 0, s: '✗', c: '#ff4a4a' }); } cur = queue.shift(); cur.v = speed(); cur.y = 70; queue.push(newCrate()); }
  const L = loop(dt => {
    t -= dt; wob = Math.max(0, wob - dt * 4); cur.y += cur.v * dt; fx.forEach(f => { f.t += dt; }); fx = fx.filter(f => f.t < .6);
    if (cur.y > 340) { lives--; api.sfx('bad'); fx.push({ x: W / 2, y: 330, t: 0, s: 'zu spät!', c: '#ff4a4a' }); cur = queue.shift(); cur.v = speed(); cur.y = 70; queue.push(newCrate()); }
    draw(); if (!over && (t <= 0 || lives <= 0)) { over = true; L.stop(); api.end(score); }
  });
  function crate(x, y, c, s) { g.fillStyle = '#1b2748'; g.beginPath(); g.roundRect(x - s / 2 - 3, y - s / 2 - 3, s + 6, s + 6, 10); g.fill(); g.fillStyle = COL[c]; g.beginPath(); g.roundRect(x - s / 2, y - s / 2, s, s, 8); g.fill(); g.fillStyle = '#fff7e0'; g.fillRect(x - 5, y - s / 2, 10, s); g.fillRect(x - s / 2, y - 5, s, 10); g.fillStyle = '#fff'; g.font = `700 ${s * .5}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(SYM[c], x, y + 2); }
  function draw() {
    bg(g, '#cfe9ff', '#8fb8e8'); g.fillStyle = '#6a7aa8'; g.fillRect(100, 40, 160, 300); g.fillStyle = '#4a5888'; g.fillRect(100, 336, 160, 8);
    crate(W / 2, cur.y, cur.c, 54); queue.forEach((q, i) => crate(300 + 0, 100 + i * 50, q.c, 26));
    BIN.forEach(([x, y], i) => { g.fillStyle = '#1b2748'; g.beginPath(); g.roundRect(x - 3, y - 3, 96, 96, 18); g.fill(); g.fillStyle = COL[i]; g.beginPath(); g.roundRect(x, y, 90, 90, 16); g.fill(); g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '700 44px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(SYM[i], x + 45, y + 48); });
    drawWobbel(g, 58, 440 - wob * 6, 22, api.look, false); fx.forEach(f => { g.globalAlpha = 1 - f.t / .6; g.fillStyle = f.c; g.font = '700 24px sans-serif'; g.textAlign = 'center'; g.fillText(f.s, f.x, f.y - f.t * 50); g.globalAlpha = 1; });
    api.hud(`⏱ ${Math.max(0, Math.ceil(t))} · 📦 ${score}`); for (let i = 0; i < 3; i++) heart(g, W - 24 - i * 28, 22, i < lives);
  }
  cv.addEventListener('pointerdown', e => { const p = pos(cv, e); const i = BIN.findIndex(([x, y]) => p.x >= x - 4 && p.x <= x + 94 && p.y >= y - 10); if (i >= 0) answer(i); });
  const kd = e => { const m = { 1: 0, 2: 1, 3: 2, ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2, a: 0, s: 1, d: 2 }[e.key]; if (m !== undefined && !keys[e.key]) { keys[e.key] = true; answer(m); } }; addEventListener('keydown', kd); addEventListener('keyup', e => { keys[e.key] = false; });
  return { start() { reset(); L.start(); }, stop() { over = true; L.stop(); } };
}

// per: Punkte je Muschel
export const GAMES = [
  { id: 'perlen', name: 'Perlenfang', emoji: '🫧', desc: 'Fange Perlen, weiche Seeigeln aus. Bewege Wobbel mit Maus, Finger oder ← →.', per: 2, create: perlenfang, unit: 'Perlen' },
  { id: 'melodie', name: 'Melodie-Memory', emoji: '🎵', desc: 'Merk dir die Farbfolge und tippe sie nach – sie wird jede Runde länger.', per: 0.5, create: melodie, unit: 'Runden' },
  { id: 'sortier', name: 'Kisten-Sortierer', emoji: '📦', desc: 'Tippe das Fach in der Farbe der fallenden Kiste (oder Tasten 1 2 3 / ← ↓ →). Es wird immer schneller.', per: 2, create: sortier, unit: 'Kisten' },
  { id: 'huschen', name: 'Wobbel-Huschen', emoji: '🔨', desc: 'Tippe die auftauchenden Wobbel. Goldene geben 3, Kisten kosten Punkte.', per: 2, create: huschen, unit: 'Punkte' }
];
