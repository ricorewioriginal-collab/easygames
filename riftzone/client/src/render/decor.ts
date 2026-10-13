// Dekoration ohne Kollision: Windmühlenflügel, Antennen, Kran, Leuchtfeuer, Brunnen, Sonnenschirme,
// Satellitenschüsseln, Leuchtschilder, Straßenlaternen, Rohre. Animierte Teile drehen sich.
import * as THREE from 'three';
import type { Decor } from '../../../shared/src/worldgen';

const lam = (c: number, e = 0): THREE.MeshLambertMaterial => new THREE.MeshLambertMaterial({ color: c, emissive: e ? c : 0, emissiveIntensity: e });

export class DecorView {
  readonly group = new THREE.Group();
  private readonly spinners: { o: THREE.Object3D; speed: number; axis: 'x' | 'y' | 'z' }[] = [];
  private readonly lights: THREE.MeshLambertMaterial[] = [];
  private t = 0;

  constructor(list: readonly Decor[]) {
    for (const d of list) {
      const o = this.make(d);
      if (!o) continue;
      o.position.set(d.x, d.y, d.z);
      o.rotation.y = d.rot;
      o.scale.multiplyScalar(d.scale);
      o.traverse((m) => {
        if ((m as THREE.Mesh).isMesh) m.castShadow = true;
      });
      this.group.add(o);
    }
  }

  private make(d: Decor): THREE.Object3D | null {
    const g = new THREE.Group();
    switch (d.kind) {
      case 'blades': {
        const hub = new THREE.Group();
        for (let i = 0; i < 4; i++) {
          const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 6.5, 0.12), lam(d.color));
          b.position.y = 3.4;
          const arm = new THREE.Group();
          arm.rotation.z = (i * Math.PI) / 2;
          arm.add(b);
          hub.add(arm);
        }
        hub.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 8).rotateX(Math.PI / 2), lam(0x5a4a3a)));
        g.add(hub);
        this.spinners.push({ o: hub, speed: 0.6, axis: 'z' });
        return g;
      }
      case 'antenna': {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 8, 6).translate(0, 4, 0), lam(0xcfd6e0));
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6).translate(0, 8.2, 0), lam(d.color, 1));
        this.lights.push(tip.material as THREE.MeshLambertMaterial);
        g.add(m, tip);
        return g;
      }
      case 'crane': {
        const mast = new THREE.Mesh(new THREE.BoxGeometry(1.2, 26, 1.2).translate(0, 13, 0), lam(d.color));
        const jib = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 22).translate(0, 26, 6), lam(d.color));
        const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 2.4).translate(0, 24.5, 0), lam(0x2a2f45));
        const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 12).translate(0, 20, 15), lam(0x222222));
        g.add(mast, jib, cab, hook);
        return g;
      }
      case 'beacon': {
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), lam(d.color, 1.2));
        core.scale.y = 1.6;
        this.lights.push(core.material as THREE.MeshLambertMaterial);
        this.spinners.push({ o: core, speed: 1.2, axis: 'y' });
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 1.4, 60, 12, 1, true).translate(0, 30, 0),
          new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
        );
        g.add(core, beam);
        return g;
      }
      case 'fountain': {
        const water = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.2, 20), new THREE.MeshPhongMaterial({ color: 0x3fb6d8, shininess: 80, transparent: true, opacity: 0.85 }));
        const jet = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 10).translate(0, 1.5, 0), new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.55 }));
        g.add(water, jet);
        this.spinners.push({ o: jet, speed: 2, axis: 'y' });
        return g;
      }
      case 'umbrella': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4).translate(0, 1.2, 0), lam(0xeeeeee));
        const top = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.6, 10).translate(0, 2.5, 0), lam(d.color));
        const towel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 1.8).translate(0.9, 0.02, 0.4), lam(0xffffff));
        g.add(pole, top, towel);
        return g;
      }
      case 'dish': {
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3).translate(0, -1.5, 0), lam(0x8a94a8));
        const dish = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 8, 0, Math.PI * 2, 0, 0.9), new THREE.MeshLambertMaterial({ color: d.color, side: THREE.DoubleSide }));
        dish.rotation.x = -1.0;
        g.add(stand, dish);
        return g;
      }
      case 'sign': {
        const board = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.3), lam(0x1a1430));
        const glow = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 0.32), lam(d.color, 1.4));
        const glow2 = glow.clone();
        glow.position.y = 0.45;
        glow2.position.y = -0.45;
        this.lights.push(glow.material as THREE.MeshLambertMaterial);
        g.add(board, glow, glow2);
        return g;
      }
      case 'lamp': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5).translate(0, 2.5, 0), lam(0x3a3f55));
        const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1).translate(0.6, 5, 0), lam(0x3a3f55));
        const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.4).translate(1.1, 4.9, 0), lam(d.color, 0.3));
        this.lights.push(bulb.material as THREE.MeshLambertMaterial);
        g.add(pole, arm, bulb);
        return g;
      }
      case 'pipe': {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 14, 10).rotateZ(Math.PI / 2), lam(d.color));
        g.add(p);
        return g;
      }
      default:
        return null;
    }
  }

  update(dt: number, night: number, cam: THREE.Vector3): void {
    this.t += dt;
    for (const s of this.spinners) s.o.rotation[s.axis] += dt * s.speed;
    // Lampen leuchten nachts stärker
    for (const m of this.lights) m.emissiveIntensity = 0.3 + night * 1.6 + (m.emissiveIntensity > 1 ? 0 : 0);
    for (const c of this.group.children) c.visible = Math.abs(c.position.x - cam.x) < 700 && Math.abs(c.position.z - cam.z) < 700;
  }
}
