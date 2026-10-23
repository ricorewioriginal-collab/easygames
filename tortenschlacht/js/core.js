/* Tortenschlacht – Spiellogik ohne DOM (Browser und Node).
 * Welt: y = 0 oben bis 1 unten (Bildschirmhöhe), x = 0 … WW. Drei Ebenen (hinten, Mitte, vorn) mit eigener Größe und Bodenlinie.
 * Alle Figuren sind frei erfunden. Getroffen wird mit Torte (Bogenwurf, kurze Flugzeit), Sahnespritze (Dauerfeuer, kleine Treffer) oder Kirschbombe. */
(function (root) {
  'use strict';
  const LAYERS = [{ s: .36, g: .6, par: .45 }, { s: .62, g: .76, par: .72 }, { s: 1, g: .985, par: 1 }];
  const HMAN = .3; // Figurenhöhe vorn (Anteil Bildschirmhöhe)
  // Figuren: Punkte, Trefferpunkte (Torte = 3, Spritze = 1), Ebenen, Tempo
  const TYPES = {
    prak: { n: 'Praktikantin', pts: 15, hp: 3, layers: [0, 1, 2], speed: .3 },
    mod: { n: 'Moderator', pts: 10, hp: 3, layers: [1, 2], speed: .09 },
    dj: { n: 'DJ', pts: 20, hp: 3, layers: [1], speed: 0, pop: true },
    tech: { n: 'Techniker', pts: 30, hp: 2, layers: [0], speed: .05 },
    chef: { n: 'Chef', pts: 50, hp: 4, layers: [1, 2], speed: .14 },
    kond: { n: 'Konditor', pts: 25, hp: 3, layers: [2], speed: .16 },
    fan: { n: 'Goldener Fan', pts: 40, hp: 3, layers: [1, 2], speed: .26 },
    board: { n: 'Aufsteller', pts: 15, hp: 1, layers: [2], speed: 0, pop: true }
  };
  const WEAPONS = { torte: { mag: 5, dmg: 3, r: .028, fly: .26, cd: .22 }, spritze: { mag: 30, dmg: 1, r: .013, fly: .05, cd: .085 }, bombe: { dmg: 3, r: .17, fly: .3 } };
  const RELOAD = .85, BLIND = 2.4, TIME = 90;

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- Spielstand ---------- */
  function newGame(o) {
    o = o || {};
    const g = { WW: o.WW || 3.2, A: o.A || 1.78, solo: !!o.solo, t: o.time || TIME, el: 0, people: [], shots: [], pies: [], splats: [], events: [], players: [], camX: 0, nextId: 1, spawnT: .6,
      rng: mulberry(o.seed || (Date.now() & 0xffffff)), over: false, stations: null, sign: null };
    const W = g.WW;
    // feste Plätze in der Kulisse: Mikrofone, DJ-Pulte, Funktürme, Schild
    g.stations = { mic: [], dj: [], tower: [] };
    for (let x = .45; x < W - .2; x += 1.15) g.stations.mic.push({ x: x + .1, layer: 1 + ((x * 7 | 0) % 2) });
    for (let x = .9; x < W - .3; x += 1.5) g.stations.dj.push({ x, busy: false });
    for (let x = .7; x < W; x += 1.9) g.stations.tower.push({ x });
    g.sign = { x: Math.min(W - .4, 1.25), y: LAYERS[1].g - .2, w: .26, h: .1, hit: false };
    for (const p of o.players || [{ name: 'Du' }]) addPlayer(g, p);
    return g;
  }
  function addPlayer(g, p) {
    const pl = Object.assign({ id: g.players.length, name: 'Spieler', col: '#FF4FAE', score: 0, combo: 0, best: 0, hits: 0, shots: 0, heads: 0, weapon: 'torte',
      ammo: { torte: WEAPONS.torte.mag, spritze: WEAPONS.spritze.mag }, reload: 0, bombs: 0, stun: 0, cd: 0, x: g.A / 2, y: .5, fire: false }, p);
    g.players.push(pl); return pl;
  }

  /* ---------- Figuren ---------- */
  const scaleOf = p => LAYERS[p.layer].s;
  function spawn(g, type, at) {
    const T = TYPES[type], r = g.rng, layer = T.layers[(r() * T.layers.length) | 0], L = LAYERS[layer];
    const p = { id: g.nextId++, type, layer, x: 0, g: L.g, dir: r() < .5 ? -1 : 1, v: T.speed * (.8 + r() * .5), hp: T.hp, state: 'walk', t: 0, life: 6 + r() * 4, up: 0, hitT: 0, splats: [], skin: (r() * 5) | 0, look: (r() * 4) | 0, by: -1, logo: 1 + ((r() * 13) | 0) };
    const near = at != null ? at : (g.solo && r() < .65 ? g.camX + r() * g.A : r() * g.WW);
    if (type === 'dj') { const free = g.stations.dj.filter(s => !s.busy); if (!free.length) return null; const s = free[(r() * free.length) | 0]; s.busy = true; p.st = s; p.x = s.x; p.state = 'pop'; p.life = 1.6 + r() * 1.6; }
    else if (type === 'tech') { const s = g.stations.tower[(r() * g.stations.tower.length) | 0]; p.x = s.x; p.climb = 0; p.state = 'climb'; p.life = 7; }
    else if (type === 'mod') { const ms = g.stations.mic.filter(s => s.layer === layer); const s = ms.length ? ms[(r() * ms.length) | 0] : { x: near }; p.x = s.x - p.dir * (.25 + r() * .3); p.target = s.x; p.life = 5 + r() * 3; }
    else if (type === 'board') { p.x = Math.max(.1, Math.min(g.WW - .1, near)); p.state = 'pop'; p.life = 1.5 + r() * .5; }
    else if (type === 'kond') { p.x = Math.max(.2, Math.min(g.WW - .2, near)); p.dir = p.x < g.WW / 2 ? 1 : -1; p.x -= p.dir * .35; p.state = 'walk'; p.aimT = 0; p.life = 9; }
    else p.x = Math.max(.05, Math.min(g.WW - .05, near)) - p.dir * .3;
    g.people.push(p); return p;
  }
  // Rumpf und Kopf in Weltkoordinaten (für Treffer und Zeichnung)
  function body(p) {
    const s = scaleOf(p) * HMAN; let gy = p.g;
    if (p.type === 'dj') gy = p.g + (1 - p.up) * s * .62;
    if (p.type === 'board') gy = p.g + (1 - p.up) * s * 1.02;
    if (p.type === 'tech') gy = p.g - p.climb * .28;
    return { s, gy, hx: p.x, hy: gy - s * .86, hr: s * .12, bx: p.x - s * .16, bw: s * .32, by0: gy - s * .74, by1: gy - s * .04, clip: p.type === 'dj' ? p.g - s * .32 : p.type === 'board' ? p.g - s * .08 : 9 };
  }
  // 0 = vorbei, 1 = Körper, 2 = Kopf
  function hitTest(p, x, y, r) {
    if (p.state === 'flee' || p.state === 'gone' || (p.type === 'dj' || p.type === 'board') && p.up < .25) return 0;
    const b = body(p);
    if (p.type === 'board') { const w = b.s * .5; return x > p.x - w - r && x < p.x + w + r && y > b.gy - b.s * 1.0 - r && y < Math.min(b.gy, b.clip) + r ? 1 : 0; }
    if (Math.hypot(x - b.hx, y - b.hy) < b.hr * 1.15 + r && y < b.clip + r) return 2;
    if (x > b.bx - r && x < b.bx + b.bw + r && y > b.by0 - r && y < Math.min(b.by1, b.clip) + r) return 1;
    return 0;
  }

  /* ---------- Spieler: schießen, nachladen, Waffe ---------- */
  function fire(g, pl) {
    if (g.over || pl.stun > 0 || pl.cd > 0 || pl.reload > 0) return false;
    if (pl.bombs > 0 && pl.weapon === 'bombe') { pl.bombs--; if (!pl.bombs) pl.weapon = 'torte'; launch(g, pl, 'bombe'); pl.cd = .35; return true; }
    const w = pl.weapon === 'spritze' ? 'spritze' : 'torte';
    if (pl.ammo[w] <= 0) { reload(g, pl); g.events.push({ k: 'empty', pl: pl.id }); return false; }
    pl.ammo[w]--; pl.cd = WEAPONS[w].cd; launch(g, pl, w);
    if (pl.ammo[w] <= 0) reload(g, pl);
    return true;
  }
  function launch(g, pl, w) {
    // Torte im Anflug: sofort abgewehrt (sie ist schon ganz nah am Bildschirm)
    for (const pie of g.pies) if (!pie.dead && Math.hypot(pie.x - pl.x, pie.y - pl.y) < pie.r + WEAPONS[w].r + .03) { pie.dead = true; pl.shots++; pl.score += 10; g.events.push({ k: 'parry', pl: pl.id, x: pie.x, y: pie.y }); return; }
    pl.shots++; g.shots.push({ pl: pl.id, w, x: pl.x, y: pl.y, t: WEAPONS[w].fly, T: WEAPONS[w].fly }); g.events.push({ k: 'throw', pl: pl.id, w }); }
  function reload(g, pl) { if (pl.reload > 0 || pl.stun > 0) return; const w = pl.weapon === 'spritze' ? 'spritze' : 'torte'; if (pl.ammo[w] >= WEAPONS[w].mag) return; pl.reload = RELOAD; g.events.push({ k: 'reload', pl: pl.id }); }
  function switchWeapon(g, pl) { const order = pl.bombs > 0 ? ['torte', 'spritze', 'bombe'] : ['torte', 'spritze']; pl.weapon = order[(order.indexOf(pl.weapon) + 1) % order.length]; g.events.push({ k: 'weapon', pl: pl.id, w: pl.weapon }); }
  const mult = pl => Math.min(5, 1 + Math.floor(pl.combo / 4));

  function resolve(g, s) {
    const pl = g.players[s.pl], W = WEAPONS[s.w];
    // Konditor-Torten im Anflug abwehren
    for (const pie of g.pies) if (!pie.dead && Math.hypot(pie.x - s.x, pie.y - s.y) < pie.r + W.r + .02) { pie.dead = true; pl.score += 10; g.events.push({ k: 'parry', pl: pl.id, x: pie.x, y: pie.y }); if (s.w !== 'bombe') return; }
    // Schild „Schön, dass du da bist!“: einmal +10 Sekunden
    const S = g.sign;
    if (!S.hit && s.w !== 'spritze' && Math.abs(s.x - S.x) < S.w / 2 + W.r && Math.abs(s.y - S.y) < S.h / 2 + W.r) { S.hit = true; g.t += 10; pl.score += 20; g.events.push({ k: 'sign', pl: pl.id, x: s.x, y: s.y }); return; }
    const order = g.people.slice().sort((a, b) => b.layer - a.layer); let any = false;
    for (const p of order) {
      const h = hitTest(p, s.x, s.y, W.r); if (!h) continue;
      any = true; damage(g, pl, p, s, h, W.dmg);
      if (s.w !== 'bombe') break;
    }
    if (any) { pl.hits++; pl.combo++; pl.best = Math.max(pl.best, pl.combo); }
    else { if (s.w !== 'spritze') pl.combo = 0; const layer = s.y > LAYERS[1].g ? 2 : s.y > LAYERS[0].g ? 1 : 0; if (g.splats.length > 260) g.splats.shift(); g.splats.push({ x: s.x, y: s.y, r: W.r * (s.w === 'bombe' ? .7 : 1.3), layer, w: s.w }); g.events.push({ k: 'miss', pl: pl.id, x: s.x, y: s.y, w: s.w }); }
    if (s.w === 'bombe') g.events.push({ k: 'bomb', pl: pl.id, x: s.x, y: s.y });
  }
  function damage(g, pl, p, s, h, dmg) {
    const b = body(p); if (p.splats.length < 14) p.splats.push({ dx: (s.x - p.x) / b.s, dy: (s.y - b.gy) / b.s, r: s.w === 'spritze' ? .07 : .16 });
    p.hp -= dmg; if (h === 2) p.headHit = true;
    if (p.hp > 0) { g.events.push({ k: 'splash', pl: pl.id, x: s.x, y: s.y, p: p.id }); return; }
    const T = TYPES[p.type], m = mult(pl), head = !!p.headHit, pts = T.pts * m * (head ? 2 : 1);
    pl.score += pts; if (head) pl.heads++; p.state = 'flee'; p.by = pl.id; p.hitT = 0; p.dir = p.x < g.WW / 2 ? -1 : 1; if (p.st) p.st.busy = false;
    if (p.type === 'chef') { g.chefT = 6; g.events.push({ k: 'chef', pl: pl.id }); }
    if (p.type === 'fan') { pl.bombs++; g.events.push({ k: 'bonus', pl: pl.id, x: s.x, y: s.y }); }
    g.events.push({ k: 'hit', pl: pl.id, p: p.id, type: p.type, head, pts, m, x: s.x, y: s.y });
  }

  /* ---------- Zeitschritt ---------- */
  function step(g, dt) {
    if (g.over) return;
    g.t -= dt; g.el += dt; if (g.chefT > 0) g.chefT -= dt;
    if (g.t <= 0) { g.t = 0; g.over = true; g.events.push({ k: 'end' }); return; }
    for (const pl of g.players) {
      pl.cd = Math.max(0, pl.cd - dt); if (pl.stun > 0) pl.stun = Math.max(0, pl.stun - dt);
      if (pl.reload > 0) { pl.reload -= dt; if (pl.reload <= 0) { pl.reload = 0; for (const w of ['torte', 'spritze']) if (w === (pl.weapon === 'spritze' ? 'spritze' : 'torte')) pl.ammo[w] = WEAPONS[w].mag; g.events.push({ k: 'loaded', pl: pl.id }); } }
      if (pl.fire && pl.weapon === 'spritze') fire(g, pl);
    }
    for (const s of g.shots) { s.t -= dt; if (s.t <= 0) resolve(g, s); }
    g.shots = g.shots.filter(s => s.t > 0);
    // Konditor-Torten fliegen auf den Bildschirm zu
    for (const pie of g.pies) {
      if (pie.dead) continue; pie.t += dt; const f = Math.min(1, pie.t / pie.T);
      pie.x = pie.x0 + (pie.tx - pie.x0) * f; pie.y = pie.y0 + (pie.ty - pie.y0) * f - Math.sin(f * Math.PI) * .12; pie.r = .02 + f * .07;
      if (f >= 1) { pie.dead = true; const pl = g.players[pie.pl]; if (pl) { pl.stun = BLIND; pl.combo = 0; pl.reload = 0; } g.events.push({ k: 'blind', pl: pie.pl }); }
    }
    g.pies = g.pies.filter(p => !p.dead);
    // Figuren bewegen
    for (const p of g.people) {
      p.t += dt; const T = TYPES[p.type];
      if (p.state === 'flee') { p.hitT += dt; p.x += p.dir * .55 * dt * LAYERS[p.layer].s; if (p.type === 'dj' || p.type === 'board') p.up = Math.max(0, p.up - dt * 1.5); if (p.type === 'tech') p.climb = Math.max(0, p.climb - dt * .8); if (p.hitT > 1.6) p.state = 'gone'; continue; }
      if (p.state === 'pop') { const k = p.t < p.life ? 1 : 0; p.up += (k - p.up) * Math.min(1, dt * 7); if (p.t > p.life + .5) { p.state = 'gone'; if (p.st) p.st.busy = false; } continue; }
      if (p.state === 'climb') { const c = p.t < p.life / 2 ? p.t / (p.life / 2) : Math.max(0, 2 - p.t / (p.life / 2)); p.climb = Math.min(1, c); if (p.t > p.life) p.state = 'gone'; continue; }
      if (p.type === 'mod' && p.target != null && p.t < p.life) { const d = p.target - p.x; if (Math.abs(d) > .02) p.x += Math.sign(d) * Math.min(Math.abs(d), .25 * dt); else p.state = 'stand'; continue; }
      if (p.type === 'kond') {
        if (p.state === 'walk' && p.t > 1.2) { p.state = 'aim'; p.aimT = 0; p.tpl = (g.rng() * g.players.length) | 0; g.events.push({ k: 'warn', p: p.id, pl: p.tpl }); }
        if (p.state === 'aim') { p.aimT += dt; if (p.aimT > 1.8) { const b = body(p), tp = g.players[p.tpl] || g.players[0]; const tx = g.solo ? g.camX + g.A / 2 : tp.x, ty = .45; g.pies.push({ pl: p.tpl, x0: p.x + p.dir * b.s * .2, y0: b.hy, x: p.x, y: b.hy, tx, ty, t: 0, T: .95, r: .02 }); g.events.push({ k: 'incoming', pl: p.tpl }); p.state = 'walk2'; p.dir = -p.dir; } continue; }
      }
      if (p.state === 'stand') { if (p.t > p.life) { p.state = 'walk'; p.v = .12; } continue; }
      p.x += p.dir * p.v * dt * (g.chefT > 0 ? 1.4 : 1);
      if (p.x < -.3 || p.x > g.WW + .3 || p.t > 30) p.state = 'gone';
    }
    g.people = g.people.filter(p => p.state !== 'gone');
    // neue Figuren
    g.spawnT -= dt;
    const want = Math.min(11, 5 + Math.floor(g.el / 18) + (g.solo ? 0 : g.players.length - 1));
    if (g.spawnT <= 0 && g.people.length < want) {
      g.spawnT = .45 + g.rng() * .8;
      const has = t => g.people.some(p => p.type === t);
      const pool = [['prak', 30], ['mod', 18], ['dj', 12], ['board', 10], ['tech', has('tech') ? 0 : 8], ['kond', g.el > 8 && !has('kond') ? 7 : 0], ['chef', has('chef') ? 0 : 4], ['fan', has('fan') ? 0 : 3]];
      let sum = pool.reduce((s, x) => s + x[1], 0), r = g.rng() * sum;
      for (const [t, w] of pool) { if ((r -= w) < 0) { spawn(g, t); break; } }
    }
  }
  function ranking(g) { return g.players.slice().sort((a, b) => b.score - a.score); }

  const TS = { LAYERS, HMAN, TYPES, WEAPONS, RELOAD, BLIND, TIME, mulberry, newGame, addPlayer, spawn, body, hitTest, fire, reload, switchWeapon, mult, step, ranking };
  if (typeof module !== 'undefined' && module.exports) module.exports = TS;
  root.TS = TS;
})(typeof self !== 'undefined' ? self : this);
