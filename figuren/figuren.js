/* easygames-Figuren – realistische, animierte Menschen für alle Spiele (Three.js r128 oder neuer, ohne Build).
   Körper und Bewegungen: Quaternius „Universal Base Characters“ + „Universal Animation Library 1/2“ (CC0), aufbereitet mit tools/make-figuren.mjs.
   Kleidung, Hautton, Bart, Frisuren und Hüte entstehen hier zur Laufzeit (Shader-Zonen + leichte Zusatzteile), damit zwei Grundkörper reichen.

   Nutzung:
     const kit = EasyFiguren.create({ THREE, GLTFLoader, base: '../figuren/' });   // GLTFLoader optional (sonst THREE.GLTFLoader)
     const fig = await kit.make({ body: 'm', skin: '#e8b88a', hair: { style: 'short', color: '#3a2a1a' }, top: '#ff2d95', topStyle: 'tank',
                                  bottom: '#161d3a', bottomStyle: 'shorts', shoes: '#f5f5ff', beard: '#3a2a1a', hat: { type: 'cap', color: '#ffd24a' } });
     scene.add(fig.root); fig.play('jog'); … pro Bild: fig.update(dt);   fig.reach(1) = Arme nach oben (z. B. Hangeln);
     fig.aimArm('r', richtung, w) = einen Arm gezielt ausrichten (z. B. Wurf); fig.dispose();
   Bewegungen: idle walk jog sprint jumpStart jump land ninjaStart ninja ninjaLand climb swim knock dance yes arms crouch roll slide push punch down
   Blickrichtung der Figur: +Z, Füße bei y = 0, Größe ca. 1,8 m. kit.fromRoster(look) übersetzt Steckbriefe aus easyclash/js/roster.js. */
