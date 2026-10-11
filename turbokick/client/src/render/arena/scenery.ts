import * as THREE from 'three';
import { ARENA } from '@shared/sim/types';
import type { Rng } from '@shared/rng';
import { Batch } from './geometry';
import { attachPointScale, glowMaterial, groundMaterial, pointsMaterial, sceneryMaterial, skyMaterial } from './shaders';
import type { ArenaUniforms } from './shaders';
import type { ArenaTheme, Palette } from './themes';

/** Himmel, Boden, Skyline/Eis/Felsen, Flutlichtmasten, Fackeln – alles statisch (nur wenige Zeichenaufrufe) */
export class SceneryView {
  readonly group = new THREE.Group();
  private geos: THREE.BufferGeometry[] = [];
  private mats: THREE.Material[] = [];

  constructor(theme: ArenaTheme, u: ArenaUniforms, pal: Palette, rng: Rng) {
    const mode = theme === 'neon' ? 0 : theme === 'eis' ? 1 : 2;
    const track = <T extends THREE.BufferGeometry>(g: T): T => {
      this.geos.push(g);
      return g;
    };
    const trackM = <T extends THREE.Material>(m: T): T => {
      this.mats.push(m);
      return m;
    };

    // Himmelskuppel: folgt der Kamera, liegt per Shader immer am Tiefenende
    const sky = new THREE.Mesh(track(new THREE.SphereGeometry(100, 32, 18)), trackM(skyMaterial(u, pal, mode)));
    sky.frustumCulled = false;
    sky.renderOrder = -100;
    sky.onBeforeRender = (_r, _s, cam): void => {
      sky.position.copy(cam.position);
    };
    this.group.add(sky);

    // Boden der Umgebung
    const ground = new THREE.Mesh(track(new THREE.CircleGeometry(1100, 64).rotateX(-Math.PI / 2)), trackM(groundMaterial(u, pal, mode)));
    ground.position.y = -0.06;
    this.group.add(ground);

    // Skyline / Kristalle / Felsen
    const far = new Batch();
    if (theme === 'neon') {
      const cols = [0x0a0b22, 0x0d1030, 0x150a30, 0x0b1428];
      for (let i = 0; i < 90; i++) {
        const a = (i / 90) * Math.PI * 2 + rng.float(-0.03, 0.03);
        const rad = rng.float(165, 380);
        const h = (30 + rng.next() * rng.next() * 190) * (0.7 + (rad - 165) / 380);
        const w = rng.float(12, 38);
        const x = Math.cos(a) * rad;
        const z = Math.sin(a) * rad;
        const col = rng.pick(cols);
        const seed = rng.next() * 10;
        far.box(x, h / 2 - 1, z, w, h + 2, rng.float(12, 34), col, [seed, h], a + rng.float(-0.3, 0.3));
        if (rng.chance(0.3)) far.box(x, h + 6, z, 1.2, 12, 1.2, col, [seed, h + 12], 0);
        if (rng.chance(0.25)) far.box(x, h + 2, z, w * 0.6, 4, w * 0.6, col, [seed + 1, h + 4], a);
      }
    } else if (theme === 'eis') {
      const cols = [0x9fd2f0, 0x6fb4e4, 0xcfeaff, 0x4d90c8];
      for (let i = 0; i < 70; i++) {
        const a = rng.float(0, Math.PI * 2);
        const rad = rng.float(175, 360);
        const h = rng.float(30, 150) * (0.8 + (rad - 175) / 400);
        const w = rng.float(9, 26);
        const geo = new THREE.CylinderGeometry(w * rng.float(0, 0.12), w, h, 6, 1);
        const x = Math.cos(a) * rad;
        const z = Math.sin(a) * rad;
        far.place(geo, x, h / 2 - 2, z, rng.float(-0.12, 0.12), rng.float(0, 6), rng.float(-0.14, 0.14), 1, rng.pick(cols));
        if (rng.chance(0.6)) {
          const g2 = new THREE.CylinderGeometry(0, w * 0.55, h * 0.6, 6, 1);
          far.place(g2, x + rng.float(-14, 14), h * 0.3 - 2, z + rng.float(-14, 14), rng.float(-0.3, 0.3), rng.float(0, 6), rng.float(-0.3, 0.3), 1, rng.pick(cols));
        }
      }
    } else {
      const cols = [0xa84a22, 0xc5622c, 0x8a3a1c, 0xd98038];
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2 + rng.float(-0.05, 0.05);
        const rad = rng.float(150, 390);
        const h = rng.float(28, 130) * (0.8 + (rad - 150) / 500);
        const w = rng.float(26, 70);
        const geo = new THREE.CylinderGeometry(w * rng.float(0.55, 0.8), w, h, 7, 1);
        const x = Math.cos(a) * rad;
        const z = Math.sin(a) * rad;
        far.place(geo, x, h / 2 - 2, z, 0, rng.float(0, 6), 0, [rng.float(0.8, 1.3), 1, rng.float(0.8, 1.3)], rng.pick(cols));
        if (rng.chance(0.5)) {
          const g2 = new THREE.CylinderGeometry(w * 0.3, w * 0.5, h * 0.55, 6, 1);
          far.place(g2, x + rng.float(-w, w), h * 0.27 - 2, z + rng.float(-w, w), 0, rng.float(0, 6), 0, 1, rng.pick(cols));
        }
      }
    }
    if (!far.empty) {
      const m = new THREE.Mesh(track(far.build()), trackM(sceneryMaterial(u, pal, mode)));
      m.frustumCulled = false;
      this.group.add(m);
    }

