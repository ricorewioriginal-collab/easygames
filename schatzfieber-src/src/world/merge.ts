/** Statische Meshes nach Material zusammenführen (viel weniger Draw-Calls, wichtig fürs Handy) */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function norm(g: THREE.BufferGeometry, m: THREE.Matrix4): THREE.BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g.clone();
  if (!n.attributes.normal) n.computeVertexNormals();
  if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
  for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
  n.applyMatrix4(m);
  return n;
}
function slice(g: THREE.BufferGeometry, start: number, count: number): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry();
  for (const k of ['position', 'normal', 'uv']) {
    const a = g.attributes[k] as THREE.BufferAttribute;
    out.setAttribute(k, new THREE.BufferAttribute((a.array as Float32Array).slice(start * a.itemSize, (start + count) * a.itemSize), a.itemSize));
  }
  return out;
}

/** Alle Meshes unter root (außer userData.dyn-Zweigen) werden pro Material zu je einem Mesh zusammengeführt */
export function mergeStatic(root: THREE.Object3D, shadows: boolean): THREE.Group {
  root.updateMatrixWorld(true);
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const keep: THREE.Object3D[] = [];
  const walk = (o: THREE.Object3D) => {
    if (o.userData.dyn || (o as THREE.Light).isLight) {
      keep.push(o);
      return;
    }
    const m = o as THREE.Mesh;
    if (m.isMesh && !(m as unknown as THREE.InstancedMesh).isInstancedMesh) {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const g = norm(m.geometry, m.matrixWorld);
      if (Array.isArray(m.material) && g.groups.length) {
        for (const gr of g.groups) {
          const mat = mats[gr.materialIndex ?? 0];
          if (!buckets.has(mat)) buckets.set(mat, []);
          buckets.get(mat)!.push(slice(g, gr.start, Math.min(gr.count, g.attributes.position.count - gr.start)));
        }
      } else {
        if (!buckets.has(mats[0])) buckets.set(mats[0], []);
        g.clearGroups();
        buckets.get(mats[0])!.push(g);
      }
    }
    for (const c of o.children) walk(c);
  };
  walk(root);
  const out = new THREE.Group();
  for (const [mat, list] of buckets) {
    const g = mergeGeometries(list);
    list.forEach((x) => x.dispose());
    if (!g) continue;
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = shadows && !(mat as THREE.MeshBasicMaterial).transparent;
    mesh.receiveShadow = true;
    out.add(mesh);
  }
  // dynamische Teile mit ihrer Weltlage übernehmen
  for (const o of keep) {
    const wm = o.matrixWorld.clone();
    o.removeFromParent();
    wm.decompose(o.position, o.quaternion, o.scale);
    out.add(o);
  }
  return out;
}
