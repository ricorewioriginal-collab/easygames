/* Mahjong 3D – Layouts und Reise (Kampagne).
 * Ein Layout besteht aus Teilen: rows = Höhenkarte (Ziffer = Stapelhöhe, '#' = 1, '.' = leer), dx/dy = Versatz in Steinen
 * (0.5 = halber Stein), z = unterste Ebene des Teils. Jede Ziffer n legt Steine auf den Ebenen z … z+n-1. */
(function (root) {
  'use strict';
  const RAW = [
    // ---------- klein ----------
    { id: 'teeschale', name: 'Teeschale', parts: [
      { rows: ['.1111.', '122221', '122221', '.1111.'] },
      { z: 2, dx: 2, dy: 1.5, rows: ['11'] }] },
    { id: 'laterne', name: 'Laterne', parts: [
      { rows: ['.111.', '12221', '12321', '12221', '.111.'] },
      { z: 0, dx: 2, dy: -1, rows: ['1'] }] },
    { id: 'faecher', name: 'Fächer', parts: [
      { rows: ['1111111', '.22222.', '..333..', '...4...'] },
      { z: 0, dx: 3, dy: 4, rows: ['1', '1'] }] },
    { id: 'bruecke', name: 'Brücke', parts: [
      { rows: ['11......11', '1222222221', '11......11'] },
      { z: 2, dx: 3, dy: 1, rows: ['1111'] }] },
    { id: 'blume', name: 'Lotusblüte', parts: [
      { rows: ['..1..', '.121.', '12321', '.121.', '..1..'] },
      { z: 0, dx: -1, dy: 2, rows: ['1'] }, { z: 0, dx: 5, dy: 2, rows: ['1'] },
      { z: 0, dx: 0, dy: 0.5, rows: ['1...1'] }, { z: 0, dx: 0, dy: 3.5, rows: ['1...1'] }, { z: 3, dx: 2, dy: 2, rows: ['1'] }] },
    { id: 'treppe', name: 'Treppe', parts: [
      { rows: ['1111....', '22221111', '33332222', '....3333'] }] },
    { id: 'herz', name: 'Herz', parts: [
      { rows: ['.11.11.', '1221221', '1222221', '.12221.', '..121..', '...1...'] },
      { z: 2, dx: 2.5, dy: 1.5, rows: ['11'] }] },
    { id: 'kreuz', name: 'Kreuz', parts: [
      { rows: ['...11...', '...22...', '11233211', '11233211', '...22...', '...11...'] }] },
    // ---------- mittel ----------
    { id: 'pyramide', name: 'Pyramide', parts: [
      { rows: ['1111111', '1222221', '1233321', '1234321', '1233321', '1222221', '1111111'] },
      { z: 0, dx: -1, dy: 3, rows: ['1'] }, { z: 0, dx: 7, dy: 3, rows: ['1'] }] },
    { id: 'pagode', name: 'Pagode', parts: [
      { rows: ['111111111', '.1222221.', '..12321..', '...232...', '..12321..', '.1222221.', '111111111'] },
      { z: 3, dx: 4, dy: 3, rows: ['1'] }] },
    { id: 'diamant', name: 'Diamant', parts: [
      { rows: ['....1....', '...121...', '..12221..', '.1223221.', '122343221', '.1223221.', '..12221..', '...121...', '....1....'] }] },
    { id: 'ringe', name: 'Zwei Ringe', parts: [
      { rows: ['.2222..2222.', '21..2112..12', '21..2112..12', '.2222..2222.'] },
      { z: 0, dx: 2.5, dy: 1.5, rows: ['1.....1'] }] },
    { id: 'fisch', name: 'Goldfisch', parts: [
      { rows: ['...1111....', '.112222111.', '1223333221.1', '1223333221.1', '.112222111.', '...1111....'] }] },
    { id: 'schmetterling', name: 'Schmetterling', parts: [
      { rows: ['111.....111', '1221...1221', '12221.12221', '.122232221.', '.122232221.', '12221.12221', '1221...1221', '111.....111'] }] },
    { id: 'mondtor', name: 'Mondtor', parts: [
      { rows: ['..222222..', '.22....22.', '22......22', '22......22', '33......33', '33......33', '1111111111'] },
      { z: 0, dx: 3, dy: 3, rows: ['1111'] }, { z: 1, dx: 3.5, dy: 3, rows: ['111'] }, { z: 2, dx: 4, dy: 3, rows: ['1'] }] },
    { id: 'katze', name: 'Glückskatze', parts: [
      { rows: ['1......1', '11....11', '12222221', '12322321', '12233221', '12222221', '.111111.', '.1....1.'] },
      { z: 0, dx: 8, dy: 5, rows: ['11'] }, { z: 0, dx: 9, dy: 4, rows: ['1'] }, { z: 0, dx: 10, dy: 3, rows: ['1'] }] },
    { id: 'spinne', name: 'Spinne', parts: [
      { rows: ['1.......1', '.1.....1.', '..11111..', '..12321..', '111242111', '..12321..', '..11111..', '.1.....1.', '1.......1'] }] },
    { id: 'stern', name: 'Stern', parts: [
      { rows: ['....1....', '....2....', '...121...', '111232111', '.1223221.', '..12321..', '..12.21..', '.11...11.', '11.....11'] }] },
    { id: 'wolke', name: 'Glückswolke', parts: [
      { rows: ['...111.....', '..12221.11.', '.1223321221', '12233332221', '12222222221', '.111111111.'] },
      { z: 3, dx: 4.5, dy: 3, rows: ['1'] }] },
    // ---------- groß ----------
    { id: 'schildkroete', name: 'Schildkröte', parts: [
      { rows: ['.111111111111..', '...12222221....', '..1123333211...', '.111234432111..', '.111234432111..', '..1123333211...', '...12222221....', '.111111111111..'] },
      { z: 0, dx: 0, dy: 3.5, rows: ['1............11'] }, { z: 4, dx: 6.5, dy: 3.5, rows: ['1'] }] },
    { id: 'festung', name: 'Festung', parts: [
      { rows: ['4411111144', '4411111144', '11.2222.11', '11.2332.11', '11.2332.11', '11.2222.11', '4411111144', '4411111144'] }] },
    { id: 'drache', name: 'Drache', parts: [
      { rows: ['11...........', '122.....1111.', '.1221..122221', '..12221221.11', '...1222221...', '....12221....', '.....111.....'] },
      { z: 0, dx: 12.5, dy: 0.5, rows: ['1'] }, { z: 2, dx: 9.5, dy: 2, rows: ['11'] }] },
    { id: 'tempel', name: 'Jadetempel', parts: [
      { rows: ['1111111111', '1222222221', '1223333221', '1223333221', '1223333221', '1223333221', '1222222221', '1111111111'] }] },
    { id: 'arena', name: 'Arena', parts: [
      { rows: ['.2222222222.', '221111111122', '21........12', '21..2222..12', '21..2222..12', '21........12', '221111111122', '.2222222222.'] }] },
    { id: 'zwillinge', name: 'Zwillingstürme', parts: [
      { rows: ['1111..1111', '1551..1551', '1551..1551', '1441111441', '1331221331', '1111..1111'] },
      { z: 5, dx: 1.5, dy: 1.5, rows: ['1.....1'] }] },
    { id: 'krone', name: 'Kaiserkrone', parts: [
      { rows: ['3...3...3', '33.333.33', '232222232', '222222222', '222222222', '111111111', '111111111'] },
      { z: 0, dx: -1, dy: 4.5, rows: ['1..........1'] }] },
    { id: 'berg', name: 'Heiliger Berg', parts: [
      { rows: ['....1111.....', '....12221....', '...1233321...', '..123444321..', '.12334543321.', '1222333332221', '1111111111111'] }] },
    { id: 'palast', name: 'Kaiserpalast', parts: [
      { rows: ['.11111111111.', '12.........21', '1211111111121', '1212333332121', '1212344432121', '1212333332121', '1211111111121', '.11111111111.'] },
      { z: 4, dx: 5.5, dy: 4, rows: ['11'] }] },
    { id: 'schlange', name: 'Schlange', parts: [
      { rows: ['1111111111', '2.........', '2111111111', '.........2', '1111111112', '2.........', '2222222222'] },
      { z: 1, dx: 2, dy: 2, rows: ['111111'] }, { z: 1, dx: 2, dy: 4, rows: ['111111'] }] }
  ];

  function build(def) {
    const tiles = [];
    def.parts.forEach(p => {
      const z0 = p.z || 0, dx = p.dx || 0, dy = p.dy || 0;
      p.rows.forEach((row, r) => {
        for (let c = 0; c < row.length; c++) {
          const ch = row[c]; if (ch === '.' || ch === ' ') continue;
          const h = ch === '#' ? 1 : parseInt(ch, 10);
          for (let k = 0; k < h; k++) tiles.push({ x: Math.round((c + dx) * 2), y: Math.round((r + dy) * 2), z: z0 + k });
        }
      });
    });
    // auf 0 verschieben
    let mx = Infinity, my = Infinity;
    tiles.forEach(t => { mx = Math.min(mx, t.x); my = Math.min(my, t.y); });
    tiles.forEach(t => { t.x -= mx; t.y -= my; });
    // Zeichnungsreihenfolge stabil: unten nach oben, hinten nach vorne
    tiles.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
    return tiles;
  }

  const LAYOUTS = RAW.map(d => {
    const tiles = build(d);
    let w = 0, h = 0, top = 0;
    tiles.forEach(t => { w = Math.max(w, t.x + 2); h = Math.max(h, t.y + 2); top = Math.max(top, t.z + 1); });
    return { id: d.id, name: d.name, tiles, w, h, layers: top, count: tiles.length };
  });
  const BY_ID = {}; LAYOUTS.forEach(l => { BY_ID[l.id] = l; });

  // ---------- Reise: 8 Welten × 6 Level ----------
  const WORLDS = [
    { id: 1, name: 'Teegarten', theme: 'jade', layouts: ['teeschale', 'laterne', 'faecher', 'herz', 'treppe', 'bruecke'] },
    { id: 2, name: 'Bambuswald', theme: 'bambus', layouts: ['blume', 'kreuz', 'pyramide', 'ringe', 'fisch', 'pagode'] },
    { id: 3, name: 'Lotusteich', theme: 'lotus', layouts: ['diamant', 'schmetterling', 'mondtor', 'katze', 'wolke', 'spinne'] },
    { id: 4, name: 'Kirschblütenfest', theme: 'kirsche', layouts: ['stern', 'schlange', 'krone', 'festung', 'herz', 'tempel'] },
    { id: 5, name: 'Drachenberg', theme: 'drache', layouts: ['drache', 'berg', 'zwillinge', 'arena', 'pyramide', 'schildkroete'] },
    { id: 6, name: 'Mondpalast', theme: 'mond', layouts: ['mondtor', 'palast', 'schmetterling', 'diamant', 'wolke', 'festung'] },
    { id: 7, name: 'Jadetempel', theme: 'tempel', layouts: ['tempel', 'spinne', 'berg', 'krone', 'drache', 'arena'] },
    { id: 8, name: 'Kaiserstadt', theme: 'kaiser', layouts: ['palast', 'zwillinge', 'stern', 'schlange', 'festung', 'schildkroete'] }
  ];
  const LEVELS = [];
  WORLDS.forEach(w => w.layouts.forEach((lid, i) => {
    const L = BY_ID[lid];
    if (!L) throw new Error('Layout fehlt: ' + lid);
    const n = LEVELS.length;
    // Zielzeit für den zweiten Stern: wird mit den Welten knapper
    const per = 2.6 - Math.min(1.1, (w.id - 1) * 0.15);
    LEVELS.push({ id: 'w' + w.id + '-' + (i + 1), world: w.id, index: i, n, layout: lid, seed: 1000 + n * 7919, par: Math.round(L.count * per + 10 * L.layers) });
  }));
  const LEVEL_BY_ID = {}; LEVELS.forEach(l => { LEVEL_BY_ID[l.id] = l; });

  // Tagesrätsel: großes Layout und Mischung aus dem Datum
  function dailyFor(dateKey) {
    const big = LAYOUTS.filter(l => l.count >= 100);
    const h = root.MJEngine ? root.MJEngine.hash('mj-daily-' + dateKey) : 1;
    const L = big[h % big.length];
    return { id: 'daily-' + dateKey, layout: L.id, seed: h, par: Math.round(L.count * 1.9 + 10 * L.layers) };
  }

  const api = { LAYOUTS, BY_ID, WORLDS, LEVELS, LEVEL_BY_ID, dailyFor, build };
  root.MJLayouts = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
