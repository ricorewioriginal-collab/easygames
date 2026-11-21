// Skater: Fahrphysik (feste Teilschritte, analytische Oberflächen), Tricks, Grinds, Manuals, Stürze und Pose.
import { Vector3, Quaternion, Matrix } from '@babylonjs/core/Maths/math';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { FLIPS, GRABS, GRINDS, MANUALS, LIPS, dirOf } from './tricks.js';
import { Combo } from './score.js';

const G = 15.5;            // Schwerkraft (arcadig straff)
const STEP = 1 / 120;
const STEP_UP = 0.13;      // Kanten bis zu dieser Höhe rollt man hoch
const BODY_R = 0.28;       // Körperradius für Wände
const UP = new Vector3(0, 1, 0);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

export class Skater {
  constructor(game, rig, board, stats) {
    this.game = game; this.level = game.level; this.rig = rig; this.board = board;
    this.st = Object.assign({ speed: 5, ollie: 5, spin: 5, balance: 5, air: 5 }, stats || {});
    const sc = game.scene;
    this.holder = new TransformNode('holder', sc);
    this.boardSpin = new TransformNode('boardSpin', sc); this.boardSpin.parent = this.holder;
    this.boardSpin.rotationQuaternion = Quaternion.Identity();
    board.parent = this.boardSpin;
    rig.root.parent = this.holder; rig.root.rotation.y = -Math.PI / 2;
    this.holder.rotationQuaternion = Quaternion.Identity();
    this.combo = new Combo();
    this.special = 0;
    this.surf = { h: 0, gx: 0, gz: 0, el: null };
    this.pose = {};
    this.reset(game.level.def.spawn);
  }

  reset(sp) {
    const [x, z, yaw] = sp;
    this.pos = new Vector3(x, this.level.height(x, z), z);
    this.vel = new Vector3(Math.sin(yaw), 0, Math.cos(yaw)).scale(2.5);
    this.yaw = yaw; this.mode = 'ground'; this.normal = UP.clone();
    this.charge = 0; this.air = null; this.grind = null; this.manual = null; this.bail = null;
    this.grace = 0; this.revertT = 0; this.airTime = 0; this.lastGrindT = 1; this.wall = null; this.lastWallT = 1; this.pushPhase = 0; this.pushing = 0;
    this.crouch = 0; this.tuck = 0; this.leanS = 0; this.boardPitch = 0; this.landSquash = 0;
    this.combo.reset(); this.fakie = false; this.camYaw = yaw; this.takeoff = null;
    this.vis = { yaw, q: Quaternion.Identity() };
    this.apply(0);
  }

  get speed() { return Math.hypot(this.vel.x, this.vel.z, this.vel.y); }
  heading() { return new Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }

  // ------------------------------------------------------------ Hauptschritt
  update(dt, inp) {
    this.inp = inp;
    this.dirNow = dirOf(inp.x, inp.y);
    const n = Math.min(10, Math.ceil(dt / STEP)), h = dt / n;
    this.edges = { ollieUp: inp.released('ollie'), ollieDown: inp.pressed('ollie'), flip: inp.pressed('flip'), grab: inp.pressed('grab'), grabUp: inp.released('grab'), grind: inp.pressed('grind'), manual: inp.pressed('manual') && !this.manual, revert: inp.pressed('revert') };
    if (inp.pressed('flip')) this.flipBuf = 0.18;
    if (inp.pressed('grab')) this.grabBuf = 0.18;
    if (inp.pressed('grind')) this.grindBuf = 0.3;
    if (inp.pressed('manual') && !this.manual) { this.manualBuf = 0.3; this.manualDir = inp.manualDir; }
    if (inp.pressed('revert')) this.revertBuf = 0.25;
    if (inp.pressed('ollie')) this.ollieBuf = 0.15;
    for (let i = 0; i < n; i++) { this.step(h); if (i === 0) for (const k in this.edges) this.edges[k] = false; }
    this.flipBuf = Math.max(0, (this.flipBuf || 0) - dt); this.grabBuf = Math.max(0, (this.grabBuf || 0) - dt);
    this.grindBuf = Math.max(0, (this.grindBuf || 0) - dt); this.manualBuf = Math.max(0, (this.manualBuf || 0) - dt); this.revertBuf = Math.max(0, (this.revertBuf || 0) - dt); this.ollieBuf = Math.max(0, (this.ollieBuf || 0) - dt);
    this.apply(dt);
  }

  step(dt) {
    if (this.mode === 'bail') return this.stepBail(dt);
    if (this.mode === 'grind') return this.stepGrind(dt);
    if (this.mode === 'air') return this.stepAir(dt);
    if (this.mode === 'wall') return this.stepWall(dt);
    return this.stepGround(dt);
  }

  // ------------------------------------------------------------ Boden (inkl. Manual)
  stepGround(dt) {
    const L = this.level, inp = this.inp, st = this.st;
    const s = L.surface(this.pos.x, this.pos.z, this.surf);
    const n = new Vector3(-s.gx, 1, -s.gz).normalize(); this.normal = n;
    // Lenken
    const sp = Math.hypot(this.vel.x, this.vel.y, this.vel.z);
    const turn = (2.9 - Math.min(1.2, sp * 0.07)) * (0.85 + st.speed * 0.02);
    let steer = inp.x;
    if (this.manual) steer *= 0.55;
    this.yaw = wrap(this.yaw - steer * turn * dt);
    // Richtung entlang der Fläche
    let f = this.heading(); f.subtractInPlace(n.scale(Vector3.Dot(f, n))); f.normalize();
    // auf steilen Wänden: Richtung ist „bergauf/bergab“, Steuern dreht nur leicht
    let v = this.vel.subtract(n.scale(Vector3.Dot(this.vel, n)));
    let spd = v.length();
    let sign = Vector3.Dot(v, f) >= 0 ? 1 : -1;
    if (spd < 0.3) sign = this.fakie ? -1 : 1;
    this.fakie = sign < 0;
    const d = f.scale(sign);
    if (spd > 0.01) {
      const grip = n.y > 0.6 ? 14 : 5;
      const want = d.scale(spd);
      v = Vector3.Lerp(v, want, 1 - Math.exp(-grip * dt));
      const l = v.length(); if (l > 1e-4) v.scaleInPlace(spd / l);
    }
    // Kräfte
    const gT = new Vector3(0, -G, 0); gT.subtractInPlace(n.scale(Vector3.Dot(gT, n)));
    // Rampen/Pools: bergauf weniger Schwerkraft, bergab mehr („Pumpen“) – so wächst Tempo für Vert-Airs
    if (s.el && /qp|bowl|ramp/.test(s.el.t) && n.y < 0.98) gT.scaleInPlace(Vector3.Dot(v, gT) < 0 ? 0.52 : 0.95);
    v.addInPlace(gT.scale(dt));
    spd = v.length();
    const maxPush = 7.6 + st.speed * 0.35;
    const wantPush = (inp.y > 0.35 || (this.game.settings.autoPush && inp.y > -0.3)) && !this.manual && n.y > 0.85 && this.charge === 0;
    if (wantPush && spd < maxPush) { v.addInPlace(d.scale((5.5 + st.speed * 0.25) * dt)); this.pushing = Math.min(1, this.pushing + dt * 4); }
    else this.pushing = Math.max(0, this.pushing - dt * 3);
    if (inp.y < -0.5 && !this.manual && this.charge === 0) { const b = Math.min(spd, 9 * dt); if (spd > 1e-3) v.scaleInPlace((spd - b) / spd); this.braking = 1; } else this.braking = 0;
    const fr = (0.12 + 0.0035 * spd * spd) * dt; spd = v.length(); if (spd > 1e-3) v.scaleInPlace(Math.max(0, spd - fr) / spd);
    const vmax = 15.5; if (v.length() > vmax) v.scaleInPlace(vmax / v.length());
    this.vel.copyFrom(v);

    // Ollie laden / springen
    if (this.inp.down('ollie')) { this.charge = Math.min(0.32, this.charge + dt); }
    if (this.edges.ollieUp || (this.charge > 0 && !this.inp.down('ollie'))) {
      const c = this.charge / 0.32; this.charge = 0;
      return this.ollie(c, n);
    }
    // Manual
    if (this.manual) this.stepManual(dt);
    else if ((this.manualBuf > 0 || this.edges.manual) && n.y > 0.7 && spd > 1.2) { this.manualBuf = 0; this.startManual(); }
    // Revert (nach Landung aus der Senkrechten)
    if (this.revertT > 0) {
      this.revertT -= dt;
      if (this.revertBuf > 0) { this.revertBuf = 0; this.revertT = 0; this.yaw = wrap(this.yaw + Math.PI); this.fakie = !this.fakie; const e = this.combo.add('Revert', 100); this.game.onTrick(e); this.grace = 0.5; this.game.sfx('revert'); }
    }
    // Combo-Ende nach kurzer Gnadenfrist
    if (this.combo.active && !this.manual) { this.grace -= dt; if (this.grace <= 0) this.bank(); }

    // Bewegen
    this.moveGround(dt);
  }

