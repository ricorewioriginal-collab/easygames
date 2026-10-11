import * as THREE from 'three';
import { BALL_RADIUS, type BallState } from '@shared/sim/types';
import { NEUTRAL_GLOW, finite3, glowTexture, isNum, markShared } from './common';

const R = BALL_RADIUS;

let platesGeo: THREE.BufferGeometry | null = null;
let coreGeo: THREE.BufferGeometry | null = null;

/**
 * Hexagon-Hülle: dual zur Ikosphäre (12 Fünfecke + Sechsecke, „Goldberg“-Körper). Jede Platte ist leicht
 * gewölbt (Pyramidendach), schrumpft zur Mitte und lässt eine Fuge, durch die der Kern leuchtet.
 */
function buildPlates(): THREE.BufferGeometry {
  const ico = new THREE.IcosahedronGeometry(1, 2);
  const pa = ico.getAttribute('position');
  const triCount = pa.count / 3;
  const key = (i: number): string => `${pa.getX(i).toFixed(4)},${pa.getY(i).toFixed(4)},${pa.getZ(i).toFixed(4)}`;
  const verts = new Map<string, { v: THREE.Vector3; tris: number[] }>();
  const centroids: THREE.Vector3[] = [];
  for (let t = 0; t < triCount; t++) {
    const c = new THREE.Vector3();
    for (let k = 0; k < 3; k++) {
      const i = t * 3 + k;
      c.x += pa.getX(i);
      c.y += pa.getY(i);
      c.z += pa.getZ(i);
      const kk = key(i);
      let e = verts.get(kk);
      if (!e) {
        e = { v: new THREE.Vector3(pa.getX(i), pa.getY(i), pa.getZ(i)).normalize(), tris: [] };
        verts.set(kk, e);
      }
      e.tris.push(t);
    }
    centroids.push(c.normalize());
  }

  const pos: number[] = [];
  const col: number[] = [];
  const push = (v: THREE.Vector3, r: number, c: THREE.Color): void => {
    pos.push(v.x * r, v.y * r, v.z * r);
    col.push(c.r, c.g, c.b);
  };
  const tri = (a: THREE.Vector3, ra: number, ca: THREE.Color, b: THREE.Vector3, rb: number, cb: THREE.Color, c: THREE.Vector3, rc: number, cc: THREE.Color): void => {
    push(a, ra, ca);
    push(b, rb, cb);
    push(c, rc, cc);
  };

  const t1 = new THREE.Vector3();
  const t2 = new THREE.Vector3();
  const base = new THREE.Color();
  const top = new THREE.Color();
  let idx = 0;
  for (const { v, tris } of verts.values()) {
    idx++;
    // Ecken sortieren (gegen den Uhrzeigersinn von außen)
    t1.set(1, 0, 0);
    if (Math.abs(v.x) > 0.9) t1.set(0, 1, 0);
    t1.addScaledVector(v, -t1.dot(v)).normalize();
    t2.crossVectors(v, t1);
    const corners = tris
      .map((ti) => centroids[ti] as THREE.Vector3)
      .map((c) => ({ c, a: Math.atan2(c.dot(t2), c.dot(t1)) }))
      .sort((p, q) => p.a - q.a)
      .map((p) => p.c);
    const pent = corners.length === 5;
    // Plattenfarbe: dunkles Blau-Schwarz, Fünfecke etwas heller/violetter; leichte Streuung je Platte
    const jitter = ((idx * 2654435761) % 1000) / 1000;
    if (pent) {
      base.setRGB(0.1, 0.1, 0.22);
      top.setRGB(0.3, 0.26, 0.62);
    } else {
      const g = 0.05 + jitter * 0.03;
      base.setRGB(g * 0.8, g * 0.95, g * 1.7);
      top.setRGB(g * 1.9, g * 2.3, g * 4.0);
    }
    const ring = corners.map((c) => new THREE.Vector3().copy(v).lerp(c, 0.87).normalize());
    const apex = R * 1.045;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i] as THREE.Vector3;
      const b = ring[(i + 1) % ring.length] as THREE.Vector3;
      // Dach
      tri(v, apex, top, a, R, base, b, R, base);
      // Randwand nach unten (fast unsichtbar, gibt der Fuge Tiefe)
      tri(a, R, base, a, R * 0.93, base, b, R, base);
      tri(b, R, base, a, R * 0.93, base, b, R * 0.93, base);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  markShared(g);
  ico.dispose();
  return g;
}

