// Märchenwelten (wie Kingdom Hearts): sieben vollständige Welten nach gemeinfreien Vorlagen. Jede liegt als Abstecher auf dem Weg
// zwischen zwei Kapiteln (siehe link in mwdata.js) und wird mit der Nautilux angeflogen. In jeder Welt: mehrere Gebiete mit
// Wahrzeichen, Figuren, Tiere und Leben, eine eigene Spielmechanik (Spiegel-Portale, Lianen, Kletterturm, Strömungen, Arena …),
// ein Gast, der mitkämpft, 4–5 Aufträge, Bosse mit Reaktionsbefehl und am Ende ein Schlüsselloch zum Versiegeln.
// Zustand: S.mw[id] = { v: 2, m: Auftrag, st: 0 frei / 1 läuft, c: Zähler, got: {Teil: 1}, done: 1, seen: 1, no: 1 (Abstecher abgelehnt) }.
import { WORLDS } from './mwdata.js';
import { makeLand } from './mwland.js';
import { createMwFoes } from './mwfoes.js';
export const MW_FIRST = 21, MW_LAST = 27, MW = WORLDS;
const CX = 0; let CZ = -36, R = 58; const PATHX = z => Math.sin(z * .08) * 5;
const GTEX = { spiegel: 'forest', dschungel: 'forest', notredame: 'cobble', theben: 'sand', meer: 'sand', mauer: 'grass', camelot: 'grass' };
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hex = n => '#' + n.toString(16).padStart(6, '0');

