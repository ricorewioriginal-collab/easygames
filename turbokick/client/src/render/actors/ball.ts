import * as THREE from 'three';
import { BALL_RADIUS, type BallState } from '@shared/sim/types';
import { NEUTRAL_GLOW, finite3, glowTexture, isNum, markShared } from './common';

const R = BALL_RADIUS;

let platesGeo: THREE.BufferGeometry | null = null;
let coreGeo: THREE.BufferGeometry | null = null;

/**
 * Facetten-Hülle des Energie-Orbs: Dreieckskacheln einer Ikosphäre (Stufe 1), jede Kachel leicht nach außen
 * gewölbt und zur Mitte geschrumpft, sodass der leuchtende Kern durch die Fugen scheint. Bänder aus helleren
 * Kacheln entlang zweier Großkreise geben dem Orb eine eigene, gut lesbare Drehung.
 */
function buildPlates(): THREE.BufferGeometry {
  const ico = new THREE.IcosahedronGeometry(1, 1);
  const pa = ico.getAttribute('position');
  const pos: number[] = [];
  const col: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const m = new THREE.Vector3();
  const base = new THREE.Color();
  const top = new THREE.Color();
  const push = (v: THREE.Vector3, r: number, cc: THREE.Color): void => {
    pos.push(v.x * r, v.y * r, v.z * r);
    col.push(cc.r, cc.g, cc.b);
  };
  const tris = pa.count / 3;
  for (let t = 0; t < tris; t++) {
    a.fromBufferAttribute(pa, t * 3).normalize();
    b.fromBufferAttribute(pa, t * 3 + 1).normalize();
    c.fromBufferAttribute(pa, t * 3 + 2).normalize();
    m.copy(a).add(b).add(c).normalize();
    const band = Math.abs(m.y) < 0.2 || Math.abs(m.x) < 0.2;
    const jitter = ((t * 2654435761) % 1000) / 1000;
    if (band) {
      base.setRGB(0.16, 0.14, 0.3);
      top.setRGB(0.55, 0.5, 0.9);
    } else {
      const k = 0.06 + jitter * 0.03;
      base.setRGB(k * 1.1, k, k * 1.6);
      top.setRGB(k * 2.6, k * 2.4, k * 3.6);
    }
    const ra = a.clone().lerp(m, 0.14).normalize();
    const rb = b.clone().lerp(m, 0.14).normalize();
    const rc = c.clone().lerp(m, 0.14).normalize();
    const apex = R * 1.05;
    for (const [p, q] of [
      [ra, rb],
      [rb, rc],
      [rc, ra],
    ] as const) {
      push(m, apex, top);
      push(p, R, base);
      push(q, R, base);
      push(p, R, base);
      push(p, R * 0.92, base);
      push(q, R, base);
      push(q, R, base);
      push(p, R * 0.92, base);
      push(q, R * 0.92, base);
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

let ringGeo: THREE.BufferGeometry | null = null;

/** Der Energie-Orb: Kern, Facetten-Hülle, zwei Kreiselringe, Lichthof; Farbe wechselt zur Teamfarbe des letzten Berührers. */
export class BallActor {
  readonly root = new THREE.Group();
  private readonly spinRoot = new THREE.Group();
  private readonly plates: THREE.Mesh;
  private readonly core: THREE.Mesh;
  private readonly coreMat: THREE.MeshBasicMaterial;
  private readonly plateMat: THREE.MeshStandardMaterial;
  private readonly halo: THREE.Sprite;
  private readonly rings: THREE.Mesh[] = [];
  private readonly ringMat: THREE.MeshBasicMaterial;
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
    this.plateMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.3,
      roughness: 0.55,
      flatShading: true,
      emissive: 0x000000,
      emissiveIntensity: 1,
    });
    this.coreMat = new THREE.MeshBasicMaterial({ color: NEUTRAL_GLOW });
    this.plates = new THREE.Mesh(platesGeo, this.plateMat);
    this.core = new THREE.Mesh(coreGeo, this.coreMat);
    this.spinRoot.add(this.core, this.plates);
    this.root.add(this.spinRoot);
    if (!ringGeo) {
      ringGeo = new THREE.TorusGeometry(R * 1.16, R * 0.035, 6, 48);
      markShared(ringGeo);
    }
    this.ringMat = new THREE.MeshBasicMaterial({ color: NEUTRAL_GLOW, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 2; i++) {
      const r = new THREE.Mesh(ringGeo, this.ringMat);
      r.rotation.x = Math.PI / 2 + (i ? 0.9 : -0.35);
      this.rings.push(r);
      this.root.add(r);
    }
    const mk = (op: number): THREE.Sprite => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture(),
          color: NEUTRAL_GLOW,
          transparent: true,
          opacity: op,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
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
  /** charge: Ladestand 0…1 (Überladung) – größerer, pulsierender Schein, bei 1 voll überladen */
  update(dt: number, ball: BallState, teamColor: number, charge = 0): void {
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
    const ch = isNum(charge) ? Math.max(0, Math.min(1, charge)) : 0;
    const full = ch >= 1 ? 1 : 0;
    const pulse =
      1 + (0.05 + full * 0.12) * Math.sin(this.t * (6.5 + full * 6)) + this.flash * 0.25 + ch * 0.25;
    this.tmpC.copy(this.cur).lerp(this.white, 0.35 + this.flash * 0.5);
    this.coreMat.color.copy(this.tmpC);
    this.plateMat.emissive
      .copy(this.cur)
      .multiplyScalar(0.09 + 0.05 * Math.sin(this.t * 4) + this.flash * 0.25);
    this.core.scale.setScalar(pulse);
    this.ringMat.color.copy(this.tmpC);
    const spin = this.t * (1.2 + Math.min(3, this.speed * 0.05) + ch * 3);
    const r0 = this.rings[0];
    const r1 = this.rings[1];
    if (r0) r0.rotation.z = spin;
    if (r1) {
      r1.rotation.z = -spin * 1.3;
      r1.rotation.y = this.t * 0.4;
    }
    this.halo.material.color.copy(this.cur);
    this.halo2.material.color.copy(this.tmpC);
    this.halo.scale.setScalar(R * 5.4 * pulse);
    this.halo2.scale.setScalar(R * 2.9 * pulse);
    this.halo.material.opacity = Math.min(1, 0.62 + this.flash * 0.3 + ch * 0.3);
    if (!isNum(this.speed)) this.speed = 0;
  }

  dispose(): void {
    this.plateMat.dispose();
    this.coreMat.dispose();
    this.ringMat.dispose();
    this.halo.material.dispose();
    this.halo2.material.dispose();
    this.root.removeFromParent();
  }
}
