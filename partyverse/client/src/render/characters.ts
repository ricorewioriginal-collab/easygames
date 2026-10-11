import * as THREE from 'three';
import { getCharacter, type CharacterId } from '@shared/characters';
import { disposeTree } from './materials';
import { G, makeEnv, type Env, type Parts } from './characters/kit';
import { buildBrumm, buildLumi, buildPip, buildZapp } from './characters/modelsA';
import { buildFlora, buildMokka, buildQuirl, buildVex } from './characters/modelsB';
import { HAT_IDS, buildHat, type HatId, type HatInstance } from './characters/hats';
import { ANIM_DURATION, LOOPING, copyPose, lerpPose, neutralPose, samplePose, wrapAngle, type CharacterAnim } from './characters/pose';

export type { CharacterAnim } from './characters/pose';
export type { HatId } from './characters/hats';
export { HAT_IDS };
export type { CharacterId };

export interface CharacterRig {
  readonly id: CharacterId;
  /** Wurzel (Füße bei y = 0, Figurhöhe ca. 1.6–2.0 Einheiten, Blick nach +z) */
  readonly root: THREE.Group;
  /** Startet eine Animation; loop true für idle/walk/run/dance. Gibt nach Ende einmaliger Animationen automatisch zu 'idle' zurück
   *  (Ausnahme: 'teleportOut' bleibt unsichtbar stehen, bis z. B. 'teleportIn' gestartet wird). Gleiche Schleifen-Animation erneut starten ist wirkungslos (nur Tempo). */
  play(anim: CharacterAnim, opts?: { loop?: boolean; speed?: number }): void;
  readonly current: CharacterAnim;
  /** Drehung um die Hochachse (Radiant), weich nachgeführt */
  faceTowards(angleY: number): void;
  /** Aufmerksamkeit: Kopf/Blick zu Weltpunkt (optional) */
  lookAt(target: THREE.Vector3 | null): void;
  setHat(hat: HatId | null): void;
  setTrail(color: number | null): void;
  /** Muss jedes Bild mit dt (Sekunden) aufgerufen werden */
  update(dt: number): void;
  dispose(): void;
}

const BUILDERS: Record<string, (env: Env) => Parts> = {
  bean: buildPip,
  golem: buildBrumm,
  lantern: buildLumi,
  fox: buildZapp,
  mole: buildMokka,
  spiral: buildQuirl,
  bloom: buildFlora,
  cube: buildVex,
};

const BLEND = 0.15;
const TRAIL_N = 16;
const SPARK_N = 10;

let softTex: THREE.DataTexture | null = null;
/** Weicher runder Verlauf für den Schattenfleck (reine Daten, funktioniert auch ohne DOM) */
function softCircle(): THREE.DataTexture {
  if (!softTex) {
    const n = 32;
    const d = new Uint8Array(n * n * 4);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const r = Math.hypot((x + 0.5) / n - 0.5, (y + 0.5) / n - 0.5) * 2;
        const a = Math.max(0, Math.min(1, (1 - r) / 0.55));
        const v = Math.round(a * a * (3 - 2 * a) * 255);
        const i = (y * n + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = d[i + 3] = v;
      }
    softTex = new THREE.DataTexture(d, n, n, THREE.RGBAFormat);
    softTex.magFilter = softTex.minFilter = THREE.LinearFilter;
    softTex.needsUpdate = true;
    softTex.userData.shared = true;
  }
  return softTex;
}

const smooth = (k: number): number => k * k * (3 - 2 * k);

class Rig implements CharacterRig {
  readonly id: CharacterId;
  readonly root = new THREE.Group();
  private readonly rigG = new THREE.Group();
  private readonly parts: Parts;
  private readonly env: Env;
  private anim: CharacterAnim = 'idle';
  private loop = true;
  private speed = 1;
  private animT = 0;
  private blendT = BLEND;
  private time = 0;
  private readonly pose = neutralPose();
  private readonly from = neutralPose();
  private readonly target = neutralPose();
  private prevY = 0;
  private j = 0;
  private jv = 0;
  private jl = 0;
  private jlv = 0;
  private yawTarget: number | null = null;
  private turnRate = 0;
  private lookTarget: THREE.Vector3 | null = null;
  private lookYaw = 0;
  private lookPitch = 0;
  private lookW = 0;
  private blinkIn = 1.5 + Math.random() * 2;
  private blinkT = -1;
  private hat: HatInstance | null = null;
  private readonly shadow: THREE.Mesh;
  private readonly sparks: THREE.InstancedMesh;
  private trail: { mesh: THREE.InstancedMesh; pts: THREE.Vector3[]; acc: number; sf: number; last: THREE.Vector3 } | null = null;
  private readonly tmpV = new THREE.Vector3();
  private readonly tmpO = new THREE.Object3D();
  private disposed = false;

