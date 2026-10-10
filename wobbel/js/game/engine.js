/* Wobbel – Spiellogik (rein, ohne Grafik). Wird vom Spiel UND vom Lösbarkeits-Test benutzt.

   Karten-Zeichen (ASCII):
     '#'  Wand                     ' '  Boden
     '@'  Startposition Wobbel     '$'  Kiste (neutral)     'r' 'g' 'b'  rote / grüne / blaue Kiste
     '.'  Zielfeld (jede Kiste)    'R' 'G' 'B'  Zielfeld nur für rote / grüne / blaue Kiste
     '~'  Wasser (Kiste hineinschieben = Brücke; Wobbel kann nicht schwimmen)
     'i'  Eis (Kisten rutschen weiter, bis sie anstoßen)
     '1' '2' '3'  Farbklecks rot / grün / blau (Kiste, die darauf landet oder darüber rutscht, nimmt die Farbe an)
     '^' '>' 'v' '<'  Pfeilfeld (nur in Pfeilrichtung betret- und verlassbar – für Wobbel und Kisten)
     'x'  brüchiger Boden (bricht weg, sobald Wobbel ihn verlässt – danach unpassierbar)
     'k'  Schlüssel (Wobbel sammelt ihn ein)      'D'  Tür (öffnet sich mit einem Schlüssel)
   Alles außerhalb der Wände ist Meer. Gewonnen ist ein Level, wenn jedes Zielfeld eine passende Kiste trägt. */

export const T = { VOID: 0, FLOOR: 1, WALL: 2, WATER: 3, ICE: 4, DOOR: 5 };
export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];       // 0 hoch, 1 rechts, 2 runter, 3 links
export const DIR_NAMES = ['hoch', 'rechts', 'runter', 'links'];
const CRATE_CH = { $: 0, r: 1, g: 2, b: 3 }, TARGET_CH = { '.': 1, R: 2, G: 3, B: 4 }, PAINT_CH = { 1: 1, 2: 2, 3: 3 }, ARROW_CH = { '^': 1, '>': 2, v: 3, '<': 4 };

export function parseLevel(def) {
  const rows = def.map, h = rows.length, w = Math.max(...rows.map(r => r.length)), n = w * h;
  const L = { name: def.name || '', hint: def.hint || '', world: def.world || 0, w, h, n, terrain: new Uint8Array(n), paint: new Uint8Array(n), arrow: new Uint8Array(n), crack: new Uint8Array(n), target: new Uint8Array(n), keys: [], start: -1, crates: [], par: def.par || 0 };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x] === undefined ? '#' : rows[y][x], i = y * w + x; L.terrain[i] = T.FLOOR;
    if (ch === '#') L.terrain[i] = T.WALL; else if (ch === '~') L.terrain[i] = T.WATER; else if (ch === 'i') L.terrain[i] = T.ICE; else if (ch === 'D') L.terrain[i] = T.DOOR;
    else if (ch === '@') L.start = i; else if (ch in CRATE_CH) L.crates.push([i, CRATE_CH[ch]]); else if (ch in TARGET_CH) L.target[i] = TARGET_CH[ch]; else if (ch in PAINT_CH) L.paint[i] = PAINT_CH[ch]; else if (ch === 'k') L.keys.push(i); else if (ch in ARROW_CH) L.arrow[i] = ARROW_CH[ch]; else if (ch === 'x') L.crack[i] = 1;
  }
  // Außenbereich = Meer: alles, was vom Rand aus ohne Wand erreichbar ist
  const seen = new Uint8Array(n), st = []; for (let x = 0; x < w; x++) { st.push(x, (h - 1) * w + x); } for (let y = 0; y < h; y++) { st.push(y * w, y * w + w - 1); }
  while (st.length) { const i = st.pop(); if (seen[i] || L.terrain[i] === T.WALL) continue; seen[i] = 1; L.terrain[i] = T.VOID; L.paint[i] = 0; L.target[i] = 0; L.arrow[i] = 0; L.crack[i] = 0; const x = i % w, y = (i / w) | 0; if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (y > 0) st.push(i - w); if (y < h - 1) st.push(i + w); }
  L.targets = []; for (let i = 0; i < n; i++) if (L.target[i]) L.targets.push(i);
  return L;
}
export function createState(L) {
  const s = { p: L.start, crate: new Uint8Array(L.n), filled: new Uint8Array(L.n), open: new Uint8Array(L.n), broken: new Uint8Array(L.n), keyTaken: new Uint8Array(L.keys.length), keysHeld: 0, moves: 0, pushes: 0 };
  L.crates.forEach(([i, c]) => { s.crate[i] = c + 1; }); return s;
}
export function cloneState(s) { return { p: s.p, crate: s.crate.slice(), filled: s.filled.slice(), open: s.open.slice(), broken: s.broken.slice(), keyTaken: s.keyTaken.slice(), keysHeld: s.keysHeld, moves: s.moves, pushes: s.pushes }; }
export const keyAt = (L, s, i) => { const k = L.keys.indexOf(i); return k >= 0 && !s.keyTaken[k] ? k : -1; };
const isWater = (L, s, i) => L.terrain[i] === T.WATER && !s.filled[i];
const isDoorClosed = (L, s, i) => L.terrain[i] === T.DOOR && !s.open[i];
const isBroken = (L, s, i) => L.crack[i] === 1 && s.broken[i] === 1;
// Pfeilfelder: Betreten UND Verlassen nur in Pfeilrichtung (von a nach b in Richtung d)
export const arrowBlock = (L, a, b, d) => (L.arrow[a] !== 0 && L.arrow[a] - 1 !== d) || (L.arrow[b] !== 0 && L.arrow[b] - 1 !== d);
const solidForCrate = (L, s, i) => isBroken(L, s, i) || L.terrain[i] === T.WALL || L.terrain[i] === T.VOID || isDoorClosed(L, s, i) || s.crate[i] || keyAt(L, s, i) >= 0;