  moveGround(dt) {
    const L = this.level;
    const p = this.pos, v = this.vel;
    let nx = p.x + v.x * dt, nz = p.z + v.z * dt, ny = p.y + v.y * dt;
    // Wände (Mittelpunkt + Körperradius gegen feste Körper)
    const hit = this.blocked(nx, nz, Math.max(ny, p.y));
    if (hit) { this.bounce(nx, nz, hit); nx = p.x + v.x * dt; nz = p.z + v.z * dt; ny = p.y + v.y * dt; if (this.blocked(nx, nz, Math.max(ny, p.y))) { nx = p.x; nz = p.z; ny = p.y; } }
    const s = L.surface(nx, nz, this.surf);
    const n2 = new Vector3(-s.gx, 1, -s.gz).normalize();
    // Senkrechte Wand oben: Vert-Absprung
    if (this.normal.y < 0.45 && v.y > 0.5 && (ny > s.h + 0.02 || n2.y > 0.9)) {
      p.y = Math.max(p.y, ny); return this.vertLaunch();
    }
    if (ny > s.h + 0.035 && v.y > -0.5) {               // Kante/Kicker: abheben
      p.set(nx, ny, nz); return this.toAir(false);
    }
    if (s.h - ny > STEP_UP + Math.abs(v.length() * dt) * 3 && s.el && !/qp|ramp|bowl/.test(s.el.t)) { // Stufe zu hoch → blockiert
      this.bounce(nx, nz, true); return;
    }
    p.set(nx, s.h, nz);
    const spd = v.length();
    v.subtractInPlace(n2.scale(Vector3.Dot(v, n2)));
    const l = v.length(); if (l > 1e-4) v.scaleInPlace(spd / l);
    this.normal = n2;
  }

  // fester Körper an Zielpunkt oder im Körperradius höher als die Füße?
  blocked(x, z, y) {
    const L = this.level;
    const sc = L.surface(x, z, this._bs || (this._bs = {}));
    if (sc.h > y + STEP_UP + 0.02 && (!sc.el || !/qp|ramp|bowl/.test(sc.el.t) || sc.h - y > 0.6)) return [x, z];
    const v = this.vel, l = Math.hypot(v.x, v.z) || 1, fx = v.x / l, fz = v.z / l;
    for (const [ox, oz] of [[fx, fz], [fz, -fx], [-fz, fx], [fx * 0.7 + fz * 0.7, fz * 0.7 - fx * 0.7], [fx * 0.7 - fz * 0.7, fz * 0.7 + fx * 0.7]]) {
      const px = x + ox * BODY_R, pz = z + oz * BODY_R;
      if (L.solidTop(px, pz) > y + 0.35) return [px, pz];
    }
    return null;
  }
  bounce(nx, nz, hit) {
    const at = Array.isArray(hit) ? hit : [nx, nz];
    const [wx, wz] = this.level.wallNormal(at[0], at[1], this.pos.x, this.pos.z);
    const vn = this.vel.x * wx + this.vel.z * wz;
    if (vn < 0) {
      this.vel.x -= wx * vn * 1.25; this.vel.z -= wz * vn * 1.25;
      const sp = Math.hypot(this.vel.x, this.vel.z) || 1;
      if (-vn > 11.5 && -vn > sp * 0.85 && this.mode === 'ground') return this.doBail('Volle Wand!');
      if (-vn > 2) this.game.sfx('bump', Math.min(1, -vn / 8));
      this.vel.scaleInPlace(0.85);
    }
    this.pos.x += wx * 0.01; this.pos.z += wz * 0.01;
  }

  ollie(c, n) {
    const st = this.st, jv = 5.0 + c * 1.5 + st.ollie * 0.09;
    const up = n.y > 0.7 ? UP : n.add(UP).normalize();
    this.vel.addInPlace(up.scale(jv));
    if (this.manual) this.endManual(true);
    this.toAir(true);
    this.game.sfx('pop', 0.6 + c * 0.4);
  }

  toAir(ollied) {
    this.mode = 'air';
    this.air = { t: 0, ollied, tricks: [], spin: 0, spinV: 0, flip: null, grab: null, vert: false, startY: this.pos.y, snapTarget: null, startYaw: this.yaw, maxY: this.pos.y, special: null };
    this.takeoff = { x: this.pos.x, z: this.pos.z, el: this.surf.el, grind: this.grindLast || null };
    this.grindLast = null;
    if (this.manual) this.endManual(true);
    this.revertT = 0;
  }
  vertLaunch() {
    // bergauf = horizontaler Anteil gegen die Flächennormale der Rampe
    let ux = -this.normal.x, uz = -this.normal.z; const gl = Math.hypot(ux, uz);
    if (gl < 1e-3) { ux = this.vel.x; uz = this.vel.z; }
    const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
    const sp = this.vel.length();
    const along = this.vel.x * ux + this.vel.z * uz;
    const latX = this.vel.x - ux * along, latZ = this.vel.z - uz * along;
    this.vel.set(latX - ux * 0.55, Math.max(2, sp * 0.97), latZ - uz * 0.55);
    this.toAir(false); this.air.vert = true; this.air.vertDir = [ux, uz];
    // Brett zur Wand drehen ist nicht nötig – Kamera bleibt
  }

