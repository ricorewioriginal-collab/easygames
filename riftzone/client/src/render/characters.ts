// Spielfiguren („Rifter“): eigenes stilisiertes Design aus Grundkörpern, prozedurale Animationen,
// Detailstufen (volle Figur nah, Instanz-Silhouette fern), Gleiter und gehaltene Gegenstände.
import * as THREE from 'three';
import { BACKS, EMOTES, GLIDERS, HATS, OUTFITS, SKINS } from '../../../shared/src/cosmetics';
import { clamp, lerp } from '../../../shared/src/math';
import { Mode, type Cosmetics } from '../../../shared/src/types';
import { muzzleOffset, weaponGeometry, weaponMaterial } from './weapons';

const matCache = new Map<number, THREE.MeshLambertMaterial>();
function mat(color: number, emissive = 0): THREE.MeshLambertMaterial {
  const key = color * 7 + emissive;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color, emissive: emissive ? color : 0, emissiveIntensity: emissive ? 0.8 : 0 });
    matCache.set(key, m);
  }
  return m;
}

const G = {
  torso: new THREE.CapsuleGeometry(0.2, 0.26, 3, 10),
  hips: new THREE.BoxGeometry(0.36, 0.16, 0.22),
  head: new THREE.SphereGeometry(0.2, 14, 10),
  eye: new THREE.SphereGeometry(0.035, 6, 4),
  upper: new THREE.CapsuleGeometry(0.065, 0.2, 2, 6),
  lower: new THREE.CapsuleGeometry(0.058, 0.2, 2, 6),
  hand: new THREE.SphereGeometry(0.07, 8, 6),
  thigh: new THREE.CapsuleGeometry(0.085, 0.28, 2, 6),
  shin: new THREE.CapsuleGeometry(0.075, 0.26, 2, 6),
  boot: new THREE.BoxGeometry(0.15, 0.11, 0.26),
  stripe: new THREE.BoxGeometry(0.43, 0.05, 0.31),
  emblem: new THREE.OctahedronGeometry(0.06, 0),
  panel: new THREE.BoxGeometry(0.24, 0.2, 0.06),
  half: new THREE.BoxGeometry(0.2, 0.52, 0.3),
  dot: new THREE.SphereGeometry(0.035, 6, 4),
  chev: new THREE.BoxGeometry(0.06, 0.26, 0.04),
  beanie: new THREE.SphereGeometry(0.215, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  pom: new THREE.SphereGeometry(0.06, 6, 4),
  phones: new THREE.TorusGeometry(0.2, 0.025, 6, 16, Math.PI),
  cup: new THREE.CylinderGeometry(0.07, 0.07, 0.06, 10),
  capBrim: new THREE.BoxGeometry(0.3, 0.025, 0.18),
  helmet: new THREE.SphereGeometry(0.235, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
  visor: new THREE.BoxGeometry(0.3, 0.09, 0.08),
  crown: new THREE.ConeGeometry(0.04, 0.16, 4),
  antenna: new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4),
  ball: new THREE.SphereGeometry(0.04, 6, 4),
  pack: new THREE.BoxGeometry(0.32, 0.38, 0.16),
  cell: new THREE.CylinderGeometry(0.07, 0.07, 0.36, 8),
  wing: new THREE.BoxGeometry(0.5, 0.3, 0.03),
  quiver: new THREE.CylinderGeometry(0.08, 0.06, 0.48, 6),
  shard: new THREE.OctahedronGeometry(0.06, 0),
  canopy: new THREE.SphereGeometry(1.6, 16, 6, 0, Math.PI * 2, 0, 0.75),
  bar: new THREE.CylinderGeometry(0.015, 0.015, 1.4, 4),
};

export interface CharState {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  mode: Mode;
  crouch: boolean;
  speed: number;
  aiming: boolean;
  firing: boolean;
  building: boolean;
  reloading: boolean;
  using: boolean;
  reviving: boolean;
  emote: number;
  weapon: number;
  rarity: number;
  vy: number;
}

interface Limb {
  pivot: THREE.Group;
  joint: THREE.Group;
}

export class CharacterRig {
  readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly hips = new THREE.Group();
  private readonly spine = new THREE.Group();
  private readonly headG = new THREE.Group();
  private readonly armL: Limb;
  private readonly armR: Limb;
  private readonly legL: Limb;
  private readonly legR: Limb;
  private readonly handR = new THREE.Group();
  private readonly handL = new THREE.Group();
  private readonly glider = new THREE.Group();
  private held: THREE.Mesh | null = null;
  private heldKey = '';
  private phase = 0;
  private t = 0;
  private fireKick = 0;
  cos: Cosmetics;
  /** Mündungsposition (Welt) */
  readonly muzzle = new THREE.Vector3();
  private emoteT = 0;
  private lastEmote = -1;
  private swing = 0;

  constructor(cos: Cosmetics) {
    this.cos = cos;
    const o = OUTFITS[cos.outfit] ?? OUTFITS[0]!;
    const [c1, c2, acc, pants, shoes] = o.colors;
    const skin = SKINS[cos.skin] ?? SKINS[2]!;
    const mPrim = mat(c1),
      mSec = mat(c2),
      mAcc = mat(acc, 1),
      mPants = mat(pants),
      mShoes = mat(shoes),
      mSkin = mat(skin),
      mEye = mat(0x111118);
    this.root.add(this.body);
    this.body.add(this.hips);
    this.hips.position.y = 0.94;
    const hipMesh = new THREE.Mesh(G.hips, mPants);
    this.hips.add(hipMesh);
    this.hips.add(this.spine);
    this.spine.position.y = 0.08;
    const torso = new THREE.Mesh(G.torso, mPrim);
    torso.position.y = 0.26;
    torso.scale.set(1.05, 1, 0.75);
    this.spine.add(torso);
    // Muster
    switch (o.pattern) {
      case 'stripes':
        for (const y of [0.16, 0.3, 0.44]) {
          const s = new THREE.Mesh(G.stripe, mSec);
          s.position.y = y;
          s.scale.set(0.98, 1, 0.98);
          this.spine.add(s);
        }
        break;
      case 'split': {
        const s = new THREE.Mesh(G.half, mSec);
        s.position.set(0.1, 0.27, 0);
        s.scale.set(1, 1, 0.97);
        this.spine.add(s);
        break;
      }
      case 'chevron':
        for (const sgn of [-1, 1]) {
          const c = new THREE.Mesh(G.chev, mSec);
          c.position.set(sgn * 0.07, 0.3, -0.15);
          c.rotation.z = sgn * 0.6;
          this.spine.add(c);
        }
        break;
      case 'dots':
        for (let i = 0; i < 7; i++) {
          const d = new THREE.Mesh(G.dot, mAcc);
          d.position.set(Math.cos(i * 2.4) * 0.12, 0.18 + (i % 4) * 0.08, -0.155);
          this.spine.add(d);
        }
        break;
      default: {
        const p = new THREE.Mesh(G.panel, mSec);
        p.position.set(0, 0.32, -0.14);
        this.spine.add(p);
      }
    }
    const emb = new THREE.Mesh(G.emblem, mAcc);
    emb.position.set(0, 0.36, -0.175);
    this.spine.add(emb);
    // Kopf
    this.headG.position.y = 0.66;
    this.spine.add(this.headG);
    const head = new THREE.Mesh(G.head, mSkin);
    head.position.y = 0.1;
    this.headG.add(head);
    for (const sx of [-0.075, 0.075]) {
      const e = new THREE.Mesh(G.eye, mEye);
      e.position.set(sx, 0.13, -0.185);
      e.scale.set(1, 1.3, 0.6);
      this.headG.add(e);
    }
    this.addHat(cos.hat, mPrim, mAcc);
    // Arme
    this.armL = this.limb(this.spine, -0.27, 0.48, G.upper, G.lower, mPrim, mSkin, 0.17, 0.17);
    this.armR = this.limb(this.spine, 0.27, 0.48, G.upper, G.lower, mPrim, mSkin, 0.17, 0.17);
    const hl = new THREE.Mesh(G.hand, mSkin);
    hl.position.y = -0.2;
    this.armL.joint.add(hl);
    this.handL.position.y = -0.22;
    this.armL.joint.add(this.handL);
    const hr = new THREE.Mesh(G.hand, mSkin);
    hr.position.y = -0.2;
    this.armR.joint.add(hr);
    this.handR.position.y = -0.22;
    this.armR.joint.add(this.handR);
    // Beine
    this.legL = this.limb(this.hips, -0.11, -0.04, G.thigh, G.shin, mPants, mPants, 0.22, 0.22);
    this.legR = this.limb(this.hips, 0.11, -0.04, G.thigh, G.shin, mPants, mPants, 0.22, 0.22);
    for (const l of [this.legL, this.legR]) {
      const b = new THREE.Mesh(G.boot, mShoes);
      b.position.set(0, -0.42, -0.04);
      l.joint.add(b);
    }
    this.addBack(cos.back, mSec, mAcc);
    // Gleiter
    const gl = GLIDERS[cos.glider] ?? GLIDERS[0]!;
    const can = new THREE.Mesh(G.canopy, new THREE.MeshLambertMaterial({ color: gl.color, side: THREE.DoubleSide }));
    can.scale.set(1, 0.55, 0.7);
    can.position.y = 2.6;
    this.glider.add(can);
    for (const sx of [-0.6, 0.6]) {
      const b = new THREE.Mesh(G.bar, mat(0x333333));
      b.position.set(sx, 2.05, 0);
      b.rotation.z = sx > 0 ? -0.35 : 0.35;
      this.glider.add(b);
    }
    this.glider.visible = false;
    this.root.add(this.glider);
    this.root.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) {
        m.castShadow = true;
      }
    });
  }

  private limb(parent: THREE.Object3D, x: number, y: number, ug: THREE.BufferGeometry, lg: THREE.BufferGeometry, um: THREE.Material, lm: THREE.Material, ul: number, ll: number): Limb {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    parent.add(pivot);
    const u = new THREE.Mesh(ug, um);
    u.position.y = -ul / 2 - 0.02;
    pivot.add(u);
    const joint = new THREE.Group();
    joint.position.y = -ul - 0.06;
    pivot.add(joint);
    const l = new THREE.Mesh(lg, lm);
    l.position.y = -ll / 2 - 0.02;
    joint.add(l);
    return { pivot, joint };
  }

  private addHat(id: number, mPrim: THREE.Material, mAcc: THREE.Material): void {
    const def = HATS[id];
    if (!def || id === 0) return;
    const m = mat(def.color);
    const g = this.headG;
    switch (id) {
      case 1: {
        const b = new THREE.Mesh(G.beanie, m);
        b.position.y = 0.12;
        g.add(b);
        const p = new THREE.Mesh(G.pom, mat(0xffffff));
        p.position.y = 0.34;
        g.add(p);
        break;
      }
      case 2: {
        const ph = new THREE.Mesh(G.phones, mat(0x222222));
        ph.position.y = 0.12;
        g.add(ph);
        for (const sx of [-0.2, 0.2]) {
          const c = new THREE.Mesh(G.cup, m);
          c.rotation.z = Math.PI / 2;
          c.position.set(sx, 0.1, 0);
          g.add(c);
        }
        break;
      }
      case 3: {
        const b = new THREE.Mesh(G.beanie, m);
        b.position.y = 0.13;
        b.scale.set(1, 0.7, 1);
        g.add(b);
        const br = new THREE.Mesh(G.capBrim, m);
        br.position.set(0, 0.16, -0.2);
        g.add(br);
        break;
      }
      case 4: {
        const hm = new THREE.Mesh(G.helmet, m);
        hm.position.y = 0.08;
        g.add(hm);
        const v = new THREE.Mesh(G.visor, mat(0x1a2a3a));
        v.position.set(0, 0.2, -0.19);
        g.add(v);
        break;
      }
      case 5:
        for (let i = 0; i < 5; i++) {
          const c = new THREE.Mesh(G.crown, mAcc);
          const a = (i / 5) * Math.PI * 2;
          c.position.set(Math.cos(a) * 0.13, 0.33, Math.sin(a) * 0.13);
          g.add(c);
        }
        break;
      case 6: {
        const b = new THREE.Mesh(G.beanie, mPrim);
        b.position.y = 0.12;
        g.add(b);
        for (const sx of [-0.08, 0.08]) {
          const a = new THREE.Mesh(G.antenna, mat(0x333333));
          a.position.set(sx, 0.42, 0);
          g.add(a);
          const ba = new THREE.Mesh(G.ball, m);
          ba.position.set(sx, 0.58, 0);
          g.add(ba);
        }
        break;
      }
      default: {
        const hm = new THREE.Mesh(G.helmet, mPrim);
        hm.position.y = 0.08;
        hm.scale.set(1.05, 1.1, 1.05);
        g.add(hm);
        const v = new THREE.Mesh(G.visor, m);
        v.scale.set(1.1, 1.6, 1);
        v.position.set(0, 0.14, -0.2);
        g.add(v);
      }
    }
  }

  private addBack(id: number, mSec: THREE.Material, mAcc: THREE.Material): void {
    const def = BACKS[id];
    if (!def || id === 0) return;
    const m = mat(def.color);
    const s = this.spine;
    switch (id) {
      case 1: {
        const p = new THREE.Mesh(G.pack, m);
        p.position.set(0, 0.28, 0.2);
        s.add(p);
        break;
      }
      case 2:
        for (const sx of [-0.08, 0.08]) {
          const c = new THREE.Mesh(G.cell, mat(def.color, 1));
          c.position.set(sx, 0.3, 0.18);
          s.add(c);
        }
        break;
      case 3:
        for (const sx of [-1, 1]) {
          const w = new THREE.Mesh(G.wing, mat(def.color, 1));
          w.position.set(sx * 0.28, 0.38, 0.2);
          w.rotation.set(0, sx * 0.5, sx * 0.4);
          s.add(w);
        }
        break;
      case 4: {
        const p = new THREE.Mesh(G.pack, mSec);
        p.scale.set(0.8, 0.8, 0.8);
        p.position.set(0, 0.25, 0.18);
        s.add(p);
        const a = new THREE.Mesh(G.antenna, m);
        a.scale.set(1.5, 2.5, 1.5);
        a.position.set(0.1, 0.7, 0.2);
        s.add(a);
        break;
      }
      default: {
        const qv = new THREE.Mesh(G.quiver, mSec);
        qv.position.set(0.05, 0.3, 0.18);
        qv.rotation.z = 0.3;
        s.add(qv);
        for (let i = 0; i < 3; i++) {
          const sh = new THREE.Mesh(G.shard, mAcc);
          sh.position.set(0.12 + i * 0.03, 0.58 + i * 0.03, 0.18);
          s.add(sh);
        }
      }
    }
  }

  private setHeld(id: number, rarity: number, visible: boolean): void {
    const key = visible ? `${id}:${rarity}` : '';
    if (key === this.heldKey) return;
    this.heldKey = key;
    if (this.held) {
      this.handR.remove(this.held);
      this.held = null;
    }
    if (!visible || id < 0) return;
    const g = weaponGeometry(id, id === 100 ? this.cos.pickaxe : rarity);
    this.held = new THREE.Mesh(g, weaponMaterial);
    this.held.castShadow = true;
    // Waffe im Griff: Lauf nach vorn (Hand zeigt nach unten)
    this.held.rotation.x = -Math.PI / 2;
    this.held.position.set(0, 0, 0);
    this.handR.add(this.held);
  }

  kick(): void {
    this.fireKick = 1;
    this.swing = 1;
  }

  update(s: CharState, dt: number): void {
    this.t += dt;
    const r = this.root;
    r.position.set(s.x, s.y, s.z);
    r.rotation.set(0, s.yaw, 0);
    this.body.rotation.set(0, 0, 0);
    this.body.position.set(0, 0, 0);
    this.hips.position.y = 0.94;
    this.hips.rotation.set(0, 0, 0);
    this.spine.rotation.set(0, 0, 0);
    this.headG.rotation.set(0, 0, 0);
    this.glider.visible = s.mode === Mode.Glide;
    const L = this.legL,
      R = this.legR,
      AL = this.armL,
      AR = this.armR;
    for (const l of [L, R, AL, AR]) {
      l.pivot.rotation.set(0, 0, 0);
      l.joint.rotation.set(0, 0, 0);
    }
    const hasWeapon = s.weapon >= 0 && s.weapon !== 100 && s.weapon < 20;
    const pickaxe = s.weapon === 100;
    const cons = s.weapon >= 20 && s.weapon < 30;
    const showHeld = s.mode !== Mode.Freefall && s.mode !== Mode.Glide && s.mode !== Mode.Swim && s.mode !== Mode.Downed && s.mode !== Mode.Dead && s.mode !== Mode.Bus && !s.building && s.emote < 0;
    this.setHeld(s.weapon, s.rarity, showHeld && s.weapon >= 0);
    this.fireKick = Math.max(0, this.fireKick - dt * 9);
    this.swing = Math.max(0, this.swing - dt * 2.4);

    // Laufzyklus
    const sp = s.speed;
    this.phase += dt * (sp < 0.3 ? 0 : 2.4 + sp * 1.25);
    const ph = this.phase;
    const amp = clamp(sp / 7, 0, 1);
    const pitch = clamp(s.pitch, -1.2, 1.2);

    switch (s.mode) {
      case Mode.Freefall: {
        this.body.rotation.x = -1.15;
        this.body.position.y = 0.9;
        AL.pivot.rotation.z = 1.9 + Math.sin(this.t * 6) * 0.1;
        AR.pivot.rotation.z = -1.9 - Math.sin(this.t * 6) * 0.1;
        L.pivot.rotation.z = 0.35;
        R.pivot.rotation.z = -0.35;
        L.joint.rotation.x = 0.5;
        R.joint.rotation.x = 0.5;
        break;
      }
      case Mode.Glide: {
        AL.pivot.rotation.z = 2.7;
        AR.pivot.rotation.z = -2.7;
        AL.joint.rotation.z = 0.3;
        AR.joint.rotation.z = -0.3;
        L.pivot.rotation.x = 0.25 + Math.sin(this.t * 2) * 0.1;
        R.pivot.rotation.x = 0.15 - Math.sin(this.t * 2) * 0.1;
        this.body.rotation.x = -0.15;
        break;
      }
      case Mode.Swim: {
        this.body.rotation.x = -1.2;
        this.body.position.y = 1.1;
        const st = this.t * 4;
        AL.pivot.rotation.x = Math.sin(st) * 1.6;
        AR.pivot.rotation.x = Math.sin(st + Math.PI) * 1.6;
        L.pivot.rotation.x = Math.sin(st * 1.5) * 0.4;
        R.pivot.rotation.x = -Math.sin(st * 1.5) * 0.4;
        break;
      }
      case Mode.Downed: {
        this.hips.position.y = 0.45;
        this.spine.rotation.x = -0.9;
        L.pivot.rotation.x = 1.4;
        R.pivot.rotation.x = 1.4;
        L.joint.rotation.x = -1.5;
        R.joint.rotation.x = -1.5;
        const cr = Math.sin(ph) * amp;
        AL.pivot.rotation.x = -1.2 + cr * 0.5;
        AR.pivot.rotation.x = -1.2 - cr * 0.5;
        break;
      }
      case Mode.Slide: {
        this.hips.position.y = 0.6;
        this.spine.rotation.x = 0.35;
        L.pivot.rotation.x = -1.3;
        L.joint.rotation.x = 0.2;
        R.pivot.rotation.x = -0.4;
        R.joint.rotation.x = 1.3;
        AL.pivot.rotation.z = 0.6;
        break;
      }
      case Mode.Climb: {
        AL.pivot.rotation.x = -2.6;
        AR.pivot.rotation.x = -2.6;
        L.pivot.rotation.x = -0.8;
        L.joint.rotation.x = 1.2;
        break;
      }
      case Mode.Vehicle: {
        this.hips.position.y = 0.2;
        L.pivot.rotation.x = -1.4;
        R.pivot.rotation.x = -1.4;
        L.joint.rotation.x = 1.4;
        R.joint.rotation.x = 1.4;
        if (!hasWeapon) {
          AL.pivot.rotation.x = -0.9;
          AR.pivot.rotation.x = -0.9;
        }
        break;
      }
      case Mode.Air: {
        L.pivot.rotation.x = -0.5;
        L.joint.rotation.x = 0.9;
        R.pivot.rotation.x = 0.2;
        R.joint.rotation.x = 0.5;
        if (!hasWeapon) {
          AL.pivot.rotation.z = 0.9;
          AR.pivot.rotation.z = -0.9;
        }
        break;
      }
      default: {
        // Gehen/Laufen/Stehen
        const crouch = s.crouch;
        if (crouch) {
          this.hips.position.y = 0.66;
          L.pivot.rotation.x = -0.9;
          R.pivot.rotation.x = -0.9;
          L.joint.rotation.x = 1.3;
          R.joint.rotation.x = 1.3;
          this.spine.rotation.x = -0.25;
        }
        const legA = (crouch ? 0.4 : 0.8) * amp;
        L.pivot.rotation.x += Math.sin(ph) * legA;
        R.pivot.rotation.x += Math.sin(ph + Math.PI) * legA;
        L.joint.rotation.x += Math.max(0, Math.sin(ph - 1.2)) * legA * 1.3;
        R.joint.rotation.x += Math.max(0, Math.sin(ph + Math.PI - 1.2)) * legA * 1.3;
        this.hips.position.y += Math.abs(Math.sin(ph)) * 0.05 * amp - (amp > 0.85 ? 0.03 : 0);
        if (amp > 0.85) this.spine.rotation.x -= 0.15;
        AL.pivot.rotation.x = Math.sin(ph + Math.PI) * 0.7 * amp;
        AR.pivot.rotation.x = Math.sin(ph) * 0.7 * amp;
        AL.joint.rotation.x = -0.3 - amp * 0.4;
        AR.joint.rotation.x = -0.3 - amp * 0.4;
        if (sp < 0.3 && !crouch) {
          // Atmen
          this.spine.rotation.x += Math.sin(this.t * 1.8) * 0.02;
          AL.pivot.rotation.z = 0.12;
          AR.pivot.rotation.z = -0.12;
        }
      }
    }

    // Oberkörper: Waffe halten / Zielen / Bauen / Heilen
    const upright = s.mode === Mode.Ground || s.mode === Mode.Air || s.mode === Mode.Slide || s.mode === Mode.Vehicle;
    if (upright && s.emote < 0) {
      if (hasWeapon && !s.building) {
        const aim = s.aiming ? 1 : 0.75;
        this.spine.rotation.y = -0.35 * aim;
        this.headG.rotation.y = 0.3 * aim;
        AR.pivot.rotation.set(-1.45 - pitch * 0.85 + this.fireKick * 0.25, 0.3, 0);
        AR.joint.rotation.set(-0.25, 0, 0);
        AL.pivot.rotation.set(-1.35 - pitch * 0.85, 0.75, 0);
        AL.joint.rotation.set(-0.7, 0, 0);
        if (s.reloading) {
          AL.pivot.rotation.x = -0.6 + Math.sin(this.t * 10) * 0.25;
          AL.joint.rotation.x = -1.4;
        }
      } else if (pickaxe && !s.building) {
        const sw = this.swing;
        AR.pivot.rotation.set(-0.9 - Math.sin(sw * Math.PI) * 1.8 + (sw > 0 ? 0.8 : 0) - pitch * 0.4, 0, 0);
        AR.joint.rotation.x = -0.5;
      } else if (cons) {
        AR.pivot.rotation.set(-1.0, 0, 0);
        AR.joint.rotation.x = -1.2;
        if (s.using) {
          AL.pivot.rotation.set(-1.0 + Math.sin(this.t * 8) * 0.2, 0, 0.3);
          AL.joint.rotation.x = -1.3;
        }
      } else if (s.building) {
        AR.pivot.rotation.set(-1.2 - pitch * 0.6, 0, 0);
        AL.pivot.rotation.set(-1.2 - pitch * 0.6, 0, 0);
        AR.joint.rotation.x = -0.2;
        AL.joint.rotation.x = -0.2;
      }
      this.spine.rotation.x += pitch * 0.25;
      this.headG.rotation.x = pitch * 0.35;
    }
    if (s.reviving) {
      this.hips.position.y = 0.62;
      L.pivot.rotation.x = -1.1;
      L.joint.rotation.x = 1.6;
      R.pivot.rotation.x = 0.2;
      R.joint.rotation.x = 1.4;
      AL.pivot.rotation.x = -1.2 + Math.sin(this.t * 6) * 0.2;
      AR.pivot.rotation.x = -1.2 - Math.sin(this.t * 6) * 0.2;
    }

    // Emotes
    if (s.emote >= 0) {
      if (s.emote !== this.lastEmote) this.emoteT = 0;
      this.emoteT += dt;
      this.emoteAnim(EMOTES[s.emote]?.anim ?? 'wave', this.emoteT);
    }
    this.lastEmote = s.emote;

    // Gliedmaßen wurden mit „negativ = nach vorn“ beschrieben – hier in Three.js-Drehrichtung umrechnen
    for (const l of [L, R, AL, AR]) {
      l.pivot.rotation.x = -l.pivot.rotation.x;
      l.pivot.rotation.z = -l.pivot.rotation.z;
      l.joint.rotation.x = -l.joint.rotation.x;
      l.joint.rotation.z = -l.joint.rotation.z;
    }

    // Mündungsposition
    if (this.held) {
      this.root.updateMatrixWorld(true);
      this.muzzle.set(0, 0.07, -muzzleOffset(s.weapon));
      this.held.localToWorld(this.muzzle);
    } else {
      this.muzzle.set(s.x, s.y + 1.4, s.z);
    }
  }

  emoteAnim(anim: string, t: number): void {
    const AL = this.armL,
      AR = this.armR,
      L = this.legL,
      R = this.legR;
    switch (anim) {
      case 'wave':
        AR.pivot.rotation.set(0, 0, -2.6);
        AR.joint.rotation.z = -0.4 + Math.sin(t * 9) * 0.5;
        break;
      case 'salute':
        AR.pivot.rotation.set(-0.3, 0, -1.9);
        AR.joint.rotation.set(0, 0, -2.1);
        break;
      case 'laugh':
        this.spine.rotation.x = Math.abs(Math.sin(t * 7)) * 0.4;
        AL.pivot.rotation.x = -0.6;
        AR.pivot.rotation.x = -0.6;
        AL.joint.rotation.x = -1.5;
        AR.joint.rotation.x = -1.5;
        break;
      case 'flex':
        AL.pivot.rotation.z = 1.5;
        AR.pivot.rotation.z = -1.5;
        AL.joint.rotation.z = 1.6 + Math.sin(t * 3) * 0.1;
        AR.joint.rotation.z = -1.6 - Math.sin(t * 3) * 0.1;
        this.spine.rotation.x = -0.1;
        break;
      case 'spin':
        this.body.rotation.y = t * 7;
        AL.pivot.rotation.z = 1.4;
        AR.pivot.rotation.z = -1.4;
        L.pivot.rotation.x = Math.sin(t * 14) * 0.3;
        break;
      case 'sit':
        this.hips.position.y = 0.3;
        L.pivot.rotation.x = -1.5;
        R.pivot.rotation.x = -1.5;
        L.joint.rotation.x = 1.5;
        R.joint.rotation.x = 1.5;
        AL.pivot.rotation.x = 0.4;
        AR.pivot.rotation.x = 0.4;
        this.headG.rotation.y = Math.sin(t) * 0.4;
        break;
      case 'cheer': {
        const j = Math.abs(Math.sin(t * 5));
        this.body.position.y = j * 0.35;
        AL.pivot.rotation.z = 2.8;
        AR.pivot.rotation.z = -2.8;
        L.joint.rotation.x = j * 0.8;
        R.joint.rotation.x = j * 0.8;
        break;
      }
      case 'dance1': {
        const b = Math.sin(t * 8);
        this.hips.position.y = 0.9 + Math.abs(b) * 0.05;
        this.body.rotation.z = b * 0.12;
        AL.pivot.rotation.set(-0.5, 0, 0.6 + b * 0.8);
        AR.pivot.rotation.set(-0.5, 0, -0.6 + b * 0.8);
        AL.joint.rotation.z = 1.2;
        AR.joint.rotation.z = -1.2;
        L.pivot.rotation.x = Math.max(0, b) * 0.6;
        R.pivot.rotation.x = Math.max(0, -b) * 0.6;
        break;
      }
      case 'dance2': {
        const b = Math.sin(t * 6);
        this.body.rotation.y = b * 0.6;
        this.hips.position.y = 0.85 + Math.abs(Math.cos(t * 6)) * 0.08;
        AL.pivot.rotation.set(-2.2 + b, 0, 0.2);
        AR.pivot.rotation.set(-2.2 - b, 0, -0.2);
        L.pivot.rotation.z = 0.2 + b * 0.2;
        R.pivot.rotation.z = -0.2 + b * 0.2;
        break;
      }
      default: {
        // dance3 – Riftbeben
        const b = Math.sin(t * 10);
        this.hips.position.y = 0.75 + b * 0.08;
        L.pivot.rotation.x = -0.6;
        R.pivot.rotation.x = -0.6;
        L.joint.rotation.x = 1;
        R.joint.rotation.x = 1;
        AL.pivot.rotation.set(-1.4, 0, 0.4 + b * 0.5);
        AR.pivot.rotation.set(-1.4, 0, -0.4 - b * 0.5);
        this.spine.rotation.z = b * 0.15;
        this.headG.rotation.x = b * 0.2;
      }
    }
  }

  dispose(): void {
    this.root.removeFromParent();
  }
}

/** Ferne Figuren als eine instanzierte Silhouette. */
export class CrowdLod {
  readonly mesh: THREE.InstancedMesh;
  private n = 0;
  private readonly m = new THREE.Matrix4();
  private readonly c = new THREE.Color();
  constructor(max = 128) {
    const g = new THREE.CapsuleGeometry(0.32, 1.0, 3, 8).translate(0, 0.85, 0);
    this.mesh = new THREE.InstancedMesh(g, new THREE.MeshLambertMaterial({ color: 0xffffff }), max);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
  }
  begin(): void {
    this.n = 0;
  }
  add(x: number, y: number, z: number, h: number, color: number, lying: boolean): void {
    if (this.n >= this.mesh.instanceMatrix.count) return;
    if (lying) this.m.makeRotationX(-Math.PI / 2).setPosition(x, y + 0.35, z);
    else this.m.makeScale(1, h / 1.8, 1).setPosition(x, y, z);
    this.mesh.setMatrixAt(this.n, this.m);
    this.mesh.setColorAt(this.n, this.c.setHex(color));
    this.n++;
  }
  end(): void {
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}

export const lerpN = lerp;
