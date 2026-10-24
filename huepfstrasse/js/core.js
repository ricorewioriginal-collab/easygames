/* Hüpfstraße – Spiellogik ohne DOM (auch in Node testbar).
 * Endlose Welt aus Reihen: Wiese (Bäume/Steine blockieren, Münzen), Straße (Autos/Laster), Fluss (Baumstämme oder Seerosen),
 * Gleise (Zug mit Vorwarnung). Die Figur hüpft feldweise; Kamera schiebt langsam nach – wer zu weit zurückfällt, den holt die Funk-Drohne.
 * Reihe z (0 = Start, aufwärts = vorwärts), Spalte x (spielbar −4 … 4). Jede Reihe wird aus (Seed, z) erzeugt → Tagesstrecke für alle gleich. */
(function (root) {
  'use strict';
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  const HALF = 4, SPAN = 22, EDGE = SPAN / 2;      // spielbar −4…4; bewegte Dinge laufen auf einem Ring −11…11
  const BIOMES = [
    { id: 'fruehling', n: 'Frühlingswiese' }, { id: 'sommer', n: 'Sommerfeld' }, { id: 'herbst', n: 'Herbstwald' },
    { id: 'winter', n: 'Winterland' }, { id: 'nacht', n: 'Neonnacht' }
  ];
  const biomeOf = z => BIOMES[Math.floor(Math.max(0, z) / 60) % BIOMES.length];
  const FIGURES = [
    { id: 'rico', n: 'Rico', price: 0, d: 'Der Moderator persönlich – mit Bart, Nasenring und Mikro 💜' },
    { id: 'pingu', n: 'Pingu', price: 100, d: 'Watschelt cool über jede Straße.' },
    { id: 'fuchs', n: 'Flinker Fuchs', price: 100, d: 'Schlau, schnell, orange.' },
    { id: 'robo', n: 'Robo', price: 150, d: 'Piept bei jedem Hüpfer.' },
    { id: 'panda', n: 'Panda', price: 150, d: 'Gemütlich – aber nicht auf der Straße.' },
    { id: 'astro', n: 'Astronautin', price: 200, d: 'Hüpft wie auf dem Mond.' },
    { id: 'katze', n: 'Mietze', price: 200, d: 'Hat angeblich sieben Leben.' },
    { id: 'dino', n: 'Dino', price: 250, d: 'Kleine Arme, großer Mut.' },
    { id: 'einhorn', n: 'Einhorn', price: 300, d: 'Glitzert sogar im Regen.' }
  ];

  /* ---------- Welt ---------- */
  function newWorld(seed, opt) {
    opt = opt || {};
    const W = { seed: seed >>> 0, rows: new Map(), P: { x: 0, z: 0, hop: null, dead: null, log: null, face: 0 }, score: 0, coins: 0, cam: 0, scroll: false, t: 0, ev: [], over: false, idle: 0 };
    for (let z = -6; z < 26; z++) row(W, z);
    return W;
  }
  function row(W, z) {
    let R = W.rows.get(z); if (R) return R;
    const rnd = mulberry(hash(W.seed + ':' + z)), diff = Math.min(1, Math.max(0, z) / 220);
    R = { z, type: 'grass', biome: biomeOf(z).id, trees: new Set(), coins: new Set(), items: [], dir: 1, speed: 0, pads: null, train: null };
    if (z <= 3) { // sichere Startwiese, Bäume nur am Rand
      if (z < 0) for (let x = -HALF; x <= HALF; x++) R.trees.add(x); else if (z > 0) { if (rnd() < .5) R.trees.add(-HALF); if (rnd() < .5) R.trees.add(HALF); }
      W.rows.set(z, R); return R;
    }
    // Abschnitte: gleiche Art über mehrere Reihen (aus dem Reihen-Seed der Abschnittsmitte bestimmt)
    const seg = segOf(W, z), t = seg.type;
    R.type = t;
    if (t === 'grass') {
      const prev = W.rows.get(z - 1), want = Math.floor(rnd() * (2 + diff * 3)) + (rnd() < .3 ? 1 : 0);
      const free = []; for (let x = -HALF; x <= HALF; x++) free.push(x);
      for (let k = 0; k < want && k < 4; k++) { const x = free.splice(Math.floor(rnd() * free.length), 1)[0]; R.trees.add(x); }
      // mindestens zwei offene Spalten, die auch in der Vorreihe (falls Wiese) offen sind
      if (prev && prev.type === 'grass') { let shared = 0; for (let x = -HALF; x <= HALF; x++) if (!R.trees.has(x) && !prev.trees.has(x)) shared++; if (shared < 2) for (const x of Array.from(R.trees)) { if (prev.trees.has(x)) continue; R.trees.delete(x); } }
      if (prev && prev.pads) { for (const x of prev.pads) R.trees.delete(x); R.coins.delete(prev.path); }
      if (rnd() < .22) { const c = Math.floor(rnd() * 9) - HALF; if (!R.trees.has(c)) R.coins.add(c); }
    } else if (t === 'road') {
      R.dir = rnd() < .5 ? 1 : -1; R.speed = (1.6 + rnd() * 1.8) * (1 + diff * 1.1);
      const truck = rnd() < .3, len = truck ? 2.2 : 1.2, n = truck ? 2 + (rnd() < diff ? 1 : 0) : 2 + Math.floor(rnd() * (2 + diff * 2));
      placeRing(R, n, len, rnd, truck ? 'truck' : 'car', 2.4);
      if (rnd() < .12) R.coins.add(Math.floor(rnd() * 9) - HALF);
    } else if (t === 'river') {
      if (seg.pads) { // Seerosen (stehen still)
        R.pads = new Set(); const prev = W.rows.get(z - 1), n = 3 + Math.floor(rnd() * 3);
        // durchgehender Weg: R.path liegt direkt vor dem Weg der Vorreihe (bzw. vor einer freien Wiesen-Spalte)
        if (prev && prev.pads) R.path = prev.path;
        else { const fr = []; for (let x = -HALF; x <= HALF; x++) if (!(prev && prev.type === 'grass' && prev.trees.has(x))) fr.push(x); R.path = fr.length ? fr[Math.floor(rnd() * fr.length)] : 0; }
        R.pads.add(R.path); if (rnd() < .5 && Math.abs(R.path + 1) <= HALF) R.pads.add(R.path + 1); else if (Math.abs(R.path - 1) <= HALF) R.pads.add(R.path - 1);
        while (R.pads.size < n) R.pads.add(Math.floor(rnd() * 9) - HALF);
      } else {
        R.dir = seg.dir * (z % 2 ? 1 : -1); R.speed = (1.1 + rnd() * 1.2) * (1 + diff * .6);
        const len = 2 + Math.floor(rnd() * (3 - diff * 1.2)) + .6, n = Math.max(3, Math.round(SPAN / (len + 1.6 + diff * 1.4)));
        placeRing(R, n, len, rnd, 'log', 1.2);
      }
    } else if (t === 'rail') {
      R.train = { x: -99, active: false, wait: 2 + rnd() * 4, warn: 0, period: 4 + rnd() * 4 * (1 - diff * .5), speed: 26 + diff * 8, len: 9, dir: rnd() < .5 ? 1 : -1, rs: hash('t' + z) };
    }
    W.rows.set(z, R); return R;
  }
  // gleichmäßig verteilte Dinge mit Zufallsabstand auf dem Ring
  function placeRing(R, n, len, rnd, kind, minGap) {
    const slot = SPAN / n; let x0 = rnd() * SPAN;
    for (let i = 0; i < n; i++) { const jitter = Math.max(0, slot - len - minGap) * rnd(); R.items.push({ x: wrap(x0 + i * slot + jitter), len, kind, c: Math.floor(rnd() * 6) }); }
  }
  const wrap = x => { x = (x + EDGE) % SPAN; if (x < 0) x += SPAN; return x - EDGE; };
  // Abschnitt bestimmen: Folge aus Abschnitten unterschiedlicher Länge, gespeichert pro Welt
  function segOf(W, z) {
    if (!W.segs) { W.segs = []; W.segEnd = 4; }
    while (W.segEnd <= z) {
      const s = W.segEnd, rnd = mulberry(hash(W.seed + ':seg:' + s)), diff = Math.min(1, s / 220), last = W.segs.length ? W.segs[W.segs.length - 1].type : 'grass';
      let type, len;
      const r = rnd();
      if (last !== 'grass' && r < .38) type = 'grass';
      else if (r < .62) type = 'road'; else if (r < .84) type = last === 'river' ? 'road' : 'river'; else type = last === 'rail' ? 'grass' : 'rail';
      if (type === 'grass') len = 1 + Math.floor(rnd() * 2);
      else if (type === 'road') len = 1 + Math.floor(rnd() * (2 + diff * 3));
      else if (type === 'river') len = 1 + Math.floor(rnd() * (2 + diff * 2));
      else len = 1 + (rnd() < .25 + diff * .3 ? 1 : 0);
      W.segs.push({ type, from: s, to: s + len, pads: type === 'river' && rnd() < .3, dir: rnd() < .5 ? 1 : -1 }); W.segEnd = s + len;
    }
    for (let i = W.segs.length - 1; i >= 0; i--) if (W.segs[i].from <= z) return W.segs[i];
    return { type: 'grass' };
  }
  const ground = R => R.type === 'grass' || R.type === 'road' || R.type === 'rail';

  /* ---------- Eingabe: hüpfen ---------- */
  const DIRS = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
  const HOP = .13;
  function hop(W, dir) {
    const P = W.P; if (P.dead || W.over) return false;
    if (P.hop) { P.queue = dir; return true; }
    const d = DIRS[dir]; if (!d) return false;
    P.face = dir;
    const cur = row(W, P.z), tz = P.z + d[1]; let tx = P.x + d[0];
    const T = row(W, tz);
    if (ground(T) || T.pads) tx = Math.round(tx);
    if (Math.abs(tx) > HALF + .01 && (ground(T) || T.pads)) { W.ev.push({ k: 'bump' }); return false; }
    if (T.type === 'grass' && T.trees.has(tx)) { W.ev.push({ k: 'bump' }); return false; }
    if (Math.abs(tx) > HALF + .45) { W.ev.push({ k: 'bump' }); return false; }
    P.hop = { t: 0, fx: P.x, fz: P.z, tx, tz }; P.log = null; P.z = tz; W.scroll = true; W.idle = 0;
    W.ev.push({ k: 'hop', dir });
    void cur; return true;
  }

  /* ---------- Zeit ---------- */
  function step(W, dt) {
    W.t += dt; const P = W.P;
    // bewegte Dinge in allen erzeugten Reihen nahe der Kamera
    const lo = Math.floor(W.cam) - 8, hi = Math.ceil(W.cam) + 24;
    for (let z = lo; z <= hi; z++) {
      const R = row(W, z);
      if (R.items.length) for (const it of R.items) it.x = wrap(it.x + R.dir * R.speed * dt);
      if (R.train) trainStep(W, R, dt);
    }
    for (const k of Array.from(W.rows.keys())) if (k < lo - 4) W.rows.delete(k);
    if (P.dead) { P.dead.t += dt; if (P.dead.t > 1.1 && !W.over) { W.over = true; W.ev.push({ k: 'over' }); } return; }
    // Hüpfer
    if (P.hop) {
      const h = P.hop; h.t += dt / HOP;
      if (h.t >= 1) { P.hop = null; P.x = h.tx; land(W); if (!P.dead && P.queue) { const q = P.queue; P.queue = null; hop(W, q); } }
    }
    if (!P.hop && P.log) { P.x += P.log.d * P.log.s * dt; if (Math.abs(P.x) > HALF + .7) kill(W, 'drift'); }
    const R = row(W, P.z), px = P.hop ? P.hop.fx + (P.hop.tx - P.hop.fx) * P.hop.t : P.x;
    // Autos / Züge treffen (in der zweiten Hüpfhälfte und am Boden)
    if (!P.dead && (!P.hop || P.hop.t > .45)) {
      if (R.type === 'road') for (const it of R.items) { if (Math.abs(ringDist(it.x, px)) < it.len / 2 + .3) { kill(W, 'car', { dir: R.dir }); break; } }
      if (R.type === 'rail' && R.train && R.train.active && Math.abs(R.train.x - px) < R.train.len / 2 + .4) kill(W, 'train', { dir: R.train.dir });
    }
    // Kamera: folgt nach vorn, schiebt langsam weiter
    const target = P.z - 1.5;
    if (target > W.cam) W.cam += (target - W.cam) * Math.min(1, dt * 4);
    if (W.scroll && !P.dead) W.cam += Math.min(.75, .22 + W.score * .0025) * dt;
    if (!P.dead && P.z < W.cam - 4) kill(W, 'drone');
    W.idle += dt;
  }
  const ringDist = (a, b) => { let d = a - b; d = ((d + EDGE) % SPAN + SPAN) % SPAN - EDGE; return d; };
  function trainStep(W, R, dt) {
    const T = R.train;
    if (T.active) { T.x += T.dir * T.speed * dt; if (Math.abs(T.x) > EDGE + T.len) { T.active = false; T.wait = T.period * (.6 + ((T.rs = (T.rs * 1103515245 + 12345) >>> 0) % 1000) / 1000 * .8); } return; }
    T.wait -= dt; T.warn = T.wait < 1.4 ? 1 : 0;
    if (T.wait < 1.4 && !T.warned) { T.warned = true; if (Math.abs(R.z - W.P.z) < 8) W.ev.push({ k: 'warn', z: R.z }); }
    if (T.wait <= 0) { T.active = true; T.warned = false; T.warn = 0; T.x = -T.dir * (EDGE + T.len); if (Math.abs(R.z - W.P.z) < 8) W.ev.push({ k: 'train', z: R.z }); }
  }
  function land(W) {
    const P = W.P, R = row(W, P.z);
    if (R.type === 'river') {
      if (R.pads) { if (R.pads.has(Math.round(P.x))) { P.x = Math.round(P.x); W.ev.push({ k: 'pad' }); } else return kill(W, 'water'); }
      else { const it = R.items.find(i => Math.abs(ringDist(i.x, P.x)) < i.len / 2 + .05); if (!it) return kill(W, 'water'); P.log = { d: R.dir, s: R.speed }; W.ev.push({ k: 'log' }); }
    } else if (R.coins.has(P.x)) { R.coins.delete(P.x); W.coins++; W.ev.push({ k: 'coin' }); }
    if (P.z > W.score) { W.score = P.z; W.ev.push({ k: 'score', s: W.score }); }
  }
  function kill(W, how, o) { const P = W.P; if (P.dead) return; P.dead = Object.assign({ how, t: 0, x: P.hop ? P.hop.fx + (P.hop.tx - P.hop.fx) * P.hop.t : P.x }, o || {}); P.hop = null; W.ev.push({ k: 'die', how }); }
  function daily(d) { const k = dayKey(d); return { key: k, seed: hash('huepfstrasse:' + k) }; }

  const H = { HALF, SPAN, EDGE, BIOMES, FIGURES, biomeOf, mulberry, hash, dayKey, newWorld, row, hop, step, ringDist, daily, HOP };
  if (typeof module !== 'undefined' && module.exports) module.exports = H;
  root.HS = H;
})(typeof window !== 'undefined' ? window : globalThis);