  // ------------------------------------------------------------ Manual
  startManual() {
    const dir = this.manualDir === 'u' ? 'u' : 'd', M = MANUALS[dir];
    this.manual = { dir, t: 0, bal: (Math.random() - 0.5) * 0.1, bv: 0, e: null };
    if (!this.combo.active) this.grace = 0;
    this.manual.e = this.combo.add(M.name, M.pts); this.game.onTrick(this.manual.e);
    this.game.sfx('manual');
  }
  stepManual(dt) {
    const m = this.manual, M = MANUALS[m.dir], st = this.st;
    m.t += dt;
    const diff = 0.9 + m.t * 0.35 - st.balance * 0.06;
    m.bv += (m.bal * 2.6 * diff + (Math.random() - 0.5) * 1.6 * diff) * dt;
    m.bv += this.inp.y * 4.2 * dt * (m.dir === 'u' ? 1 : -1) * -1;
    m.bv *= 1 - 1.2 * dt;
    m.bal += m.bv * dt;
    this.combo.live(m.e, M.pps * dt);
    if (Math.abs(m.bal) > 1) return this.doBail(m.bal > 0 ? 'Über die Nase!' : 'Über das Tail!');
  }
  endManual(keep) { if (!this.manual) return; this.manual = null; this.grace = keep ? 0 : 0.25; }

  // ------------------------------------------------------------ Luft
  stepAir(dt) {
    const a = this.air, inp = this.inp, st = this.st, L = this.level;
    a.t += dt; this.airTime = a.t; this.lastGrindT += dt; this.lastWallT += dt;
    // Drehen
    const spinIn = (inp.down('spinL') ? 1 : 0) - (inp.down('spinR') ? 1 : 0) - inp.x;
    const maxS = 6.2 + st.spin * 0.3;
    if (Math.abs(spinIn) > 0.3) { a.spinV = clamp(a.spinV + Math.sign(spinIn) * 34 * dt, -maxS, maxS); a.snapTarget = null; }
    else if (Math.abs(a.spinV) > 0.5) {
      // nach dem Loslassen bis zur nächsten halben Drehung weiterdrehen
      if (a.snapTarget == null) { const k = Math.sign(a.spinV) * Math.ceil(Math.abs(a.spin) / Math.PI - 0.15); a.snapTarget = k * Math.PI; }
      const rem = a.snapTarget - a.spin;
      if (Math.sign(rem) !== Math.sign(a.spinV) || Math.abs(rem) < 0.02) { a.spinV = 0; a.spin = a.snapTarget; this.yaw = wrap(a.startYaw + a.spin); }
    } else a.spinV = 0;
    if (a.spinV) { const dy = a.spinV * dt; a.spin += dy; this.yaw = wrap(this.yaw + dy); }

    // Tricks
    this.airTricks(dt);

    // Schwerkraft + Bewegung
    this.vel.y -= G * dt;
    const p = this.pos, v = this.vel;
    let nx = p.x + v.x * dt, nz = p.z + v.z * dt, ny = p.y + v.y * dt;
    if (ny > a.maxY) a.maxY = ny;
    // Wandkontakt seitlich
    const s = L.surface(nx, nz, this.surf);
    const smooth = s.el && /qp|ramp|bowl/.test(s.el.t);
    if (s.h > ny) {
      const into = smooth && (s.gx * v.x + s.gz * v.z) > 0;
      if (p.y >= s.h - 0.28 || into || (smooth && s.h - ny < 0.6)) { p.set(nx, s.h, nz); return this.land(s); }
      this.bounce(nx, nz, [nx, nz]); return;
    }
    const sb = this.blockedAir(nx, nz, ny);
    if (sb && (inp.down('grind') || this.grindBuf > 0) && a.t > 0.08 && this.lastWallT > 0.4 && this.startWall(sb, ny)) return;
    if (sb) { this.bounce(nx, nz, sb); nx = p.x + v.x * dt; nz = p.z + v.z * dt; if (this.blockedAir(nx, nz, ny)) { nx = p.x; nz = p.z; } }
    const py = p.y;
    p.set(nx, ny, nz);
    if (v.y <= 0 && this.railTop(py)) return;
    // Grind andocken
    if ((inp.down('grind') || this.grindBuf > 0 || this.game.settings.easy) && a.t > 0.06) this.tryGrind();
    // Sicherheitsnetz: nie unter die Oberfläche
    const hs = L.height(p.x, p.z); if (p.y < hs - 0.05) { p.y = hs; this.land(L.surface(p.x, p.z, this.surf)); }
  }
  // Von oben auf ein Rail: passend ausgerichtet → Grind, sonst kleiner Hüpfer darüber
  railTop(prevY) {
    const p = this.pos;
    for (const sg of this.level.segs) {
      if (sg.kind !== 'rail') continue;
      const ab = sg.b.subtract(sg.a), l2 = ab.x * ab.x + ab.z * ab.z || 1;
      const t = ((p.x - sg.a.x) * ab.x + (p.z - sg.a.z) * ab.z) / l2; if (t <= 0 || t >= 1) continue;
      const qx = sg.a.x + ab.x * t, qz = sg.a.z + ab.z * t, qy = sg.a.y + ab.y * t + 0.03;
      if (Math.hypot(p.x - qx, p.z - qz) > 0.22 || p.y > qy + 0.02 || prevY < qy - 0.2) continue;
      const vh = Math.hypot(this.vel.x, this.vel.z), al = Math.abs(this.vel.x * sg.dir.x + this.vel.z * sg.dir.z);
      if ((vh < 0.8 || al > vh * 0.32) && this.lastGrindT >= 0.25 && this.startGrind(sg, t)) return true;
      p.y = qy + 0.02; this.vel.y = Math.max(this.vel.y, 2.2); return true;
    }
    return false;
  }
  blockedAir(x, z, y) {
    const L = this.level, v = this.vel, l = Math.hypot(v.x, v.z) || 1, fx = v.x / l, fz = v.z / l;
    for (const [ox, oz] of [[fx, fz], [fz, -fx], [-fz, fx]]) { const px = x + ox * BODY_R, pz = z + oz * BODY_R; if (L.solidTop(px, pz) > y + 0.45) return [px, pz]; }
    return null;
  }