(function (root) {
  'use strict';
  const STYLE = { none: 0, tank: 1, tee: 2, long: 3, shorts: 1, pants: 2 };
  const LONG_HAIR = /^(long|pony|bun|bob)$/;

  function create(opt) {
    const T = opt.THREE || root.THREE, Loader = opt.GLTFLoader || T.GLTFLoader, base = opt.base || '../figuren/';
    // srgb: true, wenn der Renderer sRGB ausgibt (outputEncoding = sRGBEncoding); sonst werden Texturen und Farben roh (linear) behandelt wie in den meisten easygames
    const srgb = !!opt.srgb, fix = g => { if (!srgb) g.scene.traverse(o => { const m = o.material; if (m) for (const k of ['map', 'emissiveMap']) if (m[k]) m[k].encoding = T.LinearEncoding; }); return g; };
    const files = {}, load = f => files[f] || (files[f] = new Promise((res, rej) => new Loader().load(base + f + '.glb', g => res(fix(g)), null, rej)));
    const hex = c => new T.Color(c == null ? '#888888' : c), lin = c => srgb ? hex(c).convertSRGBToLinear() : hex(c);
    const info = {};   // je Körper: Ruhe-Matrix, Größe, Kopfmaße, mittlere Hautfarbe

    // Skelett samt Haut klonen (ohne SkeletonUtils)
    function cloneRig(src) {
      const c = src.clone(true), bones = {};
      c.traverse(o => { if (o.isBone) bones[o.name] = o; });
      c.traverse(o => {
        if (!o.isSkinnedMesh) return;
        const sk = o.skeleton; o.bind(new T.Skeleton(sk.bones.map(b => bones[b.name]), sk.boneInverses.map(m => m.clone())), o.bindMatrix.clone());
        o.frustumCulled = false;
      });
      return { scene: c, bones };
    }

    // Einmal je Körper: Ruhepose vermessen (Positionen sind quantisiert; D bildet sie auf Meter in Ruhe ab)
    function measure(key, scene) {
      if (info[key]) return info[key];
      scene.updateMatrixWorld(true);
      let skin = null; scene.traverse(o => { if (o.isSkinnedMesh && /Superhero/i.test(o.material.name)) skin = o; });
      const sk = skin.skeleton, D = new T.Matrix4().multiplyMatrices(sk.bones[0].matrixWorld, sk.boneInverses[0]).multiply(skin.bindMatrix);
      const pa = skin.geometry.attributes.position, n = pa.normalized ? 1 / 32767 : 1, v = new T.Vector3();
      let top = 0; const hb = new T.Box3(), neck = new T.Vector3(); (scene.getObjectByName('neck_01') || sk.bones[0]).getWorldPosition(neck);
      const P = new Float32Array(pa.count * 3);
      for (let i = 0; i < pa.count; i++) {
        v.set(pa.getX(i) * n, pa.getY(i) * n, pa.getZ(i) * n).applyMatrix4(D); v.toArray(P, i * 3);
        if (v.y > top) top = v.y;
        if (v.y > neck.y + 0.06 && Math.abs(v.x) < 0.14) hb.expandByPoint(v);
      }
      // Dreiecke von Kopf und Nacken – Grundlage für Frisuren, die genau der Kopfform folgen
      const ix = skin.geometry.index.array, tris = [];
      for (let t = 0; t < ix.length; t += 3) { const a = ix[t], b = ix[t + 1], c = ix[t + 2]; if (P[a * 3 + 1] > neck.y - 0.12 && P[b * 3 + 1] > neck.y - 0.12 && P[c * 3 + 1] > neck.y - 0.12 && Math.abs(P[a * 3]) < 0.16) tris.push(a, b, c); }
      const hd = scene.getObjectByName('Head') || scene.getObjectByName('head'), headInv = hd ? hd.matrixWorld.clone().invert() : new T.Matrix4();
      // mittlere Hautfarbe aus der Textur (dunkle Unterwäsche ausgenommen) – Grundlage fürs Umfärben
      let ref = new T.Color(0.78, 0.55, 0.42);
      const img = skin.material.map && skin.material.map.image;
      if (img && typeof document !== 'undefined') try {
        const cv = document.createElement('canvas'); cv.width = cv.height = 32; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, 32, 32);
        const d = g.getImageData(0, 0, 32, 32).data; let r = 0, gg = 0, b = 0, k = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 240) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; k++; }
        if (k) { ref = new T.Color(r / k / 255, gg / k / 255, b / k / 255); if (srgb) ref.convertSRGBToLinear(); }
      } catch (e) { /* ohne Canvas: Standardwert */ }
      if (root.FIG_DEBUG) console.log("fig", key, top.toFixed(3), JSON.stringify(hb.min), JSON.stringify(hb.max), ref.getHexString());
      return (info[key] = { D, H: top, head: hb, ref, neck, P, tris, headInv, hair: {} });
    }

    // ------------------------------------------------------------ Haut + Kleidung als Shader-Zonen auf dem Körper
    function bodyMat(src, I, L) {
      const m = src.clone(), u = m.userData.u = {
        uD: { value: I.D }, uH: { value: I.H }, uSkin: { value: new T.Vector3(1, 1, 1) }, uSkinC: { value: new T.Color() }, uTop: { value: hex(L.top) }, uBot: { value: hex(L.bottom) },
        uShoe: { value: hex(L.shoes) }, uBeard: { value: hex(L.beard || '#2a1a12') }, uSt: { value: new T.Vector4() }, uRefL: { value: 0.5 }, uHeadZ: { value: I.head.max.z }
      };
      m.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, u);
        sh.vertexShader = 'uniform mat4 uD; varying vec3 vRest;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = (uD * vec4(transformed, 1.0)).xyz;');
        sh.fragmentShader = 'uniform float uH, uRefL, uHeadZ; uniform vec3 uSkin, uSkinC, uTop, uBot, uShoe, uBeard; uniform vec4 uSt; varying vec3 vRest; float clothM;\n' +
          sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
  {
    float h = vRest.y / uH, ax = abs(vRest.x), lum = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
    float sh = clamp(lum / uRefL, 0.55, 1.35), e = 0.004;
    vec3 col = mix(diffuseColor.rgb * uSkin, uSkinC * clamp(lum / uRefL, 0.4, 1.4) * 0.72, 0.6); clothM = 0.0;   // Hautton: Farbe aus dem Steckbrief, Details aus der Textur
    // Hose: Shorts (bis übers Knie) oder lang
    float botLo = uSt.y > 1.5 ? 0.065 : 0.31, waist = 0.575;
    float bot = uSt.y > 0.5 ? smoothstep(botLo - e, botLo + e, h) * (1.0 - smoothstep(waist - e, waist + e, h)) * step(ax, 0.3) : 0.0;
    // Oberteil: Rumpf; Ärmel je nach Stil (Arme liegen in der Ruhepose waagerecht)
    // Rumpf bis zur Schulter; Halsausschnitt; beim Tanktop nur Träger über der Brust
    float front = step(0.0, vRest.z), neckH = mix(0.815, 0.79, front), tank = step(uSt.x, 1.5);
    float torso = smoothstep(waist - 0.02 - e, waist - 0.02 + e, h) * (1.0 - smoothstep(0.835 - e, 0.835 + e, h)) * (1.0 - smoothstep(0.2 - e, 0.2 + e, ax));
    torso *= 1.0 - step(ax, 0.072) * smoothstep(neckH - e, neckH + e, h);
    float scoop = mix(0.79, 0.76, front);
    float strap = step(0.072, ax) * (1.0 - step(0.108, ax));
    torso *= 1.0 - tank * smoothstep(0.715 - e, 0.715 + e, h) * (1.0 - strap) * (1.0 - step(ax, 0.072) * (1.0 - smoothstep(scoop - e, scoop + e, h)));
    torso *= 1.0 - tank * smoothstep(0.135 - e, 0.135 + e, ax);
    float sleeve = uSt.x > 1.5 ? step(0.74, h) * (1.0 - smoothstep((uSt.x > 2.5 ? 0.66 : 0.34) - e, (uSt.x > 2.5 ? 0.66 : 0.34) + e, ax)) * step(0.17, ax) : 0.0;
    float top = uSt.x > 0.5 ? max(torso, sleeve) : 0.0;
    float shoe = 1.0 - smoothstep(0.058 - e, 0.058 + e, h), sole = 1.0 - smoothstep(0.012, 0.016, h);
    float sock = uSt.y < 1.5 ? smoothstep(0.058, 0.062, h) * (1.0 - smoothstep(0.088, 0.092, h)) * uSt.z : 0.0;
    col = mix(col, uBot * mix(1.0, sh, 0.45), bot);
    col = mix(col, uTop * mix(1.0, sh, 0.45), top * (1.0 - bot));
    col = mix(col, vec3(0.92), sock);
    col = mix(col, uShoe * mix(1.0, sh, 0.3), shoe); col = mix(col, vec3(0.95), sole * shoe);
    // Bart: unteres Gesicht vorne
    float bz = smoothstep(uHeadZ - 0.075, uHeadZ - 0.045, vRest.z);
    float beard = uSt.w * bz * smoothstep(0.86, 0.87, h) * (1.0 - smoothstep(0.905, 0.915, h)) * (1.0 - smoothstep(0.045, 0.06, abs(vRest.x) - max(0.0, (h - 0.885)) * 1.2));
    col = mix(col, uBeard * (0.7 + 0.3 * fract(sin(dot(vRest.xy, vec2(4123.1, 2311.7))) * 43758.5)), beard * 0.9);
    clothM = max(max(bot, top), shoe);
    diffuseColor.rgb = col;
  }`).replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.88, clothM);');
      };
      m.customProgramCacheKey = () => 'easyfig-body';
      return m;
    }
    function setBody(m, I, L) {
      const u = m.userData.u, s = lin(L.skin || '#e0ac80');
      u.uSkin.value.set(s.r / I.ref.r, s.g / I.ref.g, s.b / I.ref.b).multiplyScalar(0.8);   // Textur ist heller als ihr Mittelwert → etwas dämpfen
      u.uRefL.value = I.ref.r * 0.3 + I.ref.g * 0.59 + I.ref.b * 0.11; u.uSkinC.value.copy(s);
      u.uTop.value.copy(lin(L.top || '#5b6cff')); u.uBot.value.copy(lin(L.bottom || '#2c3554'));
      u.uShoe.value.copy(lin(L.shoes || '#f4f4f8')); u.uBeard.value.copy(lin(L.beard || '#2a1a12'));
      u.uSt.value.set(STYLE[L.topStyle || 'tee'] || 0, STYLE[L.bottomStyle || 'shorts'] || 0, L.socks === false ? 0 : 1, L.beard ? 1 : 0);
    }

    // ------------------------------------------------------------ Frisuren und Kopfbedeckungen (leichte Zusatzteile am Kopfknochen)
    let strands = null;
    function strandTex() {
      if (strands || typeof document === 'undefined') return strands;
      const cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; const g = cv.getContext('2d');
      g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, 64, 128);
      for (let i = 0; i < 260; i++) { const x = Math.random() * 64, c = 110 + Math.random() * 120 | 0; g.strokeStyle = `rgb(${c},${c},${c})`; g.lineWidth = 0.6 + Math.random(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (Math.random() - 0.5) * 6, 128); g.stroke(); }
      strands = new T.CanvasTexture(cv); strands.wrapS = strands.wrapT = T.RepeatWrapping; strands.repeat.set(3, 1); return strands;
    }
    // Haarschale: Kopfdreiecke über der Haarlinie, entlang der Normalen nach außen versetzt (im Raum des Kopfknochens, je Körper+Stil einmal)
    const LINES = {   // Haarlinie vorne / seitlich / hinten (Kopf normiert: −1 Kinn … +1 Scheitel), Dicke, Wuschel
      short: [0.5, -0.02, -0.6, 0.013, 0], buzz: [0.55, 0.05, -0.55, 0.005, 0], fringe: [0.2, -0.05, -0.6, 0.016, 0], bowl: [0.15, -0.05, -0.55, 0.02, 0],
      spiky: [0.5, -0.02, -0.6, 0.02, 0.6], curly: [0.42, -0.15, -0.7, 0.03, 1], bob: [0.5, -0.62, -1.05, 0.018, 0], long: [0.5, -0.62, -1.3, 0.018, 0],
      pony: [0.52, -0.05, -0.75, 0.009, 0], bun: [0.52, -0.05, -0.75, 0.009, 0], mohawk: [0.6, 0.35, -0.5, 0.04, 0.3],
      _cap: [0.42, 0.18, -0.25, 0.03, 0], _helmet: [0.3, -0.25, -0.55, 0.05, 0], _beanie: [0.45, 0.1, -0.35, 0.035, 0]   // Kopfbedeckungen
    };
    function hairGeo(I, st) {
      if (I.hair[st]) return I.hair[st];
      const L = LINES[st] || LINES.short, c = I.head.getCenter(new T.Vector3()), sz = I.head.getSize(new T.Vector3()), P = I.P;
      const rx = sz.x / 2, ry = sz.y / 2, rz = sz.z / 2;
      const keep = i => { const X = (P[i * 3] - c.x) / rx, Y = (P[i * 3 + 1] - c.y) / ry, Z = (P[i * 3 + 2] - c.z) / rz;
        if (st === 'mohawk' && Math.abs(X) > 0.28) return false;
        const line = Z > 0 ? L[1] + (L[0] - L[1]) * Math.min(1, Z * 1.4) : L[1] + (L[2] - L[1]) * Math.min(1, -Z * 1.3);
        return Y > line; };
      // verschweißen (UV-Nähte) und übernehmen
      const map = new Map(), pos = [], idx = [], key = i => Math.round(P[i * 3] * 2e3) + ',' + Math.round(P[i * 3 + 1] * 2e3) + ',' + Math.round(P[i * 3 + 2] * 2e3);
      const vid = i => { const k = key(i); let j = map.get(k); if (j == null) { j = pos.length / 3; map.set(k, j); pos.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); } return j; };
      const tr = I.tris; for (let t = 0; t < tr.length; t += 3) if (keep(tr[t]) && keep(tr[t + 1]) && keep(tr[t + 2])) idx.push(vid(tr[t]), vid(tr[t + 1]), vid(tr[t + 2]));
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      let out = 0; for (let i = 0; i < pos.length; i += 3) out += (pos[i] - c.x) * g.attributes.normal.array[i] + (pos[i + 1] - c.y) * g.attributes.normal.array[i + 1] + (pos[i + 2] - c.z) * g.attributes.normal.array[i + 2];
      if (out < 0) { for (let t = 0; t < idx.length; t += 3) { const k = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = k; } g.setIndex(idx); g.computeVertexNormals(); }   // Wicklung nach außen
      const p = g.attributes.position, nr = g.attributes.normal, uv = [];
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), w = L[4] ? 1 + L[4] * (0.5 + 0.5 * Math.sin(x * 160) * Math.sin(y * 140 + z * 90)) : 1, d = L[3] * w + (y > c.y + ry * 0.6 ? L[3] * 0.4 : 0);
        p.setXYZ(i, x + nr.getX(i) * d, y + nr.getY(i) * d, z + nr.getZ(i) * d);
        uv.push(Math.atan2(x - c.x, z - c.z) / (Math.PI * 2) + 0.5, (y - c.y) / ry * 0.5 + 0.5);
      }
      g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); g.applyMatrix4(I.headInv);
      if (root.FIG_DEBUG) console.log("hair", st, idx.length / 3, I.tris.length / 3, JSON.stringify(c), rx.toFixed(3), ry.toFixed(3), rz.toFixed(3));
      return (I.hair[st] = g);
    }
    function addHair(fig, I, L) {
      const hb = I.head, c = hb.getCenter(new T.Vector3()), s = hb.getSize(new T.Vector3()), rx = s.x / 2, ry = s.y / 2, rz = s.z / 2;
      const hd = fig.bones.head || fig.bones.Head; if (!hd) return;
      const parts = [], hair = L.hair && L.hair.style !== 'bald' ? L.hair : null;
      const hm = hair ? new T.MeshStandardMaterial({ color: lin(hair.color), map: strandTex(), bumpMap: strandTex(), bumpScale: 0.015, roughness: 0.75, metalness: 0 }) : null;
      const add = (geo, mat, x, y, z, rot) => { const m = new T.Mesh(geo, mat); m.position.set(c.x + x, c.y + y, c.z + z); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); m.castShadow = true; parts.push(m); return m; };
      if (hair) {
        const st = LINES[hair.style] ? hair.style : 'short', sh = new T.Mesh(hairGeo(I, st), hm); sh.castShadow = true; hd.add(sh); fig.extra.push(sh); sh.userData.shared = true;
        if (st === 'spiky') for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; add(new T.ConeGeometry(0.022, 0.07, 5), hm, Math.cos(a) * rx * 0.5, ry * 1.05, Math.sin(a) * rz * 0.5 - rz * 0.1, [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]); }
        if (st === 'pony') { const t = add(new T.CylinderGeometry(0.045, 0.012, 0.32, 10), hm, 0, ry * 0.15 - 0.16, -rz * 1.15, [0.35, 0, 0]); fig.tail = t; }
        if (st === 'bun') add(new T.SphereGeometry(0.06, 14, 10), hm, 0, ry * 0.95, -rz * 0.75);
        if (st === 'long') { const g = new T.CylinderGeometry(rx * 1.12, rx * 1.3, 0.3, 22, 1, true, Math.PI * 0.55, Math.PI * 0.9); g.translate(0, -0.15, 0); const m = add(g, hm, 0, -ry * 0.55, -rz * 0.12); m.scale.set(1, 1, rz / rx * 1.05); m.material = hm.clone(); m.material.side = T.DoubleSide; }
      }
      const h = L.hat; if (h && h.type) {
        const m = new T.MeshStandardMaterial({ color: lin(h.color || '#222'), roughness: 0.55, metalness: h.type === 'crown' || h.type === 'helmet' ? 0.6 : 0 });
        if (h.type === 'band') add(new T.TorusGeometry(rx * 1.04, 0.016, 8, 28), m, 0, ry * 0.35, 0, [Math.PI / 2 - 0.15, 0, 0]).scale.set(1, rz / rx, 1);
        else if (h.type === 'cap' || h.type === 'helmet' || h.type === 'beanie') { const sh = new T.Mesh(hairGeo(I, '_' + h.type), m); sh.castShadow = true; sh.userData.shared = true; hd.add(sh); fig.extra.push(sh); if (h.type === 'cap') add(new T.BoxGeometry(rx * 1.7, 0.012, rz * 0.95), m, 0, ry * 0.5, rz * 1.12, [-0.18, 0, 0]); }
        else if (h.type === 'tophat') { add(new T.CylinderGeometry(rx * 0.85, rx * 0.85, 0.2, 18), m, 0, ry * 1.25, 0); add(new T.CylinderGeometry(rx * 1.35, rx * 1.35, 0.015, 22), m, 0, ry * 0.82, 0); }
        else if (h.type === 'crown') { const cr = add(new T.CylinderGeometry(rx * 0.8, rx * 0.8, 0.06, 10, 1, true), m, 0, ry * 1.0, 0); cr.material.side = T.DoubleSide; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(new T.ConeGeometry(0.018, 0.05, 4), m, Math.cos(a) * rx * 0.8, ry * 1.0 + 0.05, Math.sin(a) * rx * 0.8); } }
        else if (h.type === 'sunglasses') add(new T.BoxGeometry(rx * 1.75, 0.035, 0.01), new T.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.5 }), 0, ry * 0.12, rz + 0.008);
      }
      if (!parts.length) return;
      // in Ruhepose (Weltkoordinaten) gebaut → an den Kopfknochen hängen
      fig.scene.updateMatrixWorld(true); const inv = new T.Matrix4().copy(hd.matrixWorld).invert ? new T.Matrix4().copy(hd.matrixWorld).invert() : new T.Matrix4().getInverse(hd.matrixWorld);
      for (const m of parts) { m.updateMatrix(); m.matrix.premultiply(inv); m.matrix.decompose(m.position, m.quaternion, m.scale); hd.add(m); fig.extra.push(m); }
    }

    // ------------------------------------------------------------ Figur
    const AX = new T.Vector3(), AY = new T.Vector3(), Q = new T.Quaternion(), Q2 = new T.Quaternion();
    // Knochen so drehen, dass er (zum Kind hin) in Weltrichtung dir zeigt; w = Anteil
    function aim(bone, child, dir, w) {
      if (!bone || !child || w <= 0) return;
      bone.getWorldPosition(AX); child.getWorldPosition(AY); AY.sub(AX).normalize();
      Q.setFromUnitVectors(AY, dir); bone.parent.getWorldQuaternion(Q2);
      const wq = bone.getWorldQuaternion(new T.Quaternion()), tq = Q.clone().multiply(wq);
      wq.slerp(tq, w); bone.quaternion.copy(Q2.invert ? Q2.invert() : Q2.inverse()).multiply(wq); bone.updateMatrixWorld(true);
    }
    const UP = new T.Vector3(0, 1, 0);

    async function make(L0) {
      const L = Object.assign({ body: 'm', skin: '#e0ac80', top: '#5b6cff', topStyle: 'tee', bottom: '#2c3554', bottomStyle: 'shorts', shoes: '#f4f4f8' }, L0 || {});
      const key = L.body === 'w' ? 'frau' : 'mann', [gl, an] = await Promise.all([load(key), load('anim')]);
      const I = measure(key, gl.scene), rig = cloneRig(gl.scene), wrap = new T.Group(); wrap.add(rig.scene);
      const fig = { root: wrap, scene: rig.scene, bones: rig.bones, extra: [], mats: [], look: L, height: I.H, tail: null, cur: null, reachW: 0, reachT: 0 };
      rig.scene.traverse(o => {
        if (!o.isSkinnedMesh) return; o.castShadow = true;
        if (/Superhero/i.test(o.material.name)) { o.material = bodyMat(o.material, I, L); setBody(o.material, I, L); }
        else { o.material = o.material.clone(); if (/Hair/i.test(o.material.name) && L.hair) o.material.color = lin(L.hair.color).multiplyScalar(1.6); }
        fig.mats.push(o.material);
      });
      addHair(fig, I, L);
      const sz = L.size || 1, bulk = Math.min(1.35, Math.max(0.85, L.bulk || L.build || 1)); wrap.scale.set(sz * bulk, sz, sz * Math.sqrt(bulk));
      // Bewegungen
      const mixer = new T.AnimationMixer(rig.scene), acts = {};
      // Wurzel-Bewegung (z. B. beim Klettern) entfernen: die Spiele setzen die Position selbst
      if (!an.inPlace) { an.inPlace = true; for (const c of an.animations) c.tracks = c.tracks.filter(t => t.name !== 'root.position'); }
      for (const c of an.animations) acts[c.name] = mixer.clipAction(c);
      fig.mixer = mixer;
      fig.play = (name, o = {}) => {
        const a = acts[name]; if (!a) return; const fade = o.fade == null ? 0.18 : o.fade;
        a.timeScale = o.speed || 1;
        if (fig.cur === a && !o.restart) return;
        a.reset(); a.setLoop(o.once ? T.LoopOnce : T.LoopRepeat, Infinity); a.clampWhenFinished = !!o.once; a.enabled = true; a.setEffectiveWeight(1);
        if (fig.cur && fade > 0) a.crossFadeFrom(fig.cur, fade, false); else if (fig.cur) fig.cur.stop();
        a.play(); fig.cur = a; fig.curName = name;
      };
      fig.speed = s => { if (fig.cur) fig.cur.timeScale = s; };
      fig.reach = w => { fig.reachT = w; };   // 0…1: Arme nach oben (hängen, greifen)
      const B = rig.bones, arms = [['upperarm_l', 'lowerarm_l', 'hand_l'], ['upperarm_r', 'lowerarm_r', 'hand_r']].map(a => a.map(n => B[n]));
      fig.update = dt => {
        mixer.update(dt);
        fig.reachW += (fig.reachT - fig.reachW) * Math.min(1, dt * 12);
        if (fig.reachW > 0.01) { rig.scene.updateMatrixWorld(true); for (const [u, l, h] of arms) { aim(u, l, UP, fig.reachW); aim(l, h, UP, fig.reachW); } }
        if (fig.tail) fig.tail.rotation.x = 0.35 + Math.sin(mixer.time * 9) * 0.08;
      };
      // Arm (Ober- und Unterarm) in Weltrichtung dir zeigen lassen, nach fig.update aufrufen; side 'l' oder 'r', w = Anteil 0…1
      fig.aimArm = (side, dir, w = 1) => { rig.scene.updateMatrixWorld(true); const [u, l, h] = arms[side === 'l' ? 0 : 1]; aim(u, l, dir, w); aim(l, h, dir, w); };
      fig.ghost = (opacity, color) => { for (const m of fig.mats.concat(fig.extra.map(e => e.material))) { m.transparent = true; m.opacity = opacity; m.depthWrite = false; if (color != null && m.emissive) m.emissive = hex(color); m.needsUpdate = true; } rig.scene.traverse(o => { o.castShadow = false; }); fig.extra.forEach(e => { e.castShadow = false; }); };
      fig.recolor = L2 => { Object.assign(L, L2); fig.mats.forEach(m => { if (m.userData.u) setBody(m, I, L); }); };
      fig.dispose = () => { mixer.stopAllAction(); mixer.uncacheRoot(rig.scene); if (wrap.parent) wrap.parent.remove(wrap); fig.mats.forEach(m => m.dispose()); fig.extra.forEach(e => { if (!e.userData.shared) e.geometry.dispose(); e.material.dispose(); }); };
      fig.play('idle', { fade: 0 });
      return fig;
    }

    // Steckbrief (easyclash/js/roster.js) → Figur; nur Menschen (kind fehlt oder 'human'), sonst null
    function fromRoster(look) {
      const l = look || {}; if (l.kind && l.kind !== 'human') return null;
      const st = l.hair && l.hair.style, body = l.body || (st && LONG_HAIR.test(st) && (l.bulk || 1) < 1.2 ? 'w' : 'm');
      return { body, skin: l.skin, hair: l.hair, top: l.top, topStyle: l.sleeves === false ? 'tank' : 'tee', bottom: l.bottom, bottomStyle: 'shorts', shoes: l.shoes, beard: l.beard, hat: l.hat, bulk: l.bulk, size: l.size };
    }

    return { make, fromRoster, load: () => Promise.all(['mann', 'frau', 'anim'].map(load)), preload: k => load(k === 'w' ? 'frau' : 'mann') };
  }
  root.EasyFiguren = { create };
})(typeof window !== 'undefined' ? window : globalThis);
