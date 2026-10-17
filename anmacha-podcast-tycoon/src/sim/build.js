/* Bau-Logik ohne DOM: Raster eines Grundstücks mit Böden, Wänden (Kanten), Türen, Fenstern und Objekten,
   Platzierungsregeln, Wegeprüfung, Raumerkennung, Raumbewertung, Rückgängig/Wiederholen.
   Kanten: 'h:x,z' = waagerechte Kante oben an Feld (x,z); 'v:x,z' = senkrechte Kante links an Feld (x,z).
   Objekt: { u: eindeutige ID, id: Objekt-Typ, x, z: linke obere Ecke, r: Drehung 0..3 }. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA;
  const B = PT.Build = {};
  const FLOORS = () => D.buildParts.floors;
  const def = id => D.objectById[id];

  B.size = (o) => { const d = def(o.id); return o.r % 2 ? [d.d, d.w] : [d.w, d.d]; };
  B.cells = (o) => { const [w, d] = B.size(o), out = []; for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) out.push([o.x + x, o.z + z]); return out; };
  B.idx = (lot, x, z) => z * lot.w + x;
  B.inLot = (lot, x, z) => x >= 0 && z >= 0 && x < lot.w && z < lot.d;
  B.floorAt = (lot, x, z) => B.inLot(lot, x, z) ? lot.floor[B.idx(lot, x, z)] : 0;
  B.edge = (lot, k) => lot.walls[k] || null;
  // Kante zwischen zwei benachbarten Feldern
  B.edgeKey = (x1, z1, x2, z2) => x2 === x1 ? 'h:' + x1 + ',' + Math.max(z1, z2) : 'v:' + Math.max(x1, x2) + ',' + z1;
  B.blocksMove = (lot, x1, z1, x2, z2) => { const e = lot.walls[B.edgeKey(x1, z1, x2, z2)]; return e === 'wall' || e === 'window'; };
  // Rückseite eines Wandobjekts
  B.backEdge = (o) => { const r = o.r & 3; return r === 0 ? 'h:' + o.x + ',' + o.z : r === 1 ? 'v:' + (o.x + 1) + ',' + o.z : r === 2 ? 'h:' + o.x + ',' + (o.z + 1) : 'v:' + o.x + ',' + o.z; };

  B.createLot = function (id, w, d, owned) {
    return { id, w, d, owned: !!owned, floor: new Array(w * d).fill(0), walls: {}, objs: [], rooms: [], ver: 1 };
  };
  const floorIndex = type => FLOORS().findIndex(f => f.id === type) + 1;
  function addRectWalls(lot, x0, z0, x1, z1, doors, windows) {
    for (let x = x0; x < x1; x++) { lot.walls['h:' + x + ',' + z0] = 'wall'; lot.walls['h:' + x + ',' + z1] = 'wall'; }
    for (let z = z0; z < z1; z++) { lot.walls['v:' + x0 + ',' + z] = 'wall'; lot.walls['v:' + x1 + ',' + z] = 'wall'; }
    const put = (arr, kind) => (arr || []).forEach(([side, i]) => {
      const k = side === 'n' ? 'h:' + (x0 + i) + ',' + z0 : side === 's' ? 'h:' + (x0 + i) + ',' + z1 : side === 'w' ? 'v:' + x0 + ',' + (z0 + i) : 'v:' + x1 + ',' + (z0 + i);
      lot.walls[k] = kind;
    });
    put(windows, 'window'); put(doors, 'door');
  }
  function addLine(lot, x1, z1, x2, z2, kind) {
    if (z1 === z2) for (let x = Math.min(x1, x2); x < Math.max(x1, x2); x++) lot.walls['h:' + x + ',' + z1] = kind;
    else for (let z = Math.min(z1, z2); z < Math.max(z1, z2); z++) lot.walls['v:' + x1 + ',' + z] = kind;
  }
  B.addLine = addLine;
  /** Baut einen Bauplan (Gebäude aus districts.js) als eigenes Raster. */
  B.fromBlueprint = function (bp) {
    const lot = B.createLot(bp.id, bp.w, bp.d, true);
    lot.floor.fill(floorIndex(bp.floor || 'holz') || 1);
    addRectWalls(lot, 0, 0, bp.w, bp.d, bp.doors, bp.windows);
    (bp.inner || []).forEach(l => addLine(lot, l[0], l[1], l[2], l[3], l[4]));
    let n = 0; (bp.objs || []).forEach(o => lot.objs.push({ u: 'b' + (n++), id: o[0], x: o[1], z: o[2], r: o[3] | 0 }));
    return lot;
  };
  /** Startaufbau des eigenen Studios. */
  B.applyStartLayout = function (lot, L) {
    L.floors.forEach(f => { for (let z = f.z0; z < f.z1; z++) for (let x = f.x0; x < f.x1; x++) lot.floor[B.idx(lot, x, z)] = floorIndex(f.type); });
    addRectWalls(lot, L.rect.x0, L.rect.z0, L.rect.x1, L.rect.z1, L.doors, L.windows);
    L.inner.forEach(l => addLine(lot, l[0], l[1], l[2], l[3], l[4]));
    let n = 0; L.objs.forEach(o => lot.objs.push({ u: 's' + (n++), id: o[0], x: o[1], z: o[2], r: o[3] | 0 }));
    lot.rooms = L.rooms.map(r => ({ x: r.x, z: r.z, fn: r.fn }));
    lot.ver++;
    return lot;
  };

  // ── Belegung ──────────────────────────────────────────────
  function occupancy(lot, skipU) {
    const floorOcc = {}, surf = {}, top = {}, wall = {}, ceil = {};
    lot.objs.forEach(o => {
      if (o.u === skipU) return; const d = def(o.id); if (!d) return;
      if (d.layer === 'wall') { wall[B.backEdge(o)] = o.u; return; }
      B.cells(o).forEach(([x, z]) => {
        const k = x + ',' + z;
        if (d.layer === 'floor') { floorOcc[k] = o.u; if (d.surface) surf[k] = o.u; }
        else if (d.layer === 'top') top[k] = (top[k] || 0) + 1; else if (d.layer === 'ceil') ceil[k] = o.u;
      });
    });
    return { floorOcc, surf, top, wall, ceil };
  }
  B.occupancy = occupancy;

  /** Erreichbarkeit: alle freien Bodenfelder müssen vom Eingang (Mitte unten) aus erreichbar sein. */
  B.pathCheck = function (lot, occ) {
    occ = occ || occupancy(lot);
    const start = [Math.floor(lot.w / 2), lot.d - 1];
    const seen = new Uint8Array(lot.w * lot.d), q = [];
    const free = (x, z) => !occ.floorOcc[x + ',' + z];
    if (free(start[0], start[1])) { seen[B.idx(lot, start[0], start[1])] = 1; q.push(start); }
    while (q.length) {
      const [x, z] = q.pop();
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, nz = z + dz; if (!B.inLot(lot, nx, nz)) continue;
        const i = B.idx(lot, nx, nz); if (seen[i] || !free(nx, nz) || B.blocksMove(lot, x, z, nx, nz)) continue;
        seen[i] = 1; q.push([nx, nz]);
      }
    }
    const blocked = [];
    for (let z = 0; z < lot.d; z++) for (let x = 0; x < lot.w; x++) if (lot.floor[B.idx(lot, x, z)] && free(x, z) && !seen[B.idx(lot, x, z)]) blocked.push([x, z]);
    return { ok: blocked.length === 0, blocked, seen };
  };

  /** Prüft eine Platzierung. Liefert { ok, err } mit verständlichem Fehlertext. */
  B.canPlace = function (lot, o, skipU) {
    const d = def(o.id); if (!d) return { ok: false, err: 'Unbekanntes Objekt.' };
    if (!lot.owned) return { ok: false, err: 'Dieses Grundstück gehört euch noch nicht.' };
    const cells = B.cells(o), occ = occupancy(lot, skipU);
    for (const [x, z] of cells) {
      if (!B.inLot(lot, x, z)) return { ok: false, err: 'Außerhalb des Grundstücks.' };
      if (!lot.floor[B.idx(lot, x, z)]) return { ok: false, err: 'Hier ist kein Boden. Lege zuerst Boden.' };
    }
    // Objekt darf nicht über eine Wand hinweg stehen
    for (const [x, z] of cells) for (const [x2, z2] of cells) if (Math.abs(x - x2) + Math.abs(z - z2) === 1 && lot.walls[B.edgeKey(x, z, x2, z2)]) return { ok: false, err: 'Das Objekt würde durch eine Wand ragen.' };
    if (d.layer === 'wall') {
      const be = B.backEdge(o); if (lot.walls[be] !== 'wall') return { ok: false, err: 'Muss mit der Rückseite an einer Wand hängen (drehen mit R).' };
      if (occ.wall[be]) return { ok: false, err: 'An dieser Wandstelle hängt schon etwas.' };
      return { ok: true };
    }
    if (d.layer === 'ceil') { for (const [x, z] of cells) if (occ.ceil[x + ',' + z]) return { ok: false, err: 'An der Decke hängt hier schon etwas.' }; return { ok: true }; }
    if (d.layer === 'top') {
      for (const [x, z] of cells) { if (!occ.surf[x + ',' + z]) return { ok: false, err: 'Braucht eine Ablage (Tisch, Schreibtisch, Tresen oder Werkbank).' }; if ((occ.top[x + ',' + z] || 0) >= 2) return { ok: false, err: 'Auf dieser Ablage ist kein Platz mehr (höchstens 2 Geräte je Feld).' }; }
      return { ok: true };
    }
    for (const [x, z] of cells) {
      if (occ.floorOcc[x + ',' + z]) return { ok: false, err: 'Der Platz ist belegt.' };
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (lot.walls[B.edgeKey(x, z, x + dx, z + dz)] === 'door') return { ok: false, err: 'Türen müssen frei bleiben.' };
    }
    // Wegeprüfung mit dem neuen Objekt
    const test = { w: lot.w, d: lot.d, floor: lot.floor, walls: lot.walls, objs: lot.objs.filter(x => x.u !== skipU).concat([Object.assign({ u: '__test' }, o)]) };
    const pc = B.pathCheck(test);
    if (!pc.ok) return { ok: false, err: 'Das würde einen Weg versperren.' };
    return { ok: true };
  };
  B.canWall = function (lot, key, kind) {
    if (!lot.owned) return { ok: false, err: 'Dieses Grundstück gehört euch noch nicht.' };
    const m = /^([hv]):(-?\d+),(-?\d+)$/.exec(key); if (!m) return { ok: false, err: 'Ungültige Kante.' };
    const t = m[1], x = +m[2], z = +m[3];
    if (t === 'h' ? (x < 0 || x >= lot.w || z < 0 || z > lot.d) : (x < 0 || x > lot.w || z < 0 || z >= lot.d)) return { ok: false, err: 'Außerhalb des Grundstücks.' };
    // Kante darf kein Objekt teilen
    const occ = occupancy(lot); const a = t === 'h' ? [x, z - 1] : [x - 1, z], b = [x, z];
    const ua = occ.floorOcc[a.join(',')], ub = occ.floorOcc[b.join(',')];
    if (ua && ua === ub) return { ok: false, err: 'Hier steht ein Objekt im Weg.' };
    if (kind === 'door') { for (const c of [a, b]) if (occ.floorOcc[c.join(',')]) return { ok: false, err: 'Vor und hinter einer Tür muss frei sein.' }; }
    if (kind === 'none') { if (Object.values(occ.wall).length) { const hang = lot.objs.find(o => def(o.id).layer === 'wall' && B.backEdge(o) === key); if (hang) return { ok: false, err: 'Erst das Wandobjekt entfernen.' }; } return { ok: true }; }
    const walls = Object.assign({}, lot.walls); walls[key] = kind;
    const pc = B.pathCheck({ w: lot.w, d: lot.d, floor: lot.floor, walls, objs: lot.objs }, null);
    if (!pc.ok) return { ok: false, err: 'Diese Wand würde einen Raum unerreichbar machen. Setze eine Tür.' };
    return { ok: true };
  };
  B.canFloor = function (lot, x, z, type) {
    if (!lot.owned) return { ok: false, err: 'Dieses Grundstück gehört euch noch nicht.' };
    if (!B.inLot(lot, x, z)) return { ok: false, err: 'Außerhalb des Grundstücks.' };
    if (!type) { const occ = occupancy(lot); const k = x + ',' + z; if (occ.floorOcc[k] || occ.top[k] || occ.ceil[k]) return { ok: false, err: 'Erst die Objekte auf diesem Feld entfernen.' }; }
    return { ok: true };
  };

  // ── Räume ─────────────────────────────────────────────────
  B.regions = function (lot) {
    const reg = new Int32Array(lot.w * lot.d).fill(-1), list = [];
    for (let z0 = 0; z0 < lot.d; z0++) for (let x0 = 0; x0 < lot.w; x0++) {
      const i0 = B.idx(lot, x0, z0); if (!lot.floor[i0] || reg[i0] >= 0) continue;
      const id = list.length, cells = [], q = [[x0, z0]]; reg[i0] = id; let enclosed = true;
      while (q.length) {
        const [x, z] = q.pop(); cells.push([x, z]);
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, nz = z + dz, e = lot.walls[B.edgeKey(x, z, nx, nz)];
          if (e) continue; // jede Wand/Tür/Fenster begrenzt den Raum
          if (!B.inLot(lot, nx, nz) || !lot.floor[B.idx(lot, nx, nz)]) { enclosed = false; continue; }
          const ni = B.idx(lot, nx, nz); if (reg[ni] >= 0) continue; reg[ni] = id; q.push([nx, nz]);
        }
      }
      list.push({ id, cells, enclosed, area: cells.length });
    }
    return { reg, list };
  };
  function roomReqOk(fnDef, sum, cats, ids) {
    const miss = [];
    Object.keys(fnDef.req).forEach(k => {
      const need = fnDef.req[k];
      let have = 0;
      if (D.objectCats[k]) have = cats[k] || 0;
      else if (k === 'surfaceWork') have = (ids.mo_schreib || 0) + (ids.mo_tisch || 0) + (ids.mo_tresen || 0) + (ids.mo_werkbank || 0);
      else if (def(k)) have = ids[k] || 0;
      else have = sum[k] || 0;
      if (have < need) miss.push({ k, need, have });
    });
    if (fnDef.reqAny && !fnDef.reqAny.some(c => (cats[c] || 0) > 0)) miss.push({ k: fnDef.reqAny.join('/'), need: 1, have: 0 });
    return miss;
  }
  const REQ_NAMES = { seats: 'Sitzplätze', energy: 'Energie (Kaffee/Kühlschrank)', music: 'Musikwert', storage: 'Lagerwert', shop: 'Merch-Wert', surfaceWork: 'Arbeitstisch' };
  B.reqName = k => REQ_NAMES[k] || (D.objectCats[k] ? D.objectCats[k].name : def(k) ? def(k).name : k);
  /** Bewertet alle Räume eines Grundstücks. */
  B.evaluate = function (lot) {
    const { reg, list } = B.regions(lot);
    const rooms = list.map(r => ({ id: r.id, cells: r.cells, area: r.area, enclosed: r.enclosed, fn: null, sum: {}, cats: {}, ids: {}, objs: [], valid: false, miss: [], value: 0 }));
    lot.rooms.forEach(a => { if (!B.inLot(lot, a.x, a.z)) return; const ri = reg[B.idx(lot, a.x, a.z)]; if (ri >= 0) rooms[ri].fn = a.fn; });
    lot.objs.forEach(o => {
      const d = def(o.id); if (!d) return;
      let c = B.cells(o)[0];
      if (d.layer === 'wall') { const r = o.r & 3; c = [o.x, o.z]; if (!B.inLot(lot, c[0], c[1]) || !lot.floor[B.idx(lot, c[0], c[1])]) c = r === 0 ? [o.x, o.z - 1] : r === 1 ? [o.x + 1, o.z] : r === 2 ? [o.x, o.z + 1] : [o.x - 1, o.z]; }
      if (!B.inLot(lot, c[0], c[1])) return; const ri = reg[B.idx(lot, c[0], c[1])]; if (ri < 0) return;
      const R = rooms[ri]; R.objs.push(o);
      R.cats[d.cat] = (R.cats[d.cat] || 0) + 1; R.ids[d.id] = (R.ids[d.id] || 0) + 1;
      Object.keys(d.s).forEach(k => { R.sum[k] = (R.sum[k] || 0) + d.s[k]; });
    });
    rooms.forEach(R => {
      // Boden zählt mit (Teppich dämpft, Parkett wohnlich)
      let fa = 0, fc = 0; R.cells.forEach(([x, z]) => { const f = FLOORS()[lot.floor[B.idx(lot, x, z)] - 1]; if (f) { fa += f.absorb; fc += f.comfort; } });
      R.sum.absorb = (R.sum.absorb || 0) + fa / Math.max(1, R.area) * 4; R.sum.comfort = (R.sum.comfort || 0) + fc / Math.max(1, R.area) * 3;
      if (!R.fn) return;
      const F = D.roomFns[R.fn]; if (!F) return;
      R.miss = roomReqOk(F, R.sum, R.cats, R.ids);
      if (!R.enclosed) R.miss.unshift({ k: 'enclosed', need: 1, have: 0 });
      if (R.area < F.minArea) R.miss.unshift({ k: 'area', need: F.minArea, have: R.area });
      R.valid = R.miss.length === 0;
      R.value = Math.round(F.stats.reduce((t, k) => t + Math.max(0, R.sum[k] || 0), 0) * (R.valid ? 1 : 0));
    });
    return rooms;
  };
  B.missText = function (m) {
    if (m.k === 'enclosed') return 'Raum ist nicht rundum von Wänden umschlossen';
    if (m.k === 'area') return 'Zu klein: ' + m.have + ' von ' + m.need + ' m²';
    return B.reqName(m.k) + ': ' + PT.round(m.have, 1) + ' / ' + m.need;
  };

  // ── Befehle mit Rückgängig/Wiederholen ─────────────────────
  // Jeder Befehl kennt seine Umkehrung; Kosten werden über cb.money(delta) gebucht.
  B.apply = function (lot, cmd) {
    if (cmd.t === 'place') { lot.objs.push(Object.assign({}, cmd.o)); }
    else if (cmd.t === 'remove') { lot.objs = lot.objs.filter(o => o.u !== cmd.o.u); }
    else if (cmd.t === 'move') { const o = lot.objs.find(x => x.u === cmd.u); if (o) { o.x = cmd.to.x; o.z = cmd.to.z; o.r = cmd.to.r; } }
    else if (cmd.t === 'wall') { if (cmd.to === 'none') delete lot.walls[cmd.k]; else lot.walls[cmd.k] = cmd.to; }
    else if (cmd.t === 'floor') { lot.floor[B.idx(lot, cmd.x, cmd.z)] = cmd.to; }
    else if (cmd.t === 'rooms') { lot.rooms = cmd.to.map(a => Object.assign({}, a)); }
    lot.ver++;
  };
  B.invert = function (cmd) {
    if (cmd.t === 'place') return { t: 'remove', o: cmd.o, cost: -cmd.cost };
    if (cmd.t === 'remove') return { t: 'place', o: cmd.o, cost: -cmd.cost };
    if (cmd.t === 'move') return { t: 'move', u: cmd.u, to: cmd.from, from: cmd.to, cost: 0 };
    if (cmd.t === 'wall') return { t: 'wall', k: cmd.k, to: cmd.from, from: cmd.to, cost: -cmd.cost };
    if (cmd.t === 'floor') return { t: 'floor', x: cmd.x, z: cmd.z, to: cmd.from, from: cmd.to, cost: -cmd.cost };
    if (cmd.t === 'rooms') return { t: 'rooms', to: cmd.from, from: cmd.to, cost: 0 };
    return null;
  };

  /** Neue Raumfunktions-Liste: setzt fn für den Raum, in dem (x,z) liegt (fn = null entfernt sie). */
  B.withRoomFn = function (lot, x, z, fn) {
    const regs = B.regions(lot), ri = B.inLot(lot, x, z) ? regs.reg[B.idx(lot, x, z)] : -1;
    if (ri < 0) return null;
    const keep = lot.rooms.filter(a => B.inLot(lot, a.x, a.z) && regs.reg[B.idx(lot, a.x, a.z)] >= 0 && regs.reg[B.idx(lot, a.x, a.z)] !== ri).map(a => Object.assign({}, a));
    if (fn) keep.push({ x, z, fn });
    return keep;
  };
  /** Kurzer Text für ein Objekt (Werte), z. B. im Baumenü. */
  B.statText = function (d) {
    const N = { audio: 'Klang', tech: 'Technik', absorb: 'Akustik', visual: 'Bild', comfort: 'Wohlfühlen', research: 'Recherche', energy: 'Energie', social: 'Reichweite', music: 'Musik', reliab: 'Zuverlässigkeit', seats: 'Sitzplätze', shop: 'Merch', storage: 'Lager' };
    return Object.keys(d.s).filter(k => d.s[k]).map(k => N[k] + ' ' + (d.s[k] > 0 ? '+' : '') + d.s[k]).join(' · ');
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = B;
})(typeof window !== 'undefined' ? window : globalThis);
