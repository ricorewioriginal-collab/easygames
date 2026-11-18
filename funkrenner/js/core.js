/* Funkrenner – Spielkern (ohne Grafik, deterministisch, testbar mit Node).
   Der Läufer bleibt bei z = 0, Hindernisse und Münzen kommen von z = -SPAWN auf ihn zu.
   Drei Spuren, springen, rutschen, 3 Leben, Münzen, Power-ups, 3 Welten mit je 5 echten Leveln + Endlos. */
(function (root) {
  'use strict';
  const LANES = [-2.4, 0, 2.4];
  const JUMP_V = 12.5, GRAV = 34, SLIDE_T = 0.75, SPAWN = 112, MAX_LIVES = 3;
  const rng = s => { s = s >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  /* ---------- Welten und Level ---------- */
  const WORLDS = [
    { id: 'jungle', name: 'Dschungel', icon: '🌴', desc: 'Lianen, Ruinen und rollende Felsen.', col: '#3fbf4a',
      levels: ['Dschungeleingang', 'Lianenpfad', 'Tempelruinen', 'Wasserfall-Schlucht', 'Herz des Urwalds'] },
    { id: 'studio', name: 'Radiostudio', icon: '🎙️', desc: 'Boxentürme, Lichttraversen und Mischpulte.', col: '#19f0ff',
      levels: ['Empfang', 'Sendesaal', 'Regie & Mischpult', 'Technikkeller', 'Live auf Sendung'] },
    { id: 'fantasy', name: 'Fantasy-Welt', icon: '🏰', desc: 'Himmelsbrücken, Burgen und Kristalle.', col: '#b06cff',
      levels: ['Märchenwiese', 'Burgstraße', 'Himmelsbrücke', 'Drachenhorst', 'Schloss der Sterne'] }
  ];
  // Tageszeit je Level (0 Tag, 1 Abend, 2 Nacht) – gilt für die Optik
  const VARIANT = [0, 0, 1, 1, 2];

  function levelDef(world, i) {
    const wi = Math.max(0, WORLDS.findIndex(w => w.id === world)), k = Math.max(0, Math.min(4, i));
    const kinds = ['block', 'low'];
    if (k >= 1) kinds.push('high');
    if (k >= 3) kinds.push('long');
    const v0 = 12.5 + k * 1.2 + wi * 0.6;
    return {
      world, index: k, name: WORLDS[wi].levels[k], len: 520 + k * 150, v0, v1: v0 + 3.2 + k * 0.4,
      gap0: 1.65 - k * 0.1, gap1: 1.2 - k * 0.07, fill: 0.45 + k * 0.08, pWall: k >= 1 ? 0.12 + k * 0.03 : 0,
      pRoller: k >= 2 ? 0.1 + (k - 2) * 0.05 : 0, kinds, coin: 0.7, pPower: 0.12, variant: VARIANT[k], seed: 1000 + wi * 97 + k * 13
    };
  }
  function endlessDef(world, seed) {
    const wi = Math.max(0, WORLDS.findIndex(w => w.id === world)), d = levelDef(world, 4);
    return Object.assign(d, { name: 'Endlos', endless: true, len: 1e9, v0: 13 + wi * 0.4, v1: 24, gap0: 1.6, gap1: 1.0, fill: 0.5, variant: 0, seed: seed || (Date.now() & 0xffff) });
  }

  /* ---------- Spiel anlegen ---------- */
  function create(opt) {
    const L = opt.level, r = rng(L.seed + (opt.runSeed || 0)), hero = opt.hero || {}, up = opt.up || {};
    const G = {
      L, r, endless: !!L.endless, t: 0, dist: 0, speed: L.v0, lane: 1, x: 0, y: 0, vy: 0, slideT: 0, wantSlide: false,
      lives: MAX_LIVES + (hero.life || 0), maxLives: MAX_LIVES + (hero.life || 0), inv: 0, score: 0, coins: 0, coinsSpawned: 0, damage: 0,
      magnet: 0, shield: (up.shield || 0) > 0 || hero.shield ? 1 : 0, dbl: 0, turbo: 0, rowIn: 1.4, obs: [], pick: [], ev: [], over: false, won: false,
      hero, up, jumpV: JUMP_V * (hero.jump || 1), slideT0: SLIDE_T * (hero.slide || 1), coinMul: hero.coin || 1,
      magDur: 8 * (1 + (up.magnet || 0) * 0.25) * (hero.power || 1), dblDur: 10 * (1 + (up.dbl || 0) * 0.25) * (hero.power || 1), turboDur: 5 * (1 + (up.turbo || 0) * 0.2) * (hero.power || 1),
      magR: 4.2 * (hero.magnet || 1), nid: 1, finishShown: false, hitsRow: 0, stat: { jumps: 0, slides: 0, near: 0 }
    };
    return G;
  }

  /* ---------- Spawnen ---------- */
  const OBS = {
    low: { hw: 1.0, hd: 0.5, y0: 0, y1: 0.95 }, high: { hw: 1.05, hd: 0.3, y0: 1.2, y1: 2.6 },
    block: { hw: 0.95, hd: 0.6, y0: 0, y1: 2.6 }, long: { hw: 0.95, hd: 4.5, y0: 0, y1: 2.6 }, roller: { hw: 0.7, hd: 0.7, y0: 0, y1: 1.3 }
  };
  function addObs(G, kind, lane, z, extra) {
    const d = OBS[kind], o = Object.assign({ id: G.nid++, kind, lane, x: LANES[lane], z, hw: d.hw, hd: d.hd, y0: d.y0, y1: d.y1, seed: (G.r() * 1e6) | 0 }, extra || {});
    G.obs.push(o); return o;
  }
  function addCoin(G, x, y, z) { G.pick.push({ id: G.nid++, type: 'coin', x, y, z, r: 0.55 }); G.coinsSpawned++; }
  function coinLine(G, lane, z, n, step) { for (let i = 0; i < n; i++) addCoin(G, LANES[lane], 0.9, z + i * (step || 2.2)); }
  function coinArc(G, lane, z, n) { for (let i = 0; i < n; i++) { const u = i / (n - 1); addCoin(G, LANES[lane], 0.9 + Math.sin(u * Math.PI) * 1.6, z + (i - (n - 1) / 2) * 1.6); } }

  const progress = G => G.endless ? Math.min(1, G.dist / 2400) : Math.min(1, G.dist / G.L.len);
  const gapNow = G => { const p = progress(G); return G.L.gap0 + (G.L.gap1 - G.L.gap0) * p; };

  function spawnRow(G) {
    const L = G.L, r = G.r, p = progress(G), z = -SPAWN, free = (r() * 3) | 0, fill = Math.min(0.9, L.fill + p * 0.12);
    const kinds = L.kinds.filter(k => k !== 'long' && k !== 'roller');
    const pick = () => kinds[(r() * kinds.length) | 0];
    let arcLane = -1;
    if (L.pWall && r() < L.pWall + p * 0.05) {                       // Sprung-/Rutsch-Wand über alle Spuren
      const t = kinds.includes('high') && r() < 0.5 ? 'high' : 'low', skip = p > 0.5 && r() < 0.35 ? free : -1;
      for (let i = 0; i < 3; i++) if (i !== skip) addObs(G, t, i, z);
      if (t === 'low') arcLane = r() < 0.6 ? 1 : (r() * 3) | 0;
    } else if (L.kinds.includes('long') && r() < 0.14) {              // lange Mauer / langer Zug in einer Spur
      const lane = (r() * 3) | 0; addObs(G, 'long', lane, z - 3);
      if (lane !== free && r() < 0.6) addObs(G, pick(), free === 0 ? 1 : free === 1 ? 0 : 1, z);
    } else {
      for (let i = 0; i < 3; i++) { if (i === free) continue; if (r() < fill) addObs(G, pick(), i, z); }
      if (p > 0.3 && r() < 0.25) addObs(G, r() < 0.5 ? 'low' : 'high', free, z);   // auch die freie Spur verlangt Sprung/Rutsch
    }
    if (L.pRoller && r() < L.pRoller + p * 0.05) addObs(G, 'roller', (r() * 3) | 0, z + 6, { vx: (r() < 0.5 ? -1 : 1) * (2.4 + p * 1.6), x: LANES[(r() * 3) | 0], roll: true });
    // Münzen im Raum vor dem neuen Hindernis
    if (r() < L.coin) {
      const gapLen = Math.max(14, G.speed * gapNow(G)) - 10, n = Math.max(3, Math.min(8, (gapLen / 2.2) | 0));
      if (arcLane >= 0 && r() < 0.6) coinArc(G, arcLane, z + 4, 7); else coinLine(G, free, z + 7, n);
    }
    if (r() < L.pPower) {                                                   // Power-up in der Mitte der Lücke
      const t = r(); let type = t < 0.3 ? 'magnet' : t < 0.55 ? 'shield' : t < 0.78 ? 'dbl' : t < 0.9 ? 'turbo' : 'heart';
      if (type === 'heart' && G.lives >= G.maxLives) type = 'dbl';
      if (!(type === 'shield' && G.shield)) G.pick.push({ id: G.nid++, type, x: LANES[free], y: 1.1, z: z + Math.max(12, G.speed * gapNow(G) * 0.5), r: 0.8 });
    }
  }

  /* ---------- Eingabe ---------- */
  function moveLane(G, d) { if (G.over) return false; const n = Math.max(0, Math.min(2, G.lane + d)); if (n === G.lane) return false; G.lane = n; G.ev.push({ t: 'lane', d }); return true; }
  function jump(G) { if (G.over || G.turbo > 0) return false; if (G.y === 0 && G.vy === 0) { G.vy = G.jumpV; G.slideT = 0; G.wantSlide = false; G.stat.jumps++; G.ev.push({ t: 'jump' }); return true; } return false; }
  function slide(G) { if (G.over || G.turbo > 0) return false; if (G.y > 0) { G.vy = -26; G.wantSlide = true; return true; } if (G.slideT <= 0) G.ev.push({ t: 'slide' }); G.slideT = G.slideT0; G.stat.slides++; return true; }

  /* ---------- Schritt ---------- */
  function step(G, dt) {
    if (G.over) return;
    G.t += dt;
    const p = progress(G), tgt = G.L.v0 + (G.L.v1 - G.L.v0) * p;
    G.speed += (tgt * (G.turbo > 0 ? 1.35 : 1) - G.speed) * Math.min(1, dt * 2);
    const mv = G.speed * dt; G.dist += mv;
    G.score += mv * 0.5 * (G.dbl > 0 ? 2 : 1) * (1 + p * 0.5);
    if (G.inv > 0) G.inv -= dt;
    if (G.magnet > 0) G.magnet -= dt; if (G.dbl > 0) G.dbl -= dt;
    if (G.turbo > 0) { G.turbo -= dt; if (G.turbo <= 0) { G.inv = Math.max(G.inv, 1.2); G.ev.push({ t: 'turboEnd' }); } }
    // Springen / Rutschen
    if (G.slideT > 0) G.slideT -= dt;
    if (G.turbo > 0) { G.y += (3.6 - G.y) * Math.min(1, dt * 6); G.vy = 0; }
    else if (G.y > 0 || G.vy > 0) {
      G.vy -= GRAV * dt; G.y += G.vy * dt;
      if (G.y <= 0) { G.y = 0; G.vy = 0; G.ev.push({ t: 'land' }); if (G.wantSlide) { G.slideT = G.slideT0; G.wantSlide = false; } }
    }
    G.x += (LANES[G.lane] - G.x) * Math.min(1, dt * 14);
    // Zeilen erzeugen
    const finishAt = G.endless ? Infinity : G.L.len - G.dist;
    if ((G.rowIn -= dt) <= 0 && finishAt > SPAWN + 30) { spawnRow(G); G.rowIn = gapNow(G) + G.r() * 0.2; }
    // Bewegen und prüfen
    const h = G.slideT > 0 ? 0.8 : 1.8;
    let hit = null;
    for (let i = G.obs.length - 1; i >= 0; i--) {
      const o = G.obs[i], prev = o.z; o.z += mv;
      if (o.roll) { o.x += o.vx * dt; if (o.x > 2.6) { o.x = 2.6; o.vx = -Math.abs(o.vx); } if (o.x < -2.6) { o.x = -2.6; o.vx = Math.abs(o.vx); } }
      if (o.z - o.hd > 14) { G.obs.splice(i, 1); continue; }
      if (G.turbo > 0 || G.inv > 0) continue;
      if (o.z + o.hd >= -0.35 && prev - o.hd <= 0.35 && Math.abs(G.x - o.x) < o.hw + 0.18 && G.y < o.y1 - 0.05 && G.y + h > o.y0 + 0.05) hit = hit || o;
    }
    for (let i = G.pick.length - 1; i >= 0; i--) {
      const c = G.pick[i]; c.z += mv;
      if (c.z > 12) { G.pick.splice(i, 1); continue; }
      if (c.type === 'coin' && (G.magnet > 0 || G.turbo > 0) && c.z > -G.magR * 2.6 && c.z < 3 && Math.abs(c.x - G.x) < (G.turbo > 0 ? 6 : G.magR)) {
        const dx = G.x - c.x, dz = -c.z, dy = (G.y + 0.9) - c.y, d = Math.hypot(dx, dz, dy) || 1, s = Math.min(1, dt * 14);
        c.x += dx * s; c.z += dz * s * 0.6; c.y += dy * s;
      }
      if (Math.abs(c.z) < 0.9 && Math.abs(c.x - G.x) < 1.1 && c.y > G.y - 0.6 && c.y < G.y + h + 0.5) {
        G.pick.splice(i, 1);
        if (c.type === 'coin') { const v = G.dbl > 0 ? 2 : 1; G.coins += v; G.score += 10 * v * G.coinMul; G.ev.push({ t: 'coin', x: c.x, y: c.y }); }
        else if (c.type === 'magnet') { G.magnet = G.magDur; G.ev.push({ t: 'power', k: 'magnet' }); }
        else if (c.type === 'shield') { G.shield = 1; G.ev.push({ t: 'power', k: 'shield' }); }
        else if (c.type === 'dbl') { G.dbl = G.dblDur; G.ev.push({ t: 'power', k: 'dbl' }); }
        else if (c.type === 'turbo') { G.turbo = G.turboDur; G.inv = 0; G.ev.push({ t: 'power', k: 'turbo' }); }
        else if (c.type === 'heart') { G.lives = Math.min(G.maxLives, G.lives + 1); G.ev.push({ t: 'power', k: 'heart' }); }
      }
    }
    if (hit) {
      G.damage++;
      if (G.shield) { G.shield = 0; G.inv = 1.2; G.ev.push({ t: 'shieldBreak' }); }
      else { G.lives--; G.inv = 1.8; G.ev.push({ t: 'hit', k: hit.kind }); }
      for (let i = G.obs.length - 1; i >= 0; i--) if (Math.abs(G.obs[i].z - hit.z) < 3 + G.obs[i].hd) G.obs.splice(i, 1);
      if (G.lives <= 0) { G.over = true; G.ev.push({ t: 'dead' }); }
    }
    if (!G.endless && G.dist >= G.L.len && !G.over) { G.over = true; G.won = true; G.ev.push({ t: 'win' }); }
    G.finishRel = G.endless ? null : G.L.len - G.dist;
  }

  /* ---------- Ergebnis ---------- */
  function result(G) {
    const frac = G.coinsSpawned ? G.coins / G.coinsSpawned : 1;
    const stars = G.won ? 1 + (frac >= 0.65 ? 1 : 0) + (G.damage === 0 ? 1 : 0) : 0;
    return { won: G.won, score: Math.floor(G.score), coins: G.coins, frac, stars, damage: G.damage, dist: Math.floor(G.dist), starFlags: [G.won, frac >= 0.65, G.won && G.damage === 0] };
  }

  /* ---------- Bot für Tests ---------- */
  function bot(G) {
    const near = (lane, a, b) => G.obs.filter(o => Math.abs(o.x - LANES[lane]) < 1.2 && o.z + o.hd > -b && o.z - o.hd < -a);
    const blocked = lane => near(lane, -2, 15).some(o => o.kind === 'block' || o.kind === 'long' || o.roll);
    if (blocked(G.lane)) {
      const order = G.lane === 1 ? [0, 2] : G.lane === 0 ? [1, 2] : [1, 0];
      const to = order.find(l => !blocked(l) && (Math.abs(l - G.lane) < 2 || !blocked(1)));
      if (to != null) moveLane(G, Math.sign(to - G.lane));
    }
    const ahead = G.obs.filter(o => Math.abs(o.x - G.x) < 1.2 && o.z > -(G.speed * 0.4) && o.z < -1.8 && (o.kind === 'low' || o.kind === 'high'));
    if (ahead.length) { const o = ahead[0]; if (o.kind === 'low') jump(G); else slide(G); }
  }

  const FR = { LANES, JUMP_V, GRAV, SLIDE_T, SPAWN, MAX_LIVES, WORLDS, VARIANT, OBS, rng, levelDef, endlessDef, create, step, moveLane, jump, slide, result, bot, progress };
  if (typeof module !== 'undefined' && module.exports) module.exports = FR; else root.FR = FR;
})(typeof window !== 'undefined' ? window : globalThis);
