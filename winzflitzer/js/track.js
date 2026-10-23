// Winzflitzer 3D – Strecke: Spline, Boden-Abfrage (Tisch, Rampen, Brücken, Lücken), Hindernisse, Zonen, Fortschritt
'use strict';
var WF = window.WF = window.WF || {};

// Kollisionsformen der Deko (Maßstab s). c = Kreis {r}, b = Kiste {w, d}; top = Höhe; ohne Eintrag: keine Kollision
WF.PROP_COL = {
  bowl: { c: 5.6, top: 2.6 }, plate: { c: 5.2, top: 0.22 }, cup: { c: 2.3, top: 3.4 }, cereal: { b: [7, 2.6], top: 10 }, toast: { b: [5, 5], top: 0.7 },
  sugar: { b: [1.1, 1.1], top: 1.1 }, jam: { c: 1.9, top: 3 }, egg: { c: 1.4, top: 3.2 }, milk: { b: [3.4, 3.4], top: 9 },
  book: { b: [12, 8.5], top: 1.7 }, mug: { c: 2.5, top: 4.5 }, lamp: { c: 3.6, top: 1.2 }, eraser: { b: [3.2, 1.6], top: 1 },
  pencil: { b: [15, 0.75], top: 0.75 }, calc: { b: [6, 8.5], top: 0.9 },
  soap: { b: [6.2, 3.8], top: 1.6 }, duck: { c: 1.8, top: 3 }, sponge: { b: [6, 4], top: 2.2 }, bottle: { c: 1.6, top: 6 },
  tree: { c: 2.4, top: 40 }, flowers: { c: 4.6, top: 3 }, flower: { c: 0.7, top: 5 }, pot: { c: 2.3, top: 3.2 }, can: { c: 2.6, top: 3.4 },
  gnome: { c: 1.7, top: 4.5 }, stone: { c: 2.2, top: 0.9 },
  castle: { c: 6, top: 5 }, bucket: { c: 2.6, top: 3.6 }, mold: { c: 1.7, top: 1.1 },
  chalk: { b: [1.4, 1.4], top: 1.4 },
  screw: { c: 0.8, top: 2.6 }, nut: { c: 1.4, top: 0.8 }, hammer: { b: [10.5, 1.6], top: 1.3 }, box: { b: [12, 7], top: 5.5 }, vice: { b: [6, 5], top: 5 },
  driver: { b: [9.5, 1.1], top: 1.1 },
  blocks: { c: 4.2, top: 4 }, ballbig: { c: 3.1, top: 6 }, teddy: { c: 4.2, top: 8 }, crayon: { b: [9.5, 1], top: 1 }, train: { b: [11, 2.8], top: 3 }
};

WF.Track = function (def) {
  var th = WF.THEMES[def.theme];
  this.def = def; this.theme = th; this.veh = WF.VEHICLES[th.veh];
  this.w = def.w || 2.7;          // halbe Fahrbahnbreite
  this.W = this.w * 1.3;          // halbe Breite des festen Streckenbodens
  this.ds = 0.5;
  this._sample();
  this._grid();
  this._solids();
};

