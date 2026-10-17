/* AnMaCha Podcast Tycoon 3D – Raster-Navigation (1-m-Felder) mit Kantensperren und A*.
   Bits je Feld: 1 = belegt (Requisit/Objekt), 2 = Wand an der Ostkante (zum Feld x+1), 4 = Wand an der Südkante (zum Feld z+1).
   Welt-Koordinaten: x = Osten, z = Süden; Feld (gx, gz) deckt [gx - half, gx - half + 1) × [gz - half, …) ab.
   Ohne THREE und ohne DOM nutzbar (Node-Tests). */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const N = PT.Nav = {};
  const SQ2 = Math.SQRT2;

  N.create = function (half) {
    const S = Math.round(half * 2), size = S * S;
    const bits = new Uint8Array(size), hgt = new Uint8Array(size);
    // A*-Arbeitsspeicher (einmal angelegt, per Generationsmarke wiederverwendet)
    const gScore = new Float32Array(size), parent = new Int32Array(size), stamp = new Uint32Array(size), closed = new Uint32Array(size);
    const HCAP = size * 4, heapI = new Int32Array(HCAP), heapF = new Float32Array(HCAP);
    let gen = 0, heapN = 0;

    const g = { half, S, size, bits, hgt, searches: 0 };
    const cell = v => Math.floor(v + half);
    const inb = (x, z) => x >= 0 && z >= 0 && x < S && z < S;
    g.cell = cell; g.inb = inb;
    g.idx = (x, z) => z * S + x;
    g.center = gc => gc - half + 0.5;
    g.solid = (x, z) => !inb(x, z) || (bits[z * S + x] & 1) !== 0;
    g.setSolid = (x, z, v) => { if (!inb(x, z)) return; const i = z * S + x; if (v) bits[i] |= 1; else bits[i] &= ~1; };
    g.heightAt = (x, z) => { const gx = cell(x), gz = cell(z); return inb(gx, gz) ? hgt[gz * S + gx] * 0.05 : 0; };
    g.setHeight = (gx, gz, h) => { if (inb(gx, gz)) hgt[gz * S + gx] = Math.max(0, Math.min(255, Math.round(h / 0.05))); };

    /** Felder mit Mittelpunkt im Rechteck belegen (mind. das Feld der Mitte). */
    g.solidRect = function (x0, z0, x1, z1) {
      const a = cell(Math.min(x0, x1)), b = cell(Math.max(x0, x1) - 1e-6), c = cell(Math.min(z0, z1)), d = cell(Math.max(z0, z1) - 1e-6);
      let n = 0;
      for (let z = c; z <= d; z++) for (let x = a; x <= b; x++) {
        const cx = x - half + 0.5, cz = z - half + 0.5;
        if (cx >= Math.min(x0, x1) - 0.05 && cx <= Math.max(x0, x1) + 0.05 && cz >= Math.min(z0, z1) - 0.05 && cz <= Math.max(z0, z1) + 0.05) { g.setSolid(x, z, 1); n++; }
      }
      if (!n) g.setSolid(cell((x0 + x1) / 2), cell((z0 + z1) / 2), 1);
    };
    /** Gedrehtes Rechteck (Mitte, Drehung ry, halbe Breite/Tiefe). */
    g.solidRot = function (cx, cz, ry, hw, hd) {
      const c = Math.cos(ry), s = Math.sin(ry), R = Math.hypot(hw, hd) + 1;
      let n = 0;
      for (let z = cell(cz - R); z <= cell(cz + R); z++) for (let x = cell(cx - R); x <= cell(cx + R); x++) {
        const px = x - half + 0.5 - cx, pz = z - half + 0.5 - cz;
        // in lokale Koordinaten (Drehung um y: lokal = R(-ry) · p)
        const lx = px * c - pz * s, lz = px * s + pz * c;
        if (Math.abs(lx) <= hw + 0.05 && Math.abs(lz) <= hd + 0.05) { g.setSolid(x, z, 1); n++; }
      }
      if (!n) g.setSolid(cell(cx), cell(cz), 1);
    };
    g.solidCircle = function (cx, cz, r) {
      let n = 0;
      for (let z = cell(cz - r); z <= cell(cz + r); z++) for (let x = cell(cx - r); x <= cell(cx + r); x++) {
        const px = x - half + 0.5 - cx, pz = z - half + 0.5 - cz;
        if (px * px + pz * pz <= r * r + 0.05) { g.setSolid(x, z, 1); n++; }
      }
      if (!n) g.setSolid(cell(cx), cell(cz), 1);
    };
    /** Waagerechte Wand auf der Linie z = zLine (ganzzahlig) von x0 bis x1. */
    g.wallH = function (x0, x1, zLine, on) {
      const gz = Math.round(zLine + half) - 1; if (gz < -1 || gz >= S) return;
      for (let x = cell(Math.min(x0, x1) + 1e-6); x <= cell(Math.max(x0, x1) - 1e-6); x++) {
        if (gz >= 0 && inb(x, gz)) { if (on === false) bits[gz * S + x] &= ~4; else bits[gz * S + x] |= 4; }
      }
    };
    /** Senkrechte Wand auf der Linie x = xLine (ganzzahlig) von z0 bis z1. */
    g.wallV = function (xLine, z0, z1, on) {
      const gx = Math.round(xLine + half) - 1; if (gx < -1 || gx >= S) return;
      for (let z = cell(Math.min(z0, z1) + 1e-6); z <= cell(Math.max(z0, z1) - 1e-6); z++) {
        if (gx >= 0 && inb(gx, z)) { if (on === false) bits[z * S + gx] &= ~2; else bits[z * S + gx] |= 2; }
      }
    };
    /** Bereich leeren (Felder gx0..gx1-1, gz0..gz1-1) samt Kanten am Rand (für Neuaufbau eines Grundstücks). */
    g.clearArea = function (gx0, gz0, gx1, gz1) {
      for (let z = gz0 - 1; z < gz1; z++) for (let x = gx0 - 1; x < gx1; x++) {
        if (!inb(x, z)) continue; const i = z * S + x;
        const inside = x >= gx0 && z >= gz0;
        if (inside) { bits[i] = 0; hgt[i] = 0; }
        else if (x === gx0 - 1 && z >= gz0) bits[i] &= ~2;
        else if (z === gz0 - 1 && x >= gx0) bits[i] &= ~4;
      }
    };
    /** Darf man vom Feld (x,z) zum Nachbarn (x+dx, z+dz) (orthogonal) gehen? extra(gx,gz,fx,fz) → true = gesperrt. */
    function stepO(x, z, dx, dz, extra) {
      const nx = x + dx, nz = z + dz;
      if (!inb(nx, nz) || !inb(x, z)) return false;
      if (bits[nz * S + nx] & 1) return false;
      if (dx === 1 && (bits[z * S + x] & 2)) return false;
      if (dx === -1 && (bits[z * S + nx] & 2)) return false;
      if (dz === 1 && (bits[z * S + x] & 4)) return false;
      if (dz === -1 && (bits[nz * S + x] & 4)) return false;
      if (extra && extra(nx, nz, x, z)) return false;
      return true;
    }
    g.canStep = function (x, z, dx, dz, extra) {
      if (!dx || !dz) return stepO(x, z, dx, dz, extra);
      return stepO(x, z, dx, 0, extra) && stepO(x + dx, z, 0, dz, extra) && stepO(x, z, 0, dz, extra) && stepO(x, z + dz, dx, 0, extra);
    };
    /** Zwischen zwei benachbarten Feldern (auch diagonal) passierbar? */
    g.passable = (ax, az, bx, bz, extra) => (ax === bx && az === bz) ? true : (Math.abs(bx - ax) <= 1 && Math.abs(bz - az) <= 1 && g.canStep(ax, az, bx - ax, bz - az, extra));

    /** Nächstes freies Feld (Spirale bis maxR). */
    g.nearestFree = function (gx, gz, maxR, extra) {
      maxR = maxR || 8;
      const free = (x, z) => inb(x, z) && !(bits[z * S + x] & 1) && !(extra && extra(x, z, x, z));
      if (free(gx, gz)) return [gx, gz];
      for (let r = 1; r <= maxR; r++) {
        let best = null, bd = 1e9;
        for (let z = gz - r; z <= gz + r; z++) for (let x = gx - r; x <= gx + r; x++) {
          if (Math.max(Math.abs(x - gx), Math.abs(z - gz)) !== r || !free(x, z)) continue;
          const d = (x - gx) * (x - gx) + (z - gz) * (z - gz); if (d < bd) { bd = d; best = [x, z]; }
        }
        if (best) return best;
      }
      return null;
    };
    /** Sichtlinie zwischen zwei Weltpunkten über passierbare Felder. */
    g.los = function (ax, az, bx, bz, extra) {
      const dist = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(dist / 0.3));
      let px = cell(ax), pz = cell(az);
      for (let i = 1; i <= n; i++) {
        const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        // seitliche Prüfpunkte für Figurenbreite
        const cx = cell(x), cz = cell(z);
        if (cx !== px || cz !== pz) { if (!g.passable(px, pz, cx, cz, extra)) return false; px = cx; pz = cz; }
      }
      return true;
    };

    // Binärer Heap (min nach f)
    function hPush(i, f) {
      if (heapN >= HCAP) return;
      let k = heapN++;
      while (k > 0) { const p = (k - 1) >> 1; if (heapF[p] <= f) break; heapI[k] = heapI[p]; heapF[k] = heapF[p]; k = p; }
      heapI[k] = i; heapF[k] = f;
    }
    function hPop() {
      const top = heapI[0]; heapN--;
      if (heapN > 0) {
        const li = heapI[heapN], lf = heapF[heapN]; let k = 0;
        for (;;) {
          let c = 2 * k + 1; if (c >= heapN) break;
          if (c + 1 < heapN && heapF[c + 1] < heapF[c]) c++;
          if (heapF[c] >= lf) break;
          heapI[k] = heapI[c]; heapF[k] = heapF[c]; k = c;
        }
        heapI[k] = li; heapF[k] = lf;
      }
      return top;
    }
    const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, SQ2], [1, -1, SQ2], [-1, 1, SQ2], [-1, -1, SQ2]];

    /** A* von Welt (sx,sz) nach (tx,tz). Liefert [[x,z], …] (Weltpunkte, geglättet) oder null. */
    g.findPath = function (sx, sz, tx, tz, opt) {
      opt = opt || {};
      const extra = opt.extra || null, maxIter = opt.maxIter || 40000;
      g.searches++;
      let s = [cell(sx), cell(sz)], t = [cell(tx), cell(tz)];
      if (!inb(s[0], s[1]) || !inb(t[0], t[1])) return null;
      if (bits[t[1] * S + t[0]] & 1) { t = g.nearestFree(t[0], t[1], 6, extra); if (!t) return null; }
      if (s[0] === t[0] && s[1] === t[1]) return [[tx, tz]];
      gen++; if (gen >= 0xfffffff0) { gen = 1; stamp.fill(0); closed.fill(0); }
      heapN = 0;
      const si = s[1] * S + s[0], ti = t[1] * S + t[0];
      const H = (x, z) => { const dx = Math.abs(x - t[0]), dz = Math.abs(z - t[1]); return (dx + dz) + (SQ2 - 2) * Math.min(dx, dz); };
      stamp[si] = gen; gScore[si] = 0; parent[si] = -1; hPush(si, H(s[0], s[1]));
      let iter = 0, found = false, bestI = si, bestH = H(s[0], s[1]);
      while (heapN > 0 && iter++ < maxIter) {
        const ci = hPop(); if (closed[ci] === gen) continue; closed[ci] = gen;
        if (ci === ti) { found = true; break; }
        const cx = ci % S, cz = (ci / S) | 0, cg = gScore[ci];
        for (let k = 0; k < 8; k++) {
          const d = DIRS[k], nx = cx + d[0], nz = cz + d[1];
          if (!inb(nx, nz)) continue; const ni = nz * S + nx;
          if (closed[ni] === gen) continue;
          if (!g.canStep(cx, cz, d[0], d[1], extra)) continue;
          const ng = cg + d[2];
          if (stamp[ni] === gen && gScore[ni] <= ng) continue;
          stamp[ni] = gen; gScore[ni] = ng; parent[ni] = ci;
          const h = H(nx, nz); if (h < bestH) { bestH = h; bestI = ni; }
          hPush(ni, ng + h * 1.001);
        }
      }
      let end = found ? ti : (opt.partial ? bestI : -1);
      if (end < 0) return null;
      const cells = []; for (let i = end; i >= 0; i = parent[i]) { cells.push(i); if (i === si) break; }
      cells.reverse();
      const pts = cells.map(i => [(i % S) - half + 0.5, ((i / S) | 0) - half + 0.5]);
      if (found) pts[pts.length - 1] = (bits[t[1] * S + t[0]] & 1) ? pts[pts.length - 1] : (cell(tx) === t[0] && cell(tz) === t[1] ? [tx, tz] : pts[pts.length - 1]);
      // Glätten: so weit wie möglich geradeaus (Sichtlinie), höchstens 14 Punkte voraus prüfen
      const out = [];
      let cur = [sx, sz], i = 0;
      while (i < pts.length - 1) {
        let j = Math.min(pts.length - 1, i + 14);
        while (j > i + 1 && !g.los(cur[0], cur[1], pts[j][0], pts[j][1], extra)) j--;
        out.push(pts[j]); cur = pts[j]; i = j;
      }
      if (!out.length) out.push(pts[pts.length - 1]);
      return out;
    };
    return g;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = N;
})(typeof window !== 'undefined' ? window : globalThis);