export function createMaerchen(C) {
  const { T, G, PG, M, mk, glow } = C;
  const FOE = createMwFoes({ T, mk, G, M, glow, mergeStatic: C.mergeStatic, SK: C.TX && C.TX.skin });
  const { LAND } = makeLand({ T, G, M, mk, glow });
  const W = n => WORLDS.find(w => w.n === n);
  const st = id => { const S = C.S(); S.mw = S.mw || {}; let s = S.mw[id]; const w = WORLDS.find(q => q.id === id);
    if (!s || s.v !== 2) s = S.mw[id] = { v: 2, m: s && s.done ? w.ms.length : 0, st: 0, c: 0, got: {}, done: s && s.done ? 1 : 0, seen: 0 };
    return s; };
  const seals = () => WORLDS.filter(w => st(w.id).done).length;
  const unlocked = w => { const s = st(w.id); return s.done || s.m > 0 || s.seen || C.chDone(w.link); };
  const open = n => { const w = W(n); return !!w && !C.MP().on && unlocked(w); };
  let cur = null, title = null;
  for (const w of WORLDS) for (const d of w.npcs.concat([w.guest])) if (d.port || d.em) C.PORT[d.name] = C.PORT[d.name] || [d.port ? d.port[0] : d.em, d.port ? d.port[1] : d.css];
  Object.assign(C.PORT, { 'Erzähler': C.PORT['Erzähler'] || ['📖', '#e8d8b0'], 'Alte Krämerin': ['🧺', '#9a6aa8'], 'Kaa': ['🐍', '#b0a040'], 'Djali': ['🐐', '#d8c890'], 'Schiffsjunge': ['⛵', '#6a8ac0'], 'Dame vom See': ['🌊', '#8ac0e0'], 'Erzählerstein': ['📜', '#c8b890'] });

  /* ---------- Gelände: Hügel, ebene Plätze, Teiche, Fluss mit Furt/Brücke, steiler Randhang ---------- */
  function riverDist(rv, x, z) { let best = 1e9; for (let i = 0; i < rv.pts.length - 1; i++) { const [ax, az] = rv.pts[i], [bx, bz] = rv.pts[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))), d = Math.hypot(x - ax - dx * t, z - az - dz * t); if (d < best) best = d; } return best; }
  function heightFn(w) {
    const pads = w.pads, rects = w.rects || [], pools = w.pools || [], ph = w.n * 1.37, amp = w.amp, rv = w.river;
    return (x, z) => {
      const d = Math.hypot(x - CX, z - CZ);
      let q = (Math.sin(x * .07 + ph) * Math.cos(z * .06 + ph * .5) * 1.2 + Math.sin(x * .031 + z * .027 + ph) * 1.6 + Math.sin(x * .17 + z * .13) * .25) * amp;
      let f = 1 - (1 - sm(2.5, 6, Math.abs(x - PATHX(z)))) * sm(-90, -84, z) * (1 - sm(14, 18, z));
      for (const [px, pz, r] of pads) f = Math.min(f, sm(r, r + 6, Math.hypot(x - px, z - pz)));
      for (const [x0, x1, z0, z1] of rects) f = Math.min(f, sm(0, 6, Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1))));
      f = Math.min(f, sm(7, 12, Math.hypot(x, z - 10)));
      if (rv) f = Math.min(f, sm(rv.w * .5 + 1, rv.w * .5 + 6, riverDist(rv, x, z)));
      q *= f;
      for (const [px, pz, r] of pools) { const pd = Math.hypot(x - px, z - pz); q -= 1.4 * (1 - sm(r - 1, r + 1.5, pd)); }
      if (rv) { const rd = riverDist(rv, x, z), cut = 1 - sm(rv.w * .5 - 1.2, rv.w * .5 + .8, rd), ford = x > rv.ford[0] && x < rv.ford[1]; q -= cut * (ford ? (rv.bridge ? 0 : .35) : 1.7); }
      const k = Math.max(0, d - R); return q + k * k * .38;
    };
  }
  const inRiver = (w, x, z) => { const rv = w.river; if (!rv || (x > rv.ford[0] && x < rv.ford[1])) return false; return riverDist(rv, x, z) < rv.w * .5 - .5; };

  /* ---------- Bausteine ---------- */
  function solidBox(x, z, w, d, ry) { const L = Math.max(w, d), r = Math.min(w, d) / 2, n = Math.max(1, Math.ceil((L - r * 2) / (r * .6)) + 1), c = Math.cos(ry || 0), s = Math.sin(ry || 0);
    for (let i = 0; i < n; i++) { const u = n === 1 ? 0 : (i / (n - 1) - .5) * (L - r * 2), lx = w >= d ? u : 0, lz = w >= d ? 0 : u; C.addCol(x + lx * c + lz * s, z - lx * s + lz * c, r); } }
  function B(g) {
    const mt = (col, op) => { const t = op.tex || (o.tmap && o.tmap[col]); return t ? C.TX.tri(t, col, op.to || {}) : M(col, op.mat || {}); };
    const o = {
      g, h: (x, z) => cur.h(x, z), addCol: C.addCol, solid: solidBox, tmap: null,
      mat: (col, tex, to) => tex ? C.TX.tri(tex, col, to || {}) : M(col),
      box(x, y, z, w, h, d, col, op) { op = op || {}; const m = mk(G.box, mt(col, op), x, y + h / 2, z, w, h, d, op.cast !== false); if (op.ry) m.rotation.y = op.ry; if (op.rx) m.rotation.x = op.rx; if (op.rz) m.rotation.z = op.rz; g.add(m); if (op.solid) solidBox(x, z, w, d, op.ry); return m; },
      cyl(x, y, z, r, h, col, op) { op = op || {}; const m = mk(op.lo ? G.cyl0 : G.cyl, mt(col, op), x, y + h / 2, z, r, h, r, op.cast !== false); g.add(m); if (op.solid) C.addCol(x, z, r); return m; },
      cone(x, y, z, r, h, col, op) { op = op || {}; const m = mk(op.lo ? G.cone0 : G.cone, mt(col, op), x, y + h / 2, z, r, h, op.rz2 || r, op.cast !== false); if (op.ry) m.rotation.y = op.ry; g.add(m); if (op.solid) C.addCol(x, z, r * .85); return m; },
      sph(x, y, z, sx, sy, sz, col, op) { op = op || {}; const m = mk(G.sph, mt(col, op), x, y, z, sx, sy, sz, op.cast !== false); g.add(m); if (op.solid) C.addCol(x, z, Math.min(sx, sz) * .95); return m; },
      ico(x, y, z, sx, sy, sz, col, op) { op = op || {}; const m = mk(PG.rock, op.tex || (o.tmap && o.tmap[col]) ? mt(col, op) : C.TX.tri('rock', col, { s: .5 }), x, y, z, sx, sy, sz); g.add(m); if (op.solid) C.addCol(x, z, Math.min(sx, sz) * .9); return m; },
      oct(x, y, z, sx, sy, sz, col, op) { op = op || {}; const m = mk(G.oct, M(col, op.mat || {}), x, y, z, sx, sy, sz, false); g.add(m); return m; },
      tor(x, y, z, s, col, op) { op = op || {}; const m = mk(G.tor, M(col, op.mat || {}), x, y, z, s, s, op.d || s, false); if (op.rx != null) m.rotation.x = op.rx; if (op.ry) m.rotation.y = op.ry; g.add(m); return m; },
      glow(col, sz, x, y, z, op) { const s = glow(col, sz, x, y, z, op); g.add(s); return s; }
    };
    return o;
  }

  /* ---------- Bewegte Teile (nicht zusammengeführt) ---------- */
  function anim(b, keepSet) {
    const A = {
      keep: keepSet,
      move(m) { keepSet.add(m); return m; },
      pulse(mat, col, base, amp) { C.animObjs.push({ fn(t) { mat.emissiveIntensity = base + Math.sin(t * 1.6) * amp * .5 + amp * .5; } }); },
      bob(m, a, sp) { A.move(m); const y0 = m.position.y; C.animObjs.push({ fn(t) { m.position.y = y0 + Math.sin(t * sp + m.position.x) * a; m.rotation.z = Math.sin(t * sp * .7) * .04; } }); },
      spin(m, sp) { A.move(m); C.animObjs.push({ fn(t, dt) { m.rotation.z += (dt || .016) * sp; } }); },
      sway(m, i) { A.move(m); const r0 = m.rotation.z, r1 = m.rotation.x; C.animObjs.push({ fn(t) { m.rotation.z = r0 + Math.sin(t * 1.4 + i) * .14; m.rotation.x = r1 + Math.cos(t * 1.1 + i) * .08; } }); },
      shell(m, i) { A.move(m); C.animObjs.push({ fn(t) { m.scale.y = .8 * (.35 + .65 * Math.max(0, Math.sin(t * .6 + i * .8))); } }); },
      smoke(x, y, z) { let k = 0; C.animObjs.push({ fn(t, dt) { k += dt || .016; if (k > .35) { k = 0; C.emit(x, y, z, 0x9a9aa4, 1, .4, 2.6, .5, -1.2); } } }); },
      fire(x, z, s, up) { const y = cur.h(x, z) + (up ? 1 : 0), fl = mk(G.cone, M(0xff8a2a, { e: 0xff6a10, ei: 2.6 }), x, y + .35 * s, z, .35 * s, .9 * s, .35 * s, false); b.g.add(fl); A.move(fl);
        b.g.add(glow(0xffa040, 3 * s, x, y + .6 * s, z, .7)); let k = 0; C.animObjs.push({ fn(t, dt) { fl.scale.y = .9 * s * (1 + Math.sin(t * 13 + x) * .18); k += dt || .016; if (k > .2) { k = 0; C.emit(x, y + .7 * s, z, 0xffb040, 1, .5, .7, .18, -2.5); } } }); },
      creature(kind, col, s) { const P = FOE.has(kind) ? FOE.make(kind, col, false) : C.CR().makeKind(kind, col, false); P.root.scale.setScalar(s || 1); b.g.add(P.root); A.move(P.root); return P.root; },
      vortex(x, z, r) { const m = mk(new T.RingGeometry(.6, r, 48, 1), new T.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: .22, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }), x, cur.h(x, z) + .4, z, 1, 1, 1, false);
        m.rotation.x = -Math.PI / 2; b.g.add(m); A.move(m); (cur.vort = cur.vort || []).push(m); C.animObjs.push({ fn(t, dt) { m.rotation.z -= (dt || .016) * 2.6; if (Math.random() < .3 && m.visible) C.emit(x + (Math.random() - .5) * r, cur.h(x, z) + .3, z + (Math.random() - .5) * r, 0xd8f8ff, 1, .6, 1.2, .14, -1); } }); },
      vent(x, z) { b.tor(x, cur.h(x, z) + .15, z, .9, 0xd8c8a8, { rx: Math.PI / 2, d: .25 }); let k = 0; C.animObjs.push({ fn(t, dt) { k += dt || .016; if (k > .12) { k = 0; C.emit(x + (Math.random() - .5) * .6, cur.h(x, z) + .3, z + (Math.random() - .5) * .6, 0xd8f8ff, 1, .3, 1.6, .16, -4); } } }); },
      mist(x, z, r) { for (let i = 0; i < 6; i++) { const s = glow(0xe8f4ff, r * .9, x + Math.cos(i) * r * .5, 1.2, z + Math.sin(i) * r * .4, .22); b.g.add(s); A.move(s); const x0 = s.position.x; C.animObjs.push({ fn(t) { s.position.x = x0 + Math.sin(t * .3 + i) * 1.6; } }); } },
      climbTower(cx, cz, top, S, D) {   // Glockenturm als Plattform (Wand von unten, Boden von oben) und acht Vorsprünge spiralförmig nach oben
        b.box(cx, 0, cz, 5.2, top, 5.2, S, { mat: { r: .95 } }); C.PLAT.push({ x: cx, z: cz, hx: 2.6, hz: 2.6, top, th: top + 1 });
        b.box(cx, top, cz, 5.6, .3, 5.6, D); for (const [dx, dz] of [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]]) b.box(cx + dx, top, cz + dz, .35, 2.6, .35, D); b.box(cx, top + 2.6, cz, 5.8, .4, 5.8, 0x4a5a6a); b.cone(cx, top + 3, cz, 3.6, 3.4, 0x4a5a6a);
        for (let i = 0; i < 8; i++) { const a = i * .82, x = cx + Math.sin(a) * 4.5, z = cz + Math.cos(a) * 4.5, t = 1.15 * (i + 1); b.box(x, t - .5, z, 2.3, .5, 2.3, D, { ry: a }); b.box(x, 0, z, .5, t - .5, .5, S); C.PLAT.push({ x, z, hx: 1.1, hz: 1.1, top: t, th: .6 }); } }
    };
    return A;
  }

  /* ---------- Streu-Dekoration (Instanzen) ---------- */
  const DECOR = {
    oak: { parts: [[() => PG.trunk, 0x4a3426, 1.3, .5, 2.6, .5], [() => PG.canopy, 0x2a4a2a, 3.6, 2.3, 1.9, 2.3]], col: .42 },
    pine: { parts: [[() => PG.trunk, 0x4a3426, 1, .4, 2, .4], [() => PG.pine, 0x1e4a2e, 3.6, 1.9, 4.2, 1.9]], col: .36 },
    jungle: { parts: [[() => PG.trunk, 0x5a4430, 2.2, .45, 4.4, .45], [() => PG.canopy, 0x2a7a2a, 5, 3, 1.5, 3], [() => G.cyl0, 0x3a6a2a, 2.4, .05, 4.6, .05]], col: .38 },
    palm: { parts: [[() => G.cyl0, 0x7a6040, 2.2, .22, 4.4, .22], [() => PG.canopy, 0x3a8a2a, 4.5, 2.4, .5, 2.4]], col: .25 },
    fern: { parts: [[() => PG.canopy, 0x3a7a2a, .45, .9, .5, .9]], col: 0 },
    rock: { parts: [[() => PG.rock, 0x6a6a72, .45, 1.1, .9, 1.1]], col: .95 },
    rockbig: { parts: [[() => PG.rock, 0x6a6460, 1.6, 4, 4.5, 4]], col: 3.6 },
    bush: { parts: [[() => PG.canopy, 0x2e5a2e, .6, 1.1, .85, 1.1]], col: .85 },
    mush: { parts: [[() => G.cyl0, 0xe8e0d0, .25, .09, .5, .09], [() => PG.cap, 0x9a4ad8, .5, .35, .32, .35, { e: 0x7a2ab8, ei: 1.2 }]], col: 0 },
    flower: { parts: [[() => G.sph0, 0xffd04a, .18, .14, .14, .14, { e: 0x8a6a10, ei: .6 }], [() => PG.canopy, 0x3a7a2a, .1, .3, .15, .3]], col: 0 },
    kelp: { parts: [[() => G.cyl0, 0x2a8a4a, 2.4, .12, 4.8, .12, { e: 0x0a3a1a, ei: 1 }], [() => PG.canopy, 0x3a9a5a, 4.6, .5, .9, .5]], col: 0 },
    coral: { parts: [[() => G.ico, 0xe0607a, .35, .8, .6, .8, { e: 0x601020, ei: .6 }], [() => G.sph, 0xff90b8, 1.2, .95, 1.1, .07, { e: 0x803050, ei: .8 }], [() => G.sph, 0xffb070, .9, .6, .8, .06, { e: 0x804020, ei: .8 }]], col: .5 },
    shell: { parts: [[() => G.sph, 0xf0e0d0, .1, .35, .14, .3, { m: .4, r: .3 }]], col: 0 },
    olive: { parts: [[() => PG.trunk, 0x6a5a44, 1, .45, 2, .45], [() => PG.canopy, 0x7a8a5a, 2.6, 1.9, 1.3, 1.9]], col: .38 },
    cypress: { parts: [[() => G.cyl0, 0x4a3a2a, .6, .22, 1.2, .22], [() => G.cone, 0x1e3a24, 3.4, .9, 5.6, .9]], col: .3 },
    column: { parts: [[() => G.cyl, 0xe8e0d0, 1.4, .55, 2.8, .55], [() => G.box, 0xe0d8c8, 2.9, 1.3, .25, 1.3]], col: .62 },
    lamp: { parts: [[() => G.cyl0, 0x2a2a2e, 1.4, .08, 2.8, .08], [() => G.sph0, 0xffd890, 2.9, .2, .26, .2, { e: 0xffc060, ei: 2 }]], col: .2 },
    barrel: { parts: [[() => G.cyl, 0x6a4a2a, .5, .4, 1, .4]], col: .45 },
    bamboo: { parts: [[() => G.cyl0, 0x7aa04a, 2.2, .1, 4.4, .1], [() => G.cyl0, 0x8ab05a, 2, .1, 4, .1], [() => PG.canopy, 0x5a8a3a, 4.2, .8, .5, .8]], col: .2 },
    house: { parts: [[() => G.box, 0xd8c8a8, 4.5, 4.2, 9, 4.2], [() => G.cone, 0x4a4a5a, 9.8, 3.4, 2.4, 3.4]], col: 0 }
  };
  const offs = { jungle: [[0, 0], [1.2, .6]], bamboo: [[0, 0], [.5, .3], [-.3, .5]], coral: [[0, 0], [.3, 0], [-.5, .3]] };
  function scatter(g, list, keep, snow) {
    const by = {}; for (const it of list) (by[it[2]] = by[it[2]] || []).push(it);
    for (const k in by) { const D = DECOR[k], L = by[k]; D.parts.forEach((p, pi) => { const geo = p[0](), col = snow && pi === D.parts.length - 1 && (k === 'pine' || k === 'rockbig') ? 0xe8eef4 : p[1], im = new T.InstancedMesh(geo, geo === PG.trunk ? C.TX.tri('bark', col, { s: .9, gain: 1.7 }) : geo === PG.rock ? C.TX.tri(snow && col === 0xe8eef4 ? 'snow' : 'rock', col, { s: .45, gain: 1.7 }) : k === 'column' && pi === 0 ? C.TX.tri('marble', col, { s: .6 }) : k === 'barrel' ? C.TX.tri('wood', col, { s: 1.2 }) : M(col, p[6] || {}), L.length), q = new T.Object3D(), tc = new T.Color();
      L.forEach(([x, z, , s, r], i) => { const of = (offs[k] && offs[k][pi]) || [0, 0], y = cur.h(x, z); q.position.set(x + of[0] * s, y + p[2] * s, z + of[1] * s); q.rotation.set(0, r, 0); q.scale.set(p[3] * s, p[4] * s, p[5] * s); q.updateMatrix(); im.setMatrixAt(i, q.matrix); im.setColorAt && im.setColorAt(i, tc.setHex(0xffffff).multiplyScalar(.82 + ((i * 37) % 10) * .036)); });
      if (im.instanceColor) im.instanceColor.needsUpdate = true; im.castShadow = k !== 'flower' && k !== 'shell'; im.receiveShadow = true; im.frustumCulled = false; g.add(im); keep.push(im); });
      if (D.col) for (const [x, z, , s] of L) if (Math.hypot(x - CX, z - CZ) < R + 1) C.addCol(x, z, D.col * s); }
  }

  /* ---------- Figuren ---------- */
  function extra(P, kind, sc) {
    const r = P.root, s = 1 / (sc || 1), add = m => { r.add(m); return m; };
    if (kind === 'lamp') { add(mk(G.cyl0, M(0x2a2a2e), .35 * s, .55 * s, .1 * s, .03 * s, .3 * s, .03 * s)); add(mk(G.sph0, M(0xffd890, { e: 0xffc060, ei: 2.2 }), .35 * s, .4 * s, .1 * s, .1 * s, .13 * s, .1 * s, false)); add(glow(0xffc060, 1.2 * s, .35 * s, .4 * s, .1 * s, .7)); }
    if (kind === 'pick') { const h = add(mk(G.cyl0, M(0x6a4a2a), .32 * s, .6 * s, 0, .03 * s, .8 * s, .03 * s)); h.rotation.z = .5; add(mk(G.box, M(0x8a8a92, { m: .7 }), .52 * s, .95 * s, 0, .4 * s, .06 * s, .06 * s)); }
    if (kind === 'tail') { const t = add(mk(G.cone, M(P.tailCol || 0x2a8a8a, { e: 0x0a3a3a, ei: .8, r: .4 }), 0, .3 * s, 0, .3 * s, .62 * s, .3 * s)); t.rotation.x = Math.PI; const f = add(mk(G.sph, M(P.tailCol || 0x2a8a8a, { e: 0x0a3a3a, ei: .8 }), 0, .03 * s, .12 * s, .55 * s, .04 * s, .3 * s)); f.rotation.x = .3; }
    if (kind === 'tamb') { const t = add(mk(G.cyl, M(0xd8b070, { m: .3 }), -.38 * s, .95 * s, .15 * s, .18 * s, .05 * s, .18 * s)); t.rotation.x = 1.2; }
    if (kind === 'staff') { add(mk(G.cyl0, M(0x5a4030), .38 * s, .95 * s, .1 * s, .035 * s, 1.9 * s, .035 * s)); add(mk(G.oct, M(0x8ad0ff, { e: 0x4aa0ff, ei: 2 }), .38 * s, 1.95 * s, .1 * s, .1 * s, .14 * s, .1 * s, false)); add(glow(0x8ad0ff, 1.1 * s, .38 * s, 1.95 * s, .1 * s, .6)); }
    if (kind === 'torch') { add(mk(G.cyl0, M(0x5a4030), .36 * s, .9 * s, .15 * s, .04 * s, .9 * s, .04 * s)); add(mk(G.cone, M(0xff8a2a, { e: 0xff6a10, ei: 2.4 }), .36 * s, 1.45 * s, .15 * s, .1 * s, .26 * s, .1 * s, false)); add(glow(0xffa040, 1.4 * s, .36 * s, 1.5 * s, .15 * s, .7)); }
    if (kind === 'spear') { const sp = add(mk(G.cyl0, M(0x5a3a22), .36 * s, 1 * s, .05 * s, .03 * s, 2.2 * s, .03 * s)); sp.rotation.z = -.08; add(mk(G.cone, M(0xc8c8d0, { m: .8, r: .3 }), .45 * s, 2.15 * s, .05 * s, .05 * s, .22 * s, .05 * s)); add(mk(G.box, M(0xc83a2a), .43 * s, 1.95 * s, .05 * s, .02 * s, .14 * s, .1 * s, false)); }
    if (kind === 'bow') { const bw = add(mk(G.tor, M(0x6a4a2a), -.4 * s, 1 * s, .15 * s, .3 * s, .5 * s, .1 * s, false)); bw.rotation.y = Math.PI / 2; add(mk(G.cyl0, M(0x5a3a22), .12 * s, 1.15 * s, -.28 * s, .08 * s, .45 * s, .08 * s)); }
    if (kind === 'club') { const cl = add(mk(G.cyl, M(0x5a3a22), .42 * s, .7 * s, .2 * s, .08 * s, 1 * s, .08 * s)); cl.rotation.x = .3; add(mk(G.sph, M(0xc89a4a, { r: .9 }), 0, 1.35 * s, -.15 * s, .42 * s, .35 * s, .2 * s)); }
    if (kind === 'sword') { add(mk(G.box, M(0xd8e0ea, { m: .95, r: .15 }), .38 * s, .7 * s, .2 * s, .05 * s, .9 * s, .02 * s)); add(mk(G.box, M(0xd8b030, { m: .9 }), .38 * s, 1.15 * s, .2 * s, .3 * s, .05 * s, .05 * s)); }
    if (kind === 'trident') { add(mk(G.cyl0, M(0xd8b040, { m: .9, r: .3 }), .42 * s, 1.1 * s, .1 * s, .035 * s, 2.3 * s, .035 * s)); for (const d of [-.12, 0, .12]) add(mk(G.cone, M(0xd8b040, { m: .9 }), (.42 + d) * s, 2.35 * s, .1 * s, .03 * s, .3 * s, .03 * s)); add(mk(G.cone, M(0xd8b040, { m: .9 }), 0, 2.05 * s, 0, .2 * s, .2 * s, .2 * s)); }
    if (kind === 'sky') { add(mk(G.sph, M(0x2a4a9a, { e: 0x1a2a6a, ei: 1, r: .3 }), 0, 2.6 * s, -.1 * s, .9 * s, .9 * s, .9 * s)); for (let i = 0; i < 6; i++) add(mk(G.sph0, M(0xffffff, { e: 0xffffff, ei: 2 }), Math.cos(i) * .7 * s, (2.6 + Math.sin(i * 2) * .5) * s, Math.sin(i) * .7 * s, .05 * s, .05 * s, .05 * s, false)); }
    if (kind === 'jar') add(mk(G.sph, M(0xb08a3a, { m: .8, r: .3 }), 0, .5 * s, 0, .55 * s, .6 * s, .55 * s));
  }
  function npcModel(d) {
    if (d.ani) { const [kind, col, sc] = d.ani, P = FOE.has(kind) ? FOE.make(kind, col, false) : C.CR().makeKind(kind, col, false); P.root.scale.setScalar(sc); P.arms = [new T.Group()]; if (!P.legs || P.legs.length < 2) P.legs = [new T.Group(), new T.Group()]; if (!P.head) P.head = new T.Group(); return P; }
    const P = C.makeVillager(d.v); if (d.extra) { if (d.extra === 'tail') P.tailCol = d.v.cloth; extra(P, d.extra, d.v.sc); } return P;
  }
  function piece(look, i) {
    const g = new T.Group();
    switch (look) {
      case 'lamp': g.add(mk(G.box, M(0x3a3a3e, { m: .5 }), 0, .45, 0, .32, .5, .32)); g.add(mk(G.sph0, M(0xffd890, { e: 0xffc060, ei: 2.4 }), 0, .45, 0, .2, .22, .2, false)); g.add(glow(0xffc060, 2.2, 0, .5, 0, .8)); break;
      case 'pearl': g.add(mk(G.sph, M(0xe0d8d0, { e: 0x6a6a7a, ei: 1, m: .4, r: .2 }), 0, .1, 0, .5, .2, .4)); g.add(mk(G.sph, M(0xffffff, { e: 0xd8e8ff, ei: 1.4, r: .1 }), 0, .3, 0, .2, .2, .2, false)); g.add(glow(0xd8f0ff, 1.8, 0, .35, 0, .8)); break;
      case 'gapple': g.add(mk(G.sph, M(0xffc830, { e: 0xa07010, ei: 1.4, m: .6, r: .25 }), 0, .32, 0, .28, .28, .28)); g.add(mk(G.cyl0, M(0x4a3a20), 0, .62, 0, .03, .12, .03, false)); g.add(glow(0xffd860, 2, 0, .35, 0, .8)); break;
      case 'ember': g.add(mk(G.sph, M(0xff6a20, { e: 0xff4010, ei: 2.6 }), 0, .3, 0, .22, .2, .22)); g.add(glow(0xff8a30, 2.4, 0, .4, 0, .9)); break;
      case 'mask': g.add(mk(G.sph, M([0xf0e8d8, 0xd8b040, 0xc8402a, 0x4a6ac8, 0xe8e8f0][i % 5], { r: .4 }), 0, .55, 0, .3, .36, .1)); g.add(mk(G.box, M(0x1a1410), 0, .62, .06, .25, .06, .04, false)); g.add(glow(0xffe08a, 2, 0, .55, 0, .7)); break;
      case 'market': { if (i % 4 === 0) { const P = FOE.make('reiter', 0x8a5a3a, false); P.root.scale.setScalar(.75); P.body.children.forEach((c, k) => { if (k > 10) c.visible = false; }); g.add(P.root); }
        else g.add(mk(i % 4 === 1 ? G.box : G.tor, M([0, 0x6a3a1a, 0x4a3a2a, 0x3a2a1a][i % 4], { r: .6 }), 0, .5, 0, .5, .3, .4)); g.add(glow(0xffe08a, 2.2, 0, .9, 0, .6)); break; }
      default: g.add(mk(G.oct, M(0xffe08a, { e: 0xffc040, ei: 2 }), 0, .5, 0, .25, .35, .25)); g.add(glow(0xffd860, 2, 0, .5, 0, .8));
    }
    return g;
  }
  function trigger(look, lit) {
    const g = new T.Group(), b = B(g), fire = new T.Group(); g.add(fire); let ring = null;
    switch (look) {
      case 'bell': b.box(-1, 0, 0, .2, 2.4, .2, 0x5a3a22); b.box(1, 0, 0, .2, 2.4, .2, 0x5a3a22); b.box(0, 2.3, 0, 2.3, .2, .25, 0x5a3a22);
        b.cone(0, .8, 0, .75, 1.4, 0xb08a3a, { mat: { m: .85, r: .3 } }); b.sph(0, 2.15, 0, .4, .28, .4, 0xb08a3a, { mat: { m: .85, r: .3 } }); break;
      case 'beacon': b.cyl(0, 0, 0, 1.3, 1.2, 0x8a8478, { mat: { r: 1 } }); for (let i = 0; i < 5; i++) { const l = b.cyl(Math.cos(i * 1.26) * .4, 1.3, Math.sin(i * 1.26) * .4, .12, 1, 0x5a3a1a, { lo: 1 }); l.rotation.z = .4 * Math.cos(i); }
        fire.add(mk(G.cone, M(0xff8a2a, { e: 0xff6a10, ei: 2.4 }), 0, 2.1, 0, .6, 1.4, .6, false)); fire.add(glow(0xffa040, 5, 0, 2.2, 0, .8)); break;
      case 'ore': b.ico(0, .5, 0, 1, .9, .9, 0x5a5560); for (let i = 0; i < 4; i++) b.oct(Math.cos(i * 1.6) * .5, .7 + (i % 2) * .3, Math.sin(i * 1.6) * .5, .15, .3, .15, 0xc8a0ff, { mat: { e: 0x8a5ad8, ei: lit ? 2.4 : .5 } });
        fire.add(glow(0xc8a0ff, 3, 0, 1, 0, .7)); break;
      case 'conch': b.cone(0, .2, 0, .5, 1.2, 0xf0d8c8, { mat: { r: .3, m: .2 } }).rotation.z = 1.2; b.sph(.3, .5, 0, .45, .4, .4, 0xf8e8d8, { mat: { r: .3 } }); fire.add(glow(0xa0f0ff, 3, 0, .8, 0, .6)); break;
      default: b.ico(0, 1, 0, .9, 1.5, .7, 0x7a7a82); ring = b.tor(0, 1.3, .62, .35, 0x8ad0ff, { mat: { e: 0x4aa0ff, ei: .2 }, rx: 0, d: .05 });
    }
    fire.visible = !!lit; if (ring) ring.material = M(lit ? 0x8affc0 : 0x6a7a8a, { e: lit ? 0x4adf8a : 0x1a2a3a, ei: lit ? 2 : .3 });
    return { g, fire, ring };
  }
  function findModel(look) {
    const g = new T.Group();
    if (look === 'goat') { const P = FOE.make('rothund', 0xf0ece0, false); P.root.scale.setScalar(.6); g.add(P.root); for (const sx of [-1, 1]) { const hn = mk(G.cone, M(0x8a7a5a), sx * .1, .85, .62, .04, .22, .04); hn.rotation.x = -.5; g.add(hn); } for (const lx of [-.14, .14]) for (const lz of [-.25, .3]) g.add(mk(G.sph0, M(0xe8c040, { m: .8 }), lx, .04, lz, .06, .06, .06, false)); }
    else if (look === 'kaa') { const P = C.CR().makeKind('schlange', 0xb0a040, false); P.root.scale.setScalar(2.2); g.add(P.root); }
    else if (look === 'crone') { const P = C.makeVillager({ cloth: 0x3a2a3a, cloth2: 0x2a2a2a, hair: 0xd0d0d0, hood: 1, sc: .9, wide: 1.1 }); g.add(P.root); g.add(mk(G.cyl, M(0x8a6a3a), .45, .75, .2, .3, .25, .3)); for (let i = 0; i < 4; i++) g.add(mk(G.sph, M(0xc8202a, { r: .3 }), .35 + (i % 2) * .2, .95, .1 + (i > 1 ? .2 : 0), .1, .1, .1)); }
    else if (look === 'lady') { const P = C.makeVillager({ cloth: 0xd8e8f8, cloth2: 0x8ab0d8, hair: 0x8a5a2a, hs: 2, sc: 1 }); g.add(P.root); g.add(glow(0xd8f0ff, 4, 0, 1.2, 0, .6)); }
    else { const P = C.makeVillager({ cloth: 0x3a5a8a, cloth2: 0xe8e0d0, hair: 0x6a4a2a, sc: .85 }); g.add(P.root); }
    g.add(glow(0xffe08a, 2.4, 0, 1.6, 0, .45)); return g;
  }

  /* ---------- Welt aufbauen ---------- */
  function build(n) {
    const w0 = W(n); R = w0.R || 58; CZ = w0.cz ?? -36; const AK = (R / 58) ** 2, w = w0, h = heightFn(w), S = C.S(), s = st(w.id), pools = w.pools || [];
    const blk = (x, z) => C.tooSteep(h, x, z) || Math.hypot(x - CX, z - CZ) > R + 6 || pools.some(([px, pz, r]) => Math.hypot(x - px, z - pz) < r - .4) || inRiver(w, x, z);
    const zone = (x, z) => { for (const q of w.zones) if (Math.hypot(x - q[3], z - q[4]) < q[5]) return q[0]; return 'wild'; };
    const zn = { wild: [w.name, w.sub] }; for (const q of w.zones) zn[q[0]] = [q[1], q[2]];
    const WD = { n, C: C.CHP[n], h, blocked: blk, zone, ims: [], edKeys: [], terr: null, story: true, mw: w, lv: Math.max(3, S.lvl - 1), grav: w.grav || 1,
      zn, path: PATHX, mbg: null, spawn: [0, 12], refresh, menuQuest, kill, zoneEnter() { }, ensureBoss() { }, sealedNow: () => false, spawnMini() { }, tick };
    C.setWLD(WD); cur = { w, h, g: null, items: [], ints: [], boss: null, guest: null, react: null, swing: null, wave: 0 };
    C.setAtmos(w.atm);
    // Boden: glatte Schattierung, Farbverlauf, Weg, Sand am Wasser, Schnee am Rand; feine Bodenstruktur als Textur
    const PS = 2 * R + 54, PN = Math.min(240, Math.round(PS * .8)), geo = new T.PlaneGeometry(PS, PS, PN, PN); geo.rotateX(-Math.PI / 2); geo.translate(CX, 0, CZ);
    const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new T.Color(), c1 = new T.Color(w.ground[0]), c2 = new T.Color(w.ground[1]), cp = new T.Color(w.path), cr = new T.Color(w.ridge), sn = new T.Color(0xf0f4f8), sand = new T.Color(0x8a7a5a);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = h(x, z); p.setY(i, y); const d = Math.hypot(x - CX, z - CZ), nz = Math.sin(x * .9) * Math.cos(z * .8) * .5 + Math.sin(x * .23 + z * .31) * .5;
      c.copy(c1).lerp(c2, .5 + nz * .5); const pd = Math.abs(x - PATHX(z)); if (z < 16 && z > -88 && pd < 2.6) c.lerp(cp, 1 - sm(1.6, 2.6, pd)); if (y < -.5) c.lerp(sand, Math.min(1, -y - .5)); c.lerp(cr, sm(R, R + 5, d)); if (w.snow) c.lerp(sn, Math.min(1, sm(R - 2, R + 4, d) * .9 + sm(3, 6, y) * .6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const terr = new T.Mesh(geo, C.TX.tri(GTEX[w.id] || 'grass', 0xffffff, { vc: 1, s: .22, gain: 2.1, n: .8 })); terr.receiveShadow = true; C.scene.add(terr); WD.terr = terr;
    for (const [px, pz, r, wc] of pools) { const wm = mk(new T.CircleGeometry(r + .6, 64), new T.MeshStandardMaterial({ color: wc, metalness: .6, roughness: .06, transparent: true, opacity: .82 }), px, -.4, pz, 1, 1, 1, false); wm.rotation.x = -Math.PI / 2; C.scene.add(wm); }
    if (w.river) { const rv = w.river, wm = mk(new T.PlaneGeometry(PS - 20, PS - 20, 1, 1), new T.MeshStandardMaterial({ color: rv.col, metalness: .5, roughness: .08, transparent: true, opacity: .82 }), CX, -.62, CZ, 1, 1, 1, false); wm.rotation.x = -Math.PI / 2; C.scene.add(wm); }
    // Wahrzeichen
    const g = new T.Group(); C.scene.add(g); cur.g = g; const b = B(g), keepSet = new Set(), A = anim(b, keepSet); LAND[w.land](b, w, A); cur.A = A;
    // Rand und Streuung
    const R2 = C.rng(9100 + n), list = [];
    for (let k = 0; k < 2; k++) { const rr = R + 3 + k * 4.5, N = Math.round(rr * 6.283 / (w.border.includes('house') ? 5.6 : 3.6)); for (let i = 0; i < N; i++) { const a = (i + k * .5) / N * 6.283, x = CX + Math.sin(a) * rr, z = CZ + Math.cos(a) * rr; if (Math.hypot(x, z - 15) < 9) continue; const kind = w.border[(i + k) % w.border.length]; list.push([x, z, kind, kind === 'rockbig' ? .7 + R2() * .5 : kind === 'house' ? .8 + R2() * .4 : 1.1 + R2() * .6, kind === 'house' ? -a : R2() * 6.3]); } }
    const busy = [...w.pads.map(([x, z, r]) => [x, z, r + 2]), [0, 10, 10], [-7, 15, 6], ...pools.map(([x, z, r]) => [x, z, r + 2]), ...w.zones.map(q => [q[3], q[4], 5])];
    for (const m of w.ms) { for (const q of (m.pts || [])) busy.push([q[0], q[1], 3]); if (m.at) busy.push([m.at[0], m.at[1], m.r || 5]); }
    for (const d of w.npcs) busy.push([d.x, d.z, 3]); for (const q of [...(w.chests || []), ...(w.pots || []), ...(w.lore || []), ...(w.portals || []), ...(w.vents || [])]) busy.push([q[0], q[1], 2.5]);
    for (const q of (w.swings || [])) busy.push([q[0], q[1], 3], [q[2], q[3], 3]); if (w.currents) for (const q of w.currents) busy.push([q[0], q[1], q[2]]); if (w.climb) busy.push([w.climb.cx, w.climb.cz, 8]);
    for (const [kind, cnt0] of w.decor) { const cnt = Math.round(cnt0 * Math.min(AK, 2.4)); let n2 = 0, tries = 0; while (n2 < cnt && tries++ < cnt * 30) { const a = R2() * 6.283, rr = Math.sqrt(R2()) * (R - 3), x = CX + Math.sin(a) * rr, z = CZ + Math.cos(a) * rr;
      if (Math.abs(x - PATHX(z)) < 4 && z < 16 && z > -88) continue; if (busy.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br + 1.5)) continue; if ((w.rects || []).some(([x0, x1, z0, z1]) => x > x0 - 2 && x < x1 + 2 && z > z0 - 2 && z < z1 + 2)) continue;
      if (blk(x, z) || (w.river && riverDist(w.river, x, z) < w.river.w * .5 + 1.5)) continue; if (list.some(q => DECOR[q[2]].col && Math.hypot(q[0] - x, q[1] - z) < 2.6)) continue;
      list.push([x, z, kind, .8 + R2() * .5, R2() * 6.3]); n2++; } }
    scatter(g, list, WD.ims, w.snow);
    C.mergeStatic(g, keepSet);
    // Figuren
    for (const d of w.npcs) { const P = npcModel(d); const o = C.addNpc('mw_' + d.id, d.name, d.x, d.z, P, () => talk(d), d.face, () => mark(d.id)); o.mwId = d.id; o.noRoute = 1; }
    // Gegner-Arten dieser Welt
    for (const k of ['a', 'b', 'c', 'x', 'y']) { const f = w.foes[k]; if (!f) continue; const key = 'mw' + n + k, hov = FOE.HOVER.has(f[0]) || C.CR().HOV.has(f[0]), boss = k === 'x' || k === 'y', base = boss ? C.ED.boss : hov ? C.ED.rift : C.ED.wolf;
      C.ED[key] = Object.assign({}, base, { name: f[1], col: f[2], make: () => FOE.has(f[0]) ? FOE.make(f[0], f[2], boss) : C.CR().makeKind(f[0], f[2], boss), sc: boss ? (f[0] === 'hydra' || f[0] === 'loewe' || f[0] === 'tiger' ? 1.55 : 1.45) : f[0] === 'riese' ? 1.15 : 1, base: hov ? 'rift' : 'wolf' },
        boss ? { boss: true, sub: f[3], p2t: f[4], minion: 'mw' + n + 'a', aggro: 30 } : {}); WD.edKeys.push(key); }
    // Gegner in der Wildnis (nicht am Ankunftsplatz, nicht in Dörfern)
    let ne = 0, tries = 0; const calm = w.zones.filter(q => ['lichtung', 'dorf', 'agora', 'hof', 'gaerten', 'parvis'].includes(q[0]));
    const NE = Math.round(10 * Math.min(AK, 3.2)); while (ne < NE && tries++ < 900) { const a = R2() * 6.283, rr = 14 + R2() * (R - 18), x = CX + Math.sin(a) * rr, z = CZ + Math.cos(a) * rr; if (z > -4 || blk(x, z) || !C.colFree(x, z, 1) || calm.some(q => Math.hypot(x - q[3], z - q[4]) < q[5])) continue; C.spawnEnemy('mw' + n + 'abc'[ne % 3], x, z); ne++; }
    // Nautilux geparkt am Ankunftsplatz (Reise wie mit dem Gumi-Schiff)
    { const sh = C.makeNaut(); sh.scale.setScalar(.85); sh.position.set(-7, h(-7, 15) + 1.6, 15); sh.rotation.y = .6; sh.visible = true; C.scene.add(sh); C.addCol(-7, 15, 2.4); const y0 = sh.position.y; C.animObjs.push({ fn(t) { sh.position.y = y0 + Math.sin(t * 1.3) * .18; } });
      C.INT.push({ x: -4.6, z: 12.4, name: 'Nautilux', pr: 'Weiterreisen', rad: 3.2, talk() { C.openTravel(); } }); }
    // Truhen, Krüge, Erzählersteine, Spiegel, Lianen, Strömungen
    (w.chests || []).forEach(([x, z], i) => { const o = { id: 'mw_' + w.id + '_c' + i, x, z, m: C.makeChest(), reward: i === 3 ? { shards: 140, potions: 1 } : { shards: 60 + i * 25, potions: i % 2 }, pr: 'Truhe öffnen' }; o.m.position.set(x, h(x, z), z); o.m.rotation.y = Math.atan2(-x, -z - 36); if (S.chests[o.id]) o.m.visible = false; C.scene.add(o.m); C.chests.push(o); C.addCol(x, z, .7); });
    (w.pots || []).forEach(([x, z]) => { const m = mk(G.sph, M(0xa86a3a, { r: .8 }), x, h(x, z) + .45, z, .42, .5, .42); m.add(mk(G.cyl, M(0x8a5a2a), 0, .55, 0, .5, .4, .5, false)); C.scene.add(m); C.addCol(x, z, .45);
      C.INT.push({ x, z: z + 1.2, name: 'Krug', pr: 'Zerschlagen', rad: 2, vis: () => m.visible, talk() { m.visible = false; C.sfx('hit'); C.emit(x, h(x, z) + .5, z, 0xa86a3a, 14, 3, .5, .3, 9); const S2 = C.S(), r = Math.random(); if (r < .15) { S2.potions++; C.toast('🧪 Heiltrank gefunden'); } else { const v = 6 + (r * 14 | 0); S2.shards += v; C.toast('💎 +' + v); } } }); });
    (w.lore || []).forEach(([x, z, txt]) => { b.ico(x, .6, z, .7, 1.2, .5, 0x8a8478, { solid: 1 }); const pl = mk(G.box, M(0xe8d8a8, { e: 0x6a5a30, ei: .6 }), x, h(x, z) + 1, z + .42, .7, .5, .04, false); C.scene.add(pl); C.INT.push({ x, z: z + 1.6, name: 'Erzählerstein', pr: 'Lesen', rad: 2.4, talk() { C.say([['Erzählerstein', txt]]); } }); });
    (w.portals || []).forEach(([x, z, nm], i, L) => { const pg = new T.Group(); pg.position.set(x, h(x, z), z); const fr = mk(G.tor, M(0xc8a24a, { m: .9, r: .25 }), 0, 1.7, 0, .95, .95, .5, false); fr.scale.y = 1.7; pg.add(fr); pg.add(mk(G.sph, M(0xd8e8ff, { m: 1, r: .04, e: 0x6a4aaa, ei: .8 }), 0, 1.7, 0, .85, 1.5, .04, false)); pg.add(mk(G.box, M(0x2a2232), 0, .1, 0, 1.4, .2, .5)); pg.add(glow(0xc8a0ff, 3.4, 0, 1.7, .2, .5)); C.scene.add(pg); C.addCol(x, z, .6);
      C.INT.push({ x, z: z + 1.5, name: nm, pr: 'Durch den Spiegel', rad: 2.4, talk() { const [tx, tz] = L[(i + 1) % L.length]; C.sfx('portal'); C.FX().pillar(C.pl.x, C.pl.y, C.pl.z, 0xc8a0ff, 1.1, 5, .8); C.pl.x = tx; C.pl.z = tz + 2.2; C.pl.y = h(C.pl.x, C.pl.z); C.snapCam(); C.FX().pillar(C.pl.x, C.pl.y, C.pl.z, 0xc8a0ff, 1.1, 5, .8); C.toast('🪞 ' + L[(i + 1) % L.length][2]); } }); });
    (w.swings || []).forEach(([ax, az, bx, bz, nm]) => { for (const [x0, z0, x1, z1] of [[ax, az, bx, bz], [bx, bz, ax, az]]) { const tx = (x0 + x1) / 2, tz = (z0 + z1) / 2, post = mk(G.cyl0, M(0x5a4430), x0, h(x0, z0) + 1.5, z0, .1, 3, .1); C.scene.add(post); C.addCol(x0, z0, .3);
      const vine = mk(G.cyl0, M(0x3a7a2a), (x0 + tx) / 2, h(tx, tz) + 7, (z0 + tz) / 2, .05, 9, .05, false); vine.rotation.x = Math.atan2(z0 - tz, 9) * .9; C.scene.add(vine);
      C.INT.push({ x: x0, z: z0 + (z1 > z0 ? -1.2 : 1.2), name: nm, pr: 'Schwingen', rad: 2.4, talk() { cur.swing = { x0: C.pl.x, z0: C.pl.z, x1, z1: z1 + (z1 > z0 ? 1.6 : -1.6), t: 0 }; C.sfx('jump'); } }); } });
    if (w.currents) cur.cur = w.currents.map(q => ({ x: q[0], z: q[1], r: q[2], dx: q[3], dz: q[4], id: q[5] }));
    if (w.climb) C.INT.push({ x: w.climb.cx + 1.2, z: w.climb.cz + 6, name: 'Glockenturm', pr: 'Ansehen', rad: 2.6, vis: () => C.pl.y < 1, talk() { C.say([['Zotik', 'Steinvorsprünge winden sich um den Turm nach oben. Sprung für Sprung – bis zur Glockenstube.']]); } });
    life(w);
    if (s.st === 1) arm(w, s);
    keyhole(w, s);
    WD.mbg = minimap(w); C.setMBG(WD.mbg);
    refresh();
    return WD;
  }

  /* ---------- Leben in der Szene ---------- */
  function life(w) {
    const L = w.life || [], add = o => { C.scene.add(o); return o; };
    L.filter(k => k === 'birds' || k === 'crows' || k === 'doves').forEach((k, ki) => { const col = k === 'crows' ? 0x14141c : k === 'doves' ? 0xf0f0f4 : 0x5a4a3a, fl = [];
      for (let i = 0; i < 7; i++) { const g = new T.Group(); g.add(mk(G.sph, M(col), 0, 0, 0, .18, .14, .3, false)); const wl = mk(G.sph, M(col), -.35, 0, 0, .34, .03, .14, false), wr = mk(G.sph, M(col), .35, 0, 0, .34, .03, .14, false); g.add(wl); g.add(wr); add(g); fl.push({ g, wl, wr, a: i * .9, r: 10 + i * 2.2, y: 14 + (i % 3) * 2, sp: .25 + (i % 4) * .05 }); }
      const cx = ki ? 18 : -10, cz = ki ? -60 : -30; C.animObjs.push({ fn(t) { for (const f of fl) { const a = f.a + t * f.sp; f.g.position.set(cx + Math.cos(a) * f.r, f.y + Math.sin(t + f.a) * .8, cz + Math.sin(a) * f.r); f.g.rotation.y = -a; const fp = Math.sin(t * 9 + f.a) * .7; f.wl.rotation.z = fp; f.wr.rotation.z = -fp; } } }); });
    if (L.includes('butterflies')) { const fl = []; for (let i = 0; i < 10; i++) { const g = new T.Group(), c = [0xffd04a, 0xff7ac8, 0x8ad0ff, 0xffffff][i % 4]; const a = mk(G.sph0, M(c, { e: c, ei: .5 }), -.12, 0, 0, .14, .02, .1, false), b2 = mk(G.sph0, M(c, { e: c, ei: .5 }), .12, 0, 0, .14, .02, .1, false); g.add(a); g.add(b2); add(g); fl.push({ g, a, b2, x: -30 + (i * 37 % 60), z: -10 - (i * 23 % 60), ph: i }); }
      C.animObjs.push({ fn(t) { for (const f of fl) { const x = f.x + Math.sin(t * .5 + f.ph) * 4, z = f.z + Math.cos(t * .4 + f.ph * 2) * 4; f.g.position.set(x, cur.h(x, z) + 1 + Math.sin(t * 2 + f.ph) * .4, z); const fp = Math.sin(t * 14 + f.ph) * 1.1; f.a.rotation.z = fp; f.b2.rotation.z = -fp; } } }); }
    if (L.includes('fireflies')) { const fl = []; for (let i = 0; i < 18; i++) { const s = add(glow(0xd8ff8a, .9, 0, 0, 0, .9)); fl.push({ s, x: -40 + (i * 29 % 80), z: -4 - (i * 31 % 76), ph: i }); }
      C.animObjs.push({ fn(t) { for (const f of fl) { const x = f.x + Math.sin(t * .3 + f.ph) * 3, z = f.z + Math.cos(t * .27 + f.ph) * 3; f.s.position.set(x, cur.h(x, z) + 1.2 + Math.sin(t + f.ph) * .6, z); f.s.material.opacity = .4 + Math.max(0, Math.sin(t * 2.2 + f.ph)) * .6; } } }); }
    if (L.includes('fish')) { const fl = []; for (let i = 0; i < 16; i++) { const c = [0xffa040, 0x8ad0ff, 0xffe060, 0xff6a8a][i % 4], g = new T.Group(); g.add(mk(G.sph, M(c, { e: c, ei: .5 }), 0, 0, 0, .14, .22, .4, false)); const tl = mk(G.cone, M(c), 0, 0, -.42, .02, .25, .15, false); tl.rotation.x = Math.PI / 2; g.add(tl); add(g); fl.push({ g, cx: -30 + (i * 37 % 60), cz: -10 - (i * 19 % 60), r: 3 + (i % 4), y: 2 + (i % 5) * 1.2, sp: .4 + (i % 3) * .2, ph: i }); }
      C.animObjs.push({ fn(t) { for (const f of fl) { const a = f.ph + t * f.sp; f.g.position.set(f.cx + Math.cos(a) * f.r, f.y + Math.sin(t + f.ph) * .3, f.cz + Math.sin(a) * f.r); f.g.rotation.y = -a; } } }); }
    if (L.includes('bubbles')) C.animObjs.push({ fn() { if (cur && Math.random() < .3) C.emit(C.pl.x + (Math.random() - .5) * 30, cur.h(C.pl.x, C.pl.z) + .2, C.pl.z + (Math.random() - .5) * 30, 0xc8f4ff, 1, .3, 3, .12, -1.5); } });
    if (L.includes('snow')) C.animObjs.push({ fn() { if (cur && Math.random() < .7) C.emit(C.pl.x + (Math.random() - .5) * 34, C.pl.y + 12, C.pl.z + (Math.random() - .5) * 34, 0xffffff, 1, .4, 6, .1, 1.2); } });
  }
  function minimap(w) {
    const c = document.createElement('canvas'); c.width = 260; c.height = 310; const x = c.getContext('2d');
    x.fillStyle = '#0a0e24'; x.fillRect(0, 0, 260, 310); x.fillStyle = hex(w.ground[0]); x.beginPath(); x.arc(CX + 130, CZ + 234, R, 0, 6.283); x.fill();
    if (w.river) { x.strokeStyle = hex(w.river.col); x.lineWidth = w.river.w; x.beginPath(); w.river.pts.forEach(([px, pz], i) => x[i ? 'lineTo' : 'moveTo'](px + 130, pz + 234)); x.stroke(); }
    x.strokeStyle = hex(w.path); x.lineWidth = 3; x.beginPath(); for (let z = 14; z > -86; z -= 2) x[z === 14 ? 'moveTo' : 'lineTo'](PATHX(z) + 130, z + 234); x.stroke();
    for (const [px, pz, r, wc] of (w.pools || [])) { x.fillStyle = hex(wc); x.beginPath(); x.arc(px + 130, pz + 234, r, 0, 6.283); x.fill(); }
    x.fillStyle = hex(w.col); for (const q of w.zones) x.fillRect(q[3] + 128, q[4] + 232, 4, 4); x.fillStyle = '#ffe08a'; x.fillRect(-7 + 128, 15 + 232, 4, 4); return c;
  }

  /* ---------- Ankunft: Titelkarte, Kameraflug, Gast ---------- */
  function titleCard(w) {
    if (!title) { title = document.createElement('div'); title.style.cssText = 'position:fixed;left:0;right:0;top:30%;text-align:center;pointer-events:none;z-index:8;opacity:0;transition:opacity .8s;font-family:Georgia,serif;text-shadow:0 2px 12px #000a'; document.body.appendChild(title); }
    title.innerHTML = `<div style="font-size:clamp(14px,2.4vw,20px);letter-spacing:.4em;color:#ffe8b0">${w.em} MÄRCHENWELT</div><div style="font-size:clamp(34px,7vw,72px);margin:.1em 0;background:linear-gradient(180deg,#fff,${hex(w.col)});-webkit-background-clip:text;background-clip:text;color:transparent">${w.name}</div><div style="font-size:clamp(13px,2vw,18px);color:#e8e0f0">${w.sub}</div>`;
    title.style.opacity = 1; setTimeout(() => { if (title) title.style.opacity = 0; }, 3400);
  }
  function arrive() {
    if (!cur) return; const w = cur.w, s = st(w.id), [kx, kz] = w.key;
    titleCard(w);
    C.setCam({ from: { p: [kx * .4, cur.h(kx, kz) + 34, kz * .4 + 10], l: [kx, cur.h(kx, kz) + 4, kz] }, to: 'player', d: 3.6 });
    if (!s.seen) { setTimeout(() => { if (cur && cur.w === w && !s.seen) { s.seen = 1; C.say(w.intro.concat(w.guest.join, [['Zotik', 'Die Nautilux wartet am Ankunftsplatz. Mit ihr reise ich weiter, wann immer ich will.']]), () => { addGuest(); C.saveGame(true); }); } }, 3800); }
    else addGuest();
  }
  function addGuest() {
    if (!cur || cur.guest || C.MP().on) return; const d = cur.w.guest, P = npcModel(d); C.PARTY[d.id] = { n: d.name, col: d.col, css: d.css, em: d.em, atk: d.atk, rng: d.rng, cd: d.cd, melee: d.melee };
    P.root.visible = true; C.scene.add(P.root); const a = { id: d.id, P, x: C.pl.x + 2, z: C.pl.z + 2.5, face: C.pl.face, t: 0, cd: 1, hc: 3, mv: 0, hp: 70 + C.S().lvl * 9, ko: false, kot: 0, skc: 0, taunt: 0, calm: 0, guest: 1 };
    C.CMP.push(a); cur.guest = a; C.toast('🤝 ' + d.name + ' kämpft an deiner Seite');
  }
  function leave() { if (cur && cur.guest) { const i = C.CMP.indexOf(cur.guest); if (i >= 0) C.CMP.splice(i, 1); C.scene.remove(cur.guest.P.root); } hideReact(); cur = null; }

  /* ---------- Aufträge ---------- */
  const mis = () => { if (!cur) return null; const s = st(cur.w.id); return s.done || s.m >= cur.w.ms.length ? null : cur.w.ms[s.m]; };
  const who = id => (cur.w.npcs.find(d => d.id === id) || {}).name || id;
  function mark(id) { const m = mis(), s = cur && st(cur.w.id); return !!m && m.g === id && s.st === 0; }
  function objText() {
    if (!cur) return ''; const w = cur.w, s = st(w.id), m = mis();
    if (s.done) return 'Welt versiegelt ✅ – mit der Nautilux geht es weiter.';
    if (!m) return 'Versiegle das Schlüsselloch am Wahrzeichen.';
    if (s.st === 0) return 'Sprich mit ' + who(m.g) + ' ❗';
    if (m.t === 'collect') return m.n + ': ' + Object.keys(s.got).length + ' / ' + m.pts.length + ' ' + m.item + '.';
    if (m.t === 'ring') return m.n + ': ' + Object.keys(s.got).length + ' / ' + m.pts.length + ' – ' + m.pts.filter((q, i) => !s.got[i]).map(q => q[2]).join(', ') + '.';
    if (m.t === 'defeat') return m.n + ': ' + s.c + ' / ' + m.cnt + ' besiegt' + (m.waves ? ' (Runde ' + (cur.wave + 1) + '/' + m.waves.length + ')' : '') + '.';
    if (m.t === 'find') return m.n + ': Suche ' + m.who + '.';
    return m.n + ': Besiege ' + w.foes[m.foe][1] + '.';
  }
  function refresh() { if (!cur) return; const s = st(cur.w.id), L = cur.w.ms.length; C.$('qt').textContent = cur.w.em + ' ' + cur.w.name + ' · ' + Math.min(s.done ? L : s.m, L) + '/' + L; C.$('qo').textContent = objText(); }
  function menuQuest() { if (!cur) return ''; const w = cur.w, s = st(w.id);
    return `<h3>${w.em} ${w.name}</h3><p style="color:var(--dim);font-size:13px">${w.sub} – Vorlage: ${w.src}.</p>` + w.ms.map((m, i) => `<div class="row"><span>${s.done || i < s.m ? '✅' : i === s.m ? '▶️' : '🔒'} ${m.n}</span><span><small>${i === s.m && !s.done ? objText() : ''}</small></span></div>`).join('') + `<div class="row"><span>${s.done ? '✅' : '🔒'} Schlüsselloch versiegeln</span><span></span></div>`; }
  // Gespräch mit Kamera auf beide Figuren (Seitenansicht)
  function shot(x, z) { const pl = C.pl, mx = (pl.x + x) / 2, mz = (pl.z + z) / 2, dx = x - pl.x, dz = z - pl.z, L = Math.hypot(dx, dz) || 1, nx = -dz / L, nz = dx / L, y = cur.h(mx, mz);
    C.setCam({ p: [mx + nx * 6, y + 2.3, mz + nz * 6], l: [mx, y + 1.3, mz], dlg: 1 }); pl.face = Math.atan2(dx, dz); }
  function sayAt(lines, x, z, cb, opts) { shot(x, z); if (lines.length) C.say(lines, cb, opts); }
  function talk(d) {
    const w = cur.w, s = st(w.id), m = mis();
    if (m && m.g === d.id && s.st === 0) return sayAt(m.a, d.x, d.z, () => startMission(m, s));
    if (m && m.g === d.id && s.st === 1) return sayAt([[d.name, 'Noch nicht geschafft? ' + objText()]], d.x, d.z);
    if (s.done && w.outro.some(l => l[0] === d.name)) return sayAt(w.outro.filter(l => l[0] === d.name).concat(d.idle), d.x, d.z);
    sayAt(d.idle, d.x, d.z);
  }
  function startMission(m, s) { s.st = 1; s.c = 0; s.got = {}; cur.wave = 0; arm(cur.w, s); C.sfx('quest'); C.banner('Auftrag', m.n); refresh(); C.saveGame(true);
    if (m.t === 'boss' && m.at) { C.setCam({ p: [m.at[0] + 7, cur.h(m.at[0], m.at[1]) + 5, m.at[1] + 9], l: [m.at[0], cur.h(m.at[0], m.at[1]) + 2, m.at[1]], d: 2.4, hold: 1 }); C.sfx('roar'); C.banner('⚔️ ' + cur.w.foes[m.foe][1], cur.w.foes[m.foe][3] || ''); } }
  function spawnWave(w, m, cnt) { for (let i = 0; i < cnt; i++) { const a = i / Math.max(1, cnt) * 6.283 + cur.wave, r = m.r * (.45 + (i % 2) * .4); let x = m.at[0] + Math.sin(a) * r, z = m.at[1] + Math.cos(a) * r;
      for (let k = 0; k < 10 && (C.W().blocked(x, z) || !C.colFree(x, z, .8)); k++) { x = m.at[0] + Math.sin(a + k) * r * (.9 - k * .08); z = m.at[1] + Math.cos(a + k) * r * (.9 - k * .08); }
      const e = C.spawnEnemy('mw' + w.n + m.foe, x, z); e.mw = 1; e.awake = true; e.st = 'chase'; C.FX().impact(x, cur.h(x, z) + 1, z, 0xc0a0ff, true); } }
  function arm(w, s) {
    const m = mis(); if (!m) return;
    if (m.t === 'collect') m.pts.forEach((q, i) => { if (s.got[i]) return; const o = piece(m.look, i); o.position.set(q[0], cur.h(q[0], q[1]), q[1]); C.scene.add(o); cur.items.push({ o, i, x: q[0], z: q[1] }); });
    if (m.t === 'ring') m.pts.forEach((q, i) => { const t = trigger(m.look, s.got[i]), y0 = m.top || cur.h(q[0], q[1]); t.g.position.set(q[0], y0, q[1]); C.scene.add(t.g); if (!m.top) C.addCol(q[0], q[1], m.look === 'beacon' ? 1.3 : m.look === 'bell' ? 1.1 : .8);
      const it = { x: q[0], z: q[1] + (m.top ? 0 : m.look === 'bell' || m.look === 'beacon' ? 2 : 1.6), name: q[2], get pr() { return s.got[i] ? '✔ erledigt' : m.look === 'bell' ? 'Glocke läuten' : m.look === 'beacon' ? 'Feuer entzünden' : m.look === 'ore' ? 'Freischlagen' : m.look === 'conch' ? 'Hineinblasen' : 'Berühren'; }, rad: m.top ? 2 : 2.6,
        vis: () => mis() === m && s.st === 1 && (!m.top || C.pl.y > m.top - 1.2), talk() { ringAt(m, s, i, t); } };
      C.INT.push(it); cur.ints.push(it); });
    if (m.t === 'defeat') { const left = m.cnt - s.c; if (m.waves) { let acc = 0; cur.wave = 0; for (let i = 0; i < m.waves.length; i++) if (s.c >= acc + m.waves[i]) { acc += m.waves[i]; cur.wave = i + 1; } spawnWave(w, m, Math.min(left, acc + m.waves[Math.min(cur.wave, m.waves.length - 1)] - s.c)); } else spawnWave(w, m, left); }
    if (m.t === 'boss') { const e = C.spawnEnemy('mw' + w.n + m.foe, m.at[0], m.at[1]); e.mw = 2; e.wake = m.at; e.face = 0; C.setBoss(e); cur.boss = e; cur.react = m.react ? { thr: [.6, .3], open: 0, t: 0, it: null } : null; }
    if (m.t === 'find') { const [x, z] = m.at, g = findModel(m.look); g.position.set(x, cur.h(x, z), z); C.scene.add(g); C.addCol(x, z, m.look === 'kaa' ? 1.4 : .6); cur.find = g;
      const it = { x, z: z + (m.look === 'kaa' ? 2.6 : 1.6), name: m.who, pr: 'Ansprechen', rad: 2.8, vis: () => mis() === m && s.st === 1, talk() { sayAt(m.f, x, z, () => { if (!m.stay) g.visible = false; done(); }); } }; C.INT.push(it); cur.ints.push(it); }
  }
  function ringAt(m, s, i, t) { if (s.got[i]) return; s.got[i] = 1; C.sfx(m.look === 'bell' ? 'bell' : m.look === 'beacon' ? 'fire' : m.look === 'ore' ? 'crit' : m.look === 'conch' ? 'portal' : 'light'); t.fire.visible = true; if (t.ring) t.ring.material = M(0x8affc0, { e: 0x4adf8a, ei: 2 });
    if (m.look === 'conch' && cur.cur) { const c = cur.cur.find(q => q.id === i); if (c) c.off = 1; if (cur.vort && cur.vort[i]) cur.vort[i].visible = false; }
    if (m.look === 'bell') C.shake(.25);
    C.FX().pillar(t.g.position.x, t.g.position.y, t.g.position.z, m.look === 'beacon' ? 0xffa040 : 0xffe8a0, 1, 6, 1.2); C.toast('✔ ' + m.pts[i][2]); refresh();
    if (Object.keys(s.got).length >= m.pts.length) done(); else C.saveGame(true); }
  function done() {
    const w = cur.w, s = st(w.id), m = mis(); if (!m) return; const S = C.S(), xp = 70 + S.lvl * 15, sh = 50 + s.m * 30;
    s.m++; s.st = 0; s.c = 0; s.got = {}; for (const it of cur.ints) it.vis = () => false; cur.ints = []; if (cur.react && cur.react.it) cur.react.it.vis = () => false; cur.react = null; hideReact();
    C.gainXp(xp); S.shards += sh; C.sfx('level'); C.banner('Auftrag erfüllt', m.n); C.toast(`✨ +${xp} EP · 💎 +${sh}`);
    const g = w.npcs.find(d => d.id === m.g); if (g) shot(g.x, g.z); C.say(m.d, () => { if (!mis()) keyhole(w, s); refresh(); });
    refresh(); C.saveGame(true);
  }
  function kill(e) {
    if (cur && e === cur.boss) { cur.boss = null; C.clearBoss(); if (cur.react && cur.react.it) cur.react.it.vis = () => false; cur.react = null; hideReact(); }
    const s = cur && st(cur.w.id), m = mis(); if (!m || s.st !== 1) return;
    if (m.t === 'defeat' && e.mw === 1) { s.c++; refresh(); if (s.c >= m.cnt) return done();
      if (m.waves && C.E().filter(q => !q.dead && q.mw === 1).length === 0) { cur.wave++; const n2 = Math.min(m.waves[Math.min(cur.wave, m.waves.length - 1)], m.cnt - s.c); C.banner('Runde ' + (cur.wave + 1), m.n); C.sfx('roar'); setTimeout(() => { if (cur && mis() === m) spawnWave(cur.w, m, n2); }, 1600); } }
    if (m.t === 'boss' && e.mw === 2) done();
  }
  // Reaktionsbefehl (wie bei Kingdom Hearts): Wenn der Boss taumelt, erscheint kurz eine gemeinsame Aktion mit dem Gast
  let rbtn = null;
  function showReact(t) { if (!rbtn) { rbtn = document.createElement('div'); rbtn.style.cssText = 'position:fixed;left:50%;bottom:22%;transform:translateX(-50%);padding:10px 22px;border-radius:14px;background:linear-gradient(180deg,#fff6d0,#e8b040);color:#3a2408;font:700 clamp(15px,2.6vw,22px) system-ui;box-shadow:0 0 24px #ffd06a;z-index:7;pointer-events:none'; document.body.appendChild(rbtn); }
    const k = C.keyHint ? C.keyHint(C.inMode && C.inMode() === 'pad' ? 'atk' : 'use') : ''; rbtn.textContent = '△ ' + t + ' – ' + (k ? k + ' ' : 'Aktion ') + (C.inMode && C.inMode() === 'touch' ? 'antippen!' : 'drücken!'); rbtn.hidden = false; }
  function hideReact() { if (rbtn) rbtn.hidden = true; }
  function tick(dt) {
    if (!cur) return; const s = st(cur.w.id), m = mis(), pl = C.pl;
    if (!cur.guest && !C.dlgOn() && s.seen) addGuest();
    for (let i = cur.items.length - 1; i >= 0; i--) { const it = cur.items[i]; it.o.rotation.y += dt * 1.6; it.o.position.y = cur.h(it.x, it.z) + Math.sin(C.time() * 2.6 + i) * .12;
      if (m && m.t === 'collect' && s.st === 1 && Math.hypot(pl.x - it.x, pl.z - it.z) < 1.8 && !pl.dead) { s.got[it.i] = 1; C.scene.remove(it.o); cur.items.splice(i, 1); C.sfx('pick'); C.emit(it.x, cur.h(it.x, it.z) + .6, it.z, 0xffe08a, 18, 3, .7, .5, -2);
        const got = Object.keys(s.got).length, nm = m.pts[it.i][2]; C.toast(`${cur.w.em} ${nm || m.item} (${got}/${m.pts.length})`); refresh(); if (got >= m.pts.length) done(); else C.saveGame(true); } }
    if (cur.swing) { const q = cur.swing; q.t += dt / 1.1; const k = Math.min(1, q.t), e = k * k * (3 - 2 * k); pl.x = q.x0 + (q.x1 - q.x0) * e; pl.z = q.z0 + (q.z1 - q.z0) * e; pl.y = cur.h(pl.x, pl.z) + Math.sin(k * Math.PI) * 6 + .2; pl.vy = 0; pl.air = true; pl.face = Math.atan2(q.x1 - q.x0, q.z1 - q.z0); if (k >= 1) { cur.swing = null; pl.vy = -2; } }
    if (cur.cur) for (const q of cur.cur) { if (q.off) continue; const d = Math.hypot(pl.x - q.x, pl.z - q.z); if (d < q.r) { const k = (1 - d / q.r) * 6.5 * dt, nx = pl.x + q.dx * k, nz = pl.z + q.dz * k; if (!C.W().blocked(nx, nz)) { pl.x = nx; pl.z = nz; } } }
    if (cur.w.vents && !pl.air) for (const [x, z] of cur.w.vents) if (Math.hypot(pl.x - x, pl.z - z) < 1.2) { pl.vy = 15; pl.air = true; C.sfx('jump'); C.emit(x, cur.h(x, z) + .3, z, 0xd8f8ff, 14, 2, 1, .2, -6); }
    const b = cur.boss, rc = cur.react;
    if (b && !b.dead && rc && b.awake) { if (!rc.open && rc.thr.length && b.hp / b.max < rc.thr[0]) { rc.thr.shift(); rc.open = 1; rc.t = 7; const mm = m;
        rc.it = { get x() { return b.x; }, get z() { return b.z; }, name: mm.react.t, pr: '△ ' + mm.react.t, rad: 6, vis: () => rc.open && !b.dead, talk() { react(b, mm); } }; C.INT.push(rc.it); showReact(mm.react.t); C.sfx('quest'); }
      if (rc.open) { rc.t -= dt; if (rc.t <= 0) { rc.open = 0; hideReact(); } } }
  }
  function react(b, m) { const rc = cur.react; if (!rc || !rc.open) return; rc.open = 0; hideReact(); const r = m.react, y = cur.h(b.x, b.z);
    C.sfx('crit'); C.sfx('roar'); C.shake(.7); C.FX().pillar(b.x, y, b.z, r.col, 1.8, 9, 1.2); C.FX().circle(b.x, y, b.z, r.col, 5, 1.2); C.emit(b.x, y + 1.5, b.z, r.col, 50, 7, 1, .6, 6);
    C.banner('△ ' + r.t, r.who + ': „' + r.line + '“'); const dmg = Math.round(b.max * .16) + C.S().lvl * 4; C.hurtE(b, dmg, 0, 0, true); C.toast('⚡ ' + r.who + ' & Zotik: ' + dmg + ' Schaden'); }

  function keyhole(w, s) {
    if (mis() || !cur || cur.key) return; const [x, z] = w.key, y = cur.h(x, z), g = new T.Group(); g.position.set(x, y, z);
    const lit = !s.done, mat = M(lit ? 0xfff0c0 : 0x8a8a9a, { e: lit ? 0xffd070 : 0x2a2a3a, ei: lit ? 2.4 : .4 });
    const k1 = mk(G.cyl, mat, 0, 2.6, 0, .32, .08, .32, false); k1.rotation.x = Math.PI / 2; g.add(k1); g.add(mk(G.cone, mat, 0, 2.05, 0, .26, .7, .06, false));
    if (lit) { g.add(glow(0xffe08a, 5, 0, 2.4, 0, .7)); C.animObjs.push({ fn(t) { g.rotation.y = Math.sin(t) * .25; } }); }
    g.position.z += 2.2; C.scene.add(g); cur.key = g;
    C.INT.push({ x, z: z + 3.6, name: 'Schlüsselloch', get pr() { return st(w.id).done ? '✔ Versiegelt' : 'Versiegeln'; }, rad: 3, talk() {
      if (st(w.id).done) return C.say([['Zotik', 'Das Schlüsselloch ist versiegelt. Diese Welt ist sicher.']]);
      C.sfx('portal'); C.FX().pillar(x, y, z + 2.2, 0xffe08a, 1.6, 12, 2.2); C.FX().circle(x, y, z + 2.2, 0xffd070, 4, 1.6);
      C.setCam({ p: [x + 5, y + 3.2, z + 8], l: [x, y + 2.4, z + 2.2], dlg: 1 });
      C.say([['Erzähler', 'Ein Lichtstrahl schießt aus Zotiks Klinge in das Schlüsselloch. Mit einem Klang wie von tausend Glocken schließt es sich.'], ['Zotik', 'Versiegelt. Das Herz dieser Welt ist sicher – kein Riss kommt hier mehr durch.']].concat(w.outro), () => {
        const S = C.S(), s2 = st(w.id); s2.done = 1; S.shards += 300; S.potions += 2; S.items.phoenix = (S.items.phoenix || 0) + 1; C.gainXp(250 + S.lvl * 20); C.sfx('level');
        const k = seals(); C.banner('Welt versiegelt', w.em + ' ' + w.name + ' · Siegel ' + k + '/' + WORLDS.length); C.toast('💎 +300 · 🧪 +2 · 🔥 Phönix-Trank');
        if (k >= WORLDS.length && !S.fl.mwAll) { S.fl.mwAll = 1; C.giveGear('w_maer'); C.say([['Erzähler', 'Alle sieben Märchenwelten sind versiegelt. Aus den Siegeln formt sich eine Klinge, in der jede Geschichte weiterklingt.'], ['Zotik', 'Die Erzählerklinge … Danke, ihr alle.']]); }
        mat.color.setHex(0x8a8a9a); mat.emissive.setHex(0x2a2a3a); refresh(); C.saveGame(true); });
    } });
  }

  /* ---------- Reise ---------- */
  function detourFor(from, to) { const w = WORLDS.find(q => q.link === from); if (!w || to !== from + 1 || C.MP().on || !unlocked(w)) return null; const s = st(w.id); return s.done || s.no ? null : w; }
  function decline(w) { st(w.id).no = 1; }
  function travelRows(curCh) {
    let h = `<h3>📖 Märchenwelten</h3><p style="color:var(--dim);font-size:13px">Abstecher mit der Nautilux – jede Welt liegt auf dem Weg zwischen zwei Kapiteln.</p>`;
    for (const w of WORLDS) { const s = st(w.id), ok = unlocked(w), lk = w.link === 1 ? 'Lunaris' : (C.CHP[w.link] || {}).name, nx = (C.CHP[w.link + 1] || {}).name;
      h += `<div class="row"><span>${s.done ? '✅' : ok ? w.em : '🔒'} ${w.name}<br><small style="color:var(--dim)">${ok ? w.sub + ' · ' + (s.done ? 'versiegelt' : (s.m || 0) + '/' + w.ms.length + ' Aufträge') : 'zwischen ' + lk + ' und ' + nx + ' – nach Kapitel ' + lk}</small></span><span>${curCh === w.n ? '<small>hier</small>' : ok && !C.MP().on ? `<button class="trv" data-n="${w.n}">Reisen</button>` : ''}</span></div>`; }
    return h;
  }
  const flyTheme = n => { const w = W(n); return w ? w.fly : null; };
  return { build, leave, arrive, open, unlocked, seals, st, W, WORLDS, get cur() { return cur; }, objText, done, detourFor, decline, travelRows, flyTheme, CX, CZ, R, FOE };
}
