import * as THREE from 'three';
import { CHARACTER_IDS } from '@shared/characters';
import { Rng } from '@shared/rng';
import type { Screen } from '../render/engine';
import { createCharacter, type CharacterRig } from '../render/characters';
import { disposeTree, toon } from '../render/materials';
import { skyDome } from '../render/worlds/common';

/** Animierter 3D-Hintergrund für Menüs: schwebende Prismen, die acht Figuren tanzen auf einer Bühne. */
export class MenuScene implements Screen {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 900);
  private rigs: CharacterRig[] = [];
  private prisms!: THREE.InstancedMesh;
  private prismData: Array<{ p: THREE.Vector3; s: number; sp: number; ph: number }> = [];
  private t = 0;
  private sky = skyDome(0x2a1a8a, 0xff5db1);
  private dummy = new THREE.Object3D();

  constructor(private readonly calm: boolean) {
    this.scene.fog = new THREE.Fog(0x4a2a9a, 30, 120);
    this.scene.add(this.sky, new THREE.HemisphereLight(0xcfc4ff, 0x4a2a7a, 1.6));
    const sun = new THREE.DirectionalLight(0xfff0d8, 2);
    sun.position.set(5, 12, 9);
    this.scene.add(sun);
    // Bühne
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 0.8, 40), toon(0x8a6bff));
    stage.position.y = -0.4;
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(9.1, 0.14, 8, 60),
      new THREE.MeshBasicMaterial({ color: 0x2de2e6 }),
    );
    rim.rotation.x = Math.PI / 2;
    this.scene.add(stage, rim);
    CHARACTER_IDS.forEach((id, i) => {
      const rig = createCharacter(id);
      const a = ((i + 0.5) / CHARACTER_IDS.length) * Math.PI - Math.PI;
      rig.root.position.set(Math.cos(a) * 6.2, 0, Math.sin(a) * 3.2 - 0.5);
      rig.root.rotation.y = Math.atan2(-rig.root.position.x, 8 - rig.root.position.z) * 0.6;
      rig.play(i % 3 === 0 ? 'dance' : i % 3 === 1 ? 'cheer' : 'idle', {
        loop: true,
        speed: 0.8 + (i % 4) * 0.1,
      });
      this.scene.add(rig.root);
      this.rigs.push(rig);
    });
    const rng = new Rng(77);
    const n = 40;
    this.prisms = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(1),
      new THREE.MeshToonMaterial({ color: 0xffffff }),
      n,
    );
    const col = new THREE.Color();
    const cols = [0xff3e9d, 0x2de2e6, 0xffd23f, 0x7c5cff, 0x6bff8f];
    for (let i = 0; i < n; i++) {
      this.prismData.push({
        p: new THREE.Vector3(rng.range(-22, 22), rng.range(-2, 14), rng.range(-30, -4)),
        s: rng.range(0.3, 1.2),
        sp: rng.range(0.2, 0.8),
        ph: rng.range(0, 6.28),
      });
      this.prisms.setColorAt(i, col.setHex(rng.pick(cols)));
    }
    this.scene.add(this.prisms);
    this.camera.position.set(0, 4.2, 16);
    this.camera.lookAt(0, 2.4, 0);
  }

  update(dt: number): void {
    this.t += dt;
    const k = this.calm ? 0 : 1;
    this.prismData.forEach((d, i) => {
      this.dummy.position.set(d.p.x, d.p.y + Math.sin(this.t * d.sp + d.ph) * 0.8 * k, d.p.z);
      this.dummy.rotation.set(this.t * d.sp * k, this.t * d.sp * 0.7 * k, 0);
      this.dummy.scale.setScalar(d.s);
      this.dummy.updateMatrix();
      this.prisms.setMatrixAt(i, this.dummy.matrix);
    });
    this.prisms.instanceMatrix.needsUpdate = true;
    for (const r of this.rigs) r.update(dt);
    const shift = this.camera.aspect > 1.25 ? -4.2 : 0;
    this.camera.position.x = Math.sin(this.t * 0.2) * 2.2 * k + shift;
    this.camera.lookAt(shift, 2.4, 0);
    this.sky.position.copy(this.camera.position);
  }

  dispose(): void {
    this.rigs.forEach((r) => r.dispose());
    this.prisms.dispose();
    disposeTree(this.scene);
    this.sky.geometry.dispose();
    (this.sky.material as THREE.Material).dispose();
  }
}
