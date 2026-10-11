import * as THREE from 'three';
import { CAR_HALF, type CarState, type TeamId } from '@shared/sim/types';
import { Rng } from '@shared/rng';
import { BODY_SPECS, type BodySpec } from './bodies';
import {
  MeshBuilder,
  TAU,
  clamp01,
  finite3,
  glowTexture,
  isNum,
  markShared,
  streakTexture,
  teamColors,
} from './common';
import type { Fx } from './fx';
import type { ActorLook, CarDecal } from './types';

/* ---------------------------------------------------------------- Caches */

interface BodyGeos {
  body: THREE.BufferGeometry;
  trim: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  neon: THREE.BufferGeometry;
  fin: THREE.BufferGeometry | null;
  head: THREE.BufferGeometry;
  tail: THREE.BufferGeometry;
  tire: THREE.BufferGeometry;
  spokes: THREE.BufferGeometry;
}

const geoCache = new Map<string, BodyGeos>();

function bodyGeos(id: ActorLook['body']): BodyGeos {
  let g = geoCache.get(id);
  if (g) return g;
  const spec = BODY_SPECS[id];
  const p = spec.build();
  const { r, w } = spec.wheel;
  const tire = new THREE.CylinderGeometry(r, r, w, 10, 1);
  tire.rotateZ(Math.PI / 2);
  markShared(tire);
  // Speichen (Neon) auf beiden Seiten: drei Balken durch die Nabe
  const sp = new MeshBuilder();
  for (const s of [-1, 1]) {
    const x = s * (w / 2 + 0.005);
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3;
      const ry = Math.cos(a) * r * 0.78;
      const rz = Math.sin(a) * r * 0.78;
      sp.bar([x, -ry, -rz], [x, ry, rz], r * 0.07, 0.004);
    }
    // Felgenring
    for (let k = 0; k < 8; k++) {
      const a0 = (k * TAU) / 8;
      const a1 = ((k + 1) * TAU) / 8;
      sp.bar(
        [x, Math.cos(a0) * r * 0.66, Math.sin(a0) * r * 0.66],
        [x, Math.cos(a1) * r * 0.66, Math.sin(a1) * r * 0.66],
        r * 0.045,
        0.004,
      );
    }
  }
  g = {
    body: p.body.build(),
    trim: p.trim.build(),
    glass: p.glass.build(),
    neon: p.neon.build(),
    fin: p.fin.empty ? null : p.fin.build(),
    head: p.head.build(),
    tail: p.tail.build(),
    tire,
    spokes: sp.build(),
  };
  geoCache.set(id, g);
  return g;
}

let unitCone: THREE.BufferGeometry | null = null;
/** Kegel mit Basis bei z = 0, Spitze bei z = −1 */
function coneGeo(): THREE.BufferGeometry {
  if (!unitCone) {
    unitCone = new THREE.CylinderGeometry(0, 1, 1, 8, 1, true);
    unitCone.rotateX(-Math.PI / 2);
    unitCone.translate(0, 0, -0.5);
    markShared(unitCone);
  }
  return unitCone;
}

let tailGeo: THREE.BufferGeometry | null = null;
/** Zwei gekreuzte Streifen (waagerecht + senkrecht) von z = 0 nach z = −1, Breite 1 */
function sonicGeo(): THREE.BufferGeometry {
  if (!tailGeo) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array([
      -0.5, 0, 0, 0.5, 0, 0, 0.5, 0, -1, -0.5, 0, -1, 0, -0.5, 0, 0, 0.5, 0, 0, 0.5, -1, 0, -0.5, -1,
    ]);
    const uv = new Float32Array([0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0]);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
    markShared(g);
    tailGeo = g;
  }
  return tailGeo;
}

let floorGeo: THREE.BufferGeometry | null = null;
function floorGlowGeo(): THREE.BufferGeometry {
  if (!floorGeo) {
    floorGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    markShared(floorGeo);
  }
  return floorGeo;
}

