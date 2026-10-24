/* EASYCLASH – Kampf-Engine ohne DOM (auch in Node testbar), feste 60 Takte pro Sekunde.
 * 3D-Kampf wie bei modernen Prüglern: zwei Kämpfer auf runder Bühne mit Wand, Seitschritt in die Tiefe, hoch/mittel/tief,
 * Blocken (zurück halten oder Block-Knopf), Ducken, Konter-Treffer, Schlag- und Tritt-Ketten, Aushebler mit Luft-Kombos,
 * Würfe mit Befreiung, Spezialangriff je Figur, Wut bei wenig Leben und ein „Finale“ (Super) pro Runde, Runden mit Zeitlimit.
 * Eingabe pro Takt und Kämpfer: { fx: vor(+1)/zurück(−1), sy: Seitschritt rein(−1)/raus(+1) bzw. Ducken, p, k, s, g (Knöpfe, gerade gedrückt), block (gehalten), down/up (gehalten) } */
(function (root) {
  'use strict';
  const FPS = 60, DT = 1 / FPS, RING = 7.2, HP = 200;
  // Spezialangriffe (Typ je Figur) – gemeinsame Werte, Aussehen kommt aus der Figur
  const SPECIAL = {
    shot: { n: 'Energiestoß', h: 'mid', st: 18, act: 1, rec: 22, dmg: 14, proj: { spd: 9, life: 1.2, r: .45 } },
    rush: { n: 'Sturmangriff', h: 'mid', st: 16, act: 6, rec: 22, dmg: 18, reach: 1.3, dash: 7, push: 1.4, kd: true },
    spin: { n: 'Wirbel', h: 'high', st: 14, act: 8, rec: 20, dmg: 16, reach: 1.7, track: 180, push: 1.1 },
    dive: { n: 'Sturzflug', h: 'mid', st: 24, act: 4, rec: 20, dmg: 21, reach: 1.6, hop: 1, kd: true, dash: 3 },
    upper: { n: 'Himmelsfaust', h: 'mid', st: 8, act: 5, rec: 30, dmg: 16, reach: 1.25, launch: 9.5, inv: 8 },
    stomp: { n: 'Bodenbeben', h: 'low', st: 20, act: 4, rec: 22, dmg: 14, reach: 2.2, track: 180, kd: true }
  };
  // Befehlsliste wie bei modernen 3D-Prüglern: 1 = linke Faust, 2 = rechte Faust, 3 = linkes Bein, 4 = rechtes Bein,
  // Richtung + Knopf (f = vor, b = zurück, d = unten, df = unten-vor), Ketten über next. pose = Animation im Modell.
  const BASE = {
    jab: { n: '1 · Jab', h: 'high', st: 10, act: 2, rec: 9, dmg: 6, reach: 1.3, hs: 15, bs: 8, push: .15, next: { 2: 'cross' }, win: 13, pose: 'jab' },
    cross: { n: '1,2 · Doppel', h: 'high', st: 10, act: 2, rec: 12, dmg: 10, reach: 1.35, hs: 17, bs: 9, push: .3, next: { 4: 'onetwofour', 1: 'hook' }, win: 13, pose: 'jab2' },
    onetwofour: { n: '1,2,4 · Kickfinish', h: 'high', st: 15, act: 3, rec: 20, dmg: 18, reach: 1.6, hs: 22, bs: 12, push: .9, kd: true, pose: 'kick2' },
    hook: { n: '1,2,1 · Haken', h: 'mid', st: 14, act: 3, rec: 18, dmg: 14, reach: 1.4, hs: 22, bs: 11, push: .8, pose: 'jab3' },
    straight: { n: '2 · Gerade', h: 'high', st: 12, act: 2, rec: 12, dmg: 12, reach: 1.4, hs: 17, bs: 9, push: .35, next: { 1: 'hook2', 2: 'rush2' }, win: 12, pose: 'jab2' },
    hook2: { n: '2,1 · Konter-Haken', h: 'mid', st: 13, act: 3, rec: 16, dmg: 13, reach: 1.35, hs: 20, bs: 10, push: .6, pose: 'jab3' },
    rush2: { n: '2,2 · Doppelgerade', h: 'mid', st: 14, act: 3, rec: 18, dmg: 15, reach: 1.45, hs: 22, bs: 12, push: .9, wall: true, pose: 'power' },
    kick: { n: '3 · Mittelkick', h: 'mid', st: 14, act: 3, rec: 15, dmg: 12, reach: 1.6, hs: 18, bs: 10, push: .4, next: { 4: 'kick2' }, win: 14, pose: 'kick' },
    kick2: { n: '3,4 · Drehkick', h: 'high', st: 15, act: 3, rec: 20, dmg: 17, reach: 1.65, hs: 22, bs: 12, push: 1.0, kd: true, pose: 'kick2' },
    highkick: { n: '4 · Hoher Kick', h: 'high', st: 13, act: 3, rec: 16, dmg: 15, reach: 1.65, hs: 20, bs: 11, push: .6, next: { 4: 'kick2' }, win: 12, pose: 'jabk' },
    elbow: { n: 'f+1 · Ellbogen', h: 'mid', st: 13, act: 3, rec: 14, dmg: 13, reach: 1.25, hs: 20, bs: 9, push: .5, pose: 'power' },
    power: { n: 'f+2 · Wuchtschlag', h: 'mid', st: 16, act: 3, rec: 20, dmg: 20, reach: 1.45, hs: 26, bs: 14, push: 1.3, wall: true, pose: 'power' },
    knee: { n: 'f+3 · Knie', h: 'mid', st: 15, act: 3, rec: 18, dmg: 16, reach: 1.2, hs: 22, bs: 12, push: .7, pose: 'launcher' },
    roundhouse: { n: 'f+4 · Rundkick', h: 'high', st: 18, act: 4, rec: 22, dmg: 22, reach: 1.75, hs: 24, bs: 12, push: 1.2, kd: true, track: 70, pose: 'kick2' },
    check: { n: 'df+1 · Magenhaken', h: 'mid', st: 13, act: 2, rec: 12, dmg: 11, reach: 1.25, hs: 19, bs: 7, push: .3, pose: 'jab3' },
    uppercut: { n: 'df+2 · Aufwärtshaken', h: 'mid', st: 15, act: 3, rec: 18, dmg: 15, reach: 1.35, hs: 20, bs: 18, push: .3, launch: 7.2, pose: 'upper' },
    midkick: { n: 'df+3 · Frontkick', h: 'mid', st: 14, act: 3, rec: 16, dmg: 13, reach: 1.6, hs: 19, bs: 10, push: .8, pose: 'kick' },
    launcher: { n: 'df+4 · Aushebel-Kick', h: 'mid', st: 16, act: 3, rec: 20, dmg: 14, reach: 1.45, hs: 20, bs: 18, push: .3, launch: 7.5, pose: 'launcher' },
    low: { n: 'd+1 · Tiefer Stoß', h: 'low', st: 10, act: 2, rec: 12, dmg: 5, reach: 1.25, hs: 13, bs: 8, push: .2, pose: 'low' },
    lowpunch: { n: 'd+2 · Tiefer Schlag', h: 'low', st: 12, act: 2, rec: 14, dmg: 8, reach: 1.3, hs: 15, bs: 10, push: .3, pose: 'low' },
    lowkick: { n: 'd+3 · Schienbein-Kick', h: 'low', st: 13, act: 2, rec: 16, dmg: 9, reach: 1.5, hs: 16, bs: 12, push: .3, pose: 'sweep' },
    sweep: { n: 'd+4 · Feger', h: 'low', st: 18, act: 3, rec: 26, dmg: 16, reach: 1.7, hs: 20, bs: 16, push: .5, kd: true, track: 40, pose: 'sweep' },
    backfist: { n: 'b+1 · Rückhand', h: 'high', st: 12, act: 2, rec: 12, dmg: 11, reach: 1.45, hs: 18, bs: 8, push: .5, track: 60, pose: 'jab' },
    body: { n: 'b+2 · Körperhaken', h: 'mid', st: 14, act: 3, rec: 16, dmg: 14, reach: 1.3, hs: 22, bs: 10, push: .6, next: { 1: 'hook' }, win: 12, pose: 'jab3' },
    spinkick: { n: 'b+4 · Wirbelkick', h: 'mid', st: 20, act: 4, rec: 22, dmg: 20, reach: 1.75, hs: 24, bs: 12, push: 1.3, kd: true, track: 90, pose: 'kick2' },
    air: { n: 'Sprung + Knopf', h: 'mid', st: 6, act: 6, rec: 8, dmg: 13, reach: 1.5, hs: 18, bs: 10, push: .6, pose: 'air' },
    throw: { n: '1+3 · Wurf', h: 'throw', st: 10, act: 2, rec: 24, dmg: 32, reach: 1.15, pose: 'throw' },
    finale: { n: 'Wut + Finale', h: 'mid', st: 12, act: 4, rec: 40, dmg: 58, reach: 2.0, push: 2.2, kd: true, inv: 12, super: true, dash: 2, pose: 'finale' }
  };
  // Richtung + Knopf → Angriff
  const CMD = { '1': 'jab', '2': 'straight', '3': 'kick', '4': 'highkick', f1: 'elbow', f2: 'power', f3: 'knee', f4: 'roundhouse', df1: 'check', df2: 'uppercut', df3: 'midkick', df4: 'launcher', d1: 'low', d2: 'lowpunch', d3: 'lowkick', d4: 'sweep', db1: 'low', db2: 'lowpunch', db3: 'lowkick', db4: 'sweep', b1: 'backfist', b2: 'body', b3: 'kick', b4: 'spinkick' };
  const W0 = { walk: 2.8, back: 2.4, side: 2.6, power: 1, reach: 1, speed: 1, weight: 1 };

  function stats(ch) { return Object.assign({}, W0, ch && ch.stats || {}); }
  function fighter(ch, i) {
    const st = stats(ch);
    return { i, ch: ch || {}, st, x: i ? 2 : -2, z: 0, y: 0, vy: 0, vx: 0, vz: 0, fx: i ? -1 : 1, fz: 0, hp: HP, state: 'idle', t: 0, mv: null, mvId: '', hit: false,
      stun: 0, juggle: 0, inv: 0, rage: false, finale: false, crouch: 0, upHeld: 0, block: false, dtap: { f: 0, b: 0, lf: 0, lb: 0 }, side: 0, combo: 0, comboDmg: 0, wallSplat: 0, buf: null, grab: null, wins: 0, stunKind: '', dmgTaken: 0 };
  }
  function newMatch(o) { const M = { chars: o.chars, target: o.target || 2, time: o.time || 60, round: 0, wins: [0, 0], stage: o.stage || 0, seed: o.seed || 1, over: false, winner: -1 }; return M; }
  function newRound(M) {
    M.round++;
    const W = { M, f: [fighter(M.chars[0], 0), fighter(M.chars[1], 1)], phase: 'intro', pt: 0, time: M.time, ev: [], proj: [], slow: 0, frame: 0, winner: -1, perfect: false, rs: (M.seed * 31 + M.round * 7) >>> 0 };
    return W;
  }
  const rnd = W => { W.rs = (W.rs * 1103515245 + 12345) >>> 0; return (W.rs >>> 8) / 16777216; };
  const len = (x, z) => Math.hypot(x, z);
  const other = (W, F) => W.f[1 - F.i];
  function faceTo(F, O) { const dx = O.x - F.x, dz = O.z - F.z, l = len(dx, dz) || 1; F.fx = dx / l; F.fz = dz / l; }
  const busy = F => F.state !== 'sidewalk' && ['attack', 'hit', 'block', 'down', 'getup', 'air', 'thrown', 'grab', 'ko', 'win', 'side', 'dash', 'bdash'].includes(F.state);
  function setState(F, s) { F.state = s; F.t = 0; }

  function startMove(W, F, id) {
    const def = id === 'special' ? SPECIAL[F.ch.sp || 'rush'] : BASE[id];
    if (!def) return false;
    const sp = F.st.speed;
    F.mv = Object.assign({}, def, { st: Math.max(4, Math.round(def.st / sp)), rec: Math.round(def.rec / sp), dmg: Math.round(def.dmg * F.st.power), reach: (def.reach || 1.3) * F.st.reach, track: def.track || 18 });
    F.mvId = id; F.hit = false; setState(F, 'attack'); F.buf = null; F.t0 = W.frame;
    // Blickrichtung zu Beginn festlegen (lineare Angriffe verfehlen Seitschritte)
    faceTo(F, other(W, F));
    if (def.inv) F.inv = def.inv;
    if (id === 'finale') { F.finale = true; W.ev.push({ k: 'finale', i: F.i }); W.slow = 40; }
    W.ev.push({ k: 'swing', i: F.i, id, h: def.h });
    return true;
  }
  // Eingabe in Aktion umsetzen. inp: { fx, sy, b1..b4 (gerade gedrückt), s (Spezial), g (Wurf), f (Finale), block (gehalten) }
  function control(W, F, inp) {
    inp = inp || {};
    // alte Namen (p = 1, k = 3) weiter erlauben
    if (inp.p && !inp.b1) inp.b1 = true; if (inp.k && !inp.b3) inp.b3 = true;
    if (F.state === 'thrown') { if (inp.g || inp.b1 && inp.b3 || inp.b2 && inp.b4) tryBreak(W, F.i); return; }
    const d = F.dtap; d.f = Math.max(0, d.f - 1); d.b = Math.max(0, d.b - 1);
    const fw = inp.fx > .5, bw = inp.fx < -.5, dn = inp.sy > .5, up = inp.sy < -.5;
    if (fw && !d.lf && !dn) { if (d.f > 0 && !busy(F)) { setState(F, 'dash'); d.f = 0; } else d.f = 12; }
    if (bw && !d.lb && !dn) { if (d.b > 0 && !busy(F)) { setState(F, 'bdash'); d.b = 0; } else d.b = 12; }
    d.lf = fw; d.lb = bw;
    const anyBtn = inp.b1 || inp.b2 || inp.b3 || inp.b4 || inp.s || inp.g || inp.f;
    F.block = (bw || !!inp.block) && !anyBtn;
    // Ducken / Springen / Seitschritt (antippen = Seitschritt, halten = ducken bzw. springen; mit Knopf kein Seitschritt)
    if (anyBtn && (dn || up)) F.usedDir = true;
    // Unten schräg (unten-zurück / unten-vor) oder unten + Block = ducken; nur unten/oben = seitwärts laufen (frei im Kreis um den Gegner);
    // kurz antippen = schneller Seitschritt; oben schräg halten = Sprung
    const duck = dn && (fw || bw || !!inp.block);
    if (duck) F.crouch++; else F.crouch = 0;
    if (dn && !duck) F.dnHeld = (F.dnHeld || 0) + 1; else { if (F.dnHeld > 0 && F.dnHeld < 8 && !F.usedDir && !busy(F)) sidestep(W, F, 1); F.dnHeld = 0; }
    if (up) { F.upHeld++; if (F.upHeld === 9 && (fw || bw) && !busy(F) && F.y === 0) { setState(F, 'jump'); F.vy = 7.2; F.vx = fw ? F.fx * 2.5 : -F.fx * 2; F.vz = fw ? F.fz * 2.5 : -F.fz * 2; } } else { if (F.upHeld > 0 && F.upHeld < 8 && !F.usedDir && !busy(F)) sidestep(W, F, -1); F.upHeld = 0; }
    if (!dn && !up) F.usedDir = false;
    // Knöpfe sammeln (2 Takte für gleichzeitige Paare wie 1+3), dann Befehl auflösen
    if (anyBtn) { const P = F.pend || (F.pend = { b: {}, t: 2, dir: '' }); for (const k of ['b1', 'b2', 'b3', 'b4', 's', 'g', 'f']) if (inp[k]) P.b[k] = true; P.dir = dn ? (fw ? 'df' : bw ? 'db' : 'd') : fw ? 'f' : bw ? 'b' : up ? 'u' : ''; }
    if (F.pend && --F.pend.t <= 0) {
      const P = F.pend, B = P.b; F.pend = null; let want = null;
      if ((B.f || (B.b1 && B.b2 && P.dir === 'df')) && F.rage && !F.finale) want = 'finale';
      else if (B.s || (B.b1 && B.b2)) want = 'special';
      else if (B.g || (B.b1 && B.b3) || (B.b2 && B.b4)) want = 'throw';
      else { const n = B.b1 ? 1 : B.b2 ? 2 : B.b3 ? 3 : B.b4 ? 4 : 0; if (n) want = CMD[(P.dir === 'u' ? '' : P.dir) + n] || CMD['' + n]; if (n) F.lastBtn = n; }
      if (want) F.buf = { id: want, t: 9, n: F.lastBtn };
    }
    if (F.buf) {
      F.buf.t--;
      if (F.state === 'jump' && BASE[F.buf.id] && BASE[F.buf.id].h !== 'throw') { startMove(W, F, 'air'); }
      else if (F.state === 'attack' && F.mv && F.mv.next && F.t >= F.mv.st && F.t <= F.mv.st + F.mv.act + (F.mv.win || 0)) {
        const nx = F.buf.n ? F.mv.next[F.buf.n] : null;
        if (nx && (F.hit || F.t > F.mv.st + F.mv.act)) startMove(W, F, nx);
      } else if (!busy(F) && F.state !== 'jump') startMove(W, F, F.buf.id);
      if (F.buf && F.buf.t <= 0) F.buf = null;
    }
    // Gehen in alle Richtungen (Stick stufenlos): vor/zurück zum Gegner, hoch/runter seitwärts um ihn herum; unten schräg = geduckt (blocken)
    if (!busy(F) && F.state !== 'jump') {
      const crouch = F.crouch >= 3 || (dn && F.usedDir && duck);
      const ax = Math.abs(inp.fx || 0) > .2 ? inp.fx : 0, ay = Math.abs(inp.sy || 0) > .2 ? inp.sy : 0;
      if (crouch) F.state = 'crouch';
      else if (ax || ay) {
        const fwd = ax > 0 ? ax * F.st.walk : ax * F.st.back, o = F.i ? -1 : 1, ox = -F.fz * o, oz = F.fx * o, sd = ay * F.st.side;
        let vx = F.fx * fwd + ox * sd, vz = F.fz * fwd + oz * sd; const l = Math.hypot(vx, vz), mx = Math.max(F.st.walk, F.st.side);
        if (l > mx) { vx *= mx / l; vz *= mx / l; }
        F.x += vx * DT; F.z += vz * DT; F.state = Math.abs(ax) >= Math.abs(ay) ? (ax > 0 ? 'walk' : 'walkb') : 'sidewalk'; F.sideDir = ay * o;
      } else F.state = 'idle';
    }
  }
  function sidestep(W, F, dir) { setState(F, 'side'); F.side = dir * (F.i ? -1 : 1); /* +1 = zur Kamera hin (aus der Bildtiefe heraus) */ W.ev.push({ k: 'side', i: F.i }); }

  function step(W, inputs) {
    W.frame++; W.ev.length = 0;
    for (const F of W.f) { F.px = F.x; F.py = F.y; F.pz = F.z; }
    if (W.stop > 0) {   // Trefferstopp: kurzes Einfrieren macht Treffer spürbar – gedrückte Knöpfe bleiben gemerkt
      W.stop--;
      if (inputs) W.f.forEach(F => { const inp = inputs[F.i] || {}; if (inp.p) inp.b1 = true; if (inp.k) inp.b3 = true; const P = F.pend || { b: {}, t: 2, dir: '' }; let any = false; for (const k of ['b1', 'b2', 'b3', 'b4', 's', 'g', 'f']) if (inp[k]) { P.b[k] = true; any = true; } if (any) { const fw = inp.fx > .5, bw = inp.fx < -.5, dn = inp.sy > .5; P.dir = dn ? (fw ? 'df' : bw ? 'db' : 'd') : fw ? 'f' : bw ? 'b' : ''; P.t = 1; F.pend = P; } });
      return;
    }
    if (W.slow > 0) W.slow--;
    const [A, B] = W.f;
    if (W.phase === 'intro') { W.pt++; if (W.pt === 1) W.ev.push({ k: 'round', n: W.M.round }); if (W.pt >= 100) { W.phase = 'fight'; W.pt = 0; W.ev.push({ k: 'fight' }); } settle(W); return; }
    if (W.phase === 'ko') { W.pt++; for (const F of W.f) physics(W, F, null); settle(W); if (W.pt >= 150) endRound(W); return; }
    if (W.phase === 'end') return;
    W.time -= DT; if (W.time <= 0) { W.time = 0; timeUp(W); return; }
    // Steuerung
    for (const F of W.f) { if (F.state !== 'ko') control(W, F, inputs ? inputs[F.i] : null); }
    // Zustände und Angriffe
    for (const F of W.f) physics(W, F, other(W, F));
    for (const F of W.f) if (F.state === 'attack') attackTick(W, F, other(W, F));
    projectiles(W);
    settle(W);
    // Wut
    for (const F of W.f) if (!F.rage && F.hp > 0 && F.hp <= HP * .25) { F.rage = true; W.ev.push({ k: 'rage', i: F.i }); }
    // K.O.
    for (const F of W.f) if (F.hp <= 0 && W.phase === 'fight') { F.hp = 0; ko(W, F); }
    void A; void B;
  }
  function physics(W, F, O) {
    F.t++; if (F.inv > 0) F.inv--;
    const s = F.state;
    if (O && !['attack', 'air', 'thrown', 'down', 'ko', 'hit'].includes(s)) faceTo(F, O);
    if (s === 'attack') {
      const m = F.mv;
      if (m.dash && F.t >= m.st - 4 && F.t <= m.st + m.act) { const v = m.dash * 1.6; F.x += F.fx * v * DT; F.z += F.fz * v * DT; }
      if (m.hop && F.t < m.st) F.y = Math.sin(F.t / m.st * Math.PI) * 1.2;
      if (F.mvId === 'air' && F.y <= 0 && F.t > 4) { F.y = 0; }
      if (F.t >= m.st + m.act + m.rec) { setState(F, F.y > 0 ? 'jump' : 'idle'); F.mv = null; F.y = Math.max(0, F.y); }
    } else if (s === 'side') {
      // um den Gegner herum ausweichen
      const px = -F.fz * F.side, pz = F.fx * F.side, sp = F.st.side * 2.2 * (F.t < 10 ? 1 : .4);
      F.x += px * sp * DT; F.z += pz * sp * DT; if (F.t >= 16) setState(F, 'idle');
    } else if (s === 'dash') { const v = F.t < 12 ? 6.5 * F.st.speed : 0; F.x += F.fx * v * DT; F.z += F.fz * v * DT; if (F.t >= 16) setState(F, 'idle'); }
    else if (s === 'bdash') { const v = F.t < 12 ? -5.5 : 0; F.x += F.fx * v * DT; F.z += F.fz * v * DT; if (F.t >= 18) setState(F, 'idle'); }
    else if (s === 'hit' || s === 'block') { F.x += F.vx * DT; F.z += F.vz * DT; F.vx *= .86; F.vz *= .86; if (F.wallSplat > 0) F.wallSplat--; if (F.t >= F.stun) setState(F, 'idle'); }
    else if (s === 'jump' || s === 'air') {
      F.vy -= (s === 'air' ? 18 : 22) * DT; F.y += F.vy * DT; F.x += F.vx * DT; F.z += F.vz * DT;
      if (F.y <= 0) { F.y = 0; F.vy = 0; F.vx = F.vz = 0; if (s === 'air') { setState(F, 'down'); W.ev.push({ k: 'land', i: F.i }); } else setState(F, 'idle'); }
    } else if (s === 'down') { F.vx *= .8; F.vz *= .8; F.x += F.vx * DT; F.z += F.vz * DT; if (F.t >= 34 && F.hp > 0) { setState(F, 'getup'); F.inv = 20; } }
    else if (s === 'getup') { if (F.t >= 20) { setState(F, 'idle'); F.juggle = 0; } }
    else if (s === 'grab') { if (F.t >= 40) setState(F, 'idle'); }
    else if (s === 'thrown') { if (F.t >= 40) { setState(F, 'down'); F.t = 10; } }
    else if (s === 'ko') { F.vy -= 22 * DT; F.y = Math.max(0, F.y + F.vy * DT); F.x += F.vx * DT; F.z += F.vz * DT; F.vx *= .95; F.vz *= .95; if (F.y === 0) F.vy = 0; }
    if (F.state !== 'hit' && F.state !== 'air' && F.combo && F.state !== 'down') { if (F.state === 'idle' || F.state === 'walk') { if (F.combo > 1) W.ev.push({ k: 'combo', i: 1 - F.i, n: F.combo, dmg: F.comboDmg }); F.combo = 0; F.comboDmg = 0; } }
  }
  function attackTick(W, F, O) {
    const m = F.mv; if (!m || F.hit) return;
    if (F.t < m.st || F.t >= m.st + m.act) return;
    if (m.proj) { if (F.t === m.st) { W.proj.push({ o: F.i, x: F.x + F.fx * .8, z: F.z + F.fz * .8, y: 1.1, dx: F.fx, dz: F.fz, life: m.proj.life, spd: m.proj.spd, r: m.proj.r, dmg: m.dmg, h: m.h }); W.ev.push({ k: 'proj', i: F.i }); } F.hit = true; return; }
    if (inReach(F, O, m)) { F.hit = true; resolve(W, F, O, m); }
  }
  function inReach(F, O, m) {
    const dx = O.x - F.x, dz = O.z - F.z, proj = dx * F.fx + dz * F.fz, lat = Math.abs(dx * F.fz - dz * F.fx);
    if (proj < -.2 || len(dx, dz) > m.reach + .35) return false;
    const ang = Math.atan2(lat, Math.max(.01, proj)) * 180 / Math.PI;
    if (m.track < 180 && ang > m.track + 8 && lat > .45) return false;
    if (O.y > 2.8 && !m.launch) return false;
    return true;
  }
  // Treffer auswerten: Würfe, Block, Ducken unter Hohen, Konter, Luft-Kombos, Wand
  function resolve(W, F, O, m) {
    if (O.inv > 0 || O.state === 'ko' || O.state === 'thrown') return;
    if (m.h === 'throw') {
      if (O.y > 0 || O.state === 'air' || O.state === 'down' || O.state === 'attack' && O.mvId === 'throw') return;
      setState(F, 'grab'); setState(O, 'thrown'); F.grab = { t: 0 }; O.thrownBy = F.i; O.breakable = 14;
      W.ev.push({ k: 'grab', i: F.i }); return;
    }
    if (O.y > .4 && (O.state === 'jump') && m.h === 'low') return; // tiefe Angriffe gehen unter Sprüngen durch
    const crouching = O.crouch >= 8 || O.state === 'crouch';
    if (m.h === 'high' && crouching && O.state !== 'hit') { W.ev.push({ k: 'duck', i: O.i }); return; }
    const canBlock = O.block && !['attack', 'hit', 'air', 'down', 'getup', 'thrown', 'jump', 'dash'].includes(O.state);
    const blocked = canBlock && (crouching ? m.h !== 'mid' : m.h !== 'low');
    const dirx = O.x - F.x, dirz = O.z - F.z, l = len(dirx, dirz) || 1, ux = dirx / l, uz = dirz / l;
    const pushW = 1 / O.st.weight;
    if (blocked) {
      setState(O, 'block'); O.stun = m.bs || 12; O.vx = ux * (m.push || .3) * 5 * pushW; O.vz = uz * (m.push || .3) * 5 * pushW;
      O.hp -= m.super ? Math.round(m.dmg * .15) : 0;
      W.ev.push({ k: 'hit', i: O.i, by: F.i, block: true, x: O.x, y: 1.1, z: O.z, dmg: 0, h: m.h }); W.stop = Math.max(W.stop || 0, 3); return;
    }
    const counter = O.state === 'attack' && O.t < (O.mv ? O.mv.st : 0);
    const inAir = O.state === 'air' || O.y > .2;
    let dmg = m.dmg * (counter ? 1.25 : 1);
    if (O.combo > 0) dmg *= Math.max(.35, 1 - O.combo * .12);
    if (inAir) dmg *= .75;
    dmg = Math.max(1, Math.round(dmg));
    O.hp -= dmg; O.dmgTaken += dmg; O.combo++; O.comboDmg += dmg;
    W.ev.push({ k: 'hit', i: O.i, by: F.i, x: O.x, y: inAir ? O.y + 1 : 1.1, z: O.z, dmg, counter, h: m.h, big: dmg >= 16 || m.launch || m.super, super: !!m.super });
    W.stop = Math.max(W.stop || 0, m.super ? 14 : counter || dmg >= 16 || m.launch ? 8 : 4);
    if (counter) W.ev.push({ k: 'counter', i: F.i });
    if (O.hp <= 0) { O.vx = ux * 5; O.vz = uz * 5; O.vy = 6; return; }
    if (m.launch && !inAir) { setState(O, 'air'); O.vy = m.launch; O.juggle = 1; O.vx = ux * .5; O.vz = uz * .5; O.y = Math.max(O.y, .05); W.ev.push({ k: 'launch', i: O.i }); return; }
    if (inAir) { O.juggle++; if (O.juggle <= 6) { setState(O, 'air'); O.vy = Math.max(O.vy, 4.2 - O.juggle * .35); O.vx = ux * .8; O.vz = uz * .8; } else { O.vy = -4; } return; }
    if (m.kd) { setState(O, 'air'); O.vy = 4.5; O.vx = ux * 3 * pushW; O.vz = uz * 3 * pushW; O.y = .05; return; }
    setState(O, 'hit'); O.stun = Math.round((m.hs || 16) * (counter ? 1.4 : 1)); O.stunKind = m.h;
    O.vx = ux * (m.push || .3) * 6 * pushW; O.vz = uz * (m.push || .3) * 6 * pushW;
    if (m.wall && len(O.x, O.z) > RING - 1.6) { O.stun = 40; O.wallSplat = 40; W.ev.push({ k: 'wall', i: O.i }); }
  }
  function projectiles(W) {
    for (let k = W.proj.length - 1; k >= 0; k--) {
      const p = W.proj[k]; p.life -= DT; p.x += p.dx * p.spd * DT; p.z += p.dz * p.spd * DT;
      const O = W.f[1 - p.o];
      if (p.life <= 0 || len(p.x, p.z) > RING + 1) { W.proj.splice(k, 1); continue; }
      if (len(O.x - p.x, O.z - p.z) < p.r + .4 && O.y < 1.8) {
        W.proj.splice(k, 1); const F = W.f[p.o];
        const m = { h: p.h, dmg: p.dmg, hs: 20, bs: 12, push: .6, reach: 9, track: 180 };
        const fx = F.fx, fz = F.fz; F.fx = p.dx; F.fz = p.dz; resolve(W, F, O, m); F.fx = fx; F.fz = fz;
      }
    }
  }
  // Abstand halten, Wand, Würfe abschließen
  function settle(W) {
    const [A, B] = W.f, dx = B.x - A.x, dz = B.z - A.z, l = len(dx, dz) || .001, min = .85;
    if (l < min && A.y < 1 && B.y < 1) { const p = (min - l) / 2; A.x -= dx / l * p; A.z -= dz / l * p; B.x += dx / l * p; B.z += dz / l * p; }
    for (const F of W.f) { const r = len(F.x, F.z); if (r > RING) { F.x *= RING / r; F.z *= RING / r; } }
    for (const F of W.f) if (F.state === 'thrown') {
      const T = W.f[F.thrownBy]; if (!T) continue;
      F.breakable--;
      if (F.t === 30) { const m = BASE.throw; const dmg = Math.round(m.dmg * T.st.power); F.hp -= dmg; F.combo++; F.comboDmg += dmg; W.ev.push({ k: 'throw', i: F.i, by: T.i, dmg, x: F.x, y: 1, z: F.z }); F.vx = -T.fx * 0; }
    }
  }
  // Wurf befreien (Wurf-Knopf kurz nach dem Greifen)
  function tryBreak(W, i) {
    const F = W.f[i]; if (F.state !== 'thrown' || F.breakable <= 0 || F.t > 14) return false;
    const T = W.f[F.thrownBy]; setState(F, 'block'); F.stun = 16; setState(T, 'block'); T.stun = 16;
    F.vx = -T.fx * 4; F.vz = -T.fz * 4; T.vx = T.fx * -4; T.vz = T.fz * -4; F.vx = -F.vx; F.vz = -F.vz;
    W.ev.push({ k: 'break', i }); return true;
  }
  function ko(W, F) {
    setState(F, 'ko'); F.vy = Math.max(F.vy, 5); W.phase = 'ko'; W.pt = 0; W.slow = 70;
    const win = other(W, F); W.winner = win.i; W.perfect = win.hp >= HP; W.ev.push({ k: 'ko', i: F.i, perfect: W.perfect });
  }
  function timeUp(W) {
    const [A, B] = W.f; W.phase = 'ko'; W.pt = 60; W.winner = A.hp === B.hp ? -1 : A.hp > B.hp ? 0 : 1;
    W.ev.push({ k: 'time', winner: W.winner });
  }
  function endRound(W) {
    const M = W.M; W.phase = 'end';
    if (W.winner >= 0) M.wins[W.winner]++; else { M.wins[0]++; M.wins[1]++; }
    W.f.forEach(F => { if (W.winner === F.i) setState(F, 'win'); });
    if (M.wins[0] >= M.target || M.wins[1] >= M.target) { M.over = true; M.winner = M.wins[0] === M.wins[1] ? -1 : M.wins[0] > M.wins[1] ? 0 : 1; }
    W.ev.push({ k: 'roundEnd', winner: W.winner, over: M.over });
  }

  /* ---------- Computer-Gegner ---------- */
  const AIL = [{ react: 26, block: .25, punish: .2, mix: .4, side: .05 }, { react: 15, block: .55, punish: .55, mix: .6, side: .15 }, { react: 9, block: .8, punish: .85, mix: .8, side: .3 }];
  function ai(W, i, lvl) {
    const F = W.f[i], O = W.f[1 - i], L = AIL[Math.max(0, Math.min(2, lvl))], inp = { fx: 0, sy: 0 };
    if (W.phase !== 'fight') return inp;
    F.ai = F.ai || { t: 0, plan: null, hold: 0 };
    const A = F.ai, d = len(O.x - F.x, O.z - F.z);
    // Reaktion auf Angriffe: blocken/ducken/seitlich
    if (O.state === 'attack' && O.mv && O.t < O.mv.st + 2 && d < (O.mv.reach || 1.4) + 1) {
      if (A.react === undefined || A.reactFor !== O.mvId + O.t0) { A.reactFor = O.mvId + O.t0; A.react = rnd(W) < L.block ? (O.mv.h === 'low' ? 'crouch' : O.mv.h === 'high' && rnd(W) < .4 ? 'crouch' : O.mv.track < 60 && rnd(W) < L.side ? 'side' : 'block') : 'none'; }
      if (A.react === 'block') { inp.fx = -1; inp.block = true; return inp; }
      if (A.react === 'crouch') { inp.sy = 1; inp.block = true; return inp; }
      if (A.react === 'side' && F.state === 'idle') { A.sideT = (A.sideT || 0) + 1; inp.sy = A.sideT % 6 < 3 ? -1 : 0; return inp; }
    } else A.react = undefined;
    // Gegner liegt / ist in der Luft → Kombo
    if (O.state === 'air' && d < 1.9) { if (d > 1.3) inp.fx = 1; const k = W.frame % 12; if (k === 0) inp.b1 = true; else if (k === 6) inp.b2 = true; return inp; }
    // bestrafen
    if ((O.state === 'attack' && O.mv && O.t > O.mv.st + O.mv.act && O.mv.rec > 18) || O.state === 'block' && O.t < 3) {
      if (d < 1.6 && rnd(W) < L.punish) { if (O.mv && O.mv.rec > 21) { inp.fx = 1; inp.sy = 1; inp.b2 = true; } else inp.b1 = true; return inp; }
    }
    A.t--;
    if (A.t <= 0) {
      A.t = L.react + Math.floor(rnd(W) * L.react);
      const r = rnd(W);
      if (F.rage && !F.finale && d < 2.2 && r < .25) A.plan = 'finale';
      else if (d > 3.2) A.plan = r < .35 ? 'special' : r < .5 ? 'dash' : 'walk';
      else if (d > 1.7) A.plan = r < .55 ? 'walk' : r < .7 ? 'special' : r < .8 ? 'side' : 'wait';
      else { const m = rnd(W); A.plan = m < .22 ? 'jab' : m < .38 ? 'kick' : m < .5 ? (L.mix > .5 ? 'sweep' : 'jab') : m < .6 ? 'launcher' : m < .7 ? 'power' : m < .78 ? 'throw' : m < .86 ? 'block' : m < .93 ? 'side' : 'back'; }
      A.step = 0;
    }
    A.step = (A.step || 0) + 1;
    switch (A.plan) {
      case 'walk': inp.fx = 1; break; case 'back': inp.fx = -1; break; case 'block': inp.fx = -1; inp.block = true; break;
      case 'dash': inp.fx = A.step % 6 < 2 ? 1 : 0; break;
      case 'side': inp.sy = A.step < 3 ? (i ? 1 : -1) : 0; break;
      case 'special': if (A.step === 1) inp.s = true; break;
      case 'jab': if (A.step === 1) inp.b1 = true; if (A.step === 12 && rnd(W) < L.mix) inp.b2 = true; if (A.step === 26 && rnd(W) < L.mix * .6) inp[rnd(W) < .5 ? 'b4' : 'b1'] = true; break;
      case 'kick': if (A.step === 1) inp[rnd(W) < .5 ? 'b3' : 'b4'] = true; if (A.step === 16 && rnd(W) < L.mix) inp.b4 = true; break;
      case 'sweep': inp.sy = 1; if (A.step === 1) inp[rnd(W) < .5 ? 'b4' : 'b3'] = true; break;
      case 'launcher': inp.fx = 1; inp.sy = 1; if (A.step === 1) inp[rnd(W) < .5 ? 'b2' : 'b4'] = true; break;
      case 'power': inp.fx = 1; if (A.step === 1) inp[['b1', 'b2', 'b4'][Math.floor(rnd(W) * 3)]] = true; break;
      case 'throw': if (A.step === 1) inp.g = true; break;
      case 'finale': if (A.step === 1) { inp.s = true; inp.g = true; } break;
    }
    // Würfe befreien
    if (F.state === 'thrown' && F.t < 12 && rnd(W) < L.block * .5) inp.g = true;
    return inp;
  }

  function daily(d) { d = d || new Date(); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); let h = 2166136261; for (const c of 'easyclash' + k) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return { key: k, seed: h >>> 0 }; }
  const EC = { FPS, DT, RING, HP, SPECIAL, BASE, CMD, newMatch, newRound, step, ai, tryBreak, startMove, inReach, daily, len };
  if (typeof module !== 'undefined' && module.exports) module.exports = EC;
  root.EC = EC;
})(typeof window !== 'undefined' ? window : globalThis);
