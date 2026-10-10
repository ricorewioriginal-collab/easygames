/* Wobbel – Löser (Breitensuche über alle Züge, liefert kürzeste Lösung in Zügen). Nur für Tests / Par-Werte. */
import { parseLevel, createState, cloneState, step, isSolved, T } from './engine.js';

export function solve(L, opt = {}) {
  const maxStates = opt.maxStates || 2500000, s0 = opt.from ? cloneState(opt.from) : createState(L), waters = [], doors = [], cracks = []; for (let i = 0; i < L.n; i++) { if (L.crack[i]) cracks.push(i); if (L.terrain[i] === T.WATER) waters.push(i); if (L.terrain[i] === T.DOOR) doors.push(i); }
  const OFF = 256;   // Zeichencodes ab 256, damit nie ein Trennzeichen ('|' = 124) mit Zahlenwerten kollidiert
  const enc = s => { const c = []; for (let i = 0; i < L.n; i++) if (s.crate[i]) c.push(i * 4 + s.crate[i] - 1); let out = String.fromCharCode(s.p + OFF, s.keysHeld + OFF); for (let k = 0; k < c.length; k++) out += String.fromCharCode(c[k] + OFF); out += '|'; for (const i of waters) out += s.filled[i] ? '1' : '0'; for (const i of doors) out += s.open[i] ? '1' : '0'; for (const i of cracks) out += s.broken[i] ? '1' : '0'; for (let k = 0; k < s.keyTaken.length; k++) out += s.keyTaken[k] ? '1' : '0'; return out; };
  const dec = str => { const s = createState(L); s.crate.fill(0); const bar = str.indexOf('|'); s.p = str.charCodeAt(0) - OFF; s.keysHeld = str.charCodeAt(1) - OFF; for (let k = 2; k < bar; k++) { const v = str.charCodeAt(k) - OFF; s.crate[v >> 2] = (v & 3) + 1; } let o = bar + 1; for (const i of waters) s.filled[i] = str[o++] === '1' ? 1 : 0; for (const i of doors) s.open[i] = str[o++] === '1' ? 1 : 0; for (const i of cracks) s.broken[i] = str[o++] === '1' ? 1 : 0; for (let k = 0; k < s.keyTaken.length; k++) s.keyTaken[k] = str[o++] === '1' ? 1 : 0; return s; };
  if (isSolved(L, s0)) return { solvable: true, moves: 0, pushes: 0, states: 1, path: [] };
  const t0 = Date.now(), maxMs = opt.maxMs || 45000, seen = new Map(), key0 = enc(s0); seen.set(key0, -1); const keys = [key0], par = [-1], mv = [0]; let head = 0;
  while (head < keys.length) {
    const cur = dec(keys[head]);
    for (let d = 0; d < 4; d++) {
      const n = cloneState(cur), r = step(L, n, d); if (!r) continue; const k = enc(n); if (seen.has(k)) continue;
      seen.set(k, keys.length); keys.push(k); par.push(head); mv.push(d);
      if (isSolved(L, n)) { const path = []; for (let i = keys.length - 1; i > 0; i = par[i]) path.push(mv[i]); path.reverse(); let pushes = 0; const t = opt.from ? cloneState(opt.from) : createState(L); for (const dd of path) { if (step(L, t, dd).push) pushes++; } return { solvable: true, moves: path.length, pushes, states: seen.size, path }; }
      if (seen.size > maxStates) return { solvable: null, states: seen.size, reason: 'Zustandslimit erreicht' };
    }
    head++; if (head % 200000 === 0) keys[head - 200000] = null; if ((head & 1023) === 0 && Date.now() - t0 > maxMs) return { solvable: null, states: seen.size, reason: 'Zeitlimit erreicht' };
  }
  return { solvable: false, states: seen.size };
}
export const dirChar = d => 'URDL'[d];
export function pathString(path) { return path.map(dirChar).join(''); }
// Lösung nachspielen (Kontrolle)
export function replay(L, path) { const s = createState(L); for (const d of path) if (!step(L, s, d)) return false; return isSolved(L, s); }
