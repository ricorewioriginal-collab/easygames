/* Bowling-Bahn 3D – Kern: Bahn- und Kegelphysik (deterministisch, ohne Zufall) und Zählweise mit 10 Frames.
 * Koordinaten: x quer (rechts +), z die Bahn hinunter (Foullinie z = 0, Kopfpin bei z = LANE_L). Einheiten in Metern.
 * Die Kugel bekommt Startpunkt, Richtung, Tempo und Effet; im trockenen Ende der Bahn biegt das Effet sie ab (Hook).
 * Kegel sind Scheiben, die sich stoßen, umfallen, rutschen, in die Rinne oder den Schacht fallen. */
(function (root) {
  'use strict';
  const LANE_L = 18.29, LANE_W = 1.054, HW = LANE_W / 2, GUT = .235, BALL_R = .108, PIN_R = .06, PIN_RD = .085, PIN_H = .381;
  const SP = .3048, ROW = SP * Math.sqrt(3) / 2, DECK_END = LANE_L + ROW * 3 + .62, OIL = 9.5, HOOK = 1.1;
  const MB = 6.5, MP = 1.55, E_BP = .72, E_PP = .62, KNOCK = .32;
  // Kegelpositionen (1 vorn; 2,3; 4,5,6; 7,8,9,10 – von links nach rechts)
  const SPOTS = []; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) SPOTS.push([(i - r / 2) * SP, LANE_L + r * ROW]);

  function newLane() { const L = { ball: null, pins: [], t: 0, after: 0, ev: [] }; rack(L); return L; }
  // full = alle 10 neu, sonst nur stehende bleiben (Abräumen)
  function rack(L, keep) {
    const old = L.pins;
    L.pins = SPOTS.map((s, i) => ({ n: i + 1, x: s[0], z: s[1], vx: 0, vz: 0, down: false, gone: false, fx: 0, fz: 0, hit: false }));
    if (keep && old.length) L.pins.forEach((p, i) => { if (old[i].down || old[i].gone) { p.down = p.gone = true; } });
    L.ball = null; L.t = 0; L.after = 0;
  }
  const standing = L => L.pins.filter(p => !p.down && !p.gone).length;
  function throwBall(L, o) {
    const sp = Math.max(4, Math.min(11, o.speed || 8)), a = Math.max(-.12, Math.min(.12, o.angle || 0));
    const x = Math.max(-HW + BALL_R, Math.min(HW - BALL_R, o.x || 0));
    L.ball = { x, z: 0, vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, spin: Math.max(-1, Math.min(1, o.spin || 0)), gutter: false, pit: false, roll: 0 };
    for (const p of L.pins) if (!p.gone && !p.down) { p.hit = false; p.x0 = p.x; p.z0 = p.z; }
    L.t = 0; L.after = 0; L.ev.push({ k: 'roll' });
  }
  // Ein Teilschritt (dt fest, z. B. 1/240 s)
  function sub(L, h) {
    const b = L.ball;
    if (b && !b.pit) {
      if (!b.gutter) {
        const f = Math.max(0, Math.min(1, (b.z - OIL) / 6)); b.vx -= b.spin * HOOK * f * h;
        const k = 1 - (f > 0 ? .05 : .015) * h; b.vx *= k; b.vz *= k;
      }
      b.x += b.vx * h; b.z += b.vz * h; b.roll += Math.sqrt(b.vx * b.vx + b.vz * b.vz) * h / BALL_R;
      if (!b.gutter && Math.abs(b.x) > HW && b.z < DECK_END) { b.gutter = true; b.x = Math.sign(b.x) * (HW + GUT * .5); b.vx = 0; L.ev.push({ k: 'gutter' }); }
      if (b.z > DECK_END) { b.pit = true; L.ev.push({ k: 'pit' }); }
      if (!b.gutter && b.z > LANE_L - .5) for (const p of L.pins) {
        if (p.gone) continue; const dx = p.x - b.x, dz = p.z - b.z, rr = BALL_R + (p.down ? PIN_RD : PIN_R), d2 = dx * dx + dz * dz; if (d2 >= rr * rr || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, rv = (b.vx - p.vx) * nx + (b.vz - p.vz) * nz;
        p.x = b.x + nx * rr; p.z = b.z + nz * rr;
        if (rv <= 0) continue;
        const j = (1 + E_BP) * rv / (1 / MB + 1 / MP); b.vx -= j / MB * nx; b.vz -= j / MB * nz; p.vx += j / MP * nx; p.vz += j / MP * nz;
        knock(L, p, rv); L.ev.push({ k: 'hit', v: rv, pin: true });
      }
    }
    // Kegel bewegen
    for (const p of L.pins) {
      if (p.gone || !(p.vx || p.vz)) continue;
      const sp = Math.sqrt(p.vx * p.vx + p.vz * p.vz), dec = (p.down ? 3.2 : 6) * h;
      if (sp <= dec) { p.vx = p.vz = 0; continue; }
      const k = (sp - dec) / sp; p.vx *= k; p.vz *= k; p.x += p.vx * h; p.z += p.vz * h;
      if (p.z > DECK_END || p.z < LANE_L - 1.2) { p.gone = p.down = true; p.vx = p.vz = 0; }
      else if (Math.abs(p.x) > HW + .02) { if (!p.down) knock(L, p, 1); if (Math.abs(p.x) > HW + GUT * .6) { p.x = Math.sign(p.x) * (HW + GUT * .6); p.vx = -p.vx * .3; } }
    }
    // Kegel untereinander
    const ps = L.pins;
    for (let i = 0; i < ps.length; i++) { const a = ps[i]; if (a.gone) continue;
      for (let k = i + 1; k < ps.length; k++) { const c = ps[k]; if (c.gone) continue;
        const ra = a.down ? PIN_RD : PIN_R, rc = c.down ? PIN_RD : PIN_R, rr = ra + rc, dx = c.x - a.x, dz = c.z - a.z, d2 = dx * dx + dz * dz; if (d2 >= rr * rr || d2 === 0) continue;
        if (!(a.vx || a.vz || c.vx || c.vz)) continue;
        const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, ov = (rr - d) / 2; a.x -= nx * ov; a.z -= nz * ov; c.x += nx * ov; c.z += nz * ov;
        const rv = (a.vx - c.vx) * nx + (a.vz - c.vz) * nz; if (rv <= 0) continue;
        const j = rv * (1 + E_PP) / 2; a.vx -= j * nx; a.vz -= j * nz; c.vx += j * nx; c.vz += j * nz;
        knock(L, a, rv); knock(L, c, rv); L.ev.push({ k: 'hit', v: rv, pin: false });
      } }
  }
  function knock(L, p, v) { if (p.down || v < KNOCK) return; p.down = true; const s = Math.sqrt(p.vx * p.vx + p.vz * p.vz) || 1; p.fx = p.vx / s; p.fz = p.vz / s; L.ev.push({ k: 'fall', n: p.n }); }
  function step(L, dt) {
    const n = Math.max(1, Math.round(dt * 240)), h = dt / n;
    for (let i = 0; i < n; i++) sub(L, h);
    L.t += dt;
    const b = L.ball; if (b && (b.pit || b.z > LANE_L + 1)) L.after += dt;
  }
  const moving = L => L.pins.some(p => !p.gone && (Math.abs(p.vx) > .02 || Math.abs(p.vz) > .02));
  // Wurf vorbei? (Kugel im Schacht und Kegel ruhig, oder Zeitlimit)
  const done = L => !!L.ball && ((L.ball.pit && L.after > .6 && !moving(L)) || L.after > 3.5 || L.t > 9);
  // Nach dem Wurf: weggestoßene stehende Kegel zählen auch als gefallen
  function settle(L) { for (const p of L.pins) if (!p.down && !p.gone && p.x0 !== undefined && Math.hypot(p.x - p.x0, p.z - p.z0) > .05) p.down = true; for (const p of L.pins) p.vx = p.vz = 0; }
  function simulate(L, o, maxT) { throwBall(L, o); let t = 0; while (!done(L) && t < (maxT || 9)) { step(L, 1 / 60); t += 1 / 60; } settle(L); return L; }
  const clone = L => ({ ball: null, pins: L.pins.map(p => Object.assign({}, p)), t: 0, after: 0, ev: [] });

  /* ---------- Zählweise ---------- */
  // rolls: umgefallene Kegel je Wurf → Frames mit Würfen, Anzeige (X, /, -) und laufender Summe
  function frames(rolls) {
    const out = []; let i = 0, sum = 0;
    for (let f = 0; f < 10; f++) {
      if (i >= rolls.length) { out.push({ r: [], score: null }); continue; }
      const a = rolls[i], b = rolls[i + 1], c = rolls[i + 2];
      if (f < 9) {
        if (a === 10) { out.push({ r: [a], marks: ['X'], score: b !== undefined && c !== undefined ? (sum += 10 + b + c) : null }); i += 1; }
        else if (b === undefined) { out.push({ r: [a], marks: [mk(a)], score: null }); i += 1; }
        else if (a + b === 10) { out.push({ r: [a, b], marks: [mk(a), '/'], score: c !== undefined ? (sum += 10 + c) : null }); i += 2; }
        else { out.push({ r: [a, b], marks: [mk(a), mk(b)], score: (sum += a + b) }); i += 2; }
      } else {
        const r = rolls.slice(i, i + 3), m = [];
        if (r.length > 0) m.push(r[0] === 10 ? 'X' : mk(r[0]));
        if (r.length > 1) m.push(r[0] === 10 ? (r[1] === 10 ? 'X' : mk(r[1])) : r[0] + r[1] === 10 ? '/' : mk(r[1]));
        if (r.length > 2) m.push(r[0] === 10 && r[1] !== 10 ? (r[1] + r[2] === 10 ? '/' : mk(r[2])) : r[2] === 10 ? 'X' : mk(r[2]));
        const need = (r[0] === 10 || r[0] + r[1] === 10) ? 3 : 2, full = r.length >= need;
        out.push({ r, marks: m, score: full ? (sum += r.reduce((x, y) => x + y, 0)) : null }); i += r.length;
      }
    }
    return out;
  }
  const mk = v => v === 0 ? '-' : String(v);
  function total(rolls) { const fr = frames(rolls); let t = 0; for (const f of fr) if (f.score !== null) t = f.score; return t; }
  // laufende Summe inkl. noch offener Frames (für die Anzeige)
  function running(rolls) { let t = 0; for (const f of frames(rolls)) { if (f.score !== null) t = f.score; else for (const v of f.r) t += v; } return t; }

  /* ---------- Spielablauf ---------- */
  function newGame(players) { return { players: players.map(p => Object.assign({ rolls: [], frame: 0, ball: 0 }, p)), cur: 0, over: false }; }
  // Wurf eintragen: n = in diesem Wurf gefallene Kegel. Ergebnis: reset (volle Aufstellung), next (nächster Spieler), over
  function addRoll(G, n) {
    const P = G.players[G.cur]; P.rolls.push(n); const f = P.frame;
    let reset = false, next = false;
    if (f < 9) {
      if (P.ball === 0 && n === 10) next = true; else if (P.ball === 1) next = true; else P.ball = 1;
    } else {
      const r = P.rolls.slice(rollsBefore(P)), a = r[0], b = r[1];
      if (r.length === 1) { if (a === 10) reset = true; P.ball = 1; }
      else if (r.length === 2) { if (a === 10 || a + b === 10) { reset = a === 10 ? b === 10 : true; P.ball = 2; } else next = true; }
      else next = true;
    }
    if (next) { P.frame++; P.ball = 0; reset = true; if (P.frame >= 10) P.done = true; G.cur = (G.cur + 1) % G.players.length; if (G.players.every(p => p.done)) G.over = true; }
    return { reset, next, over: G.over };
  }
  // Anzahl Würfe vor dem 10. Frame
  function rollsBefore(P) { let i = 0; for (let f = 0; f < 9; f++) i += P.rolls[i] === 10 ? 1 : 2; return i; }

  /* ---------- Computer ---------- */
  // Probiert Würfe in der Simulation durch und nimmt den besten; je nach Stärke mit Streuung
  function ai(L, lvl, rnd) {
    rnd = rnd || Math.random; const err = [.028, .014, .005][lvl] || .014, speed = [7.2, 7.8, 8.3][lvl] || 7.8;
    let best = null;
    for (const x of [-.35, -.2, -.05, .1, .25, .38]) for (const spin of [0, .5, 1, -.5]) for (let a = -.05; a <= .05; a += .0125) {
      const o = { x, angle: a, speed, spin }, R = simulate(clone(L), o, 6), s = R.pins.filter(p => p.down || p.gone).length - L.pins.filter(p => p.down || p.gone).length;
      const sc = s * 10 - Math.abs(spin) * .1 - Math.abs(x) * .05; if (!best || sc > best.sc) best = { o, sc };
    }
    const o = Object.assign({}, best.o); o.angle += (rnd() - .5) * 2 * err; o.x += (rnd() - .5) * err * 4; o.speed += (rnd() - .5) * .6; return o;
  }

  const BW = { LANE_L, LANE_W, HW, GUT, BALL_R, PIN_R, PIN_H, SPOTS, DECK_END, OIL, newLane, rack, standing, throwBall, step, done, settle, simulate, clone, moving, frames, total, running, newGame, addRoll, ai };
  if (typeof module !== 'undefined' && module.exports) module.exports = BW;
  root.BW = BW;
})(typeof window !== 'undefined' ? window : globalThis);
