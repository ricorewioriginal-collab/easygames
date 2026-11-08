/** Gelände-Mesh mit Textur-Mischung (Sand, Gras, Fels, Erdwege) – Lichter, Schatten und Nebel bleiben vom Standardmaterial */
import * as THREE from 'three';
import { height, landMask, ROADS, WORLD_HALF, ground } from './island';
import { fbm, smooth } from './noise';
import { T } from './textures';

export function buildTerrain(quality: number): { mesh: THREE.Mesh; heightTex: THREE.DataTexture } {
  const N = [150, 230, 300][quality] ?? 230,
    S = WORLD_HALF * 2,
    step = S / N;
  const verts = (N + 1) * (N + 1);
  const pos = new Float32Array(verts * 3),
    col = new Float32Array(verts * 3),
    w = new Float32Array(verts * 3);
  const hs = new Float32Array(verts);
  for (let j = 0; j <= N; j++)
    for (let i = 0; i <= N; i++) {
      const k = j * (N + 1) + i,
        x = -WORLD_HALF + i * step,
        z = -WORLD_HALF + j * step,
        h = height(x, z);
      hs[k] = h;
      pos.set([x, h, z], k * 3);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const idx: number[] = [];
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const a = j * (N + 1) + i,
        b = a + 1,
        c = a + N + 1,
        d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  for (let k = 0; k < verts; k++) {
    const x = pos[k * 3],
      z = pos[k * 3 + 2],
      h = hs[k],
      ny = nor.getY(k);
    const g = ground(x, z, h);
    const steep = smooth(0.86, 0.7, ny);
    let sand = h < 2.6 || landMask(x, z) < 0.42 ? smooth(4.2, 1.8, h) : 0;
    let rock = Math.max(steep, g === 'rock' || g === 'ash' ? 1 : 0, h < -1 ? 0.3 : 0);
    sand = Math.max(0, sand - rock);
    const grass = Math.max(0, 1 - sand - rock);
    w.set([sand, grass, rock], k * 3);
    // Farbton: Dschungel dunkler, Asche dunkelgrau, nasser Sand dunkler, Variation
    const v = 0.88 + fbm(x * 0.05, z * 0.05, 2) * 0.24;
    let r = v,
      gg = v,
      b = v;
    if (g === 'jungle') {
      r *= 0.62;
      gg *= 0.78;
      b *= 0.6;
    }
    if (g === 'ash') {
      r *= 0.45;
      gg *= 0.42;
      b *= 0.42;
    }
    const wet = smooth(1.1, 0.2, h);
    r *= 1 - wet * 0.35;
    gg *= 1 - wet * 0.32;
    b *= 1 - wet * 0.25;
    col.set([r, gg, b], k * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aW', new THREE.BufferAttribute(w, 3));

  // Wege-Maske (Canvas), scharf statt an Gitterpunkte gebunden
  const M = 1024,
    cv = document.createElement('canvas');
  cv.width = cv.height = M;
  const cx = cv.getContext('2d')!,
    sc = M / S;
  cx.fillStyle = '#000';
  cx.fillRect(0, 0, M, M);
  cx.strokeStyle = '#fff';
  cx.lineCap = cx.lineJoin = 'round';
  cx.filter = 'blur(2px)';
  for (const r of ROADS) {
    cx.lineWidth = 5.2 * sc;
    cx.beginPath();
    r.forEach(([x, z], i) => (i ? cx.lineTo : cx.moveTo).call(cx, (x + WORLD_HALF) * sc, (z + WORLD_HALF) * sc));
    cx.stroke();
  }
  // Marktplatz gepflastert
  cx.fillStyle = '#fff';
  cx.beginPath();
  cx.arc(WORLD_HALF * sc, (150 + WORLD_HALF) * sc, 17 * sc, 0, 7);
  cx.fill();
  const roadTex = new THREE.CanvasTexture(cv);
  roadTex.colorSpace = THREE.NoColorSpace;

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
  const uni = {
    tSand: { value: T.sand() },
    tGrass: { value: T.grass() },
    tRock: { value: T.rock() },
    tDirt: { value: T.dirt() },
    tRoad: { value: roadTex },
    uHalf: { value: WORLD_HALF },
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uni);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aW;\nvarying vec3 vW;\nvarying vec2 vXZ;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvW = aW;\nvXZ = (modelMatrix * vec4(transformed, 1.0)).xz;');
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform sampler2D tSand, tGrass, tRock, tDirt, tRoad;\nuniform float uHalf;\nvarying vec3 vW;\nvarying vec2 vXZ;\n' +
          'vec3 tri(sampler2D t, vec2 p){ return mix(texture2D(t, p * 0.16).rgb, texture2D(t, p * 0.037 + 0.31).rgb, 0.4); }',
      )
      .replace(
        '#include <map_fragment>',
        `vec3 cs = tri(tSand, vXZ), cg = tri(tGrass, vXZ), cr = tri(tRock, vXZ * 0.7), cd = tri(tDirt, vXZ);
         vec3 wsum = vW / max(0.001, vW.x + vW.y + vW.z);
         vec3 base = cs * wsum.x + cg * wsum.y + cr * wsum.z;
         float road = texture2D(tRoad, (vXZ + uHalf) / (2.0 * uHalf)).r * (1.0 - wsum.z * 0.7);
         base = mix(base, cd, smoothstep(0.25, 0.7, road));
         diffuseColor.rgb *= base;`,
      );
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';

  // Höhen-Textur für Wasser (Uferschaum, Flachwasser)
  const HT = 256,
    data = new Uint8Array(HT * HT * 4);
  for (let j = 0; j < HT; j++)
    for (let i = 0; i < HT; i++) {
      const x = -WORLD_HALF + (i + 0.5) * (S / HT),
        z = -WORLD_HALF + (j + 0.5) * (S / HT);
      const v = Math.max(0, Math.min(255, ((height(x, z) + 14) / 40) * 255));
      data.set([v, v, v, 255], (j * HT + i) * 4);
    }
  const heightTex = new THREE.DataTexture(data, HT, HT);
  heightTex.magFilter = heightTex.minFilter = THREE.LinearFilter;
  heightTex.needsUpdate = true;
  return { mesh, heightTex };
}