  airTricks(dt) {
    const a = this.air, inp = this.inp, e = this.edges;
    // Einfache Steuerung: Ollie-Taste in der Luft antippen = Flip, halten = Grab
    if (this.game.settings.easy && a.t > 0.05) {
      if (e.ollieDown) { a.easyHold = 0; a.easyPress = true; }
      if (a.easyPress && inp.down('ollie')) { a.easyHold += dt; if (a.easyHold > 0.2 && !a.grab && !a.easyGrab) { this.grabBuf = 0.18; a.easyGrab = true; } }
      if (a.easyPress && e.ollieUp) { if (a.easyHold <= 0.2) this.flipBuf = 0.18; a.easyPress = false; }
    }
    // Spezial-Tricks (volle Spezialleiste): zwei Tasten zusammen
    if (this.special >= 1 && !a.special) {
      const sp = this.game.skaterDef.specials;
      if ((this.flipBuf > 0 && this.grabBuf > 0)) { this.flipBuf = this.grabBuf = 0; return this.startSpecial(sp[0]); }
      if ((this.grabBuf > 0 && inp.down('grind') && a.t > 0.05 && !this.grindNear())) { this.grabBuf = 0; return this.startSpecial(sp[1]); }
    }
    if (a.special) {
      a.special.t += dt;
      if (a.special.t >= a.special.def.dur) { a.special.done = true; }
    }
    // Flip
    if (this.flipBuf > 0 && !a.special) {
      if (a.flip && !a.flip.double && a.flip.t < a.flip.dur * 0.75) {
        a.flip.double = true; a.flip.dur += a.flip.def.dur * 0.65; this.combo.rename(a.flip.e, 'Doppel-' + a.flip.def.name); this.combo.bonus(a.flip.e, a.flip.def.pts * 1.2); this.flipBuf = 0;
        this.game.onTrick(a.flip.e); this.game.sfx('flip');
      } else if (!a.flip || a.flip.t >= a.flip.dur) {
        const d = this.game.settings.easy && this.dirNow === 'n' ? ['n', 'l', 'r', 'd', 'ul'][(Math.random() * 5) | 0] : this.dirNow;
        const def = FLIPS[d];
        a.flip = { def, t: 0, dur: def.dur * (1.08 - this.st.spin * 0.016), double: false, e: null };
        a.flip.e = this.combo.add(def.name, def.pts); a.tricks.push(a.flip.e); this.game.onTrick(a.flip.e); this.flipBuf = 0;
        if (this.grace > 0) this.grace = 0;
        this.game.sfx('flip');
      }
    }
    if (a.flip) a.flip.t += dt;
    // Grab
    if (this.grabBuf > 0 && !a.grab && !a.special && (!a.flip || a.flip.t >= a.flip.dur)) {
      const def = GRABS[this.dirNow]; this.grabBuf = 0;
      a.grab = { def, t: 0, e: this.combo.add(def.name, def.pts) }; a.tricks.push(a.grab.e); this.game.onTrick(a.grab.e);
      this.game.sfx('grab');
    }
    if (a.grab) {
      a.grab.t += dt; if (a.grab.t > 0.25) this.combo.live(a.grab.e, a.grab.def.pts * 1.1 * dt);
      if (!inp.down('grab') && !(a.easyGrab && inp.down('ollie')) && a.grab.t > 0.2) a.grab.done = true;
      if (a.grab.done) { a.grabRel = (a.grabRel || 0) + dt; if (a.grabRel > 0.12) a.grab = null; }
    }
  }
  startSpecial(def) {
    const a = this.air;
    a.special = { def, t: 0, e: this.combo.add(def.name, def.pts) }; a.tricks.push(a.special.e); a.special.e.special = true;
    this.game.onTrick(a.special.e, true); this.game.sfx('special');
    a.flip = null; a.grab = null;
  }
  grindNear() { return !!this.findGrind(true); }

  land(s) {
    const a = this.air, n = new Vector3(-s.gx, 1, -s.gz).normalize();
    this.normal = n;
    // Geschwindigkeit auf Fläche projizieren (Aufprall verliert Normalanteil)
    const vn = Vector3.Dot(this.vel, n);
    this.vel.subtractInPlace(n.scale(vn));
    const impact = -vn;
    // Prüfungen
    let fail = null;
    if (a.flip && a.flip.t < a.flip.dur * 0.82) fail = 'Flip nicht zu Ende!';
    if (a.special && a.special.t < a.special.def.dur * 0.82) fail = 'Spezialtrick nicht gestanden!';
    const vh = this.vel.subtract(n.scale(Vector3.Dot(this.vel, n)));
    const spd = vh.length();
    let f = this.heading(); f.subtractInPlace(n.scale(Vector3.Dot(f, n))); f.normalize();
    if (spd > 1.2 && !fail) {
      const c = Vector3.Dot(vh.normalizeToNew(), f);
      if (Math.abs(c) < 0.62) fail = 'Quer gelandet!';
      else {
        // Ausrichtung einrasten
        const vdir = vh.normalizeToNew(), tgt = Math.atan2(vdir.x, vdir.z) + (c < 0 ? Math.PI : 0);
        this.yaw = wrap(tgt); this.fakie = c < 0;
      }
    }
    if (!fail && impact > 16 && n.y > 0.9) fail = 'Zu hart gelandet!';
    if (fail && (a.t > 0.12 || a.flip)) return this.doBail(fail);
    // Erfolg
    this.mode = 'ground'; this.air = null;
    this.landSquash = Math.min(1, impact / 9 + (a.t > 0.3 ? 0.3 : 0));
    if (a.t > 0.25 || a.tricks.length) this.game.sfx('land', Math.min(1, 0.4 + impact / 12));
    const spinDeg = Math.round(Math.abs(a.spin) / Math.PI) * 180;
    if (a.tricks.length) {
      const first = a.tricks[0];
      if (spinDeg >= 180) { this.combo.rename(first, spinDeg + ' ' + first.name); this.combo.bonus(first, spinDeg / 180 * 120); }
    } else if (spinDeg >= 180 || (a.ollied && a.t > 0.35) || (a.vert && a.t > 0.5)) {
      const nm = a.vert ? 'Air' : 'Ollie';
      const e = this.combo.add(spinDeg >= 180 ? spinDeg + ' ' + nm : nm, (a.vert ? 80 : 40) + spinDeg / 180 * 110, nm + spinDeg);
      a.tricks.push(e); this.game.onTrick(e);
    }
    const big = a.maxY - Math.max(a.startY, this.pos.y);
    if (a.tricks.length && a.t > 1.25) { const e = a.tricks[a.tricks.length - 1]; this.combo.bonus(e, 60 + big * 30); }
    // Lücken
    if (this.takeoff) this.game.checkGaps(this.takeoff, this.pos, a);
    if (a.grab) a.grab = null;
    this.grace = this.combo.active ? 0.38 : 0;
    if (a.vert || (n.y < 0.75 && s.el && /qp|bowl/.test(s.el.t))) this.revertT = 0.45;
    if (this.manualBuf > 0 && n.y > 0.7) { this.manualBuf = 0; this.startManual(); }
    if (this.game.settings.easy && this.combo.active && n.y > 0.85 && this.inp.y < -0.3) this.startManual();
  }


