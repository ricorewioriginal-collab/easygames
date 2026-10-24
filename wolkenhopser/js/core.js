/* Wolkenhopser – Spiellogik ohne DOM (auch in Node testbar).
 * Endloser Sprung nach oben: Hopsi springt automatisch, sobald er von oben auf einer Plattform landet. Links/rechts steuern,
 * am Rand geht es auf der anderen Seite weiter. Plattformarten, Federn, Trampoline, Propellermütze, Raketenrucksack, Schild,
 * Münzen, Monster (drauf springen oder abschießen), schwarze Löcher. Je höher, desto schwieriger. Eigenes Spiel, eigene Figuren. */
(function (root) {
  'use strict';
  const W = 400, GRAV = 1500, JUMP = 770, SPRING = 1180, TRAMP = 1550, VXMAX = 430, ACC = 2600, PW = 38, PH = 42, PLW = 64, PLH = 14;
  const SKINS = [
    { id: 'hopsi', n: 'Hopsi', cost: 0, body: '#7bdc5a', belly: '#d9f7b0', ex: null },
    { id: 'kiki', n: 'Kiki Kirsche', cost: 150, body: '#ff5c7a', belly: '#ffd0da', ex: 'stem' },
    { id: 'ninja', n: 'Ninja-Hopsi', cost: 300, body: '#2f2a45', belly: '#4b4566', ex: 'band' },
    { id: 'astro', n: 'Astro-Hopsi', cost: 500, body: '#f2f4ff', belly: '#cfd6ff', ex: 'helmet' },
    { id: 'robo', n: 'Robo-Hopsi', cost: 800, body: '#9aa6b8', belly: '#d8dee8', ex: 'antenna' },
    { id: 'eis', n: 'Eis-Hopsi', cost: 1100, body: '#8fe3ff', belly: '#e6f9ff', ex: 'scoop' },
    { id: 'drache', n: 'Mini-Drache', cost: 1500, body: '#ff9f1c', belly: '#ffe3a8', ex: 'horns' },
    { id: 'gold', n: 'Gold-Hopsi', cost: 2500, body: '#ffd23f', belly: '#fff2b8', ex: 'crown' }
  ];
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Neue Welt. seed: gleicher Seed = gleiche Welt (Tagesrekord, Online-Rennen)
  function newGame(seed) {
    seed = seed == null ? (Math.random() * 4294967296) >>> 0 : seed >>> 0;
    const G = { seed, rng: mulberry(seed), t: 0, p: { x: W / 2 - PW / 2, y: 60, vx: 0, vy: JUMP, face: 1, squash: 0, shield: 0, prop: 0, jet: 0, inv: 0, shootT: 0 },
      plats: [], mons: [], items: [], coins: [], shots: [], holes: [], topY: 0, maxY: 60, camY: 0, score: 0, coinsGot: 0, kills: 0, dead: false, cause: '', ev: [], nextId: 1 };
    // Startplattform-Reihe
    for (let x = 0; x < W; x += PLW + 4) G.plats.push({ id: G.nextId++, x, y: 20, w: PLW, type: 'normal', vx: 0, alive: true });
    G.topY = 20; gen(G, 1400);
    return G;
  }
  const diff = y => clamp(y / 14000, 0, 1);
  function gen(G, upTo) {
    const r = G.rng;
    while (G.topY < upTo) {
      const d = diff(G.topY), gap = lerp(62, 158, d) * (.75 + r() * .35), y = G.topY + Math.min(172, gap);
      let type = 'normal'; const q = r();
      if (G.topY > 600 && q < lerp(.06, .34, d)) type = 'move';
      else if (G.topY > 2500 && q < lerp(.06, .34, d) + lerp(0, .16, d)) type = 'vanish';
      const w = type === 'move' ? PLW - 6 : PLW, x = r() * (W - w);
      const p = { id: G.nextId++, x, y, w, type, vx: type === 'move' ? (r() < .5 ? -1 : 1) * lerp(50, 150, d) * (.7 + r() * .6) : 0, alive: true };
      G.plats.push(p); G.topY = y;
      // Zubehör auf der Plattform
      const it = r();
      if (it < .055) G.items.push({ type: 'spring', pid: p.id, dx: 10 + r() * (w - 30), used: 0 });
      else if (it < .075 && y > 800) G.items.push({ type: 'tramp', pid: p.id, dx: (w - 40) / 2, used: 0 });
      else if (it < .09 && y > 1200) G.items.push({ type: 'prop', pid: p.id, dx: (w - 24) / 2 });
      else if (it < .097 && y > 3000) G.items.push({ type: 'jet', pid: p.id, dx: (w - 24) / 2 });
      else if (it < .108 && y > 1800) G.items.push({ type: 'shield', pid: p.id, dx: (w - 24) / 2 });
      // Brüchige Täuschungs-Plattformen (tragen nicht)
      if (y > 400 && r() < lerp(.12, .32, d)) { const bx = (x + W / 2 + r() * 120) % (W - PLW); G.plats.push({ id: G.nextId++, x: bx, y: y - gap * (.35 + r() * .3), w: PLW, type: 'break', vx: 0, alive: true }); }
      // Münzen: kleine Bögen
      if (r() < .09) { const n = 3 + Math.floor(r() * 3), cx = 30 + r() * (W - 60); for (let k = 0; k < n; k++) G.coins.push({ x: clamp(cx + (k - n / 2) * 26, 12, W - 12), y: y + 40 + Math.sin(k / (n - 1 || 1) * Math.PI) * 30, got: false }); }
      // Monster und schwarze Löcher (nicht direkt über der einzigen Plattform)
      if (y > 1500 && r() < lerp(.035, .12, d)) {
        const kind = y > 6000 && r() < .3 ? 'ufo' : r() < .5 ? 'blob' : 'bat', mx = (x + W / 2) % (W - 50) + 10;
        G.mons.push({ id: G.nextId++, kind, x: mx, y: y + gap * .5, x0: mx, ph: r() * 6.28, w: kind === 'ufo' ? 64 : 48, h: kind === 'ufo' ? 34 : 40, alive: true, hp: kind === 'ufo' ? 2 : 1 });
      } else if (y > 4000 && r() < lerp(0, .03, d)) G.holes.push({ x: (x + W / 2) % (W - 70) + 35, y: y + gap * .5, r: 30 });
    }
  }
  const platOf = (G, id) => G.plats.find(p => p.id === id);
  const hitBox = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  // Ein Zeitschritt. inp = { x: −1…1, shoot: bool }, vh = sichtbare Höhe (für Kamera und Absturz)
  function step(G, inp, dt, vh) {
    if (G.dead) return G;
    const P = G.p, r = G.rng; G.t += dt; vh = vh || 700;
    // Horizontal mit Trägheit, Bildschirmrand = Durchgang
    const ix = clamp(+inp.x || 0, -1, 1);
    if (Math.abs(ix) > .05) { P.vx += ix * ACC * dt; P.face = ix > 0 ? 1 : -1; } else P.vx *= Math.exp(-7 * dt);
    P.vx = clamp(P.vx, -VXMAX, VXMAX); P.x += P.vx * dt;
    if (P.x > W - PW / 2) P.x -= W; else if (P.x < -PW / 2) P.x += W;
    // Vertikal: Schwerkraft oder Flug
    if (P.jet > 0) { P.jet -= dt; P.vy = 980; if (P.jet <= 0) G.ev.push({ k: 'flyEnd' }); }
    else if (P.prop > 0) { P.prop -= dt; P.vy = 560; if (P.prop <= 0) G.ev.push({ k: 'flyEnd' }); }
    else P.vy -= GRAV * dt;
    const oldY = P.y; P.y += P.vy * dt;
    P.squash = Math.max(0, P.squash - dt * 4); P.shootT = Math.max(0, P.shootT - dt); P.inv = Math.max(0, P.inv - dt);
    const flying = P.jet > 0 || P.prop > 0;
    // Plattformen bewegen, landen
    for (const p of G.plats) {
      if (!p.alive) { if (p.fall != null) { p.fall += dt; p.y -= 500 * dt * p.fall * 4; } continue; }
      if (p.type === 'move') { p.x += p.vx * dt; if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); } else if (p.x + p.w > W) { p.x = W - p.w; p.vx = -Math.abs(p.vx); } }
      if (P.vy < 0 && !flying && oldY >= p.y + PLH - 2 && P.y <= p.y + PLH && P.x + PW - 8 > p.x && P.x + 8 < p.x + p.w) {
        if (p.type === 'break') { p.alive = false; p.fall = 0; G.ev.push({ k: 'break', x: p.x + p.w / 2, y: p.y }); continue; }
        // Feder/Trampolin auf dieser Plattform?
        const it = G.items.find(i => i.pid === p.id && (i.type === 'spring' || i.type === 'tramp') && P.x + PW - 6 > p.x + i.dx && P.x + 6 < p.x + i.dx + (i.type === 'tramp' ? 40 : 20));
        P.y = p.y + PLH;
        if (it) { it.used = 1; P.vy = it.type === 'tramp' ? TRAMP : SPRING; G.ev.push({ k: it.type, x: P.x + PW / 2, y: P.y }); if (it.type === 'tramp') P.flip = 1; }
        else { P.vy = JUMP; G.ev.push({ k: 'jump', x: P.x + PW / 2, y: P.y, type: p.type }); }
        P.squash = 1;
        if (p.type === 'vanish') { p.alive = false; p.fall = null; p.gone = 1; G.ev.push({ k: 'vanish', x: p.x + p.w / 2, y: p.y }); }
      }
    }
    if (P.flip) { P.flip += dt * 2.4; if (P.flip > 2) P.flip = 0; }
    // Gegenstände einsammeln
    const box = { x: P.x + 4, y: P.y, w: PW - 8, h: PH };
    for (const it of G.items) {
      if (it.got || it.type === 'spring' || it.type === 'tramp') continue; const p = platOf(G, it.pid); if (!p || !p.alive) continue;
      if (hitBox(box, { x: p.x + it.dx, y: p.y + PLH, w: 24, h: 24 })) { it.got = 1; if (it.type === 'prop') { P.prop = 3; P.jet = 0; } else if (it.type === 'jet') { P.jet = 3.4; P.prop = 0; } else if (it.type === 'shield') P.shield = 1; G.ev.push({ k: 'item', type: it.type }); }
    }
    for (const c of G.coins) if (!c.got && Math.abs(c.x - (P.x + PW / 2)) < 24 && Math.abs(c.y - (P.y + PH / 2)) < 28) { c.got = true; G.coinsGot++; G.ev.push({ k: 'coin', x: c.x, y: c.y }); }
    // Schüsse
    if (inp.shoot && P.shootT <= 0 && !flying) { P.shootT = .22; G.shots.push({ x: P.x + PW / 2, y: P.y + PH, vy: 1100 + Math.max(0, P.vy) }); G.ev.push({ k: 'shoot' }); }
    for (const s of G.shots) { s.y += s.vy * dt; }
    G.shots = G.shots.filter(s => s.y < G.camY + vh + 60 && !s.hit);
    // Monster
    for (const m of G.mons) {
      if (!m.alive) { if (m.fall != null) { m.fall += dt; m.y -= 600 * dt * (1 + m.fall * 3); } continue; }
      m.ph += dt; if (m.kind === 'bat') m.x = m.x0 + Math.sin(m.ph * 1.7) * 60; else if (m.kind === 'blob') m.y += Math.sin(m.ph * 3) * .25; else m.x = m.x0 + Math.sin(m.ph * .9) * 90;
      m.x = clamp(m.x, 0, W - m.w);
      for (const s of G.shots) if (!s.hit && s.x > m.x && s.x < m.x + m.w && s.y > m.y && s.y < m.y + m.h) { s.hit = 1; if (--m.hp <= 0) { m.alive = false; m.fall = 0; G.kills++; G.score += 0; G.ev.push({ k: 'kill', x: m.x + m.w / 2, y: m.y + m.h / 2, by: 'shot' }); } else G.ev.push({ k: 'hurt', x: m.x + m.w / 2, y: m.y + m.h / 2 }); }
      if (!m.alive) continue;
      if (hitBox(box, { x: m.x + 4, y: m.y + 2, w: m.w - 8, h: m.h - 4 })) {
        if (flying || P.inv > 0) { m.alive = false; m.fall = 0; G.kills++; G.ev.push({ k: 'kill', x: m.x + m.w / 2, y: m.y + m.h / 2, by: 'fly' }); }
        else if (P.vy < 0 && P.y > m.y + m.h * .45) { m.alive = false; m.fall = 0; G.kills++; P.vy = JUMP * 1.05; P.squash = 1; G.ev.push({ k: 'kill', x: m.x + m.w / 2, y: m.y + m.h / 2, by: 'stomp' }); }
        else if (P.shield) { P.shield = 0; P.inv = 1.2; m.alive = false; m.fall = 0; G.ev.push({ k: 'shieldPop' }); }
        else { die(G, 'monster'); return G; }
      }
    }
    for (const h of G.holes) { const dx = h.x - (P.x + PW / 2), dy = h.y - (P.y + PH / 2), d = Math.hypot(dx, dy);
      if (d < 140 && !flying) { P.vx += dx / d * 500 * dt; P.vy += dy / d * 600 * dt; }
      if (d < h.r) { if (P.shield) { P.shield = 0; P.inv = 1.2; P.vy = JUMP; G.ev.push({ k: 'shieldPop' }); } else if (!flying) { die(G, 'hole'); return G; } } }
    // Kamera: Hopsi bleibt höchstens in der oberen Hälfte
    if (P.y > G.camY + vh * .48) G.camY = P.y - vh * .48;
    if (P.y > G.maxY) G.maxY = P.y;
    G.score = Math.floor(G.maxY / 10) + G.kills * 25;
    // Aufräumen und weiter erzeugen
    const low = G.camY - 200;
    if (G.plats.length > 120) { G.plats = G.plats.filter(p => p.y > low); const ids = new Set(G.plats.map(p => p.id)); G.items = G.items.filter(i => ids.has(i.pid)); G.coins = G.coins.filter(c => c.y > low); G.mons = G.mons.filter(m => m.y > low); G.holes = G.holes.filter(h => h.y > low); }
    gen(G, G.camY + vh + 900);
    if (P.y + PH < G.camY - 30) die(G, 'fall');
    return G;
  }
  function die(G, cause) { G.dead = true; G.cause = cause; G.ev.push({ k: 'die', cause }); }
  function daily(d) { const k = dayKey(d); return { key: k, seed: hash('wolkenhopser:' + k) }; }
  // Abschnitte für Hintergrund und Ansage
  const ZONES = [{ y: 0, n: 'Blumenwiese' }, { y: 2500, n: 'Wolkenmeer' }, { y: 6000, n: 'Abendhimmel' }, { y: 10000, n: 'Sternennacht' }, { y: 15000, n: 'Weltall' }];
  const zoneAt = y => { let z = 0; for (let i = 0; i < ZONES.length; i++) if (y >= ZONES[i].y) z = i; return z; };

  const WH = { W, PW, PH, PLW, PLH, JUMP, SPRING, TRAMP, GRAV, SKINS, ZONES, mulberry, hash, dayKey, newGame, gen, step, daily, zoneAt, diff };
  if (typeof module !== 'undefined' && module.exports) module.exports = WH;
  root.WH = WH;
})(typeof window !== 'undefined' ? window : globalThis);