/* Ein Zug. dir: 0..3. Verändert s. Liefert null (blockiert) oder {push, events}.
   events: {t:'push',from,to,color} {t:'slide',from,to,color} {t:'fill',cell} {t:'paint',cell,color} {t:'key',cell} {t:'door',cell} */
export function step(L, s, dir) {
  const [dx, dy] = DIRS[dir], w = L.w, p = s.p, x = p % w + dx, y = ((p / w) | 0) + dy; if (x < 0 || y < 0 || x >= w || y >= L.h) return null;
  const t = y * w + x, ev = []; let push = false, openedDoor = false;
  const tt = L.terrain[t]; if (tt === T.WALL || tt === T.VOID) return null;
  if (isWater(L, s, t) || isBroken(L, s, t) || arrowBlock(L, p, t, dir)) return null;
  if (isDoorClosed(L, s, t)) { if (s.keysHeld < 1) return null; openedDoor = true; }
  if (s.crate[t]) {
    const x2 = x + dx, y2 = y + dy; if (x2 < 0 || y2 < 0 || x2 >= w || y2 >= L.h) return null; const t2 = y2 * w + x2;
    if (solidForCrate(L, s, t2) || arrowBlock(L, t, t2, dir)) return null;
    let color = s.crate[t] - 1; s.crate[t] = 0; push = true; let cur = t2, sunk = false;
    ev.push({ t: 'push', from: t, to: t2, color });
    for (;;) {                                  // Landen / Rutschen
      if (isWater(L, s, cur)) { s.filled[cur] = 1; sunk = true; ev.push({ t: 'fill', cell: cur, color }); break; }
      if (L.paint[cur] && L.paint[cur] !== color) { color = L.paint[cur]; ev.push({ t: 'paint', cell: cur, color }); }
      if (L.terrain[cur] !== T.ICE) break;
      const nx = (cur % w) + dx, ny = ((cur / w) | 0) + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= L.h) break; const nxt = ny * w + nx;
      if (solidForCrate(L, s, nxt) || arrowBlock(L, cur, nxt, dir)) break; ev.push({ t: 'slide', from: cur, to: nxt, color }); cur = nxt;
    }
    if (!sunk) s.crate[cur] = color + 1; s.pushes++;
  }
  if (openedDoor) { s.open[t] = 1; s.keysHeld--; ev.push({ t: 'door', cell: t }); }
  if (L.crack[p] === 1) { s.broken[p] = 1; ev.push({ t: 'crack', cell: p }); }
  s.p = t; s.moves++;
  const k = keyAt(L, s, t); if (k >= 0) { s.keyTaken[k] = 1; s.keysHeld++; ev.push({ t: 'key', cell: t }); }
  return { push, events: ev };
}
export function isTargetDone(L, s, i) { const c = s.crate[i]; if (!c) return false; const tg = L.target[i]; return tg === 1 || tg === c; }   // Kiste c = Farbe+1, Ziel 1 = jede, 2/3/4 = rot/grün/blau
export function targetsDone(L, s) { let d = 0; for (const i of L.targets) if (isTargetDone(L, s, i)) d++; return d; }
export function isSolved(L, s) { return L.targets.length > 0 && targetsDone(L, s) === L.targets.length; }
// Begehbar für Wobbel (ohne Schieben) – für Klick-Laufen
export function walkable(L, s, i) { const t = L.terrain[i]; if (t === T.WALL || t === T.VOID) return false; if (isWater(L, s, i) || isBroken(L, s, i)) return false; if (isDoorClosed(L, s, i) && s.keysHeld < 1) return false; if (s.crate[i]) return false; return true; }
// Kürzester Laufweg ohne zu schieben: Richtungsliste oder null
export function findPath(L, s, from, to) {
  if (from === to) return []; if (!walkable(L, s, to)) return null; const prev = new Int32Array(L.n).fill(-2), pd = new Int8Array(L.n), q = [from]; prev[from] = -1; let keys = s.keysHeld;
  for (let qi = 0; qi < q.length; qi++) { const c = q[qi]; if (c === to) break; for (let d = 0; d < 4; d++) { const nx = c % L.w + DIRS[d][0], ny = ((c / L.w) | 0) + DIRS[d][1]; if (nx < 0 || ny < 0 || nx >= L.w || ny >= L.h) continue; const n = ny * L.w + nx; if (prev[n] !== -2 || arrowBlock(L, c, n, d)) continue; if (!(walkable(L, s, n) || (isDoorClosed(L, s, n) && keys > 0 && !s.crate[n]))) continue; prev[n] = c; pd[n] = d; q.push(n); } }
  if (prev[to] === -2) return null; const path = []; for (let c = to; c !== from; c = prev[c]) path.push(pd[c]); return path.reverse();
}
