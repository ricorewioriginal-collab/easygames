/* Echte Natur: Bäume, Büsche, Felsen und Pflanzen von Poly Haven (CC0), aufbereitet mit tools/make-zotik-polyhaven.mjs → models/ph/ph.glb (PC/TV: ph-hi.glb).
   Jeder Baum hat einen echten Stamm (Netz) und eine Krone aus „Astkarten“ (Bilder der Originalzweige), dazu eine Fernansicht aus zwei gekreuzten Flächen.
   place(par, list, o): viele Teile als Instanzen. Nur was nahe an der Kamera steht, wird als volles Modell gezeichnet (je Art ein Zeichenaufruf),
   alle fernen Bäume zusammen in EINEM Aufruf aus dem gemeinsamen Fern-Atlas; kleine Pflanzen verschwinden in der Ferne.
     list = [{ k, x, y, z, ry, h (Zielhöhe), w (größte Breite), box: [Breite, Höhe] (verzerrt einpassen, für Felsen), s (Faktor), tint, tintAll, mix }]
     o = { mix: 0..1 Blätter umfärben statt nur tönen (Fantasiewelten), glow: Eigenleuchten der Blätter (Nachtwelten), gain: Helligkeit }
   Bis die Datei geladen ist, bleibt die Gruppe leer – nichts hängt davon ab. */
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createNat({ T, TOUCH, hi }) {
  const RN = TOUCH ? 30 : 52, RS = TOUCH ? 26 : 44, RB = TOUCH ? 70 : 120, U = { value: 0 }, GR = new Set();
  let pack = null, range = 1;
  const load = () => pack || (pack = new Promise((res, rej) => new GLTFLoader().load('models/ph/ph' + (hi ? '-hi' : '') + '.glb', res, null, rej)).then(g => {
    const m = {}; g.scene.updateMatrixWorld(true);
    for (const c of g.scene.children) { if (c.name === 'far_atlas') { c.traverse(o => { if (o.isMesh) m._far = o.material; }); continue; } if (!/^p_/.test(c.name)) continue;
      const inv = new T.Matrix4().copy(c.matrixWorld).invert(), parts = [];
      c.traverse(o => { if (o.isMesh) parts.push({ geo: o.geometry, mat: o.material, loc: new T.Matrix4().multiplyMatrices(inv, o.matrixWorld), leaf: o.material.alphaTest > 0 }); });
      const b = new T.Box3().setFromObject(c); m[c.name.slice(2)] = { parts, h: Math.max(.02, b.max.y), w: Math.max(.02, b.max.x - b.min.x, b.max.z - b.min.z), far: c.userData.far || null }; }
    return m; }));
  /* Blattmaterial: Normalen nicht umklappen (Karten sind von beiden Seiten gleich hell), Karten fast von der Kante her ausblenden, leichtes Wiegen im Wind, umfärben.
     far: Fernansicht – Ausschnitt im Atlas und Umfärbung kommen je Instanz (uvo, amix) */
  function leafMat(src, o, far) {
    const m = src.clone(), mix = { value: o.mix || 0 }, gain = { value: o.gain || 1.35 }, glow = { value: Math.max(.1, o.glow || 0) };
    m.onBeforeCompile = sh => { sh.uniforms.uTime = U; sh.uniforms.uMix = mix; sh.uniforms.uGain = gain; sh.uniforms.uGlow = glow;
      sh.vertexShader = 'uniform float uTime;\n' + (far ? 'attribute vec4 uvo; attribute float amix; varying float vMix;\n' : '') + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
  { vec3 wq = position;
  #ifdef USE_INSTANCING
    wq = (instanceMatrix * vec4(position, 1.0)).xyz;
  #endif
    float sw = sin(uTime * 1.3 + wq.x * .31 + wq.z * .27) + .5 * sin(uTime * 2.1 + wq.z * .7 + wq.y);
    transformed.x += sw * ${far ? '.012 * (position.y + 1.0)' : '.006 * position.y'}; transformed.z += sw * ${far ? '.008 * (position.y + 1.0)' : '.004 * position.y'}; }`)
        .replace('#include <uv_vertex>', far ? '#include <uv_vertex>\n  vUv = uvo.xy + uv * uvo.zw; vMix = amix;' : '#include <uv_vertex>');
      sh.fragmentShader = 'uniform float uMix; uniform float uGain; uniform float uGlow;\n' + (far ? 'varying float vMix;\n' : '') + sh.fragmentShader
        .replace('#include <map_fragment>', `#include <map_fragment>
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(.3, .59, .11)) * 2.6), ${far ? 'vMix' : 'uMix'}) * uGain;`)
        .replace('#include <normal_fragment_begin>', (far ? '' : `{ vec3 gN = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition))); if (abs(dot(gN, normalize(vViewPosition))) < .2) discard;
    /* Laub direkt vor der Kamera löst sich auf (gerastert), statt als riesige unscharfe Fläche das Bild zu füllen */
    float nd = (vViewPosition.z - 2.4) / 2.0; if (nd < 1.0 && nd < fract(dot(floor(gl_FragCoord.xy), vec2(.7548, .5698)))) discard; }
  `) + 'float faceDirection = 1.0; vec3 normal = normalize(normalize(vNormal) + (viewMatrix * vec4(0.0, .65, 0.0, 0.0)).xyz); vec3 geometryNormal = normal;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * uGlow;'); };
    m.customProgramCacheKey = () => far ? 'natF' : 'natN'; return m;
  }
  /* Fernansicht: zwei gekreuzte Flächen, Kantenlänge 2 um den Ursprung (Blick entlang x: rechts = −z, Blick entlang z: rechts = +x) */
  const farGeo = () => { const g = new T.BufferGeometry(), P = [], N = [], V = [];
    [[[0, 0, -1], 0], [[1, 0, 0], .5]].forEach(([u, u0]) => { for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { P.push(u[0] * a, b, u[2] * a); N.push(0, 1, 0); V.push(u0 + (a < 0 ? 0 : .5), b < 0 ? 0 : 1); } });
    g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(V, 2)); g.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]); return g; };
  const _o = new T.Object3D(), _m = new T.Matrix4(), _c = new T.Color(), _f = new T.Matrix4();
  function place(par, list, o = {}) {
    const grp = new T.Group(); grp.name = 'nat'; par.add(grp); if (!list.length) return grp;
    load().then(M => {
      if (!grp.parent) return;
      const keys = new Map(), items = [];
      for (const q of list) { const A = M[q.k]; if (!A) continue; const mix = q.mix ?? o.mix ?? 0, id = q.k + '|' + mix; let K = keys.get(id); if (!K) keys.set(id, K = { A, mix, items: [] });
        let sx, sy; if (q.box) { sx = q.box[0] / A.w; sy = q.box[1] / A.h; } else sx = sy = (q.h || q.w) ? Math.min(q.h ? q.h / A.h : 1e9, q.w ? q.w / A.w : 1e9) * (q.s || 1) : q.s || 1;
        _o.position.set(q.x, q.y || 0, q.z); _o.rotation.set(0, q.ry || 0, 0); _o.scale.set(sx, sy, sx); _o.updateMatrix();
        const it = { K, x: q.x, z: q.z, m: _o.matrix.clone(), col: q.tint ?? 0xffffff, all: q.tintAll, near: false, r: A.far ? RN : A.h * sy > 1.8 ? RB : RS, mix };
        if (A.far) { const F = A.far; it.fm = new T.Matrix4().multiplyMatrices(it.m, _f.makeTranslation(F.ax[0], F.cy, F.ax[1]).multiply(new T.Matrix4().makeScale(F.hs, F.hs, F.hs))); it.uv = F.uv; }
        K.items.push(it); items.push(it); }
      for (const K of keys.values()) { const A = K.A, oo = Object.assign({}, o, { mix: K.mix });
        K.meshes = A.parts.map(p => { const im = new T.InstancedMesh(p.geo.clone(), p.leaf ? leafMat(p.mat, oo, false) : p.mat, K.items.length); im.setColorAt(0, _c.set(0xffffff)); im.count = 0; im.frustumCulled = false; im.receiveShadow = !p.leaf; im.castShadow = !TOUCH && !o.noShadow;
          if (p.leaf && !TOUCH) im.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: p.mat.map, alphaTest: .35 }); im.userData = { loc: p.loc, leaf: p.leaf }; grp.add(im); return im; }); }
      const fars = items.filter(it => it.fm); let far = null;
      if (fars.length && M._far) { const g = farGeo(); g.setAttribute('uvo', new T.InstancedBufferAttribute(new Float32Array(fars.length * 4), 4)); g.setAttribute('amix', new T.InstancedBufferAttribute(new Float32Array(fars.length), 1));
        far = new T.InstancedMesh(g, leafMat(M._far, o, true), fars.length); far.setColorAt(0, _c.set(0xffffff)); far.count = 0; far.frustumCulled = false; grp.add(far); }
      const G = { grp, keys: [...keys.values()], fars, far, cx: 1e9, cz: 1e9 }; GR.add(G); if (lastCam) fill(G, lastCam, true);
    }).catch(e => console.warn('Natur', e && e.message));
    return grp;
  }
  /* Instanzen neu verteilen: nah → Modell, fern → Fernansicht */
  function fill(G, cam, force) {
    if (!force && Math.hypot(cam.x - G.cx, cam.z - G.cz) < 3) return; G.cx = cam.x; G.cz = cam.z;
    for (const K of G.keys) { let n = 0; for (const it of K.items) { const d = Math.hypot(cam.x - it.x, cam.z - it.z); it.near = d < (it.r + (it.near ? 4 : 0)) * range; if (!it.near) continue;
        for (const im of K.meshes) { im.setMatrixAt(n, _m.multiplyMatrices(it.m, im.userData.loc)); im.setColorAt(n, _c.set(im.userData.leaf || it.all ? it.col : 0xffffff)); } n++; }
      for (const im of K.meshes) { im.count = n; im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; } }
    if (G.far) { const f = G.far, uvo = f.geometry.attributes.uvo, am = f.geometry.attributes.amix; let n = 0;
      for (const it of G.fars) { if (it.near) continue; f.setMatrixAt(n, it.fm); f.setColorAt(n, _c.set(it.col)); uvo.setXYZW(n, it.uv[0], it.uv[1], it.uv[2], it.uv[3]); am.setX(n, it.mix); n++; }
      f.count = n; f.instanceMatrix.needsUpdate = true; f.instanceColor.needsUpdate = true; uvo.needsUpdate = true; am.needsUpdate = true; }
  }
  let lastCam = null, acc = 0, sweep = 0;
  function update(dt, cam) { U.value += dt; lastCam = cam; if ((acc += dt) < .2) return; acc = 0;
    const chk = ++sweep > 15; if (chk) sweep = 0;
    for (const G of GR) { let p = G.grp, vis = true; while (p.parent) { vis = vis && p.visible; p = p.parent; }
      if (!p.isScene) { if (chk && (G.gone = (G.gone || 0) + 1) > 2) GR.delete(G); continue; } G.gone = 0; if (vis) fill(G, cam); } }
  const stat = () => { let groups = 0, items = 0, near = 0, far = 0, draws = 0; for (const G of GR) { let p = G.grp, vis = true; while (p.parent) { vis = vis && p.visible; p = p.parent; } if (!p.isScene || !vis) continue; groups++;
      for (const K of G.keys) { items += K.items.length; const n = K.meshes[0].count; near += n; if (n) draws += K.meshes.length; } if (G.far && G.far.count) { far += G.far.count; draws++; } } return { groups, items, near, far, draws }; };
  return { place, update, load, stat, setRange: f => { range = f; for (const G of GR) G.cx = 1e9; } };
}
