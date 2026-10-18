/* AnMaCha UNDERCOVER 3D – Kartenraster: baut aus den Kartendaten (Räume + Gänge als Rechtecke) ein Zellraster und liefert
   Kollision (Kreis gegen Zellen, gleitend), Sichtlinien (DDA), A*-Pfadsuche (8 Richtungen, ohne Ecken abschneiden, mit
   Zusatzkanten für Aufzüge und – nur Verräter – Geheimgänge), automatisch erkannte Türen und Raum-Zuordnung.
   Ohne DOM, deterministisch, Node-testbar. 1 Zelle = 1 Welteinheit; Positionen sind Zellmitten + 0.5. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  function compile(map) {
    const W = map.size[0], H = map.size[1], N = W * H;
    const floor = new Uint8Array(N), room = new Int16Array(N).fill(-1), door = new Int16Array(N).fill(-1), zone = new Float32Array(N).fill(1);
    const idx = (x, y) => y * W + x;
    const fill = (r, fn) => { for (let y = r[1]; y < r[1] + r[3]; y++) for (let x = r[0]; x < r[0] + r[2]; x++) if (x >= 0 && y >= 0 && x < W && y < H) fn(idx(x, y), x, y); };
    map.rooms.forEach((rm, i) => fill(rm.r, c => { floor[c] = 1; room[c] = i; }));
    (map.halls || []).forEach(h => fill(h, c => { floor[c] = 1; }));
    (map.features || []).forEach(f => { if (f.type === 'zone') fill(f.r, c => { zone[c] = f.mul; }); });
    // Türen: Gangzellen, die direkt an eine Raumzelle grenzen (Gruppen je Raum)
    const doors = [];
    const byRoom = {};
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = idx(x, y); if (!floor[c] || room[c] >= 0) continue;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of nb) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const r = room[idx(nx, ny)];
        if (r >= 0) {
          const key = r + ':' + (dx ? 'h' : 'v') + ':' + (dx ? x : y);
          let d = byRoom[key];
          if (!d) { d = byRoom[key] = { id: doors.length, room: r, cells: [], axis: dx ? 'x' : 'y' }; doors.push(d); }
          if (door[c] < 0) { door[c] = d.id; d.cells.push(c); }
          break;
        }
      }
    }
    // zusammenhängende Türzellen trennen, falls ein Raum zwei Gänge auf derselben Linie hat
    const doorList = [];
    doors.forEach(d => {
      const left = new Set(d.cells);
      while (left.size) {
        const start = left.values().next().value, grp = [start]; left.delete(start);
        for (let i = 0; i < grp.length; i++) {
          const c = grp[i], x = c % W, y = (c - x) / W;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const n = idx(x + dx, y + dy); if (left.has(n)) { left.delete(n); grp.push(n); } });
        }
        const id = doorList.length; grp.forEach(c => { door[c] = id; });
        let sx = 0, sy = 0; grp.forEach(c => { sx += c % W + 0.5; sy += Math.floor(c / W) + 0.5; });
        doorList.push({ id, room: d.room, cells: grp, axis: d.axis, x: sx / grp.length, y: sy / grp.length });
      }
    });
    // Zeitgesteuerte Tore (Merkmal "gate") sind ebenfalls Türen
    (map.features || []).forEach((f, fi) => {
      if (f.type !== 'gate') return;
      const cells = []; fill(f.r, c => { if (floor[c]) cells.push(c); });
      const id = doorList.length; cells.forEach(c => { door[c] = id; });
      let sx = 0, sy = 0; cells.forEach(c => { sx += c % W + 0.5; sy += Math.floor(c / W) + 0.5; });
      doorList.push({ id, room: -1, gate: fi, cells, axis: f.r[2] >= f.r[3] ? 'y' : 'x', x: sx / cells.length, y: sy / cells.length });
    });
    const G = {
      map, W, H, floor, room, door, zone, doors: doorList, closed: new Uint8Array(doorList.length),
      idx, links: [],
      cellOf(x, y) { const cx = Math.floor(x), cy = Math.floor(y); return cx < 0 || cy < 0 || cx >= W || cy >= H ? -1 : idx(cx, cy); },
      isFloor(c) { return c >= 0 && floor[c] === 1; },
      blockedCell(c) { if (c < 0 || !floor[c]) return true; const d = door[c]; return d >= 0 && G.closed[d] === 1; },
      blocked(x, y) { return G.blockedCell(G.cellOf(x, y)); },
      roomAt(x, y) { const c = G.cellOf(x, y); return c < 0 ? -1 : room[c]; },
      roomName(i) { return i >= 0 && map.rooms[i] ? map.rooms[i].n : 'Gang'; },
      /** Bewegt einen Kreis (Radius rad) um (dx,dy) mit Gleiten an Wänden. Liefert neue Position. */
      move(x, y, dx, dy, rad) {
        rad = rad || 0.3;
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.25));
        const sx = dx / steps, sy = dy / steps;
        for (let i = 0; i < steps; i++) {
          if (!G.hitCircle(x + sx, y, rad)) x += sx;
          if (!G.hitCircle(x, y + sy, rad)) y += sy;
        }
        return [x, y];
      },
      hitCircle(x, y, r) {
        const x0 = Math.floor(x - r), x1 = Math.floor(x + r), y0 = Math.floor(y - r), y1 = Math.floor(y + r);
        for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
          if (cx < 0 || cy < 0 || cx >= W || cy >= H || G.blockedCell(idx(cx, cy))) {
            const nx = Math.max(cx, Math.min(x, cx + 1)), ny = Math.max(cy, Math.min(y, cy + 1));
            if ((nx - x) * (nx - x) + (ny - y) * (ny - y) < r * r) return true;
          }
        }
        return false;
      },
      /** Sichtlinie zwischen zwei Punkten (Wände und geschlossene Türen blockieren). */
      los(ax, ay, bx, by) {
        let x = Math.floor(ax), y = Math.floor(ay); const ex = Math.floor(bx), ey = Math.floor(by);
        const dx = bx - ax, dy = by - ay, stepX = dx > 0 ? 1 : -1, stepY = dy > 0 ? 1 : -1;
        const tdx = dx ? Math.abs(1 / dx) : Infinity, tdy = dy ? Math.abs(1 / dy) : Infinity;
        let tmx = dx ? ((dx > 0 ? x + 1 - ax : ax - x) * tdx) : Infinity, tmy = dy ? ((dy > 0 ? y + 1 - ay : ay - y) * tdy) : Infinity;
        for (let n = 0; n < 400; n++) {
          if (G.blockedCell(G.cellOf(x + 0.5, y + 0.5))) return false;
          if (x === ex && y === ey) return true;
          if (tmx < tmy) { tmx += tdx; x += stepX; } else { tmy += tdy; y += stepY; }
        }
        return false;
      },
      /** Nächste begehbare Zellmitte zu (x,y). */
      nearestFloor(x, y) {
        const c0 = G.cellOf(x, y); if (c0 >= 0 && floor[c0]) return [Math.floor(x) + 0.5, Math.floor(y) + 0.5];
        let best = null, bd = 1e9;
        for (let c = 0; c < N; c++) if (floor[c]) { const cx = c % W + 0.5, cy = Math.floor(c / W) + 0.5, d = (cx - x) ** 2 + (cy - y) ** 2; if (d < bd) { bd = d; best = [cx, cy]; } }
        return best;
      },
      addLink(ax, ay, bx, by, kind, cost) { const a = G.cellOf(ax, ay), b = G.cellOf(bx, by); if (G.isFloor(a) && G.isFloor(b)) G.links.push({ a, b, kind, cost: cost || 2 }); },
      /** A*: Weg von (ax,ay) nach (bx,by). opt: { vents: bool, ignoreDoors: bool }. Liefert Punktliste (ohne Start) oder null. */
      path(ax, ay, bx, by, opt) {
        opt = opt || {};
        let s = G.cellOf(ax, ay), t = G.cellOf(bx, by);
        if (!G.isFloor(s)) { const p = G.nearestFloor(ax, ay); s = G.cellOf(p[0], p[1]); }
        if (!G.isFloor(t)) { const p = G.nearestFloor(bx, by); t = G.cellOf(p[0], p[1]); }
        if (s === t) return [[bx, by]];
        const pass = c => floor[c] === 1 && (opt.ignoreDoors || !(door[c] >= 0 && G.closed[door[c]]));
        if (!pass(t)) return null;
        const g = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), closedSet = new Uint8Array(N);
        const tx = t % W, ty = (t - tx) / W;
        const hfn = c => { const x = c % W, y = (c - x) / W, ddx = Math.abs(x - tx), ddy = Math.abs(y - ty); return Math.max(ddx, ddy) + 0.414 * Math.min(ddx, ddy); };
        // Binärer Heap
        const heap = [], hp = [];
        const push = (c, f) => { heap.push(c); hp.push(f); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (hp[p] <= hp[i]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; [hp[p], hp[i]] = [hp[i], hp[p]]; i = p; } };
        const pop = () => { const top = heap[0], lc = heap.pop(), lf = hp.pop(); if (heap.length) { heap[0] = lc; hp[0] = lf; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && hp[l] < hp[m]) m = l; if (r < heap.length && hp[r] < hp[m]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; [hp[m], hp[i]] = [hp[i], hp[m]]; i = m; } } return top; };
        const linksFrom = {};
        G.links.forEach(l => { if (l.kind === 'vent' && !opt.vents) return; (linksFrom[l.a] = linksFrom[l.a] || []).push(l); if (l.kind !== 'oneway') (linksFrom[l.b] = linksFrom[l.b] || []).push({ a: l.b, b: l.a, kind: l.kind, cost: l.cost }); });
        g[s] = 0; push(s, hfn(s));
        let found = false, it = 0;
        while (heap.length && it++ < N * 4) {
          const c = pop(); if (closedSet[c]) continue; closedSet[c] = 1;
          if (c === t) { found = true; break; }
          const x = c % W, y = (c - x) / W;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            const n = idx(nx, ny); if (!pass(n) || closedSet[n]) continue;
            if (dx && dy && (!pass(idx(x + dx, y)) || !pass(idx(x, y + dy)))) continue;   // keine Ecken abschneiden
            const cost = (dx && dy ? 1.414 : 1) / Math.max(0.3, zone[n]);
            const ng = g[c] + cost; if (ng < g[n]) { g[n] = ng; from[n] = c; push(n, ng + hfn(n)); }
          }
          (linksFrom[c] || []).forEach(l => { const n = l.b; if (!pass(n) || closedSet[n]) return; const ng = g[c] + l.cost; if (ng < g[n]) { g[n] = ng; from[n] = c; push(n, ng + hfn(n)); } });
        }
        if (!found) return null;
        const cells = []; for (let c = t; c !== s && c >= 0; c = from[c]) cells.push(c);
        cells.reverse();
        // Punkte, Sprünge (Links) markieren
        const pts = []; let prev = s;
        cells.forEach(c => {
          const px = prev % W, py = (prev - px) / W, cx = c % W, cy = (c - cx) / W;
          const jump = Math.abs(cx - px) > 1 || Math.abs(cy - py) > 1;
          pts.push(jump ? [cx + 0.5, cy + 0.5, 'jump'] : [cx + 0.5, cy + 0.5]); prev = c;
        });
        pts[pts.length - 1] = [bx, by];
        // Glätten: Zwischenpunkte weglassen, wenn freie Sicht und keine Sprünge (Radius-sicher geprüft)
        const out = []; let ox = ax, oy = ay, i = 0;
        while (i < pts.length) {
          let j = i;
          if (!pts[i][2]) {
            for (let k = Math.min(pts.length - 1, i + 12); k > i; k--) {
              if (pts.slice(i, k + 1).some(p => p[2])) continue;
              if (G.clearLine(ox, oy, pts[k][0], pts[k][1], 0.32)) { j = k; break; }
            }
          }
          out.push(pts[j]); ox = pts[j][0]; oy = pts[j][1]; i = j + 1;
        }
        return out;
      },
      /** Freie Strecke für einen Kreis mit Radius r (Abtastung). */
      clearLine(ax, ay, bx, by, r) {
        const d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(d / 0.2));
        for (let i = 1; i <= n; i++) { const t = i / n; if (G.hitCircle(ax + (bx - ax) * t, ay + (by - ay) * t, r)) return false; }
        return true;
      },
      /** Alle begehbaren Zellen von (x,y) aus erreichbar? (für Tests) – Anzahl erreichbarer Zellen. */
      reach(x, y, withLinks) {
        const s = G.cellOf(x, y), seen = new Uint8Array(N), q = [s]; seen[s] = 1;
        const lf = {}; if (withLinks) G.links.forEach(l => { (lf[l.a] = lf[l.a] || []).push(l.b); (lf[l.b] = lf[l.b] || []).push(l.a); });
        for (let i = 0; i < q.length; i++) {
          const c = q[i], cx = c % W, cy = (c - cx) / W;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; const n = idx(nx, ny); if (!seen[n] && floor[n]) { seen[n] = 1; q.push(n); } });
          (lf[c] || []).forEach(n => { if (!seen[n]) { seen[n] = 1; q.push(n); } });
        }
        return { count: q.length, seen };
      },
      floorCount() { let n = 0; for (let c = 0; c < N; c++) n += floor[c]; return n; }
    };
    // Aufzüge (alle) und Geheimgänge (nur Verräter) als Zusatzkanten
    (map.features || []).forEach(f => { if (f.type === 'lift') G.addLink(f.a[0], f.a[1], f.b[0], f.b[1], 'lift', 3); });
    (map.vents || []).forEach(v => G.addLink(v[0], v[1], v[2], v[3], 'vent', 2));
    return G;
  }

  AMU.Grid = { compile };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.Grid;
})(typeof window !== 'undefined' ? window : globalThis);