  // ------------------------------------------------------------ Wallride
  startWall(hit, y) {
    const L = this.level, p = this.pos, v = this.vel;
    if (L.solidTop(hit[0], hit[1]) < y + 1.0 || L.solidTop(hit[0], hit[1]) >= 49) return false;   // Wand hoch genug (nicht Parkgrenze)
    const [wx, wz] = L.wallNormal(hit[0], hit[1], p.x, p.z);
    const vn = v.x * wx + v.z * wz; let tx = v.x - wx * vn, tz = v.z - wz * vn; const ts = Math.hypot(tx, tz);
    if (ts < 3 || -vn > ts * 1.6) return false;                    // zu frontal oder zu langsam
    tx /= ts; tz /= ts;
    const a = this.air;
    if (a && a.flip && a.flip.t < a.flip.dur * 0.8) return false;
    this.mode = 'wall';
    this.wall = { n: [wx, wz], d: [tx, tz], s: Math.min(ts, 12), vy: Math.max(v.y, 1.6), time: 0, air: a };
    this.wall.e = this.combo.add('Wallride', 220); this.game.onTrick(this.wall.e);
    this.yaw = wrap(Math.atan2(tx, tz) + (this.fakie ? Math.PI : 0));
    this.grace = 0; this.grindBuf = 0; this.air = null;
    this.game.sfx('grindStart'); this.game.grindSound(true, 'ledge');
    return true;
  }
  stepWall(dt) {
    const w = this.wall, L = this.level, p = this.pos;
    w.time += dt;
    w.vy -= G * 0.42 * dt; w.s *= 1 - 0.25 * dt;
    this.combo.live(w.e, 150 * dt);
    const nx = p.x + w.d[0] * w.s * dt, nz = p.z + w.d[1] * w.s * dt, ny = p.y + w.vy * dt;
    // Wand noch da? (Punkt knapp hinter dem Körper zur Wand hin)
    const bx = nx - w.n[0] * (BODY_R + 0.12), bz = nz - w.n[1] * (BODY_R + 0.12);
    const wallH = L.solidTop(bx, bz);
    const ahead = L.solidTop(nx + w.d[0] * BODY_R, nz + w.d[1] * BODY_R) > ny + 0.45;
    const hs = L.height(nx, nz);
    const out = (vy, push) => { this.game.grindSound(false); this.mode = 'air'; this.wall = null; this.lastWallT = 0; this.vel.set(w.d[0] * w.s + w.n[0] * push, vy, w.d[1] * w.s + w.n[1] * push); this.toAir(false); };
    if (this.edges.ollieDown || this.ollieBuf > 0) {         // Wallie: von der Wand abspringen
      this.ollieBuf = 0; out(5.2 + this.st.ollie * 0.08, 2.6);
      const e = this.combo.add('Wallie', 160); this.air.tricks.push(e); this.game.onTrick(e); this.game.sfx('pop', 0.8); return;
    }
    if (ahead) { out(Math.min(w.vy, 0), 1.2); return; }
    if (wallH < ny + 0.5 || w.time > 1.1 || ny <= hs + 0.02) { if (ny <= hs + 0.02) p.y = hs; out(Math.min(w.vy, 1), 0.9); return; }
    p.set(nx, ny, nz); this.vel.set(w.d[0] * w.s, w.vy, w.d[1] * w.s);
  }

  // ------------------------------------------------------------ Grind
  findGrind(probe) {
    const p = this.pos, v = this.vel; let best = null, bd = 1e9;
    for (const sgm of this.level.segs) {
      const ab = sgm.b.subtract(sgm.a), L2 = ab.lengthSquared();
      let t = ((p.x - sgm.a.x) * ab.x + (p.z - sgm.a.z) * ab.z) / (ab.x * ab.x + ab.z * ab.z || 1); t = clamp(t, 0, 1);
      const q = sgm.a.add(ab.scale(t));
      const dx = p.x - q.x, dz = p.z - q.z, dh = Math.hypot(dx, dz), dy = p.y - q.y;
      const reach = sgm.kind === 'rail' ? 0.55 : 0.5;
      if (dh > reach || dy < -0.28 || dy > 0.85) continue;
      if (v.y > 2.5 && dy < 0.1) continue;
      if (t <= 0.001 && dh > 0.1 || t >= 0.999 && dh > 0.1) continue;
      const vh = Math.hypot(v.x, v.z), al = (v.x * sgm.dir.x + v.z * sgm.dir.z);
      if (vh > 1.5 && Math.abs(al) < vh * 0.32 && sgm.kind !== 'coping') continue;
      const score = dh + Math.abs(dy) * 0.5; if (score < bd) { bd = score; best = { sgm, t, q }; }
    }
    return best;
  }
  tryGrind() {
    if (this.lastGrindT < 0.25) return;
    const g = this.findGrind(); if (!g) return;
    this.startGrind(g.sgm, g.t);
  }
  startGrind(sgm, t, keepTrick) {
    const v = this.vel; let s = v.x * sgm.dir.x + v.y * sgm.dir.y + v.z * sgm.dir.z;
    const vh = Math.hypot(v.x, v.z);
    if (Math.abs(s) < 2.2) s = (s >= 0 ? 1 : -1) * Math.max(2.6, vh * 0.7);
    if (this.air && this.air.flip && this.air.flip.t < this.air.flip.dur * 0.7) return false; // mitten im Flip nicht andocken
    const dir = this.game.settings.easy && this.dirNow === 'n' && !keepTrick ? 'n' : this.dirNow;
    // Lip-Trick: aus der Senkrechten an die Kante der Rampe
    if (sgm.kind === 'coping' && this.air && this.air.vert && Math.abs(v.x * sgm.dir.x + v.z * sgm.dir.z) < 2.2 && !keepTrick) return this.startLip(sgm, t, dir);
    const def = GRINDS[dir];
    // Luft-Tricks zählen (Drehung als Bonus)
    if (this.air) { const spin = Math.round(Math.abs(this.air.spin) / Math.PI) * 180; if (spin >= 180 && this.air.tricks[0]) this.combo.rename(this.air.tricks[0], spin + ' ' + this.air.tricks[0].name); }
    this.mode = 'grind';
    const g = this.grind = { sgm, t, s, def, dir, time: 0, bal: (Math.random() - 0.5) * 0.15, bv: 0, e: null };
    if (!keepTrick) { g.e = this.combo.add(def.name, def.pts); this.game.onTrick(g.e); }
    this.air = null; this.grace = 0; this.grindBuf = 0;
    this.game.sfx('grindStart'); this.game.grindSound(true, sgm.kind);
    this.manual = null;
    return true;
  }

