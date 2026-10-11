import * as THREE from 'three';
import type { Screen } from '../render/engine';
import { createCarPreview, type ActorLook } from '../render/actors';
import { disposeTree } from '../render/materials';

/** Schaukasten: ein sich drehendes Auto auf spiegelnder Neon-Bühne – Hintergrund für Menü und Garage */
export class Showroom implements Screen {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 200);
  private preview: { object: THREE.Group; update(dt: number): void; dispose(): void } | null = null;
  private holder = new THREE.Group();
  private t = 0;
  private lines: THREE.Mesh[] = [];
  private shift = 0;

  constructor(
    look: ActorLook,
    team: 0 | 1,
    private readonly calm: boolean,
  ) {
    this.scene.background = new THREE.Color(0x07070f);
    this.scene.fog = new THREE.Fog(0x07070f, 14, 46);
    this.scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x20102a, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 6, 5);
    const rim = new THREE.DirectionalLight(0x19c8ff, 1.3);
    rim.position.set(-5, 3, -4);
    const rim2 = new THREE.DirectionalLight(0xff7a1a, 0.8);
    rim2.position.set(5, 2, -5);
    this.scene.add(key, rim, rim2);
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(40, 48),
      new THREE.MeshStandardMaterial({ color: 0x0b0c1c, metalness: 0.7, roughness: 0.35 }),
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
    // Leuchtgitter
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x19c8ff, transparent: true, opacity: 0.55 });
    for (let i = -10; i <= 10; i++) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 80), lineMat);
      l.rotation.x = -Math.PI / 2;
      l.position.set(i * 2, 0.01, 0);
      this.scene.add(l);
    }
    for (let i = 0; i < 24; i++) {
      const l = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 0.04),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff2d95 : 0x19c8ff, transparent: true, opacity: 0.45 }),
      );
      l.rotation.x = -Math.PI / 2;
      l.position.set(0, 0.01, -30 + i * 2.5);
      this.scene.add(l);
      this.lines.push(l);
    }
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.04, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xb6ff3b }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.03;
    this.scene.add(ring);
    this.scene.add(this.holder);
    this.setLook(look, team);
    this.camera.position.set(0, 1.7, 6.2);
    this.camera.lookAt(0, 0.6, 0);
  }

  /** Verschiebt das Auto im Bild nach rechts/links (Platz für das Menü) */
  setShift(x: number): void {
    this.shift = x;
  }

  setLook(look: ActorLook, team: 0 | 1): void {
    this.preview?.dispose();
    this.holder.clear();
    this.preview = createCarPreview(look, team);
    this.holder.add(this.preview.object);
  }

  update(dt: number): void {
    this.t += dt;
    this.preview?.update(dt);
    this.holder.rotation.y += dt * (this.calm ? 0 : 0.5);
    this.holder.position.x = this.shift;
    for (const [i, l] of this.lines.entries()) {
      l.position.z = ((((i * 2.5 + this.t * (this.calm ? 0 : 3)) % 60) + 60) % 60) - 30;
    }
    this.camera.position.x = this.shift * 0.4;
    this.camera.lookAt(this.shift, 0.6, 0);
  }

  dispose(): void {
    this.preview?.dispose();
    disposeTree(this.scene);
  }
}
