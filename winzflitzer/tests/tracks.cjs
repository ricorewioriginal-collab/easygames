// Prüft alle Strecken: Überschneidungen, Hindernisse auf der Fahrbahn, Abstand zur Tischkante.
// Aufruf: node winzflitzer/tests/tracks.cjs [--svg ordner]
const path = require('path'), fs = require('fs');
global.window = global; global.THREE = require(path.join(__dirname, '../../vendor/three-r128.min.js'));
for (const f of ['util', 'data', 'track']) require(path.join(__dirname, '../js/' + f + '.js'));
const WF = global.WF; let bad = 0;
const svgDir = process.argv.includes('--svg') ? process.argv[process.argv.indexOf('--svg') + 1] : null;
for (const def of WF.TRACKS) {
  const T = new WF.Track(def), N = T.N, msgs = [];
  const sepIdx = Math.ceil((T.W * 2 + 6) / T.ds * 1.3);
  // 1) Überschneidungen
  let lastU = -9;
  for (let i = 0; i < N; i += 2) for (let j = i + sepIdx; j < N; j += 2) {
    const di = Math.min(j - i, N - (j - i)); if (di < sepIdx) continue;
    const d = Math.hypot(T.x[i] - T.x[j], T.z[i] - T.z[j]);
    if (d < T.W * 2 + 0.6 && Math.abs(T.h[i] - T.h[j]) < 1.25 && !((T.f[i] | T.f[j]) & 2)) {
      if (Math.abs(T.u[i] - lastU) > 0.3) msgs.push(`Überschneidung u=${T.u[i].toFixed(2)} / u=${T.u[j].toFixed(2)} (Abstand ${d.toFixed(1)})`);
      lastU = T.u[i];
    }
  }
  // 2) Rand
  const g = T.theme.ground, out = {};
  for (let i = 0; i < N; i += 4) {
    const m = T.theme.rim ? T.w + 0.8 : T.w * 0.6;
    for (const s of [-1, 1]) { const x = T.x[i] + T.tz[i] * m * s, z = T.z[i] - T.tx[i] * m * s; if (!T.inGround(x, z)) { msgs.push(`Rand bei u=${T.u[i].toFixed(2)}`); i += 30; break; } }
  }
  // 3) Hindernisse auf der Fahrbahn
  const step = T.veh.step, seen = new Set(), OK = ['sugar', 'screw', 'nut', 'mold', 'chalk'];
  for (let i = 0; i < N; i++) for (let lat = -T.w; lat <= T.w; lat += 0.5) {
    const x = T.x[i] + T.tz[i] * lat, z = T.z[i] - T.tx[i] * lat;
    T.solids.forEach((s, k) => { if (!seen.has(k) && !OK.includes(s.n) && WF.inSolid(s, x, z, 0.4) && s.top > T.h[i] + step && s.top - 1 < 30) { seen.add(k); msgs.push(`Hindernis ${s.n} auf der Fahrbahn u=${T.u[i].toFixed(2)}`); } });
    T.holes.forEach((o) => { if (Math.hypot(x - o.x, z - o.z) < o.r && !seen.has('h' + o.x + o.z)) { seen.add('h' + o.x + o.z); msgs.push(`Tasche auf der Fahrbahn u=${T.u[i].toFixed(2)}`); } });
  }
  // 4) Boden überall auf der Fahrbahn (außer Lücken)
  let holeMsg = 0;
  for (let i = 0; i < N; i += 3) { if (T.f[i] & 1) continue; T.ground(T.x[i], T.z[i], T.h[i] + T.hill(T.x[i], T.z[i]) + 0.05, step, out, 0); if (!(out.h > -1e9) && !holeMsg++) msgs.push(`kein Boden u=${T.u[i].toFixed(2)}`); }
  const lap = T.length / (T.veh.top * 0.8);
  console.log(`${msgs.length ? '✗' : '✓'} ${def.id} ${def.name}: Länge ${T.length.toFixed(0)}, ~${lap.toFixed(1)} s/Runde` + (msgs.length ? '\n   ' + msgs.join('\n   ') : ''));
  bad += msgs.length;
  if (svgDir) {
    const sc = 6, W = g.w * sc + 40, H = g.d * sc + 40, X = x => (x - g.x + g.w / 2) * sc + 20, Y = z => (z - g.z + g.d / 2) * sc + 20;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#333"/><rect x="20" y="20" width="${g.w * sc}" height="${g.d * sc}" fill="${T.theme.groundCol}"/>`;
    let d = ''; for (let i = 0; i < N; i++) d += (i ? 'L' : 'M') + X(T.x[i]).toFixed(1) + ' ' + Y(T.z[i]).toFixed(1);
    s += `<path d="${d}Z" fill="none" stroke="#5558" stroke-width="${T.w * 2 * sc}" stroke-linejoin="round"/>`;
    for (let i = 0; i < N; i++) if (T.f[i]) s += `<circle cx="${X(T.x[i])}" cy="${Y(T.z[i])}" r="3" fill="${T.f[i] & 1 ? 'red' : T.f[i] & 2 ? 'blue' : T.f[i] & 4 ? 'yellow' : 'orange'}"/>`;
    for (let i = 0; i < N; i += 20) s += `<text x="${X(T.x[i])}" y="${Y(T.z[i])}" font-size="10" fill="#fff">${T.u[i].toFixed(1)}</text>`;
    T.solids.forEach(o => { s += o.c ? `<circle cx="${X(o.x)}" cy="${Y(o.z)}" r="${o.r * sc}" fill="#a00a"/>` : `<rect x="${X(o.x) - o.hw * sc}" y="${Y(o.z) - o.hd * sc}" width="${o.hw * 2 * sc}" height="${o.hd * 2 * sc}" fill="#a00a" transform="rotate(${-o.rot * 180 / Math.PI} ${X(o.x)} ${Y(o.z)})"/>`; });
    T.zones.forEach(o => { s += `<circle cx="${X(o.x)}" cy="${Y(o.z)}" r="${o.r * sc}" fill="none" stroke="#0ff" stroke-width="2"/>`; });
    for (let k = 0; k < 4; k++) { const p = T.gridSlot(k); s += `<circle cx="${X(p.x)}" cy="${Y(p.z)}" r="4" fill="#fff"/>`; }
    fs.writeFileSync(path.join(svgDir, def.id + '.svg'), s + '</svg>');
  }
}
console.log(bad ? `\n${bad} Probleme` : '\nAlle Strecken in Ordnung');
process.exit(bad ? 1 : 0);