const matCache = new Map<string, THREE.Material>();
function cachedMat<T extends THREE.Material>(key: string, make: () => T): T {
  let m = matCache.get(key) as T | undefined;
  if (!m) {
    m = make();
    m.userData.shared = true;
    matCache.set(key, m);
  }
  return m;
}

const css = (c: number): string => '#' + c.toString(16).padStart(6, '0');

/** Draufsicht-Aufkleber (Texturraum: oben = Nase). Gibt eine geteilte Textur zurück. */
const decalTexCache = new Map<string, THREE.CanvasTexture>();
function decalTexture(decal: CarDecal, main: number, accent: number): THREE.CanvasTexture {
  const key = `${decal}|${main}|${accent}`;
  let t = decalTexCache.get(key);
  if (t) return t;
  const W = 128;
  const H = 256;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = css(main);
  g.fillRect(0, 0, W, H);
  g.fillStyle = css(accent);
  // u 0..1 entspricht x −0.45 … +0.45 m, v (von oben) entspricht z +0.75 … −0.75 m
  const px = (x: number): number => (x / 0.9 + 0.5) * W;
  const pz = (z: number): number => (0.5 - z / 1.5) * H;
  if (decal === 'streifen') {
    for (const s of [-1, 1]) g.fillRect(px(s * 0.085 - 0.04), 0, px(0.04) - px(-0.04), H);
    g.fillStyle = css(main);
    g.fillRect(px(-0.012), 0, px(0.012) - px(-0.012), H);
  } else if (decal === 'blitz') {
    g.beginPath();
    g.moveTo(px(0.14), pz(0.72));
    g.lineTo(px(-0.17), pz(0.15));
    g.lineTo(px(0.03), pz(0.15));
    g.lineTo(px(-0.2), pz(-0.45));
    g.lineTo(px(0.22), pz(0.05));
    g.lineTo(px(0.03), pz(0.05));
    g.lineTo(px(0.28), pz(0.72));
    g.closePath();
    g.fill();
    g.fillRect(px(-0.3), pz(-0.52), px(0.6) - px(0), 6);
  } else if (decal === 'punkte') {
    const rng = new Rng(0xd07);
    for (let row = 0; row < 11; row++) {
      for (let col = 0; col < 5; col++) {
        const x = -0.3 + col * 0.15 + (row % 2) * 0.075;
        const z = 0.6 - row * 0.12;
        const rad = 3.2 + rng.float(0, 2.4);
        g.beginPath();
        g.arc(px(x), pz(z), rad, 0, TAU);
        g.fill();
      }
    }
  }
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData.shared = true;
  decalTexCache.set(key, t);
  return t;
}

/* ----------------------------------------------------------------- Rig */

interface Wheel {
  pivot: THREE.Group;
  spin: THREE.Group;
  front: boolean;
}

const tmpV = new THREE.Vector3();
const tmpF = new THREE.Vector3();
const tmpU = new THREE.Vector3();

/** Ein Fahrzeug-Aufbau mit Rädern, Flamme und Leuchten. Besitzt nur nicht-geteilte Materialien für Animierbares. */
export class CarRig {
  readonly root = new THREE.Group();
  /** Aufbau (kippt/federt zusätzlich zur echten Drehung) */
  readonly tilt = new THREE.Group();
  readonly spec: BodySpec;
  private readonly wheels: Wheel[] = [];
  private readonly flame = new THREE.Group();
  private readonly cones: THREE.Mesh[] = [];
  private readonly coneMats: THREE.MeshBasicMaterial[] = [];
  private readonly flameGlow: THREE.Sprite;
  private readonly sonic: THREE.Mesh;
  private readonly sonicMat: THREE.MeshBasicMaterial;
  private readonly floorMat: THREE.MeshBasicMaterial;
  private readonly headMat: THREE.SpriteMaterial;
  private readonly floor: THREE.Mesh;
  private readonly phase: number;
  readonly main: number;
  readonly accent: number;
  private spinAng = 0;