  constructor(id: CharacterId, opts: { scale?: number; toon?: boolean }) {
    this.id = id;
    const def = getCharacter(id);
    this.env = makeEnv(def, opts.toon ?? true);
    this.parts = BUILDERS[def.silhouette](this.env);
    this.root.name = `char-${id}`;
    this.rigG.name = 'pose';
    this.parts.head.name = 'head';
    this.rigG.add(this.parts.model);
    this.root.add(this.rigG);
    this.root.scale.setScalar(opts.scale ?? 1);

    const sm = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false, alphaMap: softCircle() });
    this.shadow = new THREE.Mesh(G.disc(1, 24), sm);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.02;
    this.shadow.renderOrder = 1;
    this.root.add(this.shadow);

    const spk = new THREE.MeshBasicMaterial({ color: new THREE.Color(def.colors.accent).lerp(new THREE.Color(0xffffff), 0.35) });
    this.sparks = new THREE.InstancedMesh(G.octa(0.08), spk, SPARK_N);
    this.sparks.frustumCulled = false;
    this.sparks.visible = false;
    this.root.add(this.sparks);

    samplePose(this.target, 'idle', 0, this.parts.style);
    copyPose(this.pose, this.target);
    copyPose(this.from, this.target);
    this.applyPose(0);
  }

  get current(): CharacterAnim {
    return this.anim;
  }

  play(anim: CharacterAnim, opts: { loop?: boolean; speed?: number } = {}): void {
    const loop = opts.loop ?? LOOPING.has(anim);
    const speed = opts.speed !== undefined && Number.isFinite(opts.speed) && opts.speed > 0 ? opts.speed : 1;
    if (anim === this.anim && loop && this.loop) {
      this.speed = speed;
      return;
    }
    const gaitSwitch = (this.anim === 'walk' || this.anim === 'run') && (anim === 'walk' || anim === 'run');
    this.startAnim(anim, loop, speed, gaitSwitch);
  }

  private startAnim(anim: CharacterAnim, loop: boolean, speed: number, keepPhase = false): void {
    copyPose(this.from, this.pose);
    this.from.ry = wrapAngle(this.from.ry);
    this.blendT = 0;
    this.anim = anim;
    this.loop = loop;
    this.speed = speed;
    if (!keepPhase) this.animT = 0;
  }

  faceTowards(angleY: number): void {
    if (Number.isFinite(angleY)) this.yawTarget = angleY;
  }

  lookAt(target: THREE.Vector3 | null): void {
    this.lookTarget = target ? target.clone() : null;
  }

  setHat(hat: HatId | null): void {
    if (this.hat) {
      disposeTree(this.hat.group);
      this.hat = null;
    }
    this.parts.hatHide?.forEach((o) => (o.visible = true));
    if (!hat) return;
    this.hat = buildHat(hat, this.env);
    this.hat.group.scale.setScalar(this.parts.hatScale);
    this.parts.hatAnchor.add(this.hat.group);
    this.parts.hatHide?.forEach((o) => (o.visible = false));
  }

  setTrail(color: number | null): void {
    if (this.trail) {
      this.trail.mesh.removeFromParent();
      this.trail.mesh.dispose();
      (this.trail.mesh.material as THREE.Material).dispose();
      this.trail = null;
    }
    if (color === null || this.disposed) return;
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false });
    const mesh = new THREE.InstancedMesh(G.sph(0.17, 8, 6), mat, TRAIL_N);
    mesh.frustumCulled = false;
    mesh.renderOrder = 3;
    const base = new THREE.Color(color);
    const c = new THREE.Color();
    for (let i = 0; i < TRAIL_N; i++) mesh.setColorAt(i, c.copy(base).lerp(new THREE.Color(0xffffff), (1 - i / TRAIL_N) * 0.5));
    mesh.count = 0;
    this.root.add(mesh);
    this.root.updateWorldMatrix(true, false);
    const last = this.root.getWorldPosition(new THREE.Vector3());
    this.trail = { mesh, pts: [], acc: 0, sf: 0, last };
  }

  update(dt: number): void {
    if (this.disposed) return;
    dt = Number.isFinite(dt) ? Math.min(Math.max(dt, 0), 0.1) : 0;
    this.time += dt;
    this.animT += dt * this.speed;

    // Animationsende
    const dur = ANIM_DURATION[this.anim];
    if (dur !== undefined) {
      if (this.loop) {
        this.animT %= dur;
      } else if (this.animT >= dur) {
        if (this.anim === 'teleportOut') this.animT = dur;
        else this.startAnim('idle', true, 1);
      }
    }

    // Zielpose und Überblenden
    samplePose(this.target, this.anim, this.animT, this.parts.style);
    if (this.blendT < BLEND) {
      this.blendT += dt;
      lerpPose(this.pose, this.from, this.target, smooth(Math.min(1, this.blendT / BLEND)));
    } else {
      copyPose(this.pose, this.target);
    }

    // Federn für Nachschwingen
    const vy = dt > 1e-4 ? (this.pose.y - this.prevY) / dt : 0;
    this.prevY = this.pose.y;
    const steps = Math.max(1, Math.min(6, Math.ceil(dt / (1 / 90))));
    const h = dt / steps;
    for (let i = 0; i < steps && dt > 0; i++) {
      this.jv += (160 * (Math.max(-5, Math.min(5, vy)) * 0.2 - this.j) - 9 * this.jv) * h;
      this.j += this.jv * h;
      this.jlv += (130 * (-this.pose.rz * 2 + this.turnRate * 0.12 - this.jl) - 8 * this.jlv) * h;
      this.jl += this.jlv * h;
    }
    this.j = Math.max(-1.3, Math.min(1.3, this.j));
    this.jl = Math.max(-1.3, Math.min(1.3, this.jl));

    // Drehung
    if (this.yawTarget !== null && dt > 0) {
      const d = wrapAngle(this.yawTarget - this.root.rotation.y);
      const step = d * (1 - Math.exp(-14 * dt));
      this.root.rotation.y += step;
      this.turnRate = step / dt;
    } else {
      this.turnRate *= 0.9;
    }

    // Blick
    this.updateLook(dt);

    this.applyPose(dt);
    this.updateFx(dt);
  }

  private updateLook(dt: number): void {
    let wy = 0;
    let wp = 0;
    let w = 0;
    if (this.lookTarget) {
      this.root.updateWorldMatrix(true, false);
      const v = this.tmpV.copy(this.lookTarget);
      this.root.worldToLocal(v);
      const hz = Math.hypot(v.x, v.z);
      if (hz > 0.05) {
        wy = Math.atan2(v.x, v.z);
        wp = Math.atan2(this.parts.headY - v.y, hz);
        w = 1;
        if (Math.abs(wy) > 2.3) w = 0;
        wy = Math.max(-1.0, Math.min(1.0, wy));
        wp = Math.max(-0.5, Math.min(0.5, wp));
      }
    }
    const k = 1 - Math.exp(-8 * dt);
    this.lookW += (w - this.lookW) * k;
    this.lookYaw += (wy * w - this.lookYaw) * k;
    this.lookPitch += (wp * w - this.lookPitch) * k;
  }

  private applyPose(dt: number): void {
    const p = this.pose;
    const P = this.parts;
    const g = this.rigG;
    g.position.set(p.x, p.y, p.z);
    g.rotation.set(p.rx, p.ry, p.rz, 'YXZ');
    const s = Math.max(1e-4, p.s);
    g.scale.set(Math.max(1e-4, p.sx) * s, Math.max(1e-4, p.sy) * s, Math.max(1e-4, p.sz) * s);
    g.visible = p.s > 0.004;

    P.head.rotation.set(p.hx + this.lookPitch, p.hy + this.lookYaw, p.hz, 'YXZ');
    if (P.armL) P.armL.rotation.set(-p.alx, 0, p.alz, 'ZXY');
    if (P.armR) P.armR.rotation.set(-p.arx, 0, -p.arz, 'ZXY');
    if (P.legL) {
      P.legL.userData.y0 ??= P.legL.position.y;
      P.legL.rotation.x = -p.llx;
      P.legL.position.y = (P.legL.userData.y0 as number) + p.lly;
    }
    if (P.legR) {
      P.legR.userData.y0 ??= P.legR.position.y;
      P.legR.rotation.x = -p.lrx;
      P.legR.position.y = (P.legR.userData.y0 as number) + p.lry;
    }

    // Blinzeln
    let blink = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      blink = Math.sin(Math.min(1, this.blinkT / 0.16) * Math.PI);
      if (this.blinkT >= 0.16) {
        this.blinkT = -1;
        this.blinkIn = 1.8 + Math.random() * 3.5;
      }
    } else {
      this.blinkIn -= dt;
      if (this.blinkIn <= 0) this.blinkT = 0;
    }
    const lx = Math.max(-1, Math.min(1, this.lookYaw / 0.8));
    const ly = Math.max(-1, Math.min(1, -this.lookPitch / 0.45));
    P.face.set(Math.max(blink, p.lid), p.mouth, lx, ly, p.eyes);

    P.extra({ t: this.time, dt, pose: p, j: this.j, jl: this.jl });
    if (this.hat) this.hat.update(this.time, dt, this.j);

    // Schatten
    const hgt = Math.max(0, p.y);
    const sc = (P.shadow * s) / (1 + hgt * 0.7);
    this.shadow.scale.set(Math.max(1e-4, sc), Math.max(1e-4, sc), 1);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = 0.34 / (1 + hgt * 1.1);
    this.shadow.visible = p.s > 0.004;
  }

  private updateFx(dt: number): void {
    // Teleport-Funken (nur Transformationen)
    const tele = this.anim === 'teleportOut' || this.anim === 'teleportIn';
    if (tele) {
      const d = ANIM_DURATION[this.anim] as number;
      const u = Math.min(1, Math.max(0, this.animT / d));
      const kk = this.anim === 'teleportOut' ? u : 1 - u;
      const o = this.tmpO;
      for (let i = 0; i < SPARK_N; i++) {
        const ang = (i / SPARK_N) * Math.PI * 2 + kk * 9 * (this.anim === 'teleportOut' ? 1 : -1);
        const r = 0.2 + kk * 1.05;
        o.position.set(Math.cos(ang) * r, 0.3 + kk * 1.3 + 0.25 * Math.sin(i * 2.3), Math.sin(ang) * r);
        o.rotation.set(this.time * 5 + i, this.time * 4, 0);
        o.scale.setScalar(Math.max(1e-4, Math.sin(Math.PI * u) * (0.7 + 0.4 * Math.sin(i * 1.7)) * 1.4));
        o.updateMatrix();
        this.sparks.setMatrixAt(i, o.matrix);
      }
      this.sparks.instanceMatrix.needsUpdate = true;
      this.sparks.visible = u > 0.01 && u < 0.99;
    } else if (this.sparks.visible) {
      this.sparks.visible = false;
    }

    // Spur
    const tr = this.trail;
    if (tr) {
      this.root.updateWorldMatrix(true, false);
      const wp = this.root.getWorldPosition(this.tmpV);
      const speed = dt > 1e-4 ? wp.distanceTo(tr.last) / dt : 0;
      tr.last.copy(wp);
      const target = Math.min(1, speed / 1.2);
      tr.sf += (target - tr.sf) * (1 - Math.exp(-6 * dt));
      tr.acc += dt;
      if (tr.acc >= 0.03) {
        tr.acc = 0;
        const sp = this.root.scale.x;
        tr.pts.push(new THREE.Vector3(wp.x + (Math.random() - 0.5) * 0.4 * sp, wp.y + (0.25 + Math.random() * 0.8) * sp, wp.z + (Math.random() - 0.5) * 0.4 * sp));
        if (tr.pts.length > TRAIL_N) tr.pts.shift();
      }
      const o = this.tmpO;
      o.rotation.set(0, 0, 0);
      const n = tr.pts.length;
      for (let i = 0; i < n; i++) {
        const v = this.tmpV.copy(tr.pts[i]);
        this.root.worldToLocal(v);
        o.position.copy(v);
        const age = (i + 1) / TRAIL_N;
        o.scale.setScalar(Math.max(1e-4, (0.15 + 0.85 * age) * (0.25 + 0.75 * tr.sf) * (0.8 + 0.4 * Math.sin(this.time * 9 + i))));
        o.updateMatrix();
        tr.mesh.setMatrixAt(i, o.matrix);
      }
      tr.mesh.count = n;
      tr.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.setHat(null);
    this.setTrail(null);
    this.sparks.dispose();
    disposeTree(this.root);
    this.root.clear();
  }
}

/** Erzeugt eine der acht Figuren (prozedural, ohne Texturen oder Canvas – läuft auch in Node). */
export function createCharacter(id: CharacterId, opts: { scale?: number; toon?: boolean } = {}): CharacterRig {
  return new Rig(id, opts);
}
