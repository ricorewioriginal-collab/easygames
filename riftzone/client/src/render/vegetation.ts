// Gras und Blumen rund um die Kamera (nur Darstellung, keine Kollision). Kacheln werden wiederverwendet.
import * as THREE from 'three';
import { WATER_LEVEL } from '../../../shared/src/constants';
import { Biome, type Terrain } from '../../../shared/src/terrain';
import { Rng } from '../../../shared/src/math';
import type { World } from '../../../shared/src/world';

const TILE = 24;
const RADIUS = 2; // Kacheln um die Kamera

function grassGeometry(): THREE.BufferGeometry {
  // Drei gekreuzte, nach oben verjüngte Halme
  const pos: number[] = [];
  const col: number[] = [];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI;
    const cx = Math.cos(a) * 0.18,
      cz = Math.sin(a) * 0.18;
    pos.push(-cx, 0, -cz, cx, 0, cz, 0, 0.55, 0);
    col.push(0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 1, 1, 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return g;
}

export class Vegetation {
  readonly group = new THREE.Group();
  private readonly mat: THREE.MeshLambertMaterial;
  private readonly geo = grassGeometry();
  private readonly tiles = new Map<string, THREE.InstancedMesh>();
  private readonly pool: THREE.InstancedMesh[] = [];
  private readonly uniforms = { time: { value: 0 } };
  density = 0.8;
  private readonly perTile = 420;

  constructor(private readonly terrain: Terrain, private readonly world: World) {
    this.mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    this.mat.onBeforeCompile = (sh) => {
      sh.uniforms.time = this.uniforms.time;
      sh.vertexShader = 'uniform float time;\n' + sh.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vec4 wp = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
         float sway = sin(time * 1.7 + wp.x * 0.35 + wp.z * 0.27) * 0.12 * position.y;
         transformed.x += sway; transformed.z += sway * 0.6;`,
      );
    };
  }

  private fill(mesh: THREE.InstancedMesh, tx: number, tz: number): void {
    const rng = new Rng((tx * 73856093) ^ (tz * 19349663));
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const q = new THREE.Quaternion();
    const yAxis = new THREE.Vector3(0, 1, 0);
    let n = 0;
    const count = Math.floor(this.perTile * this.density);
    for (let i = 0; i < count; i++) {
      const x = tx * TILE + rng.next() * TILE,
        z = tz * TILE + rng.next() * TILE;
      const h = this.terrain.height(x, z);
      if (h < WATER_LEVEL + 0.3) continue;
      const b = this.terrain.biome(x, z, h, 0);
      if (b !== Biome.Meadow && b !== Biome.Forest && b !== Biome.Farm) continue;
      // nicht in Gebäuden
      const g = this.world.groundAt(x, z, 0.1, h + 0.3);
      if (g.piece >= 0) continue;
      const s = 0.6 + rng.next() * 0.9;
      q.setFromAxisAngle(yAxis, rng.next() * Math.PI);
      m.compose(new THREE.Vector3(x, h - 0.05, z), q, new THREE.Vector3(s, s * (0.8 + rng.next() * 0.7), s));
      mesh.setMatrixAt(n, m);
      const flower = rng.chance(0.06);
      if (flower) c.setHex(rng.pick([0xff6b9a, 0xffe14a, 0xffffff, 0x9a7bff]));
      else if (b === Biome.Farm) c.setRGB(0.75, 0.82, 0.32);
      else c.setRGB(0.36 + rng.next() * 0.1, 0.66 + rng.next() * 0.12, 0.26);
      mesh.setColorAt(n, c);
      n++;
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }

  update(dt: number, cam: THREE.Vector3): void {
    this.uniforms.time.value += dt;
    this.group.visible = this.density > 0;
    if (this.density <= 0) return;
    const ctx = Math.floor(cam.x / TILE),
      ctz = Math.floor(cam.z / TILE);
    const want = new Set<string>();
    for (let dz = -RADIUS; dz <= RADIUS; dz++) for (let dx = -RADIUS; dx <= RADIUS; dx++) want.add(`${ctx + dx},${ctz + dz}`);
    for (const [k, m] of this.tiles) {
      if (!want.has(k)) {
        this.tiles.delete(k);
        m.visible = false;
        this.pool.push(m);
      }
    }
    let built = 0;
    for (const k of want) {
      if (this.tiles.has(k) || built >= 2) continue;
      const [x, z] = k.split(',').map(Number) as [number, number];
      const m = this.pool.pop() ?? this.newMesh();
      this.fill(m, x, z);
      m.visible = true;
      this.tiles.set(k, m);
      built++;
    }
  }

  private newMesh(): THREE.InstancedMesh {
    const m = new THREE.InstancedMesh(this.geo, this.mat, this.perTile);
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  reset(): void {
    for (const [k, m] of this.tiles) {
      this.tiles.delete(k);
      m.visible = false;
      this.pool.push(m);
    }
  }
}
