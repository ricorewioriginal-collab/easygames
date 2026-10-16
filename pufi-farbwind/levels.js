// Leveldaten für „Pufi & der Farbwind“: sechs Inseln mit je vier Leveln.
// Jedes Level wird deterministisch aus handgebauten Abschnitten zusammengesetzt.
// Läuft im Browser (window.PufiLevels) und in Node (module.exports) für Tests.
(function (root) {
'use strict';
const ROWS = 22, BASE = 18; // Kartenhöhe in Kacheln, Bodenoberfläche liegt in Reihe 18

const WORLDS = [
  { name: 'Blütenbucht', sky: ['#7fd3ee', '#fff1c8'], far: '#bfe4d0', near: '#93cfa4', soil: '#9a7360', soilDark: '#7c5a4d', grass: '#8fd38f', grassLight: '#c9f0a8', plat: '#e8b98a', boss: 0 },
  { name: 'Honigklippen', sky: ['#ffbe92', '#fbefc9'], far: '#f2c9a0', near: '#e2ae80', soil: '#b07b5c', soilDark: '#8d5f48', grass: '#f0d27a', grassLight: '#fff0b0', plat: '#d99a6c', boss: 1 },
  { name: 'Pilzlichtwald', sky: ['#bfaee6', '#f0d6ee'], far: '#a7a3d2', near: '#8892c0', soil: '#7a5f86', soilDark: '#5e4769', grass: '#a9d48f', grassLight: '#d9f3b4', plat: '#c39ad8', boss: 0 },
  { name: 'Federwolken', sky: ['#8ad2ef', '#fff4e6'], far: '#d6ecf7', near: '#b2d4ea', soil: '#8f9bbd', soilDark: '#707b9e', grass: '#dcf5e4', grassLight: '#ffffff', plat: '#ffffff', boss: 1 },
  { name: 'Kreidegrotten', sky: ['#2f3250', '#6c739c'], far: '#4a4f72', near: '#3d4163', soil: '#5b5d7a', soilDark: '#43445f', grass: '#a9cfd1', grassLight: '#dff7f2', plat: '#8fd8cf', boss: 0 },
  { name: 'Farbwind-Festung', sky: ['#5f3a70', '#d48c9c'], far: '#8f6290', near: '#704a78', soil: '#6d5470', soilDark: '#523d57', grass: '#c8a3b8', grassLight: '#f2d4e0', plat: '#b58aa6', boss: 1 }
];
const PER_WORLD = 4, COUNT = WORLDS.length * PER_WORLD;

// Abschnitte: p = Bodenprofil (Ziffer = Bodenhöhe, Leerzeichen = Abgrund, ~ = Farbsumpf, ^ = Dornen),
// o = Objektreihen von oben nach unten; die letzte Reihe liegt direkt über dem Grundboden.
// Legende: # Block  = Steg  x Bröckelsteg  Q Eierblock  J Sprungpilz  m Schwebeplattform
// o Münze  r rote Münze  F Farbblüte  * Stern  W Flügelwolke(Sterne)  V Flügelwolke(Blüte)  M Farbring
// g Wuschel  h Hüpfer  f Flatterling  k Stachelkugel  p Schnappblüte  P Start  G Ziel  B Boss
const CHUNKS = {
  start: { p: '00000000000000', o: [
    '         o o o',
    '  P           '] },
  ring: { p: '0000000000000000', o: [
    '       *  *     ',
    '                ',
    '        M       ',
    '                ',
    '   o         o  ',
    '                '] },
  goal: { p: '000000000000000000', o: [
    '                  ',
    '   o o o    G     ',
    '                  '] },
  arena: { p: '0000000000000000000000000000009', o: [
    '                               ',
    '                               ',
    '      Q                Q       ',
    '                               ',
    '                               ',
    '               B         G     '] },
  meadow: { t: 0, p: '000000000000000000000000', o: [
    '          * * *         ',
    '                        ',
    '         ======         ',
    '                        ',
    '    o o o          F    ',
    '      g           g     '] },
  hill: { t: 0, p: '0000112233332211000000', o: [
    '         o r o        ',
    '                      ',
    '                      ',
    '                      ',
    '   g              g   '] },
  pit: { t: 0, p: '000000    0000000000', o: [
    '       oo           ',
    '      o  o          ',
    '                    ',
    '             g      '] },
  blocks: { t: 0, p: '0000000000000000000000', o: [
    '              W       ',
    '                      ',
    '                      ',
    '      Q   o o o       ',
    '                      ',
    '                      ',
    '  g            g      '] },
  floaters: { t: 1, p: '00000          00000000000', o: [
    '          V              ',
    '         f               ',
    '                         ',
    '      ooo ooo            ',
    '      === ===            ',
    '                         ',
    '                  g      '] },
  stairs: { t: 1, p: '0000000000000000000000000000', o: [
    '               ***          ',
    '               ####         ',
    '                            ',
    '                            ',
    '         ###          F     ',
    '                            ',
    '                            ',
    '    ###                     ',
    '                            ',
    '        g          k        '] },
  spikes: { t: 1, p: '000000^^^^00000000^^^^0000', o: [
    '      oooo        oooo    ',
    '                          ',
    '                          ',
    '           g              '] },
  crumble: { t: 1, w: [1, 3, 5], p: '0000            0000000', o: [
    '     ooo   ooo         ',
    '     xxx   xxx         ',
    '                       ',
    '                  g    '] },
  springs: { t: 1, w: [2, 3, 0], p: '000000000000000000000000', o: [
    '          * * *         ',
    '               F        ',
    '         =======        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '      J          h      '] },
  clouds: { t: 1, w: [3, 1, 5], p: '0000              000000', o: [
    '         *              ',
    '                        ',
    '      ooo     ooo       ',
    '      m       m         ',
    '                        ',
    '                    f   '] },
  caveSpikes: { t: 2, p: '00000^^^^^^^^00000000', o: [
    '        oo           ',
    '        ##           ',
    '                     ',
    '               k     '] },
  plants: { t: 1, w: [2, 4, 5], p: '000000000000000000000000', o: [
    '          oooo          ',
    '          ====          ',
    '                        ',
    '                        ',
    '     p           p      '] },
  hoppers: { t: 1, p: '0000000011111100000000', o: [
    '        o o o o       ',
    '                      ',
    '                      ',
    '     h           h    '] },
  tower: { t: 2, p: '000000000444444000000000', o: [
    '          r**r          ',
    '                        ',
    '                        ',
    '                        ',
    '   g                 g  '] },
  lava: { t: 2, w: [5, 4], p: '00000~~~~~000000~~~~~0000', o: [
    '       ooo        ooo    ',
    '                         ',
    '                         ',
    '           k             '] },
  pillars: { t: 1, w: [5, 4, 1], p: '0000000000000000000000000', o: [
    '        Q         W      ',
    '             ##          ',
    '             ##          ',
    '      ##     ##          ',
    '      ##     ##    k     '] },
  climb: { t: 2, p: '00000000000000000000', o: [
    '         F          ',
    '        ===         ',
    '                    ',
    '                    ',
    '   ===              ',
    '                    ',
    '                    ',
    '       ===    o     ',
    '                    ',
    '                    ',
    '   ===              ',
    '                    ',
    '              g     '] },
  flyerGap: { t: 1, p: '000000      000000000', o: [
    '        f            ',
    '                     ',
    '       o  o          ',
    '     o      o        ',
    '                     ',
    '               g     '] }
};
const POOL = Object.keys(CHUNKS).filter(k => CHUNKS[k].t !== undefined);

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function chunkList(n) {
  const w = Math.floor(n / PER_WORLD), l = n % PER_WORLD, rand = rng(1009 + n * 7919);
  const tier = n < 2 ? 0 : n < 9 ? 1 : 2;
  const allowed = POOL.filter(k => CHUNKS[k].t <= tier);
  const favoured = allowed.filter(k => CHUNKS[k].w && CHUNKS[k].w.includes(w));
  const generic = allowed.filter(k => !CHUNKS[k].w);
  const boss = l === PER_WORLD - 1, count = boss ? 4 : 6 + Math.min(2, Math.floor(w / 2)) + (l > 0 ? 1 : 0);
  const picks = [];
  for (let i = 0; i < count; i++) {
    const from = favoured.length && rand() < 0.45 ? favoured : generic.concat(favoured);
    let k, guard = 0;
    do { k = from[Math.floor(rand() * from.length)]; } while ((k === picks[picks.length - 1] || (picks.filter(x => x === k).length >= 2)) && guard++ < 20);
    picks.push(k);
  }
  const mid = Math.ceil(picks.length / 2);
  return ['start', ...picks.slice(0, mid), 'ring', ...picks.slice(mid), boss ? 'arena' : 'goal'];
}

function build(n) {
  n = Math.max(0, Math.min(COUNT - 1, n | 0));
  const w = Math.floor(n / PER_WORLD), names = chunkList(n);
  const grid = Array.from({ length: ROWS }, () => []);
  const spawns = [];
  let x = 0, arenaX = -1;
  for (const name of names) {
    const ch = CHUNKS[name], cw = ch.p.length;
    if (name === 'arena') arenaX = x;
    for (let c = 0; c < cw; c++) {
      const pc = ch.p[c];
      for (let r = 0; r < ROWS; r++) grid[r][x + c] = ' ';
      if (pc === ' ') continue;
      if (pc === '~') { grid[ROWS - 2][x + c] = '~'; grid[ROWS - 1][x + c] = '~'; continue; }
      const hgt = pc === '^' ? 0 : +pc;
      for (let r = BASE - hgt; r < ROWS; r++) grid[r][x + c] = '#';
      if (pc === '^') grid[BASE - 1][x + c] = '^';
    }
    const rows = ch.o, top = BASE - rows.length;
    rows.forEach((line, i) => {
      if (line.length > cw) throw new Error('Abschnitt ' + name + ' Reihe ' + i + ' zu lang');
      for (let c = 0; c < line.length; c++) {
        const s = line[c]; if (s === ' ') continue;
        let r = top + i;
        if ('#=Q^'.includes(s)) { grid[r][x + c] = s; continue; }
        while (r > 0 && grid[r][x + c] === '#') r--; // Objekte nie im Boden einbauen
        spawns.push({ c: x + c, r, ch: s });
      }
    });
    x += cw;
  }
  const cols = x;
  // Gegner passend zur Insel variieren.
  let gi = 0;
  for (const s of spawns) if (s.ch === 'g') {
    gi++;
    if (w === 1 && gi % 3 === 0) s.ch = 'h';
    else if (w === 2 && gi % 3 === 0) s.ch = 'h';
    else if (w === 3 && gi % 2 === 0) s.ch = 'f';
    else if (w === 4 && gi % 2 === 0) s.ch = 'k';
    else if (w === 5) s.ch = ['g', 'k', 'h'][gi % 3];
  }
  // Genau fünf Farbblüten pro Level (Blüten auf dem Weg oder in Flügelwolken).
  const FLOWERS = 5;
  let flowers = spawns.filter(s => s.ch === 'F' || s.ch === 'V');
  while (flowers.length > FLOWERS) { const s = flowers.pop(); s.ch = s.ch === 'V' ? 'W' : 'o'; }
  for (const s of spawns) { if (flowers.length >= FLOWERS) break; if (s.ch === 'W') { s.ch = 'V'; flowers.push(s); } }
  const highCoins = spawns.filter(s => s.ch === 'o').sort((a, b) => a.r - b.r || a.c - b.c);
  while (flowers.length < FLOWERS && highCoins.length) { const s = highCoins.shift(); s.ch = 'F'; flowers.push(s); }
  // Rote Münzen sehen fast wie normale aus: bis zu 20, gleichmäßig verteilt.
  const RED = 20, coins = spawns.filter(s => s.ch === 'o');
  let reds = spawns.filter(s => s.ch === 'r').length;
  if (reds < RED && coins.length) {
    const need = Math.min(RED - reds, coins.length), step = coins.length / need;
    for (let i = 0; i < need; i++) coins[Math.floor(i * step + step / 2) % coins.length].ch = 'r';
  }
  reds = spawns.filter(s => s.ch === 'r').length;
  return {
    n, world: w, stage: n % PER_WORLD, boss: n % PER_WORLD === PER_WORLD - 1, final: n === COUNT - 1,
    name: WORLDS[w].name, cols, rows: ROWS, grid: grid.map(r => r.join('')), spawns, arenaX, chunks: names,
    totals: { flowers: spawns.filter(s => s.ch === 'F' || s.ch === 'V').length, red: reds }
  };
}

// Erreichbarkeitsprüfung (für Tests): grobe Sprunghülle über begehbare Felder.
function validate(L) {
  const g = (c, r) => (r < 0 || c < 0 || c >= L.cols) ? ' ' : r >= L.rows ? ' ' : L.grid[r][c];
  const solid = (c, r) => '#Q'.includes(g(c, r));
  const extra = new Set();
  for (const s of L.spawns) {
    if (s.ch === 'x') extra.add(s.c + ',' + s.r);
    if (s.ch === 'm') for (let d = -2; d <= 4; d++) extra.add((s.c + d) + ',' + s.r);
  }
  const floor = (c, r) => solid(c, r) || g(c, r) === '=' || extra.has(c + ',' + r);
  const free = (c, r) => !solid(c, r) && !'^~'.includes(g(c, r));
  const spring = new Set(L.spawns.filter(s => s.ch === 'J').map(s => s.c + ',' + s.r));
  const stand = (c, r) => r > 0 && r < L.rows - 1 && free(c, r) && !solid(c, r - 1) && floor(c, r + 1) && !extra.has(c + ',' + r);
  const start = L.spawns.find(s => s.ch === 'P'), target = L.spawns.find(s => s.ch === (L.boss ? 'B' : 'G'));
  if (!start || !target) return { ok: false, reason: 'Start oder Ziel fehlt' };
  let sr = start.r; while (sr < L.rows && !stand(start.c, sr)) sr++;
  const seen = new Set([start.c + ',' + sr]), queue = [[start.c, sr]];
  while (queue.length) {
    const [c, r] = queue.shift();
    const up = spring.has(c + ',' + r) ? 9 : 4;
    for (let dr = -up; dr <= L.rows; dr++) {
      const r2 = r + dr; if (r2 <= 0 || r2 >= L.rows - 1) continue;
      const reach = dr < 0 ? (up > 4 ? 5 : [7, 6, 6, 5, 4][-dr]) : 7 + Math.floor(dr / 2);
      for (let dc = -reach; dc <= reach; dc++) {
        const c2 = c + dc, k = c2 + ',' + r2;
        if (seen.has(k) || !stand(c2, r2)) continue;
        seen.add(k); queue.push([c2, r2]);
      }
    }
  }
  const reached = [...seen].map(k => k.split(',').map(Number));
  if (!reached.some(([c]) => c >= target.c - 1)) return { ok: false, reason: 'Ziel nicht erreichbar' };
  for (const s of L.spawns) if (s.ch === 'F' || s.ch === 'r') {
    if (!reached.some(([c, r]) => Math.abs(c - s.c) <= 3 && r - s.r >= -1 && r - s.r <= 5)) return { ok: false, reason: (s.ch === 'F' ? 'Blüte' : 'rote Münze') + ' unerreichbar bei Spalte ' + s.c };
  }
  return { ok: true, reachable: seen.size };
}

const api = { WORLDS, PER_WORLD, COUNT, ROWS, BASE, CHUNKS, build, validate, chunkList };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PufiLevels = api;
})(typeof window !== 'undefined' ? window : globalThis);
