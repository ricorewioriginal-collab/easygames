/* ColorPop Universe – Brett-Generator (Version 1). Gleiche Parameter + Startwert = exakt gleiches Brett.
 * Änderungen am Ablauf erfordern eine neue Version (GEN_VERSION) und neue Zertifikate (tools/gen-levels.js). */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var B = CPU.board, C = CPU.cell, K = CPU.K;
  CPU.GEN_VERSION = 1;

  // Brettformen: true = Loch (feste Zelle, kein Stein)
  var SHAPES = {
    none: function () { return false; },
    corners: function (x, y, w, h) { return (x === 0 || x === w - 1) && y === 0; },
    pillars: function (x, y, w, h) { return y === h - 1 && (x === 2 || x === w - 3); },
    island: function (x, y, w, h) { return x === (w >> 1) && y >= h - Math.max(2, h >> 2); },
    steps: function (x, y, w, h) { return y >= h - 2 && x < 2 && x + (h - 1 - y) < 2; },
    hourglass: function (x, y, w, h) { var m = h >> 1; return (x === 0 || x === w - 1) && (y === m || y === m - 1); },
    towers: function (x, y, w, h) { return y >= h - 2 && (x === 1 || x === w - 2); }
  };
  CPU.SHAPES = Object.keys(SHAPES);

  function freeCols(b) {   // Spalten ganz ohne feste Felder (dort kommen Sammelobjekte sicher bis zum Boden)
    var out = [];
    for (var x = 0; x < b.w; x++) { var ok = true; for (var y = 0; y < b.h; y++) if (C.isFixed(b.cells[x + y * b.w])) { ok = false; break; } if (ok) out.push(x); }
    return out;
  }
  // p: { w, h, colors, seed, cluster, shape, sp:{bomb, heat, rocket, prism, rainbow, chain, anchor, neon, wind, wood, rock:[n,hp], ice:[n,layers], items:[n,variant], portals}, marks, gravity }
  function make(p) {
    var r = CPU.rng(p.seed >>> 0), w = p.w, h = p.h, nc = Math.max(2, Math.min(7, p.colors || 4)), b = B.create(w, h);
    var shape = SHAPES[p.shape || 'none'] || SHAPES.none, cl = p.cluster == null ? 0.25 : p.cluster, x, y, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = x + y * w;
      if (shape(x, y, w, h)) { B.set(b, i, C.mk(-1, K.VOID)); continue; }
      var c = r.int(nc);
      if (cl > 0 && r() < cl) {
        var nb = [];
        if (x > 0 && C.color(b.cells[i - 1]) >= 0) nb.push(C.color(b.cells[i - 1]));
        if (y > 0 && C.color(b.cells[i - w]) >= 0) nb.push(C.color(b.cells[i - w]));
        if (nb.length) c = nb[r.int(nb.length)];
      }
      B.set(b, i, C.mk(c));
    }
    var sp = p.sp || {};
    function normals(filter) { var a = []; for (var q = 0; q < w * h; q++) { var v = b.cells[q]; if (v && C.kind(v) === K.NORMAL && !C.ice(v) && (!filter || filter(q % w, (q - q % w) / w))) a.push(q); } return a; }
    function take(list) { if (!list.length) return -1; var k = r.int(list.length), q = list[k]; list.splice(k, 1); return q; }
    function convert(n, kind, argf, filter) {
      var list = normals(filter);
      for (var t = 0; t < (n || 0); t++) { var q = take(list); if (q < 0) return; b.cells[q] = C.mk(C.color(b.cells[q]), kind, 0, argf ? argf(q) : 0); }
    }
    // feste Felder zuerst (sie bestimmen, wo Sammelobjekte möglich sind)
    if (sp.portals) {
      var cols = []; for (x = 0; x < w; x++) if (!C.isFixed(b.cells[x + (h - 1) * w])) cols.push(x);
      for (var pp = 0; pp < sp.portals && cols.length >= 2; pp++) {
        var a1 = take(cols), a2 = take(cols);
        B.set(b, a1 + (h - 1) * w, C.mk(-1, K.PORTAL, 0, pp)); B.set(b, a2 + (h - 1) * w, C.mk(-1, K.PORTAL, 0, pp));
      }
    }
    if (sp.rock) { var rl = normals(function (xx, yy) { return yy >= h >> 1; }); for (var rr = 0; rr < sp.rock[0]; rr++) { var rq = take(rl); if (rq < 0) break; B.set(b, rq, C.mk(-1, K.ROCK, 0, Math.max(1, Math.min(3, sp.rock[1] || 1)))); } }
    convert(sp.anchor, K.ANCHOR, null, function (xx, yy) { return yy > 0 && yy < h - 1; });
    if (sp.items) {
      var fc = freeCols(b), il = normals(function (xx, yy) { return yy < Math.max(2, Math.ceil(h / 3)) && fc.indexOf(xx) >= 0; });
      for (var it = 0; it < sp.items[0]; it++) { var iq = take(il); if (iq < 0) break; B.set(b, iq, C.mk(-1, K.ITEM, 0, sp.items[1] || 0)); }
    }
    if (sp.wood) { var wl = normals(); for (var wd = 0; wd < sp.wood; wd++) { var wq = take(wl); if (wq < 0) break; B.set(b, wq, C.mk(-1, K.WOOD)); } }
    convert(sp.bomb, K.BOMB, function () { return sp.heat ? 1 : 0; });
    convert(sp.rocket, K.ROCKET, function () { return r.int(2); });
    convert(sp.chain, K.CHAIN);
    convert(sp.neon, K.NEON);
    convert(sp.wind, K.WIND, function () { var d = sp.windDirs || [1, 3]; return d[r.int(d.length)]; });
    convert(sp.rainbow, K.RAINBOW, function (q) { var own = C.color(b.cells[q]); return (own + 1 + r.int(nc - 1)) % nc; });
    if (sp.prism) { var pl = normals(); for (var pr = 0; pr < sp.prism; pr++) { var pq = take(pl); if (pq < 0) break; b.cells[pq] = C.mk(-1, K.PRISM); } }
    if (sp.ice) { var icl = normals(); for (var ic = 0; ic < sp.ice[0]; ic++) { var cq = take(icl); if (cq < 0) break; b.cells[cq] = C.setIce(b.cells[cq], Math.max(1, Math.min(3, typeof sp.ice[1] === 'number' ? sp.ice[1] : 1 + r.int(3)))); } }
    if (p.marks) {
      b.marks = new Uint8Array(w * h);
      if (p.marks === 'rect') { var mx = Math.max(1, w >> 2), my = Math.max(1, h >> 2); for (y = my; y < h - my; y++) for (x = mx; x < w - mx; x++) if (C.isPiece(b.cells[x + y * w]) && C.color(b.cells[x + y * w]) >= 0) b.marks[x + y * w] = 1; }
      else { var ml = []; for (var q2 = 0; q2 < w * h; q2++) if (C.color(b.cells[q2]) >= 0) ml.push(q2); for (var m = 0; m < p.marks; m++) { var mq = take(ml); if (mq < 0) break; b.marks[mq] = 1; } }
    }
    return b;
  }
  // Brett für eine Leveldefinition (ganz festes Gitter „grid“ oder Generator); versucht bei zugloser Startlage seed+1 … (seedTries)
  function boardFor(def) {
    if (def.grid) {
      var bb = B.fromRows(def.grid);
      if (def.markGrid) { bb.marks = new Uint8Array(bb.w * bb.h); def.markGrid.forEach(function (row, yy) { for (var xx = 0; xx < row.length; xx++) if (row[xx] === '1') bb.marks[xx + yy * bb.w] = 1; }); }
      return bb;
    }
    var p = Object.assign({}, def), b;
    for (var t = 0; t < 50; t++) { b = make(p); if (B.hasMove(b, (def.rules && def.rules.minGroup) || 2)) return b; p.seed = (p.seed + 1) >>> 0; }
    return b;
  }
  CPU.gen = { make: make, boardFor: boardFor, freeCols: freeCols };
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
