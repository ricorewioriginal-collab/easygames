/* Urwaldlager – freie 3D-Modelle laden und aufbereiten
   Figuren: KayKit Adventurers 1.0 (Kay Lousberg, CC0), umgefärbt zu Campern, Moderatoren und Doc.
   Kulisse: Kenney Nature/Food Kit, Quaternius-Tiere, Wizp-Pflanzen, KayKit Dungeon/Furniture, Poly-Haven-Pflanzen (ph_*), alle CC0. Siehe models/LIZENZ.md. */
(function () {
  'use strict';
  const UL = window.UL, T = THREE;
  const A = UL.A = {};
  const files = new Map();
  A.ready = false;
  A.load = url => {
    if (!files.has(url)) files.set(url, new Promise((res, rej) => new T.GLTFLoader().load(url, res, undefined, rej)));
    return files.get(url);
  };

  // ---------- Materialien: Lambert (günstig, hell, freundlich), Farben/Texturen bleiben ----------
  const matCache = new Map();
  // Kenney-Farben (Türkis-Grün) an den Dschungel anpassen
  const FIXCOL = { leafsGreen: 0x4fae3a, leafsDark: 0x2f7a34, grass: 0x62b84a, stone: 0x8f8a80, stoneDark: 0x66625a, woodBark: 0x7a5230, woodBarkDark: 0x5a3a22 };
  function lambertOf(m, skinning) {
    const key = m.uuid + (skinning ? 's' : '');
    if (matCache.has(key)) return matCache.get(key);
    const fix = FIXCOL[m.name];
    const n = new T.MeshLambertMaterial({ color: fix ? new T.Color(fix).convertSRGBToLinear() : m.color ? m.color.clone() : 0xffffff, map: m.map || null, skinning: !!skinning, transparent: !!m.transparent, opacity: m.opacity == null ? 1 : m.opacity, alphaTest: m.alphaTest || 0, side: m.side, vertexColors: !!m.vertexColors });
    if (m.emissive && m.emissive.getHex()) n.emissive = m.emissive.clone();
    matCache.set(key, n);
    return n;
  }
  A.lambertOf = lambertOf;

  // ---------- Kulisse (set.glb): Teile p:<name> ----------
  const parts = {};
  A.part = (name) => {
    const p = parts[name];
    if (!p) { console.warn('Teil fehlt', name); return new T.Group(); }
    const c = p.clone(true);
    return c;
  };
  A.has = n => !!parts[n];
  // Teil auf Größe bringen: Höhe h (oder Breite) und Boden auf y=0
  A.sized = (name, h, by = 'y') => {
    const g = new T.Group(), c = A.part(name); g.add(c);
    const info = parts[name] && parts[name].userData.box;
    if (info) {
      const size = by === 'y' ? info.max.y - info.min.y : Math.max(info.max.x - info.min.x, info.max.z - info.min.z);
      const k = h / Math.max(0.001, size);
      c.scale.setScalar(k);
      c.position.set(-(info.min.x + info.max.x) / 2 * k, -info.min.y * k, -(info.min.z + info.max.z) / 2 * k);
    }
    return g;
  };
  // Viele gleiche Teile: je (Geometrie, Material) ein InstancedMesh
  A.instanced = (name, list, h, opts = {}) => {
    const out = new T.Group(), src = parts[name];
    if (!src || !list.length) return out;
    const info = src.userData.box, size = info.max.y - info.min.y, k = h / Math.max(0.001, size);
    const base = new T.Matrix4().compose(new T.Vector3(-(info.min.x + info.max.x) / 2 * k, -info.min.y * k, -(info.min.z + info.max.z) / 2 * k), new T.Quaternion(), new T.Vector3(k, k, k));
    src.updateMatrixWorld(true);
    const inv = new T.Matrix4().copy(src.matrixWorld).invert();
    const m = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(), p = new T.Vector3(), e = new T.Euler();
    src.traverse(o => {
      if (!o.isMesh) return;
      const local = new T.Matrix4().multiplyMatrices(inv, o.matrixWorld);
      const im = new T.InstancedMesh(o.geometry, o.material, list.length);
      list.forEach((it, i) => {
        e.set(0, it.ry || 0, 0); q.setFromEuler(e); const sc = it.s || 1; s.set(sc, sc * (it.sy || 1), sc); p.set(it.x, it.y || 0, it.z);
        m.compose(p, q, s).multiply(base).multiply(local);
        im.setMatrixAt(i, m);
      });
      im.castShadow = !!opts.shadow; im.receiveShadow = !!opts.receive;
      out.add(im);
    });
    return out;
  };

  // ---------- Figuren ----------
  const FIG = ['knight', 'mage', 'rogue', 'rogue_hooded', 'barbarian'];
  A.FIG = FIG;
  const figSrc = {}, rbSrc = {};
  let clips = {}, rbClips = {};
  // Echte Menschen (Microsoft Rocketbox, MIT): Name → Datei models/menschen/<id>.glb
  A.RB = [];
  A.hasRb = id => !!rbSrc[id];
  // Anzeige-Namen der Bewegungen
  const CLIP = { idle: 'Unarmed_Idle', idle2: 'Idle', walk: 'Walking_A', run: 'Running_A', jump: 'Jump_Full_Short', cheer: 'Cheer', sit: 'Sit_Chair_Idle',
    interact: 'Interact', pickup: 'PickUp', throw: 'Throw', use: 'Use_Item', hit: 'Hit_A', faint: 'Death_A', raise: 'Spellcast_Raise', block: 'Block', ready: '2H_Melee_Idle' };
  A.CLIP = CLIP;

  // Hülle einer gehäuteten Figur in Ruhehaltung (Box3 kennt in r128 weder Häutung noch quantisierte Werte)
  const NORM = { Int8Array: 127, Uint8Array: 255, Int16Array: 32767, Uint16Array: 65535 };
  function skinnedBox(mesh, box = new T.Box3(), cut, top) {
    const g = mesh.geometry, pos = g.attributes.position, div = pos.normalized ? (NORM[pos.array.constructor.name] || 1) : 1, v = new T.Vector3(), base = new T.Vector3(), acc = new T.Vector3(), m = new T.Matrix4();
    mesh.updateMatrixWorld(true);
    const si = g.attributes.skinIndex, sw = g.attributes.skinWeight, wd = sw && sw.normalized ? (NORM[sw.array.constructor.name] || 1) : 1;
    const step = Math.max(1, Math.floor(pos.count / 500));
    for (let i = 0; i < pos.count; i += step) {
      v.set(pos.getX(i) / div, pos.getY(i) / div, pos.getZ(i) / div);
      if (mesh.isSkinnedMesh && si && sw) {
        base.copy(v).applyMatrix4(mesh.bindMatrix); acc.set(0, 0, 0);
        const sk = mesh.skeleton;
        for (let k = 0; k < 4; k++) {
          const w = [sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i)][k] / wd; if (!w) continue;
          const bi = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)][k];
          m.multiplyMatrices(sk.bones[bi].matrixWorld, sk.boneInverses[bi]);
          acc.addScaledVector(v.copy(base).applyMatrix4(m), w);
        }
        v.copy(acc).applyMatrix4(mesh.bindMatrixInverse).applyMatrix4(mesh.matrixWorld);
      } else v.applyMatrix4(mesh.matrixWorld);
      box.expandByPoint(v);
      if (top && v.y > cut) top.expandByPoint(v);
    }
    return box;
  }
  A.skinnedBox = skinnedBox;
  // Hülle aller Punkte oberhalb von cut (Kopf einer echten Figur, in Ruhehaltung)
  function rbHead(root, cut) {
    const box = new T.Box3(), all = new T.Box3();
    root.traverse(o => { if (!o.isMesh) return; all.makeEmpty(); skinnedBox(o, all, cut, box); });
    return box.isEmpty() ? null : box;
  }
  // r128 rechnet Hüllen quantisierter Geometrie aus Rohwerten → falsche Größen und Sichtbarkeitsprüfung. Hier richtig setzen.
  function fixBounds(geo) {
    const pos = geo.attributes.position; if (!pos || !pos.normalized) return;
    const div = NORM[pos.array.constructor.name] || 1, b = new T.Box3(), v = new T.Vector3();
    for (let i = 0; i < pos.count; i++) b.expandByPoint(v.set(pos.getX(i) / div, pos.getY(i) / div, pos.getZ(i) / div));
    geo.boundingBox = b; geo.boundingSphere = b.getBoundingSphere(new T.Sphere());
  }
  function partBox(root) {
    const box = new T.Box3(); root.updateMatrixWorld(true);
    root.traverse(o => { if (o.isMesh) { fixBounds(o.geometry); const b = o.geometry.boundingBox || (o.geometry.computeBoundingBox(), o.geometry.boundingBox); box.union(b.clone().applyMatrix4(o.matrixWorld)); } });
    return box;
  }
  A.partBox = partBox;

  function cloneRig(src) {
    const c = src.clone(true), bones = {};
    c.traverse(o => { if (o.isBone) bones[o.name] = o; });
    c.traverse(o => {
      if (!o.isSkinnedMesh) return;
      const sk = o.skeleton;
      o.bind(new T.Skeleton(sk.bones.map(b => bones[b.name] || b), sk.boneInverses.map(x => x.clone())), o.bindMatrix.clone());
      o.frustumCulled = false;
    });
    return c;
  }

  // Palettentextur (8×4 Farbfelder mit Verlauf) feldweise umfärben: Haut, Kleidung (Grau/Grün/Blau), Akzent (Rot/Lila), Haare (Braun) optional
  const SKIN = [[1.04, 1.0, 1.0], [0.96, 0.86, 0.8], [0.84, 0.69, 0.58], [0.66, 0.5, 0.42], [0.48, 0.36, 0.31]];
  const recolorCache = new Map();
  function recolor(tex, look, use) {
    const img = tex.image; if (!img || !img.width) return tex;
    const key = tex.uuid + '|' + [look.shirt, look.pants, look.accent, look.skin, look.hair].join(',');
    if (recolorCache.has(key)) return recolorCache.get(key);
    const W = img.width, H = img.height;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
    const data = cx.getImageData(0, 0, W, H), d = data.data;
    const O = new T.Color(look.shirt), P = new T.Color(look.pants != null ? look.pants : look.shirt), Ac = new T.Color(look.accent), Hr = look.hair != null ? new T.Color(look.hair) : null;
    const sk = SKIN[look.skin | 0] || SKIN[0];
    const cw = W / 8, ch = H / 4, hsl = {};
    for (let cy = 0; cy < 4; cy++) for (let cxI = 0; cxI < 8; cxI++) {
      const sx = Math.floor((cxI + 0.5) * cw), sy = Math.floor(cy * ch + ch * 0.25), si = (sy * W + sx) * 4;
      const c = new T.Color(d[si] / 255, d[si + 1] / 255, d[si + 2] / 255); c.getHSL(hsl);
      let kind = 'keep';
      const u = use ? use[cy * 8 + cxI] : { body: 1, legs: 0, head: 0 };
      const skinLike = hsl.h > 0.03 && hsl.h < 0.11 && hsl.s > 0.4 && hsl.l > 0.7;
      const leather = hsl.h > 0.02 && hsl.h < 0.12 && hsl.s > 0.22 && hsl.l < 0.62 && hsl.l > 0.12;
      const gold = hsl.h > 0.1 && hsl.h < 0.17 && hsl.s > 0.5 && hsl.l > 0.4;
      const dark = hsl.l < 0.12, white = hsl.l > 0.86 && hsl.s < 0.25;
      if (skinLike) kind = 'skin';
      else if (u.head && !u.body && !u.legs) { if (Hr && !dark && !white) kind = 'hair'; }
      else if (u.legs > u.body * 0.6 && !leather && !gold && !dark && !white) kind = 'pants';
      else if (u.body && !leather && !gold && !dark) kind = white || (hsl.l > 0.8 && hsl.s < 0.3) ? 'accent' : 'shirt';
      if (kind === 'keep') continue;
      const top = Math.max(0.08, 0.3 * c.r + 0.59 * c.g + 0.11 * c.b);
      const TC = kind === 'shirt' ? O : kind === 'pants' ? P : kind === 'hair' ? Hr : Ac;
      for (let y = Math.floor(cy * ch); y < Math.floor((cy + 1) * ch); y++) for (let x = Math.floor(cxI * cw); x < Math.floor((cxI + 1) * cw); x++) {
        const i = (y * W + x) * 4;
        if (kind === 'skin') { d[i] = Math.min(255, d[i] * sk[0]); d[i + 1] = Math.min(255, d[i + 1] * sk[1]); d[i + 2] = Math.min(255, d[i + 2] * sk[2]); continue; }
        const lum = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255, f = Math.min(1.15, lum / top);
        d[i] = Math.min(255, TC.r * f * 255); d[i + 1] = Math.min(255, TC.g * f * 255); d[i + 2] = Math.min(255, TC.b * f * 255);
      }
    }
    cx.putImageData(data, 0, 0);
    const t = new T.CanvasTexture(cv); t.flipY = tex.flipY; t.encoding = T.sRGBEncoding; t.magFilter = T.NearestFilter; t.minFilter = T.LinearFilter; t.generateMipmaps = false;
    recolorCache.set(key, t);
    return t;
  }

  // Zubehör aus einfachen Formen, an Knochen gehängt
  const accMat = new Map();
  const am = c => { if (!accMat.has(c)) accMat.set(c, new T.MeshLambertMaterial({ color: new T.Color(c).convertSRGBToLinear() })); return accMat.get(c); };
  function gear(inst, look, u = 1) {
    const bones = {}; inst.traverse(o => { if (o.isBone) bones[o.name] = o; });
    if (!bones.head && bones.Bip01_Head) { bones.head = bones.Bip01_Head; bones['handslot.r'] = bones.Bip01_R_Hand; bones['handslot.l'] = bones.Bip01_L_Hand; }
    const head = inst.userData.headBox;
    inst.updateMatrixWorld(true);
    const put = (geo, color, bone, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new T.Mesh(geo, am(color)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; m.userData.gear = bone ? (bone === bones.head ? 'head' : bone.name) : "";
      inst.add(m); m.updateMatrixWorld(true); if (bone) bone.attach(m); return m;
    };
    if (head && bones.head) {
      const lo = head.min, hi = head.max;
      const cx = (lo.x + hi.x) / 2, cz = (lo.z + hi.z) / 2, r = (hi.x - lo.x) / 2, dz = (hi.z - lo.z) / 2, top = hi.y, H = hi.y - lo.y;
      const hat = look.hat;
      if (hat === 'busch') {   // Buschhut mit breiter Krempe
        put(new T.CylinderGeometry(r * 1.55, r * 1.6, r * 0.06, 20), look.hatColor || 0xb08850, bones.head, cx, top - r * 0.32, cz);
        put(new T.CylinderGeometry(r * 0.82, r * 0.98, r * 0.5, 16), look.hatColor || 0xb08850, bones.head, cx, top - r * 0.1, cz);
        put(new T.CylinderGeometry(r * 0.99, r * 0.99, r * 0.1, 16), 0x5a3a1e, bones.head, cx, top - r * 0.26, cz);
      } else if (hat === 'cap') {
        put(new T.SphereGeometry(r * 1.02, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), look.hatColor || 0xd8402e, bones.head, cx, top - r * 0.62, cz);
        put(new T.BoxGeometry(r * 1.1, r * 0.06, r * 0.8), look.hatColor || 0xd8402e, bones.head, cx, top - r * 0.58, cz + dz * 1.05);
      } else if (hat === 'band') {
        put(new T.TorusGeometry(r * 1.0, r * 0.09, 6, 22), look.hatColor || 0xff3d6e, bones.head, cx, top - r * 0.48, cz, Math.PI / 2).scale.set(1.02, (dz / r) * 1.02, 1);
      } else if (hat === 'krone') {
        const g = new T.CylinderGeometry(r * 0.7, r * 0.62, r * 0.42, 10, 1, true);
        put(g, 0xffcc33, bones.head, cx, top + r * 0.06, cz).material.side = T.DoubleSide;
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; put(new T.ConeGeometry(r * 0.12, r * 0.3, 6), 0xffcc33, bones.head, cx + Math.cos(a) * r * 0.66, top + r * 0.38, cz + Math.sin(a) * r * 0.66); }
        put(new T.SphereGeometry(r * 0.1, 8, 6), 0xe0304a, bones.head, cx, top + r * 0.08, cz + r * 0.7);
      } else if (hat === 'kopftuch') {
        put(new T.SphereGeometry(r * 1.04, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), look.hatColor || 0x2a8cff, bones.head, cx, top - r * 0.66, cz - r * 0.04);
      }
      if (look.glasses) {   // Sonnenbrille
        const gy = lo.y + H * 0.5, gz = hi.z + r * 0.02;
        for (const sx of [-1, 1]) put(new T.BoxGeometry(r * 0.42, r * 0.24, r * 0.06), 0x111418, bones.head, cx + sx * r * 0.3, gy, gz);
        put(new T.BoxGeometry(r * 0.3, r * 0.05, r * 0.05), 0x111418, bones.head, cx, gy + r * 0.06, gz);
      }
    }
    const hand = bones['handslot.r'], handL = bones['handslot.l'];
    if (look.mic && hand) {   // Handmikrofon der Moderatoren
      const p = new T.Vector3(); hand.getWorldPosition(p); const lp = inst.worldToLocal(p);
      const g = new T.Group(); g.position.copy(lp); inst.add(g);
      const s = 0.09 * u;
      const b = new T.Mesh(new T.CylinderGeometry(s * 0.35, s * 0.25, s * 2.4, 8), am(0x1c1f26)); b.position.y = s * 0.6; g.add(b);
      const h = new T.Mesh(new T.SphereGeometry(s * 0.6, 10, 8), am(0x9aa3ad)); h.position.y = s * 2; g.add(h);
      const f = new T.Mesh(new T.BoxGeometry(s * 0.9, s * 0.6, s * 0.9), am(look.micColor || 0xffb000)); f.position.y = s * 1.3; g.add(f);
      g.updateMatrixWorld(true); hand.attach(g);
    }
    if (look.cards && handL) {   // Moderationskarten
      const p = new T.Vector3(); handL.getWorldPosition(p); const lp = inst.worldToLocal(p);
      put(new T.BoxGeometry(0.16 * u, 0.24 * u, 0.02 * u), 0xfff6dc, handL, lp.x, lp.y + 0.08 * u, lp.z + 0.02 * u, 0.3);
    }
  }

  const HIDE_BASE = /_Helmet|_Cape|Mage_Hat|Spellbook_open/;
  A.Figure = class {
    constructor(look = {}, opts = {}) {
      this.look = Object.assign({ model: 'knight', skin: 0, shirt: 0xc8372d, pants: 0xb79a6a, accent: 0xf2e6c8 }, look);
      this.height = opts.height || 1.75;
      this.root = new T.Group(); this.root.name = 'fig';
      this.mixer = null; this.actions = {}; this.cur = null; this.base = 'idle'; this.one = null; this.oneT = 0;
      this.ready = false; this.bones = {};
      const rb = this.look.rb && rbSrc[this.look.rb];
      if (rb) this.buildRb(rb);
      else { const src = figSrc[this.look.model] || figSrc.knight; if (src) this.build(src); }
    }
    // echter Mensch: eigene Textur, gemeinsame (umgerechnete) Bewegungen
    buildRb(src) {
      const inst = cloneRig(src.scene);
      inst.userData.headBox = src.headBox;
      inst.traverse(o => {
        if (!o.isMesh) return;
        const conv = m => new T.MeshLambertMaterial({ map: m.map || null, color: 0xffffff, skinning: !!o.isSkinnedMesh, alphaTest: m.alphaTest || 0, side: m.alphaTest ? T.DoubleSide : T.FrontSide });
        o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
        o.castShadow = true; o.receiveShadow = false;
      });
      inst.traverse(o => { if (o.isBone) this.bones[o.name] = o; });
      const B = this.bones; B.head = B.Bip01_Head; B.handr = B.Bip01_R_Hand; B.handl = B.Bip01_L_Hand; B['handslot.r'] = B.handr; B['handslot.l'] = B.handl;
      const b = src.box, h = b.max.y - b.min.y, k = this.height / Math.max(0.01, h);
      const kk = figSrc.knight && figSrc.knight.box, u = kk ? h / (kk.max.y - kk.min.y) : 1;
      gear(inst, this.look, u);
      inst.scale.setScalar(k);
      inst.position.set(-(b.min.x + b.max.x) / 2 * k, -b.min.y * k, -(b.min.z + b.max.z) / 2 * k);
      this.inst = inst; this.rb = true;
      this.root.add(inst);
      this.mixer = new T.AnimationMixer(inst);
      for (const [n, c] of Object.entries(rbClips)) this.actions[n] = this.mixer.clipAction(c);
      this.ready = true;
      this.set('idle', 0);
      this.mixer.update(Math.random() * 2);
    }
    build(src) {
      const inst = cloneRig(src.scene), L = this.look;
      inst.userData.headBox = src.headBox;
      inst.traverse(o => {
        if (!o.isMesh) return;
        if (HIDE_BASE.test(o.name) && !(L.keepHat && /Barbarian_Hat/.test(o.name))) o.visible = false;
        if (/Barbarian_Hat/.test(o.name) && !L.keepHat) o.visible = false;
        if (/^Mug$/.test(o.name) && !L.mug) o.visible = false;
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        const map = m.map ? recolor(m.map, L, src.swatchUse) : null;
        o.material = new T.MeshLambertMaterial({ map, color: map ? 0xffffff : m.color, skinning: !!o.isSkinnedMesh });
        o.castShadow = true; o.receiveShadow = false;
      });
      inst.traverse(o => { if (o.isBone) this.bones[o.name] = o; });
      gear(inst, L);
      const b = src.box, k = this.height / Math.max(0.01, b.max.y - b.min.y);
      inst.scale.setScalar(k);
      inst.position.set(-(b.min.x + b.max.x) / 2 * k, -b.min.y * k, -(b.min.z + b.max.z) / 2 * k);
      this.inst = inst;
      this.root.add(inst);
      this.mixer = new T.AnimationMixer(inst);
      for (const [n, c] of Object.entries(clips)) this.actions[n] = this.mixer.clipAction(c);
      this.ready = true;
      this.set('idle', 0);
      this.mixer.update(Math.random() * 2);
    }
    act(name) { return this.actions[CLIP[name] || name]; }
    set(name, fade = 0.2) {
      this.base = name;
      if (this.one) return;
      this._go(name, fade, true);
    }
    _go(name, fade, loop) {
      const a = this.act(name); if (!a || a === this.cur) return;
      a.reset(); a.setLoop(loop ? T.LoopRepeat : T.LoopOnce, Infinity); a.clampWhenFinished = !loop; a.enabled = true; a.setEffectiveWeight(1); a.setEffectiveTimeScale(1);
      if (this.cur) { a.crossFadeFrom(this.cur, fade, false); } a.play();
      this.cur = a;
    }
    // einmalige Bewegung, danach zurück (hold = in letzter Pose bleiben)
    play(name, { hold = false, speed = 1 } = {}) {
      const a = this.act(name); if (!a) return 0;
      this.one = name; this._go(name, 0.15, false); a.setEffectiveTimeScale(speed);
      this.oneT = hold ? Infinity : a.getClip().duration / speed - 0.15;
      return a.getClip().duration / speed;
    }
    release() { if (this.one) { this.one = null; this._go(this.base, 0.25, true); } }
    move(speed) {   // m/s → Bewegung
      if (this.one) return;
      const want = speed > 3.2 ? 'run' : speed > 0.25 ? 'walk' : (this.base === 'walk' || this.base === 'run' ? 'idle' : this.base);
      if (want !== this.base) this.set(want, 0.18);
      if (this.cur && (want === 'walk' || want === 'run')) this.cur.setEffectiveTimeScale(want === 'run' ? UL.clamp(speed / 5, 0.7, 1.3) : UL.clamp(speed / 1.6, 0.6, 1.5));
    }
    update(dt) {
      if (!this.mixer) return;
      if (this.one && this.oneT !== Infinity) { this.oneT -= dt; if (this.oneT <= 0) this.release(); }
      this.mixer.update(dt);
    }
    bonePos(name, out = new T.Vector3()) { const b = this.bones[name]; if (b) b.getWorldPosition(out); else this.root.getWorldPosition(out); return out; }
    headPos(out) { return this.bonePos('head', out).add(new T.Vector3(0, this.height * 0.12, 0)); }
    dispose() { if (this.root.parent) this.root.parent.remove(this.root); if (this.mixer) this.mixer.stopAllAction(); }
  };

  // ---------- Tiere (Quaternius, CC0) ----------
  const animals = {};
  A.Animal = class {
    constructor(id, size = 0.3) {
      this.root = new T.Group(); const src = animals[id]; this.mixer = null; this.actions = {};
      if (!src) return;
      const inst = cloneRig(src.scene);
      inst.traverse(o => { if (o.isMesh) { o.material = lambertOf(o.material, o.isSkinnedMesh); o.castShadow = true; } });
      const b = src.box, k = size / Math.max(0.01, Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z));
      inst.scale.setScalar(k); inst.position.set(-(b.min.x + b.max.x) / 2 * k, -b.min.y * k, -(b.min.z + b.max.z) / 2 * k);
      this.root.add(inst);
      this.mixer = new T.AnimationMixer(inst);
      for (const c of src.animations) this.actions[c.name.split('|').pop()] = this.mixer.clipAction(c);
      const pref = ['Walk', 'Flying', 'Bat_Flying', 'Frog_Idle', 'Idle'];
      for (const p of pref) if (this.actions[p]) { this.actions[p].play(); this.mixer.update(Math.random() * 2); break; }
    }
    play(n) { const a = this.actions[n]; if (!a) return; this.mixer.stopAllAction(); a.reset().play(); }
    update(dt) { if (this.mixer) this.mixer.update(dt); }
  };

  // ---------- Laden ----------
  A.loadAll = async (onProgress) => {
    A.RB = (UL.D && UL.D.RB_ALL) || [];
    const base = (UL.base || '') + 'models/';
    const list = [['set', base + 'set.glb'], ['set', base + 'ph.glb'], ['anim', base + 'figuren/anim.glb']]
      .concat(FIG.map(f => ['fig:' + f, base + 'figuren/' + f + '.glb']))
      .concat(['crab', 'frog', 'bat', 'bee'].map(t => ['tier:' + t, base + 'tiere/' + t + '.glb']))
      .concat(A.RB.length ? [['rbanim', base + 'menschen/anim.glb']].concat(A.RB_CORE().map(id => ['rb:' + id, base + 'menschen/' + id + '.glb'])) : []);
    let done = 0;
    const take = ([k, url]) => A.load(url).then(g => {
      done++; onProgress && onProgress(done / list.length);
      if (k === 'set') {
        const sc = g.scene; sc.updateMatrixWorld(true);
        for (const c of sc.children.slice()) {
          if (!/^p:?/.test(c.name)) continue;   // GLTFLoader entfernt den Doppelpunkt (p:name → pname)
          c.position.set(0, 0, 0); c.updateMatrixWorld(true);
          c.traverse(o => { if (o.isMesh) { o.material = lambertOf(o.material, false); o.castShadow = true; o.receiveShadow = true; } });
          c.userData.box = partBox(c);
          parts[c.name.replace(/^p:?/, '')] = c;
        }
      } else if (k === 'anim') {
        for (const c of g.animations) clips[c.name] = c;
      } else if (k.startsWith('fig:')) {
        g.scene.updateMatrixWorld(true);
        // Bounding Box ohne Waffen/Hüte, in Ruhehaltung
        const box = new T.Box3(), hb = new T.Box3();
        g.scene.traverse(o => { if (o.isMesh && /_(Body|Head|Head_Hooded|LegLeft|LegRight)$/.test(o.name)) skinnedBox(o, box); if (o.isMesh && /_Head/.test(o.name)) skinnedBox(o, hb); });
        g.box = box; g.headBox = hb;
        // welche Farbfelder (8×4) nutzt welcher Körperteil? → Kleidung, Hose, Haare sicher erkennen
        const use = []; for (let i = 0; i < 32; i++) use[i] = { body: 0, legs: 0, head: 0 };
        g.scene.traverse(o => {
          if (!o.isMesh || !o.geometry.attributes.uv) return;
          const part = /_(Body|ArmLeft|ArmRight)$/.test(o.name) ? 'body' : /_Leg(Left|Right)$/.test(o.name) ? 'legs' : /_Head/.test(o.name) ? 'head' : null; if (!part) return;
          const uv = o.geometry.attributes.uv, dv = uv.normalized ? (NORM[uv.array.constructor.name] || 1) : 1;
          for (let i = 0; i < uv.count; i++) { const u = uv.getX(i) / dv, v = uv.getY(i) / dv; const ix = UL.clamp(Math.floor(u * 8), 0, 7), iy = UL.clamp(Math.floor(v * 4), 0, 3); use[iy * 8 + ix][part]++; }
        });
        g.swatchUse = use;
        figSrc[k.slice(4)] = g;
      } else if (k === 'rbanim') {
        for (const c of g.animations) rbClips[c.name] = c;
      } else if (k.startsWith('rb:')) {
        g.scene.updateMatrixWorld(true);
        const box = new T.Box3(); g.scene.traverse(o => { if (o.isMesh) skinnedBox(o, box); });
        // Kopf: oberstes Achtel der Figur (für Hüte, Brille)
        const hb = new T.Box3(), cut = box.min.y + (box.max.y - box.min.y) * 0.875;
        hb.set(new T.Vector3(box.min.x, cut, box.min.z), box.max.clone());
        g.box = box; g.headBox = rbHead(g.scene, cut) || hb;
        rbSrc[k.slice(3)] = g;
      } else if (k.startsWith('tier:')) {
        g.scene.updateMatrixWorld(true); const bx = new T.Box3(); g.scene.traverse(o => { if (o.isMesh) skinnedBox(o, bx); }); g.box = bx; animals[k.slice(5)] = g;
      }
    }).catch(e => { done++; console.warn('Modell fehlt', url, e); });
    await Promise.all(list.map(take));
    A.ready = true;
    // übrige echte Figuren im Hintergrund nachladen (Titelbild und Editor überbrücken die Zeit)
    const rest = A.RB.filter(id => !rbSrc[id]);
    A.rbAll = Promise.all(rest.map(id => take(['rb:' + id, base + 'menschen/' + id + '.glb']))).then(() => { A.rbAll = null; });
  };
  // zuerst laden: Moderatoren, Crew und die eigene Figur
  A.RB_CORE = () => { const D = UL.D, me = UL.store.get('me', null); return [...new Set([D.HOSTS[0].look.rb, D.HOSTS[1].look.rb, D.DOC.look.rb, D.RANGER.look.rb, me && me.look && me.look.rb].filter(Boolean))]; };
})();