WF.Track.prototype._sample = function () {
  var def = this.def, P = def.pts, n = P.length;
  var curve = new THREE.CatmullRomCurve3(P.map(function (p) { return new THREE.Vector3(p[0], 0, p[1]); }), true, 'centripetal');
  // dichte Punkte mit Parameter u (0 … n)
  var dense = [], steps = n * 120, v = new THREE.Vector3();
  for (var i = 0; i <= steps; i++) { var t = i / steps; curve.getPoint(t % 1, v); dense.push([v.x, v.z, t * n]); }
  var acc = [0];
  for (i = 1; i < dense.length; i++) acc.push(acc[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  var L = acc[acc.length - 1], N = Math.round(L / this.ds); this.ds = L / N;
  this.length = L; this.N = N;
  var X = this.x = new Float32Array(N), Z = this.z = new Float32Array(N), H = this.h = new Float32Array(N), U = this.u = new Float32Array(N);
  var TX = this.tx = new Float32Array(N), TZ = this.tz = new Float32Array(N), F = this.f = new Uint8Array(N);
  var j = 0;
  for (i = 0; i < N; i++) {
    var s = i * this.ds;
    while (j < acc.length - 2 && acc[j + 1] < s) j++;
    var k = (s - acc[j]) / Math.max(1e-6, acc[j + 1] - acc[j]);
    X[i] = WF.lerp(dense[j][0], dense[j + 1][0], k); Z[i] = WF.lerp(dense[j][1], dense[j + 1][1], k); U[i] = WF.lerp(dense[j][2], dense[j + 1][2], k);
  }
  // Höhe: weich zwischen den Kontrollpunkten
  for (i = 0; i < N; i++) {
    var u = U[i], a = Math.floor(u) % n, b = (a + 1) % n, f = u - Math.floor(u);
    var ha = P[a][2] || 0, hb = P[b][2] || 0;
    H[i] = WF.lerp(ha, hb, WF.smooth(f));
  }
  // Eigenschaften
  (def.feat || []).forEach(function (ft) {
    for (var i = 0; i < N; i++) {
      var u = U[i]; if (u < ft.u[0] || u > ft.u[1]) continue;
      if (ft.t === 'ramp') H[i] += ft.h * (u - ft.u[0]) / (ft.u[1] - ft.u[0]), F[i] |= 8;
      else if (ft.t === 'gap') F[i] |= 1;
      else if (ft.t === 'bridge') F[i] |= 2;
      else if (ft.t === 'pad') F[i] |= 4;
    }
  });
  for (i = 0; i < N; i++) {
    var p = (i + N - 1) % N, q = (i + 1) % N, dx = X[q] - X[p], dz = Z[q] - Z[p], l = Math.hypot(dx, dz) || 1;
    TX[i] = dx / l; TZ[i] = dz / l;
  }
  // Kurvigkeit (für KI und Pfeile): Winkeländerung über die nächsten ~8 Einheiten
  var C = this.curv = new Float32Array(N), look = Math.round(8 / this.ds);
  for (i = 0; i < N; i++) {
    var o = (i + look) % N, a1 = Math.atan2(TX[i], TZ[i]), a2 = Math.atan2(TX[o], TZ[o]);
    C[i] = WF.angDiff(a1, a2);
  }
};

WF.Track.prototype._grid = function () {
  var cs = this.cs = 4, g = this.cells = {};
  for (var i = 0; i < this.N; i++) {
    var k = this._key(Math.floor(this.x[i] / cs), Math.floor(this.z[i] / cs));
    (g[k] || (g[k] = [])).push(i);
  }
};
WF.Track.prototype._key = function (ix, iz) { return (ix + 512) * 1024 + (iz + 512); };

// ruft fn(i) für alle Streckenpunkte in der Nähe auf
WF.Track.prototype.near = function (x, z, rad, fn) {
  var cs = this.cs, r = Math.ceil(rad / cs), ix = Math.floor(x / cs), iz = Math.floor(z / cs);
  for (var a = -r; a <= r; a++) for (var b = -r; b <= r; b++) {
    var c = this.cells[this._key(ix + a, iz + b)]; if (!c) continue;
    for (var k = 0; k < c.length; k++) fn(c[k]);
  }
};

WF.Track.prototype._solids = function () {
  var S = this.solids = [], th = this.theme;
  (this.def.props || []).forEach(function (p) {
    var c = WF.PROP_COL[p[0]]; if (!c) return;
    var s = p[4] || 1;
    if (c.c) S.push({ n: p[0], c: 1, x: p[1], z: p[2], r: c.c * s, top: c.top * s, bot: -50 });
    else S.push({ n: p[0], c: 0, x: p[1], z: p[2], hw: c.b[0] * s / 2, hd: c.b[1] * s / 2, rot: p[3] || 0, cos: Math.cos(p[3] || 0), sin: Math.sin(p[3] || 0), top: c.top * s, bot: -50 });
  });
  // Billard: Taschen sind Löcher
  this.holes = [];
  if (this.def.theme === 'pool') {
    var gx = th.ground.w / 2, gz = th.ground.d / 2;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { this.holes.push({ x: q[0] * (gx - 1.4), z: q[1] * (gz - 1.4), r: 2.8 }); }, this);
    this.holes.push({ x: 0, z: -gz + 0.6, r: 2.5 }, { x: 0, z: gz - 0.6, r: 2.5 });
  }
  this.zones = (this.def.zones || []).slice();
  // Hindernisse auf der Fahrbahn (für die KI): Streckenindex, seitliche Lage, Radius
  var self = this, ob = this.obst = [];
  S.forEach(function (s) {
    var best = -1, bd = 1e9;
    self.near(s.x, s.z, (s.r || Math.max(s.hw, s.hd)) + self.W + 2, function (i) { var d = Math.hypot(s.x - self.x[i], s.z - self.z[i]); if (d < bd) { bd = d; best = i; } });
    if (best < 0 || s.top < self.h[best] + 0.45) return;
    var lat = self.lateral(best, s.x, s.z), r = s.c ? s.r : Math.abs(s.hw * s.cos * self.tz[best]) + Math.abs(s.hd * s.sin * self.tz[best]) + Math.abs(s.hw * s.sin * self.tx[best]) + Math.abs(s.hd * s.cos * self.tx[best]);
    if (!s.c) r = Math.max(Math.min(s.hw, s.hd), Math.min(r, Math.max(s.hw, s.hd)));
    if (Math.abs(lat) - r < self.w + 0.8) ob.push({ i: best, lat: lat, r: r });
  });
};

// frei von Wänden (Hindernissen) an dieser Stelle?
WF.Track.prototype.clearAt = function (x, z, y) {
  var S = this.solids;
  for (var k = 0; k < S.length; k++) if (S[k].top > y + 0.4 && inSolid(S[k], x, z, 0.9)) return false;
  return true;
};

WF.Track.prototype.inGround = function (x, z) {
  var g = this.theme.ground, dx = Math.abs(x - g.x), dz = Math.abs(z - g.z), hw = g.w / 2, hd = g.d / 2;
  if (dx > hw || dz > hd) return false;
  if (g.t === 'rrect') {
    var r = g.r, ex = dx - (hw - r), ez = dz - (hd - r);
    if (ex > 0 && ez > 0 && ex * ex + ez * ez > r * r) return false;
  }
  return true;
};

WF.Track.prototype.hill = function (x, z) {
  var h = 0, Zs = this.zones;
  for (var i = 0; i < Zs.length; i++) {
    var q = Zs[i]; if (q.t !== 'hill') continue;
    var d = Math.hypot(x - q.x, z - q.z); if (d < q.r) h += q.h * 0.5 * (1 + Math.cos(Math.PI * d / q.r));
  }
  return h;
};

WF.Track.prototype.zoneAt = function (x, z) {
  var Zs = this.zones;
  for (var i = 0; i < Zs.length; i++) { var q = Zs[i]; if (q.t !== 'hill' && (x - q.x) * (x - q.x) + (z - q.z) * (z - q.z) < q.r * q.r) return q; }
  return null;
};

function inSolid(s, x, z, pad) {
  var dx = x - s.x, dz = z - s.z;
  if (s.c) return dx * dx + dz * dz < (s.r + pad) * (s.r + pad);
  var lx = dx * s.cos - dz * s.sin, lz = dx * s.sin + dz * s.cos;
  return Math.abs(lx) < s.hw + pad && Math.abs(lz) < s.hd + pad;
}
WF.inSolid = inSolid;

// Boden unter (x, z) für jemanden in Höhe y. out.h = Bodenhöhe (-Infinity = kein Boden), out.wall = Wand im Weg,
// out.pad = Turbo-Streifen, out.on = auf der Strecke
WF.Track.prototype.ground = function (x, z, y, step, out, rad) {
  var best = -Infinity, wall = false, pad = false, on = false, self = this, hl = this.hill(x, z);
  var hole = false;
  for (var i = 0; i < this.holes.length; i++) { var o = this.holes[i]; if ((x - o.x) * (x - o.x) + (z - o.z) * (z - o.z) < o.r * o.r) hole = true; }
  // Streckenboden (Rampen, Brücken, Bücher)
  var W = this.W, ds = this.ds * 0.6;
  this.near(x, z, W + 1, function (i) {
    if (self.f[i] & 1) return;
    var dx = x - self.x[i], dz = z - self.z[i], al = dx * self.tx[i] + dz * self.tz[i];
    if (al > ds || al < -ds) return;
    var lat = Math.abs(dx * self.tz[i] - dz * self.tx[i]); if (lat > W) return;
    var top = self.h[i] + (self.h[i] < 0.01 ? hl : 0), bot = (self.f[i] & 2) ? top - 0.35 : -50;
    if (hole && top < 0.05) return;
    if (top <= y + step) { if (top > best) { best = top; on = lat < self.w * 1.05; pad = !!(self.f[i] & 4) && lat < self.w; } }
    else if (bot < y + 0.6) wall = true;
  });
  // Tischplatte / Wasser / Rasen
  if (this.inGround(x, z)) {
    if (!hole) { var gt = this.theme.ground.h + hl; if (gt <= y + step) { if (gt > best + 0.001) { best = gt; on = false; pad = false; } } else wall = true; }
  } else if (this.theme.rim) wall = true;
  // Hindernisse
  var S = this.solids, r = rad || 0;
  for (i = 0; i < S.length; i++) {
    var s = S[i]; if (!inSolid(s, x, z, s.top <= y + step ? 0 : r)) continue;
    if (s.top <= y + step) { if (s.top > best) { best = s.top; pad = false; } }
    else if (s.bot < y + 0.6) wall = true;
  }
  out.h = best; out.wall = wall; out.pad = pad; out.on = on;
  return out;
};

// nächster Streckenpunkt, bevorzugt in der Nähe des alten Index (bei Kreuzungen wichtig)
WF.Track.prototype.locate = function (x, z, y, last) {
  var N = this.N, bi = -1, bd = 1e9;
  if (last >= 0) {
    for (var k = -14; k <= 14; k++) {
      var i = (last + k + N) % N, dx = x - this.x[i], dz = z - this.z[i], d = dx * dx + dz * dz;
      var dy = y - this.h[i]; if (dy < -1.2) d += 400; // unter einer Brücke/Rampe zählt die obere Strecke nicht
      if (d < bd) { bd = d; bi = i; }
    }
    if (bd < this.w * this.w * 4) return bi;
  }
  var self = this, gb = -1, gd = 1e9;
  this.near(x, z, 12, function (i) {
    var dx = x - self.x[i], dz = z - self.z[i], d = dx * dx + dz * dz;
    if (y - self.h[i] < -1.2) d += 400;
    if (last >= 0) { var di = Math.abs(i - last); di = Math.min(di, N - di); d += di * 0.02; }
    if (d < gd) { gd = d; gb = i; }
  });
  if (gb >= 0 && (bi < 0 || gd < bd)) return gb;
  return bi >= 0 ? bi : 0;
};

WF.Track.prototype.lateral = function (i, x, z) { return (x - this.x[i]) * this.tz[i] - (z - this.z[i]) * this.tx[i]; };
WF.Track.prototype.heading = function (i) { return Math.atan2(this.tx[i], this.tz[i]); };

// sichere Stelle zum Wiedereinsetzen (nicht auf Lücke/Rampe/Brückenrand)
WF.Track.prototype.safeIndex = function (i, fwd) {
  var N = this.N;
  for (var k = 0; k < 120; k++) {
    var j = (i + (fwd ? (k < 30 ? k : 30 - k) : -k) + N * 4) % N, ok = true;
    for (var m = -4; m <= 4; m++) { var q = (j + m + N) % N; if (this.f[q] & 9) { ok = false; break; } }
    if (ok && this.clearAt(this.x[j], this.z[j], this.h[j])) return j;
  }
  return i;
};

// Startaufstellung: Reihen hinter der Startlinie (Index 0), 2 nebeneinander
WF.Track.prototype.gridSlot = function (k) {
  var N = this.N, back = Math.round((3 + Math.floor(k / 2) * 3.2) / this.ds), i = (N - back) % N;
  var side = (k % 2 ? 1 : -1) * this.w * 0.42;
  return { x: this.x[i] + this.tz[i] * side, z: this.z[i] - this.tx[i] * side, h: this.h[i], a: this.heading(i), i: i };
};
