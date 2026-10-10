'use strict';
/* Strecken: geschlossene Spline -> gleichmäßig abgetastete Mittellinie (reine Mathematik, ohne Three.js). */
const Track = (() => {
  const DEFS = [
    { id: 'wiese', name: 'Funkturm-Wiese', w: 20, bright: 1, sky: ['#2a78e8', '#79c4ff', '#e4f4ff'], ground: '#4cae3a', road: '#4b505c', wall: ['#e8412a', '#ffffff'], fog: '#cfeaff', props: ['#2e9a3a', '#3fb84a', '#237a30', '#58c850'],
      pts: [[0, -190], [130, -190], [230, -120], [250, 0], [190, 100], [80, 80], [20, 150], [-60, 230], [-180, 200], [-230, 80], [-200, -30], [-262, -112], [-165, -215]] },
    { id: 'kueste', name: 'Sonnen-Küste', w: 20, bright: 1, sky: ['#1f6fe0', '#6ec6ff', '#fff2c8'], ground: '#e9d38c', road: '#454852', wall: ['#1a6ae0', '#ffffff'], fog: '#d8f0ff', props: ['#2f9a4a', '#46b85a', '#e8a23a', '#d8664a'],
      pts: [[0, -250], [140, -230], [240, -120], [210, 20], [300, 130], [230, 250], [90, 230], [0, 150], [-100, 230], [-240, 245], [-320, 120], [-250, 20], [-310, -80], [-220, -200], [-100, -170]] },
    { id: 'neon', name: 'Neon-City', w: 18, sky: ['#05030f', '#2a0a5a', '#ff1a8a'], ground: '#05040f', road: '#1c1c2c', wall: ['#7CFF6A', '#00e5ff'], fog: '#150a30', props: ['#1a2a6a', '#5a1a6a', '#0a5a6a', '#6a1a3a'],
      pts: [[0, -210], [150, -210], [250, -130], [250, -10], [170, 60], [205, 165], [120, 255], [-5, 220], [-45, 135], [-170, 160], [-275, 100], [-275, -20], [-205, -105], [-185, -190], [-100, -235]] }
  ];
  const SP = 3;                                       // Abstand der Abtastpunkte in Metern
  function cr(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return [0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)); }
  function build(def) {
    const q = def.pts, n = q.length, dense = [];
    for (let i = 0; i < n; i++) for (let s = 0; s < 40; s++) dense.push(cr(q[(i + n - 1) % n], q[i], q[(i + 1) % n], q[(i + 2) % n], s / 40));
    let len = 0; const cum = [0]; for (let i = 1; i <= dense.length; i++) { const a = dense[i - 1], b = dense[i % dense.length]; len += Math.hypot(b[0] - a[0], b[1] - a[1]); cum.push(len); }
    const N = Math.round(len / SP), P = new Float32Array(N * 2); let j = 0;
    for (let i = 0; i < N; i++) { const target = i * len / N; while (cum[j + 1] < target) j++; const a = dense[j], b = dense[(j + 1) % dense.length], t = (target - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]); P[i * 2] = a[0] + (b[0] - a[0]) * t; P[i * 2 + 1] = a[1] + (b[1] - a[1]) * t; }
    const T = new Float32Array(N * 2), Nm = new Float32Array(N * 2), K = new Float32Array(N);
    for (let i = 0; i < N; i++) { const a = (i + N - 1) % N, b = (i + 1) % N, dx = P[b * 2] - P[a * 2], dz = P[b * 2 + 1] - P[a * 2 + 1], l = Math.hypot(dx, dz) || 1; T[i * 2] = dx / l; T[i * 2 + 1] = dz / l; Nm[i * 2] = dz / l; Nm[i * 2 + 1] = -dx / l; }
    for (let i = 0; i < N; i++) { const a = (i + N - 2) % N, b = (i + 2) % N; let da = Math.atan2(T[b * 2], T[b * 2 + 1]) - Math.atan2(T[a * 2], T[a * 2 + 1]); while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; K[i] = Math.abs(da) / (4 * len / N); }
    const tr = { def, N, len, P, T, Nm, K, W: def.w, half: def.w / 2, wallD: def.w / 2 + 4, roughD: def.w / 2 + 1.2 };
    // nächster Punkt: lokale Suche um hint (hint < 0 = alles absuchen); out = {i,f,d}
    tr.nearest = (x, z, hint, out) => {
      let bi = 0, bd = 1e18; const lo = hint < 0 ? 0 : -14, hi = hint < 0 ? N - 1 : 14;
      for (let k = lo; k <= hi; k++) { const i = hint < 0 ? k : (hint + k + N) % N, dx = x - P[i * 2], dz = z - P[i * 2 + 1], d2 = dx * dx + dz * dz; if (d2 < bd) { bd = d2; bi = i; } }
      let f = bi; const nx = (bi + 1) % N, dx = P[nx * 2] - P[bi * 2], dz = P[nx * 2 + 1] - P[bi * 2 + 1], l2 = dx * dx + dz * dz, t = ((x - P[bi * 2]) * dx + (z - P[bi * 2 + 1]) * dz) / l2;
      if (t > 0) f = bi + Math.min(1, t); else { const pv = (bi + N - 1) % N, ex = P[bi * 2] - P[pv * 2], ez = P[bi * 2 + 1] - P[pv * 2 + 1], tt = ((x - P[pv * 2]) * ex + (z - P[pv * 2 + 1]) * ez) / (ex * ex + ez * ez); f = bi - 1 + Math.max(0, tt); if (f < 0) f += N; }
      out.i = bi; out.f = f; out.d = (x - P[bi * 2]) * Nm[bi * 2] + (z - P[bi * 2 + 1]) * Nm[bi * 2 + 1]; return out;
    };
    tr.at = (f, off, out) => { const i = ((Math.floor(f) % N) + N) % N, nx = (i + 1) % N, t = f - Math.floor(f); out.x = P[i * 2] + (P[nx * 2] - P[i * 2]) * t + Nm[i * 2] * (off || 0); out.z = P[i * 2 + 1] + (P[nx * 2 + 1] - P[i * 2 + 1]) * t + Nm[i * 2 + 1] * (off || 0); out.tx = T[i * 2]; out.tz = T[i * 2 + 1]; return out; };
    return tr;
  }
  // Prüfung: Selbstüberschneidung / Mindestabstand nicht benachbarter Streckenteile / engster Radius
  function check(tr) {
    let minGap = 1e9, maxK = 0; const N = tr.N;
    for (let i = 0; i < N; i += 2) for (let j = i + 1; j < N; j += 2) { let dj = Math.min(j - i, N - (j - i)); if (dj * SP < 90) continue; const d = Math.hypot(tr.P[i * 2] - tr.P[j * 2], tr.P[i * 2 + 1] - tr.P[j * 2 + 1]); if (d < minGap) minGap = d; }
    for (let i = 0; i < N; i++) maxK = Math.max(maxK, tr.K[i]);
    return { len: Math.round(tr.len), minGap: Math.round(minGap), minRadius: Math.round(1 / maxK) };
  }
  return { DEFS, build, check, SP };
})();
if (typeof module !== 'undefined') module.exports = Track;
