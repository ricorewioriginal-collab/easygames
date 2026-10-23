// Winzflitzer 3D – Fahrphysik, Rempeln, Kugeln, Panzergeschosse, KI, Runden
'use strict';
var WF = window.WF = window.WF || {};

(function () {
  var GRAV = 24, R = 0.62, TAU = Math.PI * 2;

  WF.Car = function (sim, opt) {
    this.sim = sim; this.id = opt.id; this.name = opt.name; this.color = opt.color; this.human = !!opt.human; this.pi = opt.pi;
    this.V = WF.VEHICLES[sim.T.theme.veh]; this.type = sim.T.theme.veh;
    this.skill = opt.skill || 1; this.style = opt.style || 'sauber'; this.driver = opt.driver;
    this.x = 0; this.z = 0; this.y = 0; this.vy = 0; this.a = 0; this.vx = 0; this.vz = 0;
    this.grounded = true; this.airT = 0; this.fallT = 0; this.lostT = 0; this.stun = 0; this.ghost = 0; this.boost = 0; this.cool = 0;
    this.idx = 0; this.lap = 0; this.half = 0; this.done = false; this.time = 0; this.lapStart = 0; this.best = 0; this.lapTimes = [];
    this.inp = { thr: 0, steer: 0, fire: false, dir: null, brake: false };
    this.lane = (Math.random() - 0.5) * 1.2; this.noise = 0; this.wob = Math.random() * 10;
    this.slipFx = 0; this.speed = 0; this.surf = null; this.out = false; this.alive = true;
  };

  WF.Car.prototype.place = function (p) {
    this.x = p.x; this.z = p.z; this.y = p.h + (this.sim.T.hill(p.x, p.z)); this.a = p.a; this.vx = this.vz = this.vy = 0; this.idx = p.i;
    this.grounded = true; this.fallT = 0; this.lostT = 0;
  };

  WF.Sim = function (T, opt) {
    this.T = T; this.cars = []; this.movers = []; this.shells = []; this.t = 0; this.events = []; this.opt = opt || {};
    this.laps = this.opt.laps || T.def.laps; this.started = false; this.finishOrder = [];
    var self = this;
    (T.def.props || []).forEach(function (p) { if (p[0] === 'ball' || p[0] === 'ball8') self.movers.push({ kind: p[0], x: p[1], z: p[2], x0: p[1], z0: p[2], vx: 0, vz: 0, y: 0, r: 1.15, m: 1.4, gone: 0, spin: 0, col: p[0] === 'ball8' ? '#111' : null }); });
    var bc = ['#f4d03f', '#2471a3', '#e74c3c', '#7d3c98', '#e67e22', '#1e8449', '#922b21'], k = 0;
    this.movers.forEach(function (m) { if (!m.col) m.col = bc[k++ % bc.length]; });
    this._g = {};
  };
  WF.Sim.prototype.emit = function (type, a, b) { this.events.push({ t: type, a: a, b: b }); };
  WF.Sim.prototype.add = function (car) { this.cars.push(car); return car; };

  WF.Sim.prototype.step = function (dt) {
    if (this.started) this.t += dt;
    var cars = this.cars, i, j;
    for (i = 0; i < cars.length; i++) { var c = cars[i]; if (!c.alive) continue; if (!c.human) this.ai(c, dt); this.drive(c, dt); }
    for (i = 0; i < cars.length; i++) for (j = i + 1; j < cars.length; j++) this.bump(cars[i], cars[j]);
    this.stepMovers(dt);
    this.stepShells(dt);
  };

  // ---------------- Fahren
  WF.Sim.prototype.drive = function (c, dt) {
    var T = this.T, V = c.V, g = this._g;
    c.cool = Math.max(0, c.cool - dt); c.ghost = Math.max(0, c.ghost - dt); c.boost = Math.max(0, c.boost - dt);
    if (c.fallT > 0) {
      c.fallT -= dt; c.vy -= GRAV * dt; c.y = Math.max(T.theme.floorY + 0.1, c.y + c.vy * dt); c.x += c.vx * dt * 0.5; c.z += c.vz * dt * 0.5;
      if (c.fallT <= 0) this.respawn(c);
      return;
    }
    var inp = c.inp, thr = this.started ? inp.thr : 0, steer = inp.steer;
    if (c.stun > 0) { c.stun -= dt; thr = 0; steer = 0; c.a += dt * 9; }
    if (inp.dir && this.started && c.stun <= 0) {
      var want = Math.atan2(inp.dir[0], inp.dir[1]), diff = WF.angDiff(c.a, want);
      steer = WF.clamp(-diff * 2.6, -1, 1);
      var mag = Math.min(1, Math.hypot(inp.dir[0], inp.dir[1]));
      thr = inp.brake ? -1 : (Math.abs(diff) > 2.4 && c.speed < 3 ? -0.6 : mag);
    }
    var sa = Math.sin(c.a), ca = Math.cos(c.a);
    var vf = c.vx * sa + c.vz * ca, vl = c.vx * -ca + c.vz * sa; // vorwärts / rechts
    var z = T.zoneAt(c.x, c.z); c.surf = z ? z.t : null;
    var grip = V.grip, top = V.top * c.skill, acc = V.acc * (0.85 + 0.15 * c.skill), turn = V.turn;
    if (z && c.grounded && !V.fly) {
      if (z.t === 'slip') { grip *= 0.16; turn *= 0.75; }
      else if (z.t === 'slow') { top *= 0.5; }
    }
    if (z && z.t === 'pull') { var dx = z.x - c.x, dz = z.z - c.z, d = Math.hypot(dx, dz) || 1, f = 9 * (1 - d / z.r); c.vx += (dx / d * f + dz / d * f * 0.8) * dt; c.vz += (dz / d * f - dx / d * f * 0.8) * dt; }
    if (c.boost > 0) { top *= 1.45; acc *= 1.8; }
    if (c.grounded || V.fly) {
      if (thr > 0) vf += (thr * acc - Math.max(0, vf) * acc / top) * dt;
      else if (thr < 0) { if (vf > 0.5) vf -= 34 * -thr * dt; else vf = Math.max(-top * 0.4, vf - acc * 0.6 * -thr * dt); }
      if (thr <= 0 || vf > top) {
        vf -= (vf * acc / top * (vf > top ? 1.5 : 0.25) + Math.sign(vf) * 2.5) * dt;
        if (Math.abs(vf) < 0.15 && thr === 0) vf = 0;
      }
      vl *= Math.exp(-grip * dt);
      var sp = Math.abs(vf), turnF = V.fly ? Math.max(0.45, Math.min(1, sp / 5)) : Math.min(1, sp / 4);
      turnF *= 1 - 0.22 * Math.min(1, sp / V.top);
      c.a -= steer * turn * turnF * dt * (vf < -0.2 ? -1 : 1);
    } else {
      c.a -= steer * turn * 0.35 * dt; c.airT += dt;
    }
    c.a = (c.a + TAU) % TAU;
    sa = Math.sin(c.a); ca = Math.cos(c.a);
    c.vx = sa * vf - ca * vl; c.vz = ca * vf + sa * vl;
    c.speed = Math.hypot(c.vx, c.vz); c.slip = Math.abs(vl);
    if (c.human && c.grounded && Math.abs(vl) > 4) c.slipFx += dt;

    // Bewegen mit Wandprüfung (gleiten an Kanten)
    var step = V.step, nx = c.x + c.vx * dt, nz = c.z + c.vz * dt;
    T.ground(nx, nz, c.y, step, g, R);
    if (g.wall) {
      var hitX = T.ground(nx, c.z, c.y, step, {}, R).wall, hitZ = T.ground(c.x, nz, c.y, step, {}, R).wall;
      var imp = c.speed;
      if (!hitX) { nz = c.z; c.vz *= -0.25; c.vx *= 0.8; }
      else if (!hitZ) { nx = c.x; c.vx *= -0.25; c.vz *= 0.8; }
      else { nx = c.x; nz = c.z; c.vx *= -0.3; c.vz *= -0.3; }
      if (imp > 5) this.emit('wall', c, imp);
      T.ground(nx, nz, c.y, step, g, R);
    }
    c.x = nx; c.z = nz;
    if (g.pad && c.grounded && c.boost < 0.6) { if (c.boost <= 0) this.emit('boost', c); c.boost = 1.0; }

    // Höhe: Boden folgen, abheben, landen, fallen
    var gh = g.h;
    if (c.grounded) {
      if (gh === -Infinity || gh < c.y - 0.3) { c.grounded = false; c.airT = 0; }
      else { var vyn = (gh - c.y) / dt; c.vy = WF.lerp(c.vy, WF.clamp(vyn, -6, 14), 0.5); c.y = gh; }
    }
    if (!c.grounded) {
      c.vy -= GRAV * dt; c.y += c.vy * dt;
      if (gh > -Infinity && c.y <= gh) { if (c.airT > 0.25) this.emit('land', c, Math.min(1, -c.vy / 12)); c.y = gh; c.vy = 0; c.grounded = true; c.airT = 0; }
    }
    // runtergefallen?
    var ref = T.h[c.idx] + T.hill(c.x, c.z);
    if (!c.grounded && (c.y < ref - 2.2 || c.y < T.theme.ground.h - 1.5)) { c.fallT = 1.25; this.emit('fall', c); return; }

    // Strecke & Runden
    var prev = c.idx, N = T.N;
    c.idx = T.locate(c.x, c.z, c.y, c.idx);
    var lat = T.lateral(c.idx, c.x, c.z), dy = c.y - T.h[c.idx];
    if (Math.abs(lat) > T.w * 2.9 || (dy < -1.4 && !(T.f[c.idx] & 2) && c.grounded)) { c.lostT += dt; if (c.lostT > 1.1) { this.emit('lost', c); this.respawn(c); return; } } else c.lostT = 0;
    if (!c.done) {
      if (c.idx > N * 0.4 && c.idx < N * 0.6) c.half = 1;
      if (prev > N * 0.8 && c.idx < N * 0.2) {
        if (c.half || c.lap === 0) {
          if (c.lap > 0) { var lt = this.t - c.lapStart; c.lapTimes.push(lt); if (!c.best || lt < c.best) c.best = lt; this.emit('lap', c, lt); }
          c.lap++; c.half = 0; c.lapStart = this.t;
          if (c.lap > this.laps && this.started) { c.done = true; c.time = this.t; this.finishOrder.push(c); this.emit('finish', c); }
        }
      } else if (prev < N * 0.2 && c.idx > N * 0.8 && c.lap > 0) { c.lap--; c.half = 1; }
    }
    c.prog = c.lap === 0 ? c.idx - N : (c.lap - 1) * N + c.idx;
    if (c.done) c.prog = (this.laps + 1) * N + (100 - this.finishOrder.indexOf(c));
  };

  WF.Sim.prototype.respawn = function (c, idx, fwd) {
    var T = this.T, i = T.safeIndex(idx == null ? c.idx : idx, fwd);
    c.x = T.x[i]; c.z = T.z[i]; c.y = T.h[i] + T.hill(c.x, c.z) + 0.8; c.a = T.heading(i); c.vx = c.vz = 0; c.vy = 0; c.idx = i;
    c.grounded = false; c.airT = 0; c.fallT = 0; c.lostT = 0; c.stun = 0; c.ghost = 1.6;
    this.emit('respawn', c);
  };

  // ---------------- Rempeln
  WF.Sim.prototype.bump = function (a, b) {
    if (!a.alive || !b.alive || a.fallT > 0 || b.fallT > 0 || a.ghost > 0 || b.ghost > 0) return;
    if (Math.abs(a.y - b.y) > 0.8) return;
    var dx = b.x - a.x, dz = b.z - a.z, d2 = dx * dx + dz * dz, rr = R * 2;
    if (d2 >= rr * rr || d2 < 1e-6) return;
    var d = Math.sqrt(d2), nx = dx / d, nz = dz / d, ov = rr - d, ma = a.V.mass, mb = b.V.mass, im = 1 / ma + 1 / mb;
    a.x -= nx * ov * (1 / ma) / im; a.z -= nz * ov * (1 / ma) / im; b.x += nx * ov * (1 / mb) / im; b.z += nz * ov * (1 / mb) / im;
    var rv = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
    if (rv < 0) {
      var j = -(1 + 0.55) * rv / im;
      a.vx -= j * nx / ma; a.vz -= j * nz / ma; b.vx += j * nx / mb; b.vz += j * nz / mb;
      if (-rv > 4) this.emit('bump', a, -rv);
    }
  };

  // ---------------- Billardkugeln
  WF.Sim.prototype.stepMovers = function (dt) {
    var T = this.T, M = this.movers, g = this._g, i, j;
    for (i = 0; i < M.length; i++) {
      var m = M[i];
      if (m.gone > 0) { m.gone -= dt; m.y -= dt * 6; if (m.gone <= 0) { m.x = m.x0; m.z = m.z0; m.y = 0; m.vx = m.vz = 0; } continue; }
      var f = Math.exp(-0.9 * dt); m.vx *= f; m.vz *= f;
      var nx = m.x + m.vx * dt, nz = m.z + m.vz * dt;
      T.ground(nx, nz, 0, 0.3, g, m.r * 0.9);
      if (g.wall) { if (T.ground(nx, m.z, 0, 0.3, {}, m.r * 0.9).wall) m.vx *= -0.8; else m.vz *= -0.8; nx = m.x + m.vx * dt; nz = m.z + m.vz * dt; T.ground(nx, nz, 0, 0.3, g, 0); if (g.wall) { nx = m.x; nz = m.z; } }
      m.x = nx; m.z = nz; m.spin += Math.hypot(m.vx, m.vz) * dt / m.r;
      for (var h = 0; h < T.holes.length; h++) { var o = T.holes[h]; if ((m.x - o.x) * (m.x - o.x) + (m.z - o.z) * (m.z - o.z) < o.r * o.r * 0.6) { m.gone = 3; this.emit('pot', m); } }
      for (j = 0; j < this.cars.length; j++) {
        var c = this.cars[j]; if (c.fallT > 0 || c.y > 1.5) continue;
        var dx = m.x - c.x, dz = m.z - c.z, d = Math.hypot(dx, dz), rr = m.r + R;
        if (d < rr && d > 1e-4) {
          var ux = dx / d, uz = dz / d, ov = rr - d, ma = c.V.mass, mb = m.m, im = 1 / ma + 1 / mb;
          c.x -= ux * ov / ma / im; c.z -= uz * ov / ma / im; m.x += ux * ov / mb / im; m.z += uz * ov / mb / im;
          var rv = (m.vx - c.vx) * ux + (m.vz - c.vz) * uz;
          if (rv < 0) { var jj = -1.7 * rv / im; c.vx -= jj * ux / ma; c.vz -= jj * uz / ma; m.vx += jj * ux / mb; m.vz += jj * uz / mb; if (-rv > 4) this.emit('clack', m, -rv); }
        }
      }
      for (j = i + 1; j < M.length; j++) {
        var n = M[j]; if (n.gone > 0) continue;
        dx = n.x - m.x; dz = n.z - m.z; d = Math.hypot(dx, dz); rr = m.r + n.r;
        if (d < rr && d > 1e-4) {
          ux = dx / d; uz = dz / d; ov = (rr - d) / 2; m.x -= ux * ov; m.z -= uz * ov; n.x += ux * ov; n.z += uz * ov;
          rv = (n.vx - m.vx) * ux + (n.vz - m.vz) * uz; if (rv < 0) { m.vx += rv * ux * 0.95; m.vz += rv * uz * 0.95; n.vx -= rv * ux * 0.95; n.vz -= rv * uz * 0.95; if (-rv > 3) this.emit('clack', n, -rv); }
        }
      }
    }
  };

  // ---------------- Panzergeschosse
  WF.Sim.prototype.fire = function (c) {
    if (!c.V.gun || c.cool > 0 || c.fallT > 0 || !this.started) return;
    c.cool = 1.15;
    var sa = Math.sin(c.a), ca = Math.cos(c.a), sp = 30 + Math.max(0, c.vx * sa + c.vz * ca);
    this.shells.push({ x: c.x + sa * 0.9, z: c.z + ca * 0.9, y: c.y + 0.55, vx: sa * sp, vz: ca * sp, life: 0.75, owner: c });
    this.emit('shot', c);
  };
  WF.Sim.prototype.stepShells = function (dt) {
    var S = this.shells, g = this._g;
    for (var i = S.length - 1; i >= 0; i--) {
      var s = S[i]; s.life -= dt; s.x += s.vx * dt; s.z += s.vz * dt;
      var hit = s.life <= 0;
      if (!hit) { this.T.ground(s.x, s.z, s.y - 0.4, 0.2, g, 0); if (g.wall || g.h === -Infinity && s.y < -5) hit = true; }
      if (!hit) for (var j = 0; j < this.cars.length; j++) {
        var c = this.cars[j]; if (c === s.owner || c.fallT > 0 || c.ghost > 0) continue;
        if ((c.x - s.x) * (c.x - s.x) + (c.z - s.z) * (c.z - s.z) < 0.85 && Math.abs(c.y + 0.4 - s.y) < 1) {
          c.stun = 0.85; c.vx = c.vx * 0.2 + s.vx * 0.18; c.vz = c.vz * 0.2 + s.vz * 0.18; c.vy = 5; c.grounded = false; c.airT = 0;
          this.emit('hit', c, s.owner); hit = true; break;
        }
      }
      if (hit) { this.emit('boom', s); S.splice(i, 1); }
    }
  };

  // ---------------- KI
  WF.Sim.prototype.ai = function (c, dt) {
    var T = this.T, N = T.N, inp = c.inp, sp = c.speed, ds = T.ds;
    inp.dir = null; inp.brake = false;
    if (c.fallT > 0) return;
    var look = Math.round((3.5 + sp * 0.38) / ds), ti = (c.idx + look) % N;
    // Spur: leicht versetzt, anderen ausweichen, bei Rempel-Typen auf Gegner zuhalten
    c.wob += dt; var lane = c.lane + (c.style === 'wild' ? Math.sin(c.wob * 1.3) * 0.6 : 0);
    for (var k = 0; k < this.cars.length; k++) {
      var o = this.cars[k]; if (o === c || o.fallT > 0) continue;
      var dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz); if (d > 5) continue;
      var ahead = (dx * Math.sin(c.a) + dz * Math.cos(c.a)); if (ahead < 0) continue;
      var side = T.lateral(c.idx, o.x, o.z) - T.lateral(c.idx, c.x, c.z);
      if (c.style === 'rempler' && o.human && d < 4) lane = T.lateral(c.idx, o.x, o.z) * 0.8;
      else lane += (side > 0 ? -1 : 1) * (5 - d) * 0.35;
    }
    lane = WF.clamp(lane, -T.w * 0.7, T.w * 0.7);
    // Hindernissen auf der Fahrbahn ausweichen
    var O = T.obst, myLat = T.lateral(c.idx, c.x, c.z);
    for (k = 0; k < O.length; k++) {
      var ob = O[k], di = (ob.i - c.idx + N) % N; if (di * ds > 16 || di * ds < -1) continue;
      var need = ob.r + 1.25;
      if (Math.abs(lane - ob.lat) < need) {
        var up = ob.lat + need, dn = ob.lat - need, lim = T.w * 0.98;
        var side = up <= lim && (dn < -lim || Math.abs(up - myLat) < Math.abs(dn - myLat)) ? up : dn;
        lane = WF.clamp(side, -lim, lim);
      }
    }
    var tx = T.x[ti] + T.tz[ti] * lane, tz = T.z[ti] - T.tx[ti] * lane;
    var want = Math.atan2(tx - c.x, tz - c.z), diff = WF.angDiff(c.a, want);
    inp.steer = WF.clamp(-diff * 2.4, -1, 1);
    // Tempo nach Kurven voraus
    var maxC = 0, far = Math.round((6 + sp * 0.9) / ds);
    for (var j = 0; j < far; j += 3) { var q = (c.idx + j) % N; var cv = Math.abs(T.curv[q]); if (cv > maxC) maxC = cv; }
    var V = c.V, want2 = V.top * c.skill * (1 - WF.clamp((maxC - 0.35) * 0.42, 0, 0.62) * (V.grip > 5 ? 0.8 : 1.15));
    if (c.surf === 'slip') want2 *= 0.85;
    var vf = c.vx * Math.sin(c.a) + c.vz * Math.cos(c.a);
    inp.thr = vf > want2 + 1.5 ? -0.7 : (Math.abs(diff) > 1.3 && sp > 6 ? 0.2 : 1);
    if (Math.abs(diff) > 2.2 && sp < 3) inp.thr = -0.8, inp.steer = -inp.steer; // festgefahren: zurücksetzen
    // festhängen erkennen
    c.stuckT = (sp < 1.2 && this.started && !c.done) ? (c.stuckT || 0) + dt : 0;
    if (c.stuckT > 2.5) { c.stuckT = 0; this.respawn(c, (c.idx + Math.round(4 / ds)) % N, true); }
    // Panzer: schießen, wenn jemand vorn in der Schusslinie ist
    if (V.gun && c.cool <= 0) {
      for (k = 0; k < this.cars.length; k++) {
        o = this.cars[k]; if (o === c || o.fallT > 0 || o.ghost > 0) continue;
        dx = o.x - c.x; dz = o.z - c.z; d = Math.hypot(dx, dz);
        if (d < 14 && d > 1.5 && Math.abs(WF.angDiff(c.a, Math.atan2(dx, dz))) < 0.18 && Math.random() < dt * 3 * c.skill) { this.fire(c); break; }
      }
    }
  };

  // Platzierung (nach Fortschritt)
  WF.Sim.prototype.order = function () {
    return this.cars.slice().sort(function (a, b) { return (b.prog || 0) - (a.prog || 0); });
  };
})();