  startLip(sgm, t, dir) {
    const def = LIPS[dir], o = sgm.out || [0, 1];
    this.mode = 'grind';
    const g = this.grind = { sgm, t, s: 0, def, dir, time: 0, bal: (Math.random() - 0.5) * 0.15, bv: 0, e: null, lip: true };
    g.e = this.combo.add(def.name, def.pts); this.game.onTrick(g.e);
    this.yaw = wrap(Math.atan2(-o[0], -o[1]));    // Blick aus der Rampe hinaus
    this.air = null; this.grace = 0; this.grindBuf = 0; this.manual = null;
    this.game.sfx('grindStart');
    return true;
  }
  stepLip(dt) {
    const g = this.grind, sg = g.sgm, o = sg.out || [0, 1];
    g.time += dt;
    const diff = 0.7 + g.time * 0.45 - this.st.balance * 0.06;
    g.bv += (g.bal * 2.4 * diff + (Math.random() - 0.5) * 1.6 * diff) * dt;
    g.bv -= this.inp.y * 4.2 * dt; g.bv *= 1 - 1.2 * dt; g.bal += g.bv * dt;
    this.combo.live(g.e, g.def.pps * dt);
    if (Math.abs(g.bal) > 1) return this.doBail('Von der Kante gekippt!');
    const P = Vector3.Lerp(sg.a, sg.b, clamp(g.t, 0, 1)); this.pos.copyFrom(P); this.vel.set(0, 0, 0);
    const hold = this.inp.down('grind') || this.game.settings.easy;
    if (this.edges.ollieDown || this.ollieBuf > 0 || (!hold && g.time > 0.3) || g.time > 3.5) {
      // zurück in die Rampe fallen
      this.ollieBuf = 0; this.grind = null; this.lastGrindT = 0; this.mode = 'air';
      this.pos.x += o[0] * 0.12; this.pos.z += o[1] * 0.12;
      this.vel.set(o[0] * 1.2, -0.5, o[1] * 1.2);
      this.yaw = wrap(Math.atan2(o[0], o[1]) + (this.fakie ? Math.PI : 0));
      this.toAir(false); this.air.vert = true;
    }
  }
  stepGrind(dt) {
    if (this.grind.lip) return this.stepLip(dt);
    const g = this.grind, sg = g.sgm, st = this.st, inp = this.inp;
    g.time += dt;
    g.s += -G * sg.dir.y * dt;                       // Gefälle beschleunigt
    g.s *= 1 - 0.12 * dt;
    if (Math.abs(g.s) < 1.2) g.s = Math.sign(g.s || 1) * 1.2;
    // Balance
    const diff = 0.8 + g.time * 0.3 - st.balance * 0.06;
    g.bv += (g.bal * 2.4 * diff + (Math.random() - 0.5) * 1.8 * diff) * dt;
    g.bv -= inp.x * 4.4 * dt;
    g.bv *= 1 - 1.2 * dt; g.bal += g.bv * dt;
    this.combo.live(g.e, g.def.pps * dt);
    if (Math.abs(g.bal) > 1) { this.game.grindSound(false); return this.doBail('Abgerutscht!'); }
    // Grind wechseln
    if (this.edges.grind && g.time > 0.2) {
      const nd = this.dirNow; if (nd !== g.dir) { g.dir = nd; g.def = GRINDS[nd]; g.e = this.combo.add(g.def.name, g.def.pts); this.game.onTrick(g.e); g.time = 0.0; }
    }
    // Spezial-Grind
    if (this.special >= 1 && this.edges.manual) { const sp = this.game.skaterDef.specials[2]; g.def = Object.assign({}, GRINDS[g.dir], { name: sp.name, pps: sp.pps, yawOff: sp.yawOff ?? Math.PI / 2, pitch: sp.pitch ?? 0 }); g.e = this.combo.add(sp.name, sp.pts); g.e.special = true; this.game.onTrick(g.e, true); this.game.sfx('special'); }
    // Weiter
    g.t += (g.s * dt) / sg.len;
    const P = Vector3.Lerp(sg.a, sg.b, clamp(g.t, 0, 1));
    this.pos.copyFrom(P);
    this.vel.copyFrom(sg.dir.scale(g.s));
    this.yaw = wrap(Math.atan2(sg.dir.x, sg.dir.z) + (g.s < 0 ? Math.PI : 0) + (this.fakie ? Math.PI : 0));
    // Abspringen
    if (this.edges.ollieDown || this.ollieBuf > 0) {
      this.ollieBuf = 0; this.endGrind();
      this.vel.y = Math.max(this.vel.y, 0) + 4.6 + this.st.ollie * 0.08;
      if (sg.out) { this.vel.x += sg.out[0] * 0.4; this.vel.z += sg.out[1] * 0.4; }
      this.toAir(true); this.game.sfx('pop', 0.7); return;
    }
    if (g.t < 0 || g.t > 1) {
      // anschließende Kante (z. B. Pool-Kante) suchen
      const end = g.t > 1 ? sg.b : sg.a;
      const nxt = this.level.segs.find(o => o !== sg && o.kind === sg.kind && (Vector3.DistanceSquared(o.a, end) < 0.04 || Vector3.DistanceSquared(o.b, end) < 0.04) && Math.abs(Vector3.Dot(o.dir, sg.dir)) > 0.7);
      if (nxt) {
        const atA = Vector3.DistanceSquared(nxt.a, end) < 0.04; const same = Vector3.Dot(nxt.dir, sg.dir) > 0;
        g.sgm = nxt; g.t = atA ? 0.001 : 0.999; g.s = Math.abs(g.s) * (atA ? 1 : -1);
        return;
      }
      this.endGrind();
      this.vel.y += 1.2;
      this.toAir(false); this.air.fromGrind = true;
    }
  }
  endGrind() { this.grindLast = this.grind && this.grind.sgm; this.grind = null; this.lastGrindT = 0; this.game.grindSound(false); this.mode = 'air'; }

