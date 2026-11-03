// Echte Kleidung über den gemeinsamen easygames-Figuren (wie in „Ich bin das Licht“): geglättete Stoffschicht über dem Grundkörper,
// dadurch verschwinden Muskeln; Schultern etwas schmaler – normale Menschen statt Muskelprotze.
import { T, cTex } from './engine.js';

const GARMENT = {
  long: ['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r'],
  tee: ['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r'],
  pants: ['pelvis', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r'],
  shorts: ['pelvis', 'thigh_l', 'thigh_r'],
  shoes: ['foot_l', 'foot_r', 'ball_l', 'ball_r']
};
const cache = {};
let TX = null;
function texs() {
  if (TX) return TX;
  const weave = cTex(256, 256, (g, w, h) => { g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(0,0,0,${0.03 + (y % 4 ? 0.03 : 0)})`; g.fillRect(0, y, w, 1); } for (let x = 0; x < w; x += 2) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x, 0, 1, h); } for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},.05)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 1); } }, [6, 6]);
  const denim = cTex(256, 256, (g, w, h) => { g.fillStyle = '#c8c8c8'; g.fillRect(0, 0, w, h); for (let i = -h; i < w; i += 3) { g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); } for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; g.fillRect(Math.random() * w, Math.random() * h, 1, 3); } }, [6, 6]);
  const knit = cTex(256, 256, (g, w, h) => { g.fillStyle = '#d0d0d0'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { g.fillStyle = 'rgba(0,0,0,.08)'; g.beginPath(); g.ellipse(x + 2, y + 4, 2, 4, 0.4, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 6, y + 4, 2, 4, -0.4, 0, 7); g.fill(); } }, [8, 8]);
  return (TX = { weave, denim, knit });
}
export function narrow(f, k) { const B = f.bones; for (const sd of ['l', 'r']) { if (B['clavicle_' + sd]) B['clavicle_' + sd].position.multiplyScalar(k); if (B['upperarm_' + sd]) B['upperarm_' + sd].position.multiplyScalar(0.5 + k / 2); } f.scene.updateMatrixWorld(true); }
function bodyMesh(f) { let b = null; f.scene.traverse(o => { if (o.isSkinnedMesh && o.material && o.material.userData && o.material.userData.u) b = o; }); return b; }
function garmentGeo(body, key, kind, offM, smooth) {
  const ck = key + '|' + kind + '|' + offM + '|' + smooth; if (cache[ck]) return cache[ck];
  const G = body.geometry, pos = G.attributes.position, nor = G.attributes.normal, si = G.attributes.skinIndex, sw = G.attributes.skinWeight, idx = G.index.array;
  const names = body.skeleton.bones.map(b => b.name), want = new Set(GARMENT[kind]);
  body.skeleton.bones[0].updateMatrixWorld(true);
  const Dm = new T.Matrix4().multiplyMatrices(body.skeleton.bones[0].matrixWorld, body.skeleton.boneInverses[0]).multiply(body.bindMatrix);
  const unit = Dm.getMaxScaleOnAxis() || 1, off = offM / unit, n = pos.count, dom = new Int16Array(n);
  for (let i = 0; i < n; i++) { let bw = -1, bi = 0; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; bi = si.getComponent(i, k); } } dom[i] = bi; }
  const keep = [];
  for (let t = 0; t < idx.length; t += 3) { let c = 0; for (let k = 0; k < 3; k++) if (want.has(names[dom[idx[t + k]]])) c++; if (c >= 2) keep.push(idx[t], idx[t + 1], idx[t + 2]); }
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), weld = new Int32Array(n), map = new Map();
  const rawGet = a => { const il = a.isInterleavedBufferAttribute, arr = il ? a.data.array : a.array, st = il ? a.data.stride : a.itemSize, of = il ? a.offset : 0; for (let i = 0; i < a.count; i++) { const v = arr[i * st + of]; if (v !== 0) return a.getX(i) === v; } return true; };
  const dq = a => !a.normalized || !rawGet(a) ? 1 : ({ Int8Array: 1 / 127, Uint8Array: 1 / 255, Int16Array: 1 / 32767, Uint16Array: 1 / 65535 })[a.array.constructor.name] || 1, kp = dq(pos), kn = dq(nor);
  for (let i = 0; i < n; i++) {
    P[i * 3] = pos.getX(i) * kp; P[i * 3 + 1] = pos.getY(i) * kp; P[i * 3 + 2] = pos.getZ(i) * kp; N[i * 3] = nor.getX(i) * kn; N[i * 3 + 1] = nor.getY(i) * kn; N[i * 3 + 2] = nor.getZ(i) * kn;
    const key2 = Math.round(P[i * 3] / unit * 2000) + ',' + Math.round(P[i * 3 + 1] / unit * 2000) + ',' + Math.round(P[i * 3 + 2] / unit * 2000); if (!map.has(key2)) map.set(key2, map.size); weld[i] = map.get(key2);
  }
  const W = map.size, nb = Array.from({ length: W }, () => new Set()), wp = new Float32Array(W * 3), wn = new Float32Array(W * 3), used = new Uint8Array(W);
  for (let i = 0; i < n; i++) { const w = weld[i]; wp[w * 3] = P[i * 3]; wp[w * 3 + 1] = P[i * 3 + 1]; wp[w * 3 + 2] = P[i * 3 + 2]; wn[w * 3] += N[i * 3]; wn[w * 3 + 1] += N[i * 3 + 1]; wn[w * 3 + 2] += N[i * 3 + 2]; }
  for (let t = 0; t < keep.length; t += 3) for (let k = 0; k < 3; k++) { const a = weld[keep[t + k]], b = weld[keep[t + (k + 1) % 3]]; nb[a].add(b); nb[b].add(a); used[a] = used[b] = 1; }
  const edge = new Uint8Array(W); { const ec = new Map(); for (let t = 0; t < keep.length; t += 3) for (let k = 0; k < 3; k++) { const a = weld[keep[t + k]], b = weld[keep[t + (k + 1) % 3]], kk = a < b ? a + '_' + b : b + '_' + a; ec.set(kk, (ec.get(kk) || 0) + 1); } for (const [kk, c] of ec) if (c === 1) { const [a, b] = kk.split('_'); edge[+a] = edge[+b] = 1; } }
  const tmp = new Float32Array(W * 3);
  for (let it = 0; it < smooth; it++) {
    for (let w = 0; w < W; w++) {
      if (!used[w] || edge[w] || !nb[w].size) { tmp[w * 3] = wp[w * 3]; tmp[w * 3 + 1] = wp[w * 3 + 1]; tmp[w * 3 + 2] = wp[w * 3 + 2]; continue; }
      let x = 0, y = 0, z = 0; for (const o of nb[w]) { x += wp[o * 3]; y += wp[o * 3 + 1]; z += wp[o * 3 + 2]; } const m = nb[w].size, lam = it % 2 ? -0.53 : 0.5;   // Taubin: glättet, ohne zu schrumpfen
      tmp[w * 3] = wp[w * 3] + lam * (x / m - wp[w * 3]); tmp[w * 3 + 1] = wp[w * 3 + 1] + lam * (y / m - wp[w * 3 + 1]); tmp[w * 3 + 2] = wp[w * 3 + 2] + lam * (z / m - wp[w * 3 + 2]);
    }
    wp.set(tmp);
  }
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const w = weld[i], l = Math.hypot(wn[w * 3], wn[w * 3 + 1], wn[w * 3 + 2]) || 1, o = edge[w] ? off * 0.6 : off; out[i * 3] = wp[w * 3] + wn[w * 3] / l * o; out[i * 3 + 1] = wp[w * 3 + 1] + wn[w * 3 + 1] / l * o; out[i * 3 + 2] = wp[w * 3 + 2] + wn[w * 3 + 2] / l * o; }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(out, 3)); g.setAttribute('uv', G.attributes.uv); g.setAttribute('skinIndex', si); g.setAttribute('skinWeight', sw);
  g.setIndex(keep); g.computeVertexNormals();
  return (cache[ck] = g);
}
function fabric(c, kind) {
  const t = texs(), col = new T.Color(c);
  if (kind === 'denim') return new T.MeshStandardMaterial({ color: col, roughness: 0.9, map: t.denim });
  if (kind === 'leather') return new T.MeshPhysicalMaterial({ color: col, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.35 });
  if (kind === 'knit') return new T.MeshStandardMaterial({ color: col, roughness: 0.95, map: t.knit });
  if (kind === 'jacket') return new T.MeshPhysicalMaterial({ color: col, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.5, sheen: 0.4, sheenColor: col.clone().multiplyScalar(0.6), map: t.weave });
  return new T.MeshStandardMaterial({ color: col, roughness: 0.85, map: t.weave });
}
export function clothe(f) {
  const L = f.look, body = bodyMesh(f); if (!body) return;
  const spec = [];
  spec.push([L.topStyle === 'tee' ? 'tee' : 'long', L.top, L.fab || 'cotton', L.coat ? 0.012 : 0.016, 30]);
  if (L.coat) spec.push(['long', L.coat, L.coatFab || 'jacket', 0.026, 34]);
  spec.push([L.bottomStyle === 'shorts' ? 'shorts' : 'pants', L.bottom, L.botFab || 'denim', 0.014, 18]);
  spec.push(['shoes', L.shoes || '#222', 'leather', 0.009, 4]);
  const key = L.body || 'm';
  for (const [kind, color, fab, off, sm] of spec) {
    const m = new T.SkinnedMesh(garmentGeo(body, key, kind, off, sm), fabric(color, fab));
    m.bind(body.skeleton, body.bindMatrix); m.position.copy(body.position); m.quaternion.copy(body.quaternion); m.scale.copy(body.scale);
    m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; body.parent.add(m); f.mats.push(m.material);
  }
}
