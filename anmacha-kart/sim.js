'use strict';
/* Rennsimulation (ohne Grafik): Fahrphysik, Bots, Items, Runden. Läuft auf dem Host bzw. beim Solo-Spieler. */
const Sim = (() => {
  const VMAX = 36, ACC = 24, BRAKE = 50, GRIP = 9, DGRIP = 1.7, R = 1.15, PI2 = Math.PI * 2;
  // Items: boost3/banana3/rock3 = Dreierpack (je Tastendruck eins)
  const ITEMS = ['boost', 'boost3', 'banana', 'banana3', 'rock', 'rock3', 'mine', 'rocket', 'shield', 'flash', 'fog', 'bomb', 'bomb3'];
  // Battle: ball = Ballonjagd (3 Ballons), cap = Funkpokal erobern (halten), bomb = Bomben-Duell (Punkte)
  const BATTLE = { ball: { lim: 180 }, cap: { lim: 180, goal: 25 }, bomb: { lim: 150, goal: 5 } };
  // Tandem-Spezialitems: jedes Fahrerduo hat eins (nur aus Itemboxen, je nach vorderem Fahrer)
  const SPECIALS = ['giga', 'comet', 'heart', 'fire'];
  const wrap = a => { while (a > Math.PI) a -= PI2; while (a < -Math.PI) a += PI2; return a; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const oc = { c: -1, t: 0, e: 0 }, tmp = { i: 0, f: 0, d: 0 }, tp = { x: 0, z: 0, tx: 0, tz: 0 };
  // Kreuzende Strecken: Objekte auf der Brücke und darunter berühren sich nicht.
  const lv_ = { i: 0, f: 0, d: 0 };
  const lvl = (S, o) => { if (o.f != null && o.k != null) return S.tr.height(o.f); if (o.f != null && o._si == null) return S.tr.height(o.f); S.tr.nearest(o.x, o.z, o._si == null ? -1 : o._si, lv_); o._si = lv_.i; return S.tr.height(lv_.f); };
  const same = (S, a, b) => !S.tr.crossPt || Math.abs(lvl(S, a) - lvl(S, b)) < 4;
  const kartDef = i => (typeof KARTS !== 'undefined' && KARTS[i % KARTS.length]) || { mv: 1, ma: 1, mt: 1, mr: 0.55, md: 1, mw: 1 };

  function create(opt) {                                   // opt: {track, laps, racers:[{name,logo,char,kart,human,skill,assist}], items:bool}
    const ccV = [0.8, 0.9, 1, 1][opt.cc == null ? 2 : opt.cc] || 1, ccA = [0.86, 0.93, 1, 1][opt.cc == null ? 2 : opt.cc] || 1, tr = opt.track, N = tr.N, sw = Math.min(1.35, tr.W / 20), S = { tr, laps: opt.laps || 3, items: opt.items !== false, free: !!opt.free, battle: BATTLE[opt.battle] ? opt.battle : null, t: 0, state: 'grid', count: 3.2, karts: [], boxes: [], hazards: [], proj: [], pads: [], events: [], finishedHumans: 0, humans: 0 };
    if (S.battle) { S.lim = BATTLE[S.battle].lim; S.goal = BATTLE[S.battle].goal || 0; S.laps = 1e6; S.teams = !!opt.teams; if (S.teams && S.battle === 'bomb') S.goal *= 2; }
    const nR = opt.racers.length, slot = opt.racers.map((_, k) => k); if (opt.shuffle) for (let a = slot.length - 1; a > 0; a--) { const b = Math.floor(Math.random() * (a + 1)), t = slot[a]; slot[a] = slot[b]; slot[b] = t; }
    opt.racers.forEach((r, k) => {
      const sl = slot[k], row = sl >> 1, side = sl % 2 ? 1 : -1, f0 = S.battle ? (N * sl / nR) % N : N - (row * 2 + 2); tr.at(f0, side * (S.battle ? tr.half * 0.45 : 4.5 * sw), tp); const kd = kartDef(r.kart || 0);
      const kt = { k, name: r.name, logo: r.logo, char: r.char, kart: r.kart || 0, assist: r.assist || 0, human: !!r.human, skill: r.skill == null ? 1 : r.skill, color: r.color, mv: kd.mv * ccV, ma: kd.ma * ccA, mt: kd.mt, mr: kd.mr, md: kd.md, mw: kd.mw,
        x: tp.x, z: tp.z, th: Math.atan2(tp.tx, tp.tz), vx: 0, vz: 0, vf: 0, steer: 0, drift: 0, driftT: 0, boostT: 0, spinT: 0, spinDur: 0, inv: 0, shieldT: 0, blindT: 0, slowT: 0, item: null, itemN: 0, itemT: 0, co: r.co, sp: r.sp || null, sp2: r.sp2 || null, sw: false, swT: 0, swPrev: false, item2: null, item2N: 0, fireT: 0, fireAt: 0, rp: -(row * 2 + 2), prevF: f0, f: f0, d: side * 4.5, i: f0 | 0, lap: 0, lapStart: 0, lapTimes: [], finished: false, finT: 0, rank: sl + 1, auto: !r.human, off: (Math.random() - 0.5) * 8, rough: false, hitT: 0, pulse: 0, draftT: 0, draftCharge: 0, itemPrev: false, speedVar: 0.96 + Math.random() * 0.06, dTier: 0, bal: S.battle === 'ball' ? 3 : 0, pts: 0, hold: 0, out: false, capCd: 0 };
      if (S.battle) { kt.team = S.teams ? (r.team != null ? r.team : k % 2) : -1; kt.rp = 0; kt.prevF = f0; kt.lap = 1; if (kt.sp === 'comet') kt.sp = 'giga'; if (kt.sp2 === 'comet') kt.sp2 = 'giga'; }
      if (kt.human) S.humans++; S.karts.push(kt);
    });
    // Münzen: 8 Reihen à 3 auf wechselnden Spuren. Jede Münze gibt einen kleinen Schub und +0,5 % Spitze (max. 10).
    S.coins = []; if (S.items && !S.battle) for (let r = 0; r < 8; r++) { const lane = [-3.2, 3.2, 0, -5.4, 5.4, 0, 3.2, -3.2][r] * sw; for (let j = 0; j < 3; j++) { const f = (N * (r + 0.32) / 8 + j * 5) % N; tr.at(f, lane, tp); S.coins.push({ x: tp.x, z: tp.z, f, cd: 0 }); } }
    if (S.items) for (let s = 0, nb = S.battle ? 8 : 6; s < nb; s++) for (let o = -1; o <= 1; o++) { const f = N * (s + 0.5) / nb; tr.at(f, o * (S.battle ? tr.half * 0.55 : 5.5 * sw), tp); S.boxes.push({ x: tp.x, z: tp.z, cd: 0, f }); }
    // Boost-Linien in Kurvenausgängen und auf langen Geraden. Mehrere Spuren fördern Überholmanöver.
    [0.12, 0.24, 0.36, 0.49, 0.61, 0.74, 0.86, 0.95].forEach((fr, idx) => {
      const lane = (idx % 3 === 0 ? -4.2 : idx % 3 === 1 ? 4.2 : 0) * sw;
      tr.at(N * fr, lane, tp);
      S.pads.push({ x: tp.x, z: tp.z, f: N * fr, th: Math.atan2(tp.tx, tp.tz) });
    });
    // Fest platzierte Hindernisse: auf allen Strecken, mit freier Ausweichspur.
    // In Zeitfahren ohne Items bleibt die Ideallinie für Bestzeiten frei.
    if (S.items && !S.battle) for (let idx = 0; idx < 9; idx++) {
      const fr = (idx + 0.63) / 10;
      const lane = (idx % 2 ? 5.0 : -5.0) * sw;
      tr.at(N * fr, lane, tp);
      S.hazards.push({ kind: idx % 3 === 0 ? 'mine' : 'banana', x: tp.x, z: tp.z, t: 1e9, owner: -1, arm: -1, fixed: true });
    }
    // Eigenständige Streckenmechaniken: mehr Boosts und verschiedene Gefahrzonen,
    // mit freier Fahrspur und ohne zusätzliche Assets/Netzwerkabhängigkeiten.
    const mechanic = tr.def.mechanic;
    if (mechanic) {
      const patterns = {
        portal: { pads: [0.08,0.32,0.68,0.89], hazards: [0.26,0.58] },
        crystal: { pads: [0.14,0.43,0.78], hazards: [0.19,0.37,0.62,0.84] },
        safari: { pads: [0.18,0.46,0.72,0.91], hazards: [0.34,0.63] },
        ruins: { pads: [0.11,0.49,0.83], hazards: [0.22,0.35,0.53,0.69,0.87] },
        dragon: { pads: [0.09,0.29,0.55,0.81], hazards: [0.44,0.69] },
        shards: { pads: [0.05,0.27,0.48,0.76,0.93], hazards: [0.21,0.54,0.85] },
        island: { pads: [0.16,0.39,0.65,0.88], hazards: [0.3,0.74] }
      };
      const pattern = patterns[mechanic];
      if (pattern) {
        pattern.pads.forEach((fraction, i) => {
          const f = N * fraction; tr.at(f, (i % 2 ? 5 : -5) * sw, tp);
          S.pads.push({ x:tp.x, z:tp.z, f, th:Math.atan2(tp.tx,tp.tz) });
        });
        if (S.items) pattern.hazards.forEach((fraction, i) => {
          tr.at(N * fraction, (i % 2 ? 6 : -6) * sw, tp);
          S.hazards.push({ kind: i % 2 ? 'mine' : 'banana', x:tp.x, z:tp.z, t:1e9, owner:-1, arm:-1, fixed:true });
        });
      }
    }
    // Hostautoritative Streckeninteraktionen für alle Spieler gleichermaßen.
    S.portals = []; S.creatures = [];
    if (S.battle === 'cap') { tr.at(N * 0.5 / nR, 0, tp); S.obj = { x: tp.x, z: tp.z, f: N * 0.5 / nR, d: 0, holder: -1, cd: 0 }; }
    if (mechanic === 'portal' || mechanic === 'shards') {
      [[0.18,0.47], [0.57,0.81]].forEach(([from,to], idx) => {
        tr.at(N * from, 0, tp);
        S.portals.push({ x:tp.x, z:tp.z, from:N*from, to:N*to, id:idx });
      });
    }
    if (mechanic === 'safari' || mechanic === 'dragon' || mechanic === 'island') {
      [0.16,0.38,0.62,0.84].forEach((fraction, idx) => {
        tr.at(N * fraction, (idx % 2 ? 1 : -1) * 5.2, tp);
        S.creatures.push({ x:tp.x, z:tp.z, baseX:tp.x, baseZ:tp.z, seed:idx * 1.7, cd:0 });
      });
    }
    return S;
  }
  const emit = (S, e) => S.events.push(e);

  function rollItem(S, k) {
    if (S.battle === 'bomb') return Math.random() < 0.25 ? 'bomb3' : 'bomb';
    if (S.battle) { const sp = k.sw ? k.sp2 : k.sp; if (sp && Math.random() < 0.12) return sp; const w = [['boost', 1.2], ['banana', 2], ['banana3', 1], ['rock', 2], ['rock3', 1.1], ['mine', 1.2], ['rocket', 1.4], ['shield', 1.1], ['bomb', 0.8]]; let x = Math.random() * w.reduce((a, b) => a + b[1], 0); for (const [i, v] of w) { x -= v; if (x <= 0) return i; } return 'banana'; }
    const n = S.karts.length, r = n > 1 ? (k.rank - 1) / (n - 1) : 0.5, last = k.rank >= n - 1 && n > 3;
    const w = { bomb: 0, bomb3: 0, boost: 2 + 1.5 * r, boost3: 0.2 + 1.6 * r, banana: 3 - 2 * r, banana3: 1.4 - 0.9 * r, rock: 2, rock3: 0.4 + 0.9 * r, mine: 1.5 - r, rocket: 0.4 + 2.4 * r, shield: 1.2, flash: last ? 1.6 : 0, fog: 0.2 + 1.3 * r };
    const sp = k.sw ? k.sp2 : k.sp; if (sp && Math.random() < 0.08 + 0.12 * r) return sp;
    let tot = 0; ITEMS.forEach(i => { tot += w[i]; }); let x = Math.random() * tot;
    for (const i of ITEMS) { x -= w[i]; if (x <= 0) return i; } return 'boost';
  }
  // Treffer: dur = Dauer des Wegdrehens/Ausrutschens, keep = Resttempo
  // Battle-Teams: Mitspieler im eigenen Team treffen sich nicht
  const mate = (S, a, b) => !!(S.teams && a && b && a !== b && a.team === b.team);
  function teamScore(S, t) { let v = 0; S.karts.forEach(k => { if (k.team !== t) return; v += S.battle === 'ball' ? (k.out ? 0 : 100 + k.bal) : S.battle === 'cap' ? k.hold : k.pts; }); return v; }
  function hit(S, k, by, kind, dur, keep) {
    if (k.inv > 0 || k.out) return false;
    if (by >= 0 && mate(S, S.karts[by], k)) return false;
    if (k.shieldT > 0) { k.shieldT = 0; k.inv = 0.8; emit(S, { t: 'shieldHit', k: k.k }); return false; }
    k.coins = Math.max(0, (k.coins || 0) - 2); k.spinT = dur || 1.3; k.spinDur = k.spinT; k.inv = (dur || 1.3) + 1.1; k.vf *= keep == null ? 0.25 : keep; k.drift = 0; k.driftT = 0; k.boostT = 0; emit(S, { t: 'hit', k: k.k, by, kind: kind || 'hit' }); bHit(S, k, by); return true;
  }
  // Battle-Folgen eines Treffers: Ballon platzt, Punkt für den Werfer, Pokal fällt herunter
  function bHit(S, k, by) {
    if (!S.battle) return; const a = by >= 0 && by !== k.k ? S.karts[by] : null;
    if (S.battle === 'ball') { k.bal = Math.max(0, k.bal - 1); if (a && !a.out) a.pts++; emit(S, { t: 'pop', k: k.k, by, n: k.bal }); if (k.bal <= 0) bOut(S, k); }
    else if (S.battle === 'bomb') { if (a && !a.out) { a.pts++; emit(S, { t: 'score', k: a.k, n: a.pts }); } }
    else if (S.battle === 'cap' && S.obj.holder === k.k) bDrop(S, k);
  }
  function bOut(S, k) { k.out = true; k.finished = true; k.finT = S.t; k.vx = k.vz = k.vf = 0; k.item = k.item2 = null; if (k.human) S.finishedHumans++; emit(S, { t: 'out', k: k.k, x: k.x, z: k.z }); }
  function bDrop(S, k) { const o = S.obj; o.holder = -1; o.cd = 0.6; k.capCd = 1.4; S.tr.nearest(k.x - Math.sin(k.th) * 4, k.z - Math.cos(k.th) * 4, -1, tmp); S.tr.at(tmp.f, clamp(tmp.d, -S.tr.half + 3, S.tr.half - 3), tp); o.x = tp.x; o.z = tp.z; o.f = tmp.f; o.d = clamp(tmp.d, -S.tr.half + 3, S.tr.half - 3); emit(S, { t: 'drop', k: k.k, x: o.x, z: o.z }); }
  // Battle: nächster Gegner vor (dir > 0) bzw. hinter (dir < 0) dem Kart innerhalb von d Metern
  function bNear(S, k, d, dir) { const fx = Math.sin(k.th), fz = Math.cos(k.th); return S.karts.some(o => { if (o === k || o.out || mate(S, k, o)) return false; const dx = o.x - k.x, dz = o.z - k.z, f = dx * fx + dz * fz, l = Math.abs(dx * fz - dz * fx); return f * dir > 0 && Math.abs(f) < d && l < 9; }); }
  function useItem(S, k) {
    const it = k.item; if (!it || k.itemT > 0) return; const base = it.replace('3', ''), left = Math.max(0, k.itemN - 1); k.itemN = left; if (!left) k.item = null; emit(S, { t: 'use', k: k.k, item: base, left });
    const fx = Math.sin(k.th), fz = Math.cos(k.th);
    if (base === 'boost') k.boostT = Math.max(k.boostT, 2.0);
    else if (base === 'shield') k.shieldT = 7;
    else if (base === 'mine') S.hazards.push({ kind: 'mine', x: k.x + fx * (k.aim > 0 ? 16 : -3.8), z: k.z + fz * (k.aim > 0 ? 16 : -3.8), t: 40, owner: k.k, _si: k.i, arm: 1.2 });
    else if (base === 'banana') S.hazards.push({ kind: 'banana', x: k.x + fx * (k.aim > 0 ? 16 : -3.4), z: k.z + fz * (k.aim > 0 ? 16 : -3.4), t: 60, owner: k.k, _si: k.i, arm: 0.9 });
    else if (base === 'rock') S.proj.push({ kind: 'rock', x: k.x + fx * (k.aim < 0 ? -3.5 : 3), z: k.z + fz * (k.aim < 0 ? -3.5 : 3), th: k.th + (k.aim < 0 ? Math.PI : 0) + (Math.random() - 0.5) * 0.12, owner: k.k, _si: k.i, t: 5.5, spd: 50 + Math.max(0, k.vf) * 0.6, arm: 0.2, bounces: 0 });
    else if (base === 'bomb') S.proj.push({ kind: 'bomb', x: k.x + fx * (k.aim < 0 ? -3.5 : 3), z: k.z + fz * (k.aim < 0 ? -3.5 : 3), th: k.th + (k.aim < 0 ? Math.PI : 0), owner: k.k, _si: k.i, t: 2.2, spd: k.aim < 0 ? 9 : 30 + Math.max(0, k.vf) * 0.55, arm: 0.45, bounces: 0 });
    else if (base === 'rocket') {
      let tg = -1, best = 1e9; S.karts.forEach(o => { if (o === k || o.out || mate(S, k, o)) return; if (S.battle) { const dx = o.x - k.x, dz = o.z - k.z, d = Math.hypot(dx, dz); if (d < 140 && (dx * fx + dz * fz) / (d || 1) > 0.2 && d < best) { best = d; tg = o.k; } return; } const dr = o.rp - k.rp; if (dr > 0 && dr < 90 && dr < best) { best = dr; tg = o.k; } });
      S.proj.push({ kind: 'rocket', x: k.x + fx * 2.5, z: k.z + fz * 2.5, th: k.th, owner: k.k, _si: k.i, target: tg, t: 7, spd: 62, arm: 0.25 });
    } else if (base === 'flash') { const hitIds = []; S.karts.forEach(o => { if (o !== k && o.rp > k.rp && !o.finished && hit(S, o, k.k, 'flash', 1.7, 0.1)) hitIds.push(o.k); }); emit(S, { t: 'flash', k: k.k, ids: hitIds }); }
    else if (base === 'giga') S.proj.push({ kind: 'giga', x: k.x + fx * 3.5, z: k.z + fz * 3.5, th: k.th, owner: k.k, _si: k.i, t: 6.5, spd: 46 + Math.max(0, k.vf) * 0.5, arm: 0.3, bounces: 0 });
    else if (base === 'comet') { const ids = []; S.karts.filter(o => o !== k && !o.finished && o.rp > k.rp && o.rp - k.rp < 160).sort((a, b) => a.rp - b.rp).slice(0, 3).forEach(o => { if (hit(S, o, k.k, 'comet', 1.3, 0.3)) ids.push(o.k); }); emit(S, { t: 'comet', k: k.k, ids }); }
    else if (base === 'heart') { k.shieldT = 7; k.boostT = Math.max(k.boostT, 2.2); k.coins = Math.min(10, (k.coins || 0) + 3); }
    else if (base === 'fire') { k.boostT = Math.max(k.boostT, 3.5); k.fireT = 3.5; k.fireAt = 0; }
    else if (base === 'fog') { const ids = []; S.karts.forEach(o => { if (o !== k && o.rp > k.rp && !o.finished) { o.blindT = 4; ids.push(o.k); } }); emit(S, { t: 'fog', k: k.k, ids }); }
  }

  // Bot-Eingabe: der Mittellinie folgen, vor Kurven bremsen, Items einsetzen
  function botInput(S, k) {
    const tr = S.tr, N = tr.N, la = 7 + Math.min(10, Math.abs(k.vf) * 0.28), f = k.f + la; let off = k.off;
    // Battle: seitlich auf das Ziel (Pokal, Pokalträger, nächster Gegner) zuhalten
    if (S.battle && (k.bT == null || (k.bT -= S.dt || 0.016) <= 0)) { k.bT = 0.4; k.tgD = null; k.tg = null; if (S.battle) { const o = S.obj; let tg = null; if (o && o.holder !== k.k && !(o.holder >= 0 && mate(S, k, S.karts[o.holder]))) tg = o.holder >= 0 ? S.karts[o.holder] : o; if (!tg) { let bd = 1e9; S.karts.forEach(q => { if (q === k || q.out || mate(S, k, q)) return; let df = q.f - k.f; if (df < 0) df += N; if (df < bd) { bd = df; tg = q; } }); } if (tg) { if (tg.d == null) { tr.nearest(tg.x, tg.z, -1, tmp); tg.d = tmp.d; } let df = (tg.f == null ? 0 : tg.f) - k.f; if (df < 0) df += N; if (df < 70) { k.tgD = tg.d; k.tg = tg; } } } }
    if (S.battle && k.tgD != null) off = k.tgD;
    tr.at(f, clamp(off, -tr.half + 4, tr.half - 4), tp);
    if (k.tg) { const dx = k.tg.x - k.x, dz = k.tg.z - k.z, dd = Math.hypot(dx, dz); if (dd < 30 && (dx * Math.sin(k.th) + dz * Math.cos(k.th)) > dd * 0.35) { tp.x = k.tg.x; tp.z = k.tg.z; } }
    const want = Math.atan2(tp.x - k.x, tp.z - k.z), diff = wrap(want - k.th); let kmax = 0; const i0 = k.i | 0;
    for (let a = 0; a < 16; a++) { const kk = tr.K[(i0 + 2 + a * 2) % N]; if (kk > kmax) kmax = kk; }
    const skillCap = [0.8, 0.9, 0.99][k.skill] * k.speedVar * (k.blindT > 0 ? 0.86 : 1) * (k.slowT > 0 ? 0.7 : 1), vt = Math.min(VMAX * k.mv * skillCap, kmax > 0 ? Math.sqrt(30 / kmax * k.mt) : 99);
    const inp = { s: clamp(-diff * 2.6, -1, 1), b: k.vf > vt + 4 ? 1 : 0, d: false, i: false, gas: k.vf < vt ? 1 : 0.3, cap: skillCap };
    if (k.item && k.itemT <= 0 && Math.random() < dtP(S, 0.9)) {
      const b = k.item.replace('3', ''), ahead = d => S.battle ? bNear(S, k, d, 1) : S.karts.some(o => o !== k && o.rp - k.rp > 0 && o.rp - k.rp < d), behind = d => S.battle ? bNear(S, k, d, -1) : S.karts.some(o => o !== k && k.rp - o.rp > 0 && k.rp - o.rp < d);
      if (b === 'boost') inp.i = kmax < 0.012; else if (b === 'shield' || b === 'flash' || b === 'fog') inp.i = true;
      else if (b === 'heart' || b === 'fire') inp.i = true; else if (b === 'giga') inp.i = ahead(50); else if (b === 'comet') inp.i = ahead(120);
      else if (b === 'rocket') inp.i = ahead(S.battle ? 90 : 45); else if (b === 'bomb') inp.i = ahead(42) || behind(10); else if (b === 'rock') inp.i = ahead(38); else if (b === 'mine' || b === 'banana') inp.i = behind(26);
    }
    if (!k.item && k.item2 && Math.random() < dtP(S, 1.5)) inp.sw = 1;
    if (S.battle && k.item && k.itemT <= 0 && !inp.i && Math.random() < dtP(S, 0.22)) inp.i = true;   // Battle: Items nicht ewig horten
    return inp;
  }
  const dtP = (S, rate) => rate * (S.dt || 0.016);

  function stepKart(S, k, inp, dt) {
    const tr = S.tr, N = tr.N; if (k.out) return; k.capCd = Math.max(0, k.capCd - dt);
    k.pulse = Math.max(0, k.pulse - dt); k.hitT = Math.max(0, k.hitT - dt); k.blindT = Math.max(0, k.blindT - dt); k.slowT = Math.max(0, k.slowT - dt);
    if (k.itemT > 0) k.itemT -= dt;
    // Tandem: Fahrer und Beifahrer tauschen – das Item des Beifahrers kommt nach vorn
    k.swT = Math.max(0, k.swT - dt); if (k.co != null && inp.sw && !k.swPrev && k.swT <= 0 && k.spinT <= 0 && !k.finished) { const a = k.item, an = k.itemN; k.item = k.item2; k.itemN = k.item2N; k.item2 = a; k.item2N = an; k.sw = !k.sw; k.swT = 0.5; emit(S, { t: 'swap', k: k.k }); } k.swPrev = !!inp.sw;
    if (k.fireT > 0) { k.fireT -= dt; k.fireAt -= dt; if (k.fireAt <= 0) { k.fireAt = 0.22; S.hazards.push({ kind: 'fire', x: k.x - Math.sin(k.th) * 3, z: k.z - Math.cos(k.th) * 3, t: 4, owner: k.k, _si: k.i, arm: 0.6 }); } }
    k.inv = Math.max(0, k.inv - dt); k.shieldT = Math.max(0, k.shieldT - dt); k.boostT = Math.max(0, k.boostT - dt);
    if (S.state === 'grid') { if (k.human) { if (inp.g && k.gs == null) k.gs = S.count; else if (!inp.g) k.gs = null; k.gd = !!inp.d; } inp = { s: 0, b: 0, d: false, i: false, gas: 0, g: 0 }; }
    if (k.spinT > 0) { k.spinT -= dt; inp = { s: 0, b: 0, d: false, i: false, gas: 0 }; k.th += dt * 11; }
    const boost = k.boostT > 0, capBase = (k.human || k.finished ? VMAX * k.mv : VMAX * k.mv * (inp.cap || 1)), cap = capBase * (1 + 0.005 * (k.coins || 0)) * (boost ? 1.42 : 1) * (k.onCut && !boost ? 0.84 : 1) * (k.rough ? k.mr : 1);
    // Windschatten: dicht hinter einem schnell fahrenden Rivalen liegt eine echte Überholchance.
    let drafting = false;
    if (!k.finished && S.state === 'race' && !k.rough && k.spinT <= 0 && k.vf > VMAX * 0.38) {
      for (const other of S.karts) {
        if (other === k || other.finished || other.vf < VMAX * 0.38 || !same(S, k, other)) continue;
        const dx = other.x - k.x, dz = other.z - k.z;
        const forward = dx * Math.sin(k.th) + dz * Math.cos(k.th);
        const sideways = Math.abs(dx * Math.cos(k.th) - dz * Math.sin(k.th));
        if (forward > 2.4 && forward < 19 && sideways < 3.9) { drafting = true; break; }
      }
    }
    k.draftCharge = clamp(k.draftCharge + dt * (drafting ? 1.3 : -1.7), 0, 1.1);
    if (k.draftCharge >= 1.1 && k.draftT <= 0) { k.draftCharge = 0; k.draftT = 1.7; emit(S, { t: 'miniturbo', k: k.k, tier: 1 }); }
    k.draftT = Math.max(0, k.draftT - dt);
    const fx = Math.sin(k.th), fz = Math.cos(k.th), rx = -Math.cos(k.th), rz = Math.sin(k.th);
    let vf = k.vx * fx + k.vz * fz, vl = k.vx * rx + k.vz * rz;
    const gas = k.human ? (inp.g ? 1 : 0) : (inp.gas == null ? 1 : inp.gas);
    if (inp.b > 0.1) vf -= (vf > 0 ? BRAKE : 14) * dt * inp.b; else if (gas > 0.05) { if (vf < cap) vf += ACC * k.ma * (boost ? 2.5 : k.draftT > 0 ? 1.65 : drafting ? 1.17 : 1) * gas * Math.max(0.22, 1 - Math.max(0, vf) / cap) * dt * (vf < 0 ? 3 : 1); } else vf = vf > 0 ? Math.max(0, vf - 6 * dt) : Math.min(0, vf + 6 * dt);
    if (vf > cap) vf -= (boost ? 18 : 28) * dt; vf = clamp(vf, -9, 62);
    if (k.draftT > 0 && !boost && vf > 0) vf = Math.min(cap * 1.14, vf + 7 * dt);
    const steer = clamp(inp.s, -1, 1), sp = Math.abs(vf) / VMAX;
    if (inp.d && !k.drift && Math.abs(steer) > 0.3 && vf > VMAX * 0.5 && !k.rough) { k.drift = steer > 0 ? -1 : 1; k.driftT = 0; }
    if (k.drift) {
      k.driftT += dt * (0.75 + 0.35 * Math.abs(steer)) * k.md; k.dTier = k.driftT > 3.2 ? 3 : k.driftT > 1.9 ? 2 : k.driftT > 0.9 ? 1 : 0;
      if (!inp.d || vf < VMAX * 0.35) { if (k.dTier) { k.boostT = Math.max(k.boostT, [0, 1.1, 1.9, 2.7][k.dTier]); emit(S, { t: 'miniturbo', k: k.k, tier: k.dTier }); } k.drift = 0; k.driftT = 0; k.dTier = 0; }
    }
    let om;   // k.drift = +1: Linksdrift (th steigt), -1: Rechtsdrift; Gegenlenken weitet, Reinlenken verengt
    if (k.drift) om = k.drift * (1.0 - 0.55 * (steer * k.drift)) * (0.9 + 0.1 * k.mt); else om = -steer * (2.05 - 0.85 * clamp(sp, 0, 1)) * k.mt * clamp(Math.abs(vf) / 9, 0, 1) * (vf < 0 ? -1 : 1);
    if (k.spinT <= 0) k.th += om * dt;
    k.steer += (steer - k.steer) * Math.min(1, dt * 10);
    vl *= Math.exp(-(k.drift ? DGRIP : GRIP) * dt);
    const nfx = Math.sin(k.th), nfz = Math.cos(k.th), nrx = -Math.cos(k.th), nrz = Math.sin(k.th);
    k.vx = nfx * vf + nrx * vl; k.vz = nfz * vf + nrz * vl; k.vf = vf;
    k.x += k.vx * dt; k.z += k.vz * dt;
    tr.nearest(k.x, k.z, k.lapInit && k.cut == null ? k.i : -1, tmp); k.lapInit = true;
    // Abkürzung: Fortschritt entlang des Wegs, eigene Ränder, Lücke in der Bande
    let onC = false; if (tr.cuts.length) { tr.onCut(k.x, k.z, oc); if (oc.c >= 0 && (k.cut === oc.c || Math.abs(tmp.d) > tr.half + 0.5) && oc.t > 0.01 && oc.t < 0.99) {
      const c = tr.cuts[oc.c]; onC = true; k.cut = oc.c; tmp.f = c.a + (c.b - c.a) * oc.t; tmp.i = Math.floor(tmp.f) % N; tmp.d = 0;
      const lim = c.w / 2; if (Math.abs(oc.e) > lim && oc.t > 0.12 && oc.t < 0.88) { const sg = oc.e > 0 ? 1 : -1, nx = c.uz, nz = -c.ux, over = Math.abs(oc.e) - lim; k.x -= nx * sg * over; k.z -= nz * sg * over; const vn = (k.vx * nx + k.vz * nz) * sg; if (vn > 0) { k.vx -= nx * sg * vn * 1.35; k.vz -= nz * sg * vn * 1.35; k.vf *= 0.93; if (vn > 5 && k.hitT <= 0) { emit(S, { t: 'wall', k: k.k, v: vn }); k.hitT = 0.4; } } } } }
    if (!onC && k.cut != null) { k.cut = null; tr.nearest(k.x, k.z, -1, tmp); }
    k.i = tmp.i; k.f = tmp.f; k.d = tmp.d; k.onCut = onC;
    const ad = onC ? 0 : Math.abs(tmp.d); k.rough = ad > tr.roughD; k.wall = false;
    // Rampen: Sprung mit Trick-Turbo bei der Landung
    if (k.airT > 0) { k.airT -= dt; if (k.airT <= 0) { k.airT = 0; k.boostT = Math.max(k.boostT, 0.75); emit(S, { t: 'trick', k: k.k }); } }
    else if (!onC && k.vf > 12 && Math.abs(k.d) < tr.half && tr.ramps.some(r => { let a = k.prevF - r, b = k.f - r; if (a > N / 2) a -= N; else if (a < -N / 2) a += N; if (b > N / 2) b -= N; else if (b < -N / 2) b += N; return a < 0 && b >= 0; })) { k.airT = k.airMax = clamp(0.5 + k.vf / 60, 0.6, 1.1); emit(S, { t: 'jump', k: k.k }); }
    if (ad > tr.wallD) {
      const sg = tmp.d > 0 ? 1 : -1, nx = tr.Nm[tmp.i * 2], nz = tr.Nm[tmp.i * 2 + 1], over = ad - tr.wallD; k.x -= nx * sg * over; k.z -= nz * sg * over;
      const vn = (k.vx * nx + k.vz * nz) * sg; if (vn > 0) { k.vx -= nx * sg * vn * 1.35; k.vz -= nz * sg * vn * 1.35; if (vn > 5 && k.hitT <= 0) { emit(S, { t: 'wall', k: k.k, v: vn }); k.hitT = 0.4; } k.vf *= 0.93; }
      k.d = sg * tr.wallD;
    }
    let dl = k.f - k.prevF; if (dl > N / 2) dl -= N; else if (dl < -N / 2) dl += N; k.rp += dl; k.prevF = k.f;
    const lapNow = S.battle ? k.lap : Math.floor(k.rp / N) + 1;
    if (lapNow > k.lap && k.rp >= 0) { if (k.lap >= 1) { const lt = S.t - k.lapStart; k.lapTimes.push(lt); emit(S, { t: 'lap', k: k.k, lap: k.lap, time: lt }); } k.lap = lapNow; k.lapStart = S.t; }
    if (!S.battle && !k.finished && k.rp >= S.laps * N) { k.finished = true; k.finT = S.t; k.auto = true; if (k.human) S.finishedHumans++; emit(S, { t: 'finish', k: k.k, time: S.t }); }
    if (S.state === 'race') {
      if (S.items) S.boxes.forEach(b => { if (b.cd > 0) return; if ((b.x - k.x) ** 2 + (b.z - k.z) ** 2 < 12 && same(S, b, k) && (!k.item || (k.co != null && !k.item2)) && !k.itemPending && k.itemT <= 0 && !k.finished) { b.cd = 3.5; k.itemT = 0.9; k.itemPending = true; emit(S, { t: 'box', k: k.k }); } });
      S.coins.forEach(c => { if (c.cd > 0 || k.finished) return; if ((c.x - k.x) ** 2 + (c.z - k.z) ** 2 < 6.5 && same(S, c, k)) { c.cd = 9; k.coins = Math.min(10, (k.coins || 0) + 1); k.boostT = Math.max(k.boostT, 0.22); emit(S, { t: 'coin', k: k.k, x: c.x, z: c.z }); } });
      S.pads.forEach(p => {
        if ((p.x - k.x) ** 2 + (p.z - k.z) ** 2 >= 20 || k.boostT >= 1.1) return;
        const mechanic = S.tr.def.mechanic;
        // Jede Welt bekommt ihre eigene Arcade-Wirkung ohne fremde Spielassets.
        const duration = mechanic === 'dragon' ? 2.25 : mechanic === 'shards' ? 1.85 :
          mechanic === 'portal' ? 1.65 : mechanic === 'crystal' ? 1.55 : 1.2;
        k.boostT = duration;
        if (mechanic === 'crystal') k.shieldT = Math.max(k.shieldT, 2);
        if (mechanic === 'island') { k.slowT = 0; k.blindT = 0; }
        if (mechanic === 'safari') k.draftCharge = Math.min(1.05, k.draftCharge + 0.35);
        if (mechanic === 'ruins') k.inv = Math.max(k.inv, 0.65);
        if (mechanic === 'portal') k.vf = Math.max(k.vf, VMAX * 0.9);
        emit(S, { t: 'pad', k: k.k, mechanic });
      });
      if (k.itemPending && k.itemT <= 0) { k.itemPending = false; const it = rollItem(S, k), n = it.endsWith('3') ? 3 : 1; if (!k.item) { k.item = it; k.itemN = n; } else { k.item2 = it; k.item2N = n; } emit(S, { t: 'got', k: k.k, item: it, back: k.item !== it }); }
    }
    if ((inp.itemPress || (inp.i && !k.itemPrev)) && S.state === 'race' && !k.finished) { k.aim = inp.aim || 0; useItem(S, k); } k.itemPrev = !!inp.i;
  }

  function step(S, dt, inputs) {
    S.dt = dt; S.t += dt; S.events.length = 0;
    if (S.state === 'grid') { S.count -= dt; if (S.count <= 0) { S.state = 'race'; S.t = 0; S.karts.forEach(k => { k.lapStart = 0; const gs = k.human ? k.gs : (Math.random() < [0.2, 0.4, 0.65][k.skill || 0] ? 1.5 : null); if (gs == null) return; const dd = k.human ? k.gd : Math.random() < 0.3; if (gs >= 1.2 && gs <= 2.05 && dd && k.co != null) { k.boostT = 2.2; k.vf = VMAX * 0.62; emit(S, { t: 'rocket', k: k.k, tier: 3 }); } else if (gs >= 1.2 && gs <= 2.05) { k.boostT = 1.4; k.vf = VMAX * 0.5; emit(S, { t: 'rocket', k: k.k, tier: 2 }); } else if (gs >= 0.25 && gs < 1.2) { k.boostT = 0.6; emit(S, { t: 'rocket', k: k.k, tier: 1 }); } else if (gs > 2.4 && k.human) { k.spinT = 0.8; k.spinDur = 0.8; emit(S, { t: 'stall', k: k.k }); } }); emit(S, { t: 'go' }); } }
    const order = S.karts.slice().sort(S.battle ? bCmp(S) : (a, b) => (a.finished && b.finished) ? a.finT - b.finT : a.finished ? -1 : b.finished ? 1 : b.rp - a.rp); order.forEach((k, i) => k.rank = i + 1); S.order = order;
    S.karts.forEach((k, i) => {
      if (k.out) return; let inp = k.auto ? botInput(S, k) : (inputs && inputs[i]) || { s: 0, g: 0, b: 0, d: false, i: false };
      if (!k.auto && k.assist > 0 && !k.drift && S.state === 'race' && k.spinT <= 0 && !k.finished) { const bs = botInput(S, k).s; inp = Object.assign({}, inp, { s: clamp((inp.s || 0) + k.assist * bs * (1 - Math.min(1, Math.abs(inp.s || 0) * 1.3)), -1, 1) }); }
      if (k.auto && S.state === 'race' && !k.finished && !S.battle) rubber(S, k, inp); stepKart(S, k, inp, dt);
    });
    // Arcade-Rammen: Kartgrößen trennen, Impulse gezielt gegen den Getroffenen geben.
    // Erhält Vorwärtsenergie des Angreifers und erlaubt Überholen statt klebrigem Abbremsen.
    for (let a = 0; a < S.karts.length; a++) for (let b = a + 1; b < S.karts.length; b++) {
      const p = S.karts[a], q = S.karts[b];
      let dx = q.x - p.x, dz = q.z - p.z, d2 = dx * dx + dz * dz;
      if (d2 >= (2 * R) ** 2 || p.out || q.out || !same(S, p, q)) continue;
      if (d2 < 1e-8) { dx = Math.sin(p.th) || 1; dz = Math.cos(p.th); d2 = dx * dx + dz * dz; }
      const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, total = p.mw + q.mw;
      const fp = q.mw / total, fq = p.mw / total;
      const overlap = Math.min(2 * R - d, 2 * R);
      p.x -= nx * overlap * fp; p.z -= nz * overlap * fp;
      q.x += nx * overlap * fq; q.z += nz * overlap * fq;
      const incomingP = p.vx * nx + p.vz * nz, incomingQ = q.vx * nx + q.vz * nz;
      const closing = incomingP - incomingQ;
      if (closing <= 0.4) continue;
      const shove = clamp(closing * 0.9 + 1.5, 1.5, 19);
      p.vx -= nx * shove * fp * 0.55; p.vz -= nz * shove * fp * 0.55;
      q.vx += nx * shove * fq; q.vz += nz * shove * fq;
      // Lenkstöße werden als kurzer seitlicher Versatz sichtbar, ohne komplette Drehorgie.
      const strongerP = incomingP > Math.max(3, incomingQ + 2);
      const attacker = strongerP ? p : q, victim = strongerP ? q : p;
      if (closing > 3.2 && attacker.hitT <= 0 && victim.hitT <= 0) {
        const impact = clamp(closing, 0, 24);
        attacker.hitT = victim.hitT = 0.34;
        victim.vf = Math.max(4, victim.vf * (1 - 0.10 * (impact / 10)));
        victim.vx += (victim === q ? nx : -nx) * impact * 0.42;
        victim.vz += (victim === q ? nz : -nz) * impact * 0.42;
        attacker.vf = Math.max(0, attacker.vf * 0.96);
        emit(S, { t: 'bump', k: attacker.k, o: victim.k, v: impact });
        // Battle: mit Turbo rammen klaut einen Ballon bzw. den Pokal
        if (S.battle && attacker.boostT > 0 && impact > 5 && victim.inv <= 0 && !mate(S, attacker, victim)) {
          if (S.battle === 'ball' && victim.bal > 0) { victim.bal--; attacker.bal = Math.min(5, attacker.bal + 1); victim.inv = 1.5; emit(S, { t: 'steal', k: attacker.k, o: victim.k }); if (victim.bal <= 0) bOut(S, victim); }
          else if (S.battle === 'cap' && S.obj.holder === victim.k) { S.obj.holder = attacker.k; victim.capCd = 1.4; victim.inv = 1.2; emit(S, { t: 'steal', k: attacker.k, o: victim.k }); }
        }
      }
    }
    // Fallen: Störsignal / Bananenschale
    for (let i = S.hazards.length - 1; i >= 0; i--) {
      const h = S.hazards[i]; h.t -= dt; h.arm -= dt; let used = h.t <= 0; const rr = h.kind === 'banana' ? 3.2 : h.kind === 'fire' ? 4.2 : 5;
      if (!used) S.karts.forEach(k => { if (used || k.spinT > 0 || k.out) return; if ((h.x - k.x) ** 2 + (h.z - k.z) ** 2 < rr && same(S, h, k) && (h.owner !== k.k || h.arm < 0)) { const ok = h.kind === 'banana' ? hit(S, k, h.owner, 'banana', 1.0, 0.55) : h.kind === 'fire' ? hit(S, k, h.owner, 'fire', 0.9, 0.5) : hit(S, k, h.owner, 'mine', 1.3, 0.25); if (ok) { used = !h.fixed; emit(S, { t: h.kind === 'banana' ? 'splat' : h.kind === 'fire' ? 'burn' : 'boom', x: h.x, z: h.z }); } } });
      if (used) S.hazards.splice(i, 1);
    }
    // Geschosse: Raketen (zielsuchend) und Steine (prallen von Wänden ab)
    for (let i = S.proj.length - 1; i >= 0; i--) {
      const r = S.proj[i]; r.t -= dt; r.arm -= dt; let dead = r.t <= 0; const oldX = r.x, oldZ = r.z;
      if (r.kind === 'rocket') {
        const tg = r.target >= 0 ? S.karts[r.target] : null;
        if (tg && !tg.finished) { const want = Math.atan2(tg.x - r.x, tg.z - r.z), df = wrap(want - r.th); r.th += clamp(df, -4.5 * dt, 4.5 * dt); } else { S.tr.nearest(r.x, r.z, -1, tmp); S.tr.at(tmp.f + 6, 0, tp); const df = wrap(Math.atan2(tp.x - r.x, tp.z - r.z) - r.th); r.th += clamp(df, -3 * dt, 3 * dt); }
      }
      if (r.kind === 'bomb') r.spd *= Math.exp(-1.3 * dt);
      r.x += Math.sin(r.th) * r.spd * dt; r.z += Math.cos(r.th) * r.spd * dt;
      // Bombe: rollt aus, explodiert nach Ablauf der Zündschnur oder bei Berührung – Druckwelle trifft alle in der Nähe
      if (r.kind === 'bomb') { if (!dead && r.arm <= 0) dead = S.karts.some(k => !k.out && k.k !== r.owner && (k.x - r.x) ** 2 + (k.z - r.z) ** 2 < 9 && same(S, r, k)); if (r.t <= 0) dead = true; S.tr.nearest(r.x, r.z, -1, tmp); if (Math.abs(tmp.d) > S.tr.wallD - 1.2) { r.th = 2 * Math.atan2(S.tr.T[tmp.i * 2], S.tr.T[tmp.i * 2 + 1]) - r.th; S.tr.at(tmp.f, Math.sign(tmp.d) * (S.tr.wallD - 3), tp); r.x = tp.x; r.z = tp.z; r.spd *= 0.6; }
        if (dead) { const ids = []; S.karts.forEach(k => { if (!k.out && (k.x - r.x) ** 2 + (k.z - r.z) ** 2 < 110 && same(S, r, k) && hit(S, k, r.owner, 'bomb', 1.4, 0.2)) ids.push(k.k); }); emit(S, { t: 'boom', x: r.x, z: r.z, big: 1, ids }); S.proj.splice(i, 1); } continue; }
      if (r.kind === 'giga') { for (let j = S.hazards.length - 1; j >= 0; j--) { const h = S.hazards[j]; if ((h.x - r.x) ** 2 + (h.z - r.z) ** 2 < 16) { S.hazards.splice(j, 1); emit(S, { t: 'smash', x: h.x, z: h.z }); } } }
      if (r.kind === 'rock' || r.kind === 'giga') { S.tr.nearest(r.x, r.z, -1, tmp); if (Math.abs(tmp.d) > S.tr.wallD - 1.2) { const ta = Math.atan2(S.tr.T[tmp.i * 2], S.tr.T[tmp.i * 2 + 1]); r.th = 2 * ta - r.th; r.bounces++; S.tr.at(tmp.f, Math.sign(tmp.d) * (S.tr.wallD - 3), tp); r.x = tp.x; r.z = tp.z; emit(S, { t: 'rockBounce', x: r.x, z: r.z }); if (r.bounces > 3) dead = true; } }
      S.karts.forEach(k => { if (dead || k.spinT > 0 || k.out || !same(S, r, k) || (k.k === r.owner && r.arm > 0)) return; const vx = r.x - oldX, vz = r.z - oldZ, len2 = vx * vx + vz * vz, along = len2 > 0 ? clamp(((k.x - oldX) * vx + (k.z - oldZ) * vz) / len2, 0, 1) : 0, hx = oldX + vx * along, hz = oldZ + vz * along; if ((hx - k.x) ** 2 + (hz - k.z) ** 2 < (r.kind === 'giga' ? 14 : r.kind === 'rock' ? 4.8 : 5.5)) { hit(S, k, r.owner, r.kind, r.kind === 'rock' || r.kind === 'giga' ? 1.15 : 1.3, r.kind === 'rock' || r.kind === 'giga' ? 0.3 : 0.25); dead = r.kind !== 'giga'; emit(S, { t: r.kind === 'rock' ? 'smash' : 'boom', x: r.x, z: r.z }); } });
      if (dead) S.proj.splice(i, 1);
    }
    // Portale überspringen einen Streckenabschnitt und erhalten Rundenzählung/Rankings.
    // Cooldown verhindert sofortiges erneutes Auslösen nach dem Versetzen.
    for (const k of S.karts) {
      k.portalCd = Math.max(0, (k.portalCd || 0) - dt);
      if (S.state !== 'race' || k.finished || k.portalCd > 0) continue;
      for (const p of S.portals || []) {
        if ((k.x-p.x)**2 + (k.z-p.z)**2 > 28) continue;
        const before = k.f, offset = k.d;
        S.tr.at(p.to, Math.max(-S.tr.half+2, Math.min(S.tr.half-2, offset)), tp);
        k.x = tp.x; k.z = tp.z; k.th = Math.atan2(tp.tx,tp.tz);
        const speed = Math.max(18, k.vf);
        k.vx = Math.sin(k.th)*speed; k.vz = Math.cos(k.th)*speed; k.vf = speed;
        let jump = p.to - before; if (jump < 0) jump += S.tr.N;
        k.rp += jump; k.prevF = p.to; k.f = p.to; k.i = Math.floor(p.to);
        k.portalCd = 4; k.inv = Math.max(k.inv, 0.7); k.boostT = Math.max(k.boostT, 1.1);
        emit(S, { t:'portal', k:k.k, x:k.x, z:k.z });
        break;
      }
    }
    // Freundliche eigene Fantasiewesen kreuzen die Fahrspur und geben einen leichten Stoß.
    if (S.state === 'race') for (const c of S.creatures || []) {
      c.cd = Math.max(0, c.cd - dt);
      const phase = S.t * 0.7 + c.seed;
      c.x = c.baseX + Math.sin(phase) * 2.2;
      c.z = c.baseZ + Math.cos(phase) * 2.2;
      if (c.cd > 0) continue;
      for (const k of S.karts) {
        if (k.finished || (k.x-c.x)**2+(k.z-c.z)**2 > 12 || k.inv > 0) continue;
        if (hit(S,k,-1,'creature',0.6,0.7)) { c.cd = 2; emit(S,{t:'creature',k:k.k,x:c.x,z:c.z}); break; }
      }
    }
    if (S.battle && S.state === 'race') bStep(S, dt);
    S.boxes.forEach(b => { if (b.cd > 0) b.cd -= dt; }); S.coins.forEach(c => { if (c.cd > 0) c.cd -= dt; });
    if (S.humans > 0 && S.finishedHumans >= S.humans && S.state === 'race') { S.state = 'done'; emit(S, { t: 'done' }); }
    if (!S.free && S.state === 'race' && S.t > 60 * 12) S.state = 'done';
  }
  // Battle: Pokal aufnehmen/halten, Ende bei Zeitablauf, letztem Überlebenden oder erreichtem Ziel
  function bStep(S, dt) {
    const o = S.obj; if (o) { o.cd = Math.max(0, o.cd - dt); if (o.holder >= 0) { const h = S.karts[o.holder]; h.hold += dt; o.x = h.x; o.z = h.z; o.f = h.f; o.d = h.d; if (S.teams) { if (teamScore(S, h.team) >= S.goal) S.winTeam = h.team; } else if (h.hold >= S.goal) S.win = h.k; }
      else if (o.cd <= 0) for (const k of S.karts) if (!k.out && k.capCd <= 0 && k.spinT <= 0 && (k.x - o.x) ** 2 + (k.z - o.z) ** 2 < 30) { o.holder = k.k; emit(S, { t: 'grab', k: k.k }); break; } }
    if (S.teams) { S.tsc = [teamScore(S, 0), teamScore(S, 1)]; if (S.battle === 'bomb') S.tsc.forEach((v, t) => { if (v >= S.goal) S.winTeam = t; }); }
    else if (S.battle === 'bomb') S.karts.forEach(k => { if (k.pts >= S.goal) S.win = k.k; });
    const alive = S.karts.filter(k => !k.out), aliveN = S.teams ? new Set(alive.map(k => k.team)).size : alive.length;
    if (S.t >= S.lim || S.win != null || S.winTeam != null || (S.battle === 'ball' && aliveN <= 1)) { if (S.teams && S.winTeam == null) { const a = teamScore(S, 0), b = teamScore(S, 1); S.winTeam = a === b ? -1 : a > b ? 0 : 1; } S.state = 'done'; emit(S, { t: 'done' }); }
  }
  // Wertung im Battle: Ballons (Überlebende zuerst), Haltezeit bzw. Punkte
  const bCmp = S => S.teams ? (a, b) => { const w = S.winTeam; return ((b.team === w) - (a.team === w)) || bCmp1(S)(a, b); } : bCmp1(S);
  const bCmp1 = S => S.battle === 'ball' ? (a, b) => (a.out - b.out) || (a.out ? b.finT - a.finT : b.bal - a.bal || b.pts - a.pts) : S.battle === 'cap' ? (a, b) => b.hold - a.hold || b.pts - a.pts : (a, b) => b.pts - a.pts || a.k - b.k;
  function rubber(S, k, inp) {
    const hs = S.karts.filter(h => h.human); if (!hs.length) return; const ref = hs.reduce((m, h) => Math.max(m, h.rp), -1e9), gap = k.rp - ref;
    inp.cap = (inp.cap || 1) * clamp(1 - gap * 0.0012, 0.94, 1.06);
  }
  function results(S) {
    if (S.battle) return S.karts.slice().sort(bCmp(S)).map((k, i) => ({ k, pos: i + 1, time: S.t, finished: !k.out, best: null, team: k.team, score: S.battle === 'ball' ? k.bal : S.battle === 'cap' ? k.hold : k.pts }));
    const N = S.tr.N; return S.karts.map(k => ({ k, t: k.finished ? k.finT : S.t + (S.laps * N - k.rp) / Math.max(8, Math.abs(k.vf)) + 5 })).sort((a, b) => a.t - b.t).map((r, i) => ({ k: r.k, pos: i + 1, time: r.t, finished: r.k.finished, best: r.k.lapTimes.length ? Math.min(...r.k.lapTimes) : null }));
  }
  return { create, step, results, ITEMS, SPECIALS, VMAX, BATTLE };
})();
if (typeof module !== 'undefined') module.exports = Sim;