  // ------------------------------------------------------------ Sturz
  doBail(why) {
    if (this.mode === 'bail') return;
    this.game.grindSound(false);
    const lost = this.combo.active ? this.combo.value : 0;
    this.combo.reset(); this.manual = null; this.grind = null; this.air = null; this.wall = null; this.charge = 0;
    this.mode = 'bail';
    const v = this.vel.clone();
    this.bail = { t: 0, why, bp: this.pos.add(new Vector3(0, 0.1, 0)), bv: v.scale(0.9).add(new Vector3((Math.random() - 0.5) * 2, 3.2, (Math.random() - 0.5) * 2)), spin: new Vector3(Math.random() * 9 - 4.5, Math.random() * 6 - 3, Math.random() * 9 - 4.5), rot: new Vector3(), fall: Math.random() < 0.5 ? 1 : -1 };
    this.vel.scaleInPlace(0.5);
    this.special = Math.max(0, this.special - 0.5);
    this.game.onBail(why, lost);
  }
  stepBail(dt) {
    const b = this.bail, L = this.level; b.t += dt;
    // Körper rutscht aus
    const v = this.vel; const sp = Math.hypot(v.x, v.z), dec = Math.max(0, sp - 9 * dt);
    if (sp > 1e-3) { v.x *= dec / sp; v.z *= dec / sp; }
    v.y = 0;
    let nx = this.pos.x + v.x * dt, nz = this.pos.z + v.z * dt;
    if (L.solidTop(nx, nz) > this.pos.y + 0.3 || L.height(nx, nz) > this.pos.y + 0.5) { v.x = v.z = 0; nx = this.pos.x; nz = this.pos.z; }
    this.pos.x = nx; this.pos.z = nz; this.pos.y = damp(this.pos.y, L.height(nx, nz), 18, dt);
    // Brett fliegt weg
    b.bv.y -= G * dt; b.bp.addInPlace(b.bv.scale(dt)); b.rot.addInPlace(b.spin.scale(dt));
    const hb = L.height(b.bp.x, b.bp.z);
    if (b.bp.y < hb) { b.bp.y = hb; if (b.bv.y < 0) b.bv.y *= -0.35; b.bv.x *= 0.7; b.bv.z *= 0.7; b.spin.scaleInPlace(0.6); }
    if (L.solidTop(b.bp.x, b.bp.z) > b.bp.y + 0.2) { b.bv.x *= -0.4; b.bv.z *= -0.4; }
    if (b.t > 1.7) this.recover();
  }
  recover() {
    const p = this.pos; const s = this.level.surface(p.x, p.z, this.surf);
    let x = p.x, z = p.z;
    // auf steilen Flächen ein Stück nach unten setzen
    for (let k = 0; k < 30 && new Vector3(-s.gx, 1, -s.gz).normalize().y < 0.8; k++) { x -= s.gx * 0.15; z -= s.gz * 0.15; this.level.surface(x, z, s); }
    this.pos.set(x, s.h, z); this.vel.set(0, 0, 0);
    this.mode = 'ground'; this.bail = null; this.normal = UP.clone();
    this.boardSpin.position.set(0, 0, 0); this.boardSpin.rotationQuaternion = Quaternion.Identity();
    this.game.onRecover();
  }

  bank() {
    if (!this.combo.active) return;
    const v = this.combo.value, list = this.combo.list.slice();
    this.special = Math.min(1, this.special + v / 9000 + list.length * 0.02);
    this.game.onBank(v, list);
    this.combo.reset();
  }

  // ------------------------------------------------------------ Darstellung + Pose
  apply(dt) {
    const H = this.holder, b = this.bail;
    const g = this.grind, a = this.air;
    // Position
    H.position.copyFrom(this.pos);
    if (g) H.position.y += g.sgm.kind === 'rail' ? 0.0 : 0.0;
    // Orientierung: Brett-Yaw + Flächen-Normale
    let yaw = this.yaw;
    if (g) yaw += g.def.yawOff;
    const fwd = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    let up = this.mode === 'ground' ? this.normal : UP;
    if (a) { up = this.visUp ? Vector3.Lerp(this.visUp, UP, 1 - Math.exp(-6 * dt)).normalize() : UP; }
    if (this.wall) { const tgt = new Vector3(this.wall.n[0] * 0.9, 0.5, this.wall.n[1] * 0.9).normalize(); up = this.visUp ? Vector3.Lerp(this.visUp, tgt, 1 - Math.exp(-14 * dt)).normalize() : tgt; }
    this.visUp = up.clone();
    const right = Vector3.Cross(up, fwd).normalize(); const f2 = Vector3.Cross(right, up).normalize();
    const m = Matrix.Identity();
    Matrix.FromXYZAxesToRef(right, up, f2, m);
    const q = Quaternion.FromRotationMatrix(m);
    // weiches Nachführen der Neigung, Yaw direkt
    if (!this._q) this._q = q.clone();
    Quaternion.SlerpToRef(this._q, q, dt > 0 ? 1 - Math.exp(-22 * dt) : 1, this._q);
    if (this.mode === 'air' || this.mode === 'grind') this._q.copyFrom(q);
    H.rotationQuaternion.copyFrom(this._q);

    // Kenngrößen weich
    const holdOllie = this.mode === 'ground' && this.charge > 0;
    this.crouch = damp(this.crouch, holdOllie ? 1 : this.braking ? 0.45 : g ? 0.55 : this.manual ? 0.3 : this.mode === 'air' ? 0.25 : 0.12 + Math.min(0.2, this.speed * 0.012), 14, dt);
    this.landSquash = Math.max(0, this.landSquash - dt * 3);
    const tuckT = a ? (a.grab ? 1 : a.flip && a.flip.t < a.flip.dur ? 0.85 : a.special ? 0.9 : clamp(a.t * 3, 0, 0.55) * (this.vel.y > 0 ? 1 : 0.6)) : 0;
    this.tuck = damp(this.tuck, tuckT, a ? 16 : 22, dt);
    this.leanS = damp(this.leanS, this.mode === 'ground' ? this.inp ? this.inp.x : 0 : 0, 8, dt);

    // Brett-Tricks
    const bs = this.boardSpin;
    let bq = Quaternion.Identity(), boardY = 0, boardPitch = 0;
    if (a && a.flip && a.flip.t < a.flip.dur) {
      const t = clamp(a.flip.t / a.flip.dur, 0, 1), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, k = a.flip.double ? 2 : 1, d = a.flip.def;
      bq = Quaternion.RotationYawPitchRoll(d.yaw * Math.PI * 2 * e * k, d.pitch * Math.PI * 2 * e * k, d.roll * Math.PI * 2 * e * k);
      boardY = Math.sin(t * Math.PI) * 0.18;
    }
    if (a && a.special) {
      const t = clamp(a.special.t / a.special.def.dur, 0, 1), d = a.special.def;
      bq = Quaternion.RotationYawPitchRoll((d.yaw || 0) * Math.PI * 2 * t, (d.pitch || 0) * Math.PI * 2 * t, (d.roll || 0) * Math.PI * 2 * t);
      boardY = Math.sin(t * Math.PI) * 0.25;
    }
    if (a && a.grab) { const tw = a.grab.def.tweak, w = clamp(a.grab.t * 5, 0, 1) * (a.grab.done ? 1 - clamp((a.grabRel || 0) * 8, 0, 1) : 1); bq = Quaternion.RotationYawPitchRoll(tw[1] * w, tw[2] * w, tw[0] * w); }
    if (this.manual) boardPitch = MANUALS[this.manual.dir].pitch + this.manual.bal * 0.08;
    if (g) boardPitch = g.def.pitch;
    if (holdOllie) boardPitch = -0.05;
    if (a && a.t < 0.18 && a.ollied && !a.flip) boardPitch = 0.38 * (1 - a.t / 0.18);
    this.boardPitch = damp(this.boardPitch, boardPitch, 18, dt);
    // Manual/Grind: Drehpunkt an Tail bzw. Nose
    const piv = this.boardPitch > 0 ? -0.3 : 0.3;
    const pq = Quaternion.RotationAxis(new Vector3(1, 0, 0), -this.boardPitch);
    bq = bq.multiply(pq);
    const lift = this.tuck * 0.32 + boardY;
    bs.rotationQuaternion.copyFrom(bq);
    // Pitch um Tail/Nose: Höhe ausgleichen
    bs.position.set(0, lift + Math.abs(Math.sin(this.boardPitch)) * 0.3, 0);

    if (b) return this.applyBail(dt);
    this.board.setEnabled(true);
    this.poseRig(dt, lift);
  }