/** Die Plasmakugel: Kern, Hex-Hülle, Lichthof; Farbe wechselt zur Teamfarbe des letzten Berührers. */
export class BallActor {
  readonly root = new THREE.Group();
  private readonly spinRoot = new THREE.Group();
  private readonly plates: THREE.Mesh;
  private readonly core: THREE.Mesh;
  private readonly coreMat: THREE.MeshBasicMaterial;
  private readonly plateMat: THREE.MeshStandardMaterial;
  private readonly halo: THREE.Sprite;
  private readonly halo2: THREE.Sprite;
  private readonly cur = new THREE.Color(NEUTRAL_GLOW);
  private readonly tgt = new THREE.Color(NEUTRAL_GLOW);
  private readonly white = new THREE.Color(0xffffff);
  private readonly tmpC = new THREE.Color();
  private readonly q = new THREE.Quaternion();
  private readonly dq = new THREE.Quaternion();
  private readonly ax = new THREE.Vector3();
  private t = 0;
  private flash = 0;
  x = 0;
  y = R;
  z = 0;
  speed = 0;

  constructor() {
    if (!platesGeo) platesGeo = buildPlates();
    if (!coreGeo) {
      coreGeo = new THREE.IcosahedronGeometry(R * 0.955, 2);
      markShared(coreGeo);
    }
    this.plateMat = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.55, flatShading: true, emissive: 0x000000, emissiveIntensity: 1 });
    this.coreMat = new THREE.MeshBasicMaterial({ color: NEUTRAL_GLOW });
    this.plates = new THREE.Mesh(platesGeo, this.plateMat);
    this.core = new THREE.Mesh(coreGeo, this.coreMat);
    this.spinRoot.add(this.core, this.plates);
    this.root.add(this.spinRoot);
    const mk = (op: number): THREE.Sprite => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: NEUTRAL_GLOW, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
      s.renderOrder = 3;
      return s;
    };
    this.halo = mk(0.8);
    this.halo2 = mk(0.55);
    this.root.add(this.halo, this.halo2);
    this.root.position.set(0, R, 0);
  }

  /** Aktuelle Lichtfarbe (für Spur/Funken) */
  get color(): number {
    return this.cur.getHex();
  }

  /** Kurzes Aufleuchten (Berührung) */
  pulse(a = 1): void {
    this.flash = Math.max(this.flash, a);
  }

  /** teamColor: 0xRRGGBB oder −1 für neutral */
  update(dt: number, ball: BallState, teamColor: number): void {
    this.t += dt;
    if (finite3(ball.pos)) {
      this.root.position.set(ball.pos[0], ball.pos[1], ball.pos[2]);
      this.x = ball.pos[0];
      this.y = ball.pos[1];
      this.z = ball.pos[2];
    }
    this.speed = finite3(ball.vel) ? Math.hypot(ball.vel[0], ball.vel[1], ball.vel[2]) : 0;
    // Rollen: Quaternion aus der Winkelgeschwindigkeit (Weltsystem) integrieren
    const w = ball.angVel;
    if (finite3(w) && dt > 0) {
      this.ax.set(w[0], w[1], w[2]);
      const len = this.ax.length();
      if (len > 1e-5) {
        this.dq.setFromAxisAngle(this.ax.multiplyScalar(1 / len), Math.min(len * dt, 1.5));
        this.q.premultiply(this.dq).normalize();
        this.spinRoot.quaternion.copy(this.q);
      }
    }
    // Lichtfarbe sanft überblenden
    this.tgt.set(teamColor >= 0 ? teamColor : NEUTRAL_GLOW);
    this.cur.lerp(this.tgt, Math.min(1, dt * 7));
    this.flash = Math.max(0, this.flash - dt * 5);
    const pulse = 1 + 0.05 * Math.sin(this.t * 6.5) + this.flash * 0.25;
    this.tmpC.copy(this.cur).lerp(this.white, 0.35 + this.flash * 0.5);
    this.coreMat.color.copy(this.tmpC);
    this.plateMat.emissive.copy(this.cur).multiplyScalar(0.09 + 0.05 * Math.sin(this.t * 4) + this.flash * 0.25);
    this.core.scale.setScalar(pulse);
    this.halo.material.color.copy(this.cur);
    this.halo2.material.color.copy(this.tmpC);
    this.halo.scale.setScalar(R * 5.4 * pulse);
    this.halo2.scale.setScalar(R * 2.9 * pulse);
    this.halo.material.opacity = 0.62 + this.flash * 0.3;
    if (!isNum(this.speed)) this.speed = 0;
  }

  dispose(): void {
    this.plateMat.dispose();
    this.coreMat.dispose();
    this.halo.material.dispose();
    this.halo2.material.dispose();
    this.root.removeFromParent();
  }
}
