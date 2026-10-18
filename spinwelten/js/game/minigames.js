/* Spinwelten 3D – 8 Minispiele
 * Schnittstelle: const ctrl = SW.Minigames.start(id, host, opts); … ctrl.stop();
 * opts = { lang, difficulty 1..6, seed, input:{on(fn)}, onEnd(result), sfx(name), reducedMotion }
 * Reine, DOM-freie Logik liegt unter SW.Minigames._logic (in Node testbar).
 * DOM, Canvas und THREE werden erst in start() angefasst. */
(function (SW) {
  'use strict';

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rngOf = s => SW.rng.seeded(s);
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];            // N O S W  → Bits 1 2 4 8

  // ======================================================================
  // Reine Logik
  // ======================================================================

  // ---------- 1) Lichtpfad ----------
  function rotMask(m, k) { k = ((k % 4) + 4) % 4; for (let i = 0; i < k; i++) m = ((m << 1) | (m >> 3)) & 15; return m; }
  function bitCount(m) { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; }
  function lpSize(d) { return d <= 2 ? 5 : d <= 4 ? 6 : 7; }
  function lpMix(d) { return [0.35, 0.55, 0.65, 0.8, 0.85, 1][d - 1]; }
  function lpLit(masks, n, src) {
    const lit = new Uint8Array(n * n), q = [src]; lit[src] = 1;
    while (q.length) {
      const c = q.pop(), x = c % n, y = (c - x) / n;
      for (let k = 0; k < 4; k++) {
        if (!(masks[c] & (1 << k))) continue;
        const nx = x + DIRS[k][0], ny = y + DIRS[k][1];
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const nb = nx + ny * n;
        if (lit[nb] || !(masks[nb] & (1 << ((k + 2) % 4)))) continue;
        lit[nb] = 1; q.push(nb);
      }
    }
    return lit;
  }
  function lpSolved(masks, n, src, lamps) { const lit = lpLit(masks, n, src); return lamps.every(i => lit[i] === 1); }
  function lpTurns(from, to) { for (let k = 0; k < 4; k++) if (rotMask(from, k) === to) return k; return -1; }
  // Erzeugt zuerst einen Lösungsbaum (wachsender Baum über alle Felder), dann wird jedes Teil verdreht.
  function lpGenerate(seed, n, mix) {
    mix = mix == null ? 1 : mix;
    let out = null;
    for (let attempt = 0; attempt < 40 && !out; attempt++) {
      const r = rngOf('lichtpfad:' + seed + ':' + n + ':' + attempt);
      const N = n * n, sol = new Array(N).fill(0), seen = new Array(N).fill(false);
      const src = r.range(1, n - 2) + r.range(1, n - 2) * n;
      const act = [src]; seen[src] = true;
      while (act.length) {
        const ai = r.chance(0.55) ? act.length - 1 : r.int(act.length);
        const c = act[ai], x = c % n, y = (c - x) / n, free = [];
        for (let k = 0; k < 4; k++) {
          const nx = x + DIRS[k][0], ny = y + DIRS[k][1];
          if (nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[nx + ny * n]) free.push(k);
        }
        if (!free.length) { act.splice(ai, 1); continue; }
        const k = r.pick(free), nb = x + DIRS[k][0] + (y + DIRS[k][1]) * n;
        sol[c] |= 1 << k; sol[nb] |= 1 << ((k + 2) % 4); seen[nb] = true; act.push(nb);
      }
      const lamps = [];
      for (let i = 0; i < N; i++) if (i !== src && bitCount(sol[i]) === 1) lamps.push(i);
      if (lamps.length < 3 && attempt < 39) continue;
      const start = sol.map(m => (r.next() < mix ? rotMask(m, 1 + r.int(3)) : m));
      let guard = 0;
      while (lpSolved(start, n, src, lamps) && guard++ < 200) {
        const i = r.int(N); if (start[i] !== 15) start[i] = rotMask(start[i], 1);
      }
      let minMoves = 0;
      for (let i = 0; i < N; i++) minMoves += lpTurns(start[i], sol[i]);
      out = { n, src, lamps, sol, start, minMoves };
    }
    return out;
  }
  function lpLimit(minMoves, d) { return minMoves + Math.max(6, Math.ceil(minMoves * [1.1, 0.9, 0.75, 0.6, 0.5, 0.4][d - 1])); }
  function lpShape(mask) {                               // Grundform + Drehung
    const bases = [1, 5, 3, 7, 15];
    for (const b of bases) for (let r = 0; r < 4; r++) if (rotMask(b, r) === mask) return { base: b, r };
    return { base: 1, r: 0 };
  }

  // ---------- 2) Kristallsuche ----------
  function ksConfig(d) { return { crystals: [5, 5, 6, 6, 7, 8][d - 1], time: [80, 72, 66, 60, 55, 50][d - 1], penalty: d <= 2 ? 2 : 3, fuzzy: [32, 30, 28, 26, 24, 22][d - 1], expose: [1.05, 0.95, 0.85, 0.78, 0.7, 0.62][d - 1] }; }

  // ---------- 3) Wolkengleiter ----------
  const WG = { grav: 78, lift: 100, vMax: 58, r: 4 };
  function circleHit(ax, ay, ar, bx, by, br) { const dx = ax - bx, dy = ay - by, rr = ar + br; return dx * dx + dy * dy < rr * rr; }
  function wgCourse(seed, d) {
    const r = rngOf('wolken:' + seed + ':' + d);
    const speed = 24 + 3 * d, goal = 900 + 150 * d, clouds = [], stars = [];
    let x = 70;
    while (x < goal - 40) {
      if (r.chance(0.22 + 0.05 * d)) {                  // Paar mit Lücke
        const gap = 36 - d * 1.2, gy = r.range(30, 70), rr = 8 + r.next() * 2;
        clouds.push({ x, y: gy - gap / 2 - rr, r: rr }, { x: x + r.range(-3, 3), y: gy + gap / 2 + rr, r: rr });
        stars.push({ x, y: gy });
      } else {
        const rr = 7 + r.next() * 3 + d * 0.3, y = r.range(14, 86);
        clouds.push({ x, y, r: rr });
        const sy = y < 50 ? y + rr + 12 + r.int(14) : y - rr - 12 - r.int(14);
        stars.push({ x: x + r.range(-4, 4), y: clamp(sy, 10, 90) });
      }
      x += Math.max(26, 44 - d * 2.5) + r.next() * 24;
    }
    // Sterne, die zu nah an einer Wolke liegen, entfernen
    const ok = stars.filter(s => !clouds.some(c => circleHit(s.x, s.y, 3, c.x, c.y, c.r)));
    return { speed, goal, clouds, stars: ok };
  }

  // ---------- 4) Runen-Memory ----------
  const RUNES = [
    'M36 14V86M36 30L64 16M36 50L64 36', 'M32 86V16L68 36V86', 'M36 14V86M36 30L62 50L36 70', 'M38 14V86M38 16L64 32M38 38L64 54',
    'M36 86V14L62 30L36 48L64 86', 'M62 16L36 50L62 84', 'M28 18L72 82M72 18L28 82', 'M38 86V14L64 31L38 48',
    'M32 14V86M68 14V86M32 38L68 62', 'M50 12V88M31 31L69 69M69 31L31 69', 'M44 18L26 38L44 58M56 42L74 62L56 82', 'M50 14V86M50 14L66 28M50 86L34 72',
    'M50 14V86M50 46L28 22M50 46L72 22', 'M62 14L34 40L66 60L38 86', 'M50 14V86M28 38L50 14L72 38', 'M50 14L72 40L50 64L28 40ZM38 54L24 86M62 54L76 86',
    'M26 22V78L74 22V78Z', 'M50 16L74 50L50 84L26 50Z', 'M50 20A30 30 0 1 1 49.9 20ZM50 40V60', 'M30 16V84H70M30 50H58'
  ];
  const RUNE_COLORS = ['#f2d08a', '#3fd8e8', '#ff7a6b', '#2ec4a6', '#b9a2ff', '#ffb36b', '#7fd0ff', '#ff9fc8'];
  function memConfig(d) {
    const g = [[4, 3], [4, 4], [4, 4], [5, 4], [6, 4], [6, 5]][d - 1];
    return { a: g[0], b: g[1], pairs: g[0] * g[1] / 2, misses: [10, 13, 11, 13, 15, 17][d - 1] };
  }
  function memDeal(seed, pairs) {
    const r = rngOf('memory:' + seed + ':' + pairs);
    const ids = r.shuffle(RUNES.map((_, i) => i)).slice(0, pairs);
    return r.shuffle(ids.concat(ids));
  }

  // ---------- 5) Funkel-Puzzle ----------
  function fpConfig(d) { return { n: d <= 3 ? 3 : 4, steps: [14, 22, 30, 34, 48, 66][d - 1], limit: [110, 130, 150, 220, 260, 300][d - 1] }; }
  function fpSolved(b) { const N = b.length; for (let i = 0; i < N - 1; i++) if (b[i] !== i + 1) return false; return b[N - 1] === 0; }
  function fpSolvable(b, n) {
    const a = b.filter(v => v !== 0); let inv = 0;
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++;
    if (n % 2 === 1) return inv % 2 === 0;
    const rowFromBottom = n - Math.floor(b.indexOf(0) / n);
    return (inv + rowFromBottom) % 2 === 1;
  }
  // Mischen nur durch gültige Züge vom gelösten Zustand aus → immer lösbar.
  function fpShuffle(seed, n, steps) {
    const r = rngOf('funkel:' + seed + ':' + n + ':' + steps), N = n * n, b = [];
    for (let i = 1; i < N; i++) b.push(i);
    b.push(0);
    let e = N - 1, prev = -1;
    for (let s = 0; (s < steps || fpSolved(b)) && s < steps + 500; s++) {
      const x = e % n, y = (e - x) / n, nb = [];
      for (const dd of DIRS) { const nx = x + dd[0], ny = y + dd[1]; if (nx >= 0 && ny >= 0 && nx < n && ny < n && nx + ny * n !== prev) nb.push(nx + ny * n); }
      const t = r.pick(nb); b[e] = b[t]; b[t] = 0; prev = e; e = t;
    }
    return b;
  }
  // Ein Tipp auf Feld p schiebt (falls in Reihe/Spalte des Leerfelds) alle Platten dazwischen. Gibt Liste der bewegten Platten zurück.
  function fpSlide(b, n, p) {
    let e = b.indexOf(0); if (p === e || b[p] === undefined) return null;
    const ex = e % n, ey = (e - ex) / n, px = p % n, py = (p - px) / n;
    if (ex !== px && ey !== py) return null;
    const step = ex === px ? (py > ey ? n : -n) : (px > ex ? 1 : -1), moved = [];
    while (e !== p) { const t = e + step; b[e] = b[t]; b[t] = 0; moved.push(b[e]); e = t; }
    return moved;
  }

  // ---------- 6) Reparaturwerk ----------
  const RW = { seams: 5, maxErr: 3 };
  function rwInZone(pos, center, width) { return Math.abs(pos - center) <= width / 2 + 1e-9; }
  function rwNeedle(phase) { const p = ((phase % 2) + 2) % 2; return p <= 1 ? p : 2 - p; }   // Dreieckswelle 0…1…0
  function rwZone(seed, d, seam) {
    const r = rngOf('repair:' + seed + ':' + d + ':' + seam);
    const width = (0.26 - 0.02 * d) * (1 - 0.07 * seam);
    const lo = width / 2 + 0.06, hi = 1 - width / 2 - 0.06;
    return { center: lo + r.next() * (hi - lo), width };
  }
  function rwSpeed(d, seam) { return (0.5 + 0.08 * d) * (1 + 0.08 * seam); }

  // ---------- 7) Portalsprung ----------
  const PS = { g: 34, v0: 12, w: 0.7, h: 0.8 };
  const psAir = () => 2 * PS.v0 / PS.g;
  function rectHit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function psOverPit(x, pits) { for (const p of pits) if (x > p.x + 0.12 && x < p.x + p.w - 0.12) return p; return null; }
  function psCourse(seed, d) {
    const r = rngOf('portal:' + seed + ':' + d);
    const base = 6.4 + 0.6 * d, length = 220 + 25 * d, air = psAir(), feats = [];
    let x = 18, mult = 1, sincePortal = 9;
    while (x < length - 14) {
      const jd = base * mult * air, roll = r.next();
      if (roll < 0.16 && sincePortal > 2) {
        const m = mult !== 1 ? 1 : r.pick([1.3, 0.78]);
        feats.push({ type: 'portal', x, mult: m }); mult = m; sincePortal = 0;
        x += base * m * air * 1.4 + 3; continue;
      }
      sincePortal++;
      if (roll < 0.58) { const w = Math.max(1.3, jd * (0.32 + r.next() * 0.22)); feats.push({ type: 'pit', x, w, mult }); x += w; }
      else { const w = 0.7 + r.next() * 0.4, h = 0.6 + r.next() * (0.35 + d * 0.06); feats.push({ type: 'rock', x, w, h, mult }); x += w; }
      x += jd * (1.35 + r.next() * 1.1) + Math.max(0, 5 - d * 0.7);
    }
    return { base, length, feats, lives: d <= 2 ? 2 : 1 };
  }

  // Läufer-Zustand und ein Physikschritt (rein, in Node testbar)
  function psState(c) { return { x: 0, y: 0, vy: 0, onGround: true, sunk: false, mult: 1, lives: c.lives, inv: 0, buffer: 0, coyote: 0, pi: 0, hits: 0, over: '' }; }
  function psPress(st) { st.buffer = 0.14; }
  function psStep(st, c, dt) {
    const ev = [];
    if (st.over) return ev;
    if (!c._pits) { c._pits = c.feats.filter(f => f.type === 'pit'); c._rocks = c.feats.filter(f => f.type === 'rock'); c._portals = c.feats.filter(f => f.type === 'portal'); }
    const pits = c._pits, rocks = c._rocks, portals = c._portals;
    const hit = f => {
      st.lives--; st.hits++; st.inv = 1.2; ev.push('hit');
      if (st.lives <= 0) { st.over = 'lose'; return; }
      st.x = f.x + f.w + 1; st.y = 0; st.vy = 0; st.onGround = true; st.sunk = false;
    };
    st.x += c.base * st.mult * dt; st.inv = Math.max(0, st.inv - dt);
    while (st.pi < portals.length && st.x >= portals[st.pi].x) { st.mult = portals[st.pi].mult; st.pi++; ev.push('portal'); }
    st.buffer -= dt;
    st.coyote = st.onGround ? 0.09 : st.coyote - dt;
    if (st.buffer > 0 && (st.onGround || (st.coyote > 0 && !st.sunk && st.y > -0.45))) {
      st.y = Math.max(0, st.y); st.vy = PS.v0; st.onGround = false; st.coyote = 0; st.buffer = 0; ev.push('jump');
    }
    if (st.onGround && psOverPit(st.x, pits)) st.onGround = false;
    if (!st.onGround) {
      st.vy -= PS.g * dt; st.y += st.vy * dt;
      if (st.y <= 0 && st.vy < 0) {
        const over = psOverPit(st.x, pits);
        if (!over && !st.sunk) { st.y = 0; st.vy = 0; st.onGround = true; }          // Landung (auch bei großem Zeitschritt)
        else {
          if (st.y < -0.3) st.sunk = true;                                          // in der Lücke: Wand oder Absturz
          if (!over || st.y < -1.6) hit(over || pits.filter(q => q.x < st.x).pop() || { x: st.x, w: 0 });
        }
      }
    }
    if (!st.over && st.inv <= 0) {
      const me = { x: st.x - PS.w / 2 + 0.06, y: st.y + 0.04, w: PS.w - 0.12, h: PS.h - 0.12 };
      for (const r of rocks) { if (r.x > st.x + 3) break; if (r.x + r.w < st.x - 3) continue; if (rectHit(me, { x: r.x + 0.08, y: 0, w: r.w - 0.16, h: r.h })) { hit(r); break; } }
    }
    if (!st.over && st.x >= c.length) { st.x = c.length; st.over = 'win'; }
    return ev;
  }

  // ---------- 8) Schatzkarte ----------
  function tkConfig(d) { return { size: [6, 6, 7, 7, 8, 8][d - 1], treasures: d >= 4 ? 2 : 1, digs: [9, 8, 8, 12, 12, 11][d - 1] }; }
  function tkPlace(seed, size, count) {
    const r = rngOf('schatz:' + seed + ':' + size + ':' + count), out = [];
    let guard = 0;
    while (out.length < count && guard++ < 1000) {
      const i = r.int(size * size), x = i % size, y = (i - x) / size;
      if (out.some(j => Math.abs(j % size - x) + Math.abs(Math.floor(j / size) - y) < 3)) continue;
      out.push(i);
    }
    return out;
  }
  function tkHint(x, y, list) {                          // list: [[tx,ty], …]
    let best = Infinity;
    for (const t of list) best = Math.min(best, Math.abs(t[0] - x) + Math.abs(t[1] - y));
    return best;
  }
  function tkLevel(h) { return h <= 2 ? 'hot' : h <= 4 ? 'warm' : h <= 6 ? 'cool' : 'cold'; }

  // ======================================================================
  // Spielliste
  // ======================================================================
  SW.MINIGAMES = [
    { id: 'lichtpfad', icon: '💡', name: { de: 'Lichtpfad', en: 'Light Path' },
      desc: { de: 'Drehe die Leitungen, bis das Licht des Kristalls alle Laternen erreicht.', en: 'Turn the pipes until the crystal’s light reaches every lantern.' },
      how: { de: 'Tippen oder OK dreht ein Teil · Pfeile wählen', en: 'Tap or OK turns a piece · arrows select' } },
    { id: 'kristallsuche', icon: '💎', name: { de: 'Kristallsuche', en: 'Crystal Hunt' },
      desc: { de: 'Finde alle versteckten Kristalle auf der Lichtung, bevor die Zeit abläuft.', en: 'Find every hidden crystal in the glade before time runs out.' },
      how: { de: 'Ziehen dreht die Insel · Tippen sammelt · Pfeile + OK zielen', en: 'Drag to turn · tap to collect · arrows + OK to aim' } },
    { id: 'wolkengleiter', icon: '☁️', name: { de: 'Wolkengleiter', en: 'Cloud Glider' },
      desc: { de: 'Gleite mit Kivi ans Ziel, sammle Sterne und weiche den Sturmwolken aus.', en: 'Glide Kivi to the goal, collect stars and dodge the storm clouds.' },
      how: { de: 'Halten = steigen · Loslassen = sinken', en: 'Hold = rise · release = sink' } },
    { id: 'runenmemory', icon: '🔮', name: { de: 'Runen-Memory', en: 'Rune Memory' },
      desc: { de: 'Finde alle Runen-Paare mit möglichst wenigen Fehlversuchen.', en: 'Find all rune pairs with as few misses as possible.' },
      how: { de: 'Tippen oder OK deckt auf · Pfeile wählen', en: 'Tap or OK reveals · arrows select' } },
    { id: 'funkelpuzzle', icon: '✨', name: { de: 'Funkel-Puzzle', en: 'Sparkle Puzzle' },
      desc: { de: 'Schiebe die Kristallplatten, bis das Sternbild wieder vollständig ist.', en: 'Slide the crystal tiles until the constellation is whole again.' },
      how: { de: 'Platte antippen oder OK schiebt · Auge/X = Vorschau', en: 'Tap a tile or OK to slide · eye/X = preview' } },
    { id: 'reparaturwerk', icon: '🔧', name: { de: 'Reparaturwerk', en: 'Repair Works' },
      desc: { de: 'Schweiße fünf Nähte – drücke genau, wenn der Zeiger im grünen Bereich ist.', en: 'Weld five seams – press exactly when the needle is in the green zone.' },
      how: { de: 'Tippen oder OK schweißt', en: 'Tap or OK welds' } },
    { id: 'portalsprung', icon: '🌀', name: { de: 'Portalsprung', en: 'Portal Leap' },
      desc: { de: 'Springe über Lücken und Kristalle; Portale machen dich schneller oder langsamer.', en: 'Jump over gaps and crystals; portals speed you up or slow you down.' },
      how: { de: 'Tippen oder OK springt', en: 'Tap or OK jumps' } },
    { id: 'schatzkarte', icon: '🗺️', name: { de: 'Schatzkarte', en: 'Treasure Map' },
      desc: { de: 'Grabe nach dem Schatz – jede Zahl verrät die Schritte bis zum nächsten Schatz.', en: 'Dig for treasure – each number tells the steps to the nearest treasure.' },
      how: { de: 'Tippen oder OK gräbt · Pfeile wählen', en: 'Tap or OK digs · arrows select' } }
  ];
  const MG_BY_ID = {};
  SW.MINIGAMES.forEach(m => { MG_BY_ID[m.id] = m; });

  // ======================================================================
  // Rahmen (DOM) – erst in start() benutzt
  // ======================================================================
  function el(tag, cls, parent, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function btn(cls, parent, html) { const b = el('div', cls, parent, html); b.setAttribute('role', 'button'); return b; }
  const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4L2.8 9.3l6.4-.8z"/></svg>';

  function createShell(id, host, opts) {
    const o = opts || {};
    const def = MG_BY_ID[id];
    const lang = o.lang === 'en' ? 'en' : 'de';
    const d = clamp(Math.round(Number(o.difficulty) || 1), 1, 6);
    const seed = o.seed == null ? String(Date.now()) : String(o.seed);
    let reduced = !!o.reducedMotion;
    try { if (!reduced && window.matchMedia) reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* egal */ }
    const sh = { id, lang, d, seed, reduced, rng: rngOf(seed + ':' + id), ended: false, stopped: false };
    const cleanups = [], timers = [], frames = [], actionFns = [], resizeFns = [];
    let raf = 0, rz = 0, last = 0, fired = false, endTimer = 0, result = null, shownAt = 0, unsub = null;

    host.innerHTML = '';
    const root = el('div', 'mg-root mg-kbd' + (reduced ? ' mg-reduced' : ''), host);
    root.setAttribute('data-game', id);
    const bar = el('div', 'mg-status', root);
    const stage = el('div', 'mg-stage', root);
    const toast = el('div', 'mg-rule', root);
    sh.root = root; sh.stage = stage;

    sh.tx = x => (x && typeof x === 'object' ? (x[lang] || x.de) : String(x));
    sh.t = (de, en) => (lang === 'en' ? en : de);
    sh.sfx = name => { if (!sh.stopped && typeof o.sfx === 'function') { try { o.sfx(name); } catch (e) { /* Ton ist optional */ } } };
    sh.later = (fn, ms) => { const t = setTimeout(() => { if (!sh.stopped) fn(); }, ms); timers.push(t); return t; };
    sh.on = (target, type, fn, opt) => { target.addEventListener(type, fn, opt); cleanups.push(() => target.removeEventListener(type, fn, opt)); };
    sh.cleanup = fn => cleanups.push(fn);
    sh.onAction = fn => actionFns.push(fn);
    sh.onResize = fn => resizeFns.push(fn);
    sh.size = () => ({ w: Math.max(1, stage.clientWidth), h: Math.max(1, stage.clientHeight) });

    // Statuszeile
    const pills = {};
    sh.status = (key, label, value, cls) => {
      let p = pills[key];
      if (!p) { p = pills[key] = el('div', 'mg-pill', bar); p._l = el('span', 'mg-pill-l', p); p._v = el('span', 'mg-pill-v', p); }
      if (p._lt !== label) p._l.textContent = p._lt = label;
      const v = String(value);
      if (p._vt !== v) p._v.textContent = p._vt = v;
      const c = 'mg-pill' + (cls ? ' ' + cls : '');
      if (p.className !== c) p.className = c;
    };
    sh.meter = (key, label, frac) => {
      let p = pills[key];
      if (!p) { p = pills[key] = el('div', 'mg-pill mg-pill-meter', bar); p._l = el('span', 'mg-pill-l', p); const t = el('span', 'mg-meter', p); p._f = el('span', 'mg-meter-f', t); }
      if (p._lt !== label) p._l.textContent = p._lt = label;
      const w = Math.round(clamp(frac, 0, 1) * 100);
      if (p._w !== w) { p._w = w; p._f.style.width = w + '%'; }
    };
    sh.hearts = (n, max) => '♥'.repeat(Math.max(0, n)) + '♡'.repeat(Math.max(0, max - n));

    // Regelzeile (kurz einblenden)
    if (def) {
      el('div', 'mg-rule-t', toast, '').textContent = sh.tx(def.desc);
      el('div', 'mg-rule-h', toast, '').textContent = sh.tx(def.how);
      toast.classList.add('mg-show');
      sh.later(() => toast.classList.remove('mg-show'), 3600);
    }

    // Schleife (rAF; pausiert automatisch bei verstecktem Tab)
    let frameErr = false;
    function frame(now) {
      raf = 0;
      if (sh.stopped) return;
      if (document.hidden) { last = 0; schedule(); return; }
      const raw = last ? Math.min(0.25, (now - last) / 1000) : 0;   // echte Zeit (für Zeitlimits), Aussetzer > 0,25 s zählen nicht
      const dt = Math.min(0.05, raw);                                 // Physik-Schritt
      last = now;
      for (let i = 0; i < frames.length; i++) {
        try { frames[i](dt, raw); } catch (e) { if (!frameErr) { frameErr = true; console.error(e); } }
      }
      schedule();
    }
    function schedule() { if (!raf && !sh.stopped && frames.length) raf = requestAnimationFrame(frame); }
    sh.loop = fn => { frames.push(fn); schedule(); };
    sh.on(document, 'visibilitychange', () => { last = 0; });

    // Größenänderung
    const onRz = () => {
      if (rz || sh.stopped) return;
      rz = requestAnimationFrame(() => { rz = 0; if (sh.stopped) return; const s = sh.size(); resizeFns.forEach(f => f(s.w, s.h)); });
    };
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(onRz); ro.observe(stage); cleanups.push(() => ro.disconnect()); }
    else sh.on(window, 'resize', onRz);

    // Zeiger blendet den Tastatur-Rahmen aus, Aktionen blenden ihn ein
    sh.on(root, 'pointerdown', () => root.classList.remove('mg-kbd'));
    sh.on(root, 'contextmenu', e => e.preventDefault());

    // Ende
    function fire() {
      if (fired || sh.stopped || !result) return;
      fired = true; clearTimeout(endTimer);
      if (typeof o.onEnd === 'function') { try { o.onEnd(result); } catch (e) { console.error(e); } }
    }
    sh.end = (win, score, stars) => {
      if (sh.ended || sh.stopped) return;
      sh.ended = true;
      result = { win: !!win, score: Math.max(0, Math.round(score || 0)), stars: win ? clamp(Math.round(stars || 1), 1, 3) : 0 };
      sh.sfx(win ? 'win' : 'lose');
      const ov = el('div', 'mg-result ' + (win ? 'mg-win' : 'mg-lose'), root);
      const card = el('div', 'mg-result-card', ov);
      el('div', 'mg-result-t', card).textContent = win ? sh.t('Geschafft!', 'Well done!') : sh.t('Leider verloren', 'Too bad – you lost');
      const st = el('div', 'mg-result-stars', card);
      for (let i = 0; i < 3; i++) el('span', 'mg-rs' + (i < result.stars ? ' mg-on' : ''), st, STAR_SVG).style.animationDelay = (0.45 + i * 0.15) + 's';
      el('div', 'mg-result-s', card).textContent = sh.t('Punkte', 'Score') + ': ' + result.score;
      shownAt = Date.now();
      ov.addEventListener('click', () => { if (Date.now() - shownAt > 600) fire(); });
      endTimer = setTimeout(fire, 1600);
    };
    sh.abort = () => {
      if (sh.stopped) return;
      if (sh.ended) { fire(); return; }
      sh.ended = true;
      result = { win: false, score: 0, stars: 0, aborted: true };
      fire();
    };

    // Eingabe (nur über opts.input)
    if (o.input && typeof o.input.on === 'function') {
      unsub = o.input.on((a, down) => {
        if (sh.stopped) return;
        const isDown = down !== false;
        if (a === 'back') { if (isDown) sh.abort(); return; }
        if (sh.ended) { if (a === 'ok' && isDown && result && Date.now() - shownAt > 600) fire(); return; }
        if (isDown) root.classList.add('mg-kbd');
        for (let i = 0; i < actionFns.length; i++) actionFns[i](a, isDown);
      });
    }

    sh.stop = () => {
      if (sh.stopped) return;
      sh.stopped = true;
      if (raf) cancelAnimationFrame(raf);
      if (rz) cancelAnimationFrame(rz);
      clearTimeout(endTimer);
      timers.forEach(t => clearTimeout(t));
      if (typeof unsub === 'function') { try { unsub(); } catch (e) { /* egal */ } }
      for (let i = cleanups.length - 1; i >= 0; i--) { try { cleanups[i](); } catch (e) { console.error(e); } }
      frames.length = actionFns.length = resizeFns.length = 0;
      host.innerHTML = '';
    };
    return sh;
  }

  // Raster-Cursor für Aktionen
  function gridCursor(sh, getCols, count, start, onMove) {
    const c = { i: start || 0 };
    c.move = (dx, dy) => {
      const cols = getCols(), rows = Math.ceil(count / cols);
      let x = c.i % cols, y = Math.floor(c.i / cols);
      x = clamp(x + dx, 0, cols - 1); y = clamp(y + dy, 0, rows - 1);
      const ni = Math.min(count - 1, y * cols + x);
      if (ni !== c.i) { c.i = ni; onMove(); }
    };
    c.handle = a => {
      if (a === 'left') c.move(-1, 0); else if (a === 'right') c.move(1, 0);
      else if (a === 'up') c.move(0, -1); else if (a === 'down') c.move(0, 1);
      else return false;
      return true;
    };
    return c;
  }

  function makeCanvas(sh) {
    const c = el('canvas', 'mg-canvas', sh.stage);
    const ctx = c.getContext('2d');
    const v = { c, ctx, w: 1, h: 1, dpr: 1, onFit: null };
    v.fit = () => {
      const s = sh.size(), dpr = Math.min(2, window.devicePixelRatio || 1);
      v.w = s.w; v.h = s.h; v.dpr = dpr;
      c.width = Math.max(1, Math.round(s.w * dpr)); c.height = Math.max(1, Math.round(s.h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (v.onFit) v.onFit();
    };
    v.fit();
    sh.onResize(v.fit);
    return v;
  }

  // ---------- Zeichenhilfen (Canvas) ----------
  function circ(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function starPath(ctx, x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath();
  }
  function drawKivi(ctx, x, y, r, t, opt) {
    opt = opt || {};
    ctx.save(); ctx.translate(x, y);
    if (opt.alpha != null) ctx.globalAlpha = opt.alpha;
    let g = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2);
    g.addColorStop(0, 'rgba(63,216,232,0.32)'); g.addColorStop(1, 'rgba(63,216,232,0)');
    ctx.fillStyle = g; circ(ctx, 0, 0, r * 2);
    if (opt.tilt) ctx.rotate(opt.tilt);
    if (opt.wings) {
      const f = opt.flap || 0;
      ctx.fillStyle = 'rgba(143,243,251,0.8)';
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * 1.05, -r * 0.05, r * 0.72, r * 0.3, s * (-0.45 + f), 0, Math.PI * 2); ctx.fill(); }
    }
    // Spitze (Kompassnadel)
    ctx.fillStyle = '#3fd8e8';
    ctx.beginPath(); ctx.moveTo(0, -r * 1.42); ctx.lineTo(r * 0.2, -r * 0.92); ctx.lineTo(0, -r * 0.8); ctx.lineTo(-r * 0.2, -r * 0.92); ctx.closePath(); ctx.fill();
    g = ctx.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, '#fff1c9'); g.addColorStop(0.5, '#f2d08a'); g.addColorStop(1, '#c99a4a');
    ctx.fillStyle = g; circ(ctx, 0, 0, r);
    ctx.fillStyle = '#13285a'; circ(ctx, 0, 0, r * 0.74);
    ctx.save(); ctx.rotate(opt.spin || 0);
    ctx.fillStyle = '#f2d08a';
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; circ(ctx, Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, r * 0.06); }
    ctx.restore();
    // Gesicht
    ctx.fillStyle = '#fff';
    circ(ctx, -r * 0.27, -r * 0.08, r * 0.17); circ(ctx, r * 0.27, -r * 0.08, r * 0.17);
    ctx.fillStyle = '#0d1b3d';
    circ(ctx, -r * 0.24, -r * 0.05, r * 0.085); circ(ctx, r * 0.3, -r * 0.05, r * 0.085);
    ctx.strokeStyle = '#ff7a6b'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, r * 0.16, r * 0.17, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,122,107,0.45)';
    circ(ctx, -r * 0.48, r * 0.16, r * 0.09); circ(ctx, r * 0.48, r * 0.16, r * 0.09);
    ctx.restore();
  }
  function skyStars(seed, count) {
    const r = rngOf('sky:' + seed), a = [];
    for (let i = 0; i < count; i++) a.push({ x: r.next(), y: r.next(), s: 0.5 + r.next() * 1.3, p: r.next() * 6 });
    return a;
  }
  function drawSky(v, stars, t, reduced, offset) {
    const ctx = v.ctx;
    ctx.clearRect(0, 0, v.w, v.h);                      // Hintergrund kommt aus .mg-root
    for (const s of stars) {
      const x = ((s.x * v.w - (offset || 0) * s.s * 0.15) % v.w + v.w) % v.w;
      ctx.globalAlpha = reduced ? 0.7 : 0.45 + 0.4 * Math.sin(t * 1.5 + s.p);
      ctx.fillStyle = '#f2e6c4';
      ctx.fillRect(x, s.y * v.h * 0.8, s.s, s.s);
    }
    ctx.globalAlpha = 1;
  }

  // ======================================================================
  // Spiele
  // ======================================================================
  const GAMES = {};

  // ---------- 1) Lichtpfad ----------
  function pipeSVG(base) {
    const d = { 1: 'M50 50V0', 5: 'M50 0V100', 3: 'M50 0A50 50 0 0 0 100 50', 7: 'M50 0V100M50 50H100', 15: 'M50 0V100M0 50H100' }[base];
    const hub = base === 7 || base === 15 ? '<circle class="mg-lp-hub" cx="50" cy="50" r="10"/>' : base === 1 ? '<circle class="mg-lp-hub" cx="50" cy="50" r="12"/>' : '';
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path class="mg-lp-glow" d="' + d + '"/><path class="mg-lp-pipe" d="' + d + '"/><path class="mg-lp-flow" d="' + d + '"/>' + hub + '</svg>';
  }
  GAMES.lichtpfad = function (sh) {
    const n = lpSize(sh.d), pz = lpGenerate(sh.seed, n, lpMix(sh.d)), limit = lpLimit(pz.minMoves, sh.d);
    const masks = pz.start.slice(), lampSet = {}, angle = [];
    pz.lamps.forEach(i => { lampSet[i] = true; });
    let used = 0;
    const wrap = el('div', 'mg-center', sh.stage);
    const board = el('div', 'mg-board mg-lp-board', wrap);
    const cells = masks.map((m, i) => {
      const c = btn('mg-cell mg-lp-cell', board), sp = lpShape(m);
      c._rot = el('div', 'mg-lp-rot', c, pipeSVG(sp.base));
      angle[i] = sp.r * 90; c._rot.style.transform = 'rotate(' + angle[i] + 'deg)';
      if (i === pz.src) el('div', 'mg-lp-src', c, '<svg viewBox="0 0 40 40"><path d="M20 2L33 16L20 38L7 16Z"/><path class="mg-lp-src-hi" d="M20 2L26 16L20 38L14 16Z"/></svg>');
      else if (lampSet[i]) el('div', 'mg-lp-lamp', c, '<i></i>');
      sh.on(c, 'click', () => { cur.i = i; focus(); turn(i); });
      return c;
    });
    const cur = gridCursor(sh, () => n, n * n, pz.src, () => focus());
    function focus() { cells.forEach((c, i) => c.classList.toggle('mg-focus', i === cur.i)); }
    function refresh() {
      const lit = lpLit(masks, n, pz.src);
      let litLamps = 0;
      cells.forEach((c, i) => { c.classList.toggle('mg-lit', lit[i] === 1); if (lampSet[i] && lit[i]) litLamps++; });
      sh.status('m', sh.t('Züge', 'Moves'), used + ' / ' + limit, limit - used <= 5 ? 'mg-warn' : '');
      sh.status('l', sh.t('Laternen', 'Lanterns'), litLamps + ' / ' + pz.lamps.length);
      return litLamps === pz.lamps.length;
    }
    function turn(i) {
      if (sh.ended) return;
      if (masks[i] === 15) { sh.sfx('tick'); return; }      // Kreuz: Drehen ändert nichts
      masks[i] = rotMask(masks[i], 1); angle[i] += 90;
      cells[i]._rot.style.transform = 'rotate(' + angle[i] + 'deg)';
      used++;
      const before = cells[i].classList.contains('mg-lit');
      const done = refresh();
      sh.sfx(cells[i].classList.contains('mg-lit') && !before ? 'good' : 'tap');
      if (done) {
        const slack = limit - pz.minMoves, extra = Math.max(0, used - pz.minMoves);
        sh.end(true, 100 + (limit - used) * 10, extra <= slack * 0.3 ? 3 : extra <= slack * 0.65 ? 2 : 1);
      } else if (used >= limit) sh.end(false, 0, 0);
    }
    function layout() {
      const s = sh.size(), gap = 3, pad = 8;
      const cell = Math.max(24, Math.floor((Math.min(s.w - 12, s.h - 12) - pad * 2 - gap * (n - 1)) / n));
      board.style.gridTemplateColumns = 'repeat(' + n + ',' + cell + 'px)';
      board.style.gridAutoRows = cell + 'px';
    }
    sh.onAction((a, down) => { if (!down) return; if (cur.handle(a)) return; if (a === 'ok') turn(cur.i); });
    sh.onResize(layout);
    layout(); focus(); refresh();
  };

  // ---------- 2) Kristallsuche (THREE) ----------
  GAMES.kristallsuche = function (sh) {
    const THREE = typeof window !== 'undefined' ? window.THREE : null;
    const cfg = ksConfig(sh.d);
    function fail() {
      el('div', 'mg-msg', sh.stage).textContent = sh.t('3D-Grafik (WebGL) ist auf diesem Gerät nicht verfügbar.', '3D graphics (WebGL) are not available on this device.');
      sh.later(() => sh.abort(), 1800);
    }
    if (!THREE || !THREE.WebGLRenderer) { fail(); return; }
    let renderer = null;
    try {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) throw new Error('no webgl');
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { fail(); return; }
    const geos = [], mats = [];
    const G = g => { geos.push(g); return g; }, M = m => { mats.push(m); return m; };
    sh.cleanup(() => {
      geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose());
      renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss();
    });
    let lost = false;
    renderer.domElement.className = 'mg-canvas mg-ks-canvas';
    sh.on(renderer.domElement, 'webglcontextlost', e => { e.preventDefault(); if (!lost && !sh.stopped) { lost = true; renderer.domElement.style.display = 'none'; fail(); } });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    sh.stage.appendChild(renderer.domElement);
    const cross = el('div', 'mg-ks-cross', sh.stage);

    const r = rngOf('kristall:' + sh.seed + ':' + sh.d);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x14275a, 24, 60);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
    scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x3a2f5a, 0.75));
    const sun = new THREE.DirectionalLight(0xffe2b0, 0.85); sun.position.set(6, 12, 5); scene.add(sun);
    const rim = new THREE.DirectionalLight(0x3fd8e8, 0.35); rim.position.set(-8, 4, -6); scene.add(rim);

    const R = 6;
    const lam = c => M(new THREE.MeshLambertMaterial({ color: c }));
    const top = new THREE.Mesh(G(new THREE.CylinderGeometry(R, R - 0.2, 0.6, 48)), lam(0x23845f)); top.position.y = -0.3; scene.add(top);
    const rimRing = new THREE.Mesh(G(new THREE.TorusGeometry(R - 0.1, 0.18, 8, 64)), lam(0x2e9d70)); rimRing.rotation.x = Math.PI / 2; rimRing.position.y = -0.02; scene.add(rimRing);
    const under = new THREE.Mesh(G(new THREE.ConeGeometry(R - 0.2, 4.6, 40)), lam(0x54467e)); under.rotation.x = Math.PI; under.position.y = -2.9; scene.add(under);
    const glade = new THREE.Mesh(G(new THREE.CircleGeometry(2.2, 32)), lam(0x3a9f74)); glade.rotation.x = -Math.PI / 2; glade.position.y = 0.01; scene.add(glade);
    // Sterne im Hintergrund
    const sp = [];
    for (let i = 0; i < 220; i++) { const a = r.next() * Math.PI * 2, e = r.next() * 1.2 - 0.2, d = 45 + r.next() * 10; sp.push(Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d); }
    const sg = G(new THREE.BufferGeometry()); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const dotC = document.createElement('canvas'); dotC.width = dotC.height = 32;
    const dg = dotC.getContext('2d'), rg = dg.createRadialGradient(16, 16, 0, 16, 16, 16);
    rg.addColorStop(0, 'rgba(255,248,225,1)'); rg.addColorStop(0.35, 'rgba(242,208,138,0.8)'); rg.addColorStop(1, 'rgba(242,208,138,0)');
    dg.fillStyle = rg; dg.fillRect(0, 0, 32, 32);
    const dotT = new THREE.CanvasTexture(dotC); sh.cleanup(() => dotT.dispose());
    scene.add(new THREE.Points(sg, M(new THREE.PointsMaterial({ map: dotT, size: 0.9, transparent: true, depthWrite: false, fog: false }))));
    // Kleine schwebende Felsen
    const ico = G(new THREE.IcosahedronGeometry(1, 0)), rockMats = [lam(0x7d7fa8), lam(0x8e86b8), lam(0x6a6d96)];
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(ico, rockMats[i % 3]), a = i * 1.7 + 0.4; m.position.set(Math.cos(a) * 12, -2.5 + i * 1.1, Math.sin(a) * 12); m.scale.setScalar(0.35 + i * 0.1); scene.add(m); }

    // Objekte
    const sph = G(new THREE.SphereGeometry(1, 16, 12)), dode = G(new THREE.DodecahedronGeometry(1, 0)), cyl = G(new THREE.CylinderGeometry(1, 1, 1, 12)), cone = G(new THREE.ConeGeometry(1, 1, 14));
    const capG = G(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2));
    const bushM = [lam(0x1f8a5e), lam(0x27a36d), lam(0x2cb17a)], treeM = [lam(0x1e7a58), lam(0x248a62)], trunkM = lam(0x8a6a4e), stemM = lam(0xf3e6cf), capM = [lam(0xff7a6b), lam(0xf2a65a), lam(0xd56fb0)], flowerM = [lam(0xf2d08a), lam(0xff9fc8), lam(0xffffff)];
    const objs = [], pick = [top, glade];
    function free(x, z, rad) { return objs.every(o => Math.hypot(o.x - x, o.z - z) > o.rad + rad + 0.15) && Math.hypot(x, z) < R - 0.5 - rad * 0.5; }
    const nObj = 14 + sh.d * 2;
    for (let tries = 0; objs.length < nObj && tries < 600; tries++) {
      const a = r.next() * Math.PI * 2, dist = 1 + r.next() * (R - 1.6), x = Math.cos(a) * dist, z = Math.sin(a) * dist;
      const kind = r.weighted(['bush', 'rock', 'mush', 'tree'], k => ({ bush: 4, rock: 3, mush: 2.5, tree: 1.6 })[k]);
      const s = 0.6 + r.next() * 0.45, rad = { bush: 0.9, rock: 0.75, mush: 0.45, tree: 0.7 }[kind] * s;
      if (!free(x, z, rad)) continue;
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r.next() * 6.28;
      if (kind === 'bush') {
        const mat = r.pick(bushM);
        [[0, 0.55, 0, 0.75], [0.5, 0.4, 0.2, 0.55], [-0.45, 0.38, -0.1, 0.5], [0.05, 0.35, -0.5, 0.5]].forEach(b => { const m = new THREE.Mesh(sph, mat); m.position.set(b[0] * s, b[1] * s, b[2] * s); m.scale.setScalar(b[3] * s); g.add(m); });
      } else if (kind === 'rock') {
        const m = new THREE.Mesh(dode, r.pick(rockMats)); m.scale.set(0.8 * s, 0.6 * s, 0.7 * s); m.position.y = 0.3 * s; m.rotation.set(r.next(), r.next(), r.next()); g.add(m);
      } else if (kind === 'mush') {
        const st = new THREE.Mesh(cyl, stemM); st.scale.set(0.13 * s, 0.6 * s, 0.13 * s); st.position.y = 0.3 * s; g.add(st);
        const cp = new THREE.Mesh(capG, r.pick(capM)); cp.scale.set(0.45 * s, 0.32 * s, 0.45 * s); cp.position.y = 0.58 * s; g.add(cp);
      } else {
        const tr = new THREE.Mesh(cyl, trunkM); tr.scale.set(0.14 * s, 0.6 * s, 0.14 * s); tr.position.y = 0.3 * s; g.add(tr);
        const mat = r.pick(treeM);
        [[0.9, 1.3, 1.0], [0.68, 1.1, 1.65], [0.45, 0.9, 2.2]].forEach(c => { const m = new THREE.Mesh(cone, mat); m.scale.set(c[0] * s, c[1] * s, c[0] * s); m.position.y = c[2] * s; g.add(m); });
      }
      scene.add(g); pick.push(g);
      objs.push({ x, z, rad, kind, s, g });
    }
    // Blumen (Deko)
    for (let i = 0; i < 26; i++) {
      const a = r.next() * 6.28, dist = 0.6 + r.next() * (R - 1), x = Math.cos(a) * dist, z = Math.sin(a) * dist;
      if (!objs.every(o => Math.hypot(o.x - x, o.z - z) > o.rad)) continue;
      const m = new THREE.Mesh(sph, r.pick(flowerM)); m.scale.setScalar(0.07 + r.next() * 0.04); m.position.set(x, 0.08, z); scene.add(m);
    }
    // Kristalle
    const oct = G(new THREE.OctahedronGeometry(0.42, 0));
    const crysCols = [0x3fd8e8, 0xff9fc8, 0xf2d08a, 0xb9a2ff];
    const crystals = [];
    const hosts = r.shuffle(objs.slice());
    for (let i = 0; i < cfg.crystals; i++) {
      const col = crysCols[i % crysCols.length];
      const mat = M(new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, shininess: 90, flatShading: true, transparent: true, opacity: 0.95 }));
      const g = new THREE.Group(); g.userData = { crystal: true, found: false, anim: -1 };
      const main = new THREE.Mesh(oct, mat); main.scale.set(1, 1.75, 1); main.position.y = 0.55; g.add(main);
      const side = new THREE.Mesh(oct, mat); side.scale.set(0.55, 1.0, 0.55); side.position.set(0.3, 0.3, 0.1); side.rotation.z = -0.5; g.add(side);
      let x, z;
      const h = hosts[i % hosts.length];
      if (h && i < hosts.length) { const a = r.next() * 6.28; x = h.x + Math.cos(a) * h.rad * cfg.expose; z = h.z + Math.sin(a) * h.rad * cfg.expose; }
      else { const a = r.next() * 6.28, dd = 1 + r.next() * 4; x = Math.cos(a) * dd; z = Math.sin(a) * dd; }
      const len = Math.hypot(x, z); if (len > R - 0.6) { x *= (R - 0.6) / len; z *= (R - 0.6) / len; }
      g.position.set(x, -0.12, z); g.rotation.y = r.next() * 6.28;
      g.userData.base = g.position.y; g.userData.ph = r.next() * 6;
      scene.add(g); pick.push(g); crystals.push(g);
    }
    // Funkeln
    const sparkG = G(new THREE.OctahedronGeometry(0.09, 0)), sparkM = M(new THREE.MeshBasicMaterial({ color: 0xfff3c4, transparent: true, opacity: 1 }));
    const sparks = [];
    function burst(pos) {
      for (let i = 0; i < (sh.reduced ? 0 : 14); i++) {
        const m = new THREE.Mesh(sparkG, sparkM); m.position.copy(pos);
        const a = Math.random() * 6.28, e = Math.random() * 1.2;
        m.userData.v = new THREE.Vector3(Math.cos(a) * Math.cos(e) * 3, 1.5 + Math.sin(e) * 3, Math.sin(a) * Math.cos(e) * 3);
        m.userData.t = 0; scene.add(m); sparks.push(m);
      }
    }

    let yaw = r.next() * 6.28, w = 1, h = 1, timeLeft = cfg.time, found = 0;
    const cxy = { x: 0.5, y: 0.55 }, held = {};
    function placeCam() {
      const asp = w / h, vf = 50 * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * asp);
      const dist = Math.max(10, (asp < 1 ? 6.0 : 5.4) / Math.sin(Math.min(vf, hf) / 2));
      camera.position.set(Math.sin(yaw) * dist * 0.86, dist * 0.5, Math.cos(yaw) * dist * 0.86);
      camera.lookAt(0, 0.3, 0);
    }
    function fit() {
      const s = sh.size(); w = s.w; h = s.h;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); placeCam();
      cross.style.left = (cxy.x * w) + 'px'; cross.style.top = (cxy.y * h) + 'px';
    }
    sh.onResize(fit); fit();

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tmp = new THREE.Vector3();
    function crystalOf(o) { while (o && !(o.userData && o.userData.crystal)) o = o.parent; return o; }
    function tryPick(px, py) {
      if (sh.ended) return;
      ndc.set(px / w * 2 - 1, -(py / h) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(pick, true);
      let c = hits.length ? crystalOf(hits[0].object) : null;
      if (c && c.userData.found) c = null;
      if (!c) {
        let best = cfg.fuzzy * cfg.fuzzy;
        crystals.forEach(k => {
          if (k.userData.found) return;
          tmp.set(k.position.x, k.position.y + 0.5, k.position.z).project(camera);
          if (tmp.z > 1) return;
          const dx = (tmp.x + 1) / 2 * w - px, dy = (1 - tmp.y) / 2 * h - py, d2 = dx * dx + dy * dy;
          if (d2 < best) { best = d2; c = k; }
        });
      }
      if (c) {
        c.userData.found = true; c.userData.anim = 0; found++;
        tmp.set(c.position.x, c.position.y + 0.6, c.position.z); burst(tmp);
        sh.sfx('good'); hud();
        if (found >= crystals.length) {
          const frac = timeLeft / cfg.time;
          sh.end(true, found * 50 + Math.ceil(timeLeft) * 5, frac >= 0.45 ? 3 : frac >= 0.2 ? 2 : 1);
        }
      } else {
        timeLeft = Math.max(0, timeLeft - cfg.penalty); sh.sfx('bad');
        const f = el('div', 'mg-float mg-bad', sh.stage); f.textContent = '−' + cfg.penalty + ' s';
        f.style.left = px + 'px'; f.style.top = py + 'px';
        sh.later(() => f.remove(), 900);
      }
    }
    // Zeiger: Ziehen dreht, kurzes Tippen sammelt
    let drag = null;
    const cv = renderer.domElement;
    sh.on(cv, 'pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* egal */ } });
    sh.on(cv, 'pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x; drag.moved += Math.abs(dx) + Math.abs(e.clientY - drag.y); drag.x = e.clientX; drag.y = e.clientY;
      if (drag.moved > 8) { yaw -= dx * 0.009; placeCam(); }
    });
    const up = e => {
      if (!drag || drag.id !== e.pointerId) return;
      const tap = drag.moved <= 8; drag = null;
      if (tap) { const b = cv.getBoundingClientRect(); tryPick(e.clientX - b.left, e.clientY - b.top); }
    };
    sh.on(cv, 'pointerup', up);
    sh.on(cv, 'pointercancel', () => { drag = null; });
    sh.onAction((a, down) => {
      if (a === 'ok' || a === 'alt') { if (down) tryPick(cxy.x * w, cxy.y * h); return; }
      held[a] = down;
    });
    function hud() {
      sh.status('c', sh.t('Kristalle', 'Crystals'), found + ' / ' + crystals.length);
      sh.status('t', sh.t('Zeit', 'Time'), Math.ceil(timeLeft) + ' s', timeLeft <= 10 ? 'mg-warn' : '');
    }
    hud();
    let tAll = 0;
    sh.loop((dt, raw) => {
      if (lost) return;
      tAll += dt;
      if (!sh.ended) {
        timeLeft -= raw;
        if (timeLeft <= 0) { timeLeft = 0; hud(); sh.end(false, found * 20, 0); }
        // Fadenkreuz
        const sp2 = 0.55 * dt, hx = (held.right ? 1 : 0) - (held.left ? 1 : 0), hy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
        if (hx || hy) {
          cxy.x = clamp(cxy.x + hx * sp2 * (h / Math.max(w, h)) * 1.6, 0.06, 0.94); cxy.y = clamp(cxy.y + hy * sp2, 0.08, 0.92);
          if ((hx < 0 && cxy.x <= 0.06) || (hx > 0 && cxy.x >= 0.94)) { yaw += hx * 1.5 * dt; placeCam(); }
          cross.style.left = (cxy.x * w) + 'px'; cross.style.top = (cxy.y * h) + 'px';
        }
        hud();
      }
      crystals.forEach(c => {
        const u = c.userData;
        if (u.anim >= 0) {
          u.anim += dt;
          const k = u.anim / 0.7;
          c.position.y = u.base + k * 1.6; c.rotation.y += dt * 9;
          c.scale.setScalar(Math.max(0.001, k < 0.3 ? 1 + k : 1.3 * (1 - (k - 0.3) / 0.7)));
          if (k >= 1) { c.visible = false; u.anim = -2; }
        } else if (u.anim === -1 && !sh.reduced) {
          c.position.y = u.base + Math.sin(tAll * 2 + u.ph) * 0.05; c.rotation.y += dt * 0.6;
        }
      });
      for (let i = sparks.length - 1; i >= 0; i--) {
        const m = sparks[i]; m.userData.t += dt;
        m.position.addScaledVector(m.userData.v, dt); m.userData.v.y -= 6 * dt;
        m.scale.setScalar(Math.max(0.01, 1 - m.userData.t / 0.9));
        if (m.userData.t > 0.9) { scene.remove(m); sparks.splice(i, 1); }
      }
      renderer.render(scene, camera);
    });
  };

  // ---------- 3) Wolkengleiter ----------
  GAMES.wolkengleiter = function (sh) {
    const course = wgCourse(sh.seed, sh.d), v = makeCanvas(sh), ctx = v.ctx, sky = skyStars(sh.seed, 70);
    const K = { y: 50, vy: 0 };
    let x = 0, started = false, hold = false, lives = 3, inv = 0, got = 0, t = 0, shake = 0;
    const press = d => { if (sh.ended) return; hold = d; if (d && !started) { started = true; sh.sfx('tap'); } };
    sh.onAction((a, down) => { if (a === 'ok' || a === 'up') press(down); });
    sh.on(v.c, 'pointerdown', e => { try { v.c.setPointerCapture(e.pointerId); } catch (er) { /* egal */ } press(true); });
    sh.on(v.c, 'pointerup', () => press(false));
    sh.on(v.c, 'pointercancel', () => press(false));
    function geo() { const s = Math.min(v.h / 100, v.w / 80); return { s, oy: (v.h - 100 * s) / 2, kx: v.w * 0.22 }; }
    function hud() {
      sh.status('l', sh.t('Leben', 'Lives'), sh.hearts(lives, 3), 'mg-hearts');
      sh.status('s', sh.t('Sterne', 'Stars'), got);
      sh.meter('p', sh.t('Strecke', 'Distance'), x / course.goal);
    }
    hud();
    sh.loop((dt) => {
      t += dt;
      if (started && !sh.ended) {
        K.vy = clamp(K.vy + (hold ? -WG.lift : WG.grav) * dt, -WG.vMax, WG.vMax);
        K.y += K.vy * dt;
        if (K.y < 6) { K.y = 6; K.vy = Math.max(0, K.vy); }
        if (K.y > 94) { K.y = 94; K.vy = Math.min(0, K.vy); }
        x += course.speed * dt; inv = Math.max(0, inv - dt);
        for (const c of course.clouds) {
          if (c.x < x - 20) continue; if (c.x > x + 20) break;
          if (!c.hit && inv <= 0 && circleHit(x, K.y, WG.r, c.x, c.y, c.r * 0.82)) {
            c.hit = true; lives--; inv = 1.3; shake = 0.35; sh.sfx('bad');
            if (lives <= 0) { hud(); sh.end(false, got * 10, 0); break; }
          }
        }
        for (const s of course.stars) {
          if (!s.got && Math.abs(s.x - x) < 12 && circleHit(x, K.y, WG.r + 2, s.x, s.y, 3)) { s.got = true; got++; sh.sfx('good'); }
        }
        if (!sh.ended && x >= course.goal) { x = course.goal; hud(); sh.end(true, 100 + got * 15 + lives * 50, lives); }
        hud();
      } else if (!started) K.y = 50 + Math.sin(t * 2) * (sh.reduced ? 0 : 3);
      shake = Math.max(0, shake - dt);
      draw();
    });
    function cloudShape(cx, cy, rr, storm, a) {
      if (storm) { ctx.fillStyle = '#2b2d55'; circ(ctx, cx - rr * 0.3, cy + rr * 0.35, rr * 0.8); circ(ctx, cx + rr * 0.5, cy + rr * 0.35, rr * 0.75); }
      ctx.fillStyle = storm ? '#3f4476' : 'rgba(220,232,255,' + a + ')';
      circ(ctx, cx, cy, rr); circ(ctx, cx - rr * 0.8, cy + rr * 0.25, rr * 0.7); circ(ctx, cx + rr * 0.85, cy + rr * 0.2, rr * 0.72); circ(ctx, cx + rr * 0.2, cy - rr * 0.45, rr * 0.75);
      if (storm) {
        ctx.fillStyle = '#545a92'; circ(ctx, cx - rr * 0.1, cy - rr * 0.35, rr * 0.55); circ(ctx, cx + rr * 0.5, cy - rr * 0.25, rr * 0.4);
      }
    }
    function draw() {
      const g = geo(), s = g.s, oy = g.oy, kx = g.kx;
      const sx = wx => kx + (wx - x) * s, sy = wy => oy + wy * s;
      ctx.save();
      if (shake > 0 && !sh.reduced) ctx.translate((Math.random() - 0.5) * 8 * shake, (Math.random() - 0.5) * 8 * shake);
      drawSky(v, sky, t, sh.reduced, x * s);
      // ferne Inseln
      for (let i = 0; i < 4; i++) {
        const px = ((i * 0.31 * v.w - x * s * 0.2) % (v.w * 1.3) + v.w * 1.3) % (v.w * 1.3) - v.w * 0.15, py = oy + (24 + i * 13) * s;
        ctx.fillStyle = 'rgba(93,76,134,0.2)'; ctx.beginPath(); ctx.moveTo(px - 9 * s, py); ctx.lineTo(px, py + 7 * s); ctx.lineTo(px + 9 * s, py); ctx.fill();
        ctx.fillStyle = 'rgba(46,196,166,0.13)'; ctx.beginPath(); ctx.ellipse(px, py, 9.5 * s, 2 * s, 0, 0, Math.PI * 2); ctx.fill();
      }
      // Wolkenmeer unten, Rand oben
      if (oy > 2) {
        const cg = ctx.createLinearGradient(0, 0, 0, sy(-3)); cg.addColorStop(0, 'rgba(200,215,255,0)'); cg.addColorStop(1, 'rgba(200,215,255,0.14)');
        ctx.fillStyle = cg; ctx.fillRect(0, 0, v.w, sy(-3));
      }
      ctx.fillStyle = 'rgba(200,215,255,0.14)'; ctx.fillRect(0, sy(103), v.w, v.h - sy(103));
      for (let i = -1; i < v.w / (14 * s) + 2; i++) {
        const px = i * 14 * s - (x * s * 0.6) % (14 * s);
        cloudShape(px, sy(103), 8 * s, false, 0.2);
        if (oy > 2) cloudShape(px + 7 * s, sy(-3), 7 * s, false, 0.16);
      }
      // Ziel
      const gx = sx(course.goal);
      if (gx < v.w + 40 * s) {
        ctx.lineWidth = 3 * s; ctx.strokeStyle = 'rgba(242,208,138,0.9)';
        ctx.beginPath(); ctx.ellipse(gx, sy(50), 8 * s, 40 * s, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(242,208,138,0.12)'; ctx.fill();
      }
      // Sterne
      for (const st of course.stars) {
        if (st.got) continue; const px = sx(st.x); if (px < -20 || px > v.w + 20) continue;
        const gg = ctx.createRadialGradient(px, sy(st.y), 0, px, sy(st.y), 6 * s);
        gg.addColorStop(0, 'rgba(242,208,138,0.55)'); gg.addColorStop(1, 'rgba(242,208,138,0)');
        ctx.fillStyle = gg; circ(ctx, px, sy(st.y), 6 * s);
        ctx.fillStyle = '#ffe3a0'; starPath(ctx, px, sy(st.y), (sh.reduced ? 3 : 3 + Math.sin(t * 4 + st.x) * 0.3) * s, 0); ctx.fill();
      }
      // Sturmwolken
      for (const c of course.clouds) {
        const px = sx(c.x); if (px < -c.r * 2.5 * s || px > v.w + c.r * 2.5 * s) continue;
        ctx.globalAlpha = c.hit ? 0.45 : 1;
        cloudShape(px, sy(c.y), c.r * s * 0.82, true, 1);
        ctx.fillStyle = '#f2d08a'; ctx.beginPath();
        const bx = px, by = sy(c.y) + c.r * s * 0.2, k = c.r * s * 0.12;
        ctx.moveTo(bx + k, by - 3 * k); ctx.lineTo(bx - k * 1.4, by + k * 0.6); ctx.lineTo(bx + k * 0.2, by + k * 0.6); ctx.lineTo(bx - k, by + 3.6 * k); ctx.lineTo(bx + k * 1.6, by - k * 0.2); ctx.lineTo(bx, by - k * 0.2); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      }
      // Kivi
      const blink = inv > 0 && Math.floor(inv * 10) % 2 === 0;
      drawKivi(ctx, kx, sy(K.y), WG.r * s * 1.05, t, { wings: true, flap: sh.reduced ? 0 : Math.sin(t * (hold ? 22 : 9)) * 0.35, tilt: clamp(K.vy / 140, -0.35, 0.35), alpha: blink ? 0.35 : 1 });
      if (!started && !sh.ended) {
        ctx.fillStyle = 'rgba(13,27,61,0.7)';
        const tw = Math.min(v.w - 32, 340), th = 54, tx = (v.w - tw) / 2, ty = v.h * 0.72;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(tx, ty, tw, th, 27); else ctx.rect(tx, ty, tw, th); ctx.fill();
        ctx.fillStyle = '#f2d08a'; ctx.font = '600 17px Fredoka, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(sh.t('Tippen & halten zum Starten', 'Tap & hold to start'), v.w / 2, ty + th / 2);
      }
      ctx.restore();
    }
  };

  // ---------- 4) Runen-Memory ----------
  function runeSVG(i) { const d = RUNES[i]; return '<svg viewBox="0 0 100 100" aria-hidden="true"><path class="mg-rune-glow" d="' + d + '"/><path class="mg-rune" d="' + d + '"/></svg>'; }
  const CARD_BACK = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="30" class="mg-cb-ring"/><circle cx="50" cy="50" r="40" class="mg-cb-ring2"/><path d="M50 22L57 50L50 78L43 50Z" class="mg-cb-needle"/><path d="M50 22L57 50L43 50Z" class="mg-cb-north"/><circle cx="50" cy="50" r="4" class="mg-cb-dot"/><circle cx="50" cy="13" r="2" class="mg-cb-dot"/><circle cx="87" cy="50" r="2" class="mg-cb-dot"/><circle cx="50" cy="87" r="2" class="mg-cb-dot"/><circle cx="13" cy="50" r="2" class="mg-cb-dot"/></svg>';
  GAMES.runenmemory = function (sh) {
    const cfg = memConfig(sh.d), deck = memDeal(sh.seed, cfg.pairs);
    let misses = 0, found = 0, open = [], pend = 0, cols = cfg.a;
    const wrap = el('div', 'mg-center', sh.stage);
    const board = el('div', 'mg-board mg-mem-board', wrap);
    const state = deck.map((rid, i) => {
      const c = btn('mg-cell mg-mem-card', board, '<div class="mg-mem-inner"><div class="mg-mem-back">' + CARD_BACK + '</div><div class="mg-mem-face">' + runeSVG(rid) + '</div></div>');
      c.style.setProperty('--rc', RUNE_COLORS[rid % RUNE_COLORS.length]);
      sh.on(c, 'click', () => { cur.i = i; focus(); flip(i); });
      return { el: c, rid, open: false, matched: false };
    });
    const cur = gridCursor(sh, () => cols, deck.length, 0, () => focus());
    function focus() { state.forEach((s, i) => s.el.classList.toggle('mg-focus', i === cur.i)); }
    function hud() {
      sh.status('p', sh.t('Paare', 'Pairs'), found + ' / ' + cfg.pairs);
      sh.status('m', sh.t('Fehler', 'Misses'), misses + ' / ' + cfg.misses, cfg.misses - misses <= 2 ? 'mg-warn' : '');
    }
    function closeOpen() { clearTimeout(pend); open.forEach(j => { state[j].open = false; state[j].el.classList.remove('mg-open', 'mg-miss'); }); open = []; }
    function flip(i) {
      if (sh.ended) return;
      const s = state[i];
      if (s.matched) return;
      if (open.length === 2) closeOpen();
      if (s.open) return;
      s.open = true; s.el.classList.add('mg-open'); open.push(i);
      if (open.length < 2) { sh.sfx('tap'); return; }
      const a = state[open[0]], b = state[open[1]];
      if (a.rid === b.rid) {
        a.matched = b.matched = true; a.el.classList.add('mg-matched'); b.el.classList.add('mg-matched'); open = []; found++;
        sh.sfx('good'); hud();
        if (found === cfg.pairs) sh.end(true, found * 20 + (cfg.misses - misses) * 10, misses <= cfg.pairs * 0.5 ? 3 : misses <= cfg.pairs ? 2 : 1);
      } else {
        misses++; sh.sfx('bad'); hud();
        a.el.classList.add('mg-miss'); b.el.classList.add('mg-miss');
        if (misses >= cfg.misses) sh.end(false, found * 10, 0);
        else pend = sh.later(closeOpen, 950);
      }
    }
    function layout() {
      const s = sh.size(), land = s.w > s.h * 1.05, gap = 8, pad = 10;
      cols = land ? cfg.a : cfg.b;
      const rows = deck.length / cols;
      const byW = (s.w - 12 - pad * 2 - gap * (cols - 1)) / cols, byH = (s.h - 12 - pad * 2 - gap * (rows - 1)) / rows;
      const ratio = byH / byW < 1.18 ? Math.max(1, byH / byW) : 1.18;     // bei wenig Höhe quadratischer
      const w = Math.floor(Math.max(36, Math.min(150, byW, byH / ratio)));
      board.style.gridTemplateColumns = 'repeat(' + cols + ',' + w + 'px)';
      board.style.gridAutoRows = Math.floor(w * ratio) + 'px';
    }
    sh.onAction((a, down) => { if (!down) return; if (cur.handle(a)) return; if (a === 'ok') flip(cur.i); });
    sh.onResize(layout);
    layout(); focus(); hud();
  };

  // ---------- 5) Funkel-Puzzle ----------
  const CONSTELLATIONS = [
    { name: { de: 'Kivis Kompass', en: 'Kivi’s Compass' }, p: [[0.5, 0.14], [0.8, 0.47], [0.5, 0.8], [0.2, 0.47], [0.5, 0.47], [0.66, 0.24], [0.34, 0.7]], l: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 2], [3, 4], [4, 1]] },
    { name: { de: 'Himmelswagen', en: 'Sky Wagon' }, p: [[0.14, 0.3], [0.3, 0.24], [0.46, 0.34], [0.58, 0.46], [0.6, 0.72], [0.86, 0.74], [0.86, 0.48]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
    { name: { de: 'Sternenkrone', en: 'Star Crown' }, p: [[0.14, 0.7], [0.18, 0.3], [0.34, 0.52], [0.5, 0.18], [0.66, 0.52], [0.82, 0.3], [0.86, 0.7]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]] },
    { name: { de: 'Wolkenvogel', en: 'Cloud Bird' }, p: [[0.12, 0.42], [0.3, 0.52], [0.5, 0.44], [0.7, 0.28], [0.88, 0.18], [0.6, 0.7], [0.4, 0.82]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]] }
  ];
  function starImage(sh) {
    const r = rngOf('sternbild:' + sh.seed), S = 480, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d'), cons = r.pick(CONSTELLATIONS);
    let gr = g.createLinearGradient(0, 0, S, S);
    gr.addColorStop(0, '#0d1b3d'); gr.addColorStop(1, '#22306e');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    const neb = ['rgba(63,216,232,', 'rgba(255,122,107,', 'rgba(185,162,255,', 'rgba(46,196,166,'];
    for (let i = 0; i < 5; i++) {
      const x = r.next() * S, y = r.next() * S, rad = S * (0.25 + r.next() * 0.3), col = neb[i % neb.length];
      gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, col + '0.32)'); gr.addColorStop(1, col + '0)');
      g.fillStyle = gr; g.fillRect(0, 0, S, S);
    }
    for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(255,245,220,' + (0.3 + r.next() * 0.6) + ')'; const s = r.next() < 0.85 ? 1.2 : 2.2; g.fillRect(r.next() * S, r.next() * S, s, s); }
    // Raster aus feinen Linien hilft bei der Orientierung
    g.strokeStyle = 'rgba(242,208,138,0.07)'; g.lineWidth = 1;
    for (let i = 1; i < 8; i++) { g.beginPath(); g.arc(S / 2, S / 2, i * S / 14, 0, Math.PI * 2); g.stroke(); }
    const P = cons.p.map(p => [p[0] * S, p[1] * S]);
    g.strokeStyle = 'rgba(242,208,138,0.75)'; g.lineWidth = 4; g.lineCap = 'round';
    cons.l.forEach(l => { g.beginPath(); g.moveTo(P[l[0]][0], P[l[0]][1]); g.lineTo(P[l[1]][0], P[l[1]][1]); g.stroke(); });
    P.forEach((p, i) => {
      const rad = i % 3 === 0 ? 15 : 11;
      gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad * 3); gr.addColorStop(0, 'rgba(255,250,230,0.9)'); gr.addColorStop(0.3, 'rgba(63,216,232,0.35)'); gr.addColorStop(1, 'rgba(63,216,232,0)');
      g.fillStyle = gr; g.fillRect(p[0] - rad * 3, p[1] - rad * 3, rad * 6, rad * 6);
      g.fillStyle = '#fffbe9'; g.beginPath(); g.arc(p[0], p[1], rad * 0.45, 0, Math.PI * 2); g.fill();
    });
    return { url: c.toDataURL('image/jpeg', 0.88), name: sh.tx(cons.name) };
  }
  GAMES.funkelpuzzle = function (sh) {
    const cfg = fpConfig(sh.d), n = cfg.n, N = n * n, b = fpShuffle(sh.seed, n, cfg.steps), img = starImage(sh);
    let moves = 0, bonus = 0, cell = 60;
    const homeDone = {};
    const wrap = el('div', 'mg-center', sh.stage);
    const board = el('div', 'mg-fp-board', wrap);
    const prev = el('div', 'mg-fp-preview', board); prev.style.backgroundImage = 'url(' + img.url + ')';
    const tools = el('div', 'mg-row mg-fp-tools', wrap);
    el('div', 'mg-legend', tools).textContent = sh.t('Sternbild: ', 'Constellation: ') + img.name;
    const eye = btn('mg-btn', tools, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/></svg><span></span>');
    eye.querySelector('span').textContent = sh.t('Vorschau', 'Preview');
    const cursorEl = el('div', 'mg-fp-cursor', board);
    const tiles = {};
    for (let id = 1; id < N; id++) {
      const t = btn('mg-fp-tile', board), hx = (id - 1) % n, hy = Math.floor((id - 1) / n);
      t.style.backgroundImage = 'url(' + img.url + ')';
      t.style.backgroundSize = (n * 100) + '% ' + (n * 100) + '%';
      t.style.backgroundPosition = (hx / (n - 1) * 100) + '% ' + (hy / (n - 1) * 100) + '%';
      el('span', 'mg-fp-num', t).textContent = id;
      sh.on(t, 'click', () => { const p = b.indexOf(id); cur.i = p; place(); tap(p); });
      tiles[id] = t;
    }
    const cur = gridCursor(sh, () => n, N, b.indexOf(0) === 0 ? 1 : 0, () => place());
    function place() {
      for (let p = 0; p < N; p++) {
        const id = b[p]; if (!id) continue;
        const t = tiles[id];
        t.style.transform = 'translate(' + ((p % n) * cell) + 'px,' + (Math.floor(p / n) * cell) + 'px)';
        t.classList.toggle('mg-home', p === id - 1);
      }
      cursorEl.style.transform = 'translate(' + ((cur.i % n) * cell) + 'px,' + (Math.floor(cur.i / n) * cell) + 'px)';
    }
    function hud() {
      sh.status('m', sh.t('Züge', 'Moves'), moves + ' / ' + cfg.limit, cfg.limit - moves <= 10 ? 'mg-warn' : '');
      sh.status('b', sh.t('Funkeln', 'Sparkle'), '+' + bonus);
    }
    function tap(p) {
      if (sh.ended) return;
      const moved = fpSlide(b, n, p);
      if (!moved) { sh.sfx('tick'); return; }
      moves += moved.length;
      let sparkle = false;
      moved.forEach(id => {
        if (b[id - 1] === id && !homeDone[id]) {
          homeDone[id] = true; bonus += 15; sparkle = true;
          const t = tiles[id]; t.classList.remove('mg-sparkle'); void t.offsetWidth; t.classList.add('mg-sparkle');
          sh.later(() => t.classList.remove('mg-sparkle'), 900);
        }
      });
      sh.sfx(sparkle ? 'good' : 'tap');
      place(); hud();
      if (fpSolved(b)) {
        board.classList.add('mg-fp-done');
        sh.end(true, 100 + (cfg.limit - moves) * 2 + bonus, moves <= cfg.steps * 2 ? 3 : moves <= cfg.steps * 3.5 ? 2 : 1);
      } else if (moves >= cfg.limit) sh.end(false, bonus, 0);
    }
    let prevT = 0;
    function preview() { board.classList.add('mg-fp-show'); clearTimeout(prevT); prevT = sh.later(() => board.classList.remove('mg-fp-show'), 1600); }
    sh.on(eye, 'click', preview);
    function layout() {
      const s = sh.size(), side = s.w > s.h * 1.25;
      wrap.classList.toggle('mg-side', side);
      const size = Math.max(150, Math.floor(Math.min(s.w - 44 - (side ? 190 : 0), s.h - 44 - (side ? 0 : 64), 560)));
      cell = Math.floor(size / n);
      board.style.width = board.style.height = (cell * n) + 'px';
      board.style.setProperty('--cell', cell + 'px');
      place();
    }
    sh.onAction((a, down) => { if (!down) return; if (cur.handle(a)) return; if (a === 'ok') tap(cur.i); else if (a === 'alt') preview(); });
    sh.onResize(layout);
    layout(); hud();
  };

  // ---------- 6) Reparaturwerk ----------
  GAMES.reparaturwerk = function (sh) {
    const v = makeCanvas(sh), ctx = v.ctx;
    let seam = 0, errs = 0, phase = 0, zone = rwZone(sh.seed, sh.d, 0), cool = 0, flash = 0, good = 0, score = 0;
    const sparks = [];
    const weldBtn = btn('mg-btn mg-btn-big', sh.stage, '<span></span>');
    weldBtn.querySelector('span').textContent = sh.t('Schweißen', 'Weld');
    function geo() {
      const btnH = 96, avail = v.h - btnH, R = Math.max(60, Math.min(v.w * 0.42, avail / 1.75, 300));
      return { cx: v.w / 2, cy: Math.max(R * 1.12, (avail - R * 1.65) / 2 + R * 1.12), R };
    }
    function pos() { return rwNeedle(phase); }
    function weld() {
      if (sh.ended || cool > 0) return;
      const p = pos();
      if (rwInZone(p, zone.center, zone.width)) {
        const perfect = Math.abs(p - zone.center) <= zone.width * 0.18;
        seam++; score += 100 + (perfect ? 50 : 0); good = 0.6; cool = 0.5; sh.sfx('good');
        const g = geo(), a = Math.PI + p * Math.PI;
        for (let i = 0; i < (sh.reduced ? 0 : 22); i++) {
          const sa = Math.random() * 6.28, spd = 60 + Math.random() * 160;
          sparks.push({ x: g.cx + Math.cos(a) * g.R, y: g.cy + Math.sin(a) * g.R, vx: Math.cos(sa) * spd, vy: Math.sin(sa) * spd - 60, t: 0 });
        }
        hud();
        if (seam >= RW.seams) { sh.end(true, score + (RW.maxErr - errs) * 40, errs === 0 ? 3 : errs === 1 ? 2 : 1); return; }
        sh.later(() => { zone = rwZone(sh.seed, sh.d, seam); }, 420);
      } else {
        errs++; flash = 0.5; cool = 0.45; sh.sfx('bad'); hud();
        if (errs >= RW.maxErr) sh.end(false, score, 0);
      }
    }
    sh.on(weldBtn, 'pointerdown', e => { e.preventDefault(); weld(); });
    sh.on(v.c, 'pointerdown', weld);
    sh.onAction((a, down) => { if (down && (a === 'ok' || a === 'down')) weld(); });
    function hud() {
      sh.status('n', sh.t('Nähte', 'Seams'), seam + ' / ' + RW.seams);
      sh.status('e', sh.t('Fehler', 'Errors'), errs + ' / ' + RW.maxErr, errs >= RW.maxErr - 1 ? 'mg-warn' : '');
    }
    hud();
    sh.loop(dt => {
      if (!sh.ended) phase += rwSpeed(sh.d, seam) * dt;
      cool = Math.max(0, cool - dt); flash = Math.max(0, flash - dt); good = Math.max(0, good - dt);
      for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 400 * dt; if (s.t > 0.7) sparks.splice(i, 1); }
      draw();
    });
    function draw() {
      const g = geo(), cx = g.cx, cy = g.cy, R = g.R;
      ctx.clearRect(0, 0, v.w, v.h);
      // Werkstattglanz
      let gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      gr.addColorStop(0, flash > 0 ? 'rgba(255,122,107,' + (0.35 * flash / 0.5) + ')' : 'rgba(63,216,232,0.12)'); gr.addColorStop(1, 'rgba(63,216,232,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, v.w, v.h);
      // Skala
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0a1430'; ctx.lineWidth = R * 0.2;
      ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 2 * Math.PI); ctx.stroke();
      ctx.strokeStyle = '#1f3473'; ctx.lineWidth = R * 0.15;
      ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 2 * Math.PI); ctx.stroke();
      // grüne Zone
      const z0 = Math.PI + (zone.center - zone.width / 2) * Math.PI, z1 = Math.PI + (zone.center + zone.width / 2) * Math.PI;
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(46,196,166,0.35)'; ctx.lineWidth = R * 0.24;
      ctx.beginPath(); ctx.arc(cx, cy, R, z0, z1); ctx.stroke();
      ctx.strokeStyle = good > 0 ? '#9ff7da' : '#2ec4a6'; ctx.lineWidth = R * 0.15;
      ctx.beginPath(); ctx.arc(cx, cy, R, z0, z1); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI + zone.center * Math.PI - zone.width * 0.18 * Math.PI, Math.PI + zone.center * Math.PI + zone.width * 0.18 * Math.PI); ctx.stroke();
      // Striche
      ctx.strokeStyle = 'rgba(242,208,138,0.55)'; ctx.lineWidth = 2;
      for (let i = 0; i <= 20; i++) {
        const a = Math.PI + i / 20 * Math.PI, l = i % 5 === 0 ? 0.2 : 0.1;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * (0.84 - l), cy + Math.sin(a) * R * (0.84 - l)); ctx.lineTo(cx + Math.cos(a) * R * 0.84, cy + Math.sin(a) * R * 0.84); ctx.stroke();
      }
      // Zeiger
      const a = Math.PI + pos() * Math.PI;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,122,107,0.35)'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R * 1.08, cy + Math.sin(a) * R * 1.08); ctx.stroke();
      ctx.strokeStyle = '#ff7a6b'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R * 1.08, cy + Math.sin(a) * R * 1.08); ctx.stroke();
      gr = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, R * 0.12);
      gr.addColorStop(0, '#fff1c9'); gr.addColorStop(1, '#c99a4a');
      ctx.fillStyle = gr; circ(ctx, cx, cy, R * 0.12);
      // Nähte (Kristallrohr)
      const py = cy + R * 0.34, pw = Math.min(v.w - 40, R * 2.1), px = cx - pw / 2, ph = Math.max(14, R * 0.12);
      gr = ctx.createLinearGradient(0, py - ph / 2, 0, py + ph / 2);
      gr.addColorStop(0, '#5ad6e6'); gr.addColorStop(1, '#2b8fa8');
      ctx.fillStyle = gr; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(px, py - ph / 2, pw, ph, ph / 2); else ctx.rect(px, py - ph / 2, pw, ph); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(px + ph / 2, py - ph * 0.32, pw - ph, Math.max(2, ph * 0.12));
      gr = ctx.createLinearGradient(0, py - ph, 0, py + ph); gr.addColorStop(0, '#fff1c9'); gr.addColorStop(1, '#c99a4a');
      ctx.fillStyle = gr;
      for (const ex of [px - ph * 0.2, px + pw - ph * 0.8]) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(ex, py - ph * 0.85, ph, ph * 1.7, ph * 0.3); else ctx.rect(ex, py - ph * 0.85, ph, ph * 1.7); ctx.fill(); }
      for (let i = 0; i < RW.seams; i++) {
        const sx = px + pw * (i + 0.5) / RW.seams, done = i < seam, act = i === seam && !sh.ended;
        if (done) { ctx.fillStyle = 'rgba(242,208,138,0.35)'; circ(ctx, sx, py, ph * 1.3); }
        ctx.fillStyle = done ? '#f2d08a' : act ? '#ff7a6b' : '#13285a';
        circ(ctx, sx, py, ph * 0.7);
        if (!done) { ctx.strokeStyle = act ? '#ffd0c8' : '#3a4f7f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - ph * 0.3, py - ph * 0.3); ctx.lineTo(sx + ph * 0.1, py); ctx.lineTo(sx - ph * 0.15, py + ph * 0.35); ctx.stroke(); }
      }
      // Funken
      sparks.forEach(s => { ctx.globalAlpha = 1 - s.t / 0.7; ctx.fillStyle = s.t < 0.2 ? '#fff6d5' : '#f2a65a'; circ(ctx, s.x, s.y, 2.6); });
      ctx.globalAlpha = 1;
    }
  };

  // ---------- 7) Portalsprung ----------
  GAMES.portalsprung = function (sh) {
    const c = psCourse(sh.seed, sh.d), v = makeCanvas(sh), ctx = v.ctx, sky = skyStars(sh.seed + 'p', 60);
    const pits = c.feats.filter(f => f.type === 'pit'), rocks = c.feats.filter(f => f.type === 'rock'), portals = c.feats.filter(f => f.type === 'portal');
    // Bodenabschnitte zwischen den Lücken
    const ground = []; let gx = -30;
    pits.forEach(p => { ground.push([gx, p.x]); gx = p.x + p.w; });
    ground.push([gx, c.length + 60]);
    const st = psState(c);
    let started = false, t = 0, roll = 0, pflash = 0, pcol = '#3fd8e8';
    function press() { if (sh.ended) return; if (!started) { started = true; sh.sfx('tap'); return; } psPress(st); }
    sh.onAction((a, down) => { if (down && (a === 'ok' || a === 'up')) press(); });
    sh.on(v.c, 'pointerdown', press);
    function hud() {
      sh.status('l', sh.t('Leben', 'Lives'), sh.hearts(st.lives, c.lives), 'mg-hearts');
      sh.status('v', sh.t('Tempo', 'Speed'), '×' + st.mult.toFixed(1).replace('.0', ''));
      sh.meter('p', sh.t('Strecke', 'Distance'), st.x / c.length);
    }
    hud();
    sh.loop(dt => {
      t += dt; pflash = Math.max(0, pflash - dt);
      if (started && !sh.ended) {
        roll += c.base * st.mult * dt / 0.45;
        const ev = psStep(st, c, dt);
        ev.forEach(e => {
          if (e === 'jump') sh.sfx('tap');
          else if (e === 'portal') { pflash = 0.5; pcol = st.mult > 1 ? '#3fd8e8' : st.mult < 1 ? '#f2d08a' : '#ffffff'; sh.sfx('tick'); }
          else if (e === 'hit') sh.sfx('bad');
        });
        if (st.over === 'lose') { hud(); sh.end(false, Math.round(st.x), 0); }
        else if (st.over === 'win') { hud(); sh.end(true, 200 + st.lives * 100 + Math.round(c.length), st.lives >= c.lives ? 3 : 2); }
        hud();
      }
      draw();
    });
    function draw() {
      const ppm = Math.max(14, Math.min(v.h / 8, v.w / 13, 72)), gy = Math.min(v.h * 0.7, v.h / 2 + ppm * 3), rx = v.w * 0.2;
      const x = st.x, sx = wx => rx + (wx - x) * ppm, syy = wy => gy - wy * ppm;
      drawSky(v, sky, t, sh.reduced, x * ppm * 0.4);
      // ferne Inseln
      for (let i = 0; i < 5; i++) {
        const px = ((i * 0.27 * v.w - x * ppm * 0.15) % (v.w * 1.35) + v.w * 1.35) % (v.w * 1.35) - v.w * 0.2, py = gy - ppm * (2.5 + (i % 3) * 1.3);
        ctx.fillStyle = 'rgba(93,76,134,0.2)'; ctx.beginPath(); ctx.moveTo(px - ppm * 1.2, py); ctx.lineTo(px, py + ppm * 0.9); ctx.lineTo(px + ppm * 1.2, py); ctx.fill();
        ctx.fillStyle = 'rgba(46,196,166,0.12)'; ctx.beginPath(); ctx.ellipse(px, py, ppm * 1.3, ppm * 0.26, 0, 0, Math.PI * 2); ctx.fill();
      }
      // Boden
      const gh = ppm * 0.45;
      for (const s of ground) {
        const a = sx(s[0]), b = sx(s[1]);
        if (b < -10 || a > v.w + 10) continue;
        const l = Math.max(a, -20), r = Math.min(b, v.w + 20);
        const ug = ctx.createLinearGradient(0, gy, 0, gy + gh * 3.4); ug.addColorStop(0, '#54468a'); ug.addColorStop(1, '#2c2456');
        ctx.fillStyle = ug;
        ctx.beginPath(); ctx.moveTo(l, gy); ctx.lineTo(r, gy);
        if (b <= v.w + 20) { ctx.quadraticCurveTo(b, gy + gh * 3, b - ppm * 0.6, gy + gh * 3.4); } else ctx.lineTo(r, gy + gh * 3.4);
        ctx.lineTo(Math.max(l, a + ppm * 0.6), gy + gh * 3.4);
        if (a >= -20) ctx.quadraticCurveTo(a, gy + gh * 3, a, gy); else ctx.lineTo(l, gy);
        ctx.fill();
        const gr = ctx.createLinearGradient(0, gy - 4, 0, gy + gh);
        gr.addColorStop(0, '#54d3a2'); gr.addColorStop(1, '#238a66');
        ctx.fillStyle = gr;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(a, gy - 4, b - a, gh + 4, Math.min(gh, 12)); else ctx.rect(a, gy - 4, b - a, gh + 4); ctx.fill();
      }
      // Portale
      for (const p of portals) {
        const px = sx(p.x); if (px < -60 || px > v.w + 60) continue;
        const col = p.mult > 1 ? '63,216,232' : p.mult < 1 ? '242,208,138' : '220,230,255';
        ctx.fillStyle = 'rgba(' + col + ',0.16)'; ctx.beginPath(); ctx.ellipse(px, syy(1.4), ppm * 0.55, ppm * 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = Math.max(3, ppm * 0.16); ctx.strokeStyle = 'rgba(' + col + ',' + (x >= p.x ? 0.35 : 0.95) + ')'; ctx.stroke();
        ctx.fillStyle = 'rgba(' + col + ',1)'; ctx.font = '700 ' + Math.round(ppm * 0.6) + 'px Fredoka, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.mult > 1 ? '»' : p.mult < 1 ? '«' : '=', px, syy(3.3));
      }
      // Kristallspitzen
      for (const r of rocks) {
        const a = sx(r.x), b = sx(r.x + r.w); if (b < -10 || a > v.w + 10) continue;
        const m = (a + b) / 2, hh = r.h * ppm;
        ctx.fillStyle = '#ff7a6b';
        ctx.beginPath(); ctx.moveTo(a, gy); ctx.lineTo(m - (b - a) * 0.1, gy - hh); ctx.lineTo(m + (b - a) * 0.12, gy - hh * 0.9); ctx.lineTo(b, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffb3a8';
        ctx.beginPath(); ctx.moveTo(m - (b - a) * 0.1, gy - hh); ctx.lineTo(m + (b - a) * 0.02, gy); ctx.lineTo(a + (b - a) * 0.2, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e0584b';
        ctx.beginPath(); ctx.moveTo(b - (b - a) * 0.05, gy); ctx.lineTo(b + (b - a) * 0.15, gy - hh * 0.5); ctx.lineTo(b - (b - a) * 0.3, gy); ctx.closePath(); ctx.fill();
      }
      // Ziel
      const fx = sx(c.length);
      if (fx < v.w + 80) {
        ctx.strokeStyle = '#f2d08a'; ctx.lineWidth = Math.max(4, ppm * 0.2);
        ctx.beginPath(); ctx.moveTo(fx - ppm, gy); ctx.lineTo(fx - ppm, syy(3)); ctx.arc(fx, syy(3), ppm, Math.PI, 0); ctx.lineTo(fx + ppm, gy); ctx.stroke();
        ctx.fillStyle = 'rgba(242,208,138,0.15)'; ctx.fill();
      }
      // Läufer (Kivi rollt)
      const blink = st.inv > 0 && Math.floor(st.inv * 10) % 2 === 0;
      drawKivi(ctx, rx, syy(st.y + PS.h / 2), PS.h * 0.62 * ppm, t, { spin: sh.reduced ? 0 : roll, alpha: blink ? 0.35 : 1 });
      if (pflash > 0) { ctx.fillStyle = pcol; ctx.globalAlpha = pflash * 0.25; ctx.fillRect(0, 0, v.w, v.h); ctx.globalAlpha = 1; }
      if (!started && !sh.ended) {
        ctx.fillStyle = 'rgba(13,27,61,0.72)';
        const tw = Math.min(v.w - 32, 340), th = 54, tx = (v.w - tw) / 2, ty = Math.min(v.h - th - 12, gy + ppm * 1.8);
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(tx, ty, tw, th, 27); else ctx.rect(tx, ty, tw, th); ctx.fill();
        ctx.fillStyle = '#f2d08a'; ctx.font = '600 17px Fredoka, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(sh.t('Tippen zum Starten', 'Tap to start'), v.w / 2, ty + th / 2);
      }
    }
  };

  // ---------- 8) Schatzkarte ----------
  const CHEST = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="17" width="28" height="16" rx="3" fill="#b9773d"/><path d="M6 19a14 9 0 0 1 28 0z" fill="#d48f4a"/><rect x="6" y="18" width="28" height="3" fill="#f2d08a"/><rect x="17.5" y="18" width="5" height="8" rx="1.5" fill="#f2d08a"/><circle cx="20" cy="23" r="1.3" fill="#7a4a20"/><circle cx="12" cy="10" r="1.6" fill="#fff3c4"/><circle cx="29" cy="8" r="1.2" fill="#fff3c4"/></svg>';
  GAMES.schatzkarte = function (sh) {
    const cfg = tkConfig(sh.d), n = cfg.size, tre = tkPlace(sh.seed, n, cfg.treasures), found = {}, dug = [];
    let left = cfg.digs;
    const wrap = el('div', 'mg-center', sh.stage);
    const board = el('div', 'mg-board mg-tk-board', wrap);
    const legend = el('div', 'mg-legend', wrap);
    legend.textContent = sh.t('Zahl = Felder (waagerecht + senkrecht) bis zum nächsten Schatz', 'Number = steps (across + down) to the nearest treasure');
    const tint = rngOf('karte:' + sh.seed);
    const cells = [];
    for (let i = 0; i < n * n; i++) {
      const c = btn('mg-cell mg-tk-cell', board);
      c.style.setProperty('--tk', (tint.next() * 0.12).toFixed(3));
      if (tint.chance(0.14)) el('i', 'mg-tk-deco', c);
      sh.on(c, 'click', () => { cur.i = i; focus(); dig(i); });
      cells.push(c);
    }
    const cur = gridCursor(sh, () => n, n * n, Math.floor(n / 2) * n + Math.floor(n / 2), () => focus());
    function focus() { cells.forEach((c, i) => c.classList.toggle('mg-focus', i === cur.i)); }
    function hint(i) {
      const rest = tre.filter(k => !found[k]).map(k => [k % n, Math.floor(k / n)]);
      return rest.length ? tkHint(i % n, Math.floor(i / n), rest) : 0;
    }
    function paint() {
      dug.forEach(i => {
        const c = cells[i];
        if (found[i]) { if (!c._chest) { c._chest = true; c.className = 'mg-cell mg-tk-cell mg-tk-dug mg-tk-found'; c.innerHTML = CHEST; } return; }
        const h = hint(i);
        c.className = 'mg-cell mg-tk-cell mg-tk-dug mg-tk-' + tkLevel(h);
        if (!c._num) c._num = el('span', 'mg-tk-num', c);
        c._num.textContent = h;
      });
      focus();
      sh.status('d', sh.t('Grabungen', 'Digs'), sh.t(left + ' übrig', left + ' left'), left <= 2 ? 'mg-warn' : '');
      sh.status('s', sh.t('Schätze', 'Treasures'), Object.keys(found).length + ' / ' + tre.length);
    }
    function dig(i) {
      if (sh.ended) return;
      if (dug.indexOf(i) >= 0) { sh.sfx('tick'); return; }
      left--; dug.push(i);
      const hitT = tre.indexOf(i) >= 0;
      if (hitT) found[i] = true;
      sh.sfx(hitT ? 'good' : 'tap');
      paint();
      if (Object.keys(found).length === tre.length) {
        sh.end(true, 100 * tre.length + left * 25, left >= Math.ceil(cfg.digs * 0.4) ? 3 : left >= Math.ceil(cfg.digs * 0.15) ? 2 : 1);
      } else if (left <= 0) {
        tre.forEach(k => { if (!found[k]) { cells[k].className = 'mg-cell mg-tk-cell mg-tk-reveal'; cells[k].innerHTML = CHEST; } });
        sh.end(false, Object.keys(found).length * 50, 0);
      }
    }
    function layout() {
      const s = sh.size(), gap = 4, pad = 10, side = s.w > s.h * 1.25;
      wrap.classList.toggle('mg-side', side);
      const cell = Math.max(30, Math.floor((Math.min(s.w - 12 - (side ? 200 : 0), s.h - 12 - (side ? 0 : 44)) - pad * 2 - gap * (n - 1)) / n));
      board.style.gridTemplateColumns = 'repeat(' + n + ',' + cell + 'px)';
      board.style.gridAutoRows = cell + 'px';
      board.style.setProperty('--cell', cell + 'px');
      legend.style.maxWidth = side ? '190px' : (cell * n + pad * 2) + 'px';
    }
    sh.onAction((a, down) => { if (!down) return; if (cur.handle(a)) return; if (a === 'ok') dig(cur.i); });
    sh.onResize(layout);
    layout(); paint();
  };

  // ======================================================================
  // Öffentliche Schnittstelle
  // ======================================================================
  function start(id, host, opts) {
    if (!GAMES[id]) throw new Error('Unbekanntes Minispiel: ' + id);
    if (!host || typeof host.appendChild !== 'function') throw new Error('Minigames.start: host fehlt');
    const sh = createShell(id, host, opts);
    try { GAMES[id](sh); }
    catch (e) {
      console.error(e);
      el('div', 'mg-msg', sh.stage).textContent = sh.t('Das Minispiel konnte nicht starten.', 'The mini-game could not start.');
      sh.later(() => sh.abort(), 1500);
    }
    return { stop: sh.stop };
  }

  SW.Minigames = {
    start,
    ids: SW.MINIGAMES.map(m => m.id),
    _logic: {
      rotMask, bitCount,
      lichtpfad: { size: lpSize, mix: lpMix, generate: lpGenerate, lit: lpLit, solved: lpSolved, turns: lpTurns, limit: lpLimit, shape: lpShape },
      kristallsuche: { config: ksConfig },
      wolkengleiter: { course: wgCourse, hit: circleHit, params: WG },
      runenmemory: { config: memConfig, deal: memDeal, runes: RUNES.length },
      funkelpuzzle: { config: fpConfig, shuffle: fpShuffle, solved: fpSolved, solvable: fpSolvable, slide: fpSlide },
      reparaturwerk: { inZone: rwInZone, needle: rwNeedle, zone: rwZone, speed: rwSpeed, params: RW },
      portalsprung: { course: psCourse, state: psState, press: psPress, step: psStep, rectHit, overPit: psOverPit, params: PS, airtime: psAir },
      schatzkarte: { config: tkConfig, place: tkPlace, hint: tkHint, level: tkLevel }
    }
  };
})(globalThis.SW = globalThis.SW || {});
