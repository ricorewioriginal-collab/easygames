/* Groove Arena – Tanz-Kern ohne Grafik (läuft auch in Node):
 *  - Skelett mit Vorwärtskinematik (Posen als Winkel → Gelenkpunkte, Füße automatisch auf dem Boden)
 *  - Bewegungs-Bibliothek: Arm-Muster × Schritt-Muster je Stil + eigene Signatur-Moves (Gold-Moves)
 *  - Choreograf: erzeugt für jeden Song (Video-ID) eine eigene, immer gleiche Choreografie über die ganze Songlänge
 *    (Intro, Strophen, Refrain mit festen Wiederholungs-Moves, Bridge, Finale) – auf Takt (BPM) und ersten Schlag ausgerichtet
 *  - Songaufbau aus Liedtext-Zeitstempeln (wiederholte Zeilen = Refrain), sonst Standard-Aufbau
 * Koordinaten: Figur schaut nach +z (zum Publikum), ihre linke Seite ist +x (= rechts im Bild). */
const GACore = (() => {
  'use strict';
  const D2R = Math.PI / 180, clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  function rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- Pose & Skelett ---------- */
  // Arm: E = Hebung (0 hängt, 90 waagerecht, 180 oben), Z = Richtung (0 seitlich, 90 nach vorn, >90 vor den Körper, <0 nach hinten),
  // e = Ellbogen-Beugung, r = Beuge-Richtung des Unterarms (0 nach oben, 90 nach vorn, -90 nach innen, 180 nach unten)
  // Bein: E = Hebung, Z = Richtung (90 vorn, 0 seitlich, -90 hinten), k = Knie.  Körper: bx/bz Versatz, ry Drehung, tilt Seitneigung,
  // lean Vorneigung, hip Hüftschwung, hy/ht Kopf drehen/neigen, jump Sprunghöhe
  const NEUTRAL = { aEL: 14, aZL: 10, eL: 18, rL: 90, aER: 14, aZR: 10, eR: 18, rR: 90, lEL: 4, lZL: 0, kL: 4, lER: 4, lZR: 0, kR: 4, bx: 0, bz: 0, ry: 0, tilt: 0, lean: 0, hip: 0, hy: 0, ht: 0, jump: 0 };
  const KEYS = Object.keys(NEUTRAL);
  const SWAP = { aEL: 'aER', aZL: 'aZR', eL: 'eR', rL: 'rR', lEL: 'lER', lZL: 'lZR', kL: 'kR' }; for (const k in SWAP) SWAP[SWAP[k]] = k;
  const NEG = { bx: 1, ry: 1, tilt: 1, hip: 1, hy: 1, ht: 1 };
  function mirrorPose(p) { const o = {}; for (const k in p) { const t = SWAP[k] || k; o[t] = NEG[k] ? -p[k] : p[k]; } return o; }
  const L = { pelvis: 1.0, spine: .46, neck: .1, head: .13, sh: .19, ua: .29, fa: .27, hand: .09, hipW: .1, th: .45, sn: .45, foot: .17 };
  const V = (x, y, z) => [x, y, z], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = a => Math.hypot(a[0], a[1], a[2]), norm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  // Rotationsmatrizen (Zeilen) – nur das Nötigste
  const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
  const rotZ = a => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
  const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, -s], [0, s, c]]; };
  const mm = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  const mv = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
  const sph = (side, E, Z) => { const e = E * D2R, z = Z * D2R; return [side * Math.sin(e) * Math.cos(z), -Math.cos(e), Math.sin(e) * Math.sin(z)]; };
  function bend(dir, ang, ref, fallback) { let q = add(ref, mul(dir, -dot(ref, dir))); if (len(q) < .15) q = add(fallback, mul(dir, -dot(fallback, dir))); q = norm(q); const a = ang * D2R; return norm(add(mul(dir, Math.cos(a)), mul(q, Math.sin(a)))); }
  const elbowRef = (side, r) => { const a = r * D2R; return norm([r < 0 ? -side * Math.sin(-a) : 0, Math.cos(a), r > 0 ? Math.sin(a) : 0]); };
  // Gelenkpunkte (Welt) aus einer Pose
  function joints(p) {
    p = Object.assign({}, NEUTRAL, p);
    const R0 = mm(rotY(p.ry * D2R), rotZ(p.hip * -.6 * D2R)), R1 = mm(R0, mm(rotZ(p.tilt * D2R), rotX(p.lean * D2R)));
    const J = {}; const pel = V(p.bx + p.hip, 0, p.bz); J.pelvis = pel;
    J.chest = add(pel, mv(R1, [0, L.spine, 0])); J.neck = add(J.chest, mv(R1, [0, L.neck, 0]));
    J.head = add(J.neck, mv(mm(R1, mm(rotY(p.hy * D2R), rotZ(p.ht * D2R))), [0, L.head, .01]));
    for (const [s, side] of [['L', 1], ['R', -1]]) {
      const sh = add(J.chest, mv(R1, [side * L.sh, -.03, 0])); J['sh' + s] = sh;
      const ud = mv(R1, sph(side, p['aE' + s], p['aZ' + s])), el = add(sh, mul(ud, L.ua)); J['el' + s] = el;
      const fd = bend(ud, p['e' + s], mv(R1, elbowRef(side, p['r' + s])), mv(R1, [0, 0, 1])), wr = add(el, mul(fd, L.fa)); J['wr' + s] = wr; J['ha' + s] = add(wr, mul(fd, L.hand));
      const hp = add(pel, mv(R0, [side * L.hipW, -.04, 0])); J['hp' + s] = hp;
      const td = mv(R0, sph(side, p['lE' + s], p['lZ' + s] === 0 && p['lE' + s] > 30 ? 0 : p['lZ' + s])), kn = add(hp, mul(td, L.th)); J['kn' + s] = kn;
      const sd = bend(td, p['k' + s], mv(R0, [0, 0, -1]), mv(R0, [0, -1, 0])), an = add(kn, mul(sd, L.sn)); J['an' + s] = an;
      J['to' + s] = add(an, mv(R0, [0, -.04, L.foot]));
    }
    // auf den Boden stellen: tiefster Knöchel 0.08 über dem Boden (+ Sprung)
    const low = Math.min(J.anL[1], J.anR[1]), dy = .08 - low + Math.max(0, p.jump);
    for (const k in J) J[k] = [J[k][0], J[k][1] + dy, J[k][2]];
    return J;
  }
  const SEGS = [['shL', 'elL'], ['elL', 'wrL'], ['shR', 'elR'], ['elR', 'wrR'], ['hpL', 'knL'], ['knL', 'anL'], ['hpR', 'knR'], ['knR', 'anR'], ['pelvis', 'neck']];

  /* ---------- Bewegungs-Bibliothek ---------- */
  // Kurzschreibweise: arm(E, Z, e, r)
  const A = (E, Z, e, r) => ({ E, Z, e: e || 0, r: r === undefined ? 0 : r });
  const SH = { // Arm-Haltungen
    down: A(14, 10, 18, 90), side: A(90, 0, 4, 90), up: A(176, 0, 4, 0), vup: A(150, 10, 4, 0), fwd: A(90, 90, 4, 90), fwdUp: A(130, 80, 4, 0), fwdDown: A(45, 80, 0, 90),
    flex: A(90, 0, 105, 0), hip: A(32, -25, 105, -90), chest: A(35, 70, 125, -90), cross: A(70, 145, 15, 90), punchUp: A(168, 25, 0, 0), punchFwd: A(85, 88, 0, 90),
    pointDiag: A(145, 25, 0, 0), pointLow: A(40, 30, 0, 90), robot: A(85, 88, 90, 0), robotDown: A(85, 88, 90, 180), elbowBack: A(25, -60, 95, 90), swingFwd: A(60, 85, 40, 0),
    headTouch: A(150, 40, 120, -90), wave: A(160, 10, 40, -90), clapUp: A(165, 35, 15, -90), clapFwd: A(80, 115, 10, -90), shoulder: A(30, 40, 140, 0), wing: A(35, 0, 110, 180),
    bigCircleA: A(150, 60, 10, 0), bigCircleB: A(60, -20, 10, 0), lowSide: A(50, 0, 6, 90), muscleUp: A(150, 0, 100, -90), steer: A(70, 100, 80, -90), row: A(55, 75, 95, 90),
  };
  const ARMS = {}; // name → { b: Takte, keys: [[t, links, rechts]], st: Stile, en: Energie }
  const defA = (n, b, st, en, keys) => { ARMS[n] = { n, b, st, en, keys }; };
  defA('klatschOben', 2, 'pop kids party fitness', 2, [[0, 'side', 'side'], [.5, 'clapUp', 'clapUp'], [1, 'side', 'side'], [1.5, 'clapUp', 'clapUp']]);
  defA('klatschVorn', 1, 'kids party line', 1, [[0, 'lowSide', 'lowSide'], [.5, 'clapFwd', 'clapFwd']]);
  defA('discoZeig', 2, 'disco pop party', 2, [[0, 'pointLow', 'hip'], [1, 'pointDiag', 'hip']]);
  defA('discoKreuz', 2, 'disco', 2, [[0, 'pointDiag', 'hip'], [1, 'cross', 'hip']]);
  defA('boxen', 2, 'fitness hiphop', 3, [[0, 'chest', 'chest'], [.5, 'punchFwd', 'chest'], [1, 'chest', 'chest'], [1.5, 'chest', 'punchFwd']]);
  defA('boxenOben', 2, 'fitness party', 3, [[0, 'flex', 'flex'], [.5, 'punchUp', 'flex'], [1, 'flex', 'flex'], [1.5, 'flex', 'punchUp']]);
  defA('roboter', 2, 'hiphop kpop kids', 2, [[0, 'robot', 'robotDown'], [1, 'robotDown', 'robot']]);
  defA('welleOben', 2, 'pop kpop party', 1, [[0, 'wave', 'down'], [.5, 'vup', 'down'], [1, 'wave', 'down'], [1.5, 'vup', 'down']]);
  defA('beideWinken', 2, 'kids party schlager', 1, [[0, 'wave', 'wave'], [1, 'vup', 'vup']]);
  defA('tKreuz', 2, 'pop fitness', 2, [[0, 'side', 'side'], [1, 'cross', 'cross']]);
  defA('hochRunter', 2, 'fitness party kids', 3, [[0, 'up', 'up'], [1, 'down', 'down']]);
  defA('vSchwung', 2, 'pop party', 2, [[0, 'vup', 'vup'], [1, 'lowSide', 'lowSide']]);
  defA('flugel', 2, 'kids party', 2, [[0, 'wing', 'wing'], [.5, 'down', 'down'], [1, 'wing', 'wing'], [1.5, 'down', 'down']]);
  defA('schultern', 2, 'hiphop kpop', 1, [[0, 'shoulder', 'down'], [1, 'down', 'shoulder']]);
  defA('ellbogenPumpe', 2, 'hiphop fitness', 2, [[0, 'elbowBack', 'elbowBack'], [.5, 'swingFwd', 'swingFwd']]);
  defA('laufArme', 1, 'fitness line', 2, [[0, 'swingFwd', 'elbowBack'], [.5, 'elbowBack', 'swingFwd']]);
  defA('kopfFass', 2, 'kpop pop', 1, [[0, 'headTouch', 'down'], [1, 'headTouch', 'headTouch']]);
  defA('muskeln', 2, 'fitness hiphop party', 2, [[0, 'flex', 'flex'], [1, 'muscleUp', 'muscleUp']]);
  defA('lenkrad', 2, 'kids party', 1, [[0, 'steer', 'steer'], [1, 'steer', 'steer']]);
  defA('rudern', 2, 'fitness', 2, [[0, 'fwd', 'fwd'], [1, 'row', 'row']]);
  defA('kreisGross', 4, 'pop latin', 2, [[0, 'bigCircleB', 'bigCircleB'], [1, 'side', 'side'], [2, 'bigCircleA', 'bigCircleA'], [3, 'up', 'up']]);
  defA('nachVorn', 2, 'pop kpop', 2, [[0, 'chest', 'chest'], [1, 'fwd', 'fwd']]);
  defA('stossVorn', 2, 'latin fitness', 2, [[0, 'hip', 'hip'], [1, 'punchFwd', 'punchFwd']]);
  defA('hueftHaende', 2, 'latin line schlager', 1, [[0, 'hip', 'hip'], [1, 'hip', 'hip']]);
  defA('salsaArme', 2, 'latin', 1, [[0, 'lowSide', 'chest'], [1, 'chest', 'lowSide']]);
  defA('zeigVorn', 2, 'pop hiphop kpop', 2, [[0, 'punchFwd', 'hip'], [1, 'hip', 'punchFwd']]);
  defA('hochKlatsch', 4, 'party schlager line', 2, [[0, 'up', 'up'], [1, 'clapUp', 'clapUp'], [2, 'up', 'up'], [3, 'clapUp', 'clapUp']]);
  defA('schwimmen', 4, 'kids pop', 2, [[0, 'fwd', 'fwd'], [1, 'side', 'side'], [2, 'fwd', 'fwd'], [3, 'lowSide', 'lowSide']]);
  defA('kpopHerz', 2, 'kpop', 1, [[0, 'chest', 'chest'], [1, 'headTouch', 'headTouch']]);
  defA('vogue', 4, 'disco pop', 2, [[0, 'flex', 'side'], [1, 'side', 'flex'], [2, 'headTouch', 'chest'], [3, 'chest', 'headTouch']]);
  defA('hammer', 2, 'party hiphop', 3, [[0, 'up', 'up'], [.75, 'fwdDown', 'fwdDown']]);
  defA('fliegen', 4, 'kids', 1, [[0, 'side', 'side'], [1, 'lowSide', 'vup'], [2, 'side', 'side'], [3, 'vup', 'lowSide']]);
  defA('pistole', 2, 'hiphop disco', 2, [[0, 'punchFwd', 'punchFwd'], [1, 'chest', 'chest']]);
  defA('pendel', 2, 'line schlager', 1, [[0, 'swingFwd', 'swingFwd'], [1, 'elbowBack', 'elbowBack']]);
  defA('locker', 1, 'all', 1, [[0, 'down', 'down'], [.5, 'lowSide', 'lowSide']]);
  // Schritte (Beine + Körper): keys [t, pose-Teil]
  const STEPS = {};
  const defS = (n, b, st, en, keys) => { STEPS[n] = { n, b, st, en, keys }; };
  defS('wippen', 1, 'all', 1, [[0, { kL: 25, kR: 25, lEL: 12, lER: 12, lZL: 60, lZR: 60 }], [.5, { kL: 4, kR: 4 }]]);
  defS('seitTipp', 2, 'pop kids party line schlager', 1, [[0, { bx: -.22, lEL: 22, lZL: 0, kL: 10, kR: 18 }], [.5, { bx: -.22, kR: 4 }], [1, { bx: .22, lER: 22, lZR: 0, kR: 10, kL: 18 }], [1.5, { bx: .22, kL: 4 }]]);
  defS('marsch', 2, 'fitness kids party', 2, [[0, { lEL: 55, lZL: 90, kL: 75 }], [.5, {}], [1, { lER: 55, lZR: 90, kR: 75 }], [1.5, {}]]);
  defS('knieHoch', 2, 'fitness party', 3, [[0, { lEL: 85, lZL: 90, kL: 95, lean: -5 }], [.5, {}], [1, { lER: 85, lZR: 90, kR: 95, lean: -5 }], [1.5, {}]]);
  defS('kickVorn', 2, 'fitness line party', 3, [[0, { lEL: 55, lZL: 90, kL: 5 }], [.5, {}], [1, { lER: 55, lZR: 90, kR: 5 }], [1.5, {}]]);
  defS('fersenTipp', 2, 'line schlager kids', 1, [[0, { lEL: 25, lZL: 90, kL: 0, kR: 15 }], [.5, {}], [1, { lER: 25, lZR: 90, kR: 0, kL: 15 }], [1.5, {}]]);
  defS('hampelmann', 2, 'fitness kids', 3, [[0, { lEL: 26, lER: 26, lZL: 0, lZR: 0, jump: .12 }], [.5, { jump: 0 }], [1, { jump: .1 }], [1.5, { lEL: 4, lER: 4 }]]);
  defS('kniebeuge', 2, 'fitness hiphop', 2, [[0, { lEL: 40, lER: 40, lZL: 50, lZR: 50, kL: 85, kR: 85, lean: 12 }], [1, {}]]);
  defS('hueftSchwung', 2, 'latin pop kpop schlager', 1, [[0, { hip: .1, tilt: -6, kR: 20 }], [1, { hip: -.1, tilt: 6, kL: 20 }]]);
  defS('twist', 2, 'disco party kids', 2, [[0, { ry: 25, kL: 25, kR: 25, lEL: 12, lER: 12, lZL: 60, lZR: 60 }], [1, { ry: -25, kL: 25, kR: 25, lEL: 12, lER: 12, lZL: 60, lZR: 60 }]]);
  defS('ausfallSeite', 2, 'fitness hiphop', 2, [[0, { bx: -.3, lER: 32, lZR: 0, kL: 60, lEL: 30, lZL: 40 }], [1, { bx: .3, lEL: 32, lZL: 0, kR: 60, lER: 30, lZR: 40 }]]);
  defS('rueckSchritt', 2, 'pop hiphop latin', 1, [[0, { lEL: 22, lZL: -90, kR: 15, bz: -.1 }], [1, {}]]);
  defS('chaCha', 4, 'latin', 2, [[0, { bx: -.15, hip: .08, kR: 18 }], [1, { bx: .15, hip: -.08, kL: 18 }], [2, { bx: -.05, kR: 15 }], [2.5, { bx: .05, kL: 15 }], [3, { bx: 0, hip: .06 }]]);
  defS('rebote', 1, 'latin party', 2, [[0, { kL: 30, kR: 30, lEL: 15, lER: 15, lZL: 60, lZR: 60, lean: 6 }], [.5, { jump: .04 }]]);
  defS('sprung', 1, 'party fitness kids', 3, [[0, { kL: 40, kR: 40, lEL: 30, lER: 30, lZL: 80, lZR: 80 }], [.5, { jump: .22, kL: 50, kR: 50, lEL: 35, lER: 35, lZL: 90, lZR: 90 }]]);
  defS('rebe', 4, 'line schlager party', 2, [[0, { bx: -.15 }], [1, { bx: -.35, lER: 20, lZR: -40 }], [2, { bx: -.5 }], [3, { bx: -.5, lER: 30, lZR: 90 }]]);
  defS('dreher', 4, 'pop kpop disco', 2, [[0, { ry: 0 }], [1, { ry: 120 }], [2, { ry: 240 }], [3, { ry: 359 }], [3.99, { ry: 360 }]]);
  defS('wiegen', 2, 'pop schlager', 1, [[0, { tilt: 10, hip: -.04 }], [1, { tilt: -10, hip: .04 }]]);
  defS('koerperWelle', 2, 'hiphop kpop pop', 2, [[0, { lean: 18, kL: 30, kR: 30, lEL: 18, lER: 18, lZL: 90, lZR: 90 }], [1, { lean: -8 }]]);
  defS('charleston', 4, 'disco party', 2, [[0, { lEL: 40, lZL: 90, kL: 10 }], [1, {}], [2, { lER: 35, lZR: -90, kR: 20 }], [3, {}]]);
  defS('gleiten', 4, 'hiphop disco', 2, [[0, { bx: .1, kR: 25 }], [1, { bx: -.1, kL: 25 }], [2, { bx: .1, kR: 25 }], [3, { bx: -.1, kL: 25 }]]);
  const STYLES = { pop: '🎤 Pop', hiphop: '🧢 Hip-Hop', latin: '💃 Latin', kpop: '✨ K-Pop', disco: '🪩 Disco & 80er', kids: '🧸 Kids', fitness: '💪 Fitness', line: '🤠 Line Dance', party: '🎉 Party', schlager: '🍻 Schlager' };
  // Signatur-Moves (ganzer Körper, oft Gold-Moves)
  const SIG = [
    { n: 'Sternsprung', b: 2, st: 'kids fitness party', gold: 1, keys: [[0, { aEL: 40, aER: 40, kL: 45, kR: 45, lEL: 30, lER: 30, lZL: 80, lZR: 80 }], [1, { aEL: 150, aER: 150, aZL: 0, aZR: 0, lEL: 30, lER: 30, lZL: 0, lZR: 0, jump: .25, eL: 0, eR: 0 }]] },
    { n: 'Disco-Fieber', b: 4, st: 'disco pop', gold: 1, keys: [[0, { aEL: 150, aZL: 25, eL: 0, rL: 0, aER: 32, aZR: -25, eR: 105, rR: -90, hip: .08, bx: .1 }], [2, { aEL: 40, aZL: 150, eL: 0, aER: 32, aZR: -25, eR: 105, rR: -90, hip: -.08, bx: -.1, kL: 25 }], [3.5, { aEL: 160, aZL: 25, eL: 0, aER: 32, eR: 105, rR: -90, aZR: -25 }]] },
    { n: 'Lasso', b: 4, st: 'line schlager party', gold: 0, keys: [[0, { aEL: 160, aZL: 10, eL: 50, rL: -90, aER: 32, aZR: -25, eR: 105, rR: -90 }], [1, { aEL: 160, aZL: 60, eL: 50, rL: -90, aER: 32, aZR: -25, eR: 105, rR: -90, kR: 20 }], [2, { aEL: 160, aZL: 120, eL: 50, rL: -90, aER: 32, aZR: -25, eR: 105, rR: -90 }], [3, { aEL: 160, aZL: 60, eL: 50, rL: -90, aER: 32, aZR: -25, eR: 105, rR: -90, kL: 20 }]] },
    { n: 'Superheld', b: 2, st: 'kids fitness hiphop', gold: 1, keys: [[0, { aEL: 30, aZL: 70, eL: 120, rL: -90, aER: 30, aZR: 70, eR: 120, rR: -90, kL: 20, kR: 20 }], [1, { aEL: 170, aZL: 20, eL: 0, aER: 32, aZR: -25, eR: 105, rR: -90, bx: .25, lER: 32, lZR: 0, kL: 55, lEL: 25, lZL: 40 }]] },
    { n: 'Windmühle', b: 4, st: 'fitness party pop', gold: 0, keys: [[0, { aEL: 175, aER: 10, lEL: 15, lER: 15 }], [1, { aEL: 90, aER: 90, aZL: 0, aZR: 0, tilt: 15 }], [2, { aEL: 10, aER: 175, tilt: 0 }], [3, { aEL: 90, aER: 90, tilt: -15 }]] },
    { n: 'Floss', b: 2, st: 'kids hiphop party', gold: 0, keys: [[0, { aEL: 30, aZL: -40, eL: 5, aER: 30, aZR: -40, eR: 5, hip: .12 }], [.5, { aEL: 30, aZL: 140, eL: 5, aER: 30, aZR: -40, eR: 5, hip: -.12 }], [1, { aEL: 30, aZL: 140, eL: 5, aER: 30, aZR: 140, eR: 5, hip: .12 }], [1.5, { aEL: 30, aZL: -40, eL: 5, aER: 30, aZR: 140, eR: 5, hip: -.12 }]] },
    { n: 'Stierhörner', b: 2, st: 'latin party', gold: 0, keys: [[0, { aEL: 150, aZL: 40, eL: 110, rL: -90, aER: 150, aZR: 40, eR: 110, rR: -90, lean: 15, kL: 30, kR: 30 }], [1, { aEL: 150, aZL: 40, eL: 110, rL: -90, aER: 150, aZR: 40, eR: 110, rR: -90, lean: 25, bz: .15, kL: 30, kR: 30 }]] },
    { n: 'Herz-Pose', b: 2, st: 'kpop pop kids', gold: 1, keys: [[0, { aEL: 60, aZL: 80, eL: 90, aER: 60, aZR: 80, eR: 90 }], [1, { aEL: 160, aZL: 30, eL: 115, rL: -90, aER: 160, aZR: 30, eR: 115, rR: -90, tilt: 8 }]] },
    { n: 'Diva', b: 4, st: 'disco pop kpop', gold: 1, keys: [[0, { aEL: 32, aZL: -25, eL: 105, rL: -90, aER: 120, aZR: 70, eR: 120, rR: -90, hip: .12, ht: -10 }], [2, { aEL: 32, aZL: -25, eL: 105, rL: -90, aER: 160, aZR: 10, eR: 30, rR: -90, hip: -.12, ht: 10, ry: -20 }]] },
    { n: 'Schaufeln', b: 2, st: 'party schlager', gold: 0, keys: [[0, { aEL: 40, aZL: 90, eL: 20, aER: 40, aZR: 90, eR: 20, lean: 25, kL: 40, kR: 40, lEL: 30, lER: 30, lZL: 90, lZR: 90 }], [1, { aEL: 150, aZL: 60, eL: 20, aER: 150, aZR: 60, eR: 20, lean: -8, ry: 30 }]] },
    { n: 'Kickbox-Kombi', b: 4, st: 'fitness hiphop', gold: 1, keys: [[0, { aEL: 35, aZL: 70, eL: 125, rL: -90, aER: 35, aZR: 70, eR: 125, rR: -90, kL: 25, kR: 25 }], [1, { aEL: 85, aZL: 88, eL: 0, aER: 35, aZR: 70, eR: 125, rR: -90, ry: -20 }], [2, { aEL: 35, aZL: 70, eL: 125, rL: -90, aER: 85, aZR: 88, eR: 0, ry: 20 }], [3, { aEL: 35, aZL: 70, eL: 125, rL: -90, aER: 35, aZR: 70, eR: 125, rR: -90, lEL: 75, lZL: 90, kL: 5 }]] },
    { n: 'Pferdchen', b: 2, st: 'kids line party', gold: 0, keys: [[0, { aEL: 60, aZL: 90, eL: 60, aER: 60, aZR: 90, eR: 60, kL: 35, kR: 35, lEL: 25, lER: 25, lZL: 60, lZR: 60 }], [.5, { jump: .12, lEL: 40, lZL: 90, kL: 60 }], [1, { kL: 35, kR: 35, lEL: 25, lER: 25, lZL: 60, lZR: 60, aEL: 60, aZL: 90, eL: 60, aER: 60, aZR: 90, eR: 60 }], [1.5, { jump: .12, lER: 40, lZR: 90, kR: 60, aEL: 60, aZL: 90, eL: 60, aER: 60, aZR: 90, eR: 60 }]] },
    { n: 'Sonnengruß', b: 4, st: 'pop schlager latin', gold: 1, keys: [[0, { aEL: 20, aER: 20, kL: 20, kR: 20 }], [2, { aEL: 175, aER: 175, aZL: 20, aZR: 20, eL: 0, eR: 0, ht: 0, lean: -10 }], [3.5, { aEL: 160, aER: 160, aZL: 30, aZR: 30, eL: 0, eR: 0, lean: -12 }]] },
    { n: 'Schulter-Shimmy', b: 2, st: 'latin disco kpop', gold: 0, keys: [[0, { aEL: 50, aZL: 30, eL: 80, aER: 50, aZR: 30, eR: 80, ry: 10, lean: 10 }], [.25, { ry: -10, aEL: 50, aZL: 30, eL: 80, aER: 50, aZR: 30, eR: 80, lean: 10 }], [.5, { ry: 10, aEL: 50, aZL: 30, eL: 80, aER: 50, aZR: 30, eR: 80, lean: 12 }], [.75, { ry: -10, aEL: 50, aZL: 30, eL: 80, aER: 50, aZR: 30, eR: 80, lean: 14 }], [1.5, { aEL: 160, aZL: 20, aER: 160, aZR: 20, eL: 10, eR: 10, lean: -6 }]] },
    { n: 'Siegerpose', b: 4, st: 'all', gold: 1, keys: [[0, { aEL: 30, aER: 30, kL: 30, kR: 30, lEL: 20, lER: 20, lZL: 70, lZR: 70 }], [1, { aEL: 165, aZL: 20, eL: 0, aER: 165, aZR: 20, eR: 0, lEL: 28, lER: 28, lZL: 0, lZR: 0, jump: .2 }], [3.9, { aEL: 165, aZL: 20, eL: 0, aER: 165, aZR: 20, eR: 0, lEL: 28, lER: 28, lZL: 0, lZR: 0 }]] },
  ];
  // Arm-Haltung → Pose-Teil
  function armPose(lk, rk) { const l = SH[lk], r = SH[rk]; return { aEL: l.E, aZL: l.Z, eL: l.e, rL: l.r, aER: r.E, aZR: r.Z, eR: r.e, rR: r.r }; }
  function keysOf(mv) { // einheitliche Keyframes [t, pose]
    if (mv.kind === 'sig') return mv.def.keys.map(([t, p]) => [t, Object.assign({}, p)]);
    const a = mv.arm, s = mv.step, b = mv.b, ts = new Set();
    for (let off = 0; off < b; off += a.b) a.keys.forEach(k => ts.add(+(off + k[0]).toFixed(3)));
    for (let off = 0; off < b; off += s.b) s.keys.forEach(k => ts.add(+(off + k[0]).toFixed(3)));
    const sample = (keys, len, t) => { const u = t % len; let k = keys[0]; for (const x of keys) if (x[0] <= u + 1e-6) k = x; return k; };
    return Array.from(ts).sort((x, y) => x - y).map(t => { const ak = sample(a.keys, a.b, t), sk = sample(s.keys, s.b, t); return [t, Object.assign({}, sk[1], armPose(ak[1], ak[2]))]; });
  }
  // Zwischen Keyframes weich überblenden (Haltepunkte = Treffer zum Bewerten)
  const ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  function poseAt(mv, u) {
    const K = mv.keys; let i = 0; while (i + 1 < K.length && K[i + 1][0] <= u) i++;
    const a = Object.assign({}, NEUTRAL, K[i][1]); if (i + 1 >= K.length) { const nx = Object.assign({}, NEUTRAL, K[0][1]); const span = mv.b - K[i][0]; return lerpPose(a, nx, span > 0 ? ease(clamp((u - K[i][0]) / span, 0, 1)) * (mv.kind === 'sig' ? 0 : 1) : 0, mv); }
    const b = Object.assign({}, NEUTRAL, K[i + 1][1]), span = K[i + 1][0] - K[i][0], k = ease(clamp((u - K[i][0]) / span, 0, 1));
    return lerpPose(a, b, k, mv);
  }
  function lerpPose(a, b, k, mv) { const o = {}; for (const key of KEYS) { let x = a[key], y = b[key]; if (key === 'ry' && mv && Math.abs(y - x) > 180 && mv.n !== 'dreher') { /* kürzester Weg */ } o[key] = x + (y - x) * k; } if (o.ry >= 359.5) o.ry = 0; return o; }
  function finalize(mv, mirror) { mv.keys = keysOf(mv); if (mirror) mv.keys = mv.keys.map(([t, p]) => [t, mirrorPose(p)]); mv.mirror = !!mirror; mv.hits = mv.keys.map(k => k[0]).filter(t => t < mv.b - 1e-6); return mv; }

  /* ---------- Choreograf ---------- */
  const GENRE2STYLE = [[/hip.?hop|rap|r&b|trap/i, 'hiphop'], [/latin|reggae|salsa|bachata|cumbia|samba|urbano/i, 'latin'], [/k-?pop|j-?pop/i, 'kpop'], [/disco|funk|80|dance|electronic|house/i, 'disco'], [/kinder|children|kids/i, 'kids'], [/schlager|volks|party|stimmung/i, 'schlager'], [/country/i, 'line'], [/fitness|workout|zumba/i, 'fitness'], [/pop|rock|alternative/i, 'pop']];
  const styleOf = genre => { for (const [re, s] of GENRE2STYLE) if (re.test(genre || '')) return s; return 'pop'; };
  // Song-eigene Moves: für jeden Song (Seed) neu erfundene Bewegungen – Arm-Haltungen aus der Bibliothek, zufällig verändert und
  // zu 2–4 Haltepunkten verbunden, dazu passende Beinarbeit. So hat jeder Song und jeder Modus eigene Moves, nicht nur andere Kombinationen.
  const ADJ = ['Funky', 'Wilder', 'Sternen', 'Turbo', 'Glitzer', 'Wirbel', 'Neon', 'Blitz', 'Groove', 'Sonnen', 'Wolken', 'Disco', 'Raketen', 'Zauber', 'Party', 'Mond'];
  const NOUN = ['Welle', 'Schwung', 'Kick', 'Klatsch', 'Dreh', 'Stoß', 'Schritt', 'Flügel', 'Kreis', 'Zacke', 'Pose', 'Hüpfer', 'Wippe', 'Fächer', 'Schlag', 'Funke'];
  const MODE_STEP = { radio: ['wippen', 'seitTipp', 'hueftSchwung', 'twist'], video: ['wippen', 'seitTipp'] };
  function genMoves(seed, style, n, mode) {
    const r = rng(seed ^ 0x5bd1e995), shapes = Object.keys(SH), out = [], used = new Set(); const okS = d => d.st === 'all' || d.st.split(' ').includes(style);
    const stepsAll = Object.values(STEPS).filter(okS), modeSteps = (MODE_STEP[mode] || []).map(k => STEPS[k]).filter(Boolean), steps = modeSteps.length ? stepsAll.concat(modeSteps, modeSteps) : stepsAll;
    const jit = (v, a, lo, hi) => clamp(Math.round(v + (r() - .5) * 2 * a), lo, hi);
    const arm = () => { const b = SH[shapes[(r() * shapes.length) | 0]]; return { E: jit(b.E, 22, 5, 178), Z: jit(b.Z, 28, -60, 160), e: jit(b.e, 25, 0, 145), r: b.r }; };
    for (let i = 0; i < n; i++) {
      const b = r() < .55 ? 2 : 4, nk = b === 2 ? 2 + ((r() * 2) | 0) : 2 + ((r() * 3) | 0), mirrorArms = r() < .35, st = steps[(r() * steps.length) | 0], keys = [];
      for (let k = 0; k < nk; k++) { const t = +(k * b / nk).toFixed(3), L0 = arm(), R0 = mirrorArms ? Object.assign({}, L0) : arm(), sk = st.keys[k % st.keys.length][1];
        keys.push([t, Object.assign({}, sk, { aEL: L0.E, aZL: L0.Z, eL: L0.e, rL: L0.r, aER: R0.E, aZR: R0.Z, eR: R0.e, rR: R0.r }, r() < .25 ? { tilt: jit(0, 12, -14, 14) } : {}, r() < .2 ? { hip: (r() - .5) * .2 } : {})]); }
      let nm; do { nm = ADJ[(r() * ADJ.length) | 0] + '-' + NOUN[(r() * NOUN.length) | 0]; } while (used.has(nm) && used.size < 200); used.add(nm);
      out.push({ n: nm, b, st: style, gold: r() < .3, gen: true, keys });
    }
    return out;
  }
  function pool(style, r, gen) { const ok = d => d.st === 'all' || d.st.split(' ').includes(style); return { arms: Object.values(ARMS).filter(ok), steps: Object.values(STEPS).filter(ok), sigs: SIG.filter(ok), gen: gen || [] }; }
  function pickMove(P, r, opt) { // eine Bewegung erzeugen (Arm × Schritt oder Signatur)
    opt = opt || {};
    if (P.gen.length && (opt.own || r() < .42)) { const g = P.gen.filter(x => x.b <= (opt.maxB || 4) && (!opt.gold || x.gold)); const d = g.length ? g : P.gen.filter(x => x.b <= (opt.maxB || 4)); if (d.length) { const s = d[(r() * d.length) | 0]; return finalize({ kind: 'sig', n: s.n, def: s, b: s.b, gold: !!opt.gold, own: true }, r() < .5); } }
    if ((opt.sig || r() < .14) && P.sigs.length) { const d = opt.gold ? (P.sigs.filter(s => s.gold).length ? P.sigs.filter(s => s.gold) : P.sigs) : P.sigs; const s = d[(r() * d.length) | 0]; return finalize({ kind: 'sig', n: s.n, def: s, b: s.b, gold: !!opt.gold }, r() < .5); }
    const maxB = opt.maxB || 4, arms = P.arms.filter(a => a.b <= maxB), steps = P.steps.filter(s => s.b <= maxB);
    const a = arms[(r() * arms.length) | 0], s = steps.filter(x => Math.abs(x.en - a.en) <= 1 || r() < .25)[(r() * steps.length) | 0] || steps[(r() * steps.length) | 0];
    const b = Math.max(a.b, s.b, opt.minB || 2); return finalize({ kind: 'combo', n: a.n + '+' + s.n, arm: a, step: s, b, en: Math.max(a.en, s.en) }, r() < .5);
  }
  // eine Phrase = 8 Schläge, aus Moves zusammengesetzt (typisch: Move + gespiegelt, wie im Tanzkurs)
  function phrase(P, r, opt) {
    const out = []; let t = 0; opt = opt || {};
    while (t < 8) { const rest = 8 - t; let mv = pickMove(P, r, { maxB: Math.min(4, rest), sig: opt.sig && t === 0, own: opt.own && t === 0 }); if (mv.b > rest) mv = pickMove(P, r, { maxB: rest });
      if (mv.b > rest) { mv = finalize({ kind: 'combo', n: 'locker+wippen', arm: ARMS.locker, step: STEPS.wippen, b: rest, en: 1 }); }
      out.push(mv); t += mv.b;
      if (t + mv.b <= 8 && r() < .7) { out.push(finalize(Object.assign({}, mv, { keys: null }), !mv.mirror)); t += mv.b; } }
    return out;
  }
  // Songaufbau: Abschnitte in Phrasen (je 8 Schläge)
  function structure(nPh, sections, r) {
    const lab = new Array(nPh).fill('verse');
    if (sections && sections.length) { for (const s of sections) for (let i = Math.max(0, s.p0); i < Math.min(nPh, s.p1); i++) lab[i] = s.type; }
    else { // Standard: Intro 1, dann (Strophe 4, Refrain 4)*, Bridge 2 nach dem 2. Refrain, letzter Refrain, Outro 1
      let i = 0; lab[i++] = 'intro'; let ch = 0;
      while (i < nPh - 1) { for (let k = 0; k < 4 && i < nPh - 1; k++) lab[i++] = 'verse'; for (let k = 0; k < 4 && i < nPh - 1; k++) lab[i++] = 'chorus'; ch++; if (ch === 2) for (let k = 0; k < 2 && i < nPh - 1; k++) lab[i++] = 'bridge'; }
    }
    lab[0] = lab[0] === 'chorus' ? 'chorus' : 'intro'; lab[nPh - 1] = 'outro'; return lab;
  }
  // Hauptfunktion: komplette Choreografie für einen Song
  // song: { id, dur (s), bpm, beat0 (s, Zeit des ersten Schlags), style?, genre?, sections? [{t0,t1,type}] }
  function choreograph(song) {
    const style = song.style || styleOf(song.genre), seed = hash((song.id || 'x') + '|' + style + '|' + (song.mode || '')), r = rng(seed), own = genMoves(seed, style, 8, song.mode), P = pool(style, r, own);
    const spb = 60 / song.bpm, nBeats = Math.max(16, Math.floor((song.dur - song.beat0) / spb)), nPh = Math.max(2, Math.ceil(nBeats / 8));
    const secs = song.sections ? song.sections.map(s => ({ type: s.type, p0: Math.round((s.t0 - song.beat0) / spb / 8), p1: Math.round((s.t1 - song.beat0) / spb / 8) })) : null;
    const lab = structure(nPh, secs, r);
    // feste Routinen: Refrain (4 Phrasen, immer gleich), Strophe A/B, Bridge
    const chorus = [phrase(P, r, { own: true }), phrase(P, r, { own: true }), phrase(P, r), phrase(P, r, { own: true })]; const g = pickMove(P, r, { sig: true, gold: true }); chorus[3] = chorus[3].slice(0, 0); let tt = 0; const c3 = []; while (tt + g.b < 8) { const m = pickMove(P, r, { maxB: Math.min(4, 8 - g.b - tt) }); if (tt + m.b > 8 - g.b) break; c3.push(m); tt += m.b; } while (tt < 8 - g.b) { c3.push(finalize({ kind: 'combo', n: 'locker+wippen', arm: ARMS.locker, step: STEPS.wippen, b: 1, en: 1 })); tt += 1; } c3.push(g); chorus[3] = c3;
    const verseA = [phrase(P, r), phrase(P, r), phrase(P, r), phrase(P, r)], verseB = [verseA[0], verseA[1], phrase(P, r), phrase(P, r)], bridge = [phrase(P, r, { sig: true }), phrase(P, r, { sig: true })];
    const introPh = [finalize({ kind: 'combo', n: 'locker+wippen', arm: ARMS.locker, step: STEPS.wippen, b: 8, en: 1 })], outroPh = [pickMove(P, r, { sig: true, gold: true }), finalize({ kind: 'sig', n: 'Siegerpose', def: SIG.find(s => s.n === 'Siegerpose'), b: 4, gold: true })];
    const list = []; let verseN = 0, chorusIdx = 0, verseIdx = 0, bridgeIdx = 0, prev = '';
    for (let p = 0; p < nPh; p++) {
      const L0 = lab[p]; if (L0 !== prev) { if (L0 === 'chorus') chorusIdx = 0; if (L0 === 'verse') { verseIdx = 0; verseN++; } if (L0 === 'bridge') bridgeIdx = 0; } prev = L0;
      let ph = L0 === 'intro' ? introPh : L0 === 'outro' ? fitOutro(outroPh) : L0 === 'chorus' ? chorus[chorusIdx++ % 4] : L0 === 'bridge' ? bridge[bridgeIdx++ % 2] : (verseN % 2 ? verseA : verseB)[verseIdx++ % 4];
      let t = p * 8; for (const mv of ph) { list.push({ b0: t, mv, sec: L0, gold: !!mv.gold }); t += mv.b; }
    }
    function fitOutro(ph) { const tot = ph.reduce((s, m) => s + m.b, 0); if (tot === 8) return ph; return ph.slice(-1).concat([finalize({ kind: 'combo', n: 'locker+wippen', arm: ARMS.locker, step: STEPS.wippen, b: 8 - ph[ph.length - 1].b, en: 1 })]).reverse(); }
    return { style, seed, bpm: song.bpm, beat0: song.beat0, spb, nBeats, nPh, lab, list, dur: song.dur, golds: list.filter(x => x.gold).length, own: own.map(m => m.n) };
  }
  // Pose der Vortänzerin zur Songzeit t (Sekunden)
  function at(ch, t) {
    const bt = (t - ch.beat0) / ch.spb; if (bt < 0 || !ch.list.length) return { pose: idle(t, ch), i: -1, u: 0, bt };
    let lo = 0, hi = ch.list.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ch.list[m].b0 <= bt) lo = m; else hi = m - 1; }
    const it = ch.list[lo], u = bt - it.b0; if (u > it.mv.b + 8) return { pose: idle(t, ch), i: -1, u: 0, bt };
    let pose = poseAt(it.mv, Math.min(u, it.mv.b - 1e-3));
    // weicher Übergang in den nächsten Move (letztes Viertel-Schlag)
    const nx = ch.list[lo + 1]; if (nx && u > it.mv.b - .25) { const k = ease((u - (it.mv.b - .25)) / .25); pose = lerpPose(pose, poseAt(nx.mv, 0), k); }
    return { pose, i: lo, u, bt };
  }
  function idle(t, ch) { const bt = ch ? (t - ch.beat0) / ch.spb : t * 2; const k = (Math.sin(bt * Math.PI * 2) + 1) / 2; return Object.assign({}, NEUTRAL, { kL: 4 + k * 18, kR: 4 + k * 18, lEL: 10, lER: 10, lZL: 60, lZR: 60, hip: Math.sin(bt * Math.PI) * .04 }); }
  // Treffer-Zeitpunkte (Sekunden) für die Bewertung
  function hits(ch) { const o = []; ch.list.forEach((it, i) => { if (it.sec === 'intro') return; it.mv.hits.forEach(h => o.push({ t: ch.beat0 + (it.b0 + h) * ch.spb, i, gold: it.gold && h === it.mv.hits[it.mv.hits.length - 1] })); }); return o; }

  /* ---------- Songaufbau aus Liedtext-Zeitstempeln (LRC) ---------- */
  // lines: [{ t, text }] → Abschnitte [{ t0, t1, type }]; wiederholte Zeilen = Refrain
  function sectionsFromLyrics(lines, dur) {
    if (!lines || lines.length < 6) return null;
    const nm = s => s.toLowerCase().replace(/[^a-zäöüß0-9 ]/g, '').replace(/\s+/g, ' ').trim(), cnt = {};
    lines.forEach(l => { const k = nm(l.text); if (k.length > 3) cnt[k] = (cnt[k] || 0) + 1; });
    const rep = lines.map(l => (cnt[nm(l.text)] || 0) >= 2);
    const out = []; let cur = null;
    for (let i = 0; i < lines.length; i++) { const t = lines[i].t, nx = i + 1 < lines.length ? lines[i + 1].t : Math.min(dur, t + 6), type = rep[i] ? 'chorus' : 'verse';
      if (cur && cur.type === type && t - cur.t1 < 9) cur.t1 = nx; else { if (cur) out.push(cur); cur = { t0: t, t1: nx, type }; }
      if (i + 1 < lines.length && lines[i + 1].t - t > 14) { cur.t1 = t + 5; out.push(cur); out.push({ t0: t + 5, t1: lines[i + 1].t, type: 'bridge' }); cur = null; } }
    if (cur) out.push(cur);
    const merged = out.filter(s => s.t1 - s.t0 > 6); if (!merged.some(s => s.type === 'chorus')) return null; return merged;
  }
  function parseLRC(txt) { const o = []; String(txt || '').split(/\n/).forEach(l => { const m = l.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/); if (m) { const text = m[3].trim(); if (text) o.push({ t: +m[1] * 60 + +m[2], text }); } }); return o; }

  /* ---------- Bewertung: Kamera (Posenvergleich) ---------- */
  // Vortänzer-Segmente im Bild: Figur schaut zum Publikum, ihre linke Seite ist rechts im Bild.
  // Der Spieler macht spiegelbildlich nach (wie vor einem Spiegel): sein RECHTER Arm ↔ linker Arm der Figur.
  function coachVec(pose) { const J = joints(pose), tor = len([J.neck[0] - J.pelvis[0], J.neck[1] - J.pelvis[1], 0]) || .5; const o = {}; SEGS.forEach(([a, b]) => { o[a + b] = [(J[b][0] - J[a][0]) / tor, (J[b][1] - J[a][1]) / tor]; }); return o; }
  // MediaPipe-Punkte (normiert, Bild NICHT gespiegelt): 11/12 Schultern, 13/14 Ellbogen, 15/16 Handgelenke, 23/24 Hüfte, 25/26 Knie, 27/28 Knöchel (ungerade = links der Person)
  const LM = { shL: 11, shR: 12, elL: 13, elR: 14, wrL: 15, wrR: 16, hpL: 23, hpR: 24, knL: 25, knR: 26, anL: 27, anR: 28 };
  function userVec(lm, aspect) {
    if (!lm || lm.length < 29) return null; const P = i => [(1 - lm[i].x) * (aspect || 1), -lm[i].y, lm[i].visibility === undefined ? 1 : lm[i].visibility];
    // Spieler R ↔ Figur L: die Figur-Segmente "…L" kommen vom rechten Körperteil des Spielers
    const map = k => { const s = k.slice(-1), b = k.slice(0, -1); return LM[b + (s === 'L' ? 'R' : 'L')]; };
    const mid = (a, b) => [(P(a)[0] + P(b)[0]) / 2, (P(a)[1] + P(b)[1]) / 2, Math.min(P(a)[2], P(b)[2])];
    const neck = mid(11, 12), pel = mid(23, 24), tor = Math.hypot(neck[0] - pel[0], neck[1] - pel[1]) || .3; const o = {}, vis = {};
    SEGS.forEach(([a, b]) => { const A0 = a === 'pelvis' ? pel : P(map(a)), B0 = b === 'neck' ? neck : P(map(b)); o[a + b] = [(B0[0] - A0[0]) / tor, (B0[1] - A0[1]) / tor]; vis[a + b] = Math.min(A0[2], B0[2]); });
    o._vis = vis; return o;
  }
  const W = { shLelL: .16, elLwrL: .14, shRelR: .16, elRwrR: .14, hpLknL: .07, knLanL: .05, hpRknR: .07, knRanR: .05, pelvisneck: .16 };
  function compare(cv, uv, armsOnly) { if (!uv) return 0; let s = 0, w = 0; for (const k in W) { if (armsOnly && /kn|hp|an/.test(k)) continue; const vis = uv._vis[k]; if (vis < .4) continue; const c = cv[k], u = uv[k], d = Math.hypot(c[0] - u[0], c[1] - u[1]) / Math.max(.35, Math.hypot(c[0], c[1])); const sc = clamp(1 - (d - .18) / .62, 0, 1); s += sc * W[k]; w += W[k]; } return w > .3 ? s / w : 0; }
  // wie stark sich eine Haltung geändert hat (Arme)
  const change = (a, b) => { if (!a || !b) return 0; let d = 0; for (const k of ['shLelL', 'elLwrL', 'shRelR', 'elRwrR']) d += Math.hypot(a[k][0] - b[k][0], a[k][1] - b[k][1]); return d / 4; };
  const RATE = [[.82, 'perfekt', 'PERFEKT!', 3], [.68, 'super', 'SUPER!', 2], [.5, 'gut', 'GUT', 1], [.32, 'ok', 'OK', .5], [0, 'daneben', 'DANEBEN', 0]];
  const rate = s => RATE.find(x => s >= x[0]);

  /* ---------- Bewertung: Handy in der Hand (Bewegungssensor) ---------- */
  // Vortänzer-Hand (linke Hand der Figur = rechte Hand des Spielers) – Beschleunigung aus der Bahn
  function handAccel(ch, t0, t1, hz) { const dt = 1 / (hz || 30), pts = []; for (let t = t0 - dt; t <= t1 + dt + 1e-9; t += dt) pts.push(joints(at(ch, t).pose).haL); const o = []; for (let i = 1; i < pts.length - 1; i++) { const a = [0, 1, 2].map(j => (pts[i + 1][j] - 2 * pts[i][j] + pts[i - 1][j]) / (dt * dt)); o.push(len(a)); } return o; }
  // Ähnlichkeit zweier Stärke-Verläufe (Korrelation mit kleinem Zeitversatz + passende Wucht)
  function motionScore(coach, phone) {
    if (!coach.length || !phone.length) return 0; const n = Math.min(coach.length, phone.length), m = a => a.reduce((s, x) => s + x, 0) / a.length;
    let best = -1; for (let lag = -6; lag <= 6; lag++) { const c = [], p = []; for (let i = 0; i < n; i++) { const j = i + lag; if (j < 0 || j >= phone.length) continue; c.push(coach[i]); p.push(phone[j]); } if (c.length < 4) continue; const mc = m(c), mp = m(p); let sxy = 0, sx = 0, sy = 0; for (let i = 0; i < c.length; i++) { sxy += (c[i] - mc) * (p[i] - mp); sx += (c[i] - mc) ** 2; sy += (p[i] - mp) ** 2; } const r = sx > 1e-6 && sy > 1e-6 ? sxy / Math.sqrt(sx * sy) : 0; if (r > best) best = r; }
    const ec = m(coach.slice(0, n)), ep = m(phone.slice(0, n)), en = ec < .5 ? (ep < 3 ? 1 : .6) : clamp(Math.min(ep / ec, ec / Math.max(ep, .01)) * 1.6, 0, 1), still = ep < .6 && ec > 2;
    return still ? 0 : clamp(.55 * clamp((best + .1) / .8, 0, 1) + .45 * en, 0, 1);
  }

  /* ---------- Bewertung: Rhythmus (für Tanz-Videos ohne bekannte Choreo) ---------- */
  // energy: [{ t, e }] Bewegungsstärke; beats: Schlagzeiten → Anteil der Schläge mit einem Bewegungs-Akzent in der Nähe
  function rhythmScore(energy, beatT, win) { win = win || .14; const near = energy.filter(x => Math.abs(x.t - beatT) <= win * 2); if (near.length < 3) return 0; const mx = Math.max(...near.map(x => x.e)), base = near.reduce((s, x) => s + x.e, 0) / near.length; const pk = near.find(x => x.e === mx); if (mx < .02) return 0; const timing = clamp(1 - Math.abs(pk.t - beatT) / (win * 1.6), 0, 1), accent = clamp((mx - base) / (mx + 1e-6) * 2.2, 0, 1); return clamp(.5 * timing + .5 * accent + Math.min(.25, mx * 2), 0, 1); }

  /* ---------- Takt-Erkennung (Mikrofon) und Mitklopfen ---------- */
  // samples: [{ t, v }] Onset-Stärke (z. B. 60 Hz). Ergebnis: { bpm, beat0, conf }
  function tempo(samples, lo, hi) {
    lo = lo || 72; hi = hi || 178; if (samples.length < 60) return null; const t0 = samples[0].t, t1 = samples[samples.length - 1].t, hz = 100, n = Math.floor((t1 - t0) * hz); if (n < 300) return null;
    const g = new Float32Array(n); for (const s of samples) { const i = Math.round((s.t - t0) * hz); if (i >= 0 && i < n) g[i] = Math.max(g[i], s.v); }
    for (let i = 1; i < n; i++) g[i] = Math.max(g[i], g[i - 1] * .55); // leicht verschmieren
    let mean = 0; for (let i = 0; i < n; i++) mean += g[i]; mean /= n; for (let i = 0; i < n; i++) g[i] -= mean;
    let best = null; const cand = [];
    for (let bpm = lo; bpm <= hi; bpm += .5) { const lag = 60 / bpm * hz; let ac = 0, c = 0; for (let k = 1; k <= 4; k++) { const L0 = lag * k; for (let i = 0; i + L0 + 1 < n; i += 2) { const j = i + L0, jf = Math.floor(j), fr = j - jf; ac += g[i] * (g[jf] * (1 - fr) + g[jf + 1] * fr); c++; } } ac /= c || 1; const prior = Math.exp(-Math.pow(Math.log2(bpm / 120), 2) / (2 * .45 * .45)); cand.push({ bpm, s: ac * (.55 + .45 * prior) }); }
    cand.sort((a, b) => b.s - a.s); best = cand[0]; if (!best || best.s <= 0) return null;
    // Feinabstimmung ±1 BPM (0,05er-Schritte) und Phase per Kammfilter: die schärfste Kombination gewinnt
    const comb = (P, ph) => { let v = 0; for (let t = ph; t < t1 - t0; t += P) { const i = Math.round(t * hz); if (i < n) v += g[i]; } return v; };
    let bp = 0, bv = -1e9, fb = best.bpm;
    for (let bpm = best.bpm - 1; bpm <= best.bpm + 1.001; bpm += .05) { const P = 60 / bpm; for (let ph = 0; ph < P; ph += .01) { const v = comb(P, ph); if (v > bv) { bv = v; bp = ph; fb = bpm; } } }
    { const P = 60 / fb, c0 = bp; for (let ph = c0 - .012; ph <= c0 + .012; ph += .002) { const v = comb(P, ph); if (v > bv) { bv = v; bp = ph; } } }
    best.bpm = Math.round(fb * 100) / 100; const P = 60 / best.bpm;
    const second = cand.find(c => Math.abs(c.bpm - best.bpm) > 4 && Math.abs(c.bpm * 2 - best.bpm) > 3 && Math.abs(c.bpm / 2 - best.bpm) > 3);
    const conf = second ? clamp((best.s - second.s) / Math.abs(best.s) * 2, 0, 1) : 1;
    let beat0 = t0 + bp; while (beat0 - P > 0) beat0 -= P; return { bpm: best.bpm, beat0, conf };
  }
  // Mitklopfen: taps = Zeitpunkte (s) → lineare Regression über die Schlagnummern
  function tapTempo(taps) { if (taps.length < 4) return null; const d = []; for (let i = 1; i < taps.length; i++) d.push(taps[i] - taps[i - 1]); const med = d.slice().sort((a, b) => a - b)[d.length >> 1]; if (med < .25 || med > 1.4) return null;
    const idx = [0]; for (let i = 1; i < taps.length; i++) idx.push(idx[i - 1] + Math.max(1, Math.round((taps[i] - taps[i - 1]) / med)));
    const n = taps.length, mx = idx.reduce((s, x) => s + x, 0) / n, my = taps.reduce((s, x) => s + x, 0) / n; let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (idx[i] - mx) * (taps[i] - my); sxx += (idx[i] - mx) ** 2; } const P = sxy / sxx; let beat0 = my - P * mx; while (beat0 - P > 0) beat0 -= P; return { bpm: 60 / P, beat0, conf: 1 }; }

  return { genMoves, NEUTRAL, KEYS, L, SEGS, SH, ARMS, STEPS, SIG, STYLES, joints, mirrorPose, choreograph, at, hits, poseAt, idle, styleOf, sectionsFromLyrics, parseLRC, coachVec, userVec, compare, change, rate, RATE, handAccel, motionScore, rhythmScore, tempo, tapTempo, rng, hash, clamp };
})();
if (typeof module !== 'undefined') module.exports = GACore;
