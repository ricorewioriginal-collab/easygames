'use strict';
/* Rennsimulation (ohne Grafik): Fahrphysik, Bots, Items, Runden. Läuft auf dem Host bzw. beim Solo-Spieler. */
const Sim = (() => {
  const VMAX = 36, ACC = 24, BRAKE = 50, GRIP = 9, DGRIP = 1.7, R = 1.15, PI2 = Math.PI * 2;
  const ITEMS = ['boost', 'mine', 'rocket', 'shield'];
  const wrap = a => { while (a > Math.PI) a -= PI2; while (a < -Math.PI) a += PI2; return a; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const tmp = { i: 0, f: 0, d: 0 }, tp = { x: 0, z: 0, tx: 0, tz: 0 };

  function create(opt) {                                   // opt: {track, laps, racers:[{name,logo,human,skill}], items:bool}
    const tr = opt.track, N = tr.N, S = { tr, laps: opt.laps || 3, items: opt.items !== false, t: 0, state: 'grid', count: 3.2, karts: [], boxes: [], hazards: [], rockets: [], pads: [], events: [], finishedHumans: 0, humans: 0 };
    opt.racers.forEach((r, k) => {
      const row = k >> 1, side = k % 2 ? 1 : -1, f0 = N - (row * 2 + 2); tr.at(f0, side * 4.5, tp);
      const kt = { k, name: r.name, logo: r.logo, char: r.char, assist: r.assist || 0, human: !!r.human, skill: r.skill == null ? 1 : r.skill, color: r.color, x: tp.x, z: tp.z, th: Math.atan2(tp.tx, tp.tz), vx: 0, vz: 0, vf: 0, steer: 0, drift: 0, driftT: 0, boostT: 0, spinT: 0, inv: 0, shieldT: 0, item: null, itemT: 0, rp: -(row * 2 + 2), prevF: f0, f: f0, d: side * 4.5, i: f0 | 0, lap: 0, lapStart: 0, lapTimes: [], finished: false, finT: 0, rank: k + 1, auto: !r.human, off: (Math.random() - 0.5) * 8, rough: false, hitT: 0, pulse: 0, itemPrev: false, speedVar: 0.96 + Math.random() * 0.06, dTier: 0 };
      if (kt.human) S.humans++; S.karts.push(kt);
    });
    if (S.items) for (let s = 0; s < 6; s++) for (let o = -1; o <= 1; o++) { const f = N * (s + 0.5) / 6; tr.at(f, o * 5.5, tp); S.boxes.push({ x: tp.x, z: tp.z, cd: 0, f }); }
    [0.22, 0.47, 0.72, 0.9].forEach(fr => { tr.at(N * fr, 0, tp); S.pads.push({ x: tp.x, z: tp.z, f: N * fr, th: Math.atan2(tp.tx, tp.tz) }); });
    return S;
  }
  const emit = (S, e) => S.events.push(e);

  function rollItem(S, k) {
    const n = S.karts.length, r = n > 1 ? (k.rank - 1) / (n - 1) : 0.5, w = [2 + 2 * r, 3 - 2 * r, 1 + 3 * r, 1.4], tot = w[0] + w[1] + w[2] + w[3]; let x = Math.random() * tot;
    for (let i = 0; i < 4; i++) { x -= w[i]; if (x <= 0) return ITEMS[i]; } return 'boost';
  }
  function hit(S, k, by) {
    if (k.inv > 0 || k.finished && k.spinT > 0) return false;
    if (k.shieldT > 0) { k.shieldT = 0; k.inv = 0.8; emit(S, { t: 'shieldHit', k: k.k }); return false; }
    k.spinT = 1.3; k.inv = 2.2; k.vf *= 0.25; k.drift = 0; k.driftT = 0; k.boostT = 0; emit(S, { t: 'hit', k: k.k, by }); return true;
  }
  function useItem(S, k) {
    const it = k.item; if (!it || k.itemT > 0) return; k.item = null; emit(S, { t: 'use', k: k.k, item: it });
    const fx = Math.sin(k.th), fz = Math.cos(k.th);
    if (it === 'boost') k.boostT = Math.max(k.boostT, 2.2);
    else if (it === 'shield') k.shieldT = 7;
    else if (it === 'mine') S.hazards.push({ x: k.x - fx * 3.6, z: k.z - fz * 3.6, t: 40, owner: k.k, arm: 1.2 });
    else if (it === 'rocket') {
      let tg = -1, best = 1e9; S.karts.forEach(o => { if (o === k) return; const dr = o.rp - k.rp; if (dr > 0 && dr < 90 && dr < best) { best = dr; tg = o.k; } });
      S.rockets.push({ x: k.x + fx * 2.5, z: k.z + fz * 2.5, th: k.th, owner: k.k, target: tg, t: 7, spd: 62, arm: 0.25 });
    }
  }

  // Bot-Eingabe: der Mittellinie folgen, vor Kurven bremsen, Items einsetzen
  function botInput(S, k) {
    const tr = S.tr, N = tr.N, la = 7 + Math.min(10, Math.abs(k.vf) * 0.28), f = k.f + la; tr.at(f, clamp(k.off, -tr.half + 4, tr.half - 4), tp);
    const want = Math.atan2(tp.x - k.x, tp.z - k.z), diff = wrap(want - k.th); let kmax = 0; const i0 = k.i | 0;
    for (let a = 0; a < 16; a++) { const kk = tr.K[(i0 + 2 + a * 2) % N]; if (kk > kmax) kmax = kk; }
    const skillCap = [0.8, 0.9, 0.99][k.skill] * k.speedVar, vt = Math.min(VMAX * skillCap, kmax > 0 ? Math.sqrt(30 / kmax) : 99);
    const inp = { s: clamp(-diff * 2.6, -1, 1), b: k.vf > vt + 4 ? 1 : 0, d: false, i: false, gas: k.vf < vt ? 1 : 0.3, cap: skillCap };
    if (k.item && k.itemT <= 0 && Math.random() < dtP(S, 0.8)) {
      if (k.item === 'boost' || k.item === 'shield') inp.i = true;
      else if (k.item === 'rocket') { if (S.karts.some(o => o !== k && o.rp - k.rp > 0 && o.rp - k.rp < 45)) inp.i = true; }
      else if (k.item === 'mine') { if (S.karts.some(o => o !== k && k.rp - o.rp > 0 && k.rp - o.rp < 25)) inp.i = true; }
    }
    return inp;
  }
  const dtP = (S, rate) => rate * (S.dt || 0.016);

  function stepKart(S, k, inp, dt) {
    const tr = S.tr, N = tr.N;
    k.pulse = Math.max(0, k.pulse - dt); k.hitT = Math.max(0, k.hitT - dt);
    if (k.itemT > 0) { k.itemT -= dt; if (k.itemT <= 0 && !k.item) { /* Item wurde bereits vergeben */ } }
    k.inv = Math.max(0, k.inv - dt); k.shieldT = Math.max(0, k.shieldT - dt); k.boostT = Math.max(0, k.boostT - dt);
    if (S.state === 'grid') inp = { s: 0, b: 0, d: false, i: false, gas: 0 };
    if (k.spinT > 0) { k.spinT -= dt; inp = { s: 0, b: 0, d: false, i: false, gas: 0 }; k.th += dt * 11; }
    const boost = k.boostT > 0, capBase = (k.human || k.finished ? VMAX : VMAX * (inp.cap || 1)), cap = capBase * (boost ? 1.38 : 1) * (k.rough ? 0.55 : 1);
    const fx = Math.sin(k.th), fz = Math.cos(k.th), rx = -Math.cos(k.th), rz = Math.sin(k.th);
    let vf = k.vx * fx + k.vz * fz, vl = k.vx * rx + k.vz * rz;
    // Gas / Bremse (Menschen: Auto-Gas)
    const gas = k.human ? 1 : (inp.gas == null ? 1 : inp.gas);
    if (inp.b > 0.1) vf -= (vf > 0 ? BRAKE : 14) * dt * inp.b; else if (gas > 0.05) { if (vf < cap) vf += ACC * (boost ? 2.4 : 1) * gas * Math.max(0.12, 1 - Math.max(0, vf) / cap) * dt * (vf < 0 ? 3 : 1); } else vf -= 6 * dt;
    if (vf > cap) vf -= (boost ? 22 : 34) * dt; vf = clamp(vf, -9, 60);
    // Driften
    const steer = clamp(inp.s, -1, 1), sp = Math.abs(vf) / VMAX;
    if (inp.d && !k.drift && Math.abs(steer) > 0.3 && vf > VMAX * 0.5 && !k.rough) { k.drift = steer > 0 ? -1 : 1; k.driftT = 0; }      // drift: -1 = rechts (th sinkt)
    if (k.drift) {
      k.driftT += dt * (0.75 + 0.35 * Math.abs(steer)); k.dTier = k.driftT > 3.2 ? 3 : k.driftT > 1.9 ? 2 : k.driftT > 0.9 ? 1 : 0;
      if (!inp.d || vf < VMAX * 0.35) { if (k.dTier) { k.boostT = Math.max(k.boostT, [0, 0.7, 1.3, 2.0][k.dTier]); emit(S, { t: 'miniturbo', k: k.k, tier: k.dTier }); } k.drift = 0; k.driftT = 0; k.dTier = 0; }
    }
    let om;   // k.drift = +1: Linksdrift (th steigt), -1: Rechtsdrift; Gegenlenken weitet, Reinlenken verengt
    if (k.drift) om = k.drift * (1.0 - 0.55 * (steer * k.drift)); else om = -steer * (2.05 - 0.85 * clamp(sp, 0, 1)) * clamp(Math.abs(vf) / 9, 0, 1) * (vf < 0 ? -1 : 1);
    if (k.spinT <= 0) k.th += om * dt;
    k.steer += (steer - k.steer) * Math.min(1, dt * 10);
    vl *= Math.exp(-(k.drift ? DGRIP : GRIP) * dt);
    const nfx = Math.sin(k.th), nfz = Math.cos(k.th), nrx = -Math.cos(k.th), nrz = Math.sin(k.th);
    k.vx = nfx * vf + nrx * vl; k.vz = nfz * vf + nrz * vl; k.vf = vf;
    k.x += k.vx * dt; k.z += k.vz * dt;
    // Streckenlage / Wände
    tr.nearest(k.x, k.z, k.lapInit ? k.i : -1, tmp); k.lapInit = true; k.i = tmp.i; k.f = tmp.f; k.d = tmp.d;
    const ad = Math.abs(tmp.d); k.rough = ad > tr.roughD; k.wall = false;
    if (ad > tr.wallD) {
      const sg = tmp.d > 0 ? 1 : -1, nx = tr.Nm[tmp.i * 2], nz = tr.Nm[tmp.i * 2 + 1], over = ad - tr.wallD; k.x -= nx * sg * over; k.z -= nz * sg * over;
      const vn = (k.vx * nx + k.vz * nz) * sg; if (vn > 0) { k.vx -= nx * sg * vn * 1.35; k.vz -= nz * sg * vn * 1.35; if (vn > 5 && k.hitT <= 0) { emit(S, { t: 'wall', k: k.k, v: vn }); k.hitT = 0.4; } k.vf *= 0.93; }
      k.d = sg * tr.wallD;
    }
    // Rundenfortschritt
    let dl = k.f - k.prevF; if (dl > N / 2) dl -= N; else if (dl < -N / 2) dl += N; k.rp += dl; k.prevF = k.f;
    const lapNow = Math.floor(k.rp / N) + 1;
    if (lapNow > k.lap && k.rp >= 0) { if (k.lap >= 1) { const lt = S.t - k.lapStart; k.lapTimes.push(lt); emit(S, { t: 'lap', k: k.k, lap: k.lap, time: lt }); } k.lap = lapNow; k.lapStart = S.t; }
    if (!k.finished && k.rp >= S.laps * N) { k.finished = true; k.finT = S.t; k.auto = true; if (k.human) S.finishedHumans++; emit(S, { t: 'finish', k: k.k, time: S.t }); }
    // Item-Boxen & Boost-Felder
    if (S.state === 'race') {
      if (S.items) S.boxes.forEach(b => { if (b.cd > 0) return; if ((b.x - k.x) ** 2 + (b.z - k.z) ** 2 < 12 && !k.item && k.itemT <= 0 && !k.finished) { b.cd = 3.5; k.itemT = 0.9; k.itemPending = true; emit(S, { t: 'box', k: k.k }); } });
      S.pads.forEach(p => { if ((p.x - k.x) ** 2 + (p.z - k.z) ** 2 < 20 && k.boostT < 1.1) { k.boostT = 1.2; emit(S, { t: 'pad', k: k.k }); } });
      if (k.itemPending && k.itemT <= 0) { k.itemPending = false; k.item = rollItem(S, k); emit(S, { t: 'got', k: k.k, item: k.item }); }
    }
    // Item benutzen (nur bei steigender Flanke)
    if (inp.i && !k.itemPrev && S.state === 'race' && !k.finished) useItem(S, k); k.itemPrev = !!inp.i;
  }

  function step(S, dt, inputs) {
    S.dt = dt; S.t += dt; S.events.length = 0;
    if (S.state === 'grid') { S.count -= dt; if (S.count <= 0) { S.state = 'race'; S.t = 0; S.karts.forEach(k => { k.lapStart = 0; }); emit(S, { t: 'go' }); } }
    // Rangfolge
    const order = S.karts.slice().sort((a, b) => (a.finished && b.finished) ? a.finT - b.finT : a.finished ? -1 : b.finished ? 1 : b.rp - a.rp); order.forEach((k, i) => k.rank = i + 1); S.order = order;
    S.karts.forEach((k, i) => { let inp = k.auto ? botInput(S, k) : (inputs && inputs[i]) || { s: 0, b: 0, d: false, i: false };
      if (!k.auto && k.assist > 0 && !k.drift && S.state === 'race' && k.spinT <= 0 && !k.finished) { const bs = botInput(S, k).s; inp = Object.assign({}, inp, { s: clamp((inp.s || 0) + k.assist * bs * (1 - Math.min(1, Math.abs(inp.s || 0) * 1.3)), -1, 1) }); } if (k.auto && S.state === 'race' && !k.finished) rubber(S, k, inp); stepKart(S, k, inp, dt); });
    // Kart-Kart-Kollision
    for (let a = 0; a < S.karts.length; a++) for (let b = a + 1; b < S.karts.length; b++) {
      const p = S.karts[a], q = S.karts[b], dx = q.x - p.x, dz = q.z - p.z, d2 = dx * dx + dz * dz;
      if (d2 < (2 * R) * (2 * R) && d2 > 1e-6) { const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, ov = 2 * R - d; p.x -= nx * ov / 2; p.z -= nz * ov / 2; q.x += nx * ov / 2; q.z += nz * ov / 2; const rv = (q.vx - p.vx) * nx + (q.vz - p.vz) * nz; if (rv < 0) { const j = -rv * 0.5; p.vx -= nx * j; p.vz -= nz * j; q.vx += nx * j; q.vz += nz * j; if (-rv > 4) emit(S, { t: 'bump', k: p.k, o: q.k }); } }
    }
    // Hindernisse (Störsignale)
    for (let i = S.hazards.length - 1; i >= 0; i--) { const h = S.hazards[i]; h.t -= dt; h.arm -= dt; let used = h.t <= 0; if (!used) S.karts.forEach(k => { if (used || k.spinT > 0) return; if ((h.x - k.x) ** 2 + (h.z - k.z) ** 2 < 5 && (h.owner !== k.k || h.arm < 0)) { if (h.arm > -0.0 || h.owner !== k.k) { hit(S, k, h.owner); used = true; emit(S, { t: 'boom', x: h.x, z: h.z }); } } }); if (used) S.hazards.splice(i, 1); }
    // Raketen
    for (let i = S.rockets.length - 1; i >= 0; i--) {
      const r = S.rockets[i]; r.t -= dt; r.arm -= dt; let dead = r.t <= 0;
      const tg = r.target >= 0 ? S.karts[r.target] : null;
      if (tg && !tg.finished) { const want = Math.atan2(tg.x - r.x, tg.z - r.z), df = wrap(want - r.th); r.th += clamp(df, -4.5 * dt, 4.5 * dt); } else { S.tr.nearest(r.x, r.z, -1, tmp); S.tr.at(tmp.f + 6, 0, tp); const df = wrap(Math.atan2(tp.x - r.x, tp.z - r.z) - r.th); r.th += clamp(df, -3 * dt, 3 * dt); }
      r.x += Math.sin(r.th) * r.spd * dt; r.z += Math.cos(r.th) * r.spd * dt;
      S.karts.forEach(k => { if (dead || k.spinT > 0 || (k.k === r.owner && r.arm > 0)) return; if ((r.x - k.x) ** 2 + (r.z - k.z) ** 2 < 5.5) { hit(S, k, r.owner); dead = true; emit(S, { t: 'boom', x: r.x, z: r.z }); } });
      if (dead) S.rockets.splice(i, 1);
    }
    S.boxes.forEach(b => { if (b.cd > 0) b.cd -= dt; });
    if (S.humans > 0 && S.finishedHumans >= S.humans && S.state === 'race') { S.state = 'done'; emit(S, { t: 'done' }); }
    if (S.state === 'race' && S.t > 60 * 12) S.state = 'done';
  }
  function rubber(S, k, inp) {   // leichtes Gummiband: Bots hinter den Menschen etwas schneller, weit vorn etwas langsamer
    const hs = S.karts.filter(h => h.human); if (!hs.length) return; const ref = hs.reduce((m, h) => Math.max(m, h.rp), -1e9), gap = k.rp - ref;
    inp.cap = (inp.cap || 1) * clamp(1 - gap * 0.0012, 0.94, 1.06);
  }
  // Endwertung: Zeit bzw. hochgerechnete Zeit für nicht Beendete
  function results(S) {
    const N = S.tr.N; return S.karts.map(k => ({ k, t: k.finished ? k.finT : S.t + (S.laps * N - k.rp) / Math.max(8, Math.abs(k.vf)) + 5 })).sort((a, b) => a.t - b.t).map((r, i) => ({ k: r.k, pos: i + 1, time: r.t, finished: r.k.finished, best: r.k.lapTimes.length ? Math.min(...r.k.lapTimes) : null }));
  }
  return { create, step, results, ITEMS, VMAX };
})();
if (typeof module !== 'undefined') module.exports = Sim;