  poseRig(dt, lift) {
    const a = this.air, g = this.grind, c = Math.max(this.crouch, this.landSquash * 0.8);
    const t = performance.now() / 1000;
    const P = this.pose;
    const fy = 0.1 + lift + Math.abs(Math.sin(this.boardPitch)) * 0.3;
    const pitchLift = Math.sin(this.boardPitch);
    const fL = 0.2, fR = -0.24;
    // Füße auf dem Brett (Figurraum: +x = Nase)
    P.footL = [fL, fy - pitchLift * (fL + 0.3) * (this.boardPitch > 0 ? 1 : 0) + (this.boardPitch < 0 ? -pitchLift * 0 : 0), 0.03];
    P.footR = [fR, fy, 0.0];
    if (this.boardPitch > 0) { P.footL[1] = fy + Math.sin(this.boardPitch) * (fL + 0.3) - 0.3 * Math.abs(Math.sin(this.boardPitch)); P.footR[1] = fy + Math.sin(this.boardPitch) * (fR + 0.3) - 0.3 * Math.abs(Math.sin(this.boardPitch)); }
    else if (this.boardPitch < 0) { const s = -Math.sin(this.boardPitch); P.footL[1] = fy + s * (0.3 - fL) - 0.3 * s; P.footR[1] = fy + s * (0.3 - fR) - 0.3 * s; }
    P.toeL = [-0.25, 1]; P.toeR = [0.15, 1];
    const pelY = 0.95 - c * 0.3 - this.tuck * 0.06 + lift * 0.85;
    P.pelvis = [-0.02 + (this.manual ? (this.manual.dir === 'u' ? 0.1 : -0.1) : 0), pelY, 0.02 - c * 0.04];
    P.lean = 0.12 + c * 0.38 + this.leanS * 0.0; P.side = 0; P.twist = 0.15; P.hipTwist = 0;
    P.kneeX = 0; P.kneeZ = 0;
    // Carve: Gewicht auf Zehen-/Fersenkante
    P.pelvis[2] += -this.leanS * 0.07 * (this.fakie ? -1 : 1);
    P.lean += -this.leanS * 0.12;
    // Arme: Gleichgewicht
    const sway = Math.sin(t * 1.7) * 0.03;
    P.handL = [0.42 + c * 0.05, 1.02 - c * 0.25 + sway, 0.18 + c * 0.12];
    P.handR = [-0.42 - c * 0.05, 0.98 - c * 0.25 - sway, 0.12 + c * 0.1];
    // Anschieben: hinterer Fuß auf den Boden
    if (this.pushing > 0.05 && this.mode === 'ground' && !this.manual && this.charge === 0) {
      this.pushPhase += dt * 4.2;
      const ph = this.pushPhase % (Math.PI * 2), w = this.pushing;
      const down = Math.max(0, Math.sin(ph)), sx = Math.cos(ph);
      P.footR = [lerp(fR, 0.05 - sx * 0.45, w), lerp(fy, -0.02 + (1 - down) * 0.12, w), lerp(0, 0.24, w)];
      P.toeR = [0.4, 1]; P.toeL = [lerp(-0.25, 0.85, w), 1];
      P.pelvis[1] -= 0.08 * w; P.pelvis[0] += 0.06 * w; P.lean += 0.1 * w; P.twist = lerp(0.15, 0.7, w); P.hipTwist = 0.35 * w;
      P.handL = [0.35, 1.0, 0.3]; P.handR = [-0.15 + sx * 0.12, 0.9, 0.32];
    } else this.pushPhase = 0;
    // Luft
    if (a) {
      P.handL = [0.4, 1.12 - this.tuck * 0.2, 0.25]; P.handR = [-0.45, 1.15 - this.tuck * 0.2, 0.1];
      if (a.grab) {
        const d = a.grab.def, w = clamp(a.grab.t * 6, 0, 1) * (a.grab.done ? 0 : 1);
        const tgt = [d.at[0], fy + 0.02, d.at[1]];
        if (d.hand === 'r') P.handR = lerpA(P.handR, tgt, w); else P.handL = lerpA(P.handL, tgt, w);
        P.lean += 0.75 * w; P.pelvis[1] -= 0.2 * w; P.pelvis[2] += 0.05 * w;
        if (d.arch) { P.footL[2] -= 0.2 * w; P.footR[2] -= 0.2 * w; P.lean -= 0.5 * w; }
      }
      if (a.special) { const s = a.special.t; P.handL = [0.6, 1.4 + Math.sin(s * 9) * 0.1, 0]; P.handR = [-0.6, 1.4 + Math.cos(s * 9) * 0.1, 0]; }
    }
    if (g) {
      P.handL = [0.5, 1.05 + g.bal * 0.2, 0.15]; P.handR = [-0.5, 1.05 - g.bal * 0.2, 0.15];
      P.side = -g.bal * 0.25; P.pelvis[0] += g.bal * 0.05;
    }
    if (this.manual) { const m = this.manual; P.handL = [0.55, 1.15 + m.bal * 0.2, 0.05]; P.handR = [-0.55, 1.15 - m.bal * 0.2, 0.05]; P.side = -m.bal * 0.2; }
    // Kopf: in Fahrtrichtung
    const ahead = this.fakie ? -1 : 1;
    P.look = [ahead * 4, 1.3, 1.2];
    this.rig.apply(P);
  }

  applyBail(dt) {
    const b = this.bail, P = this.pose, k = clamp(b.t / 0.45, 0, 1);
    // Brett in der Welt: vom Halter lösen
    const bs = this.boardSpin;
    const inv = Matrix.Invert(this.holder.getWorldMatrix());
    bs.position = Vector3.TransformCoordinates(b.bp, inv);
    bs.rotationQuaternion = Quaternion.RotationYawPitchRoll(b.rot.y, b.rot.x, b.rot.z);
    // Figur fällt zur Seite und rappelt sich auf
    const up = b.t > 1.15 ? clamp((b.t - 1.15) / 0.5, 0, 1) : 0, fall = k * (1 - up);
    P.pelvis = [0, lerp(0.95, 0.22, fall), lerp(0, -0.35 * b.fall, fall)];
    P.lean = lerp(0.2, 1.2 * b.fall, fall); P.side = lerp(0, 0.6, fall); P.twist = 0.2; P.hipTwist = 0;
    P.footL = [0.25, lerp(0.0, 0.05, fall), lerp(0.05, 0.4 * b.fall, fall)]; P.footR = [-0.25, 0, lerp(0, 0.3 * b.fall, fall)];
    P.toeL = [0, 1]; P.toeR = [0, 1];
    P.handL = [0.35, lerp(1.0, 0.05, fall), lerp(0.2, 0.45 * b.fall, fall)]; P.handR = [-0.35, lerp(1.0, 0.05, fall), lerp(0.2, 0.45 * b.fall, fall)];
    P.look = [0, 0.6, 2];
    this.rig.apply(P);
  }
}
const lerpA = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