    // Eis-Dom: Kuppelgitter über dem Stadion
    if (theme === 'eis') {
      const wf = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(150, 2));
      track(wf);
      const lm = trackM(new THREE.LineBasicMaterial({ color: pal.lineB, transparent: true, opacity: 0.22 }));
      const dome = new THREE.LineSegments(wf, lm);
      dome.position.y = -2;
      dome.frustumCulled = false;
      this.group.add(dome);
    }

    // Flutlichtmasten in den vier Ecken
    const mast = new Batch();
    const lamps = new Batch();
    const beams = new Batch();
    const mastCol = new THREE.Color(pal.mast);
    const lampCol = new THREE.Color(pal.lamp).multiplyScalar(1.6);
    const beamCol = new THREE.Color(pal.beam);
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const down = new THREE.Vector3(0, -1, 0);
    const dir = new THREE.Vector3();
    const H = 50;
    const beamLen = 118;
    const cone = new THREE.ConeGeometry(19, beamLen, 22, 1, true).translate(0, -beamLen / 2, 0);
    const cx = ARENA.halfWidth + 26;
    const cz = ARENA.halfLength + ARENA.goalDepth + 22;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const x = sx * cx;
        const z = sz * cz;
        mast.box(x, H / 2, z, 1.6, H, 1.6, mastCol);
        mast.box(x, 2, z, 4, 4, 4, mastCol);
        const yaw = Math.atan2(-x, -z);
        mast.box(x, H + 0.3, z, 10, 6.6, 0.8, mastCol, undefined, yaw);
        for (let ry = 0; ry < 2; ry++) {
          for (let rx = -2; rx <= 2; rx++) {
            const ox = Math.cos(yaw) * rx * 1.8;
            const oz = -Math.sin(yaw) * rx * 1.8;
            lamps.box(x + ox + Math.sin(yaw) * 0.55, H - 1.4 + ry * 2.6 + 0.3, z + oz + Math.cos(yaw) * 0.55, 1.4, 1.8, 0.3, lampCol, undefined, yaw);
          }
        }
        dir.set(-x, -(H + 0.3), -z).normalize();
        q.setFromUnitVectors(down, dir);
        e.setFromQuaternion(q);
        beams.place(cone, x + Math.sin(yaw) * 0.9, H + 0.3, z + Math.cos(yaw) * 0.9, e.x, e.y, e.z, 1, beamCol);
      }
    }
    track(cone);
    const mastMesh = new THREE.Mesh(track(mast.build()), trackM(sceneryMaterial(u, pal, 3)));
    mastMesh.frustumCulled = false;
    const lampMesh = new THREE.Mesh(track(lamps.build()), trackM(glowMaterial(u, 0, 1)));
    const beamMesh = new THREE.Mesh(track(beams.build()), trackM(glowMaterial(u, 1, 1, pal.beamAlpha)));
    beamMesh.renderOrder = 1;
    beamMesh.frustumCulled = false;
    this.group.add(mastMesh, lampMesh, beamMesh);

    // Canyon: Fackeln rund um die Tribünen
    if (theme === 'canyon') {
      const posts = new Batch();
      const flames: number[] = [];
      const fcols: number[] = [];
      const fsize: number[] = [];
      const fph: number[] = [];
      const spots: Array<[number, number]> = [];
      const sx = ARENA.halfWidth + 3.5 + 10 * 1.25 + 4;
      const sz = ARENA.halfLength + ARENA.goalDepth + 3.5 + 8 * 1.25 + 4;
      for (let z = -sz + 6; z <= sz - 6; z += 13) {
        spots.push([-sx, z], [sx, z]);
      }
      for (let x = -sx + 14; x <= sx - 14; x += 14) spots.push([x, -sz], [x, sz]);
      const dark = new THREE.Color(0x2a140c);
      const c = new THREE.Color();
      for (const [x, z] of spots) {
        posts.box(x, 2.2, z, 0.3, 4.4, 0.3, dark);
        posts.box(x, 4.5, z, 0.9, 0.5, 0.9, dark);
        for (let k = 0; k < 6; k++) {
          flames.push(x + rng.float(-0.25, 0.25), 5.0 + rng.float(0, 0.9), z + rng.float(-0.25, 0.25));
          c.setRGB(1.0, 0.45 + rng.next() * 0.3, 0.1).multiplyScalar(rng.float(1.0, 1.7));
          fcols.push(c.r, c.g, c.b);
          fsize.push(rng.float(0.9, 1.7));
          fph.push(rng.next());
        }
        flames.push(x, 5.4, z);
        fcols.push(0.5, 0.2, 0.04);
        fsize.push(7);
        fph.push(rng.next());
      }
      const pm = new THREE.Mesh(track(posts.build()), trackM(sceneryMaterial(u, pal, 3)));
      pm.frustumCulled = false;
      this.group.add(pm);
      const fg = track(new THREE.BufferGeometry());
      fg.setAttribute('position', new THREE.Float32BufferAttribute(flames, 3));
      fg.setAttribute('color', new THREE.Float32BufferAttribute(fcols, 3));
      fg.setAttribute('size', new THREE.Float32BufferAttribute(fsize, 1));
      fg.setAttribute('phase', new THREE.Float32BufferAttribute(fph, 1));
      const fp = new THREE.Points(fg, trackM(pointsMaterial(u, { flicker: true })));
      fp.frustumCulled = false;
      attachPointScale(fp, u);
      this.group.add(fp);
    }
  }

  dispose(): void {
    for (const g of this.geos) g.dispose();
    for (const m of this.mats) m.dispose();
    this.group.removeFromParent();
  }
}