  constructor(
    readonly look: ActorLook,
    readonly team: TeamId,
    seed = 0,
  ) {
    this.spec = BODY_SPECS[look.body];
    const tc = teamColors(team);
    this.main = tc.main;
    this.accent = look.accent ?? tc.accent;
    this.phase = (seed * 2.399) % TAU;
    const geos = bodyGeos(look.body);
    const spec = this.spec;

    // Materialien (geteilt, zwischengespeichert)
    const bodyMat = cachedMat(`body|${team}|${this.main}|${this.accent}|${look.decal}`, () => {
      const decal = look.decal !== 'keins';
      return new THREE.MeshStandardMaterial({
        color: decal ? 0xffffff : this.main,
        map: decal ? decalTexture(look.decal, this.main, this.accent) : null,
        metalness: 0.35,
        roughness: 0.38,
        flatShading: true,
        emissive: this.main,
        emissiveIntensity: 0.16,
      });
    });
    const trimMat = cachedMat(
      'trim',
      () =>
        new THREE.MeshStandardMaterial({
          color: 0x1b2030,
          metalness: 0.7,
          roughness: 0.38,
          flatShading: true,
          emissive: 0x070912,
          emissiveIntensity: 1,
        }),
    );
    const glassMat = cachedMat(
      `glass|${this.main}`,
      () =>
        new THREE.MeshStandardMaterial({
          color: 0x0b1226,
          metalness: 0.9,
          roughness: 0.12,
          flatShading: true,
          emissive: new THREE.Color(0x0a1224).lerp(new THREE.Color(this.main), 0.16),
          emissiveIntensity: 1,
        }),
    );
    const neonMat = cachedMat(
      `neon|${this.accent}`,
      () => new THREE.MeshBasicMaterial({ color: this.accent }),
    );
    const headLampMat = cachedMat(
      `head|${this.accent}`,
      () =>
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(this.accent).lerp(new THREE.Color(0xffffff), 0.6),
        }),
    );
    const tailLampMat = cachedMat(
      `tail|${this.main}`,
      () =>
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(this.main).lerp(new THREE.Color(0xff2040), 0.35),
        }),
    );
    const finMat = cachedMat(
      `fin|${this.accent}`,
      () =>
        new THREE.MeshBasicMaterial({
          color: this.accent,
          transparent: true,
          opacity: 0.32,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
    );

    this.root.add(this.tilt);
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh => {
      const m = new THREE.Mesh(geo, mat);
      this.tilt.add(m);
      return m;
    };
    add(geos.body, bodyMat);
    add(geos.trim, trimMat);
    add(geos.glass, glassMat);
    add(geos.neon, neonMat);
    if (geos.fin) add(geos.fin, finMat).renderOrder = 2;
    add(geos.head, headLampMat);
    add(geos.tail, tailLampMat);

    // Räder
    const { r, x, zf, zr } = spec.wheel;
    for (const sx of [-1, 1]) {
      for (const sz of [1, -1]) {
        const pivot = new THREE.Group();
        pivot.position.set(sx * x, -CAR_HALF[1] + r, sz > 0 ? zf : zr);
        const spin = new THREE.Group();
        const tire = new THREE.Mesh(geos.tire, trimMat);
        const spokes = new THREE.Mesh(geos.spokes, neonMat);
        spin.add(tire, spokes);
        pivot.add(spin);
        this.tilt.add(pivot);
        this.wheels.push({ pivot, spin, front: sz > 0 });
      }
    }

    // Unterboden-Leuchten (Licht auf dem Boden)
    this.floorMat = new THREE.MeshBasicMaterial({
      color: this.main,
      map: glowTexture(),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.floor = new THREE.Mesh(floorGlowGeo(), this.floorMat);
    this.floor.position.set(0, -CAR_HALF[1] + 0.012, spec.glow[2]);
    this.floor.scale.set(spec.glow[0], 1, spec.glow[1]);
    this.floor.renderOrder = 2;
    this.tilt.add(this.floor);

    // Scheinwerfer-Lichtpunkte
    this.headMat = new THREE.SpriteMaterial({
      map: glowTexture(),
      color: this.accent,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (const h of spec.headSpots) {
      const s = new THREE.Sprite(this.headMat);
      s.position.set(h[0], h[1], h[2]);
      s.scale.setScalar(0.32);
      this.tilt.add(s);
    }

    // Nitro-Flamme: drei ineinander gesteckte additive Kegel + Lichtpunkt
    this.flame.position.set(spec.exhaust[0], spec.exhaust[1], spec.exhaust[2]);
    const flameCols = [this.main, this.accent, 0xffffff];
    const flameAlpha = [0.38, 0.5, 0.62];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.MeshBasicMaterial({
        color: flameCols[i] as number,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      m.userData.alpha = flameAlpha[i];
      const cone = new THREE.Mesh(coneGeo(), m);
      cone.renderOrder = 3;
      this.flame.add(cone);
      this.cones.push(cone);
      this.coneMats.push(m);
    }
    this.flameGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: this.accent,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.flameGlow.renderOrder = 3;
    this.flame.add(this.flameGlow);
    this.flame.visible = false;
    this.tilt.add(this.flame);

    // Supersonic-Schweif
    this.sonicMat = new THREE.MeshBasicMaterial({
      color: this.accent,
      map: streakTexture(),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.sonic = new THREE.Mesh(sonicGeo(), this.sonicMat);
    this.sonic.position.set(0, 0.02, spec.exhaust[2] + 0.05);
    this.sonic.renderOrder = 3;
    this.sonic.visible = false;
    this.tilt.add(this.sonic);
  }

  /** Wirft die Räder an: Lenkwinkel (rad) vorn, Abrollwinkel */
  setWheels(steerAng: number, spinAng: number): void {
    this.spinAng = spinAng;
    for (const w of this.wheels) {
      w.pivot.rotation.y = w.front ? steerAng : 0;
      w.spin.rotation.x = spinAng;
    }
  }
  get spin(): number {
    return this.spinAng;
  }

  /** Flamme/Schweif/Leuchten. boost 0…1 (geglättet), level 0…1 (Tankfüllung), sonic 0…1, t = Zeit */
  setEffects(boost: number, level: number, sonic: number, t: number): void {
    const spec = this.spec;
    if (boost > 0.02) {
      this.flame.visible = true;
      const f =
        1 +
        0.16 * Math.sin(t * 53 + this.phase) +
        0.1 * Math.sin(t * 91 + this.phase * 2.3) +
        0.06 * Math.sin(t * 143);
      const len = spec.flame * boost * (0.65 + 0.35 * level) * (1 + sonic * 0.45) * f;
      const rad = spec.flameR * (0.6 + 0.4 * boost);
      const k = [1, 0.62, 0.3];
      const kl = [1, 0.72, 0.45];
      for (let i = 0; i < 3; i++) {
        (this.cones[i] as THREE.Mesh).scale.set(
          rad * (k[i] as number),
          rad * (k[i] as number),
          len * (kl[i] as number),
        );
        const m = this.coneMats[i] as THREE.MeshBasicMaterial;
        m.opacity = (m.userData.alpha as number) * clamp01(boost * 1.2);
      }
      const gl = this.flameGlow.material;
      gl.opacity = 0.5 * boost;
      this.flameGlow.scale.setScalar(spec.flameR * 5 * (0.8 + 0.2 * f) * (0.6 + 0.4 * boost));
    } else {
      this.flame.visible = false;
    }
    if (sonic > 0.02) {
      this.sonic.visible = true;
      const w = 0.55;
      this.sonic.scale.set(w, w, 4.2 * sonic * (0.92 + 0.08 * Math.sin(t * 37 + this.phase)));
      this.sonicMat.opacity = 0.7 * sonic;
    } else {
      this.sonic.visible = false;
    }
    this.floorMat.opacity = 0.42 + 0.35 * boost;
    this.headMat.opacity = 0.7;
  }

  /** Auspuff in Weltkoordinaten (nach Pose gesetzt) */
  exhaustWorld(out: THREE.Vector3): THREE.Vector3 {
    const e = this.spec.exhaust;
    out.set(e[0], e[1], e[2]).applyQuaternion(this.root.quaternion);
    return out.add(this.root.position);
  }

  dispose(): void {
    // Zeichnet nur ungeteilte Materialien (Flamme, Leuchten, Boden) frei; Geometrien/Texturen sind „shared“.
    this.root.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!m) return;
      for (const x of Array.isArray(m) ? m : [m]) if (!x.userData.shared) x.dispose();
    });
    this.root.removeFromParent();
  }
}

/* ------------------------------------------------------- Akteur im Spiel */

/** Ein Spiel-Fahrzeug: Rig + Animationszustand (Lenkung, Boost-Glättung, Zerstörung/Respawn). */
export class CarActor {
  rig: CarRig;
  /** Eindeutiger Aufbau-Schlüssel (Look + Team) */
  sig: string;
  private steerAng = 0;
  private spinVel = 0;
  private spinAng = 0;
  private boostAmt = 0;
  private sonicAmt = 0;
  private lean = 0;
  private squat = 0;
  private dodgeAmt = 0;
  private appear = 1;
  private prevDemolished = 0;
  /** Explosion für diese Zerstörung schon ausgelöst? */
  exploded = false;
  private hasPrev = false;
  private readonly prevEx = new THREE.Vector3();
  private readonly ex = new THREE.Vector3();
  private trailAcc = 0;
  private sparkAcc = 0;
  private readonly rng: Rng;
  /** Zuletzt gültige Pose (für Schatten) */
  x = 0;
  y = 0;
  z = 0;
  yaw = 0;
  shown = false;

  constructor(
    readonly id: number,
    look: ActorLook,
    readonly team: TeamId,
  ) {
    this.rig = new CarRig(look, team, id);
    this.sig = carSig(look, team);
    this.rng = new Rng(0xca7 + id * 7919);
  }

  /** Respawn-Einblenden starten */
  startAppear(): void {
    this.appear = 0;
  }

  update(dt: number, t: number, car: CarState, fx: Fx, hidden: boolean, q: number): void {
    const rig = this.rig;
    const root = rig.root;
    const dem = isNum(car.demolished) ? car.demolished : 0;
    // Übergänge zerstört ↔ lebendig
    if (dem <= 0 && this.prevDemolished > 0) {
      this.appear = 0;
      this.exploded = false;
      this.hasPrev = false;
      if (finite3(car.pos)) fx.respawn(car.pos[0], car.pos[1], car.pos[2], this.team);
    }
    this.prevDemolished = dem;

    // Pose nur übernehmen, wenn sie gültig ist
    const q4 = car.quat;
    const okQ =
      !!q4 &&
      isNum(q4[0]) &&
      isNum(q4[1]) &&
      isNum(q4[2]) &&
      isNum(q4[3]) &&
      q4[0] * q4[0] + q4[1] * q4[1] + q4[2] * q4[2] + q4[3] * q4[3] > 1e-8;
    if (finite3(car.pos)) {
      root.position.set(car.pos[0], car.pos[1], car.pos[2]);
      this.x = car.pos[0];
      this.y = car.pos[1];
      this.z = car.pos[2];
    }
    if (okQ) root.quaternion.set(q4[0], q4[1], q4[2], q4[3]).normalize();

    const dead = dem > 0;
    root.visible = !dead && !hidden;
    this.shown = !dead && !hidden;
    if (this.appear < 1) this.appear = Math.min(1, this.appear + dt / 0.7);
    const ap = this.appear;
    const sc = ap >= 1 ? 1 : 0.3 + 0.7 * (1 - Math.pow(1 - ap, 3)) * (1 + 0.12 * Math.sin(ap * Math.PI));
    root.scale.setScalar(sc);

    // Vorwärts-/Hochrichtung
    tmpF.set(0, 0, 1).applyQuaternion(root.quaternion);
    tmpU.set(0, 1, 0).applyQuaternion(root.quaternion);
    this.yaw = Math.atan2(tmpF.x, tmpF.z);
    const v = car.vel;
    const vOk = finite3(v);
    const fwd = vOk ? v[0] * tmpF.x + v[1] * tmpF.y + v[2] * tmpF.z : 0;
    const speed = vOk ? Math.hypot(v[0], v[1], v[2]) : 0;
    const inp = car.input;
    const steer = inp && isNum(inp.steer) ? Math.max(-1, Math.min(1, inp.steer)) : 0;
    const thr = inp && isNum(inp.throttle) ? Math.max(-1, Math.min(1, inp.throttle)) : 0;
    const wos = isNum(car.wheelsOnSurface) ? car.wheelsOnSurface : 0;
    const grounded = wos >= 1;
    const k = Math.min(1, dt * 14);

    // Lenkung, Abrollen, Wanken
    const maxSteer = 0.55 / (1 + Math.abs(fwd) * 0.035);
    const steerT = grounded ? -steer * maxSteer : 0;
    this.steerAng += (steerT - this.steerAng) * k;
    const target = grounded ? fwd / rig.spec.wheel.r : this.spinVel * 0.985;
    this.spinVel += (target - this.spinVel) * Math.min(1, dt * 9);
    this.spinAng = (this.spinAng + this.spinVel * dt) % TAU;
    if (!isFinite(this.spinAng)) this.spinAng = 0;
    rig.setWheels(this.steerAng, this.spinAng);
    const leanT = wos >= 3 ? Math.max(-0.08, Math.min(0.08, steer * fwd * 0.0032)) : 0;
    this.lean += (leanT - this.lean) * Math.min(1, dt * 8);
    const squatT = wos >= 3 ? -thr * 0.03 : 0;
    this.squat += (squatT - this.squat) * Math.min(1, dt * 8);
    const dodging = isNum(car.dodgeTimer) && car.dodgeTimer > 0;
    this.dodgeAmt += ((dodging ? 1 : 0) - this.dodgeAmt) * Math.min(1, dt * (dodging ? 18 : 6));
    rig.tilt.rotation.set(this.squat, 0, this.lean);
    const da = this.dodgeAmt;
    rig.tilt.scale.set(1 - 0.05 * da, 1 - 0.14 * da, 1 + 0.12 * da);

    // Boost / Supersonic
    const boosting = car.boosting === true && !dead;
    const rate = boosting ? 14 : 7;
    this.boostAmt += ((boosting ? 1 : 0) - this.boostAmt) * Math.min(1, dt * rate);
    const sonic = car.supersonic === true && !dead;
    this.sonicAmt += ((sonic ? 1 : 0) - this.sonicAmt) * Math.min(1, dt * (sonic ? 6 : 3));
    const level = isNum(car.boost) ? clamp01(car.boost / 100) : 1;
    rig.setEffects(this.boostAmt, level, this.sonicAmt, t);

    if (dead) {
      this.hasPrev = false;
      return;
    }
    // Boost-Spur: Partikelband entlang der Bewegung des Auspuffs (lückenlos interpoliert)
    rig.exhaustWorld(this.ex);
    if (this.boostAmt > 0.3 && boosting && okQ && q > 0.01) {
      this.trailAcc += dt * 95 * q * (1 + this.sonicAmt * 0.5);
      const n = Math.floor(this.trailAcc);
      this.trailAcc -= n;
      const far = this.hasPrev ? this.prevEx.distanceToSquared(this.ex) : 99;
      const rp = rig.spec.flameR;
      for (let i = 0; i < n; i++) {
        const u = (i + 1) / n;
        if (far < 25) tmpV.lerpVectors(this.prevEx, this.ex, u);
        else tmpV.copy(this.ex);
        const m = this.rng.chance(0.55);
        fx.glow.emit(
          tmpV.x + this.rng.float(-rp, rp) * 0.4,
          tmpV.y + this.rng.float(-rp, rp) * 0.4,
          tmpV.z + this.rng.float(-rp, rp) * 0.4,
          -tmpF.x * 2.2 + this.rng.float(-0.5, 0.5),
          -tmpF.y * 2.2 + this.rng.float(-0.5, 0.5),
          -tmpF.z * 2.2 + this.rng.float(-0.5, 0.5),
          m ? rig.main : rig.accent,
          rp * 3.6 * (1 + this.sonicAmt * 0.4),
          rp * 0.5,
          this.rng.float(0.4, 0.75),
          0.4,
        );
      }
    } else {
      this.trailAcc = 0;
    }
    this.prevEx.copy(this.ex);
    this.hasPrev = true;

    // Funken an der Wand (Wandfahrt mit Tempo)
    if (wos >= 1 && tmpU.y < 0.7 && speed > 10 && q > 0.01) {
      this.sparkAcc += dt * 40 * q;
      const n = Math.floor(this.sparkAcc);
      this.sparkAcc -= n;
      for (let i = 0; i < n; i++) {
        const sx = this.rng.chance(0.5) ? 1 : -1;
        const sz = this.rng.float(-0.4, 0.4);
        tmpV
          .set(sx * 0.4, -0.18, sz)
          .applyQuaternion(root.quaternion)
          .add(root.position);
        fx.glow.emit(
          tmpV.x,
          tmpV.y,
          tmpV.z,
          -v[0] * 0.15 + this.rng.float(-2, 2),
          -v[1] * 0.15 + this.rng.float(-1, 2),
          -v[2] * 0.15 + this.rng.float(-2, 2),
          0xffe2a8,
          0.1,
          0.02,
          0.3,
          1,
          8,
          0.5,
        );
      }
    }
  }

  dispose(): void {
    this.rig.dispose();
  }
}

export function carSig(look: ActorLook, team: TeamId): string {
  return `${look.body}|${look.decal}|${look.accent ?? ''}|${team}`;
}

/* ----------------------------------------------------------- Vorschau */

/** Auto für die Garage: dreht sich langsam, Räder rollen, Aufbau federt sanft. */
export function buildCarPreview(
  look: ActorLook,
  team: TeamId,
): { object: THREE.Group; update(dt: number): void; dispose(): void } {
  const rig = new CarRig(look, team, 1);
  const object = new THREE.Group();
  // Auto auf Bodenhöhe der Vorschau (Hitbox-Unterkante bei y = 0)
  rig.root.position.y = CAR_HALF[1];
  object.add(rig.root);
  rig.root.rotation.y = 0.6;
  let t = 0;
  let spin = 0;
  return {
    object,
    update(dt: number): void {
      const d = Number.isFinite(dt) ? Math.max(0, Math.min(0.1, dt)) : 0;
      t += d;
      rig.root.rotation.y += d * 0.55;
      spin = (spin + d * 5) % TAU;
      rig.setWheels(Math.sin(t * 0.9) * 0.25, spin);
      rig.tilt.position.y = Math.sin(t * 1.7) * 0.004;
      rig.setEffects(0, 1, 0, t);
    },
    dispose(): void {
      rig.dispose();
      object.removeFromParent();
    },
  };
}
