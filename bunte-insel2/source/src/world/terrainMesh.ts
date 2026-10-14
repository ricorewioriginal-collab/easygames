/* Gelände-Mesh einer Insel aus der Höhenfunktion: Raster, Vertexfarben (Wiese, Strand, Fels, Wege), Schaumkranz am Ufer. */
import { hash2 } from '../core/math.ts';
import { globalUniforms, mats } from '../engine/materials.ts';
import { type IslandShape, islandColor, maxExtent } from './terrain.ts';

const _c = new THREE.Color();

export function buildTerrainMesh(s: IslandShape, height: (x: number, z: number) => number, step: number): THREE.Mesh {
  const E = maxExtent(s) + 20;
  const n = Math.ceil((E * 2) / step) + 1;
  const x0 = s.x - E, z0 = s.z - E;
  const H = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) H[j * n + i] = height(x0 + i * step, z0 + j * step);
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const vid = new Int32Array(n * n).fill(-1);
  const use = (i: number, j: number): number => {
    const k = j * n + i;
    if (vid[k] >= 0) return vid[k];
    const x = x0 + i * step, z = z0 + j * step, y = H[k];
    const hx = H[j * n + Math.min(n - 1, i + 1)] - H[j * n + Math.max(0, i - 1)];
    const hz = H[Math.min(n - 1, j + 1) * n + i] - H[Math.max(0, j - 1) * n + i];
    const slope = Math.hypot(hx, hz) / (2 * step);
    _c.setHex(islandColor(s, x, z, y, slope));
    const v = 0.94 + hash2(x * 3.1, z * 2.7) * 0.1;
    _c.multiplyScalar(v);
    vid[k] = pos.length / 3;
    pos.push(x, y, z); col.push(_c.r, _c.g, _c.b);
    return vid[k];
  };
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
    const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
    if (H[a] < -4.5 && H[b] < -4.5 && H[c] < -4.5 && H[d] < -4.5) continue;
    const ia = use(i, j), ib = use(i + 1, j), ic = use(i, j + 1), id = use(i + 1, j + 1);
    idx.push(ia, ic, ib, ib, ic, id);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  const m = new THREE.Mesh(g, mats().terrain);
  m.receiveShadow = true;
  m.name = 'terrain:' + s.id;
  return m;
}

let foamMat: THREE.ShaderMaterial | null = null;
function getFoamMat(): THREE.ShaderMaterial {
  if (foamMat) return foamMat;
  foamMat = new THREE.ShaderMaterial({
    uniforms: { uTime: globalUniforms.uTime },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float uTime; varying vec2 vUv; void main(){ float r = vUv.y; float w = 0.5 + 0.5 * sin(uTime * 1.6 + vUv.x * 60.0); float a = smoothstep(0.0, 0.35, r) * smoothstep(1.0, 0.55, r) * (0.35 + 0.35 * w); gl_FragColor = vec4(1.0, 1.0, 1.0, a); }',
    transparent: true, depthWrite: false
  });
  return foamMat;
}
/** Schaumkranz entlang der Uferlinie (Kreise der Insel). */
export function buildFoam(s: IslandShape): THREE.Group {
  const g = new THREE.Group();
  const circles = [{ x: s.x, z: s.z, r: s.r }, ...(s.lobes ?? [])];
  for (const c of circles) {
    const segs = Math.max(48, Math.round(c.r * 1.2));
    const geo = new THREE.BufferGeometry();
    const p: number[] = [], uv: number[] = [], ix: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      p.push(c.x + ca * (c.r + 0.4), 0.06, c.z + sa * (c.r + 0.4), c.x + ca * (c.r + 4.5), 0.06, c.z + sa * (c.r + 4.5));
      uv.push(i / segs, 0, i / segs, 1);
      if (i < segs) { const k = i * 2; ix.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(ix);
    const m = new THREE.Mesh(geo, getFoamMat());
    m.renderOrder = 2;
    g.add(m);
  }
  return g;
}
